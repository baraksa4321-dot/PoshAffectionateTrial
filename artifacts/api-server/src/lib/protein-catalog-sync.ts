import { logger } from "./logger";

export const OPEN_FOOD_FACTS_SOURCE = "open-food-facts";
const OPEN_FOOD_FACTS_ENDPOINT = "https://world.openfoodfacts.org/api/v2/search";
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 3;
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRIES = 2;

export type ProteinCatalogProductType = "powder" | "bar" | "drink" | "pudding" | "yogurt" | "other";
export type ProteinCatalogVerification =
  | "curated-unverified"
  | "manufacturer-verified"
  | "external-unverified";

export type ImportedProteinProduct = {
  id: string;
  barcode: string;
  name: string;
  englishName?: string;
  brand?: string;
  category: string;
  productType: ProteinCatalogProductType;
  servingUnit: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  searchAliases: string[];
  sourceUrl: string;
  sourceUpdatedAt?: string;
  verificationStatus: ProteinCatalogVerification;
};

export type ProteinCatalogSyncStatus = {
  status: "idle" | "running" | "success" | "partial" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  fetchedCount: number;
  acceptedCount: number;
  upsertedCount: number;
  error?: string;
};

type SourceProduct = Record<string, unknown>;
type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

type SyncOptions = {
  fetcher?: Fetcher;
  supabaseUrl?: string;
  serviceRoleKey?: string;
  now?: () => Date;
  sleep?: (delayMs: number) => Promise<void>;
  maxPages?: number;
  pageSize?: number;
  timeoutMs?: number;
  retries?: number;
};

const emptyStatus = (): ProteinCatalogSyncStatus => ({
  status: "idle",
  fetchedCount: 0,
  acceptedCount: 0,
  upsertedCount: 0,
});

let currentStatus = emptyStatus();
let syncInFlight = false;

export function getProteinCatalogSyncStatus(): ProteinCatalogSyncStatus {
  return { ...currentStatus };
}

