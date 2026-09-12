---
name: Night theme safe area
description: Mobile safe-area and browser chrome behavior for night-mode palette colors
---

In night mode, the mobile status-bar/safe-area region can remain visually separate from the app shell. The page needs a night-colored safe-area layer in addition to the shell background, and the browser theme-color should follow the selected palette rather than use one universal charcoal.

**Why:** A dark-brown palette otherwise rendered as neutral blue-charcoal, while the top mobile strip could remain white even though the app content was dark.

**How to apply:** Keep the safe-area background tied to `--background`, and derive the dynamic `theme-color` from the active palette whenever night mode or the palette changes.