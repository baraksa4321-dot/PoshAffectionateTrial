import { describe, expect, test } from "bun:test";
import { completedSessionVolume, isPureBodyweightEntry } from "./workout-session";
import type { HistorySession } from "./gym-types";

const baseSession: HistorySession = {
  id: "session-1",
  workoutId: "workout-1",
  workoutName: "אימון",
  date: "2026-09-13T08:00:00.000Z",
  durationSec: 1_250,
  entries: [],
};

describe("workout dashboard metrics", () => {
  test("counts only completed working sets and excludes pure bodyweight load", () => {
    const session: HistorySession = {
      ...baseSession,
      entries: [
        {
          exerciseId: "ex-squat",
          exerciseName: "סקוואט",
          equipment: "מוט",
          notes: "",
          sets: [
            { reps: 5, weight: 40, done: true },
            { reps: 5, weight: 40, done: false },
            { reps: 10, weight: 10, done: true, warmup: true },
          ],
        },
        {
          exerciseId: "bw-push-up",
          exerciseName: "שכיבות סמיכה משקל גוף",
          equipment: "משקל גוף",
          notes: "",
          sets: [{ reps: 12, weight: 80, done: true }],
        },
      ],
    };

    expect(completedSessionVolume(session)).toBe(200);
    expect(isPureBodyweightEntry(session.entries[1]!)).toBe(true);
  });

  test("keeps an explicitly weighted bodyweight variation measurable", () => {
    const session: HistorySession = {
      ...baseSession,
      entries: [
        {
          exerciseId: "bw-pull-up",
          exerciseName: "מתח משקל גוף בתוספת משקל",
          equipment: "משקל גוף בתוספת משקל",
          notes: "",
          sets: [{ reps: 4, weight: 10, done: true }],
        },
      ],
    };

    expect(completedSessionVolume(session)).toBe(40);
    expect(isPureBodyweightEntry(session.entries[0]!)).toBe(false);
  });
});