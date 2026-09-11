# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:911:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('coach-client-message-profile')
Expected substring: "הודעת החיזוק נשלחה בהצלחה למתאמן!"
Received string:    "שליחת הודעהההודעה תופיע במסך הבית של המתאמןשלחהודעות שנשלחוהודעה שנשלחה מהפרופיל25.8, 12:00כל הכבוד על ההתמדה השבוע25.8, 11:30"
Timeout: 8000ms

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for getByTestId('coach-client-message-profile')
    19 × locator resolved to <section data-testid="coach-client-message-profile" data-tsd-source="/src/routes/coach.tsx:9514:15" class="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.035] p-4">…</section>
       - unexpected value "שליחת הודעהההודעה תופיע במסך הבית של המתאמןשלחהודעות שנשלחוהודעה שנשלחה מהפרופיל25.8, 12:00כל הכבוד על ההתמדה השבוע25.8, 11:30"

```

```yaml
- heading "שליחת הודעה" [level=3]
- paragraph: ההודעה תופיע במסך הבית של המתאמן
- textbox "כתבי הודעה למתאמן..."
- button "שלח"
- paragraph: הודעות שנשלחו
- paragraph: הודעה שנשלחה מהפרופיל
- time: 25.8, 12:00
- paragraph: כל הכבוד על ההתמדה השבוע
- time: 25.8, 11:30
```

# Test source

```ts
  844  |           return new Response(JSON.stringify(body), {
  845  |             status: 200,
  846  |             headers: {
  847  |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  848  |               "content-type": "application/json",
  849  |             },
  850  |           });
  851  |         }
  852  |         return originalFetch(input, init);
  853  |       };
  854  |     },
  855  |     {
  856  |       cacheKey: `gymtrack.v1.user.${userId}`,
  857  |       cacheValue: resolvedCacheValue,
  858  |       bootCacheValue,
  859  |       session: authSession(role),
  860  |       clientProfile: fixtureClientProfile,
  861  |       otherClientProfile,
  862  |       coachProfile,
  863  |       program,
  864  |       otherProgram,
  865  |       workouts,
  866  |       nutritionDay,
  867  |       cardioLog,
  868  |       otherCardioLog,
  869  |       bodyWeightLog,
  870  |       otherBodyWeightLog,
  871  |       bodyMeasurement,
  872  |       otherBodyMeasurement,
  873  |       habit,
  874  |       otherHabit,
  875  |       coachMessage,
  876  |       otherCoachMessage,
  877  |       broadcastAnnouncement,
  878  |       challenge,
  879  |       initialOnline: online,
  880  |       failSelectedTraineeDataOnce,
  881  |       pendingChanges,
  882  |       trackBootCacheTiming,
  883  |     },
  884  |   );
  885  | }
  886  | 
  887  | function assertKeyboardVisible(locator) {
  888  |   return locator.scrollIntoViewIfNeeded().then(() =>
  889  |     expect
  890  |       .poll(
  891  |         async () => {
  892  |           return locator.evaluate((element) => {
  893  |             const rect = element.getBoundingClientRect();
  894  |             const viewport = window.visualViewport;
  895  |             const viewportTop = viewport?.offsetTop ?? 0;
  896  |             const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
  897  |             return {
  898  |               focused: document.activeElement === element,
  899  |               visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
  900  |             };
  901  |           });
  902  |         },
  903  |         {
  904  |           message: "The focused feedback field did not settle inside the visible iPhone viewport.",
  905  |         },
  906  |       )
  907  |       .toMatchObject({ focused: true, visible: true }),
  908  |   );
  909  | }
  910  | 
  911  | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  912  |   await installFixture(page);
  913  | 
  914  |   await page.goto("/");
  915  |   const coachNav = page.getByTestId("link-nav-coach");
  916  |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  917  |   await coachNav.click();
  918  |   await expect(page).toHaveURL(/\/coach\/clients/);
  919  |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  920  |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  921  | 
  922  |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  923  |   await clientCard.click();
  924  |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  925  | 
  926  |   const workspace = page.locator('[data-coach-workspace="true"]');
  927  |   await test.step("load selected trainee details", async () => {
  928  |     await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  929  |       timeout: 20_000,
  930  |     });
  931  |     await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  932  |     await expect(workspace.getByTestId("coach-client-details-error")).toHaveCount(0);
  933  |   });
  934  |   await test.step("open trainee profile and send a message", async () => {
  935  |     await expect(page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true })).toHaveCount(
  936  |       0,
  937  |     );
  938  |     await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  939  |     const profileMessage = page.getByTestId("coach-client-message-profile");
  940  |     await expect(profileMessage).toBeVisible();
  941  |     const profileMessageText = "הודעה שנשלחה מהפרופיל";
  942  |     await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  943  |     await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
