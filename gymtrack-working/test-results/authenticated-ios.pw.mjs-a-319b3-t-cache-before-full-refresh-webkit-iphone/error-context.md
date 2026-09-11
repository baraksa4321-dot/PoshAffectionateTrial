# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated workspace paints from the boot cache before full refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1349:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2000
Received:    712
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - link "MY routine — דף הבית" [ref=e6]:
          - /url: /
          - img "MY routine" [ref=e7]
        - button "מעבר לתצוגת לילה" [ref=e8]
      - generic [ref=e11]:
        - button "פתיחת צ׳קליסט לאימון" [ref=e13]: צ׳קליסט
        - group "בחירת מצב עבודה" [ref=e17]:
          - link "אישי" [ref=e18]:
            - /url: /
          - link "מאמן" [ref=e19]:
            - /url: /coach
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: 11.09.2026
          - heading "בוקר טוב, מאמנת." [level=1] [ref=e23]
        - generic [ref=e25]:
          - button "נמצאה התנגשות — נדרשת בחירה לפני סנכרון" [ref=e26] [cursor=pointer]
          - button "פתיחת הפרופיל האישי" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: מאמנת בדיקה
            - generic [ref=e31]: ios-smoke-coach@example.test
          - button "בחירת פלטת צבעים" [ref=e33] [cursor=pointer]
          - button "התנתק" [ref=e35] [cursor=pointer]
  - main [ref=e39]:
    - generic [ref=e40]: נמצאה התנגשות — נדרשת בחירה לפני סנכרון
    - generic [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: הודעה מהמאמן שלך
          - generic [ref=e47]:
            - generic [ref=e48]: 25.8.2026
            - button "מחיקת הודעת המאמן" [ref=e49]
        - paragraph [ref=e53]: "\"כל הכבוד על ההתמדה השבוע\""
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: הודעה חשובה
          - generic [ref=e59]:
            - generic [ref=e60]: 25.8.2026
            - button "הסתרת הודעת תפוצה" [ref=e61]
        - paragraph [ref=e65]: "\"הודעת תפוצה לבדיקה\""
      - generic [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: רצף אימונים שבועי
          - paragraph [ref=e73]: 0 אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות
          - generic "מדד עקביות ללא יעד" [ref=e74]
        - generic [ref=e75]:
          - strong [ref=e81]: —
          - paragraph [ref=e82]: עקביות
      - generic [ref=e84]:
        - generic [ref=e86]:
          - paragraph [ref=e87]: אין אימון להיום
          - paragraph [ref=e88]: האימונים שלך מחכים במסך האימונים.
          - link "יצירת תכנית" [ref=e89]:
            - /url: /programs
        - link "תזונה יומית 0קק״ל מתוך 1900 · 1900 נשארו 0 גרם חלבון" [ref=e91]:
          - /url: /nutrition
          - generic [ref=e92]: תזונה יומית
          - paragraph [ref=e97]: 0קק״ל
          - paragraph [ref=e98]: מתוך 1900 · 1900 נשארו
          - generic [ref=e99]: 0 גרם חלבון
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e106]:
            - heading "פעילות השבוע" [level=2] [ref=e107]
            - paragraph [ref=e108]: 0 אימונים בוצעו השבוע
          - button "פתיחת מגמות והיסטוריית תרגיל" [ref=e109]: מגמות
        - generic [ref=e112]:
          - generic [ref=e113]:
            - paragraph [ref=e115]: אימונים
            - paragraph [ref=e119]: "0"
          - generic [ref=e120]:
            - paragraph [ref=e122]: נפח ק״ג
            - paragraph [ref=e127]: "0"
          - generic [ref=e128]:
            - paragraph [ref=e130]: זמן אימון
            - paragraph [ref=e138]: 0m
      - generic [ref=e139]:
        - generic [ref=e141]:
          - heading "מעקב משקל וצ'ק-אין חודשי" [level=2] [ref=e142]
          - paragraph [ref=e143]: דיווח למאמן
        - generic [ref=e144]:
          - generic [ref=e145] [cursor=pointer]:
            - generic [ref=e146]: שקילה שבועית
            - paragraph [ref=e152]:
              - text: "עדכון משקל בוקר:"
              - strong [ref=e153]: 62 ק"ג
          - generic [ref=e154]:
            - generic [ref=e155]: צ'ק-אין חודשי
            - paragraph [ref=e160]: היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמנת או הבעלים
      - generic [ref=e161]:
        - generic [ref=e163]:
          - heading "המדידות החודשיות שלי" [level=2] [ref=e164]
          - paragraph [ref=e165]: תצוגה בלבד — מתעדכנות על ידי המאמנת או הבעלים
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e168]: מותניים
            - strong [ref=e169]: 74 ס״מ
          - generic [ref=e170]:
            - generic [ref=e171]: אחוז שומן
            - strong [ref=e172]: 24.5 %
          - generic [ref=e173]:
            - generic [ref=e174]: מסת שריר
            - strong [ref=e175]: 42.1 ק״ג
  - navigation "ניווט ראשי":
    - generic [ref=e176]:
      - link [ref=e177]:
        - /url: /coach
      - link "מתאמנים" [ref=e181]:
        - /url: /coach/clients
      - link "מעקב" [ref=e188]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e192]:
        - /url: /exercises
