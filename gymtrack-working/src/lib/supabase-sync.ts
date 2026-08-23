import { ISRAELI_FOOD_DATABASE } from "./israeli-food-db";
import { supabase } from "./supabase";
import {
  type ClientLink,
  type CardioLog,
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
export type PullResult =
  { success: true; data: GymData } | { success: false; data: GymData; error: string };

export type CoachClientData = {
  programs: Program[];
  workouts: Workout[];
  nutritionDays: NutritionDay[];
  history: HistorySession[];
  cardioLogs: CardioLog[];
  profile?: UserProfile;
  error?: string;
};

function isMissingTableInSchemaCache(error: unknown, tableName: string): boolean {
  const candidate = error as { code?: unknown; message?: unknown } | null;
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const message = error instanceof Error ? error.message : String(candidate?.message ?? error);
  return (
    (code === "PGRST205" && message.includes(tableName)) ||
    message.includes(`public.${tableName}`) ||
    (message.includes(tableName) && message.includes("schema cache"))
  );
}

async function requireSuccessfulWrite(
  operation: PromiseLike<{ error: unknown }>,
  label: string,
): Promise<void> {
  const { error } = await operation;
  if (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "Unknown database error";
    throw new Error(`${label}: ${message}`);
  }
}

export async function syncLocalToSupabase(
  userId: string,
  localData: GymData,
  userEmail?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Profile
    if (localData.userProfile || userEmail) {
      const p = localData.userProfile ?? { weight: 65 };
      await requireSuccessfulWrite(
        supabase.from("profiles").upsert(
          {
            id: userId,
            email: userEmail || undefined,
            weight_kg: p.weight,
            height_cm: p.height,
            today_routine_enabled: p.todayRoutineEnabled ?? true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        ),
        "Profile sync",
      );
    }

    // 2. Custom Exercises
    // Built-in exercises use stable `ex-` identifiers. Custom exercises use
    // generated ids and are synced per user; this keeps an expanded library
    // from being needlessly copied into each account.
    const customExercises = localData.exercises.filter(
      (exercise) => !exercise.id.startsWith("ex-"),
    );

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
      await requireSuccessfulWrite(
        supabase.from("custom_exercises").upsert(payload, { onConflict: "id" }),
        "Custom exercises sync",
      );
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
      await requireSuccessfulWrite(
        supabase.from("programs").upsert(programPayload, { onConflict: "id" }),
        "Programs sync",
      );

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
          await requireSuccessfulWrite(
            supabase.from("program_days").upsert(dayPayload, { onConflict: "id" }),
            "Program days sync",
          );
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
      await requireSuccessfulWrite(
        supabase.from("workout_sessions").upsert(historyPayload, { onConflict: "id" }),
        "Workout history sync",
      );
    }

    // 4c. Cardio Logs
    // Reconcile deletions as well as upserts so local delete actions persist
    // across devices. The user_id is always derived from the signed-in user.
    // This migration is not present in every connected project yet, so a
    // missing schema-cache entry must not prevent the other data from syncing.
    const cardioPayload = (localData.cardioLogs ?? []).map((log) => ({
      id: log.id,
      user_id: userId,
      date: log.date,
      type: log.type,
      duration_min: log.durationMin,
      intensity: log.intensity,
      speed_kmh: log.speed,
      incline_pct: log.incline,
      distance_km: log.distanceKm,
      calories: log.calories,
      updated_at: new Date().toISOString(),
    }));
    let cardioTableAvailable = true;
    try {
      if (cardioPayload.length > 0) {
        await requireSuccessfulWrite(
          supabase.from("cardio_logs").upsert(cardioPayload, { onConflict: "id" }),
          "Cardio logs sync",
        );
      }
    } catch (error: unknown) {
      if (isMissingTableInSchemaCache(error, "cardio_logs")) {
        cardioTableAvailable = false;
        console.warn("[Optional cardio sync skipped]: public.cardio_logs is unavailable");
      } else {
        throw error;
      }
    }

    if (cardioTableAvailable) {
      try {
        const { data: remoteCardioLogs, error: remoteCardioError } = await supabase
          .from("cardio_logs")
          .select("id")
          .eq("user_id", userId);
        if (remoteCardioError)
          throw new Error(`Cardio logs lookup failed: ${remoteCardioError.message}`);
        const localCardioIds = new Set((localData.cardioLogs ?? []).map((log) => log.id));
        const deletedCardioIds = (remoteCardioLogs ?? [])
          .map((row) => row.id as string)
          .filter((id) => !localCardioIds.has(id));
        if (deletedCardioIds.length > 0) {
          await requireSuccessfulWrite(
            supabase.from("cardio_logs").delete().in("id", deletedCardioIds),
            "Cardio logs deletion sync",
          );
        }
      } catch (error: unknown) {
        if (isMissingTableInSchemaCache(error, "cardio_logs")) {
          console.warn(
            "[Optional cardio deletion sync skipped]: public.cardio_logs is unavailable",
          );
        } else {
          throw error;
        }
      }
    }

    // 4b. Body Weight Logs (Historical Dated Weigh-Ins)
    if (localData.bodyWeightLogs && localData.bodyWeightLogs.length > 0) {
      const weighInPayload = localData.bodyWeightLogs.map((log) => ({
        user_id: userId,
        date: log.date,
        weight_kg: log.weight,
        updated_at: new Date().toISOString(),
      }));
      await requireSuccessfulWrite(
        supabase.from("body_weight_logs").upsert(weighInPayload, { onConflict: "user_id,date" }),
        "Body weight log sync",
      ).catch((error: unknown) => {
        if (isMissingTableInSchemaCache(error, "body_weight_logs")) {
          console.warn(
            "[Optional body weight sync skipped]: public.body_weight_logs is unavailable",
          );
          return;
        }
        throw error;
      });
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
      await requireSuccessfulWrite(
        supabase.from("custom_foods").upsert(customFoodPayload, { onConflict: "id" }),
        "Custom foods sync",
      );
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
        ...(nd.waterMl === undefined ? {} : { water_ml: nd.waterMl }),
        ...(nd.waterTargetMl === undefined ? {} : { water_target_ml: nd.waterTargetMl }),
      }));
      await requireSuccessfulWrite(
        supabase.from("nutrition_days").upsert(nutritionPayload, { onConflict: "id" }),
        "Nutrition log sync",
      );
    }

    // 7. Food Favorites
    if (localData.favoriteFoods && localData.favoriteFoods.length > 0) {
      const favPayload = localData.favoriteFoods.map((foodId) => ({
        user_id: userId,
        food_id: foodId,
      }));
      await requireSuccessfulWrite(
        supabase.from("food_favorites").upsert(favPayload, { onConflict: "user_id,food_id" }),
        "Favorites sync",
      );
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[Supabase Sync Error]:", err);
    return {
      success: false,
      error: err instanceof Error && err.message ? err.message : "Cloud sync failed",
    };
  }
}

