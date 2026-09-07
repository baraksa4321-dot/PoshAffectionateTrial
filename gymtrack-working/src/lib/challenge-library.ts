import type { Challenge, Workout, WorkoutItem } from "./gym-types";

const challengeItem = (
  id: string,
  exerciseId: string,
  exerciseName: string,
  sets: number,
  reps: number,
  rest: number,
  notes: string,
): WorkoutItem => ({
  id,
  exerciseId,
  exerciseName,
  sets,
  reps,
  repType: "fixed",
  weight: 0,
  rest,
  notes,
  workingSets: Array.from({ length: sets }, (_, index) => ({
    id: `${id}-set-${index + 1}`,
    setNumber: index + 1,
    weight: 0,
    reps,
    rest,
  })),
});

const workout = (id: string, name: string, notes: string, items: WorkoutItem[]): Workout => ({
  id,
  name,
  notes,
  items,
});

export const BUILT_IN_CHALLENGES: Challenge[] = [
  {
    id: "challenge-20-10",
    title: "אתגר 20/10",
    description: "אימון אינטרוולים קצר וקצבי: 20 שניות עבודה, 10 שניות מנוחה, בלי לרדוף אחרי קצב שפוגע בטכניקה.",
    category: "עצימות",
    difficulty: "מתחילים",
    durationLabel: "8 דקות",
    accent: "peach",
    isBuiltIn: true,
    isPublished: true,
    sessions: [
      workout("challenge-20-10-session", "20/10 — סבב מלא", "8 סבבים. שמור על קצב שאפשר לשלוט בו לאורך כל האימון.", [
        challengeItem("challenge-20-10-mountain", "ex-mountain-climber", "טיפוס הרים", 8, 20, 10, "20 שניות עבודה · 10 שניות מנוחה"),
        challengeItem("challenge-20-10-squat", "ex-squat", "סקוואט", 8, 20, 10, "אפשר לבחור סקוואט משקל גוף"),
        challengeItem("challenge-20-10-pushup", "ex-pushup", "שכיבות סמיכה", 8, 20, 10, "אפשר לעבור לברכיים או לשיפוע"),
      ]),
    ],
  },
  {
    id: "challenge-30-pushups",
    title: "30 שכיבות סמיכה",
    description: "מסלול מדורג לבניית נפח בשכיבות סמיכה. מתקדמים רק כשהטכניקה נשארת נקייה.",
    category: "כוח",
    difficulty: "מתחילים",
    durationLabel: "4 שבועות",
    accent: "sage",
    isBuiltIn: true,
    isPublished: true,
    sessions: [
      workout("challenge-30-pushups-session", "30 שכיבות סמיכה — אימון", "בצע 3–5 סטים. עצור 2 חזרות לפני כשל והשתמש בשיפוע או בברכיים לפי הצורך.", [
        challengeItem("challenge-30-pushups-main", "ex-pushup", "שכיבות סמיכה", 5, 6, 75, "יעד פתיחה: 5×6. כשהכול נקי, הוסף חזרה לסט."),
      ]),
    ],
  },
  {
    id: "challenge-handstand",
    title: "עמידת ידיים",
    description: "בונים שליטה בהדרגה עם עבודה על קו גוף, כתפיים ושהייה על הקיר. לא מתרגלים לבד כשאין סביבת אימון בטוחה.",
    category: "מיומנות",
    difficulty: "מתחילים",
    durationLabel: "3 שבועות",
    accent: "lavender",
    isBuiltIn: true,
    isPublished: true,
    sessions: [
      workout("challenge-handstand-session", "עמידת ידיים — בסיס", "התחל ליד קיר פנוי, עם משטח בטוח, וסיים אם מופיע כאב חד או סחרחורת.", [
        challengeItem("challenge-handstand-plank", "ex-plank", "פלאנק", 3, 30, 45, "30 שניות · בטן וישבן מכווצים"),
        challengeItem("challenge-handstand-ohp", "ex-ohp", "לחיצת כתפיים", 3, 8, 60, "עבודה מבוקרת על כוח כתפיים; אפשר משקל גוף בתרגיל חלופי"),
        challengeItem("challenge-handstand-hold", "ex-plank", "החזקת קו גוף", 5, 20, 45, "20 שניות ליד קיר · איכות לפני זמן"),
      ]),
    ],
  },
  {
    id: "challenge-pullup",
    title: "המתח הראשון",
    description: "מתקדמים מתלייה ושליטה בשכמות לנגטיבים ולמתח מלא. בחר וריאציה שמאפשרת תנועה בשליטה.",
    category: "כוח",
    difficulty: "מתחילים",
    durationLabel: "4 שבועות",
    accent: "sand",
    isBuiltIn: true,
    isPublished: true,
    sessions: [
      workout("challenge-pullup-session", "מתח — בניית בסיס", "הימנע מתנופה. אם אין מתח מלא, עבוד עם גומייה או על שלב נגטיבי.", [
        challengeItem("challenge-pullup-hang", "ex-pullup", "תלייה אקטיבית", 3, 20, 60, "20 שניות · כתפיים רחוקות מהאוזניים"),
        challengeItem("challenge-pullup-scap", "ex-pullup", "משיכת שכמות", 3, 5, 60, "5 חזרות איטיות בטווח קטן"),
        challengeItem("challenge-pullup-negative", "ex-pullup", "נגטיב מתח", 4, 3, 90, "3 חזרות · ירידה של 3–5 שניות"),
      ]),
    ],
  },
];

export function cloneChallenge(challenge: Challenge): Challenge {
  return {
    ...challenge,
    id: challenge.id,
    sessions: challenge.sessions.map((session) => ({
      ...session,
      items: session.items.map((item) => {
        const copy = { ...item };
        if (item.workingSets) copy.workingSets = item.workingSets.map((set) => ({ ...set }));
        return copy;
      }),
    })),
  };
}
