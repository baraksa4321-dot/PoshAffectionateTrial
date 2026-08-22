import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Dumbbell, Plus, Search, Shield, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, Pill, SectionHeader } from "@/components/ui-app/primitives";
import { useGym } from "@/lib/gym-store";
import { EQUIPMENT, MUSCLE_GROUPS } from "@/lib/gym-types";

export const Route = createFileRoute("/exercises/")({
  head: () => ({
    meta: [
      { title: "ספריית תרגילים — הרוטינה שלי" },
      {
        name: "description",
        content: "עייני, הוסיפי, ערכי ונהלי את תרגילי הכושר שלך בספרייה.",
      },
      { property: "og:title", content: "ספריית תרגילים — הרוטינה שלי" },
    ],
  }),
  component: Library,
});

function Library() {
  const { exercises, userProfile } = useGym();
  const navigate = useNavigate();
  const role = userProfile?.role || "client";
  const isCoach = role === "coach" || role === "owner";

  useEffect(() => {
    if (userProfile && !isCoach) {
      navigate({ to: "/" });
    }
  }, [userProfile, isCoach, navigate]);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState("הכל");
  const [equipment, setEquipment] = useState("הכל");
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  const list = exercises.filter(
    (e) =>
      (group === "הכל" || e.muscleGroup === group || (e.muscleGroups ?? []).includes(group)) &&
      (equipment === "הכל" || e.equipment === equipment) &&
      (e.name.toLowerCase().includes(query) ||
        e.equipment.toLowerCase().includes(query) ||
        e.muscleGroup.toLowerCase().includes(query) ||
        (e.customMuscleGroup ?? "").toLowerCase().includes(query) ||
        (e.category ?? "").toLowerCase().includes(query)),
  );

  const activeFilters = (group !== "הכל" ? 1 : 0) + (equipment !== "הכל" ? 1 : 0);

  return (
    <AppShell
      kicker="ספרייה"
      title="תרגילים"
      subtitle={`${exercises.length} תרגילים בספרייה`}
      action={
        <Link
          to="/exercises/$exerciseId"
          params={{ exerciseId: "new" }}
          aria-label="הוסף תרגיל"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground cursor-pointer"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </Link>
      }
    >
      {/* Search */}
      <div className="num-pill flex h-12 items-center gap-2 px-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חפשי לפי שם תרגיל, ציוד או שריר..."
          className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
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
        className="mt-5 text-start"
        title={`${list.length} תרגילים בספרייה`}
        subtitle="לחצי על תרגיל לעריכה ופרטים"
      />

      <div className="space-y-2.5">
        {list.map((e) => {
          const showCustom = e.muscleGroup === "אחר" && e.customMuscleGroup;
          const primary = showCustom ? e.customMuscleGroup! : e.muscleGroup;
          const secondaryCount = (e.muscleGroups?.length ?? 1) - 1;
          return (
            <Link
              key={e.id}
              to="/exercises/$exerciseId"
              params={{ exerciseId: e.id }}
              className="surface-card press flex items-center gap-3.5 p-3.5"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                <Dumbbell className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate font-display text-[15px] font-semibold text-ink">{e.name}</p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {primary}
                  {secondaryCount > 0 ? ` (+${secondaryCount})` : ""}
                  {e.category ? ` · ${e.category}` : ""}
                </p>
              </div>
              <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {e.equipment}
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            </Link>
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
    </AppShell>
  );
}
