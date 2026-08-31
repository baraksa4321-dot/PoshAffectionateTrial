import { describe, expect, test } from "bun:test";
import {
  normalizeBrand,
  normalizeOpenFoodFactsProduct,
  openFoodFactsSearchUrl,
  syncProteinProductCatalog,
} from "../src/lib/protein-catalog-sync";

const validSourceProduct = {
  code: "7290012345678",
  product_name_he: "יוגורט חלבון תות",
  product_name_en: "Strawberry protein yogurt",
  brands: "Brand One, Other Brand",
  categories: "יוגורטים, מוצרי חלבון",
  countries_tags: ["en:israel"],
  serving_size: "200 g",
  nutriments: {
    "energy-kcal_serving": 150,
    proteins_serving: 20,
    carbohydrates_serving: 16,
    fat_serving: 0.4,
    fiber_serving: 0,
  },
  last_modified_t: 1_750_000_000,
};

describe("protein catalog normalization", () => {
  test("keeps an Israeli product with complete serving nutrition", () => {
    const product = normalizeOpenFoodFactsProduct(validSourceProduct);
    expect(product).not.toBeNull();
    expect(product?.id).toBe("f-protein-off-7290012345678");
    expect(product?.name).toBe("יוגורט חלבון תות");
    expect(product?.brand).toBe("Brand One");
    expect(product?.productType).toBe("yogurt");
    expect(product?.servingGrams).toBe(200);
    expect(product?.verificationStatus).toBe("external-unverified");
  });

  test("rejects incomplete or non-Israeli rows", () => {
    expect(
      normalizeOpenFoodFactsProduct({
        ...validSourceProduct,
        countries_tags: ["en:france"],
      }),
    ).toBeNull();
    expect(
      normalizeOpenFoodFactsProduct({
        ...validSourceProduct,
        nutriments: { ...validSourceProduct.nutriments, fat_serving: null },
      }),
    ).toBeNull();
  });

  test("normalizes Hebrew punctuation and produces a bounded source URL", () => {
    expect(normalizeBrand("תנובה, שטראוס")).toBe("תנובה");
    const url = new URL(openFoodFactsSearchUrl(2, 50));
    expect(url.searchParams.get("countries_tags_en")).toBe("israel");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("page_size")).toBe("50");
  });
});

describe("protein catalog sync boundaries", () => {
  test("upserts accepted pages but preserves a partial source failure", async () => {
    const requests: Array<{ url: string; method: string }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      requests.push({ url, method: init?.method ?? "GET" });
      if (init?.method === "POST") return new Response(null, { status: 201 });
      if (url.includes("page=1")) {
        return new Response(JSON.stringify({ products: [validSourceProduct] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error("temporary source outage");
    };

    const result = await syncProteinProductCatalog({
      fetcher,
      supabaseUrl: "https://example.supabase.co",
      serviceRoleKey: "test-service-role-key",
      maxPages: 2,
      pageSize: 1,
      retries: 0,
      sleep: async () => undefined,
      now: () => new Date("2026-08-31T00:00:00.000Z"),
    });

    expect(result.status).toBe("partial");
    expect(result.fetchedCount).toBe(1);
    expect(result.acceptedCount).toBe(1);
    expect(result.upsertedCount).toBe(1);
    expect(requests.filter((request) => request.method === "POST")).toHaveLength(2);
  });
});