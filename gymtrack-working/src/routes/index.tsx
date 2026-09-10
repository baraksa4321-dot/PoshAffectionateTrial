import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Apple,
  ArrowLeft,
  ChevronLeft,
  Dumbbell,
  Flame,
  Flame as FireIcon,
  Play,
  Plus,
  Scale,
  TrendingUp,
  Droplets,
  Award,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Heart,
  X,
  Check,
  CalendarDays,
  Clock3,
  ChevronDown,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { FreeTextInput } from "@/components/FreeTextInput";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  Card,
  IconButton,
  PrimaryButton,
  SectionHeader,
  StatTile,
} from "@/components/ui-app/primitives";
import {
  calculateRmr,
  dayTotals,
  saveBodyWeight,
  saveUserProfile,
  todayKey,
  addChecklistItem,
  toggleChecklistItem,
  useGym,
  useAuthUser,
  personalRecords,
} from "@/lib/gym-store";
import { genderText } from "@/lib/gender-copy";
import { getLatestVisibleCoachMessage } from "@/lib/message-history";
import { supabase } from "@/lib/supabase";
import {
  getCurrentWeekDates,
  getCurrentWeekWorkoutSession,
  getWorkoutCompletion,
  type WeeklyWorkoutStatus,
} from "@/lib/workout-session";

type HomeCardId =
  | "profile"
  | "coach-message"
  | "consistency"
  | "workout"
  | "nutrition"
  | "checklist"
  | "check-in"
  | "activity"
  | "measurements";
const HOME_CARD_ORDER_KEY = "myroutine-home-card-order-v2";
const DEFAULT_HOME_CARD_ORDER: HomeCardId[] = [
  "profile",
  "coach-message",
  "consistency",
  "workout",
  "nutrition",
  "checklist",
  "check-in",
  "activity",
  "measurements",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "לוח בקרה — MY routine" },
      { name: "description", content: "מעקב אימונים, משקל גוף ותזונה יומית." },
      { property: "og:title", content: "לוח בקרה — MY routine" },
    ],
  }),
  component: Dashboard,
});

