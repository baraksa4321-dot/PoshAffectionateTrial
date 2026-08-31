import type { HistoryEntry, HistorySession } from "./gym-types";

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function currentWeekBounds(referenceDate: Date) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDateKey(start), end: localDateKey(end) };
}

export function getCurrentWeekWorkoutSession(
  history: HistorySession[],
  workoutId: string,
  referenceDate = new Date(),
) {
  const { start, end } = currentWeekBounds(referenceDate);
  return history
    .filter((session) => {
      const date = localDateKey(session.date);
      return session.workoutId === workoutId && date >= start && date <= end;
    })
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function completedSetForReopenedWorkout(
  completedEntry: HistoryEntry | undefined,
  workingSetIndex: number,
) {
  if (!completedEntry) return false;
  const completedWorkingSets = completedEntry.sets.filter((set) => !set.warmup);
  return Boolean(completedWorkingSets[workingSetIndex]);
}
