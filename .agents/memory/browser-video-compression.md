---
name: Browser video compression
description: The private, free-storage strategy for large workout videos.
---

Large workout videos should be decoded and re-encoded locally in the browser to a 720p copy targeted below 45MB before they reach private Storage. The source file remains local; if the browser cannot encode it, ask for a smaller compatible source instead of uploading the original.

**Why:** The linked Supabase organization is on a constrained plan, and long iPhone HEVC/MOV files can exceed the effective Storage limit. Uploading the original cannot be made reliable by chunking alone.

**How to apply:** Keep the compression optional for already-small files, show a visible preparing state, retain the five-minute duration rule, and treat Safari/MediaRecorder failures as a clear user-facing fallback rather than a generic network error.