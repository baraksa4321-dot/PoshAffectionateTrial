export type UserRole = "owner" | "coach" | "client";
export type ThemePalette =
  | "pink"
  | "blue"
  | "beige"
  | "green"
  | "yellow"
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
  muscleGroup: string;
  /** Primary and secondary muscle groups worked (multi-select). */
  muscleGroups?: string[];
  /** Optional custom muscle group text when "אחר" is selected. */
  customMuscleGroup?: string;
  /** Optional secondary muscles worked. */
  secondaryMuscles?: string[];
  /** Optional free-form category (e.g. מורכב, בידוד, עזר). */
  category?: string;
  equipment: string;
  description: string;
  /** Optional step-by-step execution instructions. */
  instructions?: string;
  videoUrl: string;
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
  weight: number;
  reps: number;
  repMax?: number;
  dropSet?: boolean;
};

export type WorkoutItem = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
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
  warmups?: WarmupSet[];
  supersetId?: string;
  supersetPartnerId?: string;
  supersetOrder?: 1 | 2;
  supersetRepsMin?: number;
  supersetRepsMax?: number;
};

export type Workout = {
  id: string;
  name: string;
  notes: string;
  items: WorkoutItem[];
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
  targetReps?: number;
  targetRepMax?: number;
  warmup?: boolean;
  dropSet?: boolean;
  dropLevel?: number;
};

export type HistoryEntry = {
  exerciseId: string;
  exerciseName: string;
  equipment?: string;
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
};

export type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  /** The prescribed meal this actual-log meal came from, when applicable. */
  sourcePlanId?: string;
};

export type NutritionDay = {
  id?: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  /** Meals prescribed by a coach; kept separate from the client's actual log. */
  plannedMeals?: Meal[];
  waterMl?: number;
  waterTargetMl?: number;
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
  age?: number;
  gender?: "female" | "male";
  workoutsPerWeek?: number;
  role?: UserRole;
  coachId?: string;
  foodPreferences?: FoodPreferences;
  todayRoutineEnabled?: boolean;
  theme?: ThemePalette;
};

export type GymData = {
  exercises: Exercise[];
  workouts: Workout[];
  programs: Program[];
  history: HistorySession[];
  /* nutrition */
  foods: FoodItem[];
  nutritionDays: NutritionDay[];
  nutritionTargets: NutritionTargets;
  mealTemplate: string[];
  recipes?: SavedRecipe[];
  recentFoods?: string[];
  favoriteFoods?: string[];
  bodyWeightLogs?: BodyWeightLog[];
  bodyMeasurements?: BodyMeasurement[];
  habits?: ClientHabits[];
  coachMessages?: CoachMessage[];
  changeHistory?: CoachChangeHistory[];
  cardioLogs?: CardioLog[];
  userProfile?: UserProfile;
  clients?: ClientLink[];
  preExitChecklist?: ChecklistItem[];
};

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
