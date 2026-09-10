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

The existing Android package ID is `com.myroutine.app`. The native project is
already prepared for Firebase Messaging and Android 13 notification permission.
To finish Firebase setup, download the Android configuration file from Firebase
and place it at:

```text
android/app/google-services.json
```

Open the project in Android Studio:

```bash
npm run cap:open:android
```

The Android shell already includes:

- `@capacitor/haptics`
- `@capacitor/local-notifications`

## iOS

The existing iOS Bundle ID is `com.myroutine.app`. Push capability and the
remote-notification background mode are already prepared in the project. To
finish Firebase setup, download the iOS configuration file from Firebase, add
it to the `App` target in Xcode, and make sure it is copied into the app bundle:

```text
ios/App/App/GoogleService-Info.plist
```

On a Mac with Xcode installed:

```bash
npm run cap:open:ios
```

Then choose a development team and signing profile in Xcode before running on
an iPhone.

## Important

The native shell is currently prepared through the build/sync stage. The next
stage is testing on a real Android or iPhone device, followed by configuring
local notifications for timer alerts while the app is in the background.