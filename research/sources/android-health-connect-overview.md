Source: https://developer.android.com/health-and-fitness/fitness/basic-app/overview
Title: Build a basic fitness app  |  Android health & fitness  |  Android Developers
Fetched: 2026-09-02T12:59:20.441Z

[Skip to main content](https://developer.android.com/health-and-fitness/fitness/basic-app/overview#main-content)

[![Android Developers](https://www.gstatic.com/devrel-devsite/prod/v6c08f9bb601564cd99488472d05cdf6fb06f007f31b6552465782b15883ce123/android/images/lockup.png)](https://developer.android.com/)

`/`

- English
- Deutsch
- Español – América Latina
- Français
- Indonesia
- Italiano
- Polski
- Português – Brasil
- Tiếng Việt
- Türkçe
- Русский
- עברית
- العربيّة
- فارسی
- हिंदी
- বাংলা
- ภาษาไทย
- 中文 – 简体
- 中文 – 繁體
- 日本語
- 한국어

[Android Studio](https://developer.android.com/studio)Sign in

- [Health & fitness dev center](https://developer.android.com/health-and-fitness)

Google Fit APIs will be supported until the end of 2026. To learn about the recommended migration paths, see [Migration guide](https://developer.android.com/health-and-fitness/health-connect/migration/fit).


- [Android Developers](https://developer.android.com/)
- [Essentials](https://developer.android.com/get-started)
- [Health & fitness dev center](https://developer.android.com/health-and-fitness)
- [Fitness Guides](https://developer.android.com/health-and-fitness/fitness)

# Build a basic fitness app    Stay organized with collections      Save and categorize content based on your preferences.

This guide walks you through building a basic mobile step counter app, which
is a common foundation for many Health & Fitness apps.

This workflow integrates the following APIs:

- [SensorManager](https://developer.android.com/guide/topics/sensors/sensors_motion) for retrieving steps data from a mobile device.
- [Room](https://developer.android.com/training/data-storage/room) for local data storage.
- [Health Connect](https://developer.android.com/health-and-fitness/guides/health-connect) for storing and sharing health and fitness data on device.

For additional support on data reading and the tools necessary, refer to [Use\\
Android Sensor Manager to track steps from a mobile device](https://developer.android.com/health-and-fitness/guides/basic-fitness-app/read-step-count-data).

If you haven't already set up your development environment for using
[Health Connect](https://developer.android.com/health-and-fitness/guides/health-connect), follow these [getting started](https://developer.android.com/health-and-fitness/guides/health-connect/develop/get-started) steps.

## Request permissions on handheld device

Before getting exercise data you must request and be granted the appropriate
permissions.

As a best practice, only request the permissions you need, and make sure to
[request each permission in context](https://developer.android.com/training/permissions/requesting#workflow_for_requesting_permissions), instead of requesting all
permissions at once when the user starts the app.

The [step counter sensor](https://developer.android.com/guide/topics/sensors/sensors_motion#sensors-motion-stepcounter), which many exercise apps rely on, uses the
`ACTIVITY_RECOGNITION` permission. Add this permission in your
AndroidManifest.xml file:

```
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools">

  <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>

</manifest>
```

To request the `ACTIVITY_RECOGNITION` permission at runtime refer to the
[permission request documentation](https://developer.android.com/training/permissions/requesting#request-permission).

You will also need to declare a `FOREGROUND_SERVICE` in the manifest. Since you
are requesting the `ACTIVITY_RECOGNITION` permission, declare
`FOREGROUND_SERVICE_TYPE_HEALTH`:

```
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH"/>
```

Visit [Foreground services](https://developer.android.com/develop/background-work/services/fgs)
to learn more about foreground services and foreground service types.

## Manage UI state using a ViewModel

To properly manage the UI state, use a ViewModel.
[Jetpack Compose and ViewModels](https://developer.android.com/jetpack/compose/libraries#viewmodel) offers you a more in-depth look at this
workflow.

Also, use UI layering, which is a critical part for building UIs with Compose
and lets you follow architecture best practices, such as
[Unidirectional Data Flow](https://developer.android.com/jetpack/compose/architecture#udf). To learn more about UI layering, refer to the
[UI layer documentation](https://developer.android.com/topic/architecture/ui-layer).

In this example app, the UI has three basic states:

- **Loading:** Shows a spinning circle.
- **Content:** Shows information about your steps for today.
- **Error:** Shows a message when something goes wrong.

The `ViewModel` exposes these states as a Kotlin `Flow`. Use a sealed class to
contain the classes and objects that represent the possible states:

```
class TodayScreenViewModel(...) {

  val currentScreenState: MutableStateFlow<TodayScreenState> = MutableStateFlow(Loading)

  [...]

}

sealed class TodayScreenState {
    data object Loading : TodayScreenState()
    data class Content(val steps: Long, val dailyGoal: Long) : TodayScreenState()
    data object Error: TodayScreenState()
}
```

Compose UI then collects this `Flow` as a Compose `State` and acts on it:

```
val state: TodayScreenState = todayScreenViewModel.currentScreenState.collectAsState().value
```

Content and code samples on this page are subject to the licenses described in the [Content License](https://developer.android.com/license). Java and OpenJDK are trademarks or registered trademarks of Oracle and/or its affiliates.

Last updated 2026-07-21 UTC.




\[\[\["Easy to understand","easyToUnderstand","thumb-up"\],\["Solved my problem","solvedMyProblem","thumb-up"\],\["Other","otherUp","thumb-up"\]\],\[\["Missing the information I need","missingTheInformationINeed","thumb-down"\],\["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"\],\["Out of date","outOfDate","thumb-down"\],\["Samples / code issue","samplesCodeIssue","thumb-down"\],\["Other","otherDown","thumb-down"\]\],\["Last updated 2026-07-21 UTC."\],\[\],\[\]\]