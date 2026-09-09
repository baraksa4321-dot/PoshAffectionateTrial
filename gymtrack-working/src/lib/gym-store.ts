import { useSyncExternalStore } from "react";
import { assertValidFoodNutrition, assertValidMealFood } from "./nutrition-integrity";
import { ISRAELI_PROTEIN_PRODUCTS } from "./protein-product-catalog";
import { supabase } from "./supabase";
import { pullSupabaseData, syncLocalToSupabase, type SyncStatus } from "./supabase-sync";
import { normalizeFixedPlannedMenu } from "./nutrition-planning";
import {
  type Challenge,
  type ChallengeEnrollment,
  type BodyMeasurement,
  type BodyWeightLog,
  type CardioLog,
  type Exercise,
  type FoodItem,
  type GymData,
  type HistorySession,
  type Meal,
  type MealFood,
  type NutritionDay,
  type NutritionTargets,
  type Program,
  type ReminderPreferences,
  type SyncConflict,
  type SavedRecipe,
  type UserProfile,
  type ThemePalette,
  type WarmupSet,
  type Workout,
  type WorkoutItem,
} from "./gym-types";
import {
  BUILT_IN_CHALLENGES,
  RETIRED_BUILT_IN_CHALLENGE_IDS,
  cloneChallenge,
} from "./challenge-library";

