---
name: New-user profile repair
description: Recovery behavior for authenticated Supabase users whose profile row was not created by an auth trigger.
---

Authenticated users may arrive from Supabase Auth without a corresponding `profiles` row. Profile hydration should repair this by inserting a minimal `client` profile for the same authenticated user, using the registration metadata, through the normal RLS-protected client path.

**Why:** The connected project does not reliably provide an auth-to-profile trigger, and treating a missing row as fatal blocks every first-time signup.

**How to apply:** Keep identity checks strict (`authUser.id` must equal the requested user id), never infer privileged roles, and do not bypass RLS or add a schema migration solely for this recovery path. Owner approval views should treat verified Auth users missing a profile as pending recovery candidates; repair the client row before approval or rejection.