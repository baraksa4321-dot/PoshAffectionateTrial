---
name: iOS Preview bootstrap
description: Why the GymTrack Vite preview must avoid the production Service Worker during client startup
---

Vite development previews must not register the production Service Worker. The development server serves a live SSR shell and changing module graph, while a cache-first app shell can preserve an older HTML/module combination and leave iOS Safari on the server-rendered loading screen before hydration.

**Why:** Real iOS Safari exposed a stale-shell failure that the controlled release tests did not reproduce. Production assets have stable hashed URLs, but Vite development modules do not.

**How to apply:** Keep offline Service Worker registration behind the production check. When diagnosing a stuck preview, verify the live HTML and use a cache-busting navigation before changing authentication or profile hydration.