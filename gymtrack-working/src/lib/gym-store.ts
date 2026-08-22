import { useSyncExternalStore } from "react";
import { ISRAELI_FOOD_DATABASE } from "./israeli-food-db";
import { supabase } from "./supabase";
import { pullSupabaseData, syncLocalToSupabase } from "./supabase-sync";
import {
  DEFAULT_MEALS,
  type BodyWeightLog,
  type CardioLog,
  type Exercise,
  type FoodItem,
  type GymData,
  type HistorySession,
  type MealFood,
  type NutritionDay,
  type NutritionTargets,
  type Program,
  type SavedRecipe,
  type UserProfile,
  type ThemePalette,
  type WarmupSet,
  type Workout,
  type WorkoutItem,
} from "./gym-types";

const KEY = "gymtrack.v1";
const CACHED_USER_KEY = "gymtrack.v1.userId";

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

  type SeedItem = {
    exerciseId: string;
    sets: number;
    reps: number;
    repMin?: number;
    repMax?: number;
    weight: number;
    rest: number;
  };
  const day = (id: string, name: string, items: SeedItem[]): Workout => ({
    id,
    name,
    notes: "",
    items: items.map((s, i) => ({
      id: `${id}-i${i}`,
      exerciseId: s.exerciseId,
      sets: s.sets,
      reps: s.reps,
      repType: s.repMin != null ? ("range" as const) : ("fixed" as const),
      repMin: s.repMin,
      repMax: s.repMax,
      weight: s.weight,
      rest: s.rest,
      notes: "",
      workingSets: Array.from({ length: s.sets }, (_, setIdx) => ({
        id: `${id}-i${i}-set-${setIdx}`,
        setNumber: setIdx + 1,
        weight: s.weight,
        reps: s.repMin ?? s.reps,
        repMax: s.repMax,
      })),
    })),
  });

  const workouts: Workout[] = [
    day("w-lower-1", "פלג גוף תחתון 1", [
      { exerciseId: "ex-squat", sets: 4, reps: 6, weight: 80, rest: 150 },
      { exerciseId: "ex-hipthrust", sets: 4, reps: 8, repMin: 8, repMax: 10, weight: 60, rest: 90 },
      { exerciseId: "ex-rdl", sets: 3, reps: 10, repMin: 8, repMax: 10, weight: 50, rest: 90 },
      { exerciseId: "ex-plank", sets: 3, reps: 1, weight: 0, rest: 60 },
    ]),
    day("w-upper-1", "פלג גוף עליון 1", [
      { exerciseId: "ex-bench", sets: 4, reps: 8, repMin: 8, repMax: 10, weight: 60, rest: 120 },
      { exerciseId: "ex-row", sets: 4, reps: 10, repMin: 10, repMax: 12, weight: 45, rest: 90 },
      { exerciseId: "ex-ohp", sets: 3, reps: 8, repMin: 8, repMax: 10, weight: 35, rest: 90 },
      { exerciseId: "ex-curl", sets: 3, reps: 12, weight: 12, rest: 60 },
    ]),
    day("w-lower-2", "פלג גוף תחתון 2", [
      { exerciseId: "ex-squat", sets: 3, reps: 10, weight: 65, rest: 120 },
      { exerciseId: "ex-hipthrust", sets: 4, reps: 12, weight: 55, rest: 90 },
      { exerciseId: "ex-rdl", sets: 3, reps: 12, weight: 45, rest: 90 },
    ]),
    day("w-upper-2", "פלג גוף עליון 2", [
      { exerciseId: "ex-row", sets: 4, reps: 10, weight: 50, rest: 90 },
      { exerciseId: "ex-bench", sets: 3, reps: 10, repMin: 8, repMax: 10, weight: 55, rest: 90 },
      { exerciseId: "ex-ohp", sets: 3, reps: 10, weight: 30, rest: 90 },
      { exerciseId: "ex-curl", sets: 3, reps: 12, repMin: 10, repMax: 12, weight: 12, rest: 60 },
    ]),
  ];

  const programs: Program[] = [
    {
      id: "p-default",
      name: "תכנית אימונים 4 ימים",
      notes: "חלוקת פלג גוף תחתון / פלג גוף עליון",
      dayIds: workouts.map((w) => w.id),
    },
  ];

  return {
    exercises: ex,
    workouts,
    programs,
    history: [],
    foods: [...ISRAELI_FOOD_DATABASE],
    nutritionDays: [],
    nutritionTargets: { calories: 2000, protein: 140, carbs: 200, fat: 65 },
    mealTemplate: [...DEFAULT_MEALS],
    recipes: [],
    recentFoods: [],
    favoriteFoods: [],
    bodyWeightLogs: [{ id: "bw-seed", date: todayKey(), weight: 65 }],
    cardioLogs: [],
    userProfile: { weight: 65, height: 165, age: 26, gender: "female", workoutsPerWeek: 4 },
  };
};

