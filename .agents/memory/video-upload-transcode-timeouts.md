---
name: Video upload and transcode timeouts
description: Why workout video upload and browser playback conversion must be treated as separate failure stages.
---

The original workout video upload and the optional browser-playback conversion can both take substantial time for long iPhone recordings. Do not protect the combined request with a short fixed timeout, and do not report a conversion failure as if the source upload failed.

**Why:** HEVC/MOV conversion happens after the source reaches private Storage; a short client timeout can abort a valid upload while the server is still converting it, creating a misleading “upload failed” message.

**How to apply:** Use a size-aware upper bound for the combined request, retain the source path when conversion fails, and surface conversion status separately from upload status.