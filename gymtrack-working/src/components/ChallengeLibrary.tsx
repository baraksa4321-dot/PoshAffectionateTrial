import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  Copy,
  Dumbbell,
  Pencil,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { Overlay } from "@/components/ui-app/Overlay";
import { PrimaryButton, SecondaryButton } from "@/components/ui-app/primitives";
import {
  deleteChallenge,
  duplicateChallenge,
  emptyChallenge,
  emptyItem,
  addChallengeToProgram,
  enrollInChallenge,
  saveChallenge,
  uid,
  useGym,
} from "@/lib/gym-store";
import { cloneChallenge } from "@/lib/challenge-library";
import type { Challenge, Program, WorkoutItem } from "@/lib/gym-types";

const accentClasses: Record<Challenge["accent"], string> = {
  sage: "bg-sage-soft text-primary",
  peach: "bg-orange-50 text-orange-700",
  lavender: "bg-violet-50 text-violet-700",
  sand: "bg-amber-50 text-amber-700",
};

type ChallengeLibraryProps = {
  compact?: boolean;
  availablePrograms?: Program[];
  onAssignToProgram?: (
    challenge: Challenge,
    programId: string,
    weekdays: number[],
  ) => Promise<boolean | void> | boolean | void;
};

export function ChallengeLibrary({
  compact = false,
  availablePrograms,
  onAssignToProgram,
}: ChallengeLibraryProps) {
  const { challenges, exercises, programs: localPrograms, userProfile } = useGym();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0]);
  const isCoach = userProfile?.role === "coach" || userProfile?.role === "owner";
  const selected = challenges.find((challenge) => challenge.id === selectedId) ?? null;
  const programs = availablePrograms ?? localPrograms;
  const editableExercises = useMemo(
    () => exercises.filter((exercise) => exercise.id !== "ex-ohp" || isCoach),
    [exercises, isCoach],
  );

  const close = () => {
    setOpen(false);
    setSelectedId(null);
    setEditing(null);
  };

  const begin = (challenge: Challenge, sessionId?: string) => {
    const enrolled = enrollInChallenge(challenge.id, sessionId);
    if (!enrolled) return;
    close();
    void navigate({ to: "/workouts" });
  };

  const addToProgram = (challenge: Challenge) => {
    const programId = selectedProgramId || programs[0]?.id;
    if (!programId) return;
    const assign = async () => {
      if (onAssignToProgram) {
        const result = await onAssignToProgram(challenge, programId, selectedWeekdays);
        if (result === false) return;
      } else {
        const workouts = addChallengeToProgram(challenge.id, programId, selectedWeekdays);
        if (!workouts?.length) return;
        void navigate({ to: "/programs/$programId", params: { programId } });
      }
      close();
    };
    void assign();
  };

  const startEditing = (challenge?: Challenge) => {
    const next = challenge ? cloneChallenge(challenge) : emptyChallenge();
    if (challenge?.isBuiltIn) {
      const copy = duplicateChallenge(challenge.id);
      if (copy) setEditing(copy);
      return;
    }
    setEditing(next);
  };

  const updateFirstSession = (patch: Partial<Challenge["sessions"][number]>) => {
    setEditing((current) =>
      current
        ? { ...current, sessions: current.sessions.map((session, index) => (index === 0 ? { ...session, ...patch } : session)) }
        : current,
    );
  };

  const updateItem = (itemId: string, patch: Partial<WorkoutItem>) => {
    setEditing((current) =>
      current
        ? {
            ...current,
            sessions: current.sessions.map((session, sessionIndex) =>
              sessionIndex === 0
                ? { ...session, items: session.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
                : session,
            ),
          }
        : current,
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[10px] font-bold text-ink transition-colors hover:bg-primary/20 ${compact ? "" : "shrink-0"}`}
        aria-label="פתיחת אתגרים"
      >
        <Trophy className="h-3.5 w-3.5 text-primary" />
        אתגרים
      </button>

      <Overlay open={open} onClose={close} ariaLabel="אתגרי ספורט" safeTop>
        <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-4 text-start shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div>
               <p className="text-[10px] font-bold tracking-[0.16em] text-primary uppercase">אתגרי אימון</p>
                <h2 className="mt-1 font-display text-lg font-extrabold text-ink">אתגרים</h2>
            </div>
            <button type="button" onClick={close} aria-label="סגירת אתגרים" className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {editing ? (
            <ChallengeEditor
              challenge={editing}
              exercises={editableExercises}
              onChange={setEditing}
              onUpdateSession={updateFirstSession}
              onUpdateItem={updateItem}
              onCancel={() => setEditing(null)}
              onSave={() => {
                saveChallenge(editing);
                setSelectedId(editing.id);
                setEditing(null);
              }}
            />
          ) : selected ? (
            <ChallengeDetail
              challenge={selected}
              isCoach={isCoach}
              onBack={() => setSelectedId(null)}
              onStart={() => begin(selected)}
              programs={programs}
              selectedProgramId={selectedProgramId || programs[0]?.id || ""}
               selectedWeekdays={selectedWeekdays}
              onProgramChange={setSelectedProgramId}
               onWeekdayChange={(sessionIndex, weekday) =>
                 setSelectedWeekdays((current) => {
                   const next = [...current];
                   next[sessionIndex] = weekday;
                   return next;
                 })
               }
              onAddToProgram={() => addToProgram(selected)}
              onEdit={() => startEditing(selected)}
            />
          ) : (
            <>
              <div className="grid gap-2">
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(challenge.id);
                      setSelectedWeekdays(challenge.sessions.map((_, index) => index % 7));
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3 text-start transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${accentClasses[challenge.accent]}`}>
                      <Trophy className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-ink">{challenge.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {challenge.category} · {challenge.durationLabel}
                      </span>
                    </span>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
              {isCoach ? (
                <button type="button" onClick={() => startEditing()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 px-3 py-3 text-xs font-bold text-primary hover:bg-primary/5">
                  <Plus className="h-4 w-4" />
                  יצירת אתגר חדש
                </button>
              ) : null}
            </>
          )}
        </div>
      </Overlay>
    </>
  );
}

