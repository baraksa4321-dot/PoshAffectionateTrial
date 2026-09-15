# Live workout-video persistence smoke test

`smoke:live-video` verifies the complete performance-video boundary against a real Supabase
project. It uses the disposable coach, trainee, and unrelated-coach accounts already required by
the guarded live smoke configuration.

The run uploads three real MP4 objects for three different exercises, saves one completed
`workout_sessions` row containing all three object paths, and reads it back as the trainee and the
assigned coach. It checks the same day-filtered query used by the coach report and the selected
trainee tracking view, then repeats the coach read after a fresh request. It also checks that:

- the assigned coach can create and open signed URLs for all three videos;
- an unrelated coach cannot read the history row or open a video;
- one-second signed URLs stop working after expiry and fresh coach URLs restore playback;
- the workout row and all uploaded objects are removed during cleanup.

Use only disposable test accounts. The command refuses to run unless
`GYMTRACK_SMOKE_ALLOW_LIVE=true`, and it never prints passwords, access tokens, email addresses, or
raw Supabase errors.

Run it directly with:

```bash
pnpm --dir gymtrack-working run smoke:live-video
```

The release check also runs this stage after the existing live plan and activity checks when the
guarded live-smoke configuration is present.
