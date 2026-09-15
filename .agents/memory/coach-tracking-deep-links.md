---
name: Coach tracking deep links
description: Rules for opening a specific prescribed exercise from the coach tracking report.
---

Tracking report links must always navigate to the dedicated editor route with the selected day and exercise IDs, even when the program's stored day association is stale or incomplete.

**Why:** A guard that required an exact program-to-day match silently left the user on the client overview, which looked like a navigation failure.

**How to apply:** Treat `programId` as optional when constructing the deep link; let the destination choose the latest program while honoring the explicit `dayId` and `exerciseId`. Cross-route exercise creation must also persist the selected client/program/day context and restore it before assigning the new exercise. Hydrate the selected workout item immediately before navigation as well as from route search params, because the client workspace may already be mounted while its refresh is settling.