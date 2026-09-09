---
name: Live coach-message smoke verification
description: How live smoke tests should verify coach-to-trainee message delivery when Realtime behavior is not guaranteed.
---

Live coach-message smoke coverage must include a fresh trainee read from the RLS-scoped `coach_messages` query, separately from any Realtime assertion.

**Why:** A live Supabase subscription can report as connected while a newly inserted message does not arrive through the callback, even though the persisted row is readable after refresh. Treating the callback as the only proof can make the smoke test time out or miss a valid persisted delivery path.

**How to apply:** Create a uniquely marked message through the authenticated coach path, explicitly refresh or reconnect the trainee session, assert the exact row and both account IDs, and delete only that row using its ID and trainee ownership.