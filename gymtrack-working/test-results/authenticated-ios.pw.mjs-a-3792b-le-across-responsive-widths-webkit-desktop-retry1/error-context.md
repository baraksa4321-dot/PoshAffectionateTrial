# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated core routes remain usable across responsive widths
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1505:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/coach/clients", waiting until "load"

```

# Test source

```ts
  1415 | 
  1416 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1417 |   const traineePage = await page.context().newPage();
  1418 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1419 |   await traineePage.goto("/nutrition");
  1420 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1421 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1422 | 
  1423 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1424 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1425 |   await expect(replacementDialog).toBeVisible();
  1426 |   await replacementDialog
  1427 |     .locator('input[placeholder*="חפשי מאכל חלופי"]')
  1428 |     .fill("יוגורט טבעי");
  1429 |   const yogurtReplacement = replacementDialog
  1430 |     .getByRole("button", { name: /יוגורט טבעי/ })
  1431 |     .filter({ hasText: "כף" })
  1432 |     .first();
  1433 |   await expect(yogurtReplacement).toContainText("כף");
  1434 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1435 |   expect(replacementName).toBeTruthy();
  1436 |   await yogurtReplacement.click();
  1437 |   await expect(replacementDialog).toBeHidden();
  1438 | 
  1439 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1440 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1441 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1442 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1443 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
  1444 |     /\d+(?:\.\d+)? כף/,
  1445 |   );
  1446 | });
  1447 | 
  1448 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1449 |   await installFixture(page, { role: "trainee", showCalories: false });
  1450 | 
  1451 |   await page.goto("/nutrition");
  1452 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1453 |   await expect(plannedFoodQuantity).toBeVisible();
  1454 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1455 | 
  1456 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1457 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1458 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1459 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1460 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1461 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1462 |   }
  1463 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1464 | 
  1465 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1466 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1467 |   await expect(replacementDialog).toBeVisible();
  1468 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1469 |   await expect(replacementQuantity).toBeVisible();
  1470 |   await expect(replacementQuantity).toHaveText(/\d/);
  1471 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1472 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1473 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1474 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1475 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1476 |   }
  1477 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1478 | });
  1479 | 
  1480 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1481 |   page,
  1482 | }) => {
  1483 |   await installFixture(page);
  1484 | 
  1485 |   await page.goto("/");
  1486 |   await page.getByTestId("link-nav-coach").click();
  1487 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1488 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1489 | 
  1490 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1491 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1492 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1493 |     timeout: 20_000,
  1494 |   });
  1495 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1496 | 
  1497 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1498 |   await expect(profile).toBeVisible();
  1499 |   await expect(profile).toContainText("63.4");
  1500 |   await expect(profile).toContainText("74");
  1501 |   await expect(profile).toContainText("8,500");
  1502 |   await expect(profile).toContainText("הליכה מהירה");
  1503 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1504 |   await expect(profile).not.toContainText("71.8");
  1505 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1506 | 
  1507 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1508 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1509 |   await expect(workspace).toHaveCount(0);
  1510 | 
  1511 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1512 |   await expect(clientSearch).toBeVisible();
  1513 |   await clientSearch.fill("מתאמנת אחרת");
  1514 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
> 1515 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
       |              ^ Error: page.goto: Page crashed
  1516 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1517 |     timeout: 20_000,
  1518 |   });
  1519 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1520 | 
  1521 |   await expect(profile).toBeVisible();
  1522 |   await expect(profile).toContainText("71.8");
  1523 |   await expect(profile).toContainText("88");
  1524 |   await expect(profile).toContainText("1,234");
  1525 |   await expect(profile).toContainText("רכיבה אחרת");
  1526 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1527 |   await expect(profile).not.toContainText("63.4");
  1528 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1529 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1530 | });
  1531 | 
  1532 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1533 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1534 | 
  1535 |   await page.goto("/");
  1536 |   await page.getByTestId("link-nav-coach").click();
  1537 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1538 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1539 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1540 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1541 | 
  1542 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1543 |   const detailsError = page.getByTestId("coach-client-details-error");
  1544 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1545 |     timeout: 20_000,
  1546 |   });
  1547 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1548 |   await expect(detailsError).toBeVisible();
  1549 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1550 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1551 | 
  1552 |   await page.getByTestId("coach-client-details-retry").click();
  1553 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1554 |     timeout: 20_000,
  1555 |   });
  1556 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1557 |   await expect(detailsError).toHaveCount(0);
  1558 | 
  1559 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1560 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1561 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1562 | });
  1563 | 
  1564 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1565 |   await installFixture(page);
  1566 | 
  1567 |   const routes = [
  1568 |     { path: "/workouts", marker: "האימונים שלי" },
  1569 |     { path: "/programs", marker: "התוכניות שלך" },
  1570 |     { path: "/exercises", marker: "תרגילים" },
  1571 |     { path: "/nutrition", marker: "יומן תזונה" },
  1572 |   ];
  1573 | 
  1574 |   await page.goto("/coach/clients");
  1575 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1576 | 
  1577 |   for (const route of routes) {
  1578 |     await page.goto(route.path);
  1579 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1580 |       timeout: 20_000,
  1581 |     });
  1582 |   }
  1583 | });
  1584 | 
  1585 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1586 |   page,
  1587 | }) => {
  1588 |   await installFixture(page);
  1589 | 
  1590 |   await page.goto("/");
  1591 |   await page.getByTestId("link-nav-coach").click();
  1592 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1593 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1594 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1595 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1596 | 
  1597 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1598 |   await expect(profileMessage).toBeVisible();
  1599 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1600 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1601 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1602 |   await expect
  1603 |     .poll(async () =>
  1604 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1605 |     )
  1606 |     .toContain(profileMessageText);
  1607 | 
  1608 |   const traineePage = await page.context().newPage();
  1609 |   await installFixture(traineePage, { role: "trainee" });
  1610 |   await traineePage.goto("/");
  1611 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1612 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1613 | 
  1614 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1615 |   await expect(traineeMessage).toContainText(profileMessageText);
```