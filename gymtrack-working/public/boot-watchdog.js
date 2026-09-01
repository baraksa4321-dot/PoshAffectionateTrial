(() => {
  const recoveryKey = "__myroutine_boot_recovery_v4";
  const isPreviewHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".replit.dev");
  const watchdogDelay = isPreviewHost ? 30_000 : 12_000;

  const navigateWithFreshShell = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("__myroutine_clean");
    url.searchParams.set("__myroutine_boot", "3");
    window.location.replace(url.toString());
  };

  window.setTimeout(async () => {
    if (window.__MY_ROUTINE_BOOTED__) return;

    const fallback = document.querySelector("[data-app-boot-fallback]");
    const manualRecovery = new URL(window.location.href).searchParams.has("__myroutine_clean");
    let shouldRetry = manualRecovery;
    try {
      shouldRetry =
        manualRecovery || window.sessionStorage.getItem(recoveryKey) !== "1";
      if (shouldRetry) window.sessionStorage.setItem(recoveryKey, "1");
      if (manualRecovery) window.sessionStorage.removeItem(recoveryKey);
    } catch {
      // A manual recovery link must still work when Safari blocks storage.
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
      navigateWithFreshShell();
      return;
    }

    if (fallback instanceof HTMLElement) fallback.hidden = false;
  }, watchdogDelay);
})();