import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  Copy,
  Info,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SkipForward,
  Timer,
  X,
  Sparkles,
  Zap,
  Award,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import {
  IconButton,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import { lastPerformance, repLabel, saveSession, uid, useGym } from "@/lib/gym-store";
import type { Exercise, HistoryEntry, LoggedSet, WorkoutItem } from "@/lib/gym-types";

export const Route = createFileRoute("/session/$workoutId")({
  head: () => ({
    meta: [
      { title: "אימון פעיל — הרוטינה שלי" },
      {
        name: "description",
        content: "רשמי סטים, משקלים וחזרות בזמן אמת במהלך האימון.",
      },
      { property: "og:title", content: "אימון פעיל — הרוטינה שלי" },
    ],
  }),
  component: Session,
});

function supersetLabels(items: WorkoutItem[]) {
  const labels: Record<number, string> = {};
  let group = -1;
  let i = 0;
  while (i < items.length) {
    const sid = items[i]?.supersetId;
    if (sid) {
      let j = i;
      const run: number[] = [];
      while (j < items.length && items[j]?.supersetId === sid) {
        run.push(j);
        j += 1;
      }
      if (run.length >= 2) {
        group += 1;
        const letter = String.fromCharCode(65 + (group % 26));
        run.forEach((idx, k) => {
          labels[idx] = `${letter}${k + 1}`;
        });
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return labels;
}

const ACTIVE_SESSION_KEY = (id: string) => `gymtrack.active_session.${id}`;

function Session() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const { workouts, exercises, history, programs } = useGym();
  const workout = workouts.find((w) => w.id === workoutId);
  const currentProgram = programs.find((program) => program.dayIds.includes(workoutId));
  const [cardExercise, setCardExercise] = useState<Exercise | null>(null);

  const [isPaused, setIsPaused] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState<"easy" | "appropriate" | "difficult">(
    "appropriate",
  );
  const [discomfortNotes, setDiscomfortNotes] = useState("");

  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [replaceSearch, setReplaceSearch] = useState("");

  const initial = useMemo<HistoryEntry[]>(() => {
    if (!workout) return [];

    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY(workoutId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === workout.items.length) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }

    return workout.items.map((item) => {
      const ex = exercises.find((e) => e.id === item.exerciseId);
      const last = lastPerformance(history, item.exerciseId);
      const isRange = item.repType === "range";

      const prescribedWeight = item.targetWeight || item.weight;

      const targetReps = isRange ? (item.repMin ?? item.reps) : item.reps;
      const targetRepMax = isRange ? item.repMax : undefined;

      const warmups: LoggedSet[] = (item.warmups ?? []).map((w) => ({
        reps: w.reps,
        weight: w.weight,
        done: false,
        warmup: true,
      }));
      const working: LoggedSet[] = Array.from({ length: item.sets }, (_, i) => ({
        reps: last?.sets[i]?.reps ?? item.workingSets?.[i]?.reps ?? targetReps,
        weight: prescribedWeight,
        done: false,
        targetReps,
        targetRepMax,
        warmup: false,
        dropSet: item.workingSets?.[i]?.dropSet || item.dropSetConfig?.enabled,
      }));
      return {
        exerciseId: item.exerciseId,
        exerciseName: ex?.name ?? "תרגיל שהוסר",
        equipment: ex?.equipment,
        notes: item.notes,
        targetSets: item.sets,
        targetReps,
        targetRepMax,
        repType: item.repType,
        sets: [...warmups, ...working],
      };
    });
  }, [workoutId]);

  const [entries, setEntries] = useState<HistoryEntry[]>(initial);
  const [startedAt] = useState(() => Date.now());
  const [rest, setRest] = useState(0);
  const [pendingExit, setPendingExit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setEntries(initial);
  }, [initial]);

  useEffect(() => {
    if (!workoutId || entries.length === 0) return;
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY(workoutId), JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries, workoutId]);

  useEffect(() => {
    if (rest <= 0 || isPaused) return;
    timerRef.current = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rest > 0, isPaused]);

  if (!workout) {
    return (
      <AppShell title="אימון לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">
          אימון זה אינו קיים עוד בספרייה.
        </p>
      </AppShell>
    );
  }

  const labels = supersetLabels(workout.items);

  const patchSet = (ei: number, si: number, patch: Partial<LoggedSet>) =>
    setEntries((prev) =>
      prev.map((e, i) =>
        i === ei ? { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : e,
      ),
    );

  const toggleSetDone = (ei: number, si: number) => {
    const currentSet = entries[ei]?.sets[si];
    if (!currentSet) return;
    const isNowDone = !currentSet.done;
    patchSet(ei, si, { done: isNowDone });

    if (isNowDone && !currentSet.warmup) {
      const restSec = workout.items[ei]?.rest ?? 60;
      setRest(restSec);
    }
  };

  const replaceExercise = (ei: number, newEx: Exercise) => {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === ei
          ? {
              ...e,
              exerciseId: newEx.id,
              exerciseName: newEx.name,
              equipment: newEx.equipment,
            }
          : e,
      ),
    );
    setReplacingIndex(null);
    setReplaceSearch("");
  };

  const clearSavedSession = () => {
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY(workout.id));
    } catch {
      /* ignore */
    }
  };

  const totalSets = entries.reduce((a, e) => a + e.sets.filter((s) => !s.warmup).length, 0);
  const doneSets = entries.reduce(
    (a, e) => a + e.sets.filter((s) => s.done && !s.warmup).length,
    0,
  );

  const handleFinishConfirm = () => {
    saveSession({
      id: uid(),
      workoutId: workout.id,
      workoutName: workout.name,
      programName: currentProgram?.name,
      date: new Date().toISOString(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      entries: entries.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })),
      difficultyRating,
      discomfortNotes: discomfortNotes.trim() || undefined,
    });
    clearSavedSession();
    setShowFeedbackModal(false);
    navigate({ to: "/programs" });
  };

  const progress = totalSets ? (doneSets / totalSets) * 100 : 0;

  const currentItem = replacingIndex !== null ? workout.items[replacingIndex] : null;
  const approvedIds = currentItem?.approvedAlternatives;

  const allowedExercisesForReplace = useMemo(() => {
    if (!approvedIds || approvedIds.length === 0) {
      return [];
    }
    return exercises.filter((ex) => approvedIds.includes(ex.id));
  }, [exercises, approvedIds]);

  return (
    <AppShell
      kicker={currentProgram?.name ?? "אימון"}
      title={workout.name}
      subtitle={`${doneSets} מתוך ${totalSets} סטים · בהצלחה!`}
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isPaused
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-secondary text-ink hover:bg-secondary/80"
            }`}
            title={isPaused ? "המשך אימון" : "השהה אימון"}
          >
            {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
          </button>
          <IconButton aria-label="יציאה מהאימון" onClick={() => setPendingExit(true)}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>
      }
    >
      {/* Pause Banner */}
      {isPaused && (
        <div className="surface-card p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-center font-bold text-xs mb-3">
          ⏸ האימון מושהה כעת. חזרי מתי שנוח לך!
        </div>
      )}

      {/* Progress bar */}
      <div className="surface-card flex items-center gap-3 px-4 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Play className="h-3.5 w-3.5 fill-current" />
        </div>
        <div className="min-w-0 flex-1 text-start">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              התקדמות אימון
            </p>
            <p className="text-[11.5px] font-semibold tabular-nums text-ink">
              {Math.round(progress)}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {entries.map((entry, ei) => {
          const item = workout.items[ei];
          const targetLabel = item ? repLabel(item) : String(entry.targetReps ?? "");
          const supersetLabel = labels[ei];
          const fullExercise = exercises.find((e) => e.id === entry.exerciseId);
          const workingCount = entry.sets.filter((s) => !s.warmup).length;
          const prescribedWeight = item?.targetWeight || item?.weight || 0;

          return (
            <article
              key={`${entry.exerciseId}-${ei}`}
              className={`surface-card p-4 text-start ${
                supersetLabel ? "border-s-4 border-s-primary rounded-s-none" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => fullExercise && setCardExercise(fullExercise)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary press cursor-pointer"
                  aria-label={`פתח פרטי ${entry.exerciseName}`}
                >
                  <Info className="h-4 w-4" strokeWidth={2} />
                </button>
                <div className="min-w-0 flex-1 text-start">
                  <div className="flex items-center gap-2">
                    {supersetLabel ? (
                      <span className="shrink-0 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                        {supersetLabel}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => fullExercise && setCardExercise(fullExercise)}
                      className="min-w-0 truncate text-start font-display text-[15.5px] font-semibold text-ink hover:text-primary cursor-pointer"
                    >
                      {entry.exerciseName}
                    </button>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    יעד מאמן: <strong className="text-ink">{prescribedWeight} ק"ג</strong> ·{" "}
                    {entry.targetSets ?? workingCount}× {targetLabel} חזרות
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReplacingIndex(ei)}
                    className="press grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-primary cursor-pointer"
                    title="תחליף מורשה"
                    aria-label="תחליף מורשה"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRest(item?.rest ?? 60)}
                    className="press flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-2 text-[12px] font-semibold text-ink cursor-pointer"
                    aria-label="התחל מנוחה"
                  >
                    <Timer className="h-3.5 w-3.5 text-primary" />
                    {item?.rest ?? 60}ש׳
                  </button>
                </div>
              </div>

              {item?.techniqueNotes ? (
                <div className="mt-2.5 rounded-2xl bg-primary/5 p-2.5 text-[12px] text-primary font-medium border border-primary/10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>הנחיית טכניקה ממאמן: {item.techniqueNotes}</span>
                </div>
              ) : null}

              <div className="mt-3 space-y-2">
                {entry.sets.map((s, si) => {
                  const workingIndex = entry.sets.slice(0, si + 1).filter((x) => !x.warmup).length;
                  return (
                    <div
                      key={si}
                      className={`rounded-2xl border p-3 transition-all ${
                        s.done
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-secondary/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold ${
                            s.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {workingIndex}
                        </span>
                        <div className="min-w-0 flex-1 text-start">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {s.dropSet ? "Drop Set" : `סט ${workingIndex}`}
                            <span className="ms-1 text-[11px] font-normal text-muted-foreground">
                              · יעד {s.targetReps} {s.targetRepMax ? `-${s.targetRepMax}` : ""}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSetDone(ei, si)}
                          className={`press grid h-11 w-11 place-items-center rounded-2xl text-[13px] font-bold transition-colors cursor-pointer ${
                            s.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                          aria-label={s.done ? "בטל סיום סט" : "סמן סט כבוצע"}
                        >
                          <Check className="h-5 w-5" strokeWidth={2.6} />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Stepper
                          label="משקל בפועל"
                          value={s.weight}
                          step={2.5}
                          suffix="ק״ג"
                          onChange={(v) => patchSet(ei, si, { weight: v })}
                        />
                        <Stepper
                          label="חזרות בפועל"
                          value={s.reps}
                          min={0}
                          onChange={(v) => patchSet(ei, si, { reps: v })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const lastSet = entry.sets[entry.sets.length - 1];
                    const newSet: LoggedSet = {
                      reps: lastSet?.reps ?? entry.targetReps ?? 10,
                      weight: lastSet?.weight ?? prescribedWeight,
                      done: false,
                      targetReps: entry.targetReps,
                      targetRepMax: entry.targetRepMax,
                      warmup: false,
                    };
                    setEntries((prev) =>
                      prev.map((e, idx) => (idx === ei ? { ...e, sets: [...e.sets, newSet] } : e)),
                    );
                  }}
                  className="press rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-ink hover:bg-secondary/80 cursor-pointer"
                >
                  + סט נוסף
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const lastSet = entry.sets[entry.sets.length - 1];
                    const dropSet: LoggedSet = {
                      reps: lastSet?.reps ?? entry.targetReps ?? 10,
                      weight: Math.round((lastSet?.weight ?? prescribedWeight) * 0.8 * 2) / 2,
                      done: false,
                      targetReps: entry.targetReps,
                      warmup: false,
                      dropSet: true,
                    };
                    setEntries((prev) =>
                      prev.map((e, idx) => (idx === ei ? { ...e, sets: [...e.sets, dropSet] } : e)),
                    );
                  }}
                  className="press rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                >
                  + דרופ סט
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <PrimaryButton
          onClick={() => setShowFeedbackModal(true)}
          leading={<Check className="h-4 w-4" strokeWidth={2.4} />}
        >
          סיים ושמור אימון
        </PrimaryButton>
      </div>

      {/* Exercise Detail Sheet Modal */}
      {cardExercise ? (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setCardExercise(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-3 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-ink">{cardExercise.name}</h3>
              <button
                onClick={() => setCardExercise(null)}
                className="text-muted-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-primary">קבוצת שרירים: {cardExercise.muscleGroup}</p>
              <p className="text-muted-foreground">{cardExercise.description}</p>
              {cardExercise.instructions && (
                <div className="rounded-xl bg-secondary/50 p-2.5 space-y-1">
                  <p className="font-bold text-ink">הוראות ביצוע:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {cardExercise.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Post Workout Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">אימון מצוין! איך הרגשת?</h3>
              <p className="text-xs text-muted-foreground">המשוב ישודר ישירות ללוח המאמן שלך</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground">דרגת קושי</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "easy", label: "קל מדי", icon: Smile, color: "text-emerald-600" },
                  { id: "appropriate", label: "מדויק", icon: Meh, color: "text-primary" },
                  { id: "difficult", label: "קשה מדי", icon: Frown, color: "text-rose-600" },
                ].map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => setDifficultyRating(id as any)}
                    className={`p-2.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      difficultyRating === id
                        ? "border-primary bg-primary/10 shadow-xs scale-105"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                דיווח על אי-נוחות / הערה למאמן (אופציונלי)
              </label>
              <textarea
                value={discomfortNotes}
                onChange={(e) => setDiscomfortNotes(e.target.value)}
                placeholder="למשל: עומס קל במרפק ימין בסט האחרון..."
                className="w-full rounded-2xl border border-border p-2.5 text-xs outline-none focus:border-primary h-16"
              />
            </div>

            <button
              onClick={handleFinishConfirm}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-md cursor-pointer hover:bg-primary/90"
            >
              אישור ושמירת אימון
            </button>
          </div>
        </div>
      )}

      {/* Floating Rest Timer Bar */}
      {rest > 0 ? (
        <div
          className="scale-in fixed inset-x-0 z-40 mx-auto max-w-xl px-4"
          style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
        >
          <div className="ink-card flex items-center gap-2 p-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
              <Timer className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-primary-foreground/80 uppercase">
                זמן מנוחה
              </p>
              <p className="font-display text-[20px] font-semibold tabular-nums text-primary-foreground">
                {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRest((r) => Math.max(0, r - 15))}
                className="press rounded-xl bg-white/15 px-2.5 py-1.5 text-[12px] font-bold text-primary-foreground hover:bg-white/25 cursor-pointer"
              >
                -15ש׳
              </button>
              <button
                type="button"
                onClick={() => setRest((r) => r + 15)}
                className="press rounded-xl bg-white/15 px-2.5 py-1.5 text-[12px] font-bold text-primary-foreground hover:bg-white/25 cursor-pointer"
              >
                +15ש׳
              </button>
              <button
                type="button"
                onClick={() => setRest(0)}
                className="press flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-[12px] font-bold text-primary-foreground hover:bg-white/30 cursor-pointer"
              >
                <SkipForward className="h-3.5 w-3.5 fill-current" />
                <span>דילוג</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Replace Exercise Modal */}
      {replacingIndex !== null ? (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={() => setReplacingIndex(null)}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="scale-in max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-ink">
                תרגיל חלופי מורשה למתאמן
              </h2>
              <IconButton aria-label="סגור" onClick={() => setReplacingIndex(null)} variant="ghost">
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <div className="mt-4 space-y-2 pb-6">
              {allowedExercisesForReplace.length > 0 ? (
                allowedExercisesForReplace.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => replaceExercise(replacingIndex, ex)}
                    className="press flex w-full items-center justify-between rounded-2xl bg-secondary p-3.5 text-start hover:bg-secondary/80 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-ink text-[14px]">{ex.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {ex.muscleGroup} {ex.equipment ? `· ${ex.equipment}` : ""}
                      </p>
                    </div>
                    <span className="rounded-xl bg-primary/10 px-2.5 py-1 text-[12px] font-semibold text-primary">
                      בחר
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-ink">אין תחליפים מורשים מוגדרים</p>
                  <p>
                    המאמן לא הגדיר תרגילים חלופיים מורשים עבור תרגיל זה. פני למאמן להוספת תחליפים
                    מורשים.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={pendingExit}
        title="לצאת מהאימון?"
        description="הסטים שתיעדת יישמרו רק אם לא תנקי אותם."
        confirmLabel="צאי בלי לשמור"
        cancelLabel="המשיכי באימון"
        destructive
        onConfirm={() => {
          clearSavedSession();
          setPendingExit(false);
          navigate({ to: "/programs" });
        }}
        onCancel={() => setPendingExit(false)}
      />
    </AppShell>
  );
}
