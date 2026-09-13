# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile resets measurements, activity, and messages when switching trainees
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1599:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1504 |           String(today.getMonth() + 1).padStart(2, "0"),
  1505 |           String(today.getDate()).padStart(2, "0"),
  1506 |         ].join("-");
  1507 |         const day = cached?.nutritionDays?.find((item) => item.date === date);
  1508 |         return day?.meals?.some((meal) =>
  1509 |           meal.foods?.some((food) => food.sourcePlanFoodId === "ios-smoke-planned-cottage"),
  1510 |         );
  1511 |       }),
  1512 |     )
  1513 |     .toBe(true);
  1514 | 
  1515 |   await checkButton.click();
  1516 |   await expect(checkButton).toHaveAttribute("aria-pressed", "false");
  1517 |   await expect(checkButton).toHaveAttribute("title", "סמני כנאכל");
  1518 |   await expect(checkButton).not.toHaveClass(/bg-primary/);
  1519 |   await expect
  1520 |     .poll(() =>
  1521 |       page.evaluate(() => {
  1522 |         const raw = window.localStorage.getItem("gymtrack.v1.user.ios-smoke-client");
  1523 |         const cached = raw ? JSON.parse(raw) : null;
  1524 |         const today = new Date();
  1525 |         const date = [
  1526 |           today.getFullYear(),
  1527 |           String(today.getMonth() + 1).padStart(2, "0"),
  1528 |           String(today.getDate()).padStart(2, "0"),
  1529 |         ].join("-");
  1530 |         const day = cached?.nutritionDays?.find((item) => item.date === date);
  1531 |         return day?.meals?.some((meal) =>
  1532 |           meal.foods?.some((food) => food.sourcePlanFoodId === "ios-smoke-planned-cottage"),
  1533 |         );
  1534 |       }),
  1535 |     )
  1536 |     .toBe(false);
  1537 | });
  1538 | 
  1539 | test("trainee keeps a checked planned food after reopening nutrition", async ({ page }) => {
  1540 |   await installFixture(page, { role: "trainee", online: false });
  1541 | 
  1542 |   await page.goto("/nutrition");
  1543 |   const plannedFood = page.locator(".nutrition-plan-food").first();
  1544 |   await expect(plannedFood).toBeVisible();
  1545 | 
  1546 |   const checkButton = plannedFood.getByRole("button").first();
  1547 |   await checkButton.click();
  1548 |   await expect(checkButton).toHaveAttribute("aria-pressed", "true");
  1549 |   await expect
  1550 |     .poll(() =>
  1551 |       page.evaluate(() => {
  1552 |         const raw = window.localStorage.getItem("gymtrack.v1.user.ios-smoke-client");
  1553 |         const cached = raw ? JSON.parse(raw) : null;
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
> 1604 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
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
```