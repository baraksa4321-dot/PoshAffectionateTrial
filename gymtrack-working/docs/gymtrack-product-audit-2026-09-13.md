# MY routine / GymTrack — דוח בדיקה ותוכנית המשך

**תאריך הבדיקה:** 13 בספטמבר 2026  
**מטרת הבדיקה:** לבדוק את המוצר מקצה לקצה לפני פרסום: סנכרון, הרשאות, פושים והתראות, תפריטים, התחברות והרשמה, תזונה, אימונים, בניית תוכניות ותרגילים, יעדים, משוב, הודעות והחוויה הכללית.

## התקדמות מאז כתיבת הדוח

- משימת הסנכרון התחילה.
- `46_harden_realtime_publication.sql` כולל כעת גם `challenges` ו־`challenge_enrollments`.
- נוסף `realtime-publication-contract.test.ts`, שמצליב בין subscriptions בקוד לבין migration publication paths.
- הבדיקה המקומית החדשה עוברת; אימות Supabase חי עדיין לא הורץ ללא אישור וחשבונות smoke ייעודיים.

## סיכום מנהלים

המוצר רחב ובנוי היטב ברמת התשתית. קיימים:

- מסלול אימון מלא עם טיוטות מקומיות, שמירת היסטוריה, משוב, PRs וטיימר.
- תוכניות אימון, ימים, תרגילים, תרגילי משקל גוף, שכפול, מחיקה וסידור.
- ספריית מזון, כמויות ויחידות, ארוחות מתוכננות, תחליפים, מתכונים, קניות וסריקת תוויות.
- ממשק מאמן רחב בעברית לניהול מתאמנים, תוכניות, תזונה, הודעות, מדידות ומעקב.
- cache מקומי לפי משתמש, סנכרון חוזר, טיפול ב־offline, מנגנוני הרשאה ו־Realtime.
- בסיס מובייל טוב: safe areas, keyboard/visual viewport, swipe navigation, מצב כהה ו־PWA/native resume.

עם זאת, המוצר **עדיין לא צריך להיחשב Release סופי** בלי לסגור את פערי ה־P1 הבאים:

1. הרשאות RLS, RPC ו־Realtime אמיתיות מול Supabase עדיין לא הוכחו בסביבה חיה.
2. Realtime ו־FCM מציגים כשלי runtime בלוגים; יש גם פערי כיסוי ל־background/local notifications.
3. הודעות הן כרגע בעיקר הודעות מאמן חד־כיווניות, לא inbox או שיחה סגורה.
4. חלק ממטרות התזונה לא נשמרות בסנכרון מלא.
5. ה־dashboard מודד adherence לפי ספירת אימונים ולא תמיד לפי התוכנית המתוזמנת.
6. יש כמה מסלולים שה־UI שלהם קיים אך לא מחובר לגמרי למודל המוצר: מטרות אישיות, feedback-to-action, progress של challenges ותפריט Programs למתאמן.

## מצב הבדיקות

### עבר

- `pnpm test` — **157 בדיקות עברו**, 0 נכשלו, 2,036 assertions.
- `pnpm run typecheck` — עבר.
- Production build — עבר בבדיקת ה־release הקודמת.
- בדיקות ממוקדות ל־auth, offline, sync, תזונה, portions, history ו־notifications קיימות ועוברות.
- בדיקת נכסי טעינה ו־Animated WebP — עברה.
- build mobile ו־`cap:sync` — עברו.

### לא עבר או לא הוכח

- Authenticated WebKit smoke — הסתיים ב־timeout אחרי 180 שניות. זה תואם את מגבלת WebKit המקומית המוכרת, אך לכן הוא לא מוכיח תקינות release.
- בזמן ה־preview נראו `Realtime channel_error` חוזרים בערוצי המשתמש והמאמן.
- בזמן ה־preview נראו כשלי `FCM remote notification` בשליחה ל־Edge Function.
- אין עדיין הוכחה על iPhone אמיתי לצליל הטיימר בזמן מוזיקה, מסך נעול, מצב רקע והרשאת התראות.
- אין עדיין live smoke מלא שמוכיח RLS/RPC/Realtime לכל תפקידי owner/coach/trainee.

