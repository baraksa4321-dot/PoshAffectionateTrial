# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1396:1

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Could not connect to 127.0.0.1: Connection refused
Call log:
  - navigating to "http://127.0.0.1:4173/programs", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "MY routine — דף הבית" [ref=e5]:
    - /url: /
    - img "MY routine" [ref=e6]
  - heading "האתר לא נטען כראוי" [level=1] [ref=e7]
  - paragraph [ref=e8]: זוהתה בעיה בטעינת קובץ של האפליקציה. אפשר לבצע טעינה נקייה בלי למחוק את הנתונים השמורים.
  - button "טעינה נקייה" [ref=e9]
```

# Test source

```ts
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
  1391 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
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
> 1424 |   await page.goto("/programs");
       |              ^ Error: page.goto: Could not connect to 127.0.0.1: Connection refused
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