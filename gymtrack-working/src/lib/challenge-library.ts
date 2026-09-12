import type { Challenge, Workout, WorkoutItem } from "./gym-types";

const challengeItem = (
  id: string,
  exerciseId: string,
  exerciseName: string,
  sets: number,
  reps: number,
  targetLabel: string,
  rest: number,
  notes: string,
): WorkoutItem => ({
  id,
  exerciseId,
  exerciseName,
  sets,
  reps,
  targetLabel,
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

const skillWorkout = (id: string, name: string, notes: string, items: WorkoutItem[]): Workout => ({
  id,
  name,
  notes,
  items,
});

const cardioWorkout = (
  id: string,
  name: string,
  notes: string,
  cardioType: string,
  items: WorkoutItem[],
): Workout => ({
  ...skillWorkout(id, name, notes, items),
  cardioType,
});

const skillChallenge = (
  id: string,
  title: string,
  description: string,
  category: Challenge["category"],
  difficulty: Challenge["difficulty"],
  durationLabel: string,
  accent: Challenge["accent"],
  sessionName: string,
  sessionNotes: string,
  items: WorkoutItem[],
): Challenge => ({
  id,
  title,
  description,
  category,
  difficulty,
  durationLabel,
  accent,
  isBuiltIn: true,
  isPublished: true,
  sessions: [skillWorkout(`${id}-session`, sessionName, sessionNotes, items)],
});

const cardioChallenge = (
  id: string,
  title: string,
  description: string,
  difficulty: Challenge["difficulty"],
  durationLabel: string,
  accent: Challenge["accent"],
  sessionName: string,
  sessionNotes: string,
  cardioType: string,
  items: WorkoutItem[],
): Challenge => ({
  id,
  title,
  description,
  category: "אירובי",
  difficulty,
  durationLabel,
  accent,
  isBuiltIn: true,
  isPublished: true,
  sessions: [cardioWorkout(`${id}-session`, sessionName, sessionNotes, cardioType, items)],
});

/**
 * These are intentionally short, visual skill challenges rather than generic
 * "do more reps" programs. Each one gives the user a real session to repeat.
 */
export const RETIRED_BUILT_IN_CHALLENGE_IDS = [
  "challenge-20-10",
  "challenge-30-pushups",
  "challenge-handstand",
  "challenge-pullup",
  "challenge-5k-first",
  "challenge-10k-builder",
  "challenge-100-squats",
  "challenge-50-lunges",
  "challenge-5-minute-plank",
  "challenge-100-pushups",
  "challenge-10-minute-cardio",
  "challenge-full-body-15",
  "challenge-core-trio",
  "challenge-upper-body",
  "challenge-lower-body",
  "challenge-glute-activation",
  "challenge-morning-mobility",
  "challenge-run-walk-30",
  "challenge-10-pullups",
  "challenge-100-mountain-climbers",
  "challenge-runner-mobility",
  "challenge-hamstrings",
  "challenge-runner-glutes",
  "challenge-strength-foundation",
  "challenge-active-recovery",
  "challenge-run-1k",
  "challenge-run-3k",
  "challenge-run-5k",
  "challenge-run-5k-consistency",
  "challenge-run-10k",
  "challenge-run-15k",
  "challenge-run-21k",
  "challenge-run-walk-30",
  "challenge-run-intervals",
  "challenge-run-hills",
  "challenge-flex-foundation",
  "challenge-hip-opening",
  "challenge-runner-core",
] as const;

const BASE_BUILT_IN_CHALLENGES: Challenge[] = [
  skillChallenge(
    "challenge-handstand-wall",
    "עמידת ידיים על הקיר",
    "בונות ביטחון הפוך — מהקיר לעמידה יציבה.",
    "מיומנות",
    "מתחילים",
    "4 שבועות",
    "peach",
    "עמידת ידיים — בסיס",
    "3 סבבים. מנוחה של דקה בין התרגילים.",
    [
      challengeItem("challenge-handstand-wall-wrists", "ex-squat", "חימום שורש כף יד", 2, 30, "30 שניות", 20, "מעגלים קטנים, בלי כאב."),
      challengeItem("challenge-handstand-wall-pike", "ex-plank", "פייק — כתפיים מעל הידיים", 3, 20, "20 שניות", 45, "דוחפות את הרצפה ומסתכלות לכיוון הברכיים."),
      challengeItem("challenge-handstand-wall-hold", "ex-plank", "עמידת ידיים עם חזה לקיר", 5, 20, "20 שניות", 60, "בטן אסופה, עקבים נוגעים בקיר בעדינות."),
    ],
  ),
  skillChallenge(
    "challenge-handstand-free",
    "עמידת ידיים בלי קיר",
    "מתרגלות עליות, איזון וירידה בטוחה — לא רודפות אחרי ניסיון מושלם.",
    "מיומנות",
    "מתקדמים",
    "6 שבועות",
    "lavender",
    "עמידת ידיים — איזון",
    "עובדות ליד קיר פתוח או מזרן. יורדות תמיד דרך הצד, לא קורסות על הצוואר.",
    [
      challengeItem("challenge-handstand-free-wall", "ex-plank", "עמידה עם עקבים מהקיר", 3, 30, "30 שניות", 60, "מרחיקות עקב אחד בכל פעם."),
      challengeItem("challenge-handstand-free-kick", "ex-plank", "עלייה לעמידת ידיים", 8, 1, "8 ניסיונות", 45, "בעיטה קטנה. עדיף קצר ונקי."),
      challengeItem("challenge-handstand-free-balance", "ex-plank", "תפיסת איזון", 5, 10, "10 שניות", 60, "גם שנייה אחת באוויר נחשבת."),
    ],
  ),
  skillChallenge(
    "challenge-headstand",
    "עמידת ראש",
    "לומדות בסיס יציב לעמידת ראש, עם שליטה ולא בכוח על הצוואר.",
    "מיומנות",
    "ביניים",
    "4 שבועות",
    "sand",
    "עמידת ראש — שליטה",
    "מתרגלות על מזרן ובמרחב נקי. אם יש לחץ בצוואר — עוצרות.",
    [
      challengeItem("challenge-headstand-tripod", "ex-plank", "משולש ידיים וראש", 3, 20, "20 שניות", 45, "ראש נוגע קלות, רוב המשקל בידיים."),
      challengeItem("challenge-headstand-tuck", "ex-plank", "הרמת ברכיים לטאק", 5, 5, "5 ניסיונות", 60, "מרימות שתי רגליים בלי לבעוט."),
      challengeItem("challenge-headstand-hold", "ex-plank", "עמידת ראש עם קיר", 4, 15, "15 שניות", 60, "גב ארוך ובטן אסופה."),
    ],
  ),
  skillChallenge(
    "challenge-front-split",
    "שפגאט קדמי",
    "מסלול ברור לשפגאט: חימום, ירך קדמית, המסטרינג ואז ניסיון נתמך.",
    "מיומנות",
    "ביניים",
    "8 שבועות",
    "peach",
    "שפגאט קדמי — תרגול",
    "עושות את שני הצדדים. מתיחה חזקה זה בסדר; כאב חד — לא.",
    [
      challengeItem("challenge-front-split-lunge", "ex-squat", "מכרע נמוך", 2, 40, "40 שניות לכל צד", 20, "אגן פונה קדימה."),
      challengeItem("challenge-front-split-half", "ex-squat", "חצי שפגאט", 2, 40, "40 שניות לכל צד", 20, "ברך קדמית רכה וגב ארוך."),
      challengeItem("challenge-front-split-hold", "ex-squat", "שפגאט קדמי עם הגבהה", 3, 20, "20 שניות לכל צד", 30, "ידיים על בלוקים או כיסא."),
    ],
  ),
  skillChallenge(
    "challenge-middle-split",
    "שפגאט אמצעי",
    "פותחות את המפשעה בהדרגה ומתקדמות לשפגאט אמצעי בלי לדחוף בכוח.",
    "מיומנות",
    "מתקדמים",
    "10 שבועות",
    "lavender",
    "שפגאט אמצעי — פתיחה",
    "טווח קטן ונקי עדיף מירידה עמוקה עם כאב.",
    [
      challengeItem("challenge-middle-split-rocks", "ex-squat", "סלעים במנח צפרדע", 2, 10, "10 חזרות", 20, "תנועה קטנה קדימה ואחורה."),
      challengeItem("challenge-middle-split-frog", "ex-squat", "מתיחת צפרדע", 3, 35, "35 שניות", 25, "ברכיים בקו הירכיים, נשימה רגועה."),
      challengeItem("challenge-middle-split-hold", "ex-squat", "שפגאט אמצעי נתמך", 3, 20, "20 שניות", 30, "משתמשות בידיים ובבלוקים."),
    ],
  ),
  skillChallenge(
    "challenge-floor-touch",
    "ידיים לרצפה בעמידה",
    "המטרה: להגיע עם הידיים לרצפה בלי לכופף ברכיים — בהדרגה ובשליטה.",
    "מיומנות",
    "מתחילים",
    "4 שבועות",
    "sage",
    "נגיעה ברצפה — קיפול קדימה",
    "מחממות 3 דקות לפני. לא קופצות לתוך המתיחה.",
    [
      challengeItem("challenge-floor-touch-fold", "ex-squat", "קיפול קדימה איטי", 3, 8, "8 חזרות", 30, "יורדות 3 שניות ועולות 3 שניות."),
      challengeItem("challenge-floor-touch-hold", "ex-squat", "קיפול קדימה — החזקה", 3, 25, "25 שניות", 30, "ברכיים מעט רכות אם צריך."),
      challengeItem("challenge-floor-touch-reach", "ex-squat", "ניסיון ידיים לרצפה", 5, 1, "5 ניסיונות", 30, "מגיעות לטווח הכי נמוך בלי כאב."),
    ],
  ),
  skillChallenge(
    "challenge-crow-stand",
    "עמידת עורב",
    "לומדות להעביר משקל לידיים ולהחזיק את הגוף באוויר — צעד ראשון מעולה לקליסטניקס.",
    "מיומנות",
    "ביניים",
    "4 שבועות",
    "sand",
    "עמידת עורב — איזון",
    "מניחות כרית מול הפנים ומתרגלות ירידה רכה.",
    [
      challengeItem("challenge-crow-wrists", "ex-squat", "חימום שורש כף יד", 2, 30, "30 שניות", 20, "כפות ידיים שטוחות ואצבעות פעילות."),
      challengeItem("challenge-crow-frog", "ex-plank", "עמידת צפרדע", 5, 15, "15 שניות", 45, "ברכיים על ידיים, מבט קדימה."),
      challengeItem("challenge-crow-hold", "ex-plank", "עמידת עורב", 6, 8, "8 שניות", 45, "רגל אחת ואז שתיים. לא חייבות להחזיק הרבה."),
    ],
  ),
  skillChallenge(
    "challenge-l-sit",
    "L-sit",
    "מתקדמות מהרמות קטנות למנח L-sit נקי, גם אם הברכיים עדיין כפופות.",
    "כוח",
    "ביניים",
    "6 שבועות",
    "sage",
    "L-sit — כוח ושליטה",
    "עובדות על מקבילים, בלוקים או שתי ידיות יציבות.",
    [
      challengeItem("challenge-l-sit-compression", "ex-plank", "הרמות רגליים בישיבה", 3, 8, "8 חזרות", 45, "חזה פתוח ורגליים ארוכות."),
      challengeItem("challenge-l-sit-tuck", "ex-plank", "Tuck sit", 5, 15, "15 שניות", 45, "מרימות אגן מהרצפה."),
      challengeItem("challenge-l-sit-extend", "ex-plank", "הארכת רגל אחת", 4, 10, "10 שניות לכל צד", 45, "רגל אחת ארוכה, השנייה קרובה."),
    ],
  ),
  skillChallenge(
    "challenge-pistol-squat",
    "סקוואט על רגל אחת",
    "בונות שליטה לרגל אחת עד לסקוואט נמוך — עם תמיכה, בלי אגו.",
    "כוח",
    "ביניים",
    "6 שבועות",
    "peach",
    "Pistol squat — שליטה",
    "מתרגלות ליד עמוד או כיסא. הברך נשארת בקו כף הרגל.",
    [
      challengeItem("challenge-pistol-box", "ex-squat", "סקוואט לרגל אחת לקופסה", 3, 6, "6 חזרות לכל צד", 60, "נוגעות בקופסה ועולות בשליטה."),
      challengeItem("challenge-pistol-counterweight", "ex-squat", "Pistol עם משקל נגדי", 3, 5, "5 חזרות לכל צד", 60, "מחזיקות משקל קטן לפנים אם צריך."),
      challengeItem("challenge-pistol-negative", "ex-squat", "ירידה איטית על רגל אחת", 4, 3, "3 ירידות לכל צד", 60, "יורדות 4 שניות ועוזרות בעלייה."),
    ],
  ),
  skillChallenge(
    "challenge-bridge",
    "גשר",
    "פותחות כתפיים וגב עד לגשר נוח, עם שליטה ולא עם קפיצה לאחור.",
    "מיומנות",
    "ביניים",
    "6 שבועות",
    "sand",
    "גשר — פתיחה ושליטה",
    "עובדות על מזרן. אם יש לחץ בגב התחתון, חוזרות שלב.",
    [
      challengeItem("challenge-bridge-shoulders", "ex-plank", "פתיחת כתפיים על הקיר", 3, 30, "30 שניות", 30, "צלעות בפנים, בלי לקשת את הגב."),
      challengeItem("challenge-bridge-table", "ex-plank", "שולחן הפוך", 3, 20, "20 שניות", 45, "דוחפות רצפה ומרימות חזה."),
      challengeItem("challenge-bridge-hold", "ex-plank", "גשר עם הגבהה", 4, 15, "15 שניות", 60, "מתחילות עם ידיים על בלוקים."),
    ],
  ),
  cardioChallenge(
    "challenge-treadmill-intervals",
    "הליכון — אינטרוולים",
    "בונות קצב וסיבולת על ההליכון, עם מקטעים ברורים שאפשר לחזור עליהם.",
    "מתחילים",
    "4 שבועות",
    "peach",
    "הליכון — קצב ושליטה",
    "מתחילות בקצב שאפשר לשלוט בו. מאטות אם הנשימה יוצאת משליטה.",
    "הליכון (Treadmill)",
    [
      challengeItem("challenge-treadmill-warmup", "ex-treadmill", "חימום הליכון", 1, 600, "10 דקות", 60, "הליכה מהירה או ריצה קלה."),
      challengeItem("challenge-treadmill-intervals", "ex-treadmill", "מקטעי קצב", 6, 60, "דקה מהירה", 60, "דקה מהירה ואז דקה קלה."),
      challengeItem("challenge-treadmill-cooldown", "ex-treadmill", "שחרור בהליכה", 1, 300, "5 דקות", 0, "מורידות קצב בהדרגה."),
    ],
  ),
  cardioChallenge(
    "challenge-stair-climber",
    "מדרגות — קצב רציף",
    "אתגר מדרגות קצר ומדורג לחיזוק הסיבולת בלי לרדוף אחרי מספר הקומות.",
    "מתחילים",
    "4 שבועות",
    "lavender",
    "מדרגות — קצב יציב",
    "שומרות על קצב שאפשר להחזיק. אוחזות במעקה רק לצורך יציבות.",
    "מדרגות (StairMaster)",
    [
      challengeItem("challenge-stairs-warmup", "ex-stair-climber", "חימום מדרגות", 1, 300, "5 דקות", 60, "קצב קל."),
      challengeItem("challenge-stairs-sets", "ex-stair-climber", "מקטעי מדרגות", 5, 90, "90 שניות", 60, "מעלות קצב בלי לאבד יציבה."),
      challengeItem("challenge-stairs-finish", "ex-stair-climber", "סיום קל", 1, 300, "5 דקות", 0, "מסיימות בהורדת קצב."),
    ],
  ),
  cardioChallenge(
    "challenge-elliptical-intervals",
    "אליפטיקל — דופק עולה",
    "אימון אליפטיקל נעים למפרקים, עם מקטעים קצרים שמעלים את הדופק.",
    "מתחילים",
    "4 שבועות",
    "sage",
    "אליפטיקל — קצב משתנה",
    "שומרות על תנועה חלקה. התנגדות נמוכה יותר אם הברכיים או הגב מתחילים להתעייף.",
    "אליפטיקל",
    [
      challengeItem("challenge-elliptical-warmup", "ex-elliptical", "חימום אליפטיקל", 1, 600, "10 דקות", 60, "קצב קל ונוח."),
      challengeItem("challenge-elliptical-intervals", "ex-elliptical", "מקטעי התנגדות", 8, 45, "45 שניות", 45, "מקטע חזק ואז 45 שניות קלות."),
      challengeItem("challenge-elliptical-cooldown", "ex-elliptical", "שחרור אליפטיקל", 1, 300, "5 דקות", 0, "נשימה חוזרת לקצב רגוע."),
    ],
  ),
  cardioChallenge(
    "challenge-bike-sprints",
    "אופניים — ספרינטים",
    "מכניסות קצב לאופני הכושר עם ספרינטים קצרים ומנוחה מסודרת.",
    "ביניים",
    "4 שבועות",
    "sand",
    "אופניים — ספרינטים קצרים",
    "הספרינט חזק אבל נשאר בשליטה. לא צריך להגיע למקסימום בכל סבב.",
    "אופני כושר",
    [
      challengeItem("challenge-bike-warmup", "ex-stationary-bike", "חימום אופניים", 1, 600, "10 דקות", 60, "סיבוב קל עם התנגדות נמוכה."),
      challengeItem("challenge-bike-sprints", "ex-stationary-bike", "ספרינטים", 8, 20, "20 שניות", 60, "20 שניות חזקות ואז דקה קלה."),
      challengeItem("challenge-bike-cooldown", "ex-stationary-bike", "שחרור אופניים", 1, 300, "5 דקות", 0, "מורידות התנגדות בהדרגה."),
    ],
  ),
];

const RUNNING_CHALLENGES: Challenge[] = [
  cardioChallenge(
    "challenge-run-1k",
    "ריצה 1 ק״מ",
    "",
    "מתחילים",
    "1 אימון",
    "sage",
    "ריצה 1 ק״מ",
    "",
    "ריצה",
    [
      {
        ...challengeItem("challenge-run-1k-distance", "ex-treadmill", "ריצה", 1, 1, "1 ק״מ", 0, ""),
        distanceKm: 1,
      },
    ],
  ),
  cardioChallenge(
    "challenge-run-3k",
    "ריצה 3 ק״מ",
    "",
    "מתחילים",
    "1 אימון",
    "peach",
    "ריצה 3 ק״מ",
    "",
    "ריצה",
    [
      {
        ...challengeItem("challenge-run-3k-distance", "ex-treadmill", "ריצה", 1, 1, "3 ק״מ", 0, ""),
        distanceKm: 3,
      },
    ],
  ),
  cardioChallenge(
    "challenge-run-5k",
    "ריצה 5 ק״מ",
    "",
    "ביניים",
    "1 אימון",
    "lavender",
    "ריצה 5 ק״מ",
    "",
    "ריצה",
    [
      {
        ...challengeItem("challenge-run-5k-distance", "ex-treadmill", "ריצה", 1, 1, "5 ק״מ", 0, ""),
        distanceKm: 5,
      },
    ],
  ),
  cardioChallenge(
    "challenge-run-10k",
    "ריצה 10 ק״מ",
    "",
    "מתקדמים",
    "1 אימון",
    "sand",
    "ריצה 10 ק״מ",
    "",
    "ריצה",
    [
      {
        ...challengeItem("challenge-run-10k-distance", "ex-treadmill", "ריצה", 1, 1, "10 ק״מ", 0, ""),
        distanceKm: 10,
      },
    ],
  ),
];

const INCLINE_WALKING_CHALLENGES: Challenge[] = [
  cardioChallenge(
    "challenge-treadmill-incline-walk",
    "הליכון — הליכה בשיפוע",
    "",
    "מתחילים",
    "1 אימון",
    "peach",
    "הליכה בשיפוע",
    "",
    "הליכון",
    [
      {
        ...challengeItem("challenge-incline-walk-warmup", "ex-treadmill", "חימום הליכון", 1, 5, "5 דקות", 0, ""),
        targetSpeedKmH: 4,
        targetInclinePct: 2,
      },
      {
        ...challengeItem("challenge-incline-walk-main", "ex-treadmill", "הליכה בשיפוע", 1, 20, "20 דקות", 0, ""),
        targetSpeedKmH: 5,
        targetInclinePct: 8,
      },
      {
        ...challengeItem("challenge-incline-walk-cooldown", "ex-treadmill", "שחרור הליכון", 1, 5, "5 דקות", 0, ""),
        targetSpeedKmH: 4,
        targetInclinePct: 2,
      },
    ],
  ),
  cardioChallenge(
    "challenge-treadmill-incline-walk-30",
    "הליכון — הליכה בשיפוע 30 דקות",
    "",
    "ביניים",
    "1 אימון",
    "sage",
    "הליכה בשיפוע 30 דקות",
    "",
    "הליכון",
    [
      {
        ...challengeItem("challenge-incline-walk-30-main", "ex-treadmill", "הליכה בשיפוע", 1, 30, "30 דקות", 0, ""),
        targetSpeedKmH: 5.5,
        targetInclinePct: 10,
      },
    ],
  ),
];

function simplifyBuiltInChallenge(challenge: Challenge): Challenge {
  const simplified: Challenge = {
    ...challenge,
    description: "",
    sessions: challenge.sessions.map((session) => ({
      ...session,
      notes: "",
      items: session.items.map((item) => ({ ...item, notes: "" })),
    })),
  };
  delete simplified.nutritionTips;
  return simplified;
}

export const BUILT_IN_CHALLENGES: Challenge[] = [
  ...BASE_BUILT_IN_CHALLENGES.map(simplifyBuiltInChallenge),
  ...RUNNING_CHALLENGES,
  ...INCLINE_WALKING_CHALLENGES,
];

export function cloneChallenge(challenge: Challenge): Challenge {
  const clone: Challenge = {
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
  if (challenge.nutritionTips) clone.nutritionTips = [...challenge.nutritionTips];
  return clone;
}