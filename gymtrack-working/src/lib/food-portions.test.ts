import { describe, expect, test } from "bun:test";
import {
  defaultFoodQuantity,
  foodPortionFromServingQuantity,
  foodQuantityOptions,
  mealFoodFromPortion,
  mealFoodNutritionMultiplier,
  mealFoodQuantityLabel,
  normalizeLegacyGramMealFood,
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

const slicedCheese: FoodItem = {
  id: "sliced-cheese-household",
  name: "גבינה צהובה",
  category: "גבינות",
  servingSize: "פרוסה (20g)",
  servingGrams: 20,
  calories: 60,
  protein: 5,
  carbs: 0.5,
  fat: 4,
};

const cookedRice: FoodItem = {
  id: "cooked-rice-household",
  name: "אורז מבושל",
  category: "דגנים",
  servingSize: "100 גרם",
  calories: 200,
  protein: 4,
  carbs: 44,
  fat: 0,
};

const oil: FoodItem = {
  id: "olive-oil",
  name: "שמן זית",
  category: "שמנים",
  servingSize: "10 מ״ל",
  calories: 88.4,
  protein: 0,
  carbs: 0,
  fat: 10,
};

const drink: FoodItem = {
  id: "milk-drink",
  name: "משקה חלב",
  category: "משקאות",
  servingSize: "200 מ״ל",
  calories: 100,
  protein: 7,
  carbs: 10,
  fat: 2,
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

    const mealFood = mealFoodFromPortion(mediumEgg, 1, "unit");
    expect(mealFood.calories).toBe(72);
    expect(mealFood.quantity).toBe(1);
    expect(mealFood.servingSize).toBe("יחידה למנה");
  });

  test("uses the source spoon or slice instead of falling back to grams", () => {
    const measuredOats: FoodItem = {
      ...peanutButter,
      id: "measured-oats",
      name: "קוואקר",
      servingSize: "כף גדושה (15g)",
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

  test("keeps 100 g and 150 g legacy rows at one serving total", () => {
    const fixture = {
      id: "legacy-rice",
      foodId: cookedRice.id,
      name: cookedRice.name,
      servingSize: cookedRice.servingSize,
      quantity: 100,
      calories: cookedRice.calories,
      protein: cookedRice.protein,
      carbs: cookedRice.carbs,
      fat: cookedRice.fat,
    };
    const oneHundredGrams = normalizeLegacyGramMealFood(fixture);
    const oneHundredFiftyGrams = normalizeLegacyGramMealFood({
      ...fixture,
      quantity: 150,
    });

    expect(oneHundredGrams.servingSize).toBe("גרם למנה");
    expect(oneHundredGrams.calories * mealFoodNutritionMultiplier(oneHundredGrams)).toBe(200);
    expect(oneHundredFiftyGrams.calories * mealFoodNutritionMultiplier(oneHundredFiftyGrams)).toBe(
      300,
    );
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
    const cupDrink = mealFoodFromPortion(drink, 1, "cup");

    expect(defaultFoodQuantity(cupDrink)).toEqual({ quantity: 1, unit: "cup" });
    expect(cupDrink.servingSize).toBe("כוס למנה");
    expect(cupDrink.calories).toBe(120);
  });

  test("keeps teaspoon and tablespoon ratios explicit", () => {
    expect(Math.abs(mealFoodFromPortion(peanutButter, 1, "tsp").calories - 94 / 3) < 1e-9).toBe(
      true,
    );
  });

  test("offers practical household units for cottage and converts them", () => {
    const cottage: FoodItem = {
      id: "cottage-replacement",
      name: "קוטג׳ 5%",
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

  test("converts sliced cheese, oil, and cooked staples with household quantities", () => {
    const twoSlices = mealFoodFromPortion(slicedCheese, 2, "slice");
    const tablespoonOil = mealFoodFromPortion(oil, 1, "tbsp");
    const cupRice = mealFoodFromPortion(cookedRice, 1, "cup");

    expect(twoSlices.servingSize).toBe("פרוסה למנה");
    expect(twoSlices.calories).toBe(60);
    expect(twoSlices.quantity).toBe(2);
    expect(tablespoonOil.servingSize).toBe("כף למנה");
    expect(Math.abs(tablespoonOil.calories - 132.6) < 1e-9).toBe(true);
    expect(cupRice.servingSize).toBe("כוס למנה");
    expect(cupRice.calories).toBe(390);
  });

  test("uses FoodsDictionary weights for large and medium vegetables", () => {
    const pepper: FoodItem = {
      id: "red-pepper",
      name: "פלפל אדום (גמבה)",
      category: "ירקות",
      servingSize: "יחידה בינונית (185g)",
      calories: 57.4,
      protein: 1.8,
      carbs: 11.2,
      fat: 0.6,
      fiber: 3.9,
    };
    const largePepper = mealFoodFromPortion(pepper, 1, "large");

    expect(foodQuantityOptions(pepper).map(({ value }) => value)).toEqual([
      "medium",
      "small",
      "large",
      "g",
    ]);
    expect(largePepper.servingSize).toBe("יחידה גדולה למנה");
    expect(Math.abs(largePepper.calories - 57.4 * (289 / 185)) < 1e-9).toBe(true);

    const cookedBroccoli: FoodItem = {
      id: "cooked-broccoli",
      name: "ברוקולי מבושל",
      category: "ירקות",
      servingSize: "100 גרם",
      calories: 35,
      protein: 2.4,
      carbs: 7.2,
      fat: 0.4,
      fiber: 3.3,
    };
    expect(foodQuantityOptions(cookedBroccoli).map(({ value }) => value)).not.toContain("small");
    expect(foodQuantityOptions(cookedBroccoli).map(({ value }) => value)).not.toContain("medium");
    expect(foodQuantityOptions(cookedBroccoli).map(({ value }) => value)).not.toContain("large");
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
