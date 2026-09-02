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
  flushCloudSync,
  lastPerformance,
  personalRecords,
  saveExercise,
  useGym,
} from "@/lib/gym-store";
import {
  CABLE_GRIPS,
  EQUIPMENT,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  type Exercise,
} from "@/lib/gym-types";
import {
  exerciseDisplayName,
  exerciseEquipmentOptions,
  exerciseGripOptions,
  selectedExerciseEquipmentOptions,
} from "@/lib/exercise-library";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/exercises/$exerciseId")({
  head: () => ({
    meta: [
      { title: "פרטי תרגיל — MY routine" },
      {
        name: "description",
        content: "פרטי תרגיל: קבוצת שרירים, ציוד, הוראות ביצוע והערות אישיות.",
      },
      { property: "og:title", content: "פרטי תרגיל — MY routine" },
    ],
  }),
  component: ExerciseDetail,
});

const field =
  "w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-[14px] outline-none focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

function SearchOptionField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const filtered = options
    .filter((option) => option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .slice(0, 8);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        className={field}
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
        }}
        placeholder={placeholder}
        role="combobox"
        aria-label={label}
        autoComplete="off"
      />
      {query.trim() && filtered.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setQuery(option);
                onChange(option);
              }}
              className={`press rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                option === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {query.trim() && !options.some((option) => option === query.trim()) ? (
        <p className="mt-1 text-[10px] text-muted-foreground">
          הערך החדש יתווסף למאגר בעת שמירת התרגיל.
        </p>
      ) : null}
    </div>
  );
}

function SearchMultiOptionField({
  label,
  selected,
  options,
  placeholder,
  onToggle,
}: {
  label: string;
  selected: string[];
  options: string[];
  placeholder: string;
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = options
    .filter((option) => option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .slice(0, 8);
  const customValue = query.trim();
  const hasCustomValue = customValue && !options.includes(customValue);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <p className="text-[11.5px] text-muted-foreground">
        כתבי לחיפוש ובחרי ערך קיים, או הוסיפי ערך חדש.
      </p>
      <input
        className={`${field} mt-2`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        role="combobox"
        aria-label={label}
        autoComplete="off"
      />
      {selected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="press rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
            >
              {option} ×
            </button>
          ))}
        </div>
      ) : null}
      {query.trim() && filtered.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onToggle(option);
                setQuery("");
              }}
              className={`press rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                selected.includes(option)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {hasCustomValue ? (
        <button
          type="button"
          onClick={() => {
            onToggle(customValue);
            setQuery("");
          }}
          className="press mt-1 rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary"
        >
          + הוסיפי ״{customValue}״ למאגר
        </button>
      ) : null}
    </div>
  );
}