## ממצאים לפי תחום

### 1. סנכרון, Offline, Realtime והרשאות

**חוזקות**

- cache מקומי מבודד לפי `userId`.
- hydration וסנכרון חוזר אחרי offline.
- כתיבת תוכניות מוגבלת ל־coach/owner.
- קיימים מנגנוני backoff, ניקוי subscriptions ו־idempotent writes.
- קיימות בדיקות cross-browser ל־scoped reads, retries, legacy columns ותוכניות.

**ממצאים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P1 → תוקן מקומית | `challenges` ו־`challenge_enrollments` קיבלו subscription בצד הלקוח בלי כיסוי ב־hardening הכללי | `src/lib/gym-store.ts:817-818`; migrations `43`, `46`, `47`; contract test חדש | ה־hardening המקומי כולל כעת את שתי הטבלאות; עדיין נדרש live smoke כדי לוודא שהמigrations הרלוונטיים מוחלים ב־Supabase |
| P1 | הרשאות RLS, RPC ו־Realtime אמיתיות לא אומתו | `supabase/role-permission-validation.md:7-11,24-30`; בדיקות מקומיות ב־`src/lib/role-assignment-security.test.ts:215-420` | ייתכן drift בין migration לבין ההתנהגות החיה |
| P2 | כיסוי ה־Realtime חלקי עבור custom exercises, recipes, food/favorites/catalog ועוד | `src/lib/gym-store.ts:814-831`; `src/lib/supabase-sync.ts:324-335` | המשתמש תלוי ב־fallback refresh או ניווט מחדש |
| P2 | Pull של hydration אינו סובלני באותה מידה ל־tables/columns חסרים כמו ה־write path | `src/lib/supabase-sync.ts:1353-1492` | schema legacy אחד עלול להפיל hydration רחב |
| P3 | מדיניות conflict אינה מפורשת עבור client, history, measurements, habits ו־cardio | `src/lib/gym-store.ts:650-724` | אין הוכחה מה יקרה בעריכה מקבילה אמיתית |

### 2. Push, FCM והתראות מקומיות

**חוזקות**

- יש service worker ל־data-only push, dedup ו־deep-link.
- יש Firebase token registration וניקוי logout.
- יש Local Notifications לטיימר מנוחה.
- נוספה התראה מקומית עם קובץ WAV באורך 1.7 שניות ל־iOS/Android.
- הטיימר נשמר עם `restEndsAt` מוחלט כדי לאפשר המשך אחרי חזרה מרקע.

**ממצאים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P1 | deep link שמתחיל ב־`/` עדיין יכול להיות `//external-host` ולהפוך ל־URL חיצוני | `supabase/functions/send-fcm-notification/index.ts:197-202`; `public/sw.js:214-224` | push שנוצר מצוות עלול להוציא את המשתמש מהאתר |
| P1 | כשלי FCM נצפו ב־preview | לוגי preview: `FCM remote notification Failed to send a request to the Edge Function` | שליחת push אינה מוכחת כזמינה בסביבה שבה המשתמש עובד |
| P2 | החלפת FCM token עלולה להיתקע אם הרשומה הישנה שייכת למשתמש אחר | `src/lib/notification-service.ts:86-107` | מכשיר יכול להישאר עם token ישן או לא לקבל הודעות |
| P2 | אין כיסוי מספק ל־permission denial, token rotation, native foreground/background, Android channel ו־iOS sound | `src/lib/notification-service.ts:189-469`; הבדיקה היחידה העיקרית היא service-worker click | כשלי התראות יכולים להישאר שקטים |
| P2 | ההתנהגות המדויקת ברקע אינה קיימת עבור Safari/PWA רגיל | `src/lib/notification-service.ts:148-150`; native בלבד | אתר רגיל לא יכול להבטיח צליל מדויק אחרי השעיית JavaScript ב־iOS |
| P2 | לטיימר יש notification ID גלובלי אחד | `src/lib/notification-service.ts:148-187` | שני sessions או tabs עלולים לבטל זה את הטיימר של זה |

**החלטת מוצר נדרשת:** צליל רקע אמין הוא יכולת native. ב־Safari רגיל אפשר לספק best effort בלבד; אין API אמין לתזמון צליל מותאם כשהדף הושעה.

