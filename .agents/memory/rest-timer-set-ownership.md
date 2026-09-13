---
name: Rest timer set ownership
description: Keep the in-workout rest timer consistent when a completed set is undone.
---

An active rest timer belongs to the specific non-warmup set that started it. If that set is unchecked, clear the timer deadline, smart-timer position, completion state, and expanded overlay together.

**Why:** Leaving the timer active after undoing its set creates a stale floating control that can cover the workout completion action and suggests the app is still resting for a set that is no longer complete.

**How to apply:** Compare the undone set with the stored smart-timer position before resetting the timer; do not cancel a timer merely because an unrelated earlier set was edited.