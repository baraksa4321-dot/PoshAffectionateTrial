# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1074:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'שמור שינויי תרגיל', exact: true })

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
        - generic [ref=e12]:
          - paragraph [ref=e13]: בניית תוכניות ותפריטים
          - heading "עריכה" [level=1] [ref=e14]
        - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=e16]
  - main [ref=e21]:
    - generic [ref=e22]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - paragraph [ref=e31]: בניית אימון
          - textbox "שם יום האימון" [ref=e32]: אימון בדיקה ארוך
          - generic [ref=e33]:
            - text: יום קבוע בשבוע
            - combobox "יום קבוע בשבוע" [ref=e34]:
              - option "בחרי יום בשבוע" [disabled] [selected]
              - option "ראשון"
              - option "שני"
              - option "שלישי"
              - option "רביעי"
              - option "חמישי"
              - option "שישי"
              - option "שבת"
          - paragraph [ref=e35]: 8 תרגילים בתוכנית
        - generic [ref=e36]:
          - button "סגירת הוספה" [expanded] [ref=e37]
          - button "סגירת בניית אימון" [ref=e39]
      - generic [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: תרגיל בדיקה 1 (Smoke Exercise 1)
              - generic [ref=e48]: מכונה · 20 ק״ג לכל צד· 4 סטים × 8-8 חזרות
            - generic [ref=e49]:
              - button "סגירה" [ref=e50]
              - button "הסר את תרגיל בדיקה 1" [ref=e51] [cursor=pointer]
          - generic [ref=e56]:
            - generic [ref=e57]:
              - paragraph [ref=e58]: עריכת תרגיל באימון
              - button "ביטול עריכה" [ref=e59]
            - generic [ref=e60]:
              - generic [ref=e61]: בחרי תרגיל מספרייה
              - button "תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=e62]
            - generic [ref=e68]:
              - generic [ref=e69]: חיפוש מכשיר / ציוד לתרגיל
              - textbox "חיפוש מכשיר / ציוד לתרגיל" [ref=e71]:
                - /placeholder: חיפוש מכשיר...
                - text: מכונה
            - paragraph [ref=e72]: השינויים עודכנו אוטומטית.
            - generic [ref=e73]:
              - paragraph [ref=e74]: הגדרת סטים
              - generic [ref=e75]:
                - text: מספר סטים
                - textbox "מספר סטים" [ref=e76]: "4"
            - generic [ref=e77]:
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - generic [ref=e80]: סט 1
                  - combobox "סוג סט 1" [ref=e82]:
                    - option "סט רגיל" [selected]
                    - option "סט חימום"
                    - option "דרופ סט"
                    - option "סופר־סט"
                - generic [ref=e83]:
                  - generic [ref=e84]:
                    - text: משקל לכל צד (ק״ג)
                    - textbox "משקל לכל צד (ק״ג)" [ref=e85]: "20"
                  - generic [ref=e86]:
                    - text: חזרות מינ׳
                    - textbox "חזרות מינ׳" [ref=e87]: "8"
                  - generic [ref=e88]:
                    - text: חזרות מקס׳
                    - textbox "חזרות מקס׳" [ref=e89]: "8"
                  - generic [ref=e90]:
                    - text: הערה לסט
                    - textbox "הערה לסט" [ref=e91]:
                      - /placeholder: "למשל: עד כשל"
                  - generic [ref=e92]:
                    - text: זמן מנוחה (שניות)
                    - textbox "זמן מנוחה (שניות)" [ref=e93]: "60"
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - generic [ref=e96]: סט 2
                  - generic [ref=e97]:
                    - button "העתק מהקודם" [ref=e98]
                    - combobox "סוג סט 2" [ref=e99]:
                      - option "סט רגיל" [selected]
                      - option "סט חימום"
                      - option "דרופ סט"
                      - option "סופר־סט"
                - generic [ref=e100]:
                  - generic [ref=e101]:
                    - text: משקל לכל צד (ק״ג)
                    - textbox "משקל לכל צד (ק״ג)" [ref=e102]: "20"
                  - generic [ref=e103]:
                    - text: חזרות מינ׳
                    - textbox "חזרות מינ׳" [ref=e104]: "8"
                  - generic [ref=e105]:
                    - text: חזרות מקס׳
                    - textbox "חזרות מקס׳" [ref=e106]: "8"
                  - generic [ref=e107]:
                    - text: הערה לסט
                    - textbox "הערה לסט" [ref=e108]:
                      - /placeholder: "למשל: עד כשל"
                  - generic [ref=e109]:
                    - text: זמן מנוחה (שניות)
                    - textbox "זמן מנוחה (שניות)" [ref=e110]: "60"
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]: סט 3
                  - generic [ref=e114]:
                    - button "העתק מהקודם" [ref=e115]
                    - combobox "סוג סט 3" [ref=e116]:
                      - option "סט רגיל" [selected]
                      - option "סט חימום"
                      - option "דרופ סט"
                      - option "סופר־סט"
                - generic [ref=e117]:
                  - generic [ref=e118]:
                    - text: משקל לכל צד (ק״ג)
                    - textbox "משקל לכל צד (ק״ג)" [ref=e119]: "20"
                  - generic [ref=e120]:
                    - text: חזרות מינ׳
                    - textbox "חזרות מינ׳" [ref=e121]: "8"
                  - generic [ref=e122]:
                    - text: חזרות מקס׳
                    - textbox "חזרות מקס׳" [ref=e123]: "8"
                  - generic [ref=e124]:
                    - text: הערה לסט
                    - textbox "הערה לסט" [ref=e125]:
                      - /placeholder: "למשל: עד כשל"
                  - generic [ref=e126]:
                    - text: זמן מנוחה (שניות)
                    - textbox "זמן מנוחה (שניות)" [ref=e127]: "60"
              - generic [ref=e128]:
                - generic [ref=e129]:
                  - generic [ref=e130]: סט 4
                  - generic [ref=e131]:
                    - button "העתק מהקודם" [ref=e132]
                    - combobox "סוג סט 4" [ref=e133]:
                      - option "סט רגיל" [selected]
                      - option "סט חימום"
                      - option "דרופ סט"
                      - option "סופר־סט"
                - generic [ref=e134]:
                  - generic [ref=e135]:
                    - text: משקל לכל צד (ק״ג)
                    - textbox "משקל לכל צד (ק״ג)" [ref=e136]: "20"
                  - generic [ref=e137]:
                    - text: חזרות מינ׳
                    - textbox "חזרות מינ׳" [ref=e138]: "8"
                  - generic [ref=e139]:
                    - text: חזרות מקס׳
                    - textbox "חזרות מקס׳" [active] [ref=e140]: "12"
                  - generic [ref=e141]:
                    - text: הערה לסט
                    - textbox "הערה לסט" [ref=e142]:
                      - /placeholder: "למשל: עד כשל"
                  - generic [ref=e143]:
                    - text: זמן מנוחה (שניות)
                    - textbox "זמן מנוחה (שניות)" [ref=e144]: "60"
            - generic [ref=e145]:
              - text: הערה למתאמן על התרגיל
              - textbox "הערה למתאמן על התרגיל" [ref=e146]:
                - /placeholder: "למשל: לשמור על גב ישר ולבצע לאט..."
            - paragraph [ref=e147]: השינויים נשמרים אוטומטית
        - generic [ref=e149]:
          - generic [ref=e150]:
            - generic [ref=e151]: תרגיל בדיקה 2 (Smoke Exercise 2)
            - generic [ref=e152]: מכונה · 21 ק״ג לכל צד· 3 סטים × 9 חזרות
          - generic [ref=e153]:
            - button "עריכה" [ref=e154]
            - button "הסר את תרגיל בדיקה 2" [ref=e155] [cursor=pointer]
        - generic [ref=e160]:
          - generic [ref=e161]:
            - generic [ref=e162]: תרגיל בדיקה 3 (Smoke Exercise 3)
            - generic [ref=e163]: מכונה · 22 ק״ג לכל צד· 3 סטים × 10 חזרות
          - generic [ref=e164]:
            - button "עריכה" [ref=e165]
            - button "הסר את תרגיל בדיקה 3" [ref=e166] [cursor=pointer]
        - generic [ref=e171]:
          - generic [ref=e172]:
            - generic [ref=e173]: תרגיל בדיקה 4 (Smoke Exercise 4)
            - generic [ref=e174]: מכונה · 23 ק״ג לכל צד· 3 סטים × 11 חזרות
          - generic [ref=e175]:
            - button "עריכה" [ref=e176]
            - button "הסר את תרגיל בדיקה 4" [ref=e177] [cursor=pointer]
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]: תרגיל בדיקה 5 (Smoke Exercise 5)
            - generic [ref=e185]: מכונה · 24 ק״ג לכל צד· 3 סטים × 8 חזרות
          - generic [ref=e186]:
            - button "עריכה" [ref=e187]
            - button "הסר את תרגיל בדיקה 5" [ref=e188] [cursor=pointer]
        - generic [ref=e193]:
          - generic [ref=e194]:
            - generic [ref=e195]: תרגיל בדיקה 6 (Smoke Exercise 6)
            - generic [ref=e196]: מכונה · 25 ק״ג לכל צד· 3 סטים × 9 חזרות
          - generic [ref=e197]:
            - button "עריכה" [ref=e198]
            - button "הסר את תרגיל בדיקה 6" [ref=e199] [cursor=pointer]
        - generic [ref=e204]:
          - generic [ref=e205]:
            - generic [ref=e206]: תרגיל בדיקה 7 (Smoke Exercise 7)
            - generic [ref=e207]: מכונה · 26 ק״ג לכל צד· 3 סטים × 10 חזרות
          - generic [ref=e208]:
            - button "עריכה" [ref=e209]
            - button "הסר את תרגיל בדיקה 7" [ref=e210] [cursor=pointer]
        - generic [ref=e215]:
          - generic [ref=e216]:
            - generic [ref=e217]: תרגיל בדיקה 8 (Smoke Exercise 8)
            - generic [ref=e218]: מכונה · 27 ק״ג לכל צד· 3 סטים × 11 חזרות
          - generic [ref=e219]:
            - button "עריכה" [ref=e220]
            - button "הסר את תרגיל בדיקה 8" [ref=e221] [cursor=pointer]
      - button "פתיחת דוח" [ref=e225]:
        - generic [ref=e226]: דוח
  - navigation "ניווט ראשי":
    - generic [ref=e227]:
      - link [ref=e228]:
        - /url: /coach
      - link "מתאמנים" [ref=e232]:
        - /url: /coach/clients
      - link "מעקב" [ref=e239]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e243]:
        - /url: /exercises
