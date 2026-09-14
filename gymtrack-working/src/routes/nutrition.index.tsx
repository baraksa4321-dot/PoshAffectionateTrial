import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowLeft,
  Camera,
  BookOpen,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBag,
  Shuffle,
  Sparkles,
  Square,
  Trash2,
  Utensils,
  X,
  Zap,
  ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FreeTextInput } from "@/components/FreeTextInput";
import { Stepper } from "@/components/Stepper";
import { Overlay } from "@/components/ui-app/Overlay";
import { LoadingSpinner } from "@/components/ui-app/LoadingSpinner";
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
  logPlannedFoodSubstitution,
  mealFoodFromLibrary,
  nutritionDay,
  removeMealFood,
  renameMeal,
  renameRecipe,
  saveRecipe,
  searchFoods,
  todayKey,
  togglePlannedFoodEaten,
  uid,
  updateMealFood,
  useGym,
} from "@/lib/gym-store";
import type { FoodItem, MealFood } from "@/lib/gym-types";
import {
  buildShoppingList,
  groupPlannedMeals,
  type ShoppingListPeriod,
} from "@/lib/nutrition-planning";
import { RECIPE_LIBRARY, type RecipeDefinition } from "@/lib/recipe-library";
import { genderText } from "@/lib/gender-copy";
import { supabase } from "@/lib/supabase";
import {
  LOADING_GENDER_STORAGE_KEY,
  loadingMessageForGender,
  readLoadingGender,
  type LoadingGender,
} from "@/lib/loading-copy";
import {
  foodPortionFromServingQuantity,
  mealFoodFromPortion,
  mealFoodNutritionMultiplier,
} from "@/lib/food-portions";

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

function plannedMealDisplayName(name: string) {
  return name
    .replace(/\s*\(\s*\d{1,2}:\d{2}\s*[–—-]\s*\d{1,2}:\d{2}\s*\)/g, "")
    .replace(/\s*[·•|]\s*אפשרות\s+\d+\s*$/g, "")
    .trim();
}

function plannedMealFoodSummary(meal: { foods: MealFood[] }) {
  const names = meal.foods
    .map((food) => food.name.trim())
    .filter(Boolean);
  if (names.length === 0) return "טרם נוספו מאכלים";
  const visibleNames = names.slice(0, 3);
  const remaining = names.length - visibleNames.length;
  return `• ${visibleNames.join(" • ")}${remaining > 0 ? ` • ועוד ${remaining}` : ""}`;
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

function recipeCarbs(recipe: RecipeDefinition) {
  const { calories, protein, fat } = recipe.nutrition;
  return Math.max(0, Math.round(((calories - protein * 4 - fat * 9) / 4) * 10) / 10);
}

function quantityControlFor(food: FoodItem) {
  const serving = food.servingSize.toLocaleLowerCase();
  if (/(כף|כפות)/.test(serving)) return { label: "כמות בכפות", step: 0.1, scale: 1 };
  if (/(כוס|כוסות)/.test(serving)) return { label: "כמות בכוסות", step: 0.1, scale: 1 };
  if (/(יחידה|יחידות|ביצה|פרוסה|קופסה|חצי)/.test(serving)) {
    return { label: "כמות ביחידות", step: 0.1, scale: 1 };
  }
  const gramsMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*(?:גרם|g)\b/);
  if (gramsMatch) {
    const grams = Number(gramsMatch[1]!.replace(",", "."));
    if (Number.isFinite(grams) && grams > 0) {
      return { label: "כמות בגרמים", step: 0.1, scale: grams };
    }
  }
  return { label: "כמות מנות", step: 0.1, scale: 1 };
}

function quantityLabelForServing(servingSize: string): string {
  const serving = servingSize.toLocaleLowerCase();
  if (/(גרם|g)\b/.test(serving)) return "גרמים";
  if (/(פרוסה|פרוסות)/.test(serving)) return "פרוסות";
  if (/(יחידה|יחידות)/.test(serving)) return "יחידות";
  if (/(כף|כפות)/.test(serving)) return "כפות";
  if (/(כוס|כוסות)/.test(serving)) return "כוסות";
  return "כמות";
}

function formatCount(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const fraction = new Map([
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.67, "⅔"],
    [0.75, "¾"],
    [0.8, "⅘"],
  ]);
  const whole = Math.floor(rounded);
  const remainder = Math.round((rounded - whole) * 100) / 100;
  const fractionLabel = fraction.get(remainder);
  if (fractionLabel) return whole > 0 ? `${whole}${fractionLabel}` : fractionLabel;
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 }).format(rounded);
}

