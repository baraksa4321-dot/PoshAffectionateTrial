import { describe, expect, test } from "bun:test";
import {
  defaultFoodQuantity,
  foodPortionFromServingQuantity,
  foodQuantityOptions,
  mealFoodFromPortion,
  mealFoodQuantityLabel,
} from "./food-portions";
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

const mediumEgg: FoodItem = {
  id: "medium-egg",
  name: "ביצה M",
  category: "ביצים",
  servingSize: "יחידה 1 (53g)",
  calories: 72,
  protein: 6.3,
  carbs: 0.5,
  fat: 5,
};

describe("food portion conversions", () => {
  test("keeps meal quantities measurable instead of using fractional serving labels", () => {
    expect(
      mealFoodQuantityLabel({
        name: "אורז",
        servingSize: "גרם למנה",
        quantity: 100,
      }),
    ).toBe("100 גרם");
    expect(
      mealFoodQuantityLabel({
        name: "מאכל",
        servingSize: "מנה למנה",
        quantity: 0.5,
      }),
    ).toBe("כ־½ מהמנה");
  });

  test("keeps an egg serving as units even when its reference weight is present", () => {
    expect(defaultFoodQuantity(mediumEgg)).toEqual({ quantity: 1, unit: "unit" });
    expect(foodQuantityOptions(mediumEgg).map(({ value }) => value)).toEqual(["unit", "g"]);

    const mealFood = mealFoodFromPortion(mediumEgg, 2, "unit");
    expect(mealFood.calories).toBe(72);
    expect(mealFood.quantity).toBe(2);
    expect(mealFood.servingSize).toBe("יחידה למנה");
  });

  test("uses the source spoon or slice instead of falling back to grams", () => {
    const measuredOats: FoodItem = {
      ...peanutButter,
      id: "measured-oats",
      name: "קוואקר",
      servingSize: "כף גדושה (15g)",
    };
    const slicedCheese: FoodItem = {
      ...peanutButter,
      id: "sliced-cheese",
      name: "גבינה צהובה",
      servingSize: "פרוסה (28g)",
    };

    expect(defaultFoodQuantity(measuredOats)).toEqual({ quantity: 1, unit: "tbsp" });
    expect(defaultFoodQuantity(slicedCheese)).toEqual({ quantity: 1, unit: "slice" });
  });

  test("treats packaged servings as one unit", () => {
    const yogurt: FoodItem = {
      ...peanutButter,
      id: "yogurt-cup",
      name: "יוגורט",
      category: "יוגורט",
      servingSize: "גביע (200g)",
    };

    expect(defaultFoodQuantity(yogurt)).toEqual({ quantity: 1, unit: "unit" });
    expect(foodQuantityOptions(yogurt).map(({ value }) => value)).toEqual([
      "unit",
      "g",
      "tbsp",
      "tsp",
      "serving",
    ]);
  });

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
    expect(foodQuantityOptions(unweightedOil).map(({ value }) => value)).toEqual(["g"]);
  });

  test("falls back to serving when a food has no usable weight or volume", () => {
    const unmeasurableDrink: FoodItem = {
      ...peanutButter,
      id: "unmeasurable-drink",
      name: "משקה ללא נפח",
      servingSize: "מנה",
    };

    expect(foodQuantityOptions(unmeasurableDrink)).toEqual([
      { value: "serving", label: "מנה" },
    ]);
    expect(mealFoodFromPortion(unmeasurableDrink, 1, "serving").calories).toBe(94);
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

  test("offers practical household units for cottage and converts them", () => {
    const cottage: FoodItem = {
      id: "cottage-5",
      name: "קוטג׳ 5%",
      category: "מוצרי חלב",
      servingSize: "100 גרם",
      calories: 95,
      protein: 11,
      carbs: 1.5,
      fat: 5,
    };

    expect(foodQuantityOptions(cottage).map(({ value }) => value)).toEqual([
      "g",
      "tbsp",
      "tsp",
      "serving",
    ]);
    const twoSpoons = mealFoodFromPortion(cottage, 2, "tbsp");
    expect(twoSpoons.servingSize).toBe("כף למנה");
    expect(twoSpoons.calories).toBe(14.25);
    expect(twoSpoons.protein).toBe(1.65);
    expect(twoSpoons.quantity).toBe(2);
  });

  test("uses household units in replacement presentation instead of always grams", () => {
    const cottage: FoodItem = {
      id: "cottage-replacement",
      name: "קוטג׳ 5%",
      servingSize: "100 גרם",
      calories: 95,
      protein: 11,
      carbs: 1.5,
      fat: 5,
    };

    expect(foodPortionFromServingQuantity(cottage, 0.5)).toEqual({
      quantity: 3.3,
      unit: "tbsp",
      unitLabel: "כף",
    });
  });
});
