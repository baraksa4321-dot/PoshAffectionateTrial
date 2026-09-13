export type UserRole = "owner" | "coach" | "client";
export type ThemePalette =
  | "pink"
  | "blue"
  | "green"
  | "black"
  | "lavender"
  | "peach"
  | "rose-gold"
  | "dark-brown"
  | "light-brown"
  | "cream";

export type ClientLink = {
  id: string;
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  createdAt: string;
};

export type DropSetLevel = {
  weight: number;
  repsMin: number;
  repsMax?: number;
};

export type DropSetConfig = {
  enabled: boolean;
  drops: number;
  repsMin?: number;
  repsMax?: number;
  /** Fixed weight + reps for each drop level (e.g. 60kg 8-10, 30kg 6-8). Preferred over the legacy reduction fields below. */
  levels?: DropSetLevel[];
  /** @deprecated legacy percent/kg reduction fields, kept only so older saved plans keep working */
  reductionMode?: "percent" | "kg";
  reductionValue?: number;
  weightReductionPercent?: number;
  percentReduction?: number; // e.g. 20%
};

export type Exercise = {
  id: string;
  name: string;
  /** Optional bilingual labels. `name` remains the legacy display value for saved records. */
  nameHe?: string;
  nameEn?: string;
  /** Canonical movement labels used when equipment variants share one exercise. */
  canonicalName?: string;
  canonicalNameHe?: string;
  muscleGroup: string;
  /** Primary and secondary muscle groups worked (multi-select). */
  muscleGroups?: string[];
  /** Optional custom muscle group text when "אחר" is selected. */
  customMuscleGroup?: string;
  /** Optional secondary muscles worked. */
  secondaryMuscles?: string[];
  /** Coach-selected exercises that can replace this movement. */
  approvedSubstitutes?: string[];
  /** Optional free-form category (e.g. מורכב, בידוד, עזר). */
  category?: string;
  equipment: string;
  /** Equipment choices available when prescribing this movement. */
  equipmentOptions?: string[] | undefined;
  /** Optional image URL per equipment choice in the exercise/equipment library. */
  equipmentImages?: Record<string, string> | undefined;
  /** Optional grips shown when the selected equipment is cable / pulley. */
  cableGripOptions?: string[] | undefined;
  /** Optional image URL per cable grip choice in the exercise/grip library. */
  cableGripImages?: Record<string, string> | undefined;
  description: string;
  /** Optional step-by-step execution instructions. */
  instructions?: string;
  videoUrl: string;
  /** Up to two coach-provided demonstration videos. `videoUrl` remains the legacy first URL. */
  videoUrls?: string[];
  /** Gender-specific demonstration videos shown to the matching user. */
  videoMaleUrl?: string;
  videoFemaleUrl?: string;
  images: string[];
  notes: string;
  /** Optional technique tips / cues. */
  tips?: string;
};

export type RepType = "fixed" | "range";

export type WarmupSet = {
  id: string;
  weight: number;
  reps: number;
  repsMax?: number;
};

export type WorkingSet = {
  id: string;
  setNumber: number;
  setType?: "normal" | "warmup" | "drop" | "superset";
  weight: number;
  reps: number;
  repMax?: number;
  rest?: number;
  notes?: string;
  dropSet?: boolean;
};

export type WorkoutItem = {
  id: string;
  exerciseId: string;
  /** Snapshot used when a custom exercise is not present in the viewer's catalog yet. */
  exerciseName?: string;
  /** Equipment selected for this prescription, separate from the catalog default. */
  equipment?: string;
  /** Cable grip selected for this prescription, when equipment is cable / pulley. */
  cableGrip?: string | undefined;
  sets: number;
  reps: number;
  /** Human-readable unit for skill challenges, e.g. "שניות" or "ניסיונות". */
  targetLabel?: string;
  repType?: RepType;
  repMin?: number;
  repMax?: number;
  workingSets?: WorkingSet[];
  targetWeight?: number;
  weight: number;
  rest: number; // seconds
  notes: string;
  techniqueNotes?: string;
  approvedAlternatives?: string[];
  /** Coach-selected bodyweight equivalent for this exercise. */
  bodyweightAlternativeId?: string;
  /** Coach-selected equipment-only alternatives, keyed by equipment label. */
  equipmentAlternatives?: Record<string, string>;
  dropSetConfig?: DropSetConfig;
  tempo?: string;
  rir?: number | null;
  rpe?: number | null;
  /** Optional running distance target represented by this item. */
  distanceKm?: number | undefined;
  /** Optional treadmill/cardio prescription values shown with the item. */
  targetSpeedKmH?: number | undefined;
  targetInclinePct?: number | undefined;
  warmups?: WarmupSet[];
  supersetId?: string;
  supersetPartnerId?: string;
  supersetOrder?: 1 | 2;
  supersetTargetWeight?: number;
  supersetRepsMin?: number;
  supersetRepsMax?: number;
};

