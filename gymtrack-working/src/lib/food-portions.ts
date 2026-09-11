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

function isLiquidOilOrSauce(food: FoodItem) {
  return /שמן|oil|רוטב|sauce/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function isMilkOrDrink(food: FoodItem) {
  if (isDenseDairyOrSpread(food)) return false;
  return /חלב|milk|משקה|drink|מיץ|juice|מים|water|שייק|shake/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function isDenseDairyOrSpread(food: FoodItem) {
  return /קוטג׳?|cottage|גבינה|cheese|יוגורט|yogurt|סקיר|skyr|לבנה|labneh|שמנת|sour cream|חומוס|hummus|טחינה|tahini|חמאת בוטנים|peanut butter|ממרח|spread|ריבה|jam/i.test(
    `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`,
  );
}

function cupGramsForFood(food: FoodItem) {
  const text = `${food.name} ${food.englishName ?? ""} ${food.category ?? ""}`;
  if (/אורז|rice/.test(text)) return 195;
  if (/פסטה|מקרוני|ספגטי|pasta|macaroni|spaghetti/.test(text)) return 140;
  if (/קינואה|quinoa/.test(text)) return 185;
  if (/בורגול|bulgur/.test(text)) return 182;
  if (/כוסמת|buckwheat/.test(text)) return 168;
  if (/עדשים|lentil/.test(text)) return 198;
  if (/שעועית|beans?/.test(text)) return 175;
  if (/חומוס מבושל|chickpeas?/.test(text)) return 165;
  if (/שיבולת שועל|קוואקר|oats?/.test(text)) return 80;
  if (/קמח|flour/.test(text)) return 125;
  return null;
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

function isTomato(food: FoodItem) {
  return /עגבני|tomato/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isCarrot(food: FoodItem) {
  return /גזר|carrot/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isZucchini(food: FoodItem) {
  return /קישוא|zucchini|courgette/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isRadish(food: FoodItem) {
  return /צנונית|צנון|radish/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function isBeet(food: FoodItem) {
  return /סלק|beet/i.test(`${food.name} ${food.englishName ?? ""}`);
}

function vegetableUnitWeights(food: FoodItem) {
  const text = `${food.name} ${food.englishName ?? ""}`;
  if (
    !(food.category ?? "").includes("ירקות") ||
    /מבושל|אפוי|קלוי|מוקפץ|מאודה|בגריל|מרוסק|רוטב|חמוץ|קפוא|green pepper.*yellow|yellow pepper.*green/i.test(
      text,
    )
  ) {
    return null;
  }
  if (/פלפל צהוב|yellow pepper/i.test(text)) {
    return { small: 86, medium: 122, large: 188 };
  }
  if (/פלפל ירוק|green pepper/i.test(text)) {
    return { small: 110, medium: 166, large: 218 };
  }
  if (isBellPepper(food)) return { small: 110, medium: 185, large: 289 };
  if (isCucumber(food)) return { small: 52, medium: 96, large: 154 };
  if (isTomato(food)) return { small: 114, medium: 172, large: 230 };
  if (isCarrot(food)) return { small: 68, medium: 136, large: 261 };
  if (isZucchini(food)) return { small: 108, medium: 218, large: 290 };
  if (isRadish(food)) return { small: 18, medium: 32, large: 49 };
  if (isBeet(food)) return { small: 120, medium: 120, large: 120 };
  return null;
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
      ...(isMilkOrDrink(food) || isLiquidOilOrSauce(food)
        ? [
            { value: "ml" as const, label: unitLabels.ml },
            { value: "cup" as const, label: unitLabels.cup },
          ]
        : []),
    ];
  } else if (isOilOrSauce(food)) {
    options = [
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
      ...(isLiquidOilOrSauce(food)
        ? [
            { value: "ml" as const, label: unitLabels.ml },
            { value: "cup" as const, label: unitLabels.cup },
          ]
        : []),
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
    ];
  } else if (isMilkOrDrink(food)) {
    options = [
      { value: "ml", label: unitLabels.ml },
      { value: "cup", label: unitLabels.cup },
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
      { value: "serving", label: unitLabels.serving },
    ];
  } else if (vegetableUnitWeights(food)) {
    options = [
      { value: "medium", label: unitLabels.medium },
      { value: "small", label: unitLabels.small },
      { value: "large", label: unitLabels.large },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (servingIsSlice(food.servingSize)) {
    options = [
      { value: "slice", label: unitLabels.slice },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (servingIsUnit(food.servingSize) && isDenseDairyOrSpread(food)) {
    options = [
      { value: "unit", label: unitLabels.unit },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
      { value: "serving", label: unitLabels.serving },
    ];
  } else if (servingIsUnit(food.servingSize)) {
    options = [
      { value: "unit", label: unitLabels.unit },
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
    ];
  } else if (isDenseDairyOrSpread(food)) {
    options = [
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
      { value: "tbsp", label: unitLabels.tbsp },
      { value: "tsp", label: unitLabels.tsp },
      { value: "serving", label: unitLabels.serving },
    ];
  } else if (cupGramsForFood(food) !== null) {
    options = [
      ...(canConvertToGrams(food) ? [{ value: "g" as const, label: unitLabels.g }] : []),
      { value: "cup", label: unitLabels.cup },
      { value: "serving", label: unitLabels.serving },
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
  else if (vegetableUnitWeights(food)) preferred = { quantity: 1, unit: "medium" };
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
  if (unit === "cup") return cupGramsForFood(food) ?? 240;
  if (unit === "slice" && isBread(food)) return gramsPerBreadSlice(food);
  if (unit === "unit" && isPita(food)) return referenceServingGrams(food);
  if (unit === "unit" && isCherryTomato(food)) return 15;
  const vegetableWeights = vegetableUnitWeights(food);
  if (vegetableWeights && (unit === "small" || unit === "medium" || unit === "large")) {
    return vegetableWeights[unit];
  }
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
  if (unit === "ml") {
    if (servingMl) return 1 / servingMl;
    if (spoonUnit === "tbsp") return 1 / 15;
    if (spoonUnit === "tsp") return 1 / 5;
  }
  if (unit === "cup") {
    if (servingMl) return 240 / servingMl;
    if (food.servingSize.match(/כוס(?:ות)?|cups?/i)) return 1;
    if (spoonUnit === "tbsp") return 16;
    if (spoonUnit === "tsp") return 48;
    const cupGrams = cupGramsForFood(food);
    if (cupGrams && servingGrams) return cupGrams / servingGrams;
    return null;
  }
  if (unit === "tbsp" && spoonUnit === "tbsp") return 1;
  if (unit === "tsp" && spoonUnit === "tsp") return 1;
  if (unit === "tbsp" && spoonUnit === "tsp") return 3;
  if (unit === "tsp" && spoonUnit === "tbsp") return 1 / 3;
  if (unit === "tbsp" && isDenseDairyOrSpread(food) && servingGrams) {
    return 15 / servingGrams;
  }
  if (unit === "tsp" && isDenseDairyOrSpread(food) && servingGrams) {
    return 5 / servingGrams;
  }
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

export function foodPortionFromServingQuantity(food: FoodItem, servingQuantity: number) {
  const normalizedServingQuantity = Math.max(0.1, Number(servingQuantity) || 1);
  const options = foodQuantityOptions(food);
  const spoonUnit = servingSpoonUnit(food.servingSize);
  const servingGrams = referenceServingGrams(food);
  const servingMl = millilitersFromServing(food.servingSize);
  let preferredUnit: FoodQuantityUnit | undefined;

  if (spoonUnit) {
    preferredUnit = spoonUnit;
  } else if (isDenseDairyOrSpread(food) && servingGrams) {
    const grams = servingGrams * normalizedServingQuantity;
    preferredUnit = grams < 15 ? "tsp" : "tbsp";
  } else if (isMilkOrDrink(food) || isLiquidOilOrSauce(food)) {
    const milliliters = servingMl ? servingMl * normalizedServingQuantity : null;
    preferredUnit = milliliters !== null && milliliters >= 180 ? "cup" : "ml";
  } else if (servingIsSlice(food.servingSize)) {
    preferredUnit = "slice";
  } else if (servingIsUnit(food.servingSize)) {
    preferredUnit = "unit";
  } else if (cupGramsForFood(food)) {
    preferredUnit = "cup";
  } else if (servingGrams) {
    preferredUnit = "g";
  } else {
    preferredUnit = "serving";
  }

  const unit = options.some((option) => option.value === preferredUnit)
    ? preferredUnit
    : options[0]?.value ?? "serving";
  const multiplier = servingMultiplier(food, unit) ?? 1;
  const quantity = Math.max(0.1, normalizedServingQuantity / multiplier);
  return {
    quantity: Math.round(quantity * 10) / 10,
    unit,
    unitLabel: unitLabels[unit],
  };
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
