import type { HistoryEntry, HistorySession, WorkoutItem } from "./gym-types";

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export type WeeklyWorkoutStatus = "scheduled" | "completed" | "partial" | "skipped" | "missed";

export type WeekDay = {
  date: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
};

export function getWeekStart(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function getCurrentWeekDates(referenceDate = new Date()): WeekDay[] {
  const start = getWeekStart(referenceDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = localDateKey(date);
    return {
      date: dateKey,
      label: date.toLocaleDateString("he-IL", { weekday: "long" }),
      shortLabel: date.toLocaleDateString("he-IL", { weekday: "short" }),
      isToday: dateKey === localDateKey(referenceDate),
    };
  });
}

function currentWeekBounds(referenceDate: Date) {
  const start = getWeekStart(referenceDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDateKey(start), end: localDateKey(end) };
}

export function getWorkoutCompletion(
  session: HistorySession | undefined,
  plannedWorkingSets: number,
) {
  const doneSets =
    session?.entries.reduce(
      (total, entry) => total + entry.sets.filter((set) => set.done && !set.warmup).length,
      0,
    ) ?? 0;
  const targetSets = Math.max(
    plannedWorkingSets,
    session?.entries.reduce(
      (total, entry) => total + entry.sets.filter((set) => !set.warmup).length,
      0,
    ) ?? 0,
  );
  const percent = targetSets > 0 ? Math.min(100, Math.round((doneSets / targetSets) * 100)) : 0;
  return {
    doneSets,
    targetSets,
    percent,
    status: (doneSets === 0
      ? "partial"
      : percent >= 100
        ? "completed"
        : "partial") as Extract<WeeklyWorkoutStatus, "completed" | "partial">,
  };
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

export function restForWorkoutSet(
  item: WorkoutItem | undefined,
  workingSetIndex: number,
  fallback = 60,
) {
  const configured = item?.workingSets?.[workingSetIndex]?.rest ?? item?.rest ?? fallback;
  return Number.isFinite(configured) ? Math.max(0, configured) : fallback;
}
