# Rest-timer delivery

GymTrack has two supported delivery paths:

- **Native iOS and Android:** `@capacitor/local-notifications` schedules the
  timer on the device. The app uses `rest_timer.wav`; Android uses the
  `gymtrack-rest-timer-v1` channel and its channel sound. The OS can deliver
  the alert while the app is backgrounded, locked, or terminated. Users can
  still mute notification sounds at the OS level.
- **Web and installed PWA:** an authenticated browser FCM token is registered
  in `push_tokens`. Starting a timer upserts a durable
  `rest_timer_notifications` row. A scheduled invocation of
  `dispatch-rest-timer-notifications` claims due rows and sends a data-only FCM
  push, so the service worker can display it after the tab/PWA is closed.
  Browsers choose the system notification sound; a custom sound cannot be
  forced by the Web Notifications API. iOS requires an installed PWA,
  permission, and supported iOS Web Push. Android uses the browser/system
  notification sound. A regular web tab without granted notifications cannot
  receive a closed-app alert.

## Deployment

1. Apply migration `61_rest_timer_notifications.sql`.
2. Deploy both Edge Functions:
   `send-fcm-notification` and `dispatch-rest-timer-notifications`.
3. Configure a Supabase scheduled invocation for
   `dispatch-rest-timer-notifications` at `* * * * *` (every minute), using the
   project service-role authorization header. The function rejects all other
   callers.
4. Keep `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and
   `FIREBASE_PROJECT_ID` configured as Edge Function secrets.

The dispatcher is intentionally minute-granularity. It sends overdue rows on
the next tick, rather than pretending a browser or serverless function can
guarantee millisecond timing. The native path remains the exact local schedule.

## Lifecycle and duplicate behavior

- Scheduling is an authenticated upsert by `(user_id, timer_key)`. Reconnect,
  focus, visibility, and online events upsert the same row, so they do not
  create additional alerts.
- Pausing or replacing a timer calls `cancel_rest_timer`; cancellation marks
  scheduled or claimed rows cancelled. A cancellation that races with a push
  already accepted by FCM can still produce that one in-flight alert.
- The dispatcher atomically claims each row before sending. It retries
  transient all-device failures up to three times. A successful send marks the
  row delivered and prevents normal retries from duplicating it.
- Pushes use the stable `rest-timer:<row-id>` message ID and notification tag.
  The service worker persists received message IDs when IndexedDB is
  available, so a service-worker restart does not normally show the same push
  twice. A provider/network failure can be reported without changing the
  timer UI; foreground reconciliation remains the final local state repair.
