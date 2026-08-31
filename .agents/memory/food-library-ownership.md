---
name: Food library ownership
description: How user edits to seeded foods remain durable across sync and catalog refreshes.
---

An edit to a seeded food must be marked as a user-owned override before sync. Seed IDs alone are not enough to decide whether a row is immutable.

**Why:** The catalog is reloaded from seed data after hydration, while the sync intentionally excludes immutable seed rows. Without ownership metadata, a successful local edit appears to work and then returns to the original values after reload.

**How to apply:** Preserve the original food ID for meal references, include owned overrides in the custom-food sync, and keep unowned seed rows excluded from per-user writes.