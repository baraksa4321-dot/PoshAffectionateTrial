import type { FoodItem } from "./gym-types";

const makeFood = (
  id: string,
  name: string,
  category: string,
  servingSize: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber = 0,
  searchTerms: string[] = [],
): FoodItem => ({
  id,
  name,
  category,
  servingSize,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  searchTerms,
  notes: "ערך ממוצע למזון נפוץ; מומלץ לבדוק את תווית המוצר כשיש מותג ספציפי.",
});

/**
 * Short, everyday names for foods people commonly use when building a meal.
 * These are intentionally separate from the detailed supermarket/USDA catalog:
 * a picker should be friendly first, while the larger catalog remains available
 * for searching and detailed tracking.
 */
export const COMMON_FOODS: FoodItem[] = [
  // Dairy and high-protein basics
  makeFood("f-common-milk-1", "חלב 1%", "חלב", 'כוס (200 מ"ל)', 84, 6.6, 9.6, 2, 0, [
    "חלב דל שומן",
  ]),
  makeFood("f-common-milk-3", "חלב 3%", "חלב", 'כוס (200 מ"ל)', 120, 6.4, 9.4, 6, 0),
  makeFood("f-common-cottage-1", "קוטג' 1%", "גבינות", "100 גרם", 78, 12, 3, 1, 0, [
    "קוטג דל שומן",
  ]),
  makeFood("f-common-cottage-5", "קוטג' 5%", "גבינות", "100 גרם", 98, 11, 3, 5, 0),
  makeFood("f-common-white-cheese-0", "גבינה לבנה 0%", "גבינות", "100 גרם", 54, 10, 4, 0, 0, [
    "גבינה דלת שומן",
  ]),
  makeFood("f-common-white-cheese-5", "גבינה לבנה 5%", "גבינות", "100 גרם", 98, 9, 4, 5, 0),
  makeFood("f-common-yogurt-0", "יוגורט טבעי 0%", "יוגורט", "150 גרם", 84, 15, 6, 0, 0, [
    "יוגורט דל שומן",
  ]),
  makeFood("f-common-yogurt-3", "יוגורט טבעי 3%", "יוגורט", "150 גרם", 108, 6, 7, 4.5, 0),
  makeFood("f-common-greek-yogurt-5", "יוגורט יווני 5%", "יוגורט", "150 גרם", 145, 13, 6, 7.5, 0),
  makeFood("f-common-skyr", "סקיר טבעי", "יוגורט", "150 גרם", 90, 16, 7, 0.3, 0),

  // Eggs, meat, fish and plant proteins
  makeFood("f-common-egg", "ביצה", "ביצים", "יחידה", 78, 6.3, 0.6, 5.3, 0),
  makeFood("f-common-egg-white", "חלבון ביצה", "ביצים", "100 גרם", 52, 10.9, 0.7, 0.2, 0),
  makeFood("f-common-chicken-breast", "חזה עוף", "עוף ובשר", "100 גרם", 165, 31, 0, 3.6, 0),
  makeFood("f-common-chicken-thigh", "פרגית ללא עור", "עוף ובשר", "100 גרם", 177, 24, 0, 8, 0),
  makeFood("f-common-turkey-breast", "חזה הודו", "עוף ובשר", "100 גרם", 135, 29, 0, 1.5, 0),
  makeFood("f-common-beef-5", "בשר בקר טחון 5%", "עוף ובשר", "100 גרם", 137, 21, 0, 5, 0, [
    "בשר טחון רזה",
  ]),
  makeFood("f-common-tuna-water", "טונה במים", "דגים", "קופסה מסוננת (112 גרם)", 130, 29, 0, 1, 0),
  makeFood("f-common-salmon", "סלמון", "דגים", "100 גרם", 208, 20, 0, 13, 0),
  makeFood("f-common-white-fish", "דג לבן", "דגים", "100 גרם", 110, 23, 0, 2, 0),
  makeFood("f-common-tofu", "טופו", "תחליפי בשר", "100 גרם", 144, 15, 2, 8, 1),

  // Carbohydrates and ingredients
  makeFood("f-common-rice", "אורז לבן מבושל", "דגנים ופחמימות", "100 גרם", 130, 2.7, 28, 0.3, 0.4),
  makeFood("f-common-pasta", "פסטה מבושלת", "דגנים ופחמימות", "100 גרם", 158, 5.8, 30.9, 0.9, 1.8),
  makeFood(
    "f-common-potato",
    "תפוח אדמה מבושל",
    "דגנים ופחמימות",
    "100 גרם",
    87,
    1.9,
    20.1,
    0.1,
    1.8,
  ),
  makeFood("f-common-sweet-potato", "בטטה", "דגנים ופחמימות", "100 גרם", 86, 1.6, 20.1, 0.1, 3),
  makeFood("f-common-oats", "שיבולת שועל", "דגנים ופחמימות", "50 גרם", 190, 6.5, 33, 3.5, 5),
  makeFood(
    "f-common-quinoa",
    "קינואה מבושלת",
    "דגנים ופחמימות",
    "100 גרם",
    120,
    4.4,
    21.3,
    1.9,
    2.8,
  ),
  makeFood("f-common-bread", "לחם", "לחמים", "פרוסה", 75, 2.5, 14, 1, 1),
  makeFood("f-common-whole-bread", "לחם מלא", "לחמים", "פרוסה", 80, 3.5, 13, 1.2, 2.5),
  makeFood("f-common-pita", "פיתה", "לחמים", "יחידה", 170, 6, 35, 1, 2),
  makeFood("f-common-whole-pita", "פיתה מלאה", "לחמים", "יחידה", 165, 6, 31, 2, 5),
  makeFood("f-common-tortilla", "טורטייה", "לחמים", "יחידה", 150, 4, 25, 4, 2),
  makeFood("f-common-flour", "קמח לבן", "מצרכים בסיסיים", "100 גרם", 364, 10.3, 76.3, 1, 2.7, [
    "קמח",
  ]),
  makeFood(
    "f-common-whole-flour",
    "קמח מלא",
    "מצרכים בסיסיים",
    "100 גרם",
    340,
    13.7,
    72,
    2.5,
    10.7,
  ),
  makeFood("f-common-lentils", "עדשים מבושלות", "קטניות", "100 גרם", 116, 9, 20, 0.4, 7.9),
  makeFood("f-common-chickpeas", "חומוס מבושל", "קטניות", "100 גרם", 164, 8.9, 27.4, 2.6, 7.6),
  makeFood("f-common-beans", "שעועית מבושלת", "קטניות", "100 גרם", 127, 8.7, 22.8, 0.5, 6.4),

  // Fruit
  makeFood("f-common-apple", "תפוח", "פירות", "יחידה בינונית", 95, 0.5, 25, 0.3, 4.4),
  makeFood("f-common-banana", "בננה", "פירות", "יחידה בינונית", 105, 1.3, 27, 0.4, 3.1),
  makeFood("f-common-orange", "תפוז", "פירות", "יחידה בינונית", 62, 1.2, 15.4, 0.2, 3.1),
  makeFood("f-common-grapes", "ענבים", "פירות", "100 גרם", 69, 0.7, 18.1, 0.2, 0.9),
  makeFood("f-common-strawberries", "תותים", "פירות", "100 גרם", 32, 0.7, 7.7, 0.3, 2),
  makeFood(
    "f-common-avocado",
    "אבוקדו",
    "פירות / שומנים",
    "חצי אבוקדו (75 גרם)",
    120,
    1.5,
    6,
    11,
    5,
    ["אבוקדו הס", "אבוקדו האס", "hass"],
  ),
  makeFood("f-common-dates", "תמר", "פירות", "יחידה", 66, 0.4, 18, 0.1, 1.6),

  // Vegetables
  makeFood("f-common-tomato", "עגבנייה", "ירקות", "יחידה בינונית", 22, 1.1, 4.8, 0.2, 1.5),
  makeFood("f-common-cucumber", "מלפפון", "ירקות", "יחידה בינונית", 30, 1.3, 7.3, 0.2, 1),
  makeFood("f-common-lettuce", "חסה", "ירקות", "100 גרם", 15, 1.4, 2.9, 0.2, 1.3),
  makeFood("f-common-pepper", "פלפל אדום", "ירקות", "יחידה בינונית", 31, 1, 6, 0.3, 2.1),
  makeFood("f-common-carrot", "גזר", "ירקות", "יחידה בינונית", 30, 0.7, 7, 0.2, 2),
  makeFood("f-common-broccoli", "ברוקולי", "ירקות", "100 גרם", 35, 2.4, 7.2, 0.4, 3.3),
  makeFood("f-common-cauliflower", "כרובית", "ירקות", "100 גרם", 25, 1.9, 5, 0.3, 2),
  makeFood("f-common-zucchini", "קישוא", "ירקות", "100 גרם", 17, 1.2, 3.1, 0.3, 1),
  makeFood("f-common-onion", "בצל", "ירקות", "100 גרם", 40, 1.1, 9.3, 0.1, 1.7),

  // Fats, sauces and everyday pantry ingredients
  makeFood("f-common-olive-oil", "שמן זית", "שמנים", "כף", 119, 0, 0, 13.5, 0),
  makeFood("f-common-canola-oil", "שמן קנולה", "שמנים", "כף", 124, 0, 0, 14, 0),
  makeFood("f-common-tahini", "טחינה גולמית", "ממרחים", "כף", 89, 2.6, 3.2, 8, 1.4),
  makeFood("f-common-peanut-butter", "חמאת בוטנים", "ממרחים", "כף", 94, 4, 3.2, 8, 1),
  makeFood("f-common-ketchup", "קטשופ", "רטבים", "כף", 20, 0.2, 4.8, 0.1, 0.1),
  makeFood("f-common-mayo", "מיונז", "רטבים", "כף", 94, 0.1, 0.1, 10.3, 0),
  makeFood("f-common-light-mayo", "מיונז לייט", "רטבים", "כף", 35, 0.2, 1.5, 3, 0, [
    "מיונז דל שומן",
  ]),
  makeFood("f-common-mustard", "חרדל", "רטבים", "כף", 10, 0.6, 0.6, 0.6, 0.3),
  makeFood("f-common-soy-sauce", "רוטב סויה", "רטבים", "כף", 9, 1.3, 0.8, 0.1, 0),
  makeFood("f-common-tomato-sauce", "רוטב עגבניות", "רטבים", "100 גרם", 35, 1.5, 6, 0.5, 1.5),
  makeFood("f-common-salsa", "סלסה", "רטבים", "100 גרם", 36, 1.5, 7, 0.2, 1.5),
  makeFood("f-common-light-sour-cream", "שמנת חמוצה 9%", "מוצרי חלב", "כף", 28, 0.5, 0.7, 2.7, 0, [
    "שמנת דלת שומן",
  ]),
  makeFood("f-common-light-cream", "שמנת לבישול 9%", "מוצרי חלב", "100 מ״ל", 120, 2.5, 4, 9, 0, [
    "שמנת דלת שומן",
  ]),
  makeFood("f-common-sugar", "סוכר", "ממתיקים", "כפית", 16, 0, 4, 0, 0),
  makeFood("f-common-honey", "דבש", "ממתיקים", "כף", 64, 0.1, 17.3, 0, 0),

  // Protein snacks and drinks
  makeFood("f-common-protein-bar", "חטיף חלבון", "חטיפי חלבון", "חטיף", 200, 20, 18, 7, 5, [
    "protein bar",
  ]),
  makeFood(
    "f-common-protein-drink",
    "משקה חלבון",
    "משקאות חלבון",
    "בקבוק (330 מ״ל)",
    160,
    25,
    10,
    2,
    0,
    ["שייק חלבון", "protein shake"],
  ),
  makeFood(
    "f-common-protein-powder",
    "אבקת חלבון",
    "תוספי תזונה",
    "מנה (30 גרם)",
    120,
    24,
    3,
    2,
    0,
    ["whey", "מי גבינה"],
  ),
];
