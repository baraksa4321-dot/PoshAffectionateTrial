# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a received coach message offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1552:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
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
  1469 |   await page.goto("/");
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
> 1557 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
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
  1570 |     .toBeGreaterThan(0);
  1571 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1572 |   await expect
  1573 |     .poll(async () => {
  1574 |       const cached = await page.evaluate(
  1575 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1576 |         "gymtrack.v1.user.ios-smoke-client",
  1577 |       );
  1578 |       return cached.coachMessages?.length ?? 0;
  1579 |     })
  1580 |     .toBe(1);
  1581 | });
  1582 | 
  1583 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1584 |   await installFixture(page, { role: "trainee" });
  1585 | 
  1586 |   await page.goto("/");
  1587 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1588 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1589 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1590 | 
  1591 |   await page.reload();
  1592 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1593 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1594 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1595 | 
  1596 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1597 |   await expect
  1598 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1599 |     .toBeGreaterThan(0);
  1600 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1601 |   await expect
  1602 |     .poll(async () => {
  1603 |       const cached = await page.evaluate(
  1604 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1605 |         "gymtrack.v1.user.ios-smoke-client",
  1606 |       );
  1607 |       return cached.broadcasts?.length ?? 0;
  1608 |     })
  1609 |     .toBe(1);
  1610 | });
  1611 | 
  1612 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1613 |   await installFixture(page, {
  1614 |     online: true,
  1615 |     fullCacheValue: reopenFullCacheValue,
  1616 |     bootCacheValue: reopenBootCacheValue,
  1617 |     pendingChanges: true,
  1618 |     trackBootCacheTiming: true,
  1619 |   });
  1620 | 
  1621 |   await page.goto("/");
  1622 |   const coachNav = page.getByTestId("link-nav-coach");
  1623 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1624 | 
  1625 |   await expect
  1626 |     .poll(() =>
  1627 |       page.evaluate(() => ({
  1628 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1629 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1630 |       })),
  1631 |     )
  1632 |     .toMatchObject({
  1633 |       workspaceMountedAt: expect.any(Number),
  1634 |       fullCacheReadAt: expect.any(Number),
  1635 |     });
  1636 | 
  1637 |   const bootTiming = await page.evaluate(() => ({
  1638 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1639 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1640 |   }));
  1641 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1642 | 
  1643 |   await expect
  1644 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1645 |     .not.toBeNull();
  1646 |   await expect
  1647 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1648 |     .toBeGreaterThan(0);
  1649 | 
  1650 |   const refreshedCache = await page.evaluate(
  1651 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1652 |     `gymtrack.v1.user.${COACH_ID}`,
  1653 |   );
  1654 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1655 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1656 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1657 | });
```