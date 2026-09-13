# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> household portions stay correct across coach save and trainee replacement
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1289:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1192 |   await dropRestInput.fill("45");
  1193 |   await expect(dropRestInput).toHaveValue("45");
  1194 | 
  1195 |   await thirdSetMode.selectOption("superset");
  1196 |   const supersetSearch = page.getByRole("searchbox", {
  1197 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  1198 |   });
  1199 |   await supersetSearch.fill("תרגיל בדיקה 2");
  1200 |   const supersetOption = page
  1201 |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  1202 |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  1203 |   await expect(supersetOption).toBeVisible();
  1204 |   await supersetOption.click({ force: true });
  1205 |   await expect(supersetSearch).toHaveValue("");
  1206 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1207 |     timeout: 20_000,
  1208 |   });
  1209 | 
  1210 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1211 |   await expect(dayButtons).toHaveCount(4);
  1212 | 
  1213 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1214 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  1215 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1216 |   await foodSearch.fill("אורז");
  1217 |   await assertKeyboardVisible(foodSearch);
  1218 |   await expect(foodSearch).toHaveValue("אורז");
  1219 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1220 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1221 |   await expect(addFoodButton).toBeEnabled();
  1222 |   await addFoodButton.click();
  1223 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1224 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1225 |   await expect(nutritionFoodQuantity).toBeVisible();
  1226 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1227 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1228 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1229 |   for (const [index, label] of coachMacroLabels.entries()) {
  1230 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1231 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1232 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1233 |   }
  1234 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1235 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1236 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1237 | 
  1238 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1239 |   await dayButtons.nth(0).click();
  1240 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1241 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1242 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1243 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1244 | 
  1245 |   await page.goto(`/session/${WORKOUT_ID}`);
  1246 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1247 |   const progress = page.locator(".workout-progress-sticky");
  1248 |   const firstExercise = page.locator("article").first();
  1249 |   const progressBottom = await progress.boundingBox();
  1250 |   const firstExerciseTop = await firstExercise.boundingBox();
  1251 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1252 | 
  1253 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1254 |   await repsInput.fill("123");
  1255 |   await assertKeyboardVisible(repsInput);
  1256 |   await page.keyboard.press("Tab");
  1257 |   await expect(repsInput).toHaveValue("123");
  1258 | 
  1259 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1260 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1261 |   await expect(workoutNote).toBeVisible();
  1262 |   await workoutNote.fill("הערת בדיקה 123");
  1263 |   await assertKeyboardVisible(workoutNote);
  1264 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1265 |   await page.keyboard.press("Escape");
  1266 |   await expect(workoutNote).toBeHidden();
  1267 | 
  1268 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1269 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1270 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1271 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1272 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1273 |   await expect(workoutNote).toBeVisible();
  1274 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1275 |   await page.keyboard.press("Escape");
  1276 |   await expect(workoutNote).toBeHidden();
  1277 | 
  1278 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1279 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1280 |   await expect(detailsSheet).toBeVisible();
  1281 |   await detailsSheet.getByRole("button").first().click();
  1282 |   await expect(detailsSheet).toBeHidden();
  1283 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1284 | 
  1285 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1286 |   await expect(page.locator("article").last()).toBeInViewport();
  1287 | });
  1288 | 
  1289 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1290 |   await installFixture(page, { online: true });
  1291 | 
> 1292 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1293 |   await page.getByTestId("link-nav-coach").click();
  1294 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1295 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1296 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1297 | 
  1298 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1299 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1300 |     timeout: 20_000,
  1301 |   });
  1302 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1303 |   const menu = page.locator("#coach-menu");
  1304 |   await expect(menu).toBeVisible();
  1305 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1306 | 
  1307 |   const addFood = async (searchTerm, unit, quantity) => {
  1308 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1309 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1310 |     await foodSearch.fill(searchTerm);
  1311 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1312 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1313 |     await expect(unitSelect).toBeVisible();
  1314 |     await unitSelect.selectOption(unit);
  1315 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1316 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1317 |   };
  1318 | 
  1319 |   await addFood("יוגורט", "unit", 1);
  1320 |   await addFood("שמן זית", "tbsp", 1);
  1321 |   await addFood("משקה חלב", "cup", 1);
  1322 |   await addFood("גבינה צהובה", "slice", 2);
  1323 |   await addFood("אורז מבושל", "cup", 1);
  1324 | 
  1325 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
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
```