# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile retry recovers after a temporary trainee data failure
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1466:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1369 |   expect(replacementName).toBeTruthy();
  1370 |   await yogurtReplacement.click();
  1371 |   await expect(replacementDialog).toBeHidden();
  1372 | 
  1373 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1374 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1375 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1376 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1377 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
  1378 |     /\d+(?:\.\d+)? כף/,
  1379 |   );
  1380 | });
  1381 | 
  1382 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1383 |   await installFixture(page, { role: "trainee", showCalories: false });
  1384 | 
  1385 |   await page.goto("/nutrition");
  1386 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1387 |   await expect(plannedFoodQuantity).toBeVisible();
  1388 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1389 | 
  1390 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1391 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1392 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1393 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1394 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1395 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1396 |   }
  1397 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1398 | 
  1399 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1400 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1401 |   await expect(replacementDialog).toBeVisible();
  1402 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1403 |   await expect(replacementQuantity).toBeVisible();
  1404 |   await expect(replacementQuantity).toHaveText(/\d/);
  1405 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1406 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1407 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1408 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1409 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1410 |   }
  1411 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1412 | });
  1413 | 
  1414 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1415 |   page,
  1416 | }) => {
  1417 |   await installFixture(page);
  1418 | 
  1419 |   await page.goto("/");
  1420 |   await page.getByTestId("link-nav-coach").click();
  1421 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1422 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1423 | 
  1424 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1425 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1426 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1427 |     timeout: 20_000,
  1428 |   });
  1429 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1430 | 
  1431 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1432 |   await expect(profile).toBeVisible();
  1433 |   await expect(profile).toContainText("63.4");
  1434 |   await expect(profile).toContainText("74");
  1435 |   await expect(profile).toContainText("8,500");
  1436 |   await expect(profile).toContainText("הליכה מהירה");
  1437 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1438 |   await expect(profile).not.toContainText("71.8");
  1439 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1440 | 
  1441 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1442 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1443 |   await expect(workspace).toHaveCount(0);
  1444 | 
  1445 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1446 |   await expect(clientSearch).toBeVisible();
  1447 |   await clientSearch.fill("מתאמנת אחרת");
  1448 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1449 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1450 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1451 |     timeout: 20_000,
  1452 |   });
  1453 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1454 | 
  1455 |   await expect(profile).toBeVisible();
  1456 |   await expect(profile).toContainText("71.8");
  1457 |   await expect(profile).toContainText("88");
  1458 |   await expect(profile).toContainText("1,234");
  1459 |   await expect(profile).toContainText("רכיבה אחרת");
  1460 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1461 |   await expect(profile).not.toContainText("63.4");
  1462 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1463 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1464 | });
  1465 | 
  1466 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1467 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1468 | 
> 1469 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1470 |   await page.getByTestId("link-nav-coach").click();
  1471 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1472 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1473 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1474 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1475 | 
  1476 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1477 |   const detailsError = page.getByTestId("coach-client-details-error");
  1478 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1479 |     timeout: 20_000,
  1480 |   });
  1481 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1482 |   await expect(detailsError).toBeVisible();
  1483 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1484 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1485 | 
  1486 |   await page.getByTestId("coach-client-details-retry").click();
  1487 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1488 |     timeout: 20_000,
  1489 |   });
  1490 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1491 |   await expect(detailsError).toHaveCount(0);
  1492 | 
  1493 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1494 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1495 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1496 | });
  1497 | 
  1498 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1499 |   await installFixture(page);
  1500 | 
  1501 |   const routes = [
  1502 |     { path: "/workouts", marker: "האימונים שלי" },
  1503 |     { path: "/programs", marker: "התוכניות שלך" },
  1504 |     { path: "/exercises", marker: "תרגילים" },
  1505 |     { path: "/nutrition", marker: "יומן תזונה" },
  1506 |   ];
  1507 | 
  1508 |   await page.goto("/coach/clients");
  1509 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1510 | 
  1511 |   for (const route of routes) {
  1512 |     await page.goto(route.path);
  1513 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1514 |       timeout: 20_000,
  1515 |     });
  1516 |   }
  1517 | });
  1518 | 
  1519 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1520 |   page,
  1521 | }) => {
  1522 |   await installFixture(page);
  1523 | 
  1524 |   await page.goto("/");
  1525 |   await page.getByTestId("link-nav-coach").click();
  1526 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1527 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1528 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1529 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1530 | 
  1531 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1532 |   await expect(profileMessage).toBeVisible();
  1533 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1534 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1535 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1536 |   await expect
  1537 |     .poll(async () =>
  1538 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1539 |     )
  1540 |     .toContain(profileMessageText);
  1541 | 
  1542 |   const traineePage = await page.context().newPage();
  1543 |   await installFixture(traineePage, { role: "trainee" });
  1544 |   await traineePage.goto("/");
  1545 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1546 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1547 | 
  1548 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1549 |   await expect(traineeMessage).toContainText(profileMessageText);
  1550 | });
  1551 | 
  1552 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1553 |   page,
  1554 | }) => {
  1555 |   await installFixture(page, { role: "trainee" });
  1556 | 
  1557 |   await page.goto("/");
  1558 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1559 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1560 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1561 | 
  1562 |   await page.reload();
  1563 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1564 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1565 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1566 | 
  1567 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1568 |   await expect
  1569 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
```