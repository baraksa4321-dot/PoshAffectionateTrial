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
    instructions: "יש לשמור על גוף ישר, לרדת בשליטה ולדחוף את הרצפה.",
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
    instructions: "יש להצמיד את כפות הידיים מתחת לחזה ולשמור מרפקים קרובים לגוף.",
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
    instructions: "יש להרים את האגן, לכופף מרפקים ולהוריד את הראש לכיוון הרצפה.",
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
    instructions: "יש למשוך את הגוף עד שהסנטר עובר את המוט ולרדת בשליטה.",
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
    instructions: "יש למשוך את החזה לכיוון המוט תוך שמירה על גוף ישר.",
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
    instructions: "יש לשלוח אגן לאחור, לרדת בשליטה ולעלות דרך כל כף הרגל.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "יש לשמור על הברכיים בקו האצבעות.",
  },
  {
    id: "bw-reverse-lunge",
    name: "לאנג׳ אחורי",
    muscleGroup: "רגליים",
    equipment: "משקל גוף",
    description: "תרגיל חד־צדדי לירכיים ולישבן.",
    instructions: "יש לקחת צעד לאחור, לרדת עד ששתי הברכיים כפופות ולחזור לעמידה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר להיעזר בקיר לתמיכה בעת הצורך.",
  },
  {
    id: "bw-glute-bridge",
    name: "גשר ישבן",
    muscleGroup: "ישבן",
    equipment: "משקל גוף",
    description: "תרגיל לישבן ולהמסטרינג בשכיבה.",
    instructions: "יש לדחוף את האגן למעלה, לכווץ ישבן ולהוריד בשליטה.",
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
    instructions: "יש לעלות על קצות האצבעות, לעצור למעלה ולרדת באיטיות.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר לבצע על מדרגה לטווח תנועה גדול יותר.",
  },
  {
    id: "bw-plank",
    name: "פלאנק",
    muscleGroup: "ליבה",
    equipment: "משקל גוף",
    description: "תרגיל איזומטרי לשרירי הליבה.",
    instructions: "יש לשמור על גוף ישר, לכווץ בטן ולנשום רגיל.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "חשוב לא לאפשר לאגן לשקוע.",
  },
  {
    id: "bw-dead-bug",
    name: "דד באג",
    muscleGroup: "ליבה",
    equipment: "משקל גוף",
    description: "תרגיל שליטה לליבה בשכיבה.",
    instructions: "יש להוריד יד ורגל נגדית בלי לאבד את מגע הגב ברצפה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "אפשר להקטין את טווח התנועה אם הגב מתנתק מהרצפה.",
  },
  {
    id: "bw-superman",
    name: "סופרמן",
    muscleGroup: "גב תחתון",
    equipment: "משקל גוף",
    description: "תרגיל חיזוק לגב התחתון ולשרשרת האחורית.",
    instructions: "יש להרים ידיים ורגליים מעט מהרצפה, לעצור ולהוריד בשליטה.",
    videoUrl: "",
    images: [],
    notes: "",
    tips: "מומלץ לבצע תנועה קטנה ומבוקרת.",
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
  const muscle = normalized(exercise.muscleGroup);
  const exactKey = Object.keys(BODYWEIGHT_BY_MUSCLE).find((key) => normalized(key) === muscle);
  const partialKey = Object.keys(BODYWEIGHT_BY_MUSCLE).find(
    (key) => muscle.includes(normalized(key)) || normalized(key).includes(muscle),
  );
  const key =
    BODYWEIGHT_BY_MUSCLE[exercise.muscleGroup] ??
    BODYWEIGHT_BY_MUSCLE[exactKey ?? partialKey ?? ""];
  return BODYWEIGHT_EXERCISES.find((item) => item.id === key) ?? BODYWEIGHT_EXERCISES[0]!;
}

export function replaceWithBodyweight(items: WorkoutItem[], exercises: Exercise[]): WorkoutItem[] {
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
    };
  });
}
