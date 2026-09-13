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
  1515 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
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
```