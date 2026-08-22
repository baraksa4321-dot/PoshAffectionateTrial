import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { deleteWorkout, emptyItem, emptyWorkout, saveWorkout, useGym } from "@/lib/gym-store";
import type { Workout, WorkoutItem } from "@/lib/gym-types";

export const Route = createFileRoute("/workouts/$workoutId")({
  head: () => ({
    meta: [
      { title: "עורך אימון — הרוטינה שלי" },
      { property: "og:title", content: "עורך אימון — הרוטינה שלי" },
    ],
  }),
  component: Builder,
});

const field =
  "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-base outline-none focus:border-primary";

function Builder() {
  const { workoutId } = Route.useParams();
  const navigate = useNavigate();
  const { workouts, exercises } = useGym();
  const isNew = workoutId === "new";
  const existing = workouts.find((w) => w.id === workoutId);

  const [draft, setDraft] = useState<Workout>(existing ?? emptyWorkout());
  const [picker, setPicker] = useState(false);

  if (!isNew && !existing) {
    return (
      <AppShell title="אימון לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">אימון זה אינו קיים עוד.</p>
      </AppShell>
    );
  }

  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? "תרגיל שהוסר";
  const patchItem = (id: string, patch: Partial<WorkoutItem>) =>
    setDraft({
      ...draft,
      items: draft.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
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
              <p className="truncate font-semibold text-foreground">{nameOf(item.exerciseId)}</p>
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
                label="חזרות"
                value={item.reps}
                min={1}
                onChange={(v) => patchItem(item.id, { reps: v })}
              />
              <Stepper
                label="משקל"
                value={item.weight}
                step={2.5}
                suffix="ק״ג"
                onChange={(v) => patchItem(item.id, { weight: v })}
              />
              <Stepper
                label="מנוחה"
                value={item.rest}
                step={15}
                suffix="ש׳"
                onChange={(v) => patchItem(item.id, { rest: v })}
              />
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

      {picker && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-background/70 backdrop-blur-sm">
          <div className="max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 text-start">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">בחר תרגיל</h2>
              <button
                type="button"
                aria-label="סגור"
                onClick={() => setPicker(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 pb-6">
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
                  <p className="font-semibold text-foreground">{e.name}</p>
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
      )}
    </AppShell>
  );
}
