import type { FoodItem, MealFood } from "./gym-types";

export type FoodQuantityUnit =
  "g" | "ml" | "cup" | "unit" | "small" | "medium" | "large" | "tbsp" | "tsp" | "slice" | "serving";

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
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)(?=\s|$|[),.])/i);
  const value = match?.[1] ? Number(match[1].replace(",", ".")) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function referenceServingGrams(food: FoodItem) {
  if (
    food.servingGrams !== undefined &&
    Number.isFinite(food.servingGrams) &&
    food.servingGrams > 0
  ) {
    return food.servingGrams;
  }
  return gramsFromServing(food.servingSize);
}

function servingSpoonUnit(servingSize: string): "tbsp" | "tsp" | null {
  if (/כפית|כפיות|tsp/i.test(servingSize)) return "tsp";
  if (/כף|כפות|tbsp/i.test(servingSize)) return "tbsp";
  return null;
}

function servingIsUnit(servingSize: string) {
  return /יחידה|unit|ביצה|egg|גביע|קופס[הת]|פחית|בקבוק|מארז|אריזה|package|container|can|bottle/i.test(
    servingSize,
  );
}

function servingIsSlice(servingSize: string) {
  return /פרוסה|slice/i.test(servingSize);
}

function canConvertToGrams(food: FoodItem) {
  return referenceServingGrams(food) !== null;
}

