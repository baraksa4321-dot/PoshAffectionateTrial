# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:459:1

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
  374 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  375 |   await thirdSetMode.selectOption("drop");
  376 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  377 |   await dropRestInput.fill("45");
  378 |   await expect(dropRestInput).toHaveValue("45");
  379 | 
  380 |   await thirdSetMode.selectOption("superset");
  381 |   const supersetSearch = page.getByRole("searchbox", {
  382 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  383 |   });
  384 |   await supersetSearch.fill("תרגיל בדיקה 2");
  385 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  386 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  387 | 
  388 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  389 |   await expect(dayButtons).toHaveCount(4);
  390 | 
  391 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  392 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  393 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  394 |   await foodSearch.fill("אורז");
  395 |   await assertKeyboardVisible(foodSearch);
  396 |   await expect(foodSearch).toHaveValue("אורז");
  397 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  398 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  399 |   await expect(addFoodButton).toBeEnabled();
  400 |   await addFoodButton.click();
  401 |   await expect(
  402 |     page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  403 |   ).toBeVisible();
  404 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  405 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  406 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  407 | 
  408 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  409 |   await dayButtons.nth(0).click();
  410 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  411 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  412 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  413 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  414 | 
  415 |   await page.goto(`/session/${WORKOUT_ID}`);
  416 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  417 |   const progress = page.locator(".workout-progress-sticky");
  418 |   const firstExercise = page.locator("article").first();
  419 |   const progressBottom = await progress.boundingBox();
  420 |   const firstExerciseTop = await firstExercise.boundingBox();
  421 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  422 | 
  423 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  424 |   await repsInput.fill("123");
  425 |   await assertKeyboardVisible(repsInput);
  426 |   await page.keyboard.press("Tab");
  427 |   await expect(repsInput).toHaveValue("123");
  428 | 
  429 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  430 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  431 |   await expect(workoutNote).toBeVisible();
  432 |   await workoutNote.fill("הערת בדיקה 123");
  433 |   await assertKeyboardVisible(workoutNote);
  434 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  435 |   await page.keyboard.press("Escape");
  436 |   await expect(workoutNote).toBeHidden();
  437 | 
  438 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  439 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  440 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  441 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  442 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  443 |   await expect(workoutNote).toBeVisible();
  444 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  445 |   await page.keyboard.press("Escape");
  446 |   await expect(workoutNote).toBeHidden();
  447 | 
  448 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  449 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  450 |   await expect(detailsSheet).toBeVisible();
  451 |   await detailsSheet.getByRole("button").first().click();
  452 |   await expect(detailsSheet).toBeHidden();
  453 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  454 | 
  455 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  456 |   await expect(page.locator("article").last()).toBeInViewport();
  457 | });
  458 | 
  459 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  460 |   await installFixture(page);
  461 | 
  462 |   await page.goto(`/session/${WORKOUT_ID}`);
  463 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  464 | 
  465 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  466 |   await repsInput.fill("123");
  467 |   await page.keyboard.press("Tab");
  468 |   await expect(repsInput).toHaveValue("123");
  469 | 
  470 |   // Completion feedback belongs to the active workout draft and should follow
  471 |   // the workout when the coach navigates away before saving.
  472 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  473 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
> 474 |   await expect(workoutNote).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  475 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  476 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  477 |   await page.keyboard.press("Escape");
  478 |   await expect(workoutNote).toBeHidden();
  479 | 
  480 |   const firstExercise = page.locator("article").first();
  481 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  482 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  483 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  484 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  485 | 
  486 |   await page.goto("/programs");
  487 |   await page.goto(`/session/${WORKOUT_ID}`);
  488 |   await page.reload();
  489 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  490 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  491 | 
  492 |   const reopenedFirstExercise = page.locator("article").first();
  493 |   await expect(
  494 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  495 |   ).toHaveClass(/border-primary/);
  496 |   await expect(
  497 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  498 |   ).toHaveValue("הערת תרגיל בטיוטה");
  499 | 
  500 |   // Reopening the completion sheet restores the unfinished workout note.
  501 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  502 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  503 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  504 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  505 |   await expect(page).toHaveURL(/\/programs/);
  506 |   await expect
  507 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  508 |     .toBeNull();
  509 | });
  510 | 
```