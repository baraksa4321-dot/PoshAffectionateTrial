import { describe, expect, test } from "bun:test";
import {
  clientNutritionTargetUpsertPayload,
  clientPlannedMenuRpcPayload,
  clientProgramDayInsertPayload,
  clientProgramDayItemsUpdatePayload,
  clientProgramInsertPayload,
} from "./coach-plan-payloads";

describe("coach plan payload boundaries", () => {
  test("scopes new programs and days to the selected trainee", () => {
    expect(clientProgramInsertPayload("program-1", "trainee-1", "Strength")).toMatchObject({
      id: "program-1",
      user_id: "trainee-1",
      name: "Strength",
    });
    expect(
      clientProgramDayInsertPayload("day-1", "program-1", "trainee-1", "Day 1", 0),
    ).toMatchObject({
      id: "day-1",
      program_id: "program-1",
      user_id: "trainee-1",
      name: "Day 1",
    });
  });

  test("keeps item updates and calorie targets tied to the selected trainee", () => {
    const items = [
      {
        id: "item-1",
        exerciseId: "ex-1",
        sets: 3,
        reps: 8,
        weight: 20,
        rest: 90,
        notes: "",
      },
    ];
    expect(clientProgramDayItemsUpdatePayload(items)).toMatchObject({ items });
    expect(
      clientNutritionTargetUpsertPayload("trainee-1_2026-08-26", "trainee-1", "2026-08-26", 2100),
    ).toMatchObject({
      id: "trainee-1_2026-08-26",
      user_id: "trainee-1",
      date: "2026-08-26",
      target_calories: 2100,
    });
  });

  test("allows an intentionally empty planned menu to reach the trainee", () => {
    expect(clientPlannedMenuRpcPayload("trainee-1", [])).toEqual({
      target_user_id: "trainee-1",
      next_planned_menu: [],
    });
  });
});