---
name: Offline hydration reconnect timing
description: Timing constraint for tests that simulate an offline reload followed by reconnect.
---

When a lifecycle test dispatches `online` immediately after observing the offline-ready state, yield one event-loop turn first so the offline hydration promise has fully settled. Production code must also queue a reconnect refresh when the event arrives while hydration is still in flight.

**Why:** The ready/offline notification is emitted before the hydration promise clears its in-flight marker. An immediate `online` event can reuse that already-finishing promise instead of starting the reconnect pull, making the test fail without representing a real later reconnect; real users can hit the same race when cached content paints quickly.

**How to apply:** In offline reload tests, assert cached data and no network pull, await one tick, then dispatch `online` and assert the refresh and final collection. In the store, mark the user for a queued refresh before reusing an in-flight hydration promise.