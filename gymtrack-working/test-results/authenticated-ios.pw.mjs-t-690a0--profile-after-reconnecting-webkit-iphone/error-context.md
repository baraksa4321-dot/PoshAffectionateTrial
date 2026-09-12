# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee sees the message sent from the coach profile after reconnecting
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1447:1

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
  1428 | 
  1429 |   const routes = [
  1430 |     { path: "/workouts", marker: "האימונים שלי" },
  1431 |     { path: "/programs", marker: "התוכניות שלך" },
  1432 |     { path: "/exercises", marker: "תרגילים" },
  1433 |     { path: "/nutrition", marker: "יומן תזונה" },
  1434 |   ];
  1435 | 
  1436 |   await page.goto("/coach/clients");
  1437 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1438 | 
  1439 |   for (const route of routes) {
  1440 |     await page.goto(route.path);
  1441 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1442 |       timeout: 20_000,
  1443 |     });
  1444 |   }
  1445 | });
  1446 | 
  1447 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1448 |   page,
  1449 | }) => {
  1450 |   await installFixture(page);
  1451 | 
  1452 |   await page.goto("/");
  1453 |   await page.getByTestId("link-nav-coach").click();
  1454 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1455 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1456 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1457 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1458 | 
  1459 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1460 |   await expect(profileMessage).toBeVisible();
  1461 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1462 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1463 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1464 |   await expect
  1465 |     .poll(async () =>
  1466 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1467 |     )
  1468 |     .toContain(profileMessageText);
  1469 | 
  1470 |   const traineePage = await page.context().newPage();
  1471 |   await installFixture(traineePage, { role: "trainee" });
  1472 |   await traineePage.goto("/");
  1473 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1474 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1475 | 
  1476 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
> 1477 |   await expect(traineeMessage).toContainText(profileMessageText);
       |                                ^ Error: expect(locator).toContainText(expected) failed
  1478 | });
  1479 | 
  1480 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1481 |   page,
  1482 | }) => {
  1483 |   await installFixture(page, { role: "trainee" });
  1484 | 
  1485 |   await page.goto("/");
  1486 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1487 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1488 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1489 | 
  1490 |   await page.reload();
  1491 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1492 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1493 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1494 | 
  1495 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1496 |   await expect
  1497 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1498 |     .toBeGreaterThan(0);
  1499 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1500 |   await expect
  1501 |     .poll(async () => {
  1502 |       const cached = await page.evaluate(
  1503 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1504 |         "gymtrack.v1.user.ios-smoke-client",
  1505 |       );
  1506 |       return cached.coachMessages?.length ?? 0;
  1507 |     })
  1508 |     .toBe(1);
  1509 | });
  1510 | 
  1511 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1512 |   await installFixture(page, { role: "trainee" });
  1513 | 
  1514 |   await page.goto("/");
  1515 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1516 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1517 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1518 | 
  1519 |   await page.reload();
  1520 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1521 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1522 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1523 | 
  1524 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1525 |   await expect
  1526 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1527 |     .toBeGreaterThan(0);
  1528 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1529 |   await expect
  1530 |     .poll(async () => {
  1531 |       const cached = await page.evaluate(
  1532 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1533 |         "gymtrack.v1.user.ios-smoke-client",
  1534 |       );
  1535 |       return cached.broadcasts?.length ?? 0;
  1536 |     })
  1537 |     .toBe(1);
  1538 | });
  1539 | 
  1540 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1541 |   await installFixture(page, {
  1542 |     online: true,
  1543 |     fullCacheValue: reopenFullCacheValue,
  1544 |     bootCacheValue: reopenBootCacheValue,
  1545 |     pendingChanges: true,
  1546 |     trackBootCacheTiming: true,
  1547 |   });
  1548 | 
  1549 |   await page.goto("/");
  1550 |   const coachNav = page.getByTestId("link-nav-coach");
  1551 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1552 | 
  1553 |   await expect
  1554 |     .poll(() =>
  1555 |       page.evaluate(() => ({
  1556 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1557 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1558 |       })),
  1559 |     )
  1560 |     .toMatchObject({
  1561 |       workspaceMountedAt: expect.any(Number),
  1562 |       fullCacheReadAt: expect.any(Number),
  1563 |     });
  1564 | 
  1565 |   const bootTiming = await page.evaluate(() => ({
  1566 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1567 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1568 |   }));
  1569 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1570 | 
  1571 |   await expect
  1572 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1573 |     .not.toBeNull();
  1574 |   await expect
  1575 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1576 |     .toBeGreaterThan(0);
  1577 | 
```