### 3. התחברות, הרשמה, תפקידים ותפריטים

**חוזקות**

- הרשמה בודקת שם, gender ו־DOB.
- יש email confirmation ו־resend.
- יש reset password עם מנגנון anti-enumeration.
- יש approval/rejected/pending gates.
- יש ניקוי cache, drafts ו־notification state ב־logout.
- AppShell כולל personal/management nav, active routes, swipe navigation ו־keyboard handling.

**ממצאים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P1 | הרשאות route הן בעיקר gating של קומפוננטות, לא route guards | `src/routes/coach.index.tsx:1-6`; `src/routes/coach.tsx:4422-4433`; `src/routes/exercises.index.tsx:69-73` | deep link לא מורשה עלול לצייר מסך קצר לפני redirect; אין בדיקת route matrix |
| P1 | role שנשמר ב־cache מסומן מוכן לפני אימות role חי | `src/lib/gym-store.ts:1541-1550,1635-1680`; `src/routes/__root.tsx:1280-1305` | משתמש שתפקידו בוטל עלול לראות לרגע ממשק coach/owner |
| P1 | login יכול להצליח אך modal ההתחברות להישאר פתוח אם `updateUser` נכשל | `src/components/AppShell.tsx:719-768` | המשתמש מחובר אך נראה כאילו login נכשל |
| P2 | timeout של auth מציג hydration error במקום מסלול login ברור | `src/lib/gym-store.ts:1342-1370`; `src/routes/__root.tsx:1278-1283,1722-1787` | slow network נראה כמו תקלה בהרשאות |
| P2 | אין מטריצת E2E ל־reset-password, rejected account, role switch, offline auth ו־responsive menu | `src/routes/reset-password.tsx`; `e2e/authenticated-ios.pw.mjs` | מסלולי חשבון מרכזיים לא מוכחים |
| P2 | loading gender/night mode/workspace אינם כולם user-scoped | `src/routes/__root.tsx:63-82`; `src/components/AppShell.tsx:176-194,227-250` | עלולה להישאר דליפת presentation בין חשבונות |

### 4. אימונים, היסטוריה, תוכניות ותרגילים

**חוזקות**

- בניית program/day כוללת יצירה, autosave, weekday, drag reorder, duplicate/delete.
- יש role gates למאמן/owner.
- יש exercise search/filter/create.
- יש ספריית תרגילי משקל גוף.
- session שומרת draft ומחזירה למקום הקודם.
- coach tracking משווה plan מול history עם fallback לשם תרגיל.

**ממצאים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P1 | עורך `/workouts/new` יכול ליצור workout יתום שאינו משויך ל־program/day | `src/routes/workouts.$workoutId.tsx:35-55,131-149,365-383`; `src/lib/gym-store.ts:2108-2118`; `src/routes/programs.index.tsx:153-163` | מאמן יוצר אימון שלא ניתן להגיע אליו מהניווט הרגיל |
| P1 | bodyweight זמין ב־program/day builder אך לא ב־legacy workout editor | `src/routes/programs.$programId.$dayId.tsx:227-230,349-357,618-638`; `src/routes/workouts.$workoutId.tsx:407-425` | שני עורכים מציגים capability שונה |
| P2 | החלפת תרגיל משקל גוף אינה שומרת קשר מפורש לתרגיל המקורי | `src/routes/session.$workoutId.tsx:1310-1340`; `src/routes/coach.tsx:456-466` | matching של coach history עלול לפספס substitution |
| P2 | completion badge מסתמך בחלק מהמסכים על קיום session ולא על מספר sets שבוצעו | `src/routes/programs.index.tsx:161-163`; `src/routes/programs.$programId.tsx:233-240`; `src/lib/workout-session.ts:67-93` | אימון ריק/חלקי עלול להיראות כ־completed |
| P2 | אין מסך history אישי מלא עם חיפוש, סינון, export או מחיקה | אין `/history`; יש פיסות history ב־`src/routes/index.tsx`, `exercises.$exerciseId.tsx` ו־coach | המשתמש לא מקבל archive ברור של ההתקדמות |
| P2 | session draft הוא local-only עד Finish | `src/routes/session.$workoutId.tsx:870-888,1140-1253` | crash, ניקוי browser או מכשיר אחר עלולים לאבד אימון פתוח |

