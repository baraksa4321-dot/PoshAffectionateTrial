# פרומפט לעדכון פרויקט GymTrack / My Routine

## הקשר

מצורף ZIP בשם `GymTrack-current-code-2026-09-14.zip`. זהו snapshot עדכני של
קוד GymTrack / My Routine לאחר סבב ייצוב, בדיקות mobile ו-audit רחב.

ה-ZIP הוא חבילת קוד portable: הוא כולל את קוד האפליקציה, Supabase, migrations,
Edge Functions, בדיקות וסקריפטים. כדי להישאר מתחת למגבלת העלאה הוא לא כולל את
תיקיות ה-build הגדולות של Android/iOS ואת ספריית מדיית ה-loading הכבדה. אין
למחוק את `android/`, `ios/` או `public/loading/` שכבר קיימים בפרויקט היעד;
שמור אותם, ועדכן אותם רק אם יש בהם שינוי מקומי רלוונטי. אחרי עדכון קוד web
אפשר להריץ Capacitor sync בפרויקט היעד כדי לרענן את העטיפה הנייטיבית.

המטרה שלך היא לעדכן את פרויקט GymTrack הישן יותר שלך כך שיכלול את כל השינויים
שנמצאים ב-ZIP, בלי למחוק משתמשים, נתונים, סודות, או התאמות חדשות שכבר קיימות
בפרויקט היעד.

## כללים מחייבים

1. עבוד ב-Build mode ובדוק קודם את מבנה הפרויקט הנוכחי ואת ה-git status.
2. השתמש בקוד שבתיקיית `gymtrack-working/` שבתוך ה-ZIP כמקור העיקרי להשוואה.
3. אל תעתיק סודות או credentials מהפרויקט המקורי. שמור את ערכי הסביבה של
   הפרויקט שלך והגדר אותם מחדש רק דרך Secrets / Environment Variables.
4. אל תעתיק או תדרוס את `.env`, `.replit`, `supabase/.temp`, `node_modules`,
   build outputs או קבצי cache. שמור גם את `android/`, `ios/` ו-`public/loading/`
   של פרויקט היעד אם הם אינם כלולים ב-ZIP.
5. אל תחליף את פרויקט Supabase של היעד ואל תמחק נתוני production.
6. אם קיימים בפרויקט היעד שינויים חדשים יותר, בצע merge ידני ושמור אותם; אל
   תבצע overwrite עיוור של כל התיקייה.
7. לפני migrations או שינויי RLS, בדוק אילו migrations כבר יושמו, צור backup
   תקין, והרץ migrations חסרות לפי הסדר בלבד.
8. אל תיצור mock או fallback שקט כדי להסתיר שגיאת Supabase, FCM, RLS, Realtime
   או authentication. אם בדיקה נכשלת, הצג את הסיבה המדויקת.

## מה חייב להתעדכן

### בסיס המוצר

- ממשק מלא בעברית וב-RTL, mobile-first, PWA ו-TanStack/React/TypeScript.
- Dashboard, תוכניות אימון, ימי אימון, exercise library, active workout,
  היסטוריה ו-Personal Records.
- סטים עם משקל וחזרות עצמאיים, target rep ranges, warm-up sets, drop sets,
  supersets ופתיחת פרטי תרגיל מתוך אימון בלי לאבד state.
- Nutrition log יומי, תפריטי תזונה מתוכננים, מאגר מזון ישראלי, החלפת מזון
  לפי קלוריות, מאקרו ויחידות ביתיות.
- תפקידי trainee, coach ו-owner עם הרשאות, שיוך מאמנים/מתאמנים וניהול
  משתמשים.

### Auth, Supabase ו-offline-first

- Auth lifecycle יציב כולל מצב שבו משתמש Auth קיים אך profile עדיין חסר.
- Cache מקומי לפי user ID בלתי-משתנה בלבד; אין להעביר cache בין חשבונות.
- הצגת cache מיד בכניסה ולאחר מכן refresh שקט מ-Supabase.
- merge שמונע כפילויות ולא מוחק שינוי מקומי שעדיין לא הסתנכרן.
- טיפול ב-reconnect, online/offline, Realtime, stale browser state ו-refresh
  אחרי החלפת מתאמנת.
