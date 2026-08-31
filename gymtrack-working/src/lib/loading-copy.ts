export const LOADING_MESSAGES = [
  "מעמיסים משקלים, לא תירוצים.",
  "רגע, אנחנו מתחממים.",
  "טוענים יותר מהר מהחזרה האחרונה.",
  "עוד שנייה. אל תעשי עוד סט בינתיים.",
  "המערכת עושה חימום.",
  "מתארגנים על עוד חזרה אחת.",
  "מחשבים. כי “בערך” זה לא ערך תזונתי.",
  "מנסים להבין כמה קלוריות יש ב”טעימה”.",
  "מסדרים לך את התפריט בלי לשפוט את העוגייה.",
  "גם הפיצה יכולה להיכנס. תירגעי.",
  "השריר לא נבנה לבד. גם האפליקציה לא.",
  "אם את מחכה למוטיבציה, זה ייקח יותר זמן.",
  "אל תדאגי, זה לא סט של 20.",
  "3… 2… 1… כאב שרירים.",
  "המערכת מתאוששת מהאימון שלך.",
  "לא נתקענו. אנחנו עושים מנוחה בין סטים.",
  "עוד רגע. תעמידי פנים שאת עושה פלאנק.",
  "טוענים נתונים. לא תירוצים.",
  "המטרה: חזקה יותר, לא רעבה יותר.",
  "פחות “ממחר”, יותר “מה הסט הבא?”",
  "הנתונים שלך בדרך. הסקוואט שלך לא.",
  "זה לוקח פחות זמן מהפסקה בין סטים.",
  "אנחנו יודעים שאמרת “רק עוד פרק אחד”.",
  "טעינה… כי גם לשרירים יש קצב",
  "רגע, אנחנו בודקים אם זה באמת היה “רק כף שמן”.",
  "בודקים אם הקפה עם החלב עדיין נחשב קפה.",
  "רגע, אנחנו שוקלים את הטחינה. היא ביקשה שלא.",
  "מחשבים כמה זה “חתיכה קטנה” של עוגה.",
  "סופרים את הקלוריות שהתחבאו ברוטב.",
  "בודקים אם הסלט עדיין סלט אחרי כל הרוטב.",
  "שנייה, אנחנו סופרים את השקדים שאכלת תוך כדי.",
  "מנסים להבין מי שם את כל הטחינה הזאת.",
  "שנייה, אנחנו בודקים אם הפרמזן היה הכרחי. (הוא היה.)",
  "מחשבים אם העוגייה הייתה שווה את זה. היא הייתה.",
  "בודקים אם אפשר להכניס גם קינוח. ברור שאפשר.",
  "סופרים חלבון. ומתעלמים מהעוגייה.",
  "שנייה, אנחנו נותנים לפיצה את הכבוד שמגיע לה",
] as const;

export const LOADING_CYCLE_STORAGE_KEY = "my-routine-loading-cycle-v6";

export function readLoadingCycle(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function loadingCycleIndexes(cycleIndex: number, animationCount: number) {
  const safeCycleIndex = Number.isSafeInteger(cycleIndex) && cycleIndex >= 0 ? cycleIndex : 0;
  const safeAnimationCount = Math.max(1, Math.floor(animationCount));
  return {
    animationIndex: safeCycleIndex % safeAnimationCount,
    messageIndex: safeCycleIndex % LOADING_MESSAGES.length,
  };
}

export function loadingMessageForGender(index: number, gender: "female" | "male" | undefined) {
  const message = LOADING_MESSAGES[index % LOADING_MESSAGES.length] ?? LOADING_MESSAGES[0];
  if (gender === "female") return message;

  return message
    .replaceAll("אל תעשי", "אל תעשה")
    .replaceAll("תירגעי", "תירגע")
    .replaceAll("אם את מחכה", "אם אתה מחכה")
    .replaceAll("אל תדאגי", "אל תדאג")
    .replaceAll("תעמידי פנים", "תעמיד פנים");
}
