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

/** Classifies food values without claiming an external nutrition-data source. */
export function nutritionSourceFor(
  food: Pick<FoodItem, "id" | "nutritionReview">,
): NutritionSource {
  if (food.nutritionReview?.status === "reviewed") {
    const sourceNames = food.nutritionReview.sources.map((source) => source.name).join(" · ");
    const confidence = food.nutritionReview.confidence
      ? `רמת ביטחון: ${food.nutritionReview.confidence === "high" ? "גבוהה" : food.nutritionReview.confidence === "medium" ? "בינונית" : "נמוכה"}.`
      : "";
    return {
      label: "נבדק מול מקורות חיצוניים",
      detail: `${sourceNames || "מקורות מתועדים"}${confidence ? ` ${confidence}` : ""}`,
      verified: true,
    };
  }

  if (food.id.startsWith("f-israel-")) {
    return {
      label: "טרם אומת מול מקור חיצוני",
      detail: "זהו ערך קיים מהקטלוג המקומי. הוא נשמר ללא שינוי עד לבדיקה מול מקור ישראלי או יצרן.",
      verified: false,
    };
  }

  return {
    label: "טרם אומת מול מקור חיצוני",
    detail: "הערך הקיים נשמר ללא שינוי עד שתושלם בדיקה מול מקור אמין.",
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

  return {
    total: foods.length,
    verified: 0,
    requiresLabelVerification: foods.length,
    invalid: invalid.length,
    duplicateIds: foods.length - new Set(foods.map((food) => food.id)).size,
  };
}
