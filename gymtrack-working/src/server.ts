import "./lib/error-capture";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let scanAuthClient: SupabaseClient | undefined;
const MAX_MEAL_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SCAN_REQUEST_BYTES = 12 * 1024 * 1024;
const GEMINI_TIMEOUT_MS = 60_000;
const SCAN_RATE_LIMIT = 10;
const SCAN_RATE_WINDOW_MS = 60_000;
const scanRateLimitHits = new Map<string, number[]>();

type ScanFood = {
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  eggCount?: number;
};

type BarcodeLookupProduct = {
  code?: unknown;
  product_name?: unknown;
  product_name_he?: unknown;
  brands?: unknown;
  categories?: unknown;
  serving_size?: unknown;
  quantity?: unknown;
  image_url?: unknown;
  nutriments?: Record<string, unknown>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function scanResponse(body: unknown, status: number, scanId: string, startedAt: number) {
  const response = jsonResponse(body, status);
  response.headers.set("x-meal-scan-id", scanId);
  response.headers.set("x-meal-scan-ms", String(Date.now() - startedAt));
  return response;
}

function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function scanRateLimited(keys: string[], now = Date.now()) {
  const cutoff = now - SCAN_RATE_WINDOW_MS;
  let limited = false;
  for (const key of keys) {
    const recent = (scanRateLimitHits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= SCAN_RATE_LIMIT) {
      limited = true;
    } else {
      recent.push(now);
    }
    scanRateLimitHits.set(key, recent);
  }
  if (scanRateLimitHits.size > 5000) {
    for (const [key, timestamps] of scanRateLimitHits) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) scanRateLimitHits.delete(key);
    }
  }
  return limited;
}

async function authenticatedScanUser(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch?.[1]) return { error: "unauthorized" as const };

  const supabaseUrl = process.env["VITE_SUPABASE_URL"];
  const supabaseAnonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!supabaseUrl || !supabaseAnonKey) return { error: "server-config" as const };

  scanAuthClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await scanAuthClient.auth.getUser(tokenMatch[1]);
  if (error || !data.user) return { error: "unauthorized" as const };

  return { userId: data.user.id, ip: requestIp(request) };
}

async function readBodyWithLimit(request: Request, maxBytes: number) {
  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes)
    throw new Error("payload-too-large");

  if (!request.body) {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > maxBytes) throw new Error("payload-too-large");
    return body;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("payload-too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function normalizeServingSize(name: string, servingSize: string): string {
  const food = name.toLocaleLowerCase();
  const gramsMatch = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)/i);
  const grams = gramsMatch?.[1]?.replace(",", ".");
  const weightBased =
    /(עוף|חזה עוף|פרגית|בשר|בקר|הודו|דג|סלמון|טונה|שניצל|קציצה|צ'יפס|ציפס|בטטה|תפוח אדמה|ירק|סלט|אורז|פסטה|קוסקוס|קינואה|chicken|beef|turkey|fish|salmon|tuna|fries|sweet potato|potato|vegetable|rice|pasta|quinoa)/i.test(
      food,
    );
  if (weightBased) return `${grams ?? "100"} גרם`;
  if (
    /(לחם|לחמנייה|לחמניה|טוסט|פרוסת לחם|פיתה|טורטייה|bread|toast|bun|pita|tortilla)/i.test(food)
  ) {
    return /פיתה|טורטייה|pita|tortilla/i.test(food) ? "1 יחידה" : "1 פרוסה";
  }
  if (/(ביצה|ביצים|egg)/i.test(food)) return "1 יחידה";
  if (/(בננה|תפוח|תפוז|פרי|אפרסק|אגס|banana|apple|orange|peach|pear|fruit)/i.test(food)) {
    return "1 יחידה";
  }
  return servingSize || "מנה משוערת";
}

function normalizeQuantity(name: string, servingSize: string, quantity: number): number {
  const food = name.toLocaleLowerCase();
  const text = `${food} ${servingSize.toLocaleLowerCase()}`;
  if (/(ביצה|ביצים|egg)/i.test(food)) {
    const countMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:ביצים?|ביצי|eggs?)/i);
    if (countMatch?.[1]) {
      const count = Number(countMatch[1].replace(",", "."));
      if (Number.isFinite(count) && count > 0) return count;
    }
  }
  if (/(לחם|טוסט|פרוסה|bread|toast)/i.test(food)) {
    const countMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:פרוסות?|slices?)/i);
    if (countMatch?.[1]) {
      const count = Number(countMatch[1].replace(",", "."));
      if (Number.isFinite(count) && count > 0) return count;
    }
  }
  return quantity;
}

