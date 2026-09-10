---
name: Offline boot cache
description: Fast authenticated reopen behavior while preserving local-first data integrity.
---

Use a user-ID-keyed lightweight boot snapshot to establish the account role and render the first workspace before parsing large catalogs. Yield once for the browser to paint, then load the full local snapshot before starting the cloud pull.

**Why:** Parsing the full food catalog on the auth callback kept the splash visible on reopen. Delaying the full snapshot without loading it before the pull can lose pending local edits, and repeated remote refreshes can duplicate challenge workouts.

**How to apply:** Keep the boot snapshot privacy-scoped to the immutable authenticated user ID, omit only data that can safely be restored from reference libraries, and dedupe remote/local workout merges by stable workout ID.