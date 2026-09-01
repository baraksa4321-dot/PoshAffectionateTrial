---
name: Stale browser rehydration
description: Prevent authenticated preview state from repopulating Supabase rows after a data cleanup.
---

Before validating a destructive Development cleanup, stop or clear any authenticated browser/preview state that can still hold local-first data. A later hydration or sync can recreate user-owned rows even after the database was verified empty.

**Why:** A stale preview state repopulated a program and nutrition day after the initial empty-state verification, requiring a second targeted cleanup.

**How to apply:** Stop the preview or clear its user-scoped local state before the final database count; recheck counts after the app has had time to hydrate.