- טיוטות persistent ומבודדות למשתמש עבור טפסים ושדות שנמצאים בעריכה.
- תאריך לידה הוא מקור האמת היחיד לגיל; גיל מחושב לפי DOB ואין שדה גיל ידני.
- שמירת DOB גם בעריכה של coach, ותאימות לפרופילים ישנים שבהם DOB חסר.

### Coach workspace

- מסך coach ללקוחות, tracking, activity, messages, measurements ו-nutrition.
- Autosave לעורך תרגילים ולעורך תפריט תזונה; אין להחזיר כפתור save ידני
  במקום ההתנהגות הקיימת.
- בזמן עריכת תוכנית או תפריט, refresh, polling, focus, Realtime ו-autosave
  של אותו לקוח לא יחליפו את ה-editor, החיפוש, ההרחבות או שדות שנמצאים בעריכה.
- אחרי סגירת editor מתבצע refresh שקט אחד.
- בהחלפת מתאמנת מותר לאפס את מצב ה-editor.
- Tracking deep links חייבים לעבוד גם אם associations ישנים בין program/day/
  exercise אינם מושלמים; יש להעביר day ID ו-exercise ID באופן עצמאי.
- רענון של coach edits צריך לגרום ל-trainee rehydration בלי לדרוס שינוי
  offline מקומי.
- Coach notes ו-reviewed state נשארים coach-scoped ו-local-first אם אין schema
  פרטי ייעודי.

### Workout session ו-rest timer

- פתיחה מחדש של אימון משחזרת completion של סטים.
- Dashboard משתמש בתאריך מקומי וב-schedule שבועי מפורש; תוכניות legacy מקבלות
  fallback דטרמיניסטי.
- Rest timer שומר absolute deadline ומסתנכרן ב-resume/foreground.
- Native Capacitor משתמש ב-local notifications.
- Web/PWA משתמש ב-system notification/data-only FCM לפי היכולות של הדפדפן,
  בלי להבטיח custom sound כשהאפליקציה סגורה.
- אם מבטלים את הסט שהפעיל את הטיימר, צריך לעצור ולכווץ את הטיימר ולנקות את
  מצב ה-smart timer; טיימר ישן לא יכול לחסום את כפתור סיום האימון.

### Push, Realtime ו-Edge Functions

- Service Worker מטפל ב-Push, deduplication, notification tag ו-deep links
  מאומתים.
- FCM web payloads צריכים להיות data-only כדי שה-Service Worker ינהל display
  וניווט.
- Native foreground notification לא תיצור duplicate כאשר מערכת ההפעלה כבר
  הציגה notification.
- Push token rotation חייבת לעבור claim מאומת בצד שרת.
- יש לכלול ולבדוק את:
  - `supabase/functions/send-fcm-notification`
  - `supabase/functions/dispatch-rest-timer-notifications`
  - `supabase/migrations/61_rest_timer_notifications.sql`
- עבור Web/PWA יש להגדיר scheduler ל-dispatch כל דקה ולשמור את secrets של
  Firebase בצד Supabase Edge Function:
  `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_PROJECT_ID`.
- יש להחיל את migrations החסרות 54 עד 61 לפי מצב הפרויקט, כולל DOB, video
  feedback, seen grants ו-rest-timer notifications. אין להריץ migration שכבר
  קיימת שוב בצורה ידנית.

### Nutrition ו-food library

- יחידות ביתיות צריכות להיות food-specific עם conversion מבוסס משקל, ולא forcing
  של כל דבר לגרמים.
- כמות בגרמים דורשת nutrition per gram; יש לנרמל rows ישנים בעת save.
- עריכת food seeded יוצרת owned override כדי ש-sync לא יחזיר את הערך המקורי.
- מחיקות של תרגילים מובנים נשמרות באמצעות user tombstones.
- מקור תזונתי צריך להיות provenance ברור; מוצר או flavor שאינם התאמה מדויקת
  לא יקבלו verified status.

### Mobile / PWA UX

- שמור safe-area תחתון ב-navigation הקבוע גם ב-iOS installed PWA.
- Night theme צריך לצבוע גם את ה-safe-area העליון ולעדכן theme-color.
- בזמן loading יש לנעול `html/body` כדי למנוע dragging של Safari.
- במסכים עם keyboard/overlay יש scroll path יחיד, שימוש ב-visual viewport וגישה
  ל-scroll parent הקרוב.
