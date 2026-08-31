---
name: Workout history deduplication
description: The safe boundary for collapsing duplicate workout saves while preserving real same-day sessions.
---

Collapse history records only when their session ID is repeated or their complete normalized content and exact timestamp match. Do not use calendar-day equality alone.

**Why:** A user can legitimately complete the same workout more than once on one day. Merging by workout and local date would silently discard a real performance.

**How to apply:** Normalize duplicate entries within each session first, then deduplicate retries using the immutable ID or exact session timestamp plus full content. Keep different timestamps as separate executions.