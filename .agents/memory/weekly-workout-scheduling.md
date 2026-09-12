---
name: Weekly workout scheduling
description: The compatibility and reset rules for recurring weekly workout days.
---

Explicit workout weekdays use a Sunday-first value from 0 through 6. Weekly completion is derived from sessions inside the current Sunday-to-Saturday window, so history is retained while the visible completion state resets naturally each week.

**Why:** Older plans were created before weekday scheduling existed. Treating every missing weekday as a new random assignment would change their behavior and could hide workouts after a partial migration.

**How to apply:** Use the explicit weekday when any workout has one. Only a fully legacy plan may fall back to its stable list order; an unassigned workout in a mixed plan should remain unassigned until a coach selects a weekday.