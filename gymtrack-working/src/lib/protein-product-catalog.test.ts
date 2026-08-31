import { describe, expect, test } from "bun:test";
import { searchFoods } from "./gym-store";
import { foodLibraryAudit, nutritionSourceFor } from "./nutrition-integrity";
import { ISRAELI_PROTEIN_PRODUCTS } from "./protein-product-catalog";

describe("Israeli protein product catalog", () => {
  test("ships stable offline products with complete nutrition and provenance", () => {
    expect(ISRAELI_PROTEIN_PRODUCTS.length).toBeGreaterThan(11);
    expect(new Set(ISRAELI_PROTEIN_PRODUCTS.map((food) => food.id)).size).toBe(
      ISRAELI_PROTEIN_PRODUCTS.length,
    );
    for (const food of ISRAELI_PROTEIN_PRODUCTS) {
      expect(food.catalog?.source).toBe("curated-israel");
      expect(food.catalog?.sourceProductId).toBe(food.id);
      expect(food.servingSize).not.toBe("");
      expect(food.calories).toBeGreaterThan(-1);
      expect(food.protein).toBeGreaterThan(-1);
      expect(food.carbs).toBeGreaterThan(-1);
      expect(food.fat).toBeGreaterThan(-1);
    }
  });

  test("searches product brands and stable source IDs", () => {
    expect(searchFoods(ISRAELI_PROTEIN_PRODUCTS, "Allin").length).toBeGreaterThan(1);
    expect(searchFoods(ISRAELI_PROTEIN_PRODUCTS, "f-protein-il-go-pudding").length).toBe(2);
  });

  test("labels curated seed values as requiring label verification", () => {
    const food = ISRAELI_PROTEIN_PRODUCTS.find((item) => item.id.includes("yotvata-pro"))!;
    expect(nutritionSourceFor(food)).toMatchObject({
      verified: false,
      label: "קטלוג ישראלי — נדרש אימות תווית",
    });
  });

  test("keeps products without an exact source unverified", () => {
    const reviewedIds = new Set([
      "f-protein-il-tnuva-go-yogurt-natural",
      "f-protein-il-danone-pro-strawberry",
      "f-protein-il-allin-bar-chocolate",
      "f-protein-il-allin-whey-vanilla",
    ]);
    const unverified = ISRAELI_PROTEIN_PRODUCTS.filter((food) => !reviewedIds.has(food.id));

    expect(unverified).toHaveLength(10);
    for (const food of unverified) {
      expect(food.nutritionReview).toBeUndefined();
      expect(nutritionSourceFor(food).verified).toBe(false);
    }
  });

  test("does not trust a reviewed record whose source is only a comparison", () => {
    const comparisonOnly = {
      id: "f-protein-il-comparison-only",
      nutritionReview: {
        status: "reviewed" as const,
        sources: [
          {
            name: "מוצר דומה",
            url: "https://example.com/product",
            kind: "retailer-product-page" as const,
            match: "comparison" as const,
            valuesPer: "serving" as const,
          },
        ],
      },
    };

    expect(nutritionSourceFor(comparisonOnly)).toMatchObject({
      verified: false,
      label: "קטלוג ישראלי — נדרש אימות תווית",
    });
  });

  test("records manufacturer verification separately from retailer review", () => {
    const yoplait = ISRAELI_PROTEIN_PRODUCTS.find((item) =>
      item.id.includes("tnuva-go-yogurt-natural"),
    )!;
    const manufacturerReviewed = ISRAELI_PROTEIN_PRODUCTS.find((item) =>
      item.id.includes("danone-pro-strawberry"),
    )!;
    const retailerReviewed = ISRAELI_PROTEIN_PRODUCTS.find((item) =>
      item.id.includes("allin-whey-vanilla"),
    )!;

    expect(nutritionSourceFor(manufacturerReviewed)).toMatchObject({
      verified: true,
      label: "נבדק מול מקור יצרן",
    });
    expect(yoplait).toMatchObject({
      calories: 144,
      protein: 20,
      carbs: 7,
      fat: 4,
      servingSize: "גביע (200 גרם)",
    });
    expect(manufacturerReviewed).toMatchObject({
      calories: 130,
      protein: 20,
      carbs: 11.2,
      fat: 0,
    });
    expect(manufacturerReviewed.catalog?.sourceUrl).toContain(
      "%D7%AA%D7%95%D7%AA-20-%D7%92%D7%A8%D7%9D",
    );
    expect(ISRAELI_PROTEIN_PRODUCTS.find((item) => item.id.includes("allin-bar"))).toMatchObject({
      calories: 203,
      protein: 15,
      carbs: 20.6,
      fat: 9.1,
      fiber: 3.6,
      servingSize: "חטיף (55 גרם)",
    });
    expect(retailerReviewed).toMatchObject({
      calories: 128,
      protein: 25,
      carbs: 3.1,
      fat: 1.5,
      servingSize: "מנה (33 גרם)",
    });
    expect(nutritionSourceFor(retailerReviewed)).toMatchObject({
      verified: true,
      label: "נבדק מול דף מוצר מתועד",
    });
  });

  test("counts reviewed products in the library audit", () => {
    const audit = foodLibraryAudit(ISRAELI_PROTEIN_PRODUCTS);
    expect(audit.verified).toBe(4);
    expect(audit.requiresLabelVerification).toBe(
      ISRAELI_PROTEIN_PRODUCTS.length - 4,
    );
    expect(audit.invalid).toBe(0);
  });
});
