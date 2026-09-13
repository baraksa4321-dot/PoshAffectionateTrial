# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee sees the message sent from the coach profile after reconnecting
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1704:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1609 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1610 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1611 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1612 |     timeout: 20_000,
  1613 |   });
  1614 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1615 | 
  1616 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1617 |   await expect(profile).toBeVisible();
  1618 |   await expect(profile).toContainText("63.4");
  1619 |   await expect(profile).toContainText("74");
  1620 |   await expect(profile).toContainText("8,500");
  1621 |   await expect(profile).toContainText("הליכה מהירה");
  1622 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1623 |   await expect(profile).not.toContainText("71.8");
  1624 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1625 | 
  1626 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1627 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1628 |   await expect(workspace).toHaveCount(0);
  1629 | 
  1630 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1631 |   await expect(clientSearch).toBeVisible();
  1632 |   await clientSearch.fill("מתאמנת אחרת");
  1633 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1634 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1635 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1636 |     timeout: 20_000,
  1637 |   });
  1638 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1639 | 
  1640 |   await expect(profile).toBeVisible();
  1641 |   await expect(profile).toContainText("71.8");
  1642 |   await expect(profile).toContainText("88");
  1643 |   await expect(profile).toContainText("1,234");
  1644 |   await expect(profile).toContainText("רכיבה אחרת");
  1645 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1646 |   await expect(profile).not.toContainText("63.4");
  1647 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1648 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1649 | });
  1650 | 
  1651 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1652 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1653 | 
  1654 |   await page.goto("/");
  1655 |   await page.getByTestId("link-nav-coach").click();
  1656 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1657 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1658 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1659 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1660 | 
  1661 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1662 |   const detailsError = page.getByTestId("coach-client-details-error");
  1663 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1664 |     timeout: 20_000,
  1665 |   });
  1666 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1667 |   await expect(detailsError).toBeVisible();
  1668 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1669 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1670 | 
  1671 |   await page.getByTestId("coach-client-details-retry").click();
  1672 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1673 |     timeout: 20_000,
  1674 |   });
  1675 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1676 |   await expect(detailsError).toHaveCount(0);
  1677 | 
  1678 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1679 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1680 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1681 | });
  1682 | 
  1683 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1684 |   await installFixture(page);
  1685 | 
  1686 |   const routes = [
  1687 |     { path: "/workouts", marker: "האימונים שלי" },
  1688 |     { path: "/programs", marker: "התוכניות שלך" },
  1689 |     { path: "/exercises", marker: "תרגילים" },
  1690 |     { path: "/nutrition", marker: "יומן תזונה" },
  1691 |   ];
  1692 | 
  1693 |   await page.goto("/coach/clients");
  1694 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1695 | 
  1696 |   for (const route of routes) {
  1697 |     await page.goto(route.path);
  1698 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1699 |       timeout: 20_000,
  1700 |     });
  1701 |   }
  1702 | });
  1703 | 
  1704 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1705 |   page,
  1706 | }) => {
  1707 |   await installFixture(page);
  1708 | 
> 1709 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1710 |   await page.getByTestId("link-nav-coach").click();
  1711 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1712 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1713 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1714 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1715 | 
  1716 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1717 |   await expect(profileMessage).toBeVisible();
  1718 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1719 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1720 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1721 |   await expect
  1722 |     .poll(async () =>
  1723 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1724 |     )
  1725 |     .toContain(profileMessageText);
  1726 | 
  1727 |   const traineePage = await page.context().newPage();
  1728 |   await installFixture(traineePage, { role: "trainee" });
  1729 |   await traineePage.goto("/");
  1730 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1731 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1732 | 
  1733 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1734 |   await expect(traineeMessage).toContainText(profileMessageText);
  1735 | });
  1736 | 
  1737 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1738 |   page,
  1739 | }) => {
  1740 |   await installFixture(page, { role: "trainee" });
  1741 | 
  1742 |   await page.goto("/");
  1743 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1744 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1745 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1746 | 
  1747 |   await page.reload();
  1748 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1749 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1750 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1751 | 
  1752 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1753 |   await expect
  1754 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1755 |     .toBeGreaterThan(0);
  1756 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1757 |   await expect
  1758 |     .poll(async () => {
  1759 |       const cached = await page.evaluate(
  1760 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1761 |         "gymtrack.v1.user.ios-smoke-client",
  1762 |       );
  1763 |       return cached.coachMessages?.length ?? 0;
  1764 |     })
  1765 |     .toBe(1);
  1766 | });
  1767 | 
  1768 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1769 |   const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  1770 |   await installFixture(page, {
  1771 |     role: "trainee",
  1772 |     broadcastAnnouncementAfterReconnect: {
  1773 |       ...broadcastAnnouncement,
  1774 |       message: refreshedBroadcastText,
  1775 |       created_at: "2026-08-25T09:00:00.000Z",
  1776 |     },
  1777 |   });
  1778 | 
  1779 |   await page.goto("/");
  1780 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1781 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1782 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1783 | 
  1784 |   await page.reload();
  1785 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1786 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1787 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1788 | 
  1789 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1790 |   await expect
  1791 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1792 |     .toBeGreaterThan(0);
  1793 |   await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
  1794 |   await expect
  1795 |     .poll(async () => {
  1796 |       const cached = await page.evaluate(
  1797 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1798 |         "gymtrack.v1.user.ios-smoke-client",
  1799 |       );
  1800 |       return cached.broadcasts?.length ?? 0;
  1801 |     })
  1802 |     .toBe(1);
  1803 |   await expect
  1804 |     .poll(async () => {
  1805 |       const cached = await page.evaluate(
  1806 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1807 |         "gymtrack.v1.user.ios-smoke-client",
  1808 |       );
  1809 |       return cached.broadcasts?.[0]?.message ?? null;
```