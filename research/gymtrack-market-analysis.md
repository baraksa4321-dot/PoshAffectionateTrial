# GymTrack / MyRoutine — מחקר שוק והמלצות מוצר

**תאריך המחקר:** 2 בספטמבר 2026  
**שוק שנבדק:** אפליקציות אימוני כוח, תזונה/תפריטים, פלטפורמות Coach–Client, ו־UX מובייל  
**בסיס המחקר:** 41 מקורות שנשמרו תחת `research/sources/`, כולל 25+ כתובות URL ייחודיות.  
**היקף:** Hevy, Strong, JEFIT, Fitbod, MyFitnessPal, MacroFactor, Cronometer, YAZIO, Fuder, Mybite, Trainerize, TrueCoach, Everfit ו־My PT Hub; בנוסף Apple Health/HealthKit, Android Health Connect, Strava, WCAG ומחקר שימושיות.

## תקציר מנהלים

המסקנה המרכזית: GymTrack לא צריך להפוך לעוד “אפליקציית קלוריות + יומן חדר כושר”. יש לו כבר בסיס חזק יותר דווקא בחיבור בין **תוכנית מאמן**, **ביצוע בפועל**, **תפריט**, ו־**משוב**. הפער האסטרטגי הוא לא עוד שדה בתרגיל או עוד מאכל במאגר, אלא סגירת לולאת ההתמדה:

> תוכנית → פעולה מהירה → נתוני ביצוע אמינים → זיהוי חריגה → משוב מאמן בזמן → התאמה לשבוע הבא.

### שלושת ההימורים הנכונים

1. **P0 — להפוך את המעקב למנוע פעולה:** מסך “השבוע שלי” עם אימונים מתוזמנים, תזונה, שקילה, הרגלים, חריגות ופעולת ההמשך הברורה.
2. **P0 — לבנות Coach attention queue:** מי לא התאמן, מי לא תיעד אוכל, מי החמיץ צ׳ק־אין, מי תקוע או דיווח על קושי/אי־נוחות.
3. **P1 — להפוך את התזונה לאמינה ומקומית:** לוג מזון מהיר עם ברקוד/תווית, מקור ודרגת ביטחון, תיקון קל של AI, והחלפות בתוך תפריט המאמן.

### מה לא לעשות כרגע

- לא לבנות מיד אלגוריתם AI מלא לתכנון תוכניות כמו Fitbod.
- לא לרדוף אחרי עשרות אינטגרציות לבישים לפני שיש תועלת ברורה למאמן ולמתאמן.
- לא להפוך את המוצר לרשת חברתית.
- לא להציג “ציון בריאות” או התאמות קלוריות אוטומטיות כאילו הן מדידה רפואית.

## 1. איך נקרא המחקר

### סוגי ראיות

- **Verified / Tier 1:** תיעוד רשמי של פלטפורמה, תקן, מקור ממשלתי או Help Center שמסביר התנהגות קיימת.
- **Product claim / Tier 2:** אתר מוצר, דף פיצ׳רים או דף App Store/Google Play. טוב להבנת positioning ופיצ׳רים, אך לא הוכחה לשימוש או לתוצאה.
- **Independent / Tier 2–3:** סקירה, Capterra, מחקר שימושיות או ביקורות משתמשים. שימושי לכאבים ולדפוסי שימוש, אך מוטה מדגם.

כל טענה בדוח מסומנת לפי המקור שלה. מספר משתמשים, דירוגים ומספרי קטלוג שמופיעים בדפי מוצר אינם מוצגים כאן כהוכחה לאימוץ או לאפקטיביות.

### מגבלות

- רוב הראיות באנגלית; המחקר על השוק הישראלי דל יותר.
- עמוד YAZIO שנבדק החזיר 404 ולכן אינו משמש כאן כראיה חיובית.
- אתרי מוצר מציגים את “הדרך שבה המוצר אמור לעבוד”, לא בהכרח את חוויית המשתמש המלאה.
- יש לאמת את ההמלצות במחקר משתמשים מקומי: 5–10 מאמנים ו־10–15 מתאמנים בישראל.

