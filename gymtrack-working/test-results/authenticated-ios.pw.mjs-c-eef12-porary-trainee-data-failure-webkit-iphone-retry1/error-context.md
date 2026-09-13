# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile retry recovers after a temporary trainee data failure
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1651:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1554 |         const today = new Date();
  1555 |         const date = [
  1556 |           today.getFullYear(),
  1557 |           String(today.getMonth() + 1).padStart(2, "0"),
  1558 |           String(today.getDate()).padStart(2, "0"),
  1559 |         ].join("-");
  1560 |         const day = cached?.nutritionDays?.find((item) => item.date === date);
  1561 |         return day?.meals?.some((meal) =>
  1562 |           meal.foods?.some((food) => food.sourcePlanFoodId === "ios-smoke-planned-cottage"),
  1563 |         );
  1564 |       }),
  1565 |     )
  1566 |     .toBe(true);
  1567 | 
  1568 |   await page.getByRole("link", { name: "היום שלי", exact: true }).click();
  1569 |   await expect(page).toHaveURL(/\/$/);
  1570 |   await page.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1571 |   await expect(page).toHaveURL(/\/nutrition/);
  1572 | 
  1573 |   const reopenedFood = page.locator(".nutrition-plan-food").first();
  1574 |   const reopenedCheckButton = reopenedFood.getByRole("button").first();
  1575 |   await expect(reopenedCheckButton).toBeVisible();
  1576 |   await expect(reopenedCheckButton).toHaveAttribute("aria-pressed", "true");
  1577 |   await expect(reopenedCheckButton).toHaveAttribute("title", "בטלי סימון");
  1578 |   await expect(reopenedCheckButton).toHaveClass(/bg-primary/);
  1579 |   await expect
  1580 |     .poll(() =>
  1581 |       page.evaluate(() => {
  1582 |         const raw = window.localStorage.getItem("gymtrack.v1.user.ios-smoke-client");
  1583 |         const cached = raw ? JSON.parse(raw) : null;
  1584 |         const today = new Date();
  1585 |         const date = [
  1586 |           today.getFullYear(),
  1587 |           String(today.getMonth() + 1).padStart(2, "0"),
  1588 |           String(today.getDate()).padStart(2, "0"),
  1589 |         ].join("-");
  1590 |         const day = cached?.nutritionDays?.find((item) => item.date === date);
  1591 |         return day?.meals?.some((meal) =>
  1592 |           meal.foods?.some((food) => food.sourcePlanFoodId === "ios-smoke-planned-cottage"),
  1593 |         );
  1594 |       }),
  1595 |     )
  1596 |     .toBe(true);
  1597 | });
  1598 | 
  1599 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1600 |   page,
  1601 | }) => {
  1602 |   await installFixture(page);
  1603 | 
  1604 |   await page.goto("/");
  1605 |   await page.getByTestId("link-nav-coach").click();
  1606 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1607 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1608 | 
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
> 1654 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
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
  1709 |   await page.goto("/");
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
```