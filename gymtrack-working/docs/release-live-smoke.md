# Release and live sync smoke runbook

This runbook prepares the final GymTrack release checks without exposing
credentials or writing to a live Supabase project unintentionally.

## 1. Local release gate

Run the local checks first:

```bash
pnpm run typecheck
pnpm --dir gymtrack-working run test
pnpm --dir gymtrack-working run check:status-colors
pnpm --dir gymtrack-working run build
```

The WebKit/device preview gate is included in:

```bash
bash scripts/check-gymtrack-preview.sh
```

The complete release command is:

```bash
pnpm run release:check
```

## 2. Read-only live-smoke preflight

Before enabling the live smoke test, run:

```bash
pnpm run check:live-smoke-config
```

The preflight only checks whether the required setting names are present. It
does not print values, contact Supabase, or mutate data.

If no smoke account settings exist, it reports `SKIP`. If any smoke account
setting exists, all of the following must be configured:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GYMTRACK_SMOKE_ALLOW_LIVE`
- `GYMTRACK_SMOKE_COACH_EMAIL`
- `GYMTRACK_SMOKE_COACH_PASSWORD`
- `GYMTRACK_SMOKE_TRAINEE_EMAIL`
- `GYMTRACK_SMOKE_TRAINEE_PASSWORD`

The accounts must be disposable and isolated from real user data.

## 3. Guarded live smoke

Only after the preflight reports `READY`, run:

```bash
bash scripts/run-live-sync-check.sh
```

The smoke test must verify:

1. Coach-to-trainee plan changes arrive for the selected trainee.
2. Trainee changes arrive in the coach workspace.
3. Refresh and reconnect preserve the changes.
4. The two test users cannot read each other's data.
5. The test cleanup removes or resets all smoke records.

Do not bypass the guard when the preflight reports `BLOCKED`.

## 4. Release decision

Mark the release as fully verified only when:

- Typecheck, unit tests, status checks, build, and WebKit pass.
- The guarded live smoke passes with disposable accounts.
- RLS and storage access are verified against the live Supabase schema.
- No production data was used as test data.

If live smoke is unavailable, report the release as locally verified but live
sync blocked. Do not call that state a full production sign-off.