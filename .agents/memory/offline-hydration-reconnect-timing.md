---
name: Offline hydration reconnect timing
description: Timing constraint for tests that simulate an offline reload followed by reconnect.
---

When a lifecycle test dispatches `online` immediately after observing the offline-ready state, yield one event-loop turn first so the offline hydration promise has fully settled.

**Why:** The ready/offline notification is emitted before the hydration promise clears its in-flight marker. An immediate `online` event can reuse that already-finishing promise instead of starting the reconnect pull, making the test fail without representing a real later reconnect.

**How to apply:** In offline reload tests, assert cached data and no network pull, await one tick, then dispatch `online` and assert the refresh and final collection.