let data: GymData = seed();
let hydrated = false;
let currentUser: { id: string; email?: string } | null = null;
let authStatus: "loading" | "authenticated" | "unauthenticated" = "loading";
let authResolved = false;
let hydrationGeneration = 0;
const listeners = new Set<() => void>();

function resetDataIfCacheBelongsToAnotherUser(userId: string) {
  if (typeof window === "undefined") return;
  try {
    const cachedUserId = window.localStorage.getItem(CACHED_USER_KEY);
    // Caches created before this binding existed are treated as untrusted once
    // a real session is present. Keeping them could expose one account's data
    // while another account's cloud profile is loading.
    if (cachedUserId !== userId) data = seed();
    window.localStorage.setItem(CACHED_USER_KEY, userId);
  } catch {
    /* Local storage may be unavailable; cloud hydration still follows. */
  }
}

/** Merge food database so saved data retains all Israeli supermarket items */
function mergeSeedFoods(existing: FoodItem[]): FoodItem[] {
  const byId = new Map(existing.map((f) => [f.id, f]));
  const byName = new Map(existing.map((f) => [f.name.toLocaleLowerCase(), f]));
  for (const seedFood of ISRAELI_FOOD_DATABASE) {
    if (byId.has(seedFood.id)) continue;
    if (byName.has(seedFood.name.toLocaleLowerCase())) continue;
    byId.set(seedFood.id, seedFood);
  }
  return Array.from(byId.values());
}

/** Merge the maintained exercise library without overwriting a user's edits. */
function mergeSeedExercises(existing: Exercise[]): Exercise[] {
  const byId = new Map(existing.map((exercise) => [exercise.id, exercise]));
  const byName = new Map(existing.map((exercise) => [exercise.name.toLocaleLowerCase(), exercise]));
  for (const seedExercise of seed().exercises) {
    if (byId.has(seedExercise.id) || byName.has(seedExercise.name.toLocaleLowerCase())) continue;
    byId.set(seedExercise.id, seedExercise);
  }
  return Array.from(byId.values());
}

