---
name: Coach workspace fixtures
description: Durable guidance for authenticated browser tests covering the coach program workspace.
---

The authenticated coach fixture may restore the first workout day as already selected and open after workspace hydration. Browser tests for the coach program workspace should assert the visible build/report tabs and only click an explicit “open day” control when one exists.

**Why:** The workspace restores the most recently selected client/day for a fast return path, so requiring a closed-day button makes a valid mobile state look like a regression.

**How to apply:** When extending the authenticated coach browser fixture, make assertions tolerant of both restored-open and manually-opened day states while still verifying the focused workspace content.