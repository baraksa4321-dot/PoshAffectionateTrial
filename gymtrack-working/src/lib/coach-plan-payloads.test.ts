import { describe, expect, test } from "bun:test";
import {
  clientNutritionTargetUpsertPayload,
  clientPlannedMenuRpcPayload,
  clientProgramDayInsertPayload,
  clientProgramDayItemsUpdatePayload,
  clientProgramInsertPayload,
  jsonValuesEqual,
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
        workingSets: [
          {
            id: "set-1",
            setNumber: 1,
            weight: 20,
            reps: 8,
            repMax: 10,
            notes: "עד כשל",
          },
        ],
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

  test("normalizes gram quantities before saving a legacy menu", () => {
    const payload = clientPlannedMenuRpcPayload("trainee-1", [
      {
        id: "meal-1",
        name: "ארוחה",
        foods: [
          {
            id: "food-1",
            name: "אורז",
            servingSize: "100 גרם",
            quantity: 150,
            calories: 200,
            protein: 4,
            carbs: 44,
            fat: 0,
          },
        ],
      },
    ]);

    expect(payload.next_planned_menu[0]?.foods[0]).toMatchObject({
      servingSize: "גרם למנה",
      quantity: 150,
      calories: 2,
      protein: 0.04,
    });
  });

  test("treats the same persisted menu as equal when JSON object keys are reordered", () => {
    expect(
      jsonValuesEqual(
        [{ id: "meal-1", name: "בוקר", foods: [{ id: "food-1", quantity: 1 }] }],
        [{ foods: [{ quantity: 1, id: "food-1" }], name: "בוקר", id: "meal-1" }],
      ),
    ).toBe(true);
  });
});