## 2. מה באמת קיים ב־GymTrack היום

ההשוואה נעשתה מול קוד המוצר הפעיל תחת `gymtrack-working/`, ולא מול mockups תחת `artifacts/mockup-sandbox/`.

### כבר קיים ובעל ערך

| תחום | יכולת קיימת בקוד |
|---|---|
| תפקידים | Owner, Coach, Client; קישורי מאמן–מתאמן, תצוגות ניהול ומסלולים נפרדים |
| בניית אימון | תוכניות, ימי אימון, תרגילים מותאמים, ציוד/אחיזות, חלופות, סרטונים/תמונות והערות |
| תכנות מתקדם | warm-up, working sets, drop sets, supersets, tempo, RIR/RPE ויעדי חזרות |
| סשן פעיל | הזנת סטים, ערכי ביצוע קודמים, טיימר מנוחה, החלפת תרגיל, מצב משקל גוף, שמירת סשן ומשוב קושי/אי־נוחות |
| היסטוריה | סשנים, ביצועים קודמים, PR helpers ונתוני משך/נפח |
| תזונה | ימים, ארוחות, יעדי קלוריות ומאקרו, סיבים, מים, תפריט מתוכנן מול לוג בפועל, כמויות והחלפות |
| מזון | מאכלים נפוצים, מאגר ישראלי, מתכונים, מוצרים עם barcode/source metadata ו־nutrition review |
| AI | הערכת ארוחה מתמונה בצד שרת, עם תוצאה שניתן לערוך לפני שמירה |
| גוף והרגלים | משקל, מדידות גוף, אירובי, הרגלי לקוח וצ׳קליסט |
| Coach | הקצאת תוכניות/תזונה, tracking, הודעות, broadcasts, משוב מתאמן ויצירת תרגיל inline |
| אמינות מובייל | PWA/mobile safe areas, טיפול במקלדת וב־visual viewport, reduced motion, שמירת סשן מקומית, cache לפי משתמש וסנכרון Supabase עם realtime/retry |

מקורות בקוד: `gymtrack-working/src/lib/gym-types.ts`, `src/lib/gym-store.ts`, `src/routes/session.$workoutId.tsx`, `src/routes/nutrition.index.tsx`, `src/routes/coach.tsx`, `src/components/AppShell.tsx`, `src/server.ts`.

### חלקי או לא סגור כמוצר

- תזמון שבועי אמיתי של אימונים מול “האימון הבא” בלבד.
- המלצת התקדמות: יש נתוני ביצוע ו־RPE/RIR, אך לא שכבת decision support ברורה למאמן או למתאמן.
- היסטוריה עמוקה: יש נתוני גלם/helpers, אך נדרש מסך מגמות שמוביל להחלטה.
- צ׳ק־אין שבועי מובנה עם שאלות, השוואה לתשובות קודמות וסטטוס review.
- תור “מי דורש תשומת לב?” למאמן.
- notifications delivery; הודעות קיימות, אך לא מנגנון reminders/push/email עם העדפות.
- שקיפות sync: קיימים מצבי sync/offline/retry, אך המוצר צריך להציג למשתמש מה ממתין, מה נכשל ומה נפתר.

### לא מצאתי עדות למימוש מלא

- barcode/label scanning אמיתי בממשק הלקוח.
- חיבור HealthKit, Health Connect, Apple Watch, Garmin, Fitbit, Oura או wearables אחרים.
- export/delete controls מלאים בממשק המשתמש.
- push notifications או תזכורות מתוזמנות.
- מערכת multi-client operations מלאה עם inbox/queue/filters לחריגות.

## 3. מה השוק מלמד לפי תחום

## 3.1 אימוני כוח: מה נחשב היום בסיס

