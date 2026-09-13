# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a broadcast notice offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1590:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
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
  1515 |   await page.goto("/coach/clients");
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
> 1601 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
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
  1616 |   await expect
  1617 |     .poll(async () => {
  1618 |       const cached = await page.evaluate(
  1619 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1620 |         "gymtrack.v1.user.ios-smoke-client",
  1621 |       );
  1622 |       return cached.broadcasts?.length ?? 0;
  1623 |     })
  1624 |     .toBe(1);
  1625 |   await expect
  1626 |     .poll(async () => {
  1627 |       const cached = await page.evaluate(
  1628 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1629 |         "gymtrack.v1.user.ios-smoke-client",
  1630 |       );
  1631 |       return cached.broadcasts?.[0]?.message ?? null;
  1632 |     })
  1633 |     .toBe(refreshedBroadcastText);
  1634 | });
  1635 | 
  1636 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1637 |   await installFixture(page, {
  1638 |     online: true,
  1639 |     fullCacheValue: reopenFullCacheValue,
  1640 |     bootCacheValue: reopenBootCacheValue,
  1641 |     pendingChanges: true,
  1642 |     trackBootCacheTiming: true,
  1643 |   });
  1644 | 
  1645 |   await page.goto("/");
  1646 |   const coachNav = page.getByTestId("link-nav-coach");
  1647 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1648 | 
  1649 |   await expect
  1650 |     .poll(() =>
  1651 |       page.evaluate(() => ({
  1652 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1653 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1654 |       })),
  1655 |     )
  1656 |     .toMatchObject({
  1657 |       workspaceMountedAt: expect.any(Number),
  1658 |       fullCacheReadAt: expect.any(Number),
  1659 |     });
  1660 | 
  1661 |   const bootTiming = await page.evaluate(() => ({
  1662 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1663 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1664 |   }));
  1665 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1666 | 
  1667 |   await expect
  1668 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1669 |     .not.toBeNull();
  1670 |   await expect
  1671 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1672 |     .toBeGreaterThan(0);
  1673 | 
  1674 |   const refreshedCache = await page.evaluate(
  1675 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1676 |     `gymtrack.v1.user.${COACH_ID}`,
  1677 |   );
  1678 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1679 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1680 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1681 | });
  1682 | 
  1683 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1684 |   await installFixture(page);
  1685 | 
  1686 |   await page.goto(`/session/${WORKOUT_ID}`);
  1687 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1688 | 
  1689 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1690 |   await repsInput.fill("123");
  1691 |   await page.keyboard.press("Tab");
  1692 |   await expect(repsInput).toHaveValue("123");
  1693 | 
  1694 |   // Completion feedback belongs to the active workout draft and should follow
  1695 |   // the workout when the coach navigates away before saving.
  1696 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1697 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1698 |   await expect(workoutNote).toBeVisible();
  1699 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1700 |   await assertKeyboardVisible(workoutNote);
  1701 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
```