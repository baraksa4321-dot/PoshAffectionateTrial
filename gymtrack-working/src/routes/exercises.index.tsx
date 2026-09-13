import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Dumbbell,
  Check,
  Pencil,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  exerciseDisplayName,
  exerciseEquipmentOptions,
  exerciseFamilyKey,
  exerciseGripOptions,
  renameExerciseLibraryOption,
  type ExerciseLibraryOptionKind,
  uniqueCanonicalExercises,
} from "@/lib/exercise-library";
import { EmptyState, Pill, SectionHeader } from "@/components/ui-app/primitives";
import {
  deleteCableGripOption,
  deleteEquipmentOption,
  deleteExercise,
  flushCloudSync,
  saveExercise,
  useGym,
} from "@/lib/gym-store";
import { CABLE_GRIPS, EQUIPMENT, MUSCLE_GROUPS } from "@/lib/gym-types";
import { genderText } from "@/lib/gender-copy";
import { uploadExerciseLibraryImage } from "@/lib/supabase-sync";

export const Route = createFileRoute("/exercises/")({
  head: () => ({
    meta: [
      { title: "ספריית תרגילים — MY routine" },
      {
        name: "description",
        content: "עיון, הוספה, עריכה וניהול של תרגילי כושר בספרייה.",
      },
      { property: "og:title", content: "ספריית תרגילים — MY routine" },
    ],
  }),
  component: Library,
});

const field =
  "w-full rounded-2xl border border-border/60 bg-secondary px-3.5 py-3 text-[14px] outline-none focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