function OptionImagesEditor({
  label,
  options,
  images,
  onChange,
}: {
  label: string;
  options: string[];
    images: Record<string, string> | undefined;
  onChange: (images: Record<string, string>) => void;
}) {
  const [draftUrls, setDraftUrls] = useState<Record<string, string>>({});

  return (
    <div className="surface-card p-4">
      <label className={labelCls}>{label}</label>
      <p className="text-[11.5px] text-muted-foreground">
        הוסיפי קישור לתמונה לכל אפשרות. התמונה תופיע גם במאגר המתאים.
      </p>
      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const image = images?.[option]?.trim() || "";
          const inputValue = draftUrls[option] ?? image;
          return (
            <div key={option} className="rounded-2xl border border-border/60 bg-secondary/40 p-3">
              <p className="mb-2 text-xs font-bold text-ink">{option}</p>
              <div className="flex gap-2">
                <input
                  className={`${field} min-w-0 flex-1`}
                  value={inputValue}
                  onChange={(event) =>
                    setDraftUrls((current) => ({ ...current, [option]: event.target.value }))
                  }
                  placeholder="קישור לתמונה (URL)"
                  aria-label={`תמונה עבור ${option}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...(images ?? {}) };
                    const nextValue = inputValue.trim();
                    if (nextValue) next[option] = nextValue;
                    else delete next[option];
                    onChange(next);
                    setDraftUrls((current) => ({ ...current, [option]: nextValue }));
                  }}
                  className="press shrink-0 rounded-2xl bg-primary px-3 text-xs font-bold text-primary-foreground"
                >
                  שמור
                </button>
              </div>
              {image ? (
                <div className="relative mt-2">
                  <img
                    src={image}
                    alt={`תמונה עבור ${option}`}
                    className="h-28 w-full rounded-xl border border-border/40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...(images ?? {}) };
                      delete next[option];
                      onChange(next);
                      setDraftUrls((current) => ({ ...current, [option]: "" }));
                    }}
                    className="press absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label={`הסר תמונה עבור ${option}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseDetail() {
  const { exerciseId } = Route.useParams();
  const navigate = useNavigate();
  const {
    exercises,
    history,
    userProfile,
    deletedEquipmentOptions = [],
    deletedCableGripOptions = [],
  } = useGym();
  const isNew = exerciseId === "new";
  const existing = exercises.find((e) => e.id === exerciseId);
  const canManageLibrary = userProfile?.role === "coach" || userProfile?.role === "owner";
  const gender = userProfile?.gender;

  const [editing, setEditing] = useState(isNew);
  const [draft, setDraft] = useState<Exercise>(existing ?? emptyExercise());
  const [customMuscle, setCustomMuscle] = useState(
    () =>
      existing?.customMuscleGroup ||
      (existing && !MUSCLE_GROUPS.includes(existing.muscleGroup) ? existing.muscleGroup : "") ||
      "",
  );
  const [alternativeQuery, setAlternativeQuery] = useState("");
  const [videoUploadError, setVideoUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Scroll reset on navigation is handled centrally in __root.tsx (ScrollToTop
  // subscribes to router.subscribe('onResolved')); no per-page effect needed.

  if (userProfile?.role === undefined) {
    return (
      <AppShell title="תרגיל" kicker="בודקת הרשאות">
        <div className="surface-card mt-4 rounded-3xl p-6 text-center text-sm text-muted-foreground">
          {genderText(
            userProfile?.gender,
            "טוענת את תפקיד החשבון המאומת...",
            "טוען את תפקיד החשבון המאומת...",
          )}
        </div>
      </AppShell>
    );
  }

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
  const selectedAlternativeIds = draft.approvedSubstitutes ?? [];
  const alternativeOptions = exercises.filter(
    (exercise) =>
      exercise.id !== draft.id &&
      (exercise.name.toLocaleLowerCase().includes(alternativeQuery.toLocaleLowerCase()) ||
        exercise.equipment.toLocaleLowerCase().includes(alternativeQuery.toLocaleLowerCase())),
  );
  const customMuscleOptions = exercises.flatMap((exercise) => [
    exercise.muscleGroup,
    ...(exercise.muscleGroups ?? []),
    ...(exercise.secondaryMuscles ?? []),
  ]);
  const muscleOptions = Array.from(
    new Set([...MUSCLE_GROUPS, ...customMuscleOptions].filter(Boolean)),
  );
  const equipmentOptions = Array.from(
    new Set([...EQUIPMENT, ...exercises.map((exercise) => exercise.equipment)].filter(Boolean)),
  ).filter((option) => !deletedEquipmentOptions.includes(option));
  const selectedEquipmentOptions = selectedExerciseEquipmentOptions(draft);
  const categoryOptions = Array.from(
    new Set(
      [...EXERCISE_CATEGORIES, ...exercises.map((exercise) => exercise.category)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  const toggleAlternative = (exerciseId: string) => {
    set({
      approvedSubstitutes: selectedAlternativeIds.includes(exerciseId)
        ? selectedAlternativeIds.filter((id) => id !== exerciseId)
        : [...selectedAlternativeIds, exerciseId],
    });
  };

  const addGenderVideo = (file: File | undefined, field: "videoMaleUrl" | "videoFemaleUrl") => {
    if (!file || !file.type.startsWith("video/")) return;
    setVideoUploadError("");
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("video-read-failed"));
      reader.readAsDataURL(file);
    })
      .then((url) => set({ [field]: url }))
      .catch(() => setVideoUploadError("לא ניתן לקרוא את הסרטון שנבחר."));
  };

  const onSave = async () => {
    if (!canManageLibrary) return;
    setSaveError("");
    const isOther = draft.muscleGroup === "אחר" || (draft.muscleGroups ?? []).includes("אחר");
    const customValue = isOther ? customMuscle.trim() : undefined;
    const finalMuscleGroup = isOther && customValue ? customValue : draft.muscleGroup;

    if (!draft.name.trim()) {
      setSaveError("יש להזין שם תרגיל לפני השמירה.");
      return;
    }
    if (!finalMuscleGroup) {
      setSaveError("יש לבחור קבוצת שרירים לפני השמירה.");
      return;
    }
    const equipmentOptions = selectedExerciseEquipmentOptions({
      ...draft,
      equipment: draft.equipment,
    });
    const savedExercise = {
      ...draft,
      muscleGroup: finalMuscleGroup,
      equipment: equipmentOptions[0] ?? draft.equipment,
      equipmentOptions,
      ...(customValue === undefined ? {} : { customMuscleGroup: customValue }),
    };
    saveExercise(savedExercise);
    if (isNew) {
      const syncResult = await flushCloudSync();
      if (!syncResult.success) {
        setSaveError(syncResult.error || "שמירת התרגיל בענן נכשלה. אפשר לנסות שוב.");
        return;
      }
      const returnUrl = window.sessionStorage.getItem("gymtrack-exercise-return-url");
      if (returnUrl) {
        window.sessionStorage.removeItem("gymtrack-exercise-return-url");
        window.sessionStorage.setItem("gymtrack-created-exercise-id", savedExercise.id);
        // The coach screen reads this together with the created id and restores
        // the exact client/program/day context before assigning the exercise.
        window.location.assign(returnUrl);
        return;
      }
      navigate({ to: "/exercises/$exerciseId", params: { exerciseId: savedExercise.id } });
    } else {
      setEditing(false);
    }
  };

  if (isNew && !canManageLibrary) {
    return (
      <AppShell title="יצירת תרגילים זמינה למאמנים בלבד">
        <p className="surface-card p-5 text-start text-muted-foreground">
          אפשר לצפות בספריית התרגילים, אך רק מאמן או בעלים יכולים להוסיף ולערוך תרגילים.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker={isNew ? "תרגיל חדש" : editing ? "עריכה" : "ספריית תרגילים"}
      title={isNew ? "תרגיל חדש" : exerciseDisplayName(ex)}
      subtitle={
        !editing && !isNew
          ? `${ex.customMuscleGroup || ex.muscleGroup} · ${exerciseEquipmentOptions(ex).join(" · ")}`
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
          {editing && canManageLibrary ? (
            <button
              type="button"
              onClick={onSave}
              aria-label="שמור"
              className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"
            >
              <Check className="h-5 w-5" strokeWidth={2.4} />
            </button>
          ) : canManageLibrary ? (
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
          ) : null}
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
            <SearchOptionField
              label="קבוצת שרירים ראשית"
              value={draft.muscleGroup}
              options={muscleOptions}
              placeholder="חיפוש או כתיבת קבוצת שרירים חדשה..."
              onChange={(value) =>
                set({
                  muscleGroup: value,
                })
              }
            />
            <SearchOptionField
              label="ציוד ברירת מחדל"
              value={draft.equipment}
              options={equipmentOptions}
              placeholder="חיפוש או כתיבת ציוד חדש..."
              onChange={(value) =>
                set({
                  equipment: value,
                })
              }
            />
            <>
              <SearchMultiOptionField
                label="ציוד אפשרי בעת בניית אימון"
                selected={selectedEquipmentOptions}
                options={equipmentOptions}
                placeholder="חיפוש ציוד אפשרי..."
                onToggle={(value) => {
                  const next = selectedEquipmentOptions.includes(value)
                    ? selectedEquipmentOptions.filter((option) => option !== value)
                    : [...selectedEquipmentOptions, value];
                  if (next.length === 0) return;
                  set({ equipment: next[0] ?? draft.equipment, equipmentOptions: next });
                }}
              />
              {selectedEquipmentOptions.includes("פולי / כבלים") ? (
                <SearchMultiOptionField
                  label="מאחזים אפשריים בכבלים"
                  selected={draft.cableGripOptions ?? []}
                  options={CABLE_GRIPS.filter(
                    (grip) => !deletedCableGripOptions.includes(grip),
                  )}
                  placeholder="חיפוש מאחז..."
                  onToggle={(value) => {
                    const current = draft.cableGripOptions ?? [];
                    set({
                      cableGripOptions: current.includes(value)
                        ? current.filter((option) => option !== value)
                        : [...current, value],
                    });
                  }}
                />
              ) : null}
            </>
          </div>

          <>
            <OptionImagesEditor
              label="מאגר תמונות למכשירים ולציוד"
              options={selectedEquipmentOptions}
              images={draft.equipmentImages}
              onChange={(equipmentImages) => set({ equipmentImages })}
            />

            {selectedEquipmentOptions.includes("פולי / כבלים") ? (
              <OptionImagesEditor
                label="מאגר תמונות למאחזים"
                options={exerciseGripOptions(draft)}
                images={draft.cableGripImages}
                onChange={(cableGripImages) => set({ cableGripImages })}
              />
            ) : null}

            <div className="surface-card p-4">
              <SearchOptionField
                label="קטגוריה"
                value={draft.category ?? ""}
                options={categoryOptions}
                placeholder="חיפוש או כתיבת קטגוריה חדשה..."
                onChange={(value) => set({ category: value })}
              />
            </div>

            <div className="surface-card p-4">
              <SearchMultiOptionField
                label="קבוצות שרירים עובדות"
                selected={draft.muscleGroups ?? [draft.muscleGroup].filter(Boolean)}
                options={muscleOptions}
                placeholder="חיפוש קבוצת שרירים עובדת..."
                onToggle={(value) => toggleMuscleGroup(value)}
              />
            </div>

            <div className="surface-card p-4">
              <SearchMultiOptionField
                label="שרירים משניים (עוזרים)"
                selected={draft.secondaryMuscles ?? []}
                options={muscleOptions}
                placeholder="חיפוש שריר משני..."
                onToggle={(value) => toggleSecondary(value)}
              />
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
              <label className={labelCls}>סרטוני הדגמה לפי מגדר</label>
              <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["videoMaleUrl", "סרטון הדגמה לגבר"],
                  ["videoFemaleUrl", "סרטון הדגמה לאישה"],
                ] as const
              ).map(([videoField, title]) => {
                const source = draft[videoField];
                return (
                  <div
                    key={videoField}
                    className="rounded-2xl border border-border/60 bg-secondary/40 p-3"
                  >
                    <p className="mb-2 text-xs font-bold text-ink">{title}</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(event) => {
                        addGenderVideo(event.target.files?.[0], videoField);
                        event.currentTarget.value = "";
                      }}
                      className="w-full text-[11px] file:me-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary-foreground"
                    />
                    {source ? (
                      <div className="relative mt-2">
                        <video
                          src={source}
                          controls
                          preload="metadata"
                          className="h-32 w-full rounded-xl border border-border/40 bg-black object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => set({ [videoField]: "" })}
                          className="press absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground"
                          aria-label={`הסר ${title}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-muted-foreground">לא נבחר סרטון</p>
                    )}
                  </div>
                );
              })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {genderText(
                userProfile?.gender,
                "בחרי סרטון נפרד לכל מגדר. אם אין סרטון מותאם, אפשר להשאיר את השדה ריק.",
                "בחר סרטון נפרד לכל מגדר. אם אין סרטון מותאם, אפשר להשאיר את השדה ריק.",
              )}
              </p>
              {videoUploadError ? (
                <p className="mt-2 text-[11px] font-semibold text-destructive">{videoUploadError}</p>
              ) : null}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(draft.videoUrls?.length
                ? draft.videoUrls
                : draft.videoUrl
                  ? [draft.videoUrl]
                  : []
              ).map((src, index) => (
                <div key={`${src.slice(0, 24)}-${index}`} className="relative">
                  <video
                    src={src}
                    controls
                    preload="metadata"
                    className="h-36 w-full rounded-xl border border-border/40 bg-black object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        videoUrls: (draft.videoUrls?.length
                          ? draft.videoUrls
                          : draft.videoUrl
                            ? [draft.videoUrl]
                            : []
                        ).filter((_, videoIndex) => videoIndex !== index),
                        ...(index === 0 ? { videoUrl: "" } : {}),
                      })
                    }
                    className="press absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label={`הסר סרטון ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              </div>
            </div>

            <div className="surface-card p-4">
              <label className={labelCls}>קישור לסרטון חיצוני (אופציונלי)</label>
              <input
                className={field}
                value={draft.videoUrl}
                onChange={(e) => set({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="surface-card p-4">
              <label className={labelCls}>תרגילים חלופיים</label>
              <p className="text-[11.5px] text-muted-foreground">
                למשל: במקום מוט חופשי אפשר לבחור מכונה או דמבלים.
              </p>
              <input
                className={`${field} mt-2`}
                value={alternativeQuery}
                onChange={(event) => setAlternativeQuery(event.target.value)}
                placeholder="חיפוש תרגיל חלופי..."
              />
              <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
              {alternativeOptions.slice(0, 12).map((exercise) => {
                const selected = selectedAlternativeIds.includes(exercise.id);
                return (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() => toggleAlternative(exercise.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-start text-xs ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-secondary text-ink"
                    }`}
                  >
                    <span className="font-semibold">{exercise.name}</span>
                    <span className="text-[10px] text-muted-foreground">{exercise.equipment}</span>
                  </button>
                );
              })}
              </div>
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
          </>

          {saveError ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {saveError}
            </p>
          ) : null}

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
          {ex.videoUrls
            ?.filter((url) => url && url !== ex.videoUrl)
            .map((url, index) => (
              <a
                key={`${url.slice(0, 24)}-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="press surface-card flex items-center justify-between gap-3 p-4 text-[14px] font-semibold text-primary"
              >
                צפי בסרטון הדגמה {index + 2}
                <ArrowRight className="h-4 w-4" />
              </a>
            ))}

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
            {(ex.approvedSubstitutes ?? []).length > 0 ? (
              <div className="mt-3">
                <p className={labelCls}>תרגילים חלופיים</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(ex.approvedSubstitutes ?? []).map((alternativeId) => {
                    const alternative = exercises.find((item) => item.id === alternativeId);
                    return alternative ? (
                      <span
                        key={alternative.id}
                        className="rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-muted-foreground"
                      >
                        {alternative.name} · {alternative.equipment}
                      </span>
                    ) : null;
                  })}
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
