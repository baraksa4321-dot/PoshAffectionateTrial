---
name: Coach-to-trainee synchronization
description: Remote coach edits must rehydrate an active trainee session without overwriting unsynced offline-first trainee edits.
---

Remote edits made by a coach are not local mutations in the trainee's browser, so the trainee app needs an explicit cloud rehydration path on return, navigation, or a lightweight visible-session refresh.

**Why:** The existing offline-first store only pulled at authentication and after its own writes; a trainee who stayed signed in could keep showing cached workouts after a coach saved a new prescription.

**How to apply:** Refresh only when the current trainee has no pending local changes or sync in flight. Preserve pending local edits and let the normal cloud sync resolve them before accepting a remote snapshot.

Successful empty cloud queries are authoritative: clear cached collections when a remote user has no rows, and explicitly remove nullable assignment fields or role-specific collections when a role or assignment changes.

**Why:** Role and assignment changes can happen in another browser; preserving a cached coach pointer, management list, or last message can show stale access or stale content after the server has already removed it.

**How to apply:** When normalizing a remote profile, strip old nullable fields before adding current values. When a successful query returns an empty array, replace the local collection with an empty array instead of leaving the cache untouched.