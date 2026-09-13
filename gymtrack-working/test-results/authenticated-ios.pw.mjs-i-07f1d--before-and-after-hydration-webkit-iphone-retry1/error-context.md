# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> iPhone loading video is ready and advances before and after hydration
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1029:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.loading-simple-video')
Expected: 1
Received: 0
Timeout:  8000ms

Call log:
  - Expect "toHaveCount" with timeout 8000ms
  - waiting for locator('.loading-simple-video')
    20 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - status "MY routine נטען" [ref=e3]:
    - status "טוען" [ref=e5]
  - img "MY routine" [ref=e6]
```

# Test source

```ts
  945  |               },
  946  |             ];
  947  |           }
  948  |           if ((init?.method ?? "GET").toUpperCase() === "GET") {
  949  |             window.__iosSmokeRemoteGetCount += 1;
  950  |             if (expectedInitialPullPaths.has(path)) {
  951  |               initialPullPaths.add(path);
  952  |               if (
  953  |                 initialPullPaths.size === expectedInitialPullPaths.size &&
  954  |                 window.__iosSmokeInitialPullCompleteAt === null
  955  |               ) {
  956  |                 window.__iosSmokeInitialPullCompleteAt = performance.now();
  957  |               }
  958  |             }
  959  |           }
  960  |           return new Response(JSON.stringify(body), {
  961  |             status: 200,
  962  |             headers: {
  963  |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  964  |               "content-type": "application/json",
  965  |             },
  966  |           });
  967  |         }
  968  |         return originalFetch(input, init);
  969  |       };
  970  |     },
  971  |     {
  972  |       cacheKey: `gymtrack.v1.user.${userId}`,
  973  |       cacheValue: resolvedCacheValue,
  974  |       bootCacheValue,
  975  |       session: authSession(role),
  976  |       clientProfile: fixtureClientProfile,
  977  |       otherClientProfile,
  978  |       coachProfile,
  979  |       program,
  980  |       otherProgram,
  981  |       workouts,
  982  |       nutritionDay,
  983  |       cardioLog,
  984  |       otherCardioLog,
  985  |       bodyWeightLog,
  986  |       otherBodyWeightLog,
  987  |       bodyMeasurement,
  988  |       otherBodyMeasurement,
  989  |       habit,
  990  |       otherHabit,
  991  |       coachMessage,
  992  |       otherCoachMessage,
  993  |       broadcastAnnouncement,
  994  |       broadcastAnnouncementAfterReconnect,
  995  |       challenge,
  996  |       householdFoods,
  997  |       initialOnline: online,
  998  |       failSelectedTraineeDataOnce,
  999  |       pendingChanges,
  1000 |       trackBootCacheTiming,
  1001 |     },
  1002 |   );
  1003 | }
  1004 | 
  1005 | function assertKeyboardVisible(locator) {
  1006 |   return locator.scrollIntoViewIfNeeded().then(() =>
  1007 |     expect
  1008 |       .poll(
  1009 |         async () => {
  1010 |           return locator.evaluate((element) => {
  1011 |             const rect = element.getBoundingClientRect();
  1012 |             const viewport = window.visualViewport;
  1013 |             const viewportTop = viewport?.offsetTop ?? 0;
  1014 |             const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
  1015 |             return {
  1016 |               focused: document.activeElement === element,
  1017 |               visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
  1018 |             };
  1019 |           });
  1020 |         },
  1021 |         {
  1022 |           message: "The focused feedback field did not settle inside the visible iPhone viewport.",
  1023 |         },
  1024 |       )
  1025 |       .toMatchObject({ focused: true, visible: true }),
  1026 |   );
  1027 | }
  1028 | 
  1029 | test("iPhone loading video is ready and advances before and after hydration", async ({ page }) => {
  1030 |   test.skip(
  1031 |     test.info().project.name !== "webkit-iphone",
  1032 |     "The loading-media regression is specific to the iPhone WebKit profile.",
  1033 |   );
  1034 | 
  1035 |   let releaseHydration;
  1036 |   const hydrationGate = new Promise((resolve) => {
  1037 |     releaseHydration = resolve;
  1038 |   });
  1039 |   await page.route("**/@id/virtual:tanstack-start-dev-client-entry", (route) =>
  1040 |     hydrationGate.then(() => route.continue()),
  1041 |   );
  1042 | 
  1043 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  1044 |   const loadingVideo = page.locator(".loading-simple-video");
> 1045 |   await expect(loadingVideo).toHaveCount(1);
       |                              ^ Error: expect(locator).toHaveCount(expected) failed
  1046 |   expect(await page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(false);
  1047 | 
  1048 |   const readVideoState = () =>
  1049 |     loadingVideo.evaluate((video) => ({
  1050 |       currentTime: video.currentTime,
  1051 |       duration: video.duration,
  1052 |       readyState: video.readyState,
  1053 |     }));
  1054 |   const assertVideoAdvances = async () => {
  1055 |     await expect.poll(async () => (await readVideoState()).readyState).toBeGreaterThanOrEqual(2);
  1056 |     const first = await readVideoState();
  1057 |     await page.waitForTimeout(250);
  1058 |     const second = await readVideoState();
  1059 |     expect(second.readyState).toBeGreaterThanOrEqual(2);
  1060 | 
  1061 |     const elapsed =
  1062 |       Number.isFinite(second.duration) && second.currentTime < first.currentTime
  1063 |         ? second.duration - first.currentTime + second.currentTime
  1064 |         : second.currentTime - first.currentTime;
  1065 |     expect(elapsed).toBeGreaterThan(0.05);
  1066 |   };
  1067 | 
  1068 |   // The watchdog owns this server-rendered shell while the app module is
  1069 |   // intentionally held back. This catches a loaded-but-frozen first frame.
  1070 |   await assertVideoAdvances();
  1071 | 
  1072 |   releaseHydration();
  1073 |   await expect.poll(() => page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(true);
  1074 | 
  1075 |   // A fast unauthenticated hydration may remove the splash immediately. When
  1076 |   // WebKit keeps it visible long enough, verify the React-owned node too.
  1077 |   if (await loadingVideo.count()) {
  1078 |     await assertVideoAdvances();
  1079 |   }
  1080 | });
  1081 | 
  1082 | test("signup collects a bounded date of birth", async ({ page }) => {
  1083 |   await page.goto("/");
  1084 | 
  1085 |   await page.getByRole("button", { name: /אין לך חשבון\?/ }).click();
  1086 |   const dateOfBirth = page.locator("#signup-date-of-birth");
  1087 |   await expect(dateOfBirth).toBeVisible();
  1088 | 
  1089 |   const bounds = await dateOfBirth.evaluate((input) => ({
  1090 |     required: input.required,
  1091 |     min: input.min,
  1092 |     max: input.max,
  1093 |   }));
  1094 |   const expectedBounds = await page.evaluate(() => {
  1095 |     const today = new Date();
  1096 |     const year = today.getFullYear();
  1097 |     const month = String(today.getMonth() + 1).padStart(2, "0");
  1098 |     const day = String(today.getDate()).padStart(2, "0");
  1099 |     return {
  1100 |       min: `${year - 120}-01-01`,
  1101 |       max: `${year}-${month}-${day}`,
  1102 |     };
  1103 |   });
  1104 | 
  1105 |   expect(bounds).toEqual({
  1106 |     required: true,
  1107 |     ...expectedBounds,
  1108 |   });
  1109 | });
  1110 | 
  1111 | test("coach BMR editor restores date of birth and keeps age read-only", async ({ page }) => {
  1112 |   await installFixture(page, { online: true });
  1113 | 
  1114 |   await page.goto(`/coach/clients/${CLIENT_ID}`);
  1115 | 
  1116 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1117 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1118 |     timeout: 20_000,
  1119 |   });
  1120 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1121 |   const bmrButton = page.getByRole("button", { name: "מחשבון BMR", exact: true });
  1122 |   await bmrButton.evaluate((element) =>
  1123 |     element.scrollIntoView({ block: "center", inline: "nearest" }),
  1124 |   );
  1125 |   await bmrButton.dispatchEvent("click");
  1126 | 
  1127 |   const bmrEditor = page.getByTestId("coach-bmr-editor");
  1128 |   await expect(bmrEditor).toBeVisible();
  1129 |   await expect(bmrEditor.locator('input[type="date"]')).toHaveValue("1998-05-17");
  1130 |   await expect(bmrEditor.getByText("גיל מחושב: 28", { exact: true })).toBeVisible();
  1131 |   const manualAgeInputs = await bmrEditor.locator("input").evaluateAll((inputs) =>
  1132 |     inputs.filter((input) => {
  1133 |       const labelText = input.closest("label")?.textContent?.trim() ?? "";
  1134 |       return labelText.startsWith("גיל");
  1135 |     }).length,
  1136 |   );
  1137 |   expect(manualAgeInputs).toBe(0);
  1138 | });
  1139 | 
  1140 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  1141 |   await installFixture(page);
  1142 | 
  1143 |   await page.goto("/");
  1144 |   const coachNav = page.getByTestId("link-nav-coach");
  1145 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
```