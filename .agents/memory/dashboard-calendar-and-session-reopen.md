---
name: Dashboard calendar and reopened sessions
description: Dashboard activity and reopened workout state must use persisted semantic values, not timestamp or row-presence shortcuts.
---

Workout reopening must respect each saved set's explicit completion flag, and weekly dashboard activity must compare local calendar-date keys with the schedule.

**Why:** A saved incomplete set was displayed as completed, while UTC timestamp comparisons could move a session across the local Sunday boundary and disagree with the dashboard schedule.

**How to apply:** When adding workout history or weekly scheduling behavior, preserve `done` on reopen and normalize both history and scheduled dates through the same local-date convention.