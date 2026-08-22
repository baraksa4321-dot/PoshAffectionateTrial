import { ISRAELI_FOOD_DATABASE } from "./israeli-food-db";
import { supabase } from "./supabase";
import {
  type ClientLink,
  type CoachMessage,
  type Exercise,
  type FoodItem,
  type GymData,
  type HistorySession,
  type NutritionDay,
  type Program,
  type UserProfile,
  type UserRole,
  type Workout,
} from "./gym-types";

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export async function syncLocalToSupabase(
  userId: string,
  localData: GymData,
  userEmail?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Profile
    if (localData.userProfile || userEmail) {
      const p = localData.userProfile ?? { weight: 65 };
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email: userEmail || undefined,
          weight_kg: p.weight,
          height_cm: p.height,
          role: p.role || "client",
          coach_id: p.coachId || null,
          today_routine_enabled: p.todayRoutineEnabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    }

    // 2. Custom Exercises
    const defaultExerciseIds = new Set([
      "ex-bench",
      "ex-squat",
      "ex-row",
      "ex-curl",
      "ex-hipthrust",
      "ex-plank",
      "ex-ohp",
      "ex-rdl",
    ]);

    const customExercises = localData.exercises.filter((e) => !defaultExerciseIds.has(e.id));

    if (customExercises.length > 0) {
      const payload = customExercises.map((e) => ({
        id: e.id,
        user_id: userId,
        name: e.name,
        muscle_group: e.muscleGroup,
        equipment: e.equipment,
        category: e.category,
        description: e.description,
        instructions: e.instructions,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("custom_exercises").upsert(payload, { onConflict: "id" });
    }

    // 3. Programs & Program Days
    if (localData.programs.length > 0) {
      const programPayload = localData.programs.map((p) => ({
        id: p.id,
        user_id: userId,
        name: p.name,
        description: p.notes,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("programs").upsert(programPayload, { onConflict: "id" });

      for (const p of localData.programs) {
        const days = p.dayIds
          .map((dayId) => localData.workouts.find((w) => w.id === dayId))
          .filter((w): w is Workout => Boolean(w));

        if (days.length > 0) {
          const dayPayload = days.map((d, index) => ({
            id: d.id,
            program_id: p.id,
            user_id: userId,
            name: d.name,
            items: d.items,
            sort_order: index,
            updated_at: new Date().toISOString(),
          }));
          await supabase.from("program_days").upsert(dayPayload, { onConflict: "id" });
        }
      }
    }

    // 4. Workout Sessions / History (including difficulty rating & discomfort notes)
    if (localData.history.length > 0) {
      const historyPayload = localData.history.map((s) => ({
        id: s.id,
        user_id: userId,
        workout_id: s.workoutId,
        workout_name: s.workoutName,
        program_name: s.programName,
        date: s.date,
        duration_sec: s.durationSec,
        entries: s.entries,
        notes: s.notes,
        difficulty_rating: s.difficultyRating,
        discomfort_notes: s.discomfortNotes,
      }));
      await supabase.from("workout_sessions").upsert(historyPayload, { onConflict: "id" });
    }

    // 4b. Body Weight Logs (Historical Dated Weigh-Ins)
    if (localData.bodyWeightLogs && localData.bodyWeightLogs.length > 0) {
      const weighInPayload = localData.bodyWeightLogs.map((log) => ({
        user_id: userId,
        date: log.date,
        weight_kg: log.weight,
        updated_at: new Date().toISOString(),
      }));
      await supabase
        .from("body_measurements")
        .upsert(weighInPayload, { onConflict: "user_id,date" });
    }

    // 5. Custom Foods
    const seedFoodIds = new Set(ISRAELI_FOOD_DATABASE.map((f) => f.id));
    const customFoods = localData.foods.filter((f) => !seedFoodIds.has(f.id));

    if (customFoods.length > 0) {
      const customFoodPayload = customFoods.map((f) => ({
        id: f.id,
        user_id: userId,
        name: f.name,
        english_name: f.englishName,
        category: f.category ?? "כללי",
        brand: f.brand,
        serving_unit: f.servingSize ?? "100g",
        serving_grams: 100,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        fiber: f.fiber ?? 0,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("custom_foods").upsert(customFoodPayload, { onConflict: "id" });
    }

    // 6. Nutrition Days
    if (localData.nutritionDays.length > 0) {
      const nutritionPayload = localData.nutritionDays.map((nd) => ({
        id: nd.id ?? `${userId}_${nd.date}`,
        user_id: userId,
        date: nd.date,
        target_calories: localData.nutritionTargets.calories,
        meals: nd.meals,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("nutrition_days").upsert(nutritionPayload, { onConflict: "id" });
    }

    // 7. Food Favorites
    if (localData.favoriteFoods && localData.favoriteFoods.length > 0) {
      const favPayload = localData.favoriteFoods.map((foodId) => ({
        user_id: userId,
        food_id: foodId,
      }));
      await supabase.from("food_favorites").upsert(favPayload, { onConflict: "user_id,food_id" });
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Supabase Sync Error]:", err);
    return { success: false, error: err?.message || "Cloud sync failed" };
  }
}

export async function pullSupabaseData(userId: string, localState: GymData): Promise<GymData> {
  const nextData: GymData = { ...localState };

  try {
    // 1. Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      nextData.userProfile = {
        ...nextData.userProfile,
        weight: profile.weight_kg
          ? Number(profile.weight_kg)
          : (nextData.userProfile?.weight ?? 65),
        height: profile.height_cm ? Number(profile.height_cm) : nextData.userProfile?.height,
        role: (profile.role as UserRole) || "client",
        coachId: profile.coach_id || undefined,
        todayRoutineEnabled: profile.today_routine_enabled ?? true,
      };
    }

    // 2. Fetch Coach Messages if Client
    const { data: messages } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    if (messages && messages.length > 0) {
      nextData.coachMessages = messages.map((m) => ({
        id: m.id,
        coachId: m.coach_id,
        clientId: m.client_id,
        message: m.message,
        createdAt: m.created_at,
        isRead: m.is_read,
      }));
    }

    // 3. If Coach, fetch client links
    if (nextData.userProfile?.role === "coach") {
      const { data: clientLinks } = await supabase
        .from("coach_clients")
        .select(
          "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name)",
        )
        .eq("coach_id", userId);

      if (clientLinks) {
        nextData.clients = clientLinks.map((link: any) => ({
          id: link.id,
          clientId: link.client_id,
          clientEmail: link.profiles?.email || undefined,
          clientName: link.profiles?.full_name || undefined,
          createdAt: link.created_at,
        }));
      }
    }

    // 4. Custom Exercises
    const { data: dbCustomExercises } = await supabase
      .from("custom_exercises")
      .select("*")
      .eq("user_id", userId);

    if (dbCustomExercises && dbCustomExercises.length > 0) {
      const customMap = new Map(nextData.exercises.map((e) => [e.id, e]));
      for (const row of dbCustomExercises) {
        const exItem: Exercise = {
          id: row.id,
          name: row.name,
          muscleGroup: row.muscle_group,
          muscleGroups: [row.muscle_group],
          category: row.category || "מורכב",
          equipment: row.equipment || "מוט",
          description: row.description || "",
          instructions: row.instructions || "",
        };
        customMap.set(row.id, exItem);
      }
      nextData.exercises = Array.from(customMap.values());
    }

    // 5. Programs & Days
    const { data: dbPrograms } = await supabase.from("programs").select("*").eq("user_id", userId);

    const { data: dbProgramDays } = await supabase
      .from("program_days")
      .select("*")
      .eq("user_id", userId);

    if (dbPrograms && dbPrograms.length > 0) {
      const workoutsMap = new Map(nextData.workouts.map((w) => [w.id, w]));
      const programsList: Program[] = [];

      for (const pRow of dbPrograms) {
        const matchingDays = (dbProgramDays || [])
          .filter((d) => d.program_id === pRow.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        const dayIds: string[] = [];
        for (const dRow of matchingDays) {
          dayIds.push(dRow.id);
          const workoutItem: Workout = {
            id: dRow.id,
            name: dRow.name,
            notes: "",
            items: dRow.items || [],
          };
          workoutsMap.set(dRow.id, workoutItem);
        }

        programsList.push({
          id: pRow.id,
          name: pRow.name,
          notes: pRow.description || "",
          dayIds,
        });
      }

      nextData.programs = programsList;
      nextData.workouts = Array.from(workoutsMap.values());
    }

    // 6. History Sessions
    const { data: dbSessions } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (dbSessions && dbSessions.length > 0) {
      const historyList: HistorySession[] = dbSessions.map((row) => ({
        id: row.id,
        workoutId: row.workout_id || "",
        workoutName: row.workout_name,
        programName: row.program_name || "",
        date: row.date,
        durationSec: row.duration_sec,
        entries: row.entries || [],
        notes: row.notes || "",
        difficultyRating: row.difficulty_rating,
        discomfortNotes: row.discomfort_notes,
      }));
      nextData.history = historyList;
    }

    // 7. Custom Foods
    const { data: dbCustomFoods } = await supabase
      .from("custom_foods")
      .select("*")
      .eq("user_id", userId);

    if (dbCustomFoods && dbCustomFoods.length > 0) {
      const foodMap = new Map(nextData.foods.map((f) => [f.id, f]));
      for (const row of dbCustomFoods) {
        const foodItem: FoodItem = {
          id: row.id,
          name: row.name,
          englishName: row.english_name || undefined,
          category: row.category,
          brand: row.brand || undefined,
          servingSize: row.serving_unit || "100g",
          calories: Number(row.calories),
          protein: Number(row.protein),
          carbs: Number(row.carbs),
          fat: Number(row.fat),
          fiber: Number(row.fiber || 0),
        };
        foodMap.set(row.id, foodItem);
      }
      nextData.foods = Array.from(foodMap.values());
    }

    // 8. Nutrition Days
    const { data: dbNutritionDays } = await supabase
      .from("nutrition_days")
      .select("*")
      .eq("user_id", userId);

    if (dbNutritionDays && dbNutritionDays.length > 0) {
      const daysList: NutritionDay[] = dbNutritionDays.map((row) => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        meals: row.meals || [],
      }));
      nextData.nutritionDays = daysList;
    }

    // 9. Food Favorites
    const { data: dbFavs } = await supabase
      .from("food_favorites")
      .select("food_id")
      .eq("user_id", userId);

    if (dbFavs) {
      nextData.favoriteFoods = dbFavs.map((f) => f.food_id);
    }
  } catch (err) {
    console.error("[Supabase Pull Error]:", err);
  }

  return nextData;
}

export async function pullClientDataForCoach(clientId: string): Promise<{
  programs: Program[];
  workouts: Workout[];
  nutritionDays: NutritionDay[];
  history: HistorySession[];
  profile?: UserProfile;
}> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    const { data: dbPrograms } = await supabase
      .from("programs")
      .select("*")
      .eq("user_id", clientId);

    const { data: dbProgramDays } = await supabase
      .from("program_days")
      .select("*")
      .eq("user_id", clientId);

    const { data: dbNutritionDays } = await supabase
      .from("nutrition_days")
      .select("*")
      .eq("user_id", clientId);

    const { data: dbSessions } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", clientId)
      .order("date", { ascending: false });

    const workoutsMap = new Map<string, Workout>();
    const programsList: Program[] = [];

    if (dbPrograms && dbPrograms.length > 0) {
      for (const pRow of dbPrograms) {
        const matchingDays = (dbProgramDays || [])
          .filter((d) => d.program_id === pRow.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        const dayIds: string[] = [];
        for (const dRow of matchingDays) {
          dayIds.push(dRow.id);
          workoutsMap.set(dRow.id, {
            id: dRow.id,
            name: dRow.name,
            notes: "",
            items: dRow.items || [],
          });
        }

        programsList.push({
          id: pRow.id,
          name: pRow.name,
          notes: pRow.description || "",
          dayIds,
        });
      }
    }

    const nutritionList: NutritionDay[] = (dbNutritionDays || []).map((row) => ({
      id: row.id,
      date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
      meals: row.meals || [],
    }));

    const historyList: HistorySession[] = (dbSessions || []).map((row) => ({
      id: row.id,
      workoutId: row.workout_id || "",
      workoutName: row.workout_name,
      programName: row.program_name || "",
      date: row.date,
      durationSec: row.duration_sec,
      entries: row.entries || [],
      notes: row.notes || "",
    }));

    return {
      programs: programsList,
      workouts: Array.from(workoutsMap.values()),
      nutritionDays: nutritionList,
      history: historyList,
      profile: profile
        ? {
            weight: Number(profile.weight_kg || 65),
            height: Number(profile.height_cm || 165),
            role: profile.role || "client",
          }
        : undefined,
    };
  } catch (err) {
    console.error("[Pull Client Data Error]:", err);
    return { programs: [], workouts: [], nutritionDays: [], history: [] };
  }
}
