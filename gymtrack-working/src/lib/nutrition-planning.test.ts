import { describe, expect, test } from "bun:test";
import {
  buildShoppingList,
  caloriesVisible,
  calendarWeekDates,
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
      },
    ]);
    expect(buildShoppingList(meals, "weekly")).toMatchObject([
      {
        requiredQuantity: 21,
        purchaseQuantity: 2,
        purchaseContentsQuantity: 24,
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
});
