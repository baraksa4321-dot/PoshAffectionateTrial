# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated workspace paints from the boot cache before full refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1540:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2000
Received:    0
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
        - button "פתיחת צ׳קליסט לאימון" [ref=e13]: צ׳קליסט
        - group "בחירת מצב עבודה" [ref=e17]:
          - link "אישי" [ref=e18]:
            - /url: /
          - link "מאמן" [ref=e19]:
            - /url: /coach
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: 11.09.2026
          - heading "בוקר טוב, מאמנת." [level=1] [ref=e23]
        - generic [ref=e25]:
          - button "נמצאה התנגשות — נדרשת בחירה לפני סנכרון" [ref=e26] [cursor=pointer]
          - button "פתיחת הפרופיל האישי" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: מאמנת בדיקה
            - generic [ref=e31]: ios-smoke-coach@example.test
          - button "בחירת פלטת צבעים" [ref=e33] [cursor=pointer]
          - button "התנתק" [ref=e35] [cursor=pointer]
  - main [ref=e39]:
    - generic [ref=e40]: נמצאה התנגשות — נדרשת בחירה לפני סנכרון
    - generic [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: הודעה מהמאמן שלך
          - generic [ref=e47]:
            - generic [ref=e48]: 25.8.2026
            - button "מחיקת הודעת המאמן" [ref=e49]
        - paragraph [ref=e53]: "\"כל הכבוד על ההתמדה השבוע\""
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: הודעה חשובה
          - generic [ref=e59]:
            - generic [ref=e60]: 25.8.2026
            - button "הסתרת הודעת תפוצה" [ref=e61]
        - paragraph [ref=e65]: "\"הודעת תפוצה לבדיקה\""
      - generic [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: רצף אימונים שבועי
          - paragraph [ref=e73]: 0 אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות
          - generic "מדד עקביות ללא יעד" [ref=e74]
        - generic [ref=e75]:
          - strong [ref=e81]: —
          - paragraph [ref=e82]: עקביות
      - generic [ref=e84]:
        - generic [ref=e86]:
          - paragraph [ref=e87]: אין אימון להיום
          - paragraph [ref=e88]: האימונים שלך מחכים במסך האימונים.
          - link "יצירת תכנית" [ref=e89]:
            - /url: /programs
        - link "תזונה יומית 0קק״ל מתוך 1900 · 1900 נשארו 0 גרם חלבון" [ref=e91]:
          - /url: /nutrition
          - generic [ref=e92]: תזונה יומית
          - paragraph [ref=e97]: 0קק״ל
          - paragraph [ref=e98]: מתוך 1900 · 1900 נשארו
          - generic [ref=e99]: 0 גרם חלבון
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e106]:
            - heading "פעילות השבוע" [level=2] [ref=e107]
            - paragraph [ref=e108]: 0 אימונים בוצעו השבוע
          - button "פתיחת מגמות והיסטוריית תרגיל" [ref=e109]: מגמות
        - generic [ref=e112]:
          - generic [ref=e113]:
            - paragraph [ref=e115]: אימונים
            - paragraph [ref=e119]: "0"
          - generic [ref=e120]:
            - paragraph [ref=e122]: נפח ק״ג
            - paragraph [ref=e127]: "0"
          - generic [ref=e128]:
            - paragraph [ref=e130]: זמן אימון
            - paragraph [ref=e138]: 0m
      - generic [ref=e139]:
        - generic [ref=e141]:
          - heading "מעקב משקל וצ'ק-אין חודשי" [level=2] [ref=e142]
          - paragraph [ref=e143]: דיווח למאמן
        - generic [ref=e144]:
          - generic [ref=e145] [cursor=pointer]:
            - generic [ref=e146]: שקילה שבועית
            - paragraph [ref=e152]:
              - text: "עדכון משקל בוקר:"
              - strong [ref=e153]: 62 ק"ג
          - generic [ref=e154]:
            - generic [ref=e155]: צ'ק-אין חודשי
            - paragraph [ref=e160]: היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמנת או הבעלים
      - generic [ref=e161]:
        - generic [ref=e163]:
          - heading "המדידות החודשיות שלי" [level=2] [ref=e164]
          - paragraph [ref=e165]: תצוגה בלבד — מתעדכנות על ידי המאמנת או הבעלים
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e168]: מותניים
            - strong [ref=e169]: 74 ס״מ
          - generic [ref=e170]:
            - generic [ref=e171]: אחוז שומן
            - strong [ref=e172]: 24.5 %
          - generic [ref=e173]:
            - generic [ref=e174]: מסת שריר
            - strong [ref=e175]: 42.1 ק״ג
  - navigation "ניווט ראשי":
    - generic [ref=e176]:
      - link [ref=e177]:
        - /url: /coach
      - link "מתאמנים" [ref=e181]:
        - /url: /coach/clients
      - link "מעקב" [ref=e188]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e192]:
        - /url: /exercises
```

# Test source

```ts
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
  1578 |   const refreshedCache = await page.evaluate(
  1579 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1580 |     `gymtrack.v1.user.${COACH_ID}`,
  1581 |   );
> 1582 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
       |                                       ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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
  1628 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1629 |     /border-primary/,
  1630 |   );
  1631 |   await expect(
  1632 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1633 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1634 | 
  1635 |   // Reopening the completion sheet restores the unfinished workout note.
  1636 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1637 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1638 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1639 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1640 |   await expect(page).toHaveURL(/\/programs/);
  1641 |   await expect
  1642 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1643 |     .toBeNull();
  1644 | });
  1645 | 
```