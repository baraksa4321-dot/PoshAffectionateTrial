# Authenticated iPhone Safari release smoke

This is the repeatable narrow-device check for the authenticated Coach and
active-workout surfaces. The repository does not currently include a browser
test runner, so this remains a manual release gate until one is introduced.

## Setup

- Use a real iPhone Safari session at 390 × 844 or the closest available
  device profile.
- Sign in as a coach who has at least one assigned trainee.
- Use a trainee with a long plan: several exercises, multiple sets, a coach
  note/check-in field, and at least one nutrition meal.
- Keep the browser console visible when running the same flow in a desktop
  device emulator. There should be no new application errors.

## Coach and trainee workspace

1. Open **Coach → Trainees** using the bottom navigation item selected by
   `data-testid="link-nav-coach"`.
2. Select a trainee and verify the workspace opens without closing or jumping
   when the page is first touched.
3. Swipe vertically through the long workspace. Verify both the outer page and
   the workspace cards can reach their final content above the fixed bottom
   navigation; the last card must not remain hidden behind the nav.
4. Open the workout-program view and focus the workout name, exercise search,
   set/reps/weight fields, and coach note fields one at a time.
5. With the keyboard open, verify the focused field is above the visible
   keyboard. Type a multi-digit value, scroll the workspace, dismiss the
   keyboard, and confirm the value is unchanged.
6. Open an exercise or food picker from the workspace. Verify the nested sheet
   remains open while the keyboard is shown, its search field stays visible,
   and closing it returns to the same workspace position.

## Active workout

1. From the trainee's workout plan, open an active workout. The workout route
   is `/session/:workoutId`.
2. Confirm the progress card does not cover the first exercise or its
   “ביצוע בפועל” section.
3. Mark one working set complete and verify the progress percentage and bar
   update immediately. Mark it incomplete and verify they return immediately.
4. Focus the actual weight and reps steppers. Enter a multi-digit value,
   press the keyboard Next/Done action, and verify the value is preserved.
5. Scroll to a later exercise while the keyboard is open. The focused control
   must remain visible, and the progress card must not cover it.
6. Open exercise details/replacement sheets, search, close them, and verify
   the workout remains at the same usable scroll position.

## Pass criteria

- Every long page reaches its final card or action; no content is trapped
  behind the fixed bottom navigation.
- Focused inputs remain visible above the keyboard.
- Typed values survive scrolling, keyboard dismissal, sheet open/close, and
  route transitions.
- Progress changes as sets are toggled and never obscures the active set.
- No overlay remains mounted and no page remains scroll-locked after closing a
  sheet.