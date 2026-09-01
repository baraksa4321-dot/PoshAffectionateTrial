---
name: Library deletion tombstones
description: How user deletions interact with the built-in exercise catalog and remote hydration.
---

User deletion of a built-in exercise must be recorded as a per-user tombstone, not only removed from the in-memory array. The seed merge and custom-exercise pull both need to filter those tombstones.

**Why:** The maintained exercise catalog is re-added during hydration, and a remote custom row can still exist during an offline or stale-cache sync. Without a tombstone, a deleted item can return after refresh.

**How to apply:** Keep deletion preferences in the user-scoped local snapshot, remove the tombstone when an item is explicitly saved again, and apply the filter after both seed merging and Supabase custom-exercise hydration. Equipment and grip removals use the same local preference pattern when no schema change is desired.