import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { exerciseDisplayName } from "@/lib/exercise-library";
import { Stepper } from "@/components/Stepper";
import { Overlay } from "@/components/ui-app/Overlay";
import { deleteWorkout, emptyItem, emptyWorkout, saveWorkout, useGym } from "@/lib/gym-store";
import type { Workout, WorkoutItem } from "@/lib/gym-types";

export const Route = createFileRoute("/workouts/$workoutId")({
  head: () => ({
    meta: [
      { title: "עורך אימון — MY routine" },
      { property: "og:title", content: "עורך אימון — MY routine" },
    ],
  }),
  component: Builder,
});

const field =
  "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-base outline-none focus:border-primary";

function Builder() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const { workouts, exercises, userProfile } = useGym();
  const canManageProgram = userProfile?.role === "coach" || userProfile?.role === "owner";
  const isNew = workoutId === "new";
  const existing = workouts.find((w) => w.id === workoutId);

  const [draft, setDraft] = useState<Workout>(existing ?? emptyWorkout());
  const [picker, setPicker] = useState(false);

  if (userProfile?.role === undefined) {
    return (
      <AppShell title="אימון" kicker="בודקת הרשאות">
        <div className="surface-card mt-4 rounded-3xl p-6 text-center text-sm text-muted-foreground">
          טוענת את תפקיד החשבון המאומת...
        </div>
      </AppShell>
    );
  }

  if (!isNew && !existing) {
    return (
      <AppShell title="אימון לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">אימון זה אינו קיים עוד.</p>
      </AppShell>
    );
  }
  if (!canManageProgram) {
    return (
      <AppShell title="עריכת אימונים זמינה למאמנים בלבד">
        <p className="surface-card p-5 text-start text-muted-foreground">
          אפשר לצפות באימונים שלך, אך רק מאמן או בעלים יכולים לשנות תוכנית או תרגילים.
        </p>
      </AppShell>
    );
  }

  const nameOf = (id: string, snapshot?: string) => {
    const exercise = exercises.find((e) => e.id === id);
    return exercise ? exerciseDisplayName(exercise) : snapshot || "תרגיל שהוסר";
  };
  const patchItem = (id: string, patch: Partial<WorkoutItem>) =>
    setDraft({
      ...draft,
      items: draft.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  const setRepType = (item: WorkoutItem, repType: "fixed" | "range") => {
    if (repType === "range") {
      patchItem(item.id, {
        repType,
        repMin: item.repMin ?? item.reps,
        repMax: item.repMax ?? item.reps + 2,
      });
      return;
    }

    patchItem(item.id, { repType });
  };
  const setRepMin = (item: WorkoutItem, repMin: number) =>
    patchItem(item.id, {
      repMin,
      ...(repMin > (item.repMax ?? item.reps) ? { repMax: repMin } : {}),
    });
  const setRepMax = (item: WorkoutItem, repMax: number) =>
    patchItem(item.id, {
      repMax,
      ...(repMax < (item.repMin ?? item.reps) ? { repMin: repMax } : {}),
    });
  const move = (index: number, dir: -1 | 1) => {
    const items = [...draft.items];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index]!;
    items[index] = items[target]!;
    items[target] = a;
    setDraft({ ...draft, items });
  };

  const onSave = () => {
    const w = { ...draft, name: draft.name.trim() || "אימון ללא שם" };
    saveWorkout(w);
    navigate({ to: "/programs" });
  };

  return (
    <AppShell
      title={isNew ? "אימון חדש" : "עריכת אימון"}
      subtitle={`${draft.items.length} תרגילים`}
      action={
        <Link
          to="/programs"
          aria-label="חזרה"
          className="grid h-11 w-11 place-items-center rounded-xl bg-secondary active:scale-95"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      }
    >
      <input
        className={field}
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="שם האימון"
      />
      <textarea
        rows={2}
        className={`${field} mt-3`}
        value={draft.notes}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        placeholder="הערות ודגשים לאימון..."
      />

      <div className="mt-5 space-y-3.5 text-start">
        {draft.items.map((item, index) => (
          <div key={item.id} className="surface-card p-4">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <button
                type="button"
                aria-label="שנה סדר"
                onClick={() => move(index, -1)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <p className="truncate font-semibold text-foreground">
                {nameOf(item.exerciseId, item.exerciseName)}
              </p>
              <button
                type="button"
                aria-label="הסר תרגיל"
                onClick={() =>
                  setDraft({
                    ...draft,
                    items: draft.items.filter((i) => i.id !== item.id),
                  })
                }
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stepper
                label="סטים"
                value={item.sets}
                min={1}
                onChange={(v) => patchItem(item.id, { sets: v })}
              />
              <Stepper
                label="משקל"
                value={item.weight}
                step={0.1}
                suffix="ק״ג"
                onChange={(v) => patchItem(item.id, { weight: v })}
              />
              <Stepper
                label="מנוחה"
                value={item.rest}
                step={0.1}
                suffix="ש׳"
                onChange={(v) => patchItem(item.id, { rest: v })}
              />
            </div>

            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  סוג חזרות
                </p>
                <div className="flex rounded-2xl bg-secondary p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setRepType(item, "fixed")}
                    className={`rounded-xl px-3 py-1.5 active:scale-95 ${
                      item.repType !== "range"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    קבוע
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepType(item, "range")}
                    className={`rounded-xl px-3 py-1.5 active:scale-95 ${
                      item.repType === "range"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    טווח
                  </button>
                </div>
              </div>
              {item.repType === "range" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Stepper
                    label="מינימום"
                    value={item.repMin ?? item.reps}
                    min={1}
                    onChange={(v) => setRepMin(item, v)}
                  />
                  <Stepper
                    label="מקסימום"
                    value={item.repMax ?? item.reps}
                    min={1}
                    onChange={(v) => setRepMax(item, v)}
                  />
                </div>
              ) : (
                <Stepper
                  label="חזרות"
                  value={item.reps}
                  min={1}
                  onChange={(v) => patchItem(item.id, { reps: v })}
                />
              )}
            </div>

            <input
              className={`${field} mt-3`}
              value={item.notes}
              onChange={(e) => patchItem(item.id, { notes: e.target.value })}
              placeholder="הערה לתרגיל זה..."
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPicker(true)}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary font-semibold active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" /> הוסף תרגיל
      </button>

      <button
        type="button"
        onClick={onSave}
        className="mt-3 h-14 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground active:scale-[0.98]"
      >
        שמור אימון
      </button>

      {!isNew && (
        <button
          type="button"
          onClick={() => {
            deleteWorkout(draft.id);
            navigate({ to: "/programs" });
          }}
          className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-secondary font-semibold text-destructive active:scale-[0.98]"
        >
          <Trash2 className="h-5 w-5" /> מחק אימון
        </button>
      )}

      <Overlay
        open={picker}
        onClose={() => setPicker(false)}
        ariaLabel="בחירת תרגיל"
        variant="bottom"
        panelClassName="p-0"
      >
        <div dir="rtl" className="h-[min(82dvh,44rem)]">
          <div className="flex h-full min-h-0 flex-col p-5 text-start">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">בחר תרגיל</h2>
              <button
                type="button"
                aria-label="סגור"
                onClick={() => setPicker(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-6">
              {exercises.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, items: [...draft.items, emptyItem(e.id)] });
                    setPicker(false);
                  }}
                  className="w-full rounded-xl bg-secondary p-4 text-start active:scale-[0.99]"
                >
                  <p className="font-semibold text-foreground">{exerciseDisplayName(e)}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.muscleGroup} · {e.equipment}
                  </p>
                </button>
              ))}
              {exercises.length === 0 && (
                <p className="text-sm text-muted-foreground">הוסף תרגילים לספרייה קודם לכן.</p>
              )}
            </div>
          </div>
        </div>
      </Overlay>
    </AppShell>
  );
}
