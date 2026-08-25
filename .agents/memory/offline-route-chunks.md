---
name: Offline route chunks
description: Why the app must warm code-split route modules for reliable Safari offline navigation
---

The offline app shell must preload code-split route modules while online. Caching only the initial HTML document lets the first screen open in Airplane Mode, but in-app navigation can fail when a route's lazy JavaScript chunk was never fetched.

**Why:** TanStack Start emits separate JavaScript chunks for route pages, and Safari cannot recover a missing chunk while offline.

**How to apply:** Keep the Service Worker caching successful module requests and run a deferred route-module warmup after the first online paint. Bump the cache version when changing the worker's offline behavior.