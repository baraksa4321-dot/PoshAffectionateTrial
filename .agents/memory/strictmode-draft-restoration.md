---
name: StrictMode draft restoration
description: React effect lifecycle constraints for restoring asynchronous offline video drafts.
---

An asynchronous draft-restore effect must not mark a workout as restored before its load promise completes. Set the guard only after confirming the effect was not cleaned up; otherwise React StrictMode's setup/cleanup/setup cycle can cancel the first request and make the second pass skip permanently.

**Why:** In development, the first effect pass was cleaned up before IndexedDB returned. The early guard prevented the second pass from restoring the file, so reload never reached the resumable upload HEAD request.

**How to apply:** Keep stable identifiers in the dependency list, tolerate duplicate in-flight reads, and set the one-time restored guard inside the successful, non-cancelled completion path.