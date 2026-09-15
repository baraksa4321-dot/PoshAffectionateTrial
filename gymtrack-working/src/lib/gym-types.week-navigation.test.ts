import { describe, expect, test } from "bun:test";
import {
  dedupeHistorySessions,
  dedupeWorkoutItems,
  getNextWorkoutReportWeekOffset,
  getWorkoutReportSessionForDate,
  getWorkoutReportSessions,
  getWorkoutReportWeekDates,
  getWorkoutSessionsForDate,
  reportSessionDateKey,
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
  const expectConsecutiveDates = (dates: string[]) => {
    expect(dates).toHaveLength(7);
    dates.slice(1).forEach((date, index) => {
      const previous = new Date(`${dates[index]}T00:00:00Z`);
      const current = new Date(`${date}T00:00:00Z`);
      expect(current.getTime() - previous.getTime()).toBe(24 * 60 * 60 * 1000);
    });
  };

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

  test("assigns sessions on either side of local midnight to the expected tracking date", () => {
    const beforeMidnight = new Date(2026, 7, 25, 23, 59, 59, 999);
    const afterMidnight = new Date(2026, 7, 26, 0, 0, 0, 1);
    const trackingSessions = getWorkoutSessionsForDate(
      [
        session("before-midnight", beforeMidnight.toISOString()),
        session("after-midnight", afterMidnight.toISOString()),
      ],
      "2026-08-26",
    );

    expect(reportSessionDateKey(beforeMidnight.toISOString())).toBe("2026-08-25");
    expect(reportSessionDateKey(afterMidnight.toISOString())).toBe("2026-08-26");
    expect(trackingSessions.map(({ id }) => id)).toEqual(["after-midnight"]);
  });

  test("keeps seven local dates consecutive across the spring DST transition", () => {
    const weekDates = getWorkoutReportWeekDates(0, new Date(2026, 2, 8, 12));
    const sundayLateSession = new Date(2026, 2, 8, 23, 30);
    const saturdayLateSession = new Date(2026, 2, 14, 23, 30);
    const nextSundaySession = new Date(2026, 2, 15, 0, 0);

    expect(weekDates).toEqual([
      "2026-03-08",
      "2026-03-09",
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
      "2026-03-13",
      "2026-03-14",
    ]);
    expectConsecutiveDates(weekDates);
    expect(reportSessionDateKey(sundayLateSession.toISOString())).toBe("2026-03-08");
    expect(reportSessionDateKey(saturdayLateSession.toISOString())).toBe("2026-03-14");
    expect(reportSessionDateKey(nextSundaySession.toISOString())).toBe("2026-03-15");
    expect(
      getWorkoutReportSessions(
        [
          session("sunday-late", sundayLateSession.toISOString()),
          session("saturday-late", saturdayLateSession.toISOString()),
          session("next-sunday", nextSundaySession.toISOString()),
        ],
        workout,
        weekDates,
      ).map(({ id }) => id),
    ).toEqual(["saturday-late", "sunday-late"]);
  });

  test("keeps seven local dates consecutive across the fall DST transition", () => {
    const weekDates = getWorkoutReportWeekDates(0, new Date(2026, 10, 1, 12));
    const sundayLateSession = new Date(2026, 10, 1, 23, 30);
    const saturdayLateSession = new Date(2026, 10, 7, 23, 30);
    const nextSundaySession = new Date(2026, 10, 8, 0, 0);

    expect(weekDates).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
    expectConsecutiveDates(weekDates);
    expect(reportSessionDateKey(sundayLateSession.toISOString())).toBe("2026-11-01");
    expect(reportSessionDateKey(saturdayLateSession.toISOString())).toBe("2026-11-07");
    expect(reportSessionDateKey(nextSundaySession.toISOString())).toBe("2026-11-08");
    expect(
      getWorkoutReportSessions(
        [
          session("sunday-late", sundayLateSession.toISOString()),
          session("saturday-late", saturdayLateSession.toISOString()),
          session("next-sunday", nextSundaySession.toISOString()),
        ],
        workout,
        weekDates,
      ).map(({ id }) => id),
    ).toEqual(["saturday-late", "sunday-late"]);
  });

  test("collapses exact retry duplicates but keeps distinct executions", () => {
    const duplicate = session("retry-copy", "2026-08-26T09:00:00.000Z");
    const sameExecutionWithNewId = session("retry-copy-2", "2026-08-26T09:00:00.000Z");
    const distinctExecution = session("second-session", "2026-08-26T12:00:00.000Z");

    expect(
      dedupeHistorySessions([duplicate, sameExecutionWithNewId, distinctExecution]).map(
        ({ id }) => id,
      ),
    ).toEqual(["second-session", "retry-copy"]);
  });

  test("daily report selects only the newest execution for a date", () => {
    expect(
      getWorkoutReportSessionForDate(
        [
          session("earlier", "2026-08-26T09:00:00.000Z"),
          session("later", "2026-08-26T12:00:00.000Z"),
        ],
        workout,
        "2026-08-26",
      )?.id,
    ).toBe("later");
  });

  test("matches a saved execution by workout name when its id changed", () => {
    expect(
      getWorkoutReportSessions(
        [session("renamed-id", "2026-08-26T12:00:00.000Z", "old-workout-id")],
        workout,
        ["2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29"],
      ).map(({ id }) => id),
    ).toEqual(["renamed-id"]);
  });

  test("keeps only one copy of an exercise in a workout plan", () => {
    const item = (id: string, exerciseId: string): Workout["items"][number] => ({
      id,
      exerciseId,
      sets: 3,
      reps: 10,
      weight: 20,
      rest: 60,
      notes: "",
    });

    expect(
      dedupeWorkoutItems([
        item("first", "squat"),
        item("duplicate", "squat"),
        item("row", "row"),
      ]).map(({ id }) => id),
    ).toEqual(["first", "row"]);
  });
});
