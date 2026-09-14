---
name: Challenge moderation
description: The shared challenge catalog approval lifecycle and its authorization boundary.
---

Coach-created challenge templates must be unpublished until an owner approves them. The existing publication flag is the moderation state, so trainees should only receive published rows while coaches can still see their own pending work and owners can review all pending rows.

**Why:** The challenge catalog was already persisted through a shared `is_published` field. Reusing it avoids a second status that could drift, but the original owner-only RLS boundary prevented owners from reviewing challenges created by coaches.

**How to apply:** Keep trainee visibility scoped to published challenges. Any coach edit should return the challenge to pending approval; owner approval must be an owner-authorized update on the coach-owned row, followed by local cache refresh.

The owner management home uses one compact "אישורים" entry point for both pending user registrations and pending coach-created challenges.

**Why:** The owner already reviews both kinds of pending work from the same home workspace, and a single entry point keeps the mobile action row compact and easier to scan.

**How to apply:** Show one combined pending count and open one card with clearly separated user-approval and challenge-approval sections.