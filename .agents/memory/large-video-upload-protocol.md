---
name: Large video upload protocol
description: The upload method required for long iPhone workout videos.
---

Workout videos above 6MB should use Supabase Storage's direct-host TUS endpoint with 6MB chunks, bearer auth, and retry handling. Single signed multipart requests are not reliable enough for long iPhone files.

**Why:** Long HEVC/MOV files can be rejected or fail mid-request even when the bucket and source path are valid; TUS is the supported resumable protocol for large Storage uploads.

**How to apply:** Keep the private bucket and per-user path/RLS checks, use the direct `*.storage.supabase.co` hostname, and preserve the source path only after all chunks complete.