```

# Test source

```ts
  1291 | }) => {
  1292 |   await installFixture(page, { role: "trainee" });
  1293 | 
  1294 |   await page.goto("/");
  1295 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1296 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1297 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1298 | 
  1299 |   await page.reload();
  1300 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1301 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1302 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1303 | 
  1304 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1305 |   await expect
  1306 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1307 |     .toBeGreaterThan(0);
  1308 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1309 |   await expect
  1310 |     .poll(async () => {
  1311 |       const cached = await page.evaluate(
  1312 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1313 |         "gymtrack.v1.user.ios-smoke-client",
  1314 |       );
  1315 |       return cached.coachMessages?.length ?? 0;
  1316 |     })
  1317 |     .toBe(1);
  1318 | });
  1319 | 
  1320 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1321 |   await installFixture(page, { role: "trainee" });
  1322 | 
  1323 |   await page.goto("/");
  1324 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1325 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1326 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1327 | 
  1328 |   await page.reload();
  1329 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1330 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1331 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1332 | 
  1333 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1334 |   await expect
  1335 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1336 |     .toBeGreaterThan(0);
  1337 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1338 |   await expect
  1339 |     .poll(async () => {
  1340 |       const cached = await page.evaluate(
  1341 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1342 |         "gymtrack.v1.user.ios-smoke-client",
  1343 |       );
  1344 |       return cached.broadcasts?.length ?? 0;
  1345 |     })
  1346 |     .toBe(1);
  1347 | });
  1348 | 
  1349 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1350 |   await installFixture(page, {
  1351 |     online: true,
  1352 |     fullCacheValue: reopenFullCacheValue,
  1353 |     bootCacheValue: reopenBootCacheValue,
  1354 |     pendingChanges: true,
  1355 |     trackBootCacheTiming: true,
  1356 |   });
  1357 | 
  1358 |   await page.goto("/");
  1359 |   const coachNav = page.getByTestId("link-nav-coach");
  1360 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1361 | 
  1362 |   await expect
  1363 |     .poll(() =>
  1364 |       page.evaluate(() => ({
  1365 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1366 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1367 |       })),
  1368 |     )
  1369 |     .toMatchObject({
  1370 |       workspaceMountedAt: expect.any(Number),
  1371 |       fullCacheReadAt: expect.any(Number),
  1372 |     });
  1373 | 
  1374 |   const bootTiming = await page.evaluate(() => ({
  1375 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1376 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1377 |   }));
  1378 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1379 | 
  1380 |   await expect
  1381 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1382 |     .not.toBeNull();
  1383 |   await expect
  1384 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1385 |     .toBeGreaterThan(0);
  1386 | 
  1387 |   const refreshedCache = await page.evaluate(
  1388 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1389 |     `gymtrack.v1.user.${COACH_ID}`,
  1390 |   );
> 1391 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
       |                                       ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  1392 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1393 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1394 | });
  1395 | 
  1396 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1397 |   await installFixture(page);
  1398 | 
  1399 |   await page.goto(`/session/${WORKOUT_ID}`);
  1400 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1401 | 
  1402 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1403 |   await repsInput.fill("123");
  1404 |   await page.keyboard.press("Tab");
  1405 |   await expect(repsInput).toHaveValue("123");
  1406 | 
  1407 |   // Completion feedback belongs to the active workout draft and should follow
  1408 |   // the workout when the coach navigates away before saving.
  1409 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1410 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1411 |   await expect(workoutNote).toBeVisible();
  1412 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1413 |   await assertKeyboardVisible(workoutNote);
  1414 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1415 |   await page.keyboard.press("Escape");
  1416 |   await expect(workoutNote).toBeHidden();
  1417 | 
  1418 |   const firstExercise = page.locator("article").first();
  1419 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1420 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1421 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1422 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1423 | 
  1424 |   await page.goto("/programs");
  1425 |   // TanStack can finish the document navigation before the route's client
  1426 |   // transition settles on WebKit. Wait for visible route content before
  1427 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1428 |   // goto even though the app is healthy.
  1429 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1430 |   await page.goto(`/session/${WORKOUT_ID}`);
  1431 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1432 |   await page.reload();
  1433 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1434 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1435 | 
  1436 |   const reopenedFirstExercise = page.locator("article").first();
  1437 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1438 |     /border-primary/,
  1439 |   );
  1440 |   await expect(
  1441 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1442 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1443 | 
  1444 |   // Reopening the completion sheet restores the unfinished workout note.
  1445 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1446 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1447 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1448 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1449 |   await expect(page).toHaveURL(/\/programs/);
  1450 |   await expect
  1451 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1452 |     .toBeNull();
  1453 | });
  1454 | 
```