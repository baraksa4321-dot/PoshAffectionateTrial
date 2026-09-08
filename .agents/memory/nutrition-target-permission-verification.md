---
name: Nutrition target permission verification
description: Why nutrition-target editing needs a permission-specific live verification state instead of mutating the cached workspace role.
---

Nutrition-target writes and controls must require a live-verified coach or owner role, independently of the general cached workspace role.

**Why:** Removing the cached role during profile hydration protects the target editor but also blocks legitimate coach workspace edits and breaks offline-first conflict handling. A separate verification flag keeps general workspace behavior intact while preventing stale trainee/coach cache access from changing targets.

**How to apply:** Reset the target permission state when a user hydration begins, enable it only after a successful profile pull, and keep both the UI guard and `saveNutritionTargets` guard on that state. Failed or offline hydration must not enable target editing.