function Library() {
  const {
    exercises,
    userProfile,
    deletedEquipmentOptions = [],
    deletedCableGripOptions = [],
  } = useGym();
  const navigate = useNavigate();
  const role = userProfile?.role;
  const gender = userProfile?.gender;
  const isCoach = role === "coach" || role === "owner";
  const catalogExercises = uniqueCanonicalExercises(exercises);

  useEffect(() => {
    if (role && !isCoach) {
      navigate({ to: "/" });
    }
  }, [role, isCoach, navigate]);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState("הכל");
  const [equipment, setEquipment] = useState("הכל");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"exercises" | "equipment" | "grips">("exercises");
  const [optionEditor, setOptionEditor] = useState<{
    kind: ExerciseLibraryOptionKind;
    name: string;
    image: string;
  } | null>(null);
  const [optionNameDraft, setOptionNameDraft] = useState("");
  const [optionImageDraft, setOptionImageDraft] = useState("");
  const [optionSaveError, setOptionSaveError] = useState("");
  const [savingOption, setSavingOption] = useState(false);
  const [uploadingOptionImage, setUploadingOptionImage] = useState(false);

  if (role === undefined) {
    return (
      <AppShell title="ספריית תרגילים" kicker="בודקת הרשאות">
        <div className="surface-card mt-4 rounded-3xl p-6 text-center text-sm text-muted-foreground">
          {genderText(gender, "טוענת את תפקיד החשבון המאומת...", "טוען את תפקיד החשבון המאומת...")}
        </div>
      </AppShell>
    );
  }

  if (!isCoach) {
    return (
      <AppShell title="ספריית תרגילים" kicker="גישת מאמן בלבד">
        <div className="surface-card p-6 text-center space-y-4 rounded-3xl mt-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">גישה שמורה למאמנים</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ספריית התרגילים הכללית מנוהלת על ידי המאמן שלך. התרגילים שהוקצו עבורך מופיעים ישירות
            בתוך בלשונית "תוכניות".
          </p>
        </div>
      </AppShell>
    );
  }

  const query = q.toLowerCase();
  const list = catalogExercises.filter(
    (e) =>
      (group === "הכל" || e.muscleGroup === group || (e.muscleGroups ?? []).includes(group)) &&
      (equipment === "הכל" || exerciseEquipmentOptions(e).includes(equipment)) &&
      (exerciseDisplayName(e).toLowerCase().includes(query) ||
        exerciseEquipmentOptions(e).some((option) => option.toLowerCase().includes(query)) ||
        e.muscleGroup.toLowerCase().includes(query) ||
        (e.customMuscleGroup ?? "").toLowerCase().includes(query) ||
        (e.category ?? "").toLowerCase().includes(query)),
  );

  const activeFilters = (group !== "הכל" ? 1 : 0) + (equipment !== "הכל" ? 1 : 0);
  const equipmentNames = Array.from(
    new Set([
      ...EQUIPMENT,
      ...catalogExercises.flatMap((exercise) => exerciseEquipmentOptions(exercise)),
    ]),
  ).filter((name) => !deletedEquipmentOptions.includes(name));
  const equipmentRows = equipmentNames
    .map((name) => {
      const linkedExercises = catalogExercises.filter((exercise) =>
        exerciseEquipmentOptions(exercise).includes(name),
      );
      return {
        name,
        count: linkedExercises.length,
        image: linkedExercises
          .map((exercise) => exercise.equipmentImages?.[name]?.trim())
          .find(Boolean),
      };
    })
    .filter((row) => row.name.toLocaleLowerCase().includes(query));
  const gripNames = Array.from(
    new Set([
      ...CABLE_GRIPS,
      ...catalogExercises.flatMap((exercise) => exerciseGripOptions(exercise)),
    ]),
  ).filter((name) => !deletedCableGripOptions.includes(name));
  const gripRows = gripNames
    .map((name) => {
      const linkedExercises = catalogExercises.filter(
        (exercise) =>
          exerciseEquipmentOptions(exercise).includes("פולי / כבלים") &&
          exerciseGripOptions(exercise).includes(name),
      );
      return {
        name,
        count: linkedExercises.length,
        image: linkedExercises
          .map((exercise) => exercise.cableGripImages?.[name]?.trim())
          .find(Boolean),
      };
    })
    .filter((row) => row.name.toLocaleLowerCase().includes(query));

  const confirmDelete = (message: string) =>
    typeof window === "undefined" || window.confirm(message);
  const openOptionEditor = (
    kind: ExerciseLibraryOptionKind,
    name: string,
    image: string | undefined,
  ) => {
    setOptionEditor({ kind, name, image: image ?? "" });
    setOptionNameDraft(name);
    setOptionImageDraft(image ?? "");
    setOptionSaveError("");
  };
  const closeOptionEditor = () => {
    if (savingOption || uploadingOptionImage) return;
    setOptionEditor(null);
    setOptionSaveError("");
  };
  const handleOptionImageUpload = async (file: File | undefined) => {
    if (!file || !optionEditor || uploadingOptionImage) return;
    setOptionSaveError("");
    setUploadingOptionImage(true);
    try {
      const url = await uploadExerciseLibraryImage(file, { kind: optionEditor.kind });
      setOptionImageDraft(url);
    } catch (error) {
      setOptionSaveError(error instanceof Error ? error.message : "העלאת התמונה נכשלה.");
    } finally {
      setUploadingOptionImage(false);
    }
  };
  const handleSaveOption = async () => {
    if (!optionEditor || savingOption || uploadingOptionImage) return;
    const nextName = optionNameDraft.trim();
    if (!nextName) {
      setOptionSaveError("יש להזין שם לפני השמירה.");
      return;
    }
    setOptionSaveError("");
    setSavingOption(true);
    try {
      const updatedExercises = exercises.map((exercise) =>
        renameExerciseLibraryOption(
          exercise,
          optionEditor.kind,
          optionEditor.name,
          nextName,
          optionImageDraft,
        ),
      );
      updatedExercises.forEach((exercise, index) => {
        if (exercise !== exercises[index]) saveExercise(exercise);
      });
      if (optionEditor.name !== nextName) {
        if (optionEditor.kind === "equipment") deleteEquipmentOption(optionEditor.name);
        else deleteCableGripOption(optionEditor.name);
      }
      const syncResult = await flushCloudSync();
      if (!syncResult.success) {
        setOptionSaveError(syncResult.error || "השמירה בענן נכשלה. אפשר לנסות שוב.");
        return;
      }
      setOptionEditor(null);
    } catch (error) {
      setOptionSaveError(error instanceof Error ? error.message : "שמירת האפשרות נכשלה.");
    } finally {
      setSavingOption(false);
    }
  };
  const handleDeleteExercise = (exercise: (typeof catalogExercises)[number]) => {
    if (
      !confirmDelete(
        `למחוק את "${exerciseDisplayName(exercise)}" מהספרייה? הפעולה תסיר גם גרסאות ציוד זהות.`,
      )
    ) {
      return;
    }
    const family = exerciseFamilyKey(exercise);
    exercises
      .filter((candidate) => exerciseFamilyKey(candidate) === family)
      .forEach((candidate) => deleteExercise(candidate.id));
  };

  return (
    <AppShell
      kicker="ספרייה"
      title="תרגילים"
      subtitle={`${catalogExercises.length} תנועות בספרייה`}
      action={
        <Link
          to="/exercises/$exerciseId"
          params={{ exerciseId: "new" }}
          aria-label={genderText(gender, "הוסיפי תרגיל", "הוסף תרגיל")}
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground cursor-pointer"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </Link>
      }
    >
      {/* Search */}
      <div className="num-pill flex min-h-12 w-full items-center gap-2 px-3.5 py-1">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={genderText(
            gender,
            "חפשי לפי שם תרגיל, ציוד או שריר...",
            "חפש לפי שם תרגיל, ציוד או שריר...",
          )}
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="press relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary cursor-pointer"
          aria-label="סינון"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilters > 0 ? (
            <span className="absolute -top-0.5 -end-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilters}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 rounded-2xl bg-secondary p-1 text-[12px] font-bold">
        {(
          [
            ["exercises", "מאגר תרגילים"],
            ["equipment", "מאגר מכשירים"],
            ["grips", "מאגר מאחזים"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-2 py-2 transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "exercises" ? (
        <>
          {/* Active filter chips */}
          {(group !== "הכל" || equipment !== "הכל") && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {group !== "הכל" ? (
            <Pill active onClick={() => setGroup("הכל")} variant="sage">
              {group}
              <span className="text-[12px] leading-none">×</span>
            </Pill>
          ) : null}
          {equipment !== "הכל" ? (
            <Pill active onClick={() => setEquipment("הכל")} variant="rose">
              {equipment}
              <span className="text-[12px] leading-none">×</span>
            </Pill>
          ) : null}
        </div>
      )}

          {/* Filter rail */}
          {filtersOpen ? (
        <div className="surface-card mt-3 p-4 text-start">
          <SectionHeader title="סינון לפי שריר" className="mb-2" />
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
            {["הכל", ...MUSCLE_GROUPS].map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`press shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                  group === g
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <SectionHeader title="סינון לפי ציוד" className="mb-2 mt-3" />
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
            {["הכל", ...EQUIPMENT].map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipment(eq)}
                className={`press shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                  equipment === eq
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <SectionHeader
        className="mt-4 text-start"
        title={`${list.length} תרגילים בספרייה`}
        subtitle={genderText(gender, "לחצי על תרגיל לעריכה ופרטים", "לחץ על תרגיל לעריכה ופרטים")}
      />

      <div className="space-y-2">
        {list.map((e) => {
          const showCustom = e.muscleGroup === "אחר" && e.customMuscleGroup;
          const primary = showCustom ? e.customMuscleGroup! : e.muscleGroup;
          const secondaryCount = (e.muscleGroups?.length ?? 1) - 1;
          return (
            <div key={e.id} className="surface-card flex items-center gap-2 p-3">
              <Link
                to="/exercises/$exerciseId"
                params={{ exerciseId: e.id }}
                className="press flex min-w-0 flex-1 items-center gap-3.5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-soft text-primary">
                  <Dumbbell className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate font-display text-[15px] font-semibold text-ink">
                    {exerciseDisplayName(e)}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {primary}
                    {e.equipmentOptions && e.equipmentOptions.length > 1 ? (
                      <span className="ms-1">· {e.equipmentOptions.join(" · ")}</span>
                    ) : null}
                    {secondaryCount > 0 ? ` (+${secondaryCount})` : ""}
                    {e.category ? ` · ${e.category}` : ""}
                  </p>
                </div>
                <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {e.equipment}
                </span>
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteExercise(e)}
                aria-label={`מחיקת ${exerciseDisplayName(e)}`}
                className="press grid h-8 w-8 shrink-0 place-items-center rounded-xl text-muted-foreground/70 hover:bg-red-50 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="לא נמצאו תרגילים"
          description={
            q || activeFilters > 0
              ? "נסי לשנות את החיפוש או הסינון."
              : "התחילי לבנות את ספריית התרגילים שלך."
          }
          action={
            <Link
              to="/exercises/$exerciseId"
              params={{ exerciseId: "new" }}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              תרגיל חדש
            </Link>
          }
        />
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader
            className="mt-5 text-start"
            title={activeTab === "equipment" ? "מאגר מכשירים וציוד" : "מאגר מאחזים לכבלים"}
            subtitle={
              activeTab === "equipment"
                ? `${equipmentRows.length} סוגי ציוד זמינים לבחירה`
                : `${gripRows.length} סוגי מאחזים זמינים לבחירה`
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {(activeTab === "equipment" ? equipmentRows : gripRows).map((row) => (
              <div
                key={row.name}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openOptionEditor(
                    activeTab === "equipment" ? "equipment" : "grip",
                    row.name,
                    row.image,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openOptionEditor(
                    activeTab === "equipment" ? "equipment" : "grip",
                    row.name,
                    row.image,
                  );
                }}
                className="surface-card flex cursor-pointer items-center gap-3 p-3.5 text-start transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {row.image ? (
                  <img
                    src={row.image}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-2xl border border-border/40 object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                    <Dumbbell className="h-6 w-6" strokeWidth={1.7} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-semibold text-ink">{row.name}</p>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    מופיע ב־{row.count} {row.count === 1 ? "תרגיל" : "תרגילים"}
                  </p>
                  {!row.image ? (
                    <p className="mt-1 text-[10.5px] text-muted-foreground">
                      הוסיפי תמונה מתוך עריכת תרגיל שמשתמש באפשרות הזו.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (
                      confirmDelete(
                        `למחוק את "${row.name}" ממאגר ${
                          activeTab === "equipment" ? "המכשירים" : "המאחזים"
                        }? הוא לא יוצג בבחירות חדשות.`,
                      )
                    ) {
                      if (activeTab === "equipment") deleteEquipmentOption(row.name);
                      else deleteCableGripOption(row.name);
                    }
                  }}
                  aria-label={`מחיקת ${row.name}`}
                  className="press grid h-8 w-8 shrink-0 place-items-center rounded-xl text-muted-foreground/70 hover:bg-red-50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Pencil className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              </div>
            ))}
          </div>
        </>
      )}
      {optionEditor ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOptionEditor();
          }}
        >
          <div
            className="surface-card max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-library-option-dialog-title"
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {optionEditor.kind === "equipment" ? "עריכת מכשיר / ציוד" : "עריכת מאחז"}
                </p>
                <h2
                  id="exercise-library-option-dialog-title"
                  className="mt-1 font-display text-xl font-bold text-ink"
                >
                  {optionEditor.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeOptionEditor}
                className="press grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground"
                aria-label="סגירה"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>שם</label>
                <input
                  className={field}
                  value={optionNameDraft}
                  onChange={(event) => setOptionNameDraft(event.target.value)}
                  placeholder="למשל: מוט אולימפי"
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>תמונה</label>
                <p className="mb-2 text-[11.5px] text-muted-foreground">
                  הדביקי קישור ישיר לתמונה. היא תופיע בכל התרגילים שמשתמשים באפשרות הזו.
                </p>
                <input
                  className={field}
                  value={optionImageDraft}
                  onChange={(event) => setOptionImageDraft(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  inputMode="url"
                  dir="ltr"
                />
                <label className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs font-semibold text-primary">
                  {uploadingOptionImage ? "מעלה תמונה..." : "או לבחור תמונה מהמכשיר"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingOptionImage}
                    onChange={(event) => {
                      void handleOptionImageUpload(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {optionImageDraft.trim() ? (
                  <img
                    src={optionImageDraft.trim()}
                    alt={`תצוגה מקדימה עבור ${optionNameDraft || optionEditor.name}`}
                    className="mt-3 h-40 w-full rounded-2xl border border-border/50 bg-secondary object-cover"
                  />
                ) : null}
              </div>
              {optionSaveError ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {optionSaveError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleSaveOption}
                disabled={savingOption || uploadingOptionImage}
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {savingOption ? "שומר..." : "שמור שינויים"}
              </button>
              <button
                type="button"
                onClick={closeOptionEditor}
                disabled={savingOption || uploadingOptionImage}
                className="press h-12 rounded-2xl bg-secondary px-5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