const KEY = "gymtrack.v1";
const CACHED_USER_KEY = "gymtrack.v1.userId";
const USER_CACHE_PREFIX = "gymtrack.v1.user.";
const USER_PENDING_PREFIX = "gymtrack.v1.pending.";
// Supabase auth and the initial profile/data hydration may cross several
// network boundaries. Four seconds caused valid logins on slower connections
// to be reported as permission failures before the request could finish.
const AUTH_TIMEOUT_MS = 15_000;
const INITIAL_DATA_TIMEOUT_MS = 30_000;
const SYNC_FLUSH_TIMEOUT_MS = 12_000;
const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  enabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  types: ["workout", "nutrition", "checkin"],
  deliveryState: "not-configured",
};
const EMPTY_SYNC_CONFLICTS: SyncConflict[] = [];

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Local calendar date as YYYY-MM-DD (used to key nutrition days). */
export const todayKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const seed = (): GymData => {
  const ex: Exercise[] = [
    {
      id: "ex-bench",
      name: "לחיצת חזה כנגד מוט",
      muscleGroup: "חזה",
      muscleGroups: ["חזה", "טריצפס (יד אחורית)", "כתף קדמית"],
      secondaryMuscles: ["טריצפס (יד אחורית)", "כתפיים"],
      category: "מורכב",
      equipment: "מוט",
      description:
        "שכב על ספה שטוחה, אחוז במוט ברוחב מעט רחב מהכתפיים, הורד אל מרכז החזה ולחץ כלפי מעלה.",
      instructions: "שמור על שכמות צמודות, כפות רגליים יציבות על הרצפה וקשת קלה בגב התחתון.",
      videoUrl: "",
      images: [],
      notes: "לשמור על שכמות צמודות ומכווצות לאורך כל התנועה.",
      tips: "ללחוץ דרך העקבים ולשמור על מסלול מוט יציב.",
    },
    {
      id: "ex-squat",
      name: "סקואט כנגד מוט (Back Squat)",
      muscleGroup: "ארבע ראשי",
      muscleGroups: ["ארבע ראשי", "ישבן", "גב תחתון"],
      secondaryMuscles: ["ישבן", "בטן"],
      category: "מורכב",
      equipment: "מוט",
      description:
        "הנח את המוט על הגב העליון, רד עם האגן אחורה ולמטה עד זווית 90 מעלות לפחות ולחץ חזרה מעלה.",
      instructions: "שמור על חזה מורם וברכיים בקו אחד עם כפות הרגליים.",
      videoUrl: "",
      images: [],
      notes: 'חגורת גב מעל 100 ק"ג.',
      tips: "דחיפה דרך מרכז כף הרגל.",
    },
    {
      id: "ex-row",
      name: "חתירה בכבלים בישיבה",
      muscleGroup: "גב",
      muscleGroups: ["גב", "גב רחב", "ביצפס (יד קדמית)"],
      secondaryMuscles: ["ביצפס (יד קדמית)"],
      category: "מורכב",
      equipment: "פולי / כבלים",
      description: "שב מול הכבל, משוך את הידית לכיוון הטבור והדק את השכמות בסוף התנועה.",
      instructions: "גב זקוף, מתיחה מלאה קדימה וכיווץ חזק בגב לאחור.",
      videoUrl: "",
      images: [],
      notes: "להקפיד לא להשתמש בתנופה מוגזמת של הגב.",
      tips: "למשוך דרך המרפקים ולא דרך כפות הידיים.",
    },
    {
      id: "ex-curl",
      name: "כפילת מרפקים עם משקוליות",
      muscleGroup: "ביצפס (יד קדמית)",
      muscleGroups: ["ביצפס (יד קדמית)", "אמות"],
      secondaryMuscles: ["אמות"],
      category: "בידוד",
      equipment: "משקוליות יד",
      description:
        "עמוד יציב, כפוף את המרפקים והרם את המשקוליות תוך סיבוב קל של כף היד, והורד באיטיות.",
      instructions: "מרפקים צמודים לצדי הגוף, ללא הנדנוד של הגב.",
      videoUrl: "",
      images: [],
      notes: "עבודה נקייה ומבוקרת בחלק השלילי (ירידה).",
      tips: "",
    },
    {
      id: "ex-hipthrust",
      name: "דחיקת אגן כנגד מוט (Hip Thrust)",
      muscleGroup: "ישבן",
      muscleGroups: ["ישבן", "המסטרינג"],
      secondaryMuscles: ["המסטרינג", "ארבע ראשי"],
      category: "מורכב",
      equipment: "מוט",
      description:
        "הנח גב עליון על ספסל, מוט על האגן, הרם את האגן מעלה וכווץ את הישבן בשיא התנועה.",
      instructions: "מבט קדימה, כיווץ מלא של הישבן בשיא הגובה לשנייה אחת.",
      videoUrl: "",
      images: [],
      notes: "לעצור לשנייה אחת בחלק העליון.",
      tips: "",
    },
    {
      id: "ex-plank",
      name: "פלאנק (Plank)",
      muscleGroup: "בטן",
      muscleGroups: ["בטן", "אלכסונים", "גב תחתון"],
      secondaryMuscles: ["כתפיים"],
      category: "בידוד",
      equipment: "משקל גוף",
      description: "החזק גוף ישר על האמות וקצות האצבעות תוך כיווץ חזק של הבטן והישבן.",
      instructions: "גוף בקו ישר אחד מהראש ועד העקבים.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-ohp",
      name: "לחיצת כתפיים בעמידה כנגד מוט",
      muscleGroup: "כתפיים",
      muscleGroups: ["כתפיים", "כתף קדמית", "טריצפס (יד אחורית)"],
      secondaryMuscles: ["טריצפס (יד אחורית)", "בטן"],
      category: "מורכב",
      equipment: "מוט",
      description: "עמוד יציב, לחץ את המוט מגובה החזה העליון מעלה מעל הראש עד נעילה.",
      instructions: "בטן מהודקת וישבן מכווץ לשמירה על הגב.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-rdl",
      name: "דדליפט רומני (RDL)",
      muscleGroup: "המסטרינג",
      muscleGroups: ["המסטרינג", "ישבן", "גב תחתון"],
      secondaryMuscles: ["ישבן", "גב תחתון"],
      category: "מורכב",
      equipment: "מוט",
      description:
        "אחוז במוט, קח את האגן אחורנית תוך כפיפה קלה בברכיים והורד את המוט לאורך הרגליים.",
      instructions: "גב ישר לחלוטין, מתיחה חזקה בחלק האחורי של הירכיים.",
      videoUrl: "",
      images: [],
      notes: "מתיחה מורגשת בהמסטרינג.",
      tips: "",
    },
    {
      id: "ex-incline-bench",
      name: "לחיצת חזה בשיפוע כנגד מוט",
      muscleGroup: "חזה עליון",
      muscleGroups: ["חזה עליון", "חזה", "טריצפס (יד אחורית)"],
      secondaryMuscles: ["כתף קדמית"],
      category: "מורכב",
      equipment: "מוט",
      description: "לחץ את המוט מספסל בשיפוע תוך שמירה על שכמות יציבות ומסלול נשלט.",
      instructions: "הורד את המוט לחזה העליון ולחץ מעלה בלי לנתק את השכמות.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-db-press",
      name: "לחיצת חזה כנגד משקוליות",
      muscleGroup: "חזה",
      muscleGroups: ["חזה", "טריצפס (יד אחורית)", "כתף קדמית"],
      secondaryMuscles: [],
      category: "מורכב",
      equipment: "משקוליות יד",
      description: "לחיצת משקוליות מספסל שטוח עם טווח תנועה נשלט.",
      instructions: "שמור את המרפקים מעט מתחת לקו הכתפיים והורד באיטיות.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-cable-fly",
      name: "קרוס אובר בכבלים",
      muscleGroup: "חזה",
      muscleGroups: ["חזה", "חזה תחתון"],
      secondaryMuscles: ["כתף קדמית"],
      category: "בידוד",
      equipment: "פולי / כבלים",
      description: "קירוב ידיות בכבלים לפני הגוף תוך כיווץ החזה.",
      instructions: "שמור כפיפה קלה במרפקים והחזר את הידיות בשליטה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-chest-press",
      name: "לחיצת חזה במכונה",
      muscleGroup: "חזה",
      muscleGroups: ["חזה", "טריצפס (יד אחורית)"],
      secondaryMuscles: ["כתף קדמית"],
      category: "מכונה",
      equipment: "מכונה",
      description: "לחיצת ידיות במכונה עם התנגדות יציבה לאורך התנועה.",
      instructions: "כוון את המושב כך שהידיות יהיו בגובה אמצע החזה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-pullup",
      name: "מתח כנגד משקל גוף",
      muscleGroup: "גב רחב",
      muscleGroups: ["גב רחב", "גב", "ביצפס (יד קדמית)"],
      secondaryMuscles: ["אמות"],
      category: "מורכב",
      equipment: "משקל גוף",
      description: "משוך את הגוף אל המוט תוך הובלת המרפקים מטה.",
      instructions: "התחל מתלייה יציבה, כווץ שכמות והימנע מתנופה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-lat-pulldown",
      name: "משיכת פולי עליון",
      muscleGroup: "גב רחב",
      muscleGroups: ["גב רחב", "גב", "ביצפס (יד קדמית)"],
      secondaryMuscles: ["אמות"],
      category: "מורכב",
      equipment: "פולי / כבלים",
      description: "משיכת מוט הפולי העליון לכיוון החזה העליון.",
      instructions: "שמור חזה מורם ומשוך דרך המרפקים ללא תנופה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-db-row",
      name: "חתירה ביד אחת כנגד משקולית",
      muscleGroup: "גב",
      muscleGroups: ["גב", "גב רחב", "ביצפס (יד קדמית)"],
      secondaryMuscles: ["אמות"],
      category: "מורכב",
      equipment: "משקוליות יד",
      description: "חתירה חד-צדדית עם תמיכה על ספסל וגב ניטרלי.",
      instructions: "משוך את המרפק לכיוון האגן והורד את המשקולית בשליטה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-face-pull",
      name: "משיכת חבל לפנים",
      muscleGroup: "כתף אחורית",
      muscleGroups: ["כתף אחורית", "כתפיים", "טרפזים"],
      secondaryMuscles: ["גב"],
      category: "עזר",
      equipment: "פולי / כבלים",
      description: "משיכת חבל בגובה הפנים לחיזוק הכתף האחורית והשכמות.",
      instructions: "סובב את הידיות החוצה וסיים כשהמרפקים פתוחים לצדדים.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-lateral-raise",
      name: "הרחקת כתפיים לצדדים",
      muscleGroup: "כתף צידית",
      muscleGroups: ["כתף צידית", "כתפיים"],
      secondaryMuscles: ["טרפזים"],
      category: "בידוד",
      equipment: "משקוליות יד",
      description: "הרמת משקוליות לצדדים עד גובה הכתפיים בתנועה מבוקרת.",
      instructions: "שמור מרפקים רכים והימנע מהרמה באמצעות תנופה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-rear-delt-machine",
      name: "פשיטת כתף אחורית במכונה",
      muscleGroup: "כתף אחורית",
      muscleGroups: ["כתף אחורית", "כתפיים"],
      secondaryMuscles: ["גב עליון"],
      category: "מכונה",
      equipment: "מכונה",
      description: "פתיחת זרועות לאחור במכונה לחיזוק הכתף האחורית.",
      instructions: "כוון את המושב ושמור חזה צמוד למשענת לאורך הסט.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-triceps-pushdown",
      name: "פשיטת מרפקים בפולי",
      muscleGroup: "טריצפס (יד אחורית)",
      muscleGroups: ["טריצפס (יד אחורית)"],
      secondaryMuscles: ["כתף קדמית"],
      category: "בידוד",
      equipment: "פולי / כבלים",
      description: "דחיפת ידית הפולי מטה תוך שמירה על המרפקים צמודים לגוף.",
      instructions: "נוע רק באמה וסיים ביישור נוח ללא נעילה אגרסיבית.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-triceps-extension",
      name: "פשיטת מרפקים מעל הראש",
      muscleGroup: "טריצפס (יד אחורית)",
      muscleGroups: ["טריצפס (יד אחורית)", "כתף"],
      secondaryMuscles: [],
      category: "בידוד",
      equipment: "משקוליות יד",
      description: "פשיטת מרפקים מעל הראש עם משקולית אחת או שתיים.",
      instructions: "שמור את המרפקים מכוונים קדימה והורד את המשקל בשליטה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-leg-press",
      name: "לחיצת רגליים במכונה",
      muscleGroup: "ארבע ראשי",
      muscleGroups: ["ארבע ראשי", "ישבן", "המסטרינג"],
      secondaryMuscles: ["תאומים"],
      category: "מכונה",
      equipment: "מכונה",
      description: "דחיפת משטח הרגליים תוך שמירה על שליטה בטווח התנועה.",
      instructions: "אל תנעל ברכיים והחזר את המזחלת עד עומק שנוח לך.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-leg-extension",
      name: "פשיטת ברך במכונה",
      muscleGroup: "ארבע ראשי",
      muscleGroups: ["ארבע ראשי"],
      secondaryMuscles: [],
      category: "בידוד",
      equipment: "מכונה",
      description: "יישור הברכיים במכונה לבידוד הארבע ראשי.",
      instructions: "כוון את ציר המכונה לברך ועבוד בטווח נשלט.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-leg-curl",
      name: "כפיפת ברך במכונה",
      muscleGroup: "המסטרינג",
      muscleGroups: ["המסטרינג"],
      secondaryMuscles: ["תאומים"],
      category: "בידוד",
      equipment: "מכונה",
      description: "כפיפת ברך במכונה לחיזוק השרשרת האחורית.",
      instructions: "שמור אגן יציב והחזר את המשקל באיטיות.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-bulgarian-split",
      name: "סקוואט בולגרי",
      muscleGroup: "ארבע ראשי",
      muscleGroups: ["ארבע ראשי", "ישבן", "המסטרינג"],
      secondaryMuscles: ["בטן"],
      category: "מורכב",
      equipment: "משקוליות יד",
      description: "כריעה חד-רגלית עם הרגל האחורית על ספסל.",
      instructions: "רד אנכית תוך שמירה על ברך קדמית בקו כף הרגל.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-glute-kickback",
      name: "בעיטת ישבן בכבל",
      muscleGroup: "ישבן",
      muscleGroups: ["ישבן", "המסטרינג"],
      secondaryMuscles: ["גב תחתון"],
      category: "בידוד",
      equipment: "פולי / כבלים",
      description: "פשיטת ירך לאחור בכבל תוך שמירה על אגן יציב.",
      instructions: "הזז את הרגל מהירך ללא קשת בגב התחתון.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-calf-raise",
      name: "עליות תאומים בעמידה",
      muscleGroup: "תאומים",
      muscleGroups: ["תאומים"],
      secondaryMuscles: [],
      category: "בידוד",
      equipment: "מכונה",
      description: "הרמה והורדה של העקבים בעמידה עם טווח מלא ונשלט.",
      instructions: "עצור קצר בשיא העלייה והורד עד מתיחה נוחה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-hanging-knee-raise",
      name: "הרמת ברכיים בתלייה",
      muscleGroup: "בטן",
      muscleGroups: ["בטן", "כופפי הירך"],
      secondaryMuscles: ["אמות"],
      category: "בידוד",
      equipment: "משקל גוף",
      description: "הרמת ברכיים בתלייה תוך שליטה באגן וללא תנופה.",
      instructions: "כווץ בטן והטה מעט את האגן בסיום העלייה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-dead-bug",
      name: "דד באג",
      muscleGroup: "בטן",
      muscleGroups: ["בטן", "גב תחתון"],
      secondaryMuscles: ["כופפי הירך"],
      category: "בידוד",
      equipment: "משקל גוף",
      description: "תרגיל ליבה בשכיבה עם תנועה נגדית של יד ורגל.",
      instructions: "הצמד את הגב התחתון לרצפה ונשוף בזמן ההרחקה.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-wrist-curl",
      name: "כפיפת שורש כף היד",
      muscleGroup: "אמות",
      muscleGroups: ["אמות"],
      secondaryMuscles: ["ביצפס (יד קדמית)"],
      category: "בידוד",
      equipment: "משקוליות יד",
      description: "כפיפה ויישור של שורש כף היד עם משקל קל ובשליטה.",
      instructions: "השען את האמות ושמור על תנועה מבודדת של שורש כף היד.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-shrug",
      name: "משיכת כתפיים כנגד משקוליות",
      muscleGroup: "טרפזים",
      muscleGroups: ["טרפזים", "כתפיים"],
      secondaryMuscles: ["אמות"],
      category: "עזר",
      equipment: "משקוליות יד",
      description: "הרמת הכתפיים כלפי מעלה לחיזוק הטרפזים.",
      instructions: "הרם ישר למעלה, עצור קצר והימנע מסיבוב הכתפיים.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
    {
      id: "ex-back-extension",
      name: "פשיטת גב על ספסל",
      muscleGroup: "גב תחתון",
      muscleGroups: ["גב תחתון", "ישבן", "המסטרינג"],
      secondaryMuscles: ["בטן"],
      category: "עזר",
      equipment: "משקל גוף",
      description: "פשיטת גו על ספסל ייעודי תוך שמירה על עמוד שדרה ניטרלי.",
      instructions: "עלה עד קו הגוף בלבד ואל תדחוף את הגב לקשת.",
      videoUrl: "",
      images: [],
      notes: "",
      tips: "",
    },
  ];

  return {
    exercises: ex,
    // Exercises are a shared library. Personal workouts and programs must be
    // created by an explicit user or coach action, never by initial hydration.
    workouts: [],
    programs: [],
    challenges: BUILT_IN_CHALLENGES.map(cloneChallenge),
    challengeEnrollments: [],
    history: [],
    foods: ISRAELI_PROTEIN_PRODUCTS,
    nutritionDays: [],
    nutritionTargets: {},
    plannedMeals: [],
    mealTemplate: [],
    recipes: [],
    recentFoods: [],
    favoriteFoods: [],
    bodyWeightLogs: [],
    cardioLogs: [],
    preExitChecklist: [],
    reminderPreferences: DEFAULT_REMINDER_PREFERENCES,
    syncConflicts: EMPTY_SYNC_CONFLICTS,
    userProfile: { weight: 0 },
  };
};

let data: GymData = seed();
let hydrated = false;
let currentUser: { id: string; email?: string } | null = null;
let authStatus: "loading" | "authenticated" | "unauthenticated" = "loading";
let profileHydrationStatus: "loading" | "ready" | "error" = "loading";
let profileHydrationError = "";
let authResolved = false;
let hydrationGeneration = 0;
let syncStatus: SyncStatus = "idle";
let hasPendingCloudChanges = false;
let syncInFlight: { userId: string; promise: Promise<void> } | null = null;
let syncRetryTimer: ReturnType<typeof setTimeout> | null = null;
let refreshInFlight: Promise<void> | null = null;
let hydrationInFlight: { userId: string; promise: Promise<void> } | null = null;
let lastCloudRefreshAt = 0;
let profileAccessVerified = false;
let everydayFoodDatabase: FoodItem[] = ISRAELI_PROTEIN_PRODUCTS;
let additionalExercises: Exercise[] = [];
let seedExerciseNameMigrations: Record<string, { from: string; to: string }> = {};
let referenceLibrariesPromise: Promise<void> | null = null;

function canManageAssignedPlansRole(role: UserProfile["role"] | undefined) {
  return role === "coach" || role === "owner";
}

function canManageAssignedPlans() {
  return canManageAssignedPlansRole(data.userProfile?.role);
}

function canManageNutritionTargets() {
  return profileAccessVerified && profileHydrationStatus === "ready" && canManageAssignedPlans();
}

function mergeRemotePlanRefresh(localData: GymData, remoteData: GymData): GymData {
  // Trainees cannot edit these collections locally, so a pending nutrition
  // log, check-list item, or measurement must not prevent a coach's plan from
  // appearing in the still-open session.
  if (localData.userProfile?.role !== "client") {
    const localProfile = localData.userProfile ?? { weight: 0 };
    return {
      ...localData,
      userProfile: {
        ...localProfile,
        ...(remoteData.userProfile ?? {}),
      },
    };
  }
  const {
    coachId: _localCoachId,
    approvalStatus: _localApprovalStatus,
    ...localProfile
  } = localData.userProfile;
  return {
    ...localData,
    programs: remoteData.programs ?? localData.programs,
    workouts: [
      ...(remoteData.workouts ?? []),
      ...localData.workouts.filter((workout) => workout.id.startsWith("challenge-run-")),
    ],
    challenges: remoteData.challenges ?? localData.challenges,
    plannedMeals: remoteData.plannedMeals ?? localData.plannedMeals ?? [],
    nutritionTargets: remoteData.nutritionTargets ?? localData.nutritionTargets,
    userProfile: {
      ...localProfile,
      ...(remoteData.userProfile ?? {}),
    },
  };
}

function stripSyncMetadata(snapshot: GymData): GymData {
  const { syncConflicts: _syncConflicts, ...withoutSyncMetadata } = snapshot;
  return withoutSyncMetadata;
}

function detectConcurrentWorkspaceConflict(
  localSnapshot: GymData,
  remoteSnapshot: GymData,
): SyncConflict | null {
  if (localSnapshot.userProfile?.role === "client") return null;
  const comparableFields: Array<keyof GymData> = [
    "programs",
    "workouts",
    "plannedMeals",
    "nutritionTargets",
    "userProfile",
  ];
  const hasRemoteChange = comparableFields.some(
    (field) => JSON.stringify(localSnapshot[field]) !== JSON.stringify(remoteSnapshot[field]),
  );
  if (!hasRemoteChange) return null;
  return {
    id: `sync-${Date.now()}-${uid()}`,
    detectedAt: new Date().toISOString(),
    scope: "workspace",
    status: "unresolved",
    localSnapshot: stripSyncMetadata(localSnapshot),
    remoteSnapshot: stripSyncMetadata(remoteSnapshot),
  };
}

let syncRetryAttempts = 0;
let dataRevision = 0;
const listeners = new Set<() => void>();
let planRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let planRealtimeUserId: string | null = null;
let realtimeReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeReconnectAttempts = 0;
let queuedRealtimeRefreshUserId: string | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function stopPlanRealtime(resetReconnectBackoff = true) {
  if (realtimeReconnectTimer) {
    clearTimeout(realtimeReconnectTimer);
    realtimeReconnectTimer = null;
  }
  if (planRealtimeChannel) {
    void supabase.removeChannel(planRealtimeChannel);
    planRealtimeChannel = null;
  }
  planRealtimeUserId = null;
  if (resetReconnectBackoff) {
    queuedRealtimeRefreshUserId = null;
    realtimeReconnectAttempts = 0;
  }
}

function startPlanRealtime(userId: string, preserveReconnectBackoff = false) {
  if (planRealtimeUserId === userId || typeof supabase.channel !== "function") return;

  stopPlanRealtime(!preserveReconnectBackoff);
  planRealtimeUserId = userId;
  const refreshFromRemoteChange = () => {
    if (currentUser?.id !== userId) return;
    // The refresh keeps pending offline edits authoritative. If a local sync
    // or another refresh is already running, it is drained immediately after
    // that operation instead of being left to the 15-second fallback poll.
    queuedRealtimeRefreshUserId = userId;
    drainQueuedRealtimeRefresh();
  };

  const channel = supabase.channel(`gymtrack-sync-${userId}`);
  const addTableSubscription = (table: string, filter?: string) => {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      refreshFromRemoteChange,
    );
  };

  addTableSubscription("profiles", `id=eq.${userId}`);
  addTableSubscription("programs", `user_id=eq.${userId}`);
  addTableSubscription("program_days", `user_id=eq.${userId}`);
  addTableSubscription("challenges");
  addTableSubscription("nutrition_days", `user_id=eq.${userId}`);
  addTableSubscription("workout_sessions", `user_id=eq.${userId}`);
  addTableSubscription("body_weight_logs", `user_id=eq.${userId}`);
  addTableSubscription("cardio_logs", `user_id=eq.${userId}`);
  addTableSubscription("body_measurements", `user_id=eq.${userId}`);
  addTableSubscription("client_habits", `user_id=eq.${userId}`);
  addTableSubscription("coach_messages", `client_id=eq.${userId}`);
  addTableSubscription("coach_messages", `coach_id=eq.${userId}`);
  // Audience filtering is enforced by the table's RLS policy. Pulling the
  // visible rows after an event avoids exposing another audience through the
  // local store and also handles inserts/deletes without a client-side filter.
  addTableSubscription("broadcast_announcements");
  addTableSubscription("coach_clients", `client_id=eq.${userId}`);
  addTableSubscription("coach_clients", `coach_id=eq.${userId}`);

  planRealtimeChannel = channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      realtimeReconnectAttempts = 0;
      drainQueuedRealtimeRefresh();
      return;
    }
    if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT" && status !== "CLOSED") return;
    if (planRealtimeChannel !== channel || planRealtimeUserId !== userId) return;

    console.warn(`[Realtime ${status.toLowerCase()}]: scheduling an automatic resubscription`);
    planRealtimeChannel = null;
    planRealtimeUserId = null;
    void supabase.removeChannel(channel);
    scheduleRealtimeReconnect(userId);
  });
}

