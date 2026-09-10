---
name: Nested app dependency isolation
description: Package-manager behavior when an app lives below the workspace root but has its own package manifest and lockfile.
---

When installing dependencies for the nested GymTrack app, run the package-manager operation from that app directory and keep its package-lock authoritative; do not commit generated entries for the nested app into the root pnpm lockfile.

**Why:** The workspace package manager can discover a nested manifest even when it is not a declared workspace package. Adding a native or Firebase dependency from that directory rewrote the root lockfile and temporarily changed unrelated workspace dependency resolution.

**How to apply:** After nested dependency changes, inspect the root lockfile diff and restore it if the nested app is not in `pnpm-workspace.yaml`. Update the nested app lockfile separately, then reinstall the root workspace before running the release checks.