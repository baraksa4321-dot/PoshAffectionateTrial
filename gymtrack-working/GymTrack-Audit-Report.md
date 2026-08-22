# GymTrack — Definitive Live/Static Verification Report

Scope: the supplied GymTrack ZIP and the current source/migrations derived from
it. Prior AI reports were not used as evidence.

## VERIFIED LIVE

None. The current Replit Secrets are present, but this agent environment does
not expose their values or a service-role/database-admin connection. The
bundled ZIP key was stale and rejected by Supabase, so no live result is
claimed from it.

## VERIFIED STATIC

- `src/lib/supabase.ts` reads only `import.meta.env.VITE_SUPABASE_URL` and
  `import.meta.env.VITE_SUPABASE_ANON_KEY`; no Supabase value is hardcoded.
- The source no longer contains `.env.local`; `.env.example` contains
  placeholders only.
- The source contains Supabase calls for sign-up, sign-in, sign-out, session
  restoration, email confirmation resend, password recovery, profile loading,
  role loading, programs, program days, workout sessions, nutrition days,
  favorites, custom foods, custom exercises, messages, body-weight logs, and
  nutrition `water_ml`/`water_target_ml` preservation.
- The food module contains 488 parsed entries. Static checks found no duplicate
  parsed IDs or names and no missing fiber fields in the inspected dataset.
- The source contains Hebrew/RTL layout and mobile-first responsive classes.
- SQL migrations define the existing Owner/Coach/Client model, RLS policies,
  coach/client links, RPCs, workout feedback, recipes, messages, and
  measurements.
- `npm run build` passes.
- `npm run lint` passes with 0 errors and 7 non-blocking warnings.

## FIXED

- Removed the stale bundled `.env.local` override. Replit-managed Secrets are
  now the only runtime configuration source.
- Added `/reset-password`, including recovery-session detection and
  `supabase.auth.updateUser({ password })`.
- Recovery email redirects now target `/reset-password`.
- Profile sync no longer writes server-owned `role` or `coach_id` fields.
- Supabase write errors are surfaced instead of silently ignored.
- Login hydration pulls cloud state before the first sync push.
- Fixed body-weight persistence with `body_weight_logs` and its RLS policies.
- Added workout-session difficulty/discomfort columns required by sync.
- Fixed fiber calculation in food replacement results.
- Removed the fixed demo-auth seed credentials; `08_demo_seed.sql` is now a
  deliberate no-op.
- Fixed the active-workout conditional-hook defect and blocking lint errors.
- Rejected an unsafe full-replacement cloud-delete implementation rather than
  risking deletion of existing data after a partial pull.

## BROKEN

None confirmed by the final static build/lint checks. Live behavior remains
unverified rather than being promoted to working based on source inspection.

## MISSING

- Recipe management UI and client-visible persistent recipe flow.
- Client performance-video upload/storage/ownership/coach-review flow.
- Full body-measurement entry UI beyond body weight.
- Client-to-coach message replies.
- Coach review UI backed by the existing `client_feedback` table.
- Transactional conflict-safe deletion synchronization.
- Automated browser, mobile-width, accessibility, and Supabase integration
  tests.

## NOT VERIFIED

- Live schema, migration history, constraints, foreign keys, and indexes.
- Whether migrations `01` through `11` are already applied in the existing
  Supabase project.
- Live RLS behavior for anonymous, Client, Coach, and Owner sessions.
- Live `SECURITY DEFINER` function behavior and RPC execution grants.
- Cross-client isolation, assigned-coach isolation, owner access, and role
  escalation resistance.
- Signup, email delivery, login, logout, session persistence, recovery email,
  recovery redirect, profile/role hydration, and logout state clearing against
  the current project.
- Persistence after refresh/re-login for programs, workouts, nutrition,
  favorites, custom records, measurements, feedback, and messages.
- Hebrew search quality, everyday Israeli-food coverage, aliases, and
  nutritional accuracy.
- Frontend runtime console errors, dead buttons, modal scrolling, and all
  mobile viewport behavior.

The previous direct probe using the ZIP’s bundled configuration returned
`401 Invalid API key`; `body_weight_logs` was also not visible through that
stale configuration. This is not evidence about the current Replit Secrets.

## DATABASE CHANGES

No live database change was performed. No table was recreated, reset, replaced,
or deleted, and no existing data was modified.

The archive contains two additive migrations for review/application against
the existing project only:

- `10_audit_fixes.sql`: creates `body_weight_logs`, adds its RLS policies, and
  adds workout feedback columns.
- `11_role_and_rpc_hardening.sql`: hardens existing SECURITY DEFINER
  functions, validates Owner/Coach/Client relationships and RPC targets,
  protects role/coach assignment fields, restricts coach messages to assigned
  clients, and removes broad direct owner profile updates.

Because the live migration history could not be read safely, neither migration
is claimed as live-applied. Before applying either, compare it with the live
schema and migration history in the existing project. Apply only statements
that are genuinely absent.

## SECURITY CHANGES

- No service-role key is present in the frontend source or final ZIP.
- No local environment file is present in the final source or ZIP.
- Server-owned role and coach-assignment fields are no longer sent by normal
  profile sync.
- New migration 11 adds fixed `search_path` values to privileged functions,
  restricts function execution grants, validates role relationships, prevents
  invalid coach assignments, and limits coach messages to assigned clients.
- Existing RLS architecture was preserved; no RLS bypass or replacement
  database was introduced.

## FINAL PRODUCTION BLOCKERS

1. From the existing Supabase project, verify migration history and schema
   before applying only missing portions of migrations 10 and 11.
2. Run authenticated matrix tests for anonymous, Client, Coach, and Owner
   access to profiles, links, programs, days, sessions, nutrition, favorites,
   custom data, measurements, feedback, messages, and recipes.
3. Verify recovery email delivery, redirect configuration, and the new
   password-update route.
4. Complete the missing recipes, performance videos, body measurements, client
   replies, and coach feedback-review flows if required by the product.
5. Perform browser/mobile/accessibility testing and inspect runtime console
   output.

The application is not declared production-ready while these live checks
remain unverified.