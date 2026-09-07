# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:284:1

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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 8 חזרות · 20 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 9 חזרות · 21 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 10 חזרות · 22 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 11 חזרות · 23 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 8 חזרות · 24 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 9 חזרות · 25 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 10 חזרות · 26 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
    - paragraph: יעד היום
    - paragraph: 3 סטים · 11 חזרות · 27 ק״ג
    - paragraph: בפעם הקודמת
    - paragraph: אין ביצוע קודם עדיין
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
  292 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  293 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  294 | 
  295 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  296 |   await clientCard.click();
  297 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  298 | 
  299 |   const workspace = page.locator('[data-coach-workspace="true"]');
  300 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  301 |   await workspace.evaluate((element) => {
  302 |     element.scrollTop = element.scrollHeight;
  303 |   });
  304 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  305 |   await expect
  306 |     .poll(() =>
  307 |       workspace.evaluate((element) => {
  308 |         const last = element.lastElementChild;
  309 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  310 |       }),
  311 |     )
  312 |     .toBe(true);
  313 | 
  314 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  315 |   await programsTab.click();
  316 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  317 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  318 |   await expect(dayButtons).toHaveCount(4);
  319 |   await dayButtons.nth(0).click();
  320 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  321 |   await expect(page.locator("#coach-programs")).toBeHidden();
  322 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  323 |   await expect(workoutSurface).toBeVisible();
  324 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  325 |   await expect(reportToggle).toBeVisible();
  326 |   await reportToggle.click();
  327 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  328 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  329 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  330 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  331 | 
  332 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  333 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  334 | 
  335 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  336 |   await thirdSetMode.selectOption("drop");
  337 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  338 |   await dropRestInput.fill("45");
  339 |   await expect(dropRestInput).toHaveValue("45");
  340 | 
  341 |   await thirdSetMode.selectOption("superset");
  342 |   const supersetSearch = page.getByRole("searchbox", {
  343 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  344 |   });
  345 |   await supersetSearch.fill("תרגיל בדיקה 2");
  346 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  347 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  348 | 
  349 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  350 |   await expect(dayButtons).toHaveCount(4);
  351 | 
  352 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  353 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  354 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  355 |   await foodSearch.fill("אורז");
  356 |   await assertKeyboardVisible(foodSearch);
  357 |   await expect(foodSearch).toHaveValue("אורז");
  358 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  359 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  360 |   await expect(addFoodButton).toBeEnabled();
  361 |   await addFoodButton.click();
  362 |   await expect(
  363 |     page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  364 |   ).toBeVisible();
  365 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  366 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  367 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  368 | 
  369 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  370 |   await dayButtons.nth(0).click();
  371 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  372 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  373 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  374 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  375 | 
  376 |   await page.goto(`/session/${WORKOUT_ID}`);
  377 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  378 |   const progress = page.locator(".workout-progress-sticky");
  379 |   const firstExercise = page.locator("article").first();
  380 |   const progressBottom = await progress.boundingBox();
  381 |   const firstExerciseTop = await firstExercise.boundingBox();
  382 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  383 | 
  384 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  385 |   await repsInput.fill("123");
  386 |   await assertKeyboardVisible(repsInput);
  387 |   await page.keyboard.press("Tab");
  388 |   await expect(repsInput).toHaveValue("123");
  389 | 
  390 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  391 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
> 392 |   await expect(workoutNote).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  393 |   await workoutNote.fill("הערת בדיקה 123");
  394 |   await assertKeyboardVisible(workoutNote);
  395 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  396 |   await page.keyboard.press("Escape");
  397 |   await expect(workoutNote).toBeHidden();
  398 | 
  399 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  400 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  401 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  402 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  403 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  404 |   await expect(workoutNote).toBeVisible();
  405 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  406 |   await page.keyboard.press("Escape");
  407 |   await expect(workoutNote).toBeHidden();
  408 | 
  409 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  410 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  411 |   await expect(detailsSheet).toBeVisible();
  412 |   await detailsSheet.getByRole("button").first().click();
  413 |   await expect(detailsSheet).toBeHidden();
  414 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  415 | 
  416 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  417 |   await expect(page.locator("article").last()).toBeInViewport();
  418 | });
  419 | 
  420 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  421 |   await installFixture(page);
  422 | 
  423 |   await page.goto(`/session/${WORKOUT_ID}`);
  424 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  425 | 
  426 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  427 |   await repsInput.fill("123");
  428 |   await page.keyboard.press("Tab");
  429 |   await expect(repsInput).toHaveValue("123");
  430 | 
  431 |   // Completion feedback belongs to the active workout draft and should follow
  432 |   // the workout when the coach navigates away before saving.
  433 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  434 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  435 |   await expect(workoutNote).toBeVisible();
  436 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  437 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  438 |   await page.keyboard.press("Escape");
  439 |   await expect(workoutNote).toBeHidden();
  440 | 
  441 |   const firstExercise = page.locator("article").first();
  442 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  443 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  444 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  445 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  446 | 
  447 |   await page.goto("/programs");
  448 |   await page.goto(`/session/${WORKOUT_ID}`);
  449 |   await page.reload();
  450 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  451 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  452 | 
  453 |   const reopenedFirstExercise = page.locator("article").first();
  454 |   await expect(
  455 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  456 |   ).toHaveClass(/border-primary/);
  457 |   await expect(
  458 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  459 |   ).toHaveValue("הערת תרגיל בטיוטה");
  460 | 
  461 |   // Reopening the completion sheet restores the unfinished workout note.
  462 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  463 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  464 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  465 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  466 |   await expect(page).toHaveURL(/\/programs/);
  467 |   await expect
  468 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  469 |     .toBeNull();
  470 | });
  471 | 
```