function scheduleRealtimeReconnect(userId: string) {
  if (
    realtimeReconnectTimer ||
    currentUser?.id !== userId ||
    browserIsOffline() ||
    typeof supabase.channel !== "function"
  ) {
    return;
  }
  const delay = Math.min(30_000, 1_000 * 2 ** realtimeReconnectAttempts);
  realtimeReconnectAttempts += 1;
  realtimeReconnectTimer = setTimeout(() => {
    realtimeReconnectTimer = null;
    if (currentUser?.id !== userId || browserIsOffline()) return;
    startPlanRealtime(userId, true);
  }, delay);
}

function drainQueuedRealtimeRefresh() {
  const userId = queuedRealtimeRefreshUserId;
  if (
    !userId ||
    currentUser?.id !== userId ||
    browserIsOffline() ||
    profileHydrationStatus === "loading" ||
    syncInFlight ||
    refreshInFlight
  ) {
    return;
  }
  queuedRealtimeRefreshUserId = null;
  refreshCurrentUserData(true);
}

function browserIsOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function isNetworkFailure(message?: string) {
  return (
    browserIsOffline() ||
    /failed to fetch|network(?:\s+error)?|load failed|fetch failed|offline|timed?\s*out/i.test(
      message ?? "",
    )
  );
}

function isRetryableSyncFailure(message?: string) {
  return (
    isNetworkFailure(message) ||
    /timed?\s*out|temporar|unavailable|too many requests|\b429\b|\b5\d\d\b/i.test(message ?? "")
  );
}

function userCacheKey(userId: string) {
  return `${USER_CACHE_PREFIX}${userId}`;
}

function userPendingKey(userId: string) {
  return `${USER_PENDING_PREFIX}${userId}`;
}

function parseCachedData(raw: string | null): GymData | null {
  if (!raw) return null;
  try {
    return migrate({ ...seed(), ...(JSON.parse(raw) as Partial<GymData>) });
  } catch {
    return null;
  }
}

function loadCachedDataForUser(userId: string) {
  if (typeof window === "undefined") return null;
  try {
    const userCache = parseCachedData(window.localStorage.getItem(userCacheKey(userId)));
    if (userCache) return userCache;

    // The previous shared cache does not embed a verifiable account owner, so
    // it must never be migrated. Discarding it prevents a historical offline
    // account switch from exposing one account's data to another account.
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(CACHED_USER_KEY);
    return null;
  } catch {
    return null;
  }
}

function hasPersistedPendingChanges(userId: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(userPendingKey(userId)) === "true";
  } catch {
    return false;
  }
}

function hasUsableOfflineCache(cachedData: GymData | null) {
  const cachedRole = cachedData?.userProfile?.role;
  return cachedRole === "owner" || cachedRole === "coach" || cachedRole === "client";
}

function resetDataForUser(userId: string) {
  const cachedData = loadCachedDataForUser(userId);
  data = cachedData ?? seed();
  return cachedData;
}

/** Keep custom foods and saved meal snapshots, while removing retired seed items. */
function mergeSeedFoods(existing: FoodItem[], deletedFoodIds: string[] = []): FoodItem[] {
  const deletedIds = new Set(deletedFoodIds);
  const everydayIds = new Set(everydayFoodDatabase.map((food) => food.id));
  const byId = new Map(existing.filter((food) => !deletedIds.has(food.id)).map((f) => [f.id, f]));
  const byName = new Map(
    existing.filter((food) => !deletedIds.has(food.id)).map((f) => [f.name.toLocaleLowerCase(), f]),
  );
  for (const [id, food] of byId) {
    const isLocalCatalogSeed =
      id.startsWith("f-israel-") || id.startsWith("f-usda-") || id.startsWith("f-protein-il-");
    const isImportedCatalogProduct = food.catalog?.source === "open-food-facts";
    if (isLocalCatalogSeed && !everydayIds.has(id) && !isImportedCatalogProduct) {
      byId.delete(id);
      byName.delete(food.name.toLocaleLowerCase());
    }
  }
  for (const seedFood of everydayFoodDatabase) {
    if (deletedIds.has(seedFood.id)) continue;
    if (byId.has(seedFood.id)) continue;
    if (byName.has(seedFood.name.toLocaleLowerCase())) continue;
    byId.set(seedFood.id, seedFood);
  }
  return Array.from(byId.values());
}

/** Merge the maintained exercise library without overwriting a user's edits. */
function mergeSeedExercises(existing: Exercise[], deletedExerciseIds: string[] = []): Exercise[] {
  const deletedIds = new Set(deletedExerciseIds);
  const migratedExisting = existing
    .filter((exercise) => !deletedIds.has(exercise.id))
    .map((exercise) => {
      const migration = seedExerciseNameMigrations[exercise.id];
      return migration && exercise.name === migration.from
        ? { ...exercise, name: migration.to }
        : exercise;
    });
  const byId = new Map(migratedExisting.map((exercise) => [exercise.id, exercise]));
  for (const seedExercise of [...seed().exercises, ...additionalExercises]) {
    if (deletedIds.has(seedExercise.id)) continue;
    const hasSameNameAndMuscle = migratedExisting.some(
      (exercise) =>
        exercise.name.toLocaleLowerCase() === seedExercise.name.toLocaleLowerCase() &&
        exercise.muscleGroup.toLocaleLowerCase() === seedExercise.muscleGroup.toLocaleLowerCase(),
    );
    if (byId.has(seedExercise.id) || hasSameNameAndMuscle) continue;
    byId.set(seedExercise.id, seedExercise);
  }
  return Array.from(byId.values());
}

function mergeChallenges(existing: Challenge[], deletedChallengeIds: string[] = []): Challenge[] {
  const deleted = new Set(deletedChallengeIds);
  const retired = new Set<string>(RETIRED_BUILT_IN_CHALLENGE_IDS);
  const byId = new Map<string, Challenge>();
  for (const challenge of BUILT_IN_CHALLENGES) {
    if (!deleted.has(challenge.id)) byId.set(challenge.id, cloneChallenge(challenge));
  }
  for (const challenge of existing) {
    if (!deleted.has(challenge.id) && !retired.has(challenge.id)) byId.set(challenge.id, challenge);
  }
  return Array.from(byId.values());
}

function loadReferenceLibraries() {
  if (referenceLibrariesPromise) return referenceLibrariesPromise;

  referenceLibrariesPromise = Promise.all([
    import("./israeli-food-db"),
    import("./exercise-library"),
  ]).then(([foodModule, exerciseModule]) => {
    everydayFoodDatabase = foodModule.EVERYDAY_FOOD_DATABASE;
    additionalExercises = exerciseModule.ADDITIONAL_EXERCISES;
    seedExerciseNameMigrations = exerciseModule.SEED_EXERCISE_NAME_MIGRATIONS;

    // These catalogs are not needed to render the shell or authenticate.
    // Merge them after their chunks arrive while preserving custom/cached data.
    data = {
      ...data,
      foods: mergeSeedFoods(data.foods ?? [], data.deletedFoodIds ?? []),
      exercises: mergeSeedExercises(data.exercises ?? [], data.deletedExerciseIds ?? []),
    };
    persistCacheOnly();
    notifyListeners();
  });

  return referenceLibrariesPromise;
}

