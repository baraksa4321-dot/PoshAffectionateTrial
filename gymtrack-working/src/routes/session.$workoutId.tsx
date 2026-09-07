import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { createPortal } from "react-dom";
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
  Timer,
  X,
  Sparkles,
  Zap,
  Award,
  Smile,
  Meh,
  Frown,
  ImagePlus,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { canonicalizeExerciseRecords, exerciseDisplayName } from "@/lib/exercise-library";
import { Stepper } from "@/components/Stepper";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  IconButton,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import {
  flushCloudSync,
  lastPerformance,
  personalRecords,
  saveSession,
  uid,
  useGym,
} from "@/lib/gym-store";
import { BODYWEIGHT_EXERCISES, replaceWithBodyweight } from "@/lib/bodyweight-exercises";
import type {
  Exercise,
  HistoryEntry,
  HistorySession,
  LoggedSet,
  WorkoutItem,
} from "@/lib/gym-types";
import { genderText } from "@/lib/gender-copy";
import {
  completedSetForReopenedWorkout,
  getCurrentWeekWorkoutSession,
} from "@/lib/workout-session";
import {
  loadWorkoutVideoDrafts,
  removeWorkoutVideoDraft,
  saveWorkoutVideoDraft,
} from "@/lib/workout-video-drafts";