Hevy מציגה את המוצר סביב שלושה עמודים: logging, progress tracking ו־social. ברשימת הפיצ׳רים שלה מופיעים ערכים מהאימון הקודם, rest timer, RPE, supersets, PR alerts, שגרות, גרפים, מדידות גוף, תמונות, תרגילים מותאמים וחיבורי Watch/Health. גם דף App Store שלה מדגיש previous values, set types, routines, graphs ו־Health export. אלה **טענות מוצר רשמיות**, לא מדידת שוק.  
מקורות: `hevy-features`, `hevy-app-store`, `hevy-user-reviews`.

Strong מדגישה היסטוריה, charts, metrics ו־PRO; סקירה עצמאית מ־22 בינואר 2025 מתארת את הערך של פשטות ו־“think less, lift more”. JEFIT מדגישה ספריית תרגילים, תוכניות ויומן; Fitbod מדגישה תוכנית אדפטיבית.  
מקורות: `strong-history`, `strong-pro`, `strong-independent-review`, `jefit-google-play`, `jefit-workout-tab`, `fitbod-understanding`, `fitbod-independent-review`, `independent-comparison-2026`.

### המשמעות ל־GymTrack

GymTrack כבר חזק במודל התרגיל וביכולת המאמן. הפער הוא “החלטה בזמן”: לאחר שהמתאמן מסיים סט או שבוע, מה המערכת אומרת לו לעשות?

**Must-have:**

1. כרטיס previous performance ברור בכל תרגיל, כולל שינוי מול היעד.
2. השלמת אימון עם סיכום: נפח, סטים, PR, קושי, אי־נוחות ופעולת המשך.
3. תוכנית שבועית עם תאריך/יום, דחייה, השלמה חלקית וסיבת skip.
4. היסטוריית תרגיל עם weight/reps/volume/estimated 1RM או מדד מקביל, וטווחי זמן.
5. החלפה בזמן אמת לפי ציוד זמין, בלי לאבד את זהות התרגיל המקורי ואת הסיבה להחלפה.

**Differentiator:**

- “Coach-aware progression”: המאמן מגדיר כלל פשוט — למשל טווח חזרות + RIR — והמערכת מציעה “היום אפשר לעלות/להישאר/להוריד”, אך ההחלטה נשארת ניתנת לאישור.
- “Equipment-aware fallback”: כשאין מכשיר, המערכת מציעה רק חלופות שהמאמן אישר, ולא רשימה גנרית.

## 3.2 תזונה: אמון, תיקון ומה אוכלים באמת

Cronometer ממקמת את עצמה סביב נתוני nutrition מפורטים, עד 95 nutrients, מידע “lab-analyzed”, יעדים, סריקת barcode, photo logging, voice logging וחיבורי devices. זה **מסר רשמי**; דף App Store שנשמר תומך בכך שהמשתמשים מעריכים פירוט, barcode ומיקרו־נוטריינטים.  
מקורות: `cronometer-official`, `cronometer-app-store`.

MyFitnessPal ממשיכה להדגיש מאגר גדול, recipes ופיצ׳רי Premium; MacroFactor מבדילה את עצמה בכך שהיעדים מתעדכנים לפי intake ו־weight trends, ולא מוצגים כמספר סטטי. MacroFactor מתארת את אלגוריתם Expenditure V3 בעדכון מ־8 באוקטובר 2024 ומסבירה את trade-off בין stability ל־responsiveness.  
מקורות: `myfitnesspal-premium-features`, `macrofactor-expenditure-v3`, `lose-it-new-era`.

Fuder הוא benchmark מקומי חשוב. האתר מציג מעקב בעברית, photo estimation, מוצרים ישראליים, מנות רשת, מתכונים, מקור ותאריך עדכון לערכים, וכן מסך שמרכז קלוריות, מאקרו, סיבים, מים, צעדים ומשקל. המספרים והיכולות הם **טענות אתר המוצר**, אך הם מראים מה מסר מקומי משכנע.  
מקור: `fuder-food-diary`.

### המשמעות ל־GymTrack

