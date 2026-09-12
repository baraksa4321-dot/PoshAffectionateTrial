# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile retry recovers after a temporary trainee data failure
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1394:1

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Test ended.
Call log:
  - waiting for getByTestId('coach-client-details-retry')
    - locator resolved to <button type="button" data-testid="coach-client-details-retry" data-tsd-source="/src/routes/coach.tsx:9673:19" class="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">נסי שוב</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

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
        - generic [ref=e12]:
          - paragraph [ref=e13]: בניית תוכניות ותפריטים
          - heading "עריכה" [level=1] [ref=e14]
        - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=e16]
  - main [ref=e21]:
    - generic [ref=e22]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e26]:
      - generic [ref=e27]:
        - heading "מתאמנת בדיקה" [level=3] [ref=e28]
        - generic [ref=e30]:
          - button "פתיחת פרופיל המשתמש" [ref=e31]: פרופיל
          - button "סגירת תכנית המתאמן" [ref=e36]
      - navigation "ניווט בסביבת העריכה" [ref=e40]:
        - tab "תוכנית אימונים" [selected] [ref=e41]
        - tab "תפריט תזונה" [ref=e48]
      - generic [ref=e53]:
        - generic [ref=e55]:
          - textbox "שם תוכנית חדשה" [ref=e56]
          - button "צור" [ref=e57] [cursor=pointer]
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]:
              - textbox "שם תוכנית האימון" [ref=e64]: תוכנית בדיקה לאייפון
              - generic [ref=e65]: 4 ימי אימון · 8 תרגילים
            - generic [ref=e66]:
              - button "סגירה" [ref=e67]
              - button "מחק את התוכנית תוכנית בדיקה לאייפון" [ref=e70]:
                - generic [ref=e74]: מחק
          - generic [ref=e75]:
            - button "פתיחת אתגרים" [ref=e77]: אתגרים
            - generic [ref=e84]:
              - 'textbox "שם יום אימון (למשל: A - פלג גוף עליון)..." [ref=e85]'
              - button "+ יום" [ref=e86] [cursor=pointer]
            - generic [ref=e87]:
              - button "בניית אימון אימון בדיקה ארוך" [ref=e88]:
                - generic [ref=e89]:
                  - generic [ref=e90]: אימון בדיקה ארוך
                  - generic [ref=e91]: 8 תרגילים
                - generic [ref=e92]: בניית אימון
              - button "בניית אימון אימון בדיקה 2" [ref=e93]:
                - generic [ref=e94]:
                  - generic [ref=e95]: אימון בדיקה 2
                  - generic [ref=e96]: 0 תרגילים
                - generic [ref=e97]: בניית אימון
              - button "בניית אימון אימון בדיקה 3" [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: אימון בדיקה 3
                  - generic [ref=e101]: 0 תרגילים
                - generic [ref=e102]: בניית אימון
              - button "בניית אימון אימון בדיקה 4" [ref=e103]:
                - generic [ref=e104]:
                  - generic [ref=e105]: אימון בדיקה 4
                  - generic [ref=e106]: 0 תרגילים
                - generic [ref=e107]: בניית אימון
  - navigation "ניווט ראשי":
    - generic [ref=e108]:
      - link [ref=e109]:
        - /url: /coach
      - link "מתאמנים" [ref=e113]:
        - /url: /coach/clients
      - link "מעקב" [ref=e120]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e124]:
        - /url: /exercises
```

# Test source

```ts
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
  1410 |   await expect(detailsError).toBeVisible();
  1411 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1412 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1413 | 
> 1414 |   await page.getByTestId("coach-client-details-retry").click();
       |                                                        ^ Error: locator.click: Test ended.
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
  1511 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1512 |   await installFixture(page, { role: "trainee" });
  1513 | 
  1514 |   await page.goto("/");
```