function normalizeEggCount(name: string, servingSize: string, value: unknown): number | undefined {
  if (!/(חביתה|אומלט|omelet|omelette)/i.test(name)) return undefined;
  const explicit = Number(value);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const match = `${name} ${servingSize}`.match(/(\d+(?:[.,]\d+)?)\s*(?:ביצים?|ביצי|eggs?)/i);
  if (!match?.[1]) return undefined;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isImageDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^data:image\/(?:jpeg|jpg|png);base64,/i.test(value) &&
    value.length <= MAX_MEAL_IMAGE_BYTES * 1.4
  );
}

function normalizeScanResult(value: unknown): { mealName: string; foods: ScanFood[] } | null {
  if (!value || typeof value !== "object") return null;
  const input = value as { mealName?: unknown; foods?: unknown };
  if (!Array.isArray(input.foods)) return null;
  const foods = input.foods
    .filter((food): food is Record<string, unknown> => Boolean(food) && typeof food === "object")
    .map((food) => {
      const name = String(food["name"] ?? "").trim();
      const originalServingSize = String(food["servingSize"] ?? "מנה משוערת").trim();
      const quantity = Number(food["quantity"]);
      const eggCount = normalizeEggCount(name, originalServingSize, food["eggCount"]);
      return {
        name,
        servingSize: normalizeServingSize(name, originalServingSize),
        quantity: normalizeQuantity(name, originalServingSize, quantity),
        calories: Number(food["calories"]),
        protein: Number(food["protein"]),
        carbs: Number(food["carbs"]),
        fat: Number(food["fat"]),
        fiber: Number(food["fiber"] ?? 0),
        ...(eggCount ? { eggCount } : {}),
      };
    })
    .filter(
      (food) =>
        food.name &&
        Number.isFinite(food.quantity) &&
        food.quantity > 0 &&
        [food.calories, food.protein, food.carbs, food.fat, food.fiber].every(
          (number) => Number.isFinite(number) && number >= 0,
        ),
    )
    .slice(0, 15);
  if (!foods.length) return null;
  return {
    mealName: String(input.mealName ?? "ארוחה שנסרקה").trim() || "ארוחה שנסרקה",
    foods,
  };
}

