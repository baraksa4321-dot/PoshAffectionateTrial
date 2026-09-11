# Web Push closed-browser smoke record

Recorded on 2026-09-11.

## Result

The live send path reached one registered web device while the recipient site
was closed. The Linux headless environment could not expose or inspect the OS
notification surface, so this is **not** a full confirmation that the
notification was displayed or that tapping it opened the route.

## Redacted evidence

- Recipient browser: Chromium 152.0.7977.64, persistent non-incognito profile.
- Sender browser: Chromium 152.0.7977.64, separate persistent profile.
- Notification permission: `granted` on the recipient profile.
- Service Worker: registered and active after notification setup.
- Firebase setup: the app reported that Firebase notifications were enabled.
- Token result: initial Web token registration completed sufficiently for the
  sender to deliver to one device. Token values were not logged or recorded.
- Sender result: the coach broadcast UI reported that the message was sent as a
  Push notification to `1` device.
- Recipient browser state: the recipient profile was closed before the send.
- OS/browser notification displayed: **not observable in this environment**.
- Notification opened route: **not verified**. The existing Service Worker
  click tests pass for scoped deep links, including a coach-messages route.
- Cleanup: the uniquely marked broadcast was deleted through the sender-scoped
  “delete for everyone” action.

## Limitation

The first Playwright context was incognito-style and Chromium explicitly
disabled the Push API there. Repeating the setup with a persistent profile
enabled registration, but the available headless runtime still has no
user-visible notification center for confirming display and click behavior.
Repeat this smoke on two real browsers or devices before treating closed-browser
OS delivery as production-verified.