### 5. תזונה

**חוזקות**

- food CRUD, favorites, barcode/label scan, provenance ו־approval states.
- portions ויחידות כוללות grams, ml, household units, servings ועוד.
- planned meals, option groups, substitutions, recipes ו־shopping list קיימים.
- קיימים tests חזקים יחסית ל־portions, provenance, planning ו־legacy gram normalization.
- coach access ל־nutrition קיים עם RLS ייעודי ומסלולי client filtering.

**ממצאים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P1 | רק calories ו־protein נשמרים ב־nutrition target sync; carbs/fat/fiber עלולים להיעלם בענן | `src/lib/gym-types.ts:347-353`; `src/lib/supabase-sync.ts:1087-1125,1883-1900,2088-2105,2207-2233` | יעד תזונה משתנה בין מכשירים/פתיחות |
| P2 | בחירת target לפי התאריך אינה מוגדרת כ־latest deterministic | `src/lib/supabase-sync.ts:2107-2112`; coach write ב־`src/routes/coach.tsx:4064-4081` | יעד ישן עלול להיבחר לפי סדר query |
| P2 | recipe נשמרת כ־aggregate food ולא כמרכיבים | `src/lib/recipe-library.ts:19-20`; `src/routes/nutrition.index.tsx:490-508` | shopping list אינה יכולה לפרק מתכון למרכיבים |
| P2 | replacement של recipe משווה קלוריות אך מתעלם מגודל מנה וממאקרו | `src/routes/nutrition.index.tsx:544-560,618-635` | החלפה עלולה לשנות protein/fat/portion בלי להציג זאת היטב |
| P2 | shopping list משתמשת ב־meal הראשון בכל option group | `src/lib/nutrition-planning.ts:636-640` | הרשימה אינה בהכרח משקפת את הבחירה בפועל |
| P2 | checked state של shopping list הוא React-local בלבד | `src/routes/nutrition.index.tsx:321-326` | סימוני קניות נעלמים ב־reload/device change |
| P2 | אין server-side validation מקביל ל־local nutrition integrity | `src/lib/nutrition-integrity.ts:191-225`; cloud serialization ב־`src/lib/supabase-sync.ts:1087-1095` | ערכים לא תקינים יכולים להיכנס דרך sync ישיר |

### 6. מטרות המוצר, dashboard, הודעות ו־feedback

**מה כבר עובד**

- adherence loop בסיסי קיים: schedule, CTA, session, feedback, summary ו־weekly totals.
- Hebrew coach-trainee wedge אמיתי, לא רק תרגום טקסטים.
- dashboard מציג trends, volume, duration ו־exercise modal.
- coach workspace כולל messages, broadcast, feedback, measurements, plans ו־reports.

**ממצאים מרכזיים**

| עדיפות | ממצא | ראיות | השפעה |
|---|---|---|---|
| P0/P1 | הודעות הן notice חד־כיווני, לא שיחה | `src/routes/index.tsx:500-528,574-609`; coach send/reload ב־`src/routes/coach.tsx:3233-3279`; model ב־`src/lib/gym-types.ts:410-416` | אין reply, inbox, thread, read/acknowledge או סגירת לולאת coach-trainee |
| P1 | feedback נשמר אך אינו הופך ל־coach action | `src/routes/session.$workoutId.tsx:1883-1920,1235-1251`; generic next step ב־`:1991-2001`; attention reasons ב־`src/routes/coach.tsx:318-379` | כאב/קושי לא מובילים בהכרח למענה, שינוי תוכנית או follow-up |
| P1 | dashboard adherence סופר sessions גולמיים ולא תמיד completion של schedule | `src/routes/index.tsx:332-361,842-858` | extra sessions עלולים לנפח progress; missed/partial semantics לא תמיד מדויקים |
| P1 | Programs אינו בתפריט הראשי של trainee | `src/components/AppShell.tsx:478-531`; route קיים ב־`src/routes/programs.index.tsx`; session מפנה אליו ב־`src/routes/session.$workoutId.tsx:1272-1275` | משתמש מגיע למסך שאינו נגיש מהניווט הקבוע |
| P1 | אין מסך goals/measurement progress אישי | dashboard profile/weigh-in ב־`src/routes/index.tsx:1103-1217`; measurements בעיקר ב־coach `src/routes/coach.tsx:10416-10501` | מטרות האתר אינן מוצגות כ־journey מדיד למתאמן |
| P2 | challenge קיים בעיקר כ־library/enrollment בלי progress journey | `src/components/ChallengeLibrary.tsx:105-187,194-335`; `src/lib/gym-types.ts:180-188`; `src/routes/workouts.index.tsx:20-59` | אין streak, milestones, completion, finish/archive |
| P2 | personalization של dashboard הוא dead UI | `src/routes/index.tsx:176-244,708-727` | יש state ו־storage בלי affordance פעיל |
| P2 | צפיפות וטיפוגרפיה אינן מוכחות ב־320px/RTL/accessibility | `src/routes/index.tsx:555-566,736-746,809-823`; `src/routes/nutrition.index.tsx:682-708` | risk לקריאות ולחיצות שגויות במסכים קטנים |

