---
name: External store snapshot stability
description: React external-store selectors must preserve referential stability for optional collection fallbacks.
---

Optional collections exposed through `useSyncExternalStore` must use a stable empty constant when the collection is absent, including the server snapshot. Do not return a fresh `[]` from `getSnapshot` or `getServerSnapshot`.

**Why:** React compares external-store snapshots by identity. A fresh fallback array caused AppShell to enter a maximum-update-depth loop in the browser even though typecheck and unit tests passed.

**How to apply:** Initialize optional store collections in the seed/migration path where possible, and keep a module-level empty constant for any selector fallback.