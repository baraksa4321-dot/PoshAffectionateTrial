# Live plan smoke test

`smoke:live-plan` verifies the coach-to-trainee path against a real Supabase project. It uses two
independent password-authenticated clients, so the run covers authentication, coach assignment
RLS, the planned-menu RPC, Supabase Realtime publication, and the trainee refresh path.

Use only disposable test accounts. The command refuses to run unless the explicit live-smoke guard
is enabled, and it never prints passwords, access tokens, email addresses, or raw Supabase errors.

## Configuration

Provide these values through the shell, Replit Secrets, or another test-only environment source:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
GYMTRACK_SMOKE_ALLOW_LIVE=true
GYMTRACK_SMOKE_COACH_EMAIL
GYMTRACK_SMOKE_COACH_PASSWORD
GYMTRACK_SMOKE_TRAINEE_EMAIL
GYMTRACK_SMOKE_TRAINEE_PASSWORD
```

The two accounts must already exist in Auth. The trainee must have an approved `client` profile
assigned to the `coach`/`owner` account. The run intentionally does not create or promote users,
because those operations require administrative credentials and would weaken this RLS check.

## Run

From the repository root:

```bash
pnpm --dir gymtrack-working run smoke:live-plan
```

The command creates a uniquely named temporary program and workout through the authenticated coach
session, seeds a temporary planned menu, opens the trainee Realtime session, and then updates the
workout, program, and menu while that session remains subscribed. It waits for the trainee session
to read all three new values without reload and checks that a pending trainee-local edit marker is
still present. The original menu is restored and the temporary program (and its day through the
foreign-key cascade) is deleted in `finally`, including when an assertion fails after setup.

## Release validation

The repository release check invokes a guarded wrapper after the local preview check:

```bash
pnpm run release:check
```

When none of the four `GYMTRACK_SMOKE_*EMAIL` or `GYMTRACK_SMOKE_*PASSWORD` settings are
provided, the wrapper prints a safe `SKIP` message and continues. When any disposable
smoke-account setting is present, it requires all smoke settings plus
`GYMTRACK_SMOKE_ALLOW_LIVE=true`, runs this command, and fails the release if the live
check fails. Passwords, emails, keys, and tokens are never printed by the wrapper or the
smoke script.
