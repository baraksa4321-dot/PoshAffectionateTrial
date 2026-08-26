import { describe, expect, test } from "bun:test";
import {
  caloriesVisible,
  calendarWeekDates,
  normalizeFixedPlannedMenu,
} from "./nutrition-planning";
import type { Meal, NutritionDay } from "./gym-types";

const meal = (id: string): Meal => ({ id, name: id, foods: [] });
const nutritionDay = (date: string, plannedMeals?: Meal[]): NutritionDay => ({
  date,
  meals: [],
  ...(plannedMeals ? { plannedMeals } : {}),
});

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
});