## תוכנית עבודה — 5 משימות־על

המשימות הבאות מאחדות את כל הממצאים. הסדר הוא לפי סיכון release והשפעה על אמון המשתמש, לא לפי קלות ביצוע.

### 1. לסגור את שער ה־Release של סנכרון והרשאות חיות

**עדיפות:** P0/P1  
**מטרה:** להוכיח ש־owner, coach ו־trainee רואים וכותבים בדיוק את מה שמותר להם גם דרך Supabase האמיתי.

**כולל**

- live authenticated smoke ל־RLS, RPC, FK ו־Realtime לכל שלושת התפקידים.
- broadcast flow: coach create → disconnect → reconnect → trainee refresh/read.
- הוספת `challenges` ו־`challenge_enrollments` לפרסום Realtime.
- בדיקת כל טבלאות המשתמש מול subscriptions וה־publication.
- בדיקות schema legacy/missing table שלא מפילות hydration רחב.
- החלטת conflict ברורה ל־history, measurements, habits, cardio ו־client edits.

**Done כאשר**

- יש smoke מתועד שעובר מול פרויקט Supabase חי.
- כל assertion בודק גם RLS וגם תוצאה באפליקציה.
- אין `channel_error` חוזר או שהוא מסווג עם recovery מוכח.
- broadcast ו־challenge update נבדקים cross-device.

### 2. להפוך Push והתראות ליכולת אמינה ומאובטחת

**עדיפות:** P0/P1  
**מטרה:** הודעות push וטיימר מנוחה יעבדו באופן צפוי, בלי redirect חיצוני ובלי כשל שקט.

**כולל**

- חסימת `//external-host` ב־Edge Function וב־service worker.
- תיקון FCM Edge Function והוספת בדיקת send אמיתית.
- lifecycle מלא ל־token rotation, duplicate token, logout ו־invalid token.
- permission denial/retry ו־foreground/background behavior.
- בדיקת iPhone אמיתי: מוזיקה, background, lock screen, Focus/silent ו־permission state.
- בידוד notification ID לפי user/workout/session.
- תיעוד ברור: native app תומכת ב־background sound; Safari רגיל אינו מבטיח זאת.

**Done כאשר**

- push שנשלח פותח רק נתיב פנימי.
- FCM send מדווח success/failure לכל device בלי orphan tokens.
- טיימר מנוחה נבדק על iPhone אמיתי כשהמוזיקה מתנגנת והאפליקציה ברקע.
- אין התראה כפולה ב־foreground/background.

### 3. לסגור את לולאת התזונה והנתונים

**עדיפות:** P1  
**מטרה:** יעד, תפריט, מתכון ורשימת קניות יהיו עקביים בין מכשירים וייצגו את הבחירה בפועל.

**כולל**

