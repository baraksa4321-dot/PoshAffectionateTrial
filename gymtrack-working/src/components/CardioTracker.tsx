import { Footprints, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Overlay } from "@/components/ui-app/Overlay";
import { FreeTextInput } from "@/components/FreeTextInput";
import {
  calculateCardioCalories,
  deleteCardioLog,
  saveCardioLog,
  todayKey,
  updateCardioLog,
  useGym,
} from "@/lib/gym-store";
import { CARDIO_TYPES, type CardioLog } from "@/lib/gym-types";
import { genderText } from "@/lib/gender-copy";

const DEFAULT_CARDIO_TYPE = CARDIO_TYPES[0] ?? "הליכה";

function cardioFieldVisibility(type: string) {
  const isTreadmill = type.includes("הליכון") || type.includes("Treadmill");
  const isRunning = type.includes("ריצה");
  const isBike = type.includes("אופניים");
  const isRowing = type.includes("חתירה");
  const isSwimming = type.includes("שחייה");
  return {
    speed: isTreadmill || isRunning || isBike,
    incline: isTreadmill,
    distance: isRunning || isBike || isRowing || type.includes("טיול"),
  };
}

export function CardioTracker() {
  const { cardioLogs, userProfile } = useGym();
  const gender = userProfile?.gender;
  const showCalories = userProfile?.showCalories !== false;
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [editingCardioId, setEditingCardioId] = useState<string | null>(null);
  const [cardioType, setCardioType] = useState(DEFAULT_CARDIO_TYPE);
  const [cardioDuration, setCardioDuration] = useState("");
  const [cardioSpeed, setCardioSpeed] = useState("");
  const [cardioIncline, setCardioIncline] = useState("");
  const [cardioDistance, setCardioDistance] = useState("");
  const [cardioError, setCardioError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7;
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const cardioDurationValue = Number(cardioDuration) || 0;
  const cardioSpeedValue = Number(cardioSpeed) || 0;
  const cardioInclineValue = Number(cardioIncline) || 0;
  const cardioFields = cardioFieldVisibility(cardioType);
  const cardioCalories = calculateCardioCalories(
    cardioType,
    cardioDurationValue,
    userProfile?.weight ?? 0,
    cardioSpeedValue,
    cardioInclineValue,
  );
  const cardioThisWeek = (cardioLogs ?? []).filter(
    (entry) => new Date(entry.date) >= startOfWeek,
  );
  const weeklyCardioMinutes = cardioThisWeek.reduce((sum, entry) => sum + entry.durationMin, 0);
  const weeklyCardioCalories = cardioThisWeek.reduce((sum, entry) => sum + entry.calories, 0);

  const resetCardioForm = () => {
    setEditingCardioId(null);
    setCardioType(DEFAULT_CARDIO_TYPE);
    setCardioDuration("");
    setCardioSpeed("");
    setCardioIncline("");
    setCardioDistance("");
    setCardioError("");
  };

  const closeCardioForm = () => {
    setShowCardioModal(false);
    resetCardioForm();
  };

  const openCardioForm = (entry?: CardioLog) => {
    if (entry) {
      setEditingCardioId(entry.id);
      setCardioType(entry.type);
      setCardioDuration(String(entry.durationMin));
      setCardioSpeed(entry.speed !== undefined ? String(entry.speed) : "");
      setCardioIncline(entry.incline !== undefined ? String(entry.incline) : "");
      setCardioDistance(entry.distanceKm !== undefined ? String(entry.distanceKm) : "");
      setCardioError("");
    } else {
      resetCardioForm();
    }
    setShowCardioModal(true);
  };

  const handleCardioSave = () => {
    if (!cardioType || cardioDurationValue <= 0) {
      setCardioError(
        genderText(gender, "בחרי פעילות ומשך זמן גדול מאפס.", "בחר פעילות ומשך זמן גדול מאפס."),
      );
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

    setSuccessMessage(
      editingCardioId
        ? genderText(gender, "אימון האירובי עודכן.", "אימון האירובי עודכן.")
        : genderText(gender, "אימון אירובי נשמר.", "אימון אירובי נשמר."),
    );
    window.setTimeout(() => setSuccessMessage(""), 3000);
    closeCardioForm();
  };

  return (
    <section className="mt-6 text-start">
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-words font-display text-[clamp(15px,4.5vw,17px)] font-extrabold leading-snug tracking-tight text-ink">
            אירובי
          </h2>
          <p className="mt-1 break-words text-[clamp(11px,3.2vw,13px)] leading-snug text-muted-foreground">
            {weeklyCardioMinutes
              ? `${weeklyCardioMinutes} דקות השבוע${showCalories ? ` · כ-${weeklyCardioCalories} קל׳` : ""}`
              : showCalories
                ? "תיעוד אישי עם אומדן קלוריות"
                : "תיעוד אישי של משך הפעילות"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCardioForm()}
          className="press inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-bold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> הוספה
        </button>
      </div>

      {successMessage ? (
        <p className="mb-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-primary">
          {successMessage}
        </p>
      ) : null}

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
                    {entry.durationMin} דקות
                    {showCalories ? ` · כ-${entry.calories} קל׳ · ` : " · "}
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
                    setSuccessMessage("אימון האירובי נמחק.");
                    window.setTimeout(() => setSuccessMessage(""), 3000);
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
                showCalories
                  ? "הוסיפי הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך ואומדן קלוריות."
                  : "הוסיפי הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך הפעילות.",
                showCalories
                  ? "הוסף הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך ואומדן קלוריות."
                  : "הוסף הליכה, ריצה, אופניים או פעילות אחרת כדי לעקוב אחר משך הפעילות.",
              )}
            </p>
          </div>
        )}
      </div>

      {showCardioModal ? (
        <Overlay
          open={showCardioModal}
          onClose={closeCardioForm}
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
                {showCalories ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    הקלוריות הן אומדן לפי סוג הפעילות, הזמן, המהירות והשיפוע כשיש כאלה.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeCardioForm}
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
              <label className="grid gap-1.5 font-bold text-muted-foreground">
                משך בדקות
                <FreeTextInput
                  min="1"
                  value={cardioDuration}
                  onChange={(event) => setCardioDuration(event.target.value)}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-ink outline-none focus:border-primary"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cardioFields.speed ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    מהירות קמ״ש
                    <FreeTextInput
                      min="0"
                      step={0.1}
                      value={cardioSpeed}
                      onChange={(event) => setCardioSpeed(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
                {cardioFields.incline ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    שיפוע %
                    <FreeTextInput
                      min="0"
                      step={0.1}
                      value={cardioIncline}
                      onChange={(event) => setCardioIncline(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
                {cardioFields.distance ? (
                  <label className="grid gap-1.5 font-bold text-muted-foreground">
                    מרחק ק״מ
                    <FreeTextInput
                      min="0"
                      step={0.1}
                      value={cardioDistance}
                      onChange={(event) => setCardioDistance(event.target.value)}
                      className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-ink outline-none focus:border-primary"
                    />
                  </label>
                ) : null}
              </div>
            </div>

            {showCalories ? (
              <div className="rounded-2xl bg-primary/10 px-3.5 py-3 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">שריפה משוערת</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-primary">
                  כ-{cardioCalories} קלוריות
                </p>
              </div>
            ) : null}
            {cardioError ? <p className="text-xs font-semibold text-rose-700">{cardioError}</p> : null}
            <button
              type="button"
              onClick={handleCardioSave}
              className="h-11 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              {editingCardioId ? "שמור שינויים" : "שמור אימון אירובי"}
            </button>
          </div>
        </Overlay>
      ) : null}
    </section>
  );
}