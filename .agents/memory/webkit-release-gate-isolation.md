---
name: WebKit release-gate isolation
description: How to interpret mixed authenticated WebKit smoke results when nutrition tests pass but later coach flows time out.
---

Authenticated WebKit release runs can time out in later coach/realtime scenarios even after the nutrition flows under test pass. Realtime reconnect warnings and a detached retry button are evidence of a separate smoke-harness or connection-stability problem, not proof that the nutrition UI failed.

**Why:** A full run reproduced successful nutrition tests alongside failures in coach retry/message scenarios and then hit the global WebKit timeout. Treating the whole run as one failure led to unnecessary investigation of already-passing nutrition behavior.

**How to apply:** Read the per-test Playwright error context first. Use the targeted nutrition results to validate meal replacement behavior, and track unrelated coach/realtime failures separately. Keep playback-state UI assertions on a mobile Chromium viewport when local WebKit media decoding is unstable; leave actual media decoding to the dedicated WebKit gate.