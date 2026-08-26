import type { Meal, NutritionDay, UserProfile } from "./gym-types";

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
