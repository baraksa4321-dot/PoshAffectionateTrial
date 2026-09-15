---
name: Video feedback
description: Coach comments on trainee performance videos use a dedicated, realtime-safe feedback record.
---

Use a dedicated video-feedback record for comments attached to a specific uploaded performance video; keep general workout feedback separate. The record carries the trainee, coach, session, exercise, storage path, message, and read timestamp. RLS limits reads to the trainee or assigned coach, creation to assigned coaches, and read-state updates to the trainee.

**Why:** General client feedback cannot identify the exact video or support the unread/read loop required by the trainee home screen.

**How to apply:** Keep the table optional during staged schema rollout, include it in both trainee and selected-coach realtime subscriptions, and preserve the local unread state until the server confirms `seen_at`.

Completion must wait for all active performance-video uploads before navigating away or writing
the final workout snapshot. Otherwise a fast completion can persist only the videos that finished
first, leaving the coach with an incomplete feedback list.

**Why:** Uploads were previously allowed to continue in the background after the completion save,
so a multi-video workout could reach the coach with only a subset of its videos.

**How to apply:** Track each active upload promise, await them from the completion action, and
stop with an actionable error when any upload fails.

Playback failures after a successful upload should retry the existing Storage path and refresh its
signed URL before asking the trainee to select the file again.

**Why:** A signed URL can expire or fail independently of the uploaded object; requiring a new
file selection creates an unnecessary recovery path and can make a valid video appear lost.

**How to apply:** Keep the stored video path as the stable identity, refresh the signed URL on
playback error, and make the visible retry action reuse that path when no local file remains.

Transient mobile upload errors such as `Load failed` should be retried automatically before
surfacing an error to the trainee.

**Why:** Mobile Safari can lose a fetch during an otherwise valid Storage upload; treating the
first network failure as permanent makes a recoverable upload look like data loss.

**How to apply:** Retry only network-like failures with a small bounded backoff, while preserving
the manual same-video retry for failures that remain after the automatic attempts.