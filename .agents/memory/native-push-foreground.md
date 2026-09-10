---
name: Native push foreground handling
description: Why native FCM foreground callbacks must not blindly schedule a second local notification
---

Capacitor Firebase Messaging can deliver a notification payload through the native notification path and also emit a foreground callback. Do not blindly schedule a local notification from that callback while the app is visible; it can duplicate the same user-facing notification.

**Why:** The same FCM payload may be presented by the OS and then mirrored by app code, producing two notifications for one coach message.

**How to apply:** Only mirror native notification callbacks when the app is not visible, and verify background delivery separately on physical Android and iOS devices.