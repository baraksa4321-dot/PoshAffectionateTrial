# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1009:1

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
    20 × locator resolved to <section data-testid="coach-client-message-profile" data-tsd-source="/src/routes/coach.tsx:9730:15" class="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.035] p-4">…</section>
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
  942  |             status: 200,
  943  |             headers: {
  944  |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  945  |               "content-type": "application/json",
  946  |             },
  947  |           });
  948  |         }
  949  |         return originalFetch(input, init);
  950  |       };
  951  |     },
  952  |     {
  953  |       cacheKey: `gymtrack.v1.user.${userId}`,
  954  |       cacheValue: resolvedCacheValue,
  955  |       bootCacheValue,
  956  |       session: authSession(role),
  957  |       clientProfile: fixtureClientProfile,
  958  |       otherClientProfile,
  959  |       coachProfile,
  960  |       program,
  961  |       otherProgram,
  962  |       workouts,
  963  |       nutritionDay,
  964  |       cardioLog,
  965  |       otherCardioLog,
  966  |       bodyWeightLog,
  967  |       otherBodyWeightLog,
  968  |       bodyMeasurement,
  969  |       otherBodyMeasurement,
  970  |       habit,
  971  |       otherHabit,
  972  |       coachMessage,
  973  |       otherCoachMessage,
  974  |       broadcastAnnouncement,
  975  |       challenge,
  976  |       householdFoods,
  977  |       initialOnline: online,
  978  |       failSelectedTraineeDataOnce,
  979  |       pendingChanges,
  980  |       trackBootCacheTiming,
  981  |     },
  982  |   );
  983  | }
  984  | 
  985  | function assertKeyboardVisible(locator) {
  986  |   return locator.scrollIntoViewIfNeeded().then(() =>
  987  |     expect
  988  |       .poll(
  989  |         async () => {
  990  |           return locator.evaluate((element) => {
  991  |             const rect = element.getBoundingClientRect();
  992  |             const viewport = window.visualViewport;
  993  |             const viewportTop = viewport?.offsetTop ?? 0;
  994  |             const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
  995  |             return {
  996  |               focused: document.activeElement === element,
  997  |               visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
  998  |             };
  999  |           });
  1000 |         },
  1001 |         {
  1002 |           message: "The focused feedback field did not settle inside the visible iPhone viewport.",
  1003 |         },
  1004 |       )
  1005 |       .toMatchObject({ focused: true, visible: true }),
  1006 |   );
  1007 | }
  1008 | 
  1009 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  1010 |   await installFixture(page);
  1011 | 
  1012 |   await page.goto("/");
  1013 |   const coachNav = page.getByTestId("link-nav-coach");
  1014 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1015 |   await coachNav.click();
  1016 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1017 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1018 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  1019 | 
  1020 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  1021 |   await clientCard.click();
  1022 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  1023 | 
  1024 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1025 |   await test.step("load selected trainee details", async () => {
  1026 |     await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1027 |       timeout: 20_000,
  1028 |     });
  1029 |     await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1030 |     await expect(workspace.getByTestId("coach-client-details-error")).toHaveCount(0);
  1031 |   });
  1032 |   await test.step("open trainee profile and send a message", async () => {
  1033 |     await expect(page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true })).toHaveCount(
  1034 |       0,
  1035 |     );
  1036 |     await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1037 |     const profileMessage = page.getByTestId("coach-client-message-profile");
  1038 |     await expect(profileMessage).toBeVisible();
  1039 |     const profileMessageText = "הודעה שנשלחה מהפרופיל";
  1040 |     await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1041 |     await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
> 1042 |     await expect(profileMessage).toContainText("הודעת החיזוק נשלחה בהצלחה למתאמן!");
       |                                  ^ Error: expect(locator).toContainText(expected) failed
  1043 |     await expect(profileMessage).toContainText(profileMessageText);
  1044 |   });
  1045 |   const profileInline = page.locator('[data-coach-client-profile-inline="true"]');
  1046 |   await expect(profileInline).toBeVisible();
  1047 |   await expect(page.getByRole("dialog", { name: "פרופיל המשתמש" })).toHaveCount(0);
  1048 |   const activityHistory = page.getByTestId("coach-activity-history");
  1049 |   await expect(activityHistory).toBeVisible();
  1050 |   await expect(profileInline).toContainText("63.4");
  1051 |   await expect(profileInline).toContainText("74");
  1052 |   await expect(profileInline).toContainText("8,500");
  1053 |   await expect(profileInline).toContainText("כל הכבוד על ההתמדה השבוע");
  1054 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  1055 |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  1056 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1057 | 
  1058 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  1059 |   const workspaceCanScroll = await workspace.evaluate((element) => {
  1060 |     const canScroll = element.scrollHeight > element.clientHeight + 1;
  1061 |     if (canScroll) element.scrollTop = element.scrollHeight;
  1062 |     return canScroll;
  1063 |   });
  1064 |   if (workspaceCanScroll) {
  1065 |     await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  1066 |   }
  1067 |   await expect
  1068 |     .poll(() =>
  1069 |       workspace.evaluate((element) => {
  1070 |         const last = element.lastElementChild;
  1071 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  1072 |       }),
  1073 |     )
  1074 |     .toBe(true);
  1075 | 
  1076 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  1077 |   await programsTab.click();
  1078 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  1079 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  1080 |   await expect(dayButtons).toHaveCount(4);
  1081 |   await dayButtons.nth(0).click();
  1082 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  1083 |   await expect(page.getByRole("dialog", { name: "בניית תוכנית ותפריט למתאמן" })).toHaveCount(0);
  1084 |   await expect(page.locator("#coach-programs")).toBeHidden();
  1085 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  1086 |   await expect(workoutSurface).toBeVisible();
  1087 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  1088 |   await expect(reportToggle).toBeVisible();
  1089 |   await reportToggle.click();
  1090 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  1091 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  1092 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  1093 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  1094 | 
  1095 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1096 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1097 | 
  1098 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  1099 |   await setCountInput.fill("4");
  1100 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  1101 |   const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1102 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  1103 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  1104 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  1105 | 
  1106 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1107 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1108 |   await expect(setCountInput).toHaveValue("4");
  1109 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1110 |   await expect(
  1111 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1112 |   ).toHaveValue("8");
  1113 |   await expect(
  1114 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  1115 |   ).toHaveValue("12");
  1116 | 
  1117 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  1118 |   await thirdSetMode.selectOption("drop");
  1119 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  1120 |   await dropRestInput.fill("45");
  1121 |   await expect(dropRestInput).toHaveValue("45");
  1122 | 
  1123 |   await thirdSetMode.selectOption("superset");
  1124 |   const supersetSearch = page.getByRole("searchbox", {
  1125 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  1126 |   });
  1127 |   await supersetSearch.fill("תרגיל בדיקה 2");
  1128 |   const supersetOption = page
  1129 |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  1130 |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  1131 |   await expect(supersetOption).toBeVisible();
  1132 |   await supersetOption.click({ force: true });
  1133 |   await expect(supersetSearch).toHaveValue("");
  1134 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1135 |     timeout: 20_000,
  1136 |   });
  1137 | 
  1138 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1139 |   await expect(dayButtons).toHaveCount(4);
  1140 | 
  1141 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1142 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
```