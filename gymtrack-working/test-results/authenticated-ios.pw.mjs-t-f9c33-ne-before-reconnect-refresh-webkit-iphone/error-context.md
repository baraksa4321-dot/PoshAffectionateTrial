# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a received coach message offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1289:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e5]:
        - link "MY routine — דף הבית" [ref=f1e6]:
          - /url: /
          - img "MY routine" [ref=f1e7]
        - button "מעבר לתצוגת לילה" [ref=f1e8]
      - button "פתיחת צ׳קליסט לאימון" [ref=f1e13]: צ׳קליסט
      - generic [ref=f1e17]:
        - generic [ref=f1e18]:
          - paragraph [ref=f1e19]: 11.09.2026
          - heading "בוקר טוב, מתאמנת." [level=1] [ref=f1e20]
        - generic [ref=f1e22]:
          - button "הנתונים מסונכרנים" [ref=f1e23] [cursor=pointer]
          - button "פתיחת הפרופיל האישי" [ref=f1e26] [cursor=pointer]:
            - generic [ref=f1e27]: מתאמנת בדיקה
            - generic [ref=f1e28]: ios-smoke-client@example.test
          - button "בחירת פלטת צבעים" [ref=f1e30] [cursor=pointer]
          - button "התנתק" [ref=f1e32] [cursor=pointer]
  - main [ref=f1e36]:
    - generic [ref=f1e37]: הנתונים מסונכרנים
    - generic [ref=f1e38]:
      - generic [ref=f1e39]:
        - generic [ref=f1e40]:
          - generic [ref=f1e41]: הודעה מהמאמן שלך
          - generic [ref=f1e44]:
            - generic [ref=f1e45]: 25.8.2026
            - button "מחיקת הודעת המאמן" [ref=f1e46]
        - paragraph [ref=f1e50]: "\"כל הכבוד על ההתמדה השבוע\""
      - generic [ref=f1e51]:
        - generic [ref=f1e52]:
          - generic [ref=f1e53]: הודעה חשובה
          - generic [ref=f1e56]:
            - generic [ref=f1e57]: 25.8.2026
            - button "הסתרת הודעת תפוצה" [ref=f1e58]
        - paragraph [ref=f1e62]: "\"הודעת תפוצה לבדיקה\""
      - generic [ref=f1e63]:
        - generic [ref=f1e64]:
          - generic [ref=f1e65]: רצף אימונים שבועי
          - paragraph [ref=f1e70]: 0 אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות
          - generic "מדד עקביות ללא יעד" [ref=f1e71]
        - generic [ref=f1e72]:
          - strong [ref=f1e78]: —
          - paragraph [ref=f1e79]: עקביות
      - generic [ref=f1e81]:
        - generic [ref=f1e83]:
          - paragraph [ref=f1e84]: אין אימון להיום
          - paragraph [ref=f1e85]: האימונים שלך מחכים במסך האימונים.
          - link "יצירת תכנית" [ref=f1e86]:
            - /url: /programs
        - link "תזונה יומית 0קק״ל מתוך 1900 · 1900 נשארו 0 גרם חלבון" [ref=f1e88]:
          - /url: /nutrition
          - generic [ref=f1e89]: תזונה יומית
          - paragraph [ref=f1e94]: 0קק״ל
          - paragraph [ref=f1e95]: מתוך 1900 · 1900 נשארו
          - generic [ref=f1e96]: 0 גרם חלבון
      - generic [ref=f1e100]:
        - generic [ref=f1e101]:
          - generic [ref=f1e103]:
            - heading "פעילות השבוע" [level=2] [ref=f1e104]
            - paragraph [ref=f1e105]: 0 אימונים בוצעו השבוע
          - button "פתיחת מגמות והיסטוריית תרגיל" [ref=f1e106]: מגמות
        - generic [ref=f1e109]:
          - generic [ref=f1e110]:
            - paragraph [ref=f1e112]: אימונים
            - paragraph [ref=f1e116]: "0"
          - generic [ref=f1e117]:
            - paragraph [ref=f1e119]: נפח ק״ג
            - paragraph [ref=f1e124]: "0"
          - generic [ref=f1e125]:
            - paragraph [ref=f1e127]: זמן אימון
            - paragraph [ref=f1e135]: 0m
      - generic [ref=f1e136]:
        - generic [ref=f1e138]:
          - heading "מעקב משקל וצ'ק-אין חודשי" [level=2] [ref=f1e139]
          - paragraph [ref=f1e140]: דיווח למאמן
        - generic [ref=f1e141]:
          - generic [ref=f1e142] [cursor=pointer]:
            - generic [ref=f1e143]: שקילה שבועית
            - paragraph [ref=f1e149]:
              - text: "עדכון משקל בוקר:"
              - strong [ref=f1e150]: 64 ק"ג
          - generic [ref=f1e151]:
            - generic [ref=f1e152]: צ'ק-אין חודשי
            - paragraph [ref=f1e157]: היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמנת או הבעלים
      - generic [ref=f1e158]:
        - generic [ref=f1e160]:
          - heading "המדידות החודשיות שלי" [level=2] [ref=f1e161]
          - paragraph [ref=f1e162]: תצוגה בלבד — מתעדכנות על ידי המאמנת או הבעלים
        - generic [ref=f1e163]:
          - generic [ref=f1e164]:
            - generic [ref=f1e165]: מותניים
            - strong [ref=f1e166]: 74 ס״מ
          - generic [ref=f1e167]:
            - generic [ref=f1e168]: אחוז שומן
            - strong [ref=f1e169]: 24.5 %
          - generic [ref=f1e170]:
            - generic [ref=f1e171]: מסת שריר
            - strong [ref=f1e172]: 42.1 ק״ג
  - navigation "ניווט ראשי":
    - generic [ref=f1e173]:
      - link "היום שלי" [ref=f1e174]:
        - /url: /
      - link "האימונים שלי" [ref=f1e179]:
        - /url: /workouts
      - link "התזונה שלי" [ref=f1e186]:
        - /url: /nutrition
```

# Test source

```ts
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
> 1307 |     .toBeGreaterThan(0);
       |      ^ Error: expect(received).toBeGreaterThan(expected)
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
  1387 |   const refreshedCache = await page.evaluate(
  1388 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1389 |     `gymtrack.v1.user.${COACH_ID}`,
  1390 |   );
  1391 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1392 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1393 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1394 | });
  1395 | 
  1396 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1397 |   await installFixture(page);
  1398 | 
  1399 |   await page.goto(`/session/${WORKOUT_ID}`);
  1400 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1401 | 
  1402 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1403 |   await repsInput.fill("123");
  1404 |   await page.keyboard.press("Tab");
  1405 |   await expect(repsInput).toHaveValue("123");
  1406 | 
  1407 |   // Completion feedback belongs to the active workout draft and should follow
```