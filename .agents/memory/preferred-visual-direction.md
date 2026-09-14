---
name: Preferred visual direction
description: The user's approved visual baseline for My Routine.
---

The preferred direction is a polished mobile fitness app, not a website: use a white/ivory canvas, near-black type, restrained palette accents, and a deep version of the active palette for the workout action surface. The pink palette is intentionally monochromatic rose/plum; do not introduce unrelated orange or yellow accents. Default men to black and women to rose-gold, while preserving an explicit palette choice made before login. Keep the existing layout/order and product flows while making the shell and surfaces feel native, smooth, and finished.

**Why:** The user approved changing the visual design but wants the result to match the supplied mobile app references: clean native chrome, precise color roles, stronger contrast, and calm surfaces without a website feel. A fixed charcoal workout card does not fit the selected palette.

**How to apply:** Do not reorder or restructure dashboard content. Keep routes, state, data, and interactions intact. Change the app shell, card skins, feature treatments, borders, shadows, gradients, icon presentation, touch targets, and visual realism only. Prefer white surfaces, theme-derived deep workout CTAs, restrained accents, and subtle pastel metric cells. All semantic colors must derive from the active primary hue so a palette never mixes unrelated hues (for example, no orange in pink/rose-gold or green in blue). Card edges must be complete and intentional: avoid decorative arcs, partial corner strokes, and inset highlight strips; use one clear border or no border. In night mode, use layered soft charcoal surfaces with muted theme accents, WCAG-conscious text/boundary contrast, and no pure-black or bright-pastel large surfaces. In coach tracking, keep the client tabs above the workout card during normal browsing; when the workout builder opens, hide those tabs and show the builder/report as a full-screen workspace with the report bookmark on the left when open.

Large coach client content such as the trainee profile should also render inline on route-based client pages. Reserve overlays for short actions such as pickers, confirmations, and compact utility prompts.

The authenticated mobile topbar follows the supplied reference: keep the brand/account row separate, then place the workspace switcher on the left, the day/night control in the center, and the route or greeting text on the right in one shared row. This geometry applies in day and night modes, every palette, and every user role.

**Why:** The user provided exact day/night references and wants the same native mobile chrome rather than route-specific header offsets.

**How to apply:** Keep the shared topbar content in one row; do not solve new header issues by adding a second title row or route-specific negative transforms. Let surfaces, borders, and text colors derive from the active palette.

Dark Brown must remain visually distinct from Light Brown in night mode; lift its accent only enough for contrast, and derive active navigation/focus states from the selected palette rather than fixed pink values.