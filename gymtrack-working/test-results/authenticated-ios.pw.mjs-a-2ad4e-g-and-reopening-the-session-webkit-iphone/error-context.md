# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1587:1

# Error details

```
Error: Channel closed
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('התקדמות אימון', { exact: true })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('התקדמות אימון', { exact: true })
  - 

```

```yaml
- status "MY routine נטען":
  - status "טוען"
- img "MY routine"
```

# Test source

```ts
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
  1582 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1583 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1584 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1585 | });
  1586 | 
  1587 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1588 |   await installFixture(page);
  1589 | 
  1590 |   await page.goto(`/session/${WORKOUT_ID}`);
> 1591 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
       |                                                                  ^ Error: expect(locator).toBeVisible() failed
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