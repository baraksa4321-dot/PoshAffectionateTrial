# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> household portions stay correct across coach save and trainee replacement
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1217:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'החלפה', exact: true }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "MY routine — דף הבית" [ref=e5]:
    - /url: /
    - img "MY routine" [ref=e6]
  - heading "העמוד לא נטען" [level=1] [ref=e7]
  - paragraph [ref=e8]: משהו השתבש בטעינת המסך. אפשר לנסות לטעון מחדש בלי לאבד את הנתונים ששמורים במכשיר.
  - generic [ref=e9]:
    - button "טעני מחדש" [ref=e10]
    - link "חזרה לדף הבית" [ref=e11]:
      - /url: /
```

# Test source

```ts
  1192 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1193 |   await page.keyboard.press("Escape");
  1194 |   await expect(workoutNote).toBeHidden();
  1195 | 
  1196 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1197 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1198 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1199 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1200 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1201 |   await expect(workoutNote).toBeVisible();
  1202 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1203 |   await page.keyboard.press("Escape");
  1204 |   await expect(workoutNote).toBeHidden();
  1205 | 
  1206 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1207 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1208 |   await expect(detailsSheet).toBeVisible();
  1209 |   await detailsSheet.getByRole("button").first().click();
  1210 |   await expect(detailsSheet).toBeHidden();
  1211 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1212 | 
  1213 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1214 |   await expect(page.locator("article").last()).toBeInViewport();
  1215 | });
  1216 | 
  1217 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1218 |   await installFixture(page, { online: true });
  1219 | 
  1220 |   await page.goto("/");
  1221 |   await page.getByTestId("link-nav-coach").click();
  1222 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1223 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1224 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1225 | 
  1226 |   const workspace = page.locator('[data-coach-workspace="true"]');
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
> 1292 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
       |                                                                                 ^ Error: locator.click: Test timeout of 45000ms exceeded.
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
  1327 |   await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
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
```