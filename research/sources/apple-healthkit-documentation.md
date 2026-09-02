Source: https://developer.apple.com/documentation/healthkit
Title: HealthKit | Apple Developer Documentation
Fetched: 2026-09-02T12:59:23.292Z

* * *

* * *

[Skip Navigation](https://developer.apple.com/documentation/healthkit#app-main)

Framework

# HealthKit

Access and share health and fitness data while maintaining the user’s privacy and control.

iOS 8.0+iPadOS 8.0+Mac Catalyst 17.0+macOS 14.0+visionOS 1.0+watchOS 2.0+

## [Overview](https://developer.apple.com/documentation/healthkit\#overview)

HealthKit provides a central repository for health and fitness data on iPhone and Apple Watch. With the user’s permission, apps communicate with the HealthKit store to access and share this data.

![An image showing the Health app summary screen.](https://developer.apple.com/tutorials/images/com.apple.healthkit/health-summary@2x.png)

Creating a complete, personalized health and fitness experience includes a variety of tasks:

- Collecting and storing health and fitness data

- Analyzing and visualizing the data

- Enabling social interactions


HealthKit apps take a collaborative approach to building this experience. Your app doesn’t need to provide all of these features. Instead, you can focus just on the subset of tasks that most interests you.

For example, users can select their favorite weight-tracking, step-counting, and health challenge app, each calibrated to their personal needs. Because HealthKit apps freely exchange data (with user permission), the combined suite provides a more customized experience than any single app on its own. For example, when a group of friends joins a daily step-counting challenge, each person can use their preferred hardware device and app to track their steps, while everyone in the group uses the same social app for the challenge.

HealthKit is also designed to manage and merge data from multiple sources. For example, users can view and manage all of their data in the Health App, including adding data, deleting data, and changing an app’s permissions. Therefore, your app needs to handle these changes, even when they occur outside your app.

## [Topics](https://developer.apple.com/documentation/healthkit\#topics)

### [Essentials](https://developer.apple.com/documentation/healthkit\#Essentials)

[About the HealthKit framework](https://developer.apple.com/documentation/healthkit/about-the-healthkit-framework)

Learn about the architecture and design of the HealthKit framework.

[API Reference\\
Setting up HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit)

Set up and configure your HealthKit store.

[Authorizing access to health data](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)

Request permission to read and share data in your app.

[Protecting user privacy](https://developer.apple.com/documentation/healthkit/protecting-user-privacy)

Respect and safeguard your user’s privacy.

[HealthKit updates](https://developer.apple.com/documentation/updates/healthkit)

Learn about important changes to HealthKit.

[HealthKitUI](https://developer.apple.com/documentation/healthkitui)

Display user interface that enables a person to view and interact with their health data.

### [Health data](https://developer.apple.com/documentation/healthkit\#Health-data)

[Saving data to HealthKit](https://developer.apple.com/documentation/healthkit/saving-data-to-healthkit)

Create and share HealthKit samples.

[Reading data from HealthKit](https://developer.apple.com/documentation/healthkit/reading-data-from-healthkit)

Use queries to request sample data from HealthKit.

[`class HKHealthStore`](https://developer.apple.com/documentation/healthkit/hkhealthstore)

The access point for all data managed by HealthKit.

[Creating a Mobility Health App](https://developer.apple.com/documentation/healthkit/creating-a-mobility-health-app)

Create a health app that allows a clinical care team to send and receive mobility data.

[API Reference\\
Data types](https://developer.apple.com/documentation/healthkit/data-types)

Specify the kind of data used in HealthKit.

[API Reference\\
Samples](https://developer.apple.com/documentation/healthkit/samples)

Create and save health and fitness samples.

[API Reference\\
Queries](https://developer.apple.com/documentation/healthkit/queries)

Query health and fitness data.

[Visualizing HealthKit State of Mind in visionOS](https://developer.apple.com/documentation/healthkit/visualizing-healthkit-state-of-mind-in-visionos)

Incorporate HealthKit State of Mind into your app and visualize the data in visionOS.

[Logging symptoms associated with a medication](https://developer.apple.com/documentation/healthkit/logging-symptoms-associated-with-a-medication)

Fetch medications and dose events from the HealthKit store, and create symptom samples to associate with them.

### [Workout data](https://developer.apple.com/documentation/healthkit\#Workout-data)

[API Reference\\
Workouts and activity rings](https://developer.apple.com/documentation/healthkit/workouts-and-activity-rings)

Manage workouts, workout sessions, and activity summaries.

### [Errors](https://developer.apple.com/documentation/healthkit\#Errors)

[`struct HKError`](https://developer.apple.com/documentation/healthkit/hkerror)

An error returned from a HealthKit method.

[`let HKErrorDomain: String`](https://developer.apple.com/documentation/healthkit/hkerrordomain)

The domain for all HealthKit errors.

[`enum Code`](https://developer.apple.com/documentation/healthkit/hkerror/code)

Error codes returned by HealthKit.

### [Reference](https://developer.apple.com/documentation/healthkit\#Reference)

[API Reference\\
HealthKit Enumerations](https://developer.apple.com/documentation/healthkit/healthkit-enumerations)

[API Reference\\
HealthKit Classes](https://developer.apple.com/documentation/healthkit/healthkit-classes)

[API Reference\\
HealthKit Constants](https://developer.apple.com/documentation/healthkit/healthkit-constants)

[API Reference\\
HealthKit Data Types](https://developer.apple.com/documentation/healthkit/healthkit-data-types)

[API Reference\\
HealthKit Functions](https://developer.apple.com/documentation/healthkit/healthkit-functions)

[API Reference\\
Macros](https://developer.apple.com/documentation/healthkit/healthkit-macros)

[API Reference\\
HealthKit Variables](https://developer.apple.com/documentation/healthkit/healthkit-variables)

Current page is HealthKit