/** Ensure older saved data still works cleanly. */
function migrate(d: Partial<GymData>): GymData {
  const workouts = d.workouts ?? [];
  let programs = d.programs ?? [];
  if (!programs.length && workouts.length) {
    programs = [{ id: uid(), name: "תכנית אימונים", notes: "", dayIds: workouts.map((w) => w.id) }];
  }
  const normalizedNutrition = normalizeFixedPlannedMenu(d.plannedMeals, d.nutritionDays ?? []);
  return {
    exercises: mergeSeedExercises(d.exercises ?? [], d.deletedExerciseIds ?? []),
    deletedExerciseIds: d.deletedExerciseIds ?? [],
    deletedEquipmentOptions: d.deletedEquipmentOptions ?? [],
    deletedCableGripOptions: d.deletedCableGripOptions ?? [],
    deletedWorkoutIds: d.deletedWorkoutIds ?? [],
    deletedProgramIds: d.deletedProgramIds ?? [],
    deletedChallengeIds: d.deletedChallengeIds ?? [],
    deletedSessionIds: d.deletedSessionIds ?? [],
    deletedBodyWeightLogDates: d.deletedBodyWeightLogDates ?? [],
    deletedNutritionDayIds: d.deletedNutritionDayIds ?? [],
    deletedRecipeIds: d.deletedRecipeIds ?? [],
    deletedCardioLogIds: d.deletedCardioLogIds ?? [],
    deletedFavoriteFoodIds: d.deletedFavoriteFoodIds ?? [],
    workouts,
    programs,
    challenges: mergeChallenges(d.challenges ?? [], d.deletedChallengeIds ?? []),
    challengeEnrollments: d.challengeEnrollments ?? [],
    history: d.history ?? [],
    foods: mergeSeedFoods(d.foods ?? [], d.deletedFoodIds ?? []),
    nutritionDays: normalizedNutrition.nutritionDays,
    nutritionTargets: d.nutritionTargets ?? {},
    plannedMeals: normalizedNutrition.plannedMeals,
    mealTemplate: d.mealTemplate ?? [],
    recipes: d.recipes ?? [],
    recentFoods: d.recentFoods ?? [],
    favoriteFoods: d.favoriteFoods ?? [],
    bodyWeightLogs: d.bodyWeightLogs?.length ? d.bodyWeightLogs : [],
    bodyMeasurements: d.bodyMeasurements ?? [],
    cardioLogs: d.cardioLogs ?? [],
    preExitChecklist: d.preExitChecklist ?? [],
    reminderPreferences: d.reminderPreferences ?? DEFAULT_REMINDER_PREFERENCES,
    syncConflicts: d.syncConflicts ?? [],
    userProfile: {
      ...(d.userProfile ?? { weight: 0 }),
      showCalories: d.userProfile?.showCalories ?? true,
    },
  };
}

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  // Keep the large food and exercise catalogs out of the entry path. They are
  // merged during the first idle turn while auth and the local snapshot start.
  window.setTimeout(() => {
    void loadReferenceLibraries();
  }, 1_500);

  // Setup Supabase Auth state listener
  if (typeof window !== "undefined") {
    window.addEventListener("offline", () => {
      if (!currentUser) return;
      syncStatus = "offline";
      notifyListeners();
    });
    window.addEventListener("online", () => {
      if (!currentUser) return;
      if (syncRetryTimer) {
        clearTimeout(syncRetryTimer);
        syncRetryTimer = null;
      }
      syncRetryAttempts = 0;
      if (hasPendingCloudChanges) {
        void queueCloudSync();
      } else {
        // An offline visit can have no local edits but still needs a
        // background refresh once the connection returns.
        void startUserHydration(currentUser.id, loadCachedDataForUser(currentUser.id)).finally(
          drainQueuedRealtimeRefresh,
        );
      }
      if (!planRealtimeUserId) startPlanRealtime(currentUser.id);
    });
    const refreshWhenVisible = () => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        if (currentUser && !planRealtimeUserId) startPlanRealtime(currentUser.id);
        refreshCurrentUserData();
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("pageshow", refreshWhenVisible);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshWhenVisible);
    }
    if (typeof window.setInterval === "function") {
      window.setInterval(refreshWhenVisible, 15_000);
    }

    Promise.race([
      supabase.auth.getSession(),
      new Promise<{
        data: { session: null };
        error: Error;
      }>((resolve) =>
        window.setTimeout(
          () =>
            resolve({
              data: { session: null },
              error: new Error("פג הזמן לאימות החשבון"),
            }),
          AUTH_TIMEOUT_MS,
        ),
      ),
    ])
      .then(({ data: { session }, error }) => {
        if (error) {
          // A timeout/error must not leave INITIAL_SESSION ignored forever.
          // Supabase can still deliver the real session through the auth
          // listener after a slow getSession request finishes.
          authResolved = true;
          currentUser = null;
          authStatus = "unauthenticated";
          profileHydrationStatus = "error";
          profileHydrationError = error.message;
          listeners.forEach((l) => l());
          return;
        }
        currentUser = session?.user
          ? {
              id: session.user.id,
              ...(session.user.email ? { email: session.user.email } : {}),
            }
          : null;
        authResolved = true;
        authStatus = session?.user ? "authenticated" : "unauthenticated";
        if (session?.user) {
          const cachedData = resetDataForUser(session.user.id);
          startPlanRealtime(session.user.id);
          void startUserHydration(session.user.id, cachedData);
          return;
        }
        notifyListeners();
      })
      .catch(() => {
        authResolved = true;
        currentUser = null;
        authStatus = "unauthenticated";
        profileHydrationStatus = "error";
        profileHydrationError = "לא ניתן לאמת את חיבור Supabase";
        listeners.forEach((l) => l());
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!authResolved && _event === "INITIAL_SESSION") return;
      const prevUserId = currentUser?.id;
      currentUser = session?.user
        ? {
            id: session.user.id,
            ...(session.user.email ? { email: session.user.email } : {}),
          }
        : null;
      authResolved = true;
      authStatus = session?.user ? "authenticated" : "unauthenticated";

      if (session?.user) {
        // If user changed, reset memory state first to avoid leaking previous user data
        if (prevUserId && prevUserId !== session.user.id) {
          stopPlanRealtime();
          data = seed();
        }
        const cachedData = resetDataForUser(session.user.id);
        startPlanRealtime(session.user.id);
        void startUserHydration(session.user.id, cachedData);
        return;
      } else {
        // On sign-out, reset memory state to clean seed data
        stopPlanRealtime();
        hydrationGeneration += 1;
        profileHydrationStatus = "loading";
        profileHydrationError = "";
        syncStatus = "idle";
        hasPendingCloudChanges = false;
        syncRetryAttempts = 0;
        if (syncRetryTimer) {
          clearTimeout(syncRetryTimer);
          syncRetryTimer = null;
        }
        hydrationInFlight = null;
        data = seed();
        try {
          // Per-user caches remain available for the same account on a later
          // offline return. Only obsolete shared-cache keys are discarded.
          window.localStorage.removeItem(KEY);
          window.localStorage.removeItem(CACHED_USER_KEY);
        } catch {
          /* ignore */
        }
        notifyListeners();
      }
    });
  }
}

export function refreshCurrentUserData(force = false) {
  const user = currentUser;
  if (
    !user ||
    authStatus !== "authenticated" ||
    browserIsOffline() ||
    profileHydrationStatus === "loading" ||
    syncInFlight ||
    refreshInFlight ||
    (!force && hasPendingCloudChanges)
  ) {
    return;
  }
  const now = Date.now();
  if (!force && now - lastCloudRefreshAt < 5_000) return;
  lastCloudRefreshAt = now;
  const refresh = startUserHydration(user.id, loadCachedDataForUser(user.id)).finally(() => {
    if (refreshInFlight === refresh) refreshInFlight = null;
    drainQueuedRealtimeRefresh();
  });
  refreshInFlight = refresh;
}

function startUserHydration(userId: string, cachedData = loadCachedDataForUser(userId)) {
  if (hydrationInFlight?.userId === userId) return hydrationInFlight.promise;

  const promise = handleUserLogin(userId, cachedData)
    .catch((error: unknown) => {
      // Keep an unexpected pull exception from leaving the root route in its
      // loading state forever. Expected pull failures already return a
      // structured result and are handled inside handleUserLogin.
      if (currentUser?.id !== userId) return;
      profileHydrationStatus = "error";
      profileHydrationError = error instanceof Error ? error.message : "טעינת פרטי החשבון נכשלה";
      syncStatus = "error";
      notifyListeners();
    })
    .finally(() => {
      if (hydrationInFlight?.promise === promise) hydrationInFlight = null;
    });
  hydrationInFlight = { userId, promise };
  return promise;
}

async function handleUserLogin(userId: string, cachedData = loadCachedDataForUser(userId)) {
  const generation = ++hydrationGeneration;
  const trustedOfflineCache = hasUsableOfflineCache(cachedData);
  const pendingAtPullStart = trustedOfflineCache && hasPersistedPendingChanges(userId);
  profileAccessVerified = false;
  if (cachedData && trustedOfflineCache) {
    data = cachedData;
    profileHydrationStatus = "ready";
    profileHydrationError = "";
    hasPendingCloudChanges = pendingAtPullStart;
    syncStatus = browserIsOffline() ? "offline" : hasPendingCloudChanges ? "pending" : "synced";
    notifyListeners();
    if (browserIsOffline()) return;
  }

  if (browserIsOffline()) {
    profileHydrationStatus = "error";
    profileHydrationError = "אין חיבור לאינטרנט ואין נתונים שמורים עבור החשבון הזה במכשיר.";
    syncStatus = "offline";
    notifyListeners();
    return;
  }

  // Read the signed-in user's data before writing anything. Uploading the
  // anonymous seed first can overwrite cloud state on a fresh device. A
  // trusted per-user cache may remain visible while this background refresh runs.
  const revisionAtPullStart = dataRevision;
  if (!trustedOfflineCache) {
    const {
      role: _role,
      coachId: _coachId,
      ...profileWithoutAccess
    } = data.userProfile ?? { weight: 0 };
    data = { ...data, userProfile: profileWithoutAccess };
    profileHydrationStatus = "loading";
    profileHydrationError = "";
    notifyListeners();
  }
  const pulled = await Promise.race([
    pullSupabaseData(userId, data),
    new Promise<{ success: false; error: string }>((resolve) =>
      window.setTimeout(
        () =>
          resolve({
            success: false,
            error: "Supabase request timed out (network timeout)",
          }),
        INITIAL_DATA_TIMEOUT_MS,
      ),
    ),
  ]);
  if (generation !== hydrationGeneration || currentUser?.id !== userId) return;
  if (!pulled.success) {
    console.warn("[Initial Supabase Pull Warning]:", pulled.error);
    if (cachedData && trustedOfflineCache && isNetworkFailure(pulled.error)) {
      profileHydrationStatus = "ready";
      profileHydrationError = "";
      hasPendingCloudChanges = hasPersistedPendingChanges(userId);
      syncStatus = "offline";
      notifyListeners();
      return;
    }
    if (cachedData && trustedOfflineCache) {
      profileHydrationStatus = "ready";
      profileHydrationError = pulled.error;
      syncStatus = "error";
      notifyListeners();
      return;
    }
    profileHydrationStatus = "error";
    profileHydrationError = pulled.error;
    notifyListeners();
    return;
  }
  const concurrentConflict =
    (dataRevision !== revisionAtPullStart || pendingAtPullStart) &&
    detectConcurrentWorkspaceConflict(data, pulled.data);
  if (concurrentConflict) {
    profileAccessVerified = canManageAssignedPlansRole(pulled.data.userProfile?.role);
    data = {
      ...data,
      syncConflicts: [
        ...(data.syncConflicts ?? []).filter((conflict) => conflict.status === "unresolved"),
        concurrentConflict,
      ],
    };
    persistCacheOnly();
    profileHydrationStatus = "ready";
    profileHydrationError = "";
    hasPendingCloudChanges = true;
    syncStatus = "conflict";
    notifyListeners();
    return;
  }
  // A local edit made while the pull was in flight always wins. The next
  // background sync uploads that newer snapshot instead of clobbering it.
  if (dataRevision === revisionAtPullStart && !pendingAtPullStart) {
    data = {
      ...pulled.data,
      preExitChecklist: data.preExitChecklist ?? pulled.data.preExitChecklist ?? [],
    };
    persistCacheOnly();
  } else if (pendingAtPullStart) {
    data = mergeRemotePlanRefresh(data, pulled.data);
    persistCacheOnly();
  }
  profileHydrationStatus = "ready";
  profileHydrationError = "";
  if (dataRevision !== revisionAtPullStart || pendingAtPullStart) {
    hasPendingCloudChanges = true;
    syncStatus = "pending";
    void queueCloudSync();
  } else if (!hasPendingCloudChanges) {
    syncStatus = "synced";
  } else {
    void queueCloudSync();
  }
  profileAccessVerified = canManageAssignedPlansRole(pulled.data.userProfile?.role);
  notifyListeners();
  drainQueuedRealtimeRefresh();
}

function scheduleCloudRetry(userId: string) {
  if (
    syncRetryTimer ||
    browserIsOffline() ||
    currentUser?.id !== userId ||
    !hasPendingCloudChanges
  ) {
    return;
  }
  const delay = Math.min(5 * 60_000, 1_000 * 2 ** syncRetryAttempts);
  syncRetryAttempts += 1;
  syncRetryTimer = setTimeout(() => {
    syncRetryTimer = null;
    if (currentUser?.id === userId) void queueCloudSync();
  }, delay);
}

function queueCloudSync() {
  const user = currentUser;
  if (!user || !hasPendingCloudChanges) return;
  if ((data.syncConflicts ?? []).some((conflict) => conflict.status === "unresolved")) {
    syncStatus = "conflict";
    notifyListeners();
    return;
  }
  if (browserIsOffline()) {
    syncStatus = "offline";
    notifyListeners();
    return;
  }
  if (syncInFlight) return;

  const userId = user.id;
  const userEmail = user.email;
  const revisionAtStart = dataRevision;
  const dataAtStart = data;
  syncStatus = "syncing";
  notifyListeners();

  const promise = (async () => {
    const result = await syncLocalToSupabase(userId, dataAtStart, userEmail);
    if (currentUser?.id !== userId) return;

    if (result.success) {
      syncRetryAttempts = 0;
      if (dataRevision === revisionAtStart) {
        hasPendingCloudChanges = false;
        syncStatus = "synced";
        try {
          window.localStorage.removeItem(userPendingKey(userId));
        } catch {
          /* ignore */
        }
      } else {
        syncStatus = "pending";
      }
      return;
    }

    hasPendingCloudChanges = true;
    syncStatus = isNetworkFailure(result.error) ? "offline" : "error";
    console.warn("[Background Supabase Sync Warning]:", result.error);
    if (isRetryableSyncFailure(result.error)) scheduleCloudRetry(userId);
  })().finally(() => {
    if (syncInFlight?.promise === promise) syncInFlight = null;
    notifyListeners();
    if (
      currentUser &&
      hasPendingCloudChanges &&
      !browserIsOffline() &&
      (currentUser.id !== userId || dataRevision !== revisionAtStart)
    ) {
      void queueCloudSync();
    }
    drainQueuedRealtimeRefresh();
  });
  syncInFlight = { userId, promise };
}

/**
 * Wait for the local snapshot currently being uploaded. Completion screens
 * use this to avoid navigating away before workout_sessions has been written.
 * Network failures remain locally durable and continue through the normal
 * reconnect retry path, so an offline trainee can still finish the workout.
 */
