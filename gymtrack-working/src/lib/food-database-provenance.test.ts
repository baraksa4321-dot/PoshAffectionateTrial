import { describe, expect, test } from "bun:test";
import { COMMON_FOODS } from "./common-foods";
import { IMPORTED_ISRAELI_FOODS } from "./imported-israeli-foods";
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

  test("keeps all 200 workbook foods approved while preserving source review state", () => {
    expect(IMPORTED_ISRAELI_FOODS).toHaveLength(200);
    expect(new Set(IMPORTED_ISRAELI_FOODS.map((food) => food.name)).size).toBe(200);
    expect(IMPORTED_ISRAELI_FOODS.every((food) => food.approvalStatus === "approved")).toBe(true);
    expect(IMPORTED_ISRAELI_FOODS.filter((food) => food.nutritionReview?.status === "reviewed")).toHaveLength(1);
    expect(
      IMPORTED_ISRAELI_FOODS.filter((food) => food.nutritionReview?.status === "unreviewed").every(
        (food) =>
          food.servingSize === "100 גרם/מ״ל" &&
          food.nutritionReview?.origin === "estimated",
      ),
    ).toBe(true);
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

  test("keeps cooked-food reviews tied to the matching preparation state", () => {
    const foodById = new Map(
      [...EVERYDAY_FOOD_DATABASE, ...COMMON_FOODS].map((food) => [food.id, food]),
    );
    const reviewedFoods = [
      ["f-israel-120", 23.2],
      ["f-israel-122", 18.6],
      ["f-israel-123", 21.3],
      ["f-israel-124", 19.9],
      ["f-israel-211", 7.2],
      ["f-israel-221", 10],
      ["f-common-quinoa", 21.3],
    ] as const;

    for (const [id, carbs] of reviewedFoods) {
      const food = foodById.get(id);
      expect(food).not.toBeUndefined();
      expect(food?.carbs).toBe(carbs);
      expect(food?.nutritionReview).toMatchObject({
        status: "reviewed",
        origin: "verified",
      });
      expect(food?.nutritionReview?.sources[0]).toMatchObject({
        kind: "food-dictionary",
        match: "same-food",
        valuesPer: "100g",
      });
      expect(food?.nutritionReview?.sources[0]?.url).toContain("foodsdictionary.co.il/Products/1/");
      expect(food?.nutritionReview?.sources[0]?.name).toContain("מבושל");
      expect(nutritionSourceFor(food!)).toMatchObject({
        label: "נבדק מול FoodsDictionary",
        verified: true,
        status: "verified",
        needsReview: false,
      });
    }

    expect(foodById.get("f-israel-212")?.nutritionReview).toBeUndefined();
    expect(foodById.get("f-israel-225")?.nutritionReview).toBeUndefined();
  });
});