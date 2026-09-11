# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee nutrition quantities and macro visibility stay consistent
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1310:1

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Test ended.
Call log:
  - waiting for getByRole('button', { name: 'החלפה', exact: true }).first()

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - link "MY routine — דף הבית" [ref=e6]:
          - /url: /
          - img "MY routine" [ref=e7]
        - button "מעבר לתצוגת לילה" [ref=e8]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - paragraph [ref=e13]: תזונה
          - heading "יומן תזונה" [level=1] [ref=e14]
        - generic [ref=e15]:
          - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=e16]
          - link "ספריית מאכלים" [ref=e22]:
            - /url: /nutrition/foods
  - main [ref=e25]:
    - generic [ref=e26]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e27]:
      - button "יום קודם" [ref=e28] [cursor=pointer]
      - generic [ref=e31]:
        - paragraph [ref=e32]: היום
        - paragraph [ref=e33]: 2026-09-11
      - button "יום הבא" [ref=e34] [cursor=pointer]
    - generic [ref=e37]:
      - button "צילום ארוחה והערכה חכמה זיהוי מאכלים וערכים — תמיד באישור שלך" [ref=e38]:
        - generic [ref=e43]:
          - generic [ref=e44]: צילום ארוחה והערכה חכמה
          - generic [ref=e45]: זיהוי מאכלים וערכים — תמיד באישור שלך
      - button "רשימת קניות" [ref=e46] [cursor=pointer]
    - button "מתכונים רעיונות קלים — לפתיחה לפי הצורך פתיחה" [ref=e52]:
      - generic [ref=e57]:
        - generic [ref=e58]: מתכונים
        - generic [ref=e59]: רעיונות קלים — לפתיחה לפי הצורך
      - generic [ref=e60]: פתיחה
    - generic [ref=e61]:
      - paragraph [ref=e62]: ערכי הקלוריות מוסתרים לפי הגדרת הפרופיל.
      - generic [ref=e63]:
        - generic [ref=e64]:
          - paragraph [ref=e65]: חלבון
          - paragraph [ref=e66]: 0g
        - generic [ref=e67]:
          - paragraph [ref=e68]: פחמימה
          - paragraph [ref=e69]: 0g
        - generic [ref=e70]:
          - paragraph [ref=e71]: שומן
          - paragraph [ref=e72]: 0g
        - generic [ref=e73]:
          - paragraph [ref=e74]: קלוריות
          - paragraph [ref=e75]: 0קל׳
          - paragraph [ref=e76]: יעד 1900קל׳
    - generic [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]:
          - paragraph [ref=e80]: תפריט מהמאמן
          - heading "התפריט שלך" [level=2] [ref=e81]
        - generic [ref=e82]: לצפייה
      - article [ref=e84]:
        - heading "ארוחת בדיקה" [level=3] [ref=e87]
        - generic [ref=e89]:
          - generic [ref=e90]:
            - generic [ref=e91]:
              - paragraph [ref=e92]: ארוחה
              - heading "ארוחת בדיקה" [level=4] [ref=e93]
            - button "בחרי ואכלי" [ref=e95]
          - generic [ref=e99]:
            - generic [ref=e100]: קוטג׳ 5%
            - paragraph [ref=e102]: 2 כף
            - generic [ref=e103]:
              - generic [ref=e104]:
                - generic [ref=e105]: חלבון
                - strong [ref=e106]: 3.3ג׳
              - generic [ref=e107]:
                - generic [ref=e108]: פחמימות
                - strong [ref=e109]: 0.5ג׳
              - generic [ref=e110]:
                - generic [ref=e111]: שומן
                - strong [ref=e112]: 1.5ג׳
            - generic [ref=e113]:
              - button "סימון" [ref=e114]
              - button "החלפת מאכל" [ref=e115]
      - paragraph [ref=e122]: זהו המתווה שהמאמן הכין עבורך. אפשר לתעד את מה שאכלת בפועל באזור היומן למטה.
  - navigation "ניווט ראשי":
    - generic [ref=e123]:
      - link "היום שלי" [ref=e124]:
        - /url: /
      - link "האימונים שלי" [ref=e129]:
        - /url: /workouts
      - link "התזונה שלי" [ref=e136]:
        - /url: /nutrition
