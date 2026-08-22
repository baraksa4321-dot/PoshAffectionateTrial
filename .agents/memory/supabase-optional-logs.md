---
name: Optional activity-log schema drift
description: Connected Supabase lacks the weight and cardio activity-log tables expected by the app.
---

The connected Supabase project currently does not expose the body-weight and cardio log tables in its schema cache. Authentication and profile-role hydration must stay fail-closed for identity errors, but must not be blocked by those optional feature data sources.

**Why:** A missing optional activity-log table previously prevented an otherwise valid authenticated user from reaching the app, even after their profile role had loaded.

**How to apply:** Keep the affected feature's cloud-persistence state explicit, and only reconcile its schema through the existing migrations after the user approves database work. Do not treat a missing activity-log table as permission to infer a role or bypass RLS.