---
name: FCM web display path
description: The payload contract between the GymTrack Edge Function and the browser Service Worker.
---

GymTrack web Push messages should be data-only when the Service Worker owns notification display. Put the title and body in string-valued data fields, and keep the deep link in the same data object.

**Why:** FCM notification payloads may be accepted by Google while the app's Service Worker intentionally skips them to avoid duplicate browser notifications. That makes an apparently successful send invisible.

**How to apply:** Keep the server and Service Worker contract aligned: the Edge Function sends `data.title`, `data.body`, and optional `data.deep_link`; the worker displays data-only messages and preserves the click target. Treat an FCM HTTP success count as acceptance, not proof that a device displayed the notification.

Native FCM tokens use a separate payload contract: include `notification.title` and `notification.body`, retain the same string-valued `data` fields, and set platform-appropriate delivery priority/headers. Android also needs the channel named by the payload to exist before delivery.

**Why:** Android and iOS can display a notification payload while the app is backgrounded or terminated; data-only messages are intentionally handled by the app and are not a reliable OS-visible notification path in that state.

**How to apply:** Store each token's platform, keep Web data-only, and send Native notification-plus-data. Validate display on a terminated real device; FCM acceptance alone is not OS-display proof.