export const Route = createFileRoute("/session/$workoutId")({
  head: () => ({
    meta: [
      { title: "אימון פעיל — MY routine" },
      {
        name: "description",
        content: "רשמי סטים, משקלים וחזרות בזמן אמת במהלך האימון.",
      },
      { property: "og:title", content: "אימון פעיל — MY routine" },
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
const ACTIVE_SESSION_FEEDBACK_KEY = (id: string) => `gymtrack.active_session_feedback.${id}`;
const VIDEO_UPLOAD_TIMEOUT_MS = 15_000;

type ExerciseFeedbackDraft = {
  rating?: "easy" | "appropriate" | "difficult";
  notes: string;
};

type SavedSessionFeedback = {
  difficultyRating?: "easy" | "appropriate" | "difficult";
  discomfortNotes: string;
  exerciseFeedback: Record<number, ExerciseFeedbackDraft>;
};

function isFeedbackRating(
  value: unknown,
): value is NonNullable<ExerciseFeedbackDraft["rating"]> {
  return value === "easy" || value === "appropriate" || value === "difficult";
}

function latestHistoryFeedback(
  history: HistorySession[],
  workoutId: string,
): SavedSessionFeedback {
  const empty: SavedSessionFeedback = {
    discomfortNotes: "",
    exerciseFeedback: {},
  };
  const latestSession = history
    .filter((session) => session.workoutId === workoutId)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  if (!latestSession) return empty;

  const exerciseFeedback: Record<number, ExerciseFeedbackDraft> = {};
  latestSession.entries.forEach((entry, index) => {
    if (!entry.feedback) return;
    exerciseFeedback[index] = {
      ...(isFeedbackRating(entry.feedback.rating) ? { rating: entry.feedback.rating } : {}),
      notes: entry.feedback.notes ?? "",
    };
  });

  return {
    ...(isFeedbackRating(latestSession.difficultyRating)
      ? { difficultyRating: latestSession.difficultyRating }
      : {}),
    discomfortNotes: latestSession.discomfortNotes ?? "",
    exerciseFeedback,
  };
}

function loadSavedSessionFeedback(
  workoutId: string,
  history: HistorySession[] = [],
): SavedSessionFeedback {
  const historyFallback = latestHistoryFeedback(history, workoutId);
  if (typeof window === "undefined") return historyFallback;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_FEEDBACK_KEY(workoutId));
    if (!raw) return historyFallback;
    try {
      const parsed = JSON.parse(raw) as Partial<SavedSessionFeedback>;
      if (!parsed || typeof parsed !== "object") return historyFallback;
      const difficultyRating =
        parsed.difficultyRating === "easy" ||
        parsed.difficultyRating === "appropriate" ||
        parsed.difficultyRating === "difficult"
          ? parsed.difficultyRating
          : undefined;
      return {
        ...(difficultyRating ? { difficultyRating } : {}),
        discomfortNotes: typeof parsed.discomfortNotes === "string" ? parsed.discomfortNotes : "",
        exerciseFeedback:
          parsed.exerciseFeedback && typeof parsed.exerciseFeedback === "object"
            ? parsed.exerciseFeedback
            : {},
      };
    } catch {
      // Support feedback saved by the previous version as plain text.
      return { ...historyFallback, discomfortNotes: raw };
    }
  } catch {
    return historyFallback;
  }
}

function sessionSummaryStats(session: HistorySession | null) {
  const sets = session?.entries.flatMap((entry) => entry.sets).filter((set) => !set.warmup) ?? [];
  const doneSets = sets.filter((set) => set.done);
  return {
    doneSets: doneSets.length,
    volume: doneSets.reduce((sum, set) => sum + set.weight * set.reps, 0),
    maxWeight: doneSets.length ? Math.max(...doneSets.map((set) => set.weight)) : 0,
    exercises: session?.entries.filter((entry) => entry.sets.some((set) => set.done && !set.warmup)).length ?? 0,
    durationSec: session?.durationSec ?? 0,
  };
}

function progressionSuggestion(
  history: HistorySession[],
  entry: HistoryEntry,
  targetRepMax: number | undefined,
  difficultyRating: HistorySession["difficultyRating"],
) {
  const previous = lastPerformance(history, entry.exerciseId);
  const previousSet = previous?.sets.at(-1);
  if (!previousSet || previousSet.weight <= 0) return null;
  if (difficultyRating === "difficult") {
    return {
      weight: previousSet.weight,
      text: `הפעם הקודמת הרגישה קשה. הצעה: להישאר על ${previousSet.weight} ק״ג ולשמור על שליטה.`,
    };
  }
  if (targetRepMax && previousSet.reps >= targetRepMax) {
    const nextWeight = Math.round((previousSet.weight + 2.5) * 10) / 10;
    return {
      weight: nextWeight,
      text: `הגעת לטווח העליון בפעם הקודמת. הצעה: לנסות ${nextWeight} ק״ג בסט הבא.`,
    };
  }
  return {
    weight: previousSet.weight,
    text: `הצעה: לחזור על ${previousSet.weight} ק״ג ולנסות להוסיף חזרה אחת אם הביצוע מרגיש יציב.`,
  };
}

function isExercisePlaceholder(value: unknown): value is string {
  const normalized = typeof value === "string" ? value.trim() : "";
  return !normalized || normalized === "תרגיל" || normalized === "תרגיל שהוסר";
}

function findExerciseForItem(item: WorkoutItem | undefined, exercises: Exercise[]) {
  if (!item) return undefined;
  const exact = exercises.find((exercise) => exercise.id === item.exerciseId);
  if (exact) return exact;

  // Older saved programs can contain the exercise slug/name instead of the
  // catalog id. Resolve those records before rendering the generic fallback.
  const normalizedId = item.exerciseId.trim().toLowerCase().replace(/^ex-/, "");
  return exercises.find((exercise) => {
    const ids = [exercise.id, exercise.name, exercise.nameEn, exercise.nameHe]
      .filter(Boolean)
      .map((value) => value!.trim().toLowerCase().replace(/^ex-/, ""));
    return ids.includes(normalizedId);
  });
}

type SmartTimerPosition = {
  exerciseIndex: number;
  setNumber: number;
};

function Session() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const { workouts, exercises, history, programs, userProfile } = useGym();
  const gender = userProfile?.gender;
  const workout = workouts.find((w) => w.id === workoutId);
  const currentProgram = programs.find((program) => program.dayIds.includes(workoutId));
  const [cardExercise, setCardExercise] = useState<Exercise | null>(null);
  const [bodyweightNotice, setBodyweightNotice] = useState("");
  const [isBodyweightMode, setIsBodyweightMode] = useState(() =>
    Boolean(workout?.name.endsWith("· משקל גוף")),
  );
  const regularWorkoutSnapshot = useRef(workout);
  const bodyweightModeWorkoutIdRef = useRef<string | null>(null);
  const hydratedEntriesWorkoutIdRef = useRef<string | null>(null);
  const hydratedFeedbackWorkoutIdRef = useRef<string | null>(null);
  const summaryNavigationTimerRef = useRef<number | null>(null);
  const [approvedProgression, setApprovedProgression] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!workout) return;
    regularWorkoutSnapshot.current = workout;
    if (bodyweightModeWorkoutIdRef.current === workoutId) return;
    bodyweightModeWorkoutIdRef.current = workoutId;
    setIsBodyweightMode(workout.name.endsWith("· משקל גוף"));
  }, [workout, workoutId]);

  useEffect(() => {
    if (!bodyweightNotice) return;
    const timeoutId = window.setTimeout(() => setBodyweightNotice(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [bodyweightNotice]);

  useEffect(() => {
    return () => {
      if (summaryNavigationTimerRef.current !== null) {
        window.clearTimeout(summaryNavigationTimerRef.current);
      }
    };
  }, []);

  const [isPaused, setIsPaused] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [savedSummary, setSavedSummary] = useState<HistorySession | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [videoUploadsInFlight, setVideoUploadsInFlight] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState("");
  const [videoUploadErrorExerciseIndex, setVideoUploadErrorExerciseIndex] = useState<number | null>(
    null,
  );
  const [difficultyRating, setDifficultyRating] = useState<
    "easy" | "appropriate" | "difficult"
  >(() => loadSavedSessionFeedback(workoutId, history).difficultyRating ?? "appropriate");
  const [feedbackDraft, setFeedbackDraft] = useState(() => {
    const saved = loadSavedSessionFeedback(workoutId, history);
    return {
      workoutId,
      discomfortNotes: saved.discomfortNotes,
    };
  });
  const discomfortNotes =
    feedbackDraft.workoutId === workoutId ? feedbackDraft.discomfortNotes : "";
  const setDiscomfortNotes = (notes: string) =>
    setFeedbackDraft({ workoutId, discomfortNotes: notes });
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<number, ExerciseFeedbackDraft>>(
    () => loadSavedSessionFeedback(workoutId, history).exerciseFeedback,
  );

  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [replaceSearch, setReplaceSearch] = useState("");

  const initial = useMemo<HistoryEntry[]>(() => {
    if (!workout) return [];

    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY(workoutId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === workout.items.length) {
          return parsed.map((entry, index) => {
            const item = workout.items[index];
            const source = findExerciseForItem(
              item,
              canonicalizeExerciseRecords([...exercises, ...BODYWEIGHT_EXERCISES]),
            );
            const savedName =
              typeof entry?.exerciseName === "string" ? entry.exerciseName.trim() : "";
            return {
              ...entry,
              exerciseName:
                (source ? exerciseDisplayName(source) : "") ||
                (!isExercisePlaceholder(item?.exerciseName) && item?.exerciseName
                  ? item.exerciseName
                  : "") ||
                (!isExercisePlaceholder(savedName) ? savedName : "") ||
                "תרגיל",
              ...(entry?.equipment || item?.equipment || source?.equipment
                ? { equipment: entry?.equipment || item?.equipment || source?.equipment }
                : {}),
              ...(entry?.cableGrip || item?.cableGrip
                ? { cableGrip: entry?.cableGrip || item?.cableGrip }
                : {}),
            };
          });
        }
      }
    } catch {
      /* ignore */
    }

    return workout.items.map((item) => {
      const ex = findExerciseForItem(
        item,
        canonicalizeExerciseRecords([...exercises, ...BODYWEIGHT_EXERCISES]),
      );
      const last = lastPerformance(history, item.exerciseId);
      const completedSession = getCurrentWeekWorkoutSession(history, workoutId);
      const completedEntry = completedSession?.entries.find(
        (entry) => entry.exerciseId === item.exerciseId,
      );
      const isRange = item.repType === "range";

      const prescribedWeight = item.targetWeight || item.weight;

      const targetReps = isRange ? (item.repMin ?? item.reps) : item.reps;
      const targetRepMax = isRange ? item.repMax : undefined;

      const warmups: LoggedSet[] = (item.warmups ?? []).map((w) => ({
        reps: w.reps,
        weight: w.weight,
        done: false,
        warmup: true,
        targetReps: w.reps,
        ...(w.repsMax !== undefined ? { targetRepMax: w.repsMax } : {}),
      }));
      const working: LoggedSet[] = Array.from({ length: item.sets }, (_, i) => {
        const configuredSet = item.workingSets?.[i];
        const isDropSet = configuredSet?.dropSet ?? false;
        const configuredTargetReps = configuredSet?.reps ?? targetReps;
        const configuredTargetRepMax = isRange
          ? (configuredSet?.repMax ?? targetRepMax)
          : undefined;
        return {
          reps: last?.sets[i]?.reps ?? configuredTargetReps,
          weight:
            configuredSet?.weight ??
            (isDropSet
              ? Math.max(
                  0,
                  Math.round(
                    prescribedWeight *
                      (1 -
                        (item.dropSetConfig?.weightReductionPercent ??
                          item.dropSetConfig?.percentReduction ??
                          20) /
                          100) *
                      10,
                  ) / 10,
                )
              : prescribedWeight),
          done: completedSetForReopenedWorkout(completedEntry, i),
          targetReps: configuredTargetReps,
          warmup: false,
          ...(configuredTargetRepMax !== undefined
            ? { targetRepMax: configuredTargetRepMax }
            : {}),
          ...(configuredSet?.notes ? { notes: configuredSet.notes } : {}),
          ...(isDropSet ? { dropSet: true } : {}),
        };
      });
      const dropConfig = item.dropSetConfig;
      const hasPerSetDrop = item.workingSets?.some((set) => set.dropSet) ?? false;
      if (dropConfig?.enabled && dropConfig.drops > 0 && !hasPerSetDrop) {
        for (let dropLevel = 1; dropLevel <= dropConfig.drops; dropLevel += 1) {
          const reduction =
            (dropConfig.weightReductionPercent ?? dropConfig.percentReduction ?? 20) / 100;
          const dropWeight = Math.max(
            0,
            Math.round(prescribedWeight * Math.pow(1 - reduction, dropLevel) * 10) / 10,
          );
          working.push({
            reps: dropConfig.repsMin ?? targetReps,
            weight: dropWeight,
            done: false,
            targetReps: dropConfig.repsMin ?? targetReps,
            ...(dropConfig.repsMax !== undefined ? { targetRepMax: dropConfig.repsMax } : {}),
            dropSet: true,
            dropLevel,
          });
        }
      }
      return {
        exerciseId: item.exerciseId,
        exerciseName: ex
          ? exerciseDisplayName(ex)
          : !isExercisePlaceholder(item.exerciseName)
            ? item.exerciseName
            : "תרגיל",
        equipment: item.equipment || ex?.equipment,
        ...(item.cableGrip ? { cableGrip: item.cableGrip } : {}),
        notes: item.notes,
        targetSets: item.sets,
        targetReps,
        targetRepMax,
        repType: item.repType,
        sets: [...warmups, ...working],
      };
    });
  }, [workout, exercises, history, workoutId]);

  const [entries, setEntries] = useState<HistoryEntry[]>(initial);
  useEffect(() => {
    const saved = loadSavedSessionFeedback(workoutId, history);
    setFeedbackDraft({
      workoutId,
      discomfortNotes: saved.discomfortNotes,
    });
    setDifficultyRating(saved.difficultyRating ?? "appropriate");
    setExerciseFeedback(saved.exerciseFeedback);
  }, [workoutId]);

  useEffect(() => {
    if (hydratedFeedbackWorkoutIdRef.current === workoutId) return;
    if (!history.some((session) => session.workoutId === workoutId)) return;

    const saved = loadSavedSessionFeedback(workoutId, history);
    setFeedbackDraft({
      workoutId,
      discomfortNotes: saved.discomfortNotes,
    });
    setDifficultyRating(saved.difficultyRating ?? "appropriate");
    setExerciseFeedback(saved.exerciseFeedback);
    hydratedFeedbackWorkoutIdRef.current = workoutId;
  }, [history, workoutId]);

  useEffect(() => {
    setEntries((current) =>
      current.map((entry, index) => {
        const refreshed = initial[index];
        if (!refreshed) return entry;
        const hasPlaceholder = !entry.exerciseName || isExercisePlaceholder(entry.exerciseName);
        return hasPlaceholder ? { ...entry, exerciseName: refreshed.exerciseName } : entry;
      }),
    );
  }, [initial]);
  const [startedAt] = useState(() => Date.now());
  const entriesRef = useRef(entries);
  const videoUploadTasksRef = useRef(new Set<Promise<boolean>>());
  const videoFilesRef = useRef(new Map<number, File>());
  const restoredVideoDraftWorkoutIdRef = useRef<string | null>(null);
  const completedSaveRef = useRef(false);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const [rest, setRest] = useState(0);
  const [restFinished, setRestFinished] = useState(false);
  const [smartTimerPosition, setSmartTimerPosition] = useState<SmartTimerPosition | null>(null);
  const [smartTimerStarted, setSmartTimerStarted] = useState(false);
  const [restPaused, setRestPaused] = useState(false);
  const [restExpanded, setRestExpanded] = useState(false);
  const [restOffset, setRestOffset] = useState({ x: 0, y: 0 });
  const [pendingExit, setPendingExit] = useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousRestRef = useRef(0);
  const restCompletionVibratedRef = useRef(false);
  const vibrationAudioRef = useRef<AudioContext | null>(null);
  const finishedSessionRef = useRef<HistorySession | null>(null);
  const restDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const restDraggedRef = useRef(false);

  const prepareRestAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      if (!vibrationAudioRef.current) {
        vibrationAudioRef.current = new AudioContextCtor();
      }
      if (vibrationAudioRef.current.state === "suspended") {
        void vibrationAudioRef.current.resume();
      }
    } catch {
      vibrationAudioRef.current = null;
    }
  }, []);

  const playRestCompletionSound = useCallback(() => {
    const audioContext = vibrationAudioRef.current;
    if (!audioContext) return;

    const playTone = () => {
      try {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.34);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.36);
      } catch {
        // Some browsers can still block audio after the initial gesture.
      }
    };

    if (audioContext.state === "suspended") {
      void audioContext.resume().then(playTone).catch(() => undefined);
    } else {
      playTone();
    }
  }, []);

  const notifyRestCompletion = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      void Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    } else if (typeof navigator !== "undefined") {
      navigator.vibrate?.([180, 80, 180, 80, 320]);
    }
    playRestCompletionSound();
  }, [playRestCompletionSound]);

  const nextSmartTimerPosition = useCallback(
    (position: SmartTimerPosition): SmartTimerPosition | null => {
      const currentEntry = entries[position.exerciseIndex];
      const totalSets =
        currentEntry?.sets.filter((set) => !set.warmup).length ??
        workout?.items[position.exerciseIndex]?.sets ??
        0;
      if (position.setNumber < totalSets) {
        return { ...position, setNumber: position.setNumber + 1 };
      }

      for (
        let exerciseIndex = position.exerciseIndex + 1;
        exerciseIndex < entries.length;
        exerciseIndex += 1
      ) {
        const nextEntry = entries[exerciseIndex];
        if (nextEntry?.sets.some((set) => !set.warmup)) {
          return { exerciseIndex, setNumber: 1 };
        }
      }
      return null;
    },
    [entries, workout?.items],
  );

  useEffect(() => {
    if (!workout || hydratedEntriesWorkoutIdRef.current === workoutId) return;
    hydratedEntriesWorkoutIdRef.current = workoutId;
    setEntries(initial);
  }, [initial, workout, workoutId]);

  useEffect(() => {
    if (!workoutId || entries.length === 0) return;
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY(workoutId), JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries, workoutId]);

  useEffect(() => {
    if (
      !workoutId ||
      feedbackDraft.workoutId !== workoutId ||
      completedSaveRef.current
    ) {
      return;
    }
    try {
      localStorage.setItem(
        ACTIVE_SESSION_FEEDBACK_KEY(workoutId),
        JSON.stringify({
          difficultyRating,
          discomfortNotes,
          exerciseFeedback,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [
    difficultyRating,
    discomfortNotes,
    exerciseFeedback,
    feedbackDraft.workoutId,
    workoutId,
  ]);

  useEffect(() => {
    if (rest <= 0 || isPaused || restPaused) return;
    timerRef.current = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, rest, restPaused]);

  useEffect(() => {
    if (rest > 0) {
      restCompletionVibratedRef.current = false;
      setRestFinished(false);
    }
    if (
      previousRestRef.current > 0 &&
      rest === 0 &&
      !restCompletionVibratedRef.current &&
      typeof navigator !== "undefined"
    ) {
      restCompletionVibratedRef.current = true;
      setRestFinished(true);
      setSmartTimerPosition((current) => (current ? nextSmartTimerPosition(current) : current));
      // Native Capacitor builds use the real iOS/Android haptics API.
      // Web/PWA keeps the existing browser vibration fallback.
      notifyRestCompletion();
    }
    previousRestRef.current = rest;
  }, [entries, nextSmartTimerPosition, notifyRestCompletion, rest]);

  const labels = useMemo(() => supersetLabels(workout?.items ?? []), [workout?.items]);
  const exerciseCatalog = useMemo(
    () => canonicalizeExerciseRecords([...exercises, ...BODYWEIGHT_EXERCISES]),
    [exercises],
  );

  const currentItem = replacingIndex !== null ? workout?.items[replacingIndex] : null;
  const approvedIds = currentItem?.approvedAlternatives;
  const allowedExercisesForReplace = useMemo(() => {
    if (approvedIds && approvedIds.length > 0) {
      return exercises.filter((exercise) => approvedIds.includes(exercise.id));
    }
    const currentExercise = exerciseCatalog.find(
      (exercise) => exercise.id === currentItem?.exerciseId,
    );
    if (!currentExercise) return [];
    return exerciseCatalog
      .filter(
        (exercise) =>
          exercise.id !== currentExercise.id &&
          (exercise.muscleGroup === currentExercise.muscleGroup ||
            exercise.muscleGroups?.includes(currentExercise.muscleGroup)),
      )
      .sort(
        (a, b) =>
          Number(a.equipment !== currentExercise.equipment) -
          Number(b.equipment !== currentExercise.equipment),
      )
      .slice(0, 12);
  }, [exerciseCatalog, exercises, approvedIds, currentItem?.exerciseId]);

  useEffect(() => {
    if (!workout || restoredVideoDraftWorkoutIdRef.current === workoutId) return;
    restoredVideoDraftWorkoutIdRef.current = workoutId;
    let cancelled = false;
    void loadWorkoutVideoDrafts(workoutId)
      .then((drafts) => {
        if (cancelled) return;
        drafts.forEach(({ exerciseIndex, file }) => {
          const existingUrl = entriesRef.current[exerciseIndex]?.videoUrl;
          if (existingUrl && !existingUrl.startsWith("blob:")) {
            void removeWorkoutVideoDraft(workoutId, exerciseIndex);
            return;
          }
          selectPerformanceVideo(exerciseIndex, file);
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setVideoUploadError(
            error instanceof Error ? error.message : "לא ניתן לשחזר את סרטון האימון",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workout, workoutId]);

  if (!workout) {
    return (
      <AppShell title="אימון לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">
          אימון זה אינו קיים עוד בספרייה.
        </p>
      </AppShell>
    );
  }

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
      prepareRestAudio();
      const setNumber = entries[ei]?.sets.slice(0, si + 1).filter((set) => !set.warmup).length ?? 1;
      setSmartTimerPosition({ exerciseIndex: ei, setNumber });
      setSmartTimerStarted(true);
      const restSec = workout.items[ei]?.rest ?? 60;
      setRest(restSec);
      setRestFinished(false);
      setRestPaused(false);
    }
  };

  const startSmartRest = () => {
    if (smartTimerStarted && !smartTimerPosition) return;
    prepareRestAudio();
    const position = smartTimerPosition ?? { exerciseIndex: 0, setNumber: 1 };
    const restSeconds = workout?.items[position.exerciseIndex]?.rest ?? 60;
    setSmartTimerPosition(position);
    setSmartTimerStarted(true);
    setRest(restSeconds);
    setRestFinished(false);
    setRestPaused(false);
    setRestExpanded(true);
  };

  const replaceExercise = (ei: number, newEx: Exercise) => {
    const currentEntry = entries[ei];
    if (!currentEntry) return;
    setEntries((prev) =>
      prev.map((e, i) =>
        i === ei
          ? {
              ...e,
              exerciseId: newEx.id,
              exerciseName: exerciseDisplayName(newEx),
              equipment: newEx.equipment,
              cableGrip: undefined,
              replacedExerciseId: e.replacedExerciseId ?? e.exerciseId,
              replacedExerciseName: e.replacedExerciseName ?? e.exerciseName,
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
      localStorage.removeItem(ACTIVE_SESSION_FEEDBACK_KEY(workout.id));
    } catch {
      /* ignore */
    }
  };

  const selectPerformanceVideo = (exerciseIndex: number, file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;
    const nextUrl = URL.createObjectURL(file);
    const previousUrl = entries[exerciseIndex]?.videoUrl;
    if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
    setVideoUploadError("");
    setVideoUploadErrorExerciseIndex(null);
    videoFilesRef.current.set(exerciseIndex, file);
    setVideoUploadsInFlight((count) => count + 1);
    const entriesWithLocalVideo = entriesRef.current.map((entry, index) =>
      index === exerciseIndex ? { ...entry, videoUrl: nextUrl } : entry,
    );
    entriesRef.current = entriesWithLocalVideo;
    setEntries(entriesWithLocalVideo);
    void saveWorkoutVideoDraft(workout.id, exerciseIndex, file).catch((error: unknown) => {
      setVideoUploadErrorExerciseIndex(exerciseIndex);
      setVideoUploadError(
        error instanceof Error ? error.message : "לא ניתן לשמור את הסרטון במכשיר",
      );
    });
    let timeoutId: number | undefined;
    const upload = import("@/lib/supabase-sync").then(({ uploadWorkoutPerformanceVideo }) =>
      uploadWorkoutPerformanceVideo(file, {
        workoutId: workout.id,
        exerciseId: entries[exerciseIndex]?.exerciseId ?? String(exerciseIndex),
      }),
    );
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(
        () => reject(new Error("העלאת הסרטון נמשכת זמן רב מדי; אפשר להמשיך בלי הסרטון")),
        VIDEO_UPLOAD_TIMEOUT_MS,
      );
    });
    const uploadTask = Promise.race([upload, timeout])
      .then((uploadedUrl) => {
        const entriesWithUploadedVideo = entriesRef.current.map((entry, index) => {
          if (index !== exerciseIndex || entry.videoUrl !== nextUrl) return entry;
          return { ...entry, videoUrl: uploadedUrl };
        });
        entriesRef.current = entriesWithUploadedVideo;
        setEntries(entriesWithUploadedVideo);
        void removeWorkoutVideoDraft(workout.id, exerciseIndex);
        URL.revokeObjectURL(nextUrl);
        return true;
      })
      .catch((error: unknown) => {
        setVideoUploadErrorExerciseIndex(exerciseIndex);
        setVideoUploadError(error instanceof Error ? error.message : "העלאת סרטון הביצוע נכשלה");
        return false;
      })
      .finally(() => {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        setVideoUploadsInFlight((count) => Math.max(0, count - 1));
      });
    videoUploadTasksRef.current.add(uploadTask);
    void uploadTask.finally(() => videoUploadTasksRef.current.delete(uploadTask));
  };

  const retryPerformanceVideo = (exerciseIndex: number) => {
    const file = videoFilesRef.current.get(exerciseIndex);
    if (file) {
      selectPerformanceVideo(exerciseIndex, file);
      return;
    }
    void loadWorkoutVideoDrafts(workout.id).then((drafts) => {
      const draft = drafts.find((item) => item.exerciseIndex === exerciseIndex);
      if (draft) selectPerformanceVideo(exerciseIndex, draft.file);
    });
  };

  const totalSets = entries.reduce((a, e) => a + e.sets.filter((s) => !s.warmup).length, 0);
  const doneSets = entries.reduce(
    (a, e) => a + e.sets.filter((s) => s.done && !s.warmup).length,
    0,
  );

  const handleFinishConfirm = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setFinishError("");
    const pendingVideoUploads = [...videoUploadTasksRef.current];
    if (pendingVideoUploads.length > 0) {
      const uploadResults = await Promise.race([
        Promise.all(pendingVideoUploads),
        new Promise<boolean[] | null>((resolve) =>
          window.setTimeout(() => resolve(null), VIDEO_UPLOAD_TIMEOUT_MS),
        ),
      ]);
      if (uploadResults === null || uploadResults.some((uploaded) => !uploaded)) {
        setIsFinishing(false);
        setFinishError(
          uploadResults === null
            ? "הסרטון עדיין עולה. המתיני רגע ונסי לסיים שוב."
            : "הסרטון לא נשמר בענן. נסי שוב לפני סיום האימון.",
        );
        return;
      }
    }
    const currentEntries = entriesRef.current;
    const allSetsCompleted =
      currentEntries.length > 0 &&
      currentEntries.every((entry) => {
        const workingSets = entry.sets.filter((set) => !set.warmup);
        return workingSets.length > 0 && workingSets.every((set) => set.done);
      });
    const existingSession = finishedSessionRef.current;
    let sessionWithoutDiscomfort: Omit<HistorySession, "discomfortNotes">;
    if (existingSession) {
      const { discomfortNotes: _previousDiscomfortNotes, ...existingWithoutDiscomfort } =
        existingSession;
      sessionWithoutDiscomfort = existingWithoutDiscomfort;
    } else {
      sessionWithoutDiscomfort = {
        id: uid(),
        workoutId: workout.id,
        workoutName: workout.name,
        ...(currentProgram?.name ? { programName: currentProgram.name } : {}),
        date: new Date().toISOString(),
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        entries: [],
      };
    }
    finishedSessionRef.current = {
      ...sessionWithoutDiscomfort,
      entries: currentEntries.map((e, index) => {
        const { videoUrl, ...entryWithoutVideo } = e;
        return {
          ...entryWithoutVideo,
          ...(videoUrl && !videoUrl.startsWith("blob:") ? { videoUrl } : {}),
          sets: e.sets.filter((s) => s.done),
          ...(exerciseFeedback[index]?.rating || exerciseFeedback[index]?.notes.trim()
            ? {
                feedback: {
                  ...(exerciseFeedback[index]?.rating
                    ? { rating: exerciseFeedback[index].rating }
                    : {}),
                  ...(exerciseFeedback[index]?.notes.trim()
                    ? { notes: exerciseFeedback[index].notes.trim() }
                    : {}),
                },
              }
            : {}),
        };
      }),
      difficultyRating,
      ...(discomfortNotes.trim() ? { discomfortNotes: discomfortNotes.trim() } : {}),
    };
    saveSession(finishedSessionRef.current);
    const syncResult = await flushCloudSync();
    if (!syncResult.success) {
      setIsFinishing(false);
      setFinishError(syncResult.error ?? "שמירת האימון נכשלה. נסי שוב.");
      return;
    }
    completedSaveRef.current = true;
    clearSavedSession();
    setShowFeedbackModal(false);
    setIsFinishing(false);
    setSavedSummary(finishedSessionRef.current);
    setShowSummaryModal(true);
    if (allSetsCompleted) {
      setShowCompletionConfetti(true);
    }
    if (summaryNavigationTimerRef.current !== null) {
      window.clearTimeout(summaryNavigationTimerRef.current);
    }
    summaryNavigationTimerRef.current = window.setTimeout(() => {
      setShowSummaryModal(false);
      navigate({ to: "/programs" });
    }, 3200);
  };

  const progress = totalSets ? (doneSets / totalSets) * 100 : 0;
  const toggleBodyweightMode = () => {
    const regularWorkout = regularWorkoutSnapshot.current ?? workout;
    if (!regularWorkout) return;

    if (isBodyweightMode) {
      const regularEntries = regularWorkout.items.map((item, index) => {
        const source = exercises.find((exercise) => exercise.id === item.exerciseId);
        return {
          index,
          exerciseId: item.exerciseId,
          exerciseName: source ? exerciseDisplayName(source) : item.exerciseName ?? "תרגיל",
          equipment: item.equipment || source?.equipment,
          ...(item.cableGrip ? { cableGrip: item.cableGrip } : {}),
        };
      });
      setEntries((current) =>
        current.map((entry, index) => {
          const regular = regularEntries[index];
          if (!regular) return entry;
          return {
            ...entry,
            exerciseId: regular.exerciseId,
            exerciseName: regular.exerciseName,
            ...(regular.equipment ? { equipment: regular.equipment } : {}),
            ...(regular.cableGrip ? { cableGrip: regular.cableGrip } : {}),
            sets: entry.sets.map((set, setIndex) => ({
              ...set,
              weight: regularWorkout.items[index]?.workingSets?.[setIndex]?.weight ?? set.weight,
            })),
          };
        }),
      );
      setIsBodyweightMode(false);
      setBodyweightNotice("האימון חזר לגרסה הרגילה. השינוי לא שינה את התוכנית המקורית.");
      return;
    }

    const bodyweightItems = replaceWithBodyweight(regularWorkout.items, exerciseCatalog);
    setEntries((current) =>
      current.map((entry, index) => {
        const bodyItem = bodyweightItems[index];
        const bodyExercise = bodyItem
          ? exerciseCatalog.find((exercise) => exercise.id === bodyItem.exerciseId)
          : undefined;
        if (!bodyItem || !bodyExercise) return entry;
        return {
          ...entry,
          exerciseId: bodyExercise.id,
          exerciseName: bodyExercise.name,
          ...(bodyExercise.equipment ? { equipment: bodyExercise.equipment } : {}),
          cableGrip: undefined,
          sets: entry.sets.map((set) => ({ ...set, weight: 0 })),
        };
      }),
    );
    setIsBodyweightMode(true);
    setBodyweightNotice("עברת לגרסת משקל גוף. התוכנית המקורית נשארת ללא שינוי.");
  };

  const handleRestPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    restDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: restOffset.x,
      offsetY: restOffset.y,
    };
    restDraggedRef.current = false;
  };

  const handleRestPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = restDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) < 4) return;
    restDraggedRef.current = true;
    setRestOffset({
      x: Math.max(-window.innerWidth + 96, Math.min(16, drag.offsetX + deltaX)),
      y: Math.max(-window.innerHeight + 160, Math.min(160, drag.offsetY + deltaY)),
    });
  };

  const handleRestPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (restDragRef.current?.pointerId === event.pointerId) {
      restDragRef.current = null;
    }
  };

  return (
    <AppShell
      kicker={currentProgram?.name ?? "אימון"}
      title={workout.name}
      subtitle={`${doneSets} מתוך ${totalSets} סטים · בהצלחה!`}
      compactHeader
      pageClassName="session-compact"
      headerAccessory={
        <button
          type="button"
          onClick={toggleBodyweightMode}
          aria-pressed={isBodyweightMode}
          aria-label={isBodyweightMode ? "חזרה לאימון רגיל" : "הפעלת אימון משקל גוף"}
          title={isBodyweightMode ? "חזרה לאימון רגיל" : "הפעלת אימון משקל גוף"}
          className={`bodyweight-header-toggle press rounded-full border px-2 py-1 text-[9px] font-medium transition-colors ${
            isBodyweightMode
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
          }`}
        >
          {isBodyweightMode ? "משקל גוף פעיל" : "אימון משקל גוף"}
        </button>
      }
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
      {showCompletionConfetti && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
              aria-live="polite"
            >
              <div className="absolute inset-x-0 top-[22%] text-center">
                <div className="inline-flex rounded-2xl bg-white/95 px-5 py-3 text-lg font-extrabold text-ink shadow-xl">
                  כל הכבוד! האימון הושלם
                </div>
              </div>
              {Array.from({ length: 160 }, (_, index) => (
                <span
                  key={index}
                  className="confetti-piece"
                  style={
                    {
                      left: `${(index * 47 + (index % 7) * 3) % 101}%`,
                      animationDelay: `${(index % 22) * 35}ms`,
                      animationDuration: `${2200 + (index % 7) * 180}ms`,
                      backgroundColor: [
                        "var(--primary)",
                        "var(--rose)",
                        "var(--accent)",
                        "#111111",
                        "#f59e0b",
                      ][index % 5],
                      "--confetti-x": `${((index * 29) % 180) - 90}px`,
                      "--confetti-rotate": `${540 + ((index * 61) % 900)}deg`,
                      "--confetti-scale": `${0.8 + (index % 4) * 0.15}`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>,
            document.body,
          )
        : null}

      {/* Pause Banner */}
      {isPaused && (
        <div className="surface-card p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-center font-bold text-xs mb-3">
          ⏸ האימון מושהה כעת. {genderText(gender, "חזרי", "חזור")} מתי שנוח לך!
        </div>
      )}

      {/* Progress bar */}
      <div className="workout-progress-sticky surface-card flex items-center gap-2 px-3 py-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
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
        </div>
      </div>
      {bodyweightNotice ? (
        <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-800">
          {bodyweightNotice}
        </p>
      ) : null}
      <div className="mt-3 space-y-3">
        {entries.map((entry, ei) => {
          const item = workout.items[ei];
          const supersetLabel = labels[ei];
          const previousPerformance = lastPerformance(history, entry.exerciseId);
          const suggestion = progressionSuggestion(
            history,
            entry,
            entry.targetRepMax,
            history.find((session) => session.entries.some((itemEntry) => itemEntry.exerciseId === entry.exerciseId))
              ?.difficultyRating,
          );
          const fullExercise =
            findExerciseForItem({ exerciseId: entry.exerciseId } as WorkoutItem, exerciseCatalog) ??
            exerciseCatalog.find((e) => e.name === entry.exerciseName);
          const isSupersetFirst =
            item?.supersetOrder === 1 || Boolean(supersetLabel?.endsWith("1"));

          return (
            <article
              key={`${entry.exerciseId}-${ei}`}
              className={`surface-card rounded-[1.1rem] p-3 text-start ${
                supersetLabel ? "border-s-4 border-s-primary rounded-s-none" : ""
              }`}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
                <button
                  type="button"
                  onClick={() => fullExercise && setCardExercise(fullExercise)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary press cursor-pointer"
                  aria-label={`פתח פרטי ${entry.exerciseName}`}
                >
                  <Info className="h-4 w-4" strokeWidth={2} />
                </button>
                <div className="min-w-0 flex-1 text-start">
                  <div className="flex min-w-0 items-start gap-2">
                    {supersetLabel ? (
                      <span className="shrink-0 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                        {supersetLabel}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => fullExercise && setCardExercise(fullExercise)}
                      className="min-w-0 flex-1 whitespace-normal break-normal text-start font-display text-[14px] leading-snug font-semibold text-ink hover:text-primary cursor-pointer"
                    >
                      {entry.exerciseName}
                    </button>
                  </div>
                  {entry.equipment ? (
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                      {entry.equipment}
                      {entry.cableGrip ? ` · מאחז: ${entry.cableGrip}` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReplacingIndex(ei)}
                    className="press grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-primary cursor-pointer"
                    title="תחליף מורשה"
                    aria-label="תחליף מורשה"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  {!isSupersetFirst ? (
                    <button
                      type="button"
                      onClick={() => {
                        prepareRestAudio();
                        setRest(item?.rest ?? 60);
                        setRestPaused(false);
                      }}
                      className="press flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-ink cursor-pointer"
                      aria-label="התחל מנוחה"
                    >
                      <Timer className="h-3.5 w-3.5 text-primary" />
                      {item?.rest ?? 60}ש׳
                    </button>
                  ) : null}
                </div>
              </div>

              {item?.techniqueNotes ? (
                <div className="mt-2 rounded-2xl bg-primary/5 p-2 text-[11px] text-primary font-medium border border-primary/10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>הנחיית טכניקה ממאמן: {item.techniqueNotes}</span>
                </div>
              ) : null}

              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-secondary/35 p-2 text-[10px]">
                  <p className="font-bold text-muted-foreground">יעד היום</p>
                  <p className="mt-1 font-extrabold text-ink">
                    {entry.targetSets ?? item?.sets ?? 0} סטים · {entry.targetReps ?? item?.reps ?? 0}
                    {entry.targetRepMax ? `–${entry.targetRepMax}` : ""} חזרות
                    {item?.targetWeight || item?.weight ? ` · ${item.targetWeight || item.weight} ק״ג` : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-secondary/35 p-2 text-[10px]">
                  <p className="font-bold text-muted-foreground">בפעם הקודמת</p>
                  <p className="mt-1 font-extrabold text-ink">
                    {previousPerformance
                      ? `${previousPerformance.sets.length} סטים · עד ${Math.max(
                          ...previousPerformance.sets.map((set) => set.weight),
                        )} ק״ג`
                      : "אין ביצוע קודם עדיין"}
                  </p>
                </div>
              </div>
              {suggestion ? (
                <div className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 p-2.5">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-primary">הצעה להמשך · באישור שלך</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink">{suggestion.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEntries((current) =>
                          current.map((currentEntry, index) =>
                            index !== ei
                              ? currentEntry
                              : {
                                  ...currentEntry,
                                  sets: currentEntry.sets.map((set) =>
                                    set.warmup || set.done ? set : { ...set, weight: suggestion.weight },
                                  ),
                                },
                          ),
                        );
                        setApprovedProgression((current) => ({ ...current, [ei]: true }));
                      }}
                      disabled={approvedProgression[ei]}
                      className="press shrink-0 rounded-xl bg-primary px-2.5 py-2 text-[10px] font-bold text-primary-foreground disabled:opacity-60"
                    >
                      {approvedProgression[ei] ? "אושר" : "אישור"}
                    </button>
                  </div>
                </div>
              ) : null}

                <div className="mt-2">
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  ביצוע בפועל
                </p>
                <div className="space-y-1.5">
                  {entry.sets.map((s, si) => {
                    const workingIndex = entry.sets
                      .slice(0, si + 1)
                      .filter((x) => !x.warmup).length;
                    const setLabel = s.warmup ? "חימום" : `סט ${workingIndex}`;
                    return (
                      <div
                        key={si}
                        className={`rounded-2xl border p-2.5 transition-all ${
                          s.done
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/60 bg-secondary/60"
                        }`}
                      >
                         <div className="flex items-center gap-1.5">
                          <span
                             className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold ${
                              s.done
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            {s.warmup ? "ח" : workingIndex}
                          </span>
                          <div className="min-w-0 flex-1 text-start">
                            <p className="break-words text-[12px] leading-snug font-semibold text-ink">
                              {s.dropSet ? `דרופ סט ${s.dropLevel ?? ""}` : setLabel}
                              <span className="ms-1 text-[11px] font-normal text-muted-foreground">
                                · {s.weight} ק״ג · {s.targetReps}
                                {s.targetRepMax ? `–${s.targetRepMax}` : ""} חזרות
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleSetDone(ei, si)}
                             className={`press grid h-10 w-10 place-items-center rounded-2xl text-[12px] font-bold transition-colors cursor-pointer ${
                              s.done
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                            aria-label={s.done ? "בטל סיום סט" : "סמן סט כבוצע"}
                          >
                             <Check className="h-4 w-4" strokeWidth={2.6} />
                          </button>
                        </div>
                        {s.notes ? (
                          <p className="mt-2 rounded-xl bg-primary/5 px-2.5 py-2 text-right text-[11.5px] font-medium text-primary">
                            {s.notes}
                          </p>
                        ) : null}
                         <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                          <Stepper
                            label="משקל בפועל"
                            value={s.weight}
                            step={0.5}
                            suffix="ק״ג"
                            compact
                            onChange={(v) => patchSet(ei, si, { weight: v })}
                          />
                          <Stepper
                            label="חזרות בפועל"
                            value={s.reps}
                            min={0}
                            compact
                            onChange={(v) => patchSet(ei, si, { reps: v })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* The athlete's demonstration video is intentionally last:
                  it belongs to the completed exercise, after all sets. */}
              <div className="mt-3 rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="col-span-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10">
                    <ImagePlus className="h-4 w-4" />
                    <span>{entry.videoUrl ? "החלפה מהגלריה" : "בחירה מהגלריה"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(event) => {
                        selectPerformanceVideo(ei, event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                {entry.videoUrl ? (
                  <video
                    className="mt-2 max-h-52 w-full rounded-xl bg-black object-contain"
                    src={entry.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`סרטון ביצוע ${entry.exerciseName}`}
                  />
                ) : null}
                {videoUploadsInFlight > 0 && entry.videoUrl?.startsWith("blob:") ? (
                  <p className="mt-2 text-[10px] font-semibold text-primary">
                    הסרטון נשמר במכשיר ומועלה לענן…
                  </p>
                ) : null}
                {videoUploadError && videoUploadErrorExerciseIndex === ei ? (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-rose-50 px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-destructive">{videoUploadError}</p>
                    <button
                      type="button"
                      onClick={() => retryPerformanceVideo(ei)}
                      className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-primary"
                    >
                      נסי שוב
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 rounded-2xl border border-border/60 bg-background p-3">
                <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  איך היה התרגיל?
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      ["easy", "קל"],
                      ["appropriate", "מתאים"],
                      ["difficult", "כבד"],
                    ] as const
                  ).map(([rating, label]) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setExerciseFeedback((current) => ({
                          ...current,
                          [ei]: { ...current[ei], rating, notes: current[ei]?.notes ?? "" },
                        }))
                      }
                      className={`rounded-xl border px-2 py-2 text-[11px] font-bold ${
                        exerciseFeedback[ei]?.rating === rating
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={exerciseFeedback[ei]?.notes ?? ""}
                  onChange={(event) =>
                    setExerciseFeedback((current) => ({
                      ...current,
                      [ei]: { ...current[ei], notes: event.target.value },
                    }))
                  }
                  placeholder="כאב, אי־נוחות או הערה למאמנת..."
                  className="mt-2 min-h-14 w-full rounded-xl border border-border/60 bg-white p-2 text-[11px] text-ink outline-none focus:border-primary"
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <PrimaryButton
          onClick={() => {
            setFinishError("");
            setShowFeedbackModal(true);
          }}
          leading={<Check className="h-4 w-4" strokeWidth={2.4} />}
        >
          סיים ושמור אימון
        </PrimaryButton>
      </div>

      {/* Exercise Detail Sheet Modal */}
      {cardExercise ? (
        <Overlay
          open={Boolean(cardExercise)}
          onClose={() => setCardExercise(null)}
          variant="center"
          ariaLabel="פרטי תרגיל"
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-ink">{exerciseDisplayName(cardExercise)}</h3>
              <button
                onClick={() => setCardExercise(null)}
                className="text-muted-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[min(70dvh,38rem)] space-y-3 overflow-y-auto overscroll-contain pe-1 text-xs">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
                  שריר עיקרי: {cardExercise.muscleGroup}
                </span>
                {(cardExercise.muscleGroups ?? [])
                  .filter((group) => group !== cardExercise.muscleGroup)
                  .map((group) => (
                    <span
                      key={group}
                      className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground"
                    >
                      {group}
                    </span>
                  ))}
                <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                  ציוד: {cardExercise.equipment}
                </span>
                {cardExercise.category ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                    {cardExercise.category}
                  </span>
                ) : null}
              </div>
              {cardExercise.description ? (
                <div className="rounded-xl bg-secondary/50 p-3 space-y-1">
                  <p className="font-bold text-ink">על התרגיל</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {cardExercise.description}
                  </p>
                </div>
              ) : null}
              {cardExercise.instructions ? (
                <div className="rounded-xl bg-secondary/50 p-3 space-y-1">
                  <p className="font-bold text-ink">הוראות ביצוע</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {cardExercise.instructions}
                  </p>
                </div>
              ) : null}
              {cardExercise.tips ? (
                <div className="rounded-xl bg-secondary/50 p-3 space-y-1">
                  <p className="font-bold text-ink">דגשי טכניקה וטיפים</p>
                  <p className="text-muted-foreground leading-relaxed">{cardExercise.tips}</p>
                </div>
              ) : null}
              {(() => {
                const videos = [
                  gender === "female" ? cardExercise.videoFemaleUrl : cardExercise.videoMaleUrl,
                  cardExercise.videoUrl,
                  ...(cardExercise.videoUrls ?? []),
                ].filter(
                  (url, index, all): url is string => Boolean(url) && all.indexOf(url) === index,
                );
                return videos.length ? (
                  <div className="space-y-2">
                    <p className="font-bold text-ink">סרטון הדגמה</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {videos.map((url, index) => (
                        <video
                          key={`${url}-${index}`}
                          src={url}
                          controls
                          preload="metadata"
                          playsInline
                          className="aspect-video w-full rounded-2xl border border-border/60 bg-black object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </Overlay>
      ) : null}

      {/* Post Workout Feedback Modal */}
      {showFeedbackModal && (
        <Overlay
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          ariaLabel="משוב על האימון"
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                {doneSets >= totalSets ? "אימון מצוין! איך הרגשת?" : "סיימת את החלק שמתאים לך היום"}
              </h3>
              <p className="text-xs text-muted-foreground">המשוב יישמר בהיסטוריית האימון שלך</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground">דרגת קושי</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "easy", label: "קל מדי", icon: Smile, color: "text-emerald-600" },
                    { id: "appropriate", label: "מדויק", icon: Meh, color: "text-primary" },
                    { id: "difficult", label: "קשה מדי", icon: Frown, color: "text-rose-600" },
                  ] as const
                ).map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDifficultyRating(id)}
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

            {finishError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                {finishError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleFinishConfirm()}
              disabled={isFinishing}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-md cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFinishing ? "שומרת את האימון..." : "אישור ושמירת אימון"}
            </button>
          </div>
        </Overlay>
      )}

      {showSummaryModal && savedSummary ? (
        <Overlay
          open={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          ariaLabel="סיכום אימון"
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                {sessionSummaryStats(savedSummary).doneSets >= totalSets ? (
                  <Award className="h-7 w-7" />
                ) : (
                  <Check className="h-7 w-7" />
                )}
              </div>
              <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-primary uppercase">Workout report</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                {sessionSummaryStats(savedSummary).doneSets >= totalSets ? "האימון הושלם" : "האימון נשמר חלקית"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">הנה תמונת מצב קצרה של הביצוע שלך.</p>
            </div>
            {(() => {
              const summary = sessionSummaryStats(savedSummary);
              const firstEntry = savedSummary.entries.find((entry) =>
                entry.sets.some((set) => set.done && !set.warmup),
              );
              const previousPr = firstEntry ? personalRecords(history, firstEntry.exerciseId) : null;
              const currentMax = summary.maxWeight;
              const isNewPr = Boolean(firstEntry && previousPr && currentMax > previousPr.heaviest);
              return (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["סטים", `${summary.doneSets}/${totalSets}`],
                      ["נפח", `${Math.round(summary.volume)} ק״ג`],
                      ["משך", `${Math.max(1, Math.round(summary.durationSec / 60))} דק׳`],
                      ["קושי", savedSummary.difficultyRating === "easy" ? "קל" : savedSummary.difficultyRating === "difficult" ? "קשה" : "מדויק"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-secondary/55 p-3">
                        <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm font-extrabold text-ink">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`rounded-2xl border p-3 ${isNewPr ? "border-amber-300 bg-amber-50" : "border-primary/20 bg-primary/5"}`}>
                    <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      {isNewPr ? <Award className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      {isNewPr ? "שיא אישי חדש" : "הצעד הבא"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink">
                      {isNewPr
                        ? `המשקל המרבי שלך היום היה ${currentMax} ק״ג. כל הכבוד על ההתקדמות.`
                        : savedSummary.discomfortNotes
                          ? "שמנו לב שדיווחת על אי־נוחות. כדאי לעדכן את המאמן לפני האימון הבא."
                          : "הנתונים נשמרו. באימון הבא בדקי את היעד וההצעה לפני שאת מתחילה."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (summaryNavigationTimerRef.current !== null) {
                          window.clearTimeout(summaryNavigationTimerRef.current);
                        }
                        setShowSummaryModal(false);
                        navigate({ to: "/" });
                      }}
                      className="press flex-1 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground"
                    >
                      חזרה לשבוע שלי
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (summaryNavigationTimerRef.current !== null) {
                          window.clearTimeout(summaryNavigationTimerRef.current);
                        }
                        setShowSummaryModal(false);
                        navigate({ to: "/programs" });
                      }}
                      className="press rounded-2xl bg-secondary px-3 py-3 text-xs font-bold text-ink"
                    >
                      לתכניות
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </Overlay>
      ) : null}

      {/* Portal the timer to body so page-entry transforms and scrolling can never hide it. */}
      {typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[60]"
              style={{
                bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
                right: "max(1rem, env(safe-area-inset-right))",
              }}
            >
              <div
                className={`ink-card select-none ${
                  restExpanded
                    ? "w-48 rounded-2xl p-2.5"
                    : "grid h-16 w-16 place-items-center rounded-full"
                }`}
                style={{
                  transform: `translate(${restOffset.x}px, ${restOffset.y}px)`,
                  touchAction: "none",
                }}
                onPointerDown={handleRestPointerDown}
                onPointerMove={handleRestPointerMove}
                onPointerUp={handleRestPointerUp}
                onPointerCancel={handleRestPointerUp}
                onClick={() => {
                  if (restDraggedRef.current) {
                    restDraggedRef.current = false;
                    return;
                  }
                  if (rest > 0) {
                    setRestPaused((paused) => !paused);
                  } else {
                    startSmartRest();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={
                  rest > 0
                    ? restPaused
                      ? "המשך טיימר מנוחה"
                      : "עצור טיימר מנוחה"
                    : restFinished
                      ? "הזמן הסתיים"
                      : "פתח טיימר מנוחה"
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (rest > 0) {
                      setRestPaused((paused) => !paused);
                    } else {
                      startSmartRest();
                    }
                  }
                }}
              >
                {restExpanded ? (
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15">
                      <Timer className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-[9px] font-semibold tracking-[0.14em] text-primary-foreground/80 uppercase">
                        זמן מנוחה
                      </p>
                      <p
                        className="font-display text-[17px] font-semibold tabular-nums text-primary-foreground"
                        aria-live="assertive"
                      >
                        {rest > 0
                          ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, "0")}`
                          : restFinished
                            ? "הזמן הסתיים"
                            : "מוכן"}
                      </p>
                      {smartTimerPosition ? (
                        <p className="truncate text-[9px] text-primary-foreground/70">
                          {entries[smartTimerPosition.exerciseIndex]?.exerciseName ?? "תרגיל"} · סט{" "}
                          {smartTimerPosition.setNumber}
                        </p>
                      ) : null}
                    </div>
                    {rest <= 0 ? (
                      <div className="flex items-center gap-1">
                        {[30, 60, 90].map((seconds) => (
                          <button
                            key={seconds}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setRest(seconds);
                              setRestFinished(false);
                              setRestPaused(false);
                              setRestExpanded(false);
                            }}
                            className="press rounded-lg bg-white/15 px-1.5 py-1 text-[10px] font-bold text-primary-foreground hover:bg-white/25"
                          >
                            {seconds}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold text-primary-foreground/80">
                        {restPaused ? "מושהה" : "פעיל"}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Timer className="mx-auto h-4 w-4 text-primary-foreground/80" />
                    <p
                      className="mt-0.5 font-display text-[12px] font-bold tabular-nums text-primary-foreground"
                      aria-live="assertive"
                    >
                      {rest > 0
                        ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, "0")}`
                        : restFinished
                          ? "הזמן הסתיים"
                          : "טיימר"}
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Replace Exercise Modal */}
      {replacingIndex !== null ? (
        <Overlay
          open={replacingIndex !== null}
          onClose={() => setReplacingIndex(null)}
          variant="bottom"
          ariaLabel="בחירת תרגיל חלופי"
        >
          <div
            className="scale-in max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-ink">
                {approvedIds?.length ? "תרגיל חלופי מאושר" : "חלופות מתאימות"}
              </h2>
              <IconButton aria-label="סגור" onClick={() => setReplacingIndex(null)} variant="ghost">
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <div className="mt-4 space-y-2 pb-6">
              {!approvedIds?.length ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-900">
                  לא הוגדרו חלופות מאושרות. מוצגות הצעות מאותה קבוצת שרירים, עם עדיפות לציוד דומה.
                </p>
              ) : null}
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
                  <p className="font-bold text-ink">לא נמצאו חלופות מתאימות</p>
                  <p>אין תרגיל מאושר או מאותה קבוצת שרירים בספרייה עבור תרגיל זה.</p>
                </div>
              )}
            </div>
          </div>
        </Overlay>
      ) : null}

      <ConfirmSheet
        open={pendingExit}
        title="לצאת מהאימון?"
        description={genderText(
          gender,
          "ההתקדמות והמשוב יישמרו במכשיר כדי שתוכלי להמשיך מאוחר יותר.",
          "ההתקדמות והמשוב יישמרו במכשיר כדי שתוכל להמשיך מאוחר יותר.",
        )}
        confirmLabel={genderText(gender, "צאי ושמרי להמשך", "צא ושמור להמשך")}
        cancelLabel={genderText(gender, "המשיכי באימון", "המשך באימון")}
        onConfirm={() => {
          setPendingExit(false);
          navigate({ to: "/programs" });
        }}
        onCancel={() => setPendingExit(false)}
      />
    </AppShell>
  );
}
