export type RecipeNutrition = {
  calories: number;
  protein: number;
  fat: number;
};

export type RecipeDefinition = {
  id: string;
  name: string;
  category: "עתיר חלבון" | "דל שומן" | "ארוחה קלה" | "מתוק מאוזן";
  ingredients: string[];
  instructions: string[];
  nutrition: RecipeNutrition;
};

/** Compact, practical recipe suggestions. Values are estimates per serving. */
export const RECIPE_LIBRARY: RecipeDefinition[] = [
  {
    id: "rice-paper-borek",
    name: "בורקס דפי אורז",
    category: "דל שומן",
    ingredients: ["3 דפי אורז", "100 ג׳ קוטג׳ 5%", "ביצה", "50 ג׳ גבינה בולגרית 5%", "תבלינים"],
    instructions: [
      "טובלים כל דף אורז במים לכמה שניות ומניחים על משטח.",
      "מערבבים קוטג׳, ביצה, בולגרית ותבלינים ומניחים במרכז.",
      "מקפלים, מברישים מעט בביצה ואופים ב־200 מעלות כ־15–18 דקות.",
    ],
    nutrition: { calories: 315, protein: 25, fat: 12 },
  },
  {
    id: "cucumber-labaneh-salad",
    name: "סלט מלפפונים ולאבנה",
    category: "ארוחה קלה",
    ingredients: [
      "2 מלפפונים",
      "100 ג׳ לאבנה 5%",
      "שמיר ונענע",
      "כפית שמן זית",
      "לימון, מלח ופלפל",
    ],
    instructions: [
      "חותכים את המלפפונים לקוביות או לפרוסות.",
      "מערבבים עם לאבנה, עשבי תיבול, לימון ותבלינים.",
      "מזלפים כפית שמן זית ומגישים קר.",
    ],
    nutrition: { calories: 205, protein: 12, fat: 12 },
  },
  {
    id: "yogurt-apple-honey",
    name: "יוגורט עם תפוח ודבש",
    category: "מתוק מאוזן",
    ingredients: [
      "200 ג׳ יוגורט חלבון",
      "תפוח קטן חתוך",
      "כפית דבש",
      "קינמון",
      "10 ג׳ אגוזים קצוצים",
    ],
    instructions: [
      "מניחים את היוגורט בקערה.",
      "מוסיפים תפוח, קינמון ואגוזים.",
      "מזלפים מעל כפית דבש ומגישים.",
    ],
    nutrition: { calories: 270, protein: 21, fat: 8 },
  },
  {
    id: "rice-cakes-cottage-honey",
    name: "פריכיות עם קוטג׳ ודבש",
    category: "עתיר חלבון",
    ingredients: ["3 פריכיות אורז", "150 ג׳ קוטג׳ 5%", "כפית דבש", "קינמון או זעתר"],
    instructions: [
      "מורחים קוטג׳ על הפריכיות.",
      "מוסיפים מעט דבש וקינמון לגרסה מתוקה, או זעתר לגרסה מלוחה.",
      "מגישים מיד כדי לשמור על הפריכות.",
    ],
    nutrition: { calories: 290, protein: 20, fat: 9 },
  },
  {
    id: "protein-omelet",
    name: "חביתת חלבון וירקות",
    category: "עתיר חלבון",
    ingredients: ["ביצה", "150 ג׳ חלבוני ביצה", "עגבנייה", "פטריות", "תרסיס שמן ותבלינים"],
    instructions: [
      "מקפיצים את הירקות במחבת נון־סטיק.",
      "טורפים ביצה וחלבונים, יוצקים למחבת ומבשלים על אש בינונית.",
      "מקפלים כשהחביתה יציבה ומגישים.",
    ],
    nutrition: { calories: 245, protein: 31, fat: 8 },
  },
  {
    id: "tuna-yogurt-toast",
    name: "טוסט טונה ויוגורט",
    category: "עתיר חלבון",
    ingredients: [
      "2 פרוסות לחם מלא",
      "קופסת טונה במים",
      "2 כפות יוגורט",
      "מלפפון חמוץ",
      "חרדל ופלפל",
    ],
    instructions: [
      "מסננים את הטונה ומערבבים עם יוגורט, חרדל ומלפפון חמוץ.",
      "מורחים על הלחם וסוגרים.",
      "קולים בטוסטר עד שהלחם זהוב.",
    ],
    nutrition: { calories: 335, protein: 30, fat: 7 },
  },
  {
    id: "chicken-tortilla",
    name: "טורטייה עוף וירקות",
    category: "דל שומן",
    ingredients: [
      "טורטייה קטנה",
      "120 ג׳ חזה עוף",
      "חסה ועגבנייה",
      "כף יוגורט",
      "פפריקה, שום ולימון",
    ],
    instructions: [
      "מתבלים את העוף וצולים במחבת עד שהוא מוכן.",
      "חותכים לרצועות ומניחים על הטורטייה עם הירקות.",
      "מוסיפים יוגורט, מגלגלים וקולים דקה מכל צד.",
    ],
    nutrition: { calories: 390, protein: 34, fat: 10 },
  },
  {
    id: "cottage-pancakes",
    name: "פנקייק קוטג׳ ושיבולת שועל",
    category: "עתיר חלבון",
    ingredients: ["100 ג׳ קוטג׳", "ביצה", "30 ג׳ שיבולת שועל", "חצי בננה", "קינמון"],
    instructions: [
      "טוחנים או מועכים את כל המרכיבים לבלילה.",
      "מטגנים לביבות קטנות במחבת נון־סטיק.",
      "הופכים כשהקצוות מתייצבים ומגישים.",
    ],
    nutrition: { calories: 320, protein: 22, fat: 10 },
  },
  {
    id: "greek-salad-tuna",
    name: "סלט יווני עם טונה",
    category: "דל שומן",
    ingredients: ["מלפפון", "עגבנייה", "פלפל", "קופסת טונה במים", "30 ג׳ בולגרית 5%", "לימון"],
    instructions: [
      "חותכים את הירקות ומניחים בקערה.",
      "מוסיפים טונה מסוננת ובולגרית.",
      "מתבלים בלימון, פלפל ומעט מלח.",
    ],
    nutrition: { calories: 280, protein: 30, fat: 9 },
  },
  {
    id: "protein-chocolate-mug",
    name: "עוגת שוקולד חלבונית בכוס",
    category: "מתוק מאוזן",
    ingredients: ["ביצה", "20 ג׳ אבקת חלבון", "כף קקאו", "כף יוגורט", "חצי כפית אבקת אפייה"],
    instructions: [
      "מערבבים את כל המרכיבים בכוס שמתאימה למיקרוגל.",
      "מחממים 60–75 שניות ובודקים שהמרכז עדיין מעט לח.",
      "ממתינים דקה ומגישים.",
    ],
    nutrition: { calories: 210, protein: 24, fat: 7 },
  },
];