/** Ensure older saved data still works cleanly. */
function migrate(d: Partial<GymData>): GymData {
  const workouts = d.workouts ?? [];
  let programs = d.programs ?? [];
  if (!programs.length && workouts.length) {
    programs = [{ id: uid(), name: "תכנית אימונים", notes: "", dayIds: workouts.map((w) => w.id) }];
  }
  return {
    exercises: mergeSeedExercises(d.exercises ?? []),
    workouts: workouts.length ? workouts : seed().workouts,
    programs: programs.length ? programs : seed().programs,
    history: d.history ?? [],
    foods: mergeSeedFoods(d.foods ?? []),
    nutritionDays: d.nutritionDays ?? [],
    nutritionTargets: d.nutritionTargets ?? seed().nutritionTargets,
    mealTemplate: d.mealTemplate?.length ? d.mealTemplate : [...DEFAULT_MEALS],
    recipes: d.recipes ?? [],
    recentFoods: d.recentFoods ?? [],
    favoriteFoods: d.favoriteFoods ?? [],
    bodyWeightLogs: d.bodyWeightLogs?.length
      ? d.bodyWeightLogs
      : [{ id: uid(), date: todayKey(), weight: d.userProfile?.weight ?? 65 }],
    cardioLogs: d.cardioLogs ?? [],
    userProfile: d.userProfile ?? seed().userProfile,
  };
}

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) data = migrate({ ...seed(), ...(JSON.parse(raw) as Partial<GymData>) });
  } catch {
    /* ignore */
  }

  // Setup Supabase Auth state listener
  if (typeof window !== "undefined") {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          currentUser = null;
          authStatus = "unauthenticated";
          listeners.forEach((l) => l());
          return;
        }
        currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
        authResolved = true;
        authStatus = session?.user ? "authenticated" : "unauthenticated";
        if (session?.user) resetDataIfCacheBelongsToAnotherUser(session.user.id);
        listeners.forEach((l) => l());
        if (session?.user) void handleUserLogin(session.user.id);
      })
      .catch(() => {
        currentUser = null;
        authStatus = "unauthenticated";
        listeners.forEach((l) => l());
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!authResolved && _event === "INITIAL_SESSION") return;
      const prevUserId = currentUser?.id;
      currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
      authResolved = true;
      authStatus = session?.user ? "authenticated" : "unauthenticated";

      if (session?.user) {
        // If user changed, reset memory state first to avoid leaking previous user data
        if (prevUserId && prevUserId !== session.user.id) {
          data = seed();
        }
        resetDataIfCacheBelongsToAnotherUser(session.user.id);
        void handleUserLogin(session.user.id);
      } else {
        // On sign-out, reset memory state to clean seed data
        hydrationGeneration += 1;
        data = seed();
        try {
          window.localStorage.removeItem(KEY);
          window.localStorage.removeItem(CACHED_USER_KEY);
        } catch {
          /* ignore */
        }
        listeners.forEach((l) => l());
      }
    });
  }
}

async function handleUserLogin(userId: string) {
  const generation = ++hydrationGeneration;
  // Read the signed-in user's data before writing anything. Uploading the
  // anonymous seed first can overwrite cloud state on a fresh device.
  // Do not let a previous user's cached role control the UI while this pull
  // is in flight. A missing or failed profile read leaves the role unknown.
  data = {
    ...data,
    userProfile: { ...data.userProfile, role: undefined, coachId: undefined },
  };
  listeners.forEach((l) => l());
  const pulled = await pullSupabaseData(userId, data);
  if (generation !== hydrationGeneration || currentUser?.id !== userId) return;
  if (!pulled.success) {
    console.warn("[Initial Supabase Pull Warning]:", pulled.error);
    listeners.forEach((l) => l());
    return;
  }
  data = pulled.data;
  persist();
  if (generation !== hydrationGeneration || currentUser?.id !== userId) return;
  // Push only after local state contains the user's cloud-backed data.
  const result = await syncLocalToSupabase(userId, data, currentUser?.email);
  if (!result.success) {
    console.warn("[Initial Supabase Sync Warning]:", result.error);
  }
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    if (currentUser?.id) window.localStorage.setItem(CACHED_USER_KEY, currentUser.id);
  } catch {
    /* ignore */
  }

  // Trigger async background push to Supabase if logged in
  if (currentUser?.id) {
    syncLocalToSupabase(currentUser.id, data).catch((e) =>
      console.warn("[Background Supabase Sync Warning]:", e),
    );
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
  set({
    ...data,
    exercises: exists
      ? data.exercises.map((e) => (e.id === ex.id ? ex : e))
      : [...data.exercises, ex],
  });
}

