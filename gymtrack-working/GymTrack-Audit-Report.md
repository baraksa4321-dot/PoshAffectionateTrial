# GymTrack — Final Real-World QA Status

This report is based on the current GymTrack source, migrations, running
Preview workflow, and the attached live-schema correction. It does not claim
that source code is proof of live behavior.

## VERIFIED

- The actual GymTrack Vite application starts in the `GymTrack Preview`
  workflow on port 5173.
- `npm run build` passes.
- `npm run lint` completes with 0 errors and 7 documented non-blocking
  warnings.
- The app reads Supabase only from `import.meta.env.VITE_SUPABASE_URL` and
  `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- `.env.local` is absent from the source and final archive.
- No service-role key or private-key material is present in the source or
  archive.
- The nutrition sync uses the confirmed existing columns `water_ml` and
  `water_target_ml`; no `water` column was created.
- The generated route tree includes `/reset-password`.
- The final archive contains the actual source, migrations, and this report.

## FIXED

- Removed the stale bundled Supabase configuration.
- Added password recovery completion with `supabase.auth.updateUser`.
- Updated recovery redirects to `/reset-password`.
- Prevented ordinary profile sync from writing server-owned `role` and
  `coach_id`.
- Added explicit Supabase write-error handling.
- Fixed login hydration ordering so cloud data is pulled before initial sync.
- Added body-weight persistence support.
- Added workout difficulty/discomfort columns required by sync.
- Added `waterMl`/`waterTargetMl` mapping using the existing live-schema
  `water_ml`/`water_target_ml` names.
- Corrected fiber calculation in food replacement.
- Removed fixed demo-auth credentials.
- Fixed the active-workout conditional-hook issue.
- Added additive Owner/Coach/Client and SECURITY DEFINER hardening migration
  11.
- Rejected unsafe automatic cloud deletion rather than risking deletion of
  existing user data after a partial pull.

## STILL BROKEN

No new runtime defect was confirmed because interactive browser and
authenticated role testing were not available. This is not a claim that all
features work.

## MISSING

- Recipe management UI and client-visible persistent recipe flow.
- Client performance-video storage, ownership, and coach-review flow.
- Full body-measurement entry UI.
- Client-to-coach message replies.
- Coach feedback-review UI using `client_feedback`.
- Transactional conflict-safe cloud deletion.
- Automated browser, mobile, accessibility, and Supabase integration tests.

## NOT VERIFIED

- Owner, Coach, and Client UI flows with real accounts.
- Live Supabase schema, migration history, foreign keys, constraints, indexes,
  RLS policies, SECURITY DEFINER functions, and RPC grants.
- Cross-client isolation, assigned-coach isolation, owner access, and
  role-escalation resistance.
- Signup, login, logout, session persistence, password recovery delivery,
  recovery redirect, profile/role hydration, and logout cleanup against the
  current project.
- Persistence through refresh, logout, and re-login for all application data.
- Browser console/network errors, dead buttons, modal scrolling, routes,
  touch targets, and 375px/390px/430px mobile behavior.
- Nutritional accuracy, aliases, and real-world food search quality.

The available live-schema correction confirms that nutrition water is named
`nutrition_days.water_ml`. No live query result for the full schema or RLS
matrix was available in this workspace, so no live verification claim is
made.

## DATABASE

No live database operation was performed. No existing data was deleted and no
table was recreated or reset.

The archive contains additive migrations:

- `10_audit_fixes.sql` — body-weight logs and workout feedback columns.
- `11_role_and_rpc_hardening.sql` — fixed SECURITY DEFINER paths, restricted
  RPC execution, validated role relationships/targets, protected role and
  coach assignment fields, and restricted coach messages.

Compare these migrations with the existing project’s migration history before
applying only statements that are genuinely absent.

## SECURITY

- Replit-managed Supabase Secrets remain the only runtime configuration.
- No service-role or private credential is used by the frontend.
- Role and coach assignment fields are no longer written by normal profile
  synchronization.
- Existing RLS architecture was preserved and not disabled.
- Migration 11 hardens privileged functions, RPC grants, relationship checks,
  owner-only role operations, and assigned-coach messaging.

## FINAL STATUS

**READY FOR MANUAL QA**

The source builds, lints, starts, and is available in the GymTrack Preview
workflow. It is not ready for deployment until authenticated Owner/Coach/Client
Supabase tests, live migration comparison, and the remaining missing product
features are resolved or explicitly accepted.