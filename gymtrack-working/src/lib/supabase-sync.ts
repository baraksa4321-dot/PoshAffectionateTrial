import { supabase } from "./supabase";
import {
  type ClientLink,
  type CardioLog,
  type Challenge,
  type ChallengeEnrollment,
  type CoachMessage,
  type Exercise,
  type FoodItem,
  type GymData,
  type HistoryEntry,
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
  type VideoFeedback,
} from "./gym-types";
import { BUILT_IN_CHALLENGES, cloneChallenge } from "./challenge-library";
import { isSafeHttpUrl } from "./url-security";
import { calculateAge, isValidDateOfBirth } from "./age";
import { videoFeedbackFromRow } from "./video-feedback";

export type SyncStatus = "idle" | "syncing" | "synced" | "pending" | "conflict" | "error" | "offline";
export type PullResult =
  { success: true; data: GymData } | { success: false; data: GymData; error: string };

function localDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type CoachClientData = {
  exercises: Exercise[];
  programs: Program[];
  workouts: Workout[];
  nutritionDays: NutritionDay[];
  plannedMeals: Meal[];
  nutritionTargets: NutritionTargets;
  history: HistorySession[];
  cardioLogs: CardioLog[];
  bodyWeightLogs: GymData["bodyWeightLogs"];
  bodyMeasurements: BodyMeasurement[];
  habits: ClientHabits[];
  coachMessages: CoachMessage[];
  videoFeedbacks?: VideoFeedback[];
  profile?: UserProfile;
  error?: string;
};

export type RealtimeCleanup = () => void;
export type RealtimeConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

function workoutFromHistorySession(session: HistorySession): Workout | undefined {
  if (!session.workoutId || !session.workoutName) return undefined;
  const items = (session.entries ?? []).map((entry: HistoryEntry, index) => {
    const firstSet = entry.sets[0];
    const reps = entry.targetReps ?? firstSet?.targetReps ?? firstSet?.reps ?? 1;
    const sets = Math.max(1, entry.targetSets ?? entry.sets.length);
    return {
      id: `history-${session.workoutId}-${entry.exerciseId || index}`,
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      ...(entry.equipment ? { equipment: entry.equipment } : {}),
      sets,
      reps,
      targetReps: reps,
      repType: entry.repType ?? "fixed",
      weight: firstSet?.weight ?? 0,
      rest: 0,
      notes: entry.notes ?? "",
      workingSets: entry.sets.map((set, setIndex) => ({
        id: `history-${session.id}-${index}-${setIndex}`,
        setNumber: setIndex + 1,
        weight: set.weight,
        reps: set.targetReps ?? set.reps,
      })),
    };
  });
  return {
    id: session.workoutId,
    name: session.workoutName,
    notes: session.notes ?? "",
    items,
  };
}

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
    ...(isSafeHttpUrl(row["catalog_source_url"])
      ? { sourceUrl: row["catalog_source_url"].trim() }
      : {}),
    productType,
    market: "IL",
    ...(row["catalog_package_size"] ? { packageSize: String(row["catalog_package_size"]) } : {}),
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
  const handleResume = () => {
    if (stopped || typeof document === "undefined" || document.visibilityState === "hidden") {
      return;
    }
    if (!channel && !reconnectTimer) {
      scheduleReconnect();
      return;
    }
    // A channel can remain technically open after the browser suspended it.
    // Ask the consumer for one silent RLS pull even when no postgres event was
    // delivered while the page was hidden.
    onChange("__resume__");
  };
  const handleOnline = () => {
    if (stopped) return;
    notifyConnectionStatus("reconnecting");
    if (!channel && !reconnectTimer) scheduleReconnect();
    else onChange("__resume__");
  };

  if (typeof window !== "undefined") {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleResume);
    window.addEventListener("pageshow", handleResume);
  }
  subscribe();
  return () => {
    stopped = true;
    if (typeof window !== "undefined") {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleResume);
      window.removeEventListener("pageshow", handleResume);
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
      { table: "video_feedback", filter: `client_id=eq.${clientId}` },
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
      { table: "workout_sessions" },
      { table: "video_feedback" },
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

function isMissingColumnInSchema(
  error: unknown,
  tableName: string,
  columnName?: string,
): boolean {
  const candidate = error as { code?: unknown; message?: unknown } | null;
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const message = error instanceof Error ? error.message : String(candidate?.message ?? error);
  const mentionsMissingColumn =
    code === "PGRST204" ||
    code === "42703" ||
    /column .* does not exist/i.test(message) ||
    /could not find the .* column/i.test(message);
  return (
    mentionsMissingColumn &&
    message.includes(tableName) &&
    (!columnName || message.includes(columnName))
  );
}

function isOptionalBodyWeightSchemaError(error: unknown): boolean {
  return (
    isMissingTableInSchemaCache(error, "body_weight_logs") ||
    isMissingColumnInSchema(error, "body_weight_logs")
  );
}

function isSchemaCompatibilityError(error: unknown, tableName: string): boolean {
  return (
    isMissingTableInSchemaCache(error, tableName) ||
    isMissingColumnInSchema(error, tableName)
  );
}

const legacyProgramDaysSelect =
  "id, program_id, user_id, name, items, sort_order, updated_at";

export async function insertProgramDayForCoach(
  payload: Record<string, unknown>,
): Promise<{ error: unknown; usedLegacySchema: boolean }> {
  const result = await supabase.from("program_days").insert(payload);

  if (!result.error || !isMissingColumnInSchema(result.error, "program_days", "weekday")) {
    return { error: result.error, usedLegacySchema: false };
  }

  const { weekday: _weekday, ...legacyPayload } = payload;
  // The weekday migration is additive. Older linked projects can still create
  // the day, but the selected weekday must stay in the coach's local state
  // until the connected project has the new column.
  console.warn("[Program days insert] weekday column is missing; using legacy columns");
  const legacyResult = await supabase.from("program_days").insert(legacyPayload);
  return { error: legacyResult.error, usedLegacySchema: true };
}

export async function updateProgramDayWeekday(
  dayId: string,
  userId: string,
  weekday: number,
): Promise<{ error: unknown; usedLegacySchema: boolean }> {
  const result = await supabase
    .from("program_days")
    .update({ weekday, updated_at: new Date().toISOString() })
    .eq("id", dayId)
    .eq("user_id", userId);

  if (!result.error || !isMissingColumnInSchema(result.error, "program_days", "weekday")) {
    return { error: result.error, usedLegacySchema: false };
  }

  // The weekday migration is additive. If the connected project's schema cache
  // is still on the legacy shape, save the timestamp and keep the selected
  // weekday in the coach workspace instead of failing the editor.
  console.warn("[Program days update] weekday column is missing; using legacy columns");
  const legacyResult = await supabase
    .from("program_days")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", dayId)
    .eq("user_id", userId);
  return { error: legacyResult.error, usedLegacySchema: true };
}

export function appendProgramDayToLocalCoachData<
  T extends Pick<CoachClientData, "programs" | "workouts">,
>(data: T, programId: string, workout: Workout): T {
  return {
    ...data,
    workouts: [...data.workouts.filter((item) => item.id !== workout.id), workout],
    programs: data.programs.map((program) =>
      program.id === programId
        ? {
            ...program,
            dayIds: program.dayIds.includes(workout.id)
              ? program.dayIds
              : [...program.dayIds, workout.id],
          }
        : program,
    ),
  };
}

async function selectProgramDaysForUser(userId: string) {
  const result = await supabase.from("program_days").select("*").eq("user_id", userId);
  if (!result.error || !isMissingColumnInSchema(result.error, "program_days", "weekday")) {
    return result;
  }

  // Migration 50 is additive, but older connected Supabase projects can
  // briefly expose the old schema cache. Keep the plan usable while the
  // project catches up instead of failing the entire coach workspace.
  console.warn("[Program days pull] weekday column is missing; using legacy columns");
  return supabase
    .from("program_days")
    .select(legacyProgramDaysSelect)
    .eq("user_id", userId);
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

function bodyWeightCloudId(localId: string): string {
  return cardioCloudId(`body-weight-${localId}`);
}

function dateOnly(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function mapCardioRow(row: Record<string, unknown>): CardioLog {
  const intensityValue = row["intensity"];
  const intensity =
    intensityValue === "low" || intensityValue === "moderate" || intensityValue === "high"
      ? intensityValue
      : undefined;
  return {
    id: String(row["id"] ?? ""),
    date: dateOnly(row["date"] ?? row["recorded_at"]),
    type: String(row["type"] ?? row["activity_type"] ?? ""),
    durationMin: Number(row["duration_min"] ?? row["duration_minutes"] ?? 0),
    ...(intensity === undefined ? {} : { intensity }),
    calories: Number(row["calories"] ?? row["estimated_calories"] ?? 0),
  };
}

function mapBodyWeightRow(row: Record<string, unknown>) {
  return {
    id: String(row["id"] ?? ""),
    date: dateOnly(row["date"] ?? row["recorded_at"]),
    weight: Number(row["weight_kg"] ?? 0),
  };
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

async function deleteRowsExplicitlyDeleted(
  userId: string,
  table: string,
  deletedIds: string[],
  label: string,
  idColumn = "id",
  ownerColumn = "user_id",
) {
  const ids = Array.from(new Set(deletedIds.filter(Boolean)));
  if (ids.length === 0) return;

  await requireSuccessfulWrite(
    supabase.from(table).delete().eq(ownerColumn, userId).in(idColumn, ids),
    `${label} deletion`,
  );
}

function servingGramsFromLabel(servingSize: string) {
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)(?=\s|$|[),.])/i);
  const value = match?.[1] ? Number(match[1].replace(",", ".")) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

const WORKOUT_VIDEO_BUCKET = "workout-videos";
const EXERCISE_IMAGE_BUCKET = "exercise-images";
const MAX_WORKOUT_VIDEO_BYTES = 1024 * 1024 * 1024;

const WORKOUT_VIDEO_SIGNED_URL_TTL_SECONDS = 10 * 60;
function safeVideoExtension(fileName: string, contentType: string) {
  const fromName = fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 8) return fromName;
  const extensionByType: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-m4v": "m4v",
    "video/ogg": "ogv",
  };
  return extensionByType[contentType.toLowerCase()] ?? "mp4";
}

