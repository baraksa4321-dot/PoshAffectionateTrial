---
name: Rest timer background limits
description: Platform behavior and fallback policy for workout rest completion alerts.
---

Native Capacitor local notifications can schedule a rest completion alert while the app is backgrounded. Web/PWA closed-app delivery requires a durable server queue, a scheduled dispatcher, and an authenticated Web Push token; the service worker deadline remains only a best-effort fallback. Server dispatch is minute-granularity and browsers choose the system sound, not a custom sound.

**Why:** Browsers throttle or suspend timers, audio contexts, and notification APIs differently when a tab is hidden or a home-screen PWA is suspended. Claiming an exact background sound on every browser would be misleading.

**How to apply:** Persist the absolute end timestamp, reconcile expiry on foreground/resume, de-duplicate completion effects, and keep native scheduling separate from the browser queue. Treat cancellation races with an already accepted push as one possible in-flight alert; do not present browser audio or service-worker timers as hard guarantees.