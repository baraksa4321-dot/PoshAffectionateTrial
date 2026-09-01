---
name: Completed session draft guard
description: Prevents saved workout feedback drafts from being recreated after a successful save.
---

After a workout is saved successfully, persistence and hydration effects must not write the just-cleared feedback draft back to local storage.

**Why:** Saving the session updates shared history before navigation. That update can trigger feedback hydration while the session screen is still mounted, recreating the draft after it was cleared.

**How to apply:** Mark the save as completed before clearing draft storage, and make the feedback persistence effect no-op for the remainder of that mounted session.