> 944  |     await expect(profileMessage).toContainText("הודעת החיזוק נשלחה בהצלחה למתאמן!");
       |                                  ^ Error: expect(locator).toContainText(expected) failed
  945  |     await expect(profileMessage).toContainText(profileMessageText);
  946  |   });
  947  |   const profileInline = page.locator('[data-coach-client-profile-inline="true"]');
  948  |   await expect(profileInline).toBeVisible();
  949  |   await expect(page.getByRole("dialog", { name: "פרופיל המשתמש" })).toHaveCount(0);
  950  |   const activityHistory = page.getByTestId("coach-activity-history");
  951  |   await expect(activityHistory).toBeVisible();
  952  |   await expect(profileInline).toContainText("63.4");
  953  |   await expect(profileInline).toContainText("74");
  954  |   await expect(profileInline).toContainText("8,500");
  955  |   await expect(profileInline).toContainText("כל הכבוד על ההתמדה השבוע");
  956  |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  957  |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  958  |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  959  | 
  960  |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  961  |   const workspaceCanScroll = await workspace.evaluate((element) => {
  962  |     const canScroll = element.scrollHeight > element.clientHeight + 1;
  963  |     if (canScroll) element.scrollTop = element.scrollHeight;
  964  |     return canScroll;
  965  |   });
  966  |   if (workspaceCanScroll) {
  967  |     await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  968  |   }
  969  |   await expect
  970  |     .poll(() =>
  971  |       workspace.evaluate((element) => {
  972  |         const last = element.lastElementChild;
  973  |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  974  |       }),
  975  |     )
  976  |     .toBe(true);
  977  | 
  978  |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  979  |   await programsTab.click();
  980  |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  981  |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  982  |   await expect(dayButtons).toHaveCount(4);
  983  |   await dayButtons.nth(0).click();
  984  |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  985  |   await expect(page.getByRole("dialog", { name: "בניית תוכנית ותפריט למתאמן" })).toHaveCount(0);
  986  |   await expect(page.locator("#coach-programs")).toBeHidden();
  987  |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  988  |   await expect(workoutSurface).toBeVisible();
  989  |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  990  |   await expect(reportToggle).toBeVisible();
  991  |   await reportToggle.click();
  992  |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  993  |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  994  |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  995  |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  996  | 
  997  |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  998  |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  999  | 
  1000 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  1001 |   await setCountInput.fill("4");
  1002 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  1003 |   const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1004 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  1005 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  1006 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  1007 | 
  1008 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1009 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1010 |   await expect(setCountInput).toHaveValue("4");
  1011 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1012 |   await expect(
  1013 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1014 |   ).toHaveValue("8");
  1015 |   await expect(
  1016 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  1017 |   ).toHaveValue("12");
  1018 | 
  1019 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  1020 |   await thirdSetMode.selectOption("drop");
  1021 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  1022 |   await dropRestInput.fill("45");
  1023 |   await expect(dropRestInput).toHaveValue("45");
  1024 | 
  1025 |   await thirdSetMode.selectOption("superset");
  1026 |   const supersetSearch = page.getByRole("searchbox", {
  1027 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  1028 |   });
  1029 |   await supersetSearch.fill("תרגיל בדיקה 2");
  1030 |   const supersetOption = page
  1031 |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  1032 |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  1033 |   await expect(supersetOption).toBeVisible();
  1034 |   await supersetOption.click({ force: true });
  1035 |   await expect(supersetSearch).toHaveValue("");
  1036 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1037 |     timeout: 20_000,
  1038 |   });
  1039 | 
  1040 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1041 |   await expect(dayButtons).toHaveCount(4);
  1042 | 
  1043 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1044 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
```