ל־GymTrack כבר יש plannedMeals מול actual logs, portions, recipes, substitutions, water, Israeli foods ו־AI photo estimation. לכן “להוסיף עוד מאכלים” הוא לא העדיפות הראשונה. צריך:

1. **Food confidence/provenance:** לכל מוצר/מנה להציג מקור, תאריך בדיקה ו־confidence; להבדיל בין תווית יצרן, מקור ישראלי, USDA, Open Food Facts והערכה.
2. **Correction-first AI:** תוצאת תמונה היא draft; המשתמש מאשר/מתקן פריט, כמות ודרך הכנה לפני שמירה. אין להציג הערכה כעובדה.
3. **Barcode/label capture:** להתחיל ממוצר ארוז ישראלי. אם אין התאמה, לאפשר צילום תווית ויצירת מועמד לבדיקה, לא להכניס נתון “מאומת” אוטומטית.
4. **Menu adherence:** “תיעוד מתוך התפריט” צריך להראות כמה מהתפריט הושלם, מה הוחלף, ומה חסר — לא רק total calories.
5. **Flexible success:** להציג weekly ranges ומגמות, לא רק “נכשלת היום” אם ארוחה אחת לא הגיעה למאקרו.
6. **Shopping list אמיתי:** מהתפריט השבועי, עם איחוד כמויות, סימון “כבר יש בבית”, והחלפה ששומרת על היעד.

### ישראל, עברית ורגולציה

המקור של משרד הבריאות הישראלי מראה שהמידע הרשמי על מזון ותוספים מפוזר ברשימות/רשמים ייעודיים. זה מחזק את הצורך ב־provenance ובגבולות ברורים, אך אינו אומר שמקור ממשלתי הוא מאגר nutrition מוכן לשימוש.  
מקור: `israel-health-food-databases`.

Mybite של Altman הוא מוצר wellness/תזונה מקומי; הוא רלוונטי כ־adjacent competitor אך לא כהוכחה שפלטפורמת Coach–Client עברית כבר פתורה.  
מקור: `mybite-altman`.

## 3.3 Coach–Client: הערך הוא חריגות, לא עוד builder

Trainerize מתעדת Progress/Insights שמאגדים workout adherence, nutrition, body weight, measurements, steps, sleep, cardio, habits ו־weekly compliance. היא כוללת גם progress photos, weekly averages ויכולת review לפי workout.  
מקורות: `trainerize-progress`, `trainerize-checkins`.

Everfit מתעדת ב־20 ביולי 2026 Check-in Dashboard עם:

- completion/adherence ושינוי של 4 שבועות;
- nutrition logging ו־average macros מול goals;
- missed/overdue tasks and habits;
- check-in forms שאפשר לפתוח, להשוות ולסמן כ־reviewed;
- private coach notes;
- programs ending soon;
- follow-up alerts כשלקוח בסיכון או ממתין לתשובה.

המסמך הרשמי הזה הוא אחד האותות החזקים במחקר: פלטפורמת מאמן מודרנית מקצרת את הדרך מ־data ל־next action. ביקורות Capterra מ־26 באוגוסט 2026 משבחות personalization ו־integrations, אך מציינות גם עלות, תכונות שחסרות במובייל, צורך ב־booking מובנה ומורכבות מסוימת. אלה ביקורות self-selected, ולכן הן כיווניות בלבד.  
מקורות: `everfit-checkin-dashboard`, `capterra-everfit-reviews`.

TrueCoach ו־My PT Hub מציגות habits, reminders, check-ins, communication ו־client management כחלק מ־accountability. אלה בעיקר positioning רשמי.  
מקורות: `truecoach-coach-dashboard`, `truecoach-habits`, `mypthub-client-management`, `mypthub-habit-tracker`, `capterra-truecoach-reviews`.

### המוצר שצריך לבנות למאמן

לא עוד מסך עם 20 metrics, אלא:

**Coach Review, פעם בשבוע**

