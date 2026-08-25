---
name: GymTrack release preview smoke check
description: The nested TanStack Start app's release smoke check must use its existing Vite dev preview after building.
---

The nested GymTrack build emits `.output/public` and `.output/server`; its package `vite preview` path can look for an unrelated `dist/server/server.js` and exit before serving. The registered root web artifact uses the nested app's existing Vite dev command, so release validation should build first and smoke-test that configured command without changing Vite configuration.

**Why:** A build can succeed while the package-level preview command fails due to the TanStack Start output layout; testing the registered preview path catches the startup failure users would actually encounter.

**How to apply:** Keep the smoke check sequential after typecheck and build, use a dedicated local port, poll the root URL, and print captured process output on timeout or early exit.