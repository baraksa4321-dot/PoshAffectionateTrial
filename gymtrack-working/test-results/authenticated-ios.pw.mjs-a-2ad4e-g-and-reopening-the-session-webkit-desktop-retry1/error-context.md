# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1659:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/session/ios-smoke-workout", waiting until "load"

```

# Test source

```ts
  1562 |   await page.reload();
  1563 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1564 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1565 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1566 | 
  1567 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1568 |   await expect
  1569 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1570 |     .toBeGreaterThan(0);
  1571 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1572 |   await expect
  1573 |     .poll(async () => {
  1574 |       const cached = await page.evaluate(
  1575 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1576 |         "gymtrack.v1.user.ios-smoke-client",
  1577 |       );
  1578 |       return cached.coachMessages?.length ?? 0;
  1579 |     })
  1580 |     .toBe(1);
  1581 | });
  1582 | 
  1583 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1584 |   await installFixture(page, { role: "trainee" });
  1585 | 
  1586 |   await page.goto("/");
  1587 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1588 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1589 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1590 | 
  1591 |   await page.reload();
  1592 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1593 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1594 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1595 | 
  1596 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1597 |   await expect
  1598 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1599 |     .toBeGreaterThan(0);
  1600 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1601 |   await expect
  1602 |     .poll(async () => {
  1603 |       const cached = await page.evaluate(
  1604 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1605 |         "gymtrack.v1.user.ios-smoke-client",
  1606 |       );
  1607 |       return cached.broadcasts?.length ?? 0;
  1608 |     })
  1609 |     .toBe(1);
  1610 | });
  1611 | 
  1612 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1613 |   await installFixture(page, {
  1614 |     online: true,
  1615 |     fullCacheValue: reopenFullCacheValue,
  1616 |     bootCacheValue: reopenBootCacheValue,
  1617 |     pendingChanges: true,
  1618 |     trackBootCacheTiming: true,
  1619 |   });
  1620 | 
  1621 |   await page.goto("/");
  1622 |   const coachNav = page.getByTestId("link-nav-coach");
  1623 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1624 | 
  1625 |   await expect
  1626 |     .poll(() =>
  1627 |       page.evaluate(() => ({
  1628 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1629 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1630 |       })),
  1631 |     )
  1632 |     .toMatchObject({
  1633 |       workspaceMountedAt: expect.any(Number),
  1634 |       fullCacheReadAt: expect.any(Number),
  1635 |     });
  1636 | 
  1637 |   const bootTiming = await page.evaluate(() => ({
  1638 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1639 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1640 |   }));
  1641 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1642 | 
  1643 |   await expect
  1644 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1645 |     .not.toBeNull();
  1646 |   await expect
  1647 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1648 |     .toBeGreaterThan(0);
  1649 | 
  1650 |   const refreshedCache = await page.evaluate(
  1651 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1652 |     `gymtrack.v1.user.${COACH_ID}`,
  1653 |   );
  1654 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1655 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1656 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1657 | });
  1658 | 
  1659 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1660 |   await installFixture(page);
  1661 | 
> 1662 |   await page.goto(`/session/${WORKOUT_ID}`);
       |              ^ Error: page.goto: Page crashed
  1663 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1664 | 
  1665 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1666 |   await repsInput.fill("123");
  1667 |   await page.keyboard.press("Tab");
  1668 |   await expect(repsInput).toHaveValue("123");
  1669 | 
  1670 |   // Completion feedback belongs to the active workout draft and should follow
  1671 |   // the workout when the coach navigates away before saving.
  1672 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1673 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1674 |   await expect(workoutNote).toBeVisible();
  1675 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1676 |   await assertKeyboardVisible(workoutNote);
  1677 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1678 |   await page.keyboard.press("Escape");
  1679 |   await expect(workoutNote).toBeHidden();
  1680 | 
  1681 |   const firstExercise = page.locator("article").first();
  1682 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1683 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1684 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1685 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1686 | 
  1687 |   await page.goto("/programs");
  1688 |   // TanStack can finish the document navigation before the route's client
  1689 |   // transition settles on WebKit. Wait for visible route content before
  1690 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1691 |   // goto even though the app is healthy.
  1692 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1693 |   await page.goto(`/session/${WORKOUT_ID}`);
  1694 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1695 |   await page.reload();
  1696 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1697 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1698 | 
  1699 |   const reopenedFirstExercise = page.locator("article").first();
  1700 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1701 |     /border-primary/,
  1702 |   );
  1703 |   await expect(
  1704 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1705 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1706 | 
  1707 |   // Reopening the completion sheet restores the unfinished workout note.
  1708 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1709 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1710 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1711 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1712 |   await expect(page).toHaveURL(/\/programs/);
  1713 |   await expect
  1714 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1715 |     .toBeNull();
  1716 | });
  1717 | 
```