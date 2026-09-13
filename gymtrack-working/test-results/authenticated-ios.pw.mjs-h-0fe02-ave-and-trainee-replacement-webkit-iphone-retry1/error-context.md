# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> household portions stay correct across coach save and trainee replacement
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1348:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#coach-menu').getByText('2 כף', { exact: true })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('#coach-menu').getByText('2 כף', { exact: true })

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
  - button "נמצאה התנגשות — נדרשת בחירה לפני סנכרון"
- main:
  - text: נמצאה התנגשות — נדרשת בחירה לפני סנכרון
  - heading "מתאמנת בדיקה" [level=3]
  - button "פתיחת פרופיל המשתמש": פרופיל
  - button "סגירת תכנית המתאמן"
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים"
    - tab "תפריט תזונה" [selected]
  - heading "בניית תפריט למתאמן" [level=4]
  - paragraph: התפריט נשמר כתבנית קבועה ונפרד מהיומן בפועל. תאריך הבדיקה מציג רק את מה שנרשם בפועל.
  - textbox "תאריך להצגת רישום בפועל": 2026-08-26
  - text: חלבון 3.3 ג׳ פחמימות 0.5 ג׳ שומן 1.5 ג׳ קלוריות 28.5 קל׳
  - button "פתח ארוחת בדיקה"
  - textbox "שם הארוחה": ארוחת בדיקה
  - button "+ ארוחה אחרת"
  - button "מחק ארוחת בדיקה"
  - button "+ מאכל"
  - button "פתח את ארוחת בדיקה": קוטג׳ 5% 1 מאכלים
  - button "+ הוסיפי ארוחה"
  - heading "יעד קלורי ותזונה למתאמן" [level=3]
  - button "ערוך יעדים"
  - button "הצגת קלוריות למתאמן מוצג במסכי התזונה והמאזן" [pressed]
  - button "מחשבון BMR"
  - text: קלוריות 1900 kcal ימי מעקב 1 ימים
- navigation "ניווט ראשי":
  - link:
    - /url: /coach
  - link "מתאמנים":
    - /url: /coach/clients
  - link "מעקב":
    - /url: /coach/tracking
  - link "תרגילים":
    - /url: /exercises
```

# Test source

```ts
  1264 |   await expect(supersetSearch).toHaveValue("");
  1265 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1266 |     timeout: 20_000,
  1267 |   });
  1268 | 
  1269 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1270 |   await expect(dayButtons).toHaveCount(4);
  1271 | 
  1272 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1273 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  1274 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1275 |   await foodSearch.fill("אורז");
  1276 |   await assertKeyboardVisible(foodSearch);
  1277 |   await expect(foodSearch).toHaveValue("אורז");
  1278 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1279 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1280 |   await expect(addFoodButton).toBeEnabled();
  1281 |   await addFoodButton.click();
  1282 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1283 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1284 |   await expect(nutritionFoodQuantity).toBeVisible();
  1285 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1286 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1287 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1288 |   for (const [index, label] of coachMacroLabels.entries()) {
  1289 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1290 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1291 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1292 |   }
  1293 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1294 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1295 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1296 | 
  1297 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1298 |   await dayButtons.nth(0).click();
  1299 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1300 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1301 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1302 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1303 | 
  1304 |   await page.goto(`/session/${WORKOUT_ID}`);
  1305 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1306 |   const progress = page.locator(".workout-progress-sticky");
  1307 |   const firstExercise = page.locator("article").first();
  1308 |   const progressBottom = await progress.boundingBox();
  1309 |   const firstExerciseTop = await firstExercise.boundingBox();
  1310 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1311 | 
  1312 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1313 |   await repsInput.fill("123");
  1314 |   await assertKeyboardVisible(repsInput);
  1315 |   await page.keyboard.press("Tab");
  1316 |   await expect(repsInput).toHaveValue("123");
  1317 | 
  1318 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1319 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1320 |   await expect(workoutNote).toBeVisible();
  1321 |   await workoutNote.fill("הערת בדיקה 123");
  1322 |   await assertKeyboardVisible(workoutNote);
  1323 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1324 |   await page.keyboard.press("Escape");
  1325 |   await expect(workoutNote).toBeHidden();
  1326 | 
  1327 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1328 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1329 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1330 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1331 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1332 |   await expect(workoutNote).toBeVisible();
  1333 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1334 |   await page.keyboard.press("Escape");
  1335 |   await expect(workoutNote).toBeHidden();
  1336 | 
  1337 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1338 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1339 |   await expect(detailsSheet).toBeVisible();
  1340 |   await detailsSheet.getByRole("button").first().click();
  1341 |   await expect(detailsSheet).toBeHidden();
  1342 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1343 | 
  1344 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1345 |   await expect(page.locator("article").last()).toBeInViewport();
  1346 | });
  1347 | 
  1348 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1349 |   await installFixture(page, { online: true });
  1350 | 
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
> 1364 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
       |                                                         ^ Error: expect(locator).toBeVisible() failed
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
```