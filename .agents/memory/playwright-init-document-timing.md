---
name: Playwright init document timing
description: Browser fixture initialization timing across WebKit and Chromium.
---

Browser init scripts can run before `document.documentElement` exists, especially in WebKit. Observe `document` or defer DOM observers instead of assuming the root element is ready.

**Why:** A boot-cache timing fixture failed before seeding auth and cache storage when its mutation observer targeted the not-yet-created document root.

**How to apply:** Keep storage/session setup independent of DOM observers, and attach early lifecycle observers to `document` when the test needs to measure first-render timing.