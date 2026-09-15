---
name: Video feedback
description: Coach comments on trainee performance videos use a dedicated, realtime-safe feedback record.
---

Use a dedicated video-feedback record for comments attached to a specific uploaded performance video; keep general workout feedback separate. The record carries the trainee, coach, session, exercise, storage path, message, and read timestamp. RLS limits reads to the trainee or assigned coach, creation to assigned coaches, and read-state updates to the trainee.

**Why:** General client feedback cannot identify the exact video or support the unread/read loop required by the trainee home screen.

**How to apply:** Keep the table optional during staged schema rollout, include it in both trainee and selected-coach realtime subscriptions, and preserve the local unread state until the server confirms `seen_at`.

Workout completion should not block on active performance-video uploads. Save the workout
immediately, keep the upload promises running, and merge each successful upload into the saved
session when it finishes.

**Why:** Trainees prefer to finish the workout while mobile uploads continue; blocking completion
leaves them stuck on a progress state and does not improve recovery from a transient failure.

**How to apply:** Keep the finished session in a stable ref, update and persist its matching entry
when an upload resolves, and leave the same-video retry action available when an upload fails.

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