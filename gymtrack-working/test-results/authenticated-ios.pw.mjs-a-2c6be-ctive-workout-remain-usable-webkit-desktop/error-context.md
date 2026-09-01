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

Locator: getByText(/^נבחר: תרגיל בדיקה 2/)
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText(/^נבחר: תרגיל בדיקה 2/)

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - paragraph: בניית אימון
  - textbox "שם יום האימון": אימון בדיקה ארוך
  - paragraph: 8 תרגילים בתוכנית
  - button "סגירת הוספה" [expanded]
  - button "סגירת בניית אימון"
  - text: תרגיל בדיקה 1 (Smoke Exercise 1) מכונה · 20 ק״ג · 3 סטים × 8 חזרות
  - button "סגירה"
  - button "הסר את תרגיל בדיקה 1"
  - paragraph: עריכת תרגיל באימון
  - button "ביטול עריכה"
  - text: בחרי תרגיל מספרייה
  - button "תרגיל בדיקה 1"
  - text: בחירת מכשיר לתרגיל
  - combobox "בחירת מכשיר לתרגיל":
    - option "מכונה" [selected]
  - paragraph: הגדרת סטים
  - text: מספר סטים
  - spinbutton "מספר סטים": "3"
  - text: סט 1
  - combobox "סוג סט 1":
    - option "סט רגיל" [selected]
    - option "סט חימום"
    - option "דרופ סט"
    - option "סופר־סט"
  - text: משקל (ק״ג)
  - spinbutton "משקל (ק״ג)": "20"
  - text: חזרות מינ׳
  - spinbutton "חזרות מינ׳": "8"
  - text: חזרות מקס׳
  - spinbutton "חזרות מקס׳": "8"
  - text: הערה לסט
  - textbox "הערה לסט":
    - /placeholder: "למשל: עד כשל"
  - text: זמן מנוחה (שניות)
  - spinbutton "זמן מנוחה (שניות)": "60"
  - text: סט 2
  - button "העתק מהקודם"
  - combobox "סוג סט 2":
    - option "סט רגיל" [selected]
    - option "סט חימום"
    - option "דרופ סט"
    - option "סופר־סט"
  - text: משקל (ק״ג)
  - spinbutton "משקל (ק״ג)": "20"
  - text: חזרות מינ׳
  - spinbutton "חזרות מינ׳": "8"
  - text: חזרות מקס׳
  - spinbutton "חזרות מקס׳": "8"
  - text: הערה לסט
  - textbox "הערה לסט":
    - /placeholder: "למשל: עד כשל"
  - text: זמן מנוחה (שניות)
  - spinbutton "זמן מנוחה (שניות)": "60"
  - text: סט 3
  - button "העתק מהקודם"
  - combobox "סוג סט 3":
    - option "סט רגיל"
    - option "סט חימום"
    - option "דרופ סט"
    - option "סופר־סט" [selected]
  - paragraph: תרגיל בדיקה 1
  - spinbutton "תרגיל ראשון משקל": "20"
  - spinbutton "תרגיל ראשון חזרות מינימום": "8"
  - spinbutton "תרגיל ראשון חזרות מקסימום": "8"
  - text: חיפוש תרגיל בן־זוג לסופר־סט
  - searchbox "חיפוש תרגיל בן־זוג לסופר סט": תרגיל בדיקה 2
  - listbox "תוצאות חיפוש לתרגיל בן־זוג":
    - option "תרגיל בדיקה 2 (Smoke Exercise 2)(כללי)"
  - text: משקל
  - spinbutton "משקל": "20"
  - text: חזרות מינ׳
  - spinbutton "חזרות מינ׳": "8"
  - text: חזרות מקס׳
  - spinbutton "חזרות מקס׳": "10"
  - text: הערה למתאמן על התרגיל
  - textbox "הערה למתאמן על התרגיל":
    - /placeholder: "למשל: לשמור על גב ישר ולבצע לאט..."
  - button "שמור שינויי תרגיל"
  - text: תרגיל בדיקה 2 (Smoke Exercise 2) מכונה · 21 ק״ג · 3 סטים × 9 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 2"
  - text: תרגיל בדיקה 3 (Smoke Exercise 3) מכונה · 22 ק״ג · 3 סטים × 10 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 3"
  - text: תרגיל בדיקה 4 (Smoke Exercise 4) מכונה · 23 ק״ג · 3 סטים × 11 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 4"
  - text: תרגיל בדיקה 5 (Smoke Exercise 5) מכונה · 24 ק״ג · 3 סטים × 8 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 5"
  - text: תרגיל בדיקה 6 (Smoke Exercise 6) מכונה · 25 ק״ג · 3 סטים × 9 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 6"
  - text: תרגיל בדיקה 7 (Smoke Exercise 7) מכונה · 26 ק״ג · 3 סטים × 10 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 7"
  - text: תרגיל בדיקה 8 (Smoke Exercise 8) מכונה · 27 ק״ג · 3 סטים × 11 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 8"
  - button "פתיחת דוח": דוח
  - 'heading "תכנית המתאמן: מתאמנת בדיקה" [level=3]'
  - button "סגירת תכנית המתאמן"
  - status: החיבור לא זמין · מוצג עותק מ־15:43
  - button "נסה שוב לרענן את נתוני המתאמן": נסה שוב
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים" [selected]
    - tab "תפריט תזונה"
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
  246 |           }
  247 |           return new Response(JSON.stringify(body), {
  248 |             status: 200,
  249 |             headers: {
  250 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  251 |               "content-type": "application/json",
  252 |             },
  253 |           });
  254 |         }
  255 |         return originalFetch(input, init);
  256 |       };
  257 |     },
  258 |     {
  259 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  260 |       cacheValue: gymData,
  261 |       session: authSession(),
  262 |       clientProfile,
  263 |       coachProfile,
  264 |       program,
  265 |       workouts,
  266 |       nutritionDay,
  267 |     },
  268 |   );
  269 | }
  270 | 
  271 | function assertKeyboardVisible(locator) {
  272 |   return expect
  273 |     .poll(async () => {
  274 |       return locator.evaluate((element) => {
  275 |         const rect = element.getBoundingClientRect();
  276 |         const viewport = window.visualViewport;
  277 |         const bottom = viewport?.height ?? window.innerHeight;
  278 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  279 |       });
  280 |     })
  281 |     .toBe(true);
  282 | }
  283 | 
  284 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  285 |   await installFixture(page);
  286 | 
  287 |   await page.goto("/");
  288 |   const coachNav = page.getByTestId("link-nav-coach");
  289 |   await expect(coachNav).toBeVisible();
  290 |   await coachNav.click();
  291 |   await expect(page).toHaveURL(/\/coach\/clients/);
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
  314 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  315 |   await expect(page.getByText("תוכנית האימונים", { exact: true })).toBeVisible();
  316 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  317 |   await expect(dayButtons).toHaveCount(4);
  318 |   await dayButtons.nth(0).click();
  319 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  320 |   await expect(page.locator("#coach-programs")).toBeHidden();
  321 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  322 |   await expect(workoutSurface).toBeVisible();
  323 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  324 |   await expect(reportToggle).toBeVisible();
  325 |   await reportToggle.click();
  326 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  327 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  328 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  329 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  330 | 
  331 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  332 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  333 | 
  334 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  335 |   await thirdSetMode.selectOption("drop");
  336 |   const dropRestInput = page.getByRole("spinbutton", { name: "דרופ סט זמן מנוחה" });
  337 |   await dropRestInput.fill("45");
  338 |   await expect(dropRestInput).toHaveValue("45");
  339 | 
  340 |   await thirdSetMode.selectOption("superset");
  341 |   const supersetSearch = page.getByRole("searchbox", {
  342 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  343 |   });
  344 |   await supersetSearch.fill("תרגיל בדיקה 2");
  345 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
