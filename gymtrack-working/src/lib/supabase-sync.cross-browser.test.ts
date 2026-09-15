import { beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  BodyMeasurement,
  BodyWeightLog,
  CardioLog,
  GymData,
  HistorySession,
  NutritionDay,
  Program,
  Workout,
} from "./gym-types";
import { fetchCoachMessages, loadCoachMessages, sendCoachMessage } from "./coach-messages";

type QueryResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
};

type QueryCall = {
  table: string;
  action: "select" | "upsert" | "insert" | "update" | "delete";
  filters: Array<[string, unknown]>;
  payload?: unknown;
};

const queryCalls: QueryCall[] = [];
const responses = new Map<string, QueryResult>();
const actionResponses = new Map<string, QueryResult[]>();

const storageCalls: Array<{
  bucket: string;
  action: "upload" | "createSignedUrl" | "createSignedUploadUrl";
  path: string;
  expiresIn?: number;
}> = [];
const emptyResult = (): QueryResult => ({ data: [], error: null });

function responseFor(table: string, action: QueryCall["action"]): QueryResult {
  const queued = actionResponses.get(`${table}:${action}`);
  if (queued && queued.length > 0) {
    const next = queued.shift()!;
    if (queued.length === 0) actionResponses.delete(`${table}:${action}`);
    return next;
  }
  if (action !== "select") return { data: null, error: null };
  return responses.get(table) ?? emptyResult();
}

function makeQuery(table: string) {
  const call: QueryCall = { table, action: "select", filters: [] };
  queryCalls.push(call);

  const query = {
    select: () => {
      call.action = "select";
      return query;
    },
    eq: (column: string, value: unknown) => {
      call.filters.push([column, value]);
      return query;
    },
    in: (column: string, values: unknown[]) => {
      call.filters.push([column, values]);
      return query;
    },
    gte: (column: string, value: unknown) => {
      call.filters.push([`gte:${column}`, value]);
      return query;
    },
    lt: (column: string, value: unknown) => {
      call.filters.push([`lt:${column}`, value]);
      return query;
    },
    order: () => query,
    limit: () => query,
    upsert: (payload: unknown) => {
      call.action = "upsert";
      call.payload = payload;
      return query;
    },
    insert: (payload: unknown) => {
      call.action = "insert";
      call.payload = payload;
      return query;
    },
    update: (payload: unknown) => {
      call.action = "update";
      call.payload = payload;
      return query;
    },
    delete: () => {
      call.action = "delete";
      return query;
    },
    maybeSingle: async () => responseFor(table, call.action),
    single: async () => responseFor(table, call.action),
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(responseFor(table, call.action)).then(onFulfilled, onRejected),
  };

  return query;
}

mock.module("./supabase", () => ({
  supabase: {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "client-b",
            email: "client-b@example.com",
            user_metadata: {},
          },
        },
      }),
    },
    from: (table: string) => makeQuery(table),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string) => {
          storageCalls.push({ bucket, action: "upload", path });
          return { data: null, error: null };
        },
        createSignedUrl: async (path: string, expiresIn: number) => {
          storageCalls.push({ bucket, action: "createSignedUrl", path, expiresIn });
          return {
            data: {
              signedUrl: `https://project.supabase.co/storage/v1/object/sign/${bucket}/${encodeURIComponent(path)}?token=test`,
            },
            error: null,
          };
        },
        createSignedUploadUrl: async (path: string) => {
          storageCalls.push({ bucket, action: "createSignedUploadUrl", path });
          return {
            data: {
              signedUrl: `https://project.supabase.co/storage/v1/object/upload/sign/${bucket}/${encodeURIComponent(path)}?token=test`,
            },
            error: null,
          };
        },
      }),
    },
  },
}));

// The store lifecycle suite mocks the normal module specifier. A query suffix
// keeps this contract suite attached to the real sync implementation when Bun
// runs all tests in one process.
// @ts-expect-error Bun resolves the query-suffixed module at test runtime.
const syncModule = import("./supabase-sync?cross-browser");

function setResponse(table: string, data: unknown, error: QueryResult["error"] = null) {
  responses.set(table, { data, error });
}

function setActionResponses(
  table: string,
  action: QueryCall["action"],
  results: QueryResult[],
) {
  actionResponses.set(`${table}:${action}`, [...results]);
}

function makeLocalData(
  profile: GymData["userProfile"] = { weight: 75, role: "client", coachId: "coach-old" },
): GymData {
  return {
    exercises: [
      {
        id: "ex-local",
        name: "Local exercise",
        muscleGroup: "Back",
        muscleGroups: ["Back"],
        equipment: "Bar",
        description: "",
        videoUrl: "",
        images: [],
        notes: "",
      },
    ],
    workouts: [],
    programs: [],
    challenges: [],
    history: [],
    foods: [],
    nutritionDays: [],
    nutritionTargets: {},
    mealTemplate: [],
    recipes: [],
    recentFoods: [],
    favoriteFoods: [],
    bodyWeightLogs: [],
    bodyMeasurements: [],
    habits: [],
    coachMessages: [
      {
        id: "old-message",
        coachId: "coach-old",
        clientId: "client-b",
        message: "Old cached message",
        createdAt: "2026-08-25T10:00:00.000Z",
      },
    ],
    clients: [
      {
        id: "old-link",
        clientId: "client-b",
        clientName: "Cached client",
        createdAt: "2026-08-25T10:00:00.000Z",
      },
    ],
    broadcasts: [],
    cardioLogs: [],
    userProfile: profile,
    preExitChecklist: [],
  };
}

