import { beforeEach, describe, expect, mock, test } from "bun:test";

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
let pullImplementation: (
  userId: string,
  localState: Record<string, unknown>,
) => Promise<{ success: true; data: Record<string, unknown> }>;
let syncImplementation: () => Promise<{ success: true }>;

mock.module("./supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "user-a", email: "a@example.com" } } },
        error: null,
      }),
      onAuthStateChange: (
        listener: (event: string, session: { user: { id: string; email: string } } | null) => void,
      ) => {
        authListeners.push(listener);
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
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

beforeEach(() => {
  storage.clear();
  pullCalls.length = 0;
  syncCalls.length = 0;
  authListeners.length = 0;
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
    expect(syncCalls[0]?.localData.preExitChecklist).toEqual([
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
    pull.resolve({
      success: true,
      data: { ...cachedClientData, preExitChecklist: [{ id: "cloud", label: "Cloud edit" }] },
    });
    await eventually(() => store.getGymStoreSnapshot().preExitChecklist.length === 1);

    expect(store.getGymStoreSnapshot().preExitChecklist[0]?.label).toBe("Local edit wins");
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
});
