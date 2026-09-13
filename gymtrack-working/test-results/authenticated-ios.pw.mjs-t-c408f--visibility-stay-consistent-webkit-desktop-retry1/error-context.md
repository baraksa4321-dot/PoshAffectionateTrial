# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee nutrition quantities and macro visibility stay consistent
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1448:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/nutrition", waiting until "load"

```

# Test source

```ts
  1351 |   await page.goto("/");
  1352 |   await page.getByTestId("link-nav-coach").click();
  1353 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1354 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1355 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1356 | 
  1357 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1358 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1359 |     timeout: 20_000,
  1360 |   });
  1361 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1362 |   const menu = page.locator("#coach-menu");
  1363 |   await expect(menu).toBeVisible();
  1364 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1365 | 
  1366 |   const addFood = async (searchTerm, unit, quantity) => {
  1367 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1368 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1369 |     await foodSearch.fill(searchTerm);
  1370 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1371 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1372 |     await expect(unitSelect).toBeVisible();
  1373 |     await unitSelect.selectOption(unit);
  1374 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1375 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1376 |   };
  1377 | 
  1378 |   await addFood("יוגורט", "unit", 1);
  1379 |   await addFood("שמן זית", "tbsp", 1);
  1380 |   await addFood("משקה חלב", "cup", 1);
  1381 |   await addFood("גבינה צהובה", "slice", 2);
  1382 |   await addFood("אורז מבושל", "cup", 1);
  1383 | 
  1384 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  1385 |   const expectedMacros = [
  1386 |     ["חלבון", "39.5"],
  1387 |     ["פחמימות", "111.3"],
  1388 |     ["שומן", "32.9"],
  1389 |     ["קלוריות", "931.1"],
  1390 |   ];
  1391 |   for (const [label, value] of expectedMacros) {
  1392 |     await expect(
  1393 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1394 |     ).toHaveText(value);
  1395 |   }
  1396 | 
  1397 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1398 |   await saveMenuButton.click();
  1399 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1400 |   await expect(menu).toContainText("יוגורט טבעי");
  1401 | 
  1402 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1403 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1404 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1405 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1406 |     timeout: 20_000,
  1407 |   });
  1408 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1409 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1410 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1411 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1412 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1413 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1414 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
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
> 1451 |   await page.goto("/nutrition");
       |              ^ Error: page.goto: Page crashed
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
```