export async function pullSupabaseData(userId: string, localState: GymData): Promise<PullResult> {
  const nextData: GymData = { ...localState };

  try {
    // 1. Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(`Profile pull failed: ${profileError.message}`);

    if (!profile) throw new Error("Profile pull failed: authenticated user has no profile");
    if (profile.role !== "owner" && profile.role !== "coach" && profile.role !== "client") {
      throw new Error("Profile pull failed: authenticated user has an invalid role");
    }
    nextData.userProfile = {
      ...nextData.userProfile,
      weight: profile.weight_kg ? Number(profile.weight_kg) : (nextData.userProfile?.weight ?? 65),
      height: profile.height_cm ? Number(profile.height_cm) : nextData.userProfile?.height,
      role: profile.role as UserRole,
      coachId: profile.coach_id || undefined,
      todayRoutineEnabled: profile.today_routine_enabled ?? true,
    };

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const authTheme = authUser?.user_metadata?.theme;
    if (
      authTheme === "pink" ||
      authTheme === "blue" ||
      authTheme === "beige" ||
      authTheme === "green" ||
      authTheme === "yellow" ||
      authTheme === "black" ||
      authTheme === "lavender" ||
      authTheme === "peach" ||
      authTheme === "mint"
    ) {
      nextData.userProfile = { ...(nextData.userProfile ?? { weight: 65 }), theme: authTheme };
    }

    // 2. Fetch Coach Messages if Client
    const { data: messages, error: messagesError } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });
    if (messagesError) throw new Error(`Messages pull failed: ${messagesError.message}`);

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

    // 3. Coach sees only their links. Owner can hydrate all links under the
    // existing owner policy; neither path infers a role from identity details.
    const role = nextData.userProfile?.role;
    if (role === "coach" || role === "owner") {
      let clientLinksQuery = supabase
        .from("coach_clients")
        .select(
          "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name)",
        );
      if (role === "coach") {
        clientLinksQuery = clientLinksQuery.eq("coach_id", userId);
      }
      const { data: clientLinks, error: clientLinksError } = await clientLinksQuery;
      if (clientLinksError)
        throw new Error(`Client links pull failed: ${clientLinksError.message}`);

      if (clientLinks) {
        nextData.clients = clientLinks.map((link) => ({
          id: link.id,
          clientId: link.client_id,
          clientEmail: link.profiles?.email || undefined,
          clientName: link.profiles?.full_name || undefined,
          createdAt: link.created_at,
        }));
      }
    }

    // 4. Custom Exercises
    const { data: dbCustomExercises, error: customExercisesError } = await supabase
      .from("custom_exercises")
      .select("*")
      .eq("user_id", userId);
    if (customExercisesError)
      throw new Error(`Custom exercises pull failed: ${customExercisesError.message}`);

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
    const { data: dbPrograms, error: programsError } = await supabase
      .from("programs")
      .select("*")
      .eq("user_id", userId);
    if (programsError) throw new Error(`Programs pull failed: ${programsError.message}`);

    const { data: dbProgramDays, error: programDaysError } = await supabase
      .from("program_days")
      .select("*")
      .eq("user_id", userId);
    if (programDaysError) throw new Error(`Program days pull failed: ${programDaysError.message}`);

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
    const { data: dbSessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (sessionsError) throw new Error(`Workout history pull failed: ${sessionsError.message}`);

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

    // 7. Body Weight Logs
    const { data: dbBodyWeightLogs, error: bodyWeightError } = await supabase
      .from("body_weight_logs")
      .select("id, date, weight_kg")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (bodyWeightError && !isMissingTableInSchemaCache(bodyWeightError, "body_weight_logs")) {
      throw new Error(`Weight logs pull failed: ${bodyWeightError.message}`);
    }
    if (bodyWeightError) {
      console.warn("[Optional body weight pull skipped]: public.body_weight_logs is unavailable");
    }

    if (dbBodyWeightLogs && dbBodyWeightLogs.length > 0) {
      nextData.bodyWeightLogs = dbBodyWeightLogs.map((row) => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        weight: Number(row.weight_kg),
      }));
    }

    // 7b. Cardio Logs
    const { data: dbCardioLogs, error: cardioError } = await supabase
      .from("cardio_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (cardioError && !isMissingTableInSchemaCache(cardioError, "cardio_logs")) {
      throw new Error(`Cardio pull failed: ${cardioError.message}`);
    }
    if (cardioError) {
      console.warn("[Optional cardio pull skipped]: public.cardio_logs is unavailable");
    }
    // Preserve local entries while the optional table is unavailable. Also
    // preserve them when the cloud table is empty, allowing a failed first
    // upload to retry instead of losing the user's newly entered history.
    if (!cardioError && dbCardioLogs && dbCardioLogs.length > 0) {
      nextData.cardioLogs = dbCardioLogs.map((row): CardioLog => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        type: row.type,
        durationMin: Number(row.duration_min),
        intensity: row.intensity || undefined,
        speed: row.speed_kmh === null ? undefined : Number(row.speed_kmh),
        incline: row.incline_pct === null ? undefined : Number(row.incline_pct),
        distanceKm: row.distance_km === null ? undefined : Number(row.distance_km),
        calories: Number(row.calories),
      }));
    }

    // 8. Custom Foods
    const { data: dbCustomFoods, error: customFoodsError } = await supabase
      .from("custom_foods")
      .select("*")
      .eq("user_id", userId);
    if (customFoodsError) throw new Error(`Custom foods pull failed: ${customFoodsError.message}`);

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

    // 9. Nutrition Days
    const { data: dbNutritionDays, error: nutritionDaysError } = await supabase
      .from("nutrition_days")
      .select("*")
      .eq("user_id", userId);
    if (nutritionDaysError) throw new Error(`Nutrition pull failed: ${nutritionDaysError.message}`);

    if (dbNutritionDays && dbNutritionDays.length > 0) {
      const daysList: NutritionDay[] = dbNutritionDays.map((row) => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        meals: row.meals || [],
        waterMl: row.water_ml === null ? undefined : Number(row.water_ml ?? 0),
        waterTargetMl:
          row.water_target_ml === null ? undefined : Number(row.water_target_ml ?? 2500),
      }));
      nextData.nutritionDays = daysList;
    }

    // 10. Food Favorites
    const { data: dbFavs, error: favoritesError } = await supabase
      .from("food_favorites")
      .select("food_id")
      .eq("user_id", userId);
    if (favoritesError) throw new Error(`Favorites pull failed: ${favoritesError.message}`);

    if (dbFavs) {
      nextData.favoriteFoods = dbFavs.map((f) => f.food_id);
    }
    return { success: true, data: nextData };
  } catch (err: unknown) {
    const error = err instanceof Error && err.message ? err.message : "Cloud data pull failed";
    console.error("[Supabase Pull Error]:", error);
    return { success: false, data: localState, error };
  }
}

