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
  1415 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1416 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1417 |   }
  1418 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1419 | });
  1420 | 
  1421 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1422 |   page,
  1423 | }) => {
  1424 |   await installFixture(page);
  1425 | 
  1426 |   await page.goto("/");
  1427 |   await page.getByTestId("link-nav-coach").click();
  1428 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1429 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1430 | 
  1431 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1432 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1433 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1434 |     timeout: 20_000,
  1435 |   });
  1436 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1437 | 
  1438 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1439 |   await expect(profile).toBeVisible();
  1440 |   await expect(profile).toContainText("63.4");
  1441 |   await expect(profile).toContainText("74");
  1442 |   await expect(profile).toContainText("8,500");
  1443 |   await expect(profile).toContainText("הליכה מהירה");
  1444 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1445 |   await expect(profile).not.toContainText("71.8");
  1446 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1447 | 
  1448 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1449 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1450 |   await expect(workspace).toHaveCount(0);
  1451 | 
  1452 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1453 |   await expect(clientSearch).toBeVisible();
  1454 |   await clientSearch.fill("מתאמנת אחרת");
  1455 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1456 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1457 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1458 |     timeout: 20_000,
  1459 |   });
  1460 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1461 | 
  1462 |   await expect(profile).toBeVisible();
  1463 |   await expect(profile).toContainText("71.8");
  1464 |   await expect(profile).toContainText("88");
  1465 |   await expect(profile).toContainText("1,234");
  1466 |   await expect(profile).toContainText("רכיבה אחרת");
  1467 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1468 |   await expect(profile).not.toContainText("63.4");
  1469 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1470 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1471 | });
  1472 | 
  1473 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1474 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1475 | 
  1476 |   await page.goto("/");
  1477 |   await page.getByTestId("link-nav-coach").click();
  1478 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1479 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1480 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1481 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1482 | 
  1483 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1484 |   const detailsError = page.getByTestId("coach-client-details-error");
  1485 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1486 |     timeout: 20_000,
  1487 |   });
  1488 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1489 |   await expect(detailsError).toBeVisible();
  1490 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1491 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1492 | 
  1493 |   await page.getByTestId("coach-client-details-retry").click();
  1494 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1495 |     timeout: 20_000,
  1496 |   });
  1497 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1498 |   await expect(detailsError).toHaveCount(0);
  1499 | 
  1500 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1501 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1502 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1503 | });
  1504 | 
  1505 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1506 |   await installFixture(page);
  1507 | 
  1508 |   const routes = [
  1509 |     { path: "/workouts", marker: "האימונים שלי" },
  1510 |     { path: "/programs", marker: "התוכניות שלך" },
  1511 |     { path: "/exercises", marker: "תרגילים" },
  1512 |     { path: "/nutrition", marker: "יומן תזונה" },
  1513 |   ];
  1514 | 
> 1515 |   await page.goto("/coach/clients");
       |              ^ Error: page.goto: Page crashed
  1516 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1517 | 
  1518 |   for (const route of routes) {
  1519 |     await page.goto(route.path);
  1520 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1521 |       timeout: 20_000,
  1522 |     });
  1523 |   }
  1524 | });
  1525 | 
  1526 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1527 |   page,
  1528 | }) => {
  1529 |   await installFixture(page);
  1530 | 
  1531 |   await page.goto("/");
  1532 |   await page.getByTestId("link-nav-coach").click();
  1533 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1534 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1535 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1536 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1537 | 
  1538 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1539 |   await expect(profileMessage).toBeVisible();
  1540 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1541 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1542 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1543 |   await expect
  1544 |     .poll(async () =>
  1545 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1546 |     )
  1547 |     .toContain(profileMessageText);
  1548 | 
  1549 |   const traineePage = await page.context().newPage();
  1550 |   await installFixture(traineePage, { role: "trainee" });
  1551 |   await traineePage.goto("/");
  1552 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1553 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1554 | 
  1555 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1556 |   await expect(traineeMessage).toContainText(profileMessageText);
  1557 | });
  1558 | 
  1559 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1560 |   page,
  1561 | }) => {
  1562 |   await installFixture(page, { role: "trainee" });
  1563 | 
  1564 |   await page.goto("/");
  1565 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1566 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1567 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1568 | 
  1569 |   await page.reload();
  1570 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1571 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1572 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1573 | 
  1574 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1575 |   await expect
  1576 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1577 |     .toBeGreaterThan(0);
  1578 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1579 |   await expect
  1580 |     .poll(async () => {
  1581 |       const cached = await page.evaluate(
  1582 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1583 |         "gymtrack.v1.user.ios-smoke-client",
  1584 |       );
  1585 |       return cached.coachMessages?.length ?? 0;
  1586 |     })
  1587 |     .toBe(1);
  1588 | });
  1589 | 
  1590 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1591 |   const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  1592 |   await installFixture(page, {
  1593 |     role: "trainee",
  1594 |     broadcastAnnouncementAfterReconnect: {
  1595 |       ...broadcastAnnouncement,
  1596 |       message: refreshedBroadcastText,
  1597 |       created_at: "2026-08-25T09:00:00.000Z",
  1598 |     },
  1599 |   });
  1600 | 
  1601 |   await page.goto("/");
  1602 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1603 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1604 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1605 | 
  1606 |   await page.reload();
  1607 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1608 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1609 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1610 | 
  1611 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1612 |   await expect
  1613 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1614 |     .toBeGreaterThan(0);
  1615 |   await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
```