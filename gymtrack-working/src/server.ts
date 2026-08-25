import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const MAX_MEAL_IMAGE_BYTES = 20 * 1024 * 1024;
const GEMINI_TIMEOUT_MS = 60_000;
const scanTimestamps: number[] = [];

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

function normalizeServingSize(name: string, servingSize: string): string {
  const food = name.toLocaleLowerCase();
  const gramsMatch = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)/i);
  const grams = gramsMatch?.[1]?.replace(",", ".");
  const weightBased =
    /(עוף|חזה עוף|פרגית|בשר|בקר|הודו|דג|סלמון|טונה|שניצל|קציצה|צ'יפס|ציפס|בטטה|תפוח אדמה|ירק|סלט|אורז|פסטה|קוסקוס|קינואה|chicken|beef|turkey|fish|salmon|tuna|fries|sweet potato|potato|vegetable|rice|pasta|quinoa)/i.test(
      food,
    );
  if (weightBased) return `${grams ?? "100"} גרם`;
  if (/(לחם|לחמנייה|לחמניה|טוסט|פרוסת לחם|פיתה|טורטייה|bread|toast|bun|pita|tortilla)/i.test(food)) {
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
  const parsed = match?.[1] ? Number(match[1].replace(",", ".")) : 2;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
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
      const name = String(food.name ?? "").trim();
      const originalServingSize = String(food.servingSize ?? "מנה משוערת").trim();
      const quantity = Number(food.quantity);
      const eggCount = normalizeEggCount(name, originalServingSize, food.eggCount);
      return {
        name,
        servingSize: normalizeServingSize(name, originalServingSize),
        quantity: normalizeQuantity(name, originalServingSize, quantity),
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fat: Number(food.fat),
        fiber: Number(food.fiber ?? 0),
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
  const now = Date.now();
  while (scanTimestamps[0] && scanTimestamps[0] < now - 60_000) scanTimestamps.shift();
  if (scanTimestamps.length >= 10) {
    return scanResponse({ error: "יותר מדי ניסיונות. נסי שוב בעוד דקה." }, 429, scanId, startedAt);
  }
  scanTimestamps.push(now);

  let payload: { image?: unknown };
  try {
    payload = (await request.json()) as { image?: unknown };
    console.info("Meal scan payload read", scanId, typeof payload.image === "string" ? payload.image.length : 0);
  } catch {
    return scanResponse({ error: "לא ניתן לקרוא את התמונה." }, 400, scanId, startedAt);
  }
  if (!isImageDataUrl(payload.image)) {
    return scanResponse({ error: "יש להעלות תמונת PNG או JPG תקינה, עד 20MB." }, 400, scanId, startedAt);
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let response: Response;
  try {
    const imageMatch = payload.image.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i);
    if (!imageMatch) return scanResponse({ error: "פורמט התמונה אינו נתמך." }, 400, scanId, startedAt);
    const [, mimeType, imageData] = imageMatch;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return scanResponse({ error: "חיבור ניתוח התמונות עדיין לא הוגדר." }, 503, scanId, startedAt);
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
              text:
                "אתה תזונאי שמבצע הערכה חכמה מתמונת ארוחה. החזר JSON בלבד במבנה {mealName:string, foods:Array<{name:string,servingSize:string,quantity:number,eggCount?:number,calories:number,protein:number,carbs:number,fat:number,fiber:number}>}. זהה רק מאכלים שנראים בתמונה והערך כמויות אכילות. quantity הוא מספר היחידות שנראות: אם יש 2 ביצים החזר servingSize:'1 יחידה' ו-quantity:2; אם יש 2 פרוסות לחם החזר servingSize:'1 פרוסה' ו-quantity:2. עבור חביתה או אומלט, החזר eggCount כמספר הביצים המשוער (למשל 2), servingSize:'1 יחידה' ו-quantity:1. עבור עוף, בשר, דגים, צ'יפס בטטה, ירקות, אורז ופסטה השתמש ב-servingSize של גרמים, למשל '150 גרם', ובדרך כלל quantity:1. עבור פיתה או טורטייה השתמש ב-'1 יחידה'. עבור פירות שלמים השתמש ב-'1 יחידה' ובכמות המתאימה. הערכים התזונתיים צריכים להתאים ל-servingSize ולכמות. השתמש בשמות עבריים. אם אינך בטוח, עדיין החזר את ההערכה הטובה ביותר, ללא טקסט נוסף.",
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
      timeout = setTimeout(
        () => {
          controller.abort();
          reject(new DOMException("Gemini request timed out", "TimeoutError"));
        },
        GEMINI_TIMEOUT_MS,
      );
    });
    response = await Promise.race([geminiRequest, timeoutResponse]);
    console.info("Meal scan Gemini response", scanId, response.status);
  } catch (error) {
    console.error("Gemini meal scan request failed", error);
    return scanResponse({ error: "שירות ניתוח התמונות לא זמין כרגע. נסי שוב בעוד רגע." }, 504, scanId, startedAt);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
  if (!response.ok) {
    console.error("Gemini meal scan failed", response.status, (await response.clone().text()).slice(0, 1000));
    return scanResponse({ error: "ניתוח התמונה לא הצליח כרגע. נסי שוב בעוד רגע." }, 502, scanId, startedAt);
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
    return scanResponse({ error: "תשובת הניתוח לא התקבלה במלואה. נסי שוב." }, 502, scanId, startedAt);
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
      : scanResponse({ error: "לא זוהו מאכלים בתמונה. נסי תמונה ברורה יותר." }, 422, scanId, startedAt);
    console.info("Meal scan completed", scanId, finalResponse.status);
    return finalResponse;
  } catch {
    console.error("Gemini meal scan returned invalid JSON", content.slice(0, 2000));
    return scanResponse({ error: "תוצאת הניתוח לא הייתה תקינה. נסי שוב." }, 502, scanId, startedAt);
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
