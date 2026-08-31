import { describe, expect, test } from "bun:test";
import { searchFoods } from "./gym-store";
import { nutritionSourceFor } from "./nutrition-integrity";
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
    const food = ISRAELI_PROTEIN_PRODUCTS[0]!;
    expect(nutritionSourceFor(food)).toMatchObject({
      verified: false,
      label: "קטלוג ישראלי — נדרש אימות תווית",
    });
  });
});