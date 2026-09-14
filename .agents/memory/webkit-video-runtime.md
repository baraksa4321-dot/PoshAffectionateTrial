---
name: WebKit video runtime limitation
description: The local bundled Linux WebKit runner crashes when GStreamer decodes loading videos.
---

The configured Nix WebKit runner can launch and serve media correctly, but its bundled media pipeline crashes the page as soon as an actual MP4 or WebM source is attached to a video element. This is separate from app markup, MIME headers, or the loading test itself.

**Why:** A real loading-media regression test must remain real for iPhone WebKit; replacing the video with a fake clock would make the test pass without verifying playback.

**How to apply:** Keep the WebKit loading-video test fail-closed for real iPhone-capable environments. If local validation hits this crash or fails before a video element becomes available, report the runner limitation separately and do not add a media shim or silently skip the test; use a Chromium mobile run to validate the surrounding upload/reopen flow.