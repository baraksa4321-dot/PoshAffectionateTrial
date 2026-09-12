# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> household portions stay correct across coach save and trainee replacement
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1229:1

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByRole('dialog', { name: 'החלפת מאכל' })
Expected: hidden
Received: visible
Timeout:  8000ms

Call log:
  - Expect "toBeHidden" with timeout 8000ms
  - waiting for getByRole('dialog', { name: 'החלפת מאכל' })
    20 × locator resolved to <div role="dialog" aria-modal="true" aria-label="החלפת מאכל" data-overlay-root="true" data-overlay-variant="bottom" data-tsd-source="/src/components/ui-app/Overlay.tsx:241:5" class="overlay-root fixed inset-0 z-[100] flex touch-pan-y overflow-x-hidden items-end justify-center bg-foreground/40 p-4 fade-in">…</div>
       - unexpected value "visible"

```

```yaml
- dialog "החלפת מאכל":
  - paragraph: החלפה
  - heading "קוטג׳ 5%" [level=2]
  - paragraph: תקציב ההחלפה:29 קלוריות
  - button "סגור"
  - paragraph: הערכים והכמות להחלפה
  - paragraph: "כמות יעד: 2 כף"
  - text: חלבון
  - strong: 3.3ג׳
  - text: פחמימות
  - strong: 0.5ג׳
  - text: שומן
  - strong: 1.5ג׳
  - text: קלוריות
  - strong: 28.5קל׳
  - 'textbox "חפשי מאכל חלופי (למשל: תפוח אדמה)..."': יוגורט טבעי
  - button "יוגורט טבעי 0% 3 כף כמות לפי הערכים של המאכל המקורי חלבון 5.1ג׳ פחמימות 2ג׳ שומן 0ג׳ קלוריות 29קל׳"
  - button "יוגורט טבעי 3% 3 כף כמות לפי הערכים של המאכל המקורי חלבון 1.6ג׳ פחמימות 1.8ג׳ שומן 1.2ג׳ קלוריות 29קל׳"
  - button "יופלה GO יוגורט חלבון טבעי 20g 2.7 כף כמות לפי הערכים של המאכל המקורי חלבון 4ג׳ פחמימות 1.4ג׳ שומן 0.8ג׳ קלוריות 29קל׳"
  - button "יופלה PRO יוגורט חלבון טבעי 15g 3 כף כמות לפי הערכים של המאכל המקורי חלבון 3.9ג׳ פחמימות 2.9ג׳ שומן 0.1ג׳ קלוריות 29קל׳"
  - button "סקיר טבעי 3 כף כמות לפי הערכים של המאכל המקורי חלבון 5.1ג׳ פחמימות 2.2ג׳ שומן 0.1ג׳ קלוריות 29קל׳"
```

# Test source

```ts
  1218 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1219 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1220 |   await expect(detailsSheet).toBeVisible();
  1221 |   await detailsSheet.getByRole("button").first().click();
  1222 |   await expect(detailsSheet).toBeHidden();
  1223 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1224 | 
  1225 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1226 |   await expect(page.locator("article").last()).toBeInViewport();
  1227 | });
  1228 | 
  1229 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1230 |   await installFixture(page, { online: true });
  1231 | 
  1232 |   await page.goto("/");
  1233 |   await page.getByTestId("link-nav-coach").click();
  1234 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1235 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1236 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1237 | 
  1238 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1239 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1240 |     timeout: 20_000,
  1241 |   });
  1242 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1243 |   const menu = page.locator("#coach-menu");
  1244 |   await expect(menu).toBeVisible();
  1245 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1246 | 
  1247 |   const addFood = async (searchTerm, unit, quantity) => {
  1248 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1249 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1250 |     await foodSearch.fill(searchTerm);
  1251 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1252 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1253 |     await expect(unitSelect).toBeVisible();
  1254 |     await unitSelect.selectOption(unit);
  1255 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1256 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1257 |   };
  1258 | 
  1259 |   await addFood("יוגורט", "unit", 1);
  1260 |   await addFood("שמן זית", "tbsp", 1);
  1261 |   await addFood("משקה חלב", "cup", 1);
  1262 |   await addFood("גבינה צהובה", "slice", 2);
  1263 |   await addFood("אורז מבושל", "cup", 1);
  1264 | 
  1265 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  1266 |   const expectedMacros = [
  1267 |     ["חלבון", "39.5"],
  1268 |     ["פחמימות", "111.3"],
  1269 |     ["שומן", "32.9"],
  1270 |     ["קלוריות", "931.1"],
  1271 |   ];
  1272 |   for (const [label, value] of expectedMacros) {
  1273 |     await expect(
  1274 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1275 |     ).toHaveText(value);
  1276 |   }
  1277 | 
  1278 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1279 |   await saveMenuButton.click();
  1280 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1281 |   await expect(menu).toContainText("יוגורט טבעי");
  1282 | 
  1283 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1284 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1285 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1286 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1287 |     timeout: 20_000,
  1288 |   });
  1289 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1290 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1291 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1292 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1293 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1294 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1295 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1296 | 
  1297 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1298 |   const traineePage = await page.context().newPage();
  1299 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1300 |   await traineePage.goto("/nutrition");
  1301 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1302 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1303 | 
  1304 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1305 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1306 |   await expect(replacementDialog).toBeVisible();
  1307 |   await replacementDialog
  1308 |     .locator('input[placeholder*="חפשי מאכל חלופי"]')
  1309 |     .fill("יוגורט טבעי");
  1310 |   const yogurtReplacement = replacementDialog
  1311 |     .getByRole("button", { name: /יוגורט טבעי/ })
  1312 |     .filter({ hasText: "כף" })
  1313 |     .first();
  1314 |   await expect(yogurtReplacement).toContainText("כף");
  1315 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1316 |   expect(replacementName).toBeTruthy();
  1317 |   await yogurtReplacement.click();