| רכיב | מה המאמן רואה | פעולה |
|---|---|---|
| אימונים | scheduled / completed / skipped, מגמת 4 שבועות | שליחת הודעה או שינוי תוכנית |
| תזונה | ימי log, יעד חלבון/קלוריות, תפריט מול בפועל | הצעת החלפה / תיקון תפריט |
| גוף | משקל יומי + ממוצע שבועי, מדידות ותמונה אם אושרה | בקשת שקילה/בדיקת מגמה |
| תחושה | difficulty, discomfort, exercise feedback | סימון לבדיקה, לאבחון אנושי |
| הרגלים | assigned / done / missed | עידוד, הקטנת יעד או שינוי |
| תקשורת | הודעה שלא נקראה/לא נענתה | follow-up מהיר |

המערכת צריכה להציע **exception queue**: “דורש תשומת לב”, “יציב”, “אין מספיק נתונים”. “אין נתונים” אינו “נכשל”.

## 3.4 מובייל, offline, integrations ו־trust

Apple מתעדת HealthKit ו־Health app כמסגרות לשיתוף נתוני בריאות/כושר; Android מתעדת Health Connect ואת מסלול המעבר מ־Google Fit. Strava מדגימה דרך מסמך troubleshooting שסנכרון אינו רק checkbox — צריך מצבי reconnect, retry והסבר למשתמש.  
מקורות: `apple-healthkit-documentation`, `apple-health-product-page`, `android-health-connect-overview`, `android-fit-health-connect-migration`, `strava-sync-troubleshooting`.

Apple מפרסמת בספטמבר 2025 הנחיות privacy לאפליקציות Health & Fitness. W3C מגדירה WCAG כסטנדרט משותף לתוכן נגיש; מחקר Accessercise מ־2025 משתמש ב־think-aloud עם אנשים עם מוגבלויות.  
מקורות: `apple-health-fitness-privacy-2025`, `w3c-wcag-overview`, `accessercise-usability-study-2025`.

### המשמעות ל־GymTrack

העבודה שכבר נעשתה ב־PWA, safe-area, keyboard handling, reduced motion, cache לפי user ו־sync היא יתרון אמיתי. השלב הבא הוא להפוך אותה לגלויה:

- badge שמסביר `נשמר במכשיר`, `ממתין לסנכרון`, `סונכרן`, `נדרש ניסיון חוזר`;
- conflict resolution שמציג שתי גרסאות במקום לדרוס בשקט;
- offline test שמכסה גם nutrition ולא רק session;
- account privacy screen: מה נשמר, מי רואה, export/delete;
- permission onboarding לפי תועלת, לא בקשת כל ההרשאות ביום הראשון.

Integration roadmap:

1. **P1:** Health Connect/HealthKit עבור צעדים, משקל ו־active energy — רק אחרי הגדרת הרשאות ו־source-of-truth.
2. **P2:** wearable workout import אם הוא פותר עבודה כפולה בפועל.
3. **לא כרגע:** עשרות integrations או live heart-rate, לפני שיש משתמשים שביקשו זאת וה־sync semantics ברורים.

## 4. מטריצת פערים ועדיפויות

