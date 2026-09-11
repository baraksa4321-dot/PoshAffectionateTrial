# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated workspace paints from the boot cache before full refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1349:1

# Error details

```
Error: Channel closed
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('link-nav-coach')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByTestId('link-nav-coach')
  - 

```

```yaml
- status "MY routine נטען":
  - status "טוען"
- img "MY routine"
```

# Test source

```ts
  1260 | 
  1261 |   await page.goto("/");
  1262 |   await page.getByTestId("link-nav-coach").click();
  1263 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1264 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1265 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1266 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1267 | 
  1268 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1269 |   await expect(profileMessage).toBeVisible();
  1270 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1271 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1272 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1273 |   await expect
  1274 |     .poll(async () =>
  1275 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1276 |     )
  1277 |     .toContain(profileMessageText);
  1278 | 
  1279 |   const traineePage = await page.context().newPage();
  1280 |   await installFixture(traineePage, { role: "trainee" });
  1281 |   await traineePage.goto("/");
  1282 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1283 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1284 | 
  1285 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1286 |   await expect(traineeMessage).toContainText(profileMessageText);
  1287 | });
  1288 | 
  1289 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1290 |   page,
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
> 1360 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
       |                          ^ Error: expect(locator).toBeVisible() failed
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