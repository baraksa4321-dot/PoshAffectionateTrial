# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a broadcast notice offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1649:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
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
  1616 | });
  1617 | 
  1618 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1619 |   page,
  1620 | }) => {
  1621 |   await installFixture(page, { role: "trainee" });
  1622 | 
  1623 |   await page.goto("/");
  1624 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1625 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1626 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1627 | 
  1628 |   await page.reload();
  1629 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1630 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1631 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1632 | 
  1633 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1634 |   await expect
  1635 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1636 |     .toBeGreaterThan(0);
  1637 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1638 |   await expect
  1639 |     .poll(async () => {
  1640 |       const cached = await page.evaluate(
  1641 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1642 |         "gymtrack.v1.user.ios-smoke-client",
  1643 |       );
  1644 |       return cached.coachMessages?.length ?? 0;
  1645 |     })
  1646 |     .toBe(1);
  1647 | });
  1648 | 
  1649 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1650 |   const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  1651 |   await installFixture(page, {
  1652 |     role: "trainee",
  1653 |     broadcastAnnouncementAfterReconnect: {
  1654 |       ...broadcastAnnouncement,
  1655 |       message: refreshedBroadcastText,
  1656 |       created_at: "2026-08-25T09:00:00.000Z",
  1657 |     },
  1658 |   });
  1659 | 
> 1660 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1661 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1662 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1663 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1664 | 
  1665 |   await page.reload();
  1666 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1667 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1668 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1669 | 
  1670 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1671 |   await expect
  1672 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1673 |     .toBeGreaterThan(0);
  1674 |   await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
  1675 |   await expect
  1676 |     .poll(async () => {
  1677 |       const cached = await page.evaluate(
  1678 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1679 |         "gymtrack.v1.user.ios-smoke-client",
  1680 |       );
  1681 |       return cached.broadcasts?.length ?? 0;
  1682 |     })
  1683 |     .toBe(1);
  1684 |   await expect
  1685 |     .poll(async () => {
  1686 |       const cached = await page.evaluate(
  1687 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1688 |         "gymtrack.v1.user.ios-smoke-client",
  1689 |       );
  1690 |       return cached.broadcasts?.[0]?.message ?? null;
  1691 |     })
  1692 |     .toBe(refreshedBroadcastText);
  1693 | });
  1694 | 
  1695 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1696 |   await installFixture(page, {
  1697 |     online: true,
  1698 |     fullCacheValue: reopenFullCacheValue,
  1699 |     bootCacheValue: reopenBootCacheValue,
  1700 |     pendingChanges: true,
  1701 |     trackBootCacheTiming: true,
  1702 |   });
  1703 | 
  1704 |   await page.goto("/");
  1705 |   const coachNav = page.getByTestId("link-nav-coach");
  1706 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1707 | 
  1708 |   await expect
  1709 |     .poll(() =>
  1710 |       page.evaluate(() => ({
  1711 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1712 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1713 |       })),
  1714 |     )
  1715 |     .toMatchObject({
  1716 |       workspaceMountedAt: expect.any(Number),
  1717 |       fullCacheReadAt: expect.any(Number),
  1718 |     });
  1719 | 
  1720 |   const bootTiming = await page.evaluate(() => ({
  1721 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1722 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1723 |   }));
  1724 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1725 | 
  1726 |   await expect
  1727 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1728 |     .not.toBeNull();
  1729 |   await expect
  1730 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1731 |     .toBeGreaterThan(0);
  1732 | 
  1733 |   const refreshedCache = await page.evaluate(
  1734 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1735 |     `gymtrack.v1.user.${COACH_ID}`,
  1736 |   );
  1737 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1738 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1739 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1740 | });
  1741 | 
  1742 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1743 |   await installFixture(page);
  1744 | 
  1745 |   await page.goto(`/session/${WORKOUT_ID}`);
  1746 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1747 | 
  1748 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1749 |   await repsInput.fill("123");
  1750 |   await page.keyboard.press("Tab");
  1751 |   await expect(repsInput).toHaveValue("123");
  1752 | 
  1753 |   // Completion feedback belongs to the active workout draft and should follow
  1754 |   // the workout when the coach navigates away before saving.
  1755 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1756 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1757 |   await expect(workoutNote).toBeVisible();
  1758 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1759 |   await assertKeyboardVisible(workoutNote);
  1760 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
```