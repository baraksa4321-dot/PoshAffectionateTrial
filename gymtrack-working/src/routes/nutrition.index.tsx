// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowLeft,
  Camera,
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
  LoaderCircle,
  ImageIcon,
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
  addMealWithFoods,
  dayTotals,
  deleteRecipe,
  findFoodReplacements,
  foodTotals,
  logPlannedMeal,
  mealFoodFromLibrary,
  nutritionDay,
  removeMealFood,
  renameMeal,
  renameRecipe,
  saveRecipe,
  saveNutritionTargets,
  searchFoods,
  todayKey,
  uid,
  updateMealFood,
  useGym,
} from "@/lib/gym-store";
import type { FoodItem, MealFood } from "@/lib/gym-types";
import { nutritionSourceFor } from "@/lib/nutrition-integrity";
import { RECIPE_LIBRARY, type RecipeDefinition } from "@/lib/recipe-library";
import { genderText } from "@/lib/gender-copy";

export const Route = createFileRoute("/nutrition/")({
  head: () => ({
    meta: [{ title: "יומן תזונה — MY routine" }],
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

function recipeAsMealFood(recipe: RecipeDefinition, servings: number): MealFood {
  const multiplier = Math.max(0.5, servings);
  const calories = Math.round(recipe.nutrition.calories * multiplier);
  const protein = Math.round(recipe.nutrition.protein * multiplier * 10) / 10;
  const fat = Math.round(recipe.nutrition.fat * multiplier * 10) / 10;
  // Recipes store calories, protein and fat. The remaining calories are
  // represented as carbohydrates, preserving the supplied total rather than
  // inventing a separate nutrition figure.
  const carbs = Math.max(0, Math.round(((calories - protein * 4 - fat * 9) / 4) * 10) / 10);
  return {
    id: uid(),
    name: recipe.name,
    servingSize: "מנה מהמתכון",
    quantity: 1,
    calories,
    protein,
    carbs,
    fat,
    notes: `מתכון: ${recipe.name}`,
  };
}

function quantityControlFor(food: FoodItem) {
  const serving = food.servingSize.toLocaleLowerCase();
  if (/(כף|כפות)/.test(serving)) return { label: "כמות בכפות", step: "any", scale: 1 };
  if (/(כוס|כוסות)/.test(serving)) return { label: "כמות בכוסות", step: "any", scale: 1 };
  if (/(יחידה|יחידות|ביצה|פרוסה|קופסה|חצי)/.test(serving)) {
    return { label: "כמות ביחידות", step: "any", scale: 1 };
  }
  const gramsMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*(?:גרם|g)\b/);
  if (gramsMatch) {
    const grams = Number(gramsMatch[1]!.replace(",", "."));
    if (Number.isFinite(grams) && grams > 0) {
      return { label: "כמות בגרמים", step: "any", scale: grams };
    }
  }
  return { label: "כמות מנות", step: "any", scale: 1 };
}

async function prepareMealImage(file: File): Promise<string> {
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("לא ניתן לקרוא את התמונה."));
    };
    image.src = url;
  });
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(source.naturalWidth, source.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("לא ניתן להכין את התמונה לניתוח.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.74);
}

type ScannedFood = {
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

type ScannedMeal = { mealName: string; foods: ScannedFood[] };

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
  const [recipeMealTime, setRecipeMealTime] = useState<
    "הכל" | "בוקר" | "צהריים" | "ערב" | "כל שעה"
  >("הכל");
  const [recipeQuery, setRecipeQuery] = useState("");
  const [recipeServings, setRecipeServings] = useState(1);
  const [recipeMealId, setRecipeMealId] = useState("");
  const [showSavedRecipesOnly, setShowSavedRecipesOnly] = useState(false);
  const [savedRecipeDrafts, setSavedRecipeDrafts] = useState<Record<string, string>>({});
  const [recipeNotice, setRecipeNotice] = useState("");
  const [showMealScanner, setShowMealScanner] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "analyzing" | "error">("idle");
  const [scanError, setScanError] = useState("");
  const [scannedMeal, setScannedMeal] = useState<ScannedMeal | null>(null);
  const day = nutritionDay(gym, date);
  const totals = dayTotals(day);
  const { nutritionTargets: targets } = gym;

  const openMealScanner = () => {
    setShowMealScanner(true);
    setScanState("idle");
    setScanError("");
    setScannedMeal(null);
  };

  const scanMealImage = async (file: File) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setScanError("אפשר להעלות תמונת JPG או PNG בלבד.");
      setScanState("error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setScanError("התמונה גדולה מדי. הגודל המרבי הוא 20MB.");
      setScanState("error");
      return;
    }
    setScanState("analyzing");
    setScanError("");
    try {
      const image = await prepareMealImage(file);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 60_000);
      let response: Response;
      try {
        response = await fetch("/api/nutrition/scan-meal", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }
      const result = (await response.json()) as ScannedMeal & { error?: string };
      if (!response.ok || result.error) throw new Error(result.error || "scan");
      setScannedMeal(result);
      setScanState("idle");
    } catch (error) {
      setScanError(
        error instanceof DOMException && error.name === "AbortError"
          ? "הניתוח לקח יותר מדי זמן. נסי שוב — התמונה הוכנה מחדש בגודל קטן יותר."
          : error instanceof Error
            ? error.message
            : "הסריקה נכשלה. נסי שוב.",
      );
      setScanState("error");
    }
  };

  const confirmScannedMeal = () => {
    if (!scannedMeal) return;
    const foods: MealFood[] = scannedMeal.foods
      .filter((food) => food.name.trim() && food.quantity > 0)
      .map((food) => ({ ...food, id: uid(), notes: "הערכה חכמה מתמונה — לבדיקה" }));
    if (!foods.length) return;
    addMealWithFoods(date, scannedMeal.mealName, foods);
    setShowMealScanner(false);
    setScannedMeal(null);
  };

  // Compute remaining macros for "What should I eat now?"
  const remainingCal =
    targets.calories === undefined ? undefined : Math.max(0, targets.calories - totals.calories);
  const remainingProt =
    targets.protein === undefined ? undefined : Math.max(0, targets.protein - totals.protein);
  const remainingCarbs =
    targets.carbs === undefined ? undefined : Math.max(0, targets.carbs - totals.carbs);
  const remainingFat =
    targets.fat === undefined ? undefined : Math.max(0, targets.fat - totals.fat);
  const hasWhatToEatTargets = remainingCal !== undefined && remainingProt !== undefined;
  const filteredRecipes = useMemo(() => {
    const query = recipeQuery.trim().toLocaleLowerCase();
    return RECIPE_LIBRARY.filter(
      (recipe) =>
        (recipeCategory === "הכל" || recipe.category === recipeCategory) &&
        (recipeMealTime === "הכל" ||
          recipe.mealTime === recipeMealTime ||
          recipe.mealTime === "כל שעה") &&
        (!query ||
          [recipe.name, recipe.category, recipe.mealTime, ...recipe.ingredients]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)),
    );
  }, [recipeCategory, recipeMealTime, recipeQuery]);
  const filteredSavedRecipes = useMemo(() => {
    const query = recipeQuery.trim().toLocaleLowerCase();
    return (gym.recipes ?? []).filter((recipe) => {
      const totals = foodTotals(recipe.foods);
      return (
        (!query ||
          `${recipe.name} ${recipe.foods.map((food) => food.name).join(" ")}`
            .toLocaleLowerCase()
            .includes(query)) &&
        (recipeCategory === "הכל" ||
          (totals.protein >= totals.calories / 20 && recipeCategory === "עתיר חלבון") ||
          (totals.fat <= 10 && recipeCategory === "דל שומן") ||
          (totals.calories <= 350 && recipeCategory === "דל קלוריות") ||
          (recipeCategory === "ארוחה קלה" && totals.calories <= 450))
      );
    });
  }, [gym.recipes, recipeCategory, recipeQuery]);

  const addSelectedRecipeToLog = () => {
    if (!selectedRecipe) return;
    const recipeFood = recipeAsMealFood(selectedRecipe, recipeServings);
    if (recipeMealId) {
      addFoodToMeal(date, recipeMealId, recipeFood);
    } else {
      addMealWithFoods(date, selectedRecipe.name, [recipeFood]);
    }
    setSelectedRecipe(null);
    setRecipeServings(1);
  };

  const saveSelectedRecipe = () => {
    if (!selectedRecipe) return;
    const saved = saveRecipe(selectedRecipe.name, [
      recipeAsMealFood(selectedRecipe, recipeServings),
    ]);
    setRecipeNotice(saved ? "המתכון נשמר בספרייה האישית." : "המתכון הזה כבר שמור אצלך.");
  };

  // Smart Food Suggestions based on remaining macros
  const suggestedFoods = useMemo(() => {
    return gym.foods
      .filter(
        (f) => remainingCal !== undefined && f.calories <= remainingCal + 100 && f.calories > 0,
      )
      .map((f) => ({
        food: f,
        protDiff: Math.abs(f.protein - (remainingProt ?? f.protein)),
        score: Math.abs(f.calories - remainingCal!),
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
    return [...searchFoods(gym.foods, pickerQuery)].sort((a, b) => {
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
      compactHeader
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
      <div className="surface-card flex items-center justify-between gap-1.5 p-1.5">
        <button
          type="button"
          aria-label="יום קודם"
          onClick={() => setDate((d) => shiftDate(d, -1))}
          className="press grid h-8 w-8 place-items-center rounded-xl bg-secondary cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-[14px] font-semibold text-ink">{formatDayLabel(date)}</p>
          <p className="text-[10px] text-muted-foreground tabular-nums">{date}</p>
        </div>
        <button
          type="button"
          aria-label="יום הבא"
          onClick={() => setDate((d) => shiftDate(d, 1))}
          className="press grid h-8 w-8 place-items-center rounded-xl bg-secondary cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Action Tools: "What should I eat now?" & "Shopping List" */}
      <div className="order-4 mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openMealScanner}
          className="surface-card col-span-2 flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 p-3 text-start text-xs font-bold text-primary transition-colors hover:bg-primary/15"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Camera className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block">צילום ארוחה והערכה חכמה</span>
            <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
              זיהוי מאכלים וערכים — תמיד באישור שלך
            </span>
          </span>
        </button>
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
      <section className="order-5 mt-2 rounded-2xl border border-border/40 bg-secondary/20">
        <button
          type="button"
          onClick={() => setShowRecipes((open) => !open)}
          aria-expanded={showRecipes}
          className="flex w-full items-center justify-between gap-3 p-3 text-start"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="block text-[11px] font-bold text-muted-foreground">מתכונים</span>
              <span className="block text-[10px] text-muted-foreground/80">
                רעיונות קלים — לפתיחה לפי הצורך
              </span>
            </span>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {showRecipes ? "סגירה" : `${RECIPE_LIBRARY.length} מתכונים`}
          </span>
        </button>
        {showRecipes ? (
          <div className="border-t border-border/50 px-3 pb-3 pt-2">
            <div className="num-pill mb-2 flex h-9 items-center gap-2 px-2.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                value={recipeQuery}
                onChange={(event) => setRecipeQuery(event.target.value)}
                placeholder={genderText(gender, "חפשי מתכון...", "חפש מתכון...")}
                className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-muted-foreground"
                aria-label="חיפוש מתכונים"
              />
            </div>
            {/* Meal-time filter row */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {(["הכל", "בוקר", "צהריים", "ערב"] as const).map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setRecipeMealTime(time)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    recipeMealTime === time
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {time === "הכל" ? "כל הארוחות" : `ארוחת ${time}`}
                </button>
              ))}
            </div>
            {/* Category filter row */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setShowSavedRecipesOnly((current) => !current)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  showSavedRecipesOnly
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                רק מהתפריט שלי
              </button>
              {(
                ["הכל", "עתיר חלבון", "דל קלוריות", "דל שומן", "ארוחה קלה", "מתוק מאוזן"] as const
              ).map((category) => (
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
              ))}
            </div>
            {!showSavedRecipesOnly ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setRecipeServings(1);
                      setRecipeMealId(day.meals[0]?.id ?? "");
                    }}
                    className="rounded-xl border border-border/60 bg-white/60 p-2.5 text-start transition-colors hover:border-primary/50"
                  >
                    <span className="block truncate text-xs font-bold text-ink">{recipe.name}</span>
                    <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {recipe.category} · {recipe.nutrition.calories} קל׳
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            {showSavedRecipesOnly ? (
              <div className="space-y-2">
                {filteredSavedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="rounded-xl border border-border/60 bg-white/60 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={savedRecipeDrafts[recipe.id] ?? recipe.name}
                        onChange={(event) =>
                          setSavedRecipeDrafts((current) => ({
                            ...current,
                            [recipe.id]: event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 bg-transparent text-xs font-bold text-ink outline-none"
                        aria-label={`שם מתכון ${recipe.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const ok = renameRecipe(
                            recipe.id,
                            savedRecipeDrafts[recipe.id] ?? recipe.name,
                          );
                          setRecipeNotice(
                            ok ? "שם המתכון עודכן." : "לא ניתן להשתמש בשם כפול או ריק.",
                          );
                        }}
                        className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
                      >
                        שמירה
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRecipe(recipe.id)}
                        className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
                        aria-label={`מחיקת מתכון ${recipe.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {recipe.foods.length} רכיבים · {Math.round(foodTotals(recipe.foods).calories)}{" "}
                      קל׳
                    </p>
                  </div>
                ))}
                {filteredSavedRecipes.length === 0 ? (
                  <p className="py-3 text-center text-[11px] font-semibold text-muted-foreground">
                    {savedRecipes.length === 0
                      ? "עדיין אין מתכונים אישיים שמורים."
                      : "לא נמצאו מתכונים אישיים לפי החיפוש והסינון."}
                  </p>
                ) : null}
              </div>
            ) : null}
            {!showSavedRecipesOnly && filteredRecipes.length === 0 ? (
              <p className="py-3 text-center text-[11px] font-semibold text-muted-foreground">
                לא נמצאו מתכונים מתאימים.
              </p>
            ) : null}
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
            <div className="rounded-2xl bg-secondary/60 p-3">
              <Stepper
                label="מנות"
                value={recipeServings}
                step="any"
                min={0.5}
                onChange={setRecipeServings}
              />
              {day.meals.length > 0 ? (
                <label className="mt-3 block text-[11px] font-bold text-muted-foreground">
                  הוספה לארוחה
                  <select
                    value={recipeMealId}
                    onChange={(event) => setRecipeMealId(event.target.value)}
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
              <PrimaryButton className="mt-3" onClick={addSelectedRecipeToLog}>
                {recipeMealId ? "הוסיפי לארוחה" : "תעדי כארוחה"}
              </PrimaryButton>
              <SecondaryButton className="mt-2 w-full" onClick={saveSelectedRecipe}>
                שמרי בספרייה האישית
              </SecondaryButton>
              {recipeNotice ? (
                <p className="mt-2 text-center text-[11px] font-semibold text-primary">
                  {recipeNotice}
                </p>
              ) : null}
            </div>
          </div>
        </Overlay>
      ) : null}

      {/* Daily total */}
      <div className="order-3 mt-4 surface-card overflow-hidden border border-border/60 bg-secondary/25 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-start">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              קלוריות היום
            </p>
            <p className="mt-1 font-display text-[30px] font-semibold leading-none text-ink tabular-nums">
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
      {day.plannedMeals && day.plannedMeals.length > 0 ? (
        <section className="order-1 mt-4">
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
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-primary">
                        {Math.round(plannedTotals.calories)} קלוריות
                      </span>
                      <button
                        type="button"
                        disabled={day.meals.some(
                          (loggedMeal) => loggedMeal.sourcePlanId === meal.id,
                        )}
                        onClick={() => logPlannedMeal(date, meal.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-xl bg-primary px-2.5 text-[11px] font-bold text-primary-foreground disabled:bg-emerald-600"
                      >
                        {day.meals.some((loggedMeal) => loggedMeal.sourcePlanId === meal.id) ? (
                          <CheckSquare className="h-3.5 w-3.5" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                        {day.meals.some((loggedMeal) => loggedMeal.sourcePlanId === meal.id)
                          ? "סומן כנאכל"
                          : "סמני כנאכל"}
                      </button>
                    </div>
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
      {/* The manual log remains available only when no coach plan is assigned. */}
      {!day.plannedMeals?.length ? (
        <section className="order-2 mt-4">
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
                                {food.servingSize} · {Math.round(food.calories * food.quantity)} קל׳
                                · {Math.round(food.protein * food.quantity)}ח׳ ·{" "}
                                {Math.round(food.carbs * food.quantity)}פ׳ ·{" "}
                                {Math.round(food.fat * food.quantity)}ש׳ · סיבים{" "}
                                {Math.round((food.fiber ?? 0) * food.quantity)}ג׳
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="החלף מאכל"
                              onClick={() => setSubstituteFor({ mealId: meal.id, food })}
                              className="press inline-flex h-8 shrink-0 items-center gap-1 rounded-xl bg-primary/10 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 cursor-pointer"
                              title="החלפת מאכל"
                            >
                              <Shuffle className="h-3.5 w-3.5" />
                              החלפה
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
                              step="any"
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
      ) : null}

      {showMealScanner ? (
        <Overlay
          open={showMealScanner}
          onClose={() => setShowMealScanner(false)}
          ariaLabel="צילום ארוחה והערכה חכמה"
          variant="bottom"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="scale-in max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  הערכה חכמה
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  {scannedMeal ? "בדקי את הארוחה" : "צלמי את הארוחה שלך"}
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {scannedMeal
                    ? "הערכים הם הערכה. אפשר לתקן כל שורה לפני השמירה ביומן."
                    : "התמונה נשלחת לניתוח מאובטח ואינה נשמרת ביומן."}
                </p>
              </div>
              <IconButton aria-label="סגור" onClick={() => setShowMealScanner(false)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            {!scannedMeal ? (
              <div className="space-y-3">
                {scanState === "analyzing" ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-5 py-10 text-center">
                    <LoaderCircle className="h-9 w-9 animate-spin text-primary" />
                    <span className="mt-3 text-sm font-bold text-ink">מנתחת את התמונה…</span>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      זיהוי מאכלים והערכת כמויות וערכים — בדרך כלל עד 20 שניות
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-3 py-8 text-center transition-colors hover:bg-primary/10">
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="mt-3 text-sm font-bold text-ink">צילום חדש</span>
                      <span className="mt-1 text-[10px] text-muted-foreground">פתיחת המצלמה</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        capture="environment"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) void scanMealImage(file);
                        }}
                      />
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-3 py-8 text-center transition-colors hover:bg-primary/10">
                      <ImageIcon className="h-8 w-8 text-primary" />
                      <span className="mt-3 text-sm font-bold text-ink">מהגלריה</span>
                      <span className="mt-1 text-[10px] text-muted-foreground">בחירת תמונה קיימת</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) void scanMealImage(file);
                        }}
                      />
                    </label>
                  </div>
                )}
                {scanState === "error" ? (
                  <div className="rounded-2xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                    {scanError}
                  </div>
                ) : null}
                <p className="text-center text-[10.5px] leading-relaxed text-muted-foreground">
                  כדי לקבל הערכה טובה יותר, צלמי את כל הצלחת באור טוב ומזווית עליונה.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold text-muted-foreground">
                  שם הארוחה
                  <input
                    value={scannedMeal.mealName}
                    onChange={(event) =>
                      setScannedMeal((current) =>
                        current ? { ...current, mealName: event.target.value } : current,
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-primary"
                  />
                </label>
                <div className="space-y-2">
                  {scannedMeal.foods.map((food, index) => (
                    <div key={`${food.name}-${index}`} className="rounded-2xl border border-border/50 bg-secondary/50 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={food.name}
                          onChange={(event) =>
                            setScannedMeal((current) => {
                              if (!current) return current;
                              const foods = [...current.foods];
                              foods[index] = { ...foods[index], name: event.target.value };
                              return { ...current, foods };
                            })
                          }
                          className="min-w-0 flex-1 rounded-lg border border-border bg-white px-2.5 py-2 text-[13px] font-semibold text-ink outline-none focus:border-primary"
                          aria-label={`שם מאכל ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setScannedMeal((current) =>
                              current
                                ? { ...current, foods: current.foods.filter((_, itemIndex) => itemIndex !== index) }
                                : current,
                            )
                          }
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-white hover:text-destructive"
                          aria-label={`הסר ${food.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        value={food.servingSize}
                        onChange={(event) =>
                          setScannedMeal((current) => {
                            if (!current) return current;
                            const foods = [...current.foods];
                            foods[index] = { ...foods[index], servingSize: event.target.value };
                            return { ...current, foods };
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-primary"
                        aria-label={`כמות ${food.name}`}
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        {(
                          [
                            ["quantity", "כמות", 0.1],
                            ["calories", "קלוריות", 1],
                            ["protein", "חלבון", 0.1],
                            ["carbs", "פחמימות", 0.1],
                            ["fat", "שומן", 0.1],
                            ["fiber", "סיבים", 0.1],
                          ] as const
                        ).map(([key, label, step]) => (
                          <label key={key} className="text-muted-foreground">
                            {label}
                            <input
                              type="number"
                              min={key === "quantity" ? 0.1 : 0}
                              step={step}
                              value={food[key]}
                              onChange={(event) =>
                                setScannedMeal((current) => {
                                  if (!current) return current;
                                  const foods = [...current.foods];
                                  foods[index] = { ...foods[index], [key]: Number(event.target.value) };
                                  return { ...current, foods };
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-ink outline-none focus:border-primary"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <PrimaryButton className="flex-1" onClick={confirmScannedMeal}>
                    אישור והוספה ליומן
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => {
                      setScannedMeal(null);
                      setScanState("idle");
                    }}
                  >
                    סריקה מחדש
                  </SecondaryButton>
                </div>
              </div>
            )}
          </div>
        </Overlay>
      ) : null}

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

            {hasWhatToEatTargets ? (
              <div className="rounded-xl bg-primary/5 p-3 text-xs space-y-1">
                <p className="font-bold text-ink">יתרה להיום לפי היעד:</p>
                <div className="grid grid-cols-4 gap-1 text-center font-semibold pt-1">
                  <span className="bg-white p-1 rounded-md text-ink">{remainingCal} קל'</span>
                  <span className="bg-white p-1 rounded-md text-emerald-700">
                    {remainingProt}g חלבון
                  </span>
                  <span className="bg-white p-1 rounded-md text-amber-700">
                    {remainingCarbs ?? "—"}g פחמימה
                  </span>
                  <span className="bg-white p-1 rounded-md text-rose-700">
                    {remainingFat ?? "—"}g שומן
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-secondary/60 p-3 text-xs font-semibold text-ink">
                יש להגדיר יעד קלוריות וחלבון לפני קבלת הצעה.
              </p>
            )}

            {hasWhatToEatTargets ? (
              <p className="text-xs font-bold text-muted-foreground">הצעות מובילות מהספרייה:</p>
            ) : null}
            {hasWhatToEatTargets && day.meals.length > 0 ? (
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
            {hasWhatToEatTargets ? (
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
            ) : null}
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
                const quantityControl = quantityControlFor(selectedFood);
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
                      label={quantityControl.label}
                      value={pickerQuantity * quantityControl.scale}
                      step="any"
                      min={quantityControl.step}
                      onChange={(value) => setPickerQuantity(value / quantityControl.scale)}
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
