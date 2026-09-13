---
name: Animated asset disposal
description: Transparent loading GIFs may contain unsafe frame disposal metadata.
---

Animated assets used by the loading screen must be delivered as complete frames. A source GIF with partial optimized frames, `Dispose: None`, or faulty generated compositing can retain prior artwork and show duplicate characters.

**Why:** Browser GIF decoders may preserve prior transparent frame content when the source relies on disposal behavior that is not suitable for the intended animation.

**How to apply:** Prefer the existing full-frame tinted MP4 exports for this loading screen, point both the hydrated UI and the pre-hydration boot watchdog at the same asset, and keep a local static fallback. Do not solve this by stacking multiple image layers or by assuming a regenerated GIF is safe.