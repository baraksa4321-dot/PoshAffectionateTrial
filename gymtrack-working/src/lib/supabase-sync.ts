import { supabase } from "./supabase";
import {
  type ClientLink,
  type CardioLog,
  type CoachMessage,
  type Exercise,
  type FoodItem,
  type GymData,
  type HistorySession,
  type NutritionTargets,
  type NutritionDay,
  type Meal,
  type Program,
  type UserProfile,
  type UserRole,
  type Workout,
  type BodyMeasurement,
  type ClientHabits,
  type SavedRecipe,
  type BroadcastAnnouncement,
  type FoodCatalogMetadata,
} from "./gym-types";

export type SyncStatus = "idle" | "syncing" | "synced" | "pending" | "error" | "offline";
export type PullResult =
  { success: true; data: GymData } | { success: false; data: GymData; error: string };

export type CoachClientData = {
  programs: Program[];
  workouts: Workout[];
  nutritionDays: NutritionDay[];
  plannedMeals: Meal[];
  nutritionTargets: NutritionTargets;
  history: HistorySession[];
  cardioLogs: CardioLog[];
  bodyMeasurements: BodyMeasurement[];
  profile?: UserProfile;
  error?: string;
};

export type RealtimeCleanup = () => void;
export type RealtimeConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

function isBuiltInFood(food: FoodItem) {
  return (
    !food.ownerId &&
    (food.id.startsWith("f-israel-") ||
      food.id.startsWith("f-usda-") ||
      food.id.startsWith("f-common-") ||
      food.id.startsWith("f-protein-"))
  );
}

function catalogMetadataFromRow(row: Record<string, unknown>): FoodCatalogMetadata | undefined {
  const source = row["catalog_source"];
  const verificationStatus = row["catalog_verification_status"];
  const productType = row["catalog_product_type"];
  if (
    (source !== "curated-israel" && source !== "open-food-facts") ||
    (verificationStatus !== "curated-unverified" &&
      verificationStatus !== "manufacturer-verified" &&
      verificationStatus !== "external-unverified") ||
    (productType !== "powder" &&
      productType !== "bar" &&
      productType !== "drink" &&
      productType !== "pudding" &&
      productType !== "yogurt" &&
      productType !== "other") ||
    row["catalog_source_product_id"] === null ||
    row["catalog_source_product_id"] === undefined
  ) {
    return undefined;
  }
  return {
    source,
    sourceProductId: String(row["catalog_source_product_id"]),
    ...(row["barcode"] ? { barcode: String(row["barcode"]) } : {}),
    ...(row["catalog_source_url"] ? { sourceUrl: String(row["catalog_source_url"]) } : {}),
    productType,
    market: "IL",
    ...(row["catalog_package_size"]
      ? { packageSize: String(row["catalog_package_size"]) }
      : {}),
    ...(row["catalog_synced_at"] ? { syncedAt: String(row["catalog_synced_at"]) } : {}),
    ...(row["catalog_source_updated_at"]
      ? { sourceUpdatedAt: String(row["catalog_source_updated_at"]) }
      : {}),
    verificationStatus,
  };
}

function foodItemFromPublicCatalogRow(row: Record<string, unknown>): FoodItem | undefined {
  const catalog = catalogMetadataFromRow(row);
  const id = typeof row["id"] === "string" ? row["id"] : "";
  const name = typeof row["name"] === "string" ? row["name"] : "";
  const servingSize = typeof row["serving_unit"] === "string" ? row["serving_unit"] : "";
  const numericFields = ["calories", "protein", "carbs", "fat"] as const;
  if (!id || !name.trim() || !servingSize.trim() || !catalog) return undefined;
  if (
    numericFields.some((field) => {
      const value = Number(row[field]);
      return !Number.isFinite(value) || value < 0;
    })
  ) {
    return undefined;
  }
  const englishName = typeof row["english_name"] === "string" ? row["english_name"] : "";
  const brand = typeof row["brand"] === "string" ? row["brand"] : "";
  const fiber = Number(row["fiber"]);
  const searchAliases = Array.isArray(row["search_aliases"])
    ? row["search_aliases"].filter((term): term is string => typeof term === "string")
    : [];
  return {
    id,
    name,
    ...(englishName ? { englishName } : {}),
    category: typeof row["category"] === "string" ? row["category"] : "מוצרי חלבון",
    ...(brand ? { brand } : {}),
    servingSize,
    calories: Number(row["calories"]),
    protein: Number(row["protein"]),
    carbs: Number(row["carbs"]),
    fat: Number(row["fat"]),
    fiber: Number.isFinite(fiber) && fiber >= 0 ? fiber : 0,
    searchTerms: searchAliases,
    notes: "מוצר שיובא ממקור ברקודים חיצוני; מומלץ לבדוק את תווית היצרן.",
    catalog,
  };
}

type RealtimeTableSubscription = {
  table: string;
  filter?: string;
};

