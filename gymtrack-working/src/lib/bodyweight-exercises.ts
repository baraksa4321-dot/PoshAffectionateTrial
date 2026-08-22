import type { Exercise, WorkoutItem } from "./gym-types";

/**
 * Separate bodyweight catalog. These exercises are intentionally not seeded into
 * the regular gym equipment library.
 */
export const BODYWEIGHT_EXERCISES: Exercise[] = [
  {
    id: "bw-push-up",
    name: "שכיבות סמיכה",
    muscleGroup: "חזה",
    equipment: "משקל גוף",
    description: "תרגיל דחיפה לחזה, כתפיים ויד אחורית.",
    instructions: "שמרי על גוף ישר, רדי בשליטה ודחפי את הרצפה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר לבצע על ברכיים להקלה.",
  },
  {
    id: "bw-diamond-push-up",
    name: "שכיבות סמיכה יהלום",
    muscleGroup: "יד אחורית",
    equipment: "משקל גוף",
    description: "שכיבות סמיכה עם דגש על היד האחורית.",
    instructions: "הצמידי את כפות הידיים מתחת לחזה, שמרי מרפקים קרובים לגוף.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר להרחיב מעט את מיקום הידיים אם קשה.",
  },
  {
    id: "bw-pike-push-up",
    name: "שכיבות סמיכה זוויתיות",
    muscleGroup: "כתפיים",
    equipment: "משקל גוף",
    description: "תרגיל דחיפה זוויתי לכתפיים ולידיים.",
    instructions: "הרימי את האגן, כופפי מרפקים והורידי את הראש לכיוון הרצפה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "ככל שהאגן גבוה יותר, הדגש עובר לכתפיים.",
  },
  {
    id: "bw-pull-up",
    name: "מתח",
    muscleGroup: "גב",
    equipment: "מתח",
    description: "תרגיל משיכה לגב וליד קדמית.",
    instructions: "משכי את הגוף עד שהסנטר עובר את המוט, ורדי בשליטה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר להשתמש בגומיית עזר.",
  },
  {
    id: "bw-inverted-row",
    name: "חתירה הפוכה",
    muscleGroup: "גב",
    equipment: "משקל גוף",
    description: "תרגיל משיכה אופקי לגב העליון.",
    instructions: "משכי את החזה לכיוון המוט תוך שמירה על גוף ישר.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "ככל שהגוף אופקי יותר, התרגיל קשה יותר.",
  },
  {
    id: "bw-bodyweight-squat",
    name: "סקוואט משקל גוף",
    muscleGroup: "רגליים",
    equipment: "משקל גוף",
    description: "תרגיל בסיסי לירכיים, ישבן וליבה.",
    instructions: "שלחי אגן לאחור, רדי בשליטה ועלי דרך כל כף הרגל.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "שמרי על הברכיים בקו האצבעות.",
  },
  {
    id: "bw-reverse-lunge",
    name: "לאנג׳ אחורי",
    muscleGroup: "רגליים",
    equipment: "משקל גוף",
    description: "תרגיל חד־צדדי לירכיים ולישבן.",
    instructions: "קחי צעד לאחור, רדי עד ששתי הברכיים כפופות וחזרי לעמידה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "החזיקי קיר לתמיכה אם צריך.",
  },
  {
    id: "bw-glute-bridge",
    name: "גשר ישבן",
    muscleGroup: "ישבן",
    equipment: "משקל גוף",
    description: "תרגיל לישבן ולהמסטרינג בשכיבה.",
    instructions: "דחפי את האגן למעלה, כווצי ישבן והורידי בשליטה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אל תקמרי את הגב בתנועה.",
  },
  {
    id: "bw-calf-raise",
    name: "הרמת עקבים",
    muscleGroup: "שוקיים",
    equipment: "משקל גוף",
    description: "תרגיל מבודד לשרירי השוק.",
    instructions: "עלי על קצות האצבעות, עצרי למעלה ורדי באיטיות.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "בצעי על מדרגה לטווח תנועה גדול יותר.",
  },
  {
    id: "bw-plank",
    name: "פלאנק",
    muscleGroup: "ליבה",
    equipment: "משקל גוף",
    description: "תרגיל איזומטרי לשרירי הליבה.",
    instructions: "שמרי על גוף ישר, כווצי בטן ונשמי רגיל.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אל תתני לאגן לשקוע.",
  },
  {
    id: "bw-dead-bug",
    name: "דד באג",
    muscleGroup: "ליבה",
    equipment: "משקל גוף",
    description: "תרגיל שליטה לליבה בשכיבה.",
    instructions: "הורידי יד ורגל נגדית בלי לאבד את מגע הגב ברצפה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "הקטיני את טווח התנועה אם הגב מתנתק מהרצפה.",
  },
  {
    id: "bw-superman",
    name: "סופרמן",
    muscleGroup: "גב תחתון",
    equipment: "משקל גוף",
    description: "תרגיל חיזוק לגב התחתון ולשרשרת האחורית.",
    instructions: "הרימי ידיים ורגליים מעט מהרצפה, עצרי והורידי בשליטה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "בצעי תנועה קטנה ומבוקרת.",
  },
];

const BODYWEIGHT_BY_MUSCLE: Record<string, string> = {
  חזה: "bw-push-up",
  גב: "bw-inverted-row",
  "גב עליון": "bw-inverted-row",
  "גב תחתון": "bw-superman",
  כתפיים: "bw-pike-push-up",
  "יד קדמית": "bw-pull-up",
  "יד אחורית": "bw-diamond-push-up",
  רגליים: "bw-bodyweight-squat",
  ירכיים: "bw-bodyweight-squat",
  ישבן: "bw-glute-bridge",
  שוקיים: "bw-calf-raise",
  ליבה: "bw-plank",
  בטן: "bw-plank",
};

const normalized = (value: string) => value.trim().toLowerCase();

export function bodyweightAlternativeFor(exercise: Exercise): Exercise {
  const key = BODYWEIGHT_BY_MUSCLE[exercise.muscleGroup] ?? BODYWEIGHT_BY_MUSCLE[normalized(exercise.muscleGroup)];
  return BODYWEIGHT_EXERCISES.find((item) => item.id === key) ?? BODYWEIGHT_EXERCISES[0]!;
}

export function replaceWithBodyweight(
  items: WorkoutItem[],
  exercises: Exercise[],
): WorkoutItem[] {
  return items.map((item) => {
    const source = exercises.find((exercise) => exercise.id === item.exerciseId);
    if (!source) return item;
    const alternative = bodyweightAlternativeFor(source);
    return {
      ...item,
      exerciseId: alternative.id,
      weight: 0,
      targetWeight: 0,
      workingSets: item.workingSets?.map((set) => ({ ...set, weight: 0 })),
      warmups: item.warmups?.map((set) => ({ ...set, weight: 0 })),
      approvedAlternatives: undefined,
    };
  });
}