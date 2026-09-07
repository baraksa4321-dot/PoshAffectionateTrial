import { describe, expect, test } from "bun:test";
import { defaultFoodQuantity, foodQuantityOptions, mealFoodFromPortion } from "./food-portions";
import type { FoodItem } from "./gym-types";

const peanutButter: FoodItem = {
  id: "peanut-butter",
  name: "חמאת בוטנים",
  servingSize: "כף",
  calories: 94,
  protein: 4,
  carbs: 3,
  fat: 8,
};

const gramBasedSpread: FoodItem = {
  ...peanutButter,
  id: "gram-based-spread",
  servingSize: "כף (16 גרם)",
};

describe("food portion conversions", () => {
  test("does not offer grams when a spoon serving has no reliable weight", () => {
    expect(foodQuantityOptions(peanutButter).map(({ value }) => value)).toEqual(["tbsp", "tsp"]);
  });

  test("uses serving grams instead of treating a tablespoon as one gram", () => {
    const mealFood = mealFoodFromPortion(gramBasedSpread, 1, "g");

    expect(Math.abs(mealFood.calories - 94 / 16) < 1e-9).toBe(true);
    expect(Math.abs(mealFood.protein - 4 / 16) < 1e-9).toBe(true);
    expect(Math.abs(mealFood.carbs - 3 / 16) < 1e-9).toBe(true);
    expect(Math.abs(mealFood.fat - 8 / 16) < 1e-9).toBe(true);
  });

  test("does not choose grams by default without a reference weight", () => {
    expect(defaultFoodQuantity(peanutButter)).toEqual({ quantity: 1, unit: "tbsp" });
  });

  test("chooses a supported fallback unit for foods without a reference weight", () => {
    const unknownServingFood: FoodItem = {
      ...peanutButter,
      id: "unknown-serving",
      name: "מאכל ללא יחידת משקל",
      servingSize: "מנה",
    };

    expect(defaultFoodQuantity(unknownServingFood)).toEqual({ quantity: 1, unit: "serving" });
  });

  test("does not choose an unconvertible spoon unit for a sauce", () => {
    const unweightedOil: FoodItem = {
      ...peanutButter,
      id: "unweighted-oil",
      name: "שמן זית",
      servingSize: "100 גרם",
    };

    expect(defaultFoodQuantity(unweightedOil)).toEqual({ quantity: 100, unit: "g" });
  });

  test("falls back to cups when a drink has no milliliter reference", () => {
    const cupDrink: FoodItem = {
      ...peanutButter,
      id: "cup-drink",
      name: "משקה",
      servingSize: "כוס",
    };

    expect(defaultFoodQuantity(cupDrink)).toEqual({ quantity: 1, unit: "cup" });
  });

  test("keeps teaspoon and tablespoon ratios explicit", () => {
    expect(Math.abs(mealFoodFromPortion(peanutButter, 1, "tsp").calories - 94 / 3) < 1e-9).toBe(
      true,
    );
  });
});
