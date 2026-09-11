import { createClient } from "@supabase/supabase-js";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing runtime configuration: ${name}`);
  return value;
};

type MealFood = {
  id: string;
  foodId?: string;
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
};

type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  mealOptionGroupId?: string;
};

type CatalogFood = {
  id: string;
  name: string;
  serving_grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

const supabaseUrl = required("VITE_SUPABASE_URL")
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
const supabase = createClient(supabaseUrl, required("VITE_SUPABASE_ANON_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: required("GYMTRACK_IMPORT_OWNER_EMAIL"),
  password: required("GYMTRACK_IMPORT_OWNER_PASSWORD"),
});
if (authError) throw new Error(`Owner authentication failed: ${authError.message}`);
if (!authData.user?.id) throw new Error("Owner authentication returned no user.");

const { data: owner, error: ownerError } = await supabase
  .from("profiles")
  .select("id, role")
  .eq("id", authData.user.id)
  .single();
if (ownerError) throw new Error(`Owner profile read failed: ${ownerError.message}`);
if (owner.role !== "owner") throw new Error("Authenticated account is not an owner.");

const { data: candidates, error: targetError } = await supabase
  .from("profiles")
  .select("id, planned_menu")
  .eq("full_name", "שיר יוספן");
if (targetError) throw new Error(`Target profile read failed: ${targetError.message}`);
if (candidates?.length !== 1) throw new Error(`Expected one target, found ${candidates?.length ?? 0}.`);
const target = candidates[0];
if (!target) throw new Error("Target profile was not returned.");

const { data: catalogRows, error: catalogError } = await supabase
  .from("foods")
  .select("id, name, serving_grams, calories, protein, carbs, fat, fiber")
  .limit(5000);
if (catalogError) throw new Error(`Food catalog read failed: ${catalogError.message}`);
const normalize = (value: string) => value.toLocaleLowerCase().replace(/['״"׳]/g, "");
const catalog = (catalogRows ?? []) as CatalogFood[];
const findCatalog = (aliases: string[]) => {
  const terms = aliases.map(normalize);
  return catalog.find((food) => {
    const name = normalize(food.name);
    return terms.some((term) => name.includes(term) || term.includes(name));
  });
};

function food(
  id: string,
  name: string,
  servingSize: string,
  quantity: number,
  aliases: string[] = [],
  notes?: string,
): MealFood {
  const match = findCatalog(aliases);
  if (!match) {
    return {
      id,
      name,
      servingSize,
      quantity,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ...(notes ? { notes } : {}),
    };
  }
  const multiplier = /גרם/.test(servingSize)
    ? quantity / Math.max(1, Number(match.serving_grams) || 100)
    : quantity;
  return {
    id,
    foodId: match.id,
    name: match.name,
    servingSize,
    quantity,
    calories: Number(match.calories) * multiplier,
    protein: Number(match.protein) * multiplier,
    carbs: Number(match.carbs) * multiplier,
    fat: Number(match.fat) * multiplier,
    ...(match.fiber === null ? {} : { fiber: Number(match.fiber) * multiplier }),
    ...(notes ? { notes } : {}),
  };
}

const existing = Array.isArray(target.planned_menu)
  ? (target.planned_menu as unknown as Meal[])
  : [];
const findMeal = (prefix: string) =>
  existing.find((meal) => typeof meal?.name === "string" && meal.name.startsWith(prefix));
const group = (source: Meal, id: string, name: string, optionGroup: string): Meal => ({
  ...source,
  id: source.id || id,
  name,
  mealOptionGroupId: optionGroup,
});
const newMeal = (id: string, name: string, foods: MealFood[], optionGroup: string): Meal => ({
  id,
  name,
  foods,
  mealOptionGroupId: optionGroup,
});
const vegetables = (id: string) =>
  food(id, "ירק חי/מוקפץ/מבושל/אפוי", "מנה למנה", 1, [], "לבחירה");
const healthyFat = (id: string) =>
  food(id, "שומן בריא", "מנה למנה", 1, [], "לפי ההנחיות בתפריט");

const lunchSource = findMeal("צהריים");
const snackSource = findMeal("ביניים");
if (!lunchSource || !snackSource) throw new Error("Existing lunch or snack meal was not found.");

const lunchGroup = "shir-lunch-2026-06-04";
const snackGroup = "shir-snack-2026-06-04";
const lunchOptions: Meal[] = [
  group(lunchSource, "shir-lunch-option-1", "צהריים (12:00–13:00) · חזה עוף", lunchGroup),
  newMeal(
    "shir-lunch-option-2",
    "צהריים (12:00–13:00) · קציצות בשר",
    [
      food("shir-l2-protein", "קציצות בשר", "150 גרם למנה", 150, ["קציצות בשר", "בשר"]),
      vegetables("shir-l2-vegetables"),
      food("shir-l2-carb", "פחמימה מורכבת", "100 גרם מבושל למנה", 100, ["בורגול", "קינואה", "אורז"]),
      healthyFat("shir-l2-fat"),
    ],
    lunchGroup,
  ),
  newMeal(
    "shir-lunch-option-3",
    "צהריים (12:00–13:00) · סלמון",
    [
      food("shir-l3-protein", "סלמון", "150 גרם למנה", 150, ["סלמון"]),
      vegetables("shir-l3-vegetables"),
      food("shir-l3-carb", "פחמימה מורכבת", "100 גרם מבושל למנה", 100, ["קינואה", "אורז"]),
      healthyFat("shir-l3-fat"),
    ],
    lunchGroup,
  ),
  newMeal(
    "shir-lunch-option-4",
    "צהריים (12:00–13:00) · טופו",
    [
      food("shir-l4-protein", "טופו", "150 גרם למנה", 150, ["טופו"]),
      vegetables("shir-l4-vegetables"),
      food("shir-l4-carb", "פחמימה מורכבת", "100 גרם מבושל למנה", 100, ["עדשים", "בורגול"]),
      healthyFat("shir-l4-fat"),
    ],
    lunchGroup,
  ),
];

const snackOptions: Meal[] = [
  group(snackSource, "shir-snack-option-1", "ביניים (15:30) · פרי ושקדים", snackGroup),
  newMeal(
    "shir-snack-option-2",
    "ביניים (15:30) · יוגורט וחמאת בוטנים",
    [
      food("shir-s2-yogurt", "יוגורט", "גביע למנה", 1, ["יוגורט"]),
      food("shir-s2-peanut", "חמאת בוטנים", "כפית למנה", 1, ["חמאת בוטנים"]),
    ],
    snackGroup,
  ),
  newMeal(
    "shir-snack-option-3",
    "ביניים (15:30) · לחם וגבינה",
    [
      food("shir-s3-bread", "לחם", "פרוסה למנה", 1, ["לחם"]),
      food("shir-s3-cheese", "גבינה צהובה 9%", "פרוסה למנה", 1, ["גבינה צהובה"]),
    ],
    snackGroup,
  ),
  newMeal(
    "shir-snack-option-4",
    "ביניים (15:30) · ירקות וגבינה/קוטג׳",
    [
      food("shir-s4-vegetables", "נשנושי ירקות מיני", "מנה למנה", 1, ["מלפפון", "גזר"]),
      food("shir-s4-cottage", "גבינה/קוטג׳", "מנה למנה", 1, ["קוטג"]),
    ],
    snackGroup,
  ),
  newMeal(
    "shir-snack-option-5",
    "ביניים (15:30) · חטיף אנרגיה",
    [food("shir-s5-bar", "חטיף אנרגיה", "מנה עד 100 קק״ל", 1, [], "עד 100 קק״ל")],
    snackGroup,
  ),
];

const nextMenu: Meal[] = [];
let lunchInserted = false;
let snackInserted = false;
for (const meal of existing) {
  if (meal.id === lunchSource.id) {
    if (!lunchInserted) nextMenu.push(...lunchOptions);
    lunchInserted = true;
    continue;
  }
  if (meal.id === snackSource.id) {
    if (!snackInserted) nextMenu.push(...snackOptions);
    snackInserted = true;
    continue;
  }
  nextMenu.push(meal);
}
if (!lunchInserted) nextMenu.push(...lunchOptions);
if (!snackInserted) nextMenu.push(...snackOptions);

const { data: saved, error: saveError } = await supabase.rpc("save_user_planned_menu", {
  target_user_id: target.id,
  next_planned_menu: nextMenu,
});
if (saveError) throw new Error(`Planned menu update failed: ${saveError.message}`);
if (saved !== true) throw new Error("Planned menu RPC did not confirm the update.");

const { data: verified, error: verifyError } = await supabase
  .from("profiles")
  .select("planned_menu")
  .eq("id", target.id)
  .single();
if (verifyError) throw new Error(`Menu verification failed: ${verifyError.message}`);
const verifiedMenu = Array.isArray(verified.planned_menu)
  ? (verified.planned_menu as Array<{ name?: string; mealOptionGroupId?: string }>)
  : [];
console.log(
  JSON.stringify(
    {
      targetId: target.id,
      count: verifiedMenu.length,
      names: verifiedMenu.map((meal) => meal.name),
      groupedMeals: verifiedMenu.filter((meal) => meal.mealOptionGroupId).length,
    },
    null,
    2,
  ),
);