function formatMeasuredFoodAmount(servingSize: string, quantity = 1) {
  const serving = servingSize.toLocaleLowerCase();
  const normalizedQuantity = Math.max(0.1, Number(quantity) || 1);
  const numericMatch = serving.match(/(\d+(?:[.,]\d+)?)/);
  const baseAmount = numericMatch ? Number(numericMatch[1]!.replace(",", ".")) : 1;
  const scaled = baseAmount * normalizedQuantity;
  const gramAmount = serving.match(/(\d+(?:[.,]\d+)?)\s*(?:גרם|g)\b/i)?.[1];
  const normalizedGramAmount = gramAmount ? Number(gramAmount.replace(",", ".")) : Number.NaN;
  const displayedGramAmount =
    Number.isFinite(normalizedGramAmount) && normalizedQuantity >= normalizedGramAmount
      ? normalizedQuantity
      : scaled;
  const formatWhole = (value: number) =>
    new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(Math.round(value));

  if (/(גרם|g)(?=\s|$|[),.])/i.test(serving)) {
    return `${formatWhole(displayedGramAmount)} גרם`;
  }
  if (/(מ["״]?ל|ml)(?=\s|$|[),.])/i.test(serving)) return `${formatWhole(scaled)} מ״ל`;
  if (/(כוס|כוסות|cup|cups)/.test(serving)) {
    return `${formatCount(scaled)} כוס`;
  }
  if (/(כף|כפות|tbsp)/.test(serving)) {
    return `${formatCount(scaled)} כף`;
  }
  if (/(כפית|כפיות|tsp)/.test(serving)) {
    return `${formatCount(scaled)} כפית`;
  }
  if (/(ביצ|egg)/i.test(serving)) return `${formatCount(scaled)} ביצים`;
  if (/(פרוס|slice)/i.test(serving)) return `${formatCount(scaled)} פרוסות`;
  if (/(פית|pita)/i.test(serving)) return `${formatCount(scaled)} פיתות`;
  if (/(טורט|tortilla|wrap)/i.test(serving)) return `${formatCount(scaled)} טורטיות`;
  if (/(יחיד|יחידות|unit|קופסה|גביע|בקבוק|אריזה|חבילה|שקית)/i.test(serving)) {
    return `${formatCount(scaled)} יחידה`;
  }
  if (Math.abs(normalizedQuantity - 1) < 0.01) return servingSize;
  return `כ־${formatCount(normalizedQuantity)} מהמנה המצוינת`;
}

const SHOPPING_PERIOD_OPTIONS: Array<{ value: ShoppingListPeriod; label: string }> = [
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
];

function formatShoppingQuantity(value: number) {
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(value);
}

async function prepareMealImage(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("לא ניתן להכין את התמונה לניתוח."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL("image/jpeg", 0.82);
      if (!/^data:image\/jpeg;base64,/i.test(result)) {
        reject(new Error("פורמט התמונה אינו נתמך. נסי לבחור JPG או PNG."));
        return;
      }
      resolve(result);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("לא ניתן לקרוא את התמונה."));
    };
    image.src = objectUrl;
  });
}

const MEAL_SCAN_ILLUSTRATIONS = [
  "user-strawberry",
  "user-tomato",
  "user-character-01",
  "user-character-02",
  "user-lemon",
  "user-character-03",
  "user-character-04",
  "user-character-05",
  "user-character-06",
  "user-character-07",
  "user-character-08",
  "user-character-09",
  "user-character-10",
] as const;

type ScannedFood = {
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  eggCount?: number;
};

type ScannedMeal = { mealName: string; foods: ScannedFood[] };

