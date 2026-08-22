# GymTrack / My Routine — Evidence-Based Audit

## Scope and method

This report covers the supplied ZIP only. I inspected the source, the nine
original SQL migrations, authentication and sync calls, route registrations,
the food data module, and the production build/lint results. No claim below is
based on the prior handoff document.

## Validation performed

| Check | Result | Evidence |
| --- | --- | --- |
| Dependency install | VERIFIED | `npm install --ignore-scripts --no-audit --no-fund` completed. |
| Production build | VERIFIED | `npm run build` completed successfully after the fixes. |
| Lint | VERIFIED WITH WARNINGS | `npm run lint` has 0 errors and 7 warnings: six generated/shadcn fast-refresh warnings and one `useEffect` dependency warning in the coach screen. |
| Live Supabase behavior, RLS and RPCs | NOT VERIFIED | The ZIP contains migration SQL and frontend credentials, but no local Supabase runtime, database dump, or safe test accounts. |
| Supabase public API probe | NOT VERIFIED | The bundled `.env.local` key returned `401 Invalid API key` for existing-table probes; `body_weight_logs` returned `404 PGRST205`. Current Replit Supabase secrets exist, but their values cannot be inspected or used as a destructive test credential here. |
| Browser/mobile interaction test | NOT VERIFIED | No browser test suite or runnable test harness is included in the ZIP. |

## Feature matrix

| Feature | Status | Evidence / exact limitation | Priority |
| --- | --- | --- | --- |
| Sign-up, sign-in, sign-out, persisted Supabase session | PARTIAL | App shell calls Supabase sign-up/sign-in/sign-out and now initiates password-reset email delivery; store listens for auth state and restores a session. Password-update callback and expired-session UX remain absent. | High |
| Email confirmation and resend | PARTIAL | Sign-up handles a user without a session and has `auth.resend`. Delivery and redirect behavior require a live Supabase project. | High |
| Owner / coach / client roles | PARTIAL | SQL defines roles, RPCs, RLS helper functions and a coach screen. Production enforcement cannot be verified without applying migrations. | High |
| Coach/client isolation | NOT VERIFIABLE | Policies and `is_coach_of` are present, but they have not been executed against an actual Supabase database. | Critical |
| Personal versus coach interface mode | PARTIAL | The app switches personal/management UI without changing the stored database role. Route access is client-side; direct route authorization needs live RLS verification. | High |
| Programs and days | PARTIAL | Local CRUD, ordering, builder, Supabase upserts, and user-scoped stale-row deletion now exist. Last-write-wins conflict resolution and live database verification remain absent. | High |
| Active workout player | PARTIAL | Set logging, rest timer, reps, weights, ranges, drop sets, supersets, local resume, and history are implemented. The invalid-workout hook crash was fixed. End-to-end device testing remains unverified. | Medium |
| Workout feedback | PARTIAL | Difficulty and discomfort are saved with a session after the schema fix. The coach dashboard does not expose a feedback-review flow, so it is not sent directly to a coach. | High |
| Workout history | PARTIAL | Local and cloud pull/upsert code exists, and coaches can query assigned client history in SQL. Live visibility and persisted deletes are unverified. | Medium |
| Exercise library and custom exercises | PARTIAL | Search, editing, instructions, alternatives, and demonstration-video URL support exist. There is no verified cloud delete sync and no client-performance video feature. | Medium |
| Nutrition totals and fiber | PARTIAL | Food/day totals include fiber and the replacement calculation now includes replacement fiber. The saved nutrition targets and quantity behavior require browser verification. | Medium |
| Food database | PARTIAL | `israeli-food-db.ts` has 488 entries with unique parsed IDs/names and a fiber field in the code dataset. Nutritional accuracy cannot be verified from source alone. | Medium |
| Custom foods and favorites | PARTIAL | Local CRUD/favorites, cloud upserts, and user-scoped stale-row deletion now exist. Live database verification remains absent. | High |
| Measurements | PARTIAL | Dated weight is supported locally. A mismatched cloud write was fixed by adding `body_weight_logs`; there is no UI for chest/waist/hips/biceps/thighs despite a SQL table for them. | Medium |
| Coach messages | PARTIAL | Coach-to-client write/read code and SQL policies exist. Client-to-coach reply flow and live permission testing are absent. | High |
| Recipes | MISSING | Local recipe storage type/function exists, but no usable recipe-management route or cloud persistence flow was found. | High |
| Client performance videos | MISSING | Only exercise demonstration `videoUrl` / `video_url` fields exist. No upload, storage, client ownership, or coach-review implementation exists. | High |
| Daily routine | PARTIAL | `today_routine_enabled` is stored and synced, but there is no verified scheduler/current-day assignment model. | Medium |
| Mobile / RTL | PARTIAL | The app is Hebrew/RTL and uses mobile-oriented layout classes. No 375px, 390px, or 430px browser checks were supplied or run. | Medium |

