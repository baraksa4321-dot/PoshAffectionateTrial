import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowLeft,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings2,
  ShoppingBag,
  Shuffle,
  Sparkles,
  Square,
  Trash2,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { Overlay } from "@/components/ui-app/Overlay";
import {
  Card,
  IconButton,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui-app/primitives";
import {
  addFoodToMeal,
  addMeal,
  dayTotals,
  findFoodReplacements,
  foodTotals,
  mealFoodFromLibrary,
  nutritionDay,
  removeMealFood,
  renameMeal,
  saveNutritionTargets,
  searchFoods,
  todayKey,
  updateMealFood,
  useGym,
} from "@/lib/gym-store";
import type { MealFood } from "@/lib/gym-types";
import { nutritionSourceFor } from "@/lib/nutrition-integrity";
import { RECIPE_LIBRARY, type RecipeDefinition } from "@/lib/recipe-library";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/nutrition/")({
  head: () => ({
    meta: [{ title: "יומן תזונה — הרוטינה שלי" }],
  }),
  component: NutritionLog,
});

function shiftDate(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y!, m! - 1, d);
  date.setDate(date.getDate() + delta);
  return todayKey(date);
}

function formatDayLabel(key: string) {
  const today = todayKey();
  if (key === today) return "היום";
  const yesterday = shiftDate(today, -1);
  if (key === yesterday) return "אתמול";
  const prevYesterday = shiftDate(today, -2);
  if (key === prevYesterday) return "לפני יומיים";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y!, m! - 1, d);
  return date.toLocaleDateString("he-IL", { weekday: "short", month: "short", day: "numeric" });
}

