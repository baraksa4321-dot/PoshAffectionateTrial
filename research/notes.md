# Research Notes: GymTrack / MyRoutine Fitness & Nutrition Benchmark

**Status:** synthesis complete
**Depth:** Deep

## Plan

- **Question:** What modern gym-tracking and nutrition apps do well, and what should GymTrack/MyRoutine add, remove, or change?
- **Scope:** Strength training, gym logging, progress/adherence, meal planning, nutrition logging, coach-client workflows, localization, privacy, and mobile UX.
- **Audience:** Product owner deciding the next product and UX priorities.
- **Deliverable:** Evidence-based Hebrew report with a current competitor matrix, product gaps, prioritized recommendations, and explicit non-goals.

## Focus Areas

| # | Area | Status | Sources |
|---|---|---|---|
| 1 | Strength training and gym logging | complete | Hevy, Strong, JEFIT, Fitbod, independent reviews |
| 1 | Strength training and gym logging | complete | Hevy, Strong, JEFIT, Fitbod, independent reviews |
| 2 | Nutrition tracking and meal planning | complete | MyFitnessPal, MacroFactor, Cronometer, Fuder, Israeli sources |
| 3 | Coaching, adherence, and progress loops | complete | Trainerize, TrueCoach, Everfit, My PT Hub |
| 4 | Mobile UX, onboarding, integrations, privacy | complete | Apple Health, HealthKit, Health Connect, Strava, WCAG, usability study |
| 5 | Israel/Hebrew localization and product positioning | complete | Fuder, Israeli Ministry of Health, Mybite, local-market search |

## Coverage Checklist

- [x] What are the table-stakes flows for logging a strength workout quickly?
- [x] Which progression, history, analytics, and recovery features are now expected?
- [x] What makes a nutrition app useful beyond a calorie database?
- [x] Which coach-client workflows create recurring value and retention?
- [x] Which mobile UX patterns reduce friction during a live workout or meal log?
- [x] What are the strongest gaps and complaints in leading products?
- [x] Which opportunities fit GymTrack/MyRoutine's current product and data model?
- [x] What should explicitly not be built yet?

## Findings Log

_[@key] markers will reference the consolidated source registry after collection._

### Area 1 — Strength training and gym logging

The repeated baseline is a fast, single-screen logging loop: show the previous performance while entering the current set; make set types, rest, supersets, notes, and substitutions first-class; and make routines reusable. Hevy, Strong, JEFIT, and Fitbod all frame some combination of logging, templates, progression/history, and personalization as core rather than add-ons. Independent reviews reinforce that prior values, easy routine copying, and quick replacement matter more in the gym than a large content library. See `hevy-features.md`, `hevy-app-store.md`, `strong-history.md`, `strong-pro.md`, `strong-independent-review.md`, `jefit-google-play.md`, `jefit-workout-tab.md`, `fitbod-understanding.md`, and `fitbod-independent-review.md`.

The opportunity is not to copy every advanced program algorithm. GymTrack already has unusually rich prescription primitives (warmups, working sets, drop sets, supersets, tempo, RIR/RPE, equipment/grip alternatives, exercise media, and feedback). The next gap is completing the surrounding loop: weekly scheduling, progression decisions, better history/analytics, and recovery/adherence signals.

### Area 2 — Nutrition tracking and meal planning

Nutrition leaders compete on trust and low-friction capture, not only calorie totals. Cronometer emphasizes verified/lab-analyzed nutrients, micronutrients, barcode/photo/voice/text logging, targets, and device connections. MyFitnessPal emphasizes a large searchable food database, recipes, and premium tracking. MacroFactor differentiates with adaptive targets based on intake and weight trends rather than treating a static calculator as truth. Fuder demonstrates a direct Hebrew/Israeli wedge: local supermarket and restaurant foods, Hebrew photo logging, source/date provenance, and an all-day view of calories, macros, fiber, water, steps, and weight. See the saved nutrition sources and `fuder-food-diary.md`.

