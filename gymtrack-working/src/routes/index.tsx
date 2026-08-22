import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  ArrowLeft,
  ChevronLeft,
  Dumbbell,
  Flame,
  Flame as FireIcon,
  Footprints,
  Play,
  Plus,
  Scale,
  TrendingUp,
  Utensils,
  Droplets,
  Award,
  MessageSquare,
  CheckCircle2,
  Circle,
  Sparkles,
  Heart,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  Card,
  IconButton,
  PrimaryButton,
  SectionHeader,
  StatTile,
} from "@/components/ui-app/primitives";
import {
  calculateCardioCalories,
  calculateRmr,
  dayTotals,
  saveBodyWeight,
  saveCardioLog,
  todayKey,
  updateCardioLog,
  deleteCardioLog,
  useGym,
} from "@/lib/gym-store";
import type { CardioLog } from "@/lib/gym-types";
import { CARDIO_TYPES } from "@/lib/gym-types";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "לוח בקרה — My Routine" },
      { name: "description", content: "מעקב אימונים, משקל גוף ותזונה יומית." },
      { property: "og:title", content: "לוח בקרה — My Routine" },
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

function cardioFieldVisibility(type: string) {
  const isTreadmill = type.includes("הליכון") || type.includes("Treadmill");
  const isRunning = type.includes("ריצה");
  const isBike = type.includes("אופניים");
  const isRowing = type.includes("חתירה");
  const isSwimming = type.includes("שחייה");
  return {
    speed: isTreadmill || isRunning || isBike,
    incline: isTreadmill,
    distance: isTreadmill || isRunning || isBike || isRowing || isSwimming || type.includes("טיול"),
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const {
    workouts,
    exercises,
    history,
    programs,
    nutritionDays,
    userProfile,
    bodyMeasurements,
    cardioLogs,
    coachMessages,
  } = useGym();

  const now = new Date();

  // Routine Checklist, Weekly Weigh-In, and Monthly Check-In
  const [routineChecklist, setRoutineChecklist] = useState<Record<string, boolean>>({
    workout: false,
    weighIn: false,
  });

  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [weeklyWeightInput, setWeeklyWeightInput] = useState(String(userProfile?.weight ?? 65));
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState("");
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [editingCardioId, setEditingCardioId] = useState<string | null>(null);
  const [cardioType, setCardioType] = useState(CARDIO_TYPES[0]);
  const [cardioDuration, setCardioDuration] = useState("0");
  const [cardioSpeed, setCardioSpeed] = useState("0");
  const [cardioIncline, setCardioIncline] = useState("0");
  const [cardioDistance, setCardioDistance] = useState("0");
  const [cardioError, setCardioError] = useState("");

  const handleWeeklyWeighIn = () => {
    const valW = parseFloat(weeklyWeightInput);
    if (!isNaN(valW) && valW > 0) {
      saveBodyWeight(valW);
      setCheckInSuccessMsg("שקילה שבועית נשמרה בהצלחה!");
      setTimeout(() => setCheckInSuccessMsg(""), 3000);
    }
    setShowWeighInModal(false);
  };

  // Weekly Activity calculation
  const startOfWeek = new Date(now);
  const dow = (now.getDay() + 6) % 7;
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
  const consistencyScore = Math.min(
    100,
    Math.round((thisWeek.length / (userProfile?.workoutsPerWeek || 4)) * 100),
  );

  // Nutrition Today
  const todayDateStr = todayKey();
  const nutritionToday = nutritionDays.find((d) => d.date === todayDateStr);
  const totalsToday = nutritionToday
    ? dayTotals(nutritionToday)
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const targetCals = 2000;
  const remainingCals = Math.max(0, targetCals - totalsToday.calories);

  const nextWorkout = workouts[0];
  const nextProgram = nextWorkout
    ? programs.find((p) => p.dayIds.includes(nextWorkout.id))
    : undefined;

  const toggleChecklistItem = (key: string) => {
    setRoutineChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const latestCoachMsg = coachMessages && coachMessages.length > 0 ? coachMessages[0] : null;
  const latestMeasurement = bodyMeasurements?.[0];
  const gender = userProfile?.gender;
  const cardioDurationValue = Number(cardioDuration) || 0;
  const cardioSpeedValue = Number(cardioSpeed) || 0;
  const cardioInclineValue = Number(cardioIncline) || 0;
  const cardioFields = cardioFieldVisibility(cardioType);
  const cardioCalories = calculateCardioCalories(
    cardioType,
    cardioDurationValue,
    userProfile?.weight ?? 65,
    cardioSpeedValue,
    cardioInclineValue,
  );
  const cardioThisWeek = (cardioLogs ?? []).filter((entry) => new Date(entry.date) >= startOfWeek);
  const weeklyCardioMinutes = cardioThisWeek.reduce((sum, entry) => sum + entry.durationMin, 0);
  const weeklyCardioCalories = cardioThisWeek.reduce((sum, entry) => sum + entry.calories, 0);

  const resetCardioForm = () => {
    setEditingCardioId(null);
    setCardioType(CARDIO_TYPES[0]);
    setCardioDuration("0");
    setCardioSpeed("0");
    setCardioIncline("0");
    setCardioDistance("0");
    setCardioError("");
  };

  const openCardioForm = (entry?: CardioLog) => {
    if (entry) {
      setEditingCardioId(entry.id);
      setCardioType(entry.type);
      setCardioDuration(String(entry.durationMin));
      setCardioSpeed(entry.speed !== undefined ? String(entry.speed) : "0");
      setCardioIncline(entry.incline !== undefined ? String(entry.incline) : "0");
      setCardioDistance(entry.distanceKm !== undefined ? String(entry.distanceKm) : "0");
      setCardioError("");
    } else {
      resetCardioForm();
    }
    setShowCardioModal(true);
  };

  const handleCardioSave = () => {
    if (!cardioType || cardioDurationValue <= 0) {
      setCardioError(genderText(gender, "בחרי פעילות ומשך זמן גדול מאפס.", "בחר פעילות ומשך זמן גדול מאפס."));
      return;
    }

    const log = {
      date: todayKey(),
      type: cardioType,
      durationMin: cardioDurationValue,
      ...(cardioSpeedValue > 0 ? { speed: cardioSpeedValue } : {}),
      ...(cardioInclineValue > 0 ? { incline: cardioInclineValue } : {}),
      ...(Number(cardioDistance) > 0 ? { distanceKm: Number(cardioDistance) } : {}),
      calories: cardioCalories,
    };

    if (editingCardioId) updateCardioLog({ id: editingCardioId, ...log });
    else saveCardioLog(log);

    setCheckInSuccessMsg(
                editingCardioId
                  ? genderText(gender, "אימון האירובי עודכן במכשיר זה.", "אימון האירובי עודכן במכשיר זה.")
                  : genderText(gender, "אימון אירובי נשמר במכשיר זה.", "אימון אירובי נשמר במכשיר זה."),
    );
    setTimeout(() => setCheckInSuccessMsg(""), 3000);
    setShowCardioModal(false);
    resetCardioForm();
  };

  return (
    <AppShell title={formatNumericDate(now)} subtitle="">
      {/* Coach Message Banner */}
      {latestCoachMsg && (
        <div className="surface-card space-y-1.5 border-primary/20 bg-primary/5 p-4 text-start">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-xs text-primary">
              <MessageSquare className="h-4 w-4" /> הודעה מהמאמן שלך
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(latestCoachMsg.createdAt).toLocaleDateString("he-IL")}
            </span>
          </div>
          <p className="text-xs font-semibold text-ink leading-relaxed">
            "{latestCoachMsg.message}"
          </p>
        </div>
      )}

      {/* Consistency Banner */}
      <div className="surface-card flex items-center justify-between gap-4 border-primary/20 bg-surface p-4 text-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <span>רצף אימונים שבועי</span>
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {thisWeek.length} מתוך {userProfile?.workoutsPerWeek || 4} אימונים השבוע
          </p>
          <div className="progress-track mt-3" aria-label={`מדד עקביות ${consistencyScore}%`}>
            <div className="progress-fill" style={{ width: `${consistencyScore}%` }} />
          </div>
        </div>
        <div className="shrink-0 text-start">
          <p className="font-display text-3xl font-extrabold leading-none tabular-nums text-primary">
            {consistencyScore}%
          </p>
          <p className="mt-1 text-[10px] font-bold text-muted-foreground">עקביות</p>
        </div>
      </div>

      {/* 1. Next / Today's Workout Focus Card */}
      {nextWorkout ? (
        <div className="ink-card p-5 text-start mt-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-bold text-primary-foreground">
              האימון הבא
            </span>
            <span className="text-[12px] text-primary-foreground/80 font-medium">
              ~{nextWorkout.items.length * 12 + 15} דקות
            </span>
          </div>
          <h2 className="mt-2 font-display text-[22px] font-bold leading-tight text-primary-foreground">
            {nextWorkout.name}
          </h2>
          <p className="mt-0.5 text-[13px] text-primary-foreground/80">
            {nextProgram?.name ?? "תכנית אימונים"} · {nextWorkout.items.length} תרגילים
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/session/$workoutId",
                  params: { workoutId: nextWorkout.id },
                })
              }
              className="press inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-background px-4 text-[14px] font-bold text-ink shadow-sm"
            >
              <Play className="h-4 w-4 fill-current text-primary" />
              התחל אימון עכשיו
            </button>
            <Link
              to="/programs/$programId/$dayId"
              params={{
                programId: nextProgram?.id ?? "p-default",
                dayId: nextWorkout.id,
              }}
              className="press grid h-11 w-11 cursor-pointer place-items-center rounded-xl bg-primary-foreground/15 text-primary-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      ) : (
        <Card className="text-start mt-4">
          <p className="font-display text-[16px] font-bold text-ink">אין תכניות אימון עדיין</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {genderText(
              gender,
              "צרי תכנית אימונים ראשונה כדי להתחיל להתאמן בחדר כושר.",
              "צור תכנית אימונים ראשונה כדי להתחיל להתאמן בחדר כושר.",
            )}
          </p>
          <Link
            to="/programs"
            className="press mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-bold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> {genderText(gender, "צרי תכנית", "צור תכנית")}
          </Link>
        </Card>
      )}

      {/* Check-In Success Banner */}
      {checkInSuccessMsg && (
        <div className="surface-card p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-start font-bold text-xs mt-3">
          <CheckCircle2 className="me-1 inline-block h-4 w-4 align-[-3px]" aria-hidden="true" />
          {checkInSuccessMsg}
        </div>
      )}

      {/* 2. Today's Routine Checklist */}
      <section className="mt-5 text-start">
        <SectionHeader title="הרוטינה של היום" subtitle="משימות יומיות לשמירה על רצף" />
        <div className="space-y-2">
          {[
            { key: "workout", label: `אימון יומיומי: ${nextWorkout?.name || "מנוחה"}` },
            {
              key: "weighIn",
              label: `שקילה שבועית (משקל נוכחי: ${userProfile?.weight ?? 65} ק"ג)`,
            },
          ].map(({ key, label }) => {
            const isDone = routineChecklist[key] || false;

            return (
              <div
                key={key}
                onClick={() => {
                  if (key === "weighIn") {
                    setShowWeighInModal(true);
                  } else {
                    toggleChecklistItem(key);
                  }
                }}
                className={`surface-card p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-200 line-through opacity-70"
                    : "bg-surface border-border/60 font-bold"
                }`}
              >
                <span>{label}</span>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly Weigh-In & Monthly Check-In Cards */}
      <section className="mt-5 text-start space-y-2.5">
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
              <strong className="text-ink">{userProfile?.weight ?? 65} ק"ג</strong>
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

      {/* 4. Weekly Activity Overview */}
      <section className="mt-5">
        <SectionHeader title="פעילות השבוע" subtitle={`${thisWeek.length} אימונים בוצעו השבוע`} />
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label="אימונים" value={String(thisWeek.length)} icon={Flame} tone="rose" />
          <StatTile
            label="נפח ק״ג"
            value={volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : String(Math.round(volume))}
            icon={TrendingUp}
            tone="sage"
          />
          <StatTile label="זמן אימון" value={`${totalDurationMin}m`} icon={Dumbbell} tone="cream" />
        </div>
      </section>

      {latestMeasurement ? (
        <section className="mt-5 text-start">
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

      {/* Cardio */}
      <section className="mt-5 text-start">
        <SectionHeader
          title="אימון אירובי"
          subtitle={
            weeklyCardioMinutes
              ? `${weeklyCardioMinutes} דקות השבוע · כ-${weeklyCardioCalories} קל׳`
              : "תיעוד אישי עם אומדן קלוריות"
          }
          action={
            <button
              type="button"
              onClick={() => openCardioForm()}
              className="press inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> הוספה
            </button>
          }
        />
        <div className="surface-card overflow-hidden rounded-3xl border border-border/60">
          {(cardioLogs ?? []).length ? (
            <div className="divide-y divide-border/60">
              {(cardioLogs ?? []).slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Footprints className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{entry.type}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {entry.durationMin} דקות · כ-{entry.calories} קל׳ ·{" "}
                      {new Date(entry.date).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCardioForm(entry)}
                    aria-label={`עריכת ${entry.type}`}
                    className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteCardioLog(entry.id);
                      setCheckInSuccessMsg("אימון האירובי נמחק מהמכשיר הזה.");
                      setTimeout(() => setCheckInSuccessMsg(""), 3000);
                    }}
                    aria-label={`מחיקת ${entry.type}`}
                    className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-[13px] font-bold text-ink">עדיין לא תיעדת אירובי</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {genderText(
                  gender,
                  "הוסיפי הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך ואומדן קלוריות.",
                  "הוסף הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך ואומדן קלוריות.",
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Nutrition Summary Today */}
      <section className="mt-5">
        <SectionHeader
          title="תזונה להיום"
          subtitle={`נותרו עוד ${remainingCals} קלוריות`}
          action={
            <Link
              to="/nutrition"
              className="press rounded-full bg-secondary px-3 py-1.5 text-[12px] font-bold text-primary"
            >
              פתחי יומן
            </Link>
          }
        />
        <div className="rose-card p-4 text-start">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-primary uppercase">
                קלוריות שנצרכו
              </p>
              <p className="mt-0.5 font-display text-[28px] font-bold tabular-nums text-ink">
                {Math.round(totalsToday.calories)}{" "}
                <span className="text-[14px] font-normal text-muted-foreground">
                  / {targetCals}
                </span>
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface/80 text-primary">
              <Utensils className="h-5 w-5" />
            </div>
          </div>

          <div
            className="progress-track mt-3 bg-primary/15"
            aria-label={`צריכת קלוריות ${Math.round((totalsToday.calories / targetCals) * 100)}%`}
          >
            <div
              className="progress-fill bg-primary"
              style={{ width: `${Math.min(100, (totalsToday.calories / targetCals) * 100)}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface/80 p-2.5 text-start">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">חלבון</p>
              <p className="font-display text-[15px] font-bold tabular-nums text-ink">
                {Math.round(totalsToday.protein)}g
              </p>
            </div>
            <div className="rounded-xl bg-surface/80 p-2.5 text-start">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">פחמימות</p>
              <p className="font-display text-[15px] font-bold tabular-nums text-ink">
                {Math.round(totalsToday.carbs)}g
              </p>
            </div>
            <div className="rounded-xl bg-surface/80 p-2.5 text-start">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">שומן</p>
              <p className="font-display text-[15px] font-bold tabular-nums text-ink">
                {Math.round(totalsToday.fat)}g
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Weekly Weigh-In */}
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
              <input
                type="number"
                step="0.1"
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

      {showCardioModal && (
        <Overlay
          open={showCardioModal}
          onClose={() => {
            setShowCardioModal(false);
            resetCardioForm();
          }}
          ariaLabel={editingCardioId ? "עריכת אימון אירובי" : "הוספת אימון אירובי"}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <Footprints className="h-5 w-5 text-primary" />
                  {editingCardioId ? "עריכת אימון אירובי" : "הוספת אימון אירובי"}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  הקלוריות הן אומדן לפי סוג הפעילות, הזמן, המהירות והשיפוע כשיש כאלה.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCardioModal(false);
                  resetCardioForm();
                }}
                aria-label="סגור אימון אירובי"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 text-xs">
              <label className="grid gap-1.5 font-bold text-muted-foreground">
                פעילות
                <select
                  value={cardioType}
                  onChange={(event) => setCardioType(event.target.value)}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-ink outline-none focus:border-primary"
                >
                  {CARDIO_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 font-bold text-muted-foreground">
                  משך בדקות
                  <input
                    type="number"
                    min="1"
                    value={cardioDuration}
                    onChange={(event) => setCardioDuration(event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-ink outline-none focus:border-primary"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cardioFields.speed ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    מהירות קמ״ש
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={cardioSpeed}
                      onChange={(event) => setCardioSpeed(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
                {cardioFields.incline ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    שיפוע %
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={cardioIncline}
                      onChange={(event) => setCardioIncline(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
                {cardioFields.distance ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    מרחק ק״מ
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={cardioDistance}
                      onChange={(event) => setCardioDistance(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/10 px-3.5 py-3 text-center">
              <p className="text-[11px] font-semibold text-muted-foreground">שריפה משוערת</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-primary">
                כ-{cardioCalories} קלוריות
              </p>
            </div>
            {cardioError ? (
              <p className="text-xs font-semibold text-rose-700">{cardioError}</p>
            ) : null}
            <button
              type="button"
              onClick={handleCardioSave}
              className="h-11 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              {editingCardioId ? "שמור שינויים" : "שמור אימון אירובי"}
            </button>
          </div>
        </Overlay>
      )}
    </AppShell>
  );
}
