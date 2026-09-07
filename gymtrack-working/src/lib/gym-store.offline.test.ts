// The standalone package is executed by Bun; its runtime matcher types are
// supplied by Bun rather than the browser TypeScript environment.
import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { GymData } from "./gym-types";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

const authListeners: Array<
  (event: string, session: { user: { id: string; email: string } } | null) => void
> = [];
const pullCalls: Array<{ userId: string; localState: Record<string, unknown> }> = [];
const syncCalls: Array<{ userId: string; localData: Record<string, unknown> }> = [];
type RealtimeHandler = { userId: string; table: string; callback: () => void };
const realtimeHandlers: RealtimeHandler[] = [];
const realtimeStatusCallbacks: Array<(status: string) => void> = [];
let nextSessionUser = { id: "user-a", email: "a@example.com" };
let pullImplementation: (
  userId: string,
  localState: Record<string, unknown>,
) => Promise<{ success: true; data: Record<string, unknown> }>;
let syncImplementation: () => Promise<{ success: true } | { success: false; error: string }>;

function makeSessionData(userProfile: NonNullable<GymData["userProfile"]>): GymData {
  return {
    exercises: [],
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
    coachMessages: [],
    broadcasts: [],
    cardioLogs: [],
    userProfile,
    clients: [],
    preExitChecklist: [],
  };
}

mock.module("./supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: { user: nextSessionUser } },
        error: null,
      }),
      onAuthStateChange: (
        listener: (event: string, session: { user: { id: string; email: string } } | null) => void,
      ) => {
        authListeners.push(listener);
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
    channel: (_name: string) => {
      const handlers: RealtimeHandler[] = [];
      const channel = {
        on: (_event: string, config: { table?: string; filter?: string }, callback: () => void) => {
          const match =
            config.filter?.match(/^id=eq\.(.+)$/) ?? config.filter?.match(/^user_id=eq\.(.+)$/);
          if (config.table) {
            const handler = { userId: match?.[1] ?? "*", table: config.table, callback };
            handlers.push(handler);
            realtimeHandlers.push(handler);
          }
          return channel;
        },
        subscribe: (callback?: (status: string) => void) => {
          if (callback) realtimeStatusCallbacks.push(callback);
          callback?.("SUBSCRIBED");
          return channel;
        },
      };
      return channel;
    },
    removeChannel: () => Promise.resolve("ok"),
  },
}));

mock.module("./supabase-sync", () => ({
  pullSupabaseData: async (userId: string, localState: Record<string, unknown>) => {
    pullCalls.push({ userId, localState });
    return pullImplementation(userId, localState);
  },
  syncLocalToSupabase: async (userId: string, localData: Record<string, unknown>) => {
    syncCalls.push({ userId, localData });
    return syncImplementation();
  },
}));

const storage = new Map<string, string>();
const eventListeners = new Map<string, Set<() => void>>();

Object.assign(globalThis, {
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  navigator: { onLine: false },
  window: {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    setTimeout,
    addEventListener: (type: string, listener: () => void) => {
      const listeners = eventListeners.get(type) ?? new Set();
      listeners.add(listener);
      eventListeners.set(type, listeners);
    },
  },
});

const cachedClientData = {
  userProfile: { weight: 80, role: "client" },
  preExitChecklist: [],
};

async function loadStore(suffix: string) {
  const store = await import(`./gym-store?${suffix}`);
  store.resetGymStoreForTests();
  store.subscribeGymStore(() => undefined);
  await Promise.resolve();
  return store;
}

function emit(type: string) {
  if (type === "online") Object.assign(navigator, { onLine: true });
  for (const listener of eventListeners.get(type) ?? []) listener();
}

function authenticate() {
  for (const listener of authListeners) {
    listener("SIGNED_IN", { user: { id: "user-a", email: "a@example.com" } });
  }
}

async function eventually(predicate: () => boolean) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("Timed out waiting for store state");
}

