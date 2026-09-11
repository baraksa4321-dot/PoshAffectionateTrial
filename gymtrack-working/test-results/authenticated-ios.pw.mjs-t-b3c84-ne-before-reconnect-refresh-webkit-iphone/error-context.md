# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a broadcast notice offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1511:1

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
  1477 |   await expect(traineeMessage).toContainText(profileMessageText);
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
> 1527 |     .toBeGreaterThan(0);
       |      ^ Error: expect(received).toBeGreaterThan(expected)
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
  1578 |   const refreshedCache = await page.evaluate(
  1579 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1580 |     `gymtrack.v1.user.${COACH_ID}`,
  1581 |   );
  1582 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1583 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1584 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1585 | });
  1586 | 
  1587 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1588 |   await installFixture(page);
  1589 | 
  1590 |   await page.goto(`/session/${WORKOUT_ID}`);
  1591 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1592 | 
  1593 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1594 |   await repsInput.fill("123");
  1595 |   await page.keyboard.press("Tab");
  1596 |   await expect(repsInput).toHaveValue("123");
  1597 | 
  1598 |   // Completion feedback belongs to the active workout draft and should follow
  1599 |   // the workout when the coach navigates away before saving.
  1600 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1601 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1602 |   await expect(workoutNote).toBeVisible();
  1603 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1604 |   await assertKeyboardVisible(workoutNote);
  1605 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1606 |   await page.keyboard.press("Escape");
  1607 |   await expect(workoutNote).toBeHidden();
  1608 | 
  1609 |   const firstExercise = page.locator("article").first();
  1610 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1611 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1612 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1613 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1614 | 
  1615 |   await page.goto("/programs");
  1616 |   // TanStack can finish the document navigation before the route's client
  1617 |   // transition settles on WebKit. Wait for visible route content before
  1618 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1619 |   // goto even though the app is healthy.
  1620 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1621 |   await page.goto(`/session/${WORKOUT_ID}`);
  1622 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1623 |   await page.reload();
  1624 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1625 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1626 | 
  1627 |   const reopenedFirstExercise = page.locator("article").first();
```