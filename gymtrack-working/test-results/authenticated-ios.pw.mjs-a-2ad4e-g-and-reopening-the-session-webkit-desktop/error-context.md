# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1742:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/session/ios-smoke-workout", waiting until "load"

```

# Test source

```ts
  1645 |     })
  1646 |     .toBe(1);
  1647 | });
  1648 | 
  1649 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1650 |   const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  1651 |   await installFixture(page, {
  1652 |     role: "trainee",
  1653 |     broadcastAnnouncementAfterReconnect: {
  1654 |       ...broadcastAnnouncement,
  1655 |       message: refreshedBroadcastText,
  1656 |       created_at: "2026-08-25T09:00:00.000Z",
  1657 |     },
  1658 |   });
  1659 | 
  1660 |   await page.goto("/");
  1661 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1662 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1663 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1664 | 
  1665 |   await page.reload();
  1666 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1667 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1668 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1669 | 
  1670 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1671 |   await expect
  1672 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1673 |     .toBeGreaterThan(0);
  1674 |   await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
  1675 |   await expect
  1676 |     .poll(async () => {
  1677 |       const cached = await page.evaluate(
  1678 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1679 |         "gymtrack.v1.user.ios-smoke-client",
  1680 |       );
  1681 |       return cached.broadcasts?.length ?? 0;
  1682 |     })
  1683 |     .toBe(1);
  1684 |   await expect
  1685 |     .poll(async () => {
  1686 |       const cached = await page.evaluate(
  1687 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1688 |         "gymtrack.v1.user.ios-smoke-client",
  1689 |       );
  1690 |       return cached.broadcasts?.[0]?.message ?? null;
  1691 |     })
  1692 |     .toBe(refreshedBroadcastText);
  1693 | });
  1694 | 
  1695 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1696 |   await installFixture(page, {
  1697 |     online: true,
  1698 |     fullCacheValue: reopenFullCacheValue,
  1699 |     bootCacheValue: reopenBootCacheValue,
  1700 |     pendingChanges: true,
  1701 |     trackBootCacheTiming: true,
  1702 |   });
  1703 | 
  1704 |   await page.goto("/");
  1705 |   const coachNav = page.getByTestId("link-nav-coach");
  1706 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1707 | 
  1708 |   await expect
  1709 |     .poll(() =>
  1710 |       page.evaluate(() => ({
  1711 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1712 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1713 |       })),
  1714 |     )
  1715 |     .toMatchObject({
  1716 |       workspaceMountedAt: expect.any(Number),
  1717 |       fullCacheReadAt: expect.any(Number),
  1718 |     });
  1719 | 
  1720 |   const bootTiming = await page.evaluate(() => ({
  1721 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1722 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1723 |   }));
  1724 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1725 | 
  1726 |   await expect
  1727 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1728 |     .not.toBeNull();
  1729 |   await expect
  1730 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1731 |     .toBeGreaterThan(0);
  1732 | 
  1733 |   const refreshedCache = await page.evaluate(
  1734 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1735 |     `gymtrack.v1.user.${COACH_ID}`,
  1736 |   );
  1737 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1738 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1739 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1740 | });
  1741 | 
  1742 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1743 |   await installFixture(page);
  1744 | 
> 1745 |   await page.goto(`/session/${WORKOUT_ID}`);
       |              ^ Error: page.goto: Page crashed
  1746 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1747 | 
  1748 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1749 |   await repsInput.fill("123");
  1750 |   await page.keyboard.press("Tab");
  1751 |   await expect(repsInput).toHaveValue("123");
  1752 | 
  1753 |   // Completion feedback belongs to the active workout draft and should follow
  1754 |   // the workout when the coach navigates away before saving.
  1755 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1756 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1757 |   await expect(workoutNote).toBeVisible();
  1758 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1759 |   await assertKeyboardVisible(workoutNote);
  1760 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1761 |   await page.keyboard.press("Escape");
  1762 |   await expect(workoutNote).toBeHidden();
  1763 | 
  1764 |   const firstExercise = page.locator("article").first();
  1765 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1766 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1767 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1768 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1769 | 
  1770 |   await page.goto("/programs");
  1771 |   // TanStack can finish the document navigation before the route's client
  1772 |   // transition settles on WebKit. Wait for visible route content before
  1773 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1774 |   // goto even though the app is healthy.
  1775 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1776 |   await page.goto(`/session/${WORKOUT_ID}`);
  1777 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1778 |   await page.reload();
  1779 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1780 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1781 | 
  1782 |   const reopenedFirstExercise = page.locator("article").first();
  1783 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1784 |     /border-primary/,
  1785 |   );
  1786 |   await expect(
  1787 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1788 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1789 | 
  1790 |   // Reopening the completion sheet restores the unfinished workout note.
  1791 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1792 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1793 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1794 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1795 |   await expect(page).toHaveURL(/\/programs/);
  1796 |   await expect
  1797 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1798 |     .toBeNull();
  1799 | });
  1800 | 
```