export async function flushCloudSync(): Promise<{
  success: boolean;
  deferred?: boolean;
  error?: string;
}> {
  const userId = currentUser?.id;
  if (!userId) return { success: true, deferred: true };
  if (browserIsOffline()) return { success: true, deferred: true, error: "offline" };

  if (hasPendingCloudChanges && !syncInFlight) queueCloudSync();
  const inFlight = syncInFlight;
  if (inFlight && inFlight.userId === userId) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<"timeout">((resolve) => {
      timeoutId = setTimeout(() => resolve("timeout"), SYNC_FLUSH_TIMEOUT_MS);
    });
    const result = await Promise.race([inFlight.promise.then(() => "settled" as const), timeout]);
    if (timeoutId) clearTimeout(timeoutId);
    if (result === "timeout") {
      // The local session is already durable. Do not leave the completion
      // modal disabled forever when Supabase is slow or unreachable.
      return {
        success: true,
        deferred: true,
        error: "השמירה בענן מתעכבת; האימון נשמר במכשיר ויסונכרן בהמשך",
      };
    }
  }

  if (currentUser?.id !== userId) {
    return { success: false, error: "החשבון השתנה בזמן שמירת האימון" };
  }
  if (!hasPendingCloudChanges) return { success: true };

  const error =
    syncStatus === "offline"
      ? "אין חיבור כרגע; האימון נשמר במכשיר ויסונכרן כשהחיבור יחזור"
      : "שמירת האימון בענן עדיין ממתינה לניסיון נוסף";
  return syncStatus === "offline" || isNetworkFailure(error)
    ? { success: true, deferred: true, error }
    : { success: false, error };
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    if (currentUser?.id) {
      window.localStorage.setItem(userCacheKey(currentUser.id), JSON.stringify(data));
      window.localStorage.setItem(userPendingKey(currentUser.id), "true");
    }
  } catch {
    /* ignore */
  }

  dataRevision += 1;
  hasPendingCloudChanges = Boolean(currentUser?.id);

  // Local writes are durable first. Cloud sync waits for a usable connection
  // and retries automatically after the browser reports that it is back online.
  if (currentUser?.id) {
    void queueCloudSync();
  }
}

function persistCacheOnly() {
  if (typeof window === "undefined" || !currentUser?.id) return;
  try {
    window.localStorage.setItem(userCacheKey(currentUser.id), JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function set(next: GymData) {
  data = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!hydrated) {
    load();
    listeners.forEach((l) => l());
  }
  return () => listeners.delete(cb);
}

export function getGymStoreSnapshot(): GymData {
  return data;
}
let serverSnapshot: GymData | undefined;
function getServerSnapshot(): GymData {
  if (!serverSnapshot) serverSnapshot = seed();
  return serverSnapshot;
}

export function useGym(): GymData {
  return useSyncExternalStore(subscribe, () => data, getServerSnapshot);
}

export function useAuthUser() {
  return currentUser;
}

export function useAuthStatus() {
  return useSyncExternalStore(
    subscribe,
    () => authStatus,
    () => "loading" as const,
  );
}

export function useProfileHydrationStatus() {
  return useSyncExternalStore(
    subscribe,
    () => profileHydrationStatus,
    () => "loading" as const,
  );
}

export function useProfileHydrationError() {
  return useSyncExternalStore(
    subscribe,
    () => profileHydrationError,
    () => "",
  );
}

export function useCloudSyncStatus() {
  return useSyncExternalStore(
    subscribe,
    () => syncStatus,
    () => "idle" as const,
  );
}

export function useSyncConflicts() {
  return useSyncExternalStore(
    subscribe,
    () => data.syncConflicts ?? EMPTY_SYNC_CONFLICTS,
    () => EMPTY_SYNC_CONFLICTS,
  );
}

export function resolveSyncConflict(conflictId: string, choice: "keep-local" | "use-remote") {
  const conflict = (data.syncConflicts ?? []).find(
    (candidate) => candidate.id === conflictId && candidate.status === "unresolved",
  );
  if (!conflict) return false;
  const nextConflicts = (data.syncConflicts ?? []).map((candidate) =>
    candidate.id === conflictId ? { ...candidate, status: choice } : candidate,
  );
  if (choice === "use-remote") {
    data = migrate({ ...conflict.remoteSnapshot, syncConflicts: nextConflicts });
    hasPendingCloudChanges = false;
    syncStatus = nextConflicts.some((candidate) => candidate.status === "unresolved")
      ? "conflict"
      : "synced";
    persistCacheOnly();
    if (typeof window !== "undefined" && currentUser?.id) {
      try {
        window.localStorage.removeItem(userPendingKey(currentUser.id));
      } catch {
        /* ignore storage failures */
      }
    }
    notifyListeners();
    return true;
  }
  data = migrate({ ...conflict.localSnapshot, syncConflicts: nextConflicts });
  hasPendingCloudChanges = true;
  syncStatus = nextConflicts.some((candidate) => candidate.status === "unresolved")
    ? "conflict"
    : "pending";
  persist();
  notifyListeners();
  return true;
}

export function saveReminderPreferences(preferences: ReminderPreferences) {
  set({
    ...data,
    reminderPreferences: {
      ...DEFAULT_REMINDER_PREFERENCES,
      ...preferences,
      deliveryState: preferences.enabled ? "ready" : "paused",
    },
  });
}

export function clearCurrentUserLocalCache() {
  const userId = currentUser?.id;
  if (typeof window !== "undefined" && userId) {
    try {
      window.localStorage.removeItem(userCacheKey(userId));
      window.localStorage.removeItem(userPendingKey(userId));
    } catch {
      /* ignore storage failures */
    }
  }
  data = seed();
  hasPendingCloudChanges = false;
  syncStatus = "idle";
  notifyListeners();
}

export function retryProfileHydration() {
  if (currentUser?.id)
    void startUserHydration(currentUser.id, loadCachedDataForUser(currentUser.id));
}

export async function completeUserProfileName(
  fullName: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const normalizedName = fullName.trim().replace(/\s+/g, " ");
  if (normalizedName.split(" ").filter(Boolean).length < 2) {
    return { success: false, error: "יש להזין שם פרטי ושם משפחה כדי להמשיך." };
  }
  if (!currentUser?.id) {
    return { success: false, error: "פג תוקף ההתחברות. יש להתחבר מחדש." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: normalizedName })
    .eq("id", currentUser.id);
  if (profileError) {
    return { success: false, error: `לא ניתן לשמור את השם: ${profileError.message}` };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: normalizedName },
  });
  if (authError) {
    console.warn("[Profile name metadata update skipped]:", authError.message);
  }

  data = {
    ...data,
    userProfile: {
      ...(data.userProfile ?? { weight: 0 }),
      fullName: normalizedName,
    },
  };
  persist();
  listeners.forEach((l) => l());
  return { success: true };
}

/* ---------- rep helpers ---------- */
export function repLabel(item: Pick<WorkoutItem, "reps" | "repType" | "repMin" | "repMax">) {
  if (item.repType === "range" && item.repMin != null && item.repMax != null) {
    return `${item.repMin}–${item.repMax}`;
  }
  return String(item.reps);
}

/* ---------- exercises ---------- */
export function saveExercise(ex: Exercise) {
  const exists = data.exercises.some((e) => e.id === ex.id);
  const deletedExerciseIds = (data.deletedExerciseIds ?? []).filter((id) => id !== ex.id);
  set({
    ...data,
    deletedExerciseIds,
    exercises: exists
      ? data.exercises.map((e) => (e.id === ex.id ? ex : e))
      : [...data.exercises, ex],
  });
}

export function deleteExercise(id: string) {
  const deletedExerciseIds = Array.from(new Set([...(data.deletedExerciseIds ?? []), id]));
  set({
    ...data,
    deletedExerciseIds,
    exercises: data.exercises.filter((e) => e.id !== id),
    workouts: data.workouts.map((w) => ({
      ...w,
      items: w.items.filter((i) => i.exerciseId !== id),
    })),
  });
}

export function deleteEquipmentOption(option: string) {
  const normalized = option.trim();
  if (!normalized) return;
  set({
    ...data,
    deletedEquipmentOptions: Array.from(
      new Set([...(data.deletedEquipmentOptions ?? []), normalized]),
    ),
  });
}

export function deleteCableGripOption(option: string) {
  const normalized = option.trim();
  if (!normalized) return;
  set({
    ...data,
    deletedCableGripOptions: Array.from(
      new Set([...(data.deletedCableGripOptions ?? []), normalized]),
    ),
  });
}

export function emptyExercise(): Exercise {
  return {
    id: uid(),
    name: "",
    muscleGroup: "חזה",
    muscleGroups: ["חזה"],
    secondaryMuscles: [],
    category: "מורכב",
    equipment: "מוט",
    description: "",
    instructions: "",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "",
  };
}

/* ---------- workout days ---------- */
export function saveWorkout(w: Workout) {
  if (!canManageAssignedPlans()) return;
  const exists = data.workouts.some((x) => x.id === w.id);
  set({
    ...data,
    deletedWorkoutIds: (data.deletedWorkoutIds ?? []).filter((id) => id !== w.id),
    workouts: exists ? data.workouts.map((x) => (x.id === w.id ? w : x)) : [...data.workouts, w],
  });
}

export function saveChallenge(challenge: Challenge) {
  if (!canManageAssignedPlans()) return;
  const normalized: Challenge = {
    ...challenge,
    title: challenge.title.trim(),
    description: challenge.description.trim(),
    isBuiltIn: false,
    isPublished: challenge.isPublished ?? true,
    updatedAt: new Date().toISOString(),
    ...(currentUser?.id ? { ownerId: currentUser.id } : challenge.ownerId ? { ownerId: challenge.ownerId } : {}),
  };
  if (!normalized.title || normalized.sessions.length === 0) return;
  const exists = data.challenges.some((item) => item.id === normalized.id);
  set({
    ...data,
    deletedChallengeIds: (data.deletedChallengeIds ?? []).filter((id) => id !== normalized.id),
    challenges: exists
      ? data.challenges.map((item) => (item.id === normalized.id ? normalized : item))
      : [...data.challenges, normalized],
  });
}

export function deleteChallenge(id: string) {
  if (!canManageAssignedPlans() || BUILT_IN_CHALLENGES.some((challenge) => challenge.id === id)) return;
  set({
    ...data,
    deletedChallengeIds: Array.from(new Set([...(data.deletedChallengeIds ?? []), id])),
    challenges: data.challenges.filter((challenge) => challenge.id !== id),
  });
}

export function duplicateChallenge(id: string): Challenge | undefined {
  if (!canManageAssignedPlans()) return;
  const source = data.challenges.find((challenge) => challenge.id === id);
  if (!source) return;
  const copy: Challenge = {
    ...cloneChallenge(source),
    id: `challenge-${uid()}`,
    title: `${source.title} — גרסה אישית`,
    isBuiltIn: false,
    sessions: source.sessions.map((session) => ({
      ...session,
      id: `challenge-session-${uid()}`,
      items: session.items.map((item) => {
        const copy = { ...item, id: `challenge-item-${uid()}` };
        if (item.workingSets) {
          copy.workingSets = item.workingSets.map((set) => ({ ...set, id: `challenge-set-${uid()}` }));
        }
        return copy;
      }),
    })),
  };
  if (currentUser?.id) copy.ownerId = currentUser.id;
  saveChallenge(copy);
  return copy;
}

function createChallengeWorkout(challenge: Challenge, source: Workout): Workout {
  return {
    ...source,
    id: `challenge-run-${uid()}`,
    name: `${challenge.title} · ${source.name}`,
    notes: [source.notes, `אתגר: ${challenge.title}`].filter(Boolean).join("\n\n"),
    items: source.items.map((item) => {
      const copy = { ...item, id: `challenge-run-item-${uid()}` };
      if (item.workingSets) {
        copy.workingSets = item.workingSets.map((set) => ({
          ...set,
          id: `challenge-run-set-${uid()}`,
        }));
      }
      return copy;
    }),
  };
}

/**
 * Enroll the trainee in a challenge as an ongoing personal journey.
 *
 * Challenge enrollments are intentionally local-first: unlike a coach-assigned
 * program, selecting a challenge is a personal choice and must remain available
 * offline without trying to write a trainee-owned program through RLS.
 */
