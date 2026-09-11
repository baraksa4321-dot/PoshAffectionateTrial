# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:911:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')

```

```yaml
- button "פתח טיימר מנוחה":
  - paragraph: טיימר
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - button "הפעלת אימון משקל גוף": אימון משקל גוף
  - paragraph: תוכנית בדיקה לאייפון
  - heading "אימון בדיקה ארוך" [level=1]
  - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
  - button "השהה אימון"
  - button "יציאה מהאימון"
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - paragraph: התקדמות אימון
  - paragraph: 0%
  - article:
    - button "פתח פרטי תרגיל בדיקה 1 (Smoke Exercise 1)"
    - button "תרגיל בדיקה 1 (Smoke Exercise 1)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 123 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "123"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 20 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "20"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 20 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "20"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)"
    - button "תרגיל בדיקה 2 (Smoke Exercise 2)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 21 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "21"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 21 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "21"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 21 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "21"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)"
    - button "תרגיל בדיקה 3 (Smoke Exercise 3)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 22 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "22"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 22 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "22"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 22 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "22"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)"
    - button "תרגיל בדיקה 4 (Smoke Exercise 4)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 23 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "23"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 23 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "23"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 23 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "23"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)"
    - button "תרגיל בדיקה 5 (Smoke Exercise 5)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 24 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "24"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 24 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "24"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 24 ק״ג · 8 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "24"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "8"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)"
    - button "תרגיל בדיקה 6 (Smoke Exercise 6)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 25 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "25"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 25 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "25"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 25 ק״ג · 9 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "25"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "9"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)"
    - button "תרגיל בדיקה 7 (Smoke Exercise 7)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 26 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "26"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 26 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "26"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 26 ק״ג · 10 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "26"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "10"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - article:
    - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)"
    - button "תרגיל בדיקה 8 (Smoke Exercise 8)"
    - paragraph: מכונה
    - button "תחליף מורשה"
    - button "התחל מנוחה": 60ש׳
    - paragraph: ביצוע בפועל
    - text: "1"
    - paragraph: סט 1· 27 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "27"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: "2"
    - paragraph: סט 2· 27 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "27"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: "3"
    - paragraph: סט 3· 27 ק״ג · 11 חזרות
    - button "סמן סט כבוצע"
    - paragraph: משקל בפועל
    - button "הורד משקל בפועל"
    - textbox: "27"
    - text: ק״ג
    - button "הגדל משקל בפועל"
    - paragraph: חזרות בפועל
    - button "הורד חזרות בפועל"
    - textbox: "11"
    - button "הגדל חזרות בפועל"
    - text: בחירה מהגלריה
    - button "בחירה מהגלריה"
    - paragraph: איך היה התרגיל?
    - button "קל"
    - button "מתאים"
    - button "כבד"
    - textbox "כאב, אי־נוחות או הערה למאמנת..."
  - button "סיים ושמור אימון"
- navigation "ניווט ראשי":
  - link:
    - /url: /coach
  - link "מתאמנים":
    - /url: /coach/clients
  - link "מעקב":
    - /url: /coach/tracking
  - link "תרגילים":
    - /url: /exercises
```

# Test source

```ts
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
  1045 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1046 |   await foodSearch.fill("אורז");
  1047 |   await assertKeyboardVisible(foodSearch);
  1048 |   await expect(foodSearch).toHaveValue("אורז");
  1049 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1050 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1051 |   await expect(addFoodButton).toBeEnabled();
  1052 |   await addFoodButton.click();
  1053 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1054 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1055 |   await expect(nutritionFoodQuantity).toBeVisible();
  1056 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1057 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1058 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1059 |   for (const [index, label] of coachMacroLabels.entries()) {
  1060 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1061 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1062 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1063 |   }
  1064 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1065 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1066 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1067 | 
  1068 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1069 |   await dayButtons.nth(0).click();
  1070 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1071 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1072 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1073 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1074 | 
  1075 |   await page.goto(`/session/${WORKOUT_ID}`);
  1076 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1077 |   const progress = page.locator(".workout-progress-sticky");
  1078 |   const firstExercise = page.locator("article").first();
  1079 |   const progressBottom = await progress.boundingBox();
  1080 |   const firstExerciseTop = await firstExercise.boundingBox();
  1081 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1082 | 
  1083 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1084 |   await repsInput.fill("123");
  1085 |   await assertKeyboardVisible(repsInput);
  1086 |   await page.keyboard.press("Tab");
  1087 |   await expect(repsInput).toHaveValue("123");
  1088 | 
  1089 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1090 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
