import type { FoodItem, MealFood } from "./gym-types";

export type FoodQuantityUnit =
  | "g"
  | "ml"
  | "cup"
  | "unit"
  | "small"
  | "medium"
  | "large"
  | "tbsp"
  | "tsp"
  | "slice"
  | "serving";

export type FoodQuantityOption = {
  value: FoodQuantityUnit;
  label: string;
};

const unitLabels: Record<FoodQuantityUnit, string> = {
  g: "גרם",
  ml: "מ״ל",
  cup: "כוס",
  unit: "יחידה",
  small: "יחידה קטנה",
  medium: "יחידה בינונית",
  large: "יחידה גדולה",
  tbsp: "כף",
  tsp: "כפית",
  slice: "פרוסה",
  serving: "מנה",
};

function gramsFromServing(servingSize: string) {
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)\b/i);
  const value = match?.[1] ? Number(match[1].replace(",", ".")) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function millilitersFromServing(servingSize: string) {
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|מ["״]?ל)\b/i);
  const value = match?.[1] ? Number(match[1].replace(",", ".")) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function isCherryTomato(food: FoodItem) {
  return /עגבניות?\s*שרי|cherry tomato/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isOilOrSauce(food: FoodItem) {
  return /שמן|oil|רוטב|sauce|טחינה|חמאת|מיונז|ממרח|דבש|סילאן/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function isMilkOrDrink(food: FoodItem) {
  return /חלב|milk|משקה|drink|מיץ|juice|מים|water|שייק|shake/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function isCucumber(food: FoodItem) {
  return /מלפפון|cucumber/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isBellPepper(food: FoodItem) {
  return /גמבה|פלפל אדום|פלפל צהוב|פלפל ירוק|bell pepper/i.test(
    `${food.name} ${food.englishName ?? ""}`,
  );
}

function isAvocado(food: FoodItem) {
  return /אבוקדו|avocado/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isProteinOrStaple(food: FoodItem) {
  return /עוף|חזה|פרגית|הודו|בשר|סטייק|קציצה|דג|סלמון|טונה|שניצל|chicken|turkey|beef|steak|fish|salmon|tuna|אורז|פסטה|קינואה|שיבולת|שיבולת שועל|rice|pasta|quinoa|oat/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

export function foodQuantityOptions(food: FoodItem): FoodQuantityOption[] {
  if (isCherryTomato(food)) {
    return [
      { value: "unit", label: "עגבניות שרי" },
      { value: "g", label: unitLabels.g },
    ];
  }

  if (isOilOrSauce(food)) {
    return [
      { value: "g", label: unitLabels.g },
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
    ];
  }

  if (isMilkOrDrink(food)) {
    return [
      { value: "ml", label: unitLabels.ml },
      { value: "cup", label: unitLabels.cup },
    ];
  }

  if (isBellPepper(food)) {
    return [
      { value: "medium", label: unitLabels.medium },
      { value: "small", label: unitLabels.small },
      { value: "large", label: unitLabels.large },
      { value: "g", label: unitLabels.g },
    ];
  }

  if (isCucumber(food)) {
    return [
      { value: "unit", label: "מלפפון" },
      { value: "g", label: unitLabels.g },
    ];
  }

  if (isAvocado(food) || isProteinOrStaple(food)) {
    return [{ value: "g", label: unitLabels.g }];
  }

  if (millilitersFromServing(food.servingSize) !== null) {
    return [
      { value: "ml", label: unitLabels.ml },
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
    ];
  }

  if (/פרוסה|slice/i.test(food.servingSize)) {
    return [
      { value: "slice", label: unitLabels.slice },
      { value: "g", label: unitLabels.g },
    ];
  }

  if (/יחידה|unit|ביצה|egg/i.test(food.servingSize)) {
    return [
      { value: "unit", label: unitLabels.unit },
      { value: "g", label: unitLabels.g },
    ];
  }

  return [
    { value: "g", label: unitLabels.g },
    { value: "serving", label: unitLabels.serving },
  ];
}

export function defaultFoodQuantity(food: FoodItem): {
  quantity: number;
  unit: FoodQuantityUnit;
} {
  if (isCherryTomato(food)) return { quantity: 12, unit: "unit" };
  if (isMilkOrDrink(food)) return { quantity: 100, unit: "ml" };
  if (isBellPepper(food)) return { quantity: 1, unit: "medium" };
  if (isCucumber(food)) return { quantity: 1, unit: "unit" };
  if (isAvocado(food) || isProteinOrStaple(food)) return { quantity: 100, unit: "g" };
  if (/יחידה|unit|ביצה|egg/i.test(food.servingSize)) return { quantity: 1, unit: "unit" };
  if (/פרוסה|slice/i.test(food.servingSize)) return { quantity: 1, unit: "slice" };
  if (millilitersFromServing(food.servingSize) !== null) return { quantity: 100, unit: "ml" };
  if (isOilOrSauce(food)) return { quantity: 1, unit: "tbsp" };
  return { quantity: 100, unit: "g" };
}

function gramsForUnit(food: FoodItem, unit: FoodQuantityUnit) {
  if (unit === "tbsp") return 15;
  if (unit === "tsp") return 5;
  if (unit === "cup") return 240;
  if (unit === "unit" && isCherryTomato(food)) return 15;
  if (unit === "unit" && isCucumber(food)) return 200;
  if (unit === "small" && isBellPepper(food)) return 75;
  if (unit === "medium" && isBellPepper(food)) return 120;
  if (unit === "large" && isBellPepper(food)) return 160;
  return gramsFromServing(food.servingSize);
}

function servingMultiplier(food: FoodItem, unit: FoodQuantityUnit) {
  const servingGrams = gramsFromServing(food.servingSize);
  const servingMl = millilitersFromServing(food.servingSize);

  if (unit === "g" && servingGrams) return 1 / servingGrams;
  if (unit === "ml" && servingMl) return 1 / servingMl;
  if (unit === "cup" && servingMl) return 240 / servingMl;
  if (
    unit === "tbsp" ||
    unit === "tsp" ||
    unit === "cup" ||
    unit === "small" ||
    unit === "medium" ||
    unit === "large" ||
    (unit === "unit" && (isCherryTomato(food) || isCucumber(food) || isBellPepper(food)))
  ) {
    const grams = gramsForUnit(food, unit);
    return grams && servingGrams ? grams / servingGrams : 1;
  }
  return 1;
}

export function mealFoodFromPortion(
  food: FoodItem,
  quantity: number,
  unit: FoodQuantityUnit,
): MealFood {
  const multiplier = servingMultiplier(food, unit);
  const optionLabel = unit === "unit" && isCherryTomato(food) ? "עגבניות שרי" : unitLabels[unit];

  return {
    id: crypto.randomUUID(),
    foodId: food.id,
    name: food.name,
    servingSize: `${optionLabel} למנה`,
    quantity,
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
    ...(food.fiber === undefined ? {} : { fiber: food.fiber * multiplier }),
  };
}

export function mealFoodQuantityLabel(food: Pick<MealFood, "quantity" | "servingSize">) {
  return `${food.quantity} ${food.servingSize.replace(/\s+למנה$/, "")}`;
}
