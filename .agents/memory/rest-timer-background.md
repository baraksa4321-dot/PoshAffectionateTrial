---
name: Rest timer background limits
description: Platform behavior and fallback policy for workout rest completion alerts.
---

Native Capacitor local notifications can schedule a rest completion alert while the app is backgrounded. The Web/PWA path also hands the absolute deadline to the service worker for a best-effort closed-tab notification, but it still cannot guarantee exact background JavaScript execution or custom sound after the phone is locked; use the in-page Web Audio tone when active and a granted system notification as the web fallback.

**Why:** Browsers throttle or suspend timers, audio contexts, and notification APIs differently when a tab is hidden or a home-screen PWA is suspended. Claiming an exact background sound on every browser would be misleading.

**How to apply:** Persist the absolute end timestamp, reconcile expiry on foreground/resume, de-duplicate completion effects, and keep native scheduling separate from the browser fallback. A future reliable web solution needs a server/device push path or an explicitly supported background media strategy; do not present the service-worker timer as a hard guarantee.