GymTrack already has coach-prescribed meals separate from actual logs, targets, servings/portions, recipes, substitutions, water, an Israeli food library, product provenance, shopping-list UI, and AI meal-photo estimation. The evidence says the high-value work is confidence and correction: barcode/label capture, provenance and confidence states, “use this planned meal” with easy substitutions, a weekly adherence summary, and explicit correction of AI estimates—not a larger generic food list.

### Area 3 — Coaching, adherence, and progress loops

Coach platforms turn raw data into exceptions and conversations. Trainerize documents progress dashboards spanning workouts, nutrition, body weight/measurements, steps, sleep, cardio, habits, and weekly compliance. Everfit's July 20, 2026 dashboard documentation adds 4-week adherence trends, nutrition-log coverage, missed tasks, check-in forms, private coach notes, programs ending, and follow-up alerts for at-risk clients or unanswered messages. TrueCoach and My PT Hub position habit assignment, reminders, check-ins, and feedback as retention tools. See the saved coach sources.

GymTrack has the ingredients (coach/owner roles, client links, program/nutrition assignment, messages, body metrics, habits, tracking routes), but should prioritize a coach “who needs attention?” queue over more builder options. A meaningful next step is a weekly review workflow with client status, last activity, exceptions, a check-in form, private notes, and one-tap follow-up.

### Area 4 — Mobile UX, onboarding, integrations, privacy

Platform documentation makes the integration direction clear: HealthKit and Health Connect are durable platform surfaces, while Strava's sync troubleshooting shows that retry/reconnect states are part of the product contract. Apple’s September 2025 health/fitness privacy overview and W3C WCAG guidance support granular permissions, clear data boundaries, export/deletion, keyboard/focus support, and reduced motion. The Accessercise 2025 usability study is a reminder to test the experience with people with disabilities, not only against visual polish.

GymTrack's mobile/PWA work already covers safe areas, loading recovery, keyboard-aware overlays, reduced motion, and offline-first workout/cache behavior. The remaining market gap is visible product trust: sync status that explains what is pending/conflicted, account/data controls, notification preferences, and a measured integration roadmap. Wearables should follow a user job (steps/energy/recovery or workout capture), not be added as logo collection.

### Area 5 — Israel/Hebrew localization and product positioning

Hebrew/RTL alone is not a moat. Fuder's 2026 site claims 5,394 Israeli supermarket products, 392 chain/restaurant meals, and 167 recipes, with label provenance and photo logging; that is a concrete local benchmark. The Israeli Ministry of Health source confirms that food/supplement regulatory information is distributed through official lists and registries, so product safety and source labeling matter. Mybite is a local adjacent wellness/nutrition property, but not evidence that a coach-first strength product is solved.

The strongest positioning is “Hebrew-first coach + trainee operating system”: a live workout logger and adherence cockpit connected to a trustworthy Israeli menu/food layer. Avoid claiming the market is empty; the opportunity is the integrated workflow and coach feedback loop.

## Conflicts & Open Questions

- Official competitor pages overstate differentiation and are not evidence of adoption or outcome; all official feature claims are labeled as such in the report.
- App-store and Capterra samples are self-selected and directional, not representative user research.
- Fuder's catalog numbers are product-site claims and should be rechecked before using them in marketing.
- Israeli competitive coverage is thinner than English-language coverage; validate with 5–10 local coaches and 10–15 trainees before committing to a localization roadmap.
- Fitness/nutrition data are health-adjacent. Product and legal review is needed before adding medical claims, automated calorie adjustments, or sharing data with third parties.

## Gaps

The current codebase inventory is captured in `research/gymtrack-market-analysis.md`. The report distinguishes:

- **Implemented:** rich workout prescription and session logging, workout history/PR helpers, nutrition plans/logs/recipes/portions/water, Israeli food/product metadata, AI meal-photo estimation with editable results, cardio, body metrics, habits, coach messaging/assignment, Supabase sync, offline cache/session recovery, RTL/PWA/mobile accessibility work.
- **Partial or unclear:** calendarized scheduling, progression recommendations, deeper history charts, check-in forms, coach attention queue, notification delivery, and integration permissions.
- **Not evidenced in the inspected code:** barcode/label scanning, HealthKit/Health Connect/wearable connections, push/email reminders, export/delete UI, full sync conflict UI, and a mature multi-client operations dashboard.