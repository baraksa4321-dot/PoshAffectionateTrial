import { normalizeLegacyGramMealFood } from "./food-portions";
import type { Meal, WorkoutItem } from "./gym-types";

export function clientProgramInsertPayload(id: string, userId: string, name: string) {
  return {
    id,
    user_id: userId,
    name,
    description: "",
  };
}

export function clientProgramDayInsertPayload(
  id: string,
  programId: string,
  userId: string,
  name: string,
  sortOrder: number,
  weekday?: number,
) {
  return {
    id,
    program_id: programId,
    user_id: userId,
    name,
    items: [],
    sort_order: sortOrder,
    ...(weekday === undefined ? {} : { weekday }),
  };
}

export function clientProgramDayItemsUpdatePayload(items: WorkoutItem[]) {
  return {
    items,
    updated_at: new Date().toISOString(),
  };
}

export function clientNutritionTargetUpsertPayload(
  id: string,
  userId: string,
  date: string,
  calories: number,
) {
  return {
    id,
    user_id: userId,
    date,
    target_calories: calories,
    updated_at: new Date().toISOString(),
  };
}

export function clientPlannedMenuRpcPayload(userId: string, plannedMeals: Meal[]) {
  return {
    target_user_id: userId,
    next_planned_menu: plannedMeals.map((meal) => ({
      ...meal,
      foods: meal.foods.map(normalizeLegacyGramMealFood),
    })),
  };
}

function stableJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJsonValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, stableJsonValue(nestedValue)]),
  );
}

export function jsonValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(stableJsonValue(left)) === JSON.stringify(stableJsonValue(right));
}