export function enrollInChallenge(challengeId: string, sessionId?: string) {
  const challenge = data.challenges.find((item) => item.id === challengeId);
  if (!challenge || challenge.sessions.length === 0) return;
  const firstSession = challenge.sessions[0];
  if (!firstSession) return;

  const existing = (data.challengeEnrollments ?? []).find(
    (enrollment) => enrollment.challengeId === challengeId && enrollment.active,
  );
  if (existing) {
    const workout = data.workouts.find((item) => item.id === existing.workoutIds[0]);
    if (workout) return { enrollment: existing, workout, alreadyActive: true };
  }

  const sourceSessions = sessionId
    ? challenge.sessions.filter((session) => session.id === sessionId)
    : challenge.sessions;
  const sessions = sourceSessions.length > 0 ? sourceSessions : [firstSession];
  const challengeWorkouts = sessions.map((session) => createChallengeWorkout(challenge, session));
  const enrollment: ChallengeEnrollment = {
    id: `challenge-enrollment-${uid()}`,
    challengeId,
    workoutIds: challengeWorkouts.map((workout) => workout.id),
    startedAt: new Date().toISOString(),
    active: true,
  };

  set({
    ...data,
    workouts: [...data.workouts, ...challengeWorkouts],
    challengeEnrollments: [...(data.challengeEnrollments ?? []), enrollment],
  });

  return { enrollment, workout: challengeWorkouts[0], alreadyActive: false };
}

export function startChallenge(challengeId: string, sessionId?: string): Workout | undefined {
  return enrollInChallenge(challengeId, sessionId)?.workout;
}

export function saveWorkoutInProgram(programId: string, w: Workout) {
  if (!canManageAssignedPlans()) return;
  const exists = data.workouts.some((x) => x.id === w.id);
  const workouts = exists
    ? data.workouts.map((x) => (x.id === w.id ? w : x))
    : [...data.workouts, w];
  const programs = data.programs.map((p) =>
    p.id === programId && !p.dayIds.includes(w.id) ? { ...p, dayIds: [...p.dayIds, w.id] } : p,
  );
  set({
    ...data,
    deletedWorkoutIds: (data.deletedWorkoutIds ?? []).filter((id) => id !== w.id),
    workouts,
    programs,
  });
}

export function deleteWorkout(id: string) {
  if (!canManageAssignedPlans()) return;
  set({
    ...data,
    deletedWorkoutIds: Array.from(new Set([...(data.deletedWorkoutIds ?? []), id])),
    workouts: data.workouts.filter((w) => w.id !== id),
    programs: data.programs.map((p) => ({
      ...p,
      dayIds: p.dayIds.filter((d) => d !== id),
    })),
  });
}

export function duplicateWorkoutDay(programId: string, dayId: string) {
  if (!canManageAssignedPlans()) return;
  const day = data.workouts.find((w) => w.id === dayId);
  const program = data.programs.find((p) => p.id === programId);
  if (!day || !program) return;
  const copy: Workout = {
    ...day,
    id: uid(),
    name: `${day.name} (עותק)`,
    items: day.items.map((i) => ({ ...i, id: uid() })),
  };
  const index = program.dayIds.indexOf(dayId);
  const dayIds = [...program.dayIds];
  dayIds.splice(index + 1, 0, copy.id);
  set({
    ...data,
    workouts: [...data.workouts, copy],
    programs: data.programs.map((p) => (p.id === programId ? { ...p, dayIds } : p)),
  });
}

export function reorderProgramDays(programId: string, dayIds: string[]) {
  if (!canManageAssignedPlans()) return;
  set({
    ...data,
    programs: data.programs.map((p) => (p.id === programId ? { ...p, dayIds } : p)),
  });
}

export function emptyWorkout(): Workout {
  return { id: uid(), name: "", notes: "", items: [] };
}

export function emptyChallenge(): Challenge {
  const sessionId = `challenge-session-${uid()}`;
  return {
    id: `challenge-${uid()}`,
    title: "",
    description: "",
    category: "כוח",
    difficulty: "מתחילים",
    durationLabel: "אימון אחד",
    accent: "sage",
    isBuiltIn: false,
    isPublished: true,
    sessions: [{ id: sessionId, name: "אימון ראשון", notes: "", items: [] }],
  };
}

export function emptyItem(exerciseId: string, equipment?: string, cableGrip?: string): WorkoutItem {
  return {
    id: uid(),
    exerciseId,
    ...(equipment ? { equipment } : {}),
    ...(cableGrip ? { cableGrip } : {}),
    sets: 3,
    reps: 10,
    repType: "fixed",
    weight: 20,
    rest: 90,
    notes: "",
    warmups: [],
    workingSets: Array.from({ length: 3 }, (_, i) => ({
      id: uid(),
      setNumber: i + 1,
      weight: 20,
      reps: 10,
    })),
  };
}

export function emptyWarmup(): WarmupSet {
  return { id: uid(), weight: 20, reps: 10 };
}

/* ---------- programs ---------- */
export function saveProgram(p: Program) {
  if (!canManageAssignedPlans()) return;
  const exists = data.programs.some((x) => x.id === p.id);
  set({
    ...data,
    deletedProgramIds: (data.deletedProgramIds ?? []).filter((id) => id !== p.id),
    programs: exists ? data.programs.map((x) => (x.id === p.id ? p : x)) : [...data.programs, p],
  });
}

export function addChecklistItem(label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  set({
    ...data,
    preExitChecklist: [
      ...(data.preExitChecklist ?? []),
      { id: uid(), label: trimmed, done: false },
    ],
  });
}

export function toggleChecklistItem(id: string) {
  set({
    ...data,
    preExitChecklist: (data.preExitChecklist ?? []).map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    ),
  });
}

export function deleteChecklistItem(id: string) {
  set({
    ...data,
    preExitChecklist: (data.preExitChecklist ?? []).filter((item) => item.id !== id),
  });
}

export function clearChecklist() {
  set({
    ...data,
    preExitChecklist: [],
  });
}

export function createProgram(name: string): Program {
  const p: Program = { id: uid(), name: name.trim() || "תכנית חדשה", notes: "", dayIds: [] };
  if (!canManageAssignedPlans()) return p;
  set({ ...data, programs: [...data.programs, p] });
  return p;
}

export function deleteProgram(id: string) {
  if (!canManageAssignedPlans()) return;
  const program = data.programs.find((p) => p.id === id);
  const orphan = new Set(program?.dayIds ?? []);
  set({
    ...data,
    deletedProgramIds: Array.from(new Set([...(data.deletedProgramIds ?? []), id])),
    deletedWorkoutIds: Array.from(new Set([...(data.deletedWorkoutIds ?? []), ...orphan])),
    programs: data.programs.filter((p) => p.id !== id),
    workouts: data.workouts.filter((w) => !orphan.has(w.id)),
  });
}

export function duplicateProgram(id: string) {
  if (!canManageAssignedPlans()) return;
  const program = data.programs.find((p) => p.id === id);
  if (!program) return;
  const newDays: Workout[] = [];
  const dayIds = program.dayIds.map((dayId) => {
    const day = data.workouts.find((w) => w.id === dayId);
    if (!day) return dayId;
    const copy: Workout = {
      ...day,
      id: uid(),
      items: day.items.map((i) => ({ ...i, id: uid() })),
    };
    newDays.push(copy);
    return copy.id;
  });
  set({
    ...data,
    workouts: [...data.workouts, ...newDays],
    programs: [
      ...data.programs,
      { id: uid(), name: `${program.name} (עותק)`, notes: program.notes, dayIds },
    ],
  });
}

export function programDays(d: GymData, programId: string): Workout[] {
  const program = d.programs.find((p) => p.id === programId);
  if (!program) return [];
  return program.dayIds
    .map((id) => d.workouts.find((w) => w.id === id))
    .filter((w): w is Workout => Boolean(w));
}

/* ---------- history ---------- */
export function saveSession(session: HistorySession) {
  const workout = data.workouts.find((item) => item.id === session.workoutId);
  const cardioLogId = `challenge-cardio-${session.id}`;
  const shouldCreateCardioLog =
    Boolean(workout?.cardioType) &&
    !(data.cardioLogs ?? []).some((log) => log.id === cardioLogId);
  const cardioLog = shouldCreateCardioLog
    ? {
        id: cardioLogId,
        date: session.date.slice(0, 10),
        type: workout?.cardioType ?? "אירובי",
        durationMin: Math.max(1, Math.round((session.durationSec ?? 0) / 60)),
        intensity: "moderate" as const,
        calories: calculateCardioCalories(
          workout?.cardioType ?? "אירובי",
          Math.max(1, Math.round((session.durationSec ?? 0) / 60)),
          data.userProfile?.weight ?? 65,
        ),
      }
    : undefined;
  set({
    ...data,
    deletedSessionIds: (data.deletedSessionIds ?? []).filter((id) => id !== session.id),
    history: [session, ...data.history.filter((existing) => existing.id !== session.id)],
    ...(cardioLog
      ? {
          deletedCardioLogIds: (data.deletedCardioLogIds ?? []).filter(
            (id) => id !== cardioLog.id,
          ),
          cardioLogs: [cardioLog, ...(data.cardioLogs ?? [])],
        }
      : {}),
  });
}

export function deleteSession(id: string) {
  set({
    ...data,
    deletedSessionIds: Array.from(new Set([...(data.deletedSessionIds ?? []), id])),
    history: data.history.filter((s) => s.id !== id),
  });
}

export function lastPerformance(history: HistorySession[], exerciseId: string) {
  for (const s of history) {
    const e = s.entries.find((x) => x.exerciseId === exerciseId);
    if (e) {
      const working = e.sets.filter((x) => !x.warmup);
      if (working.length) return { date: s.date, sets: working };
    }
  }
  return null;
}

export function personalRecords(history: HistorySession[], exerciseId: string) {
  let heaviest = 0;
  let bestRepsAtHeaviest = 0;
  let bestEst = 0;
  for (const s of history) {
    for (const e of s.entries) {
      if (e.exerciseId !== exerciseId) continue;
      for (const set of e.sets) {
        if (set.warmup || set.reps === 0) continue;
        if (set.weight > heaviest) {
          heaviest = set.weight;
          bestRepsAtHeaviest = set.reps;
        } else if (set.weight === heaviest && set.reps > bestRepsAtHeaviest) {
          bestRepsAtHeaviest = set.reps;
        }
        const est = set.weight * (1 + set.reps / 30);
        if (est > bestEst) bestEst = est;
      }
    }
  }
  if (heaviest === 0 && bestEst === 0) return null;
  return {
    heaviest,
    bestRepsAtHeaviest,
    estimatedMax: Math.round(bestEst),
  };
}

/* ---------- User Profile, Weight & RMR ---------- */

export function saveUserProfile(profile: UserProfile) {
  const updatedWeight = profile.weight;
  const logs = [...(data.bodyWeightLogs ?? [])];
  const today = todayKey();
  const existingIdx = logs.findIndex((l) => l.date === today);
  if (existingIdx >= 0) {
    logs[existingIdx] = { ...logs[existingIdx]!, weight: updatedWeight };
  } else {
    logs.unshift({ id: uid(), date: today, weight: updatedWeight });
  }
  set({ ...data, userProfile: profile, bodyWeightLogs: logs });
}

export function saveLoadingAnimationsPreference(enabled: boolean) {
  const profile = data.userProfile ?? { weight: 0 };
  set({
    ...data,
    userProfile: { ...profile, loadingAnimationsEnabled: enabled },
  });
}

export async function saveTheme(
  theme: ThemePalette,
): Promise<{ success: boolean; error?: string }> {
  const previousProfile = data.userProfile;
  const profile = { ...(previousProfile ?? { weight: 0 }), theme };
  set({ ...data, userProfile: profile });

  if (!currentUser?.id) return { success: true };
  const { error } = await supabase.auth.updateUser({ data: { theme } });
  if (error) {
    set({
      ...data,
      ...(previousProfile ? { userProfile: previousProfile } : {}),
    });
    return { success: false, error: error.message || "שמירת הפלטה נכשלה" };
  }
  return { success: true };
}

export function saveBodyWeight(weight: number, dateStr = todayKey()) {
  const logs = [...(data.bodyWeightLogs ?? [])];
  const idx = logs.findIndex((l) => l.date === dateStr);
  if (idx >= 0) {
    logs[idx] = { ...logs[idx]!, weight };
  } else {
    logs.unshift({ id: uid(), date: dateStr, weight });
  }
  const profile = { ...(data.userProfile ?? { weight: 0 }), weight };
  set({
    ...data,
    deletedBodyWeightLogDates: (data.deletedBodyWeightLogDates ?? []).filter(
      (date) => date !== dateStr,
    ),
    bodyWeightLogs: logs,
    userProfile: profile,
  });
}

