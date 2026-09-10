---
name: Firebase Push configuration
description: Separation between Firebase Web client configuration, native app files, and server credentials for GymTrack notifications.
---

Firebase Web client values and VAPID are sufficient for the browser build to initialize FCM, but remote notification delivery also requires a valid service-account private key accepted by the Edge Function's PKCS#8 parser; native delivery additionally requires the Android and iOS Firebase app files.

**Why:** These configuration layers fail independently. A successful web build does not prove that the Edge Function can mint a Google OAuth token or that native apps can register with Firebase.

**How to apply:** Verify each layer separately: Web config during build, PEM parsing before remote delivery tests, and native files before Android/iOS token tests. Supabase Edge Secrets may contain escaped `\n`; normalize those before PKCS#8 parsing, and redeploy the function after changing multiline secrets. Never put private credentials in source or chat.

In this project, keeping the service-account key in escaped-newline form is the reliable Supabase Secret representation. Updating it as a literal multiline value caused the deployed function to return a platform-level 502 until the secret was restored and the function redeployed.

**Why:** Firebase client configuration can pass the build while server credentials fail independently, and Supabase's Edge runtime did not reliably accept the literal multiline update.

**How to apply:** Store the key without exposing it, normalize escaped line endings in the function, redeploy after any Secret change, and verify OAuth with a controlled invalid-token smoke request before testing real delivery.