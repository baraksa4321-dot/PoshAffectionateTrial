import type { Meal, WorkoutItem } from "./gym-types";

export function clientProgramInsertPayload(id: string, userId: string, name: string) {
  return {
    id,
    user_id: userId,
    name,
    description: "תוכנית נבנתה על ידי המאמן",
  };
}

export function clientProgramDayInsertPayload(
  id: string,
  programId: string,
  userId: string,
  name: string,
  sortOrder: number,
) {
  return {
    id,
    program_id: programId,
    user_id: userId,
    name,
    items: [],
    sort_order: sortOrder,
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
    next_planned_menu: plannedMeals,
  };
}
