---
name: Workout exercise identity drift
description: Compatibility rule for linking completed-session entries to the current coach workout plan.
---

Completed workout entries may keep an older exercise ID after a plan or custom-exercise record is recreated. Reporting and coach tracking must match by ID first and by normalized exercise name as a compatibility fallback.

**Why:** Live data showed a completed session whose plan item IDs had changed while the saved entry names still identified the same exercises; ID-only filtering made real sets and media disappear from the coach view.

**How to apply:** Use the dual identity match anywhere a current workout plan is joined to saved history, and load the trainee’s custom exercise metadata when rendering demo videos or other exercise-level fields.