export type Workout = {
  id: string;
  name: string;
  notes: string;
  items: WorkoutItem[];
  /** Optional Sunday-first weekly slot used for the trainee's workout plan. */
  weekday?: number;
  /** Marks challenge workouts that should also appear in the cardio log. */
  cardioType?: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  category: "סבולת" | "כוח" | "מיומנות" | "עצימות" | "אירובי";
  difficulty: "מתחילים" | "ביניים" | "מתקדמים";
  durationLabel: string;
  accent: "sage" | "peach" | "lavender" | "sand";
  /** General fueling and recovery guidance shown with built-in challenges. */
  nutritionTips?: string[];
  sessions: Workout[];
  ownerId?: string;
  isBuiltIn?: boolean;
  isPublished?: boolean;
  updatedAt?: string;
};

export type ChallengeEnrollment = {
  id: string;
  challengeId: string;
  workoutIds: string[];
  /** Snapshot used to restore generated challenge workouts on a new device. */
  workouts?: Workout[];
  startedAt: string;
  active: boolean;
};

export type Program = {
  id: string;
  name: string;
  notes: string;
  dayIds: string[];
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type LoggedSet = {
  reps: number;
  weight: number;
  done: boolean;
  notes?: string;
  targetReps?: number;
  targetRepMax?: number;
  warmup?: boolean;
  dropSet?: boolean;
  dropLevel?: number;
};

export type HistoryEntry = {
  exerciseId: string;
  exerciseName: string;
  /** Original planned exercise when this entry was replaced during a session. */
  replacedExerciseId?: string;
  replacedExerciseName?: string;
  equipment?: string;
  /** Cable grip used for this completed exercise, when recorded. */
  cableGrip?: string | undefined;
  videoUrl?: string;
  /** Private workout-video object path used to refresh the signed playback URL. */
  videoPath?: string;
  sets: LoggedSet[];
  notes: string;
  targetSets?: number;
  targetReps?: number;
  targetRepMax?: number;
  repType?: RepType;
  feedback?: {
    rating?: "easy" | "appropriate" | "difficult";
    notes?: string;
  };
};

export type HistorySession = {
  id: string;
  workoutId: string;
  workoutName: string;
  programName?: string;
  date: string; // ISO
  durationSec: number;
  entries: HistoryEntry[];
  notes?: string;
  difficultyRating?: "easy" | "appropriate" | "difficult";
  discomfortNotes?: string;
};

export type FoodItem = {
  id: string;
  name: string;
  englishName?: string;
  category?: string;
  brand?: string;
  servingSize: string;
  /** Weight represented by the reference serving, when known reliably. */
  servingGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
  searchTerms?: string[];
  favorite?: boolean;
  approvedSubstitutes?: string[];
  ownerId?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  catalog?: FoodCatalogMetadata;
  /** Audit trail for nutrition values; empty means the legacy value was not re-verified. */
  nutritionReview?: {
    status: "unreviewed" | "reviewed";
    /** How the values entered the library; this is intentionally separate from approval. */
    origin?: "estimated" | "label" | "verified";
    checkedAt?: string;
    confidence?: "low" | "medium" | "high";
    sources: Array<{
      name: string;
      url?: string;
      kind:
        | "manufacturer"
        | "retailer-product-page"
        | "israeli-database"
        | "food-dictionary"
        | "usda"
        | "open-food-facts"
        | "label-photo";
      match: "exact-product" | "same-food" | "comparison";
      valuesPer: "100g" | "100ml" | "serving";
    }>;
    method?: "official" | "retailer-product-page" | "average-matching-sources" | "existing-value";
    notes?: string;
  };
};

export type MealFood = {
  id: string;
  foodId?: string;
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
  timeLogged?: string; // HH:MM
  /** Links a logged food back to a prescribed menu food for per-food tracking. */
  sourcePlanMealId?: string;
  sourcePlanFoodId?: string;
  /** Coach-approved food IDs that may replace this planned/logged item. */
  approvedSubstitutes?: string[];
  /** Set only on the actual log when a planned food was replaced. */
  substitutedFromFoodId?: string;
  substitutedFromFoodName?: string;
};

export type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  /** The prescribed meal this actual-log meal came from, when applicable. */
  sourcePlanId?: string;
  /** Optional grouping for coach-prescribed meal choices. Legacy meals are standalone options. */
  mealOptionGroupId?: string;
};

