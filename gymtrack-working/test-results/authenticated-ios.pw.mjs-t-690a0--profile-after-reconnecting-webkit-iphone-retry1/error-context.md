# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee sees the message sent from the coach profile after reconnecting
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1466:1

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
    20 × locator resolved to <div data-home-card-id="coach-message" data-testid="coach-message-banner" data-tsd-source="/src/routes/index.tsx:560:11" class="dashboard-notice surface-card space-y-1.5 border-primary/20 bg-primary/5 p-4 text-start">…</div>
       - unexpected value " הודעה מהמאמן שלך25.8.2026"כל הכבוד על ההתמדה השבוע""

```

```yaml
- text: הודעה מהמאמן שלך 25.8.2026
- button "מחיקת הודעת המאמן"
- paragraph: "\"כל הכבוד על ההתמדה השבוע\""
```

# Test source

```ts
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
  1419 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  1420 |   await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  1421 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1422 | 
  1423 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1424 |   const detailsError = page.getByTestId("coach-client-details-error");
  1425 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
  1426 |     timeout: 20_000,
  1427 |   });
  1428 |   await expect(workspace).toHaveAttribute("aria-busy", "false");
  1429 |   await expect(detailsError).toBeVisible();
  1430 |   await expect(detailsError).toContainText("temporary selected trainee data failure");
  1431 |   await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1432 | 
  1433 |   await page.getByTestId("coach-client-details-retry").click();
  1434 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1435 |     timeout: 20_000,
  1436 |   });
  1437 |   await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  1438 |   await expect(detailsError).toHaveCount(0);
  1439 | 
  1440 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1441 |   await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  1442 |   await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
  1443 | });
  1444 | 
  1445 | test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  1446 |   await installFixture(page);
  1447 | 
  1448 |   const routes = [
  1449 |     { path: "/workouts", marker: "האימונים שלי" },
  1450 |     { path: "/programs", marker: "התוכניות שלך" },
  1451 |     { path: "/exercises", marker: "תרגילים" },
  1452 |     { path: "/nutrition", marker: "יומן תזונה" },
  1453 |   ];
  1454 | 
  1455 |   await page.goto("/coach/clients");
  1456 |   await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();
  1457 | 
  1458 |   for (const route of routes) {
  1459 |     await page.goto(route.path);
  1460 |     await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
  1461 |       timeout: 20_000,
  1462 |     });
  1463 |   }
  1464 | });
  1465 | 
  1466 | test("trainee sees the message sent from the coach profile after reconnecting", async ({
  1467 |   page,
  1468 | }) => {
  1469 |   await installFixture(page);
  1470 | 
  1471 |   await page.goto("/");
  1472 |   await page.getByTestId("link-nav-coach").click();
  1473 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1474 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1475 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1476 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1477 | 
  1478 |   const profileMessage = page.getByTestId("coach-client-message-profile");
  1479 |   await expect(profileMessage).toBeVisible();
  1480 |   const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  1481 |   await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1482 |   await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1483 |   await expect
  1484 |     .poll(async () =>
  1485 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1486 |     )
  1487 |     .toContain(profileMessageText);
  1488 | 
  1489 |   const traineePage = await page.context().newPage();
  1490 |   await installFixture(traineePage, { role: "trainee" });
  1491 |   await traineePage.goto("/");
  1492 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1493 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1494 | 
  1495 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
> 1496 |   await expect(traineeMessage).toContainText(profileMessageText);
       |                                ^ Error: expect(locator).toContainText(expected) failed
  1497 | });
  1498 | 
  1499 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1500 |   page,
  1501 | }) => {
  1502 |   await installFixture(page, { role: "trainee" });
  1503 | 
  1504 |   await page.goto("/");
  1505 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1506 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1507 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1508 | 
  1509 |   await page.reload();
  1510 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1511 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1512 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1513 | 
  1514 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1515 |   await expect
  1516 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1517 |     .toBeGreaterThan(0);
  1518 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1519 |   await expect
  1520 |     .poll(async () => {
  1521 |       const cached = await page.evaluate(
  1522 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1523 |         "gymtrack.v1.user.ios-smoke-client",
  1524 |       );
  1525 |       return cached.coachMessages?.length ?? 0;
  1526 |     })
  1527 |     .toBe(1);
  1528 | });
  1529 | 
  1530 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1531 |   await installFixture(page, { role: "trainee" });
  1532 | 
  1533 |   await page.goto("/");
  1534 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1535 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1536 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1537 | 
  1538 |   await page.reload();
  1539 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1540 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1541 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1542 | 
  1543 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1544 |   await expect
  1545 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1546 |     .toBeGreaterThan(0);
  1547 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1548 |   await expect
  1549 |     .poll(async () => {
  1550 |       const cached = await page.evaluate(
  1551 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1552 |         "gymtrack.v1.user.ios-smoke-client",
  1553 |       );
  1554 |       return cached.broadcasts?.length ?? 0;
  1555 |     })
  1556 |     .toBe(1);
  1557 | });
  1558 | 
  1559 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1560 |   await installFixture(page, {
  1561 |     online: true,
  1562 |     fullCacheValue: reopenFullCacheValue,
  1563 |     bootCacheValue: reopenBootCacheValue,
  1564 |     pendingChanges: true,
  1565 |     trackBootCacheTiming: true,
  1566 |   });
  1567 | 
  1568 |   await page.goto("/");
  1569 |   const coachNav = page.getByTestId("link-nav-coach");
  1570 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1571 | 
  1572 |   await expect
  1573 |     .poll(() =>
  1574 |       page.evaluate(() => ({
  1575 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1576 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1577 |       })),
  1578 |     )
  1579 |     .toMatchObject({
  1580 |       workspaceMountedAt: expect.any(Number),
  1581 |       fullCacheReadAt: expect.any(Number),
  1582 |     });
  1583 | 
  1584 |   const bootTiming = await page.evaluate(() => ({
  1585 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1586 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1587 |   }));
  1588 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1589 | 
  1590 |   await expect
  1591 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1592 |     .not.toBeNull();
  1593 |   await expect
  1594 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1595 |     .toBeGreaterThan(0);
  1596 | 
```