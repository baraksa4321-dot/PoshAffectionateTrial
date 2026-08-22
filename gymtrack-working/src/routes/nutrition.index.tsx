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
  todayKey,
  updateMealFood,
  useGym,
} from "@/lib/gym-store";
import type { MealFood } from "@/lib/gym-types";

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
  const [date, setDate] = useState(todayKey());
  const [pickerMealId, setPickerMealId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
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
    const q = pickerQuery.trim().toLocaleLowerCase();
    return gym.foods.filter(
      (f) =>
        !q ||
        f.name.toLocaleLowerCase().includes(q) ||
        (f.category ?? "").toLocaleLowerCase().includes(q),
    );
  }, [gym.foods, pickerQuery]);

  const replacements = useMemo(() => {
    if (!substituteFor) return [];
    return findFoodReplacements(gym.foods, substituteFor.food, substituteQuery).slice(0, 15);
  }, [gym.foods, substituteFor, substituteQuery]);

  const addFromLibrary = (mealId: string, foodId: string) => {
    const lib = gym.foods.find((f) => f.id === foodId);
    if (!lib) return;
    addFoodToMeal(date, mealId, mealFoodFromLibrary(lib));
    setPickerMealId(null);
    setPickerQuery("");
  };

  const applyCalorieReplacement = (
    mealId: string,
    current: MealFood,
    replacement: {
      food: (typeof gym.foods)[0];
      calculatedQuantity: number;
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
          onClick={() => setShowWhatToEat(true)}
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
              הוסיפי ארוחה
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
                    onClick={() => setPickerMealId(meal.id)}
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
                              {food.servingSize} · {Math.round(food.calories * food.quantity)}{" "}
                              קלוריות
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
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => setShowWhatToEat(false)}
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
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {suggestedFoods.map(({ food }) => (
                <div
                  key={food.id}
                  className="p-2.5 rounded-xl border border-border/60 bg-secondary/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-ink">{food.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {food.servingSize} · {food.calories} קל' · {food.protein}g חלבון
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Automatic Shopping List Modal */}
      {showShoppingList && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => setShowShoppingList(false)}
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
        </div>
      )}

      {/* Picker bottom-sheet */}
      {pickerMealId ? (
        <div
          className="fade-in fixed inset-0 z-40 flex flex-col justify-end bg-foreground/30 backdrop-blur-sm"
          onClick={() => setPickerMealId(null)}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="scale-in max-h-[88dvh] overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  הוסיפי מאכל
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  ספריית מאכלים
                </h2>
              </div>
              <IconButton aria-label="סגור" onClick={() => setPickerMealId(null)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="num-pill mb-3 flex h-12 items-center gap-2 px-3.5">
              <Apple className="h-4 w-4 text-muted-foreground" />
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="חפשי מוצר בסופרמרקט הישראלי..."
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>
            <div className="space-y-2">
              {filteredFoods.slice(0, 30).map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => addFromLibrary(pickerMealId, food.id)}
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
          </div>
        </div>
      ) : null}

      {/* Calorie-based replacement */}
      {substituteFor ? (
        <div
          className="fade-in fixed inset-0 z-40 flex flex-col justify-end bg-foreground/30 backdrop-blur-sm"
          onClick={() => setSubstituteFor(null)}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="scale-in max-h-[88dvh] overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  החלף לי (התאמה קלורית)
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  {substituteFor.food.name}
                </h2>
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
                placeholder="חפשי מאכל חלופי (למשל: תפוח אדמה)..."
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
                      {item.food.calories} קלוריות · חלבון {item.food.protein}g · סיבים{" "}
                      {item.food.fiber || 0}g
                    </p>
                  </div>
                  <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                    {Math.round(item.calculatedQuantity * 10) / 10}×
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Targets modal */}
      {showTargets ? (
        <div
          className="fade-in fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={() => setShowTargets(false)}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
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
              הגדירי יעדים תזונתיים
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
        </div>
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
