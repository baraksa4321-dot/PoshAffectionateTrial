# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1081:1

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  984  |       bodyWeightLog,
  985  |       otherBodyWeightLog,
  986  |       bodyMeasurement,
  987  |       otherBodyMeasurement,
  988  |       habit,
  989  |       otherHabit,
  990  |       coachMessage,
  991  |       otherCoachMessage,
  992  |       broadcastAnnouncement,
  993  |       broadcastAnnouncementAfterReconnect,
  994  |       challenge,
  995  |       householdFoods,
  996  |       initialOnline: online,
  997  |       failSelectedTraineeDataOnce,
  998  |       pendingChanges,
  999  |       trackBootCacheTiming,
  1000 |     },
  1001 |   );
  1002 | }
  1003 | 
  1004 | function assertKeyboardVisible(locator) {
  1005 |   return locator.scrollIntoViewIfNeeded().then(() =>
  1006 |     expect
  1007 |       .poll(
  1008 |         async () => {
  1009 |           return locator.evaluate((element) => {
  1010 |             const rect = element.getBoundingClientRect();
  1011 |             const viewport = window.visualViewport;
  1012 |             const viewportTop = viewport?.offsetTop ?? 0;
  1013 |             const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
  1014 |             return {
  1015 |               focused: document.activeElement === element,
  1016 |               visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
  1017 |             };
  1018 |           });
  1019 |         },
  1020 |         {
  1021 |           message: "The focused feedback field did not settle inside the visible iPhone viewport.",
  1022 |         },
  1023 |       )
  1024 |       .toMatchObject({ focused: true, visible: true }),
  1025 |   );
  1026 | }
  1027 | 
  1028 | test("iPhone loading video is ready and advances before and after hydration", async ({ page }) => {
  1029 |   test.skip(
  1030 |     test.info().project.name !== "webkit-iphone",
  1031 |     "The loading-media regression is specific to the iPhone WebKit profile.",
  1032 |   );
  1033 | 
  1034 |   let releaseHydration;
  1035 |   const hydrationGate = new Promise((resolve) => {
  1036 |     releaseHydration = resolve;
  1037 |   });
  1038 |   await page.route("**/@id/virtual:tanstack-start-dev-client-entry", (route) =>
  1039 |     hydrationGate.then(() => route.continue()),
  1040 |   );
  1041 | 
  1042 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  1043 |   const loadingVideo = page.locator(".loading-simple-video");
  1044 |   await expect(loadingVideo).toHaveCount(1);
  1045 |   expect(await page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(false);
  1046 | 
  1047 |   const readVideoState = () =>
  1048 |     loadingVideo.evaluate((video) => ({
  1049 |       currentTime: video.currentTime,
  1050 |       duration: video.duration,
  1051 |       readyState: video.readyState,
  1052 |     }));
  1053 |   const assertVideoAdvances = async () => {
  1054 |     await expect.poll(async () => (await readVideoState()).readyState).toBeGreaterThanOrEqual(2);
  1055 |     const first = await readVideoState();
  1056 |     await page.waitForTimeout(250);
  1057 |     const second = await readVideoState();
  1058 |     expect(second.readyState).toBeGreaterThanOrEqual(2);
  1059 | 
  1060 |     const elapsed =
  1061 |       Number.isFinite(second.duration) && second.currentTime < first.currentTime
  1062 |         ? second.duration - first.currentTime + second.currentTime
  1063 |         : second.currentTime - first.currentTime;
  1064 |     expect(elapsed).toBeGreaterThan(0.05);
  1065 |   };
  1066 | 
  1067 |   // The watchdog owns this server-rendered shell while the app module is
  1068 |   // intentionally held back. This catches a loaded-but-frozen first frame.
  1069 |   await assertVideoAdvances();
  1070 | 
  1071 |   releaseHydration();
  1072 |   await expect.poll(() => page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(true);
  1073 | 
  1074 |   // A fast unauthenticated hydration may remove the splash immediately. When
  1075 |   // WebKit keeps it visible long enough, verify the React-owned node too.
  1076 |   if (await loadingVideo.count()) {
  1077 |     await assertVideoAdvances();
  1078 |   }
  1079 | });
  1080 | 
  1081 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  1082 |   await installFixture(page);
  1083 | 
> 1084 |   await page.goto("/");
       |              ^ Error: page.goto: Page crashed
  1085 |   const coachNav = page.getByTestId("link-nav-coach");
  1086 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1087 |   await coachNav.click();
  1088 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1089 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  1090 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  1091 | 
  1092 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  1093 |   await clientCard.click();
  1094 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  1095 | 
  1096 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1097 |   await test.step("load selected trainee details", async () => {
  1098 |     await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1099 |       timeout: 20_000,
  1100 |     });
  1101 |     await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
  1102 |     await expect(workspace.getByTestId("coach-client-details-error")).toHaveCount(0);
  1103 |   });
  1104 |   await test.step("open trainee profile and send a message", async () => {
  1105 |     await expect(page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true })).toHaveCount(
  1106 |       0,
  1107 |     );
  1108 |     await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1109 |     const profileMessage = page.getByTestId("coach-client-message-profile");
  1110 |     await expect(profileMessage).toBeVisible();
  1111 |     const profileMessageText = "הודעה שנשלחה מהפרופיל";
  1112 |     await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  1113 |     await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  1114 |     await expect(profileMessage).toContainText("הודעת החיזוק נשלחה בהצלחה למתאמן!");
  1115 |     await expect(profileMessage).toContainText(profileMessageText);
  1116 |   });
  1117 |   const profileInline = page.locator('[data-coach-client-profile-inline="true"]');
  1118 |   await expect(profileInline).toBeVisible();
  1119 |   await expect(page.getByRole("dialog", { name: "פרופיל המשתמש" })).toHaveCount(0);
  1120 |   const activityHistory = page.getByTestId("coach-activity-history");
  1121 |   await expect(activityHistory).toBeVisible();
  1122 |   await expect(profileInline).toContainText("63.4");
  1123 |   await expect(profileInline).toContainText("74");
  1124 |   await expect(profileInline).toContainText("8,500");
  1125 |   await expect(profileInline).toContainText("כל הכבוד על ההתמדה השבוע");
  1126 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  1127 |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  1128 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1129 | 
  1130 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  1131 |   const workspaceCanScroll = await workspace.evaluate((element) => {
  1132 |     const canScroll = element.scrollHeight > element.clientHeight + 1;
  1133 |     if (canScroll) element.scrollTop = element.scrollHeight;
  1134 |     return canScroll;
  1135 |   });
  1136 |   if (workspaceCanScroll) {
  1137 |     await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  1138 |   }
  1139 |   await expect
  1140 |     .poll(() =>
  1141 |       workspace.evaluate((element) => {
  1142 |         const last = element.lastElementChild;
  1143 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  1144 |       }),
  1145 |     )
  1146 |     .toBe(true);
  1147 | 
  1148 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  1149 |   await programsTab.click();
  1150 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  1151 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  1152 |   await expect(dayButtons).toHaveCount(4);
  1153 |   await dayButtons.nth(0).click();
  1154 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  1155 |   await expect(page.getByRole("dialog", { name: "בניית תוכנית ותפריט למתאמן" })).toHaveCount(0);
  1156 |   await expect(page.locator("#coach-programs")).toBeHidden();
  1157 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  1158 |   await expect(workoutSurface).toBeVisible();
  1159 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  1160 |   await expect(reportToggle).toBeVisible();
  1161 |   await reportToggle.click();
  1162 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  1163 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  1164 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  1165 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  1166 | 
  1167 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1168 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1169 | 
  1170 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  1171 |   await setCountInput.fill("4");
  1172 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  1173 |   const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1174 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  1175 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  1176 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  1177 | 
  1178 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1179 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1180 |   await expect(setCountInput).toHaveValue("4");
  1181 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1182 |   await expect(
  1183 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1184 |   ).toHaveValue("8");
```