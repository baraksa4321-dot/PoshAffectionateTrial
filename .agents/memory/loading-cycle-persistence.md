---
name: Loading cycle persistence
description: Deterministic loading animation and message rotation across app openings.
---

The loading screen should claim and persist one shared cycle index once per app opening. Animation and message indexes both derive from that index with their own modulo lengths. Any visual rotation while the loading screen remains visible must use separate transient state and must never advance the persisted opening index.

**Why:** Advancing the persisted value from an interval makes refreshes skip arbitrary numbers of choices, and random fallbacks make opening order impossible to verify. React StrictMode can also replay effects in development, so the initial storage claim needs a ref guard.

**How to apply:** Read and write browser storage only in a client effect, use a new non-conflicting storage key when replacing an older random scheme, and reset transient rotation when a bfcache page is restored and treated as a new opening.