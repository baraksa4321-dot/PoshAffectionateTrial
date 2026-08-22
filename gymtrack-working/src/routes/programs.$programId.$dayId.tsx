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
import {
  ArrowRight,
  ChevronDown,
  Dumbbell,
  Flame,
  GripVertical,
  Link2,
  Link2Off,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { ConfirmSheet } from "@/components/ui-app/ConfirmSheet";
import {
  EmptyState,
  IconButton,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import {
  deleteWorkout,
  emptyExercise,
  emptyItem,
  emptyWarmup,
  saveExercise,
  saveWorkoutInProgram,
  uid,
  useGym,
} from "@/lib/gym-store";
import {
  EQUIPMENT,
  MUSCLE_GROUPS,
  type Exercise,
  type Workout,
  type WorkoutItem,
} from "@/lib/gym-types";

export const Route = createFileRoute("/programs/$programId/$dayId")({
  head: () => ({ meta: [{ title: "עורך יום אימון — הרוטינה שלי" }] }),
  component: DayBuilder,
});

const fieldBase =
  "w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-base outline-none focus:border-primary";

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary text-foreground hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}

function computeSupersetLabels(items: WorkoutItem[]) {
  const labels: Record<string, string> = {};
  let group = -1;
  let i = 0;
  while (i < items.length) {
    const sid = items[i]?.supersetId;
    if (sid) {
      let j = i;
      const run: WorkoutItem[] = [];
      while (j < items.length && items[j]?.supersetId === sid) {
        run.push(items[j]!);
        j += 1;
      }
      if (run.length >= 2) {
        group += 1;
        const letter = String.fromCharCode(65 + (group % 26));
        run.forEach((it, k) => {
          labels[it.id] = `${letter}${k + 1}`;
        });
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return labels;
}

function DayBuilder() {
  const { programId, dayId } = Route.useParams();
  const navigate = useNavigate();
  const { programs, workouts, exercises } = useGym();
  const program = programs.find((item) => item.id === programId);
  const existing = workouts.find((workout) => workout.id === dayId);
  const isNew = dayId === "new" || !dayId;
  const [draft, setDraft] = useState<Workout>(() => existing ?? makeBlankWorkout());
  const [picker, setPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerGroup, setPickerGroup] = useState("הכל");
  const [pickerEquipment, setPickerEquipment] = useState("הכל");
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [pendingDeleteDay, setPendingDeleteDay] = useState(false);
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(PointerSensor),
  );

  if (!program && !isNew) {
    return (
      <AppShell title="יום אימון לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">
          יום אימון זה אינו קיים עוד.
        </p>
      </AppShell>
    );
  }
  if (!program) {
    return (
      <AppShell title="תכנית לא נמצאה">
        <p className="surface-card p-5 text-muted-foreground text-start">
          תכנית זו אינה קיימת עוד.
        </p>
      </AppShell>
    );
  }

  const labels = computeSupersetLabels(draft.items);

  const patchItem = (id: string, patch: Partial<WorkoutItem>) =>
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));

  const toggleSupersetWithPrev = (index: number) => {
    setDraft((current) => {
      if (index <= 0) return current;
      const items = [...current.items];
      const item = items[index]!;
      const prev = items[index - 1]!;
      if (item.supersetId && item.supersetId === prev.supersetId) {
        items[index] = { ...item, supersetId: undefined };
      } else {
        const groupId = prev.supersetId ?? uid();
        items[index - 1] = { ...prev, supersetId: groupId };
        items[index] = { ...item, supersetId: groupId };
      }
      return { ...current, items };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDraft((current) => {
      const oldIndex = current.items.findIndex((item) => item.id === active.id);
      const newIndex = current.items.findIndex((item) => item.id === over.id);
      return oldIndex === -1 || newIndex === -1
        ? current
        : { ...current, items: arrayMove(current.items, oldIndex, newIndex) };
    });
  };

  const save = () => {
    if (!draft.name.trim()) return;
    saveWorkoutInProgram(program.id, { ...draft, name: draft.name.trim() });
    navigate({ to: "/programs/$programId", params: { programId: program.id } });
  };

  const pickerExercises = exercises.filter(
    (exercise) =>
      (pickerGroup === "הכל" || exercise.muscleGroup === pickerGroup) &&
      (pickerEquipment === "הכל" || exercise.equipment === pickerEquipment) &&
      (exercise.name.toLowerCase().includes(pickerQuery.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(pickerQuery.toLowerCase()) ||
        exercise.muscleGroup.toLowerCase().includes(pickerQuery.toLowerCase())),
  );

  const addExercise = (exerciseId: string) => {
    setDraft((current) => ({ ...current, items: [...current.items, emptyItem(exerciseId)] }));
    setPicker(false);
    setPickerQuery("");
  };

  const createAndAddExercise = () => {
    const name = newExerciseName.trim();
    if (!name) return;
    const exercise = emptyExercise();
    exercise.name = name;
    saveExercise(exercise);
    addExercise(exercise.id);
    setNewExerciseName("");
    setCreatingExercise(false);
  };

  const totalSets = draft.items.reduce((sum, item) => sum + item.sets, 0);

  return (
    <AppShell
      kicker={isNew ? "יום חדש" : program.name}
      title={isNew ? "יום אימון חדש" : draft.name || "יום ללא שם"}
      subtitle={`${draft.items.length} תרגילים · ${totalSets} סטים`}
      action={
        <IconButton
          aria-label="חזרה לתכנית"
          onClick={() => navigate({ to: "/programs/$programId", params: { programId } })}
        >
          <ArrowRight className="h-5 w-5" />
        </IconButton>
      }
    >
      {/* Day meta */}
      <div className="surface-card p-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          שם יום האימון
        </p>
        <input
          data-testid="input-day-name"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 font-display text-[17px] font-semibold text-ink outline-none placeholder:text-muted-foreground/70 focus:border-primary"
          placeholder="למשל: פלג גוף עליון 1"
        />
        <p className="mt-3.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          הערות ודגשים
        </p>
        <textarea
          rows={2}
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-[14px] outline-none focus:border-primary"
          placeholder="דגשים ליום האימון..."
        />
      </div>

      <SectionHeader
        className="mt-6"
        title="תרגילים"
        subtitle="גרורי לשינוי סדר, לחצי על כל תרגיל לעריכה"
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={draft.items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {draft.items.map((item, index) => {
              const ex = exercises.find((exercise) => exercise.id === item.exerciseId);
              return (
                <SortableItem
                  key={item.id}
                  item={item}
                  exercise={ex}
                  supersetLabel={labels[item.id]}
                  canSuperset={index > 0}
                  supersetActive={Boolean(
                    item.supersetId && item.supersetId === draft.items[index - 1]?.supersetId,
                  )}
                  onToggleSuperset={() => toggleSupersetWithPrev(index)}
                  onPatch={patchItem}
                  onRemove={() =>
                    setDraft({
                      ...draft,
                      items: draft.items.filter((entry) => entry.id !== item.id),
                    })
                  }
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {draft.items.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="הוסיפי תרגילים ליום האימון"
          description="בחרי תרגילים מספריית התרגילים או צרי תרגיל חדש. ניתן לבנות סופר-סטים, דרופ-סטים וסטי חימום."
          action={
            <button
              type="button"
              onClick={() => setPicker(true)}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              הוסיפי תרגיל ראשון
            </button>
          }
        />
      ) : (
        <button
          type="button"
          data-testid="button-add-exercise-to-day"
          onClick={() => setPicker(true)}
          className="press mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-[14px] font-semibold text-primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          הוסיפי תרגיל
        </button>
      )}

      <div className="mt-6 space-y-3">
        <PrimaryButton
          data-testid="button-save-day"
          onClick={save}
          leading={<Save className="h-4 w-4" strokeWidth={2.2} />}
        >
          שמור יום אימון
        </PrimaryButton>
        {!isNew ? (
          <button
            type="button"
            onClick={() => setPendingDeleteDay(true)}
            className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-[14.5px] font-semibold text-destructive"
          >
            <Trash2 className="h-4 w-4" /> מחק יום אימון
          </button>
        ) : null}
      </div>

      {picker ? (
        <div
          className="fade-in fixed inset-0 z-40 flex flex-col justify-end bg-foreground/30 backdrop-blur-sm"
          onClick={() => setPicker(false)}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="scale-in max-h-[85dvh] overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  ספריית תרגילים
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  בחרי תרגיל להוספה
                </h2>
              </div>
              <IconButton onClick={() => setPicker(false)} aria-label="סגור">
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <div className="num-pill flex h-12 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="חפש לפי שם, ציוד או שריר..."
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>

            <div className="mt-3 space-y-2">
              <div
                className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
                dir="rtl"
                aria-label="סינון לפי קבוצת שרירים"
              >
                <ChipButton active={pickerGroup === "הכל"} onClick={() => setPickerGroup("הכל")}>
                  הכל
                </ChipButton>
                {MUSCLE_GROUPS.map((group) => (
                  <ChipButton
                    key={group}
                    active={pickerGroup === group}
                    onClick={() => setPickerGroup(group)}
                  >
                    {group}
                  </ChipButton>
                ))}
              </div>
              <div
                className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
                dir="rtl"
                aria-label="סינון לפי ציוד"
              >
                <ChipButton
                  active={pickerEquipment === "הכל"}
                  onClick={() => setPickerEquipment("הכל")}
                >
                  הכל
                </ChipButton>
                {EQUIPMENT.map((equipment) => (
                  <ChipButton
                    key={equipment}
                    active={pickerEquipment === equipment}
                    onClick={() => setPickerEquipment(equipment)}
                  >
                    {equipment}
                  </ChipButton>
                ))}
              </div>
            </div>

            <div className="mt-3.5 space-y-2">
              {pickerExercises.map((exercise) => (
                <button
                  type="button"
                  key={exercise.id}
                  onClick={() => addExercise(exercise.id)}
                  className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-secondary px-3.5 py-3 text-start"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-primary">
                    <Dumbbell className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">{exercise.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">{exercise.muscleGroup}</p>
                  </div>
                  <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {exercise.equipment}
                  </span>
                </button>
              ))}
              {pickerExercises.length === 0 ? (
                <p className="rounded-2xl bg-secondary p-4 text-[13px] text-muted-foreground">
                  לא נמצאו תרגילים מתאימים לחיפוש.
                </p>
              ) : null}
            </div>

            {creatingExercise ? (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <label
                  className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
                  htmlFor="new-picker-exercise"
                >
                  תרגיל חדש
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="new-picker-exercise"
                    autoFocus
                    value={newExerciseName}
                    onChange={(event) => setNewExerciseName(event.target.value)}
                    placeholder="שם התרגיל"
                    className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-3 py-3 text-[14px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={createAndAddExercise}
                    className="press shrink-0 rounded-2xl bg-primary px-4 text-[14px] font-semibold text-primary-foreground"
                  >
                    הוסף
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingExercise(true)}
                className="press mt-4 w-full rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-[13.5px] font-semibold text-primary"
              >
                + צור תרגיל חדש בספרייה
              </button>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={pendingDeleteDay}
        title="למחוק את יום האימון?"
        description={`הפעולה תמחק את "${draft.name}" ואת כל התרגילים שבו. לא ניתן לשחזר.`}
        confirmLabel="מחק יום"
        cancelLabel="חזרה"
        destructive
        onConfirm={() => {
          deleteWorkout(draft.id);
          setPendingDeleteDay(false);
          navigate({ to: "/programs/$programId", params: { programId } });
        }}
        onCancel={() => setPendingDeleteDay(false)}
      />
    </AppShell>
  );
}

function makeBlankWorkout(): Workout {
  return {
    id: uid(),
    name: "",
    notes: "",
    items: [],
  };
}

function SortableItem({
  item,
  exercise,
  supersetLabel,
  canSuperset,
  supersetActive,
  onToggleSuperset,
  onPatch,
  onRemove,
}: {
  item: WorkoutItem;
  exercise: Exercise | undefined;
  supersetLabel: string | undefined;
  canSuperset: boolean;
  supersetActive: boolean;
  onToggleSuperset: () => void;
  onPatch: (id: string, patch: Partial<WorkoutItem>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const [advanced, setAdvanced] = useState(false);
  const name = exercise?.name ?? "תרגיל שהוסר";
  const isRange = item.repType === "range";
  const warmups = item.warmups ?? [];
  const workingSets =
    item.workingSets ??
    Array.from({ length: item.sets }, (_, index) => ({
      id: `${item.id}-set-${index}`,
      setNumber: index + 1,
      weight: item.weight,
      reps: item.reps,
    }));

  const setRepType = (type: "fixed" | "range") => {
    if (type === "range") {
      onPatch(item.id, {
        repType: "range",
        repMin: item.repMin ?? item.reps,
        repMax: item.repMax ?? item.reps + 2,
      });
    } else {
      onPatch(item.id, { repType: "fixed" });
    }
  };

  const patchWarmup = (wid: string, patch: Partial<{ weight: number; reps: number }>) =>
    onPatch(item.id, {
      warmups: warmups.map((w) => (w.id === wid ? { ...w, ...patch } : w)),
    });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`surface-card p-4 text-start ${isDragging ? "relative z-10 opacity-75 shadow-lg" : ""} ${supersetLabel ? "border-s-4 border-s-primary/70 rounded-s-none" : ""}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`שנה סדר ${name}`}
          className="press grid h-10 w-8 shrink-0 touch-none place-items-center rounded-xl text-muted-foreground/60 hover:bg-secondary"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {supersetLabel ? (
              <span className="shrink-0 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                {supersetLabel}
              </span>
            ) : null}
            <p className="min-w-0 truncate font-display text-[15px] font-semibold text-ink">
              {name}
            </p>
          </div>
          {exercise ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {exercise.equipment}
              {exercise.muscleGroup ? ` · ${exercise.muscleGroup}` : ""}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`הסר ${name}`}
          className="press grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {canSuperset ? (
        <button
          type="button"
          onClick={onToggleSuperset}
          className={`press mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12.5px] font-semibold transition-colors ${
            supersetActive
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          {supersetActive ? (
            <Link2Off className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {supersetActive ? "בטל סופר-סט עם הקודם" : "חבר בסופר-סט לקודם"}
        </button>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stepper
          label="סטים"
          value={item.sets}
          min={1}
          onChange={(value) => onPatch(item.id, { sets: value })}
        />
        <Stepper
          label="מנוחה"
          value={item.rest}
          step={15}
          suffix="שניות"
          onChange={(value) => onPatch(item.id, { rest: value })}
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            סוג חזרות
          </p>
          <div className="flex rounded-2xl bg-secondary p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setRepType("fixed")}
              className={`press rounded-xl px-3 py-1.5 ${!isRange ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              קבוע
            </button>
            <button
              type="button"
              onClick={() => setRepType("range")}
              className={`press rounded-xl px-3 py-1.5 ${isRange ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              טווח
            </button>
          </div>
        </div>
        {isRange ? (
          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label="מינימום"
              value={item.repMin ?? item.reps}
              min={0}
              onChange={(value) => onPatch(item.id, { repMin: value })}
            />
            <Stepper
              label="מקסימום"
              value={item.repMax ?? item.reps}
              min={0}
              onChange={(value) => onPatch(item.id, { repMax: value })}
            />
          </div>
        ) : (
          <Stepper
            label="חזרות מטרה"
            value={item.reps}
            min={0}
            onChange={(value) => onPatch(item.id, { reps: value })}
          />
        )}
      </div>

      {/* Per-set weights & reps */}
      <div className="mt-4 rounded-2xl border border-border/40 bg-secondary/50 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">
            {item.sets}
          </span>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            משקל וחזרות לכל סט
          </p>
        </div>
        <div className="space-y-2.5">
          {workingSets.slice(0, item.sets).map((set, index) => (
            <div key={set.id} className="rounded-2xl bg-white/70 px-3 py-2.5">
              <div className="grid grid-cols-[1.5rem_1fr_1fr] items-end gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                  {index + 1}
                </span>
                <Stepper
                  label="משקל"
                  value={set.weight}
                  step={2.5}
                  suffix="ק״ג"
                  onChange={(weight) =>
                    onPatch(item.id, {
                      workingSets: workingSets.map((current, i) =>
                        i === index ? { ...current, weight } : current,
                      ),
                    })
                  }
                />
                <Stepper
                  label="חזרות"
                  value={set.reps}
                  min={0}
                  onChange={(reps) =>
                    onPatch(item.id, {
                      workingSets: workingSets.map((current, i) =>
                        i === index ? { ...current, reps } : current,
                      ),
                    })
                  }
                />
              </div>
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 px-1 text-[11.5px] font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(set.dropSet)}
                  onChange={(event) =>
                    onPatch(item.id, {
                      workingSets: workingSets.map((current, i) =>
                        i === index ? { ...current, dropSet: event.target.checked } : current,
                      ),
                    })
                  }
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className={set.dropSet ? "font-semibold text-primary" : ""}>Drop Set</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <input
        className={`${fieldBase} mt-3 text-[14px]`}
        value={item.notes}
        onChange={(event) => onPatch(item.id, { notes: event.target.value })}
        placeholder="הערה לתרגיל (למשל: דגש על ירידה איטית)"
      />

      {/* Warm-up sets */}
      {warmups.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              סטי חימום
            </p>
          </div>
          <div className="space-y-2">
            {warmups.map((w, wi) => (
              <div key={w.id} className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-[11px] font-bold text-primary">
                  {wi + 1}
                </span>
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Stepper
                    label="ק״ג"
                    value={w.weight}
                    step={2.5}
                    onChange={(value) => patchWarmup(w.id, { weight: value })}
                  />
                  <Stepper
                    label="חזרות (>9)"
                    value={w.reps}
                    min={0}
                    onChange={(value) => patchWarmup(w.id, { reps: value })}
                  />
                </div>
                <button
                  type="button"
                  aria-label="הסר סט חימום"
                  onClick={() =>
                    onPatch(item.id, { warmups: warmups.filter((x) => x.id !== w.id) })
                  }
                  className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onPatch(item.id, { warmups: [...warmups, emptyWarmup()] })}
            className="press mt-2 w-full rounded-xl bg-white py-2 text-[12.5px] font-semibold text-primary"
          >
            + הוסף סט חימום
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onPatch(item.id, { warmups: [emptyWarmup()] })}
          className="press mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-secondary py-2.5 text-[12.5px] font-semibold text-muted-foreground"
        >
          <Flame className="h-3.5 w-3.5" />
          הוסף סטי חימום
        </button>
      )}

      {/* Advanced: tempo / RIR / RPE */}
      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="press mt-3 flex w-full items-center justify-between rounded-2xl px-1 py-2 text-[12.5px] font-semibold text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          מתקדם · טמפו · RIR · RPE
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${advanced ? "rotate-180" : ""}`} />
      </button>
      {advanced ? (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              טמפו
            </label>
            <input
              value={item.tempo ?? ""}
              onChange={(event) => onPatch(item.id, { tempo: event.target.value })}
              placeholder="3-1-1-0"
              className="w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-center text-[13px] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              RIR
            </label>
            <input
              inputMode="numeric"
              value={item.rir ?? ""}
              onChange={(event) =>
                onPatch(item.id, {
                  rir:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value.replace(/\D/g, "")),
                })
              }
              placeholder="—"
              className="w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-center text-[13px] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              RPE
            </label>
            <input
              inputMode="decimal"
              value={item.rpe ?? ""}
              onChange={(event) =>
                onPatch(item.id, {
                  rpe:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value.replace(/[^\d.]/g, "")),
                })
              }
              placeholder="—"
              className="w-full rounded-xl border border-border/60 bg-secondary px-2 py-2 text-center text-[13px] outline-none focus:border-primary"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

void Pill;
void PrimaryButton;
void SecondaryButton;
