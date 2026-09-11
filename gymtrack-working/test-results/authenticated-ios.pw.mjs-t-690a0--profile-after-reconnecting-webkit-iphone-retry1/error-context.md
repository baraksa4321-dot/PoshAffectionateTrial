# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee sees the message sent from the coach profile after reconnecting
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1256:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('coach-message-banner')
Expected substring: "הודעה שנשלחה מהפרופיל ונראית למתאמנת"
Received string:    " הודעה מהמאמן שלך25.8.2026\"כל הכבוד על ההתמדה השבוע\""
Timeout: 8000ms

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for getByTestId('coach-message-banner')
    20 × locator resolved to <div data-home-card-id="coach-message" data-testid="coach-message-banner" data-tsd-source="/src/routes/index.tsx:535:11" class="dashboard-notice surface-card space-y-1.5 border-primary/20 bg-primary/5 p-4 text-start">…</div>
       - unexpected value " הודעה מהמאמן שלך25.8.2026"כל הכבוד על ההתמדה השבוע""

```

```yaml
- text: הודעה מהמאמן שלך 25.8.2026
- button "מחיקת הודעת המאמן"
- paragraph: "\"כל הכבוד על ההתמדה השבוע\""
```

# Test source

```ts
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
  1220 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
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
> 1286 |   await expect(traineeMessage).toContainText(profileMessageText);
       |                                ^ Error: expect(locator).toContainText(expected) failed
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
  1321 |   await installFixture(page, { role: "trainee" });
  1322 | 
  1323 |   await page.goto("/");
  1324 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1325 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1326 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1327 | 
  1328 |   await page.reload();
  1329 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1330 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1331 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1332 | 
  1333 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1334 |   await expect
  1335 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1336 |     .toBeGreaterThan(0);
  1337 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1338 |   await expect
  1339 |     .poll(async () => {
  1340 |       const cached = await page.evaluate(
  1341 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1342 |         "gymtrack.v1.user.ios-smoke-client",
  1343 |       );
  1344 |       return cached.broadcasts?.length ?? 0;
  1345 |     })
  1346 |     .toBe(1);
  1347 | });
  1348 | 
  1349 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1350 |   await installFixture(page, {
  1351 |     online: true,
  1352 |     fullCacheValue: reopenFullCacheValue,
  1353 |     bootCacheValue: reopenBootCacheValue,
  1354 |     pendingChanges: true,
  1355 |     trackBootCacheTiming: true,
  1356 |   });
  1357 | 
  1358 |   await page.goto("/");
  1359 |   const coachNav = page.getByTestId("link-nav-coach");
  1360 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1361 | 
  1362 |   await expect
  1363 |     .poll(() =>
  1364 |       page.evaluate(() => ({
  1365 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1366 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1367 |       })),
  1368 |     )
  1369 |     .toMatchObject({
  1370 |       workspaceMountedAt: expect.any(Number),
  1371 |       fullCacheReadAt: expect.any(Number),
  1372 |     });
  1373 | 
  1374 |   const bootTiming = await page.evaluate(() => ({
  1375 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1376 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1377 |   }));
  1378 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1379 | 
  1380 |   await expect
  1381 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1382 |     .not.toBeNull();
  1383 |   await expect
  1384 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1385 |     .toBeGreaterThan(0);
  1386 | 
```