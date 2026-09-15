import { BarChart3, CalendarDays, ChevronDown, Dumbbell, Play, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Overlay } from "@/components/ui-app/Overlay";
import { StatTile } from "@/components/ui-app/primitives";
import { personalRecords } from "@/lib/gym-store";
import type { Exercise, HistorySession, Workout } from "@/lib/gym-types";

type ProgressTrendsModalProps = {
  open: boolean;
  workout: Workout | null;
  exercises: Exercise[];
  history: HistorySession[];
  onClose: () => void;
  onStartWorkout?: (workoutId: string) => void;
};

function formatDayDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);
  return parsed.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

function progressEntryForExercise(
  session: HistorySession,
  exerciseId: string,
  exerciseName: string,
) {
  return (
    session.entries.find((entry) => entry.exerciseId === exerciseId) ??
    session.entries.find((entry) => entry.exerciseName.trim() === exerciseName.trim())
  );
}

export function ProgressTrendsModal({
  open,
  workout,
  exercises,
  history,
  onClose,
  onStartWorkout,
}: ProgressTrendsModalProps) {
  const exerciseOptions = useMemo(() => {
    if (!workout) return [];
    const seen = new Set<string>();
    return workout.items.flatMap((item) => {
      if (!item.exerciseId || seen.has(item.exerciseId)) return [];
      seen.add(item.exerciseId);
      const catalogExercise = exercises.find((exercise) => exercise.id === item.exerciseId);
      return [
        {
          id: item.exerciseId,
          name: catalogExercise?.name ?? item.exerciseName ?? item.exerciseId,
        },
      ];
    });
  }, [exercises, workout]);
  const [progressRange, setProgressRange] = useState<7 | 30 | 90>(30);
  const [progressExerciseId, setProgressExerciseId] = useState("");

  useEffect(() => {
    setProgressExerciseId(exerciseOptions[0]?.id ?? "");
  }, [exerciseOptions, workout?.id]);

  const selectedProgressExercise =
    exerciseOptions.find((exercise) => exercise.id === progressExerciseId) ?? exerciseOptions[0];
  const progressCutoff = new Date();
  progressCutoff.setDate(progressCutoff.getDate() - (progressRange - 1));
  progressCutoff.setHours(0, 0, 0, 0);
  const progressSessions = history
    .filter((session) => new Date(session.date) >= progressCutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const progressPoints = selectedProgressExercise
    ? progressSessions
        .map((session) => {
          const entry = progressEntryForExercise(
            session,
            selectedProgressExercise.id,
            selectedProgressExercise.name,
          );
          if (!entry) return null;
          const sets = entry.sets.filter((set) => !set.warmup && set.done);
          if (!sets.length) return null;
          return {
            date: session.date,
            volume: sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
            maxWeight: Math.max(...sets.map((set) => set.weight)),
            reps: Math.max(...sets.map((set) => set.reps)),
          };
        })
        .filter((point): point is NonNullable<typeof point> => Boolean(point))
    : [];
  const progressFirst = progressPoints[0];
  const progressLast = progressPoints[progressPoints.length - 1];
  const progressRecords = selectedProgressExercise
    ? personalRecords(history, selectedProgressExercise.id)
    : null;

  if (!open || !workout) return null;

  return (
    <Overlay open={open} onClose={onClose} ariaLabel={`מגמות באימון ${workout.name}`}>
      <div
        className="w-full max-w-lg space-y-4 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">Progress</p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-ink">מגמות והיסטוריית תרגיל</h2>
            <p className="mt-1 text-xs font-bold text-ink">{workout.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              מוצגים רק תרגילים מתוך האימון הזה.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
            aria-label="סגירת מגמות"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {selectedProgressExercise ? (
          <>
            <label className="block text-xs font-bold text-muted-foreground">
              תרגיל
              <span className="relative mt-1 block">
                <select
                  value={selectedProgressExercise.id}
                  onChange={(event) => setProgressExerciseId(event.target.value)}
                  aria-label="בחירת תרגיל למגמה"
                  className="w-full appearance-none rounded-xl border border-border bg-background p-3 pe-9 text-sm font-bold text-ink outline-none focus:border-primary"
                >
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-3.5 h-4 w-4 text-muted-foreground" />
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-secondary/60 p-1">
              {([7, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setProgressRange(days)}
                  className={`press rounded-xl px-2 py-2 text-xs font-bold ${
                    progressRange === days ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {days === 7 ? "שבוע" : days === 30 ? "חודש" : "3 חודשים"}
                </button>
              ))}
            </div>
            {progressPoints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-5 text-center">
                <BarChart3 className="mx-auto h-7 w-7 text-primary/60" />
                <p className="mt-2 text-sm font-bold text-ink">אין מספיק נתונים לטווח הזה</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  שמרי עוד ביצוע אחד של התרגיל כדי להתחיל לראות מגמה אמיתית.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <StatTile
                    label="נפח אחרון"
                    value={`${Math.round(progressLast?.volume ?? 0)} ק״ג`}
                    icon={TrendingUp}
                    tone="sage"
                  />
                  <StatTile
                    label="משקל מרבי"
                    value={`${progressRecords?.heaviest ?? progressLast?.maxWeight ?? 0} ק״ג`}
                    icon={Dumbbell}
                    tone="rose"
                  />
                  <StatTile
                    label="ביצועים"
                    value={`${progressPoints.length}`}
                    icon={CalendarDays}
                    tone="cream"
                  />
                </div>
                <div className="space-y-2">
                  {progressPoints.slice(-6).map((point) => {
                    const maxVolume = Math.max(...progressPoints.map((item) => item.volume), 1);
                    return (
                      <div key={`${point.date}-${point.volume}`} className="rounded-2xl bg-secondary/45 p-3">
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="font-bold text-ink">{formatDayDate(point.date)}</span>
                          <span className="text-muted-foreground">
                            {Math.round(point.volume)} ק״ג · עד {point.maxWeight} ק״ג · {point.reps} חזרות
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.max(8, Math.round((point.volume / maxVolume) * 100))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
                  <p className="font-bold text-primary">מה אפשר לעשות מכאן?</p>
                  <p className="mt-1 leading-relaxed text-ink">
                    {progressFirst && progressLast && progressLast.volume > progressFirst.volume
                      ? "הנפח במגמת עלייה בטווח שנבחר. שמרי על ביצוע נשלט ובדקי את היעד הבא באימון."
                      : "המשיכי לתעד באותו תרגיל ובאותו טווח. יותר נתונים יעזרו לך ולמאמן לזהות שינוי אמיתי."}
                  </p>
                  {onStartWorkout ? (
                    <button
                      type="button"
                      onClick={() => onStartWorkout(workout.id)}
                      className="press mt-3 inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      לאימון הבא
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center">
            <BarChart3 className="mx-auto h-7 w-7 text-primary/60" />
            <p className="mt-2 text-sm font-bold text-ink">אין תרגילים באימון הזה</p>
          </div>
        )}
      </div>
    </Overlay>
  );
}