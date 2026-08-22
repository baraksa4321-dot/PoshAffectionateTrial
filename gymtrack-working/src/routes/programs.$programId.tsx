import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Copy, GripVertical, Pencil, Play, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import {
  EmptyState,
  IconButton,
  PrimaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import {
  deleteWorkout,
  duplicateWorkoutDay,
  reorderProgramDays,
  saveProgram,
  useGym,
} from "@/lib/gym-store";
import type { Program, Workout } from "@/lib/gym-types";

export const Route = createFileRoute("/programs/$programId")({
  head: () => ({ meta: [{ title: "תכנית אימונים — הרוטינה שלי" }] }),
  component: ProgramDetail,
});

function ProgramDetail() {
  const { programId } = Route.useParams();
  const navigate = useNavigate();
  const { programs, workouts, userProfile } = useGym();
  const role = userProfile?.role || "client";
  const isCoach = role === "coach" || role === "owner";
  const program = programs.find((item) => item.id === programId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Program | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(PointerSensor),
  );

  if (!program) {
    return (
      <AppShell
        title="תכנית לא נמצאה"
        action={
          <Link
            to="/programs"
            aria-label="חזרה לתוכניות"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        }
      >
        <p className="surface-card p-5 text-muted-foreground text-start">
          תכנית זו אינה קיימת עוד.
        </p>
      </AppShell>
    );
  }

  const days = program.dayIds
    .map((id) => workouts.find((workout) => workout.id === id))
    .filter((day): day is Workout => Boolean(day));
  const current = draft ?? program;
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = program.dayIds.indexOf(String(active.id));
    const newIndex = program.dayIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderProgramDays(program.id, arrayMove(program.dayIds, oldIndex, newIndex));
    }
  };
  const save = () => {
    if (!current.name.trim()) return;
    saveProgram({ ...current, name: current.name.trim() });
    setEditing(false);
    setDraft(null);
  };

  const totalExercises = days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <AppShell
      kicker="תכנית"
      title={program.name}
      subtitle={`${days.length} ימי אימון · ${totalExercises} תרגילים`}
      action={
        isCoach ? (
          <IconButton
            onClick={() => setEditing((value) => !value)}
            aria-label="ערוך תכנית"
            variant={editing ? "primary" : "default"}
          >
            {editing ? <X className="h-5 w-5" /> : <Pencil className="h-4 w-4" strokeWidth={2} />}
          </IconButton>
        ) : undefined
      }
    >
      {editing ? (
        <div className="surface-card p-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            שם התכנית
          </p>
          <input
            value={current.name}
            onChange={(event) => setDraft({ ...current, name: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-base outline-none focus:border-primary"
          />
          <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            הערות
          </p>
          <textarea
            value={current.notes}
            onChange={(event) => setDraft({ ...current, notes: event.target.value })}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-base outline-none focus:border-primary"
          />
          <div className="mt-4 flex gap-2">
            <PrimaryButton onClick={save} leading={<Save className="h-4 w-4" />}>
              שמור שינויים
            </PrimaryButton>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(null);
              }}
              className="press h-12 rounded-2xl bg-secondary px-5 text-[14.5px] font-semibold text-secondary-foreground"
            >
              ביטול
            </button>
          </div>
        </div>
      ) : program.notes ? (
        <div className="ink-card-soft p-4">
          <p className="text-start text-[13px] leading-relaxed text-ink-soft">{program.notes}</p>
        </div>
      ) : null}

      <section className="mt-6">
        <SectionHeader
          title="ימי אימון"
          subtitle={
            isCoach
              ? "גרורי כדי לסדר מחדש. לחצי על אימון כדי לפתוח או לערוך."
              : "לחצי על יום אימון להצגת התרגילים או התחלת אימון"
          }
          action={
            isCoach ? (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/programs/$programId/$dayId",
                    params: { programId: program.id, dayId: "new" },
                  })
                }
                className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                הוסיפי יום
              </button>
            ) : undefined
          }
        />

        {days.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={program.dayIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {days.map((day, index) => (
                  <SortableDayCard
                    key={day.id}
                    day={day}
                    index={index}
                    programId={program.id}
                    onRequestDelete={(id, name) => setPendingDelete({ id, name })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState
            title="עדיין אין ימי אימון"
            description="הוסיפי את יום האימון הראשון שלך לתכנית ובני בתוכו תרגילים."
            action={
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/programs/$programId/$dayId",
                    params: { programId: program.id, dayId: "new" },
                  })
                }
                className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                הוסיפי יום אימון
              </button>
            }
          />
        )}
      </section>

      <ConfirmSheet
        open={pendingDelete !== null}
        title="למחוק את יום האימון?"
        description={
          pendingDelete
            ? `הפעולה תמחק את "${pendingDelete.name}" ואת כל התרגילים שבו. לא ניתן לשחזר.`
            : undefined
        }
        confirmLabel="מחק יום"
        cancelLabel="חזרה"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteWorkout(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}

function SortableDayCard({
  day,
  index,
  programId,
  onRequestDelete,
}: {
  day: Workout;
  index: number;
  programId: string;
  onRequestDelete: (id: string, name: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const navigate = useNavigate();
  const goStart = () => navigate({ to: "/session/$workoutId", params: { workoutId: day.id } });
  const onDuplicate = () => duplicateWorkoutDay(day.id, programId);

  return (
    <article ref={setNodeRef} style={style} className="surface-card p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="גרור לסידור מחדש"
          className="press grid h-10 w-7 shrink-0 cursor-grab place-items-center rounded-lg text-muted-foreground/60 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-soft font-display text-[15px] font-semibold text-primary">
          {String(index + 1).padStart(2, "0")}
        </div>
        <Link
          to="/programs/$programId/$dayId"
          params={{ programId, dayId: day.id }}
          className="min-w-0 flex-1 text-start"
        >
          <p className="truncate font-display text-[16px] font-semibold text-ink">
            {day.name || "יום ללא שם"}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{day.items.length} תרגילים</p>
        </Link>
        <button
          type="button"
          onClick={goStart}
          aria-label={`התחל את ${day.name}`}
          className="press grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 border-t border-border/50 pt-3">
        <div className="flex gap-1">
          <Link
            to="/programs/$programId/$dayId"
            params={{ programId, dayId: day.id }}
            className="press rounded-full px-3 py-1.5 text-[12px] font-semibold text-muted-foreground hover:bg-secondary"
          >
            עריכה
          </Link>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label={`שכפל ${day.name}`}
            className="press rounded-full px-3 py-1.5 text-[12px] font-semibold text-muted-foreground hover:bg-secondary"
          >
            שכפול
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRequestDelete(day.id, day.name)}
          aria-label={`מחק ${day.name}`}
          className="press grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