- יש route-module warmup ל-offline navigation, לא רק cache ל-HTML הראשוני.
- השאר recovery path עבור chunk failures ו-unhandled promise rejections.

## קבצים ואזורים חשובים להשוואה

השווה במיוחד את האזורים הבאים בין ה-ZIP לפרויקט היעד:

- `gymtrack-working/src/lib/gym-store.ts`
- `gymtrack-working/src/lib/gym-types.ts`
- `gymtrack-working/src/lib/supabase-sync.ts`
- `gymtrack-working/src/lib/form-drafts.ts`
- `gymtrack-working/src/lib/notification-service.ts`
- `gymtrack-working/src/lib/video-feedback.ts`
- `gymtrack-working/src/components/AppShell.tsx`
- `gymtrack-working/src/routes/__root.tsx`
- `gymtrack-working/src/routes/index.tsx`
- `gymtrack-working/src/routes/coach.tsx`
- `gymtrack-working/src/routes/session.$workoutId.tsx`
- `gymtrack-working/public/sw.js`
- `gymtrack-working/capacitor.config.ts`
- `gymtrack-working/supabase/migrations/`
- `gymtrack-working/supabase/functions/`
- `gymtrack-working/e2e/authenticated-ios.pw.mjs`
- `scripts/run-release-check.sh`
- `scripts/check-gymtrack-preview.sh`

## Environment

בפרויקט היעד, הגדר את הערכים שלך עבור:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`

אין להדביק secrets בצ'אט או בקבצי source. השתמש ב-Replit Secrets וב-Supabase
Edge Function secrets.

## סדר עבודה מומלץ

1. בדוק את הפרויקט הקיים, package manager, workflow, env names, Supabase project
   ו-migration history.
2. צור checkpoint/backup של הפרויקט ושל בסיס הנתונים.
3. העתק או בצע merge של source, public assets, tests, scripts, migrations ו-Edge
   Functions מתוך ה-ZIP.
4. התקן dependencies לפי ה-lockfiles הקיימים. אל תחליף package manager בלי צורך.
5. הגדר env/secrets של היעד.
6. החלת migrations חסרות לפי הסדר, פריסת Edge Functions והגדרת scheduler של
   rest-timer notifications.
7. הגדר workflow preview שמריץ את האפליקציה מתוך `gymtrack-working` עם
   `--host 0.0.0.0 --port $PORT --strictPort`.
8. הרץ:

   ```bash
   cd gymtrack-working
   pnpm run typecheck
   pnpm test
   ```

   ולאחר מכן הרץ את בדיקת ה-build וה-release של הפרויקט שלך.
9. הרץ לפחות את ה-Chromium smoke flows ברוחב 375px עבור coach, workout,
   nutrition, switching, messaging ו-measurements.
10. בדוק בנפרד live Supabase RLS/Realtime ו-push על מכשיר אמיתי. אל תסמן אותם
    כ-pass רק בגלל mock מקומי או בגלל ש-Realtime callback הגיע; קרא מחדש את
    הרשומה מהשרת.
11. בסיום דווח אילו migrations הוחלו, אילו envs הוגדרו, אילו בדיקות עברו, ומה
    עדיין חסום סביבתית. אל תדווח על WebKit או Push כתקינים בלי בדיקה אמיתית.

## סטטוס ידוע של ה-snapshot

- `pnpm run typecheck` עבר.
- `pnpm test` עבר עם 177 בדיקות ו-0 כישלונות.
- שלושה Chromium mobile smoke flows ברוחב 375px עברו.
- Production build עבר.
- Full release gate עדיין עלול להיתקע בשלב WebKit בגלל מגבלת runtime/timeout
  סביבתית; אין להסתיר זאת באמצעות fake playback או דילוג שקט.
- בדיקת import של משתמשי Shir תלויה ב-test credentials של הפרויקט ואינה חלק
  מהקוד עצמו.

בצע את העדכון בפועל, לא רק סיכום או רשימת הצעות. אל תשנה התנהגות קיימת שעובדת
בלי סיבה מתועדת, ואל תמחוק נתונים כדי לגרום לבדיקות לעבור.