import "./lib/error-capture";

import { ReplitConnectors } from "@replit/connectors-sdk";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
const xaiConnectors = new ReplitConnectors();
const MAX_MEAL_IMAGE_BYTES = 20 * 1024 * 1024;
const XAI_TIMEOUT_MS = 25_000;
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
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
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
    .map((food) => ({
      name: String(food.name ?? "").trim(),
      servingSize: String(food.servingSize ?? "מנה משוערת").trim(),
      quantity: Number(food.quantity),
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fat: Number(food.fat),
      fiber: Number(food.fiber ?? 0),
    }))
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

async function analyzeMealImage(request: Request): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  const now = Date.now();
  while (scanTimestamps[0] && scanTimestamps[0] < now - 60_000) scanTimestamps.shift();
  if (scanTimestamps.length >= 10) {
    return jsonResponse({ error: "יותר מדי ניסיונות. נסי שוב בעוד דקה." }, 429);
  }
  scanTimestamps.push(now);

  let payload: { image?: unknown };
  try {
    payload = (await request.json()) as { image?: unknown };
  } catch {
    return jsonResponse({ error: "לא ניתן לקרוא את התמונה." }, 400);
  }
  if (!isImageDataUrl(payload.image)) {
    return jsonResponse({ error: "יש להעלות תמונת PNG או JPG תקינה, עד 20MB." }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), XAI_TIMEOUT_MS);
  let response: Response;
  try {
    response = await xaiConnectors.proxy("xai", "/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "אתה תזונאי שמבצע הערכה חכמה מתמונת ארוחה. החזר JSON בלבד במבנה {mealName:string, foods:Array<{name:string,servingSize:string,quantity:number,calories:number,protein:number,carbs:number,fat:number,fiber:number}>}. זהה רק מאכלים שנראים בתמונה, הערך כמויות אכילות, והערך ערכים תזונתיים למנה אחת. השתמש בשמות עבריים. אם אינך בטוח, עדיין החזר את ההערכה הטובה ביותר, ללא טקסט נוסף.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "נתח את הארוחה בתמונה. זו הערכה בלבד והמשתמשת תאשר ותתקן לפני שמירה." },
              { type: "image_url", image_url: { url: payload.image, detail: "low" } },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error("xAI meal scan request failed", error);
    return jsonResponse({ error: "הניתוח לקח יותר מדי זמן. נסי שוב עם תמונה קטנה וברורה יותר." }, 504);
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    console.error("xAI meal scan failed", response.status);
    return jsonResponse({ error: "ניתוח התמונה לא הצליח כרגע. נסי שוב בעוד רגע." }, 502);
  }
  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content;
  if (!content) return jsonResponse({ error: "לא התקבלה תוצאה מהניתוח." }, 502);
  try {
    const result = normalizeScanResult(JSON.parse(content));
    return result
      ? jsonResponse(result)
      : jsonResponse({ error: "לא זוהו מאכלים בתמונה. נסי תמונה ברורה יותר." }, 422);
  } catch {
    return jsonResponse({ error: "תוצאת הניתוח לא הייתה תקינה. נסי שוב." }, 502);
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
      if (url.pathname === "/api/nutrition/scan-meal") {
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