function NutritionLog() {
  const gym = useGym();
  const gender = gym.userProfile?.gender;
  const [loadingGender, setLoadingGender] = useState<LoadingGender | undefined>(gender);
  const showCalories = gym.userProfile?.showCalories !== false;
  const [date, setDate] = useState(todayKey());
  const [pickerMealId, setPickerMealId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerFoodId, setPickerFoodId] = useState<string | null>(null);
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [substituteFor, setSubstituteFor] = useState<{
    mealId: string;
    food: MealFood;
    plannedMealId?: string;
  } | null>(null);
  const [substituteQuery, setSubstituteQuery] = useState("");
  const [mealOptionsFor, setMealOptionsFor] = useState<string | null>(null);
  const [selectedPlannedMealIds, setSelectedPlannedMealIds] = useState<Record<string, string>>({});

  // New smart nutrition features state
  const [showWhatToEat, setShowWhatToEat] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [shoppingPeriod, setShoppingPeriod] = useState<ShoppingListPeriod>("daily");
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
  const [scanCycle, setScanCycle] = useState(0);
  const activeLoadingGender = loadingGender ?? gender;
  const loadingAnimationsEnabled =
    activeLoadingGender !== undefined &&
    (gym.userProfile?.loadingAnimationsEnabled ?? activeLoadingGender === "female");
  const plainScanLoading = scanState === "analyzing" && !loadingAnimationsEnabled;
  const day = nutritionDay(gym, date);
  const totals = dayTotals(day);
  const { nutritionTargets: targets } = gym;

  const openMealScanner = () => {
    setShowMealScanner(true);
    setScanState("idle");
    setScanError("");
    setScannedMeal(null);
    setScanCycle(0);
  };

  const scanMealImage = async (file: File) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setScanError("אפשר להעלות תמונת JPG או PNG בלבד.");
      setScanState("error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setScanError("התמונה גדולה מדי. הגודל המרבי הוא 8MB.");
      setScanState("error");
      return;
    }
    setScanState("analyzing");
    setScanError("");
    setScanCycle(0);
    try {
      const image = await prepareMealImage(file);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("יש להתחבר כדי להשתמש בסריקת ארוחה.");
      }
      const controller = new AbortController();
      const request = fetch("/nutrition-scan-meal", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ image }),
        signal: controller.signal,
      });
      let timeoutId: number | undefined;
      const timeout = new Promise<Response>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort();
          reject(new DOMException("Meal scan timed out", "AbortError"));
        }, 65_000);
      });
      const response = await Promise.race([request, timeout]);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      const result = (await response.json()) as ScannedMeal & { error?: string };
      if (!response.ok || result.error) throw new Error(result.error || "scan");
      setScannedMeal(result);
      setScanState("idle");
    } catch (error) {
      setScanError(
        error instanceof DOMException && error.name === "AbortError"
          ? "הניתוח לקח יותר מדי זמן. שירות ניתוח התמונות אולי לא זמין כרגע. נסי שוב בעוד רגע."
          : error instanceof Error
            ? error.message
            : "הסריקה נכשלה. נסי שוב.",
      );
      setScanState("error");
    }
  };

  useEffect(() => {
    if (gender) {
      setLoadingGender(gender);
      return;
    }
    try {
      setLoadingGender(readLoadingGender(window.localStorage.getItem(LOADING_GENDER_STORAGE_KEY)));
    } catch {
      setLoadingGender(undefined);
    }
  }, [gender]);

  useEffect(() => {
    if (scanState !== "analyzing" || !loadingAnimationsEnabled) return;
    const interval = window.setInterval(() => setScanCycle((cycle) => cycle + 1), 1_500);
    return () => window.clearInterval(interval);
  }, [loadingAnimationsEnabled, scanState]);

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
  const shoppingListItems = useMemo(
    () => buildShoppingList(gym.plannedMeals, shoppingPeriod),
    [gym.plannedMeals, shoppingPeriod],
  );

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

  const recipeReplacements = useMemo(() => {
    if (!substituteFor) return [];
    const targetCalories =
      substituteFor.food.calories * mealFoodNutritionMultiplier(substituteFor.food);
    const query = substituteQuery.trim().toLocaleLowerCase();
    return RECIPE_LIBRARY.filter((recipe) => {
      if (!query) return true;
      return [recipe.name, recipe.category, ...recipe.ingredients].some((value) =>
        value.toLocaleLowerCase().includes(query),
      );
    })
      .map((recipe) => ({
        recipe,
        calorieDistance: Math.abs(recipe.nutrition.calories - targetCalories),
      }))
      .sort((a, b) => a.calorieDistance - b.calorieDistance)
      .slice(0, 5);
  }, [substituteFor, substituteQuery]);

  const mealOptionsGroup = useMemo(() => {
    if (!mealOptionsFor) return null;
    return (
      groupPlannedMeals(gym.plannedMeals ?? []).find((group) => group.id === mealOptionsFor) ?? null
    );
  }, [gym.plannedMeals, mealOptionsFor]);

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
    const portion = foodPortionFromServingQuantity(lib, quantity);
    addFoodToMeal(date, mealId, mealFoodFromPortion(lib, portion.quantity, portion.unit));
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
    const portion = foodPortionFromServingQuantity(lib, replacement.calculatedQuantity);
    const replacementFood: MealFood = {
      ...mealFoodFromPortion(lib, portion.quantity, portion.unit),
      id: current.id,
      ...(current.notes === undefined ? {} : { notes: current.notes }),
    };
    const plannedMealId = substituteFor?.plannedMealId;
    setSubstituteFor(null);
    setSubstituteQuery("");
    if (plannedMealId) {
      logPlannedFoodSubstitution(date, plannedMealId, current, replacementFood);
    } else {
      updateMealFood(date, mealId, replacementFood);
    }
  };

  const applyRecipeReplacement = (
    mealId: string,
    current: MealFood,
    recipe: RecipeDefinition,
  ) => {
    const replacementFood: MealFood = {
      ...recipeAsMealFood(recipe, 1),
      id: current.id,
      ...(current.notes === undefined ? {} : { notes: current.notes }),
    };
    const plannedMealId = substituteFor?.plannedMealId;
    setSubstituteFor(null);
    setSubstituteQuery("");
    if (plannedMealId) {
      logPlannedFoodSubstitution(date, plannedMealId, current, replacementFood);
    } else {
      updateMealFood(date, mealId, replacementFood);
    }
  };

  return (
    <AppShell
      kicker="תזונה"
      title="יומן תזונה"
      subtitle={formatDayLabel(date)}
      compactHeader
      pageClassName="nutrition-page"
    >
      {/* Date selector */}
      <div className="nutrition-date-selector surface-card flex items-center justify-between gap-1.5 p-1.5">
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

      <section
        className="nutrition-library-entry-card surface-card mt-2 flex items-center justify-between gap-3 border border-border/70 px-3.5 py-3"
        aria-labelledby="nutrition-library-entry-title"
      >
        <div className="min-w-0 text-start">
          <h2
            id="nutrition-library-entry-title"
            className="font-display text-[15px] font-extrabold leading-tight text-ink"
          >
            מאגר מזונות
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            חיפוש והוספת מאכלים
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/nutrition/foods/$foodId"
            params={{ foodId: "new" }}
            aria-label={genderText(gender, "הוסיפי מאכל", "הוסף מאכל")}
            className="press grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <Link
            to="/nutrition/foods"
            aria-label="פתיחת מאגר המזונות"
            className="press grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Compact shortcuts stay immediately above the planned menu. */}
      <div className="order-0 mt-2 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={openMealScanner}
          className="surface-card flex min-w-0 items-center justify-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-1.5 py-2 text-center text-[10px] font-bold leading-tight text-primary transition-colors hover:bg-primary/15"
        >
          <Camera className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">זיהוי בתמונה</span>
        </button>
        <button
          type="button"
          onClick={() => setShowShoppingList(true)}
          className="surface-card flex min-w-0 items-center justify-center gap-1 rounded-xl border border-border/60 px-1.5 py-2 text-center text-[10px] font-bold leading-tight text-ink transition-colors hover:bg-secondary/60"
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">רשימת קניות</span>
        </button>
        <button
          type="button"
          onClick={() => setShowRecipes((open) => !open)}
          aria-expanded={showRecipes}
          className="surface-card flex min-w-0 items-center justify-center gap-1 rounded-xl border border-border/60 bg-secondary/20 px-1.5 py-2 text-center text-[10px] font-bold leading-tight text-ink transition-colors hover:bg-secondary/60"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">מתכונים</span>
        </button>
      </div>

      {showCalories ? (
        <button
          type="button"
          onClick={() => {
            setSuggestionMealId(day.meals[0]?.id ?? "");
            setShowWhatToEat(true);
          }}
          className="order-0 mt-1 w-full rounded-xl border border-primary/15 bg-primary/[0.04] px-2 py-1.5 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="inline-flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            מה לאכול עכשיו?
          </span>
        </button>
      ) : null}

      {/* Recipe library content stays below the compact shortcut row. */}
      <section
        className={`order-0 mt-1.5 rounded-xl border border-border/40 bg-secondary/20 ${
          showRecipes ? "" : "hidden"
        }`}
      >
        {showRecipes ? (
          <div className="border-t border-border/50 px-3 pb-3 pt-2">
            <div className="num-pill mb-2 flex min-h-9 w-full items-center gap-2 px-2.5 py-1">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                value={recipeQuery}
                onChange={(event) => setRecipeQuery(event.target.value)}
                placeholder={genderText(gender, "חפשי מתכון...", "חפש מתכון...")}
                className="min-w-0 flex-1 bg-transparent text-[11px] leading-4 text-ink outline-none placeholder:text-muted-foreground"
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
                      {showCalories
                        ? `${recipe.category} · ${recipe.nutrition.calories} קל׳`
                        : recipe.category}
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
                      {recipe.foods.length} רכיבים
                      {showCalories
                        ? ` · ${Math.round(foodTotals(recipe.foods).calories)} קל׳`
                        : ""}
                    </p>
                  </div>
                ))}
                {filteredSavedRecipes.length === 0 ? (
                  <p className="py-3 text-center text-[11px] font-semibold text-muted-foreground">
                    {(gym.recipes ?? []).length === 0
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
            <NutritionMacroGrid
              showCalories={showCalories}
              calories={selectedRecipe.nutrition.calories}
              protein={selectedRecipe.nutrition.protein}
              carbs={recipeCarbs(selectedRecipe)}
              fat={selectedRecipe.nutrition.fat}
            />
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
                step={0.1}
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
                {recipeMealId
                  ? genderText(gender, "הוסיפי לארוחה", "הוסף לארוחה")
                  : genderText(gender, "תעדי כארוחה", "תעד כארוחה")}
              </PrimaryButton>
              <SecondaryButton className="mt-2 w-full" onClick={saveSelectedRecipe}>
                שמרי בספרייה האישית
              </SecondaryButton>
              {recipeNotice && /לא ניתן|שגיאה|נכשל/.test(recipeNotice) ? (
                <p className="mt-2 text-center text-[11px] font-semibold text-primary">
                  {recipeNotice}
                </p>
              ) : null}
            </div>
          </div>
        </Overlay>
      ) : null}

      {day.plannedMeals && day.plannedMeals.length > 0 ? (
        <section className="nutrition-plan-section order-1 mt-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">התפריט שלך</h2>
            </div>
          </div>
          <div className="space-y-2.5">
            {groupPlannedMeals(day.plannedMeals).map((group) => {
              const primaryMeal = group.meals[0];
              if (!primaryMeal) return null;
              const loggedOption = group.meals.find((meal) =>
                day.meals.some((logged) => logged.sourcePlanId === meal.id),
              );
              const selectedMealId =
                selectedPlannedMealIds[group.id] ?? loggedOption?.id ?? primaryMeal.id;
              const displayedMeal =
                group.meals.find((meal) => meal.id === selectedMealId) ?? primaryMeal;
              const loggedMeal = day.meals.find(
                (logged) => logged.sourcePlanId === displayedMeal.id,
              );
              const plannedTotals = foodTotals(displayedMeal.foods);
              return (
                <article
                  key={group.id}
                  className="nutrition-planned-meal surface-card overflow-hidden border-primary/15 bg-primary/[0.035] p-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[14px] font-bold text-ink">
                        {plannedMealDisplayName(primaryMeal.name) || "ארוחה"}
                      </h3>
                      <p className="mt-0.5 max-w-[18rem] text-[10px] font-semibold leading-relaxed text-primary">
                        {plannedMealFoodSummary(displayedMeal)}
                      </p>
                    </div>
                    {group.meals.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setMealOptionsFor(group.id)}
                        className="inline-flex shrink-0 items-center rounded-lg border border-primary/35 bg-primary px-2.5 py-1.5 text-[10px] font-bold text-primary-foreground shadow-sm"
                      >
                        החלפת ארוחה
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2">
                        <div
                          key={displayedMeal.id}
                          className="rounded-xl border border-primary/35 bg-white/90 p-2 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="truncate text-[12px] font-bold text-ink">
                                {plannedMealFoodSummary(displayedMeal)}
                              </h4>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {showCalories ? (
                                <span className="rounded-lg border border-primary/35 bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
                                  {Math.round(plannedTotals.calories)} קלוריות
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {displayedMeal.foods.length > 0 ? (
                            <div className="mt-3 space-y-1.5">
                              {displayedMeal.foods.map((food) => {
                                const loggedFood = loggedMeal?.foods.find(
                                  (item) => item.sourcePlanFoodId === food.id,
                                );
                                const displayFood = loggedFood ?? food;
                                const alternativeNames = (food.approvedSubstitutes ?? [])
                                  .map((foodId) => gym.foods.find((item) => item.id === foodId)?.name)
                                  .filter((name): name is string => Boolean(name));
                                return (
                                  <div
                                    key={food.id}
                                   className="nutrition-plan-food relative rounded-xl border border-border/80 bg-white px-2 py-2 pe-10 text-start shadow-sm"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        togglePlannedFoodEaten(date, displayedMeal.id, food.id)
                                      }
                                      aria-pressed={Boolean(loggedFood)}
                                      aria-label={
                                        loggedFood
                                          ? `בטלי סימון אכילה עבור ${displayFood.name}`
                                          : `סמני כנאכל עבור ${displayFood.name}`
                                      }
                                      title={loggedFood ? "בטלי סימון" : "סמני כנאכל"}
                                      className={`absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full border transition-colors ${
                                        loggedFood
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                                      }`}
                                    >
                                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </button>
                                    <div className="flex items-center justify-between gap-2">
                                       <span className="min-w-0 truncate text-[12px] font-semibold text-ink">
                                        {displayFood.name}
                                      </span>
                                    </div>
                                    <p
                                      data-testid="nutrition-food-quantity"
                                       className="mt-0.5 text-[11px] font-semibold text-ink"
                                    >
                                      {formatMeasuredFoodAmount(
                                        displayFood.servingSize,
                                        displayFood.quantity,
                                      )}
                                    </p>
                                    {alternativeNames.length > 0 ? (
                                       <p className="mt-0.5 text-[10px] font-semibold text-primary">
                                        או: {alternativeNames.join(" או ")}
                                      </p>
                                    ) : null}
                                    <NutritionMacroGrid
                                       className="mt-1"
                                      showCalories={showCalories}
                                      calories={
                                        displayFood.calories *
                                        mealFoodNutritionMultiplier(displayFood)
                                      }
                                      protein={
                                        displayFood.protein *
                                        mealFoodNutritionMultiplier(displayFood)
                                      }
                                      carbs={
                                        displayFood.carbs * mealFoodNutritionMultiplier(displayFood)
                                      }
                                      fat={
                                        displayFood.fat * mealFoodNutritionMultiplier(displayFood)
                                      }
                                    />
                                    <div className="mt-1 flex items-center justify-end gap-1.5">
                                      {
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSubstituteFor({
                                              mealId: loggedMeal?.id ?? "",
                                              food,
                                               plannedMealId: displayedMeal.id,
                                            })
                                          }
                                           className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[10px] font-bold text-primary-foreground"
                                        >
                                          <Shuffle className="h-3.5 w-3.5" />
                                          החלפת מאכל
                                        </button>
                                      }
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-[12px] text-muted-foreground">
                              המאמן טרם הוסיף מאכלים.
                            </p>
                          )}
                        </div>
                  </div>
                </article>
              );
            })}
          </div>
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

           <div className="nutrition-log-meals space-y-3">
            {day.meals.map((meal) => {
              const mealTotals = foodTotals(meal.foods);
              return (
                 <section key={meal.id} className="nutrition-log-meal surface-card p-4">
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
                        {showCalories ? `${Math.round(mealTotals.calories)} קלוריות · ` : ""}
                        חלבון {Math.round(mealTotals.protein)}g
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
                              <p
                                data-testid="nutrition-food-quantity"
                                className="mt-0.5 text-[12px] font-semibold text-ink"
                              >
                                {formatMeasuredFoodAmount(food.servingSize, food.quantity)}
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
                          <NutritionMacroGrid
                            className="mt-2.5"
                            showCalories={showCalories}
                            calories={food.calories * mealFoodNutritionMultiplier(food)}
                            protein={food.protein * mealFoodNutritionMultiplier(food)}
                            carbs={food.carbs * mealFoodNutritionMultiplier(food)}
                            fat={food.fat * mealFoodNutritionMultiplier(food)}
                          />
                          <div className="mt-2.5 grid grid-cols-2 gap-2">
                            <Stepper
                              label="כמות"
                              value={food.quantity}
                              step={0.1}
                              onChange={(v) =>
                                updateMealFood(date, meal.id, { id: food.id, quantity: v })
                              }
                            />
                            <div className="rounded-2xl bg-white/60 px-3 py-2.5 text-start">
                              <p className="text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                סה״כ
                              </p>
                              {showCalories ? (
                                <p className="mt-0.5 font-display text-[15px] font-semibold tabular-nums text-ink">
                                  {Math.round(food.calories * mealFoodNutritionMultiplier(food))}
                                  <span className="ms-0.5 text-[11px] font-normal text-muted-foreground">
                                    קל
                                  </span>
                                </p>
                              ) : (
                                <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
                                  מוסתר
                                </p>
                              )}
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
              {!plainScanLoading ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    הערכה חכמה
                  </p>
                  <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                    {scannedMeal
                      ? genderText(gender, "בדקי את הארוחה", "בדוק את הארוחה")
                      : genderText(gender, "צלמי את הארוחה שלך", "צלם את הארוחה שלך")}
                  </h2>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {scannedMeal
                      ? "הערכים הם הערכה. אפשר לתקן כל שורה לפני השמירה ביומן."
                      : "התמונה נשלחת לניתוח מאובטח ואינה נשמרת ביומן."}
                  </p>
                </div>
              ) : (
                <div aria-hidden="true" />
              )}
              <IconButton aria-label="סגור" onClick={() => setShowMealScanner(false)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            {!scannedMeal ? (
              <div className="space-y-3">
                {scanState === "analyzing" ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-[#f7f2ec] px-5 py-10 text-center">
                    {loadingAnimationsEnabled ? (
                      <>
                        <div
                          className={`loading-micro-stage loading-simple-stage loading-simple-pose-${scanCycle % 4}`}
                        >
                          <video
                            key={
                              MEAL_SCAN_ILLUSTRATIONS[scanCycle % MEAL_SCAN_ILLUSTRATIONS.length]
                            }
                            aria-label="אנימציית ניתוח תמונה"
                            className="loading-simple-image loading-simple-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                          >
                            <source
                              src={`/loading/meal-scan/${MEAL_SCAN_ILLUSTRATIONS[scanCycle % MEAL_SCAN_ILLUSTRATIONS.length]}.webm?v=meal-scan-${scanCycle}`}
                              type="video/webm"
                            />
                          </video>
                        </div>
                        <span className="mt-3 text-sm font-bold text-ink">מנתחת את התמונה…</span>
                        <span className="mt-1 text-[11px] text-muted-foreground">
                          {loadingMessageForGender(scanCycle, gender)}
                        </span>
                      </>
                    ) : (
                      <LoadingSpinner label="מנתח את התמונה" />
                    )}
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
                      <span className="mt-1 text-[10px] text-muted-foreground">
                        בחירת תמונה קיימת
                      </span>
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
                {!plainScanLoading ? (
                  <p className="text-center text-[10.5px] leading-relaxed text-muted-foreground">
                    {genderText(
                      gender,
                      "כדי לקבל הערכה טובה יותר, צלמי את כל הצלחת באור טוב ומזווית עליונה.",
                      "כדי לקבל הערכה טובה יותר, צלם את כל הצלחת באור טוב ומזווית עליונה.",
                    )}
                  </p>
                ) : null}
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
                    <div
                      key={`${food.name}-${index}`}
                      className="rounded-2xl border border-border/50 bg-secondary/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={food.name}
                          onChange={(event) =>
                            setScannedMeal((current) => {
                              if (!current) return current;
                              const foods = [...current.foods];
                              const currentFood = foods[index];
                              if (!currentFood) return current;
                              foods[index] = { ...currentFood, name: event.target.value };
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
                                ? {
                                    ...current,
                                    foods: current.foods.filter(
                                      (_, itemIndex) => itemIndex !== index,
                                    ),
                                  }
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
                            const currentFood = foods[index];
                            if (!currentFood) return current;
                            foods[index] = { ...currentFood, servingSize: event.target.value };
                            return { ...current, foods };
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-primary"
                        aria-label={`כמות ${food.name}`}
                      />
                      {food.eggCount !== undefined ? (
                        <label className="mt-2 block text-[11px] text-muted-foreground">
                          ביצים
                          <FreeTextInput
                            min={1}
                            step={1}
                            value={food.eggCount}
                            onChange={(event) => {
                              const nextEggCount = Number(event.target.value);
                              if (!Number.isFinite(nextEggCount) || nextEggCount < 1) return;
                              setScannedMeal((current) => {
                                if (!current) return current;
                                const foods = [...current.foods];
                                const currentFood = foods[index];
                                if (!currentFood) return current;
                                const previousEggCount = currentFood.eggCount ?? 2;
                                const ratio = nextEggCount / previousEggCount;
                                foods[index] = {
                                  ...currentFood,
                                  eggCount: nextEggCount,
                                  calories: Math.round(currentFood.calories * ratio),
                                  protein: Math.round(currentFood.protein * ratio * 10) / 10,
                                  carbs: Math.round(currentFood.carbs * ratio * 10) / 10,
                                  fat: Math.round(currentFood.fat * ratio * 10) / 10,
                                  fiber: Math.round(currentFood.fiber * ratio * 10) / 10,
                                };
                                return { ...current, foods };
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-ink outline-none focus:border-primary"
                            aria-label="ביצים"
                          />
                        </label>
                      ) : null}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        {(
                          [
                            ...(quantityLabelForServing(food.servingSize) === "גרמים"
                              ? []
                              : [
                                  [
                                    "quantity",
                                    quantityLabelForServing(food.servingSize),
                                    0.1,
                                  ] as const,
                                ]),
                            ["calories", "קלוריות", 1],
                            ["protein", "חלבון", 0.1],
                            ["carbs", "פחמימות", 0.1],
                            ["fat", "שומן", 0.1],
                            ["fiber", "סיבים", 0.1],
                          ] as const
                        )
                          .filter(([key]) => showCalories || key !== "calories")
                          .map(([key, label, step]) => (
                            <label key={key} className="text-muted-foreground">
                              {label}
                              <FreeTextInput
                                min={key === "quantity" ? 0.1 : 0}
                                step={step}
                                value={food[key]}
                                onChange={(event) =>
                                  setScannedMeal((current) => {
                                    if (!current) return current;
                                    const foods = [...current.foods];
                                    const currentFood = foods[index];
                                    if (!currentFood) return current;
                                    foods[index] = {
                                      ...currentFood,
                                      [key]: Number(event.target.value),
                                    };
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
                  {showCalories ? (
                    <span className="bg-white p-1 rounded-md text-ink">{remainingCal} קל'</span>
                  ) : null}
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
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink">{food.name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink">
                        {formatMeasuredFoodAmount(food.servingSize)}
                      </p>
                      <NutritionMacroGrid
                        className="mt-1.5"
                        showCalories={showCalories}
                        calories={food.calories}
                        protein={food.protein}
                        carbs={food.carbs}
                        fat={food.fat}
                      />
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
                <ShoppingBag className="h-5 w-5 text-emerald-600" /> רשימת קניות מהתפריט
              </h3>
              <button
                onClick={() => setShowShoppingList(false)}
                className="text-muted-foreground font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className="grid grid-cols-3 gap-1 rounded-2xl bg-secondary/70 p-1"
              role="tablist"
              aria-label="טווח רשימת הקניות"
            >
              {SHOPPING_PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={shoppingPeriod === option.value}
                  onClick={() => setShoppingPeriod(option.value)}
                  className={`rounded-xl px-2 py-2 text-[11px] font-bold transition-colors ${
                    shoppingPeriod === option.value
                      ? "bg-ink text-white shadow-sm"
                      : "text-muted-foreground hover:bg-white/70"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              הכמויות מחושבות לפי התפריט שלך ומומרות לאריזות נפוצות בסופר.
            </p>

            {shoppingListItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                עדיין אין תפריט מהמאמן. בקשי מהמאמן לבנות עבורך תפריט כדי ליצור רשימת קניות.
              </p>
            ) : (
              <div className="space-y-2">
                {shoppingListItems.map((item) => {
                  const isChecked = checkedItems[item.key] || false;

                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setCheckedItems((prev) => ({ ...prev, [item.key]: !isChecked }))
                      }
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isChecked
                          ? "bg-muted/40 line-through opacity-60"
                          : "bg-secondary/50 font-bold"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{item.name}</span>
                        <span className="mt-1 block text-[10.5px] font-bold text-emerald-700">
                          לקנייה:{" "}
                          {item.purchasePackageDescription ??
                            `${formatShoppingQuantity(item.purchaseQuantity)} ${item.purchaseUnit}`}
                        </span>
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
                        {selectedFood.servingSize} למנה
                        {showCalories ? ` · ${selectedFood.calories} קל׳` : ""} · חלבון{" "}
                        {selectedFood.protein}ג׳ · פחמימות {selectedFood.carbs}ג׳ · שומן{" "}
                        {selectedFood.fat}ג׳ · סיבים {selectedFood.fiber ?? 0}ג׳
                      </p>
                    </div>
                    <Stepper
                      label={quantityControl.label}
                      value={pickerQuantity * quantityControl.scale}
                      step={0.1}
                      min={quantityControl.step}
                      onChange={(value) => setPickerQuantity(value / quantityControl.scale)}
                    />
                    <div className="rounded-2xl bg-primary/10 px-3.5 py-3 text-[12px] text-ink">
                      <p>
                        {showCalories
                          ? `סה״כ: ${Math.round(selectedFood.calories * pickerQuantity)} קל׳ · `
                          : "סה״כ: "}
                        חלבון {Math.round(selectedFood.protein * pickerQuantity)}ג׳ · פחמימות{" "}
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
                      <p
                        data-testid="nutrition-food-quantity"
                        className="mt-0.5 text-[12px] font-semibold text-ink"
                      >
                        {formatMeasuredFoodAmount(food.servingSize)}
                      </p>
                      <NutritionMacroGrid
                        className="mt-2"
                        showCalories={showCalories}
                        calories={food.calories}
                        protein={food.protein}
                        carbs={food.carbs}
                        fat={food.fat}
                      />
                    </div>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Overlay>
      ) : null}

      {/* Planned meal alternatives */}
      {mealOptionsGroup ? (
        <Overlay
          open={Boolean(mealOptionsGroup)}
          onClose={() => setMealOptionsFor(null)}
          ariaLabel="החלפת ארוחה"
          variant="bottom"
          panelClassName="contents"
          className="fade-in"
        >
          <div
            className="scale-in max-h-[82dvh] overflow-y-auto rounded-t-[2rem] border-t border-border/50 bg-card p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-primary">החלפת ארוחה</p>
                <h2 className="mt-1 font-display text-[20px] font-extrabold text-ink">
                  בחרי את הארוחה שמתאימה לך
                </h2>
              </div>
              <IconButton aria-label="סגור" onClick={() => setMealOptionsFor(null)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-2.5">
              {mealOptionsGroup.meals.map((meal) => {
                const loggedOption = mealOptionsGroup.meals.find((option) =>
                  day.meals.some((logged) => logged.sourcePlanId === option.id),
                );
                const activeMealId =
                  selectedPlannedMealIds[mealOptionsGroup.id] ??
                  loggedOption?.id ??
                  mealOptionsGroup.meals[0]?.id;
                const isSelected = activeMealId === meal.id;
                const totals = foodTotals(meal.foods);
                return (
                  <button
                    key={meal.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedPlannedMealIds((current) => ({
                        ...current,
                        [mealOptionsGroup.id]: meal.id,
                      }));
                      setMealOptionsFor(null);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start ${
                      isSelected
                        ? "border-primary/60 bg-primary/15"
                        : "border-border/60 bg-secondary hover:border-primary/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink">
                        {plannedMealFoodSummary(meal)}
                      </p>
                      {showCalories ? (
                        <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                          {Math.round(totals.calories)} קלוריות
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border border-primary/40 text-primary"
                      }`}
                    >
                      {isSelected ? "נבחרה" : "בחירה"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Overlay>
      ) : null}

      {/* Food replacement */}
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
                <p className="text-[18px] font-display font-extrabold text-primary">החלפה</p>
                <h2 className="mt-0.5 font-display text-[20px] font-semibold text-ink">
                  {substituteFor.food.name}
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {showCalories ? (
                    <>
                      תקציב ההחלפה:
                      <span className="ms-1 font-bold text-ink">
                        {Math.round(
                          substituteFor.food.calories *
                            mealFoodNutritionMultiplier(substituteFor.food),
                        )}{" "}
                        קלוריות
                      </span>
                    </>
                  ) : (
                    "החלפה לפי מנה"
                  )}
                </p>
              </div>
              <IconButton aria-label="סגור" onClick={() => setSubstituteFor(null)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="mb-3 rounded-2xl border border-primary/30 bg-primary/10 p-3">
              <p className="text-[11px] font-bold text-primary">הערכים והכמות להחלפה</p>
              <p className="mt-1 text-[12px] font-semibold text-ink">
                כמות יעד:{" "}
                {formatMeasuredFoodAmount(
                  substituteFor.food.servingSize,
                  substituteFor.food.quantity,
                )}
              </p>
              <NutritionMacroGrid
                className="mt-2"
                showCalories={showCalories}
                calories={
                  substituteFor.food.calories *
                  mealFoodNutritionMultiplier(substituteFor.food)
                }
                protein={
                  substituteFor.food.protein *
                  mealFoodNutritionMultiplier(substituteFor.food)
                }
                carbs={
                  substituteFor.food.carbs * mealFoodNutritionMultiplier(substituteFor.food)
                }
                fat={substituteFor.food.fat * mealFoodNutritionMultiplier(substituteFor.food)}
              />
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
            {recipeReplacements.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-[12px] font-bold text-primary">
                  מתכונים קרובים לתקציב הקלוריות
                </p>
                <div className="space-y-2">
                  {recipeReplacements.map(({ recipe }) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() =>
                        applyRecipeReplacement(substituteFor.mealId, substituteFor.food, recipe)
                      }
                      className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-start cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {recipe.name}
                        </p>
                        <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
                          מנה אחת · {recipe.category}
                        </p>
                        <NutritionMacroGrid
                          className="mt-2"
                          showCalories={showCalories}
                          calories={recipe.nutrition.calories}
                          protein={recipe.nutrition.protein}
                          carbs={recipeCarbs(recipe)}
                          fat={recipe.nutrition.fat}
                        />
                      </div>
                      <span className="shrink-0 rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground">
                        בחירה
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              {replacements.map((item) => {
                const portion = foodPortionFromServingQuantity(
                  item.food,
                  item.calculatedQuantity,
                );
                return (
                  <button
                    key={item.food.id}
                    type="button"
                    onClick={() =>
                      applyCalorieReplacement(substituteFor.mealId, substituteFor.food, item)
                    }
                    className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/30 bg-secondary px-3.5 py-3 text-start cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {item.food.name}
                      </p>
                      <p
                        data-testid="nutrition-food-quantity"
                        className="mt-0.5 text-[12px] font-semibold text-ink"
                      >
                        {formatCount(portion.quantity)} {portion.unitLabel}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                        כמות לפי הערכים של המאכל המקורי
                      </p>
                      <NutritionMacroGrid
                        className="mt-2"
                        showCalories={showCalories}
                        calories={item.calculatedCalories}
                        protein={item.calculatedProtein}
                        carbs={item.calculatedCarbs}
                        fat={item.calculatedFat}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Overlay>
      ) : null}
    </AppShell>
  );
}

function NutritionMacroGrid({
  calories,
  protein,
  carbs,
  fat,
  showCalories,
  className = "",
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  showCalories: boolean;
  className?: string;
}) {
  const values = [
    { label: "חלבון", value: protein, unit: "ג׳" },
    { label: "פחמימות", value: carbs, unit: "ג׳" },
    { label: "שומן", value: fat, unit: "ג׳" },
    ...(showCalories ? [{ label: "קלוריות", value: calories, unit: "קל׳" }] : []),
  ];

  return (
    <div
      data-testid="nutrition-macro-grid"
      className={`grid ${showCalories ? "grid-cols-4" : "grid-cols-3"} gap-1.5 ${className}`}
    >
      {values.map((item) => (
        <div
          key={item.label}
          data-nutrition-macro={item.label}
          className="nutrition-macro-cell rounded-xl border-2 border-border/80 bg-white px-1.5 py-1.5 text-center shadow-sm"
        >
          <span className="block text-[9px] font-bold text-muted-foreground">{item.label}</span>
          <strong
            data-nutrition-macro-value
            className="mt-0.5 block font-display text-[13px] font-bold tabular-nums text-ink"
          >
            {Math.round(item.value * 10) / 10}
            <span className="ms-0.5 text-[9px] font-semibold text-muted-foreground">
              {item.unit}
            </span>
          </strong>
        </div>
      ))}
    </div>
  );
}