export async function pullClientDataForCoach(clientId: string): Promise<CoachClientData> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();
    if (profileError) throw new Error(`Client profile pull failed: ${profileError.message}`);

    const { data: dbPrograms, error: programsError } = await supabase
      .from("programs")
      .select("*")
      .eq("user_id", clientId);
    if (programsError) throw new Error(`Client programs pull failed: ${programsError.message}`);

    const { data: dbProgramDays, error: programDaysError } = await supabase
      .from("program_days")
      .select("*")
      .eq("user_id", clientId);
    if (programDaysError)
      throw new Error(`Client program days pull failed: ${programDaysError.message}`);

    const { data: dbNutritionDays, error: nutritionError } = await supabase
      .from("nutrition_days")
      .select("*")
      .eq("user_id", clientId);
    if (nutritionError) throw new Error(`Client nutrition pull failed: ${nutritionError.message}`);

    const { data: dbSessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", clientId)
      .order("date", { ascending: false });
    if (sessionsError)
      throw new Error(`Client workout history pull failed: ${sessionsError.message}`);

    const { data: dbCardioLogs, error: cardioError } = await supabase
      .from("cardio_logs")
      .select("*")
      .eq("user_id", clientId)
      .order("date", { ascending: false });
    if (cardioError) throw new Error(`Client cardio pull failed: ${cardioError.message}`);

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
    const cardioList: CardioLog[] = (dbCardioLogs || []).map((row) => ({
      id: row.id,
      date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
      type: row.type,
      durationMin: Number(row.duration_min),
      intensity: row.intensity || undefined,
      speed: row.speed_kmh === null ? undefined : Number(row.speed_kmh),
      incline: row.incline_pct === null ? undefined : Number(row.incline_pct),
      distanceKm: row.distance_km === null ? undefined : Number(row.distance_km),
      calories: Number(row.calories),
    }));

    return {
      programs: programsList,
      workouts: Array.from(workoutsMap.values()),
      nutritionDays: nutritionList,
      history: historyList,
      cardioLogs: cardioList,
      profile: profile
        ? {
            weight: Number(profile.weight_kg || 65),
            height: Number(profile.height_cm || 165),
            role: profile.role || "client",
          }
        : undefined,
    };
  } catch (err: unknown) {
    const error = err instanceof Error && err.message ? err.message : "Client data pull failed";
    console.error("[Pull Client Data Error]:", error);
    return { programs: [], workouts: [], nutritionDays: [], history: [], cardioLogs: [], error };
  }
}
