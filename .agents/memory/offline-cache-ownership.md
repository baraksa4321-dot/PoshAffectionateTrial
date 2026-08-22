---
name: Offline cache ownership
description: Privacy boundary for per-user offline cache data.
---

Offline cache records must be keyed by the authenticated user’s immutable ID. Never infer ownership of an old shared cache from a separate mutable marker.

**Why:** A shared payload can survive an offline account switch while its marker changes, which can expose one account’s fitness and health data to another account.

**How to apply:** On account changes and cold offline startup, load only the active account’s dedicated cache record. Discard legacy shared records that lack a verifiable embedded owner, even when that means an older client must reconnect before its old cache is available.