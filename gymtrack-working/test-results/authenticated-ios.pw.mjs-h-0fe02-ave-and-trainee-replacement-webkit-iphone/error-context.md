# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> household portions stay correct across coach save and trainee replacement
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1282:1

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
  1198 |   await expect(supersetSearch).toHaveValue("");
  1199 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1200 |     timeout: 20_000,
  1201 |   });
  1202 | 
  1203 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1204 |   await expect(dayButtons).toHaveCount(4);
  1205 | 
  1206 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1207 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  1208 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1209 |   await foodSearch.fill("אורז");
  1210 |   await assertKeyboardVisible(foodSearch);
  1211 |   await expect(foodSearch).toHaveValue("אורז");
  1212 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1213 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1214 |   await expect(addFoodButton).toBeEnabled();
  1215 |   await addFoodButton.click();
  1216 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1217 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1218 |   await expect(nutritionFoodQuantity).toBeVisible();
  1219 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1220 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1221 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1222 |   for (const [index, label] of coachMacroLabels.entries()) {
  1223 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1224 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1225 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1226 |   }
  1227 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1228 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1229 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1230 | 
  1231 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1232 |   await dayButtons.nth(0).click();
  1233 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1234 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1235 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1236 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1237 | 
  1238 |   await page.goto(`/session/${WORKOUT_ID}`);
  1239 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1240 |   const progress = page.locator(".workout-progress-sticky");
  1241 |   const firstExercise = page.locator("article").first();
  1242 |   const progressBottom = await progress.boundingBox();
  1243 |   const firstExerciseTop = await firstExercise.boundingBox();
  1244 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1245 | 
  1246 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1247 |   await repsInput.fill("123");
  1248 |   await assertKeyboardVisible(repsInput);
  1249 |   await page.keyboard.press("Tab");
  1250 |   await expect(repsInput).toHaveValue("123");
  1251 | 
  1252 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1253 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1254 |   await expect(workoutNote).toBeVisible();
  1255 |   await workoutNote.fill("הערת בדיקה 123");
  1256 |   await assertKeyboardVisible(workoutNote);
  1257 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1258 |   await page.keyboard.press("Escape");
  1259 |   await expect(workoutNote).toBeHidden();
  1260 | 
  1261 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1262 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1263 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1264 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1265 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1266 |   await expect(workoutNote).toBeVisible();
  1267 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1268 |   await page.keyboard.press("Escape");
  1269 |   await expect(workoutNote).toBeHidden();
  1270 | 
  1271 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1272 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1273 |   await expect(detailsSheet).toBeVisible();
  1274 |   await detailsSheet.getByRole("button").first().click();
  1275 |   await expect(detailsSheet).toBeHidden();
  1276 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1277 | 
  1278 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1279 |   await expect(page.locator("article").last()).toBeInViewport();
  1280 | });
  1281 | 
  1282 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1283 |   await installFixture(page, { online: true });
  1284 | 
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
> 1298 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
       |                                                         ^ Error: expect(locator).toBeVisible() failed
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
  1385 |   await page.goto("/nutrition");
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
```