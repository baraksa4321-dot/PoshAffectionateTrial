import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, ArrowRight, Barcode, Heart, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionHeader } from "@/components/ui-app/primitives";
import { searchFoods, toggleFavoriteFood, useGym } from "@/lib/gym-store";
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
  const showCalories = userProfile?.showCalories !== false;
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("הכל");
  const [productType, setProductType] = useState("הכל");
  const [brand, setBrand] = useState("הכל");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          foods
            .map((food) => food.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort((a, b) => a.localeCompare(b, "he")),
    [foods],
  );
  const favoriteIds = useMemo(() => new Set(favoriteFoods), [favoriteFoods]);
  const productTypes = useMemo(
    () =>
      Array.from(
        new Set(
          foods
            .map((food) => food.catalog?.productType)
            .filter((type): type is NonNullable<typeof type> => Boolean(type)),
        ),
      ),
    [foods],
  );
  const brands = useMemo(
    () =>
      Array.from(
        new Set(foods.map((food) => food.brand).filter((value): value is string => Boolean(value))),
      ).sort((a, b) => a.localeCompare(b, "he")),
    [foods],
  );
  const productTypeLabels: Record<string, string> = {
    powder: "אבקות",
    bar: "חטיפים",
    drink: "משקאות",
    pudding: "מעדנים",
    yogurt: "יוגורטים",
    other: "אחר",
  };

  const filtered = useMemo(() => {
    return searchFoods(foods, query)
      .filter(
        (f) =>
          (category === "הכל" || f.category === category) &&
          (productType === "הכל" || f.catalog?.productType === productType) &&
          (brand === "הכל" || f.brand === brand) &&
          (!favoritesOnly || favoriteIds.has(f.id)),
      )
      .sort((a, b) => {
        const commonOrder =
          Number(b.id.startsWith("f-common-")) - Number(a.id.startsWith("f-common-"));
        return commonOrder || a.name.localeCompare(b.name, "he");
      });
  }, [brand, category, favoriteIds, favoritesOnly, foods, productType, query]);

  return (
    <AppShell
      kicker="תזונה"
      title="ספריית מאכלים"
      subtitle={`${foods.length} מוצרים זמינים`}
      pageClassName="nutrition-foods-page"
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
            aria-label={genderText(gender, "הוסיפי מאכל", "הוסף מאכל")}
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      }
    >
      <div className="nutrition-food-library-card">
        <div className="num-pill flex min-h-12 w-full items-center gap-2 px-3.5 py-1">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={genderText(
            gender,
            "חפשי לפי שם, מותג או ברקוד...",
            "חפש לפי שם, מותג או ברקוד...",
          )}
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 outline-none placeholder:text-muted-foreground"
        />
        <Barcode className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
      <label className="mt-2 flex min-h-9 w-full items-center gap-2 text-[11px] font-semibold text-muted-foreground">
        <Barcode className="h-3.5 w-3.5 text-primary" />
        <span className="sr-only">חיפוש ברקוד</span>
        <input
          value={barcode}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "");
            setBarcode(value);
            setQuery(value);
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="אפשר להדביק כאן ברקוד"
          className="min-w-0 flex-1 border-b border-border/60 bg-transparent px-1 py-1.5 text-[12px] leading-5 text-ink outline-none placeholder:text-muted-foreground"
          aria-label="חיפוש לפי ברקוד"
        />
      </label>

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

      {productTypes.length > 0 || brands.length > 0 ? (
        <details className="mt-3 rounded-2xl bg-secondary/60 p-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[12px] font-semibold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            סינון לפי סוג ומותג
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={productType}
              onChange={(event) => setProductType(event.target.value)}
              className="h-10 rounded-xl border-0 bg-background px-3 text-[12px] outline-none"
              aria-label="סינון לפי סוג מוצר"
            >
              <option value="הכל">כל הסוגים</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {productTypeLabels[type] ?? type}
                </option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="h-10 rounded-xl border-0 bg-background px-3 text-[12px] outline-none"
              aria-label="סינון לפי מותג"
            >
              <option value="הכל">כל המותגים</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </details>
      ) : null}

      <SectionHeader
        className="mt-5"
        title={`${filtered.length} תוצאות`}
        subtitle="ערכים לפי מנת הייחוס של כל מאכל"
      />

      <div className="space-y-2">
        {filtered.map((food) => {
          return (
            <div key={food.id} className="nutrition-food-card surface-card flex items-center gap-2 p-3.5">
              <Link
                to="/nutrition/foods/$foodId"
                params={{ foodId: food.id }}
                className="press nutrition-food-card__link min-w-0 flex-1"
              >
                <div className="nutrition-food-card__main flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                    <Apple className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate font-display text-[14.5px] font-semibold text-ink">
                      {food.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                      {food.brand ? `${food.brand} · ` : ""}
                      {food.servingSize}
                    </p>
                  </div>
                </div>
                <div
                  className="nutrition-food-values"
                  aria-label={`ערכים תזונתיים עבור ${food.name}`}
                >
                  {showCalories ? (
                    <div className="nutrition-food-value">
                      <span>קלוריות</span>
                      <strong>{food.calories}</strong>
                    </div>
                  ) : null}
                  <div className="nutrition-food-value">
                    <span>חלבון</span>
                    <strong>{food.protein}g</strong>
                  </div>
                  <div className="nutrition-food-value">
                    <span>פחמימות</span>
                    <strong>{food.carbs}g</strong>
                  </div>
                  <div className="nutrition-food-value">
                    <span>שומן</span>
                    <strong>{food.fat}g</strong>
                  </div>
                  <div className="nutrition-food-value">
                    <span>סיבים</span>
                    <strong>{food.fiber ?? 0}g</strong>
                  </div>
                </div>
                {food.catalog?.barcode ? (
                  <p className="nutrition-food-barcode text-[10px] text-muted-foreground">
                    ברקוד: {food.catalog.barcode}
                  </p>
                ) : null}
              </Link>
              <button
                type="button"
                onClick={() => toggleFavoriteFood(food.id)}
                aria-label={
                  favoriteIds.has(food.id)
                    ? `הסר ${food.name} מהמועדפים`
                    : genderText(
                        gender,
                        `הוסיפי ${food.name} למועדפים`,
                        `הוסף ${food.name} למועדפים`,
                      )
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
      </div>
    </AppShell>
  );
}