> 1318 |   await expect(replacementDialog).toBeHidden();
       |                                   ^ Error: expect(locator).toBeHidden() failed
  1319 | 
  1320 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1321 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1322 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1323 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1324 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
  1325 |     /\d+(?:\.\d+)? כף/,
  1326 |   );
  1327 | });
  1328 | 
  1329 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1330 |   await installFixture(page, { role: "trainee", showCalories: false });
  1331 | 
  1332 |   await page.goto("/nutrition");
  1333 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1334 |   await expect(plannedFoodQuantity).toBeVisible();
  1335 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1336 | 
  1337 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1338 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1339 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1340 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1341 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1342 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1343 |   }
  1344 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1345 | 
  1346 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1347 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1348 |   await expect(replacementDialog).toBeVisible();
  1349 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1350 |   await expect(replacementQuantity).toBeVisible();
  1351 |   await expect(replacementQuantity).toHaveText(/\d/);
  1352 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1353 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1354 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1355 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1356 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1357 |   }
  1358 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1359 | });
  1360 | 
  1361 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1362 |   page,
  1363 | }) => {
  1364 |   await installFixture(page);
  1365 | 
  1366 |   await page.goto("/");
  1367 |   await page.getByTestId("link-nav-coach").click();
  1368 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1369 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1370 | 
  1371 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1372 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1373 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1374 |     timeout: 20_000,
  1375 |   });
  1376 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1377 | 
  1378 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1379 |   await expect(profile).toBeVisible();
  1380 |   await expect(profile).toContainText("63.4");
  1381 |   await expect(profile).toContainText("74");
  1382 |   await expect(profile).toContainText("8,500");
  1383 |   await expect(profile).toContainText("הליכה מהירה");
  1384 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1385 |   await expect(profile).not.toContainText("71.8");
  1386 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1387 | 
  1388 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1389 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1390 |   await expect(workspace).toHaveCount(0);
  1391 | 
  1392 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1393 |   await expect(clientSearch).toBeVisible();
  1394 |   await clientSearch.fill("מתאמנת אחרת");
  1395 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1396 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1397 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1398 |     timeout: 20_000,
  1399 |   });
  1400 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1401 | 
  1402 |   await expect(profile).toBeVisible();
  1403 |   await expect(profile).toContainText("71.8");
  1404 |   await expect(profile).toContainText("88");
  1405 |   await expect(profile).toContainText("1,234");
  1406 |   await expect(profile).toContainText("רכיבה אחרת");
  1407 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1408 |   await expect(profile).not.toContainText("63.4");
  1409 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1410 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1411 | });
  1412 | 
  1413 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1414 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1415 | 
  1416 |   await page.goto("/");
  1417 |   await page.getByTestId("link-nav-coach").click();
  1418 |   await expect(page).toHaveURL(/\/coach\/clients/);
```