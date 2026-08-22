# GymTrack — Light Redesign + My Programs

## Look and feel

Full visual refresh of every screen, same functionality.

- Palette: Sage & Cream — cream background `#f5f0e8`, soft surface `#dce5d4`, muted sage accent `#7d9b76` for buttons and key actions.
- Typography: Outfit for headings, Figtree for body.
- Soft rounded cards (large radius), very subtle shadows instead of heavy borders, generous white space, calm muted text tones.
- Large tap targets, thumb-friendly bottom nav, uncluttered screens.

## Navigation

Bottom nav becomes: Home · Programs · Exercises · History.

The standalone Workouts section is replaced by Programs. Existing saved workouts are migrated once into a program called "My Workouts" so nothing is lost.

## My Programs

- **Programs list** — saved programs as simple cards: name, number of workout days, total exercises. Buttons to create a program and duplicate/delete an existing one.
- **Program detail** — program name (editable inline), list of workout days as cards. Each day shows its name, exercise count, and quick actions: Start, Edit, Duplicate, Delete. Button to add a workout day.
- **Workout day builder** (mobile-first) — name the day (Legs, Push, Pull, Full Body…), add exercises from the Exercise Library via a bottom sheet picker, reorder by drag and drop, and per-exercise set sets / reps / weight / rest / notes with the existing stepper controls. Remove an exercise, save the day.
- Everything is editable later; duplication copies a day or a whole program with fresh IDs.
- Starting a workout day reuses the existing live session screen and saves to History exactly as today.

## Screens refreshed

Home (dashboard), Programs list, Program detail, Workout day builder, Exercise Library, Exercise Details, Live Session, History.

## Technical notes

- `src/styles.css`: replace the dark OKLCH token set with the light palette; keep the token names so components stay unchanged; add Outfit/Figtree via a `<link>` in `src/routes/__root.tsx`.
- `src/lib/gym-types.ts`: add `Program { id, name, notes, days: Workout[] }`; `Workout` gains an optional program link. History keeps its current shape.
- `src/lib/gym-store.ts`: add program CRUD (`savePrograms`, `duplicateProgram`, `duplicateDay`, `deleteProgram`), plus a one-time migration wrapping existing workouts into a default program. Storage stays localStorage.
- Routes: add `programs.index.tsx`, `programs.$programId.tsx`, `programs.$programId.$dayId.tsx`; keep `session.$workoutId.tsx` resolving days from programs; retire `workouts.*` with a redirect from `/workouts` to `/programs`.
- Drag and drop via `@dnd-kit/core` + `@dnd-kit/sortable` with touch sensors (pointer + long-press) so it works well on a phone.
- Each route keeps its own `head()` metadata.