function NutritionLog() {
  const gym = useGym();
  const gender = gym.userProfile?.gender;
  const [date, setDate] = useState(todayKey());
  const [pickerMealId, setPickerMealId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerFoodId, setPickerFoodId] = useState<string | null>(null);
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [substituteFor, setSubstituteFor] = useState<{
    mealId: string;
    food: MealFood;
  } | null>(null);
  const [substituteQuery, setSubstituteQuery] = useState("");
  const [showTargets, setShowTargets] = useState(false);
  const [targetsDraft, setTargetsDraft] = useState(gym.nutritionTargets);

  // New smart nutrition features state
  const [showWhatToEat, setShowWhatToEat] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [suggestionMealId, setSuggestionMealId] = useState<string>("");
  const [showRecipes, setShowRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDefinition | null>(null);
  const [recipeCategory, setRecipeCategory] = useState<RecipeDefinition["category"] | "הכל">("הכל");

  const day = nutritionDay(gym, date);
  const totals = dayTotals(day);
  const { nutritionTargets: targets } = gym;

  // Compute remaining macros for "What should I eat now?"
  const remainingCal = Math.max(0, (targets.calories || 2000) - totals.calories);
  const remainingProt = Math.max(0, (targets.protein || 140) - totals.protein);
  const remainingCarbs = Math.max(0, (targets.carbs || 200) - totals.carbs);
  const remainingFat = Math.max(0, (targets.fat || 65) - totals.fat);

  // Smart Food Suggestions based on remaining macros
  const suggestedFoods = useMemo(() => {
    return gym.foods
      .filter((f) => f.calories <= remainingCal + 100 && f.calories > 0)
      .map((f) => ({
        food: f,
        protDiff: Math.abs(f.protein - remainingProt),
        score: Math.abs(f.calories - remainingCal),
      }))
      .sort((a, b) => a.score - b.score || a.protDiff - b.protDiff)
      .slice(0, 8);
  }, [gym.foods, remainingCal, remainingProt]);

  // Generate Automatic Shopping List from planned foods
  const shoppingListItems = useMemo(() => {
    const map = new Map<string, { name: string; category: string; count: number }>();
    day.meals.forEach((m) => {
      m.foods.forEach((f) => {
        const key = f.name;
        const existing = map.get(key);
        if (existing) {
          existing.count += f.quantity;
        } else {
          map.set(key, { name: f.name, category: "מוצרי תזונה", count: f.quantity });
        }
      });
    });
    return Array.from(map.values());
  }, [day.meals]);

  const filteredFoods = useMemo(() => {
    return searchFoods(gym.foods, pickerQuery).sort((a, b) => {
      const commonOrder =
        Number(b.id.startsWith("f-common-")) - Number(a.id.startsWith("f-common-"));
      return commonOrder || a.name.localeCompare(b.name, "he");
    });
  }, [gym.foods, pickerQuery]);

  const replacements = useMemo(() => {
    if (!substituteFor) return [];
    return findFoodReplacements(gym.foods, substituteFor.food, substituteQuery).slice(0, 15);
  }, [gym.foods, substituteFor, substituteQuery]);

  const closeFoodPicker = () => {
    setPickerMealId(null);
    setPickerFoodId(null);
    setPickerQuantity(1);
    setPickerQuery("");
  };

  const openFoodPicker = (mealId: string) => {
    setPickerMealId(mealId);
    setPickerFoodId(null);
    setPickerQuantity(1);
    setPickerQuery("");
  };

  const addFromLibrary = (mealId: string, foodId: string, quantity: number) => {
    const lib = gym.foods.find((f) => f.id === foodId);
    if (!lib || quantity <= 0) return;
    addFoodToMeal(date, mealId, { ...mealFoodFromLibrary(lib), quantity });
    closeFoodPicker();
  };

  const applyCalorieReplacement = (
    mealId: string,
    current: MealFood,
    replacement: {
      food: (typeof gym.foods)[0];
      calculatedQuantity: number;
      calculatedGrams: number | null;
    },
  ) => {
    const lib = replacement.food;
    updateMealFood(date, mealId, {
      id: current.id,
      foodId: lib.id,
      name: lib.name,
      servingSize: lib.servingSize,
      quantity: replacement.calculatedQuantity,
      calories: lib.calories,
      protein: lib.protein,
      carbs: lib.carbs,
      fat: lib.fat,
      fiber: lib.fiber,
      notes: current.notes,
    });
    setSubstituteFor(null);
    setSubstituteQuery("");
  };

  const calPct =
    targets.calories && targets.calories > 0
      ? Math.min(100, (totals.calories / targets.calories) * 100)
      : null;

  return (
    <AppShell
      kicker="תזונה"
      title="יומן תזונה"
      subtitle={formatDayLabel(date)}
      action={
        <div className="flex gap-1.5">
          <Link
            to="/nutrition/foods"
            aria-label="ספריית מאכלים"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <BookOpen className="h-5 w-5" />
          </Link>
          <IconButton
            aria-label="הגדר יעדים"
            onClick={() => {
              setTargetsDraft(gym.nutritionTargets);
              setShowTargets(true);
            }}
          >
            <Settings2 className="h-5 w-5" />
          </IconButton>
        </div>
      }
    >
      {/* Date selector */}
      <div className="surface-card flex items-center justify-between gap-2 p-2.5">
        <button
          type="button"
          aria-label="יום קודם"
          onClick={() => setDate((d) => shiftDate(d, -1))}
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-secondary cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-[16px] font-semibold text-ink">{formatDayLabel(date)}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">{date}</p>
        </div>
        <button
          type="button"
          aria-label="יום הבא"
          onClick={() => setDate((d) => shiftDate(d, 1))}
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-secondary cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Action Tools: "What should I eat now?" & "Shopping List" */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={() => {
            setSuggestionMealId(day.meals[0]?.id ?? "");
            setShowWhatToEat(true);
          }}
          className="surface-card p-3 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-2 text-primary font-bold text-xs cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>מה לאכול עכשיו?</span>
        </button>

        <button
          onClick={() => setShowShoppingList(true)}
          className="surface-card p-3 rounded-2xl border border-border/60 flex items-center gap-2 text-ink font-bold text-xs cursor-pointer hover:bg-secondary/60 transition-colors"
        >
          <ShoppingBag className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>רשימת קניות</span>
        </button>
      </div>

      {/* Secondary recipe library */}
      <section className="mt-3 rounded-2xl border border-border/60 bg-card/70">
        <button
          type="button"
          onClick={() => setShowRecipes((open) => !open)}
          aria-expanded={showRecipes}
          className="flex w-full items-center justify-between gap-3 p-3 text-start"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-bold text-ink">מתכונים</span>
              <span className="block text-[10px] text-muted-foreground">
                רעיונות קלים עם ערכים תזונתיים
              </span>
            </span>
          </span>
          <span className="text-[11px] font-bold text-primary">
            {showRecipes ? "סגירה" : `${RECIPE_LIBRARY.length} מתכונים`}
          </span>
        </button>
        {showRecipes ? (
          <div className="border-t border-border/50 px-3 pb-3 pt-2">
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {(["הכל", "עתיר חלבון", "דל שומן", "ארוחה קלה", "מתוק מאוזן"] as const).map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setRecipeCategory(category)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      recipeCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RECIPE_LIBRARY.filter(
                (recipe) => recipeCategory === "הכל" || recipe.category === recipeCategory,
              ).map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="rounded-xl border border-border/60 bg-white/60 p-2.5 text-start transition-colors hover:border-primary/50"
                >
                  <span className="block truncate text-xs font-bold text-ink">{recipe.name}</span>
                  <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                    {recipe.category} · {recipe.nutrition.calories} קל׳
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {selectedRecipe ? (
        <Overlay
          open={Boolean(selectedRecipe)}
          onClose={() => setSelectedRecipe(null)}
          variant="bottom"
          ariaLabel={`מתכון ${selectedRecipe.name}`}
        >
          <div className="space-y-4 p-5 text-start" dir="rtl">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {selectedRecipe.category}
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                  {selectedRecipe.name}
                </h2>
              </div>
              <IconButton aria-label="סגור מתכון" onClick={() => setSelectedRecipe(null)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-primary/10 p-2 text-center">
                <span className="block text-[10px] text-muted-foreground">קלוריות</span>
                <strong className="text-sm text-ink">{selectedRecipe.nutrition.calories}</strong>
              </div>
              <div className="rounded-xl bg-primary/10 p-2 text-center">
                <span className="block text-[10px] text-muted-foreground">חלבון</span>
                <strong className="text-sm text-ink">{selectedRecipe.nutrition.protein} ג׳</strong>
              </div>
              <div className="rounded-xl bg-primary/10 p-2 text-center">
                <span className="block text-[10px] text-muted-foreground">שומן</span>
                <strong className="text-sm text-ink">{selectedRecipe.nutrition.fat} ג׳</strong>
              </div>
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-bold text-ink">מצרכים</h3>
              <ul className="list-disc space-y-1 pe-4 text-xs text-muted-foreground">
                {selectedRecipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-bold text-ink">הוראות הכנה</h3>
              <ol className="list-decimal space-y-1 pe-4 text-xs leading-relaxed text-muted-foreground">
                {selectedRecipe.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            </div>
            <p className="border-s-2 border-primary/30 ps-2 text-[10px] leading-relaxed text-muted-foreground">
              הערכים הם אומדן למנה ויכולים להשתנות לפי המותג, הכמות ואופן ההכנה.
            </p>
          </div>
        </Overlay>
      ) : null}

      {/* Daily total */}
      <div className="rose-card mt-4 overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-start">
            <p className="text-[10.5px] font-semibold tracking-[0.16em] text-rose uppercase">
              קלוריות היום
            </p>
            <p className="mt-1 font-display text-[40px] font-semibold leading-none text-ink tabular-nums">
              {Math.round(totals.calories)}
            </p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {targets.calories ? `מתוך ${targets.calories} קלוריות` : "ללא יעד יומי"}
            </p>
          </div>
          <CalRing pct={calPct ?? 0} />
        </div>
        {calPct != null ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${calPct}%` }}
            />
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          <MacroPill label="חלבון" value={totals.protein} target={targets.protein} unit="g" />
          <MacroPill label="פחמימה" value={totals.carbs} target={targets.carbs} unit="g" />
          <MacroPill label="שומן" value={totals.fat} target={targets.fat} unit="g" />
          <MacroPill label="סיבים" value={totals.fiber} target={targets.fiber || 25} unit="g" />
        </div>
      </div>
      <p className="mt-2 border-s border-primary/35 px-3 text-[11px] leading-relaxed text-muted-foreground">
        החישוב ביומן מתבסס על ערכי כל מאכל לפי מנת הייחוס שלו ומתרחב בדיוק לפי הכמות שנבחרה.
      </p>

      {day.plannedMeals && day.plannedMeals.length > 0 ? (
        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="section-kicker text-primary">תפריט מהמאמן</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                התפריט המתוכנן שלך
              </h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              לצפייה
            </span>
          </div>
          <div className="space-y-2.5">
            {day.plannedMeals.map((meal) => {
              const plannedTotals = foodTotals(meal.foods);
              return (
                <article
                  key={meal.id}
                  className="surface-card overflow-hidden border-primary/15 bg-primary/[0.035] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-[15px] font-bold text-ink">{meal.name}</h3>
                    <span className="text-[11px] font-semibold text-primary">
                      {Math.round(plannedTotals.calories)} קלוריות
                    </span>
                  </div>
                  {meal.foods.length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      {meal.foods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2 text-start"
                        >
                          <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
                            {food.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            × {food.quantity} · {Math.round(food.calories * food.quantity)} קל׳
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      המאמן טרם הוסיף מאכלים.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <p className="mt-2 border-s border-primary/35 px-3 text-[11px] leading-relaxed text-muted-foreground">
            זהו המתווה שהמאמן הכין עבורך. אפשר לתעד את מה שאכלת בפועל באזור היומן למטה.
          </p>
        </section>
      ) : null}

      {/* Meals */}
      <section className="mt-6">
        <SectionHeader
          title="הארוחות שלך"
          subtitle={`${day.meals.length} ארוחות תועדו`}
          action={
            <button
              type="button"
              onClick={() => addMeal(date)}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
              {genderText(gender, "הוסיפי ארוחה", "הוסף ארוחה")}
            </button>
          }
        />

        <div className="space-y-3">
          {day.meals.map((meal) => {
            const mealTotals = foodTotals(meal.foods);
            return (
              <section key={meal.id} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream text-ink-soft">
                    <Utensils className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <input
                      className="w-full bg-transparent font-display text-[16px] font-semibold text-ink outline-none placeholder:text-muted-foreground"
                      value={meal.name}
                      onChange={(e) => renameMeal(date, meal.id, e.target.value)}
                    />
                    <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">
                      {Math.round(mealTotals.calories)} קלוריות · חלבון{" "}
                      {Math.round(mealTotals.protein)}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openFoodPicker(meal.id)}
                    className="press grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground cursor-pointer"
                    aria-label="הוסף מאכל"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </div>

                {meal.foods.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {meal.foods.map((food) => (
                      <article
                        key={food.id}
                        className="rounded-2xl border border-border/40 bg-secondary/60 p-3 text-start"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-ink">
                              {food.name}
                            </p>
                            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                              {food.servingSize} · {Math.round(food.calories * food.quantity)} קל׳ ·{" "}
                              {Math.round(food.protein * food.quantity)}ח׳ ·{" "}
                              {Math.round(food.carbs * food.quantity)}פ׳ ·{" "}
                              {Math.round(food.fat * food.quantity)}ש׳ · סיבים{" "}
                              {Math.round((food.fiber ?? 0) * food.quantity)}ג׳
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label="החלף מאכל"
                            onClick={() => setSubstituteFor({ mealId: meal.id, food })}
                            className="press grid h-8 w-8 place-items-center rounded-xl text-primary hover:bg-white cursor-pointer"
                            title="החלף לי"
                          >
                            <Shuffle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="הסר מאכל"
                            onClick={() => removeMealFood(date, meal.id, food.id)}
                            className="press grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-white hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2.5 grid grid-cols-2 gap-2">
                          <Stepper
                            label="כמות"
                            value={food.quantity}
                            step={0.5}
                            onChange={(v) =>
                              updateMealFood(date, meal.id, { id: food.id, quantity: v })
                            }
                          />
                          <div className="rounded-2xl bg-white/60 px-3 py-2.5 text-start">
                            <p className="text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                              סה״כ
                            </p>
                            <p className="mt-0.5 font-display text-[15px] font-semibold tabular-nums text-ink">
                              {Math.round(food.calories * food.quantity)}
                              <span className="ms-0.5 text-[11px] font-normal text-muted-foreground">
                                קל
                              </span>
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12.5px] text-muted-foreground text-start">
                    אין מאכלים בארוחה זו עדיין.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {/* "What Should I Eat Now?" Modal */}
      {showWhatToEat && (
        <Overlay
          open={showWhatToEat}
          onClose={() => setShowWhatToEat(false)}
          ariaLabel="מה לאכול עכשיו?"
          variant="center"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-3 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> מה לאכול עכשיו?
              </h3>
              <button
                onClick={() => setShowWhatToEat(false)}
                className="text-muted-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-primary/5 p-3 text-xs space-y-1">
              <p className="font-bold text-ink">יתרה להיום לפי היעד:</p>
              <div className="grid grid-cols-4 gap-1 text-center font-semibold pt-1">
                <span className="bg-white p-1 rounded-md text-ink">{remainingCal} קל'</span>
                <span className="bg-white p-1 rounded-md text-emerald-700">
                  {remainingProt}g חלבון
                </span>
                <span className="bg-white p-1 rounded-md text-amber-700">
                  {remainingCarbs}g פחמימה
                </span>
                <span className="bg-white p-1 rounded-md text-rose-700">{remainingFat}g שומן</span>
              </div>
            </div>

            <p className="text-xs font-bold text-muted-foreground">הצעות מובילות מהספרייה:</p>
            {day.meals.length > 0 ? (
              <label className="block text-[11.5px] font-semibold text-muted-foreground">
                הוספה לארוחה
                <select
                  value={suggestionMealId}
                  onChange={(event) => setSuggestionMealId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  {day.meals.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {suggestedFoods.map(({ food }) => (
                <button
                  key={food.id}
                  type="button"
                  disabled={!suggestionMealId}
                  onClick={() => {
                    if (!suggestionMealId) return;
                    addFoodToMeal(date, suggestionMealId, mealFoodFromLibrary(food));
                    setShowWhatToEat(false);
                  }}
                  className="w-full p-2.5 rounded-xl border border-border/60 bg-secondary/40 flex items-center justify-between gap-2 text-start text-xs hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div>
                    <p className="font-bold text-ink">{food.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {food.servingSize} · {food.calories} קל' · {food.protein}g חלבון
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 font-bold text-primary">
                    הוספה
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Overlay>
      )}

      {/* Automatic Shopping List Modal */}
      {showShoppingList && (
        <Overlay
          open={showShoppingList}
          onClose={() => setShowShoppingList(false)}
          ariaLabel="רשימת קניות"
          variant="center"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-5 shadow-2xl space-y-3 text-start max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" /> רשימת קניות אוטומטית
              </h3>
              <button
                onClick={() => setShowShoppingList(false)}
                className="text-muted-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {shoppingListItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                הרשימה ריקה. תכנני ארוחות ביומן ליצירת רשימה אוטומטית.
              </p>
            ) : (
              <div className="space-y-2">
                {shoppingListItems.map((item) => {
                  const isChecked = checkedItems[item.name] || false;

                  return (
                    <div
                      key={item.name}
                      onClick={() =>
                        setCheckedItems((prev) => ({ ...prev, [item.name]: !isChecked }))
                      }
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isChecked
                          ? "bg-muted/40 line-through opacity-60"
                          : "bg-secondary/50 font-bold"
                      }`}
                    >
                      <span>
                        {item.name} ({item.count} יחידות/מנות)
                      </span>
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* Picker bottom-sheet */}
      {pickerMealId ? (
        <Overlay
          open={Boolean(pickerMealId)}
          onClose={closeFoodPicker}
          ariaLabel="ספריית מאכלים"
          variant="bottom"
          panelClassName="bg-transparent p-0 shadow-none overflow-visible"
          className="fade-in"
        >
          <div
            className="scale-in max-h-[calc(100dvh-1rem)] min-h-[min(32rem,calc(100dvh-1rem))] overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  {genderText(gender, "הוסיפי מאכל", "הוסף מאכל")}
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  ספריית מאכלים
                </h2>
              </div>
              <IconButton aria-label="סגור" onClick={closeFoodPicker}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="num-pill mb-3 flex h-12 items-center gap-2 px-3.5">
              <Apple className="h-4 w-4 text-muted-foreground" />
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder={genderText(
                  gender,
                  "חפשי מאכל, מותג או קטגוריה...",
                  "חפש מאכל, מותג או קטגוריה...",
                )}
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>
            {pickerFoodId ? (
              (() => {
                const selectedFood = gym.foods.find((food) => food.id === pickerFoodId);
                if (!selectedFood) return null;
                const source = nutritionSourceFor(selectedFood);
                return (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPickerFoodId(null)}
                      className="text-[12px] font-semibold text-primary hover:underline"
                    >
                      חזרה לבחירת מאכל
                    </button>
                    <div className="rounded-2xl bg-secondary p-3.5">
                      <p className="text-[15px] font-bold text-ink">{selectedFood.name}</p>
                      <p className="mt-1 text-[11.5px] text-muted-foreground">
                        {selectedFood.servingSize} למנה · {selectedFood.calories} קל׳ · חלבון{" "}
                        {selectedFood.protein}ג׳ · פחמימות {selectedFood.carbs}ג׳ · שומן{" "}
                        {selectedFood.fat}ג׳ · סיבים {selectedFood.fiber ?? 0}ג׳
                      </p>
                      <p
                        className={`mt-1.5 text-[10.5px] font-semibold ${source.verified ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {source.label}
                      </p>
                    </div>
                    <Stepper
                      label="כמות מנות"
                      value={pickerQuantity}
                      step={0.5}
                      min={0.5}
                      onChange={setPickerQuantity}
                    />
                    <div className="rounded-2xl bg-primary/10 px-3.5 py-3 text-[12px] text-ink">
                      <p>
                        סה״כ: {Math.round(selectedFood.calories * pickerQuantity)} קל׳ · חלבון{" "}
                        {Math.round(selectedFood.protein * pickerQuantity)}ג׳ · פחמימות{" "}
                        {Math.round(selectedFood.carbs * pickerQuantity)}ג׳ · שומן{" "}
                        {Math.round(selectedFood.fat * pickerQuantity)}ג׳ · סיבים{" "}
                        {Math.round((selectedFood.fiber ?? 0) * pickerQuantity)}ג׳
                      </p>
                    </div>
                    <PrimaryButton
                      className="w-full"
                      onClick={() => addFromLibrary(pickerMealId, selectedFood.id, pickerQuantity)}
                    >
                      הוספה לארוחה
                    </PrimaryButton>
                  </div>
                );
              })()
            ) : (
              <div className="space-y-2">
                <p
                  className="px-1 text-[11.5px] font-semibold text-muted-foreground"
                  aria-live="polite"
                >
                  נמצאו {filteredFoods.length} מאכלים
                </p>
                {filteredFoods.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/70 p-4 text-center text-[13px] text-muted-foreground">
                    לא נמצאו מאכלים מתאימים. נסי מונח אחר או קטגוריה אחרת.
                  </p>
                ) : null}
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => setPickerFoodId(food.id)}
                    className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/30 bg-secondary px-3.5 py-3 text-start cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{food.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {food.servingSize} · {food.calories} קלוריות · חלבון {food.protein}g · סיבים{" "}
                        {food.fiber || 0}g
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Overlay>
      ) : null}

      {/* Calorie-based replacement */}
      {substituteFor ? (
        <Overlay
          open={Boolean(substituteFor)}
          onClose={() => setSubstituteFor(null)}
          ariaLabel="החלפת מאכל"
          variant="bottom"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="scale-in max-h-[88dvh] overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  החלפת מזון לפי קלוריות
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  {substituteFor.food.name}
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  תקציב ההחלפה:
                  <span className="ms-1 font-bold text-ink">
                    {Math.round(substituteFor.food.calories * (substituteFor.food.quantity || 1))}{" "}
                    קלוריות
                  </span>
                </p>
              </div>
              <IconButton aria-label="סגור" onClick={() => setSubstituteFor(null)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="num-pill mb-3 flex h-11 items-center gap-2 px-3.5">
              <Apple className="h-4 w-4 text-muted-foreground" />
              <input
                value={substituteQuery}
                onChange={(e) => setSubstituteQuery(e.target.value)}
                placeholder={genderText(
                  gender,
                  "חפשי מאכל חלופי (למשל: תפוח אדמה)...",
                  "חפש מאכל חלופי (למשל: תפוח אדמה)...",
                )}
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
            <div className="space-y-2">
              {replacements.map((item) => (
                <button
                  key={item.food.id}
                  type="button"
                  onClick={() =>
                    applyCalorieReplacement(substituteFor.mealId, substituteFor.food, item)
                  }
                  className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/30 bg-secondary px-3.5 py-3 text-start cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">{item.food.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {item.calculatedCalories} קל׳ · חלבון {item.calculatedProtein}ג׳ · פחמימות{" "}
                      {item.calculatedCarbs}ג׳ · שומן {item.calculatedFat}ג׳ · סיבים{" "}
                      {item.calculatedFiber}ג׳
                    </p>
                  </div>
                  <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-bold text-ink-soft">
                    {item.calculatedGrams !== null
                      ? `${Math.round(item.calculatedGrams)} גרם`
                      : `${Math.round(item.calculatedQuantity * 10) / 10}× מנה`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Overlay>
      ) : null}

      {/* Targets modal */}
      {showTargets ? (
        <Overlay
          open={showTargets}
          onClose={() => setShowTargets(false)}
          ariaLabel="יעדים יומיים"
          variant="bottom"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="scale-in max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              יעדים יומיים
            </p>
            <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
              {genderText(gender, "הגדירי יעדים תזונתיים", "הגדר יעדים תזונתיים")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TargetField
                label="קלוריות"
                value={targetsDraft.calories}
                onChange={(v) => setTargetsDraft({ ...targetsDraft, calories: v })}
              />
              <TargetField
                label="חלבון (g)"
                value={targetsDraft.protein}
                onChange={(v) => setTargetsDraft({ ...targetsDraft, protein: v })}
              />
              <TargetField
                label="פחמימות (g)"
                value={targetsDraft.carbs}
                onChange={(v) => setTargetsDraft({ ...targetsDraft, carbs: v })}
              />
              <TargetField
                label="שומן (g)"
                value={targetsDraft.fat}
                onChange={(v) => setTargetsDraft({ ...targetsDraft, fat: v })}
              />
              <TargetField
                label="סיבים (g)"
                value={targetsDraft.fiber}
                onChange={(v) => setTargetsDraft({ ...targetsDraft, fiber: v })}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <PrimaryButton
                onClick={() => {
                  saveNutritionTargets(targetsDraft);
                  setShowTargets(false);
                }}
              >
                שמור יעדים
              </PrimaryButton>
              <SecondaryButton onClick={() => setShowTargets(false)}>ביטול</SecondaryButton>
            </div>
          </div>
        </Overlay>
      ) : null}
    </AppShell>
  );
}

function MacroPill({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target?: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-white/60 px-2.5 py-2 text-start">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-display text-[14px] font-semibold tabular-nums text-ink">
        {Math.round(value)}
        <span className="ms-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span>
      </p>
      {target ? (
        <p className="text-[9.5px] text-muted-foreground">
          יעד {target}
          {unit}
        </p>
      ) : null}
    </div>
  );
}

function CalRing({ pct }: { pct: number }) {
  const dash = 132;
  const offset = dash - (dash * (pct || 0)) / 100;
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r="42" fill="none" stroke="oklch(0.93 0.04 25)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[14px] font-semibold tabular-nums text-ink">
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

function TargetField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <input
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange(raw === "" ? undefined : Number(raw));
        }}
        placeholder="—"
        className="mt-1.5 w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3 text-[15px] outline-none focus:border-primary"
      />
    </label>
  );
}
