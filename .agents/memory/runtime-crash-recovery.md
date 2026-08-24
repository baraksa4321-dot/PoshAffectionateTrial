---
name: Runtime crash recovery
description: The app needs recovery coverage beyond React render errors.
---

Browser-level failures such as stale dynamic-import chunks and unhandled Promise rejections can leave an otherwise mounted app visually blank without reaching a React Error Boundary.

**Why:** The app uses route-level lazy assets and a Service Worker cache, so a stale or unavailable asset can fail outside the React tree.

**How to apply:** Keep a browser runtime guard around the root app. It should show a Hebrew recovery screen, and a clean reload may unregister the Service Worker and clear only browser caches while preserving application data.