export type NutritionDay = {
  id?: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  /** Meals prescribed by a coach; kept separate from the client's actual log. */
  plannedMeals?: Meal[];
  waterMl?: number;
  waterTargetMl?: number;
  /** Daily targets captured with the row so later global target changes do not rewrite history. */
  targetCalories?: number;
  targetProtein?: number;
};

export type NutritionTargets = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
};

export type SavedRecipe = {
  id: string;
  name: string;
  foods: MealFood[];
};

export type FoodCatalogProductType = "powder" | "bar" | "drink" | "pudding" | "yogurt" | "other";
export type FoodCatalogSource = "curated-israel" | "open-food-facts";
export type FoodCatalogVerification =
  "curated-unverified" | "manufacturer-verified" | "external-unverified";

export type FoodCatalogMetadata = {
  barcode?: string;
  source: FoodCatalogSource;
  sourceProductId: string;
  sourceUrl?: string;
  productType: FoodCatalogProductType;
  market: "IL";
  packageSize?: string;
  syncedAt?: string;
  sourceUpdatedAt?: string;
  verificationStatus: FoodCatalogVerification;
};

export type BodyWeightLog = {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
};

export type BodyMeasurement = {
  id: string;
  date: string; // YYYY-MM-DD
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  neckCm?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  notes?: string;
};

export type ClientHabits = {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  stepsTarget: number;
  weighInDone: boolean;
  workoutDone: boolean;
  busyDayMode: boolean;
};

export type CoachMessage = {
  id: string;
  coachId: string;
  clientId: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
};

export type BroadcastAnnouncement = {
  id: string;
  senderId: string;
  audience: "assigned_clients" | "coaches" | "clients" | "everyone";
  message: string;
  createdAt: string;
};

export type CoachChangeHistory = {
  id: string;
  coachId: string;
  clientId: string;
  changeDescription: string;
  createdAt: string;
};

export type FoodPreferences = {
  liked: string[];
  disliked: string[];
};

export type CardioLog = {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  durationMin: number;
  intensity?: "low" | "moderate" | "high";
  speed?: number; // km/h
  incline?: number; // %
  distanceKm?: number;
  calories: number;
};

export type UserProfile = {
  fullName?: string;
  weight: number; // kg
  height?: number; // cm
  /** ISO date (YYYY-MM-DD); age is derived from this value. */
  dateOfBirth?: string;
  /** Legacy/cache field kept for BMR compatibility; never edited directly in the UI. */
  age?: number;
  gender?: "female" | "male";
  /** Owner-controlled loading presentation override. Undefined follows gender defaults. */
  loadingAnimationsEnabled?: boolean;
  workoutsPerWeek?: number;
  role?: UserRole;
  approvalStatus?: "pending" | "approved" | "rejected";
  coachId?: string;
  foodPreferences?: FoodPreferences;
  todayRoutineEnabled?: boolean;
  nextCheckinDate?: string;
  /** Presentation-only calorie visibility. Nutrition values remain stored. */
  showCalories?: boolean;
  theme?: ThemePalette;
};

export type ReminderPreferences = {
  enabled: boolean;
  deliveryState: "not-configured" | "ready" | "paused" | "error";
  lastAttemptAt?: string;
  /** Human-readable setup detail kept locally so the profile can explain a failed permission/setup attempt. */
  deliveryDetail?: string;
  /** Legacy fields are accepted during migration but are no longer shown or edited. */
  quietHoursStart?: string;
  quietHoursEnd?: string;
  types?: Array<"workout" | "nutrition" | "checkin">;
};

export type SyncConflict = {
  id: string;
  detectedAt: string;
  scope: "workspace";
  status: "unresolved" | "keep-local" | "use-remote";
  localSnapshot: GymData;
  remoteSnapshot: GymData;
};

