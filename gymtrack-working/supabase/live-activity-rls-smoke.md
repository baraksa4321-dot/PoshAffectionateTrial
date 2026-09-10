# Live activity RLS smoke test

`smoke:live-activity` verifies the live row-level security contract for trainee activity data. It
uses three independent password-authenticated clients:

- an assigned coach (or owner acting as the assigned coach);
- an approved trainee assigned to that coach;
- a separate coach who is not assigned to the trainee.

The command refuses to run unless `GYMTRACK_SMOKE_ALLOW_LIVE=true`. Use only disposable accounts
with empty activity tables. It never creates, promotes, or assigns users.

## Configuration

Provide these values through Replit Secrets or another test-only environment source:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
GYMTRACK_SMOKE_ALLOW_LIVE=true
GYMTRACK_SMOKE_COACH_EMAIL
GYMTRACK_SMOKE_COACH_PASSWORD
GYMTRACK_SMOKE_TRAINEE_EMAIL
GYMTRACK_SMOKE_TRAINEE_PASSWORD
GYMTRACK_SMOKE_UNRELATED_COACH_EMAIL
GYMTRACK_SMOKE_UNRELATED_COACH_PASSWORD
```

The unrelated account must have the `coach` role. Do not use an owner for that account because
owners intentionally have broader read access.

## Run

```bash
pnpm --dir gymtrack-working run smoke:live-activity
```

The smoke confirms that the trainee starts with empty `client_habits`, `body_weight_logs`, and
`cardio_logs` tables. It then creates one uniquely identified row in each table through the trainee
session. The assigned coach must read all three rows, while the unrelated coach must receive zero
rows for the trainee. The test removes the rows through the trainee session in `finally`, including
when an assertion fails after setup.

The body-weight and cardio inserts support both the current canonical column names and the older
schema shape used by the compatibility path. This keeps the check focused on RLS instead of making
schema naming drift look like an access-control result.
