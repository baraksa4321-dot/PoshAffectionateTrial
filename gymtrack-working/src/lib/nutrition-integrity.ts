import type { FoodItem, MealFood } from "./gym-types";

type NutritionRecord = Pick<
  FoodItem,
  "id" | "name" | "servingSize" | "calories" | "protein" | "carbs" | "fat" | "fiber"
>;

export type NutritionSource = {
  label: string;
  detail: string;
  verified: boolean;
  status: "estimated" | "label" | "verified";
  checkedAt?: string | undefined;
  confidence?: "low" | "medium" | "high" | undefined;
  needsReview: boolean;
};

export type NutritionValidationIssue = {
  field: string;
  message: string;
};

function hasExactProductReview(food: Pick<FoodItem, "nutritionReview">): boolean {
  return (
    food.nutritionReview?.status === "reviewed" &&
    food.nutritionReview.sources.some(
      (source) => source.match === "exact-product" && Boolean(source.url?.trim()),
    )
  );
}

function confidenceLabel(confidence?: "low" | "medium" | "high") {
  if (confidence === "high") return "גבוהה";
  if (confidence === "medium") return "בינונית";
  if (confidence === "low") return "נמוכה";
  return undefined;
}

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
  const review = food.nutritionReview;
  if (hasExactProductReview(food) && review) {
    const sources = review.sources;
    const sourceNames = sources.map((source) => source.name).join(" · ");
    const confidence = review.confidence
      ? `רמת ביטחון: ${review.confidence === "high" ? "גבוהה" : review.confidence === "medium" ? "בינונית" : "נמוכה"}.`
      : "";
    return {
      label: sources.some((source) => source.kind === "manufacturer")
        ? "נבדק מול מקור יצרן"
        : "נבדק מול דף מוצר מתועד",
      detail: `${sourceNames || "מקורות מתועדים"}${confidence ? ` ${confidence}` : ""}`,
      verified: true,
      status: "verified",
      checkedAt: review.checkedAt,
      confidence: review.confidence,
      needsReview: false,
    };
  }

  if (
    review?.origin === "label" ||
    review?.sources.some((source) => source.kind === "label-photo")
  ) {
    const confidence = confidenceLabel(review.confidence);
    return {
      label: "נקלט מתווית — ממתין לאימות",
      detail: `ערכים שהוזנו מצילום תווית${review.checkedAt ? ` · נבדק בתאריך ${review.checkedAt}` : ""}${
        confidence ? ` · ביטחון ${confidence}` : ""
      }. יש להשוות לאריזה לפני שימוש מדויק.`,
      verified: false,
      status: "label",
      checkedAt: review.checkedAt,
      confidence: review.confidence,
      needsReview: true,
    };
  }

  if (review?.sources.some((source) => source.kind === "open-food-facts")) {
    const confidence = confidenceLabel(review.confidence);
    return {
      label: "ברקוד — מקור חיצוני לא מאומת",
      detail: `נמצא דרך Open Food Facts${review.checkedAt ? ` · נבדק בתאריך ${review.checkedAt}` : ""}${
        confidence ? ` · ביטחון ${confidence}` : ""
      }. יש להשוות לערכי התווית המקומית.`,
      verified: false,
      status: "estimated",
      checkedAt: review.checkedAt,
      confidence: review.confidence,
      needsReview: true,
    };
  }

  if (food.id.startsWith("f-israel-")) {
    return {
      label: "טרם אומת מול מקור חיצוני",
      detail: "זהו ערך קיים מהקטלוג המקומי. הוא נשמר ללא שינוי עד לבדיקה מול מקור ישראלי או יצרן.",
      verified: false,
      status: "estimated",
      checkedAt: review?.checkedAt,
      confidence: review?.confidence,
      needsReview: true,
    };
  }

  if (food.id.startsWith("f-protein-il-")) {
    return {
      label: "קטלוג ישראלי — נדרש אימות תווית",
      detail: "הערך נשמר כ־seed לשימוש offline; בדקי את תווית המוצר לפני שימוש מדויק.",
      verified: false,
      status: "estimated",
      checkedAt: review?.checkedAt,
      confidence: review?.confidence,
      needsReview: true,
    };
  }

  if (food.id.startsWith("f-protein-")) {
    return {
      label: "מקור חיצוני — טרם אומת",
      detail: "המוצר הגיע ממקור ברקודים חיצוני. יש לבדוק את תווית היצרן לפני שימוש מדויק.",
      verified: false,
      status: "estimated",
      checkedAt: review?.checkedAt,
      confidence: review?.confidence,
      needsReview: true,
    };
  }

  return {
    label: "טרם אומת מול מקור חיצוני",
    detail: "הערך הקיים נשמר ללא שינוי עד שתושלם בדיקה מול מקור אמין.",
    verified: false,
    status: "estimated",
    checkedAt: review?.checkedAt,
    confidence: review?.confidence,
    needsReview: true,
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
  const verified = foods.filter((food) => hasExactProductReview(food)).length;

  return {
    total: foods.length,
    verified,
    requiresLabelVerification: foods.length - verified,
    invalid: invalid.length,
    duplicateIds: foods.length - new Set(foods.map((food) => food.id)).size,
  };
}
