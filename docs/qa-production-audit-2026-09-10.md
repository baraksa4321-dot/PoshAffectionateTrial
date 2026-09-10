# דו״ח QA מלא — MYroutine / GymTrack

**תאריך:** 10 בספטמבר 2026  
**היקף:** ביקורת QA סטטית ודינמית לפני production  
**הגבלה:** לא בוצעו תיקוני קוד במסגרת הביקורת.

## סיכום מנהלים

**סטטוס: ❌ לא מאושר לפרסום ל־production כרגע.**

הסיבות המרכזיות:

1. אין deployment פעיל. `getDeploymentInfo()` החזיר:
   - `isDeployed: false`
   - `primaryUrl: ""`
   - `hasSuccessfulBuild: false`
2. בדיקת ה־Realtime החיה נכשלה: הערוץ הגיע ל־`SUBSCRIBED`, אך אירוע `INSERT` של הודעת מאמן לא הגיע בתוך 30 שניות.
3. ה־API workflow מסומן כ־FAILED בגלל `EADDRINUSE` על פורט 8080.
4. ה־release gate בודק Vite dev server ולא את ה־deployment או production artifact בפועל.
5. `eslint .` לא הסתיים בזמן שהוקצב.

## ראיות בדיקה

| בדיקה | תוצאה |
|---|---|
| Typecheck | ✅ עבר |
| Unit tests | ✅ 109 עברו, 600 assertions |
| Status color checks | ✅ 10 palettes, 26 status utility families |
| Production build | ✅ עבר |
| WebKit iPhone | ✅ 7 תרחישים |
| WebKit Desktop Safari | ✅ 7 תרחישים |
| Live persisted coach message refresh | ✅ עבר |
| Live Realtime coach message delivery | ❌ נכשל |
| API workflow | ❌ `EADDRINUSE: 0.0.0.0:8080` |
| Lint | ⚠️ timeout |
| Production deployment | ❌ לא קיים |
| Native iOS/Android | ❌ לא נבדק |
| Chromium/Firefox | ❌ לא נבדק |

ה־release gate הסתיים ב־exit code 1. ה־Realtime smoke דיווח:

```text
The trainee channel reached SUBSCRIBED but did not deliver the inserted coach message within 30000ms.
```

במקביל, ה־persisted refresh כן עבר:

```text
PASS: the trainee refreshed coach_messages and received the exact coach message.
```

כלומר pull רגיל עובד, אבל delivery בזמן אמת אינו מאומת ועכשיו נכשל.

---

# 1. מיפוי מלא של הפיצ׳רים

## Authentication והרשאות

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| התחברות | ✅ | `gymtrack-working/src/components/AppShell.tsx:1555-1679` |
| הרשמה | ✅ | `AppShell.tsx:1555-1666` |
| שם מלא בהרשמה | ✅ | `AppShell.tsx:1557-1586` |
| בחירת פנייה מגדרית | ✅ | `AppShell.tsx:1633-1665` |
| איפוס סיסמה באימייל | ⚠️ | קיים ב־`AppShell.tsx:1516-1554`, אך לא נבדק מול auth אמיתי |
| שליחת מייל אימות מחדש | ✅ | `AppShell.tsx:1481-1500` |
| משתמש לא מחובר | ✅ | `routes/__root.tsx:1135-1156`, `AppShell.tsx:535-568` |
| הגנת routes לפי תפקיד | ✅ חלקית | `routes/exercises.index.tsx:57-94` וראוטים נוספים |
| תפקידי owner/coach/client | ✅ חלקית | קיימים RPC/RLS, אך לא כל הגבולות אומתו ב־production |
| אימות הרשאות RLS | ⚠️ | קיימות migrations, אך live Realtime נכשל |

### ממצא: שגיאות hydration שאינן network מוסתרות

- `gymtrack-working/src/lib/gym-store.ts:1380-1395`
- כאשר קיים cache ו־pull נכשל מסיבה שאינה מזוהה כ־network, הסטטוס נשאר `ready`.
- השגיאה נשמרת ב־`profileHydrationError`, אך המשתמש רואה cache ישן ללא הודעה או retry.
- `routes/__root.tsx:1137-1156` מציג שגיאה רק כאשר הסטטוס הוא `error`.

**השפעה:** משתמש יכול לעבוד מול profile ישן בלי לדעת שהשרת נכשל.