```

# Test source

```ts
  1069 |   if (await loadingVideo.count()) {
  1070 |     await assertVideoAdvances();
  1071 |   }
  1072 | });
  1073 | 
  1074 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  1075 |   await installFixture(page);
  1076 | 
  1077 |   await page.goto("/");
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
> 1169 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
       |                                                                              ^ Error: locator.click: Test timeout of 45000ms exceeded.
  1170 | 
  1171 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1172 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1173 |   await expect(setCountInput).toHaveValue("4");
  1174 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1175 |   await expect(
  1176 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1177 |   ).toHaveValue("8");
  1178 |   await expect(
  1179 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  1180 |   ).toHaveValue("12");
  1181 | 
  1182 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  1183 |   await thirdSetMode.selectOption("drop");
  1184 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  1185 |   await dropRestInput.fill("45");
  1186 |   await expect(dropRestInput).toHaveValue("45");
  1187 | 
  1188 |   await thirdSetMode.selectOption("superset");
  1189 |   const supersetSearch = page.getByRole("searchbox", {
  1190 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  1191 |   });
  1192 |   await supersetSearch.fill("תרגיל בדיקה 2");
  1193 |   const supersetOption = page
  1194 |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  1195 |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  1196 |   await expect(supersetOption).toBeVisible();
  1197 |   await supersetOption.click({ force: true });
  1198 |   await expect(supersetSearch).toHaveValue("");
  1199 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1200 |     timeout: 20_000,
  1201 |   });
  1202 | 
  1203 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1204 |   await expect(dayButtons).toHaveCount(4);
  1205 | 
  1206 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1207 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  1208 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1209 |   await foodSearch.fill("אורז");
  1210 |   await assertKeyboardVisible(foodSearch);
  1211 |   await expect(foodSearch).toHaveValue("אורז");
  1212 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1213 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1214 |   await expect(addFoodButton).toBeEnabled();
  1215 |   await addFoodButton.click();
  1216 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1217 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1218 |   await expect(nutritionFoodQuantity).toBeVisible();
  1219 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1220 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1221 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1222 |   for (const [index, label] of coachMacroLabels.entries()) {
  1223 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1224 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1225 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1226 |   }
  1227 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1228 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1229 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1230 | 
  1231 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1232 |   await dayButtons.nth(0).click();
  1233 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1234 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1235 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1236 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1237 | 
  1238 |   await page.goto(`/session/${WORKOUT_ID}`);
  1239 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1240 |   const progress = page.locator(".workout-progress-sticky");
  1241 |   const firstExercise = page.locator("article").first();
  1242 |   const progressBottom = await progress.boundingBox();
  1243 |   const firstExerciseTop = await firstExercise.boundingBox();
  1244 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1245 | 
  1246 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1247 |   await repsInput.fill("123");
  1248 |   await assertKeyboardVisible(repsInput);
  1249 |   await page.keyboard.press("Tab");
  1250 |   await expect(repsInput).toHaveValue("123");
  1251 | 
  1252 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1253 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1254 |   await expect(workoutNote).toBeVisible();
  1255 |   await workoutNote.fill("הערת בדיקה 123");
  1256 |   await assertKeyboardVisible(workoutNote);
  1257 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1258 |   await page.keyboard.press("Escape");
  1259 |   await expect(workoutNote).toBeHidden();
  1260 | 
  1261 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1262 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1263 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1264 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1265 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1266 |   await expect(workoutNote).toBeVisible();
  1267 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1268 |   await page.keyboard.press("Escape");
  1269 |   await expect(workoutNote).toBeHidden();
```