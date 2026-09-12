---
name: iOS Preview bootstrap
description: Why the GymTrack Vite preview must avoid the production Service Worker during client startup
---

Vite development previews must not register the production Service Worker. The development server serves a live SSR shell and changing module graph, while a cache-first app shell can preserve an older HTML/module combination and leave iOS Safari on the server-rendered loading screen before hydration.

**Why:** Real iOS Safari exposed a stale-shell failure that the controlled release tests did not reproduce. Production assets have stable hashed URLs, but Vite development modules do not.

**How to apply:** Keep offline Service Worker registration behind the production check. When diagnosing a stuck preview, verify the live HTML and use a cache-busting navigation before changing authentication or profile hydration.

When the loading UI itself changes, bump both the Service Worker cache name and the boot script query version. The early boot watchdog must be able to update the pre-hydration shell without waiting for React.

**Why:** A browser can keep serving an older cached HTML shell and watchdog script even while the live dev server exposes the corrected source, making a fixed loading cycle appear unchanged.

**How to apply:** Verify the live HTML references the new watchdog version and verify the live Service Worker exposes the new cache name before diagnosing the rotation logic again.