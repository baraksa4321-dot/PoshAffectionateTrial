# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee keeps a checked planned food after reopening nutrition
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1539:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/nutrition", waiting until "load"

```

# Test source

```ts
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
  1480 | test("trainee can check and uncheck a planned food", async ({ page }) => {
  1481 |   await installFixture(page, { role: "trainee", online: false });
  1482 | 
  1483 |   await page.goto("/nutrition");
  1484 |   const plannedFood = page.locator(".nutrition-plan-food").first();
  1485 |   await expect(plannedFood).toBeVisible();
  1486 | 
  1487 |   const checkButton = plannedFood.getByRole("button").first();
  1488 |   await expect(checkButton).toHaveAttribute("aria-pressed", "false");
  1489 |   await expect(checkButton).toHaveAttribute("title", "סמני כנאכל");
  1490 |   await expect(checkButton).toHaveText("");
  1491 | 
  1492 |   await checkButton.click();
  1493 |   await expect(checkButton).toHaveAttribute("aria-pressed", "true");
  1494 |   await expect(checkButton).toHaveAttribute("title", "בטלי סימון");
  1495 |   await expect(checkButton).toHaveClass(/bg-primary/);
  1496 |   await expect
  1497 |     .poll(() =>
  1498 |       page.evaluate(() => {
  1499 |         const raw = window.localStorage.getItem("gymtrack.v1.user.ios-smoke-client");
  1500 |         const cached = raw ? JSON.parse(raw) : null;
  1501 |         const today = new Date();
  1502 |         const date = [
  1503 |           today.getFullYear(),
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
> 1542 |   await page.goto("/nutrition");
       |              ^ Error: page.goto: Page crashed
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
```