// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, ArrowRight, Heart, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, Pill, SectionHeader } from "@/components/ui-app/primitives";
import { searchFoods, toggleFavoriteFood, useGym } from "@/lib/gym-store";
import { nutritionSourceFor } from "@/lib/nutrition-integrity";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/nutrition/foods/")({
  head: () => ({
    meta: [{ title: "ספריית מאכלים — MY routine" }],
  }),
  component: FoodLibrary,
});

function FoodLibrary() {
  const { foods, favoriteFoods, userProfile } = useGym();
  const gender = userProfile?.gender;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("הכל");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const categories = useMemo(
    () =>
      Array.from(new Set(foods.map((food) => food.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "he"),
      ),
    [foods],
  );
  const favoriteIds = useMemo(() => new Set(favoriteFoods), [favoriteFoods]);

  const filtered = useMemo(() => {
    return searchFoods(foods, query)
      .filter(
        (f) =>
          (category === "הכל" || f.category === category) &&
          (!favoritesOnly || favoriteIds.has(f.id)),
      )
      .sort((a, b) => {
        const commonOrder =
          Number(b.id.startsWith("f-common-")) - Number(a.id.startsWith("f-common-"));
        return commonOrder || a.name.localeCompare(b.name, "he");
      });
  }, [category, favoriteIds, favoritesOnly, foods, query]);

  return (
    <AppShell
      kicker="תזונה"
      title="ספריית מאכלים"
      subtitle={`${foods.length} מוצרים זמינים`}
      action={
        <div className="flex gap-2">
          <Link
            to="/nutrition"
            aria-label="חזרה ליומן"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/nutrition/foods/$foodId"
            params={{ foodId: "new" }}
            aria-label="הוסף מאכל"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      }
    >
      <div className="num-pill flex h-12 items-center gap-2 px-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={genderText(gender, "חפשי מאכל בספרייה...", "חפש מאכל בספרייה...")}
          className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFavoritesOnly((current) => !current)}
          aria-pressed={favoritesOnly}
          className={`press inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold ${
            favoritesOnly
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-current" : ""}`} />
          מועדפים
        </button>
        <button
          type="button"
          onClick={() => setCategory("הכל")}
          className={`press shrink-0 rounded-full px-3 py-2 text-[12px] font-semibold ${
            category === "הכל"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          הכל
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setCategory(item)}
            className={`press shrink-0 rounded-full px-3 py-2 text-[12px] font-semibold ${
              category === item
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionHeader
        className="mt-5"
        title={`${filtered.length} תוצאות`}
        subtitle="ערכים לפי מנת הייחוס של כל מאכל"
      />

      <div className="space-y-2">
        {filtered.map((food) => {
          const source = nutritionSourceFor(food);
          return (
            <div key={food.id} className="surface-card flex items-center gap-2 p-3.5">
              <Link
                to="/nutrition/foods/$foodId"
                params={{ foodId: food.id }}
                className="press min-w-0 flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                    <Apple className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate font-display text-[14.5px] font-semibold text-ink">
                      {food.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {food.servingSize} · {food.calories} קלוריות · חלבון {food.protein}g · פחמימות{" "}
                      {food.carbs}g · שומן {food.fat}g · סיבים {food.fiber ?? 0}g
                    </p>
                    <p
                      className={`mt-1 text-[10px] font-semibold ${
                        source.verified ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {source.label}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => toggleFavoriteFood(food.id)}
                aria-label={
                  favoriteIds.has(food.id)
                    ? `הסר ${food.name} מהמועדפים`
                    : `הוסף ${food.name} למועדפים`
                }
                className={`press grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  favoriteIds.has(food.id)
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Heart className={`h-4 w-4 ${favoriteIds.has(food.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="לא נמצאו מאכלים"
          description={genderText(
            gender,
            "לחצי על + כדי ליצור מאכל חדש.",
            "לחץ על + כדי ליצור מאכל חדש.",
          )}
          action={
            <Link
              to="/nutrition/foods/$foodId"
              params={{ foodId: "new" }}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              מאכל חדש
            </Link>
          }
        />
      ) : null}

      <div className="mt-6 hidden">
        <Pill />
      </div>
    </AppShell>
  );
}