## Offline-first וסנכרון

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| cache לפי user | ✅ | `gym-store.ts:888-919` |
| מניעת cache משותף | ✅ | `gym-store.ts:888-919` |
| עבודה ללא חיבור | ✅ | `gym-store.ts:1579-1597` |
| retry לסנכרון | ✅ חלקית | `gym-store.ts:1451-1527` |
| שמירת שינוי מקומי בזמן pull | ✅ | `gym-store.ts:1402-1447` |
| Realtime reconnect | ✅ חלקית | `gym-store.ts:739-866` |
| coach-trainee sync | ⚠️ | persisted refresh עבר; Realtime event נכשל |
| live sync מלא | ❌ | `scripts/live-plan-smoke.ts` נכשל |

### ממצא: הודעת coach אינה מגיעה דרך Realtime

קבצים רלוונטיים:

- `gym-store.ts:797-808` — subscriptions ל־`coach_messages`
- `gym-store.ts:744-777` — טיפול באירוע
- `supabase-sync.ts:300-302` — subscription נוסף
- `supabase/migrations/30_realtime_sync_publication.sql:5-17` — publication

## תוכניות ואימונים

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| רשימת אימונים | ✅ | `routes/workouts.index.tsx:1-103` |
| פתיחת אימון | ✅ | קישורים ל־`/session/$workoutId` |
| עריכת workout | ✅ חלקית | `routes/workouts.$workoutId.tsx:67-379` |
| שינוי sets/reps/weight/rest | ✅ | `workouts.$workoutId.tsx:150-275` |
| החלפת תרגיל | ✅ | `workouts.$workoutId.tsx:307-379` |
| שמירת אימון | ⚠️ | עובדת מקומית; אין feedback ברור לכל כשל save |
| מחיקת אימון | ✅ חלקית | קיים כפתור, אך אין error state async |
| ביצוע אימון | ✅ | `routes/session.$workoutId.tsx:245-1935` |
| history | ✅ | `gym-store.ts:2204-2237` |
| שמירת טיוטה | ✅ | WebKit `authenticated-ios.pw.mjs:1130-1187` |
| feedback לאחר אימון | ✅ | `session.$workoutId.tsx:1553-1626` |

### ממצאים

**MEDIUM — stale draft בעורך workout**

- `routes/workouts.$workoutId.tsx:31-34`
- `draft` מאותחל פעם אחת מ־`existing`.
- אין סנכרון בעת שינוי `$workoutId`.
- ניווט client-side בין שני IDs עלול להציג או לשמור את ה־draft של האימון הקודם.

**MEDIUM — stale draft בעורך יום בתוכנית**

- `routes/programs.$programId.$dayId.tsx:229-232`
- אין סנכרון כאשר `programId` או `dayId` משתנים בלי remount.

**MEDIUM — אין loading בזמן שחזור session**

- `routes/session.$workoutId.tsx:608-736`
- restoration של history/video drafts נעשה ב־effects ללא נעילת UI.

## Challenges

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| catalog | ✅ | `challenge-library.ts` |
| enrollment | ✅ | `gym-store.ts:1958-1992` |
| מניעת enrollment כפול | ✅ | `gym-store.offline.test.ts:559-570` |
| workout אישי ל־challenge | ✅ | `gym-store.ts:1932-1948` |
| completion offline | ✅ | `gym-store.offline.test.ts:572-601` |
| reload/reconnect | ✅ חלקית | `gym-store.offline.test.ts:604-634` |
| שחזור במכשיר חדש | ❌ | אין persistence ייעודי ל־enrollment ב־Supabase |
| מניעת כפילות cross-device | ⚠️ | אין live verification |

`supabase-sync.ts:647-686` מסנכרן challenge catalog, אך לא קיים מנגנון account-scoped ברור לסנכרון `challengeEnrollments`.

