# Live Supabase verification — 2026-09-13

This record separates live Supabase results from local checks. It contains no
credentials, access tokens, user emails, or FCM tokens.

## Project and safety preflight

- Supabase project ref: `pnvtxazqtorylcsjtatv`
- Project status: `ACTIVE_HEALTHY`
- Backup API: reachable
- Backup readiness: **confirmed by the user from the Supabase backup/restore
  surface**
- Backup metadata reported `pitr_enabled: false`, no listed backups, and no
  physical backup entries. Live DDL was held until the independent confirmation
  was provided.

## Guarded disposable-account smoke checks

### Plan and activity

Command: `bun run scripts/live-plan-smoke.ts`

- Authentication, coach-created temporary plan/workout, trainee refresh, coach
  report refresh, cleanup, and persisted coach-message delivery passed.
- The trainee fresh read received the exact smoke message.
- The trainee Realtime channel reached `SUBSCRIBED` but did not deliver the
  inserted message within 30 seconds. This is a live-only Realtime callback
  failure; the persisted refresh assertion passed separately.
- Temporary records and channels were cleaned up.

Command: `bun run scripts/live-activity-rls-smoke.ts`

- Assigned coach read habits, body-weight, and cardio rows.
- Unrelated coach read zero rows for all three activity tables.
- Temporary activity rows were cleaned up.

## Live catalog and publication

The management SQL endpoint verified that all required tables exist and are
members of `supabase_realtime`:

- `profiles`
- `programs`
- `program_days`
- `nutrition_days`
- `workout_sessions`
- `body_weight_logs`
- `cardio_logs`
- `body_measurements`
- `client_habits`
- `client_feedback`
- `coach_messages`
- `broadcast_announcements`
- `coach_clients`
- `challenges`
- `challenge_enrollments`

This includes the two tables specifically called out by the task:
`challenges` and `challenge_enrollments`.

## Push delivery and token rotation

- `send-fcm-notification` is deployed with status `ACTIVE` and JWT
  verification enabled.
- Authenticated disposable-coach invocation for the assigned-client audience
  returned `sent: 8, failed: 0`.
- Before migration, the live `claim_push_token(TEXT, TEXT)` RPC was absent
  (`PGRST202`).
- Migration 56 was applied after backup confirmation.
- The live function is `SECURITY DEFINER`, uses
  `search_path=public, pg_temp`, removes the prior token owner, and inserts the
  authenticated owner.
- Execute access is denied to `PUBLIC` and `anon` and granted to
  `authenticated`.
- A disposable token was claimed first by the coach and then by the trainee.
  Each owner could read its own row while the other account could not. The
  final trainee-owned row used provider `fcm` and platform `android`.
- The disposable token row was deleted after verification.
- The existing push-token table is present with the expected base columns.

## Nutrition macro migration

- Before migration, an authenticated read selecting `target_carbs`,
  `target_fat`, and `target_fiber` failed with `42703`.
- Migration 57 was applied after backup confirmation.
- All three columns now exist as `NUMERIC(7,2)`.
- An authenticated read selecting all three macro columns succeeded.

## Local results

- Push-token security and service-worker notification tests: **9 passed, 0
  failed**
- TypeScript typecheck: **passed**

## Remaining live-only failure

Investigate the live `coach_messages` Realtime callback failure separately from
the working fresh-read path. Publication membership is complete, so the next
check should focus on the filtered subscription, Realtime authorization/RLS,
and the live callback payload path.

## Migration-history discrepancy

The live catalog contains the verified migration 56 and 57 objects, but the
Supabase management migration-history endpoint has no matching entries for the
push-token claim or nutrition macro changes. The schema is deployed while the
management history remains out of sync; this is tracked separately so future
drift checks do not treat history alone as proof of the live object state.

## Repository artifact security

Generated Playwright traces, network captures, screenshots, and error contexts
were removed from version control after completion review found authenticated
session material in the captures. `test-results/` and `playwright-report/` are
ignored so future authenticated browser runs retain only sanitized textual
results in the repository.

All sessions for the disposable coach, trainee, and unrelated-coach accounts
were revoked globally. Their push-token rows were deleted before sign-out, so
the captured refresh tokens and GymTrack delivery registrations are no longer
usable.