---
name: Live Supabase sync drift
description: Production Supabase can lag behind local migrations and have an empty Realtime publication even when local mocks pass.
---

The live Supabase schema and Realtime publication must be checked separately from local code and tests before declaring cross-user sync ready.

**Why:** Local tests can mock subscriptions successfully while the live project has no subscribed tables or is missing a newer migration, making coach updates appear delayed and newer RPCs fail.

**How to apply:** For sync releases, read-only verify applied migrations, required RPCs/columns, publication membership, and delete behavior before any live two-account smoke test; never apply schema changes without explicit approval.

Live drift can be semantic, not just a missing table: legacy activity tables may exist with different column names, and missing coach RLS can silently return empty reports while client pulls fail loudly.

**Why:** A present table can still reject the client's mapper or filter rows from a permitted coach, so existence checks and local mocks do not prove compatibility.

**How to apply:** Compare every selected/upserted column and every role-specific policy against the live catalog; test both trainee hydration and coach detail pulls.

When live activity tables are empty or lack a valid unrelated-coach fixture, use a rollback-scoped fixture to validate assigned-versus-unrelated RLS; treat that as policy coverage, not a substitute for a real two-account smoke.

**Why:** A live project can have the correct policy predicates but no activity rows or second coach account, making direct authenticated read verification inconclusive.

**How to apply:** Keep the fixture transaction fully rolled back, then schedule a guarded smoke run once disposable assigned and unrelated coach accounts exist.

The release gate fails closed when any disposable smoke-account setting exists without the explicit `GYMTRACK_SMOKE_ALLOW_LIVE=true` guard.

**Why:** Preventing a release check from silently contacting live Supabase is safer than assuming configured credentials are disposable or intended for smoke testing.

**How to apply:** Treat a missing live-smoke guard as an environment configuration block, not an application failure; do not enable it or alter Supabase without explicit approval.