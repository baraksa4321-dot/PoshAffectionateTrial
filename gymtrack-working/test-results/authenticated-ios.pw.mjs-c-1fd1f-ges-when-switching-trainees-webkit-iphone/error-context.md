# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile resets measurements, activity, and messages when switching trainees
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1421:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1326 |   const expectedMacros = [
  1327 |     ["חלבון", "39.5"],
  1328 |     ["פחמימות", "111.3"],
  1329 |     ["שומן", "32.9"],
  1330 |     ["קלוריות", "931.1"],
  1331 |   ];
  1332 |   for (const [label, value] of expectedMacros) {
  1333 |     await expect(
  1334 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1335 |     ).toHaveText(value);
  1336 |   }
  1337 | 
  1338 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1339 |   await saveMenuButton.click();
  1340 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1341 |   await expect(menu).toContainText("יוגורט טבעי");
  1342 | 
  1343 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1344 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1345 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1346 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1347 |     timeout: 20_000,
  1348 |   });
  1349 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1350 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1351 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1352 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1353 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1354 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1355 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1356 | 
  1357 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1358 |   const traineePage = await page.context().newPage();
  1359 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1360 |   await traineePage.goto("/nutrition");
  1361 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1362 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1363 | 
  1364 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1365 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1366 |   await expect(replacementDialog).toBeVisible();
  1367 |   await replacementDialog
  1368 |     .locator('input[placeholder*="חפשי מאכל חלופי"]')
  1369 |     .fill("יוגורט טבעי");
  1370 |   const yogurtReplacement = replacementDialog
  1371 |     .getByRole("button", { name: /יוגורט טבעי/ })
  1372 |     .filter({ hasText: "כף" })
  1373 |     .first();
  1374 |   await expect(yogurtReplacement).toContainText("כף");
  1375 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1376 |   expect(replacementName).toBeTruthy();
  1377 |   await yogurtReplacement.click();
  1378 |   await expect(replacementDialog).toBeHidden();
  1379 | 
  1380 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1381 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1382 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1383 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1384 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
  1385 |     /\d+(?:\.\d+)? כף/,
  1386 |   );
  1387 | });
  1388 | 
  1389 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1390 |   await installFixture(page, { role: "trainee", showCalories: false });
  1391 | 
  1392 |   await page.goto("/nutrition");
  1393 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1394 |   await expect(plannedFoodQuantity).toBeVisible();
  1395 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1396 | 
  1397 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1398 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1399 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1400 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1401 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1402 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1403 |   }
  1404 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1405 | 
  1406 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1407 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1408 |   await expect(replacementDialog).toBeVisible();
  1409 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1410 |   await expect(replacementQuantity).toBeVisible();
  1411 |   await expect(replacementQuantity).toHaveText(/\d/);
  1412 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1413 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1414 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1415 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1416 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1417 |   }
  1418 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1419 | });
  1420 | 
  1421 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1422 |   page,
  1423 | }) => {
  1424 |   await installFixture(page);
  1425 | 
> 1426 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1427 |   await page.getByTestId("link-nav-coach").click();
  1428 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1429 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1430 | 
  1431 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1432 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1433 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1434 |     timeout: 20_000,
  1435 |   });
  1436 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1437 | 
  1438 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1439 |   await expect(profile).toBeVisible();
  1440 |   await expect(profile).toContainText("63.4");
  1441 |   await expect(profile).toContainText("74");
  1442 |   await expect(profile).toContainText("8,500");
  1443 |   await expect(profile).toContainText("הליכה מהירה");
  1444 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1445 |   await expect(profile).not.toContainText("71.8");
  1446 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1447 | 
  1448 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1449 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1450 |   await expect(workspace).toHaveCount(0);
  1451 | 
  1452 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1453 |   await expect(clientSearch).toBeVisible();
  1454 |   await clientSearch.fill("מתאמנת אחרת");
  1455 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1456 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1457 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1458 |     timeout: 20_000,
  1459 |   });
  1460 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1461 | 
  1462 |   await expect(profile).toBeVisible();
  1463 |   await expect(profile).toContainText("71.8");
  1464 |   await expect(profile).toContainText("88");
  1465 |   await expect(profile).toContainText("1,234");
  1466 |   await expect(profile).toContainText("רכיבה אחרת");
  1467 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1468 |   await expect(profile).not.toContainText("63.4");
  1469 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1470 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1471 | });
  1472 | 
  1473 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1474 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1475 | 
  1476 |   await page.goto("/");
  1477 |   await page.getByTestId("link-nav-coach").click();
  1478 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1479 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1480 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1481 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1482 | 
  1483 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1484 |   const detailsError = page.getByTestId("coach-client-details-error");
  1485 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1486 |     timeout: 20_000,
  1487 |   });
  1488 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1489 |   await expect(detailsError).toBeVisible();
  1490 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1491 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1492 | 
  1493 |   await page.getByTestId("coach-client-details-retry").click();
  1494 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1495 |     timeout: 20_000,
  1496 |   });
  1497 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1498 |   await expect(detailsError).toHaveCount(0);
  1499 | 
  1500 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
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
```