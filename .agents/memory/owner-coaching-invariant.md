---
name: Owner coaching invariant
description: The ownership and self-coaching rules for staff-to-profile relationships.
---

Every Owner is an additional coach for every profile, and every Coach or Owner has a self relationship. A selected coach must not replace the automatic Owner link or a staff member’s self `coach_id`.

**Why:** The data model has one primary `profiles.coach_id` pointer but supports multiple `coach_clients` relationships. Keeping automatic and selected relationships separate preserves both the Owner’s platform-wide coaching role and the user’s own staff identity.

**How to apply:** Preserve Owner links during reassignment and role transitions, restore them for new or changed profiles, and set `coach_id` to the profile’s own ID for Coach/Owner roles. One-time profile backfills run without an authenticated user, so temporarily remove only the protected role/coach trigger and recreate it unchanged before the migration completes.