> 1091 |   await expect(workoutNote).toBeVisible();
       |                             ^ Error: expect(locator).toBeVisible() failed
  1092 |   await workoutNote.fill("הערת בדיקה 123");
  1093 |   await assertKeyboardVisible(workoutNote);
  1094 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1095 |   await page.keyboard.press("Escape");
  1096 |   await expect(workoutNote).toBeHidden();
  1097 | 
  1098 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1099 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1100 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1101 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  1102 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1103 |   await expect(workoutNote).toBeVisible();
  1104 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1105 |   await page.keyboard.press("Escape");
  1106 |   await expect(workoutNote).toBeHidden();
  1107 | 
  1108 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1109 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1110 |   await expect(detailsSheet).toBeVisible();
  1111 |   await detailsSheet.getByRole("button").first().click();
  1112 |   await expect(detailsSheet).toBeHidden();
  1113 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1114 | 
  1115 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1116 |   await expect(page.locator("article").last()).toBeInViewport();
  1117 | });
  1118 | 
  1119 | test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  1120 |   await installFixture(page, { role: "trainee", showCalories: false });
  1121 | 
  1122 |   await page.goto("/nutrition");
  1123 |   const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  1124 |   await expect(plannedFoodQuantity).toBeVisible();
  1125 |   await expect(plannedFoodQuantity).toHaveText(/\d/);
  1126 | 
  1127 |   const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  1128 |   const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  1129 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1130 |     const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1131 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1132 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1133 |   }
  1134 |   await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1135 | 
  1136 |   await page.getByRole("button", { name: "החלפה", exact: true }).first().click();
  1137 |   const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  1138 |   await expect(replacementDialog).toBeVisible();
  1139 |   const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  1140 |   await expect(replacementQuantity).toBeVisible();
  1141 |   await expect(replacementQuantity).toHaveText(/\d/);
  1142 |   const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  1143 |   for (const [index, label] of visibleMacroLabels.entries()) {
  1144 |     const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1145 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1146 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1147 |   }
  1148 |   await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
  1149 | });
  1150 | 
  1151 | test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  1152 |   page,
  1153 | }) => {
  1154 |   await installFixture(page);
  1155 | 
  1156 |   await page.goto("/");
  1157 |   await page.getByTestId("link-nav-coach").click();
  1158 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1159 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1160 | 
  1161 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1162 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1163 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1164 |     timeout: 20_000,
  1165 |   });
  1166 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1167 | 
  1168 |   const profile = page.locator('[data-coach-client-profile-inline="true"]');
  1169 |   await expect(profile).toBeVisible();
  1170 |   await expect(profile).toContainText("63.4");
  1171 |   await expect(profile).toContainText("74");
  1172 |   await expect(profile).toContainText("8,500");
  1173 |   await expect(profile).toContainText("הליכה מהירה");
  1174 |   await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  1175 |   await expect(profile).not.toContainText("71.8");
  1176 |   await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");
  1177 | 
  1178 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  1179 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1180 |   await expect(workspace).toHaveCount(0);
  1181 | 
  1182 |   const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  1183 |   await expect(clientSearch).toBeVisible();
  1184 |   await clientSearch.fill("מתאמנת אחרת");
  1185 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  1186 |   await page.getByText("מתאמנת אחרת", { exact: true }).click();
  1187 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1188 |     timeout: 20_000,
  1189 |   });
  1190 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  1191 | 
```