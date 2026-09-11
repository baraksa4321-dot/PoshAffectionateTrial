import type { Meal, MealFood, NutritionDay, UserProfile } from "./gym-types";

export type PlannedMealOptionGroup = {
  id: string;
  meals: Meal[];
};

/**
 * Older plans do not have an option group. Treat each such meal as its own
 * group so the new choice UI and shopping list remain backward compatible.
 */
export function plannedMealOptionGroupId(meal: Meal): string {
  return meal.mealOptionGroupId ?? meal.id;
}

export function groupPlannedMeals(plannedMeals: Meal[] | undefined): PlannedMealOptionGroup[] {
  const groups = new Map<string, PlannedMealOptionGroup>();
  const meals = plannedMeals ?? [];
  const explicitGroupIds = new Set(
    meals.flatMap((meal) => (meal.mealOptionGroupId ? [meal.mealOptionGroupId] : [])),
  );
  for (const [index, meal] of meals.entries()) {
    // A legacy meal has no explicit option group. Include its position in the
    // grouping key so repeated legacy fixtures/records remain standalone.
    const id =
      meal.mealOptionGroupId ??
      (explicitGroupIds.has(meal.id) ? meal.id : `legacy-${index}-${meal.id}`);
    const group = groups.get(id);
    if (group) {
      group.meals.push(meal);
    } else {
      groups.set(id, { id, meals: [meal] });
    }
  }
  return Array.from(groups.values());
}

export function caloriesVisible(profile?: Pick<UserProfile, "showCalories"> | null): boolean {
  return profile?.showCalories !== false;
}

export function normalizeFixedPlannedMenu(
  plannedMeals: Meal[] | undefined,
  nutritionDays: NutritionDay[],
): { plannedMeals: Meal[]; nutritionDays: NutritionDay[] } {
  const legacyMenu =
    nutritionDays
      .filter((day) => Array.isArray(day.plannedMeals) && day.plannedMeals.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.plannedMeals ?? [];
  return {
    plannedMeals:
      Array.isArray(plannedMeals) && plannedMeals.length > 0 ? plannedMeals : legacyMenu,
    nutritionDays: nutritionDays.map(({ plannedMeals: _legacyMenu, ...day }) => day),
  };
}

export function calendarWeekDates(date: string): string[] {
  const start = new Date(`${date}T00:00:00`);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    return `${current.getFullYear()}-${month}-${day}`;
  });
}

export type ShoppingListPeriod = "daily" | "weekly" | "monthly";

export const SHOPPING_PERIOD_DAYS: Record<ShoppingListPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export type ShoppingListItem = {
  key: string;
  name: string;
  requiredQuantity: number;
  requiredUnit: string;
  purchaseQuantity: number;
  purchaseUnit: string;
  purchaseContentsQuantity?: number;
  purchaseContentsUnit?: string;
  purchasePackageBreakdown?: string;
  purchasePackageDescription?: string;
};

type ShoppingAmount = {
  value: number;
  unitKey: string;
  unitLabel: string;
  packageSizes?: number[];
  packageUnit?: string;
};

