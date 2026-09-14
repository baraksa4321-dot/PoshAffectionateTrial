---
name: Supabase sync schema contract
description: The client sync mapper must match the live migration column names exactly.
---

The persistence layer must use the actual Supabase column names for every table; a single schema mismatch can abort the shared sync before later collections are uploaded.

**Why:** The connected Supabase project can lag behind repository migrations, and one stale column in a shared sync (including an optional collection) can make unrelated additions and edits appear unsaved.

**How to apply:** When adding or repairing a sync path, verify every push and pull column against the live schema as well as migrations, and treat optional-table failures separately from required-table failures.

Additive columns on required collections need a read fallback as well as a write fallback: retry an explicit legacy projection when PostgREST's schema cache rejects the new column, then map the missing field as undefined.

**Why:** A connected project can have the migration file while its live schema cache still rejects `select("*")`, and one failed required query can prevent the coach workspace from hydrating at all.

**How to apply:** Keep the fallback close to the collection reader and cover both the first schema error and the successful legacy retry in a sync contract test.

Nutrition-day targets are row-level history, not only global settings: preserve each row's stored calorie/protein targets and use a current-date anchor row when there are no local days.

**Why:** Sending the current global target on every nutrition row rewrites historical targets, while skipping an empty nutrition list silently drops a new target.

**How to apply:** Map `target_calories` and `target_protein` into per-day state, only write them for that day or the current anchor row, and apply additive migrations before enabling new sync columns.

Post-save verification should query the exact persisted row and field being saved rather than depending on a broad hydration pass.

**Why:** A broad pull can fail on an unrelated optional or drifted table and falsely report that the target write failed.

**How to apply:** For focused mutations such as a planned menu, verify the specific profile column first, then refresh the wider view independently.