---
name: Remote refresh draft ownership
description: Protect in-progress controlled form fields from periodic or realtime server refreshes.
---

User-edited form values that have not been submitted should live in a local draft separate from the fetched record list. Render the local value when present, fall back to the fetched value only before editing, and clear the draft after a successful save.

**Why:** Realtime and interval refreshes replace fetched arrays. Binding an input directly to an item from that array can make an in-progress edit disappear while the user is typing.

**How to apply:** Use a per-record draft map for editable fields in refreshable management screens; preserve it on failed saves and remove it only after the server confirms success.