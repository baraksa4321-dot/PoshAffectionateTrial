import { describe, expect, test } from "bun:test";
import type { HistorySession } from "./gym-types";
import {
  completedSetForReopenedWorkout,
  getCurrentWeekWorkoutSession,
  getWorkoutCompletion,
} from "./workout-session";

const session = (date: string): HistorySession => ({
  id: "session-1",
  workoutId: "workout-1",
  workoutName: "אימון",
  date,
  durationSec: 600,
  entries: [
    {
      exerciseId: "exercise-1",
      exerciseName: "תרגיל",
      notes: "",
      sets: [
        { reps: 10, weight: 20, done: true },
        { reps: 8, weight: 20, done: true },
      ],
    },
  ],
});

describe("reopening a completed workout", () => {
  test("restores this week's completed session and its working-set marks", () => {
    const completed = getCurrentWeekWorkoutSession(
      [session("2026-08-30T08:00:00.000Z")],
      "workout-1",
      new Date("2026-08-31T12:00:00.000Z"),
    );

    expect(completed?.id).toBe("session-1");
    expect(completedSetForReopenedWorkout(completed?.entries[0], 0)).toBe(true);
    expect(completedSetForReopenedWorkout(completed?.entries[0], 1)).toBe(true);
    expect(completedSetForReopenedWorkout(completed?.entries[0], 2)).toBe(false);
  });

  test("does not carry completion marks into a new week", () => {
    const completed = getCurrentWeekWorkoutSession(
      [session("2026-08-29T08:00:00.000Z")],
      "workout-1",
      new Date("2026-08-31T12:00:00.000Z"),
    );

    expect(completed).toBeUndefined();
  });
});

describe("weekly workout completion", () => {
  test("distinguishes a partial session from a fully completed plan", () => {
    const partial = getWorkoutCompletion(session("2026-08-31T12:00:00.000Z"), 3);
    expect(partial.doneSets).toBe(2);
    expect(partial.targetSets).toBe(3);
    expect(partial.percent).toBe(67);
    expect(partial.status).toBe("partial");

    const complete = getWorkoutCompletion(
      {
        ...session("2026-08-31T12:00:00.000Z"),
        entries: [
          {
            ...session("2026-08-31T12:00:00.000Z").entries[0]!,
            sets: [
              ...session("2026-08-31T12:00:00.000Z").entries[0]!.sets,
              { reps: 8, weight: 20, done: true },
            ],
          },
        ],
      },
      3,
    );
    expect(complete.percent).toBe(100);
    expect(complete.status).toBe("completed");
  });
});