export function normalizeCatalogText(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .normalize("NFKC")
    .replace(/[\u0591-\u05c7]/g, "")
    .replace(/[;,|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeBrand(value: unknown): string | undefined {
  const brand = normalizeCatalogText(String(value ?? "").split(/[,/]/)[0]);
  return brand || undefined;
}

function numberFrom(value: unknown): number | undefined {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
    return undefined;
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number = numberFrom(value);
    if (number !== undefined) return number;
  }
  return undefined;
}

function servingGrams(servingUnit: string): number {
  const match = servingUnit.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(?:g|גרם|ml|מ״ל|מ"ל)/i);
  return match ? Number(match[1]) : 100;
}

function productTypeFor(product: SourceProduct): ProteinCatalogProductType {
  const text = normalizeCatalogText(
    [
      product.product_name_he,
      product.product_name_en,
      product.categories,
      Array.isArray(product.categories_tags) ? product.categories_tags.join(" ") : "",
    ].join(" "),
  ).toLocaleLowerCase();

  if (/אבקה|whey|powder|isolate/.test(text)) return "powder";
  if (/חטיף|bar\b|bars/.test(text)) return "bar";
  if (/משקה|drink|shake|beverage/.test(text)) return "drink";
  if (/מעדן|pudding|dessert/.test(text)) return "pudding";
  if (/יוגורט|yogurt|skyr/.test(text)) return "yogurt";
  return "other";
}

function categoryFor(productType: ProteinCatalogProductType): string {
  switch (productType) {
    case "powder":
      return "אבקות חלבון";
    case "bar":
      return "חטיפי חלבון";
    case "drink":
      return "משקאות חלבון";
    case "pudding":
      return "מעדני חלבון";
    case "yogurt":
      return "יוגורטי חלבון";
    default:
      return "מוצרי חלבון";
  }
}

function isIsraeliProduct(product: SourceProduct): boolean {
  const countryText = normalizeCatalogText(
    [
      product.countries,
      product.countries_hierarchy,
      Array.isArray(product.countries_tags) ? product.countries_tags.join(" ") : "",
    ].join(" "),
  ).toLocaleLowerCase();
  return countryText.includes("israel") || countryText.includes("ישראל");
}

function nutriment(product: SourceProduct, key: string, serving: boolean): number | undefined {
  const nutrition = (product.nutriments ?? {}) as Record<string, unknown>;
  return serving
    ? firstNumber(nutrition[`${key}_serving`], nutrition[`${key}-serving`])
    : firstNumber(nutrition[`${key}_100g`], nutrition[`${key}_100ml`], nutrition[key]);
}

export function normalizeOpenFoodFactsProduct(product: SourceProduct): ImportedProteinProduct | null {
  const barcode = normalizeCatalogText(product.code || product._id).replace(/\D/g, "");
  const hebrewName = normalizeCatalogText(product.product_name_he);
  const englishName = normalizeCatalogText(product.product_name_en);
  const name = hebrewName || englishName;
  const brand = normalizeBrand(product.brands);
  const servingUnit =
    normalizeCatalogText(product.serving_size) ||
    normalizeCatalogText(product.quantity) ||
    "100 גרם";
  const hasServing = Boolean(product.serving_size);
  const calories = nutriment(product, "energy-kcal", hasServing);
  const protein = nutriment(product, "proteins", hasServing);
  const carbs = nutriment(product, "carbohydrates", hasServing);
  const fat = nutriment(product, "fat", hasServing);
  const fiber = nutriment(product, "fiber", hasServing) ?? 0;
  if (
    !barcode ||
    !name ||
    !isIsraeliProduct(product) ||
    calories === undefined ||
    protein === undefined ||
    carbs === undefined ||
    fat === undefined
  ) {
    return null;
  }

  const productType = productTypeFor(product);
  const aliases = [englishName, brand, normalizeCatalogText(product.generic_name)]
    .filter((value): value is string => Boolean(value))
    .filter((value, index, values) => values.indexOf(value) === index);
  const sourceUpdatedAt =
    typeof product.last_modified_t === "number"
      ? new Date(product.last_modified_t * 1000).toISOString()
      : undefined;

  return {
    id: `f-protein-off-${barcode}`,
    barcode,
    name,
    ...(englishName ? { englishName } : {}),
    ...(brand ? { brand } : {}),
    category: categoryFor(productType),
    productType,
    servingUnit,
    servingGrams: servingGrams(servingUnit),
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
    fiber,
    searchAliases: aliases,
    sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`,
    ...(sourceUpdatedAt ? { sourceUpdatedAt } : {}),
    verificationStatus: "external-unverified",
  };
}

export function openFoodFactsSearchUrl(page: number, pageSize = DEFAULT_PAGE_SIZE): string {
  const url = new URL(OPEN_FOOD_FACTS_ENDPOINT);
  url.searchParams.set("countries_tags_en", "israel");
  url.searchParams.set("search_terms", "protein");
  url.searchParams.set(
    "fields",
    [
      "code",
      "_id",
      "product_name_he",
      "product_name_en",
      "brands",
      "categories",
      "categories_tags",
      "countries",
      "countries_hierarchy",
      "countries_tags",
      "quantity",
      "serving_size",
      "nutriments",
      "generic_name",
      "last_modified_t",
    ].join(","),
  );
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("page", String(page));
  return url.toString();
}

async function defaultSleep(delayMs: number) {
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

async function fetchJsonWithRetry(
  url: string,
  options: {
    fetcher: Fetcher;
    timeoutMs: number;
    retries: number;
    sleep: (delayMs: number) => Promise<void>;
  },
): Promise<SourceProduct[]> {
  let lastError = "מקור הנתונים לא החזיר תשובה תקינה";
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const response = await options.fetcher(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "GymTrack protein catalog sync (contact via Open Food Facts)",
        },
        signal: controller.signal,
      });
      if (response.ok) {
        const body = (await response.json()) as { products?: unknown };
        return Array.isArray(body.products) ? (body.products as SourceProduct[]) : [];
      }
      lastError = `מקור הנתונים החזיר HTTP ${response.status}`;
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "שגיאת רשת במקור הנתונים";
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < options.retries) await options.sleep(500 * 2 ** attempt);
  }
  throw new Error(lastError);
}

function supabaseBaseUrl(value?: string): string {
  return (value ?? process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

function catalogRow(product: ImportedProteinProduct, syncedAt: string) {
  return {
    id: product.id,
    name: product.name,
    english_name: product.englishName ?? null,
    category: product.category,
    brand: product.brand ?? null,
    serving_unit: product.servingUnit,
    serving_grams: product.servingGrams,
    calories: product.calories,
    protein: product.protein,
    carbs: product.carbs,
    fat: product.fat,
    fiber: product.fiber,
    search_aliases: product.searchAliases,
    barcode: product.barcode,
    catalog_source: OPEN_FOOD_FACTS_SOURCE,
    catalog_source_product_id: product.barcode,
    catalog_source_url: product.sourceUrl,
    catalog_product_type: product.productType,
    catalog_package_size: null,
    catalog_synced_at: syncedAt,
    catalog_source_updated_at: product.sourceUpdatedAt ?? null,
    catalog_verification_status: product.verificationStatus,
  };
}

async function upsertRows(
  rows: ReturnType<typeof catalogRow>[],
  options: { supabaseUrl: string; serviceRoleKey: string; fetcher: Fetcher },
): Promise<number> {
  let count = 0;
  for (let index = 0; index < rows.length; index += 50) {
    const batch = rows.slice(index, index + 50);
    const response = await options.fetcher(
      `${options.supabaseUrl}/rest/v1/foods?on_conflict=catalog_source,catalog_source_product_id`,
      {
        method: "POST",
        headers: {
          apikey: options.serviceRoleKey,
          Authorization: `Bearer ${options.serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(batch),
      },
    );
    if (!response.ok) throw new Error(`Supabase catalog upsert failed with HTTP ${response.status}`);
    count += batch.length;
  }
  return count;
}

async function recordSyncRun(
  status: ProteinCatalogSyncStatus,
  options: { supabaseUrl: string; serviceRoleKey: string; fetcher: Fetcher },
) {
  try {
    await options.fetcher(`${options.supabaseUrl}/rest/v1/food_catalog_sync_runs`, {
      method: "POST",
      headers: {
        apikey: options.serviceRoleKey,
        Authorization: `Bearer ${options.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        source: OPEN_FOOD_FACTS_SOURCE,
        status: status.status,
        fetched_count: status.fetchedCount,
        accepted_count: status.acceptedCount,
        upserted_count: status.upsertedCount,
        error_message: status.error ?? null,
        started_at: status.startedAt,
        completed_at: status.completedAt,
      }),
    });
  } catch (error) {
    logger.warn({ error }, "Protein catalog sync run could not be recorded");
  }
}

export async function syncProteinProductCatalog(options: SyncOptions = {}): Promise<ProteinCatalogSyncStatus> {
  if (syncInFlight) {
    return { ...currentStatus, status: "skipped", error: "סנכרון אחר כבר מתבצע" };
  }

  const now = options.now ?? (() => new Date());
  const fetcher = options.fetcher ?? (globalThis.fetch as unknown as Fetcher);
  const supabaseUrl = supabaseBaseUrl(options.supabaseUrl);
  const serviceRoleKey = options.serviceRoleKey ?? process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  const startedAt = now().toISOString();
  const baseStatus: ProteinCatalogSyncStatus = {
    status: "running",
    startedAt,
    fetchedCount: 0,
    acceptedCount: 0,
    upsertedCount: 0,
  };
  currentStatus = baseStatus;

  if (!supabaseUrl || !serviceRoleKey) {
    currentStatus = {
      ...baseStatus,
      status: "skipped",
      completedAt: now().toISOString(),
      error: "SUPABASE_URL ו־SUPABASE_SERVICE_ROLE_KEY נדרשים להפעלת סנכרון הקטלוג",
    };
    logger.warn("Protein catalog sync skipped: server Supabase credentials are not configured");
    return { ...currentStatus };
  }

  syncInFlight = true;
  const sleep = options.sleep ?? defaultSleep;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const accepted = new Map<string, ImportedProteinProduct>();
  let sourceFailed = false;
  let lastError = "";

  try {
    for (let page = 1; page <= maxPages; page += 1) {
      try {
        const products = await fetchJsonWithRetry(openFoodFactsSearchUrl(page, pageSize), {
          fetcher,
          timeoutMs,
          retries,
          sleep,
        });
        currentStatus = { ...currentStatus, fetchedCount: currentStatus.fetchedCount + products.length };
        for (const product of products) {
          const normalized = normalizeOpenFoodFactsProduct(product);
          if (normalized) accepted.set(normalized.barcode, normalized);
        }
        if (products.length < pageSize) break;
      } catch (error) {
        sourceFailed = true;
        lastError = error instanceof Error ? error.message : "סנכרון המקור נכשל";
        if (accepted.size === 0) throw error;
        break;
      }
    }

    currentStatus = { ...currentStatus, acceptedCount: accepted.size };
    const rows = Array.from(accepted.values()).map((product) =>
      catalogRow(product, now().toISOString()),
    );
    const upsertedCount = rows.length
      ? await upsertRows(rows, { supabaseUrl, serviceRoleKey, fetcher })
      : 0;
    currentStatus = {
      ...currentStatus,
      status: sourceFailed ? "partial" : "success",
      upsertedCount,
      completedAt: now().toISOString(),
      ...(lastError ? { error: lastError } : {}),
    };
    return { ...currentStatus };
  } catch (error) {
    currentStatus = {
      ...currentStatus,
      status: "failed",
      completedAt: now().toISOString(),
      error: error instanceof Error ? error.message : "סנכרון הקטלוג נכשל",
    };
    return { ...currentStatus };
  } finally {
    syncInFlight = false;
    if (supabaseUrl && serviceRoleKey) await recordSyncRun(currentStatus, { supabaseUrl, serviceRoleKey, fetcher });
  }
}

export function startProteinCatalogScheduler() {
  if (process.env["PROTEIN_CATALOG_SYNC_ENABLED"] === "false") return () => undefined;
  const intervalMs = Math.max(
    60_000,
    Number(process.env["PROTEIN_CATALOG_SYNC_INTERVAL_MS"] ?? 86_400_000),
  );
  void syncProteinProductCatalog();
  const timer = setInterval(() => void syncProteinProductCatalog(), intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}