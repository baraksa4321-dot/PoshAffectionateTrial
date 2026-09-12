import { describe, expect, test } from "bun:test";
import {
  buildShoppingList,
  caloriesVisible,
  calendarWeekDates,
  groupPlannedMeals,
  normalizeFixedPlannedMenu,
} from "./nutrition-planning";
import type { Meal, MealFood, NutritionDay } from "./gym-types";

const meal = (id: string): Meal => ({ id, name: id, foods: [] });
const nutritionDay = (date: string, plannedMeals?: Meal[]): NutritionDay => ({
  date,
  meals: [],
  ...(plannedMeals ? { plannedMeals } : {}),
});
const food = (name: string, servingSize: string, quantity: number, foodId = name): MealFood => ({
  id: `${name}-${servingSize}`,
  foodId,
  name,
  servingSize,
  quantity,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});
const planned = (...foods: MealFood[]): Meal => ({ id: "meal", name: "ארוחה", foods });

describe("fixed nutrition menu and calorie visibility", () => {
  test("groups only explicitly configured meal options and keeps legacy meals standalone", () => {
    const main = { ...meal("breakfast"), mealOptionGroupId: "breakfast-options" };
    const alternate = { ...meal("breakfast-alt"), mealOptionGroupId: "breakfast-options" };
    const legacy = meal("legacy");

    expect(groupPlannedMeals([main, alternate, legacy])).toEqual([
      { id: "breakfast-options", meals: [main, alternate] },
      { id: "legacy-2-legacy", meals: [legacy] },
    ]);
  });

  test("prefers the explicit fixed menu and removes dated menu copies", () => {
    const result = normalizeFixedPlannedMenu(
      [meal("fixed")],
      [nutritionDay("2026-08-25", [meal("legacy")])],
    );

    expect(result.plannedMeals.map(({ id }) => id)).toEqual(["fixed"]);
    expect(result.nutritionDays[0]?.plannedMeals).toBeUndefined();
  });

  test("migrates the newest non-empty dated menu when no fixed menu exists", () => {
    const result = normalizeFixedPlannedMenu(undefined, [
      nutritionDay("2026-08-20", [meal("older")]),
      nutritionDay("2026-08-25", [meal("newer")]),
    ]);

    expect(result.plannedMeals.map(({ id }) => id)).toEqual(["newer"]);
    expect(result.nutritionDays.every((day) => day.plannedMeals === undefined)).toBe(true);
  });

  test("defaults visibility on and respects an explicit hidden setting", () => {
    expect(caloriesVisible(undefined)).toBe(true);
    expect(caloriesVisible({ showCalories: true })).toBe(true);
    expect(caloriesVisible({ showCalories: false })).toBe(false);
  });

  test("returns the current Sunday-to-Saturday calendar week", () => {
    expect(calendarWeekDates("2026-08-26")).toEqual([
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
    ]);
  });

  test("builds egg cartons for each requested period while preserving the exact need", () => {
    const meals = [planned(food("ביצים", "יחידה למנה", 3))];

    expect(buildShoppingList(meals, "daily")).toMatchObject([
      {
        requiredQuantity: 3,
        requiredUnit: "ביצים",
        purchaseQuantity: 1,
        purchaseUnit: "קרטונים",
        purchaseContentsQuantity: 12,
      purchasePackageDescription: "1 קרטון של 12 ביצים",
      },
    ]);
    expect(buildShoppingList(meals, "weekly")).toMatchObject([
      {
        requiredQuantity: 21,
        purchaseQuantity: 2,
        purchaseContentsQuantity: 24,
      purchasePackageDescription: "2 קרטונים של 12 ביצים",
      },
    ]);
    expect(buildShoppingList(meals, "monthly")).toMatchObject([
      {
        requiredQuantity: 90,
        purchaseQuantity: 8,
        purchaseContentsQuantity: 96,
      },
    ]);
  });

  test("converts sliced yellow cheese to practical 200g/400g packages", () => {
    const [item] = buildShoppingList([planned(food("גבינה צהובה", "פרוסה למנה", 25))]);
    expect(item).toMatchObject({
      requiredQuantity: 500,
      requiredUnit: "גרם",
      purchaseQuantity: 2,
      purchaseUnit: "חבילות",
      purchaseContentsQuantity: 600,
      purchasePackageBreakdown: "1×400 + 1×200",
      purchasePackageDescription: "1 חבילה של 400 גרם + 1 חבילה של 200 גרם",
    });
  });

  test("converts pita portions to supermarket packs and aggregates repeated menu foods", () => {
    const [item] = buildShoppingList(
      [
        planned(food("פיתה", "יחידה למנה", 2, "pita")),
        planned(food("פיתה", "יחידה למנה", 1, "pita")),
      ],
      "weekly",
    );
    expect(item).toMatchObject({
      requiredQuantity: 21,
      requiredUnit: "פיתות",
      purchaseQuantity: 3,
      purchaseUnit: "חבילות",
      purchaseContentsQuantity: 25,
      purchasePackageBreakdown: "2×10 + 1×5",
      purchasePackageDescription: "2 חבילות של 10 פיתות + 1 חבילה של 5 פיתות",
    });
  });

  test("uses category package profiles for all common quantity types", () => {
    const items = buildShoppingList([
      planned(
        food("יוגורט", "גרם למנה", 300),
        food("חזה עוף", "גרם למנה", 600),
        food("אורז", "גרם למנה", 750),
        food("חלב", "מ״ל למנה", 750),
        food("לחם", "פרוסה למנה", 18),
        food("טונה", "גרם למנה", 300),
        food("ירקות קפואים", "גרם למנה", 700),
      ),
    ]);

    const purchaseUnits = new Map(items.map((item) => [item.name, item.purchaseUnit]));
    expect(purchaseUnits.get("יוגורט")).toBe("גביעים");
    expect(purchaseUnits.get("חזה עוף")).toBe("מגשים");
    expect(purchaseUnits.get("אורז")).toBe("שקיות");
    expect(purchaseUnits.get("חלב")).toBe("קרטונים");
    expect(purchaseUnits.get("לחם")).toBe("שקיות");
    expect(purchaseUnits.get("טונה")).toBe("קופסאות");
    expect(purchaseUnits.get("ירקות קפואים")).toBe("שקיות");
  });

  test("turns fresh bell pepper weight into countable supermarket units", () => {
    const [item] = buildShoppingList([planned(food("פלפל אדום (גמבה)", "גרם למנה", 300))]);
    expect(item).toMatchObject({
      requiredQuantity: 2,
      requiredUnit: "יחידות",
      purchaseQuantity: 2,
      purchaseUnit: "יחידות",
    });
    expect(item?.purchasePackageDescription).toBeUndefined();
  });

  test("converts cooked rice portions to a practical dry-rice monthly purchase", () => {
    const [item] = buildShoppingList(
      [planned(food("אורז לבן מבושל", "100 גרם למנה", 1))],
      "monthly",
    );

    expect(item).toMatchObject({
      requiredQuantity: 1000,
      requiredUnit: "גרם",
      purchaseQuantity: 1,
      purchaseUnit: "שקיות",
      purchaseContentsQuantity: 1000,
      purchasePackageDescription: "1 שקית של 1000 גרם",
    });
  });

  test("infers a dry-rice amount when the menu only says מנה", () => {
    const [weekly] = buildShoppingList(
      [planned(food("אורז לבן מבושל", "מנה", 1))],
      "weekly",
    );
    const [monthly] = buildShoppingList(
      [planned(food("אורז לבן מבושל", "מנה", 1))],
      "monthly",
    );

    expect(weekly).toMatchObject({
      requiredQuantity: 525,
      purchaseUnit: "שקיות",
      purchaseContentsQuantity: 1000,
    });
    expect(monthly).toMatchObject({
      requiredQuantity: 2250,
      purchaseUnit: "שקיות",
      purchaseContentsQuantity: 2500,
    });
  });

  test("turns broccoli portions into whole units instead of gram portions", () => {
    const [item] = buildShoppingList(
      [planned(food("ברוקולי", "100 גרם למנה", 1))],
      "weekly",
    );

    expect(item).toMatchObject({
      requiredQuantity: 2,
      requiredUnit: "יחידות",
      purchaseQuantity: 2,
      purchaseUnit: "יחידות",
    });
    expect(item?.purchasePackageDescription).toBeUndefined();
  });

  test("uses the food catalog category for an otherwise unknown produce name", () => {
    const [item] = buildShoppingList([
      planned(food("פרי עונתי", "100 גרם למנה", 100, "f-israel-186")),
    ]);

    expect(item).toMatchObject({
      requiredQuantity: 1,
      requiredUnit: "יחידות",
      purchaseQuantity: 1,
      purchaseUnit: "יחידות",
    });
  });

  test("merges cucumber rows as plain whole units", () => {
    const items = buildShoppingList(
      [
        planned(food("מלפפון", "מנה", 1)),
        planned(food("מלפפון טרי עם קליפה", "יחידה למנה", 1)),
      ],
      "weekly",
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: "מלפפון",
      requiredQuantity: 14,
      requiredUnit: "יחידות",
      purchaseQuantity: 14,
      purchaseUnit: "יחידות",
    });
    expect(items[0]?.purchasePackageDescription).toBeUndefined();
  });
});
