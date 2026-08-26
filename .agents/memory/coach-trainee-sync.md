---
name: Coach-to-trainee synchronization
description: Remote coach edits must rehydrate an active trainee session without overwriting unsynced offline-first trainee edits.
---

Remote edits made by a coach are not local mutations in the trainee's browser, so the trainee app needs an explicit cloud rehydration path on return, navigation, or a lightweight visible-session refresh.

**Why:** The existing offline-first store only pulled at authentication and after its own writes; a trainee who stayed signed in could keep showing cached workouts after a coach saved a new prescription.

**How to apply:** Refresh only when the current trainee has no pending local changes or sync in flight. Preserve pending local edits and let the normal cloud sync resolve them before accepting a remote snapshot.