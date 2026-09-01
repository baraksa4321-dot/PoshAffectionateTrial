(() => {
  const recoveryKey = "__myroutine_boot_recovery_v1";
  const isPreviewHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".replit.dev");
  const watchdogDelay = isPreviewHost ? 1_500 : 12_000;

  window.setTimeout(async () => {
    if (window.__MY_ROUTINE_BOOTED__) return;

    const fallback = document.querySelector("[data-app-boot-fallback]");
    let shouldRetry = false;
    try {
      shouldRetry = window.sessionStorage.getItem(recoveryKey) !== "1";
      if (shouldRetry) window.sessionStorage.setItem(recoveryKey, "1");
    } catch {
      shouldRetry = false;
    }

    if (shouldRetry) {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        }
      } catch {
        // The second boot attempt is still useful when storage APIs are blocked.
      }
      window.location.reload();
      return;
    }

    if (fallback instanceof HTMLElement) fallback.hidden = false;
  }, watchdogDelay);
})();