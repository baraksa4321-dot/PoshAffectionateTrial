const CACHE_NAME = "myroutine-app-shell-v9";

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
