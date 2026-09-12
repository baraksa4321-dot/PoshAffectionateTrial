# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee nutrition quantities and macro visibility stay consistent
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1382:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/nutrition", waiting until "load"

```

# Test source

```ts
  1285 |   await page.goto("/");
  1286 |   await page.getByTestId("link-nav-coach").click();
  1287 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1288 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1289 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1290 | 
  1291 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1292 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1293 |     timeout: 20_000,
  1294 |   });
  1295 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1296 |   const menu = page.locator("#coach-menu");
  1297 |   await expect(menu).toBeVisible();
  1298 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1299 | 
  1300 |   const addFood = async (searchTerm, unit, quantity) => {
  1301 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1302 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1303 |     await foodSearch.fill(searchTerm);
  1304 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1305 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1306 |     await expect(unitSelect).toBeVisible();
  1307 |     await unitSelect.selectOption(unit);
  1308 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1309 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1310 |   };
  1311 | 
  1312 |   await addFood("יוגורט", "unit", 1);
  1313 |   await addFood("שמן זית", "tbsp", 1);
  1314 |   await addFood("משקה חלב", "cup", 1);
  1315 |   await addFood("גבינה צהובה", "slice", 2);
  1316 |   await addFood("אורז מבושל", "cup", 1);
  1317 | 
  1318 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  1319 |   const expectedMacros = [
  1320 |     ["חלבון", "39.5"],
  1321 |     ["פחמימות", "111.3"],
  1322 |     ["שומן", "32.9"],
  1323 |     ["קלוריות", "931.1"],
  1324 |   ];
  1325 |   for (const [label, value] of expectedMacros) {
  1326 |     await expect(
  1327 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1328 |     ).toHaveText(value);
  1329 |   }
  1330 | 
  1331 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1332 |   await saveMenuButton.click();
  1333 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1334 |   await expect(menu).toContainText("יוגורט טבעי");
  1335 | 
  1336 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1337 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1338 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1339 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1340 |     timeout: 20_000,
  1341 |   });
  1342 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1343 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1344 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1345 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1346 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1347 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1348 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1349 | 
  1350 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1351 |   const traineePage = await page.context().newPage();
  1352 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1353 |   await traineePage.goto("/nutrition");
  1354 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1355 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1356 | 
  1357 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1358 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1359 |   await expect(replacementDialog).toBeVisible();
  1360 |   await replacementDialog
  1361 |     .locator('input[placeholder*="חפשי מאכל חלופי"]')
  1362 |     .fill("יוגורט טבעי");
  1363 |   const yogurtReplacement = replacementDialog
  1364 |     .getByRole("button", { name: /יוגורט טבעי/ })
  1365 |     .filter({ hasText: "כף" })
  1366 |     .first();
  1367 |   await expect(yogurtReplacement).toContainText("כף");
  1368 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1369 |   expect(replacementName).toBeTruthy();
  1370 |   await yogurtReplacement.click();
  1371 |   await expect(replacementDialog).toBeHidden();
  1372 | 
  1373 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1374 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1375 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1376 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1377 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
  1378 |     /\d+(?:\.\d+)? כף/,
  1379 |   );
  1380 | });
  1381 | 
  1382 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1383 |   await installFixture(page, { role: "trainee", showCalories: false });
  1384 | 
> 1385 |   await page.goto("/nutrition");
       |              ^ Error: page.goto: Page crashed
  1386 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1387 |   await expect(plannedFoodQuantity).toBeVisible();
  1388 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1389 | 
  1390 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1391 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1392 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1393 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1394 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1395 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1396 |   }
  1397 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1398 | 
  1399 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1400 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1401 |   await expect(replacementDialog).toBeVisible();
  1402 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1403 |   await expect(replacementQuantity).toBeVisible();
  1404 |   await expect(replacementQuantity).toHaveText(/\d/);
  1405 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1406 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1407 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1408 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1409 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1410 |   }
  1411 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1412 | });
  1413 | 
  1414 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1415 |   page,
  1416 | }) => {
  1417 |   await installFixture(page);
  1418 | 
  1419 |   await page.goto("/");
  1420 |   await page.getByTestId("link-nav-coach").click();
  1421 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1422 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1423 | 
  1424 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1425 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1426 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1427 |     timeout: 20_000,
  1428 |   });
  1429 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1430 | 
  1431 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1432 |   await expect(profile).toBeVisible();
  1433 |   await expect(profile).toContainText("63.4");
  1434 |   await expect(profile).toContainText("74");
  1435 |   await expect(profile).toContainText("8,500");
  1436 |   await expect(profile).toContainText("הליכה מהירה");
  1437 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1438 |   await expect(profile).not.toContainText("71.8");
  1439 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1440 | 
  1441 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1442 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1443 |   await expect(workspace).toHaveCount(0);
  1444 | 
  1445 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1446 |   await expect(clientSearch).toBeVisible();
  1447 |   await clientSearch.fill("מתאמנת אחרת");
  1448 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1449 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1450 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1451 |     timeout: 20_000,
  1452 |   });
  1453 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1454 | 
  1455 |   await expect(profile).toBeVisible();
  1456 |   await expect(profile).toContainText("71.8");
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
```