| נושא | GymTrack עכשיו | benchmark שוק | עדיפות | החלטה |
|---|---|---|---|---|
| לוג סטים מהיר | קיים ועשיר | table stakes | P0 | לשפר zero-friction ו־previous values |
| תוכניות ותרגילים | חזק מאוד | table stakes | P1 | לא להרחיב builder לפני סגירת לולאת השבוע |
| progression | נתוני גלם/RPE/RIR | guidance/analytics | P0 | להוסיף החלטה מוסברת, לא AI אוטונומי |
| history/charts | helpers ונתונים | גרפים ומגמות | P0 | מסך מגמה שמוביל לפעולה |
| scheduling | חלקי/לא בולט | calendar/adherence | P0 | לבנות weekly plan |
| nutrition targets | קיים | targets ומגמות | P1 | weekly adherence וטווחים |
| Israeli food | קיים ומתוחזק | local database | P1 | provenance, barcode/label, confidence |
| AI photo logging | קיים כהערכה | emerging convenience | P1 | correction + uncertainty + privacy |
| recipes/substitutions | קיים | meal planning | P1 | planned→logged→shopping loop |
| cardio | קיים | secondary tracking | P2 | להשאיר יציב, לא להפוך לציר ראשי |
| body measurements | קיים | progress dashboard | P1 | weekly averages ו־coach review |
| habits | מודל קיים | assigned/compliance | P0 | להציג completion/missed ל־Coach |
| coach messages | קיים | messaging + follow-up | P0 | unread/at-risk queue |
| check-in forms | partial/לא מובלט | common coach workflow | P0 | טופס, compare, review |
| reminders | לא הוכח כמלא | expected | P1 | preferences + quiet hours + delivery states |
| offline | תשתית טובה | weak market area | P1 | להסביר states ולבדוק conflict UI |
| integrations | חסרות | growing expectation | P2 | להתחיל ב־Health platforms לפי צורך |
| privacy/export/delete | לא הוכח ב־UI | trust baseline | P1 | מסך שליטה למשתמש |
| RTL/Hebrew | כבר baseline | local differentiator only with data | P1 | להעמיק במזון/מונחים/flow, לא רק תרגום |

## 5. Roadmap מומלץ

### שלב A — 0–6 שבועות: adherence loop

1. **Weekly Home / My Week**
   - 3–4 אימונים מתוזמנים;
   - תפריט היום;
   - שקילה/הרגלים;
   - מצב סנכרון;
   - next action יחיד.
2. **Coach attention queue**
   - filters: no workout, no nutrition log, overdue check-in, difficult/discomfort, unread message;
   - sort לפי חומרה/זמן;
   - quick message and “mark reviewed”.
3. **Session closeout**
   - סיכום קצר של הביצוע;
   - feedback structured;
   - CTA ליום הבא או לבקשת שינוי.
4. **Progress views**
   - exercise history;
   - volume/reps/weight and weekly training count;
   - weight daily points + weekly average;
   - avoid a single composite score.

**מדדי הצלחה:** זמן עד סט ראשון, אחוז סשנים שהושלמו, אחוז ימים עם log, זמן מאמן עד review, שיעור הודעות follow-up שנסגרו.

### שלב B — 6–12 שבועות: nutrition trust + local wedge

1. barcode lookup למוצרים ישראליים;
2. צילום תווית כמועמד עם status `needs review`;
3. confidence/source/date בכל food item;
4. תיקון AI לפני שמירה;
5. menu adherence: planned vs logged vs substituted;
6. shopping list מהתפריט השבועי;
7. weekly nutrition summary למתאמן ולמאמן.

**מדדי הצלחה:** זמן לרישום ארוחה, שיעור תיקוני AI, שיעור התאמות food ללא חיפוש ידני, days with nutrition log, אחוז planned meals שנרשמו.

### שלב C — 12+ שבועות: integrations ו־coach intelligence

1. HealthKit/Health Connect עבור צעדים ומשקל;
2. reminder engine עם opt-in, quiet hours ו־delivery log;
3. coach rule suggestions — לא החלטות רפואיות;
4. export/delete/privacy controls;
5. cohort analytics רק אם יש מספיק שימוש אמיתי.

## 6. ניסויים לפני בנייה רחבה

### ניסוי 1 — “מי דורש תשומת לב?”

אב־טיפוס עם 20 לקוחות פיקטיביים ו־5 מאמנים. השוו dashboard רגיל מול queue של חריגות. מדדו זמן עד מציאת הלקוח שדורש פעולה ואת איכות הפעולה, לא רק שביעות רצון.

### ניסוי 2 — “תפריט מול לוג”

תנו למתאמן יום עם 4 ארוחות מתוכננות, החלפה אחת וארוחה מצולמת. בדקו האם הוא מבין מה הושלם ומה צריך לתקן בלי לפתוח מסך חישוב נוסף.

