---
name: Firebase Push configuration
description: Separation between Firebase Web client configuration, native app files, and server credentials for GymTrack notifications.
---

Firebase Web client values and VAPID are sufficient for the browser build to initialize FCM, but remote notification delivery also requires a valid service-account private key accepted by the Edge Function's PKCS#8 parser; native delivery additionally requires the Android and iOS Firebase app files.

**Why:** These configuration layers fail independently. A successful web build does not prove that the Edge Function can mint a Google OAuth token or that native apps can register with Firebase.

**How to apply:** Verify each layer separately: Web config during build, PEM parsing before remote delivery tests, and native files before Android/iOS token tests. Never put private credentials in source or chat.