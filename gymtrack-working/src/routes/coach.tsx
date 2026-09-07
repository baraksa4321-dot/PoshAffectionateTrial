import { Link, Navigate, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Apple,
  Award,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Crown,
  Dumbbell,
  Edit2,
  Plus,
  Save,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  MessageSquare,
  Search,
  UserCog,
  ArrowRightLeft,
  Activity,
  CheckCircle2,
  Clock3,
  Calculator,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "../components/AppShell";
import { FreeTextInput } from "../components/FreeTextInput";
import { Overlay } from "../components/ui-app/Overlay";
import {
  emptyExercise,
  foodTotals,
  savePlannedMeals,
  saveProgram,
  saveExercise,
  saveLoadingAnimationsPreference,
  saveWorkout,
  saveWorkoutInProgram,
  deleteProgram,
  searchFoods,
  todayKey,
  uid,
  useAuthUser,
  useGym,
} from "../lib/gym-store";
import {
  pullClientDataForCoach,
  type RealtimeConnectionStatus,
  subscribeToCoachClientChanges,
  subscribeToCoachManagementChanges,
} from "../lib/supabase-sync";
import { supabase } from "../lib/supabase";
import {
  clientNutritionTargetUpsertPayload,
  clientPlannedMenuRpcPayload,
  clientProgramDayInsertPayload,
  clientProgramDayItemsUpdatePayload,
  clientProgramInsertPayload,
} from "../lib/coach-plan-payloads";
import { calculateCalorieEstimate } from "../lib/calorie-calculator";
import {
  exerciseDisplayName,
  exerciseEquipmentOptions,
  exerciseGripOptions,
  selectedExerciseEquipmentOptions,
  uniqueCanonicalExercises,
} from "../lib/exercise-library";
import { loadCoachMessages, sendCoachMessage } from "../lib/coach-messages";
import {
  getNextWorkoutReportWeekOffset,
  getWorkoutReportSessionForDate,
  getWorkoutReportSessions,
  getWorkoutSessionsForDate,
  getWorkoutReportWeekDates,
  dedupeWorkoutItems,
  reportDateKey,
  reportSessionDateKey,
} from "../lib/gym-types";
import type {
  BodyMeasurement,
  BroadcastAnnouncement,
  CoachMessage,
  Exercise,
  HistoryEntry,
  HistorySession,
  Meal,
  MealFood,
  Program,
  UserRole,
  Workout,
  WorkoutItem,
} from "../lib/gym-types";
import { EQUIPMENT } from "../lib/gym-types";
import { genderText } from "../lib/gender-copy";
import {
  defaultFoodQuantity,
  foodQuantityOptions,
  mealFoodFromPortion,
  mealFoodQuantityLabel,
  type FoodQuantityUnit,
} from "../lib/food-portions";

type CoachClientRow = {
  id: string;
  client_id: string;
  created_at: string;
  profiles?: { email?: string | null; full_name?: string | null; weight_kg?: number | null } | null;
};

type ExerciseBuilderReturnContext = {
  returnUrl: string;
  clientId: string | null;
  programId: string | null;
  dayId: string | null;
  scrollY: number;
};

const sideLoadedEquipment = new Set([
  "מוט",
  "מוט w / ez",
  "סמית' משין",
  "מכונה",
  "barbell",
  "smith machine",
  "machine",
]);

function isSideLoadedEquipment(equipment?: string | null) {
  const normalized = equipment?.trim().toLocaleLowerCase() ?? "";
  return (
    sideLoadedEquipment.has(normalized) ||
    normalized.startsWith("מוט") ||
    normalized.includes("smith") ||
    normalized.includes("סמית") ||
    normalized.includes("מכונה")
  );
}

function weightInputLabel(equipment?: string | null, includeUnit = true) {
  if (isSideLoadedEquipment(equipment)) {
    return includeUnit ? "משקל לכל צד (ק״ג)" : "משקל לכל צד";
  }
  return includeUnit ? "משקל (ק״ג)" : "משקל";
}

function weightValueUnit(equipment?: string | null) {
  return isSideLoadedEquipment(equipment) ? "ק״ג לכל צד" : "ק״ג";
}

function SearchPickerField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = options
    .filter((option) => option.toLocaleLowerCase().includes(normalizedQuery))
    .slice(0, 12);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  return (
    <div className="relative">
      <label className="block text-[10px] font-bold text-primary">{label}</label>
      <div className="relative mt-1.5">
        <Search
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60"
          aria-hidden="true"
        />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-primary/20 bg-background pe-9 ps-3 text-xs font-bold text-ink outline-none focus:border-primary"
        />
      </div>
      {open ? (
        <>
          <button
            type="button"
            aria-label={`סגירת ${label}`}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            aria-label={`אפשרויות ${label}`}
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded-xl border border-primary/20 bg-white p-1 shadow-lg"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(option);
                    setOpen(false);
                    onChange(option);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-right text-xs font-semibold ${
                    option === value ? "bg-primary/10 text-primary" : "text-ink hover:bg-secondary"
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-[11px] text-muted-foreground">
                לא נמצא ציוד מתאים.
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function getAppScrollContainer() {
  return document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');
}

type WorkoutSetMode = "normal" | "warmup" | "drop" | "superset";

function warmupFirstIndexes(modes: WorkoutSetMode[]) {
  return modes
    .map((mode, index) => ({ mode, index }))
    .sort((a, b) => Number(b.mode === "warmup") - Number(a.mode === "warmup"))
    .map(({ index }) => index);
}

function reorderSetValues<T>(values: T[], indexes: number[], fallback: T) {
  return indexes.map((index) => values[index] ?? fallback);
}

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: UserRole | null;
  created_at?: string | null;
  approval_status?: "pending" | "approved" | "rejected" | null;
  coach_id?: string | null;
  coach_ids?: string[];
  show_calories?: boolean | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  workouts_per_week?: number | null;
  gender?: string | null;
  loading_animations_enabled?: boolean | null;
  profile_exists?: boolean;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
};

type OwnerAuthUserRow = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  created_at?: string | null;
  profile_exists?: boolean;
};

type ClientFeedbackRow = {
  id: string;
  client_id: string;
  difficulty_rating?: string | null;
  discomfort_notes?: string | null;
  coach_notes?: string | null;
  created_at?: string | null;
};

type ClientDetails = Awaited<ReturnType<typeof pullClientDataForCoach>>;

type AttentionReason =
  | "workout-missing"
  | "nutrition-missing"
  | "checkin-late"
  | "difficulty"
  | "unanswered-message";
type AttentionDataStatus = "stable" | "needs-attention" | "insufficient";
type AttentionItem = {
  clientId: string;
  clientName: string;
  reasons: Array<{ key: AttentionReason; label: string }>;
  status: AttentionDataStatus;
  lastActivity: string | null;
  fourWeekWorkoutRate: number | null;
  fourWeekNutritionRate: number | null;
  fourWeekWorkoutChange: number;
  fourWeekNutritionChange: number;
  checkinComparison: {
    currentDifficulty?: string;
    previousDifficulty?: string;
    currentDiscomfort?: string;
    previousDiscomfort?: string;
  };
  reviewed: boolean;
  privateNote: string;
};

const ATTENTION_STORAGE_KEY = "gymtrack-coach-attention-v1";
const ATTENTION_DAY_MS = 24 * 60 * 60 * 1000;

function attentionDateKey(value: string | undefined | null) {
  return value ? value.slice(0, 10) : "";
}

function attentionDaysAgo(date: string | undefined | null, now: number) {
  if (!date) return Infinity;
  return Math.max(0, Math.floor((now - new Date(`${attentionDateKey(date)}T23:59:59`).getTime()) / ATTENTION_DAY_MS));
}

function attentionActivityDate(details: ClientDetails) {
  return [
    ...details.history.map((item) => item.date),
    ...details.nutritionDays.map((item) => item.date),
    ...details.habits.map((item) => item.date),
    ...details.bodyMeasurements.map((item) => item.date),
    ...details.coachMessages.map((item) => item.createdAt),
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
}

function attentionReasonLabel(reason: AttentionReason) {
  return reason === "workout-missing"
    ? "אימון חסר"
    : reason === "nutrition-missing"
      ? "תזונה חסרה"
      : reason === "checkin-late"
        ? "צ׳ק־אין באיחור"
        : reason === "difficulty"
          ? "קושי או אי־נוחות"
          : "הודעה שלא נענתה";
}

function ExerciseBuilderPlacement({
  exerciseId,
  children,
}: {
  exerciseId: string | null;
  children: React.ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setAnchor(null);
      return;
    }
    setAnchor(
      document.querySelector<HTMLElement>(`[data-exercise-builder-anchor="${exerciseId}"]`),
    );
  }, [exerciseId]);

  if (!exerciseId) return children;
  return anchor ? createPortal(children, anchor) : null;
}

function WorkoutSurfacePlacement({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      setAnchor(null);
      return;
    }
    setAnchor(document.querySelector<HTMLElement>('[data-coach-workout-surface-slot="true"]'));
  }, [active]);

  if (!active) return children;
  return anchor ? createPortal(children, anchor) : null;
}

type WorkoutReportDay = {
  date: string;
  sessions: HistorySession[];
  completedSets: number;
  totalSets: number;
};

function findReplacementEntry(item: WorkoutItem, entries: HistoryEntry[]) {
  return entries.find(
    (entry) =>
      entry.exerciseId !== item.exerciseId &&
      (entry.replacedExerciseId === item.exerciseId ||
        item.approvedAlternatives?.includes(entry.exerciseId)),
  );
}

function normalizedReportLabel(value?: string | null) {
  return value?.trim().toLocaleLowerCase("he") ?? "";
}

function historySessionMatchesWorkout(session: HistorySession, workout: Workout) {
  return (
    session.workoutId === workout.id ||
    (normalizedReportLabel(session.workoutName) !== "" &&
      normalizedReportLabel(session.workoutName) === normalizedReportLabel(workout.name))
  );
}

function historyEntryMatchesWorkoutItem(entry: HistoryEntry, item: WorkoutItem) {
  return (
    entry.exerciseId === item.exerciseId ||
    (normalizedReportLabel(entry.exerciseName) !== "" &&
      normalizedReportLabel(entry.exerciseName) === normalizedReportLabel(item.exerciseName))
  );
}

function findReportExercise(
  item: Pick<WorkoutItem, "exerciseId" | "exerciseName">,
  exercises: Exercise[],
) {
  return (
    exercises.find((exercise) => exercise.id === item.exerciseId) ??
    (item.exerciseName
      ? exercises.find(
          (exercise) =>
            exercise.name.trim().toLocaleLowerCase() ===
            item.exerciseName?.trim().toLocaleLowerCase(),
        )
      : undefined)
  );
}

function reportDateLabel(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "he-IL",
    options ?? { day: "numeric", month: "numeric" },
  );
}

function reportWeekRangeLabel(start: string, end: string): string {
  return `${reportDateLabel(start)}–${reportDateLabel(end)}`;
}

function youtubeEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? "";
      } else if (
        url.pathname.startsWith("/shorts/") ||
        url.pathname.startsWith("/embed/") ||
        url.pathname.startsWith("/live/")
      ) {
        videoId = url.pathname.split("/")[2] ?? "";
      }
    }

    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function exerciseDemoVideoSources(exercise: Exercise | undefined): string[] {
  if (!exercise) return [];
  return Array.from(
    new Set(
      [
        ...(exercise.videoUrls ?? []),
        exercise.videoUrl,
        exercise.videoMaleUrl,
        exercise.videoFemaleUrl,
      ]
        .map((source) => source?.trim())
        .filter((source): source is string => Boolean(source)),
    ),
  );
}

function WorkoutVideoPlayer({
  source,
  title,
  className,
}: {
  source: string;
  title: string;
  className?: string | undefined;
}) {
  const [hasError, setHasError] = useState(false);
  const embedUrl = youtubeEmbedUrl(source);

  useEffect(() => {
    setHasError(false);
  }, [source]);

  if (hasError) {
    return (
      <div className="space-y-1.5 rounded-lg bg-black p-3 text-center text-[11px] text-white">
        <p>לא ניתן להציג את הסרטון בתוך האפליקציה.</p>
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-white underline underline-offset-2"
        >
          פתיחת הסרטון בחלון חדש
        </a>
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className={className}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full"
        />
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="block bg-black px-2 py-1.5 text-center text-[10px] font-bold text-white underline underline-offset-2"
        >
          פתיחת הסרטון ב־YouTube
        </a>
      </div>
    );
  }

  return (
    <video
      src={source}
      controls
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className={className ?? "max-h-64 w-full object-contain"}
      aria-label={title}
    />
  );
}

