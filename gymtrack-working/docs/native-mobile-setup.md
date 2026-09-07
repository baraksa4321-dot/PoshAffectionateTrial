# Native mobile setup

GymTrack now has a Capacitor shell alongside the existing Web/PWA app.

## Build and sync the native projects

Run these commands from `gymtrack-working`:

```bash
npm run build:mobile
npx cap sync
```

The static client bundle is written to `dist-mobile/` and copied into both
native projects.

## Android

Open the project in Android Studio:

```bash
npm run cap:open:android
```

The Android shell already includes:

- `@capacitor/haptics`
- `@capacitor/local-notifications`

## iOS

On a Mac with Xcode installed:

```bash
npm run cap:open:ios
```

Then choose a development team and signing profile in Xcode before running on
an iPhone. The bundle identifier is currently `com.myroutine.app` and can be
changed in `capacitor.config.ts` before publishing.

## Important

The native shell is currently prepared through the build/sync stage. The next
stage is testing on a real Android or iPhone device, followed by configuring
local notifications for timer alerts while the app is in the background.