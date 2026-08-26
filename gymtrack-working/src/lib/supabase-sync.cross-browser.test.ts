import { beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  BodyMeasurement,
  GymData,
  HistorySession,
  NutritionDay,
  Program,
  Workout,
} from "./gym-types";

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

const emptyResult = (): QueryResult => ({ data: [], error: null });

function responseFor(table: string, action: QueryCall["action"]): QueryResult {
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
  queryCalls.length = 0;
}

beforeEach(resetResponses);

describe("cross-browser Supabase sync boundaries", () => {
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

  test("keeps coach and client data queries scoped to the requested client", async () => {
    setResponse("profiles", { id: "client-b", role: "client", weight_kg: 70 });
    setResponse("programs", []);
    setResponse("program_days", []);
    setResponse("nutrition_days", []);
    setResponse("body_measurements", []);
    setResponse("workout_sessions", []);
    setResponse("cardio_logs", []);

    const { pullClientDataForCoach, pullSupabaseData } = await syncModule;
    const coachResult = await pullClientDataForCoach("client-b");
    expect(coachResult.error).toBeUndefined();

    expect(hasFilter("profiles", "id", "client-b")).toBe(true);
    for (const table of [
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
    setResponse("body_weight_logs", []);
    setResponse("cardio_logs", []);
    setResponse("body_measurements", []);
    setResponse("client_habits", []);
    setResponse("custom_foods", []);
    setResponse("nutrition_days", []);
    setResponse("coach_recipes", []);
    setResponse("food_favorites", []);

    const accountResult = await pullSupabaseData("client-b", makeLocalData());
    expect(accountResult.success).toBe(true);
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

  test("writes every user-owned sync payload with the authenticated user id", async () => {
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
      ...makeLocalData({ weight: 70, role: "client" }),
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
});

describe("role and assignment migration contract", () => {
  const migration27 = readFileSync(
    fileURLToPath(
      new URL("../../supabase/migrations/27_owner_coach_sync_hardening.sql", import.meta.url),
    ),
    "utf8",
  );
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
