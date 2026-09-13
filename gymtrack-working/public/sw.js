const CACHE_NAME = "myroutine-app-shell-v20";
const MAX_SEEN_PUSH_IDS = 100;
const seenPushIds = new Set();
const OFFLINE_BOOT_ASSETS = [
  "./myroutine-logo.png",
  "./brand-icon-192.png",
  "./loading/user-strawberry.png",
  "./loading/user-tomato.png",
  "./loading/user-character-01.png",
  "./loading/user-character-02.png",
  "./loading/user-character-03.png",
  "./loading/user-character-04.png",
  "./loading/user-character-05.png",
  "./loading/user-character-06.png",
  "./loading/user-character-07.png",
  "./loading/user-character-08.png",
  "./loading/user-character-09.png",
  "./loading/user-character-10.png",
  "./loading/user-lemon.png",
];

function openFirebaseConfigDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("gymtrack-notifications", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("config");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFirebaseConfig(config) {
  const database = await openFirebaseConfigDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction("config", "readwrite");
    transaction.objectStore("config").put(config, "firebase");
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function readFirebaseConfig() {
  const database = await openFirebaseConfigDb();
  const config = await new Promise((resolve, reject) => {
    const request = database.transaction("config").objectStore("config").get("firebase");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return config;
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "configure-firebase") return;
  event.waitUntil(
    saveFirebaseConfig(event.data.config)
      .then(() => event.ports?.[0]?.postMessage({ ok: true }))
      .catch((error) => {
        console.warn("[FCM service worker config]", error);
        event.ports?.[0]?.postMessage({ ok: false });
      }),
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
      const cache = await caches.open(CACHE_NAME);
      // The Preview app is served below the Service Worker's scope. Cache
      // that exact scope URL so a fresh Safari navigation has an HTML shell
      // available even when it is already in Airplane Mode.
      try {
        await cache.add(new URL("./", self.registration.scope).toString());
      } catch {
        // The normal fetch handler can populate the shell on the first
        // online visit if the proxy rejects the install-time request.
      }
      await Promise.all(
        OFFLINE_BOOT_ASSETS.map((asset) =>
          cache.add(new URL(asset, self.registration.scope).toString()).catch(() => undefined),
        ),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("myroutine-app-shell-") && key !== CACHE_NAME)
              .map((key) => caches.delete(key)),
          ),
        ),
    ]),
  );
});

function parsePushPayload(event) {
  if (!event.data) return null;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    try {
      payload = JSON.parse(event.data.text());
    } catch {
      return null;
    }
  }

  // Web tokens receive data-only FCM messages. Native tokens receive a
  // notification payload and must remain OS-owned, otherwise this handler
  // would show a second copy of the same notification.
  if (payload?.notification) return null;

  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!data || typeof data !== "object") return null;

  const title = typeof data.title === "string" ? data.title : "הודעה חדשה";
  const body = typeof data.body === "string" ? data.body : "";
  if (!body) return null;

  const messageId =
    (typeof payload.messageId === "string" && payload.messageId) ||
    (typeof payload.message_id === "string" && payload.message_id) ||
    `${title}:${body}:${String(data.deep_link || data.deepLink || data.url || "")}`;

  return { title, body, data, messageId };
}

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const payload = parsePushPayload(event);
      if (!payload || seenPushIds.has(payload.messageId)) return;

      seenPushIds.add(payload.messageId);
      if (seenPushIds.size > MAX_SEEN_PUSH_IDS) {
        seenPushIds.delete(seenPushIds.values().next().value);
      }

      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/icons/icon-192.png",
        dir: "rtl",
        lang: "he",
        tag: `gymtrack-${payload.messageId}`,
        data: payload.data,
      });
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      // A home-screen launch is a navigation request. If the shell is
      // available, return it immediately instead of waiting on a slow or
      // unavailable network connection. The request is still refreshed in
      // the background so the next launch receives the newest app shell.
      if (request.mode === "navigate" && cached) {
        event.waitUntil(
          fetch(request)
            .then(async (response) => {
              if (response.ok || response.type === "opaque") {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, response.clone());
              }
            })
            .catch(() => undefined),
        );
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        if (cached) return cached;
        if (request.mode === "navigate") {
          const scopeShell = await caches.match(self.registration.scope);
          return (
            scopeShell ??
            (await caches.match("/", { ignoreSearch: true })) ??
            new Response("Offline", { status: 503 })
          );
        }
        throw new Error("Offline and no cached app asset is available");
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationData = event.notification?.data ?? {};
  const fcmData = notificationData.FCM_MSG?.data ?? notificationData;
  const deepLink = fcmData.deep_link || fcmData.deepLink || fcmData.url || "";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      const target = deepLink
        ? new URL(deepLink, self.registration.scope).toString()
        : self.registration.scope;
      if (existing) {
        return existing.navigate(target).catch(() => existing.focus());
      }
      return self.clients.openWindow(target);
    }),
  );
});
