---
name: Remote refresh draft ownership
description: Protect in-progress controlled form fields from periodic or realtime server refreshes.
---

User-edited form values that have not been submitted should live in a local draft separate from the fetched record list. Scope the dirty state to the selected record, render the local value during refreshes, and clear it only after a successful save.

**Why:** Realtime and interval refreshes replace fetched arrays. Binding an input directly to an item from that array can make an in-progress edit disappear while the user is typing.

**How to apply:** Use a per-record draft map or dirty marker for editable fields in refreshable management screens; reset ownership when the selected record changes, preserve it on failed saves, and remove it only after the server confirms success.