## Fixed in this updated source

1. **Fixed an invalid React hook sequence in the active-workout route.** The route no longer calls a hook after a possible early return for an unknown workout ID.
2. **Fixed cloud-sync false positives.** Supabase write responses are now checked, so an RLS/schema/database failure returns an error instead of silently reporting success.
3. **Prevented a fresh-device login from writing the anonymous seed before cloud data is read.** The login flow now pulls the signed-in user's data before its first push.
4. **Fixed body-weight cloud persistence.** The previous code wrote `weight_kg` to `body_measurements`, whose schema has no such column. A new `body_weight_logs` migration, RLS policies, push path, and pull path are included.
5. **Fixed workout-feedback schema mismatch.** The migration adds the `difficulty_rating` and `discomfort_notes` columns that the sync code writes to `workout_sessions`.
6. **Fixed nutrition replacement completeness.** Replacement results now calculate fiber as well as calories, protein, carbohydrates, and fat.
7. **Removed source-distributed demo account credentials.** The demo-auth seed migration is now intentionally empty. `.env.example` is included; the final ZIP excludes `.env.local`.
8. **Removed blocking lint issues.** The updated lint run has no errors.
9. **Added password-reset initiation.** The login modal now sends a Supabase recovery email without revealing whether an address exists.
10. **Added user-scoped stale-row cleanup.** Sync removes deleted custom exercises, programs, days, sessions, weight logs, custom foods, nutrition days, and favorites instead of restoring them indefinitely.

## Security findings

### Fixed

- The source no longer contains the fixed demo account password hashes and
  documented demo account emails from the prior auth seed migration.
- The final archive excludes the supplied `.env.local` file.

### Not verified

- SQL RLS policies, `WITH CHECK` clauses, `SECURITY DEFINER` RPC behavior,
  `is_owner`, `is_coach_of`, role-change protection, and anonymous access
  cannot be treated as secure until they are applied and tested in Supabase.
- Existing remote demo users are not removed by changing a source migration.
  They must be reviewed and deleted in the relevant Supabase project before
  launch.

## Production blockers remaining

1. Apply all migrations to a disposable Supabase project and test each role
   with separate accounts; do not ship based only on the SQL files.
2. Complete password-update/recovery-page handling and clear expired-session behavior.
3. Verify the new user-scoped delete operations against the live RLS policies.
4. Implement the missing recipe and client-performance-video features if they
   are required for the product.
5. Test mobile widths and complete an accessibility pass in a browser.

### Manual Supabase verification required

Using the current project’s Supabase dashboard or a safe authenticated test
client, confirm that migrations `01` through `10` have run successfully,
especially `10_audit_fixes.sql`. Then test client, coach, owner, and anonymous
requests for profile, program, session, message, body-weight, and favorite
records. Confirm that the new sync deletes can only remove rows whose
`user_id` is the signed-in user, and confirm role changes cannot be performed
by a client or coach. Do not use the stale `.env.local` key from the supplied
ZIP for this verification.

## Archive contents

`GymTrack-Production-Ready-Final.zip` includes the updated source, the
original project structure, this report, `.env.example`, and the new migration.
It excludes dependency/build directories and `.env.local`.