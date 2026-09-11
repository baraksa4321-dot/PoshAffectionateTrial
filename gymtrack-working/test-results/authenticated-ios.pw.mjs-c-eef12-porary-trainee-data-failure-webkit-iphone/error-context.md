# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> coach profile retry recovers after a temporary trainee data failure
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1203:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('coach-client-details-error')
Expected substring: "temporary selected trainee data failure"
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for getByTestId('coach-client-details-error')

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
  - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - heading "מתאמנת בדיקה" [level=3]
  - button "פתיחת פרופיל המשתמש": פרופיל
  - button "סגירת תכנית המתאמן"
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים" [selected]
    - tab "תפריט תזונה"
  - textbox "שם תוכנית חדשה"
  - button "צור"
  - textbox "שם תוכנית האימון": תוכנית בדיקה לאייפון
  - text: 4 ימי אימון · 8 תרגילים
  - button "סגירה"
  - button "מחק את התוכנית תוכנית בדיקה לאייפון": מחק
  - button "פתיחת אתגרים": אתגרים
  - 'textbox "שם יום אימון (למשל: A - פלג גוף עליון)..."'
  - button "+ יום"
  - button "בניית אימון אימון בדיקה ארוך": אימון בדיקה ארוך 8 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 2": אימון בדיקה 2 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 3": אימון בדיקה 3 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 4": אימון בדיקה 4 0 תרגילים בניית אימון
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
  1120 |   await installFixture(page, { role: "trainee", showCalories: false });
  1121 | 
  1122 |   await page.goto("/nutrition");
  1123 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1124 |   await expect(plannedFoodQuantity).toBeVisible();
  1125 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1126 | 
  1127 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1128 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1129 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1130 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1131 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1132 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1133 |   }
  1134 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1135 | 
  1136 |   await page.getByRole("button", { name: "החלפה", exact: true }).first().click();
  1137 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1138 |   await expect(replacementDialog).toBeVisible();
  1139 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1140 |   await expect(replacementQuantity).toBeVisible();
  1141 |   await expect(replacementQuantity).toHaveText(/\d/);
  1142 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1143 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1144 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1145 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1146 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1147 |   }
  1148 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1149 | });
  1150 | 
  1151 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1152 |   page,
  1153 | }) => {
  1154 |   await installFixture(page);
  1155 | 
  1156 |   await page.goto("/");
  1157 |   await page.getByTestId("link-nav-coach").click();
  1158 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1159 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1160 | 
  1161 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1162 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1163 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1164 |     timeout: 20_000,
  1165 |   });
  1166 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1167 | 
  1168 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1169 |   await expect(profile).toBeVisible();
  1170 |   await expect(profile).toContainText("63.4");
  1171 |   await expect(profile).toContainText("74");
  1172 |   await expect(profile).toContainText("8,500");
  1173 |   await expect(profile).toContainText("הליכה מהירה");
  1174 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1175 |   await expect(profile).not.toContainText("71.8");
  1176 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1177 | 
  1178 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1179 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1180 |   await expect(workspace).toHaveCount(0);
  1181 | 
  1182 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1183 |   await expect(clientSearch).toBeVisible();
  1184 |   await clientSearch.fill("מתאמנת אחרת");
  1185 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1186 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1187 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1188 |     timeout: 20_000,
  1189 |   });
  1190 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1191 | 
  1192 |   await expect(profile).toBeVisible();
  1193 |   await expect(profile).toContainText("71.8");
  1194 |   await expect(profile).toContainText("88");
  1195 |   await expect(profile).toContainText("1,234");
  1196 |   await expect(profile).toContainText("רכיבה אחרת");
  1197 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1198 |   await expect(profile).not.toContainText("63.4");
  1199 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1200 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1201 | });
  1202 | 
  1203 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1204 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1205 | 
  1206 |   await page.goto("/");
  1207 |   await page.getByTestId("link-nav-coach").click();
  1208 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1209 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1210 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1211 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1212 | 
  1213 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1214 |   const detailsError = page.getByTestId("coach-client-details-error");
  1215 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1216 |     timeout: 20_000,
  1217 |   });
  1218 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1219 |   await expect(detailsError).toBeVisible();
> 1220 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
       |                              ^ Error: expect(locator).toContainText(expected) failed
  1221 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1222 | 
  1223 |   await page.getByTestId("coach-client-details-retry").click();
  1224 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1225 |     timeout: 20_000,
  1226 |   });
  1227 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1228 |   await expect(detailsError).toHaveCount(0);
  1229 | 
  1230 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1231 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1232 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1233 | });
  1234 | 
  1235 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1236 |   await installFixture(page);
  1237 | 
  1238 |   const routes = [
  1239 |     { path: "/workouts", marker: "האימונים שלי" },
  1240 |     { path: "/programs", marker: "התוכניות שלך" },
  1241 |     { path: "/exercises", marker: "תרגילים" },
  1242 |     { path: "/nutrition", marker: "יומן תזונה" },
  1243 |   ];
  1244 | 
  1245 |   await page.goto("/coach/clients");
  1246 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1247 | 
  1248 |   for (const route of routes) {
  1249 |     await page.goto(route.path);
  1250 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1251 |       timeout: 20_000,
  1252 |     });
  1253 |   }
  1254 | });
  1255 | 
  1256 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1257 |   page,
  1258 | }) => {
  1259 |   await installFixture(page);
  1260 | 
  1261 |   await page.goto("/");
  1262 |   await page.getByTestId("link-nav-coach").click();
  1263 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1264 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1265 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1266 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1267 | 
  1268 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1269 |   await expect(profileMessage).toBeVisible();
  1270 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1271 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1272 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1273 |   await expect
  1274 |     .poll(async () =>
  1275 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1276 |     )
  1277 |     .toContain(profileMessageText);
  1278 | 
  1279 |   const traineePage = await page.context().newPage();
  1280 |   await installFixture(traineePage, { role: "trainee" });
  1281 |   await traineePage.goto("/");
  1282 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1283 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1284 | 
  1285 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1286 |   await expect(traineeMessage).toContainText(profileMessageText);
  1287 | });
  1288 | 
  1289 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1290 |   page,
  1291 | }) => {
  1292 |   await installFixture(page, { role: "trainee" });
  1293 | 
  1294 |   await page.goto("/");
  1295 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1296 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1297 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1298 | 
  1299 |   await page.reload();
  1300 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1301 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1302 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1303 | 
  1304 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1305 |   await expect
  1306 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1307 |     .toBeGreaterThan(0);
  1308 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1309 |   await expect
  1310 |     .poll(async () => {
  1311 |       const cached = await page.evaluate(
  1312 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1313 |         "gymtrack.v1.user.ios-smoke-client",
  1314 |       );
  1315 |       return cached.coachMessages?.length ?? 0;
  1316 |     })
  1317 |     .toBe(1);
  1318 | });
  1319 | 
  1320 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
```