> 346 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  347 | 
  348 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  349 |   await expect(dayButtons).toHaveCount(4);
  350 | 
  351 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  352 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  353 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  354 |   await foodSearch.fill("אורז");
  355 |   await assertKeyboardVisible(foodSearch);
  356 |   await expect(foodSearch).toHaveValue("אורז");
  357 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  358 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  359 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  360 | 
  361 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  362 |   await dayButtons.nth(0).click();
  363 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  364 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  365 | 
  366 |   await page.goto(`/session/${WORKOUT_ID}`);
  367 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  368 |   const progress = page.locator(".workout-progress-sticky");
  369 |   const firstExercise = page.locator("article").first();
  370 |   const progressBottom = await progress.boundingBox();
  371 |   const firstExerciseTop = await firstExercise.boundingBox();
  372 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  373 | 
  374 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  375 |   await repsInput.fill("123");
  376 |   await assertKeyboardVisible(repsInput);
  377 |   await page.keyboard.press("Tab");
  378 |   await expect(repsInput).toHaveValue("123");
  379 | 
  380 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  381 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  382 |   await expect(workoutNote).toBeVisible();
  383 |   await workoutNote.fill("הערת בדיקה 123");
  384 |   await assertKeyboardVisible(workoutNote);
  385 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  386 |   await page.keyboard.press("Escape");
  387 |   await expect(workoutNote).toBeHidden();
  388 | 
  389 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  390 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  391 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  392 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  393 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  394 |   await expect(workoutNote).toBeVisible();
  395 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  396 |   await page.keyboard.press("Escape");
  397 |   await expect(workoutNote).toBeHidden();
  398 | 
  399 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  400 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  401 |   await expect(detailsSheet).toBeVisible();
  402 |   await detailsSheet.getByRole("button").first().click();
  403 |   await expect(detailsSheet).toBeHidden();
  404 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  405 | 
  406 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  407 |   await expect(page.locator("article").last()).toBeInViewport();
  408 | });
  409 | 
  410 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  411 |   await installFixture(page);
  412 | 
  413 |   await page.goto(`/session/${WORKOUT_ID}`);
  414 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  415 | 
  416 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  417 |   await repsInput.fill("123");
  418 |   await page.keyboard.press("Tab");
  419 |   await expect(repsInput).toHaveValue("123");
  420 | 
  421 |   // Completion feedback belongs to the active workout draft and should follow
  422 |   // the workout when the coach navigates away before saving.
  423 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  424 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  425 |   await expect(workoutNote).toBeVisible();
  426 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  427 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  428 |   await page.keyboard.press("Escape");
  429 |   await expect(workoutNote).toBeHidden();
  430 | 
  431 |   const firstExercise = page.locator("article").first();
  432 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  433 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  434 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  435 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  436 | 
  437 |   await page.goto("/programs");
  438 |   await page.goto(`/session/${WORKOUT_ID}`);
  439 |   await page.reload();
  440 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  441 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  442 | 
  443 |   const reopenedFirstExercise = page.locator("article").first();
  444 |   await expect(
  445 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  446 |   ).toHaveClass(/border-primary/);
```