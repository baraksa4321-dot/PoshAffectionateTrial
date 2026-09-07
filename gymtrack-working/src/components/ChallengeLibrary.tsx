import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronLeft,
  Copy,
  Dumbbell,
  Pencil,
  Play,
  Plus,
  ShieldCheck,
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
  saveChallenge,
  startChallenge,
  useGym,
} from "@/lib/gym-store";
import { cloneChallenge } from "@/lib/challenge-library";
import type { Challenge, WorkoutItem } from "@/lib/gym-types";

const accentClasses: Record<Challenge["accent"], string> = {
  sage: "bg-sage-soft text-primary",
  peach: "bg-orange-50 text-orange-700",
  lavender: "bg-violet-50 text-violet-700",
  sand: "bg-amber-50 text-amber-700",
};

export function ChallengeLibrary({ compact = false }: { compact?: boolean }) {
  const { challenges, exercises, userProfile } = useGym();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const isCoach = userProfile?.role === "coach" || userProfile?.role === "owner";
  const selected = challenges.find((challenge) => challenge.id === selectedId) ?? null;
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
    const workout = startChallenge(challenge.id, sessionId);
    if (!workout) return;
    close();
    void navigate({ to: "/session/$workoutId", params: { workoutId: workout.id } });
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
              <p className="text-[10px] font-bold tracking-[0.16em] text-primary uppercase">Challenge library</p>
              <h2 className="mt-1 font-display text-lg font-extrabold text-ink">אתגרי ספורט</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                בחר אתגר, התחל אימון קצר, או בנה גרסה אישית עם סטים, חזרות ומנוחה.
              </p>
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
              onEdit={() => startEditing(selected)}
            />
          ) : (
            <>
              <div className="grid gap-2">
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => setSelectedId(challenge.id)}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3 text-start transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${accentClasses[challenge.accent]}`}>
                      <Trophy className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-ink">{challenge.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {challenge.category} · {challenge.difficulty} · {challenge.durationLabel}
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
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                מתחילים בגרסה שמתאימה ליכולת הנוכחית ומפסיקים במקרה של כאב חד, סחרחורת או אובדן שליטה.
              </div>
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
  onEdit,
}: {
  challenge: Challenge;
  isCoach: boolean;
  onBack: () => void;
  onStart: () => void;
  onEdit: () => void;
}) {
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
            <p className="mt-1 text-[11px] font-bold text-primary">{challenge.category} · {challenge.difficulty} · {challenge.durationLabel}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{challenge.description}</p>
      </div>
      <div className="mt-3 space-y-2">
        {challenge.sessions.map((session, index) => (
          <div key={session.id} className="rounded-2xl border border-border/60 bg-background p-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <p className="text-sm font-extrabold text-ink">{session.name || `אימון ${index + 1}`}</p>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{session.items.length} תרגילים · בנוי עם סטים, חזרות וזמני מנוחה</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton onClick={onStart}>
          <Play className="h-4 w-4" />
          התחל אתגר
        </PrimaryButton>
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
        <textarea value={challenge.description} onChange={(event) => onChange({ ...challenge, description: event.target.value })} placeholder="תיאור והנחיות בטיחות" rows={3} className="w-full resize-none rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs leading-relaxed outline-none focus:border-primary" />
        <div className="grid grid-cols-2 gap-2">
          <select value={challenge.difficulty} onChange={(event) => onChange({ ...challenge, difficulty: event.target.value as Challenge["difficulty"] })} className="rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs font-bold outline-none">
            <option>מתחילים</option><option>ביניים</option><option>מתקדמים</option>
          </select>
          <input value={challenge.durationLabel} onChange={(event) => onChange({ ...challenge, durationLabel: event.target.value })} placeholder="משך" className="rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs font-bold outline-none focus:border-primary" />
        </div>
        <input value={session.name} onChange={(event) => onUpdateSession({ name: event.target.value })} placeholder="שם האימון" className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2.5 text-xs font-bold outline-none focus:border-primary" />
        {session.items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border/60 bg-background p-3">
            <p className="truncate text-xs font-extrabold text-ink">{item.exerciseName ?? exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "תרגיל"}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold text-muted-foreground">סטים<input type="number" min={1} value={item.sets} onChange={(event) => onUpdateItem(item.id, { sets: Math.max(1, Number(event.target.value) || 1) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">חזרות / שניות<input type="number" min={1} value={item.reps} onChange={(event) => onUpdateItem(item.id, { reps: Math.max(1, Number(event.target.value) || 1) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
              <label className="text-[10px] font-bold text-muted-foreground">מנוחה<input type="number" min={0} value={item.rest} onChange={(event) => onUpdateItem(item.id, { rest: Math.max(0, Number(event.target.value) || 0) })} className="mt-1 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs font-bold text-ink" /></label>
            </div>
            <input value={item.notes} onChange={(event) => onUpdateItem(item.id, { notes: event.target.value })} placeholder="הנחיה לסט" className="mt-2 w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-xs text-ink outline-none focus:border-primary" />
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