## Nutrition

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| יומן תזונה יומי | ✅ | `routes/nutrition.index.tsx:69-2099` |
| מעבר בין תאריכים | ✅ | `nutrition.index.tsx:598-636` |
| הוספת/עריכת/מחיקת ארוחה | ✅ | `nutrition.index.tsx:901-1114` |
| food picker | ✅ | `nutrition.index.tsx:1303-1380` |
| חיפוש אוכל | ✅ | `nutrition.foods.index.tsx:81-226` |
| barcode search | ✅ חלקית | `nutrition.foods.index.tsx:81-132` |
| favorites | ✅ | `nutrition.foods.index.tsx:141-255` |
| recipes | ✅ | `nutrition.index.tsx` |
| shopping list | ✅ | `nutrition.index.tsx` |
| calorie target | ✅ | `nutrition.index.tsx` |
| calorie-hidden mode | ✅ | WebKit `authenticated-ios.pw.mjs:953-983` |
| label scan | ✅ חלקית | יש UI ו־errors, ללא בדיקה מול שירות אמיתי |
| planned meals | ✅ חלקית | קיימים, אך branch מסתיר הוספה ידנית |

### ממצאים

**LOW/MEDIUM — CalRing אינו מגביל percentage**

- `routes/nutrition.index.tsx:2072-2095`
- כאשר הצריכה עוברת את היעד, ערך ה־SVG dash offset יכול לצאת מטווח הטבעת.

**LOW — שם אוכל ריק לא מציג validation**

- `routes/nutrition.foods.$foodId.tsx:206-210`
- save עם שם ריק פשוט חוזר ללא הודעה.

## Coach workspace

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| רשימת מתאמנים | ✅ | `routes/coach.tsx:1402+` |
| הוספת מתאמן | ✅ חלקית | form ו־error states קיימים |
| מעבר בין מתאמנים | ✅ | WebKit `authenticated-ios.pw.mjs:985-1035` |
| profile/measurements | ✅ | `coach.tsx:9240-9345` |
| בניית תוכנית | ✅ | WebKit עבר |
| תכנון תזונה | ✅ | `coach.tsx` |
| שליחת הודעה | ✅ חלקית | fixture עבר; live Realtime נכשל |
| broadcast | ✅ חלקית | fixture עבר |
| מחיקת הודעה | ✅ | local security tests |
| tracking | ✅ חלקית | UI ו־RLS smoke קיימים |

**MEDIUM — מספר mutation handlers ללא busy guard**

- `routes/coach.tsx:8961-9165`
- לחיצות חוזרות יכולות ליצור race או כפילויות.

## Exercise library

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| חיפוש | ✅ | `routes/exercises.index.tsx:174-335` |
| group/equipment filters | ✅ | `exercises.index.tsx:224-280` |
| create/edit/delete | ✅ חלקית | `exercises.index.tsx:307-335`, `exercises.$exerciseId.tsx:40-1106` |
| תמונות וסרטונים | ✅ חלקית | upload UI קיים |
| הרשאות | ✅ | `exercises.index.tsx:57-94` |

**MEDIUM — stale draft ב־exercise detail**

- `routes/exercises.$exerciseId.tsx:327-338`
- מעבר בין exercise IDs יכול להשאיר נתונים מה־exercise הקודם.

## הודעות ו־broadcasts

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| הודעת coach במסך הבית | ✅ | `routes/index.tsx:463-549` |
| בחירת ההודעה החדשה ביותר | ✅ | `src/lib/message-history.ts` |
| dedupe לפי ID | ✅ | `gym-store.ts:600-631` |
| offline reload | ✅ | `gym-store.offline.test.ts:324-377` |
| broadcast notice | ✅ חלקית | WebKit fixture עבר |
| מחיקה בצד trainee | ✅ | `routes/index.tsx:469-485` |
| live Realtime delivery | ❌ | live smoke נכשל |

## Push notifications ו־reminders

| פיצ׳ר | סטטוס | ראיות |
|---|---|---|
| workout reminders | ✅ חלקית | `routes/index.tsx:403-414` |
| local notifications | ✅ חלקית | `notification-service` |
| Firebase push | ⚠️ | קיימת קונפיגורציה ללא end-to-end delivery test |
| native push | ❌ לא מאומת | אין native instrumentation ב־release gate |

---

# 2. בדיקת פונקציונליות לפי מסך

## `/` — Dashboard

קובץ: `gymtrack-working/src/routes/index.tsx:130-1224`

נבדקו סטטית:

- קישור לאימונים — `index.tsx:497-499`
- שמירת שקילה — `index.tsx:274-282`
- body profile — `index.tsx:284-325`
- checklist add/toggle/delete — `index.tsx:491-495`
- dismiss coach/broadcast — `index.tsx:467-485`
- progress modal
- ניווט לתרגילים, אימונים ותזונה

תוצאות:

