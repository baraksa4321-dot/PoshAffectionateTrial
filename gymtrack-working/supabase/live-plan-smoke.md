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

The message portion first waits for the trainee's filtered Realtime `INSERT` callback and validates
the exact row payload. It then performs a separate fresh trainee read so a Realtime failure cannot
hide a persisted-delivery result. The smoke also verifies the inbox RLS boundary: the assigned coach
creates one uniquely identified message, a coach-side delete attempt cannot remove it, and the
trainee can delete only that smoke row during cleanup. Existing trainee messages must remain. If the
subscription is connected but the callback is absent, the failure names publication, Realtime RLS
visibility, or subscription filtering as the next investigation area while preserving the refresh
assertion as a distinct proof.

## Release validation

The repository release check invokes a guarded wrapper after the local preview check:

```bash
pnpm run release:check
```

When none of the smoke-account settings are provided, the wrapper prints a safe `SKIP` message and
continues. When any disposable smoke-account setting is present, it requires all settings plus
`GYMTRACK_SMOKE_ALLOW_LIVE=true`, runs the plan and activity RLS smoke checks, and fails the release
if either live check fails. Passwords, emails, keys, and tokens are never printed by the wrapper or
the smoke scripts.

## Activity RLS smoke

The release wrapper also runs `smoke:live-activity`. That check requires these additional settings:

```text
GYMTRACK_SMOKE_UNRELATED_COACH_EMAIL
GYMTRACK_SMOKE_UNRELATED_COACH_PASSWORD
```

The unrelated account must already exist in Auth with the `coach` role, must not be assigned to the
trainee, and must not be an `owner`. The smoke creates temporary activity rows through the trainee
session, verifies assigned-coach reads for habits, body-weight, and cardio logs, verifies zero rows
for the unrelated coach, and deletes all temporary rows in `finally`.
