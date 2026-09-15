---
name: Lazy food catalog hydration
description: Lazy reference catalogs must not be replaced by a later remote hydration snapshot.
---

Reference food catalogs are loaded after the initial shell for performance, while Supabase hydration can finish independently. A route that depends on the catalog must explicitly await the loader, and the hydration path must re-merge the loaded reference entries before replacing local state.

**Why:** Without coordination, the route can briefly or permanently show an empty food library when a remote snapshot captured before the catalog chunk loaded wins the race.

**How to apply:** Keep the catalog lazy for boot performance, expose an idempotent ensure-loaded function for catalog routes, and re-merge loaded reference entries after a remote pull completes.