function parseModelJson(content: string): unknown {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Model did not return JSON");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

async function analyzeMealImage(request: Request): Promise<Response> {
  const scanId = crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();
  console.info("Meal scan started", scanId);
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const auth = await authenticatedScanUser(request);
  if (auth.error === "unauthorized") {
    return scanResponse({ error: "יש להתחבר כדי להשתמש בסריקת ארוחה." }, 401, scanId, startedAt);
  }
  if (auth.error === "server-config") {
    return scanResponse({ error: "חיבור ניתוח התמונות עדיין לא הוגדר." }, 503, scanId, startedAt);
  }
  if (scanRateLimited([`user:${auth.userId}`, `ip:${auth.ip}`])) {
    return scanResponse({ error: "יותר מדי ניסיונות. נסי שוב בעוד דקה." }, 429, scanId, startedAt);
  }

  let payload: { image?: unknown };
  try {
    payload = JSON.parse(await readBodyWithLimit(request, MAX_SCAN_REQUEST_BYTES)) as {
      image?: unknown;
    };
    console.info(
      "Meal scan payload read",
      scanId,
      typeof payload.image === "string" ? payload.image.length : 0,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "payload-too-large") {
      return scanResponse(
        { error: "הבקשה גדולה מדי. הגודל המרבי הוא 8MB." },
        413,
        scanId,
        startedAt,
      );
    }
    return scanResponse({ error: "לא ניתן לקרוא את התמונה." }, 400, scanId, startedAt);
  }
  if (!isImageDataUrl(payload.image)) {
    return scanResponse(
      { error: "יש להעלות תמונת PNG או JPG תקינה, עד 8MB." },
      400,
      scanId,
      startedAt,
    );
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let response: Response;
  try {
    const imageMatch = payload.image.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i);
    if (!imageMatch)
      return scanResponse({ error: "פורמט התמונה אינו נתמך." }, 400, scanId, startedAt);
    const [, mimeType, imageData] = imageMatch;
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      return scanResponse({ error: "חיבור ניתוח התמונות עדיין לא הוגדר." }, 503, scanId, startedAt);
    }
    if (!imageData) return scanResponse({ error: "התמונה אינה תקינה." }, 400, scanId, startedAt);
    const padding = imageData.endsWith("==") ? 2 : imageData.endsWith("=") ? 1 : 0;
    const decodedBytes = Math.floor((imageData.length * 3) / 4) - padding;
    if (
      !Number.isFinite(decodedBytes) ||
      decodedBytes <= 0 ||
      decodedBytes > MAX_MEAL_IMAGE_BYTES
    ) {
      return scanResponse(
        { error: "התמונה גדולה מדי. הגודל המרבי הוא 8MB." },
        413,
        scanId,
        startedAt,
      );
    }
    console.info("Meal scan sending to Gemini", scanId, imageData.length);
    const geminiRequest = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "אתה תזונאי שמבצע הערכה חכמה מתמונת ארוחה. החזר JSON בלבד במבנה {mealName:string, foods:Array<{name:string,servingSize:string,quantity:number,eggCount?:number,calories:number,protein:number,carbs:number,fat:number,fiber:number}>}. זהה רק מאכלים שנראים בתמונה והערך כמויות אכילות. quantity הוא מספר היחידות שנראות: אם יש 2 ביצים החזר servingSize:'1 יחידה' ו-quantity:2; אם יש 2 פרוסות לחם החזר servingSize:'1 פרוסה' ו-quantity:2. עבור חביתה או אומלט, החזר eggCount כמספר הביצים המשוער (למשל 2), servingSize:'1 יחידה' ו-quantity:1. עבור עוף, בשר, דגים, צ'יפס בטטה, ירקות, אורז ופסטה השתמש ב-servingSize של גרמים, למשל '150 גרם', ובדרך כלל quantity:1. עבור פיתה או טורטייה השתמש ב-'1 יחידה'. עבור פירות שלמים השתמש ב-'1 יחידה' ובכמות המתאימה. הערכים התזונתיים צריכים להתאים ל-servingSize ולכמות. השתמש בשמות עבריים. אם אינך בטוח, עדיין החזר את ההערכה הטובה ביותר, ללא טקסט נוסף.",
              },
            ],
          },
          contents: [
            {
              parts: [
                { text: "נתח את הארוחה בתמונה. זו הערכה בלבד והמשתמשת תאשר ותתקן לפני שמירה." },
                { inlineData: { mimeType, data: imageData } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 3000,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    const timeoutResponse = new Promise<Response>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new DOMException("Gemini request timed out", "TimeoutError"));
      }, GEMINI_TIMEOUT_MS);
    });
    response = await Promise.race([geminiRequest, timeoutResponse]);
    console.info("Meal scan Gemini response", scanId, response.status);
  } catch (error) {
    console.error("Gemini meal scan request failed", error);
    return scanResponse(
      { error: "שירות ניתוח התמונות לא זמין כרגע. נסי שוב בעוד רגע." },
      504,
      scanId,
      startedAt,
    );
  } finally {
    if (timeout) clearTimeout(timeout);
  }
  if (!response.ok) {
    console.error(
      "Gemini meal scan failed",
      response.status,
      (await response.clone().text()).slice(0, 1000),
    );
    return scanResponse(
      { error: "ניתוח התמונה לא הצליח כרגע. נסי שוב בעוד רגע." },
      502,
      scanId,
      startedAt,
    );
  }
  let completion: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  try {
    const bodyTimeout = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini response body timed out")), 10_000),
    );
    const bodyText = await Promise.race([response.text(), bodyTimeout]);
    console.info("Meal scan Gemini body read", scanId, bodyText.length);
    completion = JSON.parse(bodyText) as typeof completion;
  } catch (error) {
    console.error("Gemini meal scan body failed", scanId, error);
    return scanResponse(
      { error: "תשובת הניתוח לא התקבלה במלואה. נסי שוב." },
      502,
      scanId,
      startedAt,
    );
  }
  const content = completion.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!content) return scanResponse({ error: "לא התקבלה תוצאה מהניתוח." }, 502, scanId, startedAt);
  try {
    const result = normalizeScanResult(parseModelJson(content));
    const finalResponse = result
      ? scanResponse(result, 200, scanId, startedAt)
      : scanResponse(
          { error: "לא זוהו מאכלים בתמונה. נסי תמונה ברורה יותר." },
          422,
          scanId,
          startedAt,
        );
    console.info("Meal scan completed", scanId, finalResponse.status);
    return finalResponse;
  } catch {
    console.error("Gemini meal scan returned invalid JSON", content.slice(0, 2000));
    return scanResponse({ error: "תוצאת הניתוח לא הייתה תקינה. נסי שוב." }, 502, scanId, startedAt);
  }
}

function finiteNutritionValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 10) / 10 : 0;
}

async function lookupFoodByBarcode(request: Request): Promise<Response> {
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);
  const auth = await authenticatedScanUser(request);
  if (auth.error === "unauthorized") return jsonResponse({ error: "יש להתחבר כדי לחפש מוצר." }, 401);
  if (auth.error === "server-config") return jsonResponse({ error: "חיבור המשתמש עדיין לא הוגדר." }, 503);

  const barcode = new URL(request.url).searchParams.get("barcode")?.replace(/\D/g, "") ?? "";
  if (!/^\d{8,14}$/.test(barcode)) {
    return jsonResponse({ error: "יש להזין ברקוד של 8–14 ספרות." }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,product_name_he,brands,categories,serving_size,quantity,image_url,nutriments`,
      { headers: { accept: "application/json" }, signal: controller.signal },
    );
    if (!response.ok) return jsonResponse({ error: "שירות חיפוש הברקוד לא זמין כרגע." }, 502);
    const payload = (await response.json()) as { status?: number; product?: BarcodeLookupProduct };
    const product = payload.status === 1 ? payload.product : undefined;
    const name = String(product?.product_name_he || product?.product_name || "").trim();
    if (!product || !name) return jsonResponse({ error: "לא נמצאה התאמה לברקוד הזה." }, 404);

    const nutriments = product.nutriments ?? {};
    const servingSize = String(product.serving_size || "100 גרם").trim() || "100 גרם";
    const food = {
      id: `f-open-food-facts-${barcode}`,
      name,
      brand: String(product.brands ?? "").split(",")[0]?.trim() || undefined,
      category: String(product.categories ?? "").split(",")[0]?.trim() || "מוצר ארוז",
      servingSize,
      calories: finiteNutritionValue(
        nutriments["energy-kcal_serving"] ?? nutriments["energy-kcal_100g"],
      ),
      protein: finiteNutritionValue(nutriments["proteins_serving"] ?? nutriments["proteins_100g"]),
      carbs: finiteNutritionValue(
        nutriments["carbohydrates_serving"] ?? nutriments["carbohydrates_100g"],
      ),
      fat: finiteNutritionValue(nutriments["fat_serving"] ?? nutriments["fat_100g"]),
      fiber: finiteNutritionValue(nutriments["fiber_serving"] ?? nutriments["fiber_100g"]),
      notes: "נמצא לפי ברקוד במקור חיצוני. יש להשוות לתווית האריזה לפני שימוש מדויק.",
      catalog: {
        barcode,
        source: "open-food-facts" as const,
        sourceProductId: String(product.code || barcode),
        sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`,
        productType: "other" as const,
        market: "IL" as const,
        packageSize: String(product.quantity || "").trim() || undefined,
        verificationStatus: "external-unverified" as const,
      },
      nutritionReview: {
        status: "unreviewed" as const,
        origin: "estimated" as const,
        confidence: "low" as const,
        checkedAt: new Date().toISOString().slice(0, 10),
        sources: [
          {
            name: "Open Food Facts",
            url: `https://world.openfoodfacts.org/product/${barcode}`,
            kind: "open-food-facts" as const,
            match: "same-food" as const,
            valuesPer: "100g" as const,
          },
        ],
        notes: "מקור חיצוני לא מאומת מול האריזה שבידי המשתמש.",
      },
    };
    return jsonResponse({ food });
  } catch {
    return jsonResponse({ error: "חיפוש הברקוד נכשל. אפשר ליצור מועמד ידני מתווית המוצר." }, 504);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeLabelResult(value: unknown): {
  name: string;
  brand?: string;
  servingSize: string;
  servingGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  notes?: string;
} | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = String(input["name"] ?? "").trim();
  if (!name) return null;
  const servingSize = String(input["servingSize"] ?? "").trim();
  if (!servingSize) return null;
  const servingGrams = Number(input["servingGrams"]);
  return {
    name,
    ...(String(input["brand"] ?? "").trim() ? { brand: String(input["brand"]).trim() } : {}),
    servingSize,
    ...(Number.isFinite(servingGrams) && servingGrams > 0 ? { servingGrams } : {}),
    calories: finiteNutritionValue(input["calories"]),
    protein: finiteNutritionValue(input["protein"]),
    carbs: finiteNutritionValue(input["carbs"]),
    fat: finiteNutritionValue(input["fat"]),
    fiber: finiteNutritionValue(input["fiber"]),
    ...(String(input["notes"] ?? "").trim() ? { notes: String(input["notes"]).trim() } : {}),
  };
}

