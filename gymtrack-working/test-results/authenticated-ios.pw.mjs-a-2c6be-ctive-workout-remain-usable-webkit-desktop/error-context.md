# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:784:1

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')
Expected: hidden
Received: undefined

Call log:
  - Expect "toBeHidden" with timeout 8000ms
  - waiting for getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')
  - 

```

# Test source

```ts
  879  |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  880  | 
  881  |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  882  |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  883  |   await expect(setCountInput).toHaveValue("4");
  884  |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  885  |   await expect(
  886  |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  887  |   ).toHaveValue("8");
  888  |   await expect(
  889  |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  890  |   ).toHaveValue("12");
  891  | 
  892  |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  893  |   await thirdSetMode.selectOption("drop");
  894  |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  895  |   await dropRestInput.fill("45");
  896  |   await expect(dropRestInput).toHaveValue("45");
  897  | 
  898  |   await thirdSetMode.selectOption("superset");
  899  |   const supersetSearch = page.getByRole("searchbox", {
  900  |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  901  |   });
  902  |   await supersetSearch.fill("תרגיל בדיקה 2");
  903  |   const supersetOption = page
  904  |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  905  |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  906  |   await expect(supersetOption).toBeVisible();
  907  |   await supersetOption.click({ force: true });
  908  |   await expect(supersetSearch).toHaveValue("");
  909  |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  910  |     timeout: 20_000,
  911  |   });
  912  | 
  913  |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  914  |   await expect(dayButtons).toHaveCount(4);
  915  | 
  916  |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  917  |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  918  |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  919  |   await foodSearch.fill("אורז");
  920  |   await assertKeyboardVisible(foodSearch);
  921  |   await expect(foodSearch).toHaveValue("אורז");
  922  |   await page.getByRole("option", { name: /אורז/ }).first().click();
  923  |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  924  |   await expect(addFoodButton).toBeEnabled();
  925  |   await addFoodButton.click();
  926  |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  927  |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  928  |   await expect(nutritionFoodQuantity).toBeVisible();
  929  |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  930  |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  931  |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  932  |   for (const [index, label] of coachMacroLabels.entries()) {
  933  |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  934  |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  935  |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  936  |   }
  937  |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  938  |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  939  |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  940  | 
  941  |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  942  |   await dayButtons.nth(0).click();
  943  |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  944  |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  945  |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  946  |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  947  | 
  948  |   await page.goto(`/session/${WORKOUT_ID}`);
  949  |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  950  |   const progress = page.locator(".workout-progress-sticky");
  951  |   const firstExercise = page.locator("article").first();
  952  |   const progressBottom = await progress.boundingBox();
  953  |   const firstExerciseTop = await firstExercise.boundingBox();
  954  |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  955  | 
  956  |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  957  |   await repsInput.fill("123");
  958  |   await assertKeyboardVisible(repsInput);
  959  |   await page.keyboard.press("Tab");
  960  |   await expect(repsInput).toHaveValue("123");
  961  | 
  962  |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  963  |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  964  |   await expect(workoutNote).toBeVisible();
  965  |   await workoutNote.fill("הערת בדיקה 123");
  966  |   await assertKeyboardVisible(workoutNote);
  967  |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  968  |   await page.keyboard.press("Escape");
  969  |   await expect(workoutNote).toBeHidden();
  970  | 
  971  |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  972  |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  973  |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  974  |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  975  |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  976  |   await expect(workoutNote).toBeVisible();
  977  |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  978  |   await page.keyboard.press("Escape");
> 979  |   await expect(workoutNote).toBeHidden();
       |                             ^ Error: expect(locator).toBeHidden() failed
  980  | 
  981  |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  982  |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  983  |   await expect(detailsSheet).toBeVisible();
  984  |   await detailsSheet.getByRole("button").first().click();
  985  |   await expect(detailsSheet).toBeHidden();
  986  |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  987  | 
  988  |   await page.locator("article").last().scrollIntoViewIfNeeded();
  989  |   await expect(page.locator("article").last()).toBeInViewport();
  990  | });
  991  | 
  992  | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  993  |   await installFixture(page, { role: "trainee", showCalories: false });
  994  | 
  995  |   await page.goto("/nutrition");
  996  |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  997  |   await expect(plannedFoodQuantity).toBeVisible();
  998  |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  999  | 
  1000 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1001 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1002 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1003 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1004 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1005 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1006 |   }
  1007 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1008 | 
  1009 |   await page.getByRole("button", { name: "החלפה", exact: true }).first().click();
  1010 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1011 |   await expect(replacementDialog).toBeVisible();
  1012 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1013 |   await expect(replacementQuantity).toBeVisible();
  1014 |   await expect(replacementQuantity).toHaveText(/\d/);
  1015 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1016 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1017 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1018 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1019 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1020 |   }
  1021 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1022 | });
  1023 | 
  1024 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1025 |   page,
  1026 | }) => {
  1027 |   await installFixture(page);
  1028 | 
  1029 |   await page.goto("/");
  1030 |   await page.getByTestId("link-nav-coach").click();
  1031 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1032 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1033 | 
  1034 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1035 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1036 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1037 |     timeout: 20_000,
  1038 |   });
  1039 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1040 | 
  1041 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1042 |   await expect(profile).toBeVisible();
  1043 |   await expect(profile).toContainText("63.4");
  1044 |   await expect(profile).toContainText("74");
  1045 |   await expect(profile).toContainText("8,500");
  1046 |   await expect(profile).toContainText("הליכה מהירה");
  1047 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1048 |   await expect(profile).not.toContainText("71.8");
  1049 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1050 | 
  1051 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1052 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1053 |   await expect(workspace).toHaveCount(0);
  1054 | 
  1055 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1056 |   await expect(clientSearch).toBeVisible();
  1057 |   await clientSearch.fill("מתאמנת אחרת");
  1058 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1059 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1060 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1061 |     timeout: 20_000,
  1062 |   });
  1063 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1064 | 
  1065 |   await expect(profile).toBeVisible();
  1066 |   await expect(profile).toContainText("71.8");
  1067 |   await expect(profile).toContainText("88");
  1068 |   await expect(profile).toContainText("1,234");
  1069 |   await expect(profile).toContainText("רכיבה אחרת");
  1070 |   await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  1071 |   await expect(profile).not.toContainText("63.4");
  1072 |   await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  1073 |   await expect(profile).not.toContainText("מתאמנת בדיקה");
  1074 | });
  1075 | 
  1076 | test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  1077 |   await installFixture(page, { failSelectedTraineeDataOnce: true });
  1078 | 
  1079 |   await page.goto("/");
```