function subscribeToRealtimeTables(
  channelName: string,
  subscriptions: RealtimeTableSubscription[],
  onChange: (table?: string, status?: RealtimeConnectionStatus) => void,
): RealtimeCleanup {
  if (typeof supabase.channel !== "function") return () => undefined;

  let channel: ReturnType<typeof supabase.channel> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let stopped = false;

  const notifyConnectionStatus = (status: RealtimeConnectionStatus) => {
    if (!stopped) onChange(undefined, status);
  };

  const scheduleReconnect = () => {
    if (stopped || reconnectTimer || typeof supabase.channel !== "function") return;
    notifyConnectionStatus(
      typeof navigator !== "undefined" && !navigator.onLine ? "disconnected" : "reconnecting",
    );
    const delay = Math.min(30_000, 1_000 * 2 ** reconnectAttempts);
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!stopped) subscribe();
    }, delay);
  };

  const subscribe = () => {
    if (stopped) return;
    notifyConnectionStatus(
      typeof navigator !== "undefined" && !navigator.onLine
        ? "disconnected"
        : reconnectAttempts > 0
          ? "reconnecting"
          : "connecting",
    );
    const nextChannel = supabase.channel(channelName);
    const addSubscription = (table: string, filter?: string) => {
      const notify = () => {
        if (!stopped) onChange(table);
      };
      nextChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        notify,
      );
    };

    subscriptions.forEach(({ table, filter }) => addSubscription(table, filter));

    channel = nextChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        reconnectAttempts = 0;
        notifyConnectionStatus("connected");
        return;
      }
      if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT" && status !== "CLOSED") return;
      if (channel !== nextChannel || stopped) return;
      console.warn(
        `[Coach client realtime ${status.toLowerCase()}]: scheduling an automatic resubscription`,
      );
      channel = null;
      void supabase.removeChannel(nextChannel);
      scheduleReconnect();
    });
  };

  const handleOffline = () => notifyConnectionStatus("disconnected");
  const handleOnline = () => {
    if (stopped) return;
    notifyConnectionStatus("reconnecting");
    if (!channel && !reconnectTimer) scheduleReconnect();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
  }
  subscribe();
  return () => {
    stopped = true;
    if (typeof window !== "undefined") {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };
}

/**
 * Subscribe to the rows a coach can see for one client. The callback is
 * intentionally followed by a fresh RLS-scoped pull rather than trusting the
 * Realtime payload, so assignment changes and audience-filtered rows stay
 * consistent with the database.
 */
export function subscribeToCoachClientChanges(
  clientId: string,
  onChange: (table?: string, status?: RealtimeConnectionStatus) => void,
): RealtimeCleanup {
  return subscribeToRealtimeTables(
    `gymtrack-coach-client-sync-${clientId}`,
    [
      { table: "profiles", filter: `id=eq.${clientId}` },
      { table: "programs", filter: `user_id=eq.${clientId}` },
      { table: "program_days", filter: `user_id=eq.${clientId}` },
      { table: "nutrition_days", filter: `user_id=eq.${clientId}` },
      { table: "workout_sessions", filter: `user_id=eq.${clientId}` },
      { table: "body_weight_logs", filter: `user_id=eq.${clientId}` },
      { table: "cardio_logs", filter: `user_id=eq.${clientId}` },
      { table: "body_measurements", filter: `user_id=eq.${clientId}` },
      { table: "client_habits", filter: `user_id=eq.${clientId}` },
      { table: "client_feedback", filter: `client_id=eq.${clientId}` },
      { table: "coach_messages", filter: `client_id=eq.${clientId}` },
      { table: "coach_clients", filter: `client_id=eq.${clientId}` },
    ],
    onChange,
  );
}

/**
 * Keep the coach/owner management lists current when another account changes
 * a role, assignment, or feedback entry.
 */
export function subscribeToCoachManagementChanges(
  userId: string,
  onChange: (table?: string, status?: RealtimeConnectionStatus) => void,
): RealtimeCleanup {
  return subscribeToRealtimeTables(
    `gymtrack-coach-management-sync-${userId}`,
    [
      { table: "profiles" },
      { table: "coach_clients" },
      { table: "client_feedback" },
      { table: "broadcast_announcements" },
    ],
    onChange,
  );
}

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

function isMissingColumnInSchemaCache(error: unknown, tableName: string): boolean {
  const candidate = error as { message?: unknown } | null;
  const message = error instanceof Error ? error.message : String(candidate?.message ?? error);
  return (
    message.includes(tableName) &&
    (/column .* does not exist/i.test(message) ||
      /could not find .* column .* schema cache/i.test(message))
  );
}

function cardioCloudId(localId: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(localId)) {
    return localId;
  }
  const hex = Array.from(localId)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(32, "0")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
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

async function deleteRowsMissingFromLocal(
  userId: string,
  table: string,
  localIds: string[],
  label: string,
  idColumn = "id",
  ownerColumn = "user_id",
) {
  const { data, error } = await supabase.from(table).select(idColumn).eq(ownerColumn, userId);
  if (error) throw new Error(`${label} read failed: ${error.message}`);

  const localIdSet = new Set(localIds);
  const staleIds = (data ?? [])
    .map((row) => String((row as unknown as Record<string, unknown>)[idColumn]))
    .filter((id) => !localIdSet.has(id));
  if (staleIds.length === 0) return;

  await requireSuccessfulWrite(
    supabase.from(table).delete().eq(ownerColumn, userId).in(idColumn, staleIds),
    `${label} deletion`,
  );
}

const WORKOUT_VIDEO_BUCKET = "workout-videos";

function safeVideoExtension(fileName: string, contentType: string) {
  const fromName = fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 8) return fromName;
  const fromType = contentType
    .split("/")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return fromType && fromType.length <= 8 ? fromType : "mp4";
}

/**
 * Upload a trainee performance video before it is written into a workout
 * session. Object URLs are browser-local and cannot be played by a coach in
 * another browser, so history entries always receive a durable shared URL.
 */