function formatNumericDate(date: Date) {
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDayDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

function sessionStats(session: import("@/lib/gym-types").HistorySession | undefined) {
  const entries = session?.entries ?? [];
  const sets = entries.flatMap((entry) => entry.sets).filter((set) => !set.warmup);
  const doneSets = sets.filter((set) => set.done);
  const volume = doneSets.reduce((sum, set) => sum + set.weight * set.reps, 0);
  return {
    doneSets: doneSets.length,
    totalSets: sets.length,
    volume,
    durationSec: session?.durationSec ?? 0,
  };
}

function progressEntryForExercise(
  session: import("@/lib/gym-types").HistorySession,
  exerciseId: string,
  exerciseName: string,
) {
  return (
    session.entries.find((entry) => entry.exerciseId === exerciseId) ??
    session.entries.find((entry) => entry.exerciseName.trim() === exerciseName.trim())
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const {
    workouts,
    exercises,
    history,
    nutritionDays,
    nutritionTargets,
    userProfile,
    bodyMeasurements,
    preExitChecklist,
    coachMessages,
    broadcasts,
    challengeEnrollments,
    reminderPreferences,
  } = useGym();
  const authUser = useAuthUser();

  const now = new Date();
  const weekDays = getCurrentWeekDates(now);
  const weekStartKey = weekDays[0]?.date ?? todayKey(now);

  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [showBodyProfileModal, setShowBodyProfileModal] = useState(false);
  const [bodyProfileDraft, setBodyProfileDraft] = useState({
    height: userProfile?.height && userProfile.height > 0 ? String(userProfile.height) : "",
    weight: userProfile?.weight && userProfile.weight > 0 ? String(userProfile.weight) : "",
    age: userProfile?.age && userProfile.age > 0 ? String(userProfile.age) : "",
    workoutsPerWeek:
      userProfile?.workoutsPerWeek !== undefined ? String(userProfile.workoutsPerWeek) : "",
    gender: userProfile?.gender ?? "female",
  });
  const [weeklyWeightInput, setWeeklyWeightInput] = useState(
    userProfile?.weight && userProfile.weight > 0 ? String(userProfile.weight) : "",
  );
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressRange, setProgressRange] = useState<7 | 30 | 90>(30);
  const [progressExerciseId, setProgressExerciseId] = useState("");
  const [homeCardOrder, setHomeCardOrder] = useState<HomeCardId[]>(() => {
    if (typeof window === "undefined") return DEFAULT_HOME_CARD_ORDER;
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(HOME_CARD_ORDER_KEY) ?? "null",
      ) as unknown;
      return Array.isArray(saved) && DEFAULT_HOME_CARD_ORDER.every((id) => saved.includes(id))
        ? (saved as HomeCardId[])
        : DEFAULT_HOME_CARD_ORDER;
    } catch {
      return DEFAULT_HOME_CARD_ORDER;
    }
  });
  const [isArrangingHome, setIsArrangingHome] = useState(false);
  const [draggingHomeCard, setDraggingHomeCard] = useState<HomeCardId | null>(null);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef({ x: 0, y: 0 });
  const suppressHomeClick = useRef(false);

  useEffect(() => {
    if (progressExerciseId || !exercises.length) return;
    const firstWorkoutExercise = workouts[0]?.items[0]?.exerciseId;
    setProgressExerciseId(firstWorkoutExercise ?? exercises[0]?.id ?? "");
  }, [exercises, progressExerciseId, workouts]);

  useEffect(() => {
    window.localStorage.setItem(HOME_CARD_ORDER_KEY, JSON.stringify(homeCardOrder));
  }, [homeCardOrder]);

  useEffect(() => {
    if (!draggingHomeCard) return;
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const element = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-home-card-id]");
      const target = element?.dataset["homeCardId"] as HomeCardId | undefined;
      if (!target || target === draggingHomeCard) return;
      setHomeCardOrder((current) => {
        const next = [...current];
        const from = next.indexOf(draggingHomeCard);
        const to = next.indexOf(target);
        if (from < 0 || to < 0) return current;
        const fromCard = next[from];
        const toCard = next[to];
        if (!fromCard || !toCard) return current;
        next[from] = toCard;
        next[to] = fromCard;
        return next;
      });
      setDraggingHomeCard(target);
      navigator.vibrate?.(15);
    };
    document.addEventListener("pointermove", handlePointerMove);
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [draggingHomeCard]);

  const clearFeatureHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const startHomeCardHold = (card: HomeCardId, event: PointerEvent<HTMLElement>) => {
    clearFeatureHold();
    // Home-card reordering is intentionally disabled.
    void card;
    void event;
  };

  const moveHomeCard = (event: PointerEvent<HTMLElement>) => {
    if (
      !isArrangingHome &&
      (Math.abs(event.clientX - holdStart.current.x) > 10 ||
        Math.abs(event.clientY - holdStart.current.y) > 10)
    ) {
      clearFeatureHold();
    }
  };

  const finishHomeCardPointer = () => {
    clearFeatureHold();
    setDraggingHomeCard(null);
  };

  const preventHomeNavigation = (event: MouseEvent) => {
    if (!suppressHomeClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressHomeClick.current = false;
  };

  const homeCardProps = (id: HomeCardId) => ({
    "data-home-card-id": id,
    style: undefined,
    onPointerDown: (event: PointerEvent<HTMLElement>) => startHomeCardHold(id, event),
    onPointerMove: moveHomeCard,
    onPointerUp: finishHomeCardPointer,
    onPointerCancel: finishHomeCardPointer,
    onClickCapture: preventHomeNavigation,
    className: `home-sortable-card ${draggingHomeCard === id ? "home-feature-dragging" : ""}`,
  });

  const handleWeeklyWeighIn = () => {
    const valW = parseFloat(weeklyWeightInput);
    if (!isNaN(valW) && valW > 0) {
      saveBodyWeight(valW);
      setCheckInSuccessMsg("שקילה שבועית נשמרה בהצלחה!");
      setTimeout(() => setCheckInSuccessMsg(""), 3000);
    }
    setShowWeighInModal(false);
  };

  const openBodyProfile = () => {
    setBodyProfileDraft({
      height: userProfile?.height && userProfile.height > 0 ? String(userProfile.height) : "",
      weight: userProfile?.weight && userProfile.weight > 0 ? String(userProfile.weight) : "",
      age: userProfile?.age && userProfile.age > 0 ? String(userProfile.age) : "",
      workoutsPerWeek:
        userProfile?.workoutsPerWeek !== undefined ? String(userProfile.workoutsPerWeek) : "",
      gender: userProfile?.gender ?? "female",
    });
    setShowBodyProfileModal(true);
  };

  const saveBodyProfile = () => {
    const height = Number(bodyProfileDraft.height);
    const weight = Number(bodyProfileDraft.weight);
    const age = Number(bodyProfileDraft.age);
    const workoutsPerWeek = Number(bodyProfileDraft.workoutsPerWeek);
    if (
      !Number.isFinite(height) ||
      height <= 0 ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !Number.isFinite(age) ||
      age <= 0 ||
      !Number.isFinite(workoutsPerWeek) ||
      workoutsPerWeek < 0
    ) {
      setCheckInSuccessMsg("יש למלא גיל, גובה, משקל ומספר אימונים תקינים.");
      return;
    }
    saveUserProfile({
      ...userProfile,
      height,
      weight,
      age,
      workoutsPerWeek,
      gender: bodyProfileDraft.gender,
    });
    setCheckInSuccessMsg("נתוני הגוף נשמרו ומחשבון BMR עודכן.");
    setShowBodyProfileModal(false);
    setTimeout(() => setCheckInSuccessMsg(""), 3000);
  };

  // Weekly Activity calculation
  const startOfWeek = new Date(now);
  const dow = now.getDay();
  startOfWeek.setDate(now.getDate() - dow);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeek = history.filter((s) => new Date(s.date) >= startOfWeek);
  const volume = thisWeek.reduce(
    (sum, s) =>
      sum +
      s.entries.reduce(
        (v, e) => v + e.sets.filter((x) => x.done).reduce((a, b) => a + b.reps * b.weight, 0),
        0,
      ),
    0,
  );
  const totalDurationMin = Math.round(
    thisWeek.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 60,
  );

  // Consistency Score calculation (0-100%)
  const weeklyWorkoutTarget =
    userProfile?.workoutsPerWeek && userProfile.workoutsPerWeek > 0
      ? userProfile.workoutsPerWeek
      : undefined;
  const consistencyScore = weeklyWorkoutTarget
    ? Math.min(100, Math.round((thisWeek.length / weeklyWorkoutTarget) * 100))
    : undefined;

  // Nutrition Today
  const todayDateStr = todayKey();
  const showCalories = userProfile?.showCalories !== false;
  const nutritionToday = nutritionDays.find((d) => d.date === todayDateStr);
  const totalsToday = nutritionToday
    ? dayTotals(nutritionToday)
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const targetCals =
    typeof nutritionTargets.calories === "number" &&
    Number.isFinite(nutritionTargets.calories) &&
    nutritionTargets.calories > 0
      ? nutritionTargets.calories
      : undefined;
  const remainingCals =
    targetCals === undefined ? undefined : Math.max(0, targetCals - totalsToday.calories);
  const caloriePct =
    targetCals && targetCals > 0
      ? Math.min(100, Math.round((totalsToday.calories / targetCals) * 100))
      : undefined;

  const activeChallengeWorkoutIds = new Set(
    (challengeEnrollments ?? [])
      .filter((enrollment) => enrollment.active)
      .flatMap((enrollment) => enrollment.workoutIds),
  );
  const weeklyWorkouts = [
    ...workouts.filter((workout) => !activeChallengeWorkoutIds.has(workout.id)),
    ...workouts.filter((workout) => activeChallengeWorkoutIds.has(workout.id)),
  ];
  const scheduledWorkouts = weeklyWorkouts.slice(0, Math.min(weeklyWorkouts.length, 7)).map((workout, index) => {
    const defaultDate = weekDays[index]?.date ?? weekDays[weekDays.length - 1]?.date ?? todayDateStr;
    const scheduledDate = defaultDate;
    const session = getCurrentWeekWorkoutSession(history, workout.id, now);
    const plannedSets = workout.items.reduce((sum, item) => sum + Math.max(0, item.sets), 0);
    const completion = getWorkoutCompletion(session, plannedSets);
    let status: WeeklyWorkoutStatus = completion.status;
    if (!session && scheduledDate < todayDateStr) status = "missed";
    else if (!session) status = "scheduled";
    return { workout, scheduledDate, session, completion, status };
  });

  const todayScheduledWorkout = scheduledWorkouts.find(
    (item) => item.scheduledDate === todayDateStr,
  );
  const workoutReminderPayload = scheduledWorkouts
    .map(({ workout, scheduledDate }) => `${scheduledDate}:${workout.id}:${workout.name}`)
    .join("|");
  useEffect(() => {
    if (!authUser?.id || !reminderPreferences?.enabled) return;
    void import("@/lib/notification-service").then(({ scheduleWorkoutReminders }) =>
      scheduleWorkoutReminders(
        scheduledWorkouts.map(({ workout, scheduledDate }) => ({
          id: `${authUser.id}:${scheduledDate}:${workout.id}`,
          date: scheduledDate,
          workoutName: workout.name,
        })),
      ),
    );
  }, [authUser?.id, reminderPreferences?.enabled, workoutReminderPayload]);
  const primaryWorkout = todayScheduledWorkout?.workout;
  const primaryIsBodyweightWorkout = Boolean(primaryWorkout?.name.includes("משקל גוף"));
  const selectedProgressExercise =
    exercises.find((exercise) => exercise.id === progressExerciseId) ??
    exercises.find((exercise) => exercise.id === primaryWorkout?.items[0]?.exerciseId);
  const progressCutoff = new Date(now);
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

  const [dismissedMessageIds, setDismissedMessageIds] = useState<string[]>([]);
  useEffect(() => {
    if (!authUser?.id) return;
    const key = `myroutine-dismissed-broadcasts:${authUser.id}`;
    try {
      const stored = JSON.parse(window.localStorage.getItem(key) || "[]");
      setDismissedMessageIds((current) => Array.from(new Set([...stored, ...current])));
    } catch {
      setDismissedMessageIds([]);
    }
  }, [authUser?.id]);
  const latestCoachMsg = getLatestVisibleCoachMessage(coachMessages, dismissedMessageIds);
  const latestBroadcast =
    broadcasts?.find((message) => !dismissedMessageIds.includes(message.id)) ?? null;
  const dismissMessage = async (id: string, isBroadcast: boolean) => {
    if (!isBroadcast && authUser?.id) {
      const { error } = await supabase
        .from("coach_messages")
        .delete()
        .eq("id", id)
        .eq("client_id", authUser.id);
      if (error) return;
    }
    const next = [...dismissedMessageIds, id];
    setDismissedMessageIds(next);
    if (authUser?.id) {
      window.localStorage.setItem(
        `myroutine-dismissed-broadcasts:${authUser.id}`,
        JSON.stringify(next),
      );
    }
  };
  const latestMeasurement = bodyMeasurements?.[0];
  const gender = userProfile?.gender;
  const greetingName = userProfile?.fullName?.trim().split(/\s+/)[0] || "";

  const handleChecklistSubmit = () => {
    if (!checklistInput.trim()) return;
    addChecklistItem(checklistInput);
    setChecklistInput("");
  };

  const startWorkout = (workoutId: string) => {
    void navigate({ to: "/session/$workoutId", params: { workoutId } });
  };

  return (
    <AppShell
      title={greetingName ? `בוקר טוב, ${greetingName}.` : "היום שלי"}
      subtitle="היום שלך לא צריך יותר מקצב אחד טוב להתחיל ממנו."
      kicker={formatNumericDate(now)}
      pageClassName="dashboard-editorial-shell"
      headerAccessory={
        <button
          type="button"
          onClick={() => setShowChecklistModal(true)}
          aria-label="פתיחת צ׳קליסט לאימון"
          title="צ׳קליסט לאימון"
          className="bodyweight-header-toggle press inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-1 text-[9px] font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          צ׳קליסט
        </button>
      }
    >
      <div className="home-card-stack">
        {/* Coach Message Banner */}
        {latestCoachMsg && (
          <div
            {...homeCardProps("coach-message")}
            data-testid="coach-message-banner"
            className="dashboard-notice surface-card space-y-1.5 border-primary/20 bg-primary/5 p-4 text-start"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-xs text-primary">
                <MessageSquare className="h-4 w-4" /> הודעה מהמאמן שלך
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(latestCoachMsg.createdAt).toLocaleDateString("he-IL")}
                </span>
                <button
                  type="button"
                  onClick={() => void dismissMessage(latestCoachMsg.id, false)}
                  aria-label="מחיקת הודעת המאמן"
                  className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-rose-100 hover:text-rose-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold text-ink leading-relaxed">
              "{latestCoachMsg.message}"
            </p>
          </div>
        )}

        {latestBroadcast && (
          <div
            {...homeCardProps("coach-message")}
            data-testid="broadcast-message-banner"
            className="dashboard-notice surface-card space-y-1.5 border-accent/40 bg-accent/10 p-4 text-start"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <MessageSquare className="h-4 w-4 text-primary" /> הודעה חשובה
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(latestBroadcast.createdAt).toLocaleDateString("he-IL")}
                </span>
                <button
                  type="button"
                  onClick={() => void dismissMessage(latestBroadcast.id, true)}
                  aria-label="הסתרת הודעת תפוצה"
                  className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-rose-100 hover:text-rose-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-ink">
              "{latestBroadcast.message}"
            </p>
          </div>
        )}

        {/* Consistency Banner */}
        <div
          {...homeCardProps("consistency")}
          className="dashboard-support-card surface-card flex items-center justify-between gap-4 border-primary/20 bg-surface p-4 text-start"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <span>רצף אימונים שבועי</span>
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {weeklyWorkoutTarget
                ? `${thisWeek.length} מתוך ${weeklyWorkoutTarget} אימונים השבוע`
                : genderText(
                    gender,
                    `${thisWeek.length} אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות`,
                    `${thisWeek.length} אימונים השבוע · הוסף יעד שבועי כדי לראות עקביות`,
                  )}
            </p>
            <div
              className="consistency-linear-track progress-track mt-3"
              aria-label={
                consistencyScore === undefined
                  ? "מדד עקביות ללא יעד"
                  : `מדד עקביות ${consistencyScore}%`
              }
            >
              <div className="progress-fill" style={{ width: `${consistencyScore ?? 0}%` }} />
            </div>
          </div>
          <div className="shrink-0 text-start">
            <div className="consistency-ring" aria-hidden="true">
              <svg viewBox="0 0 44 44">
                <circle className="consistency-ring-track" cx="22" cy="22" r="18" />
                <circle
                  className="consistency-ring-value"
                  cx="22"
                  cy="22"
                  r="18"
                  style={{
                    strokeDasharray: 113.1,
                    strokeDashoffset:
                      consistencyScore === undefined
                        ? 113.1
                        : 113.1 - (113.1 * consistencyScore) / 100,
                  }}
                />
              </svg>
              <span>
                <strong>{consistencyScore === undefined ? "—" : consistencyScore}</strong>
                {consistencyScore === undefined ? null : <small>%</small>}
              </span>
            </div>
            <p className="mt-1 text-[10px] font-bold text-muted-foreground">עקביות</p>
          </div>
        </div>

        {/* 1. Daily workout + nutrition tiles */}
        <div className="home-feature-section mt-3">
          {isArrangingHome ? (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-bold text-primary">
              <span>מצב סידור — גררי כרטיס כדי להחליף מיקום</span>
              <button
                type="button"
                onClick={() => {
                  setIsArrangingHome(false);
                  setDraggingHomeCard(null);
                }}
                className="rounded-lg bg-primary px-2.5 py-1 text-primary-foreground"
              >
                סיום
              </button>
            </div>
          ) : null}
          <div className="home-feature-grid grid grid-cols-2 gap-2">
            {primaryWorkout ? (
              <div
                className={`home-feature-item home-primary-card ${primaryIsBodyweightWorkout ? "home-bodyweight-tile" : ""} ${draggingHomeCard === "workout" ? "home-feature-dragging" : ""}`}
                data-home-card-id="workout"
                style={{ order: homeCardOrder.indexOf("workout") }}
                onPointerDown={(event) => startHomeCardHold("workout", event)}
                onPointerMove={moveHomeCard}
                onPointerUp={finishHomeCardPointer}
                onPointerCancel={finishHomeCardPointer}
              >
                <div className="ink-card flex min-h-0 flex-col p-2.5 text-start">
                  <div className="flex items-center justify-between gap-1">
                    <span className="min-w-0 break-words text-[10px] font-bold leading-[1.25] text-primary-foreground/80">
                      אימון יומי
                    </span>
                    <Dumbbell className="h-4 w-4 text-primary-foreground/80" />
                  </div>
                  <h2 className="mt-2 break-words font-display text-[17px] font-bold leading-tight text-primary-foreground">
                    {primaryWorkout.name}
                  </h2>
                  <p className="mt-1 text-[10px] text-primary-foreground/75">
                    {weekDays.find((day) => day.date === todayDateStr)?.label ?? "היום"} ·{" "}
                    {primaryWorkout.items.length} תרגילים · כ־{primaryWorkout.items.length * 12 + 15} דק׳
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      if (suppressHomeClick.current) {
                        preventHomeNavigation(event);
                        return;
                      }
                      navigate({
                        to: "/session/$workoutId",
                        params: { workoutId: primaryWorkout.id },
                      });
                    }}
                     className="press mt-auto inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-xl bg-background px-2 text-[11px] font-bold text-ink shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current text-primary" />
                    {todayScheduledWorkout?.status === "partial" ? "המשך אימון" : "התחלת אימון"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`home-feature-item home-primary-card ${draggingHomeCard === "workout" ? "home-feature-dragging" : ""}`}
                data-home-card-id="workout"
                style={{ order: homeCardOrder.indexOf("workout") }}
                onPointerDown={(event) => startHomeCardHold("workout", event)}
                onPointerMove={moveHomeCard}
                onPointerUp={finishHomeCardPointer}
                onPointerCancel={finishHomeCardPointer}
              >
                <Card className="flex min-h-0 flex-col p-2.5 text-start">
                   <p className="font-display text-sm font-bold text-ink">אין אימון להיום</p>
                   <p className="mt-1 text-[11px] text-muted-foreground">
                     האימונים שלך מחכים במסך האימונים.
                   </p>
                  <Link
                    to="/programs"
                    className="press mt-auto inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-primary px-2 text-[11px] font-bold text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> יצירת תכנית
                  </Link>
                </Card>
              </div>
            )}

            <Link
              to="/nutrition"
              data-home-card-id="nutrition"
              onPointerDown={(event) => startHomeCardHold("nutrition", event)}
              onPointerMove={moveHomeCard}
              onPointerUp={finishHomeCardPointer}
              onPointerCancel={finishHomeCardPointer}
              onClick={preventHomeNavigation}
              style={{ order: homeCardOrder.indexOf("nutrition") }}
              className={`home-feature-item home-secondary-card home-calorie-card surface-card flex min-h-0 flex-col p-2.5 text-start transition-colors ${
                draggingHomeCard === "nutrition" ? "home-feature-dragging" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="min-w-0 break-words text-[10px] font-bold leading-[1.25] text-primary">
                  תזונה יומית
                </span>
                <Apple className="h-4 w-4 text-primary" />
              </div>
              {showCalories ? (
                <>
                  <p className="mt-2 font-display text-2xl font-extrabold leading-none text-ink">
                    {totalsToday.calories}
                    <span className="ms-1 text-[10px] font-bold text-primary/75">קק״ל</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {targetCals === undefined
                      ? "יעד קלוריות עדיין לא הוגדר"
                      : `מתוך ${targetCals} · ${Math.max(0, targetCals - totalsToday.calories)} נשארו`}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
                  ערכי קלוריות מוסתרים לפי הגדרת הפרופיל
                </p>
              )}
              <div className="mt-auto flex items-center justify-between rounded-xl bg-background/80 px-2 py-1.5 text-[10px] font-bold text-ink">
                <span>{Math.round(totalsToday.protein)} גרם חלבון</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Check-In Success Banner */}
        {checkInSuccessMsg && (
          <div
            {...homeCardProps("checklist")}
            className="surface-card mt-3 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 text-start text-xs font-bold text-primary"
          >
            <CheckCircle2 className="me-1 inline-block h-4 w-4 align-[-3px]" aria-hidden="true" />
            {checkInSuccessMsg}
          </div>
        )}

        {/* Weekly Activity Overview */}
        <section {...homeCardProps("activity")} className="dashboard-module dashboard-module--activity mt-5">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader title="פעילות השבוע" subtitle={`${thisWeek.length} אימונים בוצעו השבוע`} />
            <button
              type="button"
              onClick={() => setShowProgressModal(true)}
              className="press inline-flex shrink-0 items-center gap-1 rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-2 text-[10px] font-bold text-primary"
              aria-label="פתיחת מגמות והיסטוריית תרגיל"
            >
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              מגמות
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <StatTile label="אימונים" value={String(thisWeek.length)} icon={Flame} tone="rose" />
            <StatTile
              label="נפח ק״ג"
              value={volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : String(Math.round(volume))}
              icon={TrendingUp}
              tone="sage"
            />
            <StatTile
              label="זמן אימון"
              value={`${totalDurationMin}m`}
              icon={Dumbbell}
              tone="cream"
            />
          </div>
        </section>

        {/* Weekly Weigh-In & Monthly Check-In Cards */}
        <section {...homeCardProps("check-in")} className="dashboard-module dashboard-module--check-in mt-5 text-start space-y-2.5">
          <SectionHeader title="מעקב משקל וצ'ק-אין חודשי" subtitle="דיווח למאמן" />
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setShowWeighInModal(true)}
              className="surface-card cursor-pointer space-y-1 border-primary/20 bg-primary/5 p-3.5 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                <Scale className="h-4 w-4" />
                <span>שקילה שבועית</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                {genderText(gender, "עדכון משקל בוקר", "עדכון משקל בוקר")}:{" "}
                <strong className="text-ink">
                  {userProfile?.weight && userProfile.weight > 0
                    ? `${userProfile.weight} ק"ג`
                    : "לא הוזן"}
                </strong>
              </p>
            </div>

            <div className="surface-card space-y-1 border-accent/60 bg-accent/25 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent-foreground">
                <Award className="h-4 w-4 text-accent-foreground" />
                <span>צ'ק-אין חודשי</span>
              </div>
              <p className="pt-0.5 text-[11px] text-accent-foreground">
                {genderText(
                  gender,
                  "היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמנת או הבעלים",
                  "היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמן או הבעלים",
                )}
              </p>
            </div>
          </div>
        </section>

        {latestMeasurement ? (
          <section {...homeCardProps("measurements")} className="dashboard-module dashboard-module--measurements mt-5 text-start">
            <SectionHeader
              title="המדידות החודשיות שלי"
              subtitle={genderText(
                gender,
                "תצוגה בלבד — מתעדכנות על ידי המאמנת או הבעלים",
                "תצוגה בלבד — מתעדכנים על ידי המאמן או הבעלים",
              )}
            />
            <div className="grid grid-cols-3 gap-2.5">
              {[
                ["מותניים", latestMeasurement.waistCm, "ס״מ"],
                ["אחוז שומן", latestMeasurement.bodyFatPct, "%"],
                ["מסת שריר", latestMeasurement.muscleMassKg, "ק״ג"],
              ].map(([label, value, unit]) => (
                <div key={label} className="surface-card p-3 text-center">
                  <span className="block text-[10px] font-semibold text-muted-foreground">
                    {label}
                  </span>
                  <strong className="mt-1 block text-sm text-ink">
                    {value !== undefined ? `${value} ${unit}` : "לא נמדד"}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

      </div>
      {showChecklistModal ? (
        <Overlay
          open={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
          ariaLabel="צ׳קליסט לאימון"
        >
          <div
            className="w-full max-w-sm space-y-3 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">
                  צ׳קליסט לפני יציאה מהבית
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {genderText(
                    gender,
                    "הוסיפי דברים שחשוב לזכור לפני שיוצאים לאימון.",
                    "הוסף דברים שחשוב לזכור לפני שיוצאים לאימון.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="press rounded-xl p-2 text-muted-foreground hover:bg-secondary"
                aria-label="סגירת הצ׳קליסט"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="flex gap-1.5"
              onSubmit={(event) => {
                event.preventDefault();
                handleChecklistSubmit();
              }}
            >
              <input
                value={checklistInput}
                onChange={(event) => setChecklistInput(event.target.value)}
                placeholder="למשל: בקבוק מים"
                aria-label="פריט חדש בצ׳ק-ליסט"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="submit"
                disabled={!checklistInput.trim()}
                className="press rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                הוספה
              </button>
            </form>
            <div className="space-y-1.5">
              {(preExitChecklist ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex min-h-12 items-center gap-2 rounded-xl bg-secondary/60 px-2.5 py-1.5 touch-manipulation"
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    aria-label={item.done ? `בטלי סימון של ${item.label}` : `סמני את ${item.label}`}
                    className={`press grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 transition-colors ${
                      item.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`min-h-9 min-w-0 flex-1 text-start text-[13px] ${
                      item.done ? "text-muted-foreground line-through" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
              {(preExitChecklist ?? []).length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                  {genderText(
                    gender,
                    "עדיין אין פריטים. הוסיפי את הדבר הראשון שחשוב לזכור.",
                    "עדיין אין פריטים. הוסף את הדבר הראשון שחשוב לזכור.",
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </Overlay>
      ) : null}

      {showProgressModal ? (
        <Overlay
          open={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          ariaLabel="מגמות והיסטוריית תרגיל"
        >
          <div
            className="w-full max-w-lg space-y-4 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">Progress</p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-ink">מגמות והיסטוריית תרגיל</h2>
                <p className="mt-1 text-xs text-muted-foreground">נתונים מהביצועים שנשמרו, בלי להסיק מסקנות רפואיות.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="press grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
                aria-label="סגירת מגמות"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="block text-xs font-bold text-muted-foreground">
              תרגיל
              <span className="relative mt-1 block">
                <select
                  value={selectedProgressExercise?.id ?? ""}
                  onChange={(event) => setProgressExerciseId(event.target.value)}
                  aria-label="בחירת תרגיל למגמה"
                  className="w-full appearance-none rounded-xl border border-border bg-background p-3 pe-9 text-sm font-bold text-ink outline-none focus:border-primary"
                >
                  {exercises.map((exercise) => (
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
                          <span className="font-bold text-ink">{formatDayDate(point.date.slice(0, 10))}</span>
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
                  {primaryWorkout ? (
                    <button
                      type="button"
                      onClick={() => startWorkout(primaryWorkout.id)}
                      className="press mt-3 inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      לאימון הבא
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </Overlay>
      ) : null}

      {/* Modal: Weekly Weigh-In */}
      {showBodyProfileModal && (
        <Overlay
          open={showBodyProfileModal}
          onClose={() => setShowBodyProfileModal(false)}
          ariaLabel="נתוני גוף ומחשבון BMR"
        >
          <div
            className="w-full max-w-sm space-y-3 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-bold text-base text-ink">נתוני גוף ומחשבון BMR</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  הנתונים נשמרים בפרופיל האישי ומשמשים לחישוב.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBodyProfileModal(false)}
                aria-label="סגור נתוני גוף"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["height", "גובה (ס״מ)", "numeric"],
                ["weight", "משקל (ק״ג)", "decimal"],
                ["age", "גיל", "numeric"],
                ["workoutsPerWeek", "אימונים בשבוע", "numeric"],
              ].map(([field, label, inputMode]) => (
                <label key={field} className="block font-bold text-muted-foreground">
                  {label}
                  <input
                    inputMode={inputMode as "numeric" | "decimal"}
                    value={bodyProfileDraft[field as keyof typeof bodyProfileDraft] as string}
                    onChange={(event) =>
                      setBodyProfileDraft((current) => ({
                        ...current,
                        [field as keyof typeof bodyProfileDraft]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm font-bold text-ink outline-none focus:border-primary"
                  />
                </label>
              ))}
              <label className="block font-bold text-muted-foreground">
                מין לחישוב
                <select
                  value={bodyProfileDraft.gender}
                  onChange={(event) =>
                    setBodyProfileDraft((current) => ({
                      ...current,
                      gender: event.target.value as "female" | "male",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-sm font-bold text-ink outline-none focus:border-primary"
                >
                  <option value="female">נקבה</option>
                  <option value="male">זכר</option>
                </select>
              </label>
            </div>
            <PrimaryButton className="w-full" onClick={saveBodyProfile}>
              שמירת נתונים וחישוב BMR
            </PrimaryButton>
          </div>
        </Overlay>
      )}

      {showWeighInModal && (
        <Overlay
          open={showWeighInModal}
          onClose={() => setShowWeighInModal(false)}
          ariaLabel="שקילה שבועית"
        >
          <div
            className="w-full max-w-sm space-y-3 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> שקילה שבועית בבוקר
              </h3>
              <button
                onClick={() => setShowWeighInModal(false)}
                aria-label="סגירת שקילה שבועית"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-muted-foreground">משקל נוכחי (ק"ג)</label>
              <FreeTextInput
                step={0.1}
                value={weeklyWeightInput}
                onChange={(e) => setWeeklyWeightInput(e.target.value)}
                className="w-full rounded-xl border border-border p-2.5 text-sm font-bold text-ink outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={handleWeeklyWeighIn}
              className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              שמור שקילה שבועית
            </button>
          </div>
        </Overlay>
      )}

    </AppShell>
  );
}
