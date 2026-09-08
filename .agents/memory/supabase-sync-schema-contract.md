---
name: Supabase sync schema contract
description: The client sync mapper must match the live migration column names exactly.
---

The persistence layer must use the actual Supabase column names for every table; a single schema mismatch can abort the shared sync before later collections are uploaded.

**Why:** The connected Supabase project can lag behind repository migrations, and one stale column in a shared sync (including an optional collection) can make unrelated additions and edits appear unsaved.

**How to apply:** When adding or repairing a sync path, verify every push and pull column against the live schema as well as migrations, and treat optional-table failures separately from required-table failures.

Post-save verification should query the exact persisted row and field being saved rather than depending on a broad hydration pass.

**Why:** A broad pull can fail on an unrelated optional or drifted table and falsely report that the target write failed.

**How to apply:** For focused mutations such as a planned menu, verify the specific profile column first, then refresh the wider view independently.