function normalizedShoppingText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["'׳״`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function numericMeasure(servingSize: string, pattern: RegExp) {
  const match = servingSize.match(pattern);
  if (!match?.[1]) return null;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function explicitPackageUnit(servingSize: string) {
  if (/קופס|פחית|can/i.test(servingSize)) return "קופסאות";
  if (/בקבוק|bottle/i.test(servingSize)) return "בקבוקים";
  if (/גביע|cup/i.test(servingSize)) return "גביעים";
  if (/שקית|bag/i.test(servingSize)) return "שקיות";
  if (/חבילה|אריזה|מארז|pack/i.test(servingSize)) return "חבילות";
  if (/קרטון|carton/i.test(servingSize)) return "קרטונים";
  return undefined;
}

function amountForPlannedFood(food: MealFood): ShoppingAmount {
  const name = normalizedShoppingText(food.name);
  const serving = normalizedShoppingText(food.servingSize);
  const quantity = Math.max(0, Number(food.quantity) || 0);

  if (
    !/חלבון ביצה|egg white/i.test(name) &&
    /(ביצ(?:ה|ים)?|egg(?:s)?)/i.test(`${name} ${serving}`)
  ) {
    const eggCount = numericMeasure(serving, /(\d+(?:[.,]\d+)?)\s*(?:ביצ(?:ה|ים)?|egg(?:s)?)/i);
    return {
      value: quantity * (eggCount ?? 1),
      unitKey: "egg",
      unitLabel: "ביצים",
      packageSizes: [12],
      packageUnit: "קרטונים",
    };
  }

  const isYellowCheese = /גבינה צהובה|yellow cheese/i.test(name);
  if (isYellowCheese) {
    const gramsPerSlice = numericMeasure(serving, /(\d+(?:[.,]\d+)?)\s*(?:גרם|g)\b/i);
    return {
      value: quantity * (gramsPerSlice ?? (/פרוס/.test(serving) ? 20 : 1)),
      unitKey: "g",
      unitLabel: "גרם",
      packageSizes: [200, 400],
      packageUnit: "חבילות",
    };
  }

  const grams = numericMeasure(serving, /(\d+(?:[.,]\d+)?)\s*(?:גרם|g)\b/i);
  if (grams !== null) {
    const packageUnit = explicitPackageUnit(serving);
    return {
      value: quantity * grams,
      unitKey: "g",
      unitLabel: "גרם",
      ...(packageUnit ? { packageSizes: [grams], packageUnit } : {}),
    };
  }
  if (/גרם|g/i.test(serving)) {
    return { value: quantity, unitKey: "g", unitLabel: "גרם" };
  }

  const milliliters = numericMeasure(serving, /(\d+(?:[.,]\d+)?)\s*(?:מ["״]?ל|ml)\b/i);
  if (milliliters !== null) {
    const packageUnit = explicitPackageUnit(serving);
    return {
      value: quantity * milliliters,
      unitKey: "ml",
      unitLabel: "מ״ל",
      ...(packageUnit ? { packageSizes: [milliliters], packageUnit } : {}),
    };
  }
  if (/מ["״]?ל|ml/i.test(serving)) {
    return { value: quantity, unitKey: "ml", unitLabel: "מ״ל" };
  }

  if (/פרוס/.test(serving)) {
    if (/לחם|טוסט|bread|toast/i.test(name)) {
      return {
        value: quantity,
        unitKey: "bread-slice",
        unitLabel: "פרוסות",
        packageSizes: [16, 20],
        packageUnit: "שקיות",
      };
    }
    if (/טורט|tortilla|wrap/i.test(name)) {
      return {
        value: quantity,
        unitKey: "tortilla",
        unitLabel: "טורטיות",
        packageSizes: [8, 10],
        packageUnit: "חבילות",
      };
    }
    return { value: quantity, unitKey: "slice", unitLabel: "פרוסות" };
  }
  if (/פית|pita/i.test(name)) {
    return {
      value: quantity,
      unitKey: "pita",
      unitLabel: "פיתות",
      packageSizes: [5, 10],
      packageUnit: "חבילות",
    };
  }
  if (/טורט|tortilla|wrap/i.test(name)) {
    return {
      value: quantity,
      unitKey: "tortilla",
      unitLabel: "טורטיות",
      packageSizes: [8, 10],
      packageUnit: "חבילות",
    };
  }
  if (
    /שמן|רוטב|מיונז|קטשופ|חרדל|סויה|דבש|סילאן|oil|sauce|mayo|ketchup|mustard|honey/i.test(name) &&
    /כפות?|כפיות?|tbsp|tsp/.test(serving)
  ) {
    const spoonSize = /כפית|tsp/.test(serving) ? 5 : 15;
    return { value: quantity * spoonSize, unitKey: "ml", unitLabel: "מ״ל" };
  }
  if (
    /טחינה|חמאת בוטנים|ממרח|tahini|peanut butter|spread/i.test(name) &&
    /כפות?|כפיות?|tbsp|tsp/.test(serving)
  ) {
    const spoonSize = /כפית|tsp/.test(serving) ? 5 : 15;
    return { value: quantity * spoonSize, unitKey: "g", unitLabel: "גרם" };
  }
  if (/סוכר|sugar/i.test(name) && /כפיות?|tsp/.test(serving)) {
    return { value: quantity * 4, unitKey: "g", unitLabel: "גרם" };
  }
  if (/חטיף חלבון|protein bar/i.test(name)) {
    return {
      value: quantity,
      unitKey: "protein-bar",
      unitLabel: "חטיפים",
      packageSizes: [6, 12],
      packageUnit: "מארזים",
    };
  }
  if (/כפות?|tbsp/.test(serving)) {
    return { value: quantity, unitKey: "tbsp", unitLabel: "כפות" };
  }
  if (/כפיות?|tsp/.test(serving)) {
    return { value: quantity, unitKey: "tsp", unitLabel: "כפיות" };
  }
  if (/כוסות?|cups?/.test(serving)) {
    return { value: quantity, unitKey: "cup", unitLabel: "כוסות" };
  }
  if (/יחיד|unit|קופסה|גביע|בקבוק|אריזה|חבילה|שקית/.test(serving)) {
    const packageUnit = explicitPackageUnit(serving);
    return {
      value: quantity,
      unitKey: "unit",
      unitLabel: "יחידות",
      ...(packageUnit ? { packageSizes: [1], packageUnit } : {}),
    };
  }

  return { value: quantity, unitKey: "serving", unitLabel: "מנות" };
}

function packageRuleFor(
  food: MealFood,
  amount: ShoppingAmount,
): Pick<ShoppingAmount, "packageSizes" | "packageUnit"> {
  const name = normalizedShoppingText(food.name);

  // These are common supermarket package profiles. The calculator still
  // retains the exact menu need and only rounds the purchase side.
  if (amount.unitKey === "egg") return { packageSizes: [12], packageUnit: "קרטונים" };
  if (/גבינה צהובה|yellow cheese/i.test(name) && amount.unitKey === "g") {
    return { packageSizes: [200, 400], packageUnit: "חבילות" };
  }
  if (
    amount.unitKey === "g" &&
    /גמבה|פלפל אדום|פלפל צהוב|פלפל ירוק|bell pepper/i.test(name)
  ) {
    return { packageSizes: [150], packageUnit: "פלפלים" };
  }
  if (amount.unitKey === "pita") return { packageSizes: [5, 10], packageUnit: "חבילות" };
  if (amount.unitKey === "bread-slice") return { packageSizes: [16, 20], packageUnit: "שקיות" };
  if (amount.unitKey === "tortilla") return { packageSizes: [8, 10], packageUnit: "חבילות" };
  if (amount.packageSizes && amount.packageUnit) {
    return { packageSizes: amount.packageSizes, packageUnit: amount.packageUnit };
  }

  if (amount.unitKey === "g" && /יוגורט|yogurt|יוגור|סקיר|skyr/.test(name)) {
    return { packageSizes: [200], packageUnit: "גביעים" };
  }
  if (amount.unitKey === "g" && /טונה|תירס|שעועית|חומוס|שימורים|canned|corn|beans/.test(name)) {
    return { packageSizes: [400], packageUnit: "קופסאות" };
  }
  if (
    amount.unitKey === "g" &&
    /קוטג|גבינה לבנה|גבינת שמנת|שמנת חמוצה|cottage|cream cheese|sour cream/.test(name)
  ) {
    return { packageSizes: [200, 250], packageUnit: "גביעים" };
  }
  if (
    amount.unitKey === "g" &&
    /עוף|חזה|פרגית|הודו|בשר|סטייק|קציצה|דג|סלמון|טונה|שניצל|chicken|turkey|beef|steak|fish|salmon|tuna/.test(
      name,
    )
  ) {
    return { packageSizes: [500], packageUnit: "מגשים" };
  }
  if (amount.unitKey === "g" && /קפוא|קפואים|ירקות קפואים|frozen/.test(name)) {
    return { packageSizes: [800], packageUnit: "שקיות" };
  }
  if (
    amount.unitKey === "g" &&
    /אורז|פסטה|קינואה|שיבולת שועל|קמח|קוסקוס|בורגול|rice|pasta|quinoa|oat|flour|couscous|bulgur/.test(
      name,
    )
  ) {
    return { packageSizes: [500, 1000], packageUnit: "שקיות" };
  }
  if (amount.unitKey === "g" && /אבקת חלבון|protein powder|whey/.test(name)) {
    return { packageSizes: [500, 1000], packageUnit: "שקיות" };
  }
  if (amount.unitKey === "g" && /טחינה|חמאת בוטנים|ממרח|tahini|peanut butter|spread/.test(name)) {
    return { packageSizes: [350, 500], packageUnit: "צנצנות" };
  }
  if (amount.unitKey === "protein-bar") return { packageSizes: [6, 12], packageUnit: "מארזים" };
  if (amount.unitKey === "unit" && /חטיף|bar/.test(name)) {
    return { packageSizes: [6, 12], packageUnit: "מארזים" };
  }
  if (amount.unitKey === "unit" && /יוגורט|מעדן|גביע/.test(name)) {
    return { packageSizes: [4], packageUnit: "מארזים" };
  }
  if (amount.unitKey === "g" && /חלבון ביצה|egg white/.test(name)) {
    return { packageSizes: [500], packageUnit: "בקבוקים" };
  }
  if (amount.unitKey === "ml" && /חלב|milk/.test(name)) {
    return { packageSizes: [1000], packageUnit: "קרטונים" };
  }
  if (amount.unitKey === "ml" && /שמן|רוטב|טחינה|מיונז|ממרח|דבש|סילאן|oil|sauce|honey/.test(name)) {
    return { packageSizes: [500, 750, 1000], packageUnit: "בקבוקים" };
  }
  if (amount.unitKey === "ml") return { packageSizes: [1000], packageUnit: "בקבוקים" };
  if (amount.unitKey === "g") return { packageSizes: [500, 1000], packageUnit: "אריזות" };

  return {};
}

function roundShoppingQuantity(value: number) {
  return Math.round(value * 100) / 100;
}

function packagePlanFor(requiredQuantity: number, packageSizes: number[]) {
  const sizes = [...new Set(packageSizes.filter((size) => size > 0))].sort((a, b) => b - a);
  if (sizes.length === 0) return null;

  let best: { counts: number[]; total: number; packageCount: number; overage: number } | undefined;
  const maxPackages = Math.ceil(requiredQuantity / Math.min(...sizes)) + 1;

  const visit = (index: number, counts: number[], total: number, packageCount: number) => {
    if (index === sizes.length) {
      if (total < requiredQuantity || packageCount === 0) return;
      const candidate = {
        counts,
        total,
        packageCount,
        overage: total - requiredQuantity,
      };
      if (
        !best ||
        candidate.overage < best.overage ||
        (candidate.overage === best.overage && candidate.packageCount < best.packageCount)
      ) {
        best = candidate;
      }
      return;
    }

    for (let count = 0; count <= maxPackages - packageCount; count += 1) {
      visit(index + 1, [...counts, count], total + sizes[index]! * count, packageCount + count);
    }
  };

  visit(0, [], 0, 0);
  if (!best) return null;
  return {
    packageCount: best.packageCount,
    total: best.total,
    breakdown: sizes
      .map((size, index) => (best!.counts[index] ? `${best!.counts[index]}×${size}` : ""))
      .filter(Boolean)
      .join(" + "),
    packages: sizes
      .map((size, index) => ({ size, count: best!.counts[index] ?? 0 }))
      .filter(({ count }) => count > 0),
  };
}

function singularPackageUnit(unit: string) {
  const singular: Record<string, string> = {
    אריזות: "אריזה",
    בקבוקים: "בקבוק",
    גביעים: "גביע",
    חבילות: "חבילה",
    טורים: "טור",
    מארזים: "מארז",
    מגשים: "מגש",
    קופסאות: "קופסה",
    קרטונים: "קרטון",
    שקיות: "שקית",
    צנצנות: "צנצנת",
    פלפלים: "פלפל",
  };
  return singular[unit] ?? unit;
}

function packageDescription(
  plan: {
    packageCount: number;
    total: number;
    breakdown: string;
    packages: Array<{ size: number; count: number }>;
  },
  requiredUnit: string,
  packageUnit: string,
) {
  return plan.packages
    .map(({ size, count }) =>
      `${count} ${count === 1 ? singularPackageUnit(packageUnit) : packageUnit} של ${size} ${requiredUnit}`,
    )
    .join(" + ") || `${plan.packageCount} ${packageUnit}`;
}

export function buildShoppingList(
  plannedMeals: Meal[] | undefined,
  period: ShoppingListPeriod = "daily",
): ShoppingListItem[] {
  const days = SHOPPING_PERIOD_DAYS[period];
  const items = new Map<
    string,
    {
      name: string;
      unitKey: string;
      requiredUnit: string;
      requiredQuantity: number;
      packageSizes?: number[];
      packageUnit?: string;
    }
  >();

  for (const group of groupPlannedMeals(plannedMeals)) {
    const meal = group.meals[0];
    if (!meal) continue;
    for (const food of meal.foods) {
      const amount = amountForPlannedFood(food);
      if (amount.value <= 0) continue;
      const key = `${normalizedShoppingText(food.name)}::${amount.unitKey}`;
      const existing = items.get(key);
      if (existing) {
        existing.requiredQuantity += amount.value * days;
        continue;
      }
      const packageRule = packageRuleFor(food, amount);
      const packageSizes = packageRule.packageSizes ?? amount.packageSizes;
      const packageUnit = packageRule.packageUnit ?? amount.packageUnit;
      items.set(key, {
        name: food.name,
        unitKey: amount.unitKey,
        requiredUnit: amount.unitLabel,
        requiredQuantity: amount.value * days,
        ...(packageSizes ? { packageSizes } : {}),
        ...(packageUnit ? { packageUnit } : {}),
      });
    }
  }

  return Array.from(items.entries())
    .map(([key, item]) => {
      const requiredQuantity = roundShoppingQuantity(item.requiredQuantity);
      const packagePlan = item.packageSizes
        ? packagePlanFor(requiredQuantity, item.packageSizes)
        : null;
      return {
        key,
        name: item.name,
        requiredQuantity,
        requiredUnit: item.requiredUnit,
        purchaseQuantity: packagePlan?.packageCount ?? requiredQuantity,
        purchaseUnit: packagePlan ? item.packageUnit! : item.requiredUnit,
        ...(packagePlan === null
          ? {}
          : {
              purchaseContentsQuantity: packagePlan.total,
              purchaseContentsUnit: item.requiredUnit,
              purchasePackageBreakdown: packagePlan.breakdown,
              purchasePackageDescription: packageDescription(
                packagePlan,
                item.requiredUnit,
                item.packageUnit!,
              ),
            }),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
}
