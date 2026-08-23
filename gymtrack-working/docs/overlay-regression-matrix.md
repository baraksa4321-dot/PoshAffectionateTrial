# Overlay interaction regression matrix

This is the focused release check for the shared `Overlay` layer. It is
intentionally route-oriented because the project does not currently include a
browser-test runner. The `data-overlay-root` and `data-overlay-panel`
attributes are stable selectors for a future Playwright/Vitest harness.

## Shared behavior

Run each check at a narrow RTL viewport (390 × 844) and once at desktop width.

- Open an overlay and verify `[data-overlay-root="true"]` exists with exactly
  one `[data-overlay-panel="true"]`.
- Verify `document.body.style.overflow` becomes `hidden` while the overlay is
  open and returns to its previous value after closing.
- Click the backdrop (the dialog root, not the panel) and verify it closes.
- Click inside `[data-overlay-panel="true"]` and verify it stays open.
- Press Escape and verify the topmost overlay closes.
- If a picker opens another overlay, press Escape once and verify only the
  topmost picker closes; the parent remains open.
- Reopen the same overlay after closing and verify the current parent values
  are shown, not values from the previous open.
- Use the visible close button and verify it closes exactly once.
- Tab through controls and verify focus remains inside the panel.
- Focus a search/input control with the mobile keyboard emulation enabled and
  verify the panel remains above the visible viewport.

## Main surfaces

| Surface | Route / action | Expected overlay |
| --- | --- | --- |
| Nutrition food picker | `/nutrition` → add food | Food picker search opens; query and quantity are fresh after close/reopen |
| Nutrition replacement | `/nutrition` → replace food | Replacement sheet closes from backdrop, Escape, close button, and keeps the meal page open |
| Nutrition confirmation | Any destructive nutrition action | Confirm sheet supports cancel, visible close, backdrop, and Escape without applying the action |
| Exercise selection | `/coach` → exercise picker | Narrow RTL layout keeps search, close button, and exercise rows reachable |
| Session replacement | `/session/:workoutId` → replace exercise | Replacement sheet closes cleanly and a selected exercise does not leave a stale sheet |
| Body/profile confirmation | `/` → body profile or weigh-in | Closing and reopening shows fresh form state and restores focus to the opener |

## Release acceptance

- No overlay remains mounted after its close action.
- No page remains scroll-locked after the final overlay closes.
- A narrow viewport does not clip the title, close button, search field, or
  primary action.
- No browser console errors are produced during the matrix.