### ניסוי 3 — “התקדמות בלי לחץ”

השוו ניסוח “עמדת ביעד” מול “הכיוון שלך השבוע” עם ממוצע/טווח. בדקו האם זה מגדיל logging חוזר בלי להגביר abandonment.

### ניסוי 4 — offline trust

התחילו אימון/ארוחה במצב offline, שנו נתון, חזרו online, וצרו שינוי מקביל במכשיר אחר. המשתמש חייב להבין מי נשמר, מה ממתין ומה דורש הכרעה.

## 7. תכונות שלא שווה להוסיף עכשיו

1. **Social feed / leaderboards:** עלול להתנגש עם מוצר Coach–Client ולהוסיף moderation/privacy בלי לפתור adherence.
2. **AI תוכניות מלאות:** לפני שיש scheduling, history ו־review טובים, AI רק ייצור תוכניות שקשה לסמוך עליהן.
3. **Micronutrient explosion:** Cronometer הוא benchmark לפירוט, אך רוב משתמשי Coach–Client יפיקו יותר מ־reliable calories/protein/fiber/water ויעדים ברורים.
4. **Marketplace למאמנים:** Everfit reviews מציינות זאת כבקשה, אך זו שכבת business נפרדת ולא עדיפות ל־core loop.
5. **Booking/payments:** יכול להיות מוצר עסקי חשוב בעתיד, אך לא פער הליבה שנמצא במחקר.
6. **Composite health score:** מסוכן פרשנית ובריאותית; עדיף metrics נפרדים עם הקשר ומגמה.

## 8. החלטה אסטרטגית

ה־positioning המומלץ:

> **MY routine — מערכת עברית למאמן ולמתאמן: התוכנית, האימון, התפריט והמשוב עובדים יחד.**

הבידול אינו “הכי הרבה תרגילים” או “הכי הרבה קלוריות”. הוא:

- עברית ו־RTL אמיתיים;
- מאגר מזון ישראלי עם מקור ואמון;
- תרגילים ותפריטים שהמאמן מאשר;
- logging מהיר גם בחדר כושר וגם במטבח;
- coach review שמתרגם התנהגות לפעולה;
- offline/sync שאפשר לסמוך עליו.

זה בידול ממוקד, ניתן להוכחה, ותואם למה שכבר קיים בקוד — במקום להעתיק את כל קטגוריית fitness.

## 9. מפתח מקורות

הרשומה המלאה, עם כתובת, תאריך fetch, סוג ראיה ו־tier, נמצאת ב־[`research/sources.json`](./sources.json). הראיות הגולמיות נמצאות תחת [`research/sources/`](./sources/).

המקורות המרכזיים שנעשה בהם שימוש בדוח:

