---
name: Live Supabase sync drift
description: Production Supabase can lag behind local migrations and have an empty Realtime publication even when local mocks pass.
---

The live Supabase schema and Realtime publication must be checked separately from local code and tests before declaring cross-user sync ready.

**Why:** Local tests can mock subscriptions successfully while the live project has no subscribed tables or is missing a newer migration, making coach updates appear delayed and newer RPCs fail.

**How to apply:** For sync releases, read-only verify applied migrations, required RPCs/columns, publication membership, and delete behavior before any live two-account smoke test; never apply schema changes without explicit approval.

The release gate fails closed when any disposable smoke-account setting exists without the explicit `GYMTRACK_SMOKE_ALLOW_LIVE=true` guard.

**Why:** Preventing a release check from silently contacting live Supabase is safer than assuming configured credentials are disposable or intended for smoke testing.

**How to apply:** Treat a missing live-smoke guard as an environment configuration block, not an application failure; do not enable it or alter Supabase without explicit approval.