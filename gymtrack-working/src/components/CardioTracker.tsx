import { Footprints, Pencil, Trash2, X } from "lucide-react";
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

const DEFAULT_CARDIO_TYPE = CARDIO_TYPES[0] ?? "הליכה";

function numericInputValue(value: string) {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
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
    distance: isRunning || isBike || isRowing || type.includes("טיול"),
  };
}


export function CardioTracker() {
  const { cardioLogs, userProfile } = useGym();
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

  const cardioDurationValue = numericInputValue(cardioDuration);
  const cardioSpeedValue = numericInputValue(cardioSpeed);
  const cardioInclineValue = numericInputValue(cardioIncline);
  const cardioFields = cardioFieldVisibility(cardioType);
  const profileWeight = Number(userProfile?.weight);
  const calorieWeight =
    Number.isFinite(profileWeight) && profileWeight > 0 ? profileWeight : 65;
  const cardioCalories = calculateCardioCalories(
    cardioType,
    cardioDurationValue,
    calorieWeight,
    cardioSpeedValue,
    cardioInclineValue,
  );
  const resetCardioForm = () => {
    setEditingCardioId(null);
    setCardioType(DEFAULT_CARDIO_TYPE);
    setCardioDuration("");
    setCardioSpeed("");
    setCardioIncline("");
    setCardioDistance("");
    setCardioError("");
  };

  const saveCardioEntry = () => {
    if (!cardioType || cardioDurationValue <= 0) {
      setCardioError("יש להזין משך אימון כדי להוסיף את האירובי.");
      return;
    }

    const log = {
      date: todayKey(),
      type: cardioType,
      durationMin: cardioDurationValue,
      ...(cardioSpeedValue > 0 ? { speed: cardioSpeedValue } : {}),
      ...(cardioInclineValue > 0 ? { incline: cardioInclineValue } : {}),
      ...(numericInputValue(cardioDistance) > 0
        ? { distanceKm: numericInputValue(cardioDistance) }
        : {}),
      calories: cardioCalories,
    };

    if (editingCardioId) {
      updateCardioLog({ id: editingCardioId, ...log });
      setSuccessMessage("אימון האירובי עודכן ונוסף לפעילות השבוע ולדוח המאמן.");
    } else {
      saveCardioLog(log);
      setSuccessMessage("אימון האירובי נוסף לפעילות השבוע ולדוח המאמן.");
    }

    setCardioError("");
    setEditingCardioId(null);
    setCardioType(DEFAULT_CARDIO_TYPE);
    setCardioDuration("");
    setCardioSpeed("");
    setCardioIncline("");
    setCardioDistance("");
  };

  const closeCardioForm = () => {
    setShowCardioModal(false);
    resetCardioForm();
    setSuccessMessage("");
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
    setSuccessMessage("");
    setShowCardioModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => openCardioForm()}
        className="press inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[10px] font-bold text-ink transition-colors hover:bg-primary/20"
        aria-label="פתיחת רישום אירובי"
      >
        <Footprints className="h-3.5 w-3.5 text-primary" />
        אירובי
      </button>
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
            {successMessage ? (
              <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary">
                {successMessage}
              </p>
            ) : null}

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
              onClick={saveCardioEntry}
              className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {editingCardioId ? "עדכון אימון אירובי" : "הוספת אימון אירובי"}
            </button>
            <p className="text-center text-[11px] font-semibold text-muted-foreground">
              האימון יתווסף רק לאחר לחיצה על הכפתור.
            </p>
            {(cardioLogs ?? []).length > 0 ? (
              <div className="border-t border-border/60 pt-3">
                <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  אימונים אחרונים
                </p>
                <div className="space-y-1.5">
                  {(cardioLogs ?? []).slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-2.5 py-2">
                      <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-ink">
                        {entry.type} · {entry.durationMin} דקות
                      </span>
                      <button
                        type="button"
                        onClick={() => openCardioForm(entry)}
                        aria-label={`עריכת ${entry.type}`}
                        className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-ink"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCardioLog(entry.id)}
                        aria-label={`מחיקת ${entry.type}`}
                        className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Overlay>
      ) : null}
    </>
  );
}