- empty branches קיימים.
- בחירת הודעת coach לפי timestamp קיימת.
- offline הודעות נבדקו.
- dashboard trainee מלא לא נבדק מול Supabase אמיתי.
- אין page-level error state עצמאי.

## `/workouts`

קובץ: `routes/workouts.index.tsx:1-103`

- פתיחת workout — קיים.
- ChallengeLibrary — קיים.
- empty state — `87-98`.
- אין loading state.
- אין error state.
- אין בדיקה לכל workout link.

## `/workouts/$workoutId`

קובץ: `routes/workouts.$workoutId.tsx:1-380`

- שינוי שם, תרגילים, sets/reps/weight/rest.
- fixed/range rep type.
- reorder.
- save/delete/back.

ממצאים:

- role guard ו־not-found קיימים.
- אין feedback ברור לכשל `saveWorkout`.
- אין disabled בזמן שמירה.
- קיימת בעיית stale draft.

## `/session/$workoutId`

קובץ: `routes/session.$workoutId.tsx:68-1935`

נבדקו ב־WebKit:

- active workout
- keyboard/input
- progress
- draft persistence
- notes persistence
- reopen/reload

לא נבדקו מול production:

- storage upload אמיתי
- native camera/file permissions
- כל מקרי refresh באמצע פעולה

## `/programs`

קובץ: `routes/programs.index.tsx:1-462`

- פתיחת תוכנית.
- יצירת תוכנית.
- duplicate.
- delete עם ConfirmSheet.
- ChallengeLibrary.
- ניווט ליום.

אין loading/error state מלא ואין בדיקת double-click.

## `/programs/$programId`

קובץ: `routes/programs.$programId.tsx:50-385`

- שינוי שם/notes.
- reorder.
- duplicate/delete workout.
- add day.

day IDs חסרים מסוננים ללא warning ב־`92-95`.

## `/programs/$programId/$dayId`

קובץ: `routes/programs.$programId.$dayId.tsx:75-1192`

- שינוי שם.
- reorder.
- add exercise.
- sets/reps/weight/rest.
- superset/drop-set.
- rep type.
- previous value.
- save/delete/back.

role guard ו־missing states קיימים ב־`244-280`; stale draft קיים ב־`229-232`.

## `/exercises`

קובץ: `routes/exercises.index.tsx:30-434`

- search.
- filters.
- tabs.
- create/edit/delete.
- delete equipment/grip.

role guard קיים; filtered empty state קיים ב־`347-365`. אין error feedback לכל כשל delete.

## `/exercises/$exerciseId`

קובץ: `routes/exercises.$exerciseId.tsx:40-1106`

- עריכה.
- alternatives.
- image/video upload.
- save/delete/back.

save/video errors קיימים ב־`316-368`, `433-475`, `755-856`. stale draft קיים ב־`327-338`.

## `/nutrition`

קובץ: `routes/nutrition.index.tsx:69-2099`

- date navigation.
- add/rename/delete meal.
- food picker.
- quantity.
- recipes.
- shopping list.
- label scan.
- planned meal actions.

WebKit nutrition quantity/macros ו־calorie-hidden עברו. scan error קיים; retry ייעודי לא קיים.

## `/nutrition/foods`

קובץ: `routes/nutrition.foods.index.tsx:9-301`

- back/new.
- text/barcode search.
- favorites.
- category/product type/brand filters.
- detail navigation.

filtered empty state קיים; loading/error state חסר.

## `/nutrition/foods/$foodId`

קובץ: `routes/nutrition.foods.$foodId.tsx:20-564`

- create/edit.
- serving/macros.
- barcode lookup.
- label scan.
- substitutions.
- delete/save/back.

lookup/scan errors קיימים. שם ריק אינו מציג validation; save אינו busy/disabled ב־`247-256`.

## `/coach` ותתי־המסכים

עיקר ההתנהגות ב־`routes/coach.tsx:1402-9945`.

בדיקת WebKit עברה עבור:

- coach workspace.
- בחירת מתאמנים.
- מעבר בין מתאמנים.
- profile/activity/measurements.
- messaging UI.
- scrolling.
- program editing.
- nutrition picker/macros.
- active workout.

loading/error/retry קיימים ב־`coach.tsx:1444-1520`, `2276-2315`, `2321-2361`, `9388-9422`.

