---
name: Offline boot cache
description: Fast authenticated reopen behavior while preserving local-first data integrity.
---

Use a user-ID-keyed lightweight boot snapshot to establish the account role and render the first workspace before parsing large catalogs. Yield once for the browser to paint, then load the full local snapshot before starting the cloud pull. Persist a non-secret last-authenticated user marker so an installed PWA can resume the same cached account after a full process restart with no network.

**Why:** Parsing the full food catalog on the auth callback kept the splash visible on reopen. Delaying the full snapshot without loading it before the pull can lose pending local edits, and a cold airplane-mode launch can otherwise stop at authentication before the per-user cache is reachable. Repeated remote refreshes can duplicate challenge workouts.

**How to apply:** Keep the boot snapshot privacy-scoped to the immutable authenticated user ID, omit only data that can safely be restored from reference libraries, clear the marker on explicit sign-out, and dedupe remote/local workout merges by stable workout ID.

Critical loading visuals should include a small local image fallback and have those fallback assets precached by the Service Worker; keep animated media visible by default and switch to the fallback only after a media error.

**Why:** Safari can show a broken media icon when an MP4 or GIF is unavailable during a cold offline PWA launch, even though the application shell itself is cached.

**How to apply:** Keep the fallback independent of video decode/autoplay, update it when the pre-hydration watchdog rotates the loading state, and bump the app-shell cache when the loading assets or boot markup change.

The primary animated loading presentation uses the original character/fruit sequence backed by the full-frame tinted MP4 assets; the cleaned GIF variants are not safe for the loading screen.

**Why:** The supplied transparent animation frames can retain prior character pixels in Safari, and the generated cleaned GIFs can still contain visible duplicate outlines. The tinted MP4 exports render one complete frame at a time.

**How to apply:** Keep loading-cycle rotation mapped to the original illustration list, point both the hydrated UI and pre-hydration watchdog at the tinted MP4 assets, keep the PNG fallback local, and bump both the Service Worker cache and watchdog query when changing the loading markup.