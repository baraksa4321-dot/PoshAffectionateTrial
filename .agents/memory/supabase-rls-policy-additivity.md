---
name: Supabase RLS policy additivity
description: Live Supabase can retain legacy policies that are absent from the repository; additive policies can silently widen writes.
---

RLS policies are additive, so replacing a policy in source is not enough when the live project may contain an older policy under a different name. Explicitly inspect live `pg_policies`, remove legacy policies in a follow-up migration, and verify the final policy set.

**Why:** A live-only self-insert policy allowed a newly authenticated user to choose profile fields beyond the intended registration constraints.

**How to apply:** Whenever tightening an existing Supabase policy, query the live policy list and make the migration drop known legacy variants before creating the constrained policy.