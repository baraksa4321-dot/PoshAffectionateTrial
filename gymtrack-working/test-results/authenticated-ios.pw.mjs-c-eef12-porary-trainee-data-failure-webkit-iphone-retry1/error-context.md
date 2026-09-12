# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile retry recovers after a temporary trainee data failure
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1394:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('coach-client-details-error')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('coach-client-details-error')

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
  - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - heading "מתאמנת בדיקה" [level=3]
  - button "פתיחת פרופיל המשתמש": פרופיל
  - button "סגירת תכנית המתאמן"
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים" [selected]
    - tab "תפריט תזונה"
  - textbox "שם תוכנית חדשה"
  - button "צור"
  - textbox "שם תוכנית האימון": תוכנית בדיקה לאייפון
  - text: 4 ימי אימון · 8 תרגילים
  - button "סגירה"
  - button "מחק את התוכנית תוכנית בדיקה לאייפון": מחק
  - button "פתיחת אתגרים": אתגרים
  - 'textbox "שם יום אימון (למשל: A - פלג גוף עליון)..."'
  - button "+ יום"
  - button "בניית אימון אימון בדיקה ארוך": אימון בדיקה ארוך 8 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 2": אימון בדיקה 2 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 3": אימון בדיקה 3 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 4": אימון בדיקה 4 0 תרגילים בניית אימון
- navigation "ניווט ראשי":
  - link:
    - /url: /coach
  - link "מתאמנים":
    - /url: /coach/clients
  - link "מעקב":
    - /url: /coach/tracking
  - link "תרגילים":
    - /url: /exercises
```

# Test source

```ts
  1310 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1311 |   await installFixture(page, { role: "trainee", showCalories: false });
  1312 | 
  1313 |   await page.goto("/nutrition");
  1314 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1315 |   await expect(plannedFoodQuantity).toBeVisible();
  1316 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1317 | 
  1318 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1319 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1320 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1321 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1322 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1323 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1324 |   }
  1325 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1326 | 
  1327 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1328 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1329 |   await expect(replacementDialog).toBeVisible();
  1330 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1331 |   await expect(replacementQuantity).toBeVisible();
  1332 |   await expect(replacementQuantity).toHaveText(/\d/);
  1333 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1334 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1335 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1336 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1337 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1338 |   }
  1339 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1340 | });
  1341 | 
  1342 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1343 |   page,
  1344 | }) => {
  1345 |   await installFixture(page);
  1346 | 
  1347 |   await page.goto("/");
  1348 |   await page.getByTestId("link-nav-coach").click();
  1349 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1350 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1351 | 
  1352 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1353 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1354 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1355 |     timeout: 20_000,
  1356 |   });
  1357 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1358 | 
  1359 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1360 |   await expect(profile).toBeVisible();
  1361 |   await expect(profile).toContainText("63.4");
  1362 |   await expect(profile).toContainText("74");
  1363 |   await expect(profile).toContainText("8,500");
  1364 |   await expect(profile).toContainText("הליכה מהירה");
  1365 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1366 |   await expect(profile).not.toContainText("71.8");
  1367 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1368 | 
  1369 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1370 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1371 |   await expect(workspace).toHaveCount(0);
  1372 | 
  1373 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1374 |   await expect(clientSearch).toBeVisible();
  1375 |   await clientSearch.fill("מתאמנת אחרת");
  1376 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1377 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1378 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1379 |     timeout: 20_000,
  1380 |   });
  1381 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1382 | 
  1383 |   await expect(profile).toBeVisible();
  1384 |   await expect(profile).toContainText("71.8");
  1385 |   await expect(profile).toContainText("88");
  1386 |   await expect(profile).toContainText("1,234");
  1387 |   await expect(profile).toContainText("רכיבה אחרת");
  1388 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1389 |   await expect(profile).not.toContainText("63.4");
  1390 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1391 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1392 | });
  1393 | 
  1394 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1395 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1396 | 
  1397 |   await page.goto("/");
  1398 |   await page.getByTestId("link-nav-coach").click();
  1399 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1400 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1401 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1402 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1403 | 
  1404 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1405 |   const detailsError = page.getByTestId("coach-client-details-error");
  1406 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1407 |     timeout: 20_000,
  1408 |   });
  1409 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
> 1410 |   await expect(detailsError).toBeVisible();
       |                              ^ Error: expect(locator).toBeVisible() failed
  1411 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1412 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1413 | 
  1414 |   await page.getByTestId("coach-client-details-retry").click();
  1415 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1416 |     timeout: 20_000,
  1417 |   });
  1418 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1419 |   await expect(detailsError).toHaveCount(0);
  1420 | 
  1421 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1422 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1423 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1424 | });
  1425 | 
  1426 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1427 |   await installFixture(page);
  1428 | 
  1429 |   const routes = [
  1430 |     { path: "/workouts", marker: "האימונים שלי" },
  1431 |     { path: "/programs", marker: "התוכניות שלך" },
  1432 |     { path: "/exercises", marker: "תרגילים" },
  1433 |     { path: "/nutrition", marker: "יומן תזונה" },
  1434 |   ];
  1435 | 
  1436 |   await page.goto("/coach/clients");
  1437 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1438 | 
  1439 |   for (const route of routes) {
  1440 |     await page.goto(route.path);
  1441 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1442 |       timeout: 20_000,
  1443 |     });
  1444 |   }
  1445 | });
  1446 | 
  1447 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1448 |   page,
  1449 | }) => {
  1450 |   await installFixture(page);
  1451 | 
  1452 |   await page.goto("/");
  1453 |   await page.getByTestId("link-nav-coach").click();
  1454 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1455 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1456 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1457 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1458 | 
  1459 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1460 |   await expect(profileMessage).toBeVisible();
  1461 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1462 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1463 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1464 |   await expect
  1465 |     .poll(async () =>
  1466 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1467 |     )
  1468 |     .toContain(profileMessageText);
  1469 | 
  1470 |   const traineePage = await page.context().newPage();
  1471 |   await installFixture(traineePage, { role: "trainee" });
  1472 |   await traineePage.goto("/");
  1473 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1474 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1475 | 
  1476 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1477 |   await expect(traineeMessage).toContainText(profileMessageText);
  1478 | });
  1479 | 
  1480 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1481 |   page,
  1482 | }) => {
  1483 |   await installFixture(page, { role: "trainee" });
  1484 | 
  1485 |   await page.goto("/");
  1486 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1487 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1488 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1489 | 
  1490 |   await page.reload();
  1491 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1492 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1493 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1494 | 
  1495 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1496 |   await expect
  1497 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1498 |     .toBeGreaterThan(0);
  1499 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1500 |   await expect
  1501 |     .poll(async () => {
  1502 |       const cached = await page.evaluate(
  1503 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1504 |         "gymtrack.v1.user.ios-smoke-client",
  1505 |       );
  1506 |       return cached.coachMessages?.length ?? 0;
  1507 |     })
  1508 |     .toBe(1);
  1509 | });
  1510 | 
```