import type { FoodItem, MealFood } from "./gym-types";

type NutritionRecord = Pick<
  FoodItem,
  "id" | "name" | "servingSize" | "calories" | "protein" | "carbs" | "fat" | "fiber"
>;

export type NutritionSource = {
  label: string;
  detail: string;
  verified: boolean;
};

export type NutritionValidationIssue = {
  field: string;
  message: string;
};

const REQUIRED_MACROS = [
  ["calories", "קלוריות"],
  ["protein", "חלבון"],
  ["carbs", "פחמימות"],
  ["fat", "שומן"],
] as const;

/**
 * Classifies food values without overstating their provenance. USDA expansion
 * records can be traced to a specific FDC entry; legacy and user-created rows
 * remain usable but are clearly distinguished from that verified source.
 */
export function nutritionSourceFor(food: Pick<FoodItem, "id">): NutritionSource {
  if (food.id.startsWith("f-usda-sr-")) {
    return {
      label: "מקור מאומת: USDA",
      detail: "USDA FoodData Central · הערכים למאה גרם",
      verified: true,
    };
  }

  if (food.id.startsWith("f-israel-")) {
    return {
      label: "קטלוג מקומי",
      detail: "ערכי מנת הייחוס נשמרו מהקטלוג הקיים; יש לאמת מול תווית המוצר העדכנית.",
      verified: false,
    };
  }

  return {
    label: "ערך שהוזן ידנית",
    detail: "בדקי את הנתונים מול תווית המוצר לפני שימוש קבוע ביומן.",
    verified: false,
  };
}

export function nutritionValidationIssues(record: NutritionRecord): NutritionValidationIssue[] {
  const issues: NutritionValidationIssue[] = [];

  if (!record.name.trim()) issues.push({ field: "name", message: "יש להזין שם מאכל." });
  if (!record.servingSize.trim()) {
    issues.push({ field: "servingSize", message: "יש להזין גודל מנת ייחוס ברור." });
  }

  for (const [field, label] of REQUIRED_MACROS) {
    const value = record[field];
    if (!Number.isFinite(value) || value < 0) {
      issues.push({ field, message: `${label} חייבים להיות מספר חיובי או אפס.` });
    }
  }

  if (record.fiber !== undefined && (!Number.isFinite(record.fiber) || record.fiber < 0)) {
    issues.push({ field: "fiber", message: "סיבים תזונתיים חייבים להיות מספר חיובי או אפס." });
  }

  return issues;
}

export function assertValidFoodNutrition(record: NutritionRecord): void {
  const issues = nutritionValidationIssues(record);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join(" "));
  }
}

export function assertValidMealFood(record: MealFood): void {
  assertValidFoodNutrition(record);
  if (!Number.isFinite(record.quantity) || record.quantity <= 0) {
    throw new Error("כמות המאכל חייבת להיות גדולה מאפס.");
  }
}

export function foodLibraryAudit(foods: FoodItem[]) {
  const invalid = foods.filter((food) => nutritionValidationIssues(food).length > 0);
  const verified = foods.filter((food) => nutritionSourceFor(food).verified);

  return {
    total: foods.length,
    verified: verified.length,
    requiresLabelVerification: foods.length - verified.length,
    invalid: invalid.length,
    duplicateIds: foods.length - new Set(foods.map((food) => food.id)).size,
  };
}
