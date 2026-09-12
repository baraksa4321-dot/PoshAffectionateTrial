# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1074:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  977  |       otherCardioLog,
  978  |       bodyWeightLog,
  979  |       otherBodyWeightLog,
  980  |       bodyMeasurement,
  981  |       otherBodyMeasurement,
  982  |       habit,
  983  |       otherHabit,
  984  |       coachMessage,
  985  |       otherCoachMessage,
  986  |       broadcastAnnouncement,
  987  |       challenge,
  988  |       householdFoods,
  989  |       initialOnline: online,
  990  |       failSelectedTraineeDataOnce,
  991  |       pendingChanges,
  992  |       trackBootCacheTiming,
  993  |     },
  994  |   );
  995  | }
  996  | 
  997  | function assertKeyboardVisible(locator) {
  998  |   return locator.scrollIntoViewIfNeeded().then(() =>
  999  |     expect
  1000 |       .poll(
  1001 |         async () => {
  1002 |           return locator.evaluate((element) => {
  1003 |             const rect = element.getBoundingClientRect();
  1004 |             const viewport = window.visualViewport;
  1005 |             const viewportTop = viewport?.offsetTop ?? 0;
  1006 |             const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
  1007 |             return {
  1008 |               focused: document.activeElement === element,
  1009 |               visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
  1010 |             };
  1011 |           });
  1012 |         },
  1013 |         {
  1014 |           message: "The focused feedback field did not settle inside the visible iPhone viewport.",
  1015 |         },
  1016 |       )
  1017 |       .toMatchObject({ focused: true, visible: true }),
  1018 |   );
  1019 | }
  1020 | 
  1021 | test("iPhone loading video is ready and advances before and after hydration", async ({ page }) => {
  1022 |   test.skip(
  1023 |     test.info().project.name !== "webkit-iphone",
  1024 |     "The loading-media regression is specific to the iPhone WebKit profile.",
  1025 |   );
  1026 | 
  1027 |   let releaseHydration;
  1028 |   const hydrationGate = new Promise((resolve) => {
  1029 |     releaseHydration = resolve;
  1030 |   });
  1031 |   await page.route("**/@id/virtual:tanstack-start-dev-client-entry", (route) =>
  1032 |     hydrationGate.then(() => route.continue()),
  1033 |   );
  1034 | 
  1035 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  1036 |   const loadingVideo = page.locator(".loading-simple-video");
  1037 |   await expect(loadingVideo).toHaveCount(1);
  1038 |   expect(await page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(false);
  1039 | 
  1040 |   const readVideoState = () =>
  1041 |     loadingVideo.evaluate((video) => ({
  1042 |       currentTime: video.currentTime,
  1043 |       duration: video.duration,
  1044 |       readyState: video.readyState,
  1045 |     }));
  1046 |   const assertVideoAdvances = async () => {
  1047 |     await expect.poll(async () => (await readVideoState()).readyState).toBeGreaterThanOrEqual(2);
  1048 |     const first = await readVideoState();
  1049 |     await page.waitForTimeout(250);
  1050 |     const second = await readVideoState();
  1051 |     expect(second.readyState).toBeGreaterThanOrEqual(2);
  1052 | 
  1053 |     const elapsed =
  1054 |       Number.isFinite(second.duration) && second.currentTime < first.currentTime
  1055 |         ? second.duration - first.currentTime + second.currentTime
  1056 |         : second.currentTime - first.currentTime;
  1057 |     expect(elapsed).toBeGreaterThan(0.05);
  1058 |   };
  1059 | 
  1060 |   // The watchdog owns this server-rendered shell while the app module is
  1061 |   // intentionally held back. This catches a loaded-but-frozen first frame.
  1062 |   await assertVideoAdvances();
  1063 | 
  1064 |   releaseHydration();
  1065 |   await expect.poll(() => page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(true);
  1066 | 
  1067 |   // A fast unauthenticated hydration may remove the splash immediately. When
  1068 |   // WebKit keeps it visible long enough, verify the React-owned node too.
  1069 |   if (await loadingVideo.count()) {
  1070 |     await assertVideoAdvances();
  1071 |   }
  1072 | });
  1073 | 
  1074 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  1075 |   await installFixture(page);
  1076 | 
> 1077 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1078 |   const coachNav = page.getByTestId("link-nav-coach");
  1079 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1080 |   await coachNav.click();
  1081 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1082 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1083 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  1084 | 
  1085 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  1086 |   await clientCard.click();
  1087 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  1088 | 
  1089 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1090 |   await test.step("load selected trainee details", async () => {
  1091 |     await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1092 |       timeout: 20_000,
  1093 |     });
  1094 |     await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1095 |     await expect(workspace.getByTestId("coach-client-details-error")).toHaveCount(0);
  1096 |   });
  1097 |   await test.step("open trainee profile and send a message", async () => {
  1098 |     await expect(page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true })).toHaveCount(
  1099 |       0,
  1100 |     );
  1101 |     await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1102 |     const profileMessage = page.getByTestId("coach-client-message-profile");
  1103 |     await expect(profileMessage).toBeVisible();
  1104 |     const profileMessageText = "הודעה שנשלחה מהפרופיל";
  1105 |     await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1106 |     await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1107 |     await expect(profileMessage).toContainText("הודעת החיזוק נשלחה בהצלחה למתאמן!");
  1108 |     await expect(profileMessage).toContainText(profileMessageText);
  1109 |   });
  1110 |   const profileInline = page.locator('[data-coach-client-profile-inline="true"]');
  1111 |   await expect(profileInline).toBeVisible();
  1112 |   await expect(page.getByRole("dialog", { name: "פרופיל המשתמש" })).toHaveCount(0);
  1113 |   const activityHistory = page.getByTestId("coach-activity-history");
  1114 |   await expect(activityHistory).toBeVisible();
  1115 |   await expect(profileInline).toContainText("63.4");
  1116 |   await expect(profileInline).toContainText("74");
  1117 |   await expect(profileInline).toContainText("8,500");
  1118 |   await expect(profileInline).toContainText("כל הכבוד על ההתמדה השבוע");
  1119 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  1120 |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  1121 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1122 | 
  1123 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  1124 |   const workspaceCanScroll = await workspace.evaluate((element) => {
  1125 |     const canScroll = element.scrollHeight > element.clientHeight + 1;
  1126 |     if (canScroll) element.scrollTop = element.scrollHeight;
  1127 |     return canScroll;
  1128 |   });
  1129 |   if (workspaceCanScroll) {
  1130 |     await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  1131 |   }
  1132 |   await expect
  1133 |     .poll(() =>
  1134 |       workspace.evaluate((element) => {
  1135 |         const last = element.lastElementChild;
  1136 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  1137 |       }),
  1138 |     )
  1139 |     .toBe(true);
  1140 | 
  1141 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  1142 |   await programsTab.click();
  1143 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  1144 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  1145 |   await expect(dayButtons).toHaveCount(4);
  1146 |   await dayButtons.nth(0).click();
  1147 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  1148 |   await expect(page.getByRole("dialog", { name: "בניית תוכנית ותפריט למתאמן" })).toHaveCount(0);
  1149 |   await expect(page.locator("#coach-programs")).toBeHidden();
  1150 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  1151 |   await expect(workoutSurface).toBeVisible();
  1152 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  1153 |   await expect(reportToggle).toBeVisible();
  1154 |   await reportToggle.click();
  1155 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  1156 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  1157 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  1158 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  1159 | 
  1160 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1161 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1162 | 
  1163 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  1164 |   await setCountInput.fill("4");
  1165 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  1166 |   const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1167 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  1168 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  1169 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  1170 | 
  1171 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1172 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1173 |   await expect(setCountInput).toHaveValue("4");
  1174 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1175 |   await expect(
  1176 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1177 |   ).toHaveValue("8");
```