export function deleteBodyWeight(dateStr: string) {
  set({
    ...data,
    deletedBodyWeightLogDates: Array.from(
      new Set([...(data.deletedBodyWeightLogDates ?? []), dateStr]),
    ),
    bodyWeightLogs: (data.bodyWeightLogs ?? []).filter((log) => log.date !== dateStr),
  });
}

export function saveBodyMeasurement(measurement: Omit<BodyMeasurement, "id">) {
  const current = data.bodyMeasurements ?? [];
  const entry: BodyMeasurement = { id: uid(), ...measurement };
  const withoutSameDate = current.filter((item) => item.date !== measurement.date);
  set({ ...data, bodyMeasurements: [entry, ...withoutSameDate] });
  return entry;
}

/** RMR Calculation using Mifflin-St Jeor formula */
export function calculateRmr(profile?: UserProfile) {
  const p = profile ?? data.userProfile;
  if (
    !p ||
    !Number.isFinite(p.weight) ||
    p.weight <= 0 ||
    !Number.isFinite(p.height) ||
    (p.height ?? 0) <= 0 ||
    !Number.isFinite(p.age) ||
    (p.age ?? 0) <= 0 ||
    !p.gender ||
    !Number.isFinite(p.workoutsPerWeek) ||
    (p.workoutsPerWeek ?? -1) < 0
  ) {
    return null;
  }
  const w = p.weight;
  const h = p.height!;
  const a = p.age!;
  const isFemale = p.gender === "female";

  const baseRmr = 10 * w + 6.25 * h - 5 * a + (isFemale ? -161 : 5);
  const rmr = Math.round(baseRmr);

  const frequency = p.workoutsPerWeek!;
  let mult = 1.2;
  if (frequency >= 1 && frequency <= 2) mult = 1.375;
  else if (frequency >= 3 && frequency <= 4) mult = 1.55;
  else if (frequency >= 5) mult = 1.725;

  const tdee = Math.round(rmr * mult);
  return { rmr, tdee, weight: w };
}

/* ---------- Cardio Logger ---------- */

export function saveCardioLog(log: Omit<CardioLog, "id">) {
  const entry: CardioLog = { id: uid(), ...log };
  set({
    ...data,
    deletedCardioLogIds: (data.deletedCardioLogIds ?? []).filter((id) => id !== entry.id),
    cardioLogs: [entry, ...(data.cardioLogs ?? [])],
  });
  return entry;
}

export function updateCardioLog(log: CardioLog) {
  const currentLogs = data.cardioLogs ?? [];
  if (!currentLogs.some((entry) => entry.id === log.id)) {
    throw new Error("Cardio entry not found");
  }
  set({ ...data, cardioLogs: currentLogs.map((entry) => (entry.id === log.id ? log : entry)) });
}

export function deleteCardioLog(id: string) {
  set({
    ...data,
    deletedCardioLogIds: Array.from(new Set([...(data.deletedCardioLogIds ?? []), id])),
    cardioLogs: (data.cardioLogs ?? []).filter((entry) => entry.id !== id),
  });
}

export function calculateCardioCalories(
  type: string,
  durationMin: number,
  weightKg = 65,
  speedKmH = 0,
  inclinePct = 0,
): number {
  if (durationMin <= 0) return 0;
  let met = 5;

  if (type.includes("הליכון") || type.includes("Treadmill") || type.includes("ריצה")) {
    met = speedKmH >= 10 ? 10 : speedKmH >= 8 ? 8 : 4.5;
    if (inclinePct > 0) met += inclinePct * 0.4;
  } else if (type.includes("הליכה")) {
    met = 3.8;
  } else if (type.includes("אופניים")) {
    met = 6.8;
  } else if (type.includes("אליפטיקל")) {
    met = 5.5;
  } else if (type.includes("מדרגות")) {
    met = 8.5;
  } else if (type.includes("חתירה")) {
    met = 7;
  } else if (type.includes("שחייה")) {
    met = 7;
  } else if (type.includes("טניס")) {
    met = 7.3;
  } else if (type.includes("כדורסל") || type.includes("כדורגל")) {
    met = 7;
  } else if (type.includes("טיול")) {
    met = 5.3;
  } else if (type.includes("חבל")) {
    met = 10;
  } else if (type.includes("HIIT")) {
    met = 9;
  } else if (type.includes("אירובי")) {
    met = 6.5;
  }

  const calories = met * weightKg * (durationMin / 60);
  return Math.round(calories);
}

/* ---------- nutrition: food library ---------- */
function isSeedFoodId(id: string) {
  return (
    id.startsWith("f-israel-") ||
    id.startsWith("f-usda-") ||
    id.startsWith("f-common-") ||
    id.startsWith("f-protein-")
  );
}

export function saveFood(food: FoodItem) {
  assertValidFoodNutrition(food);
  const savedFood =
    currentUser?.id && isSeedFoodId(food.id) && !food.ownerId
      ? { ...food, ownerId: currentUser.id }
      : food;
  const exists = data.foods.some((f) => f.id === savedFood.id);
  set({
    ...data,
    deletedFoodIds: (data.deletedFoodIds ?? []).filter((id) => id !== savedFood.id),
    foods: exists
      ? data.foods.map((f) => (f.id === savedFood.id ? savedFood : f))
      : [...data.foods, savedFood],
  });
}

export function toggleFavoriteFood(foodId: string) {
  const favorites = new Set(data.favoriteFoods ?? []);
  const deletedFavoriteFoodIds = new Set(data.deletedFavoriteFoodIds ?? []);
  if (favorites.has(foodId)) {
    favorites.delete(foodId);
    deletedFavoriteFoodIds.add(foodId);
  } else {
    favorites.add(foodId);
    deletedFavoriteFoodIds.delete(foodId);
  }
  set({
    ...data,
    favoriteFoods: Array.from(favorites),
    deletedFavoriteFoodIds: Array.from(deletedFavoriteFoodIds),
  });
}

export function deleteFood(id: string) {
  set({
    ...data,
    deletedFoodIds: Array.from(new Set([...(data.deletedFoodIds ?? []), id])),
    foods: data.foods.filter((f) => f.id !== id),
    favoriteFoods: (data.favoriteFoods ?? []).filter((foodId) => foodId !== id),
    recentFoods: (data.recentFoods ?? []).filter((foodId) => foodId !== id),
  });
}

export function emptyFood(): FoodItem {
  return { id: uid(), name: "", servingSize: "100 גרם", calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function saveNutritionTargets(targets: NutritionTargets) {
  if (!canManageNutritionTargets()) return;
  set({ ...data, nutritionTargets: targets });
}

export function savePlannedMeals(plannedMeals: Meal[]) {
  if (!canManageAssignedPlans()) return;
  set({ ...data, plannedMeals });
}

export function logPlannedMeal(date: string, plannedMealId: string) {
  withDay(date, (day) => {
    const plannedMeal = data.plannedMeals?.find((meal) => meal.id === plannedMealId);
    if (!plannedMeal || day.meals.some((meal) => meal.sourcePlanId === plannedMealId)) return day;
    return {
      ...day,
      meals: [
        ...day.meals,
        {
          id: uid(),
          name: plannedMeal.name,
          sourcePlanId: plannedMealId,
          foods: plannedMeal.foods.map((food) => ({
            ...food,
            id: uid(),
            sourcePlanMealId: plannedMealId,
            sourcePlanFoodId: food.id,
            timeLogged: new Date().toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        },
      ],
    };
  });
}

export function togglePlannedFoodEaten(date: string, plannedMealId: string, plannedFoodId: string) {
  withDay(date, (day) => {
    const plannedMeal = data.plannedMeals?.find((meal) => meal.id === plannedMealId);
    const plannedFood = plannedMeal?.foods.find((food) => food.id === plannedFoodId);
    if (!plannedFood) return day;

    const existingMeal = day.meals.find((meal) => meal.sourcePlanId === plannedMealId);
    const alreadyEaten =
      existingMeal?.foods.some((food) => food.sourcePlanFoodId === plannedFoodId) ?? false;

    if (alreadyEaten) {
      const nextMeals = day.meals
        .map((meal) =>
          meal.id !== existingMeal?.id
            ? meal
            : {
                ...meal,
                foods: meal.foods.filter((food) => food.sourcePlanFoodId !== plannedFoodId),
              },
        )
        .filter((meal) => meal.foods.length > 0 || !meal.sourcePlanId);
      return { ...day, meals: nextMeals };
    }

    const loggedFood: MealFood = {
      ...plannedFood,
      id: uid(),
      sourcePlanMealId: plannedMealId,
      sourcePlanFoodId: plannedFoodId,
      timeLogged: new Date().toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (existingMeal) {
      return {
        ...day,
        meals: day.meals.map((meal) =>
          meal.id === existingMeal.id ? { ...meal, foods: [...meal.foods, loggedFood] } : meal,
        ),
      };
    }

    return {
      ...day,
      meals: [
        ...day.meals,
        {
          id: uid(),
          name: plannedMeal?.name ?? "ארוחה",
          sourcePlanId: plannedMealId,
          foods: [loggedFood],
        },
      ],
    };
  });
}

export function logPlannedFoodSubstitution(
  date: string,
  plannedMealId: string,
  plannedFood: MealFood,
  replacement: MealFood,
) {
  withDay(date, (day) => {
    const plannedMeal = data.plannedMeals?.find((meal) => meal.id === plannedMealId);
    if (!plannedMeal) return day;
    const loggedFood: MealFood = {
      ...replacement,
      id: uid(),
      sourcePlanMealId: plannedMealId,
      sourcePlanFoodId: plannedFood.id,
      ...(plannedFood.foodId ? { substitutedFromFoodId: plannedFood.foodId } : {}),
      substitutedFromFoodName: plannedFood.name,
      notes: `${replacement.notes ? `${replacement.notes} · ` : ""}החלפה מאושרת של ${plannedFood.name}`,
      timeLogged: new Date().toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const existingMeal = day.meals.find((meal) => meal.sourcePlanId === plannedMealId);
    if (existingMeal) {
      return {
        ...day,
        meals: day.meals.map((meal) =>
          meal.id !== existingMeal.id
            ? meal
            : {
                ...meal,
                foods: [
                  ...meal.foods.filter((food) => food.sourcePlanFoodId !== plannedFood.id),
                  loggedFood,
                ],
              },
        ),
      };
    }
    return {
      ...day,
      meals: [
        ...day.meals,
        {
          id: uid(),
          name: plannedMeal.name,
          sourcePlanId: plannedMealId,
          foods: [loggedFood],
        },
      ],
    };
  });
}

export function replacePlannedMealFood(
  date: string,
  plannedMealId: string,
  plannedFoodId: string,
  replacement: MealFood,
) {
  withDay(date, (day) => {
    const plannedMeals = (day.plannedMeals ?? []).map((meal) =>
      meal.id !== plannedMealId
        ? meal
        : {
            ...meal,
            foods: meal.foods.map((food) =>
              food.id === plannedFoodId ? { ...replacement, id: plannedFoodId } : food,
            ),
          },
    );

    const meals = day.meals.map((meal) =>
      meal.sourcePlanId !== plannedMealId
        ? meal
        : {
            ...meal,
            foods: meal.foods.map((food) =>
              food.sourcePlanFoodId === plannedFoodId
                ? {
                    ...replacement,
                    id: food.id,
                    sourcePlanMealId: plannedMealId,
                    sourcePlanFoodId: plannedFoodId,
                    ...(food.timeLogged === undefined ? {} : { timeLogged: food.timeLogged }),
                  }
                : food,
            ),
          },
    );

    return { ...day, plannedMeals, meals };
  });
}

/* ---------- recipes ---------- */

export function saveRecipe(name: string, foods: MealFood[]) {
  const recipes = data.recipes ?? [];
  const normalizedName = name.trim().toLocaleLowerCase();
  if (recipes.some((recipe) => recipe.name.trim().toLocaleLowerCase() === normalizedName)) {
    return false;
  }
  const recipe: SavedRecipe = { id: uid(), name: name.trim() || "מתכון שמור", foods };
  set({
    ...data,
    deletedRecipeIds: (data.deletedRecipeIds ?? []).filter((id) => id !== recipe.id),
    recipes: [recipe, ...recipes],
  });
  return true;
}

export function renameRecipe(id: string, name: string) {
  const nextName = name.trim();
  if (!nextName) return false;
  const recipes = data.recipes ?? [];
  if (
    recipes.some(
      (recipe) =>
        recipe.id !== id && recipe.name.trim().toLocaleLowerCase() === nextName.toLocaleLowerCase(),
    )
  ) {
    return false;
  }
  set({
    ...data,
    recipes: recipes.map((recipe) => (recipe.id === id ? { ...recipe, name: nextName } : recipe)),
  });
  return true;
}

export function deleteRecipe(id: string) {
  set({
    ...data,
    deletedRecipeIds: Array.from(new Set([...(data.deletedRecipeIds ?? []), id])),
    recipes: (data.recipes ?? []).filter((recipe) => recipe.id !== id),
  });
}

/* ---------- nutrition: days & meals ---------- */
export function nutritionDay(d: GymData, date: string): NutritionDay {
  const found = d.nutritionDays.find((x) => x.date === date);
  if (found) return { ...found, plannedMeals: d.plannedMeals ?? [] };
  return {
    date,
    meals: d.mealTemplate.map((name, i) => ({ id: `tmpl-${date}-${i}`, name, foods: [] })),
    plannedMeals: d.plannedMeals ?? [],
  };
}

function withDay(date: string, updater: (day: NutritionDay) => NutritionDay) {
  const existing = data.nutritionDays.find((x) => x.date === date);
  const base: NutritionDay = existing ?? {
    id: `${currentUser?.id ?? "local"}_${date}`,
    date,
    meals: data.mealTemplate.map((name) => ({ id: uid(), name, foods: [] })),
    plannedMeals: data.plannedMeals ?? [],
  };
  const next = updater(base);
  const days = existing
    ? data.nutritionDays.map((x) => (x.date === date ? next : x))
    : [next, ...data.nutritionDays];
  const dayId = next.id ?? `${currentUser?.id ?? "local"}_${date}`;
  set({
    ...data,
    deletedNutritionDayIds: (data.deletedNutritionDayIds ?? []).filter(
      (id) => id !== dayId && id !== date,
    ),
    nutritionDays: days,
  });
}

export function deleteNutritionDay(dateOrId: string) {
  const day = data.nutritionDays.find((item) => item.id === dateOrId || item.date === dateOrId);
  const date = day?.date ?? dateOrId;
  const id = day?.id ?? `${currentUser?.id ?? "local"}_${date}`;
  set({
    ...data,
    deletedNutritionDayIds: Array.from(new Set([...(data.deletedNutritionDayIds ?? []), id, date])),
    nutritionDays: data.nutritionDays.filter((item) => item.id !== dateOrId && item.date !== date),
  });
}

export function autoMealIndexForTime(timeStr?: string): number {
  const now = new Date();
  const hours = timeStr ? parseInt(timeStr.split(":")[0] ?? "12", 10) : now.getHours();

  if (hours < 10) return 0;
  if (hours < 12) return 1;
  if (hours < 15) return 2;
  if (hours < 18) return 3;
  if (hours < 21) return 4;
  return 5;
}

export function addFoodAutoMeal(date: string, food: MealFood) {
  const time =
    food.timeLogged ||
    new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const foodWithTime = { ...food, timeLogged: time };
  const mealIdx = autoMealIndexForTime(time);

  withDay(date, (day) => {
    const meals = [...day.meals];
    if (meals[mealIdx]) {
      meals[mealIdx] = {
        ...meals[mealIdx]!,
        foods: [...meals[mealIdx]!.foods, foodWithTime],
      };
    } else {
      meals[0] = { ...meals[0]!, foods: [...meals[0]!.foods, foodWithTime] };
    }
    return { ...day, meals };
  });

  if (food.foodId) {
    const recent = [food.foodId, ...(data.recentFoods ?? []).filter((id) => id !== food.foodId)];
    set({ ...data, recentFoods: recent.slice(0, 20) });
  }
}

export function addMeal(date: string, name = "") {
  withDay(date, (day) => ({
    ...day,
    meals: [...day.meals, { id: uid(), name: name.trim() || "ארוחה חדשה", foods: [] }],
  }));
}

export function addMealWithFoods(date: string, name: string, foods: MealFood[]) {
  foods.forEach(assertValidMealFood);
  withDay(date, (day) => ({
    ...day,
    meals: [
      ...day.meals,
      {
        id: uid(),
        name: name.trim() || "ארוחה חדשה",
        foods,
      },
    ],
  }));
}

export function deleteMeal(date: string, mealId: string) {
  withDay(date, (day) => ({ ...day, meals: day.meals.filter((m) => m.id !== mealId) }));
}

export function renameMeal(date: string, mealId: string, name: string) {
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) => (m.id === mealId ? { ...m, name } : m)),
  }));
}

export function addFoodToMeal(date: string, mealId: string, food: MealFood) {
  assertValidMealFood(food);
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) => (m.id === mealId ? { ...m, foods: [...m.foods, food] } : m)),
  }));

  if (food.foodId) {
    const recent = [food.foodId, ...(data.recentFoods ?? []).filter((id) => id !== food.foodId)];
    set({ ...data, recentFoods: recent.slice(0, 20) });
  }
}

