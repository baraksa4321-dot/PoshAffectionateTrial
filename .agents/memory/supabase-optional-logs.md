---
name: Optional activity-log schema drift
description: Connected Supabase activity-log tables may exist with legacy column names that differ from the app contract.
---

The connected Supabase project has had activity-log schema drift: cardio_logs may exist with legacy columns (activity_type, duration_minutes, estimated_calories, recorded_at) rather than the app's newer names. Authentication and profile-role hydration must stay fail-closed for identity errors, but must not be blocked by optional activity data sources.

**Why:** A missing optional activity-log table previously prevented an otherwise valid authenticated user from reaching the app, even after their profile role had loaded.

**How to apply:** Verify the live columns before applying an idempotent migration. Keep cloud persistence explicit and map the app to the live schema or use an additive compatibility migration; never infer a role or bypass RLS.