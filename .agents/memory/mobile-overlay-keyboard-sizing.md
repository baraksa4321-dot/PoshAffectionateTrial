---
name: Mobile keyboard and scrolling
description: Keep focused fields visible without creating competing mobile scroll containers.
---

For bottom-sheet overlays, calculate the panel's maximum height from `window.visualViewport.height` when it is available. Use the difference between the layout viewport and visual viewport only to lift the sheet above the keyboard, and ignore small reductions caused by Safari browser chrome.

Long application pages should retain one native document scroll path. When the keyboard or visual viewport changes, move the nearest genuinely scrollable ancestor of the focused field; do not assume the outer overlay panel owns the scroll.

**Why:** On mobile browsers, `100dvh` can already shrink to the visual viewport when the keyboard opens. Subtracting the keyboard offset twice collapses sheets, while nested `overflow` regions and competing body/page scrollers can leave fields hidden or stop long coach pages from moving. Safari's URL/tool-bar chrome can also create a small visual-viewport reduction that is not a keyboard.

**How to apply:** Keep the keyboard offset as `margin-bottom` for bottom sheets, but do not subtract it again from a visual-viewport maximum height. For regular pages, leave vertical scrolling to the document and add temporary keyboard clearance. For nested sheets, scroll the closest ancestor whose content actually overflows. Re-test focused fields near the bottom of long pages and nested overlays.

Header-based `scroll-margin` is unsafe for fullscreen or portal editors: iOS can reapply that header offset after a controlled input rerender and visibly jump the page. Use zero input scroll margins there, and globally snapshot all overflowing ancestors on focus and restore them after `input` when the field remains active.

**Why:** The jump can happen after typing rather than on focus, so focus-only visibility logic misses it; the resulting position often matches the old header height exactly.

**How to apply:** Keep intentional visibility scrolling on focus, but do not add header-based `scroll-margin` to editable controls. Refresh the scroll-chain snapshot at the start of each active-field input, then restore it in the next two animation frames. When a fixed bottom navigation remains above the keyboard, use its actual viewport top as the lower visibility boundary.