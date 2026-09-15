---
name: Password recovery route
description: The password reset screen must remain reachable while Supabase restores a recovery session.
---

The global unauthenticated shell must not replace the `/reset-password` route while Auth is loading or unauthenticated. Supabase restores the recovery session asynchronously from the email link, so the route itself needs to render before that state settles.

**Why:** A global unauthenticated fallback can mask the recovery route and leave users on the login modal, even when the reset link and route are valid.

**How to apply:** Treat `/reset-password` as a public Auth exception in the root render gate. Let the route subscribe to `PASSWORD_RECOVERY` and inspect the session itself.