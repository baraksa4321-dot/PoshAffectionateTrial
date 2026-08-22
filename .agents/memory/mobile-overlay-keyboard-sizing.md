---
name: Mobile overlay keyboard sizing
description: Prevent bottom sheets from collapsing or hiding their inputs behind a mobile keyboard.
---

For bottom-sheet overlays, calculate the panel's maximum height from `window.visualViewport.height` when it is available. Use the difference between the layout viewport and visual viewport only to lift the sheet above the keyboard.

**Why:** On mobile browsers, `100dvh` can already shrink to the visual viewport when the keyboard opens. Subtracting the keyboard offset from it again makes the available panel height far too small, which can hide a search field or selected-food card.

**How to apply:** Keep the keyboard offset as `margin-bottom` for bottom sheets, but do not subtract it a second time from a dynamic viewport-based maximum height. Re-test any overlay that contains a focused search or form input at a mobile viewport.