---
name: Coach activity workspace states
description: The coach client route has a read-only activity overview state before program or nutrition editors take over.
---

Coach activity coverage must select a trainee through the client route and assert the read-only activity overview before opening an editor. The same workspace later changes state when a program or nutrition editor is active, and those overlays can cover or intentionally hide the overview.

**Why:** A regression test that only checks the editor state can miss missing or mis-scoped activity hydration, while leaving the overview mounted during editor interaction can intercept clicks on builder controls.

**How to apply:** Keep selected-trainee activity assertions at the initial `openEditor === null` state, and ensure read-only activity cards do not sit above program or nutrition editor controls once an editor is open.