async function scanFoodLabel(request: Request): Promise<Response> {
  const scanId = crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const auth = await authenticatedScanUser(request);
  if (auth.error === "unauthorized") {
    return scanResponse({ error: "יש להתחבר כדי לקרוא תווית." }, 401, scanId, startedAt);
  }
  if (auth.error === "server-config") {
    return scanResponse({ error: "חיבור המשתמש עדיין לא הוגדר." }, 503, scanId, startedAt);
  }
  if (scanRateLimited([`user:${auth.userId}`, `ip:${auth.ip}`])) {
    return scanResponse({ error: "יותר מדי ניסיונות. נסי שוב בעוד דקה." }, 429, scanId, startedAt);
  }

  let payload: { image?: unknown };
  try {
    payload = JSON.parse(await readBodyWithLimit(request, MAX_SCAN_REQUEST_BYTES)) as {
      image?: unknown;
    };
  } catch (error) {
    return scanResponse(
      { error: error instanceof Error && error.message === "payload-too-large"
          ? "הבקשה גדולה מדי. הגודל המרבי הוא 8MB."
          : "לא ניתן לקרוא את התמונה." },
      error instanceof Error && error.message === "payload-too-large" ? 413 : 400,
      scanId,
      startedAt,
    );
  }
  if (!isImageDataUrl(payload.image)) {
    return scanResponse({ error: "יש להעלות תמונת PNG או JPG תקינה, עד 8MB." }, 400, scanId, startedAt);
  }

  const imageMatch = payload.image.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i);
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!imageMatch || !apiKey) {
    return scanResponse({ error: "חיבור קריאת התוויות עדיין לא הוגדר." }, 503, scanId, startedAt);
  }
  const [, mimeType, imageData] = imageMatch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "אתה קורא תווית ערכים תזונתיים. החזר JSON בלבד במבנה {name,brand?,servingSize,servingGrams?,calories,protein,carbs,fat,fiber,notes?}. קרא רק טקסט שנראה בתמונה. הערכים צריכים להיות לפי המנה שמופיעה ב-servingSize, לא להמיר ל-100 גרם. אם שדה לא מופיע, החזר 0 והסבר ב-notes. אל תשלים ערכים מניחוש ואל תציג את התוצאה כאימות. השתמש בעברית.",
            }],
          },
          contents: [{
            parts: [
              { text: "קרא את תווית המוצר וייצר מועמד שניתן לעריכה. אין להוסיף טקסט מחוץ ל-JSON." },
              { inlineData: { mimeType, data: imageData } },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1600, responseMimeType: "application/json" },
        }),
      },
    );
    if (!response.ok) return scanResponse({ error: "קריאת התווית נכשלה כרגע. נסי שוב." }, 502, scanId, startedAt);
    const completion = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = completion.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!content) return scanResponse({ error: "לא התקבלה תוצאה מקריאת התווית." }, 422, scanId, startedAt);
    const food = normalizeLabelResult(parseModelJson(content));
    if (!food) return scanResponse({ error: "התווית לא נקראה בצורה מספקת. נסי צילום חד יותר." }, 422, scanId, startedAt);
    return scanResponse({ food }, 200, scanId, startedAt);
  } catch {
    return scanResponse({ error: "שירות קריאת התוויות לא זמין כרגע. נסי שוב." }, 504, scanId, startedAt);
  } finally {
    clearTimeout(timeout);
  }
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/nutrition-scan-meal") {
        return await analyzeMealImage(request);
      }
      if (url.pathname === "/nutrition-scan-label") {
        return await scanFoodLabel(request);
      }
      if (url.pathname === "/nutrition-lookup-barcode") {
        return await lookupFoodByBarcode(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
