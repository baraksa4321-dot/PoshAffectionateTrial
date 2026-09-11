const CACHE_NAME = "myroutine-app-shell-v13";
let firebaseMessagingReady = false;

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

async function configureFirebase(config) {
  if (!config || firebaseMessagingReady) return;
  try {
    if (typeof firebase === "undefined") {
      importScripts(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
      );
    }
    if (typeof firebase === "undefined") return;
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      // FCM automatically displays notification payloads while the page is
      // backgrounded. Manually showing those again would create duplicates.
      if (payload.notification) return;
      const title = payload.notification?.title || "הודעה חדשה";
      const body = payload.notification?.body || "";
      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        dir: "rtl",
        lang: "he",
        data: payload.data || {},
      });
    });
    firebaseMessagingReady = true;
  } catch (error) {
    console.warn("[FCM service worker]", error);
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "configure-firebase") return;
  event.waitUntil(
    saveFirebaseConfig(event.data.config)
      .then(() => configureFirebase(event.data.config))
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
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      readFirebaseConfig()
        .then((config) => configureFirebase(config))
        .catch(() => undefined),
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
  const deepLink =
    event.notification?.data?.deep_link ||
    event.notification?.data?.deepLink ||
    event.notification?.data?.url ||
    "";
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