function safeImageExtension(fileName: string, contentType: string) {
  const fromName = fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) return fromName;
  const fromType = contentType
    .split("/")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return fromType && ["jpeg", "png", "webp", "gif"].includes(fromType) ? fromType : "jpg";
}

export async function uploadExerciseLibraryImage(
  file: File,
  metadata: { kind: "exercise" | "equipment" | "grip" },
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("אפשר להעלות קובץ תמונה בלבד.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("התמונה גדולה מדי. הגודל המרבי הוא 8MB.");
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("לא ניתן להעלות תמונה בלי חשבון מחובר.");
  }

  const objectId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const extension = safeImageExtension(file.name, file.type);
  const path = `${user.id}/exercise-library/${metadata.kind}/${objectId}.${extension}`;
  const { error } = await supabase.storage.from(EXERCISE_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`העלאת התמונה נכשלה: ${error.message}`);

  const { data } = supabase.storage.from(EXERCISE_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("העלאת התמונה הסתיימה בלי כתובת צפייה.");
  return data.publicUrl;
}

type UploadedWorkoutVideo = {
  path: string;
  signedUrl: string;
  playbackPath?: string;
  transcodeStatus: "not-needed" | "processing" | "ready" | "failed";
  transcodeError?: string;
};

type WorkoutVideoTranscodeResponse = {
  status: "not-needed" | "ready" | "failed";
  sourcePath: string;
  playbackPath?: string;
  error?: string;
};

async function requestWorkoutVideoTranscode(
  sourcePath: string,
  signal?: AbortSignal,
): Promise<WorkoutVideoTranscodeResponse> {
  const {
    data: { session },
  } = await awaitWorkoutVideoRequest(supabase.auth.getSession(), signal);
  if (!session?.access_token) throw new Error("לא ניתן להכין גרסת צפייה בלי חשבון מחובר.");

  const response = await fetch("/transcode-workout-video", {
    method: "POST",
    headers: {
      authorization: `Bearer ${session.access_token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ sourcePath }),
    ...(signal ? { signal } : {}),
  });
  let payload: WorkoutVideoTranscodeResponse | { error?: string } = {};
  try {
    payload = (await response.json()) as WorkoutVideoTranscodeResponse | { error?: string };
  } catch {
    // Keep the HTTP status as the useful failure detail.
  }
  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string" && payload.error.trim()
        ? payload.error
        : `שירות ההמרה החזיר שגיאה (${response.status}).`,
    );
  }
  if (!("status" in payload) || !payload.sourcePath) {
    throw new Error("שירות ההמרה החזיר תשובה לא תקינה.");
  }
  return payload;
}

const WORKOUT_VIDEO_UPLOAD_ATTEMPTS = 5;

function isRetryableWorkoutVideoError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /load failed|failed to fetch|networkerror|network request failed|timeout|timed out|502|503|504/i.test(
    message,
  );
}

function waitBeforeWorkoutVideoRetry(attempt: number): Promise<void> {
  return new Promise((resolve) => {
    const delayMs = Math.min(8_000, 1_000 * 2 ** (attempt - 1));
    setTimeout(resolve, delayMs);
  });
}

function awaitWorkoutVideoRequest<T>(
  request: Promise<T>,
  signal: AbortSignal | undefined,
): Promise<T> {
  if (!signal) return request;
  if (signal.aborted) return Promise.reject(new Error("video upload timed out"));

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      reject(new Error("video upload timed out"));
    };
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    signal.addEventListener("abort", onAbort, { once: true });
    request.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

function waitBeforeWorkoutVideoRetryWithAbort(
  attempt: number,
  signal: AbortSignal | undefined,
): Promise<void> {
  const delayMs = Math.min(8_000, 1_000 * 2 ** (attempt - 1));
  if (!signal) return waitBeforeWorkoutVideoRetry(attempt);
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      reject(new Error("video upload timed out"));
    };
    if (signal.aborted) {
      clearTimeout(timeoutId);
      reject(new Error("video upload timed out"));
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function uploadWorkoutPerformanceVideoAttempt(
  file: File,
  path: string,
  normalizedType: string,
  signal?: AbortSignal,
): Promise<void> {
  if (!signal) {
    const { error } = await supabase.storage.from(WORKOUT_VIDEO_BUCKET).upload(path, file, {
      contentType: normalizedType || "video/mp4",
      upsert: false,
    });
    if (error) throw new Error(`העלאת סרטון נכשלה: ${error.message}`);
    return;
  }

  // storage-js does not currently expose an AbortSignal on upload(). Use a
  // signed upload URL for the browser path so a stalled request can actually
  // be cancelled before the serial queue advances to the next video.
  const { data: signedUpload, error: signedUploadError } = await awaitWorkoutVideoRequest(
    supabase.storage.from(WORKOUT_VIDEO_BUCKET).createSignedUploadUrl(path, { upsert: false }),
    signal,
  );
  if (signedUploadError || !signedUpload?.signedUrl) {
    throw new Error(
      `יצירת כתובת העלאה לסרטון נכשלה: ${signedUploadError?.message ?? "missing signed upload URL"}`,
    );
  }

  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const response = await fetch(signedUpload.signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
    signal,
  });
  if (response.ok) return;

  let detail = `HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as { message?: unknown; error?: unknown };
    const message = payload.message ?? payload.error;
    if (typeof message === "string" && message.trim()) detail = message;
  } catch {
    // Keep the HTTP status when the storage endpoint does not return JSON.
  }
  throw new Error(`העלאת סרטון נכשלה: ${detail}`);
}

/**
 * Upload a trainee performance video before it is written into a workout
 * session. The database receives only the object path; the signed URL is
 * short-lived and is used only for the current browser preview.
 */
export async function uploadWorkoutPerformanceVideo(
  file: File,
  metadata: { workoutId: string; exerciseId: string },
  options: { signal?: AbortSignal } = {},
): Promise<UploadedWorkoutVideo> {
  const normalizedType = file.type.trim().toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const knownVideoExtension = ["mp4", "mov", "m4v", "webm", "ogv", "ogg"].includes(extension);
  if (!normalizedType.startsWith("video/") && !knownVideoExtension) {
    throw new Error("אפשר להעלות קובץ וידאו בלבד.");
  }
  if (file.size > MAX_WORKOUT_VIDEO_BYTES) {
    throw new Error("הסרטון גדול מדי. הגודל המרבי הוא 1GB.");
  }
  const {
    data: { user },
    error: userError,
  } = await awaitWorkoutVideoRequest(supabase.auth.getUser(), options.signal);
  if (userError || !user) {
    throw new Error("לא ניתן להעלות סרטון בלי חשבון מחובר");
  }

  const safeExtension = safeVideoExtension(file.name, normalizedType);
  let lastError: unknown = new Error("העלאת סרטון נכשלה.");
  for (let attempt = 1; attempt <= WORKOUT_VIDEO_UPLOAD_ATTEMPTS; attempt += 1) {
    if (options.signal?.aborted) {
      throw new Error("video upload timed out");
    }
    const objectId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${user.id}/${metadata.workoutId}/${metadata.exerciseId}/${objectId}.${safeExtension}`;
    try {
      await uploadWorkoutPerformanceVideoAttempt(file, path, normalizedType, options.signal);
      if (options.signal?.aborted) throw new Error("video upload timed out");

      const signedSourceUrl = await awaitWorkoutVideoRequest(
        signWorkoutPerformanceVideo(path),
        options.signal,
      );
      let transcode: WorkoutVideoTranscodeResponse;
      try {
        // The server probes every uploaded source and only re-encodes an
        // unsupported container/codec. This also catches MP4 files whose
        // MIME type hides an iPhone HEVC stream.
        transcode = await requestWorkoutVideoTranscode(path, options.signal);
      } catch (transcodeError) {
        // Keep the original upload usable and visible when the optional
        // conversion service is temporarily unavailable.
        return {
          path,
          signedUrl: signedSourceUrl,
          transcodeStatus: "failed" as const,
          ...(transcodeError instanceof Error
            ? { transcodeError: transcodeError.message }
            : { transcodeError: "שירות ההמרה אינו זמין כרגע." }),
        };
      }

      if (transcode.status === "failed" || !transcode.playbackPath) {
        return {
          path,
          signedUrl: signedSourceUrl,
          transcodeStatus: "failed" as const,
          ...(transcode.error ? { transcodeError: transcode.error } : {}),
        };
      }

      const playbackPath = transcode.playbackPath;
      const signedPlaybackUrl =
        playbackPath === path
          ? signedSourceUrl
          : await awaitWorkoutVideoRequest(
              signWorkoutPerformanceVideo(playbackPath),
              options.signal,
            );
      return {
        path,
        signedUrl: signedPlaybackUrl,
        playbackPath,
        transcodeStatus: transcode.status,
      };
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted) {
        throw new Error("video upload timed out");
      }
      if (!isRetryableWorkoutVideoError(error) || attempt === WORKOUT_VIDEO_UPLOAD_ATTEMPTS) {
        throw error;
      }
      await waitBeforeWorkoutVideoRetryWithAbort(attempt, options.signal);
    }
  }
  throw lastError;
}

/**
 * Create a fresh short-lived URL for an already-uploaded performance video.
 * Signed URLs can expire while a trainee stays on the workout or history
 * screen, so playback can refresh the URL without uploading the file again.
 */
export async function signWorkoutPerformanceVideo(path: string): Promise<string> {
  const normalizedPath = path.trim();
  if (!normalizedPath || normalizedPath.startsWith("blob:")) {
    throw new Error("לא ניתן ליצור כתובת צפייה לסרטון חסר.");
  }
  const { data, error } = await supabase.storage
    .from(WORKOUT_VIDEO_BUCKET)
    .createSignedUrl(normalizedPath, WORKOUT_VIDEO_SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    throw new Error(
      `יצירת כתובת הצפייה לסרטון נכשלה: ${error?.message ?? "missing signed URL"}`,
    );
  }
  return data.signedUrl;
}

export async function approveChallengeInSupabase(challengeId: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("לא ניתן לאשר אתגר בלי חשבון מחובר.");

  const { error } = await supabase
    .from("challenges")
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq("id", challengeId);
  if (error) throw new Error(`אישור האתגר נכשל: ${error.message}`);
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
            age_years: p.dateOfBirth ? calculateAge(p.dateOfBirth) : p.age,
            ...(p.dateOfBirth ? { date_of_birth: p.dateOfBirth } : {}),
            workouts_per_week: p.workoutsPerWeek,
            gender: p.gender,
            // Role and coach assignment are server-owned. Normal profile
            // sync must never replay stale cached assignment state.
            today_routine_enabled: p.todayRoutineEnabled ?? true,
             ...(p.loadingAnimationsEnabled === undefined
               ? {}
               : { loading_animations_enabled: p.loadingAnimationsEnabled }),
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
          english_name: e.nameEn || null,
          muscle_group: e.muscleGroup,
          muscle_groups: e.muscleGroups ?? null,
          custom_muscle_group: e.customMuscleGroup ?? null,
          secondary_muscles: e.secondaryMuscles ?? null,
          approved_substitutes: e.approvedSubstitutes ?? null,
          equipment: e.equipment,
          equipment_options: e.equipmentOptions ?? null,
          equipment_images: e.equipmentImages ?? {},
          cable_grip_options: e.cableGripOptions ?? null,
          cable_grip_images: e.cableGripImages ?? {},
          category: e.category,
          description: e.description,
          instructions: e.instructions,
          video_url: e.videoUrl || null,
          video_urls: e.videoUrls ?? null,
          video_male_url: e.videoMaleUrl || null,
          video_female_url: e.videoFemaleUrl || null,
          images: e.images ?? [],
          notes: e.notes ?? "",
          tips: e.tips ?? null,
          updated_at: new Date().toISOString(),
        }));
        const richWrite = await supabase
          .from("custom_exercises")
          .upsert(payload, { onConflict: "id" });
        if (richWrite.error && isMissingColumnInSchema(richWrite.error, "custom_exercises")) {
          // Older connected projects can still sync the legacy exercise shape
          // until migration 49 is applied; do not block the rest of the sync.
          const legacyPayload = customExercises.map((e) => ({
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
            supabase.from("custom_exercises").upsert(legacyPayload, { onConflict: "id" }),
            "Custom exercises sync (legacy schema)",
          );
        } else {
          await requireSuccessfulWrite(Promise.resolve(richWrite), "Custom exercises sync");
        }
      }
      await deleteRowsExplicitlyDeleted(
        userId,
        "custom_exercises",
        (localData.deletedExerciseIds ?? []).filter((id) => !id.startsWith("ex-")),
        "Custom exercises",
      );
    } catch (error) {
      if (isMissingTableInSchemaCache(error, "custom_exercises")) {
        console.warn(
          "[Optional custom exercises sync skipped]: public.custom_exercises is unavailable",
        );
      } else {
        throw error;
      }
    }

    // 3. Programs & Program Days
    // Clients can read their assigned plan, but plan definitions are managed
    // only by coaches and owners. Their local snapshot can still contain the
    // assigned programs, so never replay those rows through the generic
    // client sync or every refresh will produce an RLS failure.
    const canSyncPlans =
      localData.userProfile?.role === "coach" || localData.userProfile?.role === "owner";
    if (canSyncPlans && localData.programs.length > 0) {
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
            weekday: d.weekday ?? null,
            updated_at: new Date().toISOString(),
          }));
          const programDaysWrite = await supabase
            .from("program_days")
            .upsert(dayPayload, { onConflict: "id" });
          if (
            programDaysWrite.error &&
            isMissingColumnInSchema(programDaysWrite.error, "program_days", "weekday")
          ) {
            // Keep older linked projects usable until the additive migration is
            // applied. The weekday will be persisted on the next sync after
            // the column becomes available.
            console.warn(
              `[Program days sync] weekday column is missing; syncing without weekly scheduling`,
            );
            await requireSuccessfulWrite(
              supabase
                .from("program_days")
                .upsert(
                  dayPayload.map(({ weekday: _weekday, ...legacyDay }) => legacyDay),
                  { onConflict: "id" },
                ),
              "Program days sync (legacy schema)",
            );
          } else if (programDaysWrite.error) {
            throw new Error(`Program days sync: ${programDaysWrite.error.message}`);
          }
        }
      }
    }
    if (canSyncPlans) {
      await deleteRowsExplicitlyDeleted(
        userId,
        "programs",
        localData.deletedProgramIds ?? [],
        "Programs",
      );
      await deleteRowsExplicitlyDeleted(
        userId,
        "program_days",
        localData.deletedWorkoutIds ?? [],
        "Program days",
      );
    }

    // 3b. Challenge catalog. This table is additive and optional while older
    // connected projects are waiting for the challenge migration.
    try {
      const challengePayload = (localData.challenges ?? [])
        .filter((challenge) => !challenge.isBuiltIn && challenge.ownerId === userId)
        .map((challenge) => ({
          id: challenge.id,
          owner_id: userId,
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          difficulty: challenge.difficulty,
          duration_label: challenge.durationLabel,
          accent: challenge.accent,
          sessions: challenge.sessions,
          is_published: challenge.isPublished ?? true,
          updated_at: challenge.updatedAt ?? new Date().toISOString(),
        }));
      if (challengePayload.length > 0) {
        await requireSuccessfulWrite(
          supabase.from("challenges").upsert(challengePayload, { onConflict: "id" }),
          "Challenges sync",
        );
      }
      await deleteRowsExplicitlyDeleted(
        userId,
        "challenges",
        (localData.deletedChallengeIds ?? []).filter(
          (id) => !BUILT_IN_CHALLENGES.some((challenge) => challenge.id === id),
        ),
        "Challenges",
      );

      const enrollmentPayload = (localData.challengeEnrollments ?? []).map((enrollment) => ({
        id: enrollment.id,
        user_id: userId,
        challenge_id: enrollment.challengeId,
        workout_ids: enrollment.workoutIds,
        workouts: enrollment.workouts ?? [],
        started_at: enrollment.startedAt,
        active: enrollment.active,
        updated_at: new Date().toISOString(),
      }));
      if (enrollmentPayload.length > 0) {
        await requireSuccessfulWrite(
          supabase
            .from("challenge_enrollments")
            .upsert(enrollmentPayload, { onConflict: "id" }),
          "Challenge enrollments sync",
        );
      }
    } catch (error) {
      if (
        isMissingTableInSchemaCache(error, "challenges") ||
        isMissingTableInSchemaCache(error, "challenge_enrollments")
      ) {
        console.warn("[Optional challenge sync skipped]: challenge tables are unavailable");
      } else {
        throw error;
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
        entries: historyEntriesForPersistence(s.entries),
        notes: s.notes,
        difficulty_rating: s.difficultyRating,
        discomfort_notes: s.discomfortNotes,
      }));
      await requireSuccessfulWrite(
        supabase.from("workout_sessions").upsert(historyPayload, { onConflict: "id" }),
        "Workout history sync",
      );
    }
    await deleteRowsExplicitlyDeleted(
      userId,
      "workout_sessions",
      localData.deletedSessionIds ?? [],
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
    try {
      if (cardioPayload.length > 0) {
        const canonicalWrite = await supabase
          .from("cardio_logs")
          .upsert(cardioPayload, { onConflict: "id" });
        if (canonicalWrite.error) {
          if (!isMissingColumnInSchema(canonicalWrite.error, "cardio_logs")) {
            throw new Error(`Cardio logs sync: ${canonicalWrite.error.message}`);
          }
          const legacyCardioPayload = (localData.cardioLogs ?? []).map((log) => ({
            id: cardioCloudId(log.id),
            user_id: userId,
            activity_type: log.type,
            duration_minutes: log.durationMin,
            estimated_calories: log.calories,
            intensity: log.intensity ?? null,
            recorded_at: log.date,
          }));
          await requireSuccessfulWrite(
            supabase.from("cardio_logs").upsert(legacyCardioPayload, { onConflict: "id" }),
            "Cardio logs sync (legacy schema)",
          );
        }
      }
      await deleteRowsExplicitlyDeleted(
        userId,
        "cardio_logs",
        (localData.deletedCardioLogIds ?? []).map(cardioCloudId),
        "Cardio logs",
      );
    } catch (error: unknown) {
      if (isSchemaCompatibilityError(error, "cardio_logs")) {
        console.warn(
          "[Optional cardio sync skipped]: public.cardio_logs is unavailable or incompatible",
        );
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
        const canonicalWrite = await supabase
          .from("body_weight_logs")
          .upsert(weighInPayload, { onConflict: "user_id,date" });
        if (canonicalWrite.error) {
          if (!isOptionalBodyWeightSchemaError(canonicalWrite.error)) {
            throw new Error(`Body weight log sync: ${canonicalWrite.error.message}`);
          }
          const legacyWeightPayload = (localData.bodyWeightLogs ?? []).map((log) => ({
            id: bodyWeightCloudId(log.id),
            user_id: userId,
            weight_kg: log.weight,
            recorded_at: log.date,
          }));
          await requireSuccessfulWrite(
            supabase.from("body_weight_logs").upsert(legacyWeightPayload, { onConflict: "id" }),
            "Body weight log sync (legacy schema)",
          );
        }
      }
      const deletedWeightDates = Array.from(new Set(localData.deletedBodyWeightLogDates ?? []));
      if (deletedWeightDates.length > 0) {
        for (const date of deletedWeightDates) {
          const canonicalDelete = await supabase
            .from("body_weight_logs")
            .delete()
            .eq("user_id", userId)
            .eq("date", date);
          if (canonicalDelete.error) {
            if (!isOptionalBodyWeightSchemaError(canonicalDelete.error)) {
              throw new Error(`Body weight log deletion: ${canonicalDelete.error.message}`);
            }
            const nextDate = new Date(`${date}T00:00:00.000Z`);
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            await requireSuccessfulWrite(
              supabase
                .from("body_weight_logs")
                .delete()
                .eq("user_id", userId)
                .gte("recorded_at", `${date}T00:00:00.000Z`)
                .lt("recorded_at", nextDate.toISOString()),
              "Body weight log deletion (legacy schema)",
            );
          }
        }
      }
    } catch (error: unknown) {
      if (isOptionalBodyWeightSchemaError(error)) {
        console.warn(
          `[Optional body weight sync skipped]: public.body_weight_logs schema is incompatible: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
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
    await deleteRowsExplicitlyDeleted(userId, "body_measurements", [], "Body measurements");

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
    await deleteRowsExplicitlyDeleted(userId, "client_habits", [], "Client habits");

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
          serving_grams: f.servingGrams ?? servingGramsFromLabel(f.servingSize),
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          fiber: f.fiber ?? 0,
          nutrition_review: f.nutritionReview ?? null,
          updated_at: new Date().toISOString(),
        }));
        const extendedWrite = await supabase
          .from("custom_foods")
          .upsert(customFoodPayload, { onConflict: "id" });
        if (extendedWrite.error && isMissingColumnInSchema(extendedWrite.error, "custom_foods")) {
          // Keep older Supabase projects usable until the additive provenance
          // migration is applied; the food values still sync safely.
          await requireSuccessfulWrite(
            supabase
              .from("custom_foods")
              .upsert(customFoodPayload.map(({ nutrition_review: _review, ...food }) => food), {
                onConflict: "id",
              }),
            "Custom foods sync",
          );
        } else if (extendedWrite.error) {
          throw new Error(`Custom foods sync: ${extendedWrite.error.message}`);
        }
      }
      await deleteRowsExplicitlyDeleted(
        userId,
        "custom_foods",
        localData.deletedFoodIds ?? [],
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
    const localToday = localDateKey();
    const nutritionPayload = localData.nutritionDays.map((nd) => ({
        id: nd.id ?? `${userId}_${nd.date}`,
        user_id: userId,
        date: nd.date,
        meals: nd.meals,
        planned_meals: nd.plannedMeals ?? [],
        updated_at: new Date().toISOString(),
        ...(nd.waterMl === undefined ? {} : { water_ml: nd.waterMl }),
        ...(nd.waterTargetMl === undefined ? {} : { water_target_ml: nd.waterTargetMl }),
        ...(nd.targetCalories === undefined
          ? nd.date === localToday && localData.nutritionTargets.calories !== undefined
            ? { target_calories: localData.nutritionTargets.calories }
            : {}
          : { target_calories: nd.targetCalories }),
        ...(nd.targetProtein === undefined
          ? nd.date === localToday && localData.nutritionTargets.protein !== undefined
            ? { target_protein: localData.nutritionTargets.protein }
            : {}
          : { target_protein: nd.targetProtein }),
        ...(nd.targetCarbs === undefined
          ? nd.date === localToday && localData.nutritionTargets.carbs !== undefined
            ? { target_carbs: localData.nutritionTargets.carbs }
            : {}
          : { target_carbs: nd.targetCarbs }),
        ...(nd.targetFat === undefined
          ? nd.date === localToday && localData.nutritionTargets.fat !== undefined
            ? { target_fat: localData.nutritionTargets.fat }
            : {}
          : { target_fat: nd.targetFat }),
        ...(nd.targetFiber === undefined
          ? nd.date === localToday && localData.nutritionTargets.fiber !== undefined
            ? { target_fiber: localData.nutritionTargets.fiber }
            : {}
          : { target_fiber: nd.targetFiber }),
      }));
    if (
      !localData.nutritionDays.some((day) => day.date === localToday) &&
      Object.values(localData.nutritionTargets).some((value) => value !== undefined)
    ) {
      nutritionPayload.push({
        id: `${userId}_${localToday}`,
        user_id: userId,
        date: localToday,
        meals: [],
        planned_meals: [],
        updated_at: new Date().toISOString(),
        ...(localData.nutritionTargets.calories === undefined
          ? {}
          : { target_calories: localData.nutritionTargets.calories }),
        ...(localData.nutritionTargets.protein === undefined
          ? {}
          : { target_protein: localData.nutritionTargets.protein }),
        ...(localData.nutritionTargets.carbs === undefined
          ? {}
          : { target_carbs: localData.nutritionTargets.carbs }),
        ...(localData.nutritionTargets.fat === undefined
          ? {}
          : { target_fat: localData.nutritionTargets.fat }),
        ...(localData.nutritionTargets.fiber === undefined
          ? {}
          : { target_fiber: localData.nutritionTargets.fiber }),
      });
    }
    if (nutritionPayload.length > 0) {
      await requireSuccessfulWrite(
        supabase.from("nutrition_days").upsert(nutritionPayload, { onConflict: "id" }),
        "Nutrition log sync",
      );
    }
    await deleteRowsExplicitlyDeleted(
      userId,
      "nutrition_days",
      localData.deletedNutritionDayIds ?? [],
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
      await deleteRowsExplicitlyDeleted(
        userId,
        "coach_recipes",
        localData.deletedRecipeIds ?? [],
        "Recipe library",
        "id",
        "coach_id",
      );
    } catch (error) {
      if (isMissingTableInSchemaCache(error, "coach_recipes")) {
        console.warn("[Optional recipe library sync skipped]: public.coach_recipes is unavailable");
      } else {
        throw error;
      }
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
      const favoriteIds = new Set(localData.favoriteFoods ?? []);
      const deletedFavoriteIds = (localData.deletedFavoriteFoodIds ?? []).filter(
        (foodId) => !favoriteIds.has(foodId),
      );
      if (deletedFavoriteIds.length > 0) {
        await requireSuccessfulWrite(
          supabase
            .from("food_favorites")
            .delete()
            .eq("user_id", userId)
            .in("food_id", deletedFavoriteIds),
          "Favorites deletion",
        );
      }
    } catch (error) {
      if (isMissingTableInSchemaCache(error, "food_favorites")) {
        console.warn(
          "[Optional food favorites sync skipped]: public.food_favorites is unavailable",
        );
      } else {
        throw error;
      }
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
          ...(typeof metadata["date_of_birth"] === "string" &&
          isValidDateOfBirth(metadata["date_of_birth"])
            ? { date_of_birth: metadata["date_of_birth"] }
            : {}),
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
    const dateOfBirth =
      typeof profile.date_of_birth === "string" && isValidDateOfBirth(profile.date_of_birth)
        ? profile.date_of_birth
        : nextData.userProfile?.dateOfBirth;
    const age = dateOfBirth
      ? calculateAge(dateOfBirth)
      : profile.age_years
        ? Number(profile.age_years)
        : nextData.userProfile?.age;
    const workoutsPerWeek = profile.workouts_per_week
      ? Number(profile.workouts_per_week)
      : nextData.userProfile?.workoutsPerWeek;
    const gender =
      profile.gender === "male" || profile.gender === "female"
        ? profile.gender
        : nextData.userProfile?.gender;
    const hasLoadingAnimationsSetting = Object.prototype.hasOwnProperty.call(
      profile,
      "loading_animations_enabled",
    );
    const loadingAnimationsEnabled =
      typeof profile.loading_animations_enabled === "boolean"
        ? profile.loading_animations_enabled
        : undefined;
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
      ...(dateOfBirth === undefined ? {} : { dateOfBirth }),
      ...(workoutsPerWeek === undefined ? {} : { workoutsPerWeek }),
      ...(gender === undefined ? {} : { gender }),
      ...(hasLoadingAnimationsSetting ? { loadingAnimationsEnabled } : {}),
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
    const videoFeedbackPromise = supabase
      .from("video_feedback")
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
    const programDaysPromise = selectProgramDaysForUser(userId);
    const challengesPromise = supabase.from("challenges").select("*");
    const challengeEnrollmentsPromise = supabase
      .from("challenge_enrollments")
      .select("*")
      .eq("user_id", userId);
    const sessionsPromise = supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    const bodyWeightPromise = supabase
      .from("body_weight_logs")
      .select("*")
      .eq("user_id", userId);
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
    const publicFoodsSelect =
      "id,name,english_name,category,brand,serving_unit,serving_grams,calories,protein,carbs,fat,fiber,search_aliases,barcode,catalog_source,catalog_source_product_id,catalog_source_url,catalog_product_type,catalog_package_size,catalog_synced_at,catalog_source_updated_at,catalog_verification_status";
    const publicFoodsSelectWithoutBarcode =
      "id,name,english_name,category,brand,serving_unit,serving_grams,calories,protein,carbs,fat,fiber,search_aliases,catalog_source,catalog_source_product_id,catalog_source_url,catalog_product_type,catalog_package_size,catalog_synced_at,catalog_source_updated_at,catalog_verification_status";
    const publicFoodsPromise = supabase
      .from("foods")
      .select(publicFoodsSelect)
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
      videoFeedbackResult,
      broadcastsResult,
      clientLinksResult,
      customExercisesResult,
      programsResult,
      programDaysResult,
      challengesResult,
      challengeEnrollmentsResult,
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
      videoFeedbackPromise,
      broadcastsPromise,
      clientLinksPromise,
      customExercisesPromise,
      programsPromise,
      programDaysPromise,
      challengesPromise,
      challengeEnrollmentsPromise,
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
      nextData.coachMessages = messages
        .map((m) => ({
          id: m.id,
          coachId: m.coach_id,
          clientId: m.client_id,
          message: m.message,
          createdAt: m.created_at,
          isRead: m.is_read,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const { data: videoFeedbackRows, error: videoFeedbackError } = videoFeedbackResult;
    if (
      videoFeedbackError &&
      !isMissingTableInSchemaCache(videoFeedbackError, "video_feedback")
    ) {
      throw new Error(`Video feedback pull failed: ${videoFeedbackError.message}`);
    }
    if (videoFeedbackError) {
      nextData.videoFeedbacks = [];
    } else {
      nextData.videoFeedbacks = (videoFeedbackRows ?? [])
        .map((row) => videoFeedbackFromRow(row as Record<string, unknown>))
        .filter((feedback) => feedback.id && feedback.videoPath);
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
      const cachedCustomExercises = new Map(
        nextData.exercises
          .filter((exercise) => !exercise.id.startsWith("ex-"))
          .map((exercise) => [exercise.id, exercise]),
      );
      const customMap = new Map(
        nextData.exercises
          .filter((exercise) => exercise.id.startsWith("ex-"))
          .map((e) => [e.id, e]),
      );
      for (const row of dbCustomExercises) {
        const cachedExercise = cachedCustomExercises.get(row.id);
        const exItem: Exercise = {
          id: row.id,
          name: row.name,
          ...(row.english_name ? { nameEn: row.english_name } : {}),
          muscleGroup: row.muscle_group,
          muscleGroups:
            Array.isArray(row.muscle_groups) && row.muscle_groups.length > 0
              ? row.muscle_groups
              : [row.muscle_group],
          ...(row.custom_muscle_group ? { customMuscleGroup: row.custom_muscle_group } : {}),
          ...(Array.isArray(row.secondary_muscles)
            ? { secondaryMuscles: row.secondary_muscles }
            : {}),
          ...(Array.isArray(row.approved_substitutes)
            ? { approvedSubstitutes: row.approved_substitutes }
            : {}),
          category: row.category || "מורכב",
          equipment: row.equipment || "מוט",
          description: row.description || "",
          instructions: row.instructions || "",
          videoUrl: row.video_url || "",
          videoUrls: Array.isArray(row.video_urls) ? row.video_urls : undefined,
          videoMaleUrl: row.video_male_url || undefined,
          videoFemaleUrl: row.video_female_url || undefined,
          images: Array.isArray(row.images) ? row.images : (cachedExercise?.images ?? []),
          notes: typeof row.notes === "string" ? row.notes : (cachedExercise?.notes ?? ""),
          ...(Array.isArray(row.equipment_options)
            ? { equipmentOptions: row.equipment_options }
            : cachedExercise?.equipmentOptions
              ? { equipmentOptions: cachedExercise.equipmentOptions }
            : {}),
          ...(row.equipment_images && typeof row.equipment_images === "object"
            ? { equipmentImages: row.equipment_images as Record<string, string> }
            : cachedExercise?.equipmentImages
              ? { equipmentImages: cachedExercise.equipmentImages }
            : {}),
          ...(Array.isArray(row.cable_grip_options)
            ? { cableGripOptions: row.cable_grip_options }
            : cachedExercise?.cableGripOptions
              ? { cableGripOptions: cachedExercise.cableGripOptions }
            : {}),
          ...(row.cable_grip_images && typeof row.cable_grip_images === "object"
            ? { cableGripImages: row.cable_grip_images as Record<string, string> }
            : cachedExercise?.cableGripImages
              ? { cableGripImages: cachedExercise.cableGripImages }
            : {}),
          ...(row.tips ? { tips: row.tips } : cachedExercise?.tips ? { tips: cachedExercise.tips } : {}),
        };
        customMap.set(row.id, exItem);
      }
      const deletedExerciseIds = new Set(nextData.deletedExerciseIds ?? []);
      nextData.exercises = Array.from(customMap.values()).filter(
        (exercise) => !deletedExerciseIds.has(exercise.id),
      );
    }

    // 5. Programs & Days
    const { data: dbPrograms, error: programsError } = programsResult;
    const { data: dbProgramDays, error: programDaysError } = programDaysResult;
    if (programsError) throw new Error(`Programs pull failed: ${programsError.message}`);
    if (programDaysError) throw new Error(`Program days pull failed: ${programDaysError.message}`);

    if (dbPrograms) {
      const canManagePlans = role === "coach" || role === "owner";
      // Client plan rows are authoritative from the server. A stale tombstone
      // from an older/offline cache must not hide a plan that the client is no
      // longer permitted to delete.
      const deletedProgramIds = new Set(canManagePlans ? (nextData.deletedProgramIds ?? []) : []);
      const deletedWorkoutIds = new Set(canManagePlans ? (nextData.deletedWorkoutIds ?? []) : []);
      if (!canManagePlans) {
        nextData.deletedProgramIds = [];
        nextData.deletedWorkoutIds = [];
      }
      const workoutsMap = new Map(nextData.workouts.map((w) => [w.id, w]));
      const programsList: Program[] = [];

      for (const pRow of dbPrograms) {
        if (deletedProgramIds.has(pRow.id)) continue;
        const matchingDays = (dbProgramDays || [])
          .filter((d) => d.program_id === pRow.id && !deletedWorkoutIds.has(d.id))
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        const dayIds: string[] = [];
        for (const dRow of matchingDays) {
          dayIds.push(dRow.id);
          const workoutItem: Workout = {
            id: dRow.id,
            name: dRow.name,
            notes: "",
            items: dRow.items || [],
            weekday:
              typeof dRow.weekday === "number" && dRow.weekday >= 0 && dRow.weekday <= 6
                ? dRow.weekday
                : undefined,
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
      nextData.workouts = Array.from(workoutsMap.values()).filter(
        (workout) => !deletedWorkoutIds.has(workout.id),
      );
    }

    // Challenge templates are shared through RLS: a coach sees their own
    // templates and a trainee sees published templates.
    const { data: dbChallenges, error: challengesError } = challengesResult;
    if (challengesError && !isMissingTableInSchemaCache(challengesError, "challenges")) {
      throw new Error(`Challenges pull failed: ${challengesError.message}`);
    }
    if (!challengesError && dbChallenges) {
      const deletedChallengeIds = new Set(nextData.deletedChallengeIds ?? []);
      const builtIns = BUILT_IN_CHALLENGES.map(cloneChallenge);
      const remoteChallenges: Challenge[] = dbChallenges
        .map((row): Challenge => ({
          id: row.id,
          title: row.title,
          description: row.description || "",
          category: row.category,
          difficulty: row.difficulty,
          durationLabel: row.duration_label || "אימון אחד",
          accent: row.accent || "sage",
          sessions: row.sessions || [],
          ownerId: row.owner_id,
          isPublished: row.is_published !== false,
          updatedAt: row.updated_at,
        }))
        .filter((challenge) => !deletedChallengeIds.has(challenge.id));
      nextData.challenges = [
        ...builtIns.filter((challenge) => !deletedChallengeIds.has(challenge.id)),
        ...remoteChallenges.filter((challenge) => !challenge.isBuiltIn),
      ];
    }

    const {
      data: dbChallengeEnrollments,
      error: challengeEnrollmentsError,
    } = challengeEnrollmentsResult;
    if (
      challengeEnrollmentsError &&
      !isMissingTableInSchemaCache(challengeEnrollmentsError, "challenge_enrollments")
    ) {
      throw new Error(
        `Challenge enrollments pull failed: ${challengeEnrollmentsError.message}`,
      );
    }
    if (!challengeEnrollmentsError && dbChallengeEnrollments) {
      const localById = new Map(
        (nextData.challengeEnrollments ?? []).map((enrollment) => [enrollment.id, enrollment]),
      );
      const remoteEnrollments: ChallengeEnrollment[] = dbChallengeEnrollments.map((row) => ({
        id: row.id,
        challengeId: row.challenge_id,
        workoutIds: Array.isArray(row.workout_ids) ? row.workout_ids : [],
        workouts: Array.isArray(row.workouts) ? row.workouts : [],
        startedAt: row.started_at,
        active: row.active !== false,
      }));
      const mergedEnrollments = new Map(localById);
      for (const enrollment of remoteEnrollments) mergedEnrollments.set(enrollment.id, enrollment);
      nextData.challengeEnrollments = Array.from(mergedEnrollments.values());

      const workoutMap = new Map(nextData.workouts.map((workout) => [workout.id, workout]));
      for (const enrollment of nextData.challengeEnrollments) {
        for (const workout of enrollment.workouts ?? []) workoutMap.set(workout.id, workout);
      }
      nextData.workouts = Array.from(workoutMap.values());
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
      const deletedSessionIds = new Set(nextData.deletedSessionIds ?? []);
       nextData.history = await signWorkoutVideosInHistory(
         historyList.filter((session) => !deletedSessionIds.has(session.id)),
       );
    }

    // 7. Body Weight Logs
    if (bodyWeightError && isOptionalBodyWeightSchemaError(bodyWeightError)) {
      console.warn(`[Optional body weight pull skipped]: ${bodyWeightError.message}`);
    } else if (bodyWeightError) {
      throw new Error(`Body weight pull failed: ${bodyWeightError.message}`);
    }

    if (!bodyWeightError && dbBodyWeightLogs) {
      const deletedWeightDates = new Set(nextData.deletedBodyWeightLogDates ?? []);
      nextData.bodyWeightLogs = dbBodyWeightLogs
        .map((row) => mapBodyWeightRow(row))
        .filter((log) => !deletedWeightDates.has(log.date));
      nextData.bodyWeightLogs.sort((a, b) => b.date.localeCompare(a.date));
    }

    // 7b. Cardio Logs
    if (cardioError && isSchemaCompatibilityError(cardioError, "cardio_logs")) {
      console.warn(`[Optional cardio pull skipped]: ${cardioError.message}`);
    } else if (cardioError) {
      throw new Error(`Cardio pull failed: ${cardioError.message}`);
    }
    // A successful empty response is authoritative: it represents a cloud
    // deletion. Preserve local entries only when the optional table failed.
    if (!cardioError && dbCardioLogs) {
      const deletedCardioLogIds = new Set((nextData.deletedCardioLogIds ?? []).map(cardioCloudId));
      nextData.cardioLogs = dbCardioLogs
        .map((row) => mapCardioRow(row))
        .filter((log) => !deletedCardioLogIds.has(log.id));
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
          ...(row.serving_grams === null || row.serving_grams === undefined
            ? {}
            : { servingGrams: Number(row.serving_grams) }),
          calories: Number(row.calories),
          protein: Number(row.protein),
          carbs: Number(row.carbs),
          fat: Number(row.fat),
          fiber: Number(row.fiber || 0),
          ...(row.nutrition_review && typeof row.nutrition_review === "object"
            ? { nutritionReview: row.nutrition_review }
            : {}),
        };
        foodMap.set(row.id, foodItem);
      }
      nextData.foods = Array.from(foodMap.values());
    }

    // 8b. Public supermarket catalog. This is additive and optional: no
    // catalog response can remove seed, imported, or personal food records.
    let dbPublicFoods: Array<Record<string, unknown>> | null = publicFoodsResult.data;
    let publicFoodsError = publicFoodsResult.error;
    if (publicFoodsError && isMissingColumnInSchema(publicFoodsError, "foods", "barcode")) {
      const fallbackPublicFoodsResult = await supabase
        .from("foods")
        .select(publicFoodsSelectWithoutBarcode)
        .eq("catalog_source", "open-food-facts");
      dbPublicFoods = fallbackPublicFoodsResult.data as Array<Record<string, unknown>> | null;
      publicFoodsError = fallbackPublicFoodsResult.error;
    }
    if (
      publicFoodsError &&
      (isMissingTableInSchemaCache(publicFoodsError, "foods") ||
        isMissingColumnInSchema(publicFoodsError, "foods"))
    ) {
      console.warn(`[Optional public food catalog skipped]: ${publicFoodsError.message}`);
    } else if (publicFoodsError) {
      throw new Error(`Public food catalog pull failed: ${publicFoodsError.message}`);
    } else if (dbPublicFoods) {
      const foodMap = new Map(nextData.foods.map((food) => [food.id, food]));
      for (const row of dbPublicFoods) {
        const publicFood = foodItemFromPublicCatalogRow(row as Record<string, unknown>);
        if (publicFood) foodMap.set(publicFood.id, publicFood);
      }
      nextData.foods = Array.from(foodMap.values());
    }
    const deletedFoodIds = new Set(nextData.deletedFoodIds ?? []);
    nextData.foods = nextData.foods.filter((food) => !deletedFoodIds.has(food.id));

    // 9. Nutrition Days
    const { data: dbNutritionDays, error: nutritionDaysError } = nutritionDaysResult;
    if (nutritionDaysError) throw new Error(`Nutrition pull failed: ${nutritionDaysError.message}`);

    if (dbNutritionDays) {
      const deletedNutritionDayIds = new Set(nextData.deletedNutritionDayIds ?? []);
      const daysList: NutritionDay[] = dbNutritionDays.map((row) => ({
        id: row.id,
        date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
        meals: row.meals || [],
        plannedMeals: Array.isArray(row.planned_meals) ? row.planned_meals : [],
        ...(row.water_ml === null ? {} : { waterMl: Number(row.water_ml ?? 0) }),
        ...(row.water_target_ml === null
          ? {}
          : { waterTargetMl: Number(row.water_target_ml ?? 2500) }),
        ...(row.target_calories === null || row.target_calories === undefined
          ? {}
          : { targetCalories: Number(row.target_calories) }),
        ...(row.target_protein === null || row.target_protein === undefined
          ? {}
          : { targetProtein: Number(row.target_protein) }),
        ...(row.target_carbs === null || row.target_carbs === undefined
          ? {}
          : { targetCarbs: Number(row.target_carbs) }),
        ...(row.target_fat === null || row.target_fat === undefined
          ? {}
          : { targetFat: Number(row.target_fat) }),
        ...(row.target_fiber === null || row.target_fiber === undefined
          ? {}
          : { targetFiber: Number(row.target_fiber) }),
      }));
      nextData.nutritionDays = daysList.filter(
        (day) => !deletedNutritionDayIds.has(day.id ?? "") && !deletedNutritionDayIds.has(day.date),
      );
    }

    // 9b. Personal saved recipes use the existing role-scoped recipes table.
    const { data: dbRecipes, error: recipesError } = recipesResult;
    if (recipesError && !isMissingTableInSchemaCache(recipesError, "coach_recipes")) {
      throw new Error(`Recipe library pull failed: ${recipesError.message}`);
    }
    if (!recipesError && dbRecipes) {
      const deletedRecipeIds = new Set(nextData.deletedRecipeIds ?? []);
      nextData.recipes = dbRecipes
        .map((row): SavedRecipe => ({
          id: row.id,
          name: row.name,
          foods: row.foods || [],
        }))
        .filter((recipe) => !deletedRecipeIds.has(recipe.id));
    }

    // 10. Food Favorites
    const { data: dbFavs, error: favoritesError } = favoritesResult;
    if (favoritesError) throw new Error(`Favorites pull failed: ${favoritesError.message}`);

    if (dbFavs) {
      const deletedFavoriteFoodIds = new Set(nextData.deletedFavoriteFoodIds ?? []);
      nextData.favoriteFoods = dbFavs.map((f) => f.food_id);
      nextData.favoriteFoods = nextData.favoriteFoods.filter(
        (foodId) => !deletedFavoriteFoodIds.has(foodId),
      );
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
      customExercisesResult,
      programsResult,
      programDaysResult,
      nutritionResult,
      measurementsResult,
      bodyWeightResult,
      sessionsResult,
      cardioResult,
      habitsResult,
      coachMessagesResult,
      videoFeedbackResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", clientId).maybeSingle(),
      supabase.from("custom_exercises").select("*").eq("user_id", clientId),
      supabase.from("programs").select("*").eq("user_id", clientId),
      selectProgramDaysForUser(clientId),
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
      supabase.from("body_weight_logs").select("*").eq("user_id", clientId),
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", clientId)
        .order("date", { ascending: false }),
      supabase.from("cardio_logs").select("*").eq("user_id", clientId),
      supabase
        .from("client_habits")
        .select("*")
        .eq("user_id", clientId)
        .order("date", { ascending: false }),
      supabase
        .from("coach_messages")
        .select("id, coach_id, client_id, message, created_at, is_read")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("video_feedback")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]);

    const { data: profile, error: profileError } = profileResult;
    if (profileError) throw new Error(`Client profile pull failed: ${profileError.message}`);
    if (!profile || !["client", "coach", "owner"].includes(profile.role)) {
      throw new Error("User data pull failed: the selected user is no longer available");
    }
    const { data: dbCustomExercises, error: customExercisesError } = customExercisesResult;
    if (
      customExercisesError &&
      isMissingTableInSchemaCache(customExercisesError, "custom_exercises")
    ) {
      console.warn(
        `[Optional client custom exercises pull skipped]: ${customExercisesError.message}`,
      );
    } else if (customExercisesError) {
      throw new Error(`Client custom exercises pull failed: ${customExercisesError.message}`);
    }
    const { data: dbPrograms, error: programsError } = programsResult;
    if (programsError) throw new Error(`Client programs pull failed: ${programsError.message}`);
    const { data: dbProgramDays, error: programDaysError } = programDaysResult;
    if (programDaysError) {
      throw new Error(`Client program days pull failed: ${programDaysError.message}`);
    }
    const { data: dbNutritionDays, error: nutritionError } = nutritionResult;
    if (nutritionError && isMissingTableInSchemaCache(nutritionError, "nutrition_days")) {
      console.warn(`[Optional client nutrition pull skipped]: ${nutritionError.message}`);
    } else if (nutritionError) {
      throw new Error(`Client nutrition pull failed: ${nutritionError.message}`);
    }
    const { data: dbMeasurements, error: measurementsError } = measurementsResult;
    if (measurementsError && isMissingTableInSchemaCache(measurementsError, "body_measurements")) {
      console.warn(`[Optional client measurements pull skipped]: ${measurementsError.message}`);
    } else if (measurementsError) {
      throw new Error(`Client measurements pull failed: ${measurementsError.message}`);
    }
    const { data: dbSessions, error: sessionsError } = sessionsResult;
    if (sessionsError) {
      throw new Error(`Client workout history pull failed: ${sessionsError.message}`);
    }
    const { data: dbBodyWeightLogs, error: bodyWeightError } = bodyWeightResult;
    if (bodyWeightError && isOptionalBodyWeightSchemaError(bodyWeightError)) {
      console.warn(`[Optional client body weight pull skipped]: ${bodyWeightError.message}`);
    } else if (bodyWeightError) {
      throw new Error(`Client body weight pull failed: ${bodyWeightError.message}`);
    }
    const { data: dbCardioLogs, error: cardioError } = cardioResult;
    if (cardioError && isSchemaCompatibilityError(cardioError, "cardio_logs")) {
      console.warn(`[Optional client cardio pull skipped]: ${cardioError.message}`);
    } else if (cardioError) {
      throw new Error(`Client cardio pull failed: ${cardioError.message}`);
    }
    const { data: dbHabits, error: habitsError } = habitsResult;
    if (habitsError && isMissingTableInSchemaCache(habitsError, "client_habits")) {
      console.warn(`[Optional client habits pull skipped]: ${habitsError.message}`);
    } else if (habitsError) {
      throw new Error(`Client habits pull failed: ${habitsError.message}`);
    }
    const { data: dbCoachMessages, error: coachMessagesError } = coachMessagesResult;
    if (
      coachMessagesError &&
      isMissingTableInSchemaCache(coachMessagesError, "coach_messages")
    ) {
      console.warn(`[Optional client messages pull skipped]: ${coachMessagesError.message}`);
    } else if (coachMessagesError) {
      throw new Error(`Client messages pull failed: ${coachMessagesError.message}`);
    }
    const { data: dbVideoFeedback, error: videoFeedbackError } = videoFeedbackResult;
    if (
      videoFeedbackError &&
      !isMissingTableInSchemaCache(videoFeedbackError, "video_feedback")
    ) {
      throw new Error(`Client video feedback pull failed: ${videoFeedbackError.message}`);
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
            weekday:
              typeof dRow.weekday === "number" && dRow.weekday >= 0 && dRow.weekday <= 6
                ? dRow.weekday
                : undefined,
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
      plannedMeals: Array.isArray(row.planned_meals) ? row.planned_meals : [],
      ...(row.water_ml === null ? {} : { waterMl: Number(row.water_ml ?? 0) }),
      ...(row.water_target_ml === null
        ? {}
        : { waterTargetMl: Number(row.water_target_ml ?? 2500) }),
      ...(row.target_calories === null || row.target_calories === undefined
        ? {}
        : { targetCalories: Number(row.target_calories) }),
      ...(row.target_protein === null || row.target_protein === undefined
        ? {}
        : { targetProtein: Number(row.target_protein) }),
    }));
    const latestNutritionTarget = (dbNutritionDays || []).find(
      (row) => row.target_calories !== null && row.target_calories !== undefined,
    )?.target_calories;
    const latestNutritionProteinTarget = (dbNutritionDays || []).find(
      (row) => row.target_protein !== null && row.target_protein !== undefined,
    )?.target_protein;
    const latestNutritionCarbsTarget = (dbNutritionDays || []).find(
      (row) => row.target_carbs !== null && row.target_carbs !== undefined,
    )?.target_carbs;
    const latestNutritionFatTarget = (dbNutritionDays || []).find(
      (row) => row.target_fat !== null && row.target_fat !== undefined,
    )?.target_fat;
    const latestNutritionFiberTarget = (dbNutritionDays || []).find(
      (row) => row.target_fiber !== null && row.target_fiber !== undefined,
    )?.target_fiber;
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
    const exerciseList: Exercise[] = (dbCustomExercises || []).map((row) => ({
      id: row.id,
      name: row.name,
      ...(row.english_name ? { nameEn: row.english_name } : {}),
      muscleGroup: row.muscle_group || "אחר",
      muscleGroups:
        Array.isArray(row.muscle_groups) && row.muscle_groups.length > 0
          ? row.muscle_groups
          : row.muscle_group
            ? [row.muscle_group]
            : ["אחר"],
      ...(row.custom_muscle_group ? { customMuscleGroup: row.custom_muscle_group } : {}),
      ...(Array.isArray(row.secondary_muscles)
        ? { secondaryMuscles: row.secondary_muscles }
        : {}),
      ...(Array.isArray(row.approved_substitutes)
        ? { approvedSubstitutes: row.approved_substitutes }
        : {}),
      category: row.category || "מותאם אישית",
      equipment: row.equipment || "ללא ציוד",
      ...(Array.isArray(row.equipment_options)
        ? { equipmentOptions: row.equipment_options }
        : {}),
      ...(row.equipment_images && typeof row.equipment_images === "object"
        ? { equipmentImages: row.equipment_images as Record<string, string> }
        : {}),
      ...(Array.isArray(row.cable_grip_options)
        ? { cableGripOptions: row.cable_grip_options }
        : {}),
      ...(row.cable_grip_images && typeof row.cable_grip_images === "object"
        ? { cableGripImages: row.cable_grip_images as Record<string, string> }
        : {}),
      description: row.description || "",
      instructions: row.instructions || "",
      videoUrl: row.video_url || "",
      videoUrls: Array.isArray(row.video_urls) ? row.video_urls : undefined,
      videoMaleUrl: row.video_male_url || undefined,
      videoFemaleUrl: row.video_female_url || undefined,
      images: Array.isArray(row.images) ? row.images : [],
      notes: typeof row.notes === "string" ? row.notes : "",
      ...(row.tips ? { tips: row.tips } : {}),
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
    const signedHistoryList = await signWorkoutVideosInHistory(historyList);
    for (const session of historyList) {
      if (!workoutsMap.has(session.workoutId)) {
        const historyWorkout = workoutFromHistorySession(session);
        if (historyWorkout) workoutsMap.set(historyWorkout.id, historyWorkout);
      }
    }
    const bodyWeightList = (dbBodyWeightLogs || [])
      .map((row) => mapBodyWeightRow(row))
      .sort((a, b) => b.date.localeCompare(a.date));
    const cardioList: CardioLog[] = (dbCardioLogs || []).map((row) => mapCardioRow(row));
    const habitsList: ClientHabits[] = (dbHabits || []).map((row) => ({
      id: row.id,
      date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
      steps: Number(row.steps ?? 0),
      stepsTarget: Number(row.steps_target ?? 0),
      weighInDone: Boolean(row.weigh_in_done),
      workoutDone: Boolean(row.workout_done),
      busyDayMode: Boolean(row.busy_day_mode),
    }));
    const coachMessagesList: CoachMessage[] = (dbCoachMessages || [])
      .map((row) => ({
        id: row.id,
        coachId: row.coach_id,
        clientId: row.client_id,
        message: row.message,
        createdAt: row.created_at,
        isRead: Boolean(row.is_read),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const profileDateOfBirth =
      typeof profile.date_of_birth === "string" &&
      isValidDateOfBirth(profile.date_of_birth)
        ? profile.date_of_birth
        : undefined;
    const profileAge = profileDateOfBirth ? calculateAge(profileDateOfBirth) : undefined;
    return {
      exercises: exerciseList,
      programs: programsList,
      workouts: Array.from(workoutsMap.values()),
      nutritionDays: nutritionList,
      plannedMeals: profile.planned_menu || [],
        nutritionTargets:
        latestNutritionTarget === undefined &&
        latestNutritionProteinTarget === undefined &&
        latestNutritionCarbsTarget === undefined &&
        latestNutritionFatTarget === undefined &&
        latestNutritionFiberTarget === undefined
          ? {}
          : {
              ...(latestNutritionTarget === undefined
                ? {}
                : { calories: Number(latestNutritionTarget) }),
              ...(latestNutritionProteinTarget === undefined
                ? {}
                : { protein: Number(latestNutritionProteinTarget) }),
              ...(latestNutritionCarbsTarget === undefined
                ? {}
                : { carbs: Number(latestNutritionCarbsTarget) }),
              ...(latestNutritionFatTarget === undefined
                ? {}
                : { fat: Number(latestNutritionFatTarget) }),
              ...(latestNutritionFiberTarget === undefined
                ? {}
                : { fiber: Number(latestNutritionFiberTarget) }),
            },
       history: signedHistoryList,
      cardioLogs: cardioList,
      bodyWeightLogs: bodyWeightList,
      bodyMeasurements: measurementList,
      habits: habitsList,
      coachMessages: coachMessagesList,
      videoFeedbacks: (dbVideoFeedback ?? [])
        .map((row) => videoFeedbackFromRow(row as Record<string, unknown>))
        .filter((feedback) => feedback.id && feedback.videoPath),
      ...(profile
        ? {
            profile: {
              weight: Number(profile.weight_kg || 65),
              height: Number(profile.height_cm || 165),
              role: profile.role as UserRole,
              todayRoutineEnabled: profile.today_routine_enabled ?? true,
              showCalories: profile.show_calories ?? true,
              ...(Object.prototype.hasOwnProperty.call(profile, "loading_animations_enabled")
                ? {
                    loadingAnimationsEnabled:
                      typeof profile.loading_animations_enabled === "boolean"
                        ? profile.loading_animations_enabled
                        : undefined,
                  }
                : {}),
              ...(profile.email ? { email: profile.email } : {}),
              ...(profile.full_name ? { fullName: profile.full_name } : {}),
              ...(profile.gender === "male" || profile.gender === "female"
                ? { gender: profile.gender }
                : {}),
              ...(profileDateOfBirth
                ? {
                    dateOfBirth: profileDateOfBirth,
                    ...(profileAge === undefined ? {} : { age: profileAge }),
                  }
                : profile.age_years
                  ? { age: Number(profile.age_years) }
                  : {}),
              ...(profile.coach_id ? { coachId: profile.coach_id } : {}),
              ...(profile.next_checkin_date ? { nextCheckinDate: profile.next_checkin_date } : {}),
            },
          }
        : {}),
    };
  } catch (err: unknown) {
    const error = err instanceof Error && err.message ? err.message : "Client data pull failed";
    console.error("[Pull Client Data Error]:", error);
    return {
      exercises: [],
      programs: [],
      workouts: [],
      nutritionDays: [],
      plannedMeals: [],
      nutritionTargets: {},
      history: [],
      cardioLogs: [],
      bodyWeightLogs: [],
      bodyMeasurements: [],
      habits: [],
      coachMessages: [],
      error,
    };
  }
}

async function signWorkoutVideosInHistory(history: HistorySession[]): Promise<HistorySession[]> {
  return Promise.all(
    history.map(async (session) => ({
      ...session,
      entries: await signWorkoutVideoEntries(session.entries),
    })),
  );
}

function workoutVideoStoragePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("blob:")) return undefined;

  try {
    const url = new URL(trimmed);
    const marker = `/storage/v1/object/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return undefined;
    const objectPath = url.pathname.slice(markerIndex + marker.length);
    const bucketPrefix = `${url.pathname.includes("/object/sign/") ? "sign" : "public"}/${WORKOUT_VIDEO_BUCKET}/`;
    if (!objectPath.startsWith(bucketPrefix)) return undefined;
    const encodedPath = objectPath.slice(bucketPrefix.length);
    return decodeURIComponent(encodedPath);
  } catch {
    // Newly uploaded entries use a path rather than a URL. Reject values
    // that look like arbitrary external URLs, but accept the generated path.
    return /^[^/\\\s]+\/[^/\\\s]+\/[^/\\\s]+\/[^/\\\s]+$/.test(trimmed)
      ? trimmed
      : undefined;
  }
}

async function signWorkoutVideoEntries(entries: HistoryEntry[]): Promise<HistoryEntry[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const sourcePath = entry.videoPath ?? workoutVideoStoragePath(entry.videoUrl);
      if (!sourcePath) return entry;
      const playbackPath = entry.videoPlaybackPath ?? sourcePath;
      let signedUrl = "";
      try {
        signedUrl = await signWorkoutPerformanceVideo(playbackPath);
      } catch (error) {
        // One missing or expired Storage object must not hide the rest of the
        // completed workout from the coach. Keep the path so the UI can still
        // identify the video and offer feedback, while the player reports the
        // individual playback failure.
        console.warn("[Workout Video Sign Warning]:", error);
        if (playbackPath !== sourcePath) {
          try {
            signedUrl = await signWorkoutPerformanceVideo(sourcePath);
          } catch {
            // Preserve the empty URL so the player can show its unavailable state.
          }
        }
      }
      return {
        ...entry,
        videoPath: sourcePath,
        videoPlaybackPath: playbackPath,
        videoUrl: signedUrl,
      };
    }),
  );
}

function historyEntriesForPersistence(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.map((entry) => {
    const path = entry.videoPath ?? workoutVideoStoragePath(entry.videoUrl);
    if (!path) return entry;
    const { videoPath: _videoPath, videoUrl: _videoUrl, ...entryWithoutVideoUrl } = entry;
    return { ...entryWithoutVideoUrl, videoUrl: path };
  });
}