export function deleteExercise(id: string) {
  set({
    ...data,
    exercises: data.exercises.filter((e) => e.id !== id),
    workouts: data.workouts.map((w) => ({
      ...w,
      items: w.items.filter((i) => i.exerciseId !== id),
    })),
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
  const exists = data.workouts.some((x) => x.id === w.id);
  set({
    ...data,
    workouts: exists ? data.workouts.map((x) => (x.id === w.id ? w : x)) : [...data.workouts, w],
  });
}

export function saveWorkoutInProgram(programId: string, w: Workout) {
  const exists = data.workouts.some((x) => x.id === w.id);
  const workouts = exists
    ? data.workouts.map((x) => (x.id === w.id ? w : x))
    : [...data.workouts, w];
  const programs = data.programs.map((p) =>
    p.id === programId && !p.dayIds.includes(w.id) ? { ...p, dayIds: [...p.dayIds, w.id] } : p,
  );
  set({ ...data, workouts, programs });
}

export function deleteWorkout(id: string) {
  set({
    ...data,
    workouts: data.workouts.filter((w) => w.id !== id),
    programs: data.programs.map((p) => ({
      ...p,
      dayIds: p.dayIds.filter((d) => d !== id),
    })),
  });
}

export function duplicateWorkoutDay(programId: string, dayId: string) {
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
  set({
    ...data,
    programs: data.programs.map((p) => (p.id === programId ? { ...p, dayIds } : p)),
  });
}

export function emptyWorkout(): Workout {
  return { id: uid(), name: "", notes: "", items: [] };
}

export function emptyItem(exerciseId: string): WorkoutItem {
  return {
    id: uid(),
    exerciseId,
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
  const exists = data.programs.some((x) => x.id === p.id);
  set({
    ...data,
    programs: exists ? data.programs.map((x) => (x.id === p.id ? p : x)) : [...data.programs, p],
  });
}

export function createProgram(name: string): Program {
  const p: Program = { id: uid(), name: name.trim() || "תכנית חדשה", notes: "", dayIds: [] };
  set({ ...data, programs: [...data.programs, p] });
  return p;
}

export function deleteProgram(id: string) {
  const program = data.programs.find((p) => p.id === id);
  const orphan = new Set(program?.dayIds ?? []);
  set({
    ...data,
    programs: data.programs.filter((p) => p.id !== id),
    workouts: data.workouts.filter((w) => !orphan.has(w.id)),
  });
}

export function duplicateProgram(id: string) {
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
  set({ ...data, history: [session, ...data.history] });
}

export function deleteSession(id: string) {
  set({ ...data, history: data.history.filter((s) => s.id !== id) });
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

export async function saveTheme(
  theme: ThemePalette,
): Promise<{ success: boolean; error?: string }> {
  const previousProfile = data.userProfile;
  const profile = { ...(previousProfile ?? { weight: 65 }), theme };
  set({ ...data, userProfile: profile });

  if (!currentUser?.id) return { success: true };
  const { error } = await supabase.auth.updateUser({ data: { theme } });
  if (error) {
    set({ ...data, userProfile: previousProfile });
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
  const profile = { ...(data.userProfile ?? { weight: 65 }), weight };
  set({ ...data, bodyWeightLogs: logs, userProfile: profile });
}

/** RMR Calculation using Mifflin-St Jeor formula */
export function calculateRmr(profile?: UserProfile) {
  const p = profile ?? data.userProfile ?? { weight: 65, height: 165, age: 26, gender: "female" };
  const w = p.weight || 65;
  const h = p.height || 165;
  const a = p.age || 26;
  const isFemale = p.gender !== "male";

  const baseRmr = 10 * w + 6.25 * h - 5 * a + (isFemale ? -161 : 5);
  const rmr = Math.round(baseRmr);

  const frequency = p.workoutsPerWeek ?? 4;
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
  set({ ...data, cardioLogs: [entry, ...(data.cardioLogs ?? [])] });
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
  set({ ...data, cardioLogs: (data.cardioLogs ?? []).filter((entry) => entry.id !== id) });
}

export function calculateCardioCalories(
  type: string,
  durationMin: number,
  weightKg = 65,
  speedKmH = 0,
  inclinePct = 0,
  intensity: CardioLog["intensity"] = "moderate",
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

  const intensityMultiplier = intensity === "high" ? 1.15 : intensity === "low" ? 0.85 : 1;
  const calories = met * intensityMultiplier * weightKg * (durationMin / 60);
  return Math.round(calories);
}

/* ---------- nutrition: food library ---------- */
export function saveFood(food: FoodItem) {
  const exists = data.foods.some((f) => f.id === food.id);
  set({
    ...data,
    foods: exists ? data.foods.map((f) => (f.id === food.id ? food : f)) : [...data.foods, food],
  });
}

export function toggleFavoriteFood(foodId: string) {
  const favorites = new Set(data.favoriteFoods ?? []);
  if (favorites.has(foodId)) favorites.delete(foodId);
  else favorites.add(foodId);
  set({ ...data, favoriteFoods: Array.from(favorites) });
}

export function deleteFood(id: string) {
  set({ ...data, foods: data.foods.filter((f) => f.id !== id) });
}

export function emptyFood(): FoodItem {
  return { id: uid(), name: "", servingSize: "100 גרם", calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function saveNutritionTargets(targets: NutritionTargets) {
  set({ ...data, nutritionTargets: targets });
}

export function saveNutritionWater(date: string, waterMl: number, waterTargetMl?: number) {
  withDay(date, (day) => ({
    ...day,
    waterMl: Math.max(0, waterMl),
    ...(waterTargetMl === undefined ? {} : { waterTargetMl: Math.max(0, waterTargetMl) }),
  }));
}

/* ---------- recipes ---------- */

export function saveRecipe(name: string, foods: MealFood[]) {
  const recipes = data.recipes ?? [];
  const recipe: SavedRecipe = { id: uid(), name: name.trim() || "מתכון שמור", foods };
  set({ ...data, recipes: [recipe, ...recipes] });
}

/* ---------- nutrition: days & meals ---------- */
export function nutritionDay(d: GymData, date: string): NutritionDay {
  const found = d.nutritionDays.find((x) => x.date === date);
  if (found) return found;
  return {
    date,
    meals: d.mealTemplate.map((name, i) => ({ id: `tmpl-${date}-${i}`, name, foods: [] })),
  };
}

function withDay(date: string, updater: (day: NutritionDay) => NutritionDay) {
  const existing = data.nutritionDays.find((x) => x.date === date);
  const base: NutritionDay = existing ?? {
    date,
    meals: data.mealTemplate.map((name) => ({ id: uid(), name, foods: [] })),
  };
  const next = updater(base);
  const days = existing
    ? data.nutritionDays.map((x) => (x.date === date ? next : x))
    : [next, ...data.nutritionDays];
  set({ ...data, nutritionDays: days });
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

export function addMeal(date: string, name: string) {
  withDay(date, (day) => ({
    ...day,
    meals: [...day.meals, { id: uid(), name: name.trim() || "ארוחה חדשה", foods: [] }],
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
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) => (m.id === mealId ? { ...m, foods: [...m.foods, food] } : m)),
  }));

  if (food.foodId) {
    const recent = [food.foodId, ...(data.recentFoods ?? []).filter((id) => id !== food.foodId)];
    set({ ...data, recentFoods: recent.slice(0, 20) });
  }
}

export function updateMealFood(date: string, mealId: string, food: MealFood) {
  withDay(date, (day) => ({
    ...day,
    meals: day.meals.map((m) =>
      m.id === mealId ? { ...m, foods: m.foods.map((f) => (f.id === food.id ? food : f)) } : m,
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
  return {
    id: uid(),
    foodId: food.id,
    name: food.name,
    servingSize: food.servingSize,
    quantity: 1,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    notes: food.notes,
  };
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
    const terms = (food.searchTerms ?? []).map(normalizeSearch);

    return tokens.every(
      (token) =>
        name.includes(token) ||
        category.includes(token) ||
        english.includes(token) ||
        terms.some((t) => t.includes(token)),
    );
  });
}

export function findFoodReplacements(
  foods: FoodItem[],
  current: Pick<MealFood, "foodId" | "name" | "calories" | "protein" | "quantity">,
  query = "",
) {
  const targetCal = (current.calories ?? 0) * (current.quantity ?? 1);
  const searchResults = searchFoods(foods, query);

  return searchResults
    .filter((food) => {
      if (current.foodId && food.id === current.foodId) return false;
      if (!current.foodId && current.name && food.name === current.name) return false;
      return true;
    })
    .map((food) => {
      const requiredQty = food.calories > 0 ? targetCal / food.calories : 1;
      return {
        food,
        calculatedQuantity: round1(requiredQty),
        calculatedCalories: Math.round(food.calories * requiredQty),
        calculatedProtein: round1(food.protein * requiredQty),
        calculatedCarbs: round1(food.carbs * requiredQty),
        calculatedFat: round1(food.fat * requiredQty),
        calculatedFiber: round1((food.fiber ?? 0) * requiredQty),
        score: Math.abs(food.calories - (current.calories ?? 0)),
      };
    })
    .sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name));
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
