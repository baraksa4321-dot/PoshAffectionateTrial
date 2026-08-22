import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Dumbbell,
  ImagePlus,
  Pencil,
  Save,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { IconButton, Pill, PrimaryButton, SecondaryButton } from "@/components/ui-app/primitives";
import {
  deleteExercise,
  emptyExercise,
  lastPerformance,
  personalRecords,
  saveExercise,
  useGym,
} from "@/lib/gym-store";
import { EQUIPMENT, EXERCISE_CATEGORIES, MUSCLE_GROUPS, type Exercise } from "@/lib/gym-types";

export const Route = createFileRoute("/exercises/$exerciseId")({
  head: () => ({
    meta: [
      { title: "פרטי תרגיל — הרוטינה שלי" },
      {
        name: "description",
        content: "פרטי תרגיל: קבוצת שרירים, ציוד, הוראות ביצוע והערות אישיות.",
      },
      { property: "og:title", content: "פרטי תרגיל — הרוטינה שלי" },
    ],
  }),
  component: ExerciseDetail,
});

const field =
  "w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-[14px] outline-none focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

function ExerciseDetail() {
  const { exerciseId } = Route.useParams();
  const navigate = useNavigate();
  const { exercises, history } = useGym();
  const isNew = exerciseId === "new";
  const existing = exercises.find((e) => e.id === exerciseId);

  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<Exercise>(existing ?? emptyExercise());
  const [customMuscle, setCustomMuscle] = useState(
    () =>
      existing?.customMuscleGroup ||
      (existing && !MUSCLE_GROUPS.includes(existing.muscleGroup) ? existing.muscleGroup : "") ||
      "",
  );

  // Scroll reset on navigation is handled centrally in __root.tsx (ScrollToTop
  // subscribes to router.subscribe('onResolved')); no per-page effect needed.

  if (!isNew && !existing) {
    return (
      <AppShell title="תרגיל לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">
          תרגיל זה אינו קיים עוד בספרייה.
        </p>
      </AppShell>
    );
  }

  const ex = existing ?? draft;
  const last = lastPerformance(history, ex.id);
  const pr = personalRecords(history, ex.id);

  const toggleMuscleGroup = (m: string) => {
    setDraft((d) => {
      const current = d.muscleGroups ?? [d.muscleGroup];
      const exists = current.includes(m);
      const updated = exists ? current.filter((x) => x !== m) : [...current, m];
      return {
        ...d,
        muscleGroup: updated[0] ?? m,
        muscleGroups: updated,
      };
    });
  };

  const toggleSecondary = (m: string) =>
    setDraft((d) => {
      const current = d.secondaryMuscles ?? [];
      return {
        ...d,
        secondaryMuscles: current.includes(m) ? current.filter((x) => x !== m) : [...current, m],
      };
    });

  const set = (patch: Partial<Exercise>) => setDraft({ ...draft, ...patch });

  const onSave = () => {
    const isOther = draft.muscleGroup === "אחר" || (draft.muscleGroups ?? []).includes("אחר");
    const customValue = isOther ? customMuscle.trim() : undefined;
    const finalMuscleGroup = isOther && customValue ? customValue : draft.muscleGroup;

    if (!draft.name.trim() || !finalMuscleGroup) return;
    saveExercise({
      ...draft,
      muscleGroup: finalMuscleGroup,
      customMuscleGroup: customValue,
    });
    if (isNew) navigate({ to: "/exercises/$exerciseId", params: { exerciseId: draft.id } });
    else setEditing(false);
  };

  return (
    <AppShell
      kicker={isNew ? "תרגיל חדש" : editing ? "עריכה" : "ספריית תרגילים"}
      title={isNew ? "תרגיל חדש" : editing ? ex.name || "עריכת תרגיל" : ex.name}
      subtitle={
        !editing && !isNew
          ? `${ex.customMuscleGroup || ex.muscleGroup} · ${ex.equipment}`
          : undefined
      }
      action={
        <div className="flex gap-2">
          <Link
            to="/exercises"
            aria-label="חזרה"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          {editing ? (
            <button
              type="button"
              onClick={onSave}
              aria-label="שמור"
              className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"
            >
              <Check className="h-5 w-5" strokeWidth={2.4} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(ex);
                setEditing(true);
              }}
              aria-label="ערוך"
              className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.2} />
            </button>
          )}
        </div>
      }
    >
      {editing ? (
        <div className="space-y-4 text-start">
          <div className="surface-card p-4">
            <label className={labelCls}>שם התרגיל</label>
            <input
              className={field}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="למשל: לחיצת חזה בשיפוע חיובי"
            />
          </div>

          <div className="surface-card space-y-4 p-4">
            <div>
              <label className={labelCls}>קבוצת שרירים ראשית</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...MUSCLE_GROUPS, "אחר"].map((g) => {
                  const active =
                    g === "אחר"
                      ? !MUSCLE_GROUPS.includes(draft.muscleGroup) || draft.muscleGroup === "אחר"
                      : draft.muscleGroup === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set({ muscleGroup: g })}
                      className={`press rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              {draft.muscleGroup === "אחר" ? (
                <input
                  className={`${field} mt-2`}
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                  placeholder="הקלד קבוצת שרירים"
                />
              ) : null}
            </div>

            <div>
              <label className={labelCls}>ציוד</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EQUIPMENT.map((g) => {
                  const active = draft.equipment === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set({ equipment: g })}
                      className={`press rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>קטגוריה</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                key="none"
                type="button"
                onClick={() => set({ category: "" })}
                className={`press rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  !draft.category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                — ללא —
              </button>
              {EXERCISE_CATEGORIES.map((c) => {
                const active = draft.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set({ category: c })}
                    className={`press rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>קבוצות שרירים עובדות</label>
            <p className="text-[11.5px] text-muted-foreground">
              בחרי את כל קבוצות השרירים שהתרגיל מעסיק.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((m) => {
                const active = (draft.muscleGroups ?? [draft.muscleGroup]).includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleMuscleGroup(m)}
                    className={`press rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>שרירים משניים (עוזרים)</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((m) => {
                const active = (draft.secondaryMuscles ?? []).includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleSecondary(m)}
                    className={`press rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      active
                        ? "bg-rose text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>תיאור התרגיל</label>
            <textarea
              rows={3}
              className={field}
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="תיאור קצר על התרגיל..."
            />
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>הוראות ביצוע</label>
            <textarea
              rows={3}
              className={field}
              value={draft.instructions ?? ""}
              onChange={(e) => set({ instructions: e.target.value })}
              placeholder="1. אחוז במוט ברוחב כתפיים..."
            />
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>דגשי טכניקה וטיפים</label>
            <textarea
              rows={2}
              className={field}
              value={draft.tips ?? ""}
              onChange={(e) => set({ tips: e.target.value })}
              placeholder="למשל: לשמור על מרפקים בזווית 45 מעלות"
            />
          </div>

          <div className="surface-card p-4">
            <label className={labelCls}>קישור לסרטון הדגמה</label>
            <input
              className={field}
              value={draft.videoUrl}
              onChange={(e) => set({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          <ImagesEditor images={draft.images} onChange={(images) => set({ images })} />

          <div className="surface-card p-4">
            <label className={labelCls}>הערות אישיות</label>
            <textarea
              rows={3}
              className={field}
              value={draft.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="הערות אישיות לגבי התרגיל..."
            />
          </div>

          <div className="space-y-3 pt-2">
            <PrimaryButton onClick={onSave} leading={<Save className="h-4 w-4" />}>
              שמור תרגיל
            </PrimaryButton>
            {!isNew ? (
              <button
                type="button"
                onClick={() => {
                  deleteExercise(ex.id);
                  navigate({ to: "/exercises" });
                }}
                className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-[14.5px] font-semibold text-destructive"
              >
                <Trash2 className="h-4 w-4" /> מחק תרגיל
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-start">
          {ex.images.length > 0 ? (
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
              {ex.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${ex.name} ${i + 1}`}
                  loading="lazy"
                  className="h-44 w-64 shrink-0 rounded-2xl border border-border/40 object-cover"
                />
              ))}
            </div>
          ) : null}

          {ex.videoUrl ? (
            <a
              href={ex.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="press surface-card flex items-center justify-between gap-3 p-4 text-[14px] font-semibold text-primary"
            >
              צפי בסרטון הדגמה לתרגיל
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}

          <div className="surface-card p-4">
            <p className={labelCls}>מאפיינים</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="num-pill px-3 py-1.5 text-[12px] font-semibold text-ink">
                {ex.equipment}
              </span>
              <span className="num-pill px-3 py-1.5 text-[12px] font-semibold text-ink">
                {ex.customMuscleGroup || ex.muscleGroup}
              </span>
              {ex.category ? (
                <span className="num-pill px-3 py-1.5 text-[12px] font-semibold text-ink">
                  {ex.category}
                </span>
              ) : null}
            </div>
            {(ex.secondaryMuscles ?? []).length > 0 ? (
              <div className="mt-3">
                <p className={labelCls}>שרירים משניים עובדים</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ex.secondaryMuscles!.map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Panel title="תיאור התרגיל">{ex.description || "אין תיאור לתרגיל זה."}</Panel>
          {ex.instructions ? <Panel title="הוראות ביצוע">{ex.instructions}</Panel> : null}
          {ex.tips ? <Panel title="דגשים וטיפים">{ex.tips}</Panel> : null}
          <Panel title="הערות אישיות">{ex.notes || "אין הערות אישיות."}</Panel>

          {/* PR Card */}
          <div className="surface-card p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-primary" />
              <p className={labelCls + " m-0"}>שיאים אישיים</p>
            </div>
            {pr ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="num-pill p-3 text-center">
                  <p className="font-display text-[20px] font-bold tabular-nums text-ink">
                    {pr.heaviest}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">
                    משקל שיא (ק״ג)
                  </p>
                </div>
                <div className="num-pill p-3 text-center">
                  <p className="font-display text-[20px] font-bold tabular-nums text-ink">
                    {pr.bestRepsAtHeaviest}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">
                    חזרות בשיא
                  </p>
                </div>
                <div className="num-pill p-3 text-center">
                  <p className="font-display text-[20px] font-bold tabular-nums text-ink">
                    {pr.estimatedMax}
                  </p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">
                    1RM משוער
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">עדיין לא נרשמו שיאים לתרגיל זה.</p>
            )}
          </div>

          {/* Last performance */}
          <div className="surface-card p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-primary" />
              <p className={labelCls + " m-0"}>ביצוע אחרון</p>
            </div>
            {last ? (
              <>
                <p className="mb-2 text-[12px] text-muted-foreground">
                  {new Date(last.date).toLocaleDateString("he-IL")}
                </p>
                <div className="flex flex-wrap gap-1.5" dir="ltr">
                  {last.sets.map((s, i) => (
                    <span
                      key={i}
                      className="num-pill px-3 py-1.5 text-[12px] font-semibold tabular-nums text-ink"
                    >
                      {s.weight}kg × {s.reps}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">תרגיל זה טרם בוצע באימון פעיל.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-4 text-start">
      <p className={labelCls}>{title}</p>
      <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
        {children}
      </p>
    </div>
  );
}

function ImagesEditor({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="surface-card p-4 text-start">
      <label className={labelCls}>תמונות תרגיל</label>
      <div className="flex gap-2">
        <input
          className={field}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="קישור לתמונה (URL)"
        />
        <button
          type="button"
          aria-label="הוסף תמונה"
          onClick={() => {
            if (!url.trim()) return;
            onChange([...images, url.trim()]);
            setUrl("");
          }}
          className="press grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
      </div>
      {images.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`תמונת תרגיל ${i + 1}`}
                className="h-20 w-20 rounded-xl border border-border/40 object-cover"
              />
              <button
                type="button"
                aria-label="הסר תמונה"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="press absolute -end-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

void IconButton;
void Pill;
void SecondaryButton;