export function updateMealFood(
  date: string,
  mealId: string,
  patch: Pick<MealFood, "id"> & Partial<Omit<MealFood, "id">>,
) {
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) =>
      m.id === mealId
        ? {
            ...m,
            foods: m.foods.map((food) => {
              if (food.id !== patch.id) return food;
              const next = { ...food, ...patch };
              assertValidMealFood(next);
              return next;
            }),
          }
        : m,
    ),
  }));
}

export function removeMealFood(date: string, mealId: string, foodId: string) {
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) =>
      m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m,
    ),
  }));
}

export function copyPreviousDayNutrition(fromDate: string, targetDate: string) {
  const sourceDay = data.nutritionDays.find((d) => d.date === fromDate);
  if (!sourceDay) return;

  const copiedMeals = sourceDay.meals.map((m) => ({
    ...m,
    id: uid(),
    foods: m.foods.map((f) => ({ ...f, id: uid() })),
  }));

  withDay(targetDate, (day) => ({ ...day, meals: copiedMeals }));
}

export function emptyMealFood(): MealFood {
  return {
    id: uid(),
    name: "",
    servingSize: "100 גרם",
    quantity: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}

export function mealFoodFromLibrary(food: FoodItem): MealFood {
  const mealFood = {
    id: uid(),
    foodId: food.id,
    name: food.name,
    servingSize: food.servingSize,
    quantity: 1,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    ...(food.fiber === undefined ? {} : { fiber: food.fiber }),
    ...(food.notes === undefined ? {} : { notes: food.notes }),
  };
  assertValidMealFood(mealFood);
  return mealFood;
}

function normalizeSearch(s: string) {
  return s
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"-]/g, "")
    .trim();
}

export function searchFoods(foods: FoodItem[], query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return foods;
  const tokens = normalized.split(/\s+/).filter(Boolean);

  return foods.filter((food) => {
    const name = normalizeSearch(food.name);
    const category = normalizeSearch(food.category ?? "");
    const english = normalizeSearch(food.englishName ?? "");
    const brand = normalizeSearch(food.brand ?? "");
    const barcode = normalizeSearch(food.catalog?.barcode ?? "");
    const sourceId = normalizeSearch(food.catalog?.sourceProductId ?? "");
    const terms = (food.searchTerms ?? []).map(normalizeSearch);

    return tokens.every(
      (token) =>
        name.includes(token) ||
        category.includes(token) ||
        english.includes(token) ||
        brand.includes(token) ||
        barcode.includes(token) ||
        sourceId.includes(token) ||
        terms.some((t) => t.includes(token)),
    );
  });
}

export type FoodReplacementMode = "calories" | "protein" | "calories-protein";

export function findFoodReplacements(
  foods: FoodItem[],
  current: Pick<
    MealFood,
    "foodId" | "name" | "calories" | "protein" | "quantity" | "approvedSubstitutes"
  >,
  query = "",
  mode: FoodReplacementMode = "calories",
) {
  const targetCal = (current.calories ?? 0) * (current.quantity ?? 1);
  const targetProtein = (current.protein ?? 0) * (current.quantity ?? 1);
  const searchResults = searchFoods(foods, query);

  return searchResults
    .filter((food) => {
      if (current.foodId && food.id === current.foodId) return false;
      if (!current.foodId && current.name && food.name === current.name) return false;
      if (food.approvalStatus === "rejected") return false;
      if (
        current.approvedSubstitutes &&
        current.approvedSubstitutes.length > 0 &&
        !current.approvedSubstitutes.includes(food.id)
      ) {
        return false;
      }
      return food.calories > 0 || food.protein > 0;
    })
    .map((food) => {
      const calorieQty = food.calories > 0 ? targetCal / food.calories : 0;
      const proteinQty = food.protein > 0 ? targetProtein / food.protein : 0;
      const requiredQty =
        mode === "protein"
          ? proteinQty
          : mode === "calories-protein"
            ? calorieQty > 0 && proteinQty > 0
              ? (calorieQty + proteinQty) / 2
              : calorieQty || proteinQty || 1
            : calorieQty || 1;
      const servingGrams = parseServingGrams(food.servingSize);
      const calculatedCalories = Math.round(food.calories * requiredQty);
      const calculatedProtein = round1(food.protein * requiredQty);
      const calorieError = targetCal > 0 ? Math.abs(calculatedCalories - targetCal) / targetCal : 0;
      const proteinError =
        targetProtein > 0 ? Math.abs(calculatedProtein - targetProtein) / targetProtein : 0;
      const score =
        mode === "protein"
          ? proteinError
          : mode === "calories-protein"
            ? calorieError + proteinError
            : calorieError;
      return {
        food,
        calculatedQuantity: round1(Math.max(0.1, requiredQty)),
        calculatedGrams:
          servingGrams === null ? null : round1(servingGrams * Math.max(0.1, requiredQty)),
        calculatedCalories: Math.round(food.calories * Math.max(0.1, requiredQty)),
        calculatedProtein: round1(food.protein * Math.max(0.1, requiredQty)),
        calculatedCarbs: round1(food.carbs * Math.max(0.1, requiredQty)),
        calculatedFat: round1(food.fat * Math.max(0.1, requiredQty)),
        calculatedFiber: round1((food.fiber ?? 0) * Math.max(0.1, requiredQty)),
        score,
      };
    })
    .sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name));
}

function parseServingGrams(servingSize: string): number | null {
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*(?:g|גרם)\b/i);
  if (!match?.[1]) return null;
  const grams = Number(match[1].replace(",", "."));
  return Number.isFinite(grams) && grams > 0 ? grams : null;
}

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function foodTotals(foods: MealFood[]): MacroTotals {
  return foods.reduce<MacroTotals>(
    (t, f) => ({
      calories: t.calories + f.calories * f.quantity,
      protein: t.protein + f.protein * f.quantity,
      carbs: t.carbs + f.carbs * f.quantity,
      fat: t.fat + f.fat * f.quantity,
      fiber: t.fiber + (f.fiber ?? 0) * f.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export function dayTotals(day: NutritionDay): MacroTotals {
  const all = day.meals.flatMap((m) => m.foods);
  const t = foodTotals(all);
  return {
    calories: Math.round(t.calories),
    protein: round1(t.protein),
    carbs: round1(t.carbs),
    fat: round1(t.fat),
    fiber: round1(t.fiber),
  };
}

/** Reset the singleton for browser-lifecycle tests that simulate a full reload. */
export function resetGymStoreForTests() {
  if (syncRetryTimer) clearTimeout(syncRetryTimer);
  data = seed();
  hydrated = false;
  currentUser = null;
  authStatus = "loading";
  profileHydrationStatus = "loading";
  profileHydrationError = "";
  profileAccessVerified = false;
  authResolved = false;
  hydrationGeneration += 1;
  syncStatus = "idle";
  hasPendingCloudChanges = false;
  syncRetryTimer = null;
  syncRetryAttempts = 0;
  dataRevision = 0;
  syncInFlight = null;
  listeners.clear();
}

export function subscribeGymStore(cb: () => void) {
  return subscribe(cb);
}

export function getGymStoreSyncStatus(): SyncStatus {
  return syncStatus;
}
