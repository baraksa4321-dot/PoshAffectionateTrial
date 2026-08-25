---
name: Supabase sync schema contract
description: The client sync mapper must match the live migration column names exactly.
---

The persistence layer must use the actual Supabase column names for every table; a single schema mismatch can abort the shared sync before later collections are uploaded.

**Why:** Fitness logs previously used names from an older model instead of the current `date`, `type`, `duration_min`, `calories`, and `weight_kg` columns, causing unrelated additions and edits to appear unsaved.

**How to apply:** When adding or repairing a sync path, verify both push and pull mappings against the migrations and treat optional-table failures separately from required-table failures.