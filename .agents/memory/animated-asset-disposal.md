---
name: Animated asset disposal
description: Transparent loading GIFs may contain unsafe frame disposal metadata.
---

Animated assets used by the loading screen must be delivered as full-canvas, fully composited frames. A source GIF with partial optimized frames or `Dispose: None` can lose fills or retain prior artwork in Safari even when desktop image tools render it correctly.

**Why:** Browser GIF decoders may preserve prior transparent frame content when the source relies on disposal behavior that is not suitable for the intended animation.

**How to apply:** Keep a cleaned full-canvas animated asset alongside the source, point both the hydrated UI and the pre-hydration boot watchdog at that asset, and bump the asset query version when changing it. Do not solve this by stacking multiple image layers.