1. Hevy features — `hevy-features` — https://www.hevyapp.com/features — claim רשמי.
2. Hevy App Store — `hevy-app-store` — https://apps.apple.com/us/iphone/app/hevy-workout-tracker-gym-log/id1458862350 — listing/reviews.
3. Hevy user reviews — `hevy-user-reviews` — https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350?see-all=reviews — user evidence.
4. Strong history — `strong-history` — https://help.strongapp.io/category/233-history-charts-and-metrics — official help.
5. Strong PRO — `strong-pro` — https://help.strongapp.io/article/132-strong-pro — official help.
6. Strong independent review — `strong-independent-review` — https://www.hotelgyms.com/blog/the-strong-app-review-think-less-lift-more — independent review, 2025-01-22.
7. JEFIT Google Play — `jefit-google-play` — https://play.google.com/store/apps/details?id=je.fit — listing.
8. JEFIT workout tab — `jefit-workout-tab` — https://www.jefit.com/workout/ — product/help evidence.
9. Fitbod understanding — `fitbod-understanding` — https://fitbod.me/understanding-fitbod — official claim.
10. Fitbod independent review — `fitbod-independent-review` — https://lasta.app/blog/fitbod-review — independent review.
11. Independent strength comparison — `independent-comparison-2026` — saved local evidence — secondary comparison.
12. MyFitnessPal Premium features — `myfitnesspal-premium-features` — https://support.myfitnesspal.com/hc/en-us/articles/360032625951-MyFitnessPal-Premium-features — official help.
13. MyFitnessPal data export — `myfitnesspal-data-export` — official help page saved locally.
14. MyFitnessPal account deletion — `myfitnesspal-account-deletion` — official help page saved locally.
15. MacroFactor Expenditure V3 — `macrofactor-expenditure-v3` — https://macrofactor.com/expenditure-v3/ — official product press, 2024-10-08.
16. Cronometer official — `cronometer-official` — https://cronometer.com/index.html — official claim.
17. Cronometer App Store — `cronometer-app-store` — App Store listing saved locally — listing/reviews.
18. Lose It! — `lose-it-new-era` — official product evidence saved locally.
19. Fuder — `fuder-food-diary` — https://www.fuder.co.il/ — Hebrew/Israeli product claim, fetched 2026-09-02.
20. Israeli Ministry of Health food databases — `israel-health-food-databases` — https://www.gov.il/he/Departments/DynamicCollectors/fcs-lists — government source.
21. Mybite / Altman — `mybite-altman` — https://www.altman.co.il/mybite-lp/ — local adjacent product.
22. Trainerize progress — `trainerize-progress` — official Help Center — progress/adherence evidence.
23. Trainerize check-ins — `trainerize-checkins` — official Help Center — check-in evidence.
24. Everfit Check-in Dashboard — `everfit-checkin-dashboard` — official Help Center — updated 2026-07-20.
25. Everfit habit coaching — `everfit-habit-coaching` — official Help Center.
26. TrueCoach dashboard — `truecoach-coach-dashboard` — https://truecoach.co/fitness-coach-app-for-trainers/ — official claim.
27. TrueCoach habits — `truecoach-habits` — https://truecoach.co/learning-resources/coaching-habits — official resource.
28. My PT Hub client management — `mypthub-client-management` — official product evidence.
29. My PT Hub habit tracker — `mypthub-habit-tracker` — official product evidence.
30. Everfit Capterra reviews — `capterra-everfit-reviews` — https://www.capterra.com/p/202837/Everfit/reviews — moderated reviews, updated 2026-08-26.
31. TrueCoach Capterra reviews — `capterra-truecoach-reviews` — https://www.capterra.com/p/155784/truecoach/reviews — moderated reviews.
32. Apple HealthKit — `apple-healthkit-documentation` — https://developer.apple.com/documentation/healthkit — platform documentation.
33. Apple Health — `apple-health-product-page` — https://www.apple.com/health/ — product/platform page.
34. Apple Health & Fitness Privacy — `apple-health-fitness-privacy-2025` — https://www.apple.com/privacy/docs/Health_Fitness_Apps_Privacy_September_2025.pdf — privacy guidance, 2025-09.
35. Android Health Connect — `android-health-connect-overview` — Android Developers documentation.
36. Fit → Health Connect migration — `android-fit-health-connect-migration` — Android Developers documentation.
37. Strava sync troubleshooting — `strava-sync-troubleshooting` — official Help Center.
38. WCAG 2 overview — `w3c-wcag-overview` — https://www.w3.org/WAI/standards-guidelines/wcag/ — W3C standard.
39. Accessercise usability study — `accessercise-usability-study-2025` — https://pmc.ncbi.nlm.nih.gov/articles/PMC11960980/ — qualitative study, 2025.

## מסקנה

GymTrack לא חסר “עוד פיצ׳ר”. הוא חסר שכבת orchestration שמחברת את הפיצ׳רים שכבר קיימים למערכת התמדה אחת. אם בונים קודם את weekly adherence, Coach attention ו־nutrition trust, המוצר יכול לנצח בנישה עברית/ישראלית בלי להתחרות ישירות בכל מאגר המזון, בכל אלגוריתם תוכניות ובכל wearable בעולם.