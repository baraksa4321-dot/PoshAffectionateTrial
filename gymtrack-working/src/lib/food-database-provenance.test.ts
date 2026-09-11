import { describe, expect, test } from "bun:test";
import { ISRAELI_FOOD_DATABASE, EVERYDAY_FOOD_DATABASE } from "./israeli-food-db";
import { nutritionSourceFor } from "./nutrition-integrity";
import { ISRAELI_PROTEIN_PRODUCTS } from "./protein-product-catalog";
import { USDA_FOOD_EXPANSION } from "./usda-food-expansion";

describe("food library expansion provenance", () => {
  test("ships the requested breadth without duplicate seed IDs", () => {
    const allSeedFoods = [
      ...ISRAELI_FOOD_DATABASE,
      ...USDA_FOOD_EXPANSION,
      ...ISRAELI_PROTEIN_PRODUCTS,
    ];

    expect(ISRAELI_FOOD_DATABASE.length).toBeGreaterThan(488);
    expect(USDA_FOOD_EXPANSION.length).toBeGreaterThan(299);
    expect(EVERYDAY_FOOD_DATABASE.length).toBeGreaterThan(699);
    expect(new Set(allSeedFoods.map((food) => food.id)).size).toBe(allSeedFoods.length);
  });

  test("keeps USDA rows traceable without promoting them to verified values", () => {
    for (const food of USDA_FOOD_EXPANSION) {
      const review = food.nutritionReview;
      const source = review?.sources[0];

      expect(review).toMatchObject({
        status: "unreviewed",
        origin: "estimated",
        confidence: "medium",
        method: "existing-value",
      });
      expect(source).toMatchObject({
        kind: "usda",
        match: "same-food",
        valuesPer: "serving",
      });
      expect(source?.url).toMatch(/^https:\/\/fdc\.nal\.usda\.gov\/food-search\?query=/);
      expect(nutritionSourceFor(food)).toMatchObject({
        verified: false,
        status: "estimated",
        label: "USDA — מקור השוואה, טרם אומת",
        needsReview: true,
      });
    }
  });

  test("does not change the separate exact-product policy for protein products", () => {
    const exactProductCount = ISRAELI_PROTEIN_PRODUCTS.filter((food) =>
      food.nutritionReview?.sources.some(
        (source) => source.match === "exact-product" && Boolean(source.url),
      ),
    ).length;

    expect(exactProductCount).toBe(4);
    expect(
      ISRAELI_PROTEIN_PRODUCTS.filter(
        (food) => !food.nutritionReview?.sources.some((source) => source.match === "exact-product"),
      ).every((food) => nutritionSourceFor(food).verified === false),
    ).toBe(true);
  });
});