function emitPlanChange(userId: string, table: string) {
  for (const handler of realtimeHandlers) {
    if ((handler.userId === userId || handler.userId === "*") && handler.table === table) {
      handler.callback();
    }
  }
}

beforeEach(() => {
  storage.clear();
  pullCalls.length = 0;
  syncCalls.length = 0;
  authListeners.length = 0;
  realtimeHandlers.length = 0;
  realtimeStatusCallbacks.length = 0;
  nextSessionUser = { id: "user-a", email: "a@example.com" };
  eventListeners.clear();
  Object.assign(navigator, { onLine: false });
  pullImplementation = async (_userId, localState) => ({ success: true, data: localState });
  syncImplementation = async () => ({ success: true });
});

describe("offline store lifecycle", () => {
  test("loads only a trusted per-user cache while offline", async () => {
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(cachedClientData));
    storage.set("gymtrack.v1.pending.user-a", "true");

    const store = await loadStore("trusted-cache");
    authenticate();

    await eventually(() => store.getGymStoreSnapshot().userProfile.role === "client");
    expect(store.getGymStoreSnapshot().userProfile.weight).toBe(80);
    expect(store.getGymStoreSyncStatus()).toBe("offline");
    expect(pullCalls).toHaveLength(0);

    storage.set("gymtrack.v1", JSON.stringify({ userProfile: { role: "owner" } }));
    const otherStore = await loadStore("untrusted-shared-cache");
    expect(otherStore.getGymStoreSnapshot().userProfile.role).not.toBe("owner");
  });

  test("keeps an offline mutation after reload and uploads it on reconnect", async () => {
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(cachedClientData));
    const firstStore = await loadStore("offline-edit");
    authenticate();
    await eventually(() => firstStore.getGymStoreSyncStatus() === "offline");

    firstStore.addChecklistItem("Bring water");
    expect(JSON.parse(storage.get("gymtrack.v1.user.user-a")!).preExitChecklist).toHaveLength(1);

    const reloadedStore = await loadStore("after-reload");
    authenticate();
    await eventually(() => reloadedStore.getGymStoreSnapshot().preExitChecklist.length === 1);

    emit("online");
    await eventually(() => syncCalls.length > 0);
    expect(syncCalls[0]?.localData["preExitChecklist"]).toEqual([
      expect.objectContaining({ label: "Bring water" }),
    ]);
    await eventually(() => reloadedStore.getGymStoreSyncStatus() === "synced");
  });

  test("does not let a pull overwrite a newer local edit", async () => {
    Object.assign(navigator, { onLine: true });
    const pull = deferred<{ success: true; data: Record<string, unknown> }>();
    pullImplementation = async () => pull.promise;
    const store = await loadStore("revision-guard");
    await eventually(() => pullCalls.length > 0);

    store.addChecklistItem("Local edit wins");
    store.addMeal("2026-08-26", "Local trainee edit wins");
    pull.resolve({
      success: true,
      data: {
        ...cachedClientData,
        preExitChecklist: [{ id: "cloud", label: "Cloud edit" }],
        nutritionDays: [
          {
            id: "cloud-day",
            date: "2026-08-26",
            meals: [{ id: "cloud-meal", name: "Cloud edit", foods: [] }],
          },
        ],
      },
    });
    await eventually(() => store.getGymStoreSnapshot().preExitChecklist.length === 1);

    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Local edit wins");
    expect(store.getGymStoreSnapshot().nutritionDays[0]?.meals[0]?.name).toBe(
      "Local trainee edit wins",
    );
  });

  test("records a concurrent workspace conflict and allows selecting the remote snapshot", async () => {
    Object.assign(navigator, { onLine: true });
    const localData = makeSessionData({ weight: 82, role: "owner" });
    localData.programs = [{ id: "program-local", name: "Local plan", notes: "", dayIds: [] }];
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(localData));
    const pull = deferred<{ success: true; data: Record<string, unknown> }>();
    pullImplementation = async () => pull.promise;

    const store = await loadStore("workspace-conflict");
    await eventually(() => pullCalls.length > 0);
    store.saveProgram({ id: "program-local", name: "Local edit", notes: "", dayIds: [] });
    pull.resolve({
      success: true,
      data: {
        ...localData,
        programs: [{ id: "program-remote", name: "Remote edit", notes: "", dayIds: [] }],
      },
    });

    await eventually(() => store.getGymStoreSyncStatus() === "conflict");
    expect(store.getGymStoreSnapshot().programs[0]?.name).toBe("Local edit");
    expect(store.getGymStoreSnapshot().syncConflicts).toHaveLength(1);

    const conflictId = store.getGymStoreSnapshot().syncConflicts?.[0]?.id;
    expect(typeof conflictId).toBe("string");
    expect(store.resolveSyncConflict(conflictId!, "use-remote")).toBe(true);
    expect(store.getGymStoreSnapshot().programs[0]?.name).toBe("Remote edit");
    expect(store.getGymStoreSnapshot().syncConflicts?.[0]?.status).toBe("use-remote");
    expect(store.getGymStoreSyncStatus()).toBe("synced");
  });

  test("does not let a pending cached edit get overwritten on re-login", async () => {
    Object.assign(navigator, { onLine: true });
    storage.set(
      "gymtrack.v1.user.user-a",
      JSON.stringify({
        ...cachedClientData,
        preExitChecklist: [{ id: "local", label: "Keep this edit" }],
      }),
    );
    storage.set("gymtrack.v1.pending.user-a", "true");
    pullImplementation = async (_userId, _localState) => ({
      success: true,
      data: { ...cachedClientData, preExitChecklist: [{ id: "cloud", label: "Old cloud data" }] },
    });

    const store = await loadStore("pending-cache-wins");
    authenticate();

    await eventually(() => syncCalls.length > 0);
    expect(syncCalls[0]?.localData["preExitChecklist"]).toEqual([
      expect.objectContaining({ label: "Keep this edit" }),
    ]);
    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Keep this edit");
  });

  test("deduplicates duplicate reconnect events while sync is in flight", async () => {
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(cachedClientData));
    const sync = deferred<{ success: true }>();
    syncImplementation = async () => sync.promise;
    const store = await loadStore("duplicate-reconnect");
    authenticate();
    await eventually(() => store.getGymStoreSyncStatus() === "offline");
    store.addChecklistItem("One upload");

    emit("online");
    emit("online");
    await eventually(() => syncCalls.length === 1);
    sync.resolve({ success: true });
    await eventually(() => store.getGymStoreSyncStatus() === "synced");
    expect(syncCalls).toHaveLength(1);
  });

  test("keeps failed cloud writes pending and exposes an error status", async () => {
    Object.assign(navigator, { onLine: true });
    syncImplementation = async () => ({ success: false, error: "permission denied" });
    const store = await loadStore("failed-cloud-write");
    await eventually(() => pullCalls.length > 0);

    store.addChecklistItem("Keep pending");
    await eventually(() => store.getGymStoreSyncStatus() === "error");

    expect(storage.get("gymtrack.v1.pending.user-a")).toBe("true");
    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Keep pending");
  });

  test("refreshes an active trainee session after an authenticated coach changes the plan", async () => {
    Object.assign(navigator, { onLine: true });
    const pendingSync = deferred<{ success: true }>();
    syncImplementation = async () => pendingSync.promise;
    const coachData = makeSessionData({ weight: 82, role: "coach" });
    const traineeData = makeSessionData({ weight: 70, role: "client", coachId: "coach-a" });
    traineeData.programs = [
      { id: "program-trainee", name: "Old plan", notes: "", dayIds: ["day-trainee"] },
    ];
    traineeData.workouts = [{ id: "day-trainee", name: "Old workout", notes: "", items: [] }];
    traineeData.plannedMeals = [{ id: "meal-old", name: "Old menu", foods: [] }];
    const remoteData = new Map<string, Record<string, unknown>>([
      ["coach-a", coachData as unknown as Record<string, unknown>],
      ["trainee-a", traineeData as unknown as Record<string, unknown>],
    ]);
    pullImplementation = async (userId, localState) => ({
      success: true,
      data: remoteData.get(userId) ?? localState,
    });

    nextSessionUser = { id: "coach-a", email: "coach@example.com" };
    const coachStore = await loadStore("coach-active-session");
    await eventually(() => coachStore.getGymStoreSnapshot().userProfile.role === "coach");

    nextSessionUser = { id: "trainee-a", email: "trainee@example.com" };
    const traineeStore = await loadStore("trainee-active-session");
    await eventually(() => traineeStore.getGymStoreSnapshot().workouts[0]?.name === "Old workout");
    expect(coachStore.getGymStoreSnapshot().userProfile.role).toBe("coach");

    Object.assign(navigator, { onLine: false });
    traineeStore.addMeal("2026-08-26", "Local trainee draft");
    expect(traineeStore.getGymStoreSnapshot().nutritionDays[0]?.meals[0]?.name).toBe(
      "Local trainee draft",
    );

    const updatedTraineeData: GymData = {
      ...traineeData,
      programs: [
        { id: "program-trainee", name: "Updated plan", notes: "", dayIds: ["day-trainee"] },
      ],
      workouts: [{ id: "day-trainee", name: "Coach update", notes: "", items: [] }],
      plannedMeals: [{ id: "meal-new", name: "Updated menu", foods: [] }],
    };
    remoteData.set("trainee-a", updatedTraineeData as unknown as Record<string, unknown>);
    Object.assign(navigator, { onLine: true });
    emitPlanChange("trainee-a", "program_days");
    emitPlanChange("trainee-a", "profiles");

    await eventually(() => traineeStore.getGymStoreSnapshot().workouts[0]?.name === "Coach update");
    const refreshed = traineeStore.getGymStoreSnapshot();
    expect(refreshed.programs[0]?.name).toBe("Updated plan");
    expect(refreshed.plannedMeals[0]?.name).toBe("Updated menu");
    expect(refreshed.nutritionDays[0]?.meals[0]?.name).toBe("Local trainee draft");
    expect(traineeStore.getGymStoreSyncStatus()).toBe("syncing");
    pendingSync.resolve({ success: true });
    await eventually(() => traineeStore.getGymStoreSyncStatus() === "synced");
  });

  test("drains a queued realtime refresh after an in-flight local sync", async () => {
    Object.assign(navigator, { onLine: true });
    const pendingSync = deferred<{ success: true }>();
    syncImplementation = async () => pendingSync.promise;
    let pullCount = 0;
    const updatedData = makeSessionData({ weight: 70, role: "client" });
    updatedData.workouts = [{ id: "day-a", name: "Coach's latest workout", notes: "", items: [] }];
    pullImplementation = async (_userId, localState) => {
      pullCount += 1;
      return { success: true, data: pullCount === 1 ? localState : updatedData };
    };

    const store = await loadStore("queued-realtime-refresh");
    await eventually(() => pullCount === 1);
    store.addChecklistItem("Keep this local edit");
    await eventually(() => syncCalls.length === 1);

    emitPlanChange("user-a", "program_days");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(pullCount).toBe(1);

    pendingSync.resolve({ success: true });
    await eventually(
      () => store.getGymStoreSnapshot().workouts[0]?.name === "Coach's latest workout",
    );
    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Keep this local edit");
  });

  test("resubscribes after a realtime channel error", async () => {
    Object.assign(navigator, { onLine: true });
    pullImplementation = async (_userId, localState) => ({ success: true, data: localState });
    const store = await loadStore("realtime-reconnect");
    await eventually(() => store.getGymStoreSyncStatus() === "synced");
    expect(realtimeStatusCallbacks).toHaveLength(1);

    realtimeStatusCallbacks[0]?.("CHANNEL_ERROR");
    await new Promise((resolve) => setTimeout(resolve, 1_100));

    expect(realtimeStatusCallbacks.length).toBeGreaterThan(1);
  });
});