- round-trip מלא ל־calories/protein/carbs/fat/fiber.
- בחירת target דטרמיניסטית לפי latest effective date.
- server-side nutrition integrity validation.
- החלטה אם recipes הן aggregate בלבד או ingredient-aware; אם ingredient-aware, לייצר shopping ingredients.
- shopping לפי option שנבחר, לא תמיד `meals[0]`.
- persist/sync ל־checked shopping state.
- E2E ל־scan → edit → save → sync → reopen ול־coach/trainee nutrition permissions.

**Done כאשר**

- כל המאקרו נשמרים וחוזרים במכשיר שני.
- החלפת recipe מציגה מנה ומאקרו חדשים בצורה נכונה.
- shopping list מייצגת את ה־meal option שנבחרה ושורדת reopen.
- nutrition live smoke עובר ל־trainee, coach ו־owner.

### 4. לבנות adherence loop מלא: הודעות, feedback, מטרות ותפריט

**עדיפות:** P1  
**מטרה:** להפוך את המוצר מ־tracker + coach admin ללולאה סגורה של פעולה, משוב ומענה.

**כולל**

- trainee inbox עם thread/history, reply, read/acknowledge ו־unread state.
- feedback שמייצר coach attention item ויכול להוביל ל־reply או plan adjustment.
- dashboard adherence לפי scheduled workout completion, partial, missed ו־extra.
- goals אישיים, progress של measurements ו־weekly/monthly trend.
- הוספת Programs ו־Goals לניווט trainee או יצירת מסלול ברור אליהם.
- broadcast dismissal/read state דטרמיניסטי ושמור מול reconnect.

**Done כאשר**

- מתאמן יכול לקרוא, להשיב ולסמן הודעה כנקראה.
- feedback קשה/כואב מופיע למאמן כ־actionable ולא רק כנתון היסטורי.
- dashboard אינו מציג 100% רק בגלל extra sessions.
- משתמש יכול למצוא את התוכנית והמטרות מהתפריט הראשי.

### 5. לייצב את בניית האימונים ולבנות שכבת בדיקות מוצר

**עדיפות:** P1/P2  
**מטרה:** שכל builder ייצור תוכן נגיש, וכל מסלול מרכזי יהיה מוכח ב־UI ולא רק ב־store tests.

**כולל**

- למנוע orphan workouts או לחבר אותם אוטומטית ל־program/day.
- לאחד bodyweight exercises בין כל העורכים.
- לשמור `sourceExerciseId` כשיש substitution בתוך session.
- להבחין בין empty/partial/completed בכל badges ודוחות.
- להחליט אם נדרש cloud draft עבור session פתוח.
- route-level/E2E smoke ל־login, signup, reset, role switch, menu, program builder, session reopen, nutrition, notification permission ו־feedback.
- מטריצת 320px/RTL/desktop, focus, modal scroll ו־accessibility.

**Done כאשר**

- אין workout שנוצר ונעלם מהניווט.
- כל editor מציג את אותו exercise catalog.
- history ו־coach reports מזהים substitutions בצורה עקבית.
- release gate מכסה outcomes של משתמש, לא רק unit/store contracts.

## סדר ביצוע מומלץ

1. **משימה 1 — live sync/RLS/realtime**, כי כל feature אחר תלוי באמינות הנתונים.
2. **משימה 2 — push/notifications**, כי יש כשלי runtime שנצפו בפועל וסיכון security ב־deep links.
3. **משימה 3 — nutrition integrity**, כי אובדן macro targets הוא פגיעה ישירה בנתוני משתמש.
4. **משימה 4 — adherence/communication**, כי זו ליבת הערך של MY routine מול tracker כללי.
5. **משימה 5 — builders ו־product test gate**, כדי למנוע חזרה של regressions ולהוכיח את כל המסלולים.

## החלטת Release

**מצב נוכחי: Release candidate עם פערים — לא Ready to publish.**

אפשר להמשיך ל־beta פנימית רק אם:

- אין נתוני production אמיתיים בסכנה או שהגיבוי אומת.
- משימה 1 עוברת לפחות עבור auth, תוכניות, הודעות ותזונה.
- משימה 2 עוברת על מכשיר iPhone אמיתי.
- deep-link security מתוקן.

פרסום רחב מומלץ רק לאחר שכל חמש המשימות נסגרות או שהסעיפים שנשארו מתועדים כהחלטות מוצר מפורשות עם fallback למשתמש.