function WorkoutExerciseDemoVideos({ exercise }: { exercise: Exercise | undefined }) {
  const sources = exerciseDemoVideoSources(exercise);
  const exerciseName = exercise?.name || "תרגיל";

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-primary">
        <Video className="h-3.5 w-3.5" /> סרטון הדגמה לתרגיל
      </p>
      <div className={sources.length > 1 ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
        {sources.map((source, index) => {
          const embedUrl = youtubeEmbedUrl(source);
          return (
            <div key={`${source}-${index}`} className="overflow-hidden rounded-lg bg-black">
              <WorkoutVideoPlayer
                source={source}
                title={`סרטון הדגמה ${index + 1} עבור ${exerciseName}`}
                className={embedUrl ? undefined : "max-h-64 w-full object-contain"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function workoutReviewItems(workout: Workout) {
  return dedupeWorkoutItems(workout.items);
}

function ratingLabel(rating?: NonNullable<HistoryEntry["feedback"]>["rating"]) {
  if (rating === "easy") return "קל";
  if (rating === "difficult") return "כבד";
  return rating === "appropriate" ? "מתאים" : "";
}

type WorkoutReviewRecord = {
  date?: string;
  sessionId?: string;
  entry: HistoryEntry;
};

function WorkoutReviewExerciseCard({
  item,
  exercise,
  records,
  replacementEntry,
  onOpenPlan,
}: {
  item: WorkoutItem;
  exercise?: Exercise | undefined;
  records: WorkoutReviewRecord[];
  replacementEntry?: HistoryEntry | undefined;
  onOpenPlan?: (() => void) | undefined;
}) {
  const completed = records.length > 0;
  const title = records[0]?.entry.exerciseName || item.exerciseName || exercise?.name || "תרגיל";

  return (
    <article
      className={`rounded-2xl border p-3 ${
        completed ? "border-emerald-200 bg-emerald-50/55" : "border-border/60 bg-white/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-start">
          {onOpenPlan ? (
            <button
              type="button"
              onClick={onOpenPlan}
              className="text-start font-display text-sm font-extrabold text-ink hover:text-primary hover:underline"
            >
              {title}
            </button>
          ) : (
            <strong className="block font-display text-sm font-extrabold text-ink">{title}</strong>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {completed
              ? `${records.length} ביצוע${records.length > 1 ? "ים" : ""} מתועד${
                  records.length > 1 ? "ים" : ""
                }`
              : `תוכנן: ${item.sets} סטים · ${item.repMin || item.reps}${
                  item.repMax ? `–${item.repMax}` : ""
                } חזרות · ${item.targetWeight || item.weight} ק״ג`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
            completed ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"
          }`}
        >
          {completed ? "בוצע" : "טרם בוצע"}
        </span>
      </div>

      {!completed && replacementEntry ? (
        <p className="mt-2 rounded-xl bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary">
          הוחלף בפועל ב־{replacementEntry.exerciseName || "תרגיל אחר"}
        </p>
      ) : null}

      <WorkoutExerciseDemoVideos exercise={exercise} />

      {records.length > 0 ? (
        <div className="mt-3 space-y-3">
          {records.map(({ date, sessionId, entry }, recordIndex) => {
            const videoUrl =
              entry.videoUrl && !entry.videoUrl.startsWith("blob:") ? entry.videoUrl : undefined;
            return (
              <div
                key={`${sessionId ?? "record"}-${date ?? "date"}-${entry.exerciseId}-${recordIndex}`}
                className="rounded-xl border border-border/60 bg-white/75 p-2.5"
              >
                {date ? (
                  <p className="mb-2 text-[10px] font-bold text-primary">{reportDateLabel(date)}</p>
                ) : null}
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <div className="grid grid-cols-[2.6rem_1fr_1fr_4.5rem] gap-2 bg-secondary/60 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground">
                    <span>סט</span>
                    <span>משקל</span>
                    <span>חזרות</span>
                    <span>מצב</span>
                  </div>
                  {entry.sets.length > 0 ? (
                    entry.sets.map((set, setIndex) => (
                      <div
                        key={`${setIndex}-${set.weight}-${set.reps}-${set.done}`}
                        className="grid grid-cols-[2.6rem_1fr_1fr_4.5rem] gap-2 border-t border-border/40 px-2.5 py-2 text-[11px] text-ink"
                      >
                        <span className="font-bold text-muted-foreground">{setIndex + 1}</span>
                        <span>{set.weight} ק״ג</span>
                        <span>
                          {set.reps}
                          {set.targetReps
                            ? ` / ${set.targetReps}${set.targetRepMax ? `–${set.targetRepMax}` : ""}`
                            : ""}
                        </span>
                        <span className={set.done ? "font-bold text-emerald-700" : "text-rose-700"}>
                          {set.done ? "הושלם" : "לא בוצע"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="px-2.5 py-2 text-[11px] text-muted-foreground">לא נרשמו סטים</p>
                  )}
                </div>
                {entry.notes?.trim() || entry.feedback?.notes?.trim() || entry.feedback?.rating ? (
                  <div className="mt-2 space-y-1">
                    {entry.notes?.trim() || entry.feedback?.notes?.trim() ? (
                      <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
                        הערה: {entry.feedback?.notes?.trim() || entry.notes.trim()}
                      </p>
                    ) : null}
                    {entry.feedback?.rating ? (
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        דירוג התרגיל: {ratingLabel(entry.feedback.rating)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {videoUrl ? (
                  <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-2">
                    <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-primary">
                      <Video className="h-3.5 w-3.5" /> סרטון ביצוע
                    </p>
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="max-h-64 w-full rounded-lg bg-black object-contain"
                    />
                  </div>
                ) : entry.videoUrl?.startsWith("blob:") ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
                    הסרטון עדיין בתהליך העלאה ולא זמין לצפייה כאן.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function WorkoutWeeklyReportWeek({
  workout,
  history,
  exercises,
}: {
  workout: Workout;
  history: HistorySession[];
  exercises: Exercise[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => getWorkoutReportWeekDates(weekOffset), [weekOffset]);
  const weekStart = weekDates[0]!;
  const weekEnd = weekDates[weekDates.length - 1]!;
  const isCurrentWeek = weekOffset === 0;
  const sessions = getWorkoutReportSessions(history, workout, weekDates);
  const reviewItems = workoutReviewItems(workout);
  const sessionsByDate = new Map<string, HistorySession[]>();

  for (const session of sessions) {
    const date = reportSessionDateKey(session.date);
    const existing = sessionsByDate.get(date) ?? [];
    existing.push(session);
    sessionsByDate.set(date, existing);
  }

  const weekDays: WorkoutReportDay[] = weekDates.map((date) => {
    const daySessions = sessionsByDate.get(date) ?? [];
    return {
      date,
      sessions: daySessions,
      completedSets: daySessions.reduce(
        (total, session) =>
          total +
          session.entries.reduce(
            (entryTotal, entry) => entryTotal + entry.sets.filter((set) => set.done).length,
            0,
          ),
        0,
      ),
      totalSets: daySessions.reduce(
        (total, session) =>
          total + session.entries.reduce((entryTotal, entry) => entryTotal + entry.sets.length, 0),
        0,
      ),
    };
  });

  const exerciseRows = reviewItems.map((item) => {
    const entries = sessions.flatMap((session) =>
      session.entries
        .filter((entry) => entry.exerciseId === item.exerciseId)
        .map((entry) => ({ date: reportSessionDateKey(session.date), entry })),
    );
    const replacementEntry = findReplacementEntry(
      item,
      sessions.flatMap((session) => session.entries),
    );
    return {
      item,
      entries,
      replacementEntry,
      exercise: findReportExercise(item, exercises),
    };
  });
  const plannedExerciseIds = new Set(reviewItems.map((item) => item.exerciseId));
  const additionalEntries = sessions.flatMap((session) =>
    session.entries
      .filter((entry) => !plannedExerciseIds.has(entry.exerciseId))
      .map((entry) => ({ date: reportSessionDateKey(session.date), entry })),
  );
  const completedDays = weekDays.filter((day) => day.sessions.length > 0).length;
  const completedSets = weekDays.reduce((total, day) => total + day.completedSets, 0);
  const reportNotes = sessions.flatMap((session) => [
    ...(session.notes?.trim()
      ? [{ key: `${session.id}-notes`, label: "הערת אימון", text: session.notes.trim() }]
      : []),
    ...(session.discomfortNotes?.trim()
      ? [
          {
            key: `${session.id}-discomfort`,
            label: "כאב / אי־נוחות",
            text: session.discomfortNotes.trim(),
          },
        ]
      : []),
  ]);
  const hasEntryNotes = exerciseRows.some(({ entries }) =>
    entries.some(({ entry }) => entry.notes?.trim() || entry.feedback?.notes?.trim()),
  );
  const hasVideos = exerciseRows.some(
    ({ exercise, entries }) =>
      exerciseDemoVideoSources(exercise).length > 0 ||
      entries.some(({ entry }) => Boolean(entry.videoUrl)),
  );

  return (
    <section
      className="mt-3 space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.035] p-3"
      aria-label={`דוח שבועי עבור ${workout.name}`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-primary/15 pb-2">
        <div className="min-w-0 text-start">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            <ClipboardList className="h-3.5 w-3.5" />
            דוח שבועי
          </p>
          <h4 className="mt-1 truncate text-sm font-extrabold text-ink">{workout.name}</h4>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {reportDateLabel(weekStart)}–{reportDateLabel(weekEnd)} · {completedDays} מתוך 7 ימים עם
            ביצוע · {completedSets} סטים הושלמו
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
          {sessions.length} ביצועים
        </span>
      </div>

      <div
        className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-white/80 p-1.5"
        dir="rtl"
      >
        <button
          type="button"
          aria-label="שבוע קודם"
          title="שבוע קודם"
          onClick={() => setWeekOffset((offset) => offset - 1)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-primary transition-colors hover:bg-primary/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="min-w-0 flex-1 text-center text-xs font-extrabold text-ink">
          {reportWeekRangeLabel(weekStart, weekEnd)}
        </span>
        <button
          type="button"
          aria-label="שבוע הבא"
          title="שבוע הבא"
          disabled={isCurrentWeek}
          onClick={() => setWeekOffset(getNextWorkoutReportWeekOffset)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold text-ink">סיכום ביצוע והערות לפי תאריך</p>
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl border border-border/60 bg-white/80 p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <strong className="text-ink">
                  {reportDateLabel(reportSessionDateKey(session.date), {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </strong>
                <span className="text-muted-foreground">
                  {session.durationSec > 0
                    ? `${Math.round(session.durationSec / 60)} דקות`
                    : "משך לא צוין"}
                  {session.difficultyRating
                    ? ` · ${
                        session.difficultyRating === "easy"
                          ? "קל"
                          : session.difficultyRating === "difficult"
                            ? "כבד"
                            : "מתאים"
                      }`
                    : ""}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {session.entries.length} תרגילים ·{" "}
                {session.entries.reduce(
                  (total, entry) => total + entry.sets.filter((set) => set.done).length,
                  0,
                )}{" "}
                סטים הושלמו
              </p>
              {session.notes?.trim() ? (
                <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">
                  הערת אימון: {session.notes.trim()}
                </p>
              ) : null}
              {session.discomfortNotes?.trim() ? (
                <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-800">
                  כאב / אי־נוחות: {session.discomfortNotes.trim()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white/75 p-3 text-center text-[11px] text-muted-foreground">
          עדיין לא נרשם ביצוע של האימון הזה בשבוע הזה.
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold text-ink">תרגילי האימון</p>
          <span className="text-[10px] text-muted-foreground">{reviewItems.length} תרגילים</span>
        </div>
        {exerciseRows.length > 0 ? (
          exerciseRows.map(({ item, entries, replacementEntry, exercise }) => (
            <WorkoutReviewExerciseCard
              key={item.id}
              item={item}
              exercise={exercise}
              replacementEntry={replacementEntry}
              records={entries.map(({ date, entry }) => ({ date, entry }))}
            />
          ))
        ) : (
          <p className="rounded-xl bg-white/75 p-3 text-center text-[11px] text-muted-foreground">
            עדיין לא הוגדרו תרגילים באימון הזה.
          </p>
        )}
      </div>

      {additionalEntries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold text-ink">
            תרגילים שבוצעו ואינם בתוכנית הנוכחית
          </p>
          {additionalEntries.map(({ date, entry }, index) => (
            <WorkoutReviewExerciseCard
              key={`additional-${date}-${entry.exerciseId}-${index}`}
              item={{
                id: `additional-${date}-${entry.exerciseId}-${index}`,
                exerciseId: entry.exerciseId,
                exerciseName: entry.exerciseName,
                sets: entry.sets.length,
                reps: entry.targetReps || 0,
                weight: entry.sets[0]?.weight || 0,
                rest: 0,
                notes: "",
                workingSets: [],
                ...(entry.targetReps ? { repMin: entry.targetReps } : {}),
              }}
              records={[{ date, entry }]}
            />
          ))}
        </div>
      ) : null}

      {workout.notes?.trim() ? (
        <p className="rounded-lg bg-secondary/60 px-2 py-1 text-[10px] text-ink">
          הערת תכנון: {workout.notes.trim()}
        </p>
      ) : null}
    </section>
  );
}

function reportShiftDate(date: string, amount: number): string {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + amount);
  return reportDateKey(nextDate);
}

function WorkoutDailyReport({
  workout,
  history,
  exercises,
}: {
  workout: Workout;
  history: HistorySession[];
  exercises: Exercise[];
}) {
  const [reportDate, setReportDate] = useState(() => reportDateKey(new Date()));
  const today = reportDateKey(new Date());
  const session = useMemo(
    () => getWorkoutReportSessionForDate(history, workout, reportDate),
    [history, reportDate, workout],
  );
  const sessions = session ? [session] : [];
  const exerciseRows = workout.items.map((item) => {
    const entries = sessions.flatMap((session) =>
      session.entries
        .filter((entry) => entry.exerciseId === item.exerciseId)
        .map((entry) => ({ entry, sessionId: session.id })),
    );
    const replacementEntry = findReplacementEntry(
      item,
      sessions.flatMap((session) => session.entries),
    );
    return {
      item,
      entries,
      replacementEntry,
      exercise: findReportExercise(item, exercises),
    };
  });
  const plannedExerciseIds = new Set(workout.items.map((item) => item.exerciseId));
  const additionalEntries = sessions.flatMap((session) =>
    session.entries
      .filter((entry) => !plannedExerciseIds.has(entry.exerciseId))
      .map((entry, index) => ({ entry, sessionId: session.id, index })),
  );
  const completedSets = sessions.reduce(
    (total, session) =>
      total +
      session.entries.reduce(
        (entryTotal, entry) => entryTotal + entry.sets.filter((set) => set.done).length,
        0,
      ),
    0,
  );
  const totalSets = sessions.reduce(
    (total, session) =>
      total + session.entries.reduce((entryTotal, entry) => entryTotal + entry.sets.length, 0),
    0,
  );

  return (
    <section
      className="mt-3 space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.035] p-3"
      aria-label={`היסטוריית אימונים והערות עבור ${workout.name}`}
      data-testid="coach-workout-daily-report"
    >
      <div className="flex items-start gap-3 border-b border-primary/15 pb-3">
        <span className="illustrated-mark inline-grid h-11 w-11 shrink-0 place-items-center text-primary">
          <Activity className="h-6 w-6" />
        </span>
        <div className="min-w-0 text-start">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            מה המתאמן ביצע בפועל
          </p>
          <h4 className="mt-1 text-base font-extrabold text-ink">היסטוריית אימונים והערות</h4>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2" dir="ltr">
        <button
          type="button"
          onClick={() => setReportDate((date) => reportShiftDate(date, 1))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-ink transition-colors hover:border-primary hover:text-primary"
          aria-label="היום הבא"
          title="היום הבא"
          disabled={reportDate >= today}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="relative h-9 min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-white">
          <span
            className="pointer-events-none absolute inset-0 z-0 grid place-items-center px-2 text-center text-xs text-ink"
            dir="rtl"
            aria-hidden="true"
          >
            {reportDateLabel(reportDate, { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <input
            type="date"
            value={reportDate}
            max={today}
            onChange={(event) => setReportDate(event.target.value || today)}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label={`תאריך הדוח: ${reportDateLabel(reportDate, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`}
          />
        </div>
        <button
          type="button"
          onClick={() => setReportDate((date) => reportShiftDate(date, -1))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="היום הקודם"
          title="היום הקודם"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-xl bg-white/80 p-3 text-[11px]">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-ink">{workout.name || "אימון"}</strong>
          <span className="text-muted-foreground">
            {sessions.length > 0 ? "אימון אחד בתאריך" : "אין ביצוע בתאריך"}
          </span>
        </div>
        {sessions.length > 0 ? (
          <div className="mt-1 space-y-1 text-muted-foreground">
            <p>
              {completedSets} מתוך {totalSets} סטים בוצעו בפועל
            </p>
            {sessions.map((session) =>
              session.difficultyRating ? (
                <p key={`${session.id}-difficulty`}>
                  משוב על קושי: {ratingLabel(session.difficultyRating)}
                </p>
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        {exerciseRows.length > 0 ? (
          exerciseRows.map(({ item, entries, replacementEntry, exercise }) => (
            <div
              key={item.id}
              className={`rounded-xl border px-3 py-2.5 text-[11px] ${
                entries.length > 0
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-border/60 bg-white/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 text-start">
                  <strong className="block truncate text-ink">
                    {entries[0]?.entry.exerciseName ||
                      item.exerciseName ||
                      exercise?.name ||
                      "תרגיל"}
                  </strong>
                  {entries.length === 0 ? (
                    <>
                      <p className="mt-1 text-muted-foreground">
                        תוכנן: {item.sets} סטים × {item.repMin || item.reps}
                        {item.repMax ? `–${item.repMax}` : ""} חזרות ·{" "}
                        {item.targetWeight || item.weight} ק״ג
                      </p>
                      {replacementEntry ? (
                        <p className="mt-1 font-semibold text-primary">
                          הוחלף ב־{replacementEntry.exerciseName || "תרגיל אחר"}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    entries.map(({ entry, sessionId }, entryIndex) => (
                      <div key={`${sessionId}-${entry.exerciseId}-${entryIndex}`}>
                        <p className="mt-1 text-muted-foreground">
                          {entry.sets.length > 0
                            ? entry.sets
                                .map(
                                  (set, setIndex) =>
                                    `סט ${setIndex + 1}: ${set.weight} ק״ג × ${set.reps}${
                                      set.done ? " ✓" : " — לא בוצע"
                                    }`,
                                )
                                .join(" · ")
                            : "לא נרשמו סטים"}
                        </p>
                        {entry.notes?.trim() || entry.feedback?.notes?.trim() ? (
                          <p className="mt-1 text-ink">
                            הערה: {entry.feedback?.notes?.trim() || entry.notes.trim()}
                          </p>
                        ) : null}
                        {entry.videoUrl && !entry.videoUrl.startsWith("blob:") ? (
                          <WorkoutVideoPlayer
                            source={entry.videoUrl}
                            title={`סרטון ביצוע עבור ${entry.exerciseName || "תרגיל"}`}
                            className="mt-1.5 max-h-52 w-full rounded-lg bg-black object-contain"
                          />
                        ) : entry.videoUrl?.startsWith("blob:") ? (
                          <p className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">
                            הסרטון עדיין בתהליך העלאה ולא זמין לצפייה כאן.
                          </p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold ${
                    entries.length > 0 ? "text-emerald-700" : "text-muted-foreground"
                  }`}
                >
                  {entries.length > 0 ? "בוצע בפועל" : "טרם בוצע"}
                </span>
              </div>
              <WorkoutExerciseDemoVideos exercise={exercise} />
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-white/80 p-3 text-center text-xs text-muted-foreground">
            באימון הזה עדיין לא הוגדרו תרגילים.
          </p>
        )}
      </div>

      {additionalEntries.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-extrabold text-ink">תרגילים שבוצעו ואינם בתוכנית</p>
          {additionalEntries.map(({ entry, sessionId, index }) => {
            const exercise =
              exercises.find((candidate) => candidate.id === entry.exerciseId) ??
              (entry.exerciseName
                ? exercises.find(
                    (candidate) =>
                      candidate.name.trim().toLocaleLowerCase() ===
                      entry.exerciseName.trim().toLocaleLowerCase(),
                  )
                : undefined);
            return (
              <div
                key={`additional-${sessionId}-${entry.exerciseId}-${index}`}
                className="rounded-xl border border-sky-200 bg-sky-50/65 p-2.5 text-[10px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-start text-ink">{entry.exerciseName || "תרגיל"}</strong>
                  <span className="shrink-0 font-bold text-sky-800">בוצע בפועל</span>
                </div>
                <WorkoutExerciseDemoVideos exercise={exercise} />
                <p className="mt-1 text-muted-foreground">
                  {entry.sets.length > 0
                    ? entry.sets
                        .map(
                          (set, setIndex) =>
                            `סט ${setIndex + 1}: ${set.weight} ק״ג × ${set.reps}${
                              set.done ? " ✓" : " — לא בוצע"
                            }`,
                        )
                        .join(" · ")
                    : "לא נרשמו סטים"}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {sessions.some((session) => session.notes?.trim() || session.discomfortNotes?.trim()) ? (
        <div className="space-y-1.5">
          {sessions.map((session) => (
            <div key={`${session.id}-notes`}>
              {session.notes?.trim() ? (
                <p className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">
                  הערת אימון: {session.notes.trim()}
                </p>
              ) : null}
              {session.discomfortNotes?.trim() ? (
                <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-800">
                  כאב / אי־נוחות: {session.discomfortNotes.trim()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <p className="rounded-xl bg-white/75 p-3 text-center text-[11px] text-muted-foreground">
          אין ביצוע של האימון בתאריך הזה.
        </p>
      ) : null}
    </section>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message;
  }
  return fallback;
}

function normalizeProfileIdentity(value?: string | null): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function profileDisplayName(
  profile?: { full_name?: string | null; email?: string | null } | null,
): string {
  const identities = [
    normalizeProfileIdentity(profile?.email?.split("@")[0]),
    normalizeProfileIdentity(profile?.full_name),
  ];
  const knownNames: Record<string, string> = {
    maya2003yo: "מאיה בדיקה 1",
    maya2003yos: "מאיה בדיקה 1",
    mayayy2345: "מאיה בדיקה 2",
    michalyosfan: "מיכל יוספן",
    mayayosfan234: "מאיה יוספן",
  };
  const knownName = identities.map((identity) => knownNames[identity]).find(Boolean);
  if (knownName) return knownName;
  const name = profile?.full_name?.trim();
  return name || "שם לא הוגדר";
}

export const Route = createFileRoute("/coach")({
  component: () => <Outlet />,
});

export function CoachDashboardPage({
  clientsOnly = false,
  trackingLanding = false,
  workspacePage = false,
  clientId,
  workspaceMode = "all",
  initialProgramId,
  initialDayId,
  initialExerciseId,
  initialNutritionDate,
  initialNutritionMealId,
  initialNutritionFoodId,
}: {
  clientsOnly?: boolean;
  trackingLanding?: boolean;
  workspacePage?: boolean;
  clientId?: string;
  workspaceMode?: "all" | "programs" | "nutrition";
  initialProgramId?: string;
  initialDayId?: string;
  initialExerciseId?: string;
  initialNutritionDate?: string;
  initialNutritionMealId?: string;
  initialNutritionFoodId?: string;
}) {
  const store = useGym();
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const role = store.userProfile?.role;
  const gender = store.userProfile?.gender;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;

  const [clients, setClients] = useState<CoachClientRow[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [ownerUserSearch, setOwnerUserSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientWorkspace, setShowClientWorkspace] = useState(false);
  const [openEditor, setOpenEditor] = useState<"programs" | "nutrition" | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [clientDetailsError, setClientDetailsError] = useState("");
  const [managementError, setManagementError] = useState("");
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);
  const [roleChangeNotice, setRoleChangeNotice] = useState("");
  const [ownerCalorieUserId, setOwnerCalorieUserId] = useState<string | null>(null);
  const [ownerLoadingUserId, setOwnerLoadingUserId] = useState<string | null>(null);
  const [ownerCalorieNotice, setOwnerCalorieNotice] = useState("");
  const [approvalCoachByUser, setApprovalCoachByUser] = useState<Record<string, string>>({});
  const [approvalNameByUser, setApprovalNameByUser] = useState<Record<string, string>>({});
  const [approvalShowCaloriesByUser, setApprovalShowCaloriesByUser] = useState<
    Record<string, boolean>
  >({});
  const [approvalUserId, setApprovalUserId] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState("");
  const [selectedOwnerProfileId, setSelectedOwnerProfileId] = useState<string | null>(null);
  const [selectedOwnerProfileDetails, setSelectedOwnerProfileDetails] =
    useState<ClientDetails | null>(null);
  const [assignmentCoachByUser, setAssignmentCoachByUser] = useState<Record<string, string>>({});
  const [assignmentUserId, setAssignmentUserId] = useState<string | null>(null);
  const [ownerUserActionId, setOwnerUserActionId] = useState<string | null>(null);
  const [clientFeedback, setClientFeedback] = useState<ClientFeedbackRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const applyClientDetails = useCallback(
    (result: ClientDetails, options?: { preserveOnError?: boolean }) => {
      if (result.error) {
        if (!options?.preserveOnError) setClientDetails(null);
        setClientDetailsError(result.error);
        setManagementError(result.error);
        return;
      }
      // Older coach-built plans may contain the exercise name in the plan item
      // but not have the matching custom_exercises row anymore. Rehydrate those
      // catalog entries before rendering so they can be selected and edited
      // again instead of appearing as an unnamed exercise.
      for (const workout of result.workouts) {
        for (const item of workout.items) {
          const name = item.exerciseName?.trim();
          if (
            !name ||
            name === "תרגיל" ||
            name === "תרגיל שהוסר" ||
            store.exercises.some((exercise) => exercise.id === item.exerciseId) ||
            result.exercises.some((exercise) => exercise.id === item.exerciseId)
          ) {
            continue;
          }
          saveExercise({
            id: item.exerciseId,
            name,
            nameEn: name,
            muscleGroup: "אחר",
            muscleGroups: ["אחר"],
            equipment: "ללא ציוד",
            category: "מותאם אישית",
            description: "",
            instructions: "",
            videoUrl: "",
            images: [],
            notes: "",
          });
        }
      }
      setClientDetailsError("");
      setClientDetails(result);
    },
    [store.exercises],
  );

  // Coach Message sender state
  const [coachMsgText, setCoachMsgText] = useState("");
  const [msgSentNotice, setMsgSentNotice] = useState("");
  const [msgSendError, setMsgSendError] = useState("");
  const [sentCoachMessages, setSentCoachMessages] = useState<CoachMessage[]>([]);
  const [sentCoachMessagesError, setSentCoachMessagesError] = useState("");
  const [failedCoachMessage, setFailedCoachMessage] = useState<{
    message: string;
    createdAt: string;
  } | null>(null);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastAudience, setBroadcastAudience] = useState<
    "assigned_clients" | "coaches" | "clients" | "everyone"
  >("assigned_clients");
  const [broadcastNotice, setBroadcastNotice] = useState("");
  const [broadcastError, setBroadcastError] = useState("");
  const [sentBroadcasts, setSentBroadcasts] = useState<BroadcastAnnouncement[]>([]);

  const fetchSentCoachMessages = useCallback(
    async (clientId: string): Promise<CoachMessage[]> =>
      loadCoachMessages(async () =>
        supabase
          .from("coach_messages")
          .select("id, coach_id, client_id, message, created_at, is_read")
          .eq("coach_id", authUser?.id ?? "")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(20),
      ),
    [authUser?.id],
  );

  useEffect(() => {
    let active = true;
    setSentCoachMessagesError("");
    setFailedCoachMessage(null);
    if (!authUser?.id || !isCoach || !selectedClientId) {
      setSentCoachMessages([]);
      return () => {
        active = false;
      };
    }

    void fetchSentCoachMessages(selectedClientId)
      .then((messages) => {
        if (active) setSentCoachMessages(messages);
      })
      .catch((error: unknown) => {
        if (active) {
          setSentCoachMessages([]);
          setSentCoachMessagesError(
            `טעינת היסטוריית ההודעות נכשלה: ${errorMessage(error, "שגיאה בטעינת ההודעות")}`,
          );
        }
      });

    return () => {
      active = false;
    };
  }, [authUser?.id, fetchSentCoachMessages, isCoach, selectedClientId]);

  useEffect(() => {
    if (!authUser?.id || !isCoach) {
      setSentBroadcasts([]);
      return;
    }
    let active = true;
    void supabase
      .from("broadcast_announcements")
      .select("id, sender_id, audience, message, created_at")
      .eq("sender_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!active || !data) return;
        setSentBroadcasts(
          data.map((row) => ({
            id: row.id,
            senderId: row.sender_id,
            audience: row.audience,
            message: row.message,
            createdAt: row.created_at,
          })),
        );
      });
    return () => {
      active = false;
    };
  }, [authUser?.id, isCoach]);

  // Coach Program & Day Builder state
  const [newProgramName, setNewProgramName] = useState("");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [openWorkoutReportId, setOpenWorkoutReportId] = useState<string | null>(null);
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState("");

  // Exercise Assignment Editor state
  const [selectedExId, setSelectedExId] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedCableGrip, setSelectedCableGrip] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("הכל");
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExerciseDraft, setNewExerciseDraft] = useState<Exercise>(() => emptyExercise());
  const [newExerciseError, setNewExerciseError] = useState("");
  const [pendingCreatedExercise, setPendingCreatedExercise] = useState<{
    exerciseId: string;
    context: ExerciseBuilderReturnContext;
  } | null>(null);
  const [autoAssignCreatedExerciseId, setAutoAssignCreatedExerciseId] = useState<string | null>(
    null,
  );
  const hydratedBuilderRouteKeyRef = useRef<string | null>(null);

  const selectExerciseForBuilder = (
    exerciseId: string,
    equipmentOverride?: string,
    cableGripOverride?: string,
    exerciseOverride?: Exercise,
  ) => {
    const exercise =
      exerciseOverride ??
      uniqueCanonicalExercises(store.exercises).find((candidate) => candidate.id === exerciseId);
    const options = exercise ? exerciseEquipmentOptions(exercise) : [];
    const nextEquipment =
      equipmentOverride && options.includes(equipmentOverride)
        ? equipmentOverride
        : options[0] || exercise?.equipment || "";
    setSelectedExId(exerciseId);
    setSelectedEquipment(nextEquipment);
    setSelectedCableGrip(
      nextEquipment === "פולי / כבלים" ? cableGripOverride || "" : "",
    );
  };
  const [targetWeight, setTargetWeight] = useState(20);
  const [setsCount, setSetsCount] = useState(3);
  const [setWeights, setSetWeights] = useState<number[]>([20, 20, 20]);
  const [setRepMins, setSetRepMins] = useState<number[]>([8, 8, 8]);
  const [setRepMaxes, setSetRepMaxes] = useState<number[]>([10, 10, 10]);
  const [setRests, setSetRests] = useState<number[]>([90, 90, 90]);
  const [setNotes, setSetNotes] = useState<string[]>(["", "", ""]);
  useEffect(() => {
    const createdExerciseId = window.sessionStorage.getItem("gymtrack-created-exercise-id");
    if (!createdExerciseId) return;
    if (!store.exercises.some((exercise) => exercise.id === createdExerciseId)) return;
    let context: ExerciseBuilderReturnContext | null = null;
    try {
      const rawContext = window.sessionStorage.getItem("gymtrack-exercise-return-context");
      if (rawContext) context = JSON.parse(rawContext) as ExerciseBuilderReturnContext;
    } catch {
      context = null;
    }
    if (context?.clientId) {
      setSelectedClientId(context.clientId);
      setShowClientWorkspace(true);
    }
    if (context?.programId) setEditingProgramId(context.programId);
    if (context?.dayId) {
      setEditingDayId(context.dayId);
      setShowExerciseForm(true);
    }
    selectExerciseForBuilder(createdExerciseId);
    setExerciseBuilderNotice("התרגיל החדש נבחר להוספה לאימון.");
    if (context) {
      setPendingCreatedExercise({ exerciseId: createdExerciseId, context });
      window.sessionStorage.removeItem("gymtrack-exercise-return-context");
    }
    window.sessionStorage.removeItem("gymtrack-created-exercise-id");
  }, [authUser?.id, store.exercises]);
  useEffect(() => {
    if (!editingDayId) setShowExerciseForm(false);
    setOpenWorkoutReportId((current) =>
      current && editingDayId && current !== editingDayId ? null : current,
    );
  }, [editingDayId]);
  const [setModes, setSetModes] = useState<Array<"normal" | "warmup" | "drop" | "superset">>([
    "normal",
    "normal",
    "normal",
  ]);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(10);
  const [restSec, setRestSec] = useState(90);
  const [warmupEnabled, setWarmupEnabled] = useState(false);
  const [warmupSetsCount, setWarmupSetsCount] = useState(1);
  const [warmupWeight, setWarmupWeight] = useState(10);
  const [warmupReps, setWarmupReps] = useState(10);
  const [warmupRepsMax, setWarmupRepsMax] = useState(12);
  const [techNotes, setTechniqueNotes] = useState("");
  const [supersetGroup, setSupersetGroup] = useState("");
  const [supersetPartnerId, setSupersetPartnerId] = useState("");
  const [supersetPartnerQuery, setSupersetPartnerQuery] = useState("");
  const [supersetPartnerWeight, setSupersetPartnerWeight] = useState(20);
  const [dropSetEnabled, setDropSetEnabled] = useState(false);
  const [dropLevel1Weight, setDropLevel1Weight] = useState("");
  const [dropLevel1RepsMin, setDropLevel1RepsMin] = useState(8);
  const [dropLevel1RepsMax, setDropLevel1RepsMax] = useState(10);
  const [dropLevel2Weight, setDropLevel2Weight] = useState("");
  const [dropLevel2RepsMin, setDropLevel2RepsMin] = useState(6);
  const [dropLevel2RepsMax, setDropLevel2RepsMax] = useState(8);
  // Legacy controls remain available for existing plans; their selected result
  // is converted to the fixed levels below when the item is saved.
  const [dropReductionMode, setDropReductionMode] = useState<"percent" | "kg" | "">("");
  const [dropReductionValue, setDropReductionValue] = useState("");
  const [dropRepsMin, setDropRepsMin] = useState(10);
  const [dropRepsMax, setDropRepsMax] = useState(12);
  const [exerciseBuilderNotice, setExerciseBuilderNotice] = useState("");
  const advancedExerciseControlsEnabled =
    import.meta.env["VITE_ENABLE_ADVANCED_EXERCISE_CONTROLS"] === "true";

  const resizeSetFields = (count: number) => {
    const nextCount = Math.max(1, count);
    setSetsCount(nextCount);
    setSetWeights((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? targetWeight),
    );
    setSetRepMins((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? repMin),
    );
    setSetRepMaxes((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? repMax),
    );
    setSetRests((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? restSec),
    );
    setSetNotes((current) => Array.from({ length: nextCount }, (_, index) => current[index] ?? ""));
  };
  const [supersetRepsMin, setSupersetRepsMin] = useState(10);
  const [supersetRepsMax, setSupersetRepsMax] = useState(12);
  const [approvedAltIds, setApprovedAltIds] = useState<string[]>([]);
  const [bodyweightAlternativeId, setBodyweightAlternativeId] = useState("");

  // Nutrition Prescription state
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"programs" | "nutrition" | null>(
    null,
  );
  const [selectedTrackingWorkoutId, setSelectedTrackingWorkoutId] = useState<string | null>(null);
  const [calTarget, setCalTarget] = useState(0);
  const [protTarget, setProtTarget] = useState(0);
  const [menuDate, setMenuDate] = useState(todayKey());
  // Actual logs are reviewed independently from the plan editor. Keeping a
  // separate date cursor prevents changing the prescribed menu while browsing
  // a client's historical entries.
  const [trackingDate, setTrackingDate] = useState(todayKey());
  const workspaceSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<Meal[]>([]);
  const [menuFoodMealId, setMenuFoodMealId] = useState<string | null>(null);
  const [menuFoodId, setMenuFoodId] = useState("");
  const [menuFoodQuery, setMenuFoodQuery] = useState("");
  const [menuFoodQuantity, setMenuFoodQuantity] = useState(1);
  const [menuFoodUnit, setMenuFoodUnit] = useState<FoodQuantityUnit>("serving");
  const [menuNotice, setMenuNotice] = useState("");
  const [focusedNutritionFoodId, setFocusedNutritionFoodId] = useState<string | null>(null);
  const [focusedNutritionMealId, setFocusedNutritionMealId] = useState<string | null>(null);
  const trackingClientInitializedRef = useRef<string | null>(null);
  const isSelfSelected = Boolean(authUser?.id && selectedClientId === authUser.id);
  const [overviewRows, setOverviewRows] = useState<
    Array<{ client: CoachClientRow; details: ClientDetails }>
  >([]);
  const [attentionMeta, setAttentionMeta] = useState<
    Record<string, { reviewed: boolean; privateNote: string }>
  >({});
  const [attentionView, setAttentionView] = useState<"open" | "all">("open");
  const [expandedAttentionClientId, setExpandedAttentionClientId] = useState<string | null>(null);
  const [clientRealtimeStatus, setClientRealtimeStatus] =
    useState<RealtimeConnectionStatus>("connecting");
  const [lastClientRefreshAt, setLastClientRefreshAt] = useState<number | null>(null);
  const [clientRefreshInFlight, setClientRefreshInFlight] = useState(false);
  const [clientDataStale, setClientDataStale] = useState(false);
  const draftOwnerRef = useRef<string | null>(null);
  const measurementDraftDirtyRef = useRef(false);
  const profileDraftDirtyRef = useRef(false);
  const plannedMealsDraftDirtyRef = useRef(false);
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [measurementDraft, setMeasurementDraft] = useState<BodyMeasurement>({
    id: "",
    date: todayKey(),
  });
  const [measurementNotice, setMeasurementNotice] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileHeight, setProfileHeight] = useState("");
  const [profileWeight, setProfileWeight] = useState("");
  const [profileWorkouts, setProfileWorkouts] = useState("");
  const [profileGender, setProfileGender] = useState<"female" | "male" | "">("");
  const [profileNotice, setProfileNotice] = useState("");
  const [showBmrCalculator, setShowBmrCalculator] = useState(false);
  const showClientOverview = !trackingLanding && !workspacePage && !openEditor;
  const showProgramBuilder =
    !trackingLanding &&
    (workspaceMode === "programs" ||
      openEditor === "programs" ||
      (workspacePage && activeWorkspaceTab === "programs") ||
      (workspaceMode === "all" && activeWorkspaceTab === "programs"));
  const showNutritionBuilder =
    !trackingLanding &&
    (workspaceMode === "nutrition" ||
      openEditor === "nutrition" ||
      (workspaceMode === "all" && activeWorkspaceTab === "nutrition"));
  const formattedLastClientRefresh = lastClientRefreshAt
    ? new Date(lastClientRefreshAt).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const clientFreshnessLabel = clientRefreshInFlight
    ? "מרענן נתוני מתאמן…"
    : clientRealtimeStatus === "disconnected"
      ? formattedLastClientRefresh
        ? `החיבור לא זמין · מוצג עותק מ־${formattedLastClientRefresh}`
        : "החיבור לא זמין · ממתין לנתונים"
      : clientRealtimeStatus === "reconnecting"
        ? formattedLastClientRefresh
          ? `החיבור מתחדש · עודכן ב־${formattedLastClientRefresh}`
          : "החיבור מתחדש…"
        : clientDataStale
          ? formattedLastClientRefresh
            ? `הנתונים לא עודכנו · מוצג עותק מ־${formattedLastClientRefresh}`
            : "הנתונים לא עודכנו · ממתין לנתונים"
          : clientRealtimeStatus === "connecting"
            ? "מתחבר לנתוני המתאמן…"
            : clientRefreshInFlight
              ? "מסנכרן נתוני מתאמן…"
              : formattedLastClientRefresh
                ? `מחובר · עודכן ב־${formattedLastClientRefresh}`
                : "מחובר לנתוני המתאמן";
  const clientFreshnessClass =
    clientRealtimeStatus === "disconnected" ||
    clientRealtimeStatus === "reconnecting" ||
    clientDataStale
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : clientRefreshInFlight || clientRealtimeStatus === "connecting"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const ClientFreshnessIcon =
    clientRealtimeStatus === "disconnected"
      ? WifiOff
      : clientRefreshInFlight || clientRealtimeStatus === "connecting" || clientDataStale
        ? RefreshCw
        : Wifi;

  const applySelectedClientRefreshResult = useCallback(
    (result: ClientDetails) => {
      applyClientDetails(result, { preserveOnError: true });
      setClientRefreshInFlight(false);
      setClientDataStale(Boolean(result.error));
      if (!result.error) {
        setLastClientRefreshAt(Date.now());
      }
    },
    [applyClientDetails],
  );

  const markMeasurementDraftDirty = () => {
    measurementDraftDirtyRef.current = true;
  };
  const markProfileDraftDirty = () => {
    profileDraftDirtyRef.current = true;
  };
  const markPlannedMealsDraftDirty = () => {
    plannedMealsDraftDirtyRef.current = true;
  };

  useEffect(() => {
    if (draftOwnerRef.current === selectedClientId) return;
    draftOwnerRef.current = selectedClientId;
    measurementDraftDirtyRef.current = false;
    profileDraftDirtyRef.current = false;
    plannedMealsDraftDirtyRef.current = false;
  }, [selectedClientId]);

  const loadCoachClients = useCallback(async () => {
    setManagementError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setManagementError("לא ניתן לאמת את חשבון המאמן. נסי להתחבר מחדש.");
      return;
    }

    let coachClientsQuery = supabase
      .from("coach_clients")
      .select(
        "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name, weight_kg)",
      );
    if (!isOwner) {
      coachClientsQuery = coachClientsQuery.eq("coach_id", user.id);
    }
    const { data, error } = await coachClientsQuery;

    if (error) {
      setManagementError(`טעינת המתאמנים נכשלה: ${error.message}`);
      return;
    }
    if (data) {
      setClients(data as unknown as CoachClientRow[]);
    }
  }, [isOwner]);

  const loadAllProfilesForOwner = useCallback(async (): Promise<boolean> => {
    if (!isOwner) return false;
    setManagementError("");
    const [
      { data: profileData, error: profileError },
      { data: authData, error: authError },
      { data: coachLinkData, error: coachLinkError },
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.rpc("list_owner_auth_users"),
      supabase.from("coach_clients").select("coach_id, client_id"),
    ]);
    if (profileError) {
      setManagementError(`טעינת משתמשי המערכת נכשלה: ${profileError.message}`);
      return false;
    }
    const coachIdsByClient = new Map<string, string[]>();
    if (!coachLinkError) {
      for (const row of (coachLinkData ?? []) as Array<{
        coach_id: string;
        client_id: string;
      }>) {
        const coachIds = coachIdsByClient.get(row.client_id) ?? [];
        coachIds.push(row.coach_id);
        coachIdsByClient.set(row.client_id, coachIds);
      }
    }
    const profileRows = (profileData ?? []).map((profile) => ({
      ...(profile as unknown as ProfileRow),
      profile_exists: true,
      coach_ids: coachIdsByClient.get(profile.id) ?? [],
    }));
    if (coachLinkError) {
      setManagementError(
        `הפרופילים נטענו, אך לא ניתן לטעון את שיוכי המאמנים: ${coachLinkError.message}`,
      );
    }
    if (authError) {
      setAllProfiles(profileRows);
      setManagementError(
        `הפרופילים נטענו, אך לא ניתן לבדוק חשבונות Auth ללא פרופיל: ${authError.message}`,
      );
      return true;
    }
    const knownProfileIds = new Set(profileRows.map((profile) => profile.id));
    const missingProfileRows = ((authData ?? []) as unknown as OwnerAuthUserRow[])
      .filter((authUser) => authUser.profile_exists === false && !knownProfileIds.has(authUser.id))
      .map((authUser): ProfileRow => ({
        id: authUser.id,
        email: authUser.email ?? null,
        profile_exists: false,
        email_confirmed_at: authUser.email_confirmed_at ?? null,
        last_sign_in_at: authUser.last_sign_in_at ?? null,
        created_at: authUser.created_at ?? null,
        role: null,
        approval_status: null,
      }));
    setAllProfiles([...profileRows, ...missingProfileRows]);
    return true;
  }, [isOwner]);

  const loadClientFeedback = useCallback(async () => {
    if (!isCoach) return;
    const { data } = await supabase
      .from("client_feedback")
      .select("id, client_id, difficulty_rating, discomfort_notes, coach_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setClientFeedback(data as ClientFeedbackRow[]);
  }, [isCoach]);

  const loadOverviewRows = useCallback(async () => {
    if (clientsOnly || clients.length === 0) {
      setOverviewRows([]);
      return;
    }
    const rows = await Promise.all(
      clients.map(async (client) => ({
        client,
        details: await pullClientDataForCoach(client.client_id),
      })),
    );
    setOverviewRows(rows.filter((row) => !row.details.error));
  }, [clients, clientsOnly]);

  useEffect(() => {
    if (!isCoach) return;

    const refreshManagementData = () => {
      if (document.visibilityState === "hidden") return;
      void loadCoachClients();
      if (isOwner) void loadAllProfilesForOwner();
      void loadClientFeedback();
      void loadOverviewRows();
    };

    refreshManagementData();
    window.addEventListener("focus", refreshManagementData);
    window.addEventListener("pageshow", refreshManagementData);
    document.addEventListener("visibilitychange", refreshManagementData);
    const interval = window.setInterval(refreshManagementData, 15_000);

    return () => {
      window.removeEventListener("focus", refreshManagementData);
      window.removeEventListener("pageshow", refreshManagementData);
      document.removeEventListener("visibilitychange", refreshManagementData);
      window.clearInterval(interval);
    };
  }, [
    isCoach,
    isOwner,
    loadAllProfilesForOwner,
    loadClientFeedback,
    loadCoachClients,
    loadOverviewRows,
  ]);

  useEffect(() => {
    if (!isCoach || !authUser?.id) return;

    const refreshManagementRealtime = (table?: string, status?: RealtimeConnectionStatus) => {
      if (status && status !== "connected") return;
      if (document.visibilityState === "hidden") return;
      void loadCoachClients();
      if (isOwner) void loadAllProfilesForOwner();
      if (table === "client_feedback") void loadClientFeedback();
      void loadOverviewRows();
    };

    return subscribeToCoachManagementChanges(authUser.id, refreshManagementRealtime);
  }, [
    authUser?.id,
    isCoach,
    isOwner,
    loadAllProfilesForOwner,
    loadClientFeedback,
    loadCoachClients,
    loadOverviewRows,
  ]);

  useEffect(() => {
    if (
      isOwner ||
      isSelfSelected ||
      !selectedClientId ||
      clients.length === 0 ||
      clients.some((client) => client.client_id === selectedClientId)
    ) {
      return;
    }
    setSelectedClientId(null);
    setShowClientWorkspace(false);
    setClientDetails(null);
    setClientDetailsError("השיוך למתאמן השתנה. רשימת המתאמנים עודכנה.");
  }, [clients, isOwner, isSelfSelected, selectedClientId]);

  useEffect(() => {
    void loadOverviewRows();
  }, [loadOverviewRows]);

  useEffect(() => {
    if (!authUser?.id) {
      setAttentionMeta({});
      return;
    }
    try {
      const raw = window.localStorage.getItem(`${ATTENTION_STORAGE_KEY}:${authUser.id}`);
      const parsed = raw
        ? (JSON.parse(raw) as Record<string, { reviewed?: boolean; privateNote?: string }>)
        : {};
      setAttentionMeta(
        Object.fromEntries(
          Object.entries(parsed).map(([clientId, value]) => [
            clientId,
            { reviewed: Boolean(value?.reviewed), privateNote: value?.privateNote ?? "" },
          ]),
        ),
      );
    } catch {
      setAttentionMeta({});
    }
  }, [authUser?.id]);

  const persistAttentionMeta = (
    clientId: string,
    patch: Partial<{ reviewed: boolean; privateNote: string }>,
  ) => {
    if (!authUser?.id) return;
    setAttentionMeta((current) => {
      const next = {
        ...current,
        [clientId]: {
          reviewed: current[clientId]?.reviewed ?? false,
          privateNote: current[clientId]?.privateNote ?? "",
          ...patch,
        },
      };
      window.localStorage.setItem(`${ATTENTION_STORAGE_KEY}:${authUser.id}`, JSON.stringify(next));
      return next;
    });
  };

  const attentionItems = useMemo<AttentionItem[]>(() => {
    const now = Date.now();
    return overviewRows
      .map(({ client, details }) => {
        const clientId = client.client_id;
        const recentHistory = details.history.filter(
          (item) => attentionDaysAgo(item.date, now) <= 28,
        );
        const previousHistory = details.history.filter((item) => {
          const age = attentionDaysAgo(item.date, now);
          return age > 28 && age <= 56;
        });
        const recentNutrition = details.nutritionDays.filter(
          (item) =>
            attentionDaysAgo(item.date, now) <= 28 &&
            item.meals.some((meal) => meal.foods.length > 0),
        );
        const previousNutrition = details.nutritionDays.filter((item) => {
          const age = attentionDaysAgo(item.date, now);
          return age > 28 && age <= 56 && item.meals.some((meal) => meal.foods.length > 0);
        });
        const latestHistory = details.history[0];
        const latestNutrition = details.nutritionDays[0];
        const latestHabit = details.habits[0];
        const latestMeasurement = details.bodyMeasurements[0];
        const checkins = [
          ...details.history
            .filter((session) => session.difficultyRating || session.discomfortNotes?.trim())
            .map((session) => ({
              date: session.date,
              difficulty: session.difficultyRating,
              discomfort: session.discomfortNotes?.trim() || undefined,
            })),
          ...clientFeedback
            .filter((feedback) => feedback.client_id === clientId)
            .map((feedback) => ({
              date: feedback.created_at ?? "",
              difficulty: feedback.difficulty_rating,
              discomfort: feedback.discomfort_notes?.trim() || undefined,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const currentCheckin = checkins[0];
        const previousCheckin = checkins[1];
        const lastCheckinDate = [currentCheckin?.date, latestMeasurement?.date]
          .filter(Boolean)
          .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];
        const reasons: AttentionItem["reasons"] = [];
        const hasWorkoutPlan = details.programs.some((program) => program.dayIds.length > 0);
        const hasWorkoutData = details.history.length > 0 || hasWorkoutPlan;
        const hasNutritionData =
          details.nutritionDays.length > 0 ||
          details.plannedMeals.some((meal) => meal.foods.length > 0);

        if (hasWorkoutData && !recentHistory.some((session) => session.entries.length > 0)) {
          reasons.push({ key: "workout-missing", label: attentionReasonLabel("workout-missing") });
        }
        if (hasNutritionData && recentNutrition.length === 0) {
          reasons.push({ key: "nutrition-missing", label: attentionReasonLabel("nutrition-missing") });
        }
        if (
          (details.profile?.nextCheckinDate &&
            attentionDateKey(details.profile.nextCheckinDate) < todayKey()) ||
          (!details.profile?.nextCheckinDate &&
            Boolean(details.history.length || details.bodyMeasurements.length) &&
            attentionDaysAgo(lastCheckinDate, now) > 35)
        ) {
          reasons.push({ key: "checkin-late", label: attentionReasonLabel("checkin-late") });
        }
        if (
          recentHistory.some(
            (session) =>
              session.difficultyRating === "difficult" || Boolean(session.discomfortNotes?.trim()),
          ) ||
          clientFeedback.some(
            (feedback) =>
              feedback.client_id === clientId &&
              (feedback.difficulty_rating === "difficult" ||
                Boolean(feedback.discomfort_notes?.trim())),
          )
        ) {
          reasons.push({ key: "difficulty", label: attentionReasonLabel("difficulty") });
        }
        if (details.coachMessages.some((message) => message.isRead === false)) {
          reasons.push({
            key: "unanswered-message",
            label: attentionReasonLabel("unanswered-message"),
          });
        }

        const hasAnyData = Boolean(
          latestHistory ||
            latestNutrition ||
            latestHabit ||
            latestMeasurement ||
            details.coachMessages.length ||
            clientFeedback.some((feedback) => feedback.client_id === clientId),
        );
        const status: AttentionDataStatus = !hasAnyData
          ? "insufficient"
          : reasons.length > 0
            ? "needs-attention"
            : "stable";
        const meta = attentionMeta[clientId] ?? { reviewed: false, privateNote: "" };
        return {
          clientId,
          clientName: profileDisplayName(client.profiles),
          reasons,
          status,
          lastActivity: attentionActivityDate(details),
          fourWeekWorkoutRate:
            recentHistory.length > 0
              ? Math.min(100, Math.round((recentHistory.length / 4) * 100))
              : null,
          fourWeekNutritionRate:
            recentNutrition.length > 0
              ? Math.min(100, Math.round((recentNutrition.length / 7) * 100))
              : null,
          reviewed: meta.reviewed,
          privateNote: meta.privateNote,
          fourWeekWorkoutChange: recentHistory.length - previousHistory.length,
          fourWeekNutritionChange: recentNutrition.length - previousNutrition.length,
          checkinComparison: {
            currentDifficulty: currentCheckin?.difficulty,
            previousDifficulty: previousCheckin?.difficulty,
            currentDiscomfort: currentCheckin?.discomfort,
            previousDiscomfort: previousCheckin?.discomfort,
          },
        } as AttentionItem;
      })
      .sort((a, b) => {
        if (a.reviewed !== b.reviewed) return Number(a.reviewed) - Number(b.reviewed);
        if (a.status !== b.status) return a.status === "needs-attention" ? -1 : 1;
        return (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "");
      });
  }, [attentionMeta, clientFeedback, overviewRows]);

  useEffect(() => {
    if (!clientId) return;
    // The management workspace is only for assigned trainees. Do not allow a
    // manually entered self-id (or stale return link) to reopen self-building
    // inside the trainee editor.
    if (authUser?.id === clientId && !isOwner) {
      setSelectedClientId(null);
      setShowClientWorkspace(false);
      setClientDetails(null);
      void navigate({ to: "/coach/clients", replace: true });
      return;
    }
    setSelectedClientId(clientId);
    setShowClientWorkspace(true);
    setOpenEditor(trackingLanding || workspaceMode === "all" ? null : workspaceMode);
    setActiveWorkspaceTab(
      trackingLanding
        ? "programs"
        : workspaceMode === "nutrition"
          ? "nutrition"
          : workspaceMode === "programs"
            ? "programs"
            : null,
    );
    setSelectedTrackingWorkoutId(null);
    setTrackingDate(todayKey());
    trackingClientInitializedRef.current = null;
  }, [authUser?.id, isOwner, trackingLanding, workspacePage, clientId, workspaceMode, navigate]);

  useEffect(() => {
    if (!clientsOnly || !workspacePage || clientId) return;
    setSelectedClientId(null);
    setShowClientWorkspace(false);
    setClientDetails(null);
    setOpenEditor(null);
  }, [clientId, clientsOnly, workspacePage]);

  useEffect(() => {
    if (!selectedClientId) {
      setClientDetails(null);
      setClientRealtimeStatus("connecting");
      setLastClientRefreshAt(null);
      setClientRefreshInFlight(false);
      setClientDataStale(false);
      return;
    }

    let active = true;
    setLoadingDetails(true);
    setClientDetailsError("");
    setManagementError("");
    setClientRealtimeStatus(isSelfSelected ? "connected" : "connecting");
    setLastClientRefreshAt(isSelfSelected ? Date.now() : null);
    setClientRefreshInFlight(!isSelfSelected);
    setClientDataStale(false);
    if (isSelfSelected) {
      const selfProfile = store.userProfile ?? { weight: 0, role: "owner" as const };
      setClientDetails({
        exercises: store.exercises,
        programs: store.programs,
        workouts: store.workouts,
        nutritionDays: store.nutritionDays,
        plannedMeals: store.plannedMeals ?? [],
        nutritionTargets: store.nutritionTargets,
        history: store.history,
        cardioLogs: store.cardioLogs ?? [],
        bodyMeasurements: store.bodyMeasurements ?? [],
         habits: store.habits ?? [],
         coachMessages: store.coachMessages ?? [],
        profile: selfProfile,
      });
      setClientRefreshInFlight(false);
      setLoadingDetails(false);
      return;
    }

    void pullClientDataForCoach(selectedClientId)
      .then((res) => {
        if (!active) return;
        applyClientDetails(res);
        setLoadingDetails(false);
        setClientRefreshInFlight(false);
        setClientDataStale(Boolean(res.error));
        if (!res.error) {
          setLastClientRefreshAt(Date.now());
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadingDetails(false);
        setClientRefreshInFlight(false);
        setClientDataStale(true);
        setClientDetailsError(errorMessage(error, "טעינת נתוני המתאמן נכשלה"));
      });
    return () => {
      active = false;
    };
  }, [applyClientDetails, isSelfSelected, selectedClientId, store]);

  useEffect(() => {
    if (!isCoach || isSelfSelected || !selectedClientId) return;

    let active = true;
    let refreshTimer: number | null = null;
    const refreshSelectedClient = (table?: string, status?: RealtimeConnectionStatus) => {
      if (status) {
        if (active) setClientRealtimeStatus(status);
        if (status !== "connected") return;
      }
      if (!active || document.visibilityState === "hidden" || refreshTimer !== null) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        if (!active || document.visibilityState === "hidden") return;
        setClientRefreshInFlight(true);

        if (table === "coach_clients") {
          void loadCoachClients();
        }
        if (table === "client_feedback") {
          void loadClientFeedback();
        }

        void pullClientDataForCoach(selectedClientId)
          .then((result) => {
            if (!active) return;
            applySelectedClientRefreshResult(result);
          })
          .catch((error: unknown) => {
            if (!active) return;
            setClientRefreshInFlight(false);
            setClientDataStale(true);
            setClientDetailsError(errorMessage(error, "רענון נתוני המתאמן נכשל"));
          });
        void fetchSentCoachMessages(selectedClientId)
          .then((messages) => {
            if (active) setSentCoachMessages(messages);
          })
          .catch((error: unknown) => {
            if (active) {
              setSentCoachMessagesError(
                `טעינת היסטוריית ההודעות נכשלה: ${errorMessage(error, "שגיאה בטעינת ההודעות")}`,
              );
            }
          });
      }, 0);
    };

    const unsubscribe = subscribeToCoachClientChanges(selectedClientId, refreshSelectedClient);
    const fallbackPoll = window.setInterval(() => refreshSelectedClient("poll"), 15_000);
    return () => {
      active = false;
      unsubscribe();
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackPoll);
    };
  }, [
    applyClientDetails,
    applySelectedClientRefreshResult,
    fetchSentCoachMessages,
    isCoach,
    isSelfSelected,
    loadClientFeedback,
    loadCoachClients,
    selectedClientId,
  ]);

  const retrySelectedClientRefresh = useCallback(() => {
    if (!selectedClientId || isSelfSelected || clientRefreshInFlight) return;

    setClientDetailsError("");
    setClientRefreshInFlight(true);
    void pullClientDataForCoach(selectedClientId)
      .then(applySelectedClientRefreshResult)
      .catch((error: unknown) => {
        setClientRefreshInFlight(false);
        setClientDataStale(true);
        setClientDetailsError(errorMessage(error, "רענון נתוני המתאמן נכשל"));
      });
    void fetchSentCoachMessages(selectedClientId)
      .then(setSentCoachMessages)
      .catch((error: unknown) => {
        setSentCoachMessagesError(
          `טעינת היסטוריית ההודעות נכשלה: ${errorMessage(error, "שגיאה בטעינת ההודעות")}`,
        );
      });
  }, [
    applySelectedClientRefreshResult,
    clientRefreshInFlight,
    fetchSentCoachMessages,
    isSelfSelected,
    selectedClientId,
  ]);

  useEffect(() => {
    if (!isSelfSelected || !selectedClientId) return;
    setClientDetails({
      exercises: store.exercises,
      programs: store.programs,
      workouts: store.workouts,
      nutritionDays: store.nutritionDays,
      plannedMeals: store.plannedMeals ?? [],
      nutritionTargets: store.nutritionTargets,
      history: store.history,
      cardioLogs: store.cardioLogs ?? [],
      bodyMeasurements: store.bodyMeasurements ?? [],
      habits: store.habits ?? [],
      coachMessages: store.coachMessages ?? [],
      ...(store.userProfile ? { profile: store.userProfile } : {}),
    });
    setLoadingDetails(false);
  }, [
    isSelfSelected,
    selectedClientId,
    store.cardioLogs,
    store.exercises,
    store.history,
    store.nutritionDays,
    store.nutritionTargets,
    store.plannedMeals,
    store.programs,
    store.userProfile,
    store.workouts,
    store.bodyMeasurements,
  ]);

  useEffect(() => {
    const latest = clientDetails?.bodyMeasurements?.[0];
    if (measurementDraftDirtyRef.current) return;
    setMeasurementDraft(
      latest
        ? { ...latest }
        : {
            id: "",
            date: todayKey(),
          },
    );
    setEditingMeasurements(false);
    setMeasurementNotice("");
  }, [clientDetails]);

  // The edit entry point opens the program's day chooser. The coach chooses
  // the specific workout before the focused builder is mounted.
  useEffect(() => {
    if (
      !workspacePage ||
      workspaceMode !== "all" ||
      !clientDetails ||
      editingProgramId ||
      clientDetails.programs.length === 0
    ) {
      return;
    }
    const firstProgram = clientDetails.programs[0];
    if (!firstProgram) return;
    setActiveWorkspaceTab("programs");
    setEditingProgramId(firstProgram.id);
    setEditingDayId(null);
    setShowExerciseForm(false);
    setEditingItemId(null);
    setSelectedExId("");
    setOpenWorkoutReportId(null);
  }, [clientDetails, editingProgramId, workspaceMode, workspacePage]);

  useEffect(() => {
    if (profileDraftDirtyRef.current) return;
    setCalTarget(clientDetails?.nutritionTargets?.calories ?? 0);
    const profile = clientDetails?.profile;
    setProfileAge(profile?.age === undefined ? "" : String(profile.age));
    setProfileHeight(profile?.height === undefined ? "" : String(profile.height));
    setProfileWeight(profile?.weight && profile.weight > 0 ? String(profile.weight) : "");
    setProfileWorkouts(
      profile?.workoutsPerWeek === undefined ? "" : String(profile.workoutsPerWeek),
    );
    setProfileGender(profile?.gender ?? "");
    setProfileNotice("");
  }, [clientDetails]);

  const calorieProfile = clientDetails?.profile
    ? {
        ...clientDetails.profile,
        age: profileAge === "" ? undefined : Number(profileAge),
        height: profileHeight === "" ? undefined : Number(profileHeight),
        weight: profileWeight === "" ? 0 : Number(profileWeight),
        workoutsPerWeek: profileWorkouts === "" ? undefined : Number(profileWorkouts),
        gender: profileGender === "" ? undefined : profileGender,
      }
    : null;
  const calorieEstimate =
    calorieProfile &&
    profileAge !== "" &&
    profileHeight !== "" &&
    profileWeight !== "" &&
    profileWorkouts !== "" &&
    profileGender !== ""
      ? calculateCalorieEstimate({
          ...calorieProfile,
          age: Number(profileAge),
          height: Number(profileHeight),
          weight: Number(profileWeight),
          workoutsPerWeek: Number(profileWorkouts),
          gender: profileGender as "male" | "female",
        })
      : null;

  const saveClientCalorieProfile = async () => {
    if (!selectedClientId || !clientDetails?.profile) return;
    const age = profileAge === "" ? undefined : Number(profileAge);
    const height = profileHeight === "" ? undefined : Number(profileHeight);
    const weight = profileWeight === "" ? undefined : Number(profileWeight);
    const workouts = profileWorkouts === "" ? undefined : Number(profileWorkouts);
    const gender = profileGender === "" ? undefined : profileGender;
    const valid =
      [age, height, weight, workouts].every(
        (value) => value !== undefined && Number.isFinite(value),
      ) &&
      gender !== undefined &&
      (age ?? 0) > 0 &&
      (height ?? 0) > 0 &&
      (weight ?? 0) > 0 &&
      (workouts ?? -1) >= 0 &&
      (workouts ?? 15) <= 14;
    if (!valid) {
      setProfileNotice("יש להשלים גיל, גובה, משקל ומספר אימונים תקינים כדי לשמור ולחשב.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        age_years: age,
        height_cm: height,
        weight_kg: weight,
        workouts_per_week: workouts,
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedClientId);
    if (error) {
      setProfileNotice(`שמירת נתוני הגוף נכשלה: ${error.message}`);
      return;
    }
    profileDraftDirtyRef.current = false;
    setClientDetails((current) =>
      current
        ? {
            ...current,
            ...(current.profile
              ? {
                  ...current.profile,
                  ...(age === undefined ? {} : { age }),
                  ...(height === undefined ? {} : { height }),
                  weight: weight ?? 0,
                  ...(workouts === undefined ? {} : { workoutsPerWeek: workouts }),
                  ...(gender === undefined ? {} : { gender }),
                }
              : {}),
          }
        : current,
    );
    setProfileNotice("נתוני הגוף נשמרו. הנתונים והחישוב זמינים רק באזור המאמן.");
  };

  const saveClientCalorieVisibility = async (showCalories: boolean) => {
    if (!isCoach || !selectedClientId || !clientDetails?.profile) return;
    const previous = clientDetails.profile.showCalories !== false;
    setClientDetails((current) =>
      current?.profile ? { ...current, profile: { ...current.profile, showCalories } } : current,
    );
    const { error } = await supabase.rpc("set_user_calorie_visibility", {
      target_user_id: selectedClientId,
      show_calories_enabled: showCalories,
    });
    if (error) {
      setClientDetails((current) =>
        current?.profile
          ? { ...current, profile: { ...current.profile, showCalories: previous } }
          : current,
      );
      setProfileNotice(`שמירת תצוגת הקלוריות נכשלה: ${error.message}`);
    } else {
      setProfileNotice("הגדרת תצוגת הקלוריות נשמרה.");
    }
  };

  const saveOwnerProfileCalorieVisibility = async (profileId: string, showCalories: boolean) => {
    if (!isOwner) return;
    const profile = allProfiles.find((candidate) => candidate.id === profileId);
    if (!profile || profile.profile_exists === false) return;

    const previous = profile.show_calories !== false;
    setOwnerCalorieUserId(profileId);
    setOwnerCalorieNotice("");
    setAllProfiles((current) =>
      current.map((candidate) =>
        candidate.id === profileId ? { ...candidate, show_calories: showCalories } : candidate,
      ),
    );
    setSelectedOwnerProfileDetails((current) =>
      current?.profile ? { ...current, profile: { ...current.profile, showCalories } } : current,
    );

    const { error } = await supabase.rpc("set_user_calorie_visibility", {
      target_user_id: profileId,
      show_calories_enabled: showCalories,
    });
    if (error) {
      setAllProfiles((current) =>
        current.map((candidate) =>
          candidate.id === profileId ? { ...candidate, show_calories: previous } : candidate,
        ),
      );
      setSelectedOwnerProfileDetails((current) =>
        current?.profile
          ? { ...current, profile: { ...current.profile, showCalories: previous } }
          : current,
      );
      setOwnerCalorieNotice(`שמירת תצוגת הקלוריות נכשלה: ${error.message}`);
    } else {
      setOwnerCalorieNotice("הגדרת תצוגת הקלוריות נשמרה.");
    }
    setOwnerCalorieUserId(null);
  };

  const saveOwnerProfileLoadingPreference = async (
    profileId: string,
    loadingAnimationsEnabled: boolean,
  ) => {
    if (!isOwner) return;
    const profile = allProfiles.find((candidate) => candidate.id === profileId);
    if (!profile || profile.profile_exists === false) return;

    const previous = profile.loading_animations_enabled;
    setOwnerLoadingUserId(profileId);
    setOwnerCalorieNotice("");
    setAllProfiles((current) =>
      current.map((candidate) =>
        candidate.id === profileId
          ? { ...candidate, loading_animations_enabled: loadingAnimationsEnabled }
          : candidate,
      ),
    );
    setSelectedOwnerProfileDetails((current) =>
      current?.profile
        ? {
            ...current,
            profile: { ...current.profile, loadingAnimationsEnabled },
          }
        : current,
    );

    const { error } = await supabase
      .from("profiles")
      .update({ loading_animations_enabled: loadingAnimationsEnabled })
      .eq("id", profileId);
    if (error) {
      setAllProfiles((current) =>
        current.map((candidate) =>
          candidate.id === profileId
            ? { ...candidate, loading_animations_enabled: previous ?? null }
            : candidate,
        ),
      );
      setSelectedOwnerProfileDetails((current) =>
        current?.profile
          ? {
              ...current,
              profile:
                typeof previous !== "boolean"
                  ? (() => {
                      const restored = { ...current.profile };
                      delete restored.loadingAnimationsEnabled;
                      return restored;
                    })()
                  : { ...current.profile, loadingAnimationsEnabled: previous },
            }
          : current,
      );
      setOwnerCalorieNotice(`שמירת תצוגת הטעינה נכשלה: ${error.message}`);
    } else {
      setOwnerCalorieNotice("הגדרת תצוגת הטעינה נשמרה.");
      if (profileId === authUser?.id) {
        saveLoadingAnimationsPreference(loadingAnimationsEnabled);
      }
    }
    setOwnerLoadingUserId(null);
  };

  const saveClientMeasurements = async () => {
    if (!selectedClientId || !isCoach) return;
    const numeric = (value: number | undefined) =>
      typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
    const payload = {
      user_id: selectedClientId,
      date: measurementDraft.date || todayKey(),
      chest_cm: numeric(measurementDraft.chestCm),
      waist_cm: numeric(measurementDraft.waistCm),
      hips_cm: numeric(measurementDraft.hipsCm),
      biceps_cm: numeric(measurementDraft.bicepsCm),
      thighs_cm: numeric(measurementDraft.thighsCm),
      calves_cm: numeric(measurementDraft.calvesCm),
      neck_cm: numeric(measurementDraft.neckCm),
      body_fat_pct: numeric(measurementDraft.bodyFatPct),
      muscle_mass_kg: numeric(measurementDraft.muscleMassKg),
      notes: measurementDraft.notes?.trim() || null,
    };
    const { data, error } = await supabase
      .from("body_measurements")
      .upsert(
        { ...(measurementDraft.id ? { id: measurementDraft.id } : {}), ...payload },
        { onConflict: "user_id,date" },
      )
      .select("*")
      .single();
    if (error) {
      setMeasurementNotice(`שמירת המדידות נכשלה: ${error.message}`);
      return;
    }
    measurementDraftDirtyRef.current = false;
    const saved: BodyMeasurement = {
      id: data.id,
      date: data.date,
      chestCm: data.chest_cm ?? undefined,
      waistCm: data.waist_cm ?? undefined,
      hipsCm: data.hips_cm ?? undefined,
      bicepsCm: data.biceps_cm ?? undefined,
      thighsCm: data.thighs_cm ?? undefined,
      calvesCm: data.calves_cm ?? undefined,
      neckCm: data.neck_cm ?? undefined,
      bodyFatPct: data.body_fat_pct ?? undefined,
      muscleMassKg: data.muscle_mass_kg ?? undefined,
      notes: data.notes ?? undefined,
    };
    setClientDetails((current) =>
      current
        ? {
            ...current,
            bodyMeasurements: [
              saved,
              ...(current.bodyMeasurements ?? []).filter((item) => item.date !== saved.date),
            ],
          }
        : current,
    );
    setMeasurementDraft(saved);
    setEditingMeasurements(false);
    setMeasurementNotice("המדידות החודשיות נשמרו בהצלחה.");
  };

  useEffect(() => {
    // An empty cloud menu is authoritative. Do not recreate defaults after a
    // coach intentionally removes every meal, otherwise the empty save can
    // never reach the trainee.
    if (plannedMealsDraftDirtyRef.current) return;
    setPlannedMeals(clientDetails?.plannedMeals ?? []);
    setMenuFoodMealId(null);
    setMenuFoodId("");
    setMenuFoodQuery("");
    setMenuNotice("");
  }, [clientDetails]);

  useEffect(() => {
    if (!clientDetails) return;
    const builderRouteKey = [
      selectedClientId ?? "",
      initialProgramId ?? "",
      initialDayId ?? "",
      initialExerciseId ?? "",
      initialNutritionDate ?? "",
      initialNutritionMealId ?? "",
      initialNutritionFoodId ?? "",
    ].join("|");
    if (hydratedBuilderRouteKeyRef.current === builderRouteKey) return;
    hydratedBuilderRouteKeyRef.current = builderRouteKey;

    const requestedProgram = initialProgramId
      ? clientDetails.programs.find((program) => program.id === initialProgramId)
      : undefined;
    const latestProgram = requestedProgram ?? clientDetails.programs.at(-1);
    if (latestProgram) {
      setEditingProgramId(latestProgram.id);
      const requestedDay = initialDayId
        ? clientDetails.workouts.find((workout) => workout.id === initialDayId)
        : undefined;
      const firstWorkoutDay = requestedDay;
      setEditingDayId(firstWorkoutDay?.id ?? null);
      const requestedItem = initialExerciseId
        ? firstWorkoutDay?.items.find((item) => item.exerciseId === initialExerciseId)
        : undefined;
      setEditingItemId(requestedItem?.id ?? null);
      setShowExerciseForm(Boolean(requestedItem));
      if (requestedItem) {
        selectExerciseForBuilder(
          requestedItem.exerciseId,
          requestedItem.equipment,
          requestedItem.cableGrip,
        );
        setTargetWeight(requestedItem.targetWeight || requestedItem.weight);
        setSetsCount(requestedItem.sets);
        setRepMin(requestedItem.repMin || requestedItem.reps);
        setRepMax(requestedItem.repMax || requestedItem.reps);
        setSetWeights(
          Array.from(
            { length: Math.max(1, requestedItem.sets) },
            (_, index) =>
              requestedItem.workingSets?.[index]?.weight ??
              requestedItem.targetWeight ??
              requestedItem.weight,
          ),
        );
        setSetRepMins(
          Array.from(
            { length: Math.max(1, requestedItem.sets) },
            (_, index) =>
              requestedItem.workingSets?.[index]?.reps ??
              requestedItem.repMin ??
              requestedItem.reps,
          ),
        );
        setSetRepMaxes(
          Array.from(
            { length: Math.max(1, requestedItem.sets) },
            (_, index) =>
              requestedItem.workingSets?.[index]?.repMax ??
              requestedItem.repMax ??
              requestedItem.reps,
          ),
        );
        setSetRests(
          Array.from(
            { length: Math.max(1, requestedItem.sets) },
            (_, index) => requestedItem.workingSets?.[index]?.rest ?? requestedItem.rest ?? 90,
          ),
        );
        setSetNotes(
          Array.from(
            { length: Math.max(1, requestedItem.sets) },
            (_, index) => requestedItem.workingSets?.[index]?.notes ?? "",
          ),
        );
        setTechniqueNotes(requestedItem.techniqueNotes || requestedItem.notes);
      }
    } else {
      setEditingProgramId(null);
      setEditingDayId(null);
      setEditingItemId(null);
    }
    const latestNutritionDay = [...clientDetails.nutritionDays].sort((a, b) =>
      b.date.localeCompare(a.date),
    )[0];
    if (initialNutritionDate) {
      setMenuDate(initialNutritionDate);
    } else if (latestNutritionDay) {
      setMenuDate(latestNutritionDay.date);
    }
    setFocusedExerciseId(initialExerciseId ?? null);
    setFocusedNutritionFoodId(initialNutritionFoodId ?? null);
    setFocusedNutritionMealId(initialNutritionMealId ?? null);
  }, [
    clientDetails,
    initialDayId,
    initialExerciseId,
    initialNutritionDate,
    initialNutritionFoodId,
    initialNutritionMealId,
    initialProgramId,
    selectedClientId,
  ]);

  useEffect(() => {
    const pending = pendingCreatedExercise;
    if (!pending || !clientDetails) return;
    if (pending.context.clientId && selectedClientId !== pending.context.clientId) return;
    if (!pending.context.dayId) return;

    const day = clientDetails.workouts.find((workout) => workout.id === pending.context.dayId);
    if (!day) return;
    const program = clientDetails.programs.find((item) => item.dayIds.includes(day.id));

    setActiveWorkspaceTab("programs");
    setOpenEditor("programs");
    setEditingProgramId(program?.id ?? pending.context.programId);
    setEditingDayId(day.id);
    setShowExerciseForm(true);
    setEditingItemId(null);
    selectExerciseForBuilder(pending.exerciseId);
    // The new exercise has already been saved from the catalog screen. Queue
    // the assignment after this render so the selected day receives it too.
    setAutoAssignCreatedExerciseId(pending.exerciseId);
    setPendingCreatedExercise(null);
    if (Number.isFinite(pending.context.scrollY)) {
      window.requestAnimationFrame(() => {
        const appScrollContainer = getAppScrollContainer();
        if (appScrollContainer) appScrollContainer.scrollTop = pending.context.scrollY;
        else window.scrollTo(0, pending.context.scrollY);
      });
    }
  }, [clientDetails, pendingCreatedExercise, selectedClientId]);

  useEffect(() => {
    if (!focusedExerciseId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`coach-exercise-${focusedExerciseId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedExerciseId, editingDayId]);

  useEffect(() => {
    if (!focusedNutritionFoodId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`coach-menu-food-${focusedNutritionFoodId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedNutritionFoodId, menuDate, plannedMeals]);

  // OWNER RPC: change a target user's role. The database function remains the
  // only authority for role changes; this UI never writes profiles.role.
  const handleOwnerChangeRole = async (
    targetUserId: string,
    newRole: "owner" | "coach" | "client",
  ): Promise<void> => {
    setRoleChangeUserId(targetUserId);
    setRoleChangeNotice("");
    setManagementError("");
    try {
      const { data, error } = await supabase.rpc("change_user_role", {
        target_user_id: targetUserId,
        new_role: newRole,
      });

      if (error) throw error;
      if (data !== true) throw new Error("ה־RPC לא אישר את שינוי התפקיד");

      const refreshed = await loadAllProfilesForOwner();
      if (!refreshed) return;
      await loadCoachClients();
      setRoleChangeNotice(
        `תפקיד המשתמש עודכן בהצלחה ל-${
          newRole === "owner" ? "בעלים" : newRole === "coach" ? "מאמן" : "מתאמן"
        }`,
      );
    } catch (err: unknown) {
      setManagementError(`שינוי התפקיד נכשל: ${errorMessage(err, "שגיאה בשינוי תפקיד")}`);
    } finally {
      setRoleChangeUserId(null);
    }
  };

  const handleApproveClient = async (profile: ProfileRow) => {
    const assignedCoachId = approvalCoachByUser[profile.id] || "";
    if (!assignedCoachId) {
      setApprovalNotice("יש לבחור מאמן לפני אישור המתאמן.");
      return;
    }
    const fullName = (approvalNameByUser[profile.id] ?? profile.full_name ?? "").trim();
    if (fullName.split(/\s+/).filter(Boolean).length < 2) {
      setApprovalNotice("יש להשלים שם פרטי ושם משפחה לפני האישור.");
      return;
    }

    setApprovalUserId(profile.id);
    setApprovalNotice("");
    try {
      const { data, error } = await supabase.rpc("approve_client_registration_with_visibility", {
        target_client_id: profile.id,
        approved_full_name: fullName,
        assigned_coach_id: assignedCoachId,
        show_calories_enabled: approvalShowCaloriesByUser[profile.id] ?? true,
      });
      if (error) throw error;
      if (data !== true) throw new Error("האישור לא התקבל במסד הנתונים");
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
      setApprovalNameByUser((current) => {
        const next = { ...current };
        delete next[profile.id];
        return next;
      });
      setApprovalNotice(`ההרשמה של ${fullName} אושרה והמתאמן שויך למאמן.`);
    } catch (err: unknown) {
      setApprovalNotice(`אישור ההרשמה נכשל: ${errorMessage(err, "שגיאה באישור")}`);
    } finally {
      setApprovalUserId(null);
    }
  };

  const handleRejectClient = async (profile: ProfileRow) => {
    if (!window.confirm(`לדחות את ההרשמה של ${profileDisplayName(profile)}?`)) return;
    setApprovalUserId(profile.id);
    setApprovalNotice("");
    try {
      const { data, error } = await supabase.rpc("reject_client_registration", {
        target_client_id: profile.id,
      });
      if (error) throw error;
      if (data !== true) throw new Error("הדחייה לא התקבלה במסד הנתונים");
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
      setApprovalNotice(`ההרשמה של ${profileDisplayName(profile)} נדחתה.`);
    } catch (err: unknown) {
      setApprovalNotice(`דחיית ההרשמה נכשלה: ${errorMessage(err, "שגיאה בדחייה")}`);
    } finally {
      setApprovalUserId(null);
    }
  };

  const openOwnerProfile = async (profile: ProfileRow) => {
    setSelectedOwnerProfileId(profile.id);
    setSelectedOwnerProfileDetails(null);
    const additionalCoachId =
      profile.coach_ids?.find((coachId) => {
        if (coachId === profile.id) return false;
        return allProfiles.find((candidate) => candidate.id === coachId)?.role !== "owner";
      }) ?? (profile.coach_id !== profile.id ? profile.coach_id : "");
    setAssignmentCoachByUser((current) => ({
      ...current,
      [profile.id]: additionalCoachId ?? "",
    }));
    if (profile.role === "client" || profile.role === "coach" || profile.role === "owner") {
      const details = await pullClientDataForCoach(profile.id);
      if (!details.error) setSelectedOwnerProfileDetails(details);
    }
  };

  const handleRepairMissingProfile = async (profile: ProfileRow) => {
    if (profile.profile_exists !== false) return;
    setOwnerUserActionId(profile.id);
    setManagementError("");
    try {
      const { data, error } = await supabase.rpc("repair_missing_client_profile", {
        target_user_id: profile.id,
      });
      if (error) throw error;
      if (data !== true) throw new Error("יצירת הפרופיל לא התקבלה במסד הנתונים");
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
      setRoleChangeNotice(
        `נוצר פרופיל client עבור ${profileDisplayName(profile)} והוא ממתין לאישור בעלים.`,
      );
    } catch (err: unknown) {
      setManagementError(`תיקון הפרופיל נכשל: ${errorMessage(err, "שגיאה ביצירת הפרופיל")}`);
    } finally {
      setOwnerUserActionId(null);
    }
  };

  const handleOwnerAssignClient = async (profile: ProfileRow) => {
    const newCoachId = assignmentCoachByUser[profile.id] || "";
    const isCurrentOwnerProfile = profile.id === authUser?.id && profile.role === "owner";
    const canAssignCoach =
      profile.role === "coach" ||
      (profile.role === "client" && profile.approval_status === "approved");
    if (
      !isCurrentOwnerProfile &&
      (!canAssignCoach || !newCoachId)
    ) {
      setManagementError("יש לבחור מאמן למתאמן או למאמן לפני השמירה.");
      return;
    }
    setAssignmentUserId(profile.id);
    setManagementError("");
    try {
      if (isCurrentOwnerProfile) {
        const { data, error } = await supabase.rpc("assign_owner_profile_coach", {
          new_coach_id: newCoachId,
        });
        if (error) throw error;
        if (data !== true) throw new Error("בחירת המאמן לא התקבלה במסד הנתונים");
        setAllProfiles((current) =>
          current.map((candidate) =>
            candidate.id === profile.id ? { ...candidate, coach_id: newCoachId || null } : candidate,
          ),
        );
        setRoleChangeNotice("בחירת המאמן לפרופיל הבעלים נשמרה בהצלחה.");
        return;
      }

      const { data, error } = await supabase.rpc("assign_client_to_coach", {
        target_client_id: profile.id,
        new_coach_id: newCoachId,
      });
      if (error) throw error;
      if (data !== true) throw new Error("השינוי לא התקבל במסד הנתונים");
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
      const refreshedDetails = await pullClientDataForCoach(profile.id);
      if (!refreshedDetails.error) setSelectedOwnerProfileDetails(refreshedDetails);
      setRoleChangeNotice(
        profile.role === "coach"
          ? "שיוך המאמן למאמן מלווה עודכן בהצלחה."
          : "שיוך המתאמן למאמן עודכן בהצלחה.",
      );
    } catch (err: unknown) {
      setManagementError(`עדכון שיוך המתאמן נכשל: ${errorMessage(err, "שגיאה בעדכון השיוך")}`);
    } finally {
      setAssignmentUserId(null);
    }
  };

  const handleDeleteUser = async (profile: ProfileRow) => {
    if (profile.id === authUser?.id || profile.role === "owner") return;
    const confirmed = window.confirm(
      `למחוק לצמיתות את המשתמש ${profileDisplayName(profile)} וכל הנתונים שלו? לא ניתן לבטל פעולה זו.`,
    );
    if (!confirmed) return;
    setOwnerUserActionId(profile.id);
    setManagementError("");
    try {
      const { data, error } = await supabase.rpc("delete_user_account", {
        target_user_id: profile.id,
      });
      if (error) throw error;
      if (data !== true) throw new Error("המחיקה לא התקבלה במסד הנתונים");
      setSelectedOwnerProfileId(null);
      setSelectedOwnerProfileDetails(null);
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
    } catch (err: unknown) {
      setManagementError(`מחיקת המשתמש נכשלה: ${errorMessage(err, "שגיאה במחיקה")}`);
    } finally {
      setOwnerUserActionId(null);
    }
  };

  // Send Coach Message to Client
  const handleSendCoachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = coachMsgText.trim();
    const clientIdForMessage = selectedClientId;
    if (!clientIdForMessage || !message) return;
    setMsgSentNotice("");
    setMsgSendError("");

    try {
      await sendCoachMessage(
        () => supabase.auth.getUser(),
        async (payload) => await supabase.from("coach_messages").insert(payload),
        clientIdForMessage,
        message,
      );
      setMsgSentNotice("הודעת החיזוק נשלחה בהצלחה למתאמן!");
      setCoachMsgText("");
      setFailedCoachMessage(null);
      void fetchSentCoachMessages(clientIdForMessage)
        .then((messages) => {
          setSentCoachMessagesError("");
          if (selectedClientId === clientIdForMessage) setSentCoachMessages(messages);
        })
        .catch((error: unknown) => {
          if (selectedClientId === clientIdForMessage) {
            setSentCoachMessagesError(
              `ההודעה נשמרה, אך רענון ההיסטוריה נכשל: ${errorMessage(
                error,
                "שגיאה בטעינת ההודעות",
              )}`,
            );
          }
        });
      setTimeout(() => setMsgSentNotice(""), 3000);
    } catch (err: unknown) {
      setFailedCoachMessage({ message, createdAt: new Date().toISOString() });
      setMsgSendError(`שליחת הודעת החיזוק נכשלה: ${errorMessage(err, "שגיאה בשליחת ההודעה")}`);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = broadcastText.trim();
    if (!message) return;
    setBroadcastNotice("");
    setBroadcastError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("יש להתחבר מחדש כדי לשלוח הודעה.");
      const { error } = await supabase.from("broadcast_announcements").insert({
        sender_id: user.id,
        audience: broadcastAudience,
        message,
      });
      if (error) throw error;
      setBroadcastText("");
      setBroadcastNotice("ההודעה נשלחה בהצלחה.");
      const { data: created } = await supabase
        .from("broadcast_announcements")
        .select("id, sender_id, audience, message, created_at")
        .eq("sender_id", user.id)
        .eq("message", message)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (created) {
        setSentBroadcasts((current) => [
          {
            id: created.id,
            senderId: created.sender_id,
            audience: created.audience,
            message: created.message,
            createdAt: created.created_at,
          },
          ...current.filter((item) => item.id !== created.id),
        ]);
      }
    } catch (err: unknown) {
      setBroadcastError(
        `שליחת ההודעה נכשלה: ${errorMessage(err, "יש לוודא שמיגרציית ההודעות הוחלה ב־Supabase.")}`,
      );
    }
  };

  const handleDeleteBroadcast = async (broadcast: BroadcastAnnouncement) => {
    if (!authUser?.id || broadcast.senderId !== authUser.id) return;
    setBroadcastError("");
    const { error } = await supabase
      .from("broadcast_announcements")
      .delete()
      .eq("id", broadcast.id)
      .eq("sender_id", authUser.id);
    if (error) {
      setBroadcastError(`מחיקת ההודעה נכשלה: ${error.message}`);
      return;
    }
    setSentBroadcasts((current) => current.filter((item) => item.id !== broadcast.id));
    setBroadcastNotice("ההודעה נמחקה לכולם.");
  };

  // Add Client by Email via RPC lookup
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("מנוי לא מחובר");

      const { data: lookupRes, error: lookupErr } = await supabase.rpc(
        "lookup_client_id_by_email",
        { lookup_email: inviteEmail.trim() },
      );

      if (lookupErr || !lookupRes || lookupRes.length === 0) {
        throw new Error("משתמש לא נמצא. יש לוודא שהמתאמן נרשם ל־MY routine בכתובת זו.");
      }

      const foundClientId = lookupRes[0].client_id;

      const { error: linkErr } = await supabase.rpc("link_client_to_current_coach", {
        target_client_id: foundClientId,
      });

      if (linkErr) throw linkErr;

      setInviteMsg("המתאמן שויך בהצלחה לחשבון המאמן שלך!");
      setInviteEmail("");
      setShowAddModal(false);
      loadCoachClients();
    } catch (err: unknown) {
      setInviteMsg(errorMessage(err, "אירעה שגיאה בשיוך המתאמן"));
    }
  };

  // Create Program for Client
  const handleCreateClientProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoach || !selectedClientId || !newProgramName.trim()) return;
    setManagementError("");

    const programId = uid();
    if (isSelfSelected) {
      const program: Program = {
        id: programId,
        name: newProgramName.trim(),
        notes: "",
        dayIds: [],
      };
      saveProgram(program);
      setNewProgramName("");
      return;
    }

    const { error } = await supabase
      .from("programs")
      .insert(clientProgramInsertPayload(programId, selectedClientId, newProgramName.trim()));

    if (error) {
      setManagementError(`שמירת התוכנית נכשלה: ${error.message}`);
      return;
    }
    setNewProgramName("");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  const handleRenameClientProgram = async (program: Program, name: string) => {
    const nextName = name.trim();
    if (!nextName || nextName === program.name || !selectedClientId) return;
    setManagementError("");
    if (isSelfSelected) {
      saveProgram({ ...program, name: nextName });
      return;
    }
    const { error } = await supabase
      .from("programs")
      .update({ name: nextName, updated_at: new Date().toISOString() })
      .eq("id", program.id)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון שם התוכנית נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  const handleDeleteClientProgram = async (program: Program) => {
    if (!isCoach || !selectedClientId) return;
    setManagementError("");

    if (isSelfSelected) {
      deleteProgram(program.id);
      setEditingProgramId((current) => (current === program.id ? null : current));
      setEditingDayId(null);
      return;
    }

    const { error: daysError } = await supabase
      .from("program_days")
      .delete()
      .eq("program_id", program.id)
      .eq("user_id", selectedClientId);

    if (daysError) {
      setManagementError(`מחיקת ימי האימון נכשלה: ${daysError.message}`);
      return;
    }

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", program.id)
      .eq("user_id", selectedClientId);

    if (error) {
      setManagementError(`מחיקת התוכנית נכשלה: ${error.message}`);
      return;
    }

    setEditingProgramId((current) => (current === program.id ? null : current));
    setEditingDayId(null);
    const refreshedDetails = await pullClientDataForCoach(selectedClientId);
    applyClientDetails(refreshedDetails);
  };

  // Add Program Day for Client
  const handleAddProgramDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoach || !selectedClientId || !editingProgramId || !newDayName.trim()) return;
    setManagementError("");

    const dayId = uid();
    if (isSelfSelected) {
      const day: Workout = { id: dayId, name: newDayName.trim(), notes: "", items: [] };
      saveWorkoutInProgram(editingProgramId, day);
      setNewDayName("");
      setEditingDayId(dayId);
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .insert(
        clientProgramDayInsertPayload(
          dayId,
          editingProgramId,
          selectedClientId,
          newDayName.trim(),
          (clientDetails?.workouts?.length || 0) + 1,
        ),
      );

    if (error) {
      setManagementError(`שמירת יום האימון נכשלה: ${error.message}`);
      return;
    }
    setNewDayName("");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  const handleRenameWorkoutDay = async (day: Workout, name: string) => {
    const nextName = name.trim();
    if (!nextName || nextName === day.name || !selectedClientId) return;
    setManagementError("");
    if (isSelfSelected) {
      saveWorkout({ ...day, name: nextName });
      return;
    }
    const { error } = await supabase
      .from("program_days")
      .update({ name: nextName, updated_at: new Date().toISOString() })
      .eq("id", day.id)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון שם יום האימון נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Assign Prescribed Exercise to Program Day
  const handleAddExerciseToDay = async (e: React.FormEvent | null, exerciseIdOverride?: string) => {
    e?.preventDefault();
    const exerciseId = exerciseIdOverride ?? selectedExId;
    if (!isCoach || !selectedClientId || !editingDayId || !exerciseId) return;
    setManagementError("");

    const currentDay = clientDetails?.workouts?.find((w) => w.id === editingDayId);
    if (!currentDay) return;
    const selectedExercise = uniqueCanonicalExercises(store.exercises).find(
      (exercise) => exercise.id === exerciseId,
    );
    const selectedExerciseName = selectedExercise
      ? exerciseDisplayName(selectedExercise)
      : undefined;
    // Keep the selected exercise in the coach's catalog as part of the
    // assignment flow too. This repairs older plans created before the
    // builder's return-to-catalog flow was added.
    if (selectedExercise) saveExercise(selectedExercise);

    if (editingItemId) {
      const configuredModes = Array.from(
        { length: Math.max(1, setsCount) },
        (_, index) => setModes[index] ?? "normal",
      );
      const hasDropSets = configuredModes.includes("drop");
      const hasSuperset = configuredModes.includes("superset");
      const editingItem = currentDay.items.find((item) => item.id === editingItemId);
      const existingWorkingSets =
        editingItem?.workingSets?.filter((set) => set.setType !== "warmup") ?? [];
      const warmupIndexes = configuredModes
        .map((mode, index) => (mode === "warmup" ? index : -1))
        .filter((index) => index >= 0);
      const workingIndexes = configuredModes
        .map((mode, index) => (mode === "warmup" ? -1 : index))
        .filter((index) => index >= 0);
      const workingSetPayload = workingIndexes.map((sourceIndex, index) => {
        const mode = configuredModes[sourceIndex] ?? "normal";
        const existing = existingWorkingSets[index];
        return {
          id: existing?.id || uid(),
          setNumber: index + 1,
          setType: mode,
          weight: setWeights[sourceIndex] ?? targetWeight,
          reps: setRepMins[sourceIndex] ?? repMin,
          repMax: setRepMaxes[sourceIndex] ?? repMax,
          rest: setRests[sourceIndex] ?? restSec,
          ...(setNotes[sourceIndex]?.trim() ? { notes: setNotes[sourceIndex].trim() } : {}),
          ...(mode === "drop" ? { dropSet: true } : {}),
        };
      });
      const warmupPayload = warmupIndexes.map((sourceIndex, index) => ({
        id: editingItem?.warmups?.[index]?.id || uid(),
        weight: setWeights[sourceIndex] ?? warmupWeight,
        reps: setRepMins[sourceIndex] ?? warmupReps,
        repsMax: setRepMaxes[sourceIndex] ?? warmupRepsMax,
      }));
      const updatedItems = currentDay.items.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              exerciseId,
              ...(selectedExerciseName ? { exerciseName: selectedExerciseName } : {}),
              ...(selectedEquipment ? { equipment: selectedEquipment } : {}),
              cableGrip:
                selectedEquipment === "פולי / כבלים" && selectedCableGrip
                  ? selectedCableGrip
                  : undefined,
              sets: workingSetPayload.length,
              reps: Math.max(1, repMin),
              repMin: Math.max(1, repMin),
              repMax: Math.max(repMin, repMax),
              targetWeight,
              weight: targetWeight,
              notes: techNotes.trim(),
              workingSets: workingSetPayload,
              warmups: warmupPayload,
              dropSetConfig: hasDropSets
                ? {
                    enabled: true,
                    drops: 2,
                    levels: [
                      {
                        weight: Number(dropLevel1Weight) || targetWeight,
                        repsMin: dropLevel1RepsMin,
                        repsMax: dropLevel1RepsMax,
                      },
                      {
                        weight: Number(dropLevel2Weight) || targetWeight,
                        repsMin: dropLevel2RepsMin,
                        repsMax: dropLevel2RepsMax,
                      },
                    ],
                  }
                : { enabled: false, drops: 0, levels: [] },
              supersetId: hasSuperset ? "A" : "",
              supersetPartnerId: hasSuperset ? supersetPartnerId : "",
              ...(hasSuperset ? { supersetTargetWeight: supersetPartnerWeight } : {}),
              ...(hasSuperset
                ? {
                    supersetRepsMin: Math.max(1, supersetRepsMin),
                    supersetRepsMax: Math.max(supersetRepsMin, supersetRepsMax),
                  }
                : {}),
            }
          : item,
      );

      if (isSelfSelected) {
        saveWorkout({ ...currentDay, items: updatedItems });
      } else {
        const { error } = await supabase
          .from("program_days")
          .update(clientProgramDayItemsUpdatePayload(updatedItems))
          .eq("id", editingDayId)
          .eq("user_id", selectedClientId);
        if (error) {
          setManagementError(`עדכון התרגיל נכשל: ${error.message}`);
          return;
        }
        pullClientDataForCoach(selectedClientId).then(applyClientDetails);
      }
      setEditingItemId(null);
      setSelectedExId("");
      setShowExerciseForm(false);
      setTechniqueNotes("");
      setExerciseBuilderNotice("השינויים נשמרו. אפשר להמשיך לבנות את האימון.");
      return;
    }

    const configuredModes = Array.from(
      { length: setsCount },
      (_, index) => setModes[index] ?? "normal",
    );
    const warmupModeCount = configuredModes.filter((mode) => mode === "warmup").length;
    const workingModeCount = configuredModes.length - warmupModeCount;
    const warmupIndexes = configuredModes
      .map((mode, index) => (mode === "warmup" ? index : -1))
      .filter((index) => index >= 0);
    const workingIndexes = configuredModes
      .map((mode, index) => (mode === "warmup" ? -1 : index))
      .filter((index) => index >= 0);
    const hasDropSets = configuredModes.includes("drop");
    const hasSupersetSets = configuredModes.includes("superset");
    if (hasSupersetSets && !supersetPartnerId) return;
    const legacyReduction = dropReductionValue === "" ? NaN : Number(dropReductionValue);
    const legacyLevelWeight =
      Number.isFinite(legacyReduction) && legacyReduction > 0 && dropReductionMode
        ? dropReductionMode === "percent"
          ? targetWeight * (1 - legacyReduction / 100)
          : targetWeight - legacyReduction
        : NaN;
    const parsedDropLevel1Weight =
      dropLevel1Weight === "" ? legacyLevelWeight : Number(dropLevel1Weight);
    const parsedDropLevel2Weight =
      dropLevel2Weight === "" ? legacyLevelWeight : Number(dropLevel2Weight);
    if (
      hasDropSets &&
      (!Number.isFinite(parsedDropLevel1Weight) ||
        parsedDropLevel1Weight <= 0 ||
        !Number.isFinite(parsedDropLevel2Weight) ||
        parsedDropLevel2Weight <= 0)
    ) {
      setExerciseBuilderNotice("בדרופ־סט יש להזין משקל תקין (גדול מ-0) לשני השלבים.");
      return;
    }
    setExerciseBuilderNotice("");

    const newWorkoutItem: WorkoutItem = {
      id: uid(),
      exerciseId,
      ...(selectedExerciseName ? { exerciseName: selectedExerciseName } : {}),
      ...(selectedEquipment ? { equipment: selectedEquipment } : {}),
      ...(selectedEquipment === "פולי / כבלים" && selectedCableGrip
        ? { cableGrip: selectedCableGrip }
        : {}),
      sets: workingModeCount,
      reps: repMin,
      repType: "range",
      repMin,
      repMax,
      targetWeight,
      weight: targetWeight,
      rest: restSec,
      notes: "",
      ...(techNotes.trim() ? { techniqueNotes: techNotes.trim() } : {}),
      ...(approvedAltIds.length > 0 ? { approvedAlternatives: approvedAltIds } : {}),
      ...(bodyweightAlternativeId ? { bodyweightAlternativeId } : {}),
      ...(hasSupersetSets && supersetGroup.trim()
        ? {
            supersetId: supersetGroup.trim(),
            supersetPartnerId,
            supersetOrder: 1 as const,
            supersetTargetWeight: supersetPartnerWeight,
            supersetRepsMin,
            supersetRepsMax,
          }
        : {}),
      ...(hasDropSets
        ? {
            dropSetConfig: {
              enabled: true,
              drops: configuredModes.filter((mode) => mode === "drop").length,
              levels: [
                {
                  weight: parsedDropLevel1Weight,
                  repsMin: dropLevel1Weight === "" ? dropRepsMin : dropLevel1RepsMin,
                  repsMax: dropLevel1Weight === "" ? dropRepsMax : dropLevel1RepsMax,
                },
                {
                  weight: parsedDropLevel2Weight,
                  repsMin: dropLevel2Weight === "" ? dropRepsMin : dropLevel2RepsMin,
                  repsMax: dropLevel2Weight === "" ? dropRepsMax : dropLevel2RepsMax,
                },
              ],
            },
          }
        : {}),
      workingSets: (() => {
        let dropOccurrence = 0;
        return workingIndexes.map((sourceIndex, index) => {
          const mode = configuredModes[sourceIndex] ?? "normal";
          let weight = setWeights[sourceIndex] ?? targetWeight;
          let reps = setRepMins[sourceIndex] ?? repMin;
          let repMaxForSet = setRepMaxes[sourceIndex] ?? repMax;
          if (mode === "drop") {
            dropOccurrence += 1;
            const level =
              dropOccurrence === 1
                ? {
                    weight: parsedDropLevel1Weight,
                    repsMin: dropLevel1Weight === "" ? dropRepsMin : dropLevel1RepsMin,
                    repsMax: dropLevel1Weight === "" ? dropRepsMax : dropLevel1RepsMax,
                  }
                : {
                    weight: parsedDropLevel2Weight,
                    repsMin: dropLevel2Weight === "" ? dropRepsMin : dropLevel2RepsMin,
                    repsMax: dropLevel2Weight === "" ? dropRepsMax : dropLevel2RepsMax,
                  };
            weight = Math.max(0, level.weight);
            reps = level.repsMin;
            repMaxForSet = level.repsMax;
          }
          return {
            id: uid(),
            setNumber: index + 1,
            setType: mode,
            weight,
            reps,
            repMax: repMaxForSet,
            rest: setRests[sourceIndex] ?? restSec,
            ...(setNotes[sourceIndex]?.trim() ? { notes: setNotes[sourceIndex].trim() } : {}),
            ...(mode === "drop" ? { dropSet: true } : {}),
          };
        });
      })(),
      ...(warmupModeCount > 0
        ? {
            warmups: warmupIndexes.map((sourceIndex) => ({
              id: uid(),
              weight: setWeights[sourceIndex] ?? warmupWeight,
              reps: setRepMins[sourceIndex] ?? warmupReps,
              repsMax: setRepMaxes[sourceIndex] ?? warmupRepsMax,
            })),
          }
        : {}),
    };

    const partnerItem =
      hasSupersetSets && supersetGroup.trim() && supersetPartnerId
        ? {
            ...newWorkoutItem,
            id: uid(),
            exerciseId: supersetPartnerId,
            supersetPartnerId: exerciseId,
            supersetOrder: 2 as const,
            supersetTargetWeight: targetWeight,
          }
        : null;
    const updatedItems = partnerItem
      ? [...currentDay.items, newWorkoutItem, partnerItem]
      : [...currentDay.items, newWorkoutItem];

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      setSelectedExId("");
      setEditingItemId(null);
      setShowExerciseForm(true);
      setTechniqueNotes("");
      setSupersetGroup("");
      setSupersetPartnerId("");
      setSupersetPartnerQuery("");
      setDropSetEnabled(false);
      setDropLevel1Weight("");
      setDropLevel2Weight("");
      setSetModes(["normal", "normal", "normal"]);
      setSetNotes(["", "", ""]);
      setApprovedAltIds([]);
      setBodyweightAlternativeId("");
      setExerciseBuilderNotice("התרגיל נוסף. אפשר לבחור תרגיל נוסף ולהמשיך לבנות.");
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update(clientProgramDayItemsUpdatePayload(updatedItems))
      .eq("id", editingDayId)
      .eq("user_id", selectedClientId);

    if (error) {
      setManagementError(`שמירת התרגיל נכשלה: ${error.message}`);
      return;
    }
    setSelectedExId("");
    setEditingItemId(null);
    setShowExerciseForm(true);
    setTechniqueNotes("");
    setSupersetGroup("");
    setSupersetPartnerId("");
    setSupersetPartnerQuery("");
    setDropSetEnabled(false);
    setDropLevel1Weight("");
    setDropLevel2Weight("");
    setSetModes(["normal", "normal", "normal"]);
    setSetNotes(["", "", ""]);
    setApprovedAltIds([]);
    setBodyweightAlternativeId("");
    setExerciseBuilderNotice("התרגיל נוסף. אפשר לבחור תרגיל נוסף ולהמשיך לבנות.");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  useEffect(() => {
    const exerciseId = autoAssignCreatedExerciseId;
    if (!exerciseId || !clientDetails || !editingDayId || !selectedClientId) return;

    // This state is only produced by the create-and-return flow. Clear it
    // before awaiting the write so a realtime refresh cannot submit twice.
    setAutoAssignCreatedExerciseId(null);
    void handleAddExerciseToDay(null, exerciseId);
  }, [
    autoAssignCreatedExerciseId,
    clientDetails,
    editingDayId,
    handleAddExerciseToDay,
    selectedClientId,
  ]);

  // Delete exercise from day
  const handleRemoveExerciseFromDay = async (dayId: string, itemId: string) => {
    if (!isCoach) return;
    setManagementError("");
    const currentDay = clientDetails?.workouts?.find((w) => w.id === dayId);
    if (!currentDay) return;

    const updatedItems = currentDay.items.filter((item) => item.id !== itemId);

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", dayId)
      .eq("user_id", selectedClientId);

    if (error) {
      setManagementError(`מחיקת התרגיל נכשלה: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId!).then(applyClientDetails);
  };

  const handleUpdateExerciseItem = async (
    dayId: string,
    itemId: string,
    patch: Partial<WorkoutItem>,
  ) => {
    if (!isCoach || !selectedClientId) return;
    const currentDay = clientDetails?.workouts?.find((workout) => workout.id === dayId);
    if (!currentDay) return;
    const updatedItems = currentDay.items.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    );

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update(clientProgramDayItemsUpdatePayload(updatedItems))
      .eq("id", dayId)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון התרגיל נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Save Nutrition Targets for Client
  const handleSaveNutritionTargets = async () => {
    if (!isCoach || !selectedClientId) return;
    setManagementError("");
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase
      .from("nutrition_days")
      .upsert(
        clientNutritionTargetUpsertPayload(
          `${selectedClientId}_${today}`,
          selectedClientId,
          today,
          calTarget,
        ),
      );

    if (error) {
      setManagementError(`שמירת יעד התזונה נכשלה: ${error.message}`);
      return;
    }
    setEditingNutrition(false);
    const refreshed = await pullClientDataForCoach(selectedClientId);
    applyClientDetails(refreshed);
  };

  const addPlannedMeal = () => {
    if (!isCoach) return;
    markPlannedMealsDraftDirty();
    setPlannedMeals((current) => [
      ...current,
      { id: uid(), name: `ארוחה ${current.length + 1}`, foods: [] },
    ]);
  };

  const addPlannedFood = (mealId: string) => {
    if (!isCoach) return;
    const food = store.foods.find((item) => item.id === menuFoodId);
    if (!food || menuFoodQuantity <= 0) return;
    const scrollContainer = getAppScrollContainer() ?? document.scrollingElement;
    const scrollTop = scrollContainer?.scrollTop ?? window.scrollY;
    const mealElement = document.getElementById(`coach-menu-meal-${mealId}`);
    const mealTop = mealElement?.getBoundingClientRect().top ?? null;
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The search field is removed immediately after adding. Blurring it first
    // prevents mobile browsers from scrolling the disappearing focused field
    // back into view.
    activeElement?.blur();
    const plannedFood: MealFood = mealFoodFromPortion(food, menuFoodQuantity, menuFoodUnit);
    markPlannedMealsDraftDirty();
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, plannedFood] } : meal,
      ),
    );
    setMenuFoodMealId(null);
    setMenuFoodId("");
    setMenuFoodQuery("");
    setMenuFoodQuantity(1);
    setMenuFoodUnit("serving");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollTop;
        }
        scrollContainer?.scrollTo({ top: scrollTop, behavior: "auto" });
        const updatedMealElement = document.getElementById(`coach-menu-meal-${mealId}`);
        if (mealTop !== null && updatedMealElement) {
          const topDelta = updatedMealElement.getBoundingClientRect().top - mealTop;
          if (Math.abs(topDelta) > 1) {
            scrollContainer?.scrollBy({ top: topDelta, behavior: "auto" });
          }
        }
      });
    });
  };

  const removePlannedFood = (mealId: string, foodId: string) => {
    if (!isCoach) return;
    markPlannedMealsDraftDirty();
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
          : meal,
      ),
    );
  };

  const savePlannedMenu = async () => {
    if (!isCoach || !selectedClientId) return;
    if (isSelfSelected) {
      savePlannedMeals(plannedMeals);
      plannedMealsDraftDirtyRef.current = false;
      setMenuNotice("התפריט האישי נשמר ויופיע גם באזור התזונה שלך.");
      return;
    }

    const { error } = await supabase.rpc(
      "save_user_planned_menu",
      clientPlannedMenuRpcPayload(selectedClientId, plannedMeals),
    );
    if (error) {
      setMenuNotice(`שמירת התפריט נכשלה: ${error.message}`);
      return;
    }
    plannedMealsDraftDirtyRef.current = false;
    setMenuNotice("התפריט נשמר ויופיע למתאמן במסך התזונה האישי.");
    const refreshed = await pullClientDataForCoach(selectedClientId);
    applyClientDetails(refreshed);
  };

  const renderOwnerCalorieToggle = (profile: ProfileRow, compact = false) => {
    const hasProfile = profile.profile_exists !== false;
    const showCalories = profile.show_calories !== false;
    const isSaving = ownerCalorieUserId === profile.id;
    const label = hasProfile
      ? `הצגת קלוריות עבור ${profileDisplayName(profile)}`
      : `הצגת קלוריות אינה זמינה עבור ${profileDisplayName(profile)}`;

    return (
      <button
        type="button"
        disabled={!hasProfile || isSaving}
        onClick={(event) => {
          event.stopPropagation();
          void saveOwnerProfileCalorieVisibility(profile.id, !showCalories);
        }}
        aria-label={label}
        aria-pressed={hasProfile ? showCalories : undefined}
        className={`flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition-colors ${
          !hasProfile
            ? "cursor-not-allowed border-border/60 bg-surface-2 text-muted-foreground"
            : showCalories
              ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border bg-surface-2 text-muted-foreground hover:border-primary/30"
        } ${compact ? "shrink-0" : "w-full justify-between"}`}
      >
        <span className={compact ? "hidden sm:inline" : ""}>קלוריות</span>
        <span className="flex items-center gap-1">
          <span>{!hasProfile ? "—" : showCalories ? "כן" : "לא"}</span>
          <span
            className={`relative h-4 w-7 rounded-full ${
              !hasProfile ? "bg-border/70" : showCalories ? "bg-primary" : "bg-border"
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow ${
                showCalories ? "start-3.5" : "start-0.5"
              }`}
            />
          </span>
        </span>
      </button>
    );
  };

  const renderOwnerLoadingToggle = (profile: ProfileRow, compact = false) => {
    const hasProfile = profile.profile_exists !== false;
    const isFemale = profile.gender === "female";
    const animationsEnabled = profile.loading_animations_enabled ?? isFemale;
    const isSaving = ownerLoadingUserId === profile.id;
    const label = hasProfile
      ? `תצוגת טעינה עבור ${profileDisplayName(profile)}`
      : `תצוגת טעינה אינה זמינה עבור ${profileDisplayName(profile)}`;

    return (
      <button
        type="button"
        disabled={!hasProfile || isSaving}
        onClick={(event) => {
          event.stopPropagation();
          void saveOwnerProfileLoadingPreference(profile.id, !animationsEnabled);
        }}
        aria-label={label}
        aria-pressed={hasProfile ? animationsEnabled : undefined}
        className={`flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition-colors ${
          !hasProfile
            ? "cursor-not-allowed border-border/60 bg-surface-2 text-muted-foreground"
            : animationsEnabled
              ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border bg-surface-2 text-muted-foreground hover:border-primary/30"
        } ${compact ? "shrink-0" : "w-full justify-between"}`}
      >
        <span className={compact ? "hidden sm:inline" : ""}>טעינה</span>
        <span className="flex items-center gap-1">
          <span>{!hasProfile ? "—" : animationsEnabled ? "אנימציות" : "גלגל"}</span>
          <span
            className={`relative h-4 w-7 rounded-full ${
              !hasProfile ? "bg-border/70" : animationsEnabled ? "bg-primary" : "bg-border"
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow ${
                animationsEnabled ? "start-3.5" : "start-0.5"
              }`}
            />
          </span>
        </span>
      </button>
    );
  };

  const clientWorkouts = useMemo(() => {
    const seen = new Set<string>();
    return (clientDetails?.workouts ?? []).filter((workout) => {
      if (seen.has(workout.id)) return false;
      seen.add(workout.id);
      return true;
    });
  }, [clientDetails?.workouts]);

  useEffect(() => {
    if (!selectedClientId) {
      trackingClientInitializedRef.current = null;
      return;
    }
    if (!clientDetails || trackingClientInitializedRef.current === selectedClientId) return;

    trackingClientInitializedRef.current = selectedClientId;
    const latestSession = [...clientDetails.history].sort((a, b) =>
      b.date.localeCompare(a.date),
    )[0];
    if (latestSession) {
      setTrackingDate(reportSessionDateKey(latestSession.date));
    }
    // Start the tracking workspace with the workout list visible. A report is
    // opened only after the coach explicitly chooses a workout.
    setSelectedTrackingWorkoutId(null);
  }, [clientDetails, clientWorkouts, selectedClientId]);

  if (role === undefined) {
    return (
      <AppShell title="דשבורד מאמן" kicker="מאמנים וצוות מקצועי">
        <div className="surface-card mt-4 space-y-3 rounded-3xl p-6 text-center">
          <h2 className="font-display text-xl font-bold text-ink">מאמתת הרשאות גישה...</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            המסך ייפתח רק לאחר טעינת תפקיד החשבון המאומת.
          </p>
        </div>
      </AppShell>
    );
  }

  if (!isCoach) return <Navigate to="/" replace />;

  const selfDisplayName = store.userProfile?.fullName?.trim() || "אני";
  const selfClientRow: CoachClientRow | null =
    isOwner && authUser
      ? {
          id: `self-${authUser.id}`,
          client_id: authUser.id,
          created_at: "",
          profiles: {
            email: authUser.email ?? null,
            full_name: selfDisplayName,
            weight_kg: store.userProfile?.weight ?? null,
          },
        }
      : null;
  const ownerWorkspaceRows: CoachClientRow[] = isOwner
    ? allProfiles
        .filter(
          (profile) =>
            profile.id !== authUser?.id && profile.profile_exists !== false && Boolean(profile.role),
        )
        .map((profile) => ({
          id: `owner-user-${profile.id}`,
          client_id: profile.id,
          created_at: profile.created_at ?? "",
          profiles: {
            email: profile.email ?? null,
            full_name: profile.full_name ?? null,
            weight_kg: profile.weight_kg ?? null,
          },
        }))
    : [];
  const selectableClients = isOwner
    ? [...(selfClientRow ? [selfClientRow] : []), ...ownerWorkspaceRows]
    : selfClientRow
      ? [selfClientRow, ...clients]
      : clients;
  const filteredClients = selectableClients.filter((c) => {
    const emailStr = (c.profiles?.email || "").toLowerCase();
    const nameStr = profileDisplayName(c.profiles).toLowerCase();
    const q = clientSearch.toLowerCase();
    return !q ? isOwner || c.client_id === authUser?.id : emailStr.includes(q) || nameStr.includes(q);
  });
  const clientSearchQuery = clientSearch.trim().toLocaleLowerCase();
  const clientPickerRoute = clientsOnly && workspacePage && !clientId;
  const selectedClientInfo = selectableClients.find((c) => c.client_id === selectedClientId);
  const latestProgram = clientDetails?.programs?.[clientDetails.programs.length - 1];
  const latestNutritionDay = [...(clientDetails?.nutritionDays ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const clientNutritionNotes = (clientDetails?.nutritionDays ?? []).flatMap((day) =>
    day.meals.flatMap((meal) =>
      meal.foods
        .filter((food) => food.notes?.trim())
        .map((food) => ({ date: day.date, meal: meal.name, note: food.notes!.trim() })),
    ),
  );
  const trackingSessions = clientDetails
    ? getWorkoutSessionsForDate(clientDetails.history, trackingDate)
    : [];
  const selectedTrackingWorkout = clientWorkouts.find(
    (workout) => workout.id === selectedTrackingWorkoutId,
  );
  const visibleTrackingSessions = selectedTrackingWorkout
    ? trackingSessions.filter((session) =>
        historySessionMatchesWorkout(session, selectedTrackingWorkout),
      )
    : [];
  const activeProgram =
    clientDetails?.programs.find((program) => program.id === editingProgramId) ??
    clientDetails?.programs.at(-1);
  const trackingPlanRows = selectedTrackingWorkout?.items
    ? workoutReviewItems(selectedTrackingWorkout).map((item) => {
        const sessionEntries = visibleTrackingSessions.flatMap((session) => session.entries);
        const actualRecords = visibleTrackingSessions.flatMap((session) =>
          session.entries
            .filter((entry) => historyEntryMatchesWorkoutItem(entry, item))
            .map((entry) => ({ date: session.date, sessionId: session.id, entry })),
        );
        const actualEntries = actualRecords.map(({ entry }) => entry);
        const actualEntry = actualEntries[0];
        const replacementEntry = actualEntry
          ? undefined
          : findReplacementEntry(item, sessionEntries);
        return {
          item,
          actualEntry,
          actualEntries,
          actualRecords,
          replacementEntry,
          exercise: Array.from(
            new Map(
              [...store.exercises, ...(clientDetails?.exercises ?? [])].map((exercise) => [
                exercise.id,
                exercise,
              ]),
            ).values(),
          ).find(
            (exercise) =>
              exercise.id === item.exerciseId ||
              normalizedReportLabel(exercise.name) === normalizedReportLabel(item.exerciseName),
          ),
        };
      })
    : [];
  const trackingNutritionDay = clientDetails?.nutritionDays.find(
    (day) => day.date === trackingDate,
  );
  const openTrackedPlan = (workoutId: string, exerciseId?: string) => {
    const targetClientId = selectedClientId ?? clientId;
    if (!targetClientId || !clientDetails) return;
    const program = clientDetails.programs.find((item) => item.dayIds.includes(workoutId));
    setActiveWorkspaceTab("programs");
    setOpenEditor("programs");
    navigate({
      to: "/coach/clients/$clientId/program",
      params: { clientId: targetClientId },
      search: {
        dayId: workoutId,
        ...(program ? { programId: program.id } : {}),
        ...(exerciseId ? { exerciseId } : {}),
      },
    });
  };
  const openTrackedNutrition = (date: string, mealId: string, foodId?: string) => {
    if (!selectedClientId) return;
    navigate({
      to: "/coach/clients/$clientId/nutrition",
      params: { clientId: selectedClientId },
      search: {
        date,
        ...(mealId ? { mealId } : {}),
        ...(foodId ? { foodId } : {}),
      },
    });
  };
  const shiftTrackingDate = (amount: number) => {
    const date = new Date(`${trackingDate}T00:00:00`);
    date.setDate(date.getDate() + amount);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setTrackingDate(`${year}-${month}-${day}`);
  };
  const exerciseQueryLower = exerciseQuery.trim().toLocaleLowerCase();
  const exerciseMuscleOptions = [
    "הכל",
    ...Array.from(
      new Set(
        store.exercises.flatMap((exercise) => [
          exercise.muscleGroup,
          ...(exercise.muscleGroups ?? []),
        ]),
      ),
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "he")),
  ];
  const canonicalExerciseOptions = useMemo(
    () => uniqueCanonicalExercises(store.exercises),
    [store.exercises],
  );
  const filteredExerciseOptions = exerciseQueryLower
    ? canonicalExerciseOptions.filter((exercise) =>
        [
          exercise.name,
          exercise.nameHe,
          exercise.muscleGroup,
          exercise.equipment,
          ...exerciseEquipmentOptions(exercise),
        ]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(exerciseQueryLower)),
      )
    : canonicalExerciseOptions;
  const visibleExerciseOptions =
    exerciseMuscleFilter === "הכל"
      ? filteredExerciseOptions
      : filteredExerciseOptions.filter(
          (exercise) =>
            exercise.muscleGroup === exerciseMuscleFilter ||
            (exercise.muscleGroups ?? []).includes(exerciseMuscleFilter),
        );

  const supersetPartnerOptions = canonicalExerciseOptions
    .filter((exercise) => exercise.id !== selectedExId)
    .filter((exercise) => {
      const query = supersetPartnerQuery.trim().toLocaleLowerCase();
      if (!query) return false;
      return [
        exercise.name,
        exercise.nameHe,
        exercise.muscleGroup,
        exercise.equipment,
        ...exerciseEquipmentOptions(exercise),
      ]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query));
    })
    .slice(0, 12);
  const selectedSupersetPartner = canonicalExerciseOptions.find(
    (exercise) => exercise.id === supersetPartnerId,
  );
  const selectedBuilderExercise = canonicalExerciseOptions.find(
    (exercise) => exercise.id === selectedExId,
  );
  const selectedBuilderEquipmentOptions = selectedBuilderExercise
    ? exerciseEquipmentOptions(selectedBuilderExercise)
    : [];
  const selectedBuilderGripOptions = selectedBuilderExercise
    ? exerciseGripOptions(selectedBuilderExercise)
    : [];

  const renderSupersetPartnerSearch = () => (
    <div className="min-w-0">
      <label className="block text-right text-[9px] font-bold text-violet-900">
        חיפוש תרגיל בן־זוג לסופר־סט
        <div className="relative mt-1">
          <Search
            className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={supersetPartnerQuery}
            onChange={(event) => {
              setSupersetPartnerQuery(event.target.value);
              if (supersetPartnerId) setSupersetPartnerId("");
            }}
            placeholder="הקלד שם תרגיל..."
            aria-label="חיפוש תרגיל בן־זוג לסופר סט"
            className="h-9 w-full rounded-lg border border-violet-200 bg-background pe-8 ps-2 text-xs font-normal text-ink outline-none focus:border-violet-400"
          />
        </div>
      </label>
      {selectedSupersetPartner ? (
        <p className="mt-1 rounded-lg bg-violet-100 px-2 py-1 text-right text-[10px] font-bold text-violet-900">
          נבחר: {exerciseDisplayName(selectedSupersetPartner)}
        </p>
      ) : null}
      {supersetPartnerQuery.trim() ? (
        <div
          role="listbox"
          aria-label="תוצאות חיפוש לתרגיל בן־זוג"
          className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-violet-200 bg-white p-1"
        >
          {supersetPartnerOptions.length > 0 ? (
            supersetPartnerOptions.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                role="option"
                aria-selected={exercise.id === supersetPartnerId}
                onClick={() => {
                  setSupersetPartnerId(exercise.id);
                  setSupersetPartnerQuery("");
                }}
                className="block w-full rounded-md px-2 py-1.5 text-right text-[11px] text-ink hover:bg-violet-50"
              >
                {exerciseDisplayName(exercise)}
                <span className="ms-1 text-[9px] text-muted-foreground">
                  ({exercise.muscleGroup})
                </span>
              </button>
            ))
          ) : (
            <p className="px-2 py-2 text-right text-[10px] text-muted-foreground">
              לא נמצאו תרגילים מתאימים.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );

  const openCreateExercise = () => {
    if (!isCoach) return;
    setShowExercisePicker(false);
    setNewExerciseDraft(emptyExercise());
    setNewExerciseError("");
    setShowCreateExercise(true);
  };

  const handleCreateExercise = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCoach) return;
    const name = newExerciseDraft.name.trim();
    if (!name) {
      setNewExerciseError("יש להזין שם תרגיל.");
      return;
    }
    const equipmentChoices = selectedExerciseEquipmentOptions(newExerciseDraft);
    const exercise = {
      ...newExerciseDraft,
      name,
      equipment: equipmentChoices[0] || newExerciseDraft.equipment,
      equipmentOptions: equipmentChoices,
      description: newExerciseDraft.description.trim(),
      instructions: newExerciseDraft.instructions?.trim() ?? "",
      notes: newExerciseDraft.notes.trim(),
    };
    saveExercise(exercise);
    selectExerciseForBuilder(exercise.id, undefined, undefined, exercise);
    setExerciseQuery("");
    setShowCreateExercise(false);
    setShowExercisePicker(false);
    setShowExerciseForm(true);
    setExerciseBuilderNotice(`התרגיל "${exercise.name}" נוסף למאגר ונבחר לאימון.`);
    if (selectedClientId && editingDayId) {
      // Queue the assignment after the selection state is committed so the
      // new exercise's equipment is used by the workout item as well.
      setAutoAssignCreatedExerciseId(exercise.id);
    }
  };
  const ownerUserSearchLower = ownerUserSearch.trim().toLocaleLowerCase();
  const filteredOwnerProfiles = ownerUserSearchLower
    ? allProfiles.filter((profile) =>
        [profile.full_name, profile.email]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(ownerUserSearchLower)),
      )
    : allProfiles;
  const menuFoodResults = searchFoods(store.foods, menuFoodQuery).slice(0, 24);
  const selectedMenuFood = store.foods.find((food) => food.id === menuFoodId);
  const menuTotals = foodTotals(plannedMeals.flatMap((meal) => meal.foods));
  const needsPlan = overviewRows.filter((row) => row.details.programs.length === 0);
  const needsExercises = overviewRows.filter(
    (row) =>
      row.details.programs.length > 0 &&
      row.details.workouts.every((workout) => workout.items.length === 0),
  );
  const quietClients = overviewRows.filter(
    (row) =>
      !row.details.history.some(
        (session) => Date.now() - new Date(session.date).getTime() <= 14 * 24 * 60 * 60 * 1000,
      ),
  );
  const coachCount = allProfiles.filter((profile) => profile.role === "coach").length;
  const clientCount = allProfiles.filter((profile) => profile.role === "client").length;
  const ownerCount = allProfiles.filter((profile) => profile.role === "owner").length;
  const today = todayKey();
  const newTodayProfiles = allProfiles.filter(
    (profile) => profile.created_at?.slice(0, 10) === today,
  );
  const pendingApprovals = allProfiles.filter(
    (profile) => profile.role === "client" && profile.approval_status === "pending",
  );
  const visibleAttentionItems =
    attentionView === "open" ? attentionItems.filter((item) => !item.reviewed) : attentionItems;
  const attentionOpenCount = attentionItems.filter(
    (item) => item.status === "needs-attention" && !item.reviewed,
  ).length;
  const openClientFromOverview = (clientId: string) => {
    if (!trackingLanding && authUser?.id === clientId && !isOwner) {
      // A coach can build their own plan from the client list, but the
      // self-id route is intentionally guarded against opening as a trainee.
      // Open the local workspace directly instead of navigating through that
      // guarded route, which would immediately return to the list.
      setSelectedClientId(clientId);
      setShowClientWorkspace(true);
      setOpenEditor(null);
      setActiveWorkspaceTab("programs");
      setSelectedTrackingWorkoutId(null);
      setTrackingDate(todayKey());
      trackingClientInitializedRef.current = null;
      return;
    }
    navigate({
      to: trackingLanding ? "/coach/tracking/$clientId" : "/coach/clients/$clientId",
      params: { clientId },
    });
  };

  return (
    <AppShell
      title={clientsOnly ? (trackingLanding ? "מעקב" : "עריכה") : ""}
      kicker={
        clientsOnly ? (trackingLanding ? "ביצועי מתאמנים בפועל" : "בניית תוכניות ותפריטים") : ""
      }
      compactHeader
    >
      {!clientsOnly ? (
        <section className="space-y-2 text-start">
          <section className="surface-card border-rose-200 bg-rose-50/60 p-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">
                  חשוב לבדוק
                </p>
                <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-rose-950">
                  <MessageSquare className="h-4 w-4 text-rose-700" />
                  הערות ותלונות של מתאמנים
                </h2>
              </div>
              {clientFeedback.length > 0 ? (
                <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                  {clientFeedback.length}
                </span>
              ) : null}
            </div>
            {clientFeedback.length === 0 ? (
              <p className="mt-2 rounded-xl bg-white/80 p-2.5 text-xs font-semibold text-rose-900/70">
                אין כרגע הערות או תלונות חדשות ממתאמנים.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {clientFeedback.slice(0, 5).map((feedback) => {
                  const client = clients.find((item) => item.client_id === feedback.client_id);
                  const profile =
                    client?.profiles ?? allProfiles.find((item) => item.id === feedback.client_id);
                  const note = feedback.discomfort_notes?.trim() || feedback.coach_notes?.trim();
                  return (
                    <div
                      key={feedback.id}
                      className="rounded-xl border border-rose-100 bg-white/85 p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-bold text-rose-950">
                          {profileDisplayName(profile)}
                        </span>
                        <span className="shrink-0 text-[10px] text-rose-700">
                          {feedback.discomfort_notes?.trim() ? "תלונה / אי־נוחות" : "הערה"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-rose-950/75">
                        {note || `דירוג קושי: ${feedback.difficulty_rating || "לא צוין"}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {isOwner ? (
            <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-4">
              <div className="surface-card flex items-center justify-between gap-1 border-primary/25 bg-primary/5 px-2 py-1.5 text-start">
                <p className="truncate text-[10px] font-bold text-muted-foreground">מתאמנים</p>
                <p className="font-display text-base font-extrabold leading-none text-ink">
                  {clients.length}
                </p>
              </div>
              <div className="surface-card flex items-center justify-between gap-1 border-accent/60 bg-accent/20 px-2 py-1.5 text-start">
                <p className="truncate text-[10px] font-bold text-muted-foreground">דורשים תכנית</p>
                <p className="font-display text-base font-extrabold leading-none text-ink">
                  {needsPlan.length}
                </p>
              </div>
              <div className="surface-card flex items-center justify-between gap-1 border-border bg-surface-2 px-2 py-1.5 text-start">
                <p className="truncate text-[10px] font-bold text-muted-foreground">שקטים 14 יום</p>
                <p className="font-display text-base font-extrabold leading-none text-ink">
                  {quietClients.length}
                </p>
              </div>
              <div className="surface-card flex items-center justify-between gap-1 border-purple-200 bg-purple-50/70 px-2 py-1.5 text-start">
                <p className="truncate text-[10px] font-bold text-purple-700">משתמשים</p>
                <p className="font-display text-base font-extrabold leading-none text-purple-950">
                  {allProfiles.length}
                </p>
              </div>
            </div>
          ) : null}

          <section className="surface-card space-y-2.5 border-primary/20 bg-primary/5 p-4 text-start">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <h2 className="text-sm font-extrabold text-primary">הודעה לכל הקבוצה</h2>
                <p className="text-[11px] text-muted-foreground">
                  {isOwner ? "שליחה לכל המאמנים, לכל המתאמנים או לכולם" : "שליחה לכל המתאמנים שלך"}
                </p>
              </div>
            </div>
            {broadcastNotice ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs font-bold text-emerald-800">
                {broadcastNotice}
              </p>
            ) : null}
            {broadcastError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-800">
                {broadcastError}
              </p>
            ) : null}
            <form onSubmit={handleSendBroadcast} className="space-y-2">
              {isOwner ? (
                <select
                  value={broadcastAudience}
                  onChange={(e) =>
                    setBroadcastAudience(e.target.value as "coaches" | "clients" | "everyone")
                  }
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="coaches">כל המאמנים</option>
                  <option value="clients">כל המתאמנים</option>
                  <option value="everyone">כולם</option>
                </select>
              ) : null}
              <div className="flex gap-2">
                <textarea
                  required
                  rows={2}
                  maxLength={2000}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="כתבי הודעה שתופיע במסכי הבית..."
                  className="min-h-12 flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="self-end rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
                >
                  שלח
                </button>
              </div>
            </form>
            {sentBroadcasts.length > 0 ? (
              <div className="space-y-1.5 border-t border-primary/15 pt-3">
                <p className="text-[11px] font-bold text-muted-foreground">הודעות ששלחת</p>
                {sentBroadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-background px-3 py-2"
                  >
                    <div className="min-w-0 text-start">
                      <p className="text-xs font-semibold leading-relaxed text-ink">
                        {broadcast.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(broadcast.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteBroadcast(broadcast)}
                      className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold text-destructive hover:bg-destructive/10"
                    >
                      מחיקה לכולם
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {isOwner ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="surface-card border-primary/20 bg-primary/5 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
                      פעילות חדשה
                    </p>
                    <h3 className="text-xs font-bold text-ink">נרשמו היום</h3>
                  </div>
                  <span className="font-display text-lg font-extrabold leading-none text-primary">
                    {newTodayProfiles.length}
                  </span>
                </div>
                {newTodayProfiles.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {newTodayProfiles.slice(0, 3).map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span className="truncate font-semibold text-ink">
                          {profileDisplayName(profile)}
                        </span>
                        <span className="text-muted-foreground">
                          {profile.role === "coach" ? "מאמן" : "מתאמן"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-[10px] text-muted-foreground">אין הרשמות חדשות היום.</p>
                )}
              </div>
              <div className="surface-card border-amber-200 bg-amber-50/70 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
                      דורש טיפול
                    </p>
                    <h3 className="text-xs font-bold text-ink">אישורי הרשמה</h3>
                  </div>
                  <span className="font-display text-lg font-extrabold leading-none text-amber-800">
                    {pendingApprovals.length}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-amber-900/75">
                  {pendingApprovals.length > 0
                    ? "יש מתאמנים שממתינים לאישור שם ושיוך למאמן."
                    : "אין כרגע הרשמות שממתינות לאישור."}
                </p>
              </div>
            </div>
          ) : null}

          {overviewRows.length === 0 ? (
            <div className="surface-card p-4 text-sm text-muted-foreground">
              {clients.length === 0
                ? "עדיין אין מתאמנים משויכים. עברי ללשונית מתאמנים כדי להוסיף מתאמן."
                : genderText(gender, "טוענת את סיכום המתאמנים...", "טוען את סיכום המתאמנים...")}
            </div>
          ) : (
            <section className="surface-card space-y-3 border-primary/20 bg-primary/[0.025] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    Coach Attention Queue
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 text-base font-extrabold text-ink">
                    <Activity className="h-4 w-4 text-primary" />
                    תור תשומת לב למאמן
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    סיבות ברורות לפעולה, מגמה של 4 שבועות ומצב אמינות הנתונים לכל מתאמן.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">
                    {attentionOpenCount} פתוחים
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttentionView((value) => (value === "open" ? "all" : "open"))}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"
                  >
                    {attentionView === "open" ? "הצגת כולם" : "הצגת פתוחים"}
                  </button>
                </div>
              </div>
              {visibleAttentionItems.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  {attentionView === "open"
                    ? "כל הפריטים נבדקו. אין כרגע מתאמן שממתין לטיפול."
                    : "אין כרגע מספיק נתונים להצגת מתאמנים."}
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleAttentionItems.map((item) => {
                    const expanded = expandedAttentionClientId === item.clientId;
                    const statusLabel =
                      item.status === "stable"
                        ? "יציב"
                        : item.status === "needs-attention"
                          ? "דורש תשומת לב"
                          : "אין מספיק נתונים";
                    const statusClass =
                      item.status === "stable"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "needs-attention"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700";
                    return (
                      <div
                        key={item.clientId}
                        className={`rounded-2xl border bg-background p-3 transition-colors ${
                          item.reviewed ? "border-border/60 opacity-75" : "border-primary/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAttentionClientId(expanded ? null : item.clientId)
                            }
                            className="min-w-0 flex-1 text-start"
                            aria-expanded={expanded}
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-sm font-extrabold text-ink">
                                {item.clientName}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
                                {statusLabel}
                              </span>
                              {item.reviewed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3" /> נבדק
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {item.reasons.length > 0
                                ? item.reasons.map((reason) => reason.label).join(" · ")
                                : "אין חריגה מזוהה"}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              openClientFromOverview(item.clientId);
                              window.setTimeout(
                                () =>
                                  document
                                    .getElementById("coach-checkin")
                                    ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                                450,
                              );
                            }}
                            className="flex shrink-0 items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-2 text-[10px] font-extrabold text-primary hover:bg-primary/15"
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            צ׳ק־אין
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.reasons.map((reason) => (
                            <span
                              key={reason.key}
                              className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-ink"
                            >
                              {reason.label}
                            </span>
                          ))}
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                            <Clock3 className="h-3 w-3" />
                            פעילות אחרונה:{" "}
                            {item.lastActivity
                              ? new Date(item.lastActivity).toLocaleDateString("he-IL")
                              : "אין"}
                          </span>
                        </div>
                        {expanded ? (
                          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              <div className="rounded-xl bg-surface-2 p-2 text-center">
                                <span className="block text-[10px] text-muted-foreground">אימונים · 4 שבועות</span>
                                <strong className="text-sm text-ink">
                                  {item.fourWeekWorkoutRate === null
                                    ? "—"
                                    : `${item.fourWeekWorkoutRate}%`}
                                </strong>
                                <span className="block text-[10px] text-muted-foreground">
                                  {item.fourWeekWorkoutChange >= 0 ? "+" : ""}
                                  {item.fourWeekWorkoutChange} מול 4 קודמים
                                </span>
                              </div>
                              <div className="rounded-xl bg-surface-2 p-2 text-center">
                                <span className="block text-[10px] text-muted-foreground">תזונה · 4 שבועות</span>
                                <strong className="text-sm text-ink">
                                  {item.fourWeekNutritionRate === null
                                    ? "—"
                                    : `${item.fourWeekNutritionRate}%`}
                                </strong>
                                <span className="block text-[10px] text-muted-foreground">
                                  {item.fourWeekNutritionChange >= 0 ? "+" : ""}
                                  {item.fourWeekNutritionChange} מול 4 קודמים
                                </span>
                              </div>
                              <div className="rounded-xl bg-surface-2 p-2 text-center">
                                <span className="block text-[10px] text-muted-foreground">הרגלים</span>
                                <strong className="text-sm text-ink">
                                  {item.status === "insufficient" ? "—" : "נרשמו"}
                                </strong>
                                <span className="block text-[10px] text-muted-foreground">לפי נתוני המתאמן</span>
                              </div>
                              <div className="rounded-xl bg-surface-2 p-2 text-center">
                                <span className="block text-[10px] text-muted-foreground">משוב ומדידות</span>
                                <strong className="text-sm text-ink">
                                  {item.reasons.some((reason) => reason.key === "difficulty")
                                    ? "דורש שיחה"
                                    : item.status === "insufficient"
                                      ? "חסר"
                                      : "זמין"}
                                </strong>
                                <span className="block text-[10px] text-muted-foreground">תמונת מצב</span>
                              </div>
                            </div>
                            <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-2.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink">
                                <ClipboardList className="h-3.5 w-3.5 text-primary" />
                                השוואת צ׳ק־אין לתשובה קודמת
                              </div>
                              <div className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-2">
                                <p className="rounded-lg bg-background p-2 text-muted-foreground">
                                  <strong className="text-ink">נוכחי: </strong>
                                  {item.checkinComparison.currentDifficulty
                                    ? `קושי ${item.checkinComparison.currentDifficulty}`
                                    : "אין דירוג קושי"}
                                  {item.checkinComparison.currentDiscomfort
                                    ? ` · ${item.checkinComparison.currentDiscomfort}`
                                    : ""}
                                </p>
                                <p className="rounded-lg bg-background p-2 text-muted-foreground">
                                  <strong className="text-ink">קודם: </strong>
                                  {item.checkinComparison.previousDifficulty
                                    ? `קושי ${item.checkinComparison.previousDifficulty}`
                                    : "אין תשובה קודמת"}
                                  {item.checkinComparison.previousDiscomfort
                                    ? ` · ${item.checkinComparison.previousDiscomfort}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => openClientFromOverview(item.clientId)}
                                className="rounded-xl bg-primary px-3 py-2 text-[10px] font-extrabold text-white hover:bg-primary/90"
                              >
                                פתיחת סביבת עבודה
                              </button>
                              <Link
                                to="/coach/tracking/$clientId"
                                params={{ clientId: item.clientId }}
                                className="rounded-xl border border-primary/20 bg-background px-3 py-2 text-[10px] font-extrabold text-primary hover:bg-primary/5"
                              >
                                פתיחת tracking
                              </Link>
                            </div>
                            <textarea
                              value={item.privateNote}
                              onChange={(event) =>
                                persistAttentionMeta(item.clientId, {
                                  privateNote: event.target.value,
                                })
                              }
                              placeholder="הערה פרטית למאמן — לא מוצגת למתאמן"
                              className="min-h-16 w-full rounded-xl border border-primary/15 bg-primary/[0.02] p-2.5 text-xs text-ink outline-none focus:border-primary"
                              aria-label={`הערה פרטית עבור ${item.clientName}`}
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-[10px] text-muted-foreground">
                                ההערה נשמרת מקומית במכשיר המאמן בלבד.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  persistAttentionMeta(item.clientId, { reviewed: !item.reviewed })
                                }
                                className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-extrabold ${
                                  item.reviewed
                                    ? "border border-border bg-background text-muted-foreground"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {item.reviewed ? "החזרה לתור הפתוח" : "סימון כ־reviewed"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {isOwner ? (
            <section className="surface-card space-y-3 border-purple-200 bg-purple-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                    מצב האפליקציה
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 text-sm font-bold text-purple-950">
                    <Crown className="h-4 w-4 text-purple-700" />
                    תמונת מצב של החשבונות והצוות
                  </h3>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-800">
                  {allProfiles.length} חשבונות
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">מאמנים</span>
                  <strong className="mt-1 block text-base text-purple-950">{coachCount}</strong>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">מתאמנים</span>
                  <strong className="mt-1 block text-base text-purple-950">{clientCount}</strong>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">בעלים</span>
                  <strong className="mt-1 block text-base text-purple-950">{ownerCount}</strong>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      <div className="space-y-5 text-start">
        {managementError ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive"
          >
            טעינת נתוני הניהול נכשלה: {managementError}
          </div>
        ) : null}
        {/* Owner Management Section */}
        {isOwner && !clientsOnly && (
          <div className="surface-card p-5 rounded-3xl space-y-3 bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-sm text-purple-950">ניהול משתמשים והרשאות בעלים</h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                {allProfiles.length} משתמשים במערכת
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {pendingApprovals.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-amber-950">אישור מתאמנים חדשים</p>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {pendingApprovals.length} ממתינים
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-900/75">
                    {genderText(
                      gender,
                      "בדקי את השם המלא ובחרי מאמן לפני שהחשבון נכנס למערכת.",
                      "בדוק את השם המלא ובחר מאמן לפני שהחשבון נכנס למערכת.",
                    )}
                  </p>
                  <div className="mt-3 space-y-2">
                    {pendingApprovals.map((profile) => (
                      <div
                        key={profile.id}
                        className="rounded-xl border border-amber-200 bg-white p-2.5"
                      >
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          שם מלא
                          <input
                            value={approvalNameByUser[profile.id] ?? profile.full_name ?? ""}
                            onChange={(event) =>
                              setApprovalNameByUser((current) => ({
                                ...current,
                                [profile.id]: event.target.value,
                              }))
                            }
                            className="h-9 rounded-lg border border-border px-2 text-xs font-semibold text-ink outline-none focus:border-primary"
                          />
                        </label>
                        <div className="mt-2 flex gap-2">
                          <select
                            value={approvalCoachByUser[profile.id] ?? ""}
                            onChange={(event) =>
                              setApprovalCoachByUser((current) => ({
                                ...current,
                                [profile.id]: event.target.value,
                              }))
                            }
                            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-xs text-ink outline-none focus:border-primary"
                            aria-label={`בחירת מאמן עבור ${profileDisplayName(profile)}`}
                          >
                            <option value="">בחירת מאמן...</option>
                            {allProfiles
                              .filter(
                                (candidate) =>
                                  candidate.role === "coach" ||
                                  (candidate.id === authUser?.id && candidate.role === "owner"),
                              )
                              .map((coach) => (
                                <option key={coach.id} value={coach.id}>
                                  {coach.id === authUser?.id
                                    ? "אני (בעלים)"
                                    : profileDisplayName(coach)}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            disabled={approvalUserId === profile.id}
                            onClick={() => void handleApproveClient(profile)}
                            className="h-9 shrink-0 rounded-lg bg-amber-700 px-3 text-[11px] font-bold text-white disabled:opacity-50"
                          >
                            {approvalUserId === profile.id ? "מאשר..." : "אישור"}
                          </button>
                          <button
                            type="button"
                            disabled={approvalUserId === profile.id}
                            onClick={() => void handleRejectClient(profile)}
                            className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-[11px] font-bold text-rose-700 disabled:opacity-50"
                          >
                            דחייה
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setApprovalShowCaloriesByUser((current) => ({
                              ...current,
                              [profile.id]: !(current[profile.id] ?? true),
                            }))
                          }
                          aria-pressed={approvalShowCaloriesByUser[profile.id] ?? true}
                          className="mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-white px-2.5 py-2 text-start text-[11px] font-semibold text-ink"
                        >
                          <span>
                            הצגת קלוריות למתאמן כברירת מחדל
                            <span className="ms-1 text-muted-foreground">
                              ({(approvalShowCaloriesByUser[profile.id] ?? true) ? "מוצג" : "מוסתר"}
                              )
                            </span>
                          </span>
                          <span
                            className={`relative h-5 w-9 rounded-full ${
                              (approvalShowCaloriesByUser[profile.id] ?? true)
                                ? "bg-primary"
                                : "bg-border"
                            }`}
                            aria-hidden="true"
                          >
                            <span
                              className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow ${
                                (approvalShowCaloriesByUser[profile.id] ?? true)
                                  ? "start-5"
                                  : "start-1"
                              }`}
                            />
                          </span>
                        </button>
                        <div className="mt-2">
                          {renderOwnerLoadingToggle(profile)}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {profile.email || "ללא אימייל מוצג"}
                        </p>
                      </div>
                    ))}
                  </div>
                  {approvalNotice ? (
                    <p className="mt-2 rounded-lg bg-white p-2 text-[11px] font-semibold text-amber-950">
                      {approvalNotice}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="text-xs text-purple-900 font-semibold">משתמשים והרשאות תפקיד:</p>
              <div className="num-pill flex h-10 items-center gap-2 px-3">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={ownerUserSearch}
                  onChange={(event) => setOwnerUserSearch(event.target.value)}
                  placeholder="חיפוש לפי שם או אימייל..."
                  className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted-foreground"
                  aria-label="חיפוש משתמשים לפי שם או אימייל"
                />
              </div>
              {selectedOwnerProfileId
                ? (() => {
                    const selectedProfile = allProfiles.find(
                      (profile) => profile.id === selectedOwnerProfileId,
                    );
                    if (!selectedProfile) return null;
                    const measurements = selectedOwnerProfileDetails?.bodyMeasurements ?? [];
                    const latestMeasurement = measurements[0];
                    const assignedCoachIds = Array.from(
                      new Set([
                        ...(selectedProfile.coach_ids ?? []),
                        ...(selectedProfile.coach_id ? [selectedProfile.coach_id] : []),
                      ]),
                    );
                    const assignedCoaches = assignedCoachIds
                      .map((coachId) => allProfiles.find((profile) => profile.id === coachId))
                      .filter((profile): profile is ProfileRow => Boolean(profile));
                    return (
                      <div className="rounded-2xl border border-purple-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-600">
                              כרטיס משתמש
                            </p>
                            <h4 className="mt-1 text-base font-extrabold text-purple-950">
                              {profileDisplayName(selectedProfile)}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {selectedProfile.email || "ללא אימייל"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedOwnerProfileId(null)}
                            className="rounded-full px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-purple-50"
                          >
                            סגירה
                          </button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-xl bg-purple-50 p-2">
                            <span className="block text-muted-foreground">תפקיד</span>
                            <strong className="text-purple-950">
                              {selectedProfile.profile_exists === false
                                ? "Auth ללא פרופיל"
                                : selectedProfile.role === "owner"
                                  ? "בעלים"
                                  : selectedProfile.role === "coach"
                                    ? "מאמן"
                                    : "מתאמן"}
                            </strong>
                          </div>
                          <div className="rounded-xl bg-purple-50 p-2">
                            <span className="block text-muted-foreground">סטטוס</span>
                            <strong className="text-purple-950">
                              {selectedProfile.profile_exists === false
                                ? "נדרש תיקון פרופיל"
                                : selectedProfile.approval_status === "pending"
                                  ? "ממתין לאישור"
                                  : selectedProfile.approval_status === "rejected"
                                    ? "נדחה"
                                    : "מאושר"}
                            </strong>
                          </div>
                          <div className="rounded-xl bg-surface-2 p-2">
                            <span className="block text-muted-foreground">משקל</span>
                            <strong className="text-ink">
                              {selectedProfile.weight_kg ??
                                selectedOwnerProfileDetails?.profile?.weight ??
                                "לא הוזן"}
                              {selectedProfile.weight_kg ||
                              selectedOwnerProfileDetails?.profile?.weight
                                ? " ק״ג"
                                : ""}
                            </strong>
                          </div>
                          <div className="rounded-xl bg-surface-2 p-2">
                            <span className="block text-muted-foreground">גובה / גיל</span>
                            <strong className="text-ink">
                              {selectedProfile.height_cm ??
                                selectedOwnerProfileDetails?.profile?.height ??
                                "—"}
                              {selectedProfile.height_cm ||
                              selectedOwnerProfileDetails?.profile?.height
                                ? " ס״מ"
                                : ""}
                              {" · "}
                              {selectedProfile.age ??
                                selectedOwnerProfileDetails?.profile?.age ??
                                "—"}{" "}
                              גיל
                            </strong>
                          </div>
                        </div>
                        {selectedProfile.profile_exists !== false ? (
                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-2">
                            <div className="min-w-0 flex-1">
                              <span className="block text-[10px] font-bold text-muted-foreground">
                                שינוי תפקיד
                              </span>
                              <span className="text-[11px] text-purple-900">
                                {selectedProfile.id === authUser?.id
                                  ? "אי אפשר לשנות את התפקיד שלך"
                                  : "עדכון דרך הרשאת בעלים"}
                              </span>
                            </div>
                            <select
                              aria-label={`שינוי תפקיד עבור ${profileDisplayName(selectedProfile)}`}
                              value={selectedProfile.role ?? ""}
                              disabled={
                                selectedProfile.id === authUser?.id ||
                                roleChangeUserId === selectedProfile.id
                              }
                              onChange={(event) => {
                                const nextRole = event.target.value;
                                if (
                                  nextRole === "owner" ||
                                  nextRole === "coach" ||
                                  nextRole === "client"
                                ) {
                                  void handleOwnerChangeRole(selectedProfile.id, nextRole);
                                }
                              }}
                              className="max-w-28 rounded-lg border border-purple-200 bg-white px-2 py-2 text-[11px] font-bold text-purple-900 outline-none focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="" disabled>
                                לא ידוע
                              </option>
                              <option value="owner">בעלים</option>
                              <option value="coach">מאמן</option>
                              <option value="client">מתאמן</option>
                            </select>
                          </div>
                        ) : null}
                        {selectedProfile.profile_exists !== false ? (
                          <div className="mt-3">{renderOwnerCalorieToggle(selectedProfile)}</div>
                        ) : null}
                        {selectedProfile.profile_exists !== false ? (
                          <div className="mt-2">{renderOwnerLoadingToggle(selectedProfile)}</div>
                        ) : null}
                        {selectedProfile.profile_exists === false ? (
                          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                            <p className="font-bold">חשבון Auth קיים, אך שורת הפרופיל חסרה.</p>
                            <p className="mt-1 leading-relaxed">
                              אימייל: {selectedProfile.email_confirmed_at ? "מאומת" : "טרם אומת"} ·
                              כניסה אחרונה:{" "}
                              {selectedProfile.last_sign_in_at
                                ? new Date(selectedProfile.last_sign_in_at).toLocaleString("he-IL")
                                : "אין"}
                            </p>
                            <button
                              type="button"
                              disabled={ownerUserActionId === selectedProfile.id}
                              onClick={() => void handleRepairMissingProfile(selectedProfile)}
                              className="mt-2 rounded-xl bg-amber-700 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"
                            >
                              {ownerUserActionId === selectedProfile.id
                                ? "יוצר פרופיל..."
                                : "יצירת פרופיל client ממתין לאישור"}
                            </button>
                          </div>
                        ) : null}
                        {assignedCoaches.length > 0 ? (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            מאמנים משויכים:{" "}
                            <strong>
                              {assignedCoaches
                                .map((coach) =>
                                  coach.id === selectedProfile.id &&
                                  (selectedProfile.role === "coach" ||
                                    selectedProfile.role === "owner")
                                    ? `${profileDisplayName(coach)} (עצמי)`
                                    : profileDisplayName(coach),
                                )
                                .join(" · ")}
                            </strong>
                          </p>
                        ) : null}
                         {((selectedProfile.role === "client" &&
                           selectedProfile.approval_status === "approved") ||
                           selectedProfile.role === "coach" ||
                           (selectedProfile.id === authUser?.id && selectedProfile.role === "owner")) ? (
                          <div className="mt-3 flex gap-2">
                            <select
                                value={assignmentCoachByUser[selectedProfile.id] ?? ""}
                              onChange={(event) =>
                                setAssignmentCoachByUser((current) => ({
                                  ...current,
                                  [selectedProfile.id]: event.target.value,
                                }))
                              }
                              className="min-w-0 flex-1 rounded-xl border border-purple-200 bg-white px-2 py-2 text-xs font-semibold text-purple-950 outline-none focus:border-purple-500"
                              aria-label={`בחירת מאמן עבור ${profileDisplayName(selectedProfile)}`}
                            >
                              <option value="">בחירת מאמן...</option>
                              {allProfiles
                                .filter(
                                  (candidate) =>
                                    candidate.id !== selectedProfile.id &&
                                    candidate.role === "coach" || candidate.role === "owner",
                                )
                                .map((coach) => (
                                  <option key={coach.id} value={coach.id}>
                                    {coach.id === authUser?.id
                                      ? "אני (בעלים)"
                                      : profileDisplayName(coach)}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              disabled={assignmentUserId === selectedProfile.id}
                              onClick={() => void handleOwnerAssignClient(selectedProfile)}
                              className="shrink-0 rounded-xl bg-purple-700 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"
                            >
                              {assignmentUserId === selectedProfile.id
                                ? "שומר..."
                                : selectedProfile.role === "owner"
                                  ? "שמירת מאמן"
                                  : "שמירת שיוך"}
                            </button>
                          </div>
                        ) : null}
                        {latestMeasurement ? (
                          <div className="mt-2 rounded-xl border border-border/60 bg-surface-2 p-2 text-[11px]">
                            <p className="font-bold text-ink">
                              מדידה אחרונה · {latestMeasurement.date}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              מותניים: {latestMeasurement.waistCm ?? "—"} ס״מ · אחוז שומן:{" "}
                              {latestMeasurement.bodyFatPct ?? "—"}% · מסת שריר:{" "}
                              {latestMeasurement.muscleMassKg ?? "—"} ק״ג
                            </p>
                          </div>
                        ) : selectedProfile.role === "client" ? (
                          <p className="mt-2 rounded-xl bg-surface-2 p-2 text-[11px] text-muted-foreground">
                            עדיין לא נשמרו מדידות גוף.
                          </p>
                        ) : null}
                        {selectedOwnerProfileId === selectedProfile.id && ownerCalorieNotice ? (
                          <p className="mt-2 rounded-lg bg-purple-50 p-2 text-[11px] font-semibold text-purple-900">
                            {ownerCalorieNotice}
                          </p>
                        ) : null}
                        {selectedProfile.profile_exists !== false &&
                        selectedProfile.role !== "owner" ? (
                          <button
                            type="button"
                            disabled={ownerUserActionId === selectedProfile.id}
                            onClick={() => void handleDeleteUser(selectedProfile)}
                            className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"
                          >
                            {ownerUserActionId === selectedProfile.id
                              ? "מוחק..."
                              : "מחיקת משתמש וכל הנתונים"}
                          </button>
                        ) : null}
                      </div>
                    );
                  })()
                : null}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {filteredOwnerProfiles.map((p) => {
                  const isCurrentUser = p.id === authUser?.id;
                  const canChangeRole =
                    p.role === "owner" || p.role === "coach" || p.role === "client";
                  const isChanging = roleChangeUserId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-purple-100 bg-white p-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => void openOwnerProfile(p)}
                          className="font-bold text-ink underline-offset-2 hover:text-purple-700 hover:underline"
                        >
                          {profileDisplayName(p)}
                        </button>
                        <span className="text-muted-foreground mr-1">
                          (
                          {p.profile_exists === false
                            ? "Auth ללא פרופיל"
                            : p.role === "owner"
                              ? "בעלים"
                              : p.role === "coach"
                                ? "מאמן"
                                : p.role === "client"
                                  ? "מתאמן"
                                  : "לא ידוע"}
                          )
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {renderOwnerCalorieToggle(p, true)}
                        {renderOwnerLoadingToggle(p, true)}
                        <select
                          aria-label={`שינוי תפקיד עבור ${profileDisplayName(p)}`}
                          value={p.role || ""}
                          disabled={
                            isCurrentUser ||
                            p.profile_exists === false ||
                            !canChangeRole ||
                            isChanging
                          }
                          onChange={(event) => {
                            const nextRole = event.target.value;
                             if (
                               nextRole === "owner" ||
                               nextRole === "coach" ||
                               nextRole === "client"
                             ) {
                              void handleOwnerChangeRole(p.id, nextRole);
                            }
                          }}
                          className="max-w-28 rounded-lg border border-purple-200 bg-white px-2 py-1 text-[11px] font-bold text-purple-900 outline-none focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="" disabled>
                            לא ידוע
                          </option>
                          <option value="owner">בעלים</option>
                          <option value="coach">מאמן</option>
                          <option value="client">מתאמן</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
              {ownerCalorieNotice && !selectedOwnerProfileId ? (
                <p className="rounded-lg bg-purple-50 p-2 text-[11px] font-semibold text-purple-900">
                  {ownerCalorieNotice}
                </p>
              ) : null}
              {roleChangeNotice ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-700">
                  {roleChangeNotice}
                </p>
              ) : null}
              {authUser ? (
                <p className="text-[11px] text-purple-800">
                  ניתן לשנות תפקידים של משתמשים אחרים בלבד; שינוי התפקיד עובר דרך RPC מאובטח.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {clientsOnly ? (
          <>
            {trackingLanding ? (
              <section className="surface-card mb-1 border-primary/15 bg-primary/5 px-2 py-1 text-start">
                <p className="text-xs font-bold text-ink">
                  {genderText(
                    gender,
                    "בחרי מתאמן כדי לצפות במעקב היומי.",
                    "בחר מתאמן כדי לצפות במעקב היומי.",
                  )}
                </p>
              </section>
            ) : null}
            {/* Client Search & List */}
            <section
              className={`space-y-3 rounded-3xl border border-border/70 bg-surface p-4 shadow-sm ${
                selectedClientId && !clientPickerRoute ? "hidden" : ""
              }`}
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    שלב 1
                  </p>
                  <h3 className="mt-1 flex items-center gap-1.5 font-bold text-sm text-ink">
                    <Users className="h-4 w-4 text-primary" />{" "}
                    {isOwner ? "בחירת משתמש" : "בחירת מתאמן"}
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">תוכניות ותפריטים בלבד</span>
              </div>

              <div className="num-pill flex h-10 items-center gap-2 px-3">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <label htmlFor="coach-client-search" className="sr-only">
                  חיפוש מתאמן
                </label>
                <input
                  id="coach-client-search"
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="חיפוש לפי שם או אימייל..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  aria-label="חיפוש לפי שם או אימייל"
                />
              </div>

              {clientSearchQuery && filteredClients.length === 0 ? (
                <div className="surface-card p-6 text-center text-muted-foreground rounded-2xl text-xs space-y-2">
                  <p>לא נמצאו מתאמנים רשומים.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    {genderText(
                      gender,
                      "לחצי כאן להוספת מתאמן לפי אימייל",
                      "לחץ כאן להוספת מתאמן לפי אימייל",
                    )}
                  </button>
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredClients.map((c) => {
                    const isSelected = c.client_id === selectedClientId;
                    const nameStr = profileDisplayName(c.profiles);
                    const isSelf = c.client_id === authUser?.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (!isSelected) {
                            openClientFromOverview(c.client_id);
                          }
                        }}
                        className={`surface-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border/60 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                            {nameStr.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-ink">{nameStr}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelf ? (
                            <span className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary">
                              התוכנית שלי
                            </span>
                          ) : (
                            <Link
                              to="/coach/tracking/$clientId"
                              params={{ clientId: c.client_id }}
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                              className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                            >
                              פתח דוח
                            </Link>
                          )}
                          <ChevronLeft
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isSelected ? "-rotate-90 text-primary" : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          </>
        ) : null}

        {/* Selected Client Full Coach Workspace */}
        {selectedClientId && showClientWorkspace && (
          <Overlay
            open={showClientWorkspace}
            onClose={() => {
              if (clientId) {
                navigate({ to: trackingLanding ? "/coach/tracking" : "/coach/clients" });
                return;
              }
              setShowClientWorkspace(false);
              setSelectedClientId(null);
              setEditingProgramId(null);
              setEditingDayId(null);
            }}
            ariaLabel="בניית תוכנית ותפריט למתאמן"
            inline={clientsOnly && !editingDayId}
            variant={editingDayId || workspacePage || openEditor ? "full" : "center"}
            className={
              editingDayId
                ? "bg-background workout-builder-overlay"
                : workspacePage || openEditor
                  ? "bg-background"
                  : ""
            }
            panelClassName={editingDayId || workspacePage || openEditor ? "bg-background" : ""}
          >
            <div
              data-coach-workspace="true"
                className={`w-full ${editingDayId ? "workout-builder-workspace min-h-full flex flex-col" : ""} ${
                  clientsOnly ? "space-y-1.5" : trackingLanding ? "space-y-1" : "space-y-4"
                } bg-background ${
                workspacePage || openEditor
                  ? "min-w-0 max-w-full overflow-x-hidden pb-10"
                  : "max-w-2xl rounded-3xl shadow-2xl"
              } ${workspacePage || openEditor ? "" : "p-4 sm:p-6"}`}
            >
              {!editingDayId ? (
                <div
                    className={`flex min-w-0 items-center justify-between gap-2 overflow-x-hidden border-b border-border/60 ${
                      clientsOnly ? "px-2 pb-1.5" : trackingLanding ? "px-3 pb-2" : "px-4 pb-3 sm:px-6"
                  }`}
                >
                  <h3 className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden font-bold text-base text-ink">
                      {!clientsOnly || trackingLanding ? (
                        <Users
                          className={
                            trackingLanding ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"
                          }
                        />
                      ) : null}
                      {!clientsOnly || trackingLanding ? (
                        <span className="shrink-0">
                          {trackingLanding ? "דוח המעקב:" : "תכנית המתאמן:"}
                        </span>
                      ) : null}
                    <span className="truncate text-primary font-extrabold">
                      {isSelfSelected
                        ? `התוכנית של ${selfDisplayName}`
                        : profileDisplayName(selectedClientInfo?.profiles)}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (clientId) {
                        if (workspaceMode !== "all" && selectedClientId) {
                          navigate({
                            to: "/coach/clients/$clientId",
                            params: { clientId: selectedClientId },
                          });
                        } else
                          navigate({
                            to: trackingLanding ? "/coach/tracking" : "/coach/clients",
                          });
                        return;
                      }
                      setShowClientWorkspace(false);
                      setSelectedClientId(null);
                      setEditingProgramId(null);
                      setEditingDayId(null);
                    }}
                    aria-label="סגירת תכנית המתאמן"
                    className={`grid place-items-center border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-ink ${
                      clientsOnly ? "h-8 w-8" : trackingLanding ? "h-8 w-8" : "h-9 w-9"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              {selectedClientId && !isSelfSelected && !editingDayId ? (
                <div
                  data-client-freshness="true"
                  title={
                    lastClientRefreshAt
                      ? `רענון מוצלח אחרון: ${new Date(lastClientRefreshAt).toLocaleString("he-IL")}`
                      : "מצב החיבור לנתוני המתאמן"
                  }
                  className={`mx-4 mt-2 flex min-w-0 max-w-full items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[11px] font-bold sm:mx-6 ${clientFreshnessClass}`}
                >
                  <span
                    role="status"
                    aria-live="polite"
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <ClientFreshnessIcon
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 shrink-0 ${
                        clientRefreshInFlight || clientRealtimeStatus === "connecting"
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    <span className="min-w-0 truncate">{clientFreshnessLabel}</span>
                  </span>
                  {clientDataStale ||
                  clientRealtimeStatus === "disconnected" ||
                  clientRealtimeStatus === "reconnecting" ? (
                    <button
                      type="button"
                      onClick={retrySelectedClientRefresh}
                      disabled={clientRefreshInFlight}
                      aria-label="נסה שוב לרענן את נתוני המתאמן"
                      className="shrink-0 rounded-full border border-current/25 px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      נסה שוב
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div data-coach-workout-surface-slot="true" className="coach-workout-surface-slot" />

              {!editingDayId && (trackingLanding || workspacePage || openEditor) && clientDetails ? (
                <>
                  <nav
                    aria-label="ניווט בסביבת העריכה"
                    className={`sticky top-2 z-10 grid grid-cols-2 rounded-2xl border border-border/70 bg-background/95 shadow-sm backdrop-blur ${
                      clientsOnly || trackingLanding ? "gap-1 p-1" : "gap-2 p-1.5"
                    }`}
                    onTouchStart={(event) => {
                      const touch = event.changedTouches[0];
                      if (touch)
                        workspaceSwipeStart.current = { x: touch.clientX, y: touch.clientY };
                    }}
                    onTouchEnd={(event) => {
                      const start = workspaceSwipeStart.current;
                      const touch = event.changedTouches[0];
                      workspaceSwipeStart.current = null;
                      if (!start || !touch) return;
                      const dx = touch.clientX - start.x;
                      const dy = touch.clientY - start.y;
                      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
                      const next = dx < 0 ? "nutrition" : "programs";
                      setActiveWorkspaceTab(next);
                      setOpenEditor(trackingLanding ? null : next);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceTab("programs");
                        setOpenEditor(trackingLanding ? null : "programs");
                      }}
                      aria-selected={activeWorkspaceTab === "programs"}
                      role="tab"
                      className={`flex items-center justify-center rounded-xl font-bold transition-colors ${
                        clientsOnly || trackingLanding
                          ? "gap-1 px-2 py-1.5 text-[11px]"
                          : "gap-1.5 px-3 py-2.5 text-xs"
                      } ${
                        activeWorkspaceTab === "programs"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      }`}
                    >
                      <Dumbbell className={trackingLanding ? "h-3 w-3" : "h-3.5 w-3.5"} />
                      {trackingLanding ? "אימונים" : "תוכנית אימונים"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceTab("nutrition");
                        setOpenEditor(trackingLanding ? null : "nutrition");
                      }}
                      aria-selected={activeWorkspaceTab === "nutrition"}
                      role="tab"
                      className={`flex items-center justify-center rounded-xl font-bold transition-colors ${
                        clientsOnly || trackingLanding
                          ? "gap-1 px-2 py-1.5 text-[11px]"
                          : "gap-1.5 px-3 py-2.5 text-xs"
                      } ${
                        activeWorkspaceTab === "nutrition"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                      }`}
                    >
                      <Apple className={trackingLanding ? "h-3 w-3" : "h-3.5 w-3.5"} />
                      {trackingLanding ? "תזונה" : "תפריט תזונה"}
                    </button>
                  </nav>
                  {trackingLanding &&
                  activeWorkspaceTab === "programs" &&
                  !selectedTrackingWorkout ? (
                    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-1.5">
                      <div className="mb-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                          רשימת אימונים
                        </p>
                      </div>
                      <div className="space-y-1">
                        {clientWorkouts.map((workout) => (
                          <button
                            key={workout.id}
                            type="button"
                            onClick={() => setSelectedTrackingWorkoutId(workout.id)}
                            className="flex w-full items-center justify-between gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2 text-start text-[11px] font-bold text-ink transition-colors hover:border-primary/50 hover:bg-primary/[0.03]"
                          >
                            <span className="min-w-0 truncate">{workout.name}</span>
                            <span className="shrink-0 text-[9px] text-muted-foreground">
                              {workout.items.length} תרגילים
                            </span>
                          </button>
                        ))}
                      </div>
                      {clientWorkouts.length === 0 ? (
                        <p className="rounded-xl bg-white/80 p-3 text-center text-xs text-muted-foreground">
                          עדיין לא נבנו אימונים למתאמן הזה.
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </>
              ) : null}

              {loadingDetails ? (
                <div className="surface-card p-6 text-center text-xs text-muted-foreground animate-pulse">
                  {genderText(
                    gender,
                    "טוענת נתוני מתאמן מ-Supabase...",
                    "טוען נתוני מתאמן מ-Supabase...",
                  )}
                </div>
              ) : clientDetails ? (
                <div
                  className="workspace-tab-content space-y-4"
                  data-active-tab={activeWorkspaceTab}
                >
                  {showClientOverview && !trackingLanding ? (
                    <>
                      {!trackingLanding ? (
                        <>
                          {/* Send Coach Message Panel */}
                          <div className="surface-card p-4 rounded-2xl space-y-2.5 border border-primary/20 bg-primary/5">
                            <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4" /> שליחת הודעת חיזוק / הנחיה למתאמן
                            </h4>

                            {msgSentNotice && (
                              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                                {msgSentNotice}
                              </p>
                            )}
                            {msgSendError && (
                              <p
                                role="alert"
                                className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200"
                              >
                                {msgSendError}
                              </p>
                            )}

                            <form onSubmit={handleSendCoachMessage} className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={coachMsgText}
                                onChange={(e) => setCoachMsgText(e.target.value)}
                                placeholder="הקלידי הודעה שתופיע במסך הבית של המתאמן..."
                                className="flex-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                              />
                              <button
                                type="submit"
                                className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-primary/90"
                              >
                                שלח
                              </button>
                            </form>
                            {failedCoachMessage && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-amber-900">
                                    ניסיון אחרון — לא אושר
                                  </span>
                                  <span className="shrink-0 text-[10px] text-amber-800">
                                    {new Date(failedCoachMessage.createdAt).toLocaleString(
                                      "he-IL",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-amber-950">
                                  {failedCoachMessage.message}
                                </p>
                                <p className="mt-1 text-[10px] font-semibold text-amber-800">
                                  לא התקבלה אישור שמירה — הטיוטה נשמרה בטופס ואפשר לנסות שוב.
                                </p>
                              </div>
                            )}
                            {sentCoachMessagesError && (
                              <p
                                role="alert"
                                className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200"
                              >
                                {sentCoachMessagesError}
                              </p>
                            )}
                            {sentCoachMessages.length > 0 && (
                              <div className="space-y-2 rounded-xl border border-border/60 bg-white/70 p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-bold tracking-wide text-muted-foreground">
                                    הודעות שנשמרו בהצלחה
                                  </p>
                                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                    נשמרו ב־Supabase
                                  </span>
                                </div>
                                {sentCoachMessages.slice(0, 5).map((message) => (
                                  <div
                                    key={message.id}
                                    className="flex items-start justify-between gap-3 border-t border-border/50 pt-2 first:border-t-0 first:pt-0"
                                  >
                                    <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink">
                                      {message.message}
                                    </p>
                                    <div className="shrink-0 text-end">
                                      <span className="block text-[9px] font-bold text-emerald-700">
                                        נשמרה
                                      </span>
                                      <time
                                        dateTime={message.createdAt}
                                        className="text-[10px] text-muted-foreground"
                                      >
                                        {new Date(message.createdAt).toLocaleString("he-IL", {
                                          day: "numeric",
                                          month: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </time>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Coach-managed monthly measurements */}
                          <div
                            id="coach-checkin"
                            className="surface-card rounded-2xl p-4 space-y-3"
                            onChange={markMeasurementDraftDirty}
                          >
                            <div className="flex items-center justify-between border-b pb-2">
                              <div>
                                <h4 className="font-bold text-sm text-ink">
                                  צ׳ק־אין ומדידות חודשיות
                                </h4>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  המדידות נשמרות על ידי המאמנת או הבעלים בלבד
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingMeasurements((value) => !value)}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                <Edit2 className="h-3 w-3" />
                                {editingMeasurements ? "ביטול" : "עריכה"}
                              </button>
                            </div>
                            {editingMeasurements ? (
                              <>
                                <label className="grid gap-1 text-[11px] font-bold text-muted-foreground">
                                  תאריך מדידה
                                  <input
                                    type="date"
                                    value={measurementDraft.date}
                                    onChange={(event) =>
                                      setMeasurementDraft((current) => ({
                                        ...current,
                                        date: event.target.value,
                                      }))
                                    }
                                    className="h-10 rounded-xl border border-border bg-white px-3 text-xs text-ink"
                                  />
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  {(
                                    [
                                      ["chestCm", "חזה (ס״מ)"],
                                      ["waistCm", "מותניים (ס״מ)"],
                                      ["hipsCm", "ירכיים (ס״מ)"],
                                      ["bicepsCm", "זרוע / יד (ס״מ)"],
                                      ["thighsCm", "ירך (ס״מ)"],
                                      ["calvesCm", "שוק / תאומים (ס״מ)"],
                                      ["neckCm", "צוואר (ס״מ)"],
                                      ["bodyFatPct", "אחוז שומן (%)"],
                                      ["muscleMassKg", "מסת שריר (ק״ג)"],
                                    ] as const
                                  ).map(([field, label]) => (
                                    <label
                                      key={field}
                                      className="grid gap-1 text-[11px] font-bold text-muted-foreground"
                                    >
                                      {label}
                                      <FreeTextInput
                                        min="0"
                                        step={0.1}
                                        value={measurementDraft[field] ?? ""}
                                        onChange={(event) =>
                                          setMeasurementDraft((current) => ({
                                            ...current,
                                            [field]: event.target.value
                                              ? Number(event.target.value)
                                              : undefined,
                                          }))
                                        }
                                        className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-ink"
                                      />
                                    </label>
                                  ))}
                                </div>
                                <textarea
                                  value={measurementDraft.notes ?? ""}
                                  onChange={(event) =>
                                    setMeasurementDraft((current) => ({
                                      ...current,
                                      notes: event.target.value,
                                    }))
                                  }
                                  placeholder="הערות המאמנת לצ׳ק־אין..."
                                  className="min-h-16 w-full rounded-xl border border-border bg-white p-3 text-xs text-ink"
                                />
                                <button
                                  type="button"
                                  onClick={saveClientMeasurements}
                                  className="flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-primary text-xs font-bold text-white"
                                >
                                  <Save className="h-3.5 w-3.5" /> שמירת מדידות חודשיות
                                </button>
                              </>
                            ) : null}
                            {measurementNotice ? (
                              <p className="rounded-xl bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">
                                {measurementNotice}
                              </p>
                            ) : null}
                            {!editingMeasurements ? (
                              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                                {[
                                  ["מותניים", measurementDraft.waistCm, "ס״מ"],
                                  ["אחוז שומן", measurementDraft.bodyFatPct, "%"],
                                  ["מסת שריר", measurementDraft.muscleMassKg, "ק״ג"],
                                ].map(([label, value, unit]) => (
                                  <div key={label} className="rounded-xl bg-secondary/50 p-2">
                                    <span className="block text-muted-foreground">{label}</span>
                                    <strong className="text-ink">
                                      {value !== undefined ? `${value} ${unit}` : "לא נמדד"}
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : null}

                  {showClientOverview && !trackingLanding ? (
                    <section className="grid gap-3 lg:grid-cols-2">
                      <div className="surface-card space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3 border-b border-primary/15 pb-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                              התוכנית העדכנית
                            </p>
                            <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                              {latestProgram?.name || "עדיין לא נבנתה תוכנית"}
                            </h4>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {latestProgram
                                ? `${latestProgram.dayIds.length} ימי אימון · ${clientDetails.workouts
                                    .filter((day) => latestProgram.dayIds.includes(day.id))
                                    .reduce((total, day) => total + day.items.length, 0)} תרגילים`
                                : "אפשר להתחיל לבנות תוכנית חדשה"}
                            </p>
                          </div>
                          <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-primary">
                            <Dumbbell className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          {clientDetails.history.slice(0, 4).map((session) => {
                            const doneSets = session.entries.reduce(
                              (total, entry) => total + entry.sets.filter((set) => set.done).length,
                              0,
                            );
                            return (
                              <div
                                key={session.id}
                                className="rounded-xl bg-white/80 p-2.5 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <strong className="text-ink">
                                    {session.workoutName || "אימון"}
                                  </strong>
                                  <span className="text-muted-foreground">
                                    {new Date(session.date).toLocaleDateString("he-IL")}
                                  </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  {doneSets} סטים בוצעו · {session.entries.length} תרגילים
                                  {session.difficultyRating ? ` · ${session.difficultyRating}` : ""}
                                </p>
                                {session.discomfortNotes ? (
                                  <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 font-semibold text-rose-800">
                                    כאב / אי־נוחות: {session.discomfortNotes}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                          {clientDetails.history.length === 0 ? (
                            <p className="rounded-xl bg-white/70 p-3 text-center text-[11px] text-muted-foreground">
                              עדיין לא נרשמו אימונים בפועל.
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceTab("programs");
                            setOpenEditor("programs");
                          }}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white"
                        >
                          <Dumbbell className="h-4 w-4" /> בניית אימון
                        </button>
                      </div>

                      <div className="surface-card space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/35 p-4">
                        <div className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                              התפריט העדכני
                            </p>
                            <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                              {latestNutritionDay
                                ? `תפריט ליום ${new Date(`${latestNutritionDay.date}T00:00:00`).toLocaleDateString("he-IL")}`
                                : "עדיין לא נבנה תפריט"}
                            </h4>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {latestNutritionDay
                                ? `${latestNutritionDay.plannedMeals?.length || 0} ארוחות מתוכננות · ${latestNutritionDay.meals.reduce(
                                    (total, meal) => total + meal.foods.length,
                                    0,
                                  )} מאכלים שנרשמו`
                                : "אפשר להתחיל לבנות תפריט חדש"}
                            </p>
                          </div>
                          <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-emerald-700">
                            <Apple className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(clientDetails.nutritionDays ?? []).slice(0, 4).map((day) => {
                            const actualFoods = day.meals.flatMap((meal) => meal.foods);
                            const calories = actualFoods.reduce(
                              (total, food) => total + food.calories * food.quantity,
                              0,
                            );
                            return (
                              <div
                                key={day.id || day.date}
                                className="rounded-xl bg-white/80 p-2.5 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <strong className="text-ink">
                                    {new Date(`${day.date}T00:00:00`).toLocaleDateString("he-IL")}
                                  </strong>
                                  <span className="text-emerald-700">
                                    {Math.round(calories)} קל׳ בפועל
                                  </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  {day.plannedMeals?.length || 0} ארוחות מתוכננות ·{" "}
                                  {actualFoods.length} מאכלים בפועל
                                </p>
                              </div>
                            );
                          })}
                          {clientDetails.nutritionDays.length === 0 ? (
                            <p className="rounded-xl bg-white/70 p-3 text-center text-[11px] text-muted-foreground">
                              עדיין לא נרשם מעקב תזונה.
                            </p>
                          ) : null}
                          {clientNutritionNotes.slice(0, 2).map((note) => (
                            <p
                              key={`${note.date}-${note.meal}-${note.note}`}
                              className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900"
                            >
                              הערת מתאמן: {note.note}
                            </p>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceTab("nutrition");
                            setOpenEditor("nutrition");
                          }}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                        >
                          <Apple className="h-4 w-4" /> תפריט תזונה
                        </button>
                      </div>
                    </section>
                  ) : null}

                  {(trackingLanding || workspacePage) &&
                  ((trackingLanding && activeWorkspaceTab === "programs") ||
                    (!trackingLanding && workspaceMode === "programs" && openEditor === null)) &&
                  selectedTrackingWorkout ? (
                    <section className="surface-card space-y-3 rounded-2xl border border-amber-200 bg-amber-50/35 p-4">
                      <div className="flex items-start justify-between gap-2 border-b border-amber-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                            מה המתאמן ביצע בפועל
                          </p>
                          <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                            היסטוריית אימונים והערות
                          </h4>
                        </div>
                        {trackingLanding ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTrackingWorkoutId(null)}
                            aria-label="חזרה לרשימת האימונים"
                            title="חזרה לרשימת האימונים"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-amber-700">
                            <Activity className="h-5 w-5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2" dir="ltr">
                        <button
                          type="button"
                          onClick={() => shiftTrackingDate(1)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink"
                          aria-label="היום הבא"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <input
                          type="date"
                          value={trackingDate}
                          onChange={(event) => setTrackingDate(event.target.value)}
                          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => shiftTrackingDate(-1)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink"
                          aria-label="היום הקודם"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      {selectedTrackingWorkoutId && selectedTrackingWorkout ? (
                        <div className="space-y-2">
                          <div className="rounded-xl bg-white/80 p-3 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-ink">
                                {selectedTrackingWorkout.name || "אימון"}
                              </strong>
                              <span className="text-muted-foreground">
                                {visibleTrackingSessions.length > 0
                                  ? `${visibleTrackingSessions.length} ביצועים בתאריך`
                                  : "אין ביצוע בתאריך"}
                              </span>
                            </div>
                            {visibleTrackingSessions.length > 0 ? (
                              <p className="mt-1 text-muted-foreground">
                                {visibleTrackingSessions.reduce(
                                  (total, session) =>
                                    total +
                                    session.entries.reduce(
                                      (entryTotal, entry) =>
                                        entryTotal + entry.sets.filter((set) => set.done).length,
                                      0,
                                    ),
                                  0,
                                )}{" "}
                                סטים בוצעו בפועל
                              </p>
                            ) : null}
                          </div>

                          {trackingPlanRows.length > 0 ? (
                            <div className="space-y-2">
                              {trackingPlanRows.map(
                                ({ item, actualRecords, replacementEntry, exercise }) => (
                                  <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                      openTrackedPlan(selectedTrackingWorkout.id, item.exerciseId)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        openTrackedPlan(
                                          selectedTrackingWorkout.id,
                                          item.exerciseId,
                                        );
                                      }
                                    }}
                                    className="cursor-pointer text-start transition-colors hover:border-primary/50"
                                  >
                                    <WorkoutReviewExerciseCard
                                      item={item}
                                      exercise={exercise}
                                      replacementEntry={replacementEntry}
                                      records={actualRecords}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="rounded-xl bg-white/80 p-3 text-center text-xs text-muted-foreground">
                              באימון הזה עדיין לא הוגדרו תרגילים.
                            </p>
                          )}
                          {visibleTrackingSessions.map((session) => (
                            <div key={`${session.id}-feedback`} className="space-y-1">
                              {session.difficultyRating ? (
                                <p className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                                  דירוג האימון: {ratingLabel(session.difficultyRating)}
                                </p>
                              ) : null}
                              {session.notes?.trim() ? (
                                <p className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900">
                                  הערת אימון: {session.notes.trim()}
                                </p>
                              ) : null}
                              {session.discomfortNotes?.trim() ? (
                                <p className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
                                  כאב / אי־נוחות: {session.discomfortNotes.trim()}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {(trackingLanding || workspacePage) &&
                  ((trackingLanding && activeWorkspaceTab === "nutrition") ||
                    (!trackingLanding && workspaceMode === "nutrition" && openEditor === null)) ? (
                    <section className="surface-card space-y-3 rounded-2xl border border-amber-200 bg-amber-50/35 p-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                            מעקב תזונה בפועל
                          </p>
                          <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                            מה המתאמן אכל והערותיו
                          </h4>
                        </div>
                        <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-amber-700">
                          <Apple className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2" dir="ltr">
                        <button
                          type="button"
                          onClick={() => shiftTrackingDate(1)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink"
                          aria-label="היום הבא"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <input
                          type="date"
                          value={trackingDate}
                          onChange={(event) => setTrackingDate(event.target.value)}
                          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          aria-label="תאריך מעקב תזונה"
                        />
                        <button
                          type="button"
                          onClick={() => shiftTrackingDate(-1)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink"
                          aria-label="היום הקודם"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {trackingNutritionDay ? (
                          <div className="rounded-xl bg-white/80 p-3 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-ink">
                                {new Date(
                                  `${trackingNutritionDay.date}T00:00:00`,
                                ).toLocaleDateString("he-IL")}
                              </strong>
                              <span className="text-muted-foreground">
                                {trackingNutritionDay.meals.reduce(
                                  (total, meal) => total + meal.foods.length,
                                  0,
                                )}{" "}
                                מאכלים בפועל
                              </span>
                            </div>
                            <div className="mt-2 space-y-2">
                              {trackingNutritionDay.meals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="rounded-lg border border-amber-100 bg-amber-50/50 p-2"
                                >
                                  <div className="font-bold text-ink">{meal.name}</div>
                                  {meal.foods.length > 0 ? (
                                    <div className="mt-1 space-y-1">
                                      {meal.foods.map((food) => (
                                        <button
                                          key={food.id}
                                          type="button"
                                          onClick={() =>
                                            openTrackedNutrition(
                                              trackingNutritionDay.date,
                                              meal.id,
                                              food.id,
                                            )
                                          }
                                          className="block w-full rounded-md px-1.5 py-1 text-start text-muted-foreground hover:bg-amber-100 hover:text-primary"
                                        >
                                          {food.name} ×{food.quantity}
                                          {food.notes?.trim() ? ` · ${food.notes.trim()}` : ""}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="mt-1 text-muted-foreground">
                                      לא נרשמו מאכלים בארוחה זו.
                                    </p>
                                  )}
                                </div>
                              ))}
                              {trackingNutritionDay.meals.length === 0 ? (
                                <p className="text-center text-muted-foreground">
                                  לא נרשמו מאכלים ביום זה.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-xs text-muted-foreground">
                            אין רישומי תזונה בתאריך זה.
                          </p>
                        )}
                      </div>
                      {(trackingNutritionDay?.meals.some((meal) =>
                        meal.foods.some((food) => food.notes?.trim()),
                      ) ?? false) ? (
                        <div className="space-y-1">
                          {trackingNutritionDay?.meals
                            .flatMap((meal) =>
                              meal.foods
                                .filter((food) => food.notes?.trim())
                                .map((food) => ({ meal: meal.name, note: food.notes!.trim() })),
                            )
                            .map((note) => (
                              <p
                                key={`${note.meal}-${note.note}`}
                                className="rounded-lg bg-white/80 px-2 py-1 text-[11px] text-ink"
                              >
                                {note.meal}: {note.note}
                              </p>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          אין הערות תזונה שנרשמו על ידי המתאמן.
                        </p>
                      )}
                    </section>
                  ) : null}

                  {/* Client Programs & Full Exercise Prescription Builder */}
                  <div
                    id="coach-programs"
                    className={`scroll-mt-24 ${clientsOnly ? "space-y-1" : "space-y-4"} ${
                      workspacePage
                        ? "bg-background"
                        : clientsOnly
                          ? "surface-card rounded-2xl border-primary/15 bg-primary/[0.02] p-1.5"
                          : "surface-card rounded-[1.75rem] border-primary/15 bg-primary/[0.02] p-4"
                    } ${!showProgramBuilder || editingDayId ? "hidden" : ""}`}
                  >
                    {!clientsOnly ? (
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                            <Dumbbell className="h-4 w-4 text-primary" /> תוכנית האימונים
                          </h3>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            בחר יום כדי לפתוח את מרחב העבודה שלו
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                          {clientDetails?.programs?.length || 0} תוכניות
                        </span>
                      </div>
                    ) : null}

                    <div
                      className={`flex items-center gap-2 border border-dashed border-primary/25 bg-primary/[0.035] ${
                        clientsOnly ? "rounded-xl p-1" : "justify-between rounded-2xl p-2.5"
                      }`}
                    >
                      {!clientsOnly ? (
                        <p className="font-semibold text-[11px] text-muted-foreground">
                          צריך תוכנית חדשה?
                        </p>
                      ) : null}
                      <form
                        onSubmit={handleCreateClientProgram}
                        className={`flex gap-1.5 ${clientsOnly ? "w-full" : ""}`}
                      >
                        <input
                          type="text"
                          required
                          value={newProgramName}
                          onChange={(e) => setNewProgramName(e.target.value)}
                          placeholder="שם תוכנית חדשה"
                          className={`rounded-xl border border-border bg-background outline-none focus:border-primary ${
                            clientsOnly
                              ? "min-w-0 flex-1 px-2 py-1 text-[11px]"
                              : "w-36 px-3 py-1.5 text-xs sm:w-52"
                          }`}
                        />
                        <button
                          type="submit"
                          className={`flex shrink-0 items-center gap-1 rounded-xl bg-primary font-bold text-white shadow-xs hover:bg-primary/90 cursor-pointer ${
                            clientsOnly ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
                          }`}
                        >
                          <Plus className={clientsOnly ? "h-3 w-3" : "h-3.5 w-3.5"} />
                          <span>צור</span>
                        </button>
                      </form>
                    </div>

                    <div className={clientsOnly ? "space-y-1 pt-0.5" : "space-y-3 pt-2"}>
                      {(clientDetails?.programs ?? []).map((prog: Program) => {
                        const isProgActive = editingProgramId === prog.id;
                        const progDays = clientDetails?.workouts?.filter((w: Workout) =>
                          prog.dayIds?.includes(w.id),
                        );

                        return (
                          <div
                            key={prog.id}
                            className={`surface-card overflow-visible border p-0 transition-colors ${
                              isProgActive
                                ? "border-primary/50 bg-primary/[0.03]"
                                : "border-border/60 hover:border-primary/30"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between gap-3 ${
                                clientsOnly ? "p-2" : "p-3.5"
                              }`}
                            >
                              <div className="min-w-0 text-start">
                                {isProgActive ? (
                                  <input
                                    defaultValue={prog.name}
                                    aria-label="שם תוכנית האימון"
                                    onBlur={(event) =>
                                      void handleRenameClientProgram(prog, event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") event.currentTarget.blur();
                                    }}
                                    className={`w-full rounded-xl border border-primary/30 bg-background font-display font-semibold text-ink outline-none focus:border-primary ${
                                      clientsOnly
                                        ? "px-2 py-1 text-[13px]"
                                        : "px-3 py-1.5 text-[15px]"
                                    }`}
                                  />
                                ) : (
                                  <span
                                    className={`block truncate font-display font-semibold text-ink ${
                                      clientsOnly ? "text-[13px]" : "text-[15px]"
                                    }`}
                                  >
                                    {prog.name}
                                  </span>
                                )}
                                <span
                                  className={`mt-0.5 block text-muted-foreground ${
                                    clientsOnly ? "text-[10px]" : "text-[11px]"
                                  }`}
                                >
                                  {progDays?.length || 0} ימי אימון ·{" "}
                                  {progDays?.reduce((total, day) => total + day.items.length, 0) ||
                                    0}{" "}
                                  תרגילים
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingProgramId(isProgActive ? null : prog.id)}
                                  className={`rounded-full bg-primary/10 font-bold text-primary hover:bg-primary/20 ${
                                    clientsOnly
                                      ? "px-2 py-1 text-[10px]"
                                      : "px-3 py-1.5 text-[11px]"
                                  }`}
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>{isProgActive ? "סגירה" : "עריכה"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteClientProgram(prog)}
                                  className={`inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 font-bold text-destructive hover:bg-destructive/15 ${
                                    clientsOnly
                                      ? "px-2 py-1 text-[10px]"
                                      : "px-3 py-1.5 text-[11px]"
                                  }`}
                                  aria-label={`מחק את התוכנית ${prog.name}`}
                                  title="מחיקת התוכנית וכל ימי האימון שבה"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>מחק</span>
                                </button>
                              </div>
                            </div>

                            {(isProgActive || Boolean(progDays?.length)) && (
                              <div
                                className={`border-t border-border/50 bg-secondary/20 ${
                                  clientsOnly ? "space-y-1.5 p-2" : "space-y-3 p-3.5"
                                }`}
                              >
                                {isProgActive && !editingDayId ? (
                                  <form onSubmit={handleAddProgramDay} className="flex gap-2">
                                    <input
                                      type="text"
                                      required
                                      value={newDayName}
                                      onChange={(e) => setNewDayName(e.target.value)}
                                      placeholder="שם יום אימון (למשל: A - פלג גוף עליון)..."
                                      className="flex-1 rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                                    />
                                    <button
                                      type="submit"
                                      className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer"
                                    >
                                      + יום
                                    </button>
                                  </form>
                                ) : null}

                                <div className="space-y-2">
                                  {progDays?.map((dayItem: Workout) => {
                                    const isDayActive = editingDayId === dayItem.id;

                                    if (!editingDayId) {
                                      return (
                                        <button
                                          key={dayItem.id}
                                          type="button"
                                          onClick={() => {
                                            setEditingDayId(dayItem.id);
                                            setOpenWorkoutReportId(null);
                                            setShowExerciseForm(false);
                                            setEditingItemId(null);
                                            setSelectedExId("");
                                          }}
                                          aria-label={`בניית אימון ${dayItem.name}`}
                                          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background p-3.5 text-start shadow-sm transition-all hover:border-primary/45 hover:bg-primary/[0.03]"
                                        >
                                          <span className="min-w-0">
                                            <span className="block truncate font-bold text-[13px] text-ink">
                                              {dayItem.name}
                                            </span>
                                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                              {dayItem.items?.length || 0} תרגילים
                                            </span>
                                          </span>
                                          <span className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-[11px] font-extrabold text-primary">
                                            בניית אימון
                                          </span>
                                        </button>
                                      );
                                    }
                                    if (!isDayActive) return null;

                                    return (
                                      <WorkoutSurfacePlacement
                                        key={dayItem.id}
                                        active={clientsOnly && workspacePage}
                                      >
                                          <div
                                            className={`coach-workout-surface workout-builder-frame relative w-full ${
                                              editingDayId
                                                ? "workout-builder-surface rounded-none border-0 p-4 shadow-none ring-0 sm:p-6"
                                                : "overflow-hidden min-h-[calc(100dvh-12rem)] rounded-[1.5rem] border border-primary/25 bg-background p-4 shadow-sm ring-1 ring-primary/10 sm:p-6"
                                            }`}
                                          >
                                            <div className="coach-workout-header workout-builder-header flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 w-full flex-1">
                                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                                                בניית אימון
                                              </p>
                                              <input
                                                defaultValue={dayItem.name}
                                                aria-label="שם יום האימון"
                                                onBlur={(event) =>
                                                  void handleRenameWorkoutDay(
                                                    dayItem,
                                                    event.target.value,
                                                  )
                                                }
                                                onKeyDown={(event) => {
                                                  if (event.key === "Enter")
                                                    event.currentTarget.blur();
                                                }}
                                                className="workout-builder-name mt-1 w-full max-w-xl rounded-xl border border-primary/30 bg-background px-3 py-2 text-base font-extrabold text-ink outline-none focus:border-primary"
                                              />
                                              <p className="mt-1 text-[11px] text-muted-foreground">
                                                {dayItem.items?.length || 0} תרגילים בתוכנית
                                              </p>
                                            </div>
                                            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setShowExerciseForm((current) => !current);
                                                  setEditingItemId(null);
                                                  setSelectedExId("");
                                                  setOpenWorkoutReportId(null);
                                                }}
                                                aria-expanded={showExerciseForm}
                                                className="workout-builder-add-button inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-extrabold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                              >
                                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                                {showExerciseForm ? "סגירת הוספה" : "הוספת תרגיל"}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setShowExerciseForm(false);
                                                  setEditingItemId(null);
                                                  setSelectedExId("");
                                                  setOpenWorkoutReportId(null);
                                                  setEditingDayId(null);
                                                }}
                                                aria-label="סגירת בניית אימון"
                                                title="סגירת בניית אימון"
                                                data-testid="button-close-coach-workout"
                                                className="ui-icon-button workout-builder-close-button grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                              >
                                                <X className="h-4 w-4" aria-hidden="true" />
                                              </button>
                                            </div>
                                          </div>

                                          {dayItem.items?.length > 0 && (
                                            <div className="workout-builder-exercise-list space-y-1.5 pt-1">
                                              {dayItem.items.map((exItem: WorkoutItem) => {
                                                const exMeta = store.exercises.find(
                                                  (e) => e.id === exItem.exerciseId,
                                                );

                                                return (
                                                  <div
                                                    key={exItem.id}
                                                    id={`coach-exercise-${exItem.exerciseId}`}
                                                    className={`workout-builder-exercise-row px-1 py-3 text-xs transition-colors ${
                                                      focusedExerciseId === exItem.exerciseId
                                                        ? "border-s-2 border-primary ps-3"
                                                        : ""
                                                    }`}
                                                  >
                                                    <div className="flex items-start justify-between gap-2">
                                                      <div>
                                                        <span className="block font-display text-[15px] font-extrabold text-ink">
                                                          {exMeta ? exerciseDisplayName(exMeta) : "תרגיל"}
                                                        </span>
                                                        {exItem.supersetPartnerId ? (
                                                          <span className="mt-0.5 block text-[11px] font-bold text-violet-800">
                                                            +{" "}
                                                            {store.exercises.find(
                                                              (exercise) =>
                                                                exercise.id ===
                                                                exItem.supersetPartnerId,
                                                             )
                                                               ? exerciseDisplayName(
                                                                   store.exercises.find(
                                                                     (exercise) =>
                                                                       exercise.id ===
                                                                       exItem.supersetPartnerId,
                                                                   )!,
                                                                 )
                                                               : "תרגיל בן־זוג"}{" "}
                                                            · ללא מנוחה
                                                          </span>
                                                        ) : null}
                                                        <span className="mt-1 inline-flex rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-bold text-ink">
                                                          {exItem.equipment || exMeta?.equipment
                                                            ? `${exItem.equipment || exMeta?.equipment}${
                                                                exItem.cableGrip
                                                                  ? ` · ${exItem.cableGrip}`
                                                                  : ""
                                                              } · `
                                                            : ""}
                                                           {exItem.targetWeight || exItem.weight}{" "}
                                                           {weightValueUnit(
                                                             exItem.equipment || exMeta?.equipment,
                                                           )}
                                                          · {exItem.sets} סטים ×{" "}
                                                          {exItem.repMin || exItem.reps}
                                                          {exItem.repMax
                                                            ? `-${exItem.repMax}`
                                                            : ""}{" "}
                                                          חזרות
                                                        </span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                          {exItem.warmups?.length ? (
                                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                              חימום ×{exItem.warmups.length}
                                                            </span>
                                                          ) : null}
                                                          {exItem.dropSetConfig?.enabled ? (
                                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                              {exItem.dropSetConfig
                                                                .reductionValue &&
                                                              exItem.dropSetConfig.reductionMode
                                                                ? `דרופ סט · −${exItem.dropSetConfig.reductionValue}${
                                                                    exItem.dropSetConfig
                                                                      .reductionMode === "percent"
                                                                      ? "%"
                                                                      : " ק״ג"
                                                                  }`
                                                                : "דרופ סט"}
                                                            </span>
                                                          ) : null}
                                                          {exItem.supersetId ? (
                                                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                                                              סופר סט {exItem.supersetId} ·{" "}
                                                              {exItem.supersetRepsMin ||
                                                                exItem.repMin ||
                                                                exItem.reps}
                                                              -
                                                              {exItem.supersetRepsMax ||
                                                                exItem.repMax ||
                                                                exItem.reps}
                                                            </span>
                                                          ) : null}
                                                          {exItem.techniqueNotes ? (
                                                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                                                              יש הערה למתאמן
                                                            </span>
                                                          ) : null}
                                                        </div>
                                                      </div>
                                                      <div className="flex shrink-0 items-center gap-1">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            setEditingDayId(dayItem.id);
                                                            setShowExerciseForm(true);
                                                            setEditingItemId((current) =>
                                                              current === exItem.id
                                                                ? null
                                                                : exItem.id,
                                                            );
                                                            if (editingItemId === exItem.id) return;
                                                            selectExerciseForBuilder(
                                                              exItem.exerciseId,
                                                              exItem.equipment,
                                                              exItem.cableGrip,
                                                            );
                                                            setTargetWeight(
                                                              exItem.targetWeight || exItem.weight,
                                                            );
                                                            setRepMin(exItem.repMin || exItem.reps);
                                                            setRepMax(exItem.repMax || exItem.reps);
                                                            setRestSec(exItem.rest || 90);
                                                            setTechniqueNotes(
                                                              exItem.techniqueNotes || exItem.notes,
                                                            );
                                                            const savedWorkingSets =
                                                              exItem.workingSets ?? [];
                                                            const legacyWarmupSets =
                                                              savedWorkingSets.filter(
                                                                (set) => set.setType === "warmup",
                                                              );
                                                            const savedNormalSets =
                                                              savedWorkingSets.filter(
                                                                (set) => set.setType !== "warmup",
                                                              );
                                                            const warmupRows = exItem.warmups
                                                              ?.length
                                                              ? exItem.warmups
                                                              : legacyWarmupSets.map((set) => ({
                                                                  id: set.id,
                                                                  weight: set.weight,
                                                                  reps: set.reps,
                                                                  ...(set.repMax !== undefined
                                                                    ? { repsMax: set.repMax }
                                                                    : {}),
                                                                }));
                                                            const workingCount = Math.max(
                                                              exItem.sets || 0,
                                                              savedNormalSets.length,
                                                            );
                                                            const loadedModes: WorkoutSetMode[] = [
                                                              ...warmupRows.map(
                                                                () => "warmup" as const,
                                                              ),
                                                              ...Array.from(
                                                                { length: workingCount },
                                                                (_, index) => {
                                                                  const set =
                                                                    savedNormalSets[index];
                                                                  return (
                                                                    set?.setType ??
                                                                    (set?.dropSet
                                                                      ? "drop"
                                                                      : exItem.supersetId
                                                                        ? "superset"
                                                                        : "normal")
                                                                  );
                                                                },
                                                              ),
                                                            ];
                                                            setSetsCount(
                                                              Math.max(1, loadedModes.length),
                                                            );
                                                            setSetModes(
                                                              loadedModes.length
                                                                ? loadedModes
                                                                : ["normal"],
                                                            );
                                                            setSetWeights(
                                                              loadedModes.length
                                                                ? [
                                                                    ...warmupRows.map(
                                                                      (row) => row.weight,
                                                                    ),
                                                                    ...Array.from(
                                                                      { length: workingCount },
                                                                      (_, index) =>
                                                                        savedNormalSets[index]
                                                                          ?.weight ??
                                                                        exItem.targetWeight ??
                                                                        exItem.weight,
                                                                    ),
                                                                  ]
                                                                : [
                                                                    exItem.targetWeight ??
                                                                      exItem.weight,
                                                                  ],
                                                            );
                                                            setSetRepMins(
                                                              loadedModes.length
                                                                ? [
                                                                    ...warmupRows.map(
                                                                      (row) => row.reps,
                                                                    ),
                                                                    ...Array.from(
                                                                      { length: workingCount },
                                                                      (_, index) =>
                                                                        savedNormalSets[index]
                                                                          ?.reps ??
                                                                        exItem.repMin ??
                                                                        exItem.reps,
                                                                    ),
                                                                  ]
                                                                : [exItem.repMin ?? exItem.reps],
                                                            );
                                                            setSetRepMaxes(
                                                              loadedModes.length
                                                                ? [
                                                                    ...warmupRows.map(
                                                                      (row) =>
                                                                        row.repsMax ?? row.reps,
                                                                    ),
                                                                    ...Array.from(
                                                                      { length: workingCount },
                                                                      (_, index) =>
                                                                        savedNormalSets[index]
                                                                          ?.repMax ??
                                                                        exItem.repMax ??
                                                                        exItem.reps,
                                                                    ),
                                                                  ]
                                                                : [exItem.repMax ?? exItem.reps],
                                                            );
                                                            setSetRests(
                                                              loadedModes.length
                                                                ? [
                                                                    ...warmupRows.map(
                                                                      () => exItem.rest ?? 90,
                                                                    ),
                                                                    ...Array.from(
                                                                      { length: workingCount },
                                                                      (_, index) =>
                                                                        savedNormalSets[index]
                                                                          ?.rest ??
                                                                        exItem.rest ??
                                                                        90,
                                                                    ),
                                                                  ]
                                                                : [exItem.rest ?? 90],
                                                            );
                                                            setSetNotes(
                                                              loadedModes.length
                                                                ? [
                                                                    ...warmupRows.map(() => ""),
                                                                    ...Array.from(
                                                                      { length: workingCount },
                                                                      (_, index) =>
                                                                        savedNormalSets[index]
                                                                          ?.notes ?? "",
                                                                    ),
                                                                  ]
                                                                : [""],
                                                            );
                                                            setWarmupEnabled(warmupRows.length > 0);
                                                            setWarmupSetsCount(
                                                              warmupRows.length || 1,
                                                            );
                                                            setWarmupWeight(
                                                              warmupRows[0]?.weight || 10,
                                                            );
                                                            setWarmupReps(
                                                              warmupRows[0]?.reps || 10,
                                                            );
                                                            setWarmupRepsMax(
                                                              warmupRows[0]?.repsMax || 12,
                                                            );
                                                            setDropSetEnabled(
                                                              Boolean(
                                                                exItem.dropSetConfig?.enabled,
                                                              ),
                                                            );
                                                            setDropLevel1Weight(
                                                              exItem.dropSetConfig?.levels?.[0]
                                                                ?.weight
                                                                ? String(
                                                                    exItem.dropSetConfig.levels[0]
                                                                      .weight,
                                                                  )
                                                                : "",
                                                            );
                                                            setDropLevel2Weight(
                                                              exItem.dropSetConfig?.levels?.[1]
                                                                ?.weight
                                                                ? String(
                                                                    exItem.dropSetConfig.levels[1]
                                                                      .weight,
                                                                  )
                                                                : "",
                                                            );
                                                            setDropLevel1RepsMin(
                                                              exItem.dropSetConfig?.levels?.[0]
                                                                ?.repsMin || 8,
                                                            );
                                                            setDropLevel1RepsMax(
                                                              exItem.dropSetConfig?.levels?.[0]
                                                                ?.repsMax || 10,
                                                            );
                                                            setDropLevel2RepsMin(
                                                              exItem.dropSetConfig?.levels?.[1]
                                                                ?.repsMin || 6,
                                                            );
                                                            setDropLevel2RepsMax(
                                                              exItem.dropSetConfig?.levels?.[1]
                                                                ?.repsMax || 8,
                                                            );
                                                            setSupersetGroup(
                                                              exItem.supersetId || "",
                                                            );
                                                            setSupersetPartnerId(
                                                              exItem.supersetPartnerId || "",
                                                            );
                                                            setSupersetPartnerQuery("");
                                                            setSupersetPartnerWeight(
                                                              exItem.supersetTargetWeight ||
                                                                exItem.targetWeight ||
                                                                exItem.weight ||
                                                                20,
                                                            );
                                                            setSupersetRepsMin(
                                                              exItem.supersetRepsMin ||
                                                                exItem.repMin ||
                                                                8,
                                                            );
                                                            setSupersetRepsMax(
                                                              exItem.supersetRepsMax ||
                                                                exItem.repMax ||
                                                                10,
                                                            );
                                                          }}
                                                          className="rounded-lg bg-background px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/10"
                                                        >
                                                          {editingItemId === exItem.id
                                                            ? "סגירה"
                                                            : "עריכה"}
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleRemoveExerciseFromDay(
                                                              dayItem.id,
                                                              exItem.id,
                                                            )
                                                          }
                                                          className="rounded-lg p-1 text-muted-foreground hover:text-red-600 cursor-pointer"
                                                          aria-label={`הסר את ${exMeta?.name || "התרגיל"}`}
                                                        >
                                                          <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                    <div
                                                      data-exercise-builder-anchor={exItem.id}
                                                      className="contents"
                                                    />
                                                    {advancedExerciseControlsEnabled &&
                                                    editingItemId === exItem.id ? (
                                                      <>
                                                        <div className="mt-4 space-y-5 border-t border-border/50 pt-4">
                                                          <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                                                            <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                              {weightInputLabel(
                                                                exItem.equipment || exMeta?.equipment,
                                                                false,
                                                              )}
                                                              <FreeTextInput
                                                                defaultValue={
                                                                  exItem.targetWeight ||
                                                                  exItem.weight
                                                                }
                                                                min={0}
                                                                step={0.5}
                                                                onBlur={(event) => {
                                                                  const value = Number(
                                                                    event.target.value,
                                                                  );
                                                                  if (Number.isFinite(value)) {
                                                                    void handleUpdateExerciseItem(
                                                                      dayItem.id,
                                                                      exItem.id,
                                                                      {
                                                                        targetWeight: value,
                                                                        weight: value,
                                                                      },
                                                                    );
                                                                  }
                                                                }}
                                                                className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                              />
                                                            </label>
                                                            <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                              חזרות
                                                              <FreeTextInput
                                                                defaultValue={
                                                                  exItem.repMin || exItem.reps
                                                                }
                                                                min={1}
                                                                onBlur={(event) => {
                                                                  const value = Math.max(
                                                                    1,
                                                                    Number(event.target.value),
                                                                  );
                                                                  if (Number.isFinite(value)) {
                                                                    void handleUpdateExerciseItem(
                                                                      dayItem.id,
                                                                      exItem.id,
                                                                      {
                                                                        reps: value,
                                                                        repMin: value,
                                                                        repMax: Math.max(
                                                                          value,
                                                                          exItem.repMax || value,
                                                                        ),
                                                                      },
                                                                    );
                                                                  }
                                                                }}
                                                                className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                              />
                                                              <FreeTextInput
                                                                defaultValue={
                                                                  exItem.repMax ||
                                                                  exItem.repMin ||
                                                                  exItem.reps
                                                                }
                                                                min={exItem.repMin || exItem.reps}
                                                                onBlur={(event) => {
                                                                  const value = Math.max(
                                                                    exItem.repMin || exItem.reps,
                                                                    Number(event.target.value),
                                                                  );
                                                                  if (Number.isFinite(value)) {
                                                                    void handleUpdateExerciseItem(
                                                                      dayItem.id,
                                                                      exItem.id,
                                                                      {
                                                                        repMax: value,
                                                                      },
                                                                    );
                                                                  }
                                                                }}
                                                                className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                              />
                                                            </label>
                                                            <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                              מנוחה (שניות)
                                                              <FreeTextInput
                                                                defaultValue={exItem.rest || 90}
                                                                min={0}
                                                                step={5}
                                                                onBlur={(event) => {
                                                                  const value = Math.max(
                                                                    0,
                                                                    Number(event.target.value),
                                                                  );
                                                                  if (Number.isFinite(value)) {
                                                                    void handleUpdateExerciseItem(
                                                                      dayItem.id,
                                                                      exItem.id,
                                                                      {
                                                                        rest: value,
                                                                      },
                                                                    );
                                                                  }
                                                                }}
                                                                className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                              />
                                                            </label>
                                                          </div>
                                                          <div className="space-y-2">
                                                            <p className="text-right text-xs font-extrabold text-ink">
                                                              תרגיל וסוג סט
                                                            </p>
                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                setShowExercisePicker(true)
                                                              }
                                                              className="flex h-10 w-full items-center justify-between rounded-xl border border-border/60 bg-background px-3 text-right text-xs font-semibold text-ink"
                                                            >
                                                              <span>
                                                                {store.exercises.find(
                                                                  (exercise) =>
                                                                    exercise.id === selectedExId,
                                                                )?.name ||
                                                                  exMeta?.name ||
                                                                  "חיפוש ובחירת תרגיל"}
                                                              </span>
                                                              <Search className="h-4 w-4 text-muted-foreground" />
                                                            </button>
                                                            <div className="flex items-end justify-between gap-3 border-b border-border/50 pb-3">
                                                              <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                                סטים
                                                                <FreeTextInput
                                                                  min={1}
                                                                  value={setsCount}
                                                                  onChange={(event) =>
                                                                    resizeSetFields(
                                                                      Math.max(
                                                                        1,
                                                                        Number(event.target.value),
                                                                      ),
                                                                    )
                                                                  }
                                                                  className="mt-1 h-9 w-16 rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                                />
                                                              </label>
                                                              <div className="flex items-center justify-between gap-3">
                                                                <p className="text-right text-[10px] font-bold text-muted-foreground">
                                                                  סוג הסט
                                                                </p>
                                                                <select
                                                                  value={
                                                                    setModes.find(
                                                                      (mode) => mode !== "normal",
                                                                    ) ?? "normal"
                                                                  }
                                                                  onChange={(event) => {
                                                                    const mode = event.target
                                                                      .value as
                                                                      | "normal"
                                                                      | "warmup"
                                                                      | "drop"
                                                                      | "superset";
                                                                    setSetModes(
                                                                      Array.from(
                                                                        {
                                                                          length: Math.max(
                                                                            1,
                                                                            setsCount,
                                                                          ),
                                                                        },
                                                                        () => mode,
                                                                      ),
                                                                    );
                                                                    setWarmupEnabled(
                                                                      mode === "warmup",
                                                                    );
                                                                    setDropSetEnabled(
                                                                      mode === "drop",
                                                                    );
                                                                    setSupersetGroup(
                                                                      mode === "superset"
                                                                        ? "A"
                                                                        : "",
                                                                    );
                                                                  }}
                                                                  className="h-9 min-w-36 rounded-xl border border-border/60 bg-background px-2 text-[11px] font-bold text-ink"
                                                                >
                                                                  <option value="normal">
                                                                    סט רגיל
                                                                  </option>
                                                                  <option value="warmup">
                                                                    סט חימום
                                                                  </option>
                                                                  <option value="drop">
                                                                    דרופ סט
                                                                  </option>
                                                                  <option value="superset">
                                                                    סופר סט
                                                                  </option>
                                                                </select>
                                                              </div>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-1.5 border-b border-amber-200 pb-3">
                                                              <label className="text-center text-[9px] font-bold text-amber-900">
                                                                סטי חימום
                                                                <FreeTextInput
                                                                  min={1}
                                                                  value={warmupSetsCount}
                                                                  onChange={(event) =>
                                                                    setWarmupSetsCount(
                                                                      Math.max(
                                                                        1,
                                                                        Number(event.target.value),
                                                                      ),
                                                                    )
                                                                  }
                                                                  className="mt-1 h-8 w-full rounded-lg border border-amber-200 bg-background text-center text-xs"
                                                                />
                                                              </label>
                                                              <label className="text-center text-[9px] font-bold text-amber-900">
                                                                {weightInputLabel(selectedEquipment, false)}
                                                                <FreeTextInput
                                                                  step={0.5}
                                                                  min={0}
                                                                  value={warmupWeight}
                                                                  onChange={(event) =>
                                                                    setWarmupWeight(
                                                                      Number(event.target.value),
                                                                    )
                                                                  }
                                                                  className="mt-1 h-8 w-full rounded-lg border border-amber-200 bg-background text-center text-xs"
                                                                />
                                                              </label>
                                                              <label className="text-center text-[9px] font-bold text-amber-900">
                                                                חזרות מינ׳
                                                                <FreeTextInput
                                                                  min={1}
                                                                  value={warmupReps}
                                                                  onChange={(event) =>
                                                                    setWarmupReps(
                                                                      Number(event.target.value),
                                                                    )
                                                                  }
                                                                  className="mt-1 h-8 w-full rounded-lg border border-amber-200 bg-background text-center text-xs"
                                                                />
                                                              </label>
                                                              <label className="text-center text-[9px] font-bold text-amber-900">
                                                                חזרות מקס׳
                                                                <FreeTextInput
                                                                  min={warmupReps}
                                                                  value={warmupRepsMax}
                                                                  onChange={(event) =>
                                                                    setWarmupRepsMax(
                                                                      Math.max(
                                                                        warmupReps,
                                                                        Number(event.target.value),
                                                                      ),
                                                                    )
                                                                  }
                                                                  className="mt-1 h-8 w-full rounded-lg border border-amber-200 bg-background text-center text-xs"
                                                                />
                                                              </label>
                                                            </div>
                                                            {setModes.find(
                                                              (mode) => mode !== "normal",
                                                            ) === "drop" ? (
                                                              <div className="space-y-2 border-b border-primary/20 pb-3">
                                                                <p className="text-right text-xs font-extrabold text-primary">
                                                                  דרופ סט
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-1.5">
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    {weightInputLabel(
                                                                      selectedEquipment,
                                                                      false,
                                                                    )}{" "}
                                                                    דרופ 1
                                                                    <FreeTextInput
                                                                      step={0.5}
                                                                      min={0}
                                                                      value={dropLevel1Weight}
                                                                      onChange={(event) =>
                                                                        setDropLevel1Weight(
                                                                          event.target.value,
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    חזרות דרופ 1 מינ׳
                                                                    <FreeTextInput
                                                                      min={1}
                                                                      value={dropLevel1RepsMin}
                                                                      onChange={(event) =>
                                                                        setDropLevel1RepsMin(
                                                                          Math.max(
                                                                            1,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    חזרות דרופ 1 מקס׳
                                                                    <FreeTextInput
                                                                      min={dropLevel1RepsMin}
                                                                      value={dropLevel1RepsMax}
                                                                      onChange={(event) =>
                                                                        setDropLevel1RepsMax(
                                                                          Math.max(
                                                                            dropLevel1RepsMin,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    {weightInputLabel(
                                                                      selectedEquipment,
                                                                      false,
                                                                    )}{" "}
                                                                    דרופ 2
                                                                    <FreeTextInput
                                                                      step={0.5}
                                                                      min={0}
                                                                      value={dropLevel2Weight}
                                                                      onChange={(event) =>
                                                                        setDropLevel2Weight(
                                                                          event.target.value,
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    חזרות דרופ 2 מינ׳
                                                                    <FreeTextInput
                                                                      min={1}
                                                                      value={dropLevel2RepsMin}
                                                                      onChange={(event) =>
                                                                        setDropLevel2RepsMin(
                                                                          Math.max(
                                                                            1,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-primary">
                                                                    חזרות דרופ 2 מקס׳
                                                                    <FreeTextInput
                                                                      min={dropLevel2RepsMin}
                                                                      value={dropLevel2RepsMax}
                                                                      onChange={(event) =>
                                                                        setDropLevel2RepsMax(
                                                                          Math.max(
                                                                            dropLevel2RepsMin,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-primary/20 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                </div>
                                                              </div>
                                                            ) : null}
                                                            {setModes.find(
                                                              (mode) => mode !== "normal",
                                                            ) === "superset" ? (
                                                              <div className="block border-b border-violet-200 pb-3 text-right text-[9px] font-bold text-violet-900">
                                                                <span className="mb-2 block text-xs font-extrabold">
                                                                  סופר סט
                                                                </span>
                                                                {renderSupersetPartnerSearch()}
                                                                <div className="mt-2 grid grid-cols-3 gap-1.5">
                                                                  <label className="text-center text-[9px] font-bold text-violet-900">
                                                                     {weightInputLabel(
                                                                       store.exercises.find(
                                                                         (exercise) =>
                                                                           exercise.id ===
                                                                           supersetPartnerId,
                                                                       )?.equipment,
                                                                       false,
                                                                     )}{" "}
                                                                     תרגיל 2
                                                                    <FreeTextInput
                                                                      min={0}
                                                                      step={0.5}
                                                                      value={supersetPartnerWeight}
                                                                      onChange={(event) =>
                                                                        setSupersetPartnerWeight(
                                                                          Math.max(
                                                                            0,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-violet-200 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-violet-900">
                                                                    חזרות מינ׳
                                                                    <FreeTextInput
                                                                      min={1}
                                                                      value={supersetRepsMin}
                                                                      onChange={(event) =>
                                                                        setSupersetRepsMin(
                                                                          Math.max(
                                                                            1,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-violet-200 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                  <label className="text-center text-[9px] font-bold text-violet-900">
                                                                    חזרות מקס׳
                                                                    <FreeTextInput
                                                                      min={supersetRepsMin}
                                                                      value={supersetRepsMax}
                                                                      onChange={(event) =>
                                                                        setSupersetRepsMax(
                                                                          Math.max(
                                                                            supersetRepsMin,
                                                                            Number(
                                                                              event.target.value,
                                                                            ),
                                                                          ),
                                                                        )
                                                                      }
                                                                      className="mt-1 h-8 w-full rounded-lg border border-violet-200 bg-background text-center text-xs"
                                                                    />
                                                                  </label>
                                                                </div>
                                                              </div>
                                                            ) : null}
                                                            <label className="block text-right text-[10px] font-bold text-muted-foreground">
                                                              הערה למתאמן על התרגיל
                                                              <textarea
                                                                rows={2}
                                                                value={techNotes}
                                                                onChange={(event) =>
                                                                  setTechniqueNotes(
                                                                    event.target.value,
                                                                  )
                                                                }
                                                                placeholder="למשל: לשמור על גב ישר ולבצע לאט..."
                                                                className="mt-1 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-right text-xs font-normal text-ink outline-none focus:border-primary"
                                                              />
                                                            </label>
                                                            <button
                                                              type="button"
                                                              onClick={() => {
                                                                void handleUpdateExerciseItem(
                                                                  dayItem.id,
                                                                  exItem.id,
                                                                  {
                                                                    targetWeight,
                                                                    weight: targetWeight,
                                                                    sets: Math.max(1, setsCount),
                                                                    reps: Math.max(1, repMin),
                                                                    repMin: Math.max(1, repMin),
                                                                    repMax: Math.max(
                                                                      repMin,
                                                                      repMax,
                                                                    ),
                                                                    rest: Math.max(0, restSec),
                                                                    notes: techNotes.trim(),
                                                                    warmups: warmupEnabled
                                                                      ? Array.from(
                                                                          {
                                                                            length: Math.max(
                                                                              1,
                                                                              warmupSetsCount,
                                                                            ),
                                                                          },
                                                                          (_, index) => ({
                                                                            id:
                                                                              exItem.warmups?.[
                                                                                index
                                                                              ]?.id || uid(),
                                                                            weight: warmupWeight,
                                                                            reps: warmupReps,
                                                                            repsMax: warmupRepsMax,
                                                                          }),
                                                                        )
                                                                      : [],
                                                                    dropSetConfig: dropSetEnabled
                                                                      ? {
                                                                          enabled: true,
                                                                          drops: 2,
                                                                          levels: [
                                                                            {
                                                                              weight:
                                                                                Number(
                                                                                  dropLevel1Weight,
                                                                                ) || targetWeight,
                                                                              repsMin:
                                                                                dropLevel1RepsMin,
                                                                              repsMax:
                                                                                dropLevel1RepsMax,
                                                                            },
                                                                            {
                                                                              weight:
                                                                                Number(
                                                                                  dropLevel2Weight,
                                                                                ) || targetWeight,
                                                                              repsMin:
                                                                                dropLevel2RepsMin,
                                                                              repsMax:
                                                                                dropLevel2RepsMax,
                                                                            },
                                                                          ],
                                                                        }
                                                                      : {
                                                                          enabled: false,
                                                                          drops: 0,
                                                                          levels: [],
                                                                        },
                                                                    supersetId: supersetGroup || "",
                                                                    supersetPartnerId: supersetGroup
                                                                      ? supersetPartnerId
                                                                      : "",
                                                                    supersetRepsMin: supersetGroup
                                                                      ? Math.max(1, supersetRepsMin)
                                                                      : 0,
                                                                    supersetRepsMax: supersetGroup
                                                                      ? Math.max(
                                                                          supersetRepsMin,
                                                                          supersetRepsMax,
                                                                        )
                                                                      : 0,
                                                                  },
                                                                );
                                                                setEditingItemId(null);
                                                              }}
                                                              className="h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm"
                                                            >
                                                              שמור תרגיל ליום אימון
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </>
                                                    ) : null}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}

                                          {isDayActive && showExerciseForm && (
                                            <ExerciseBuilderPlacement exerciseId={editingItemId}>
                                              <form
                                                onSubmit={handleAddExerciseToDay}
                                                onKeyDown={(event) => {
                                                  // Number inputs submit a form when the mobile
                                                  // keyboard's action key is pressed. Saving here
                                                  // unmounts the builder and makes it look as if
                                                  // the tab closed while entering a set.
                                                  if (
                                                    event.key === "Enter" &&
                                                    !(event.target instanceof HTMLTextAreaElement)
                                                  ) {
                                                    event.preventDefault();
                                                  }
                                                }}
                                                className="pt-2 border-t border-border/40 space-y-2 text-xs"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <p className="text-[11px] font-bold text-primary">
                                                    {editingItemId
                                                      ? "עריכת תרגיל באימון"
                                                      : "הוספת תרגיל לאימון"}
                                                  </p>
                                                  {editingItemId ? (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        setEditingItemId(null);
                                                        setSelectedExId("");
                                                      }}
                                                      className="text-[10px] font-bold text-muted-foreground hover:text-ink"
                                                    >
                                                      ביטול עריכה
                                                    </button>
                                                  ) : null}
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                                    {genderText(
                                                      gender,
                                                      "בחרי תרגיל מספרייה",
                                                      "בחר תרגיל מספרייה",
                                                    )}
                                                  </label>
                                                  <button
                                                    type="button"
                                                    onClick={() => setShowExercisePicker(true)}
                                                    className="w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-start"
                                                  >
                                                    <span
                                                      className={
                                                        selectedExId
                                                          ? "text-ink"
                                                          : "text-muted-foreground"
                                                      }
                                                    >
                                                 {selectedExId
                                                         ? (() => {
                                                             const exercise = canonicalExerciseOptions.find(
                                                               (e) => e.id === selectedExId,
                                                             );
                                                             return exercise
                                                               ? exerciseDisplayName(exercise)
                                                               : "תרגיל נבחר";
                                                           })()
                                                        : "חיפוש ובחירת תרגיל..."}
                                                    </span>
                                                    <Search className="h-4 w-4 text-muted-foreground" />
                                                  </button>
                                                </div>
                                                 {selectedBuilderExercise ? (
                                                   <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                                                      <SearchPickerField
                                                        label="חיפוש מכשיר / ציוד לתרגיל"
                                                        value={selectedEquipment}
                                                        options={selectedBuilderEquipmentOptions}
                                                        placeholder="חיפוש מכשיר..."
                                                        onChange={(equipment) => {
                                                          setSelectedEquipment(equipment);
                                                          setSelectedCableGrip("");
                                                        }}
                                                      />
                                                     {selectedEquipment === "פולי / כבלים" ? (
                                                        <div className="mt-2">
                                                          <SearchPickerField
                                                            label="חיפוש מאחז לכבלים"
                                                            value={selectedCableGrip}
                                                            options={selectedBuilderGripOptions}
                                                            placeholder="חיפוש מאחז..."
                                                            onChange={setSelectedCableGrip}
                                                          />
                                                        </div>
                                                     ) : null}
                                                   </div>
                                                 ) : null}
                                                {exerciseBuilderNotice ? (
                                                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] font-semibold text-ink">
                                                    {exerciseBuilderNotice}
                                                  </p>
                                                ) : null}

                                                <div className="flex items-center justify-between gap-2">
                                                  <p className="text-[10px] font-bold text-muted-foreground">
                                                    הגדרת סטים
                                                  </p>
                                                  <label className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                    מספר סטים
                                                                    <FreeTextInput
                                                      min={1}
                                                      max={20}
                                                      value={setsCount}
                                                      onChange={(event) =>
                                                        resizeSetFields(Number(event.target.value))
                                                      }
                                                      className="h-8 w-16 rounded-lg border border-border bg-white text-center text-xs text-ink"
                                                    />
                                                  </label>
                                                </div>
                                                <div className="space-y-2">
                                                  {Array.from(
                                                    { length: Math.max(1, setsCount) },
                                                    (_, index) => {
                                                      const mode = setModes[index] ?? "normal";
                                                      const weight =
                                                        setWeights[index] ?? targetWeight;
                                                      const minReps = setRepMins[index] ?? repMin;
                                                      const maxReps = setRepMaxes[index] ?? repMax;
                                                      return (
                                                        <div
                                                          key={index}
                                                          className={`rounded-2xl border p-3 shadow-sm ${
                                                            mode === "warmup"
                                                              ? "border-amber-200 bg-amber-50/70"
                                                              : mode === "drop"
                                                                ? "border-primary/30 bg-primary/5"
                                                                : mode === "superset"
                                                                  ? "border-violet-200 bg-violet-50/60"
                                                                  : "border-border/70 bg-white"
                                                          }`}
                                                        >
                                                          <div className="mb-2 flex items-center justify-between gap-2">
                                                            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-extrabold text-ink">
                                                              סט {index + 1}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                              {index > 0 ? (
                                                                <button
                                                                  type="button"
                                                                  onClick={() => {
                                                                    setSetWeights((values) => {
                                                                      const next = [...values];
                                                                      next[index] =
                                                                        values[index - 1] ??
                                                                        targetWeight;
                                                                      return next;
                                                                    });
                                                                    setSetRepMins((values) => {
                                                                      const next = [...values];
                                                                      next[index] =
                                                                        values[index - 1] ?? repMin;
                                                                      return next;
                                                                    });
                                                                    setSetRepMaxes((values) => {
                                                                      const next = [...values];
                                                                      next[index] =
                                                                        values[index - 1] ?? repMax;
                                                                      return next;
                                                                    });
                                                                    setSetRests((values) => {
                                                                      const next = [...values];
                                                                      next[index] =
                                                                        values[index - 1] ??
                                                                        restSec;
                                                                      return next;
                                                                    });
                                                                    setSetNotes((values) => {
                                                                      const next = [...values];
                                                                      next[index] =
                                                                        values[index - 1] ?? "";
                                                                      return next;
                                                                    });
                                                                  }}
                                                                  className="rounded-lg bg-secondary px-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary"
                                                                >
                                                                  העתק מהקודם
                                                                </button>
                                                              ) : null}
                                                              <select
                                                                aria-label={`סוג סט ${index + 1}`}
                                                                value={mode}
                                                                onChange={(event) => {
                                                                  const nextMode = event.target
                                                                    .value as
                                                                    | "normal"
                                                                    | "warmup"
                                                                    | "drop"
                                                                    | "superset";
                                                                  setSetModes((current) => {
                                                                    const count = Math.max(
                                                                      1,
                                                                      setsCount,
                                                                    );
                                                                    const next = Array.from(
                                                                      { length: count },
                                                                      (_, itemIndex) =>
                                                                        current[itemIndex] ??
                                                                        "normal",
                                                                    );
                                                                    next[index] = nextMode;
                                                                    const order =
                                                                      warmupFirstIndexes(next);
                                                                    const ordered = order.map(
                                                                      (itemIndex) =>
                                                                        next[itemIndex]!,
                                                                    );
                                                                    setSetWeights((values) =>
                                                                      reorderSetValues(
                                                                        values,
                                                                        order,
                                                                        targetWeight,
                                                                      ),
                                                                    );
                                                                    setSetRepMins((values) =>
                                                                      reorderSetValues(
                                                                        values,
                                                                        order,
                                                                        repMin,
                                                                      ),
                                                                    );
                                                                    setSetRepMaxes((values) =>
                                                                      reorderSetValues(
                                                                        values,
                                                                        order,
                                                                        repMax,
                                                                      ),
                                                                    );
                                                                    setSetRests((values) =>
                                                                      reorderSetValues(
                                                                        values,
                                                                        order,
                                                                        restSec,
                                                                      ),
                                                                    );
                                                                    setSetNotes((values) =>
                                                                      reorderSetValues(
                                                                        values,
                                                                        order,
                                                                        "",
                                                                      ),
                                                                    );
                                                                    setWarmupEnabled(
                                                                      ordered.includes("warmup"),
                                                                    );
                                                                    setDropSetEnabled(
                                                                      ordered.includes("drop"),
                                                                    );
                                                                    if (
                                                                      nextMode === "superset" &&
                                                                      !supersetGroup
                                                                    ) {
                                                                      setSupersetGroup("A");
                                                                    }
                                                                    return ordered;
                                                                  });
                                                                }}
                                                                className="h-9 min-w-36 rounded-xl border border-border bg-white px-2 text-[11px] font-bold text-ink"
                                                              >
                                                                <option value="normal">
                                                                  סט רגיל
                                                                </option>
                                                                <option value="warmup">
                                                                  סט חימום
                                                                </option>
                                                                <option value="drop">
                                                                  דרופ סט
                                                                </option>
                                                                <option value="superset">
                                                                  סופר־סט
                                                                </option>
                                                              </select>
                                                            </div>
                                                          </div>
                                                          {mode === "normal" ||
                                                          mode === "warmup" ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                              <label className="col-span-2 grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                                {weightInputLabel(selectedEquipment)}
                                                                <FreeTextInput
                                                                  min={0}
                                                                  step={0.5}
                                                                  value={weight}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      0,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetWeights((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                    if (index === 0)
                                                                      setTargetWeight(value);
                                                                  }}
                                                                  className="h-10 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold text-ink"
                                                                />
                                                              </label>
                                                              <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                                חזרות מינ׳
                                                                <FreeTextInput
                                                                  min={1}
                                                                  value={minReps}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      1,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRepMins((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                    if (index === 0)
                                                                      setRepMin(value);
                                                                  }}
                                                                  className="h-10 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold text-ink"
                                                                />
                                                              </label>
                                                              <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                                חזרות מקס׳
                                                                <FreeTextInput
                                                                  min={minReps}
                                                                  value={maxReps}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      minReps,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRepMaxes((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                    if (index === 0)
                                                                      setRepMax(value);
                                                                  }}
                                                                  className="h-10 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold text-ink"
                                                                />
                                                              </label>
                                                              <label className="col-span-2 grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                                הערה לסט
                                                                <textarea
                                                                  rows={1}
                                                                  value={setNotes[index] ?? ""}
                                                                  onChange={(event) => {
                                                                    setSetNotes((current) => {
                                                                      const next = [...current];
                                                                      next[index] =
                                                                        event.target.value;
                                                                      return next;
                                                                    });
                                                                  }}
                                                                  placeholder="למשל: עד כשל"
                                                                  className="min-h-10 rounded-xl border border-border bg-background px-2 py-2 text-right text-sm font-normal text-ink"
                                                                />
                                                              </label>
                                                              <label className="col-span-2 grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                                זמן מנוחה (שניות)
                                                                 <FreeTextInput
                                                                  min={0}
                                                                  step={5}
                                                                  value={setRests[index] ?? restSec}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      0,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRests((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                    if (index === 0)
                                                                      setRestSec(value);
                                                                  }}
                                                                  className="h-10 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold text-ink"
                                                                />
                                                              </label>
                                                            </div>
                                                          ) : null}
                                                          {mode === "superset" ? (
                                                            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-2.5">
                                                              <p className="mb-2 text-[10px] font-extrabold text-violet-900">
                                                                {store.exercises.find(
                                                                  (exercise) =>
                                                                    exercise.id === selectedExId,
                                                                )?.name || "תרגיל ראשון"}
                                                              </p>
                                                              <div className="mb-3 grid grid-cols-3 gap-1.5">
                                                                 <FreeTextInput
                                                                  aria-label={`תרגיל ראשון ${weightInputLabel(
                                                                    selectedEquipment,
                                                                    false,
                                                                  )}`}
                                                                  min={0}
                                                                  step={0.5}
                                                                  value={weight}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      0,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetWeights((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                  }}
                                                                   placeholder={weightInputLabel(
                                                                     selectedEquipment,
                                                                     false,
                                                                   )}
                                                                  className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                />
                                                                 <FreeTextInput
                                                                   aria-label="תרגיל ראשון חזרות מינימום"
                                                                  min={1}
                                                                  value={minReps}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      1,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRepMins((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                  }}
                                                                  placeholder="חזרות מינ׳"
                                                                  className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                />
                                                                 <FreeTextInput
                                                                   aria-label="תרגיל ראשון חזרות מקסימום"
                                                                  min={minReps}
                                                                  value={maxReps}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      minReps,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRepMaxes((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                  }}
                                                                  placeholder="חזרות מקס׳"
                                                                  className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                />
                                                              </div>
                                                              <div className="mb-2">
                                                                {renderSupersetPartnerSearch()}
                                                              </div>
                                                              <div className="grid grid-cols-3 gap-1.5">
                                                                <label className="grid gap-1 text-[9px] font-bold text-violet-900">
                                                                  {weightInputLabel(
                                                                    store.exercises.find(
                                                                      (exercise) =>
                                                                        exercise.id ===
                                                                        supersetPartnerId,
                                                                    )?.equipment,
                                                                    false,
                                                                  )}
                                                                  <FreeTextInput
                                                                    min={0}
                                                                    step={0.5}
                                                                    value={supersetPartnerWeight}
                                                                    onChange={(event) =>
                                                                      setSupersetPartnerWeight(
                                                                        Math.max(
                                                                          0,
                                                                          Number(
                                                                            event.target.value,
                                                                          ),
                                                                        ),
                                                                      )
                                                                    }
                                                                    className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                  />
                                                                </label>
                                                                <label className="grid gap-1 text-[9px] font-bold text-violet-900">
                                                                  חזרות מינ׳
                                                                  <FreeTextInput
                                                                    min={1}
                                                                    value={supersetRepsMin}
                                                                    onChange={(event) =>
                                                                      setSupersetRepsMin(
                                                                        Math.max(
                                                                          1,
                                                                          Number(
                                                                            event.target.value,
                                                                          ),
                                                                        ),
                                                                      )
                                                                    }
                                                                    className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                  />
                                                                </label>
                                                                <label className="grid gap-1 text-[9px] font-bold text-violet-900">
                                                                  חזרות מקס׳
                                                                  <FreeTextInput
                                                                    min={supersetRepsMin}
                                                                    value={supersetRepsMax}
                                                                    onChange={(event) =>
                                                                      setSupersetRepsMax(
                                                                        Math.max(
                                                                          supersetRepsMin,
                                                                          Number(
                                                                            event.target.value,
                                                                          ),
                                                                        ),
                                                                      )
                                                                    }
                                                                    className="h-9 rounded-lg border border-violet-200 bg-white text-center text-xs text-ink"
                                                                  />
                                                                </label>
                                                              </div>
                                                            </div>
                                                          ) : null}
                                                          {mode === "drop" ? (
                                                            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                                                              <p className="mb-2 text-[10px] font-extrabold text-primary">
                                                                שלבי הורדת משקל
                                                              </p>
                                                              <div className="grid gap-2 sm:grid-cols-2">
                                                                {[
                                                                  {
                                                                    label: "דרופ 1",
                                                                    weight: dropLevel1Weight,
                                                                    setWeight: setDropLevel1Weight,
                                                                    min: dropLevel1RepsMin,
                                                                    setMin: setDropLevel1RepsMin,
                                                                    max: dropLevel1RepsMax,
                                                                    setMax: setDropLevel1RepsMax,
                                                                  },
                                                                  {
                                                                    label: "דרופ 2",
                                                                    weight: dropLevel2Weight,
                                                                    setWeight: setDropLevel2Weight,
                                                                    min: dropLevel2RepsMin,
                                                                    setMin: setDropLevel2RepsMin,
                                                                    max: dropLevel2RepsMax,
                                                                    setMax: setDropLevel2RepsMax,
                                                                  },
                                                                ].map((drop) => (
                                                                  <div
                                                                    key={drop.label}
                                                                    className="rounded-lg bg-white/80 p-2"
                                                                  >
                                                                    <p className="mb-1 text-[9px] font-bold text-primary">
                                                                      {drop.label}
                                                                    </p>
                                                                    <div className="grid grid-cols-3 gap-1">
                                                                       <FreeTextInput
                                                                         aria-label={`${drop.label} משקל`}
                                                                        min={0}
                                                                        step={0.5}
                                                                        value={drop.weight}
                                                                        onChange={(event) =>
                                                                          drop.setWeight(
                                                                            event.target.value,
                                                                          )
                                                                        }
                                                                        placeholder="ק״ג"
                                                                        className="h-8 rounded-md border border-border text-center text-[11px]"
                                                                      />
                                                                       <FreeTextInput
                                                                         aria-label={`${drop.label} חזרות מינימום`}
                                                                        min={1}
                                                                        value={drop.min}
                                                                        onChange={(event) =>
                                                                          drop.setMin(
                                                                            Math.max(
                                                                              1,
                                                                              Number(
                                                                                event.target.value,
                                                                              ),
                                                                            ),
                                                                          )
                                                                        }
                                                                        className="h-8 rounded-md border border-border text-center text-[11px]"
                                                                      />
                                                                       <FreeTextInput
                                                                         aria-label={`${drop.label} חזרות מקסימום`}
                                                                        min={drop.min}
                                                                        value={drop.max}
                                                                        onChange={(event) =>
                                                                          drop.setMax(
                                                                            Math.max(
                                                                              drop.min,
                                                                              Number(
                                                                                event.target.value,
                                                                              ),
                                                                            ),
                                                                          )
                                                                        }
                                                                        className="h-8 rounded-md border border-border text-center text-[11px]"
                                                                      />
                                                                    </div>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                              <label className="mt-2 grid gap-1 text-[9px] font-bold text-primary">
                                                                זמן מנוחה (שניות)
                                                                  <FreeTextInput
                                                                  min={0}
                                                                  step={5}
                                                                  value={setRests[index] ?? restSec}
                                                                  onChange={(event) => {
                                                                    const value = Math.max(
                                                                      0,
                                                                      Number(event.target.value),
                                                                    );
                                                                    setSetRests((current) => {
                                                                      const next = [...current];
                                                                      next[index] = value;
                                                                      return next;
                                                                    });
                                                                    if (index === 0)
                                                                      setRestSec(value);
                                                                  }}
                                                                  className="h-8 rounded-md border border-primary/20 bg-background text-center text-[11px]"
                                                                  aria-label={`${mode === "drop" ? "דרופ סט" : "סט"} זמן מנוחה`}
                                                                />
                                                              </label>
                                                            </div>
                                                          ) : null}
                                                        </div>
                                                      );
                                                    },
                                                  )}
                                                </div>

                                                <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                  הערה למתאמן על התרגיל
                                                  <textarea
                                                    value={techNotes}
                                                    onChange={(event) =>
                                                      setTechniqueNotes(event.target.value)
                                                    }
                                                    placeholder="למשל: לשמור על גב ישר ולבצע לאט..."
                                                    rows={2}
                                                    className="w-full resize-none rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-normal text-ink outline-none focus:border-primary"
                                                  />
                                                </label>

                                                {advancedExerciseControlsEnabled &&
                                                (warmupEnabled ||
                                                  dropSetEnabled ||
                                                  supersetGroup) ? (
                                                  <div className="grid min-w-0 grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background p-3">
                                                    {warmupEnabled ? (
                                                      <>
                                                        <label className="grid min-w-0 gap-1 text-[10px] font-bold text-muted-foreground">
                                                          {weightInputLabel(selectedEquipment)}
                                                                  <FreeTextInput
                                                            min="0"
                                                            step={0.5}
                                                            value={warmupWeight}
                                                            onChange={(event) =>
                                                              setWarmupWeight(
                                                                Math.max(
                                                                  0,
                                                                  Number(event.target.value),
                                                                ),
                                                              )
                                                            }
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                          />
                                                        </label>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          מספר סטי חימום
                                                                  <FreeTextInput
                                                            min="1"
                                                            max="5"
                                                            value={warmupSetsCount}
                                                            onChange={(event) =>
                                                              setWarmupSetsCount(
                                                                Math.max(
                                                                  1,
                                                                  Number(event.target.value),
                                                                ),
                                                              )
                                                            }
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                          />
                                                        </label>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          חזרות חימום מינ'
                                                                      <FreeTextInput
                                                            min="1"
                                                            value={warmupReps}
                                                            onChange={(event) =>
                                                              setWarmupReps(
                                                                Math.max(
                                                                  1,
                                                                  Number(event.target.value),
                                                                ),
                                                              )
                                                            }
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                          />
                                                        </label>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          חזרות חימום מקס'
                                                                      <FreeTextInput
                                                            min={warmupReps}
                                                            value={warmupRepsMax}
                                                            onChange={(event) =>
                                                              setWarmupRepsMax(
                                                                Math.max(
                                                                  warmupReps,
                                                                  Number(event.target.value),
                                                                ),
                                                              )
                                                            }
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                          />
                                                        </label>
                                                      </>
                                                    ) : null}
                                                    {dropSetEnabled ? (
                                                      <>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                           {weightInputLabel(selectedEquipment)} לפני הדרופ
                                                                      <FreeTextInput
                                                            min="0.1"
                                                            step={0.5}
                                                            inputMode="decimal"
                                                            value={dropLevel1Weight}
                                                            onChange={(event) =>
                                                              setDropLevel1Weight(
                                                                event.target.value,
                                                              )
                                                            }
                                                            placeholder="למשל 20"
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                                                            aria-label="משקל לפני הדרופ בקילוגרמים"
                                                          />
                                                        </label>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                           {weightInputLabel(selectedEquipment)} אחרי הדרופ
                                                                <FreeTextInput
                                                            min="0.1"
                                                            step={0.5}
                                                            inputMode="decimal"
                                                            value={dropLevel2Weight}
                                                            onChange={(event) =>
                                                              setDropLevel2Weight(
                                                                event.target.value,
                                                              )
                                                            }
                                                            placeholder="למשל 15"
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                                                            aria-label="משקל אחרי הדרופ בקילוגרמים"
                                                          />
                                                        </label>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          חזרות דרופ סט
                                                          <div className="grid grid-cols-2 gap-1">
                                                          <FreeTextInput
                                                              min="1"
                                                              value={dropRepsMin}
                                                              onChange={(event) =>
                                                                setDropRepsMin(
                                                                  Math.max(
                                                                    1,
                                                                    Number(event.target.value),
                                                                  ),
                                                                )
                                                              }
                                                              className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                              aria-label="חזרות דרופ סט מינימום"
                                                            />
                                                          <FreeTextInput
                                                              min={dropRepsMin}
                                                              value={dropRepsMax}
                                                              onChange={(event) =>
                                                                setDropRepsMax(
                                                                  Math.max(
                                                                    dropRepsMin,
                                                                    Number(event.target.value),
                                                                  ),
                                                                )
                                                              }
                                                              className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                              aria-label="חזרות דרופ סט מקסימום"
                                                            />
                                                          </div>
                                                        </label>
                                                      </>
                                                    ) : null}
                                                    {supersetGroup ? (
                                                      <>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          קבוצה
                                                          <input
                                                            value={supersetGroup}
                                                            onChange={(event) =>
                                                              setSupersetGroup(event.target.value)
                                                            }
                                                            placeholder="A"
                                                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                          />
                                                        </label>
                                                        <div className="col-span-2 min-w-0">
                                                          {renderSupersetPartnerSearch()}
                                                        </div>
                                                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                          חזרות סופר סט
                                                          <div className="grid grid-cols-2 gap-1">
                                                          <FreeTextInput
                                                              min="1"
                                                              value={supersetRepsMin}
                                                              onChange={(event) =>
                                                                setSupersetRepsMin(
                                                                  Math.max(
                                                                    1,
                                                                    Number(event.target.value),
                                                                  ),
                                                                )
                                                              }
                                                              className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                              aria-label="חזרות סופר סט מינימום"
                                                            />
                                                          <FreeTextInput
                                                              min={supersetRepsMin}
                                                              value={supersetRepsMax}
                                                              onChange={(event) =>
                                                                setSupersetRepsMax(
                                                                  Math.max(
                                                                    supersetRepsMin,
                                                                    Number(event.target.value),
                                                                  ),
                                                                )
                                                              }
                                                              className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                              aria-label="חזרות סופר סט מקסימום"
                                                            />
                                                          </div>
                                                        </label>
                                                      </>
                                                    ) : null}
                                                  </div>
                                                ) : null}

                                                <button
                                                  type="submit"
                                                  className="w-full rounded-lg bg-primary py-1.5 font-bold text-white shadow-xs cursor-pointer"
                                                >
                                                  {editingItemId
                                                    ? "שמור שינויי תרגיל"
                                                    : "שמור תרגיל ליום אימון"}
                                                </button>
                                              </form>
                                            </ExerciseBuilderPlacement>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenWorkoutReportId((current) =>
                                                current === dayItem.id ? null : dayItem.id,
                                              );
                                            }}
                                            aria-label={
                                              openWorkoutReportId === dayItem.id
                                                ? "סגירת דוח"
                                                : "פתיחת דוח"
                                            }
                                            aria-expanded={openWorkoutReportId === dayItem.id}
                                            aria-controls={`workout-report-${dayItem.id}`}
                                            title={
                                              openWorkoutReportId === dayItem.id
                                                ? "סגירת דוח"
                                                : "פתיחת דוח"
                                            }
                                            className={`workout-surface-bookmark workout-report-bookmark ${
                                              openWorkoutReportId === dayItem.id
                                                ? "workout-report-bookmark-open"
                                                : ""
                                            }`}
                                          >
                                            <span>דוח</span>
                                          </button>
                                          {openWorkoutReportId === dayItem.id ? (
                                            <section
                                              id={`workout-report-${dayItem.id}`}
                                              className="workout-report-panel"
                                              aria-labelledby={`workout-report-heading-${dayItem.id}`}
                                            >
                                              <div className="mb-3 min-w-0 pe-8">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                                                  דוח האימון
                                                </p>
                                                <h3
                                                  id={`workout-report-heading-${dayItem.id}`}
                                                  className="mt-1 truncate font-display text-base font-extrabold text-ink"
                                                >
                                                  {dayItem.name}
                                                </h3>
                                              </div>
                                              <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.025]">
                                                <WorkoutDailyReport
                                                  workout={dayItem}
                                                  history={clientDetails?.history ?? []}
                                                  exercises={Array.from(
                                                    new Map(
                                                      [
                                                        ...store.exercises,
                                                        ...(clientDetails?.exercises ?? []),
                                                      ].map((exercise) => [exercise.id, exercise]),
                                                    ).values(),
                                                  )}
                                                />
                                              </div>
                                            </section>
                                          ) : null}
                                        </div>
                                      </WorkoutSurfacePlacement>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coach-prescribed menu builder */}
                  <div
                    id="coach-menu"
                    onChange={markPlannedMealsDraftDirty}
                    className={`space-y-3 ${
                      workspacePage
                        ? "bg-background"
                        : "surface-card rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4"
                    } ${!showNutritionBuilder ? "hidden" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-2">
                      <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
                          <Apple className="h-4 w-4 text-emerald-700" /> בניית תפריט למתאמן
                        </h4>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          התפריט נשמר כתבנית קבועה ונפרד מהיומן בפועל. תאריך הבדיקה מציג רק את מה
                          שנרשם בפועל.
                        </p>
                      </div>
                      <input
                        type="date"
                        value={menuDate}
                        onChange={(event) => setMenuDate(event.target.value)}
                        className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-emerald-500"
                        aria-label="תאריך להצגת רישום בפועל"
                      />
                    </div>

                    <div className="sticky top-2 z-10 grid grid-cols-4 gap-1.5 rounded-xl border border-emerald-200 bg-white/95 p-2 shadow-sm backdrop-blur">
                      <div className="rounded-lg bg-orange-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-orange-700">קלוריות</div>
                        <div className="mt-0.5 text-sm font-black text-orange-950">
                          {Math.round(menuTotals.calories)}
                        </div>
                        <div className="text-[9px] text-orange-700">קק״ל</div>
                      </div>
                      <div className="rounded-lg bg-blue-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-blue-700">חלבון</div>
                        <div className="mt-0.5 text-sm font-black text-blue-950">
                          {Math.round(menuTotals.protein * 10) / 10}
                        </div>
                        <div className="text-[9px] text-blue-700">גרם</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-amber-700">פחמימה</div>
                        <div className="mt-0.5 text-sm font-black text-amber-950">
                          {Math.round(menuTotals.carbs * 10) / 10}
                        </div>
                        <div className="text-[9px] text-amber-700">גרם</div>
                      </div>
                      <div className="rounded-lg bg-rose-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-rose-700">שומנים</div>
                        <div className="mt-0.5 text-sm font-black text-rose-950">
                          {Math.round(menuTotals.fat * 10) / 10}
                        </div>
                        <div className="text-[9px] text-rose-700">גרם</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plannedMeals.map((meal, mealIndex) => {
                        const actualMeal = clientDetails.nutritionDays
                          .find((day) => day.date === menuDate)
                          ?.meals.at(mealIndex);
                        return (
                          <div
                            key={meal.id}
                            id={`coach-menu-meal-${meal.id}`}
                            className="rounded-xl border border-emerald-200/70 bg-white p-3"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                value={meal.name}
                                onChange={(event) =>
                                  setPlannedMeals((current) =>
                                    current.map((item) =>
                                      item.id === meal.id
                                        ? { ...item, name: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                className="min-w-0 flex-1 bg-transparent text-xs font-bold text-ink outline-none"
                                aria-label="שם הארוחה"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuFoodMealId(menuFoodMealId === meal.id ? null : meal.id)
                                }
                                className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                              >
                                + מאכל
                              </button>
                            </div>

                            {meal.foods.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {meal.foods.map((food) => (
                                  <div
                                    key={food.id}
                                    className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px]"
                                  >
                                    <span className="truncate font-semibold text-ink">
                                      {food.name} · {mealFoodQuantityLabel(food)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removePlannedFood(meal.id, food.id)}
                                      className="ms-2 shrink-0 text-muted-foreground hover:text-destructive"
                                      aria-label={`הסר ${food.name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                אין מאכלים בארוחה עדיין.
                              </p>
                            )}

                            {actualMeal?.foods.length ? (
                              <div
                                className={`mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-[10px] ${
                                  focusedNutritionMealId &&
                                  (focusedNutritionMealId === actualMeal.id ||
                                    focusedNutritionMealId === meal.id)
                                    ? "ring-2 ring-primary/35"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 font-bold text-amber-900">
                                  <span>מה שהמתאמן אכל בפועל</span>
                                  <span className="font-normal">
                                    {new Date(`${menuDate}T00:00:00`).toLocaleDateString("he-IL")}
                                  </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                  {actualMeal.foods.map((food) => (
                                    <div
                                      key={food.id}
                                      id={`coach-menu-food-${food.id}`}
                                      className={`rounded-md px-1.5 py-1 text-amber-950 ${
                                        focusedNutritionFoodId === food.id
                                          ? "bg-primary/10 font-bold ring-1 ring-primary/30"
                                          : ""
                                      }`}
                                    >
                                      {food.name} ×{food.quantity}
                                      {food.notes?.trim() ? (
                                        <span className="text-amber-900/80">
                                          {" "}
                                          · הערה: {food.notes.trim()}
                                        </span>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 rounded-lg bg-amber-50/60 px-2 py-1 text-[10px] text-amber-800">
                                עדיין אין רישום בפועל לארוחה הזו.
                              </p>
                            )}

                            {menuFoodMealId === meal.id ? (
                              <div className="mt-2 space-y-2 border-t border-emerald-100 pt-2">
                                <label
                                  className="block text-[11px] font-bold text-emerald-900"
                                  htmlFor={`menu-food-search-${meal.id}`}
                                >
                                  חיפוש במאגר המאכלים
                                </label>
                                <input
                                  id={`menu-food-search-${meal.id}`}
                                  type="search"
                                  value={menuFoodQuery}
                                  onChange={(event) => {
                                    setMenuFoodQuery(event.target.value);
                                    setMenuFoodId("");
                                  }}
                                  placeholder={genderText(
                                    gender,
                                    "חפשי למשל: חזה עוף, אורז, ביצה...",
                                    "חפש למשל: חזה עוף, אורז, ביצה...",
                                  )}
                                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                  aria-describedby={`menu-food-help-${meal.id}`}
                                  autoComplete="off"
                                />
                                <p
                                  id={`menu-food-help-${meal.id}`}
                                  className="text-[10px] text-muted-foreground"
                                >
                                  {genderText(
                                    gender,
                                    "בחרי מאכל מהרשימה כדי להוסיף אותו לארוחה.",
                                    "בחר מאכל מהרשימה כדי להוסיף אותו לארוחה.",
                                  )}
                                </p>
                                <div
                                  role="listbox"
                                  aria-label="תוצאות חיפוש מאכלים"
                                  className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-emerald-100 bg-emerald-50/50 p-1.5"
                                >
                                  {menuFoodResults.length > 0 ? (
                                    menuFoodResults.map((food) => (
                                      <button
                                        key={food.id}
                                        type="button"
                                        role="option"
                                        aria-selected={menuFoodId === food.id}
                                        onClick={() => {
                                          setMenuFoodId(food.id);
                                          const portion = defaultFoodQuantity(food);
                                          setMenuFoodQuantity(portion.quantity);
                                          setMenuFoodUnit(portion.unit);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-start text-[12px] transition-colors ${
                                          menuFoodId === food.id
                                            ? "bg-emerald-700 font-bold text-white"
                                            : "bg-white font-semibold text-ink hover:bg-emerald-100"
                                        }`}
                                      >
                                        <span className="truncate">{food.name}</span>
                                        <span className="ms-2 shrink-0 text-[10px] opacity-70">
                                          {food.calories} קל׳
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="p-3 text-center text-[11px] text-muted-foreground">
                                      לא נמצאו מאכלים. נסי מילה אחרת.
                                    </p>
                                  )}
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-1.5">
                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                    יחידת מידה
                                    <select
                                      value={menuFoodUnit}
                                      onChange={(event) =>
                                        setMenuFoodUnit(event.target.value as FoodQuantityUnit)
                                      }
                                      disabled={!selectedMenuFood}
                                      className="h-9 min-w-0 w-full rounded-lg border border-border bg-white px-2 text-center text-[12px] outline-none focus:border-emerald-500"
                                      aria-label="יחידת מידה למאכל"
                                    >
                                      {(selectedMenuFood
                                        ? foodQuantityOptions(selectedMenuFood)
                                        : []
                                      ).map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                    כמות
                                                          <FreeTextInput
                                      min="0.1"
                                      step={0.1}
                                      value={menuFoodQuantity}
                                      onChange={(event) =>
                                        setMenuFoodQuantity(Number(event.target.value))
                                      }
                                      className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-center text-[12px] outline-none focus:border-emerald-500"
                                      aria-label="כמות המאכל"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!menuFoodId || menuFoodQuantity <= 0}
                                    onClick={() => addPlannedFood(meal.id)}
                                    className="rounded-lg bg-emerald-700 px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40"
                                  >
                                    {genderText(gender, "הוסיפי לארוחה", "הוסף לארוחה")}
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addPlannedMeal}
                        className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                      >
                        + {genderText(gender, "הוסיפי ארוחה", "הוסף ארוחה")}
                      </button>
                      <button
                        type="button"
                        onClick={savePlannedMenu}
                        className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                      >
                        {genderText(gender, "שמרי תפריט", "שמור תפריט")}
                      </button>
                    </div>
                    {menuNotice ? (
                      <p
                        className={`rounded-lg border p-2 text-[11px] font-semibold ${
                          menuNotice.includes("נכשל")
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-emerald-200 bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {menuNotice}
                      </p>
                    ) : null}
                  </div>

                  {/* Client Nutrition Targets Editor */}
                  <div
                    id="coach-nutrition"
                    className={`scroll-mt-24 space-y-4 ${
                      workspacePage
                        ? "bg-background"
                        : "surface-card rounded-[1.75rem] border-emerald-200/70 bg-emerald-50/30 p-4"
                    } ${!showNutritionBuilder ? "hidden" : ""}`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                        <Apple className="h-4 w-4 text-primary" /> יעד קלורי ותזונה למתאמן
                      </h3>
                      <button
                        onClick={() => setEditingNutrition(!editingNutrition)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>{editingNutrition ? "ביטול" : "ערוך יעדים"}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void saveClientCalorieVisibility(
                          !(clientDetails?.profile?.showCalories !== false),
                        )
                      }
                      aria-pressed={clientDetails?.profile?.showCalories !== false}
                      className="flex w-full items-center justify-between rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-start"
                    >
                      <span>
                        <span className="block text-[11px] font-bold text-ink">
                          הצגת קלוריות למתאמן
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {clientDetails?.profile?.showCalories !== false ? "מוצג" : "מוסתר"} במסכי
                          התזונה והמאזן
                        </span>
                      </span>
                      <span
                        className={`relative h-5 w-9 rounded-full ${
                          clientDetails?.profile?.showCalories !== false
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow ${
                            clientDetails?.profile?.showCalories !== false ? "start-5" : "start-1"
                          }`}
                        />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBmrCalculator(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 text-[11px] font-bold text-primary"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      מחשבון BMR
                    </button>
                    {showBmrCalculator ? (
                      <div
                        className="rounded-2xl border border-primary/15 bg-card/80 p-3"
                        onChange={markProfileDraftDirty}
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-bold text-ink">מחשבון BMR למאמן בלבד</p>
                            <button
                              type="button"
                              onClick={() => setShowBmrCalculator(false)}
                              className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-ink"
                              aria-label="סגירת מחשבון BMR"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                            החישוב הוא אומדן לפי Mifflin–St Jeor. הוא לא מוצג למתאמן ולא משנה יעד
                            קלורי אוטומטית.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                            מין
                            <select
                              value={profileGender}
                              onChange={(event) =>
                                setProfileGender(event.target.value as "female" | "male" | "")
                              }
                              className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                            >
                              <option value="">נדרש</option>
                              <option value="female">נקבה</option>
                              <option value="male">זכר</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                            גיל
                                                          <FreeTextInput
                              min="1"
                              max="120"
                              value={profileAge}
                              onChange={(event) => setProfileAge(event.target.value)}
                              placeholder="נדרש"
                              className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                            />
                          </label>
                          <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                            גובה (ס״מ)
                                                            <FreeTextInput
                              min="1"
                              max="300"
                              value={profileHeight}
                              onChange={(event) => setProfileHeight(event.target.value)}
                              placeholder="נדרש"
                              className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                            />
                          </label>
                          <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                            משקל (ק״ג)
                                                            <FreeTextInput
                              min="0.1"
                              max="500"
                              step={0.1}
                              value={profileWeight}
                              onChange={(event) => setProfileWeight(event.target.value)}
                              placeholder="נדרש"
                              className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                            />
                          </label>
                          <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                            אימונים בשבוע
                                                          <FreeTextInput
                              min="0"
                              max="14"
                              value={profileWorkouts}
                              onChange={(event) => setProfileWorkouts(event.target.value)}
                              placeholder="נדרש"
                              className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                            />
                          </label>
                        </div>
                        {!clientDetails?.profile?.gender ? (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] font-semibold text-ink">
                            חסר מין בפרופיל המתאמן. יש להשלים אותו בפרופיל לפני שאפשר לחשב.
                          </p>
                        ) : null}
                        {calorieEstimate ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                            <div className="rounded-xl bg-primary/5 p-2">
                              <span className="block text-[10px] text-muted-foreground">
                                BMR במנוחה
                              </span>
                              <strong className="text-sm text-ink">
                                {calorieEstimate.bmr} kcal
                              </strong>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-2">
                              <span className="block text-[10px] text-muted-foreground">
                                TDEE בשגרה
                              </span>
                              <strong className="text-sm text-ink">
                                {calorieEstimate.tdee} kcal
                              </strong>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-[10px] font-semibold text-muted-foreground">
                            השלימי גיל, גובה, משקל, מין ומספר אימונים בשבוע — ללא כל אחד מהם לא יוצג
                            חישוב.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={saveClientCalorieProfile}
                          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-primary/25 bg-primary/5 text-[11px] font-bold text-primary"
                        >
                          <Save className="h-3.5 w-3.5" />
                          שמור נתוני מחשבון
                        </button>
                        {profileNotice ? (
                          <p className="mt-2 text-[10px] font-semibold text-ink">{profileNotice}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {editingNutrition ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              קלוריות (kcal)
                            </label>
                                                            <FreeTextInput
                              value={calTarget || ""}
                              onChange={(e) => setCalTarget(Number(e.target.value))}
                              className="w-full rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              חלבון (g)
                            </label>
                                                            <FreeTextInput
                              value={protTarget || ""}
                              onChange={(e) => setProtTarget(Number(e.target.value))}
                              className="w-full rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSaveNutritionTargets}
                          className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>שמור יעד מותאם למתאמן</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-primary/5 p-2 border border-primary/10">
                          <span className="block text-[10px] text-muted-foreground">קלוריות</span>
                          <span className="font-bold text-ink">
                            {clientDetails?.nutritionTargets?.calories
                              ? `${clientDetails.nutritionTargets.calories} kcal`
                              : "לא הוגדר"}
                          </span>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                          <span className="block text-[10px] text-emerald-600">ימי מעקב</span>
                          <span className="font-bold text-emerald-800">
                            {clientDetails?.nutritionDays?.length || 0} ימים
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {showClientOverview ? (
                    /* Read-only Client Cardio History */
                    <div className="surface-card p-4 rounded-2xl space-y-3">
                      <div
                        id="coach-menu"
                        className="flex items-center justify-between border-b pb-2 scroll-mt-24"
                      >
                        <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-primary" /> היסטוריית אירובי
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {clientDetails?.cardioLogs?.length || 0} אימונים
                        </span>
                      </div>
                      {clientDetails?.cardioLogs?.length ? (
                        <div className="space-y-2">
                          {clientDetails.cardioLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-xs"
                            >
                              <div>
                                <p className="font-bold text-ink">{log.type}</p>
                                <p className="text-muted-foreground">
                                  {new Date(`${log.date}T00:00:00`).toLocaleDateString("he-IL")} ·{" "}
                                  {log.durationMin} דקות
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-primary">{log.calories} קל׳</p>
                                {log.distanceKm ? (
                                  <p className="text-[11px] text-muted-foreground">
                                    {log.distanceKm} ק״מ
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          עדיין לא נרשמו אימוני אירובי.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  role="alert"
                  className="surface-card space-y-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center"
                >
                  <h4 className="font-bold text-sm text-ink">לא ניתן לטעון את סביבת המתאמן</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {clientDetailsError || "אירעה שגיאה בטעינת התוכנית והתפריט."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedClientId) return;
                      setLoadingDetails(true);
                      void pullClientDataForCoach(selectedClientId).then((result) => {
                        applyClientDetails(result);
                        setLoadingDetails(false);
                      });
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                  >
                    {genderText(gender, "נסי שוב", "נסה שוב")}
                  </button>
                </div>
              )}
            </div>
          </Overlay>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <Overlay
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            ariaLabel="שיוך מתאמן חדש"
          >
            <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-base text-ink flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> שיוך מתאמן חדש
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-ink font-bold text-sm px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {inviteMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-semibold border ${
                    inviteMsg.includes("בהצלחה")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {inviteMsg}
                </div>
              )}

              <form onSubmit={handleAddClient} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    אימייל המתאמן הרשום במערכת
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="client@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 cursor-pointer"
                >
                  שייך מתאמן לחשבוני
                </button>
              </form>
            </div>
          </Overlay>
        )}

        <Overlay
          open={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          ariaLabel="בחירת תרגיל"
          variant="full"
          backdrop={false}
          panelClassName="p-0"
        >
          <div dir="rtl" className="h-full max-h-full">
            <div className="flex h-full min-h-0 flex-col p-5 text-start">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                    ספריית תרגילים
                  </p>
                  <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                    {genderText(gender, "בחרי תרגיל", "בחר תרגיל")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExercisePicker(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-ink cursor-pointer"
                  aria-label="סגור"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="num-pill flex h-12 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={exerciseQuery}
                  onChange={(event) => setExerciseQuery(event.target.value)}
                  placeholder="חפש לפי שם, ציוד או שריר..."
                  className="w-full bg-transparent text-[14px] outline-none"
                  autoFocus
                />
              </div>
              <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
                {exerciseMuscleOptions.map((muscle) => (
                  <button
                    type="button"
                    key={muscle}
                    onClick={() => setExerciseMuscleFilter(muscle)}
                    className={`press shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      exerciseMuscleFilter === muscle
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openCreateExercise}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3.5 py-3 text-[13px] font-bold text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                הוספת תרגיל חדש למאגר
              </button>

              <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
                {visibleExerciseOptions.map((exercise) => (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() => {
                      selectExerciseForBuilder(exercise.id);
                      setExerciseQuery("");
                      setShowExercisePicker(false);
                    }}
                    className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-secondary px-3.5 py-3 text-start hover:border-primary/50"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-primary">
                      <Dumbbell className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {exerciseDisplayName(exercise)}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{exercise.muscleGroup}</p>
                    </div>
                    <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {exercise.equipment}
                    </span>
                  </button>
                ))}
                {visibleExerciseOptions.length === 0 ? (
                  <p className="rounded-2xl bg-secondary p-4 text-[13px] text-muted-foreground">
                    לא נמצאו תרגילים מתאימים לסינון או לחיפוש.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Overlay>

        <Overlay
          open={showCreateExercise}
          onClose={() => setShowCreateExercise(false)}
          ariaLabel="הוספת תרגיל חדש למאגר"
          variant="bottom"
          panelClassName="p-0"
        >
          <div dir="rtl" className="p-5 text-start">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  מאגר תרגילים
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  הוספת תרגיל חדש
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExercise(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-ink"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExercise} className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground">
                שם התרגיל
                <input
                  required
                  autoFocus
                  value={newExerciseDraft.name}
                  onChange={(event) =>
                    setNewExerciseDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="לדוגמה: לחיצת חזה במכונה"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-bold text-muted-foreground">
                  קבוצת שרירים
                  <input
                    required
                    value={newExerciseDraft.muscleGroup}
                    onChange={(event) =>
                      setNewExerciseDraft((current) => ({
                        ...current,
                        muscleGroup: event.target.value,
                        muscleGroups: [event.target.value],
                      }))
                    }
                    placeholder="חזה"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <div className="block text-xs font-bold text-muted-foreground">
                  ציוד אפשרי
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {EQUIPMENT.filter(
                      (equipment) => !store.deletedEquipmentOptions?.includes(equipment),
                    ).map((equipment) => {
                      const selected = selectedExerciseEquipmentOptions(newExerciseDraft).includes(
                        equipment,
                      );
                      return (
                        <button
                          key={equipment}
                          type="button"
                          onClick={() =>
                            setNewExerciseDraft((current) => {
                              const options = selectedExerciseEquipmentOptions(current);
                              const next = selected
                                ? options.filter((option) => option !== equipment)
                                : [...options, equipment];
                              if (next.length === 0) return current;
                              return {
                                ...current,
                                equipment: next[0] ?? current.equipment,
                                equipmentOptions: next,
                              };
                            })
                          }
                          className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {equipment}
                        </button>
                      );
                    })}
                  </div>
                  {selectedExerciseEquipmentOptions(newExerciseDraft).includes("פולי / כבלים") ? (
                    <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                      באימון עצמו תופיע גם בחירת מאחז לכבלים.
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                זהו טופס מהיר: שם, קבוצת שרירים וציוד מספיקים כדי להתחיל. אפשר להוסיף הוראות,
                תמונות וסרטונים בעריכת התרגיל לאחר השמירה.
              </p>
              {newExerciseError ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {newExerciseError}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                שמירה ובחירת התרגיל לאימון
              </button>
            </form>
          </div>
        </Overlay>
      </div>
    </AppShell>
  );
}
