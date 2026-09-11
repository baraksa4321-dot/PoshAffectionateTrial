import { createClient } from "@supabase/supabase-js";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing runtime configuration: ${name}`);
  return value;
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

const menu = Array.isArray(candidates[0]?.planned_menu) ? candidates[0].planned_menu : [];
const foods = menu.flatMap((meal: any) =>
  Array.isArray(meal?.foods)
    ? meal.foods.map((food: any) => ({
        meal: meal.name,
        id: food.id,
        foodId: food.foodId ?? null,
        name: food.name,
        servingSize: food.servingSize,
        quantity: food.quantity,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber ?? null,
        notes: food.notes ?? null,
      }))
    : [],
);
const zeroFoods = foods.filter(
  (food) =>
    Number(food.calories) === 0 &&
    Number(food.protein) === 0 &&
    Number(food.carbs) === 0 &&
    Number(food.fat) === 0,
);
const uniqueZeroFoods = Array.from(
  new Map(
    zeroFoods.map((food) => [
      `${food.name}|${food.servingSize}|${food.quantity}`,
      {
        name: food.name,
        servingSize: food.servingSize,
        quantity: food.quantity,
        meals: foods.filter((candidate) => candidate.name === food.name).map((candidate) => candidate.meal),
      },
    ]),
  ).values(),
);

console.log(
  JSON.stringify(
    {
      mealCount: menu.length,
      foodCount: foods.length,
      zeroFoodCount: zeroFoods.length,
      uniqueZeroFoods,
      allFoods: undefined,
    },
    null,
    2,
  ),
);