function millilitersFromServing(servingSize: string) {
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|מ["״]?ל)(?=\s|$|[),.])/i);
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

function isBread(food: Pick<FoodItem, "name" | "englishName" | "category">) {
  return /לחם|טוסט|bread|toast/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function isPita(food: Pick<FoodItem, "name" | "englishName" | "category">) {
  return /פיתה|pita/i.test(`${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`);
}

function gramsPerBreadSlice(food: FoodItem) {
  const totalGrams = gramsFromServing(food.servingSize);
  const slices = food.servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:פרוסות?|slices?)/i)?.[1];
  const sliceCount = slices ? Number(slices.replace(",", ".")) : 1;
  return totalGrams && Number.isFinite(sliceCount) && sliceCount > 0 ? totalGrams / sliceCount : 30;
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
  let options: FoodQuantityOption[];

  if (isCherryTomato(food)) {
    options = [
      { value: "unit", label: "עגבניות שרי" },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isBread(food)) {
    options = [
      { value: "slice", label: unitLabels.slice },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isPita(food)) {
    options = [
      { value: "unit", label: unitLabels.unit },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (servingSpoonUnit(food.servingSize)) {
    const spoonUnit = servingSpoonUnit(food.servingSize)!;
    const alternateSpoonUnit = spoonUnit === "tbsp" ? "tsp" : "tbsp";
    options = [
      { value: spoonUnit, label: unitLabels[spoonUnit] },
      { value: alternateSpoonUnit, label: unitLabels[alternateSpoonUnit] },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isOilOrSauce(food)) {
    options = [
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
    ];
  } else if (isMilkOrDrink(food)) {
    options = [
      { value: "ml", label: unitLabels.ml },
      { value: "cup", label: unitLabels.cup },
    ];
  } else if (isBellPepper(food)) {
    options = [
      { value: "medium", label: unitLabels.medium },
      { value: "small", label: unitLabels.small },
      { value: "large", label: unitLabels.large },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isCucumber(food)) {
    options = [
      { value: "unit", label: "מלפפון" },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isAvocado(food) || isProteinOrStaple(food)) {
    options = canConvertToGrams(food)
      ? [{ value: "g", label: unitLabels.g }]
      : [{ value: "serving", label: unitLabels.serving }];
  } else if (millilitersFromServing(food.servingSize) !== null) {
    options = [
      { value: "ml", label: unitLabels.ml },
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
    ];
  } else if (servingIsSlice(food.servingSize)) {
    options = [
      { value: "slice", label: unitLabels.slice },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (servingIsUnit(food.servingSize)) {
    options = [
      { value: "unit", label: unitLabels.unit },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else {
    options = canConvertToGrams(food)
      ? [
          { value: "g", label: unitLabels.g },
          { value: "serving", label: unitLabels.serving },
        ]
      : [{ value: "serving", label: unitLabels.serving }];
  }

  const supportedOptions = options.filter((option) => servingMultiplier(food, option.value) !== null);
  return supportedOptions.length > 0
    ? supportedOptions
    : [{ value: "serving", label: unitLabels.serving }];
}

export function defaultFoodQuantity(food: FoodItem): {
  quantity: number;
  unit: FoodQuantityUnit;
} {
  let preferred: { quantity: number; unit: FoodQuantityUnit };
  const sourceSpoonUnit = servingSpoonUnit(food.servingSize);
  if (sourceSpoonUnit) preferred = { quantity: 1, unit: sourceSpoonUnit };
  else if (isCherryTomato(food)) preferred = { quantity: 12, unit: "unit" };
  else if (isBread(food)) preferred = { quantity: 1, unit: "slice" };
  else if (isPita(food)) preferred = { quantity: 1, unit: "unit" };
  else if (isMilkOrDrink(food)) preferred = { quantity: 100, unit: "ml" };
  else if (isBellPepper(food)) preferred = { quantity: 1, unit: "medium" };
  else if (isCucumber(food)) preferred = { quantity: 1, unit: "unit" };
  else if (servingIsUnit(food.servingSize)) preferred = { quantity: 1, unit: "unit" };
  else if (servingIsSlice(food.servingSize)) preferred = { quantity: 1, unit: "slice" };
  else if (isAvocado(food) || isProteinOrStaple(food)) {
    preferred = canConvertToGrams(food)
      ? { quantity: 100, unit: "g" }
      : { quantity: 1, unit: "serving" };
  } else if (millilitersFromServing(food.servingSize) !== null) {
    preferred = { quantity: 100, unit: "ml" };
  } else if (isOilOrSauce(food)) {
    preferred = { quantity: 1, unit: "tbsp" };
  } else {
    preferred = { quantity: 100, unit: "g" };
  }

  const supportedOptions = foodQuantityOptions(food).filter(
    (option) => servingMultiplier(food, option.value) !== null,
  );
  const preferredOption = supportedOptions.find((option) => option.value === preferred.unit);
  const fallbackOption = preferredOption ?? supportedOptions[0];
  if (!fallbackOption) return { quantity: 1, unit: "serving" };

  if (fallbackOption.value === preferred.unit) return preferred;
  return {
    quantity: fallbackOption.value === "g" || fallbackOption.value === "ml" ? 100 : 1,
    unit: fallbackOption.value,
  };
}

function gramsForUnit(food: FoodItem, unit: FoodQuantityUnit) {
  if (unit === "tbsp") return 15;
  if (unit === "tsp") return 5;
  if (unit === "cup") return 240;
  if (unit === "slice" && isBread(food)) return gramsPerBreadSlice(food);
  if (unit === "unit" && isPita(food)) return referenceServingGrams(food);
  if (unit === "unit" && isCherryTomato(food)) return 15;
  if (unit === "unit" && isCucumber(food)) return 200;
  if (unit === "small" && isBellPepper(food)) return 75;
  if (unit === "medium" && isBellPepper(food)) return 120;
  if (unit === "large" && isBellPepper(food)) return 160;
  return referenceServingGrams(food);
}

function servingMultiplier(food: FoodItem, unit: FoodQuantityUnit) {
  const servingGrams = referenceServingGrams(food);
  const servingMl = millilitersFromServing(food.servingSize);
  const spoonUnit = servingSpoonUnit(food.servingSize);

  if (unit === "g") {
    if (!servingGrams) return null;
    return 1 / servingGrams;
  }
  if (unit === "ml" && servingMl) return 1 / servingMl;
  if (unit === "cup") {
    if (servingMl) return 240 / servingMl;
    if (food.servingSize.match(/כוס(?:ות)?|cups?/i)) return 1;
    return null;
  }
  if (unit === "tbsp" && spoonUnit === "tbsp") return 1;
  if (unit === "tsp" && spoonUnit === "tsp") return 1;
  if (unit === "tbsp" && spoonUnit === "tsp") return 3;
  if (unit === "tsp" && spoonUnit === "tbsp") return 1 / 3;
  if (unit === "slice" && servingIsSlice(food.servingSize)) return 1;
  if (unit === "unit" && servingIsUnit(food.servingSize)) return 1;
  if (unit === "serving") return 1;
  if (
    unit === "small" ||
    unit === "medium" ||
    unit === "large" ||
    (unit === "slice" && isBread(food)) ||
    (unit === "unit" && isPita(food)) ||
    (unit === "unit" && (isCherryTomato(food) || isCucumber(food) || isBellPepper(food)))
  ) {
    const grams = gramsForUnit(food, unit);
    return grams && servingGrams ? grams / servingGrams : null;
  }
  return null;
}

export function mealFoodFromPortion(
  food: FoodItem,
  quantity: number,
  unit: FoodQuantityUnit,
): MealFood {
  const multiplier = servingMultiplier(food, unit);
  if (multiplier === null) {
    throw new Error("אין משקל ייחוס אמין להמרת המאכל ליחידה שנבחרה.");
  }
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

export function mealFoodQuantityLabel(food: Pick<MealFood, "name" | "quantity" | "servingSize">) {
  const legacyUnit = food.servingSize.replace(/\s+למנה$/, "");
  const normalizedUnit = isBread(food)
    ? unitLabels.slice
    : isPita(food)
      ? unitLabels.unit
      : legacyUnit;
  const quantity = Math.max(0.1, Number(food.quantity) || 1);
  const rounded = Math.round(quantity * 10) / 10;
  const whole = Math.floor(rounded);
  const remainder = Math.round((rounded - whole) * 100) / 100;
  const fractions: Record<number, string> = {
    0.25: "¼",
    0.33: "⅓",
    0.5: "½",
    0.67: "⅔",
    0.75: "¾",
    0.8: "⅘",
  };
  const fraction = fractions[remainder];
  const displayQuantity =
    fraction && whole > 0
      ? `${whole}${fraction}`
      : fraction || new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 }).format(rounded);
  if (normalizedUnit === unitLabels.serving) {
    return quantity === 1 ? "מנה אחת" : `כ־${displayQuantity} מהמנה`;
  }
  return `${displayQuantity} ${normalizedUnit}`;
}