```

# Test source

```ts
  1227 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1228 |     timeout: 20_000,
  1229 |   });
  1230 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1231 |   const menu = page.locator("#coach-menu");
  1232 |   await expect(menu).toBeVisible();
  1233 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1234 | 
  1235 |   const addFood = async (searchTerm, unit, quantity) => {
  1236 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1237 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1238 |     await foodSearch.fill(searchTerm);
  1239 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1240 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1241 |     await expect(unitSelect).toBeVisible();
  1242 |     await unitSelect.selectOption(unit);
  1243 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1244 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1245 |   };
  1246 | 
  1247 |   await addFood("יוגורט", "unit", 1);
  1248 |   await addFood("שמן זית", "tbsp", 1);
  1249 |   await addFood("משקה חלב", "cup", 1);
  1250 |   await addFood("גבינה צהובה", "slice", 2);
  1251 |   await addFood("אורז מבושל", "cup", 1);
  1252 | 
  1253 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  1254 |   const expectedMacros = [
  1255 |     ["חלבון", "39.5"],
  1256 |     ["פחמימות", "111.3"],
  1257 |     ["שומן", "32.9"],
  1258 |     ["קלוריות", "931.1"],
  1259 |   ];
  1260 |   for (const [label, value] of expectedMacros) {
  1261 |     await expect(
  1262 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1263 |     ).toHaveText(value);
  1264 |   }
  1265 | 
  1266 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1267 |   await saveMenuButton.click();
  1268 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1269 |   await expect(menu).toContainText("יוגורט טבעי");
  1270 | 
  1271 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1272 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1273 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1274 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1275 |     timeout: 20_000,
  1276 |   });
  1277 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1278 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1279 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1280 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1281 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1282 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1283 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1284 | 
  1285 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1286 |   const traineePage = await page.context().newPage();
  1287 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1288 |   await traineePage.goto("/nutrition");
  1289 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1290 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1291 | 
  1292 |   await traineePage.getByRole("button", { name: "החלפה", exact: true }).first().click();
  1293 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1294 |   await expect(replacementDialog).toBeVisible();
  1295 |   await replacementDialog.locator('input[placeholder*="חפשי מאכל חלופי"]').fill("יוגורט");
  1296 |   const yogurtReplacement = replacementDialog.getByRole("button", { name: /יוגורט/ }).first();
  1297 |   await expect(yogurtReplacement).toContainText("כף");
  1298 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1299 |   expect(replacementName).toBeTruthy();
  1300 |   await yogurtReplacement.click();
  1301 |   await expect(replacementDialog).toBeHidden();
  1302 | 
  1303 |   await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  1304 |   await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  1305 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1306 |   await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  1307 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2.7 כף");
  1308 | });
  1309 | 
  1310 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1311 |   await installFixture(page, { role: "trainee", showCalories: false });
  1312 | 
  1313 |   await page.goto("/nutrition");
  1314 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1315 |   await expect(plannedFoodQuantity).toBeVisible();
  1316 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1317 | 
  1318 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1319 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1320 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1321 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1322 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1323 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1324 |   }
  1325 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1326 | 
> 1327 |   await page.getByRole("button", { name: "החלפה", exact: true }).first().click();
       |                                                                          ^ Error: locator.click: Test ended.
  1328 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1329 |   await expect(replacementDialog).toBeVisible();
  1330 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1331 |   await expect(replacementQuantity).toBeVisible();
  1332 |   await expect(replacementQuantity).toHaveText(/\d/);
  1333 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1334 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1335 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1336 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1337 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1338 |   }
  1339 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1340 | });
  1341 | 
  1342 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1343 |   page,
  1344 | }) => {
  1345 |   await installFixture(page);
  1346 | 
  1347 |   await page.goto("/");
  1348 |   await page.getByTestId("link-nav-coach").click();
  1349 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1350 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1351 | 
  1352 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1353 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1354 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1355 |     timeout: 20_000,
  1356 |   });
  1357 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1358 | 
  1359 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1360 |   await expect(profile).toBeVisible();
  1361 |   await expect(profile).toContainText("63.4");
  1362 |   await expect(profile).toContainText("74");
  1363 |   await expect(profile).toContainText("8,500");
  1364 |   await expect(profile).toContainText("הליכה מהירה");
  1365 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1366 |   await expect(profile).not.toContainText("71.8");
  1367 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1368 | 
  1369 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1370 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1371 |   await expect(workspace).toHaveCount(0);
  1372 | 
  1373 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1374 |   await expect(clientSearch).toBeVisible();
  1375 |   await clientSearch.fill("מתאמנת אחרת");
  1376 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1377 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1378 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1379 |     timeout: 20_000,
  1380 |   });
  1381 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1382 | 
  1383 |   await expect(profile).toBeVisible();
  1384 |   await expect(profile).toContainText("71.8");
  1385 |   await expect(profile).toContainText("88");
  1386 |   await expect(profile).toContainText("1,234");
  1387 |   await expect(profile).toContainText("רכיבה אחרת");
  1388 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1389 |   await expect(profile).not.toContainText("63.4");
  1390 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1391 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1392 | });
  1393 | 
  1394 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1395 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1396 | 
  1397 |   await page.goto("/");
  1398 |   await page.getByTestId("link-nav-coach").click();
  1399 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1400 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1401 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1402 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1403 | 
  1404 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1405 |   const detailsError = page.getByTestId("coach-client-details-error");
  1406 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1407 |     timeout: 20_000,
  1408 |   });
  1409 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1410 |   await expect(detailsError).toBeVisible();
  1411 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1412 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1413 | 
  1414 |   await page.getByTestId("coach-client-details-retry").click();
  1415 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1416 |     timeout: 20_000,
  1417 |   });
  1418 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1419 |   await expect(detailsError).toHaveCount(0);
  1420 | 
  1421 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1422 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1423 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1424 | });
  1425 | 
  1426 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1427 |   await installFixture(page);
```