הקובץ הוא monolith של כ־9,945 שורות, ומספר mutation handlers חסרים busy guard.

## `/reset-password`

קובץ: `routes/reset-password.tsx:1-115`

- recovery listener.
- password/confirmation.
- min length.
- submit disabled.
- success/error.
- back to app.

אין loading indicator ייעודי בזמן שה־recovery session עדיין לא ידוע.

---

# 3. Responsive ו־Cross-device

## מובייל — 375px

נבדק screenshot של מסך login:

- הטופס אינו חתוך.
- כפתור התחברות נגיש.
- השדות ניתנים לגלילה.
- אין overlap ברור.

בצילום הראשון האפליקציה עדיין הייתה במסך splash/loading; בצילום חוזר היא הציגה את מסך ההתחברות. זה מצביע על שונות בזמן האתחול, אך לא הוכח ככשל דטרמיניסטי.

## טאבלט — 768px

נבדק login modal:

- ממורכז.
- ללא חיתוך.
- שדות וכפתורים נגישים.

לא בוצע authenticated tablet flow מלא.

## דסקטופ — 1440px

נבדק login modal:

- ממורכז.
- ללא overflow נראה.
- header ו־theme control תקינים.

לא בוצע authenticated desktop flow מלא מול backend אמיתי.

## WebKit

עברו 14 בדיקות:

- 7 תרחישים ב־iPhone WebKit.
- 7 תרחישים ב־Desktop Safari.

הגדרות:

- `gymtrack-working/e2e/playwright.config.mjs:3-40`
- `gymtrack-working/e2e/authenticated-ios.pw.mjs:749-1187`

מגבלות:

- אין Chromium.
- אין Firefox.
- אין Android browser.
- אין native iOS shell.
- אין native Android shell.
- אין בדיקה מלאה של authenticated state בכל שלושת הרוחבים.

---

# 4. State-ים חריגים

## מסך ריק

קיימים:

- workouts empty — `workouts.index.tsx:87-98`
- programs empty — `programs.index.tsx:251-280`
- exercises filtered empty — `exercises.index.tsx:347-365`
- foods filtered empty — `nutrition.foods.index.tsx:279-301`
- editor empty — `programs.$programId.$dayId.tsx:446+`

פער: אין אחידות מלאה בין כל המסכים, ותוכנית עם IDs שבורים מציגה פחות ימים ללא warning.

## Loading

קיימים:

- root auth loading — `routes/__root.tsx:1135-1164`
- profile hydration — `routes/__root.tsx:1139-1156`
- route progress — `routes/__root.tsx:1100-1115`
- loading במספר פעולות auth ו־scan

חסרים או חלקיים:

- session restoration — `session.$workoutId.tsx:608-736`
- food library
- programs
- workouts list
- reset password recovery
- retry profile ללא pending/disabled state ברור

## שגיאת שרת/רשת

קיימים:

- offline cache.
- retry/backoff.
- error messages ב־coach.
- upload/save errors.
- sync status.

פערים:

1. שגיאת pull שאינה network מוסתרת — `gym-store.ts:1380-1395`.
2. network classification צרה — `gym-store.ts:872-879`.
3. API workflow נכשל על `EADDRINUSE`.
4. Realtime live event נכשל.

## משתמש לא מחובר ב־protected route

קיימים:

- auth modal דרך AppShell.
- role guards.
- redirect מ־`/exercises` ב־`routes/exercises.index.tsx:57-94`.
- `NotFoundComponent` ו־`ErrorComponent` ב־`routes/__root.tsx:133-165`.

ממצא:

ה־frontend נטען לפני הגנת client-side. לא נצפה HTTP 401/403 ישיר במסלולים; ההגנה בפועל תלויה ב־RLS וב־client routing.

---

# חסמי production סופיים

1. **לא לפרסם לפני תיקון/אימות Realtime.**
2. **לאשר את מצב ה־API workflow ואת התנגשות פורט 8080.**
3. **להריץ את הבדיקות מול production artifact/deployment ולא רק Vite dev server.**
4. **להשלים lint בהצלחה.**
5. **להוסיף בדיקות ל־profile hydration retry, 401/403, storage failures ו־native push.**
6. **לאמת cross-device challenge persistence.**
7. **לאמת authenticated responsive flows ב־375, 768 ו־1440.**

לא בוצעו תיקוני קוד במסגרת ביקורת זו.