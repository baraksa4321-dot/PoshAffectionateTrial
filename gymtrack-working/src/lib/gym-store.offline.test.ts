// The standalone package is executed by Bun; its runtime matcher types are
// supplied by Bun rather than the browser TypeScript environment.
import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { CoachMessage, GymData } from "./gym-types";

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

  test("hydrates every coach-trainee collection on a fresh device", async () => {
    Object.assign(navigator, { onLine: true });
    const remoteData = makeSessionData({
      weight: 72,
      role: "client",
      coachId: "coach-a",
      approvalStatus: "approved",
    });
    remoteData.programs = [
      { id: "program-remote", name: "תוכנית מרחוק", notes: "", dayIds: ["day-remote"] },
    ];
    remoteData.workouts = [
      { id: "day-remote", name: "אימון מרחוק", notes: "", items: [] },
    ];
    remoteData.challenges = [
      {
        id: "challenge-remote",
        ownerId: "coach-a",
        title: "אתגר מרחוק",
        description: "אתגר בדיקה",
        category: "כוח",
        difficulty: "מתחילים",
        durationLabel: "שבוע",
        accent: "sage",
        sessions: [],
        isPublished: true,
        isBuiltIn: false,
      },
    ];
    remoteData.history = [
      {
        id: "session-remote",
        workoutId: "day-remote",
        workoutName: "אימון מרחוק",
        programName: "תוכנית מרחוק",
        date: "2026-08-26T08:00:00.000Z",
        durationSec: 1_800,
        entries: [],
        notes: "בוצע",
      },
    ];
    remoteData.nutritionDays = [
      {
        id: "nutrition-remote",
        date: "2026-08-26",
        meals: [{ id: "meal-logged", name: "ארוחת בוקר", foods: [] }],
      },
    ];
    remoteData.nutritionTargets = { calories: 1_900 };
    remoteData.plannedMeals = [{ id: "meal-planned", name: "תפריט מאמן", foods: [] }];
    remoteData.bodyWeightLogs = [{ id: "weight-remote", date: "2026-08-26", weight: 72 }];
    remoteData.bodyMeasurements = [
      { id: "measurement-remote", date: "2026-08-26", waistCm: 80 },
    ];
    remoteData.cardioLogs = [
      {
        id: "cardio-remote",
        date: "2026-08-26",
        type: "הליכון",
        durationMin: 30,
        intensity: "moderate",
        calories: 220,
      },
    ];
    remoteData.habits = [
      {
        id: "habit-remote",
        date: "2026-08-26",
        steps: 8_000,
        stepsTarget: 10_000,
        weighInDone: true,
        workoutDone: true,
        busyDayMode: false,
      },
    ];
    remoteData.coachMessages = [
      {
        id: "message-remote",
        coachId: "coach-a",
        clientId: "user-a",
        message: "כל הכבוד",
        createdAt: "2026-08-26T09:00:00.000Z",
        isRead: false,
      },
    ];

    pullImplementation = async () => ({
      success: true,
      data: remoteData as unknown as Record<string, unknown>,
    });

    const store = await loadStore("fresh-device-all-flows");
    authenticate();
    await eventually(
      () =>
        store.getGymStoreSnapshot().userProfile.role === "client" &&
        store.getGymStoreSnapshot().programs[0]?.id === "program-remote",
    );

    const snapshot = store.getGymStoreSnapshot();
    expect(snapshot.userProfile.coachId).toBe("coach-a");
    expect(snapshot.programs[0]?.name).toBe("תוכנית מרחוק");
    expect(snapshot.workouts[0]?.name).toBe("אימון מרחוק");
    expect(
      snapshot.challenges.some((challenge: { id?: string }) => challenge.id === "challenge-remote"),
    ).toBe(true);
    expect(snapshot.history[0]?.id).toBe("session-remote");
    expect(snapshot.nutritionDays[0]?.meals[0]?.name).toBe("ארוחת בוקר");
    expect(snapshot.nutritionTargets).toEqual({ calories: 1_900 });
    expect(snapshot.plannedMeals[0]?.name).toBe("תפריט מאמן");
    expect(snapshot.bodyWeightLogs[0]?.weight).toBe(72);
    expect(snapshot.bodyMeasurements[0]?.waistCm).toBe(80);
    expect(snapshot.cardioLogs[0]?.durationMin).toBe(30);
    expect(snapshot.habits[0]?.workoutDone).toBe(true);
    expect(snapshot.coachMessages[0]?.message).toBe("כל הכבוד");
  });

  test("keeps a received coach message visible after offline reload and refreshes it once", async () => {
    Object.assign(navigator, { onLine: true });
    const remoteData = makeSessionData({
      weight: 72,
      role: "client",
      coachId: "coach-a",
      approvalStatus: "approved",
    });
    remoteData.coachMessages = [
      {
        id: "received-message",
        coachId: "coach-a",
        clientId: "user-a",
        message: "הודעה שנשמרה למתאמנת",
        createdAt: "2026-08-26T09:00:00.000Z",
        isRead: false,
      },
    ];
    let remotePullCount = 0;
    pullImplementation = async (_userId, _localState) => {
      remotePullCount += 1;
      return { success: true, data: remoteData as unknown as Record<string, unknown> };
    };

    const firstStore = await loadStore("received-message-online");
    authenticate();
    await eventually(
      () => firstStore.getGymStoreSnapshot().coachMessages?.[0]?.message === "הודעה שנשמרה למתאמנת",
    );
    expect(JSON.parse(storage.get("gymtrack.v1.user.user-a") ?? "{}").coachMessages).toHaveLength(
      1,
    );

    const pullsBeforeOfflineReload = remotePullCount;
    Object.assign(navigator, { onLine: false });
    const reloadedStore = await loadStore("received-message-offline-reload");
    authenticate();
    await eventually(
      () =>
        reloadedStore.getGymStoreSyncStatus() === "offline" &&
        reloadedStore.getGymStoreSnapshot().coachMessages?.[0]?.message === "הודעה שנשמרה למתאמנת",
    );
    expect(remotePullCount).toBe(pullsBeforeOfflineReload);
    expect(reloadedStore.getGymStoreSnapshot().coachMessages).toHaveLength(1);

    await new Promise((resolve) => setTimeout(resolve, 0));
    Object.assign(navigator, { onLine: true });
    emit("online");
    await eventually(() => remotePullCount > pullsBeforeOfflineReload);
    expect(reloadedStore.getGymStoreSnapshot().coachMessages?.[0]?.message).toBe(
      "הודעה שנשמרה למתאמנת",
    );
    expect(reloadedStore.getGymStoreSnapshot().coachMessages).toHaveLength(1);
  });

  test("deduplicates coach messages by ID and keeps the newest duplicate during reconnect", async () => {
    Object.assign(navigator, { onLine: true });
    const initialMessage = {
      id: "repeated-message",
      coachId: "coach-a",
      clientId: "user-a",
      message: "נוסח ישן",
      createdAt: "2026-08-26T09:00:00.000Z",
      isRead: false,
    };
    const distinctMessage = {
      id: "distinct-message",
      coachId: "coach-a",
      clientId: "user-a",
      message: "הודעה אחרת",
      createdAt: "2026-08-26T08:00:00.000Z",
      isRead: false,
    };
    const newerMessage = {
      ...initialMessage,
      message: "נוסח מעודכן",
      createdAt: "2026-08-26T10:00:00.000Z",
      isRead: true,
    };
    let pullCount = 0;
    pullImplementation = async (_userId, localState) => {
      pullCount += 1;
      if (pullCount === 1) {
        return {
          success: true,
          data: {
            ...localState,
            coachMessages: [initialMessage],
          },
        };
      }
      return {
        success: true,
        data: {
          ...localState,
          coachMessages: [distinctMessage, initialMessage, newerMessage],
        },
      };
    };

    const store = await loadStore("dedupe-coach-messages");
    authenticate();
    await eventually(() => store.getGymStoreSnapshot().coachMessages?.length === 1);

    Object.assign(navigator, { onLine: false });
    store.addChecklistItem("שינוי מקומי לפני reconnect");
    await eventually(() => store.getGymStoreSyncStatus() === "offline");

    await new Promise((resolve) => setTimeout(resolve, 0));
    Object.assign(navigator, { onLine: true });
    store.refreshCurrentUserData(true);
    await eventually(
      () =>
        pullCount > 1 &&
        store
          .getGymStoreSnapshot()
          .coachMessages?.some(
            (message: CoachMessage) =>
              message.id === "repeated-message" && message.message === "נוסח מעודכן",
          ) === true,
    );

    const messages: CoachMessage[] = store.getGymStoreSnapshot().coachMessages;
    expect(messages).toHaveLength(2);
    expect(messages.filter((message) => message.id === "repeated-message")).toHaveLength(1);
    expect(messages.find((message) => message.id === "repeated-message")?.isRead).toBe(true);
    expect(messages.find((message) => message.id === "distinct-message")?.message).toBe(
      "הודעה אחרת",
    );
  });

  test("keeps a cached broadcast visible through offline reload and reconnect", async () => {
    Object.assign(navigator, { onLine: true });
    const broadcast = {
      id: "broadcast-remote",
      senderId: "coach-a",
      audience: "clients" as const,
      message: "הודעת תפוצה חשובה",
      createdAt: "2026-08-26T11:00:00.000Z",
    };
    let pullCount = 0;
    pullImplementation = async (_userId, localState) => {
      pullCount += 1;
      return {
        success: true,
        data: {
          ...localState,
          broadcasts: [broadcast],
        },
      };
    };

    const firstStore = await loadStore("broadcast-online");
    authenticate();
    await eventually(
      () => firstStore.getGymStoreSnapshot().broadcasts?.[0]?.message === "הודעת תפוצה חשובה",
    );
    expect(JSON.parse(storage.get("gymtrack.v1.user.user-a") ?? "{}").broadcasts).toHaveLength(1);

    const pullsBeforeOfflineReload = pullCount;
    Object.assign(navigator, { onLine: false });
    const reloadedStore = await loadStore("broadcast-offline-reload");
    authenticate();
    await eventually(
      () =>
        reloadedStore.getGymStoreSyncStatus() === "offline" &&
        reloadedStore.getGymStoreSnapshot().broadcasts?.[0]?.message === "הודעת תפוצה חשובה",
    );
    expect(pullCount).toBe(pullsBeforeOfflineReload);
    expect(reloadedStore.getGymStoreSnapshot().broadcasts).toHaveLength(1);

    reloadedStore.addChecklistItem("שינוי מקומי לפני reconnect");
    await new Promise((resolve) => setTimeout(resolve, 0));
    Object.assign(navigator, { onLine: true });
    reloadedStore.refreshCurrentUserData(true);
    await eventually(() => pullCount > pullsBeforeOfflineReload);
    expect(reloadedStore.getGymStoreSnapshot().broadcasts).toHaveLength(1);
    expect(reloadedStore.getGymStoreSnapshot().broadcasts?.[0]?.message).toBe(
      "הודעת תפוצה חשובה",
    );
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

  test("keeps challenge enrollment and generated workout after offline reload", async () => {
    const challenge = {
      id: "challenge-offline",
      title: "אתגר שנשמר offline",
      description: "אתגר בדיקה שנשאר זמין בלי חיבור",
      category: "מיומנות" as const,
      difficulty: "מתחילים" as const,
      durationLabel: "שבוע",
      accent: "peach" as const,
      isBuiltIn: true,
      isPublished: true,
      sessions: [
        {
          id: "challenge-offline-session",
          name: "אימון האתגר",
          notes: "אימון בדיקה",
          items: [],
        },
      ],
    };
    const cachedData = makeSessionData({ weight: 70, role: "client" });
    cachedData.challenges = [challenge];
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(cachedData));

    const firstStore = await loadStore("challenge-offline-first-device");
    authenticate();
    await eventually(() =>
      firstStore
        .getGymStoreSnapshot()
        .challenges.some((item: { id?: string }) => item.id === "challenge-offline"),
    );

    const enrolled = firstStore.enrollInChallenge("challenge-offline");
    expect(enrolled?.alreadyActive).toBe(false);
    expect(enrolled?.workout.id).toMatch(/^challenge-run-/);
    expect(firstStore.getGymStoreSnapshot().challengeEnrollments).toHaveLength(1);
    expect(firstStore.getGymStoreSnapshot().workouts[0]?.id).toMatch(/^challenge-run-/);

    const repeatedEnrollment = firstStore.enrollInChallenge("challenge-offline");
    expect(repeatedEnrollment?.alreadyActive).toBe(true);
    expect(repeatedEnrollment?.enrollment.id).toBe(enrolled?.enrollment.id);
    expect(repeatedEnrollment?.workout.id).toBe(enrolled?.workout.id);
    expect(firstStore.getGymStoreSnapshot().challengeEnrollments).toHaveLength(1);
    expect(firstStore.getGymStoreSnapshot().workouts).toHaveLength(1);

    firstStore.saveSession({
      id: "challenge-offline-completion",
      workoutId: enrolled!.workout.id,
      workoutName: enrolled!.workout.name,
      programName: "",
      date: "2026-08-26T10:00:00.000Z",
      durationSec: 900,
      entries: [],
      notes: "הושלם offline",
    });
    expect(firstStore.getGymStoreSnapshot().history).toHaveLength(1);
    expect(firstStore.getGymStoreSnapshot().history[0]?.workoutId).toBe(enrolled?.workout.id);
    expect(syncCalls).toHaveLength(0);

    // The original tab is gone when the next device/tab opens. Reset its
    // singleton so only the reloaded device can respond to reconnect.
    firstStore.resetGymStoreForTests();
    const reloadedStore = await loadStore("challenge-offline-reload");
    authenticate();
    await eventually(() => reloadedStore.getGymStoreSnapshot().challengeEnrollments.length === 1);

    const reloadedSnapshot = reloadedStore.getGymStoreSnapshot();
    expect(reloadedSnapshot.challengeEnrollments[0]?.challengeId).toBe("challenge-offline");
    expect(reloadedSnapshot.workouts).toHaveLength(1);
    expect(reloadedSnapshot.workouts[0]?.id).toBe(
      reloadedSnapshot.challengeEnrollments[0]?.workoutIds[0],
    );
    expect(reloadedSnapshot.history).toHaveLength(1);
    expect(reloadedSnapshot.history[0]?.id).toBe("challenge-offline-completion");
    expect(reloadedSnapshot.history[0]?.workoutId).toBe(reloadedSnapshot.workouts[0]?.id);
    expect(reloadedStore.getGymStoreSyncStatus()).toBe("offline");

    emit("online");
    await eventually(() => syncCalls.length > 0);
    await eventually(() => reloadedStore.getGymStoreSyncStatus() === "synced");
    reloadedStore.refreshCurrentUserData(true);
    await eventually(() => pullCalls.length > 0);

    const uploaded = syncCalls[syncCalls.length - 1]?.localData as
      | {
          programs?: unknown[];
          challengeEnrollments?: Array<{ challengeId?: string }>;
          workouts?: Array<{ id?: string }>;
          history?: Array<{ id?: string; workoutId?: string }>;
        }
      | undefined;
    expect(uploaded?.["programs"]).toEqual([]);
    expect(uploaded?.["challengeEnrollments"]?.some((item) => item.challengeId === "challenge-offline")).toBe(
      true,
    );
    expect(uploaded?.["workouts"]?.some((item) => item.id?.startsWith("challenge-run-"))).toBe(true);
    expect(uploaded?.["history"]).toEqual([
      expect.objectContaining({
        id: "challenge-offline-completion",
        workoutId: reloadedSnapshot.workouts[0]?.id,
      }),
    ]);

    const afterReconnect = reloadedStore.getGymStoreSnapshot();
    expect(afterReconnect.challengeEnrollments).toHaveLength(1);
    expect(afterReconnect.workouts).toHaveLength(1);
    expect(afterReconnect.history).toHaveLength(1);
    expect(afterReconnect.history[0]?.id).toBe("challenge-offline-completion");
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

  test("does not allow cached coach access to edit targets before live role hydration", async () => {
    Object.assign(navigator, { onLine: true });
    const pull = deferred<{ success: true; data: Record<string, unknown> }>();
    storage.set(
      "gymtrack.v1.user.user-a",
      JSON.stringify({
        ...cachedClientData,
        userProfile: { weight: 80, role: "coach" },
        nutritionTargets: { calories: 2_000 },
      }),
    );
    pullImplementation = async () => pull.promise;

    const store = await loadStore("cached-coach-target-guard");
    authenticate();
    await eventually(() => pullCalls.length > 0);

    store.saveNutritionTargets({ calories: 999 });
    expect(store.getGymStoreSnapshot().nutritionTargets).toEqual({ calories: 2_000 });

    pull.resolve({
      success: true,
      data: {
        ...cachedClientData,
        userProfile: { weight: 80, role: "client" },
        nutritionTargets: { calories: 1_800 },
      },
    });
    await eventually(() => store.getGymStoreSnapshot().userProfile.role === "client");
    expect(store.getGymStoreSnapshot().nutritionTargets).toEqual({ calories: 1_800 });
  });

  test("does not restore target-edit access from a stale coach cache during a client conflict", async () => {
    Object.assign(navigator, { onLine: true });
    const localData = makeSessionData({ weight: 80, role: "coach" });
    localData.programs = [{ id: "program-local", name: "Local plan", notes: "", dayIds: [] }];
    localData.nutritionTargets = { calories: 2_000 };
    storage.set("gymtrack.v1.user.user-a", JSON.stringify(localData));
    const pull = deferred<{ success: true; data: Record<string, unknown> }>();
    pullImplementation = async () => pull.promise;

    const store = await loadStore("stale-coach-conflict");
    authenticate();
    await eventually(() => pullCalls.length > 0);
    store.saveProgram({ id: "program-local", name: "Local edit", notes: "", dayIds: [] });

    pull.resolve({
      success: true,
      data: {
        ...localData,
        userProfile: { weight: 80, role: "client" },
        programs: [{ id: "program-remote", name: "Remote plan", notes: "", dayIds: [] }],
        nutritionTargets: { calories: 1_800 },
      },
    });
    await eventually(() => store.getGymStoreSyncStatus() === "conflict");

    store.saveNutritionTargets({ calories: 999 });
    expect(store.getGymStoreSnapshot().nutritionTargets).toEqual({ calories: 2_000 });
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

  test("drains the final plan state after a burst during an in-flight refresh", async () => {
    Object.assign(navigator, { onLine: true });
    const pendingSync = deferred<{ success: true }>();
    const pendingRefresh = deferred<void>();
    syncImplementation = async () => pendingSync.promise;

    const initialData = makeSessionData({ weight: 70, role: "client" });
    initialData.programs = [
      { id: "program-a", name: "Initial plan", notes: "", dayIds: ["day-a"] },
    ];
    initialData.workouts = [{ id: "day-a", name: "Initial workout", notes: "", items: [] }];
    initialData.plannedMeals = [{ id: "meal-a", name: "Initial menu", foods: [] }];

    const intermediateData: GymData = {
      ...initialData,
      programs: [{ id: "program-a", name: "Intermediate plan", notes: "", dayIds: ["day-a"] }],
      workouts: [{ id: "day-a", name: "Intermediate workout", notes: "", items: [] }],
      plannedMeals: [{ id: "meal-a", name: "Intermediate menu", foods: [] }],
    };
    const finalData: GymData = {
      ...initialData,
      programs: [{ id: "program-a", name: "Final plan", notes: "", dayIds: ["day-a"] }],
      workouts: [{ id: "day-a", name: "Final workout", notes: "", items: [] }],
      plannedMeals: [{ id: "meal-a", name: "Final menu", foods: [] }],
    };

    let pullCount = 0;
    let remoteData: GymData = initialData;
    pullImplementation = async (_userId, _localState) => {
      pullCount += 1;
      const response = remoteData;
      if (pullCount === 2) await pendingRefresh.promise;
      return { success: true, data: response as unknown as Record<string, unknown> };
    };

    const store = await loadStore("realtime-plan-burst");
    await eventually(() => pullCount === 1 && store.getGymStoreSnapshot().programs[0]?.name === "Initial plan");

    store.addChecklistItem("Keep this local edit");
    await eventually(() => syncCalls.length === 1);

    remoteData = intermediateData;
    emitPlanChange("user-a", "program_days");
    pendingSync.resolve({ success: true });
    await eventually(() => pullCount === 2);

    remoteData = finalData;
    emitPlanChange("user-a", "programs");
    emitPlanChange("user-a", "program_days");
    emitPlanChange("user-a", "profiles");
    pendingRefresh.resolve();

    await eventually(
      () =>
        pullCount >= 3 &&
        store.getGymStoreSnapshot().programs[0]?.name === "Final plan" &&
        store.getGymStoreSnapshot().workouts[0]?.name === "Final workout" &&
        store.getGymStoreSnapshot().plannedMeals[0]?.name === "Final menu",
    );
    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Keep this local edit");
  });

  test("keeps a trainee edit made during refresh while applying the remote plan", async () => {
    Object.assign(navigator, { onLine: true });
    const pendingRefresh = deferred<void>();
    const pendingSync = deferred<{ success: true }>();
    syncImplementation = async () => pendingSync.promise;

    const initialData = makeSessionData({ weight: 70, role: "client" });
    initialData.programs = [
      { id: "program-a", name: "Initial plan", notes: "", dayIds: ["day-a"] },
    ];
    initialData.workouts = [{ id: "day-a", name: "Initial workout", notes: "", items: [] }];
    initialData.plannedMeals = [{ id: "meal-a", name: "Initial menu", foods: [] }];

    const finalData: GymData = {
      ...initialData,
      programs: [{ id: "program-a", name: "Remote plan", notes: "", dayIds: ["day-a"] }],
      workouts: [{ id: "day-a", name: "Remote workout", notes: "", items: [] }],
      plannedMeals: [{ id: "meal-a", name: "Remote menu", foods: [] }],
    };

    let pullCount = 0;
    let remoteData: GymData = initialData;
    pullImplementation = async (_userId, _localState) => {
      pullCount += 1;
      const response = remoteData;
      if (pullCount === 2) await pendingRefresh.promise;
      return { success: true, data: response as unknown as Record<string, unknown> };
    };

    const store = await loadStore("local-edit-during-refresh");
    await eventually(() => pullCount === 1 && store.getGymStoreSnapshot().programs[0]?.name === "Initial plan");

    store.refreshCurrentUserData(true);
    await eventually(() => pullCount === 2);

    remoteData = finalData;
    store.addChecklistItem("Edit made while coach update was loading");
    await eventually(() => syncCalls.length === 1);
    emitPlanChange("user-a", "program_days");
    pendingSync.resolve({ success: true });
    pendingRefresh.resolve();

    await eventually(
      () =>
        pullCount >= 3 &&
        store.getGymStoreSnapshot().programs[0]?.name === "Remote plan" &&
        store.getGymStoreSnapshot().workouts[0]?.name === "Remote workout" &&
        store.getGymStoreSnapshot().plannedMeals[0]?.name === "Remote menu" &&
        store.getGymStoreSnapshot().preExitChecklist[0]?.label ===
          "Edit made while coach update was loading",
    );
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

  test("restores the device notification preference after a store reload", async () => {
    Object.assign(navigator, { onLine: true });
    pullImplementation = async (_userId, localState) => ({
      success: true,
      data: {
        ...localState,
        userProfile: {
          ...(localState["userProfile"] as Record<string, unknown>),
          role: "client",
        },
      },
    });
    const store = await loadStore("notification-preference-reload");
    await eventually(() => store.getGymStoreSyncStatus() === "synced");

    store.saveReminderPreferences({
      enabled: true,
      deliveryState: "ready",
      deliveryDetail: "ready on this device",
    });
    expect(store.getGymStoreSnapshot().reminderPreferences?.enabled).toBe(true);
    expect(storage.get("gymtrack.v1.reminders.user-a")).toContain('"enabled":true');

    store.resetGymStoreForTests();
    store.subscribeGymStore(() => undefined);
    authenticate();
    await eventually(() => store.getGymStoreSnapshot().reminderPreferences?.enabled === true);
  });

  test("enables notifications by default while preserving an explicit opt-out", async () => {
    Object.assign(navigator, { onLine: true });
    pullImplementation = async (_userId, localState) => ({
      success: true,
      data: {
        ...localState,
        userProfile: {
          ...(localState["userProfile"] as Record<string, unknown>),
          role: "client",
        },
      },
    });

    const store = await loadStore("notification-preference-default");
    await eventually(() => store.getGymStoreSyncStatus() === "synced");
    expect(store.getGymStoreSnapshot().reminderPreferences?.enabled).toBe(true);

    store.saveReminderPreferences({
      enabled: false,
      deliveryState: "paused",
    });
    expect(store.getGymStoreSnapshot().reminderPreferences?.enabled).toBe(false);
    expect(storage.get("gymtrack.v1.reminders.user-a")).toContain('"enabled":false');
  });
});
