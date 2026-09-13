# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated workspace paints from the boot cache before full refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1814:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  1723 |       page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
  1724 |     )
  1725 |     .toContain(profileMessageText);
  1726 | 
  1727 |   const traineePage = await page.context().newPage();
  1728 |   await installFixture(traineePage, { role: "trainee" });
  1729 |   await traineePage.goto("/");
  1730 |   const traineeMessage = traineePage.getByTestId("coach-message-banner");
  1731 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1732 | 
  1733 |   await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  1734 |   await expect(traineeMessage).toContainText(profileMessageText);
  1735 | });
  1736 | 
  1737 | test("trainee reopens a received coach message offline before reconnect refresh", async ({
  1738 |   page,
  1739 | }) => {
  1740 |   await installFixture(page, { role: "trainee" });
  1741 | 
  1742 |   await page.goto("/");
  1743 |   const traineeMessage = page.getByTestId("coach-message-banner");
  1744 |   await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1745 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1746 | 
  1747 |   await page.reload();
  1748 |   const reopenedMessage = page.getByTestId("coach-message-banner");
  1749 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1750 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);
  1751 | 
  1752 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1753 |   await expect
  1754 |     .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
  1755 |     .toBeGreaterThan(0);
  1756 |   await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  1757 |   await expect
  1758 |     .poll(async () => {
  1759 |       const cached = await page.evaluate(
  1760 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1761 |         "gymtrack.v1.user.ios-smoke-client",
  1762 |       );
  1763 |       return cached.coachMessages?.length ?? 0;
  1764 |     })
  1765 |     .toBe(1);
  1766 | });
  1767 | 
  1768 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1769 |   const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  1770 |   await installFixture(page, {
  1771 |     role: "trainee",
  1772 |     broadcastAnnouncementAfterReconnect: {
  1773 |       ...broadcastAnnouncement,
  1774 |       message: refreshedBroadcastText,
  1775 |       created_at: "2026-08-25T09:00:00.000Z",
  1776 |     },
  1777 |   });
  1778 | 
  1779 |   await page.goto("/");
  1780 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1781 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1782 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1783 | 
  1784 |   await page.reload();
  1785 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1786 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1787 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1788 | 
  1789 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1790 |   await expect
  1791 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1792 |     .toBeGreaterThan(0);
  1793 |   await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
  1794 |   await expect
  1795 |     .poll(async () => {
  1796 |       const cached = await page.evaluate(
  1797 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1798 |         "gymtrack.v1.user.ios-smoke-client",
  1799 |       );
  1800 |       return cached.broadcasts?.length ?? 0;
  1801 |     })
  1802 |     .toBe(1);
  1803 |   await expect
  1804 |     .poll(async () => {
  1805 |       const cached = await page.evaluate(
  1806 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1807 |         "gymtrack.v1.user.ios-smoke-client",
  1808 |       );
  1809 |       return cached.broadcasts?.[0]?.message ?? null;
  1810 |     })
  1811 |     .toBe(refreshedBroadcastText);
  1812 | });
  1813 | 
  1814 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1815 |   await installFixture(page, {
  1816 |     online: true,
  1817 |     fullCacheValue: reopenFullCacheValue,
  1818 |     bootCacheValue: reopenBootCacheValue,
  1819 |     pendingChanges: true,
  1820 |     trackBootCacheTiming: true,
  1821 |   });
  1822 | 
> 1823 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1824 |   const coachNav = page.getByTestId("link-nav-coach");
  1825 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1826 | 
  1827 |   await expect
  1828 |     .poll(() =>
  1829 |       page.evaluate(() => ({
  1830 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1831 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1832 |       })),
  1833 |     )
  1834 |     .toMatchObject({
  1835 |       workspaceMountedAt: expect.any(Number),
  1836 |       fullCacheReadAt: expect.any(Number),
  1837 |     });
  1838 | 
  1839 |   const bootTiming = await page.evaluate(() => ({
  1840 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1841 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1842 |   }));
  1843 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1844 | 
  1845 |   await expect
  1846 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1847 |     .not.toBeNull();
  1848 |   await expect
  1849 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1850 |     .toBeGreaterThan(0);
  1851 | 
  1852 |   const refreshedCache = await page.evaluate(
  1853 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1854 |     `gymtrack.v1.user.${COACH_ID}`,
  1855 |   );
  1856 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1857 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1858 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1859 | });
  1860 | 
  1861 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1862 |   await installFixture(page);
  1863 | 
  1864 |   await page.goto(`/session/${WORKOUT_ID}`);
  1865 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1866 | 
  1867 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1868 |   await repsInput.fill("123");
  1869 |   await page.keyboard.press("Tab");
  1870 |   await expect(repsInput).toHaveValue("123");
  1871 | 
  1872 |   // Completion feedback belongs to the active workout draft and should follow
  1873 |   // the workout when the coach navigates away before saving.
  1874 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1875 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1876 |   await expect(workoutNote).toBeVisible();
  1877 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1878 |   await assertKeyboardVisible(workoutNote);
  1879 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1880 |   await page.keyboard.press("Escape");
  1881 |   await expect(workoutNote).toBeHidden();
  1882 | 
  1883 |   const firstExercise = page.locator("article").first();
  1884 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1885 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1886 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1887 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1888 | 
  1889 |   await page.goto("/programs");
  1890 |   // TanStack can finish the document navigation before the route's client
  1891 |   // transition settles on WebKit. Wait for visible route content before
  1892 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1893 |   // goto even though the app is healthy.
  1894 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1895 |   await page.goto(`/session/${WORKOUT_ID}`);
  1896 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1897 |   await page.reload();
  1898 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1899 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1900 | 
  1901 |   const reopenedFirstExercise = page.locator("article").first();
  1902 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1903 |     /border-primary/,
  1904 |   );
  1905 |   await expect(
  1906 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1907 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1908 | 
  1909 |   // Reopening the completion sheet restores the unfinished workout note.
  1910 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1911 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1912 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1913 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1914 |   await expect(page).toHaveURL(/\/programs/);
  1915 |   await expect
  1916 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1917 |     .toBeNull();
  1918 | });
  1919 | 
```