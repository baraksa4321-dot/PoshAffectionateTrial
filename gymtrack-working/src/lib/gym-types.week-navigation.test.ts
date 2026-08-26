import { describe, expect, test } from "bun:test";
import {
  getNextWorkoutReportWeekOffset,
  getWorkoutReportSessions,
  getWorkoutReportWeekDates,
  type HistorySession,
  type Workout,
} from "./gym-types";

describe("workout report week navigation", () => {
  const referenceDate = new Date(2026, 7, 26, 12);
  const workout: Workout = {
    id: "workout-1",
    name: "Push",
    notes: "",
    items: [],
  };
  const session = (id: string, date: string, workoutId = workout.id): HistorySession => ({
    id,
    workoutId,
    workoutName: workout.name,
    date,
    durationSec: 0,
    entries: [],
  });

  test("defaults to the current calendar week", () => {
    expect(getWorkoutReportWeekDates(undefined, referenceDate)).toEqual([
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
    ]);
  });

  test("moving back and forward changes the selected seven-day window", () => {
    const previousWeek = getWorkoutReportWeekDates(-1, referenceDate);
    const currentWeek = getWorkoutReportWeekDates(
      getNextWorkoutReportWeekOffset(-1),
      referenceDate,
    );
    const history = [
      session("previous", "2026-08-19T09:00:00.000Z"),
      session("current", "2026-08-26T09:00:00.000Z"),
      session("other-workout", "2026-08-26T10:00:00.000Z", "workout-2"),
    ];

    expect(previousWeek).toEqual([
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
    ]);
    expect(currentWeek).toEqual([
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
    ]);
    expect(previousWeek).not.toEqual(currentWeek);
    expect(getWorkoutReportSessions(history, workout, previousWeek).map(({ id }) => id)).toEqual([
      "previous",
    ]);
    expect(getWorkoutReportSessions(history, workout, currentWeek).map(({ id }) => id)).toEqual([
      "current",
    ]);
  });

  test("does not move forward beyond the current week", () => {
    expect(getNextWorkoutReportWeekOffset(0)).toBe(0);
    expect(getNextWorkoutReportWeekOffset(-1)).toBe(0);
  });
});
