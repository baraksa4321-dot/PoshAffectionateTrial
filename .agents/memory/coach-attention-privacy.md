---
name: Coach attention privacy
description: Private coach attention notes and reviewed state are intentionally local-first.
---

Coach attention notes and reviewed flags stay in a coach-scoped local browser key rather than using the existing shared history table.

**Why:** The current shared coach-change table is readable by clients, so storing private notes there would violate the privacy boundary without a new schema and RLS design.

**How to apply:** Keep attention metadata keyed by authenticated coach and client; do not expose it through client-facing sync or shared history rows.