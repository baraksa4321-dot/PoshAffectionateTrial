---
name: Push token ownership
description: FCM tokens are globally unique while push-token rows are user-scoped by RLS.
---

FCM token rotation must use a server-side authenticated claim operation that removes any stale owner before inserting the current user’s token; a client-side upsert can fail on the global token constraint when the previous row belongs to another user.

**Why:** `push_tokens.token` is globally unique, but ordinary client deletes and upserts are restricted by `user_id = auth.uid()`, so a rotated token can remain owned by a prior account.

**How to apply:** Keep the claim function `SECURITY DEFINER`, restrict execution to authenticated users, validate the platform and non-empty token, and keep a staged-deployment fallback only until the migration is present.