export type GymData = {
  exercises: Exercise[];
  /** Library items hidden by this user; kept local so built-in catalog edits persist. */
  deletedExerciseIds?: string[];
  /** Built-in and personal foods explicitly hidden by this user. */
  deletedFoodIds?: string[];
  deletedEquipmentOptions?: string[];
  deletedCableGripOptions?: string[];
  /** Explicit local deletions; sync must never infer deletion from an incomplete snapshot. */
  deletedWorkoutIds?: string[];
  deletedProgramIds?: string[];
  deletedChallengeIds?: string[];
  deletedSessionIds?: string[];
  deletedBodyWeightLogDates?: string[];
  deletedNutritionDayIds?: string[];
  deletedRecipeIds?: string[];
  deletedCardioLogIds?: string[];
  deletedFavoriteFoodIds?: string[];
  workouts: Workout[];
  programs: Program[];
  challenges: Challenge[];
  /** Personal, local-first challenge journeys selected from the library. */
  challengeEnrollments?: ChallengeEnrollment[];
  history: HistorySession[];
  /* nutrition */
  foods: FoodItem[];
  nutritionDays: NutritionDay[];
  nutritionTargets: NutritionTargets;
  /** Coach-prescribed menu shared across all calendar dates. */
  plannedMeals?: Meal[];
  mealTemplate: string[];
  recipes?: SavedRecipe[];
  recentFoods?: string[];
  favoriteFoods?: string[];
  bodyWeightLogs?: BodyWeightLog[];
  bodyMeasurements?: BodyMeasurement[];
  habits?: ClientHabits[];
  coachMessages?: CoachMessage[];
  broadcasts?: BroadcastAnnouncement[];
  changeHistory?: CoachChangeHistory[];
  cardioLogs?: CardioLog[];
  userProfile?: UserProfile;
  clients?: ClientLink[];
  preExitChecklist?: ChecklistItem[];
  /** Local-first notification preference plus the current device delivery state. */
  reminderPreferences?: ReminderPreferences;
  /** Never resolve a concurrent edit silently; the UI presents these snapshots. */
  syncConflicts?: SyncConflict[];
};

export function reportDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function visibleProgramNote(notes?: string | null): string {
  const value = notes?.trim() ?? "";
  return value === "תוכנית נבנתה על ידי המאמן" || value === "תוכנית אישית שנבנתה במרחב הניהול"
    ? ""
    : value;
}

export function reportSessionDateKey(sessionDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) return sessionDate;

  const date = new Date(sessionDate);
  if (Number.isNaN(date.getTime())) return sessionDate.slice(0, 10);
  return reportDateKey(date);
}

function historyEntryKey(entry: HistoryEntry) {
  return JSON.stringify({
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    replacedExerciseId: entry.replacedExerciseId ?? "",
    replacedExerciseName: entry.replacedExerciseName ?? "",
    equipment: entry.equipment ?? "",
    cableGrip: entry.cableGrip ?? "",
    videoUrl: entry.videoUrl ?? "",
    sets: entry.sets,
    notes: entry.notes ?? "",
    targetSets: entry.targetSets ?? null,
    targetReps: entry.targetReps ?? null,
    targetRepMax: entry.targetRepMax ?? null,
    repType: entry.repType ?? null,
    feedback: entry.feedback ?? null,
  });
}

