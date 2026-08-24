---
name: Animated asset disposal
description: Transparent loading GIFs may contain unsafe frame disposal metadata.
---

Animated transparent assets must be normalized into full composited frames before browser delivery. A source GIF with `Dispose: None` can retain prior artwork and visually accumulate duplicate characters.

**Why:** Browser GIF decoders may preserve prior transparent frame content when the source relies on disposal behavior that is not suitable for the intended animation.

**How to apply:** Keep a cleaned animated asset alongside the source, point the UI at the cleaned asset, and keep the loading container clipped. Do not solve this by stacking multiple image layers.