function callsFor(table: string, action?: QueryCall["action"]) {
  return queryCalls.filter(
    (call) => call.table === table && (action === undefined || call.action === action),
  );
}

function hasFilter(table: string, column: string, value: unknown) {
  return callsFor(table).some((call) =>
    call.filters.some(
      ([filterColumn, filterValue]) => filterColumn === column && filterValue === value,
    ),
  );
}

function resetResponses() {
  responses.clear();
  actionResponses.clear();
  queryCalls.length = 0;
  storageCalls.length = 0;
}

beforeEach(resetResponses);

describe("cross-browser Supabase sync boundaries", () => {
  const cardio: CardioLog = {
    id: "cardio-shared",
    date: "2026-08-26",
    type: "הליכון",
    durationMin: 30,
    calories: 220,
  };
  const bodyWeight: BodyWeightLog = {
    id: "weight-shared",
    date: "2026-08-26",
    weight: 72,
  };

  test("clears the draft path only after a successful coach message insert", async () => {
    const inserted: unknown[] = [];

    await sendCoachMessage(
      async () => ({ data: { user: { id: "coach-a" } } }),
      async (payload) => {
        inserted.push(payload);
        return { error: null };
      },
      "client-b",
      "  Keep going  ",
    );

    expect(inserted).toEqual([
      {
        coach_id: "coach-a",
        client_id: "client-b",
        message: "  Keep going  ",
      },
    ]);
  });

  test("surfaces database and network failures without swallowing them", async () => {
    await expect(
      sendCoachMessage(
        async () => ({ data: { user: { id: "coach-a" } } }),
        async () => ({ error: { message: "permission denied", code: "42501" } }),
        "client-b",
        "Keep going",
      ),
    ).rejects.toThrow("permission denied");

    await expect(
      sendCoachMessage(
        async () => ({ data: { user: { id: "coach-a" } } }),
        async () => {
          throw new Error("network unavailable");
        },
        "client-b",
        "Keep going",
      ),
    ).rejects.toThrow("network unavailable");
  });

  test("maps accepted coach messages into the selected client's sent history", async () => {
    await expect(
      loadCoachMessages(async () => ({
        data: [
          {
            id: "message-1",
            coach_id: "coach-a",
            client_id: "client-b",
            message: "Great work",
            created_at: "2026-08-26T08:00:00.000Z",
            is_read: false,
          },
        ],
        error: null,
      })),
    ).resolves.toEqual([
      {
        id: "message-1",
        coachId: "coach-a",
        clientId: "client-b",
        message: "Great work",
        createdAt: "2026-08-26T08:00:00.000Z",
        isRead: false,
      },
    ]);
  });

  test("maps only the selected client's saved messages for the current coach", async () => {
    const selected: Array<[string, string]> = [];
    const messages = await fetchCoachMessages(
      async (clientId, coachId) => {
        selected.push([clientId, coachId]);
        return {
          data: [
            {
              id: "message-2",
              coach_id: coachId,
              client_id: clientId,
              message: "Keep going",
              created_at: "2026-08-26T06:30:00.000Z",
              is_read: false,
            },
          ],
          error: null,
        };
      },
      "client-b",
      "coach-a",
    );

    expect(selected).toEqual([["client-b", "coach-a"]]);
    expect(messages).toEqual([
      {
        id: "message-2",
        coachId: "coach-a",
        clientId: "client-b",
        message: "Keep going",
        createdAt: "2026-08-26T06:30:00.000Z",
        isRead: false,
      },
    ]);
  });

  test("clears cached messages and client links after authoritative empty responses", async () => {
    setResponse("profiles", {
      id: "coach-a",
      role: "coach",
      weight_kg: 80,
      coach_id: null,
      today_routine_enabled: true,
    });
    setResponse("coach_messages", []);
    setResponse("broadcast_announcements", []);
    setResponse("coach_clients", []);
    setResponse("custom_exercises", []);
    setResponse("programs", []);
    setResponse("program_days", []);
    setResponse("workout_sessions", []);
    setResponse("body_weight_logs", []);
    setResponse("cardio_logs", []);
    setResponse("body_measurements", []);
    setResponse("client_habits", []);
    setResponse("custom_foods", []);
    setResponse("nutrition_days", []);
    setResponse("coach_recipes", []);
    setResponse("food_favorites", []);

    const cached = makeLocalData();
    const { pullSupabaseData } = await syncModule;
    const result = await pullSupabaseData("coach-a", {
      ...makeLocalData({ weight: 80, role: "coach" }),
      coachMessages: cached.coachMessages ?? [],
      clients: cached.clients ?? [],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.coachMessages).toEqual([]);
    expect(result.data.clients).toEqual([]);
  });

  test("retries the optional food catalog without barcode when the column is unavailable", async () => {
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setActionResponses("foods", "select", [
      {
        data: null,
        error: {
          code: "PGRST204",
          message: "Could not find the 'barcode' column of 'foods' in the schema cache",
        },
      },
      {
        data: [
          {
            id: "catalog-food-1",
            name: "אבקת חלבון",
            english_name: "Protein powder",
            category: "מוצרי חלבון",
            brand: "Test brand",
            serving_unit: "30g",
            serving_grams: 30,
            calories: 120,
            protein: 24,
            carbs: 3,
            fat: 2,
            fiber: 1,
            search_aliases: ["אבקה"],
            catalog_source: "open-food-facts",
            catalog_source_product_id: "source-1",
            catalog_source_url: "https://example.com/product/source-1",
            catalog_product_type: "powder",
            catalog_package_size: "900g",
            catalog_synced_at: "2026-09-10T00:00:00.000Z",
            catalog_source_updated_at: "2026-09-09T00:00:00.000Z",
            catalog_verification_status: "external-unverified",
          },
        ],
        error: null,
      },
    ]);

    const { pullSupabaseData } = await syncModule;
    const result = await pullSupabaseData("client-b", makeLocalData());

    expect(result.success).toBe(true);
    expect(callsFor("foods", "select")).toHaveLength(2);
    if (!result.success) return;
    expect(result.data.foods).toEqual([
      expect.objectContaining({
        id: "catalog-food-1",
        name: "אבקת חלבון",
        catalog: expect.objectContaining({
          source: "open-food-facts",
          sourceProductId: "source-1",
        }),
      }),
    ]);
  });

  test("retries program days without weekday when the connected schema is behind", async () => {
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setResponse("programs", [
      {
        id: "program-1",
        user_id: "client-b",
        name: "תוכנית התחלה",
        description: "",
      },
    ]);
    setActionResponses("program_days", "select", [
      {
        data: null,
        error: {
          code: "PGRST204",
          message: "Could not find the 'weekday' column of 'program_days' in the schema cache",
        },
      },
      {
        data: [
          {
            id: "day-1",
            program_id: "program-1",
            user_id: "client-b",
            name: "יום ראשון",
            items: [],
            sort_order: 0,
            updated_at: "2026-09-14T00:00:00.000Z",
          },
        ],
        error: null,
      },
    ]);

    const { pullClientDataForCoach } = await syncModule;
    const result = await pullClientDataForCoach("client-b");

    expect(result.error).toBeUndefined();
    expect(result.workouts).toEqual([
      expect.objectContaining({
        id: "day-1",
        name: "יום ראשון",
        items: [],
      }),
    ]);
    expect(callsFor("program_days", "select")).toHaveLength(2);
  });

  test("retries a weekday update without the missing column", async () => {
    setActionResponses("program_days", "update", [
      {
        data: null,
        error: {
          code: "PGRST204",
          message: "Could not find the 'weekday' column of 'program_days' in the schema cache",
        },
      },
      { data: null, error: null },
    ]);

    const { updateProgramDayWeekday } = await syncModule;
    const result = await updateProgramDayWeekday("day-1", "client-b", 3);

    expect(result.error).toBeNull();
    expect(result.usedLegacySchema).toBe(true);
    const updates = queryCalls.filter(
      (call) => call.table === "program_days" && call.action === "update",
    );
    expect(updates).toHaveLength(2);
    const firstPayload = updates[0]?.payload as { weekday?: unknown; updated_at?: unknown };
    expect(firstPayload?.weekday).toBe(3);
    expect(typeof firstPayload?.updated_at).toBe("string");
    expect(updates[0]?.filters).toEqual([
      ["id", "day-1"],
      ["user_id", "client-b"],
    ]);
    const secondPayload = updates[1]?.payload as { weekday?: unknown; updated_at?: unknown };

    expect(secondPayload?.weekday).toBeUndefined();
    expect(typeof secondPayload?.updated_at).toBe("string");
    expect(updates[1]?.filters).toEqual([
      ["id", "day-1"],
      ["user_id", "client-b"],
    ]);
  });

  test("inserts program days with weekday and falls back to legacy columns", async () => {
    const payload = {
      id: "day-2",
      program_id: "program-1",
      user_id: "client-b",
      name: "יום שני",
      items: [],
      sort_order: 1,
      weekday: 2,
    };
    setActionResponses("program_days", "insert", [
      { data: null, error: null },
      {
        data: null,
        error: {
          code: "PGRST204",
          message: "Could not find the 'weekday' column of 'program_days' in the schema cache",
        },
      },
      { data: null, error: null },
    ]);

    const { appendProgramDayToLocalCoachData, insertProgramDayForCoach } = await syncModule;
    const richResult = await insertProgramDayForCoach(payload);
    expect(richResult).toEqual({ error: null, usedLegacySchema: false });

    const localData = appendProgramDayToLocalCoachData(
      {
        programs: [{ id: "program-1", name: "תוכנית", notes: "", dayIds: [] }],
        workouts: [],
      },
      "program-1",
      {
        id: "day-3",
        name: "יום שני",
        notes: "",
        items: [],
        weekday: 2,
      },
    );
    expect(localData.programs[0]?.dayIds).toEqual(["day-3"]);
    expect(localData.workouts[0]?.weekday).toBe(2);

    const legacyResult = await insertProgramDayForCoach({ ...payload, id: "day-3" });
    expect(legacyResult).toEqual({ error: null, usedLegacySchema: true });
    expect(callsFor("program_days", "insert")).toHaveLength(3);
    expect(
      Object.prototype.hasOwnProperty.call(callsFor("program_days", "insert")[2]?.payload, "weekday"),
    ).toBe(false);
  });

  test("keeps coach and client data queries scoped to the requested client", async () => {
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setResponse("custom_exercises", [
      {
        id: "ex-custom",
        name: "Custom exercise",
        muscle_group: "Chest",
        equipment: "Machine",
        category: "מותאם אישית",
        description: "Coach instructions",
        instructions: "Use controlled reps",
        video_url: "https://cdn.example.com/custom.mp4",
        video_urls: ["https://cdn.example.com/custom.mp4"],
        video_male_url: null,
        video_female_url: null,
      },
    ]);
    setResponse("programs", []);
    setResponse("program_days", []);
    setResponse("nutrition_days", []);
    setResponse("body_measurements", []);
    setResponse("workout_sessions", []);
    setResponse("body_weight_logs", [
      {
        id: "weight-1",
        user_id: "client-b",
        weight_kg: 72,
        recorded_at: "2026-08-26T07:00:00.000Z",
      },
    ]);
    setResponse("cardio_logs", [
      {
        id: "cardio-1",
        user_id: "client-b",
        activity_type: "הליכון",
        duration_minutes: 30,
        estimated_calories: 220,
        intensity: "moderate",
        recorded_at: "2026-08-26T08:00:00.000Z",
      },
    ]);

    const { pullClientDataForCoach, pullSupabaseData } = await syncModule;
    const coachResult = await pullClientDataForCoach("client-b");
    expect(coachResult.error).toBeUndefined();
    expect(coachResult.bodyWeightLogs).toEqual([
      { id: "weight-1", date: "2026-08-26", weight: 72 },
    ]);
    expect(coachResult.cardioLogs).toEqual([
      {
        id: "cardio-1",
        date: "2026-08-26",
        type: "הליכון",
        durationMin: 30,
        calories: 220,
        intensity: "moderate",
      },
    ]);

    expect(hasFilter("profiles", "id", "client-b")).toBe(true);
    expect(hasFilter("custom_exercises", "user_id", "client-b")).toBe(true);
    expect(coachResult.exercises).toEqual([
      expect.objectContaining({
        id: "ex-custom",
        name: "Custom exercise",
        videoUrl: "https://cdn.example.com/custom.mp4",
        videoUrls: ["https://cdn.example.com/custom.mp4"],
      }),
    ]);
    for (const table of [
      "custom_exercises",
      "programs",
      "program_days",
      "nutrition_days",
      "body_measurements",
      "workout_sessions",
      "cardio_logs",
    ]) {
      expect(hasFilter(table, "user_id", "client-b")).toBe(true);
    }

    resetResponses();
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70, coach_id: null });
    setResponse("coach_messages", []);
    setResponse("broadcast_announcements", []);
    setResponse("custom_exercises", []);
    setResponse("programs", []);
    setResponse("program_days", []);
    setResponse("workout_sessions", []);
    setResponse("body_weight_logs", [
      {
        id: "weight-1",
        weight_kg: 72,
        recorded_at: "2026-08-26T07:00:00.000Z",
      },
    ]);
    setResponse("cardio_logs", [
      {
        id: "cardio-1",
        activity_type: "הליכון",
        duration_minutes: 30,
        estimated_calories: 220,
        recorded_at: "2026-08-26T08:00:00.000Z",
      },
    ]);
    setResponse("body_measurements", []);
    setResponse("client_habits", []);
    setResponse("custom_foods", []);
    setResponse("nutrition_days", []);
    setResponse("coach_recipes", []);
    setResponse("food_favorites", []);

    const accountResult = await pullSupabaseData("client-b", makeLocalData());
    expect(accountResult.success).toBe(true);
    if (!accountResult.success) return;
    expect(accountResult.data.bodyWeightLogs).toEqual([
      { id: "weight-1", date: "2026-08-26", weight: 72 },
    ]);
    expect(accountResult.data.cardioLogs).toEqual([
      {
        id: "cardio-1",
        date: "2026-08-26",
        type: "הליכון",
        durationMin: 30,
        calories: 220,
      },
    ]);
    expect(hasFilter("profiles", "id", "client-b")).toBe(true);
    expect(hasFilter("coach_messages", "client_id", "client-b")).toBe(true);
    for (const table of [
      "programs",
      "program_days",
      "workout_sessions",
      "body_weight_logs",
      "cardio_logs",
      "body_measurements",
      "client_habits",
      "custom_foods",
      "nutrition_days",
      "food_favorites",
    ]) {
      expect(hasFilter(table, "user_id", "client-b")).toBe(true);
    }
    expect(hasFilter("coach_recipes", "coach_id", "client-b")).toBe(true);
  });

  test("writes coach-owned plan and user-owned sync payloads with the authenticated user id", async () => {
    const program: Program = { id: "program-b", name: "Client plan", notes: "", dayIds: ["day-b"] };
    const workout: Workout = { id: "day-b", name: "Day", notes: "", items: [] };
    const history: HistorySession = {
      id: "session-b",
      workoutId: "day-b",
      workoutName: "Day",
      date: "2026-08-26T08:00:00.000Z",
      durationSec: 600,
      entries: [],
    };
    const nutritionDay: NutritionDay = { id: "nutrition-b", date: "2026-08-26", meals: [] };
    const measurement: BodyMeasurement = { id: "measurement-b", date: "2026-08-26", waistCm: 80 };

    const { syncLocalToSupabase } = await syncModule;
    const result = await syncLocalToSupabase("client-b", {
      ...makeLocalData({ weight: 70, role: "coach" }),
      workouts: [workout],
      programs: [program],
      history: [history],
      nutritionDays: [nutritionDay],
      bodyMeasurements: [measurement],
      bodyWeightLogs: [],
      cardioLogs: [],
      habits: [],
    });

    expect(result.success).toBe(true);
    const profileUpsert = callsFor("profiles", "upsert")[0];
    const profilePayload = profileUpsert?.payload as Record<string, unknown> | undefined;
    expect(profilePayload?.["coach_id"]).toBeUndefined();
    expect(profilePayload?.["role"]).toBeUndefined();
    const userOwnedPayloads = callsFor("programs", "upsert")
      .concat(callsFor("program_days", "upsert"))
      .concat(callsFor("workout_sessions", "upsert"))
      .concat(callsFor("nutrition_days", "upsert"))
      .concat(callsFor("body_measurements", "upsert"));
    expect(userOwnedPayloads.length).toBeGreaterThan(0);
    for (const call of userOwnedPayloads) {
      const payloads = Array.isArray(call.payload) ? call.payload : [call.payload];
      for (const payload of payloads) {
        expect((payload as { user_id: string }).user_id).toBe("client-b");
      }
    }
  });

  test("does not replay client-owned plan definitions through generic sync", async () => {
    const program: Program = { id: "client-plan", name: "Assigned plan", notes: "", dayIds: ["client-day"] };
    const workout: Workout = { id: "client-day", name: "Day", notes: "", items: [] };

    const { syncLocalToSupabase } = await syncModule;
    const result = await syncLocalToSupabase("client-b", {
      ...makeLocalData({ weight: 70, role: "client" }),
      workouts: [workout],
      programs: [program],
      deletedProgramIds: ["old-client-plan"],
      deletedWorkoutIds: ["old-client-day"],
    });

    expect(result.success).toBe(true);
    expect(callsFor("programs", "upsert")).toHaveLength(0);
    expect(callsFor("program_days", "upsert")).toHaveLength(0);
    expect(callsFor("programs", "delete")).toHaveLength(0);
    expect(callsFor("program_days", "delete")).toHaveLength(0);
  });

  test("restores authoritative client plans hidden by stale local tombstones", async () => {
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setResponse("programs", [
      {
        id: "assigned-plan",
        user_id: "client-b",
        name: "Assigned plan",
        description: "",
      },
    ]);
    setResponse("program_days", [
      {
        id: "assigned-day",
        program_id: "assigned-plan",
        user_id: "client-b",
        name: "Day A",
        items: [],
        sort_order: 0,
      },
    ]);

    const { pullSupabaseData } = await syncModule;
    const result = await pullSupabaseData("client-b", {
      ...makeLocalData({ weight: 70, role: "client" }),
      deletedProgramIds: ["assigned-plan"],
      deletedWorkoutIds: ["assigned-day"],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.programs).toEqual([
      expect.objectContaining({ id: "assigned-plan", dayIds: ["assigned-day"] }),
    ]);
    expect(result.data.workouts).toEqual([
      expect.objectContaining({ id: "assigned-day", name: "Day A" }),
    ]);
    expect(result.data.deletedProgramIds).toEqual([]);
    expect(result.data.deletedWorkoutIds).toEqual([]);
  });

  test("falls back to live legacy activity columns without aborting the sync", async () => {
    const cardio: CardioLog = {
      id: "cardio-retry",
      date: "2026-08-26",
      type: "אופניים",
      durationMin: 20,
      calories: 140,
    };
    const bodyWeight: BodyWeightLog = {
      id: "weight-retry",
      date: "2026-08-26",
      weight: 72,
    };
    const missingCardioColumn = {
      message: "Could not find the 'date' column of 'cardio_logs' in the schema cache",
      code: "PGRST204",
    };
    const missingWeightColumn = {
      message: "Could not find the 'date' column of 'body_weight_logs' in the schema cache",
      code: "PGRST204",
    };
    setActionResponses("cardio_logs", "upsert", [
      { data: null, error: missingCardioColumn },
      { data: null, error: null },
    ]);
    setActionResponses("body_weight_logs", "upsert", [
      { data: null, error: missingWeightColumn },
      { data: null, error: null },
    ]);
    setActionResponses("body_weight_logs", "delete", [
      { data: null, error: missingWeightColumn },
      { data: null, error: null },
    ]);

    const { syncLocalToSupabase } = await syncModule;
    const result = await syncLocalToSupabase("client-b", {
      ...makeLocalData(),
      cardioLogs: [cardio],
      bodyWeightLogs: [bodyWeight],
      deletedBodyWeightLogDates: ["2026-08-25"],
    });

    expect(result.success).toBe(true);
    expect(callsFor("cardio_logs", "upsert")[0]?.payload).toEqual([
      expect.objectContaining({
        date: "2026-08-26",
        type: "אופניים",
        duration_min: 20,
      }),
    ]);
    expect(callsFor("cardio_logs", "upsert")[1]?.payload).toEqual([
      expect.objectContaining({
        activity_type: "אופניים",
        duration_minutes: 20,
        recorded_at: "2026-08-26",
      }),
    ]);
    expect(callsFor("body_weight_logs", "upsert")[1]?.payload).toEqual([
      expect.objectContaining({
        weight_kg: 72,
        recorded_at: "2026-08-26",
      }),
    ]);
    expect(callsFor("body_weight_logs", "delete")[1]?.filters).toEqual([
      ["user_id", "client-b"],
      ["gte:recorded_at", "2026-08-25T00:00:00.000Z"],
      ["lt:recorded_at", "2026-08-26T00:00:00.000Z"],
    ]);
  });

  test("retries the same cross-device snapshot idempotently", async () => {
    const session: HistorySession = {
      id: "session-retry",
      workoutId: "day-retry",
      workoutName: "אימון חוזר",
      date: "2026-08-26T08:00:00.000Z",
      durationSec: 900,
      entries: [],
    };
    const cardio: CardioLog = {
      id: "cardio-retry",
      date: "2026-08-26",
      type: "אופניים",
      durationMin: 20,
      calories: 140,
    };
    const bodyWeight: BodyWeightLog = {
      id: "weight-retry",
      date: "2026-08-26",
      weight: 72,
    };
    const snapshot = {
      ...makeLocalData(),
      history: [session],
      cardioLogs: [cardio],
      bodyWeightLogs: [bodyWeight],
      nutritionDays: [{ id: "nutrition-retry", date: "2026-08-26", meals: [] }],
      nutritionTargets: { calories: 1_900 },
      plannedMeals: [{ id: "meal-retry", name: "תפריט חוזר", foods: [] }],
      bodyMeasurements: [{ id: "measurement-retry", date: "2026-08-26", waistCm: 80 }],
      habits: [
        {
          id: "habit-retry",
          date: "2026-08-26",
          steps: 8_000,
          stepsTarget: 10_000,
          weighInDone: true,
          workoutDone: true,
          busyDayMode: false,
        },
      ],
    };
    const { syncLocalToSupabase } = await syncModule;

    expect((await syncLocalToSupabase("client-b", snapshot)).success).toBe(true);
    expect((await syncLocalToSupabase("client-b", snapshot)).success).toBe(true);

    const historyWrites = callsFor("workout_sessions", "upsert");
    const cardioWrites = callsFor("cardio_logs", "upsert");
    const bodyWeightWrites = callsFor("body_weight_logs", "upsert");
    expect(historyWrites).toHaveLength(2);
    expect(cardioWrites).toHaveLength(2);
    expect(bodyWeightWrites).toHaveLength(2);
    expect((historyWrites[0]?.payload as Array<{ id: string }>)[0]?.id).toBe("session-retry");
    expect((historyWrites[1]?.payload as Array<{ id: string }>)[0]?.id).toBe("session-retry");
    expect((cardioWrites[0]?.payload as Array<{ id: string }>)[0]?.id).toBe(
      (cardioWrites[1]?.payload as Array<{ id: string }>)[0]?.id,
    );
    expect((bodyWeightWrites[0]?.payload as Array<{ user_id: string; date: string }>)[0]).toEqual(
      expect.objectContaining({ user_id: "client-b", date: "2026-08-26" }),
    );
    expect((bodyWeightWrites[1]?.payload as Array<{ user_id: string; date: string }>)[0]).toEqual(
      expect.objectContaining({ user_id: "client-b", date: "2026-08-26" }),
    );
  });

  test("keeps completed workout entries and performance video URLs through coach pulls", async () => {
    const videoPath = "client-b/day-b/ex-local/video.mp4";
    const legacyPublicVideoUrl = `https://project.supabase.co/storage/v1/object/public/workout-videos/${videoPath}`;
    const completedSession: HistorySession = {
      id: "session-with-video",
      workoutId: "day-b",
      workoutName: "Day",
      date: "2026-08-30T08:00:00.000Z",
      durationSec: 600,
      entries: [
        {
          exerciseId: "ex-local",
          exerciseName: "Local exercise",
          notes: "",
          videoUrl: videoPath,
          sets: [{ reps: 10, weight: 20, done: true }],
        },
      ],
    };

    const { syncLocalToSupabase, pullClientDataForCoach } = await syncModule;
    const syncResult = await syncLocalToSupabase(
      "client-b",
      { ...makeLocalData(), history: [completedSession] },
      "client-b@example.com",
    );
    expect(syncResult.success).toBe(true);

    const historyUpsert = callsFor("workout_sessions", "upsert").at(-1);
    expect(historyUpsert?.payload).toEqual([
      expect.objectContaining({
        id: completedSession.id,
        user_id: "client-b",
        entries: completedSession.entries,
      }),
    ]);
    const persistedEntry = (
      (historyUpsert?.payload as Array<{ entries: Array<{ videoUrl?: string }> }> | undefined)?.[0]
        ?.entries ?? []
    )[0];
    expect(persistedEntry?.videoUrl).toBe(videoPath);
    expect(persistedEntry?.videoUrl?.includes("?token=")).toBe(false);

    resetResponses();
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setResponse("workout_sessions", [
      {
        id: completedSession.id,
        workout_id: completedSession.workoutId,
        workout_name: completedSession.workoutName,
        date: completedSession.date,
        duration_sec: completedSession.durationSec,
        entries: [{ ...completedSession.entries[0], videoUrl: legacyPublicVideoUrl }],
        notes: "Workout notes",
        difficulty_rating: "appropriate",
        discomfort_notes: "No discomfort",
      },
    ]);

    const coachData = await pullClientDataForCoach("client-b");
    expect(coachData.error).toBeUndefined();
    expect(coachData.history).toHaveLength(1);
    const coachVideo = coachData.history[0]?.entries[0];
    expect(coachVideo?.videoUrl).toBe(
      `https://project.supabase.co/storage/v1/object/sign/workout-videos/${encodeURIComponent(videoPath)}?token=test`,
    );
    expect(coachVideo?.videoPath).toBe(videoPath);
    expect(coachData.history[0]).toMatchObject({
      id: completedSession.id,
      workoutId: completedSession.workoutId,
      workoutName: completedSession.workoutName,
      date: completedSession.date,
      durationSec: completedSession.durationSec,
      entries: [expect.objectContaining({ exerciseId: "ex-local" })],
      notes: "Workout notes",
      difficultyRating: "appropriate",
      discomfortNotes: "No discomfort",
    });
    expect(storageCalls).toContainEqual({
      bucket: "workout-videos",
      action: "createSignedUrl",
      path: videoPath,
      expiresIn: 600,
    });
  });

  test("uploads trainee videos into the owner folder and returns only a short-lived signed URL", async () => {
    const { uploadWorkoutPerformanceVideo } = await syncModule;
    const uploaded = await uploadWorkoutPerformanceVideo(
      new File(["video"], "performance.mp4", { type: "video/mp4" }),
      { workoutId: "day-b", exerciseId: "ex-local" },
    );

    expect(uploaded.path).toMatch(/^client-b\/day-b\/ex-local\/.+\.mp4$/);
    expect(uploaded.signedUrl).toContain("/storage/v1/object/sign/workout-videos/");
    expect(storageCalls[0]).toMatchObject({
      bucket: "workout-videos",
      action: "upload",
    });
    expect(storageCalls[1]).toMatchObject({
      bucket: "workout-videos",
      action: "createSignedUrl",
      expiresIn: 600,
    });
  });

  test("aborts a stalled browser video upload instead of leaving its promise pending", async () => {
    const { uploadWorkoutPerformanceVideo } = await syncModule;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted.", "AbortError")),
          { once: true },
        );
      })) as typeof fetch;

    try {
      const controller = new AbortController();
      const upload = uploadWorkoutPerformanceVideo(
        new File(["video"], "stalled.mp4", { type: "video/mp4" }),
        { workoutId: "day-b", exerciseId: "ex-stalled" },
        { signal: controller.signal },
      );
      controller.abort();

      await expect(upload).rejects.toThrow("video upload timed out");
      expect(storageCalls).toContainEqual(
        expect.objectContaining({
          bucket: "workout-videos",
          action: "createSignedUploadUrl",
        }),
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("role and assignment migration contract", () => {
  const migration35 = readFileSync(
    fileURLToPath(
      new URL("../../supabase/migrations/35_workout_performance_videos.sql", import.meta.url),
    ),
    "utf8",
  );
  const migration27 = readFileSync(
    fileURLToPath(
      new URL("../../supabase/migrations/27_owner_coach_sync_hardening.sql", import.meta.url),
    ),
    "utf8",
  );

  test("keeps workout videos private and scopes every storage operation", () => {
    expect(migration35).toContain("VALUES ('workout-videos', 'workout-videos', false)");
    expect(migration35).toContain("ON CONFLICT (id) DO UPDATE SET public = false");
    expect(migration35).toContain(
      'CREATE POLICY "Trainees and assigned coaches can view workout videos"',
    );
    expect(migration35).toContain("ON storage.objects FOR SELECT TO authenticated");
    expect(migration35).toContain("public.is_coach_of");
    expect(migration35).toContain("owner_id = (select auth.uid()::text)");
    expect(migration35).toContain("(storage.foldername(name))[1] = (select auth.uid()::text)");
    expect(migration35).toContain('DROP POLICY IF EXISTS "Public Access"');
    expect(migration35).not.toContain("public = true");
  });

  const migration28 = readFileSync(
    fileURLToPath(
      new URL("../../supabase/migrations/28_role_assignment_change_cleanup.sql", import.meta.url),
    ),
    "utf8",
  );

  test("owner assignment accepts only an approved client and coach or owner", () => {
    const assignClient = migration27.slice(
      migration27.indexOf("FUNCTION public.assign_client_to_coach"),
      migration27.indexOf(
        "DROP POLICY IF EXISTS",
        migration27.indexOf("FUNCTION public.assign_client_to_coach"),
      ),
    );
    expect(assignClient).toContain("IF NOT public.is_owner()");
    expect(assignClient).toContain("role IN ('coach', 'owner')");
    expect(assignClient).toContain("role = 'client'");
    expect(assignClient).toContain("approval_status = 'approved'");
  });

  test("direct coach linking rejects a second coach and updates both assignment directions", () => {
    const linkClient = migration27.slice(
      migration27.indexOf("FUNCTION public.link_client_to_current_coach"),
      migration27.indexOf("CREATE OR REPLACE FUNCTION public.change_user_role"),
    );
    expect(linkClient).toContain("IF NOT public.is_current_user_coach()");
    expect(linkClient).toContain("coach_id <> auth.uid()");
    expect(linkClient).toContain("INSERT INTO public.coach_clients");
    expect(linkClient).toContain("SET coach_id = auth.uid()");
  });

  test("reassignment removes the old reverse link before inserting the new one", () => {
    const assignClient = migration27.slice(
      migration27.indexOf("FUNCTION public.assign_client_to_coach"),
      migration27.indexOf(
        "DROP POLICY IF EXISTS",
        migration27.indexOf("FUNCTION public.assign_client_to_coach"),
      ),
    );
    expect(assignClient).toContain(
      "DELETE FROM public.coach_clients WHERE client_id = target_client_id",
    );
    expect(assignClient).toContain("VALUES (new_coach_id, target_client_id)");
    expect(assignClient).toContain("SET coach_id = new_coach_id");
  });

  test("coach-to-client role changes clear stale links in either direction", () => {
    expect(migration28).toContain("IF NOT public.is_owner()");
    expect(migration28).toContain("new_role NOT IN ('coach', 'client')");
    expect(migration28).toContain("SET coach_id = NULL");
    expect(migration28).toContain("WHERE coach_id = target_user_id");
    expect(migration28).toContain("WHERE coach_id = target_user_id");
    expect(migration28).toContain("WHERE coach_id = target_user_id");
    expect(migration28).toContain("DELETE FROM public.coach_clients");
    expect(migration28).toContain("WHERE coach_id = target_user_id");
    expect(migration28).toContain("OR client_id = target_user_id");
    expect(migration28).toContain("SET role = new_role");
  });
});

describe("explicit deletion and optional sync contracts", () => {
  const syncSource = readFileSync(
    fileURLToPath(new URL("./supabase-sync.ts", import.meta.url)),
    "utf8",
  );

  test("never infers cloud deletion from a missing local snapshot row", () => {
    expect(syncSource).not.toContain("deleteRowsMissingFromLocal");
    expect(syncSource).toContain("deleteRowsExplicitlyDeleted");
    expect(syncSource).toContain("deletedFoodIds");
    expect(syncSource).toContain("deletedBodyWeightLogDates");
    expect(syncSource).toContain("deletedSessionIds");
    expect(syncSource).toContain("deletedNutritionDayIds");
  });

  test("optional sync blocks only skip confirmed missing tables", () => {
    const customExercisesBlock = syncSource.slice(
      syncSource.indexOf("// 2. Custom Exercises"),
      syncSource.indexOf("// 3. Programs & Program Days"),
    );
    const recipesBlock = syncSource.slice(
      syncSource.indexOf("// 6b. Personal recipe library"),
      syncSource.indexOf("// 7. Food Favorites"),
    );

    expect(customExercisesBlock).toContain("isMissingTableInSchemaCache");
    expect(customExercisesBlock).toContain("throw error");
    expect(recipesBlock).toContain("isMissingTableInSchemaCache");
    expect(recipesBlock).toContain("throw error");
  });
});