function ChallengeDetail({
  challenge,
  isCoach,
  onBack,
  onStart,
  programs,
  selectedProgramId,
  selectedWeekdays,
  onProgramChange,
  onWeekdayChange,
  onAddToProgram,
  onEdit,
}: {
  challenge: Challenge;
  isCoach: boolean;
  onBack: () => void;
  onStart: () => void;
  programs: Program[];
  selectedProgramId: string;
  selectedWeekdays: number[];
  onProgramChange: (programId: string) => void;
  onWeekdayChange: (sessionIndex: number, weekday: number) => void;
  onAddToProgram: () => void;
  onEdit: () => void;
}) {
  const weekdays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return (
    <>
      <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        חזרה לכל האתגרים
      </button>
      <div className="rounded-3xl bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accentClasses[challenge.accent]}`}>
            <Trophy className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-extrabold text-ink">{challenge.title}</h3>
            <p className="mt-1 text-[11px] font-bold text-primary">{challenge.category} · {challenge.durationLabel}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {challenge.sessions.map((session, index) => (
          <div key={session.id} className="rounded-2xl border border-border/60 bg-background p-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <p className="text-sm font-extrabold text-ink">{session.name || `אימון ${index + 1}`}</p>
            </div>
             <p className="mt-1 text-[11px] text-muted-foreground">{session.items.length} תרגילים</p>
            <div className="mt-3 space-y-2">
              {session.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/50 bg-surface px-3 py-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                      {itemIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-ink">
                        {item.exerciseName ?? "תרגיל"}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold text-primary">
                         {item.distanceKm
                           ? `יעד ${item.distanceKm} ק״מ · ${item.rest} שנ׳ מנוחה`
                           : `${item.sets} סטים · ${item.targetLabel ?? `${item.reps} חזרות`} · ${item.rest} שנ׳ מנוחה`}
                      </p>
                      {item.targetSpeedKmH || item.targetInclinePct ? (
                        <p className="mt-1 text-[10px] font-bold text-ink">
                          {item.targetSpeedKmH ? `קצב ${item.targetSpeedKmH} קמ״ש` : ""}
                          {item.targetSpeedKmH && item.targetInclinePct ? " · " : ""}
                          {item.targetInclinePct ? `שיפוע ${item.targetInclinePct}%` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton onClick={onStart}>
          <Dumbbell className="h-4 w-4" />
           הוסיפי לשבוע
        </PrimaryButton>
        {isCoach && programs.length > 0 ? (
          <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
            <p className="text-[11px] font-bold text-ink">הוספה לתוכנית</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select
                value={selectedProgramId}
                onChange={(event) => onProgramChange(event.target.value)}
                className="min-w-0 rounded-xl border border-border/60 bg-surface px-2 py-2 text-xs font-bold text-ink"
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedWeekday}
                onChange={(event) => onWeekdayChange(Number(event.target.value))}
                className="min-w-0 rounded-xl border border-border/60 bg-surface px-2 py-2 text-xs font-bold text-ink"
              >
                {weekdays.map((day, index) => (
                  <option key={day} value={index}>
                    יום {day}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={onAddToProgram}
              className="mt-2 h-10 w-full rounded-xl bg-primary text-xs font-bold text-primary-foreground"
            >
              הוסף לתוכנית
            </button>
          </div>
        ) : null}
        {isCoach ? (
          <>
            <SecondaryButton onClick={onEdit}>
              {challenge.isBuiltIn ? <Copy className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {challenge.isBuiltIn ? "שכפל לעריכה" : "עריכת אתגר"}
            </SecondaryButton>
            {!challenge.isBuiltIn ? (
              <button type="button" onClick={() => { deleteChallenge(challenge.id); onBack(); }} className="rounded-full px-3 text-xs font-bold text-destructive hover:bg-destructive/10">
                מחיקה
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}

function ChallengeEditor({
  challenge,
  exercises,
  onChange,
  onUpdateSession,
  onUpdateItem,
  onCancel,
  onSave,
}: {
  challenge: Challenge;
  exercises: ReturnType<typeof useGym>["exercises"];
  onChange: (challenge: Challenge) => void;
  onUpdateSession: (patch: Partial<Challenge["sessions"][number]>) => void;
  onUpdateItem: (itemId: string, patch: Partial<WorkoutItem>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const session = challenge.sessions[0];
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  if (!session) return null;
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink">עריכת אתגר</p>
        <button type="button" onClick={onCancel} className="text-xs font-bold text-primary">ביטול</button>
      </div>
      <div className="space-y-2">
        <input value={challenge.title} onChange={(event) => onChange({ ...challenge, title: event.target.value })} placeholder="שם האתגר" className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-sm font-bold outline-none focus:border-primary" />
        <input value={challenge.durationLabel} onChange={(event) => onChange({ ...challenge, durationLabel: event.target.value })} placeholder="משך" className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs font-bold outline-none focus:border-primary" />
        <input value={session.name} onChange={(event) => onUpdateSession({ name: event.target.value })} placeholder="שם האימון" className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs font-bold outline-none focus:border-primary" />
        {session.items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border/60 bg-background p-3">
            <p className="truncate text-xs font-extrabold text-ink">{item.exerciseName ?? exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "תרגיל"}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold text-muted-foreground">סטים<input type="number" min={1} value={item.sets} onChange={(event) => onUpdateItem(item.id, { sets: Math.max(1, Number(event.target.value) || 1) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">חזרות / שניות<input type="number" min={1} value={item.reps} onChange={(event) => onUpdateItem(item.id, { reps: Math.max(1, Number(event.target.value) || 1) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">מנוחה<input type="number" min={0} value={item.rest} onChange={(event) => onUpdateItem(item.id, { rest: Math.max(0, Number(event.target.value) || 0) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">ק״מ<input type="number" min={0} step={0.1} value={item.distanceKm ?? ""} onChange={(event) => onUpdateItem(item.id, { distanceKm: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">קצב קמ״ש<input type="number" min={0} step={0.1} value={item.targetSpeedKmH ?? ""} onChange={(event) => onUpdateItem(item.id, { targetSpeedKmH: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">שיפוע %<input type="number" min={0} step={0.5} value={item.targetInclinePct ?? ""} onChange={(event) => onUpdateItem(item.id, { targetInclinePct: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs outline-none">
            {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
          </select>
          <button type="button" onClick={() => { const exercise = exercises.find((candidate) => candidate.id === exerciseId); if (!exercise) return; onUpdateSession({ items: [...session.items, emptyItem(exercise.id)] }); }} className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-primary/10 px-3 text-xs font-bold text-primary">
            <Plus className="h-4 w-4" /> הוסף
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <PrimaryButton onClick={onSave} disabled={!challenge.title.trim() || !session.items.length}>שמירת אתגר</PrimaryButton>
        <SecondaryButton onClick={onCancel}>ביטול</SecondaryButton>
      </div>
    </>
  );
}