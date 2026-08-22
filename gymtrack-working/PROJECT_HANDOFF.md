# PROJECT HANDOFF — הרוטינה שלי (My Routine / GymTrack)

## PROJECT OVERVIEW
**My Routine** (הרוטינה שלי / GymTrack) is a mobile-first, full-Hebrew, true RTL web application designed for workout tracking, exercise library management, and daily nutrition logging. The application enables users to follow custom workout programs, log sets with independent weights and reps, execute supersets and drop sets, track personal records, and log nutrition using a comprehensive Israeli supermarket food database with calorie-based food swapping.

---

## TECH STACK
- **Framework**: React 19 + TypeScript
- **Router**: TanStack Router (`@tanstack/react-router`)
- **Server/Start**: TanStack Start (`@tanstack/react-start`)
- **Query/State**: TanStack Query (`@tanstack/react-query`)
- **Styling**: Tailwind CSS v4 + `tw-animate-css`
- **Icons**: Lucide React (`lucide-react`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Build Tool / Package Manager**: Vite + Bun / npm

---

## INSTALLATION
```bash
# Clone the repository
git clone https://github.com/mayayosfan234/my-gym-muse-53.git
cd my-gym-muse-53

# Install dependencies
bun install
# or
npm install
```

---

## DEVELOPMENT
To start the local development server:
```bash
bun run dev
# or
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## BUILD
To build the application for production:
```bash
bun run build
# or
npm run build
```

---

## ENVIRONMENT VARIABLES
No external environment variables are required for basic offline local storage operation. All user data, workouts, exercises, history, and nutrition logs persist in browser `localStorage` (`gymtrack.v1`).

---

## ARCHITECTURE
```
src/
├── components/
│   ├── AppShell.tsx        # RTL Header, floating bottom pill navigation
│   └── Stepper.tsx         # Numeric stepper input with unlimited value range (> 9)
├── lib/
│   ├── gym-types.ts        # TypeScript models for exercises, workouts, meals, history
│   ├── gym-store.ts        # State management (useGym hook), seed data, CRUD & calculations
│   └── israeli-food-db.ts  # Database of 488 distinct Israeli supermarket food products
├── routes/
│   ├── __root.tsx          # Root route, lang="he", dir="rtl", scroll-to-top handler
│   ├── index.tsx           # Dashboard / Home screen
│   ├── programs.index.tsx  # Programs list
│   ├── programs.$programId.tsx # Program details & day management
│   ├── programs.$programId.$dayId.tsx # Day / Workout builder
│   ├── session.$workoutId.tsx # Active Workout live logging
│   ├── exercises.index.tsx # Exercise Library (search, muscle/equipment filters)
│   ├── exercises.$exerciseId.tsx # Exercise Details & Editor
│   ├── nutrition.index.tsx # Daily Nutrition log & Calorie-Based Food Replacement
│   ├── nutrition.foods.index.tsx # Food Library (488 Israeli foods)
│   ├── nutrition.foods.$foodId.tsx # Food Details & Editor
│   └── history.tsx         # Workout History
└── styles.css              # Soft Pastel aesthetic tokens, typography (Heebo/Assistant)
```

---

## STORE
The application uses a reactive external store pattern (`useSyncExternalStore`) in `src/lib/gym-store.ts`.
- **Key**: `gymtrack.v1` in `localStorage`.
- **Subscribers**: Automatically re-renders UI components when data updates.
- **Migration**: Safely migrates older data structures while preserving user records.

---

## WORKOUT SYSTEM
- **Programs**: Named training templates (e.g. 4-day split).
- **Initial Seed Program**:
  1. פלג גוף תחתון 1
  2. פלג גוף עליון 1
  3. פלג גוף תחתון 2
  4. פלג גוף עליון 2
- **Per-Set Weight Support**: Each set inside an exercise has an independent weight, reps, and dropSet flag (`WorkingSet`).
- **Target Rep Ranges vs Actual Reps**: Supports target ranges (e.g., 8–10) while recording exact reps performed (e.g., 9).
- **Explicit Supersets**: Supersets are created explicitly by connecting adjacent exercises. Grouped exercises are visually linked with badges (A1, A2, etc.).
- **Drop Sets**: Sets can be flagged as Drop Sets with reduced weight and logged in workout history.
- **Warm-up Sets**: Supports warm-up sets with no single-digit restriction (values > 9 supported).
- **Active Workout Session**: Live logging with timer overlay, set completion toggles, weight/reps adjustments, and exercise detail card modal that opens without losing workout state.

---

## EXERCISE SYSTEM
- **Expanded Taxonomy**:
  - Muscle Groups: חזה, חזה עליון, חזה תחתון, גב, גב רחב, טרפזים, גב תחתון, כתפיים, כתף קדמית, כתף צידית, כתף אחורית, ביצפס (יד קדמית), טריצפס (יד אחורית), אמות, בטן, אלכסונים, ישבן, ארבע ראשי, המסטרינג, תאומים, מקרבים, מרחיקים, כופפי הירך, צוואר, גוף מלא, אירובי, אחר.
  - Multi-select support (`muscleGroups` array).
  - Custom "אחר" muscle group text persisted in `customMuscleGroup`.
- **Equipment Taxonomy**: מוט, סמית' משין, משקוליות יד, פולי / כבלים, מכונה, מוט W / EZ, קטלבל, משקל גוף, גומיית התנגדות, משקל גוף בתוספת משקל, אחר.
- **Personal Notes & Cues**: Preserved across workouts and editable per exercise.

---

## NUTRITION & FOOD DATABASE
- **Israeli Food Database**: Located in `src/lib/israeli-food-db.ts`, containing **488 distinct realistic food/product entries** from Israeli supermarkets (Tnuva, Strauss, Tara, Piraeus, Angel, Berman, Osem, GDM, etc.).
- **Variations Included**:
  - Dairy: Milk 1%, 3%; Cottage 3%, 5%, 9%, Pro 12g; White Cheese 3%, 5%, 9%; Yellow Cheese 9%, 15%, 28%; Danone Pro 20g (unflavored, strawberry, vanilla, peach), Go 20g, Skyr, Greek yogurt, Labneh, Feta 5%/16%, Mozzarella light.
  - Eggs: ביצה S, ביצה M, ביצה L, ביצה XL, egg whites, egg yolks.
  - Edamame & Soy: אדממה / Edamame (100g), frozen edamame, Tofu classic/silken, Tivall, Beyond Burger.
  - Meats, Poultry & Fish: Chicken breast (raw/cooked), Pargiot, Wings, Ground beef 5%/12%/20%, Entrecote, Sinta, Shaitel, Turkey breast, Pastrami 1%/2%/3%, Tuna in water/oil, Salmon, Tilapia, Denis, Sardines.
  - Carbs & Grains: White/Basmati/Jasmine/Brown/Black rice, Whole wheat pasta, Couscous, Bulgur, Quinoa, Buckwheat, Oats/Quaker, Potatoes, Sweet potatoes, Breads (Angel/Berman whole wheat, spelt, light), Pitas (spelt light, whole wheat), Tortillas, Rice cakes, Crispbread.
  - Legumes, Fruits, Vegetables, Nuts, Spreads, Protein Bars & Snacks.

---

## CALORIE-BASED FOOD REPLACEMENT
The application implements an exact mathematical calorie-matching replacement formula:
```ts
// Formula:
replacementGrams = (targetCalories * 100) / replacementCaloriesPer100g
```
- **How it works**: When swapping Food A (e.g. 300 kcal target) with Food B (e.g. 150 kcal per 100g), the system calculates `requiredQuantity = targetCalories / foodB.calories` (2.0 = 200g), preserving the energy target while scaling protein, carbs, and fat proportionally.

---

## HISTORY & RELATIVE DATES
- Workout history records sessions with duration, total volume (kg), and logged sets.
- Dates are displayed in natural Hebrew:
  - היום (Today)
  - אתמול (Yesterday)
  - לפני יומיים (2 days ago)
  - לפני 3 ימים (3 days ago)
  - השבוע (This week)
  - החודש (This month)

---

## RTL & HEBREW LOCALIZATION
- Application level: `lang="he"`, `dir="rtl"` in `<html>` and `<body>`.
- Locale: `he-IL` for date and number formatting.
- Directional CSS: Converted to logical or RTL equivalents (`text-start`, `text-end`, `ms-`, `me-`, `ps-`, `pe-`).

---

## MOBILE-FIRST & PWA
- Primary viewport target: iPhone screen sizes.
- Floating pill bottom navigation bar in Hebrew.
- PWA configured in `public/manifest.json` with standalone display, theme color `#567765`, and iOS metadata in root route.

---

## COMPLETED FEATURES
- [x] Full Hebrew UI translation for all screens.
- [x] True RTL layout throughout the app.
- [x] Initial seed program with 4 Hebrew workout days (פלג גוף תחתון 1, פלג גוף עליון 1, פלג גוף תחתון 2, פלג גוף עליון 2).
- [x] Per-set weight and reps editing in builder and active workout.
- [x] Target rep ranges vs actual reps performed.
- [x] Explicit supersets with A1/A2 badges and connect/disconnect controls.
- [x] Drop Sets support in builder, live workout session, and history.
- [x] Warm-up values > 9 supported without single-digit limits.
- [x] Exercise detail modal during active workout without resetting timer or state.
- [x] Expanded Hebrew muscle group taxonomy + multi-select + custom "אחר" group.
- [x] 488 distinct Israeli supermarket food entries database.
- [x] Calorie-based food replacement engine with exact mathematical formula.
- [x] Fixed food detail page scroll bug (instant scroll to top on navigation).
- [x] Soft Pastel design palette (Sage, Cream, Soft Pink, Neutral).
- [x] Mobile-first design and PWA configuration.
- [x] Successful production build.

---

## KNOWN LIMITATIONS
None. All requirements specified in the project brief have been implemented and verified.

---

## PROMPT FOR ANOTHER AI CODING AGENT

> **IMPORTANT instructions for any AI coding agent continuing this project:**
>
> This is an **EXISTING** GymTrack / My Routine application.
> **DO NOT rebuild the app from scratch.**
> **DO NOT replace the existing architecture unnecessarily.**
> **DO NOT throw away the existing implementation.**
>
> 1. Read the existing codebase first (`src/lib/gym-types.ts`, `src/lib/gym-store.ts`, `src/lib/israeli-food-db.ts`, `src/routes/`).
> 2. Continue from the current GitHub repository (`mayayosfan234/my-gym-muse-53`).
> 3. Preserve existing functionality and data models:
>    - Full Hebrew UI (`lang="he"`, `dir="rtl"`, locale `he-IL`).
>    - Soft Pastel design system (Sage, Cream, Soft Pink, Neutral).
>    - Mobile-first responsive layout (iPhone target).
>    - Fitness tracking: programs, workout days, exercise library, active workouts, workout history.
>    - Per-set weights, rep ranges vs actual reps, explicit supersets, drop sets, warm-up values > 9.
>    - Expanded Hebrew muscle group taxonomy with multi-select and custom "אחר" muscle group.
>    - 488 distinct Israeli supermarket food entries database (`israeli-food-db.ts`).
>    - Calorie-based food replacement engine (formula: `replacementGrams = (targetCalories * 100) / replacementCaloriesPer100g`).
>    - Instant scroll-to-top on food and exercise detail pages.
>    - PWA configuration (`manifest.json` and web app metadata).
> 4. Test all changes and ensure `bun run build` passes before submitting.