export async function uploadWorkoutPerformanceVideo(
  file: File,
  metadata: { workoutId: string; exerciseId: string },
): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("לא ניתן להעלות סרטון בלי חשבון מחובר");
  }

  const objectId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const extension = safeVideoExtension(file.name, file.type);
  const path = `${user.id}/${metadata.workoutId}/${metadata.exerciseId}/${objectId}.${extension}`;
  const { error } = await supabase.storage.from(WORKOUT_VIDEO_BUCKET).upload(path, file, {
    contentType: file.type || "video/mp4",
    upsert: false,
  });
  if (error) throw new Error(`העלאת סרטון נכשלה: ${error.message}`);

  const { data } = supabase.storage.from(WORKOUT_VIDEO_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("העלאת הסרטון הסתיימה בלי כתובת צפייה");
  return data.publicUrl;
}

export async function syncLocalToSupabase(
  userId: string,
  localData: GymData,
  userEmail?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Profile
    if (localData.userProfile || userEmail) {
      const p = localData.userProfile ?? { weight: 0 };
      await requireSuccessfulWrite(
        supabase.from("profiles").upsert(
          {
            id: userId,
            email: userEmail || undefined,
            weight_kg: p.weight,
            height_cm: p.height,
            age_years: p.age,
            workouts_per_week: p.workoutsPerWeek,
            gender: p.gender,
            today_routine_enabled: p.todayRoutineEnabled ?? true,
            updated_at: new Date().toISOString(),
            ...(p.role === "coach" || p.role === "owner"
              ? {
                  show_calories: p.showCalories ?? true,
                  planned_menu: localData.plannedMeals ?? [],
                }
              : {}),
          },
          { onConflict: "id" },
        ),
        "Profile sync",
      );
    }

    // 2. Custom Exercises
    // Built-in exercises use stable `ex-` identifiers. A failure in this
    // secondary library must not prevent the user's plans from syncing below.
    try {
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
          video_url: e.videoUrl || null,
          video_urls: e.videoUrls ?? null,
          video_male_url: e.videoMaleUrl || null,
          video_female_url: e.videoFemaleUrl || null,
          updated_at: new Date().toISOString(),
        }));
        await requireSuccessfulWrite(
          supabase.from("custom_exercises").upsert(payload, { onConflict: "id" }),
          "Custom exercises sync",
        );
      }
      await deleteRowsMissingFromLocal(
        userId,
        "custom_exercises",
        customExercises.map((exercise) => exercise.id),
        "Custom exercises",
      );
    } catch (error) {
      console.warn("[Optional custom exercises sync skipped]:", error);
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
    await deleteRowsMissingFromLocal(
      userId,
      "programs",
      localData.programs.map((program) => program.id),
      "Programs",
    );
    await deleteRowsMissingFromLocal(
      userId,
      "program_days",
      localData.programs.flatMap((program) => program.dayIds),
      "Program days",
    );

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
    await deleteRowsMissingFromLocal(
      userId,
      "workout_sessions",
      localData.history.map((session) => session.id),
      "Workout history",
    );

    // 4c. Cardio Logs
    // Reconcile deletions as well as upserts so local delete actions persist
    // across devices. The user_id is always derived from the signed-in user.
    // This migration is not present in every connected project yet, so a
    // missing schema-cache entry must not prevent the other data from syncing.
    const cardioPayload = (localData.cardioLogs ?? []).map((log) => ({
      id: cardioCloudId(log.id),
      user_id: userId,
      date: log.date,
      type: log.type,
      duration_min: log.durationMin,
      calories: log.calories,
      intensity: log.intensity,
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
      await deleteRowsMissingFromLocal(
        userId,
        "cardio_logs",
        cardioPayload.map((log) => log.id),
        "Cardio logs",
      );
    } catch (error: unknown) {
      if (isMissingTableInSchemaCache(error, "cardio_logs")) {
        cardioTableAvailable = false;
        console.warn("[Optional cardio sync skipped]: public.cardio_logs is unavailable");
      } else {
        throw error;
      }
    }

    // 4b. Body Weight Logs (Historical Dated Weigh-Ins)
    try {
      const weighInPayload = (localData.bodyWeightLogs ?? []).map((log) => ({
        user_id: userId,
        date: log.date,
        weight_kg: log.weight,
        updated_at: new Date().toISOString(),
      }));
      if (weighInPayload.length > 0) {
        await requireSuccessfulWrite(
          supabase.from("body_weight_logs").upsert(weighInPayload, { onConflict: "user_id,date" }),
          "Body weight log sync",
        );
      }
      const { data: remoteWeighIns, error: weighInReadError } = await supabase
        .from("body_weight_logs")
        .select("date")
        .eq("user_id", userId);
      if (weighInReadError)
        throw new Error(`Body weight log read failed: ${weighInReadError.message}`);
      const localWeightDates = new Set((localData.bodyWeightLogs ?? []).map((log) => log.date));
      const staleWeightDates = (remoteWeighIns ?? [])
        .map((row) => String(row.date).slice(0, 10))
        .filter((date) => !localWeightDates.has(date));
      if (staleWeightDates.length > 0) {
        await requireSuccessfulWrite(
          supabase
            .from("body_weight_logs")
            .delete()
            .eq("user_id", userId)
            .in("date", staleWeightDates),
          "Body weight log deletion",
        );
      }
    } catch (error: unknown) {
      if (
        isMissingTableInSchemaCache(error, "body_weight_logs") ||
        isMissingColumnInSchemaCache(error, "body_weight_logs")
      ) {
        console.warn("[Optional body weight sync skipped]: public.body_weight_logs is unavailable");
      } else {
        throw error;
      }
    }

    // 4d. Measurements and habits are persisted independently from the local UI.
    const measurementPayload = (localData.bodyMeasurements ?? []).map((m) => ({
      id: m.id,
      user_id: userId,
      date: m.date,
      chest_cm: m.chestCm ?? null,
      waist_cm: m.waistCm ?? null,
      hips_cm: m.hipsCm ?? null,
      biceps_cm: m.bicepsCm ?? null,
      thighs_cm: m.thighsCm ?? null,
      calves_cm: m.calvesCm ?? null,
      neck_cm: m.neckCm ?? null,
      body_fat_pct: m.bodyFatPct ?? null,
      muscle_mass_kg: m.muscleMassKg ?? null,
      notes: m.notes ?? null,
    }));
    if (measurementPayload.length > 0) {
      await requireSuccessfulWrite(
        supabase
          .from("body_measurements")
          .upsert(measurementPayload, { onConflict: "user_id,date" }),
        "Body measurements sync",
      );
    }
    await deleteRowsMissingFromLocal(
      userId,
      "body_measurements",
      measurementPayload.map((measurement) => measurement.id),
      "Body measurements",
    );

    const habitsPayload = (localData.habits ?? []).map((h) => ({
      id: h.id,
      user_id: userId,
      date: h.date,
      steps: h.steps,
      steps_target: h.stepsTarget,
      weigh_in_done: h.weighInDone,
      workout_done: h.workoutDone,
      busy_day_mode: h.busyDayMode,
    }));
    if (habitsPayload.length > 0) {
      await requireSuccessfulWrite(
        supabase.from("client_habits").upsert(habitsPayload, { onConflict: "user_id,date" }),
        "Client habits sync",
      );
    }
    await deleteRowsMissingFromLocal(
      userId,
      "client_habits",
      habitsPayload.map((habit) => habit.id),
      "Client habits",
    );

    // 5. Custom Foods (seed = all built-in items including USDA expansion)
    try {
      const customFoods = localData.foods.filter((food) => !isBuiltInFood(food));

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
      await deleteRowsMissingFromLocal(
        userId,
        "custom_foods",
        customFoods.map((food) => food.id),
        "Custom foods",
      );
    } catch (error) {
      if (isMissingTableInSchemaCache(error, "custom_foods")) {
        console.warn("[Optional custom foods sync skipped]:", error);
      } else {
        throw error;
      }
    }

    // 6. Nutrition Days
    if (localData.nutritionDays.length > 0) {
      const nutritionPayload = localData.nutritionDays.map((nd) => ({
        id: nd.id ?? `${userId}_${nd.date}`,
        user_id: userId,
        date: nd.date,
        target_calories: localData.nutritionTargets.calories,
        meals: nd.meals,
        planned_meals: nd.plannedMeals ?? [],
        updated_at: new Date().toISOString(),
        ...(nd.waterMl === undefined ? {} : { water_ml: nd.waterMl }),
        ...(nd.waterTargetMl === undefined ? {} : { water_target_ml: nd.waterTargetMl }),
      }));
      await requireSuccessfulWrite(
        supabase.from("nutrition_days").upsert(nutritionPayload, { onConflict: "id" }),
        "Nutrition log sync",
      );
    }
    await deleteRowsMissingFromLocal(
      userId,
      "nutrition_days",
      localData.nutritionDays.map((day) => day.id ?? `${userId}_${day.date}`),
      "Nutrition days",
    );

    // 6b. Personal recipe library. Existing RLS keeps these records scoped by owner.
    try {
      const recipePayload = (localData.recipes ?? []).map((recipe) => ({
        id: recipe.id,
        coach_id: userId,
        name: recipe.name,
        foods: recipe.foods,
      }));
      if (recipePayload.length > 0) {
        await requireSuccessfulWrite(
          supabase.from("coach_recipes").upsert(recipePayload, { onConflict: "id" }),
          "Recipe library sync",
        );
      }
      await deleteRowsMissingFromLocal(
        userId,
        "coach_recipes",
        recipePayload.map((recipe) => recipe.id),
        "Recipe library",
        "id",
        "coach_id",
      );
    } catch (error) {
      console.warn("[Optional recipe library sync skipped]:", error);
    }

    // 7. Food Favorites
    try {
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
      const { data: remoteFavorites, error: favoritesReadError } = await supabase
        .from("food_favorites")
        .select("food_id")
        .eq("user_id", userId);
      if (favoritesReadError)
        throw new Error(`Favorites read failed: ${favoritesReadError.message}`);
      const favoriteIds = new Set(localData.favoriteFoods ?? []);
      const staleFavoriteIds = (remoteFavorites ?? [])
        .map((row) => String(row.food_id))
        .filter((foodId) => !favoriteIds.has(foodId));
      if (staleFavoriteIds.length > 0) {
        await requireSuccessfulWrite(
          supabase
            .from("food_favorites")
            .delete()
            .eq("user_id", userId)
            .in("food_id", staleFavoriteIds),
          "Favorites deletion",
        );
      }
    } catch (error) {
      console.warn("[Optional food favorites sync skipped]:", error);
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
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // 1. Profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(`Profile pull failed: ${profileError.message}`);

    // Some Supabase projects do not have the usual auth -> profiles trigger.
    // A newly authenticated user must still be able to enter the app, so
    // create only their own minimal client profile through the normal RLS path.
    if (!profile && authUser?.id === userId) {
      const metadata = authUser.user_metadata ?? {};
      const { error: createProfileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: authUser.email,
          full_name: typeof metadata["full_name"] === "string" ? metadata["full_name"] : undefined,
          gender:
            metadata["gender"] === "male" || metadata["gender"] === "female"
              ? metadata["gender"]
              : undefined,
          role: "client",
          today_routine_enabled: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (createProfileError) {
        throw new Error(`Profile creation failed: ${createProfileError.message}`);
      }

      const refreshedProfile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      profile = refreshedProfile.data;
      profileError = refreshedProfile.error;
      if (profileError) {
        throw new Error(`Profile pull failed: ${profileError.message}`);
      }
    }

    if (!profile) throw new Error("Profile pull failed: authenticated user has no profile");
    if (profile.role !== "owner" && profile.role !== "coach" && profile.role !== "client") {
      throw new Error("Profile pull failed: authenticated user has an invalid role");
    }
    const fullName = profile.full_name || nextData.userProfile?.fullName;
    const height = profile.height_cm ? Number(profile.height_cm) : nextData.userProfile?.height;
    const age = profile.age_years ? Number(profile.age_years) : nextData.userProfile?.age;
    const workoutsPerWeek = profile.workouts_per_week
      ? Number(profile.workouts_per_week)
      : nextData.userProfile?.workoutsPerWeek;
    const gender =
      profile.gender === "male" || profile.gender === "female"
        ? profile.gender
        : nextData.userProfile?.gender;
    // `coach_id` is nullable and an explicit null means the assignment was
    // removed. Do not preserve the old cached pointer in that case.
    const coachId = profile.coach_id || undefined;
    const approvalStatus =
      profile.approval_status === "pending" ||
      profile.approval_status === "approved" ||
      profile.approval_status === "rejected"
        ? profile.approval_status
        : undefined;
    const {
      coachId: _cachedCoachId,
      approvalStatus: _cachedApprovalStatus,
      ...profileWithoutAssignments
    } = nextData.userProfile ?? { weight: 0 };
    nextData.userProfile = {
      ...profileWithoutAssignments,
      weight: profile.weight_kg ? Number(profile.weight_kg) : (nextData.userProfile?.weight ?? 0),
      role: profile.role as UserRole,
      todayRoutineEnabled: profile.today_routine_enabled ?? true,
      showCalories: profile.show_calories ?? true,
      ...(fullName === undefined ? {} : { fullName }),
      ...(height === undefined ? {} : { height }),
      ...(age === undefined ? {} : { age }),
      ...(workoutsPerWeek === undefined ? {} : { workoutsPerWeek }),
      ...(gender === undefined ? {} : { gender }),
      ...(coachId === undefined ? {} : { coachId }),
      ...(approvalStatus === undefined ? {} : { approvalStatus }),
    };
    nextData.plannedMeals = profile.planned_menu || [];

    const authTheme = authUser?.user_metadata?.["theme"];
    if (
      authTheme === "pink" ||
      authTheme === "blue" ||
      authTheme === "green" ||
      authTheme === "black" ||
      authTheme === "lavender" ||
      authTheme === "peach" ||
      authTheme === "mint" ||
      authTheme === "beige" ||
      authTheme === "yellow"
    ) {
      const safeTheme =
        authTheme === "mint" || authTheme === "beige" || authTheme === "yellow"
          ? "light-brown"
          : authTheme;
      nextData.userProfile = { ...(nextData.userProfile ?? { weight: 0 }), theme: safeTheme };
    }

    // 2–10. All post-profile pulls are independent. Starting them together
    // removes the old login waterfall while keeping the same RLS-scoped
    // queries and error handling.
    const role = nextData.userProfile?.role;
    const messagesPromise = supabase
      .from("coach_messages")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });
    const broadcastsPromise = supabase
      .from("broadcast_announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    const clientLinksPromise =
      role === "coach" || role === "owner"
        ? (() => {
            let query = supabase
              .from("coach_clients")
              .select(
                "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name)",
              );
            if (role === "coach") query = query.eq("coach_id", userId);
            return query;
          })()
        : Promise.resolve({ data: null, error: null });
    const customExercisesPromise = supabase
      .from("custom_exercises")
      .select("*")
      .eq("user_id", userId);
    const programsPromise = supabase.from("programs").select("*").eq("user_id", userId);
    const programDaysPromise = supabase.from("program_days").select("*").eq("user_id", userId);
    const sessionsPromise = supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    const bodyWeightPromise = supabase
      .from("body_weight_logs")
      .select("id, date, weight_kg")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    const cardioPromise = supabase.from("cardio_logs").select("*").eq("user_id", userId);
    const measurementsPromise = supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    const habitsPromise = supabase
      .from("client_habits")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    const customFoodsPromise = supabase.from("custom_foods").select("*").eq("user_id", userId);
    // Public catalog rows are optional. A project that has not applied the
    // additive catalog migration must still hydrate the account normally.
    const publicFoodsPromise = supabase
      .from("foods")
      .select(
        "id,name,english_name,category,brand,serving_unit,serving_grams,calories,protein,carbs,fat,fiber,search_aliases,barcode,catalog_source,catalog_source_product_id,catalog_source_url,catalog_product_type,catalog_package_size,catalog_synced_at,catalog_source_updated_at,catalog_verification_status",
      )
      .eq("catalog_source", "open-food-facts");
    const nutritionDaysPromise = supabase.from("nutrition_days").select("*").eq("user_id", userId);
    const recipesPromise = supabase
      .from("coach_recipes")
      .select("id, name, foods")
      .eq("coach_id", userId)
      .order("created_at", { ascending: false });
    const favoritesPromise = supabase
      .from("food_favorites")
      .select("food_id")
      .eq("user_id", userId);
    const [
      messagesResult,
      broadcastsResult,
      clientLinksResult,
      customExercisesResult,
      programsResult,
      programDaysResult,
      sessionsResult,
      bodyWeightResult,
      cardioResult,
      measurementsResult,
      habitsResult,
      customFoodsResult,
      publicFoodsResult,
      nutritionDaysResult,
      recipesResult,
      favoritesResult,
    ] = await Promise.all([
      messagesPromise,
      broadcastsPromise,
      clientLinksPromise,
      customExercisesPromise,
      programsPromise,
      programDaysPromise,
      sessionsPromise,
      bodyWeightPromise,
      cardioPromise,
      measurementsPromise,
      habitsPromise,
      customFoodsPromise,
      publicFoodsPromise,
      nutritionDaysPromise,
      recipesPromise,
      favoritesPromise,
    ]);
    const { data: messages, error: messagesError } = messagesResult;
    const { data: broadcasts, error: broadcastsError } = broadcastsResult;
    if (messagesError) throw new Error(`Messages pull failed: ${messagesError.message}`);

    if (messages) {
      nextData.coachMessages = messages.map((m) => ({
        id: m.id,
        coachId: m.coach_id,
        clientId: m.client_id,
        message: m.message,
        createdAt: m.created_at,
        isRead: m.is_read,
      }));
    }

    if (
      broadcastsError &&
      !isMissingTableInSchemaCache(broadcastsError, "broadcast_announcements")
    ) {
      throw new Error(`Broadcast announcements pull failed: ${broadcastsError.message}`);
    }
    if (broadcasts) {
      nextData.broadcasts = broadcasts.map((row): BroadcastAnnouncement => ({
        id: row.id,
        senderId: row.sender_id,
        audience: row.audience,
        message: row.message,
        createdAt: row.created_at,
      }));
    }

    // 3. Coach sees only their links. Owner can hydrate all links under the
    // existing owner policy; neither path infers a role from identity details.
    const { data: clientLinks, error: clientLinksError } = clientLinksResult;
    if (role === "coach" || role === "owner") {
      if (clientLinksError)
        throw new Error(`Client links pull failed: ${clientLinksError.message}`);

      if (clientLinks) {
        nextData.clients = clientLinks.map((link) => ({
          id: link.id,
          clientId: link.client_id,
          clientEmail: link.profiles?.[0]?.email || undefined,
          clientName: link.profiles?.[0]?.full_name || undefined,
          createdAt: link.created_at,
        }));
      }
    } else {
      // A role change can happen while a coach's old cache is still loaded.
      // Never leave the previous management list attached to a client session.
      nextData.clients = [];
    }

    // 4. Custom Exercises
    const { data: dbCustomExercises, error: customExercisesError } = customExercisesResult;
    if (customExercisesError)
      throw new Error(`Custom exercises pull failed: ${customExercisesError.message}`);

    if (dbCustomExercises) {
      const customMap = new Map(
        nextData.exercises
          .filter((exercise) => exercise.id.startsWith("ex-"))
          .map((e) => [e.id, e]),
      );
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
          videoUrl: row.video_url || "",
          videoUrls: Array.isArray(row.video_urls) ? row.video_urls : undefined,
          videoMaleUrl: row.video_male_url || undefined,
          videoFemaleUrl: row.video_female_url || undefined,
          images: [],
          notes: "",
        };
        customMap.set(row.id, exItem);
      }
      nextData.exercises = Array.from(customMap.values());
    }

    // 5. Programs & Days
    const { data: dbPrograms, error: programsError } = programsResult;
    const { data: dbProgramDays, error: programDaysError } = programDaysResult;
    if (programsError) throw new Error(`Programs pull failed: ${programsError.message}`);
    if (programDaysError) throw new Error(`Program days pull failed: ${programDaysError.message}`);

    if (dbPrograms) {
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

    // 6–7c. Independent logs are part of the same parallel pull.
    const { data: dbSessions, error: sessionsError } = sessionsResult;
    const { data: dbBodyWeightLogs, error: bodyWeightError } = bodyWeightResult;
    const { data: dbCardioLogs, error: cardioError } = cardioResult;
    const { data: dbMeasurements, error: measurementsError } = measurementsResult;
    const { data: dbHabits, error: habitsError } = habitsResult;
    if (sessionsError) throw new Error(`Workout history pull failed: ${sessionsError.message}`);

    if (dbSessions) {
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
    if (bodyWeightError) {
      // Weight tracking is optional. Schema drift (for example, an older
      // table without the `date` column) must not block the account's
      // programs, history, or profile from becoming available.
      console.warn(`[Optional body weight pull skipped]: ${bodyWeightError.message}`);
    }

    if (!bodyWeightError && dbBodyWeightLogs) {
      nextData.bodyWeightLogs = dbBodyWeightLogs.map((row) => ({
        id: row.id,
        date: row.date,
        weight: Number(row.weight_kg),
      }));
    }

    // 7b. Cardio Logs
    if (cardioError) console.warn(`[Optional cardio pull skipped]: ${cardioError.message}`);
    // A successful empty response is authoritative: it represents a cloud
    // deletion. Preserve local entries only when the optional table failed.
    if (!cardioError && dbCardioLogs) {
      nextData.cardioLogs = dbCardioLogs.map((row): CardioLog => ({
        id: row.id,
        date: row.date,
        type: row.type,
        durationMin: Number(row.duration_min),
        intensity: row.intensity || undefined,
        calories: Number(row.calories ?? 0),
      }));
    }

    // 7c. The body-measurement schema uses `date` (not `recorded_at`).
    if (measurementsError && !isMissingTableInSchemaCache(measurementsError, "body_measurements")) {
      throw new Error(`Body measurements pull failed: ${measurementsError.message}`);
    }
    if (!measurementsError && dbMeasurements) {
      nextData.bodyMeasurements = dbMeasurements.map((row): BodyMeasurement => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        ...(row.chest_cm == null ? {} : { chestCm: Number(row.chest_cm) }),
        ...(row.waist_cm == null ? {} : { waistCm: Number(row.waist_cm) }),
        ...(row.hips_cm == null ? {} : { hipsCm: Number(row.hips_cm) }),
        ...(row.biceps_cm == null ? {} : { bicepsCm: Number(row.biceps_cm) }),
        ...(row.thighs_cm == null ? {} : { thighsCm: Number(row.thighs_cm) }),
        ...(row.calves_cm == null ? {} : { calvesCm: Number(row.calves_cm) }),
        ...(row.neck_cm == null ? {} : { neckCm: Number(row.neck_cm) }),
        ...(row.body_fat_pct == null ? {} : { bodyFatPct: Number(row.body_fat_pct) }),
        ...(row.muscle_mass_kg == null ? {} : { muscleMassKg: Number(row.muscle_mass_kg) }),
        ...(row.notes ? { notes: row.notes } : {}),
      }));
    }

    // 7d. The client-habits schema also uses `date`.
    if (habitsError && !isMissingTableInSchemaCache(habitsError, "client_habits")) {
      throw new Error(`Client habits pull failed: ${habitsError.message}`);
    }
    if (!habitsError && dbHabits) {
      nextData.habits = dbHabits.map((row): ClientHabits => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        steps: Number(row.steps ?? 0),
        stepsTarget: Number(row.steps_target ?? 8000),
        weighInDone: Boolean(row.weigh_in_done),
        workoutDone: Boolean(row.workout_done),
        busyDayMode: Boolean(row.busy_day_mode),
      }));
    }

    // 8. Custom Foods
    const { data: dbCustomFoods, error: customFoodsError } = customFoodsResult;
    if (customFoodsError) throw new Error(`Custom foods pull failed: ${customFoodsError.message}`);

    if (dbCustomFoods) {
      const foodMap = new Map(
        nextData.foods.filter((food) => isBuiltInFood(food)).map((f) => [f.id, f]),
      );
      for (const row of dbCustomFoods) {
        const foodItem: FoodItem = {
          id: row.id,
          ownerId: row.user_id || undefined,
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

    // 8b. Public supermarket catalog. This is additive and optional: no
    // catalog response can remove seed, imported, or personal food records.
    const { data: dbPublicFoods, error: publicFoodsError } = publicFoodsResult;
    if (publicFoodsError) {
      console.warn(`[Optional public food catalog skipped]: ${publicFoodsError.message}`);
    } else if (dbPublicFoods) {
      const foodMap = new Map(nextData.foods.map((food) => [food.id, food]));
      for (const row of dbPublicFoods) {
        const publicFood = foodItemFromPublicCatalogRow(row as Record<string, unknown>);
        if (publicFood) foodMap.set(publicFood.id, publicFood);
      }
      nextData.foods = Array.from(foodMap.values());
    }

    // 9. Nutrition Days
    const { data: dbNutritionDays, error: nutritionDaysError } = nutritionDaysResult;
    if (nutritionDaysError) throw new Error(`Nutrition pull failed: ${nutritionDaysError.message}`);

    if (dbNutritionDays) {
      const daysList: NutritionDay[] = dbNutritionDays.map((row) => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        meals: row.meals || [],
        plannedMeals: [],
        ...(row.water_ml === null ? {} : { waterMl: Number(row.water_ml ?? 0) }),
        ...(row.water_target_ml === null
          ? {}
          : { waterTargetMl: Number(row.water_target_ml ?? 2500) }),
      }));
      nextData.nutritionDays = daysList;
    }

    // 9b. Personal saved recipes use the existing role-scoped recipes table.
    const { data: dbRecipes, error: recipesError } = recipesResult;
    if (recipesError && !isMissingTableInSchemaCache(recipesError, "coach_recipes")) {
      throw new Error(`Recipe library pull failed: ${recipesError.message}`);
    }
    if (!recipesError && dbRecipes) {
      nextData.recipes = dbRecipes.map((row): SavedRecipe => ({
        id: row.id,
        name: row.name,
        foods: row.foods || [],
      }));
    }

    // 10. Food Favorites
    const { data: dbFavs, error: favoritesError } = favoritesResult;
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
    const [
      profileResult,
      programsResult,
      programDaysResult,
      nutritionResult,
      measurementsResult,
      sessionsResult,
      cardioResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", clientId).maybeSingle(),
      supabase.from("programs").select("*").eq("user_id", clientId),
      supabase.from("program_days").select("*").eq("user_id", clientId),
      supabase
        .from("nutrition_days")
        .select("*")
        .eq("user_id", clientId)
        .order("date", { ascending: false }),
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", clientId)
        .order("date", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", clientId)
        .order("date", { ascending: false }),
      supabase.from("cardio_logs").select("*").eq("user_id", clientId),
    ]);

    const { data: profile, error: profileError } = profileResult;
    if (profileError) throw new Error(`Client profile pull failed: ${profileError.message}`);
    if (!profile || profile.role !== "client") {
      throw new Error("Client data pull failed: the client is no longer available to this coach");
    }
    const { data: dbPrograms, error: programsError } = programsResult;
    if (programsError) throw new Error(`Client programs pull failed: ${programsError.message}`);
    const { data: dbProgramDays, error: programDaysError } = programDaysResult;
    if (programDaysError) {
      throw new Error(`Client program days pull failed: ${programDaysError.message}`);
    }
    const { data: dbNutritionDays, error: nutritionError } = nutritionResult;
    if (nutritionError) {
      console.warn(`[Optional client nutrition pull skipped]: ${nutritionError.message}`);
    }
    const { data: dbMeasurements, error: measurementsError } = measurementsResult;
    if (measurementsError) {
      console.warn(`[Optional client measurements pull skipped]: ${measurementsError.message}`);
    }
    const { data: dbSessions, error: sessionsError } = sessionsResult;
    if (sessionsError) {
      throw new Error(`Client workout history pull failed: ${sessionsError.message}`);
    }
    const { data: dbCardioLogs, error: cardioError } = cardioResult;
    if (cardioError) {
      console.warn(`[Optional client cardio pull skipped]: ${cardioError.message}`);
    }

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
      date:
        typeof (row.date ?? row.recorded_at) === "string"
          ? (row.date ?? row.recorded_at).slice(0, 10)
          : (row.date ?? row.recorded_at),
      meals: row.meals || [],
      plannedMeals: [],
      ...(row.water_ml === null ? {} : { waterMl: Number(row.water_ml ?? 0) }),
      ...(row.water_target_ml === null
        ? {}
        : { waterTargetMl: Number(row.water_target_ml ?? 2500) }),
    }));
    const latestNutritionTarget = (dbNutritionDays || []).find(
      (row) => row.target_calories !== null && row.target_calories !== undefined,
    )?.target_calories;
    const measurementList: BodyMeasurement[] = (dbMeasurements || []).map((row) => ({
      id: row.id,
      date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
      ...(row.chest_cm === null ? {} : { chestCm: Number(row.chest_cm) }),
      ...(row.waist_cm === null ? {} : { waistCm: Number(row.waist_cm) }),
      ...(row.hips_cm === null ? {} : { hipsCm: Number(row.hips_cm) }),
      ...(row.biceps_cm === null ? {} : { bicepsCm: Number(row.biceps_cm) }),
      ...(row.thighs_cm === null ? {} : { thighsCm: Number(row.thighs_cm) }),
      ...(row.calves_cm === null ? {} : { calvesCm: Number(row.calves_cm) }),
      ...(row.neck_cm === null ? {} : { neckCm: Number(row.neck_cm) }),
      ...(row.body_fat_pct === null ? {} : { bodyFatPct: Number(row.body_fat_pct) }),
      ...(row.muscle_mass_kg === null ? {} : { muscleMassKg: Number(row.muscle_mass_kg) }),
      ...(row.notes ? { notes: row.notes } : {}),
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
      difficultyRating: row.difficulty_rating || undefined,
      discomfortNotes: row.discomfort_notes || undefined,
    }));
    const cardioList: CardioLog[] = (dbCardioLogs || []).map((row) => ({
      id: row.id,
      date: row.date,
      type: row.type,
      durationMin: Number(row.duration_min),
      intensity: row.intensity || undefined,
      calories: Number(row.calories ?? 0),
    }));

    return {
      programs: programsList,
      workouts: Array.from(workoutsMap.values()),
      nutritionDays: nutritionList,
      plannedMeals: profile.planned_menu || [],
      nutritionTargets:
        latestNutritionTarget === undefined ? {} : { calories: Number(latestNutritionTarget) },
      history: historyList,
      cardioLogs: cardioList,
      bodyMeasurements: measurementList,
      ...(profile
        ? {
            weight: Number(profile.weight_kg || 65),
            height: Number(profile.height_cm || 165),
            role: profile.role as UserRole,
            todayRoutineEnabled: profile.today_routine_enabled ?? true,
            showCalories: profile.show_calories ?? true,
            ...(profile.email ? { email: profile.email } : {}),
            ...(profile.full_name ? { name: profile.full_name } : {}),
            ...(profile.gender === "male" || profile.gender === "female"
              ? { gender: profile.gender }
              : {}),
            ...(profile.coach_id ? { coachId: profile.coach_id } : {}),
          }
        : {}),
    };
  } catch (err: unknown) {
    const error = err instanceof Error && err.message ? err.message : "Client data pull failed";
    console.error("[Pull Client Data Error]:", error);
    return {
      programs: [],
      workouts: [],
      nutritionDays: [],
      plannedMeals: [],
      nutritionTargets: {},
      history: [],
      cardioLogs: [],
      bodyMeasurements: [],
      error,
    };
  }
}