function dedupeHistoryEntries(entries: HistoryEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = historyEntryKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Removes exact duplicate saves from read models without merging distinct
 * executions on the same date. The newest copy wins when a retry reused an
 * existing session id; content-identical sessions on the same day are also
 * collapsed.
 */
export function dedupeHistorySessions(history: HistorySession[]): HistorySession[] {
  const seenIds = new Set<string>();
  const seenExecutions = new Set<string>();

  return [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((session) => ({
      ...session,
      entries: dedupeHistoryEntries(session.entries),
    }))
    .filter((session) => {
      const executionKey = JSON.stringify({
        workoutId: session.workoutId,
        workoutName: session.workoutName,
        date: session.date,
        durationSec: session.durationSec,
        entries: session.entries.map(historyEntryKey),
        notes: session.notes ?? "",
        difficultyRating: session.difficultyRating ?? "",
        discomfortNotes: session.discomfortNotes ?? "",
      });
      if (seenIds.has(session.id) || seenExecutions.has(executionKey)) return false;
      seenIds.add(session.id);
      seenExecutions.add(executionKey);
      return true;
    });
}

export function dedupeWorkoutItems(items: WorkoutItem[]): WorkoutItem[] {
  const seenIds = new Set<string>();
  const seenExercises = new Set<string>();
  return items.filter((item) => {
    if (seenIds.has(item.id) || seenExercises.has(item.exerciseId)) return false;
    seenIds.add(item.id);
    seenExercises.add(item.exerciseId);
    return true;
  });
}

export function getWorkoutSessionsForDate(
  history: HistorySession[],
  reportDate: string,
): HistorySession[] {
  return dedupeHistorySessions(
    history.filter((session) => reportSessionDateKey(session.date) === reportDate),
  );
}

export function getWorkoutReportWeekDates(weekOffset = 0, referenceDate = new Date()): string[] {
  const weekStart = new Date(referenceDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return reportDateKey(date);
  });
}

export function getNextWorkoutReportWeekOffset(weekOffset: number): number {
  return Math.min(0, weekOffset + 1);
}

export function getWorkoutReportSessions(
  history: HistorySession[],
  workout: Workout,
  weekDates: string[],
): HistorySession[] {
  const weekStart = weekDates[0]!;
  const weekEnd = weekDates[weekDates.length - 1]!;
  return dedupeHistorySessions(
    history.filter(
      (session) =>
        (session.workoutId === workout.id ||
          (!session.workoutId && session.workoutName === workout.name)) &&
        reportSessionDateKey(session.date) >= weekStart &&
        reportSessionDateKey(session.date) <= weekEnd,
    ),
  );
}

/**
 * Daily reports intentionally show one saved execution. History can contain
 * multiple legitimate executions on the same date, but the daily coach view
 * is a compact review and should use the newest one.
 */
export function getWorkoutReportSessionForDate(
  history: HistorySession[],
  workout: Workout,
  reportDate: string,
): HistorySession | undefined {
  return getWorkoutReportSessions(history, workout, [reportDate])[0];
}

export const MUSCLE_GROUPS = [
  "חזה",
  "חזה עליון",
  "חזה תחתון",
  "גב",
  "גב רחב",
  "טרפזים",
  "גב תחתון",
  "כתפיים",
  "כתף קדמית",
  "כתף צידית",
  "כתף אחורית",
  "ביצפס (יד קדמית)",
  "טריצפס (יד אחורית)",
  "אמות",
  "בטן",
  "אלכסונים",
  "ישבן",
  "ארבע ראשי",
  "המסטרינג",
  "תאומים",
  "GLUTEUS MAXIMUS",
  "GLUTEUS MEDIUS",
  "GLUTEUS MINIMUS",
  "HAMSTRINGS",
  "QUADRICEPS",
  "CALVES",
  "OBLIQUES",
  "UPPER ABS",
  "CORE",
  "מקרבים",
  "מרחיקים",
  "כופפי הירך",
  "צוואר",
  "גוף מלא",
  "אירובי",
  "אחר",
];

export const EQUIPMENT = [
  "מוט",
  "סמית' משין",
  "משקוליות יד",
  "פולי / כבלים",
  "מכונה",
  "מוט W / EZ",
  "קטלבל",
  "משקל גוף",
  "גומיית התנגדות",
  "משקל גוף בתוספת משקל",
  "אחר",
];

export const CABLE_GRIPS = [
  "חבל",
  "מוט ישר",
  "מוט W / EZ",
  "מאחז יחיד",
  "מוט קצר",
  "מאחז רחב",
  "מאחז צר",
  "אחר",
];

export const EXERCISE_CATEGORIES = [
  "מורכב",
  "בידוד",
  "עזר",
  "מכונה",
  "אירובי",
  "גמישות / ניעות",
  "אחר",
];

export const DEFAULT_MEALS = [
  "ארוחת בוקר",
  "נשנוש בוקר",
  "ארוחת צהריים",
  'נשנוש אחה"צ',
  "ארוחת ערב",
  "נשנוש לילה",
];

export const CARDIO_TYPES = [
  "הליכון (Treadmill)",
  "הליכה",
  "ריצה",
  "אופני כושר",
  "רכיבת אופניים",
  "אליפטיקל",
  "מדרגות (StairMaster)",
  "חתירה (Rowing)",
  "שחייה",
  "טניס",
  "כדורסל",
  "כדורגל",
  "טיול רגלי (Hiking)",
  "קפיצה בחבל",
  "אימון אינטרוולים (HIIT)",
  "אירובי קבוצתי",
];
