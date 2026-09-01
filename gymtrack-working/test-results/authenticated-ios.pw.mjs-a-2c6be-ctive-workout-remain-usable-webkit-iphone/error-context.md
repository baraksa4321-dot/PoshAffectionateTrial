# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:285:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('דוח שבועי', { exact: true })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('דוח שבועי', { exact: true })

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
  - button "סגירת בניית אימון"
  - text: תרגיל בדיקה 1 20 ק״ג · 3 סטים × 8 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 1"
  - text: תרגיל בדיקה 2 21 ק״ג · 3 סטים × 9 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 2"
  - text: תרגיל בדיקה 3 22 ק״ג · 3 סטים × 10 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 3"
  - text: תרגיל בדיקה 4 23 ק״ג · 3 סטים × 11 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 4"
  - text: תרגיל בדיקה 5 24 ק״ג · 3 סטים × 8 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 5"
  - text: תרגיל בדיקה 6 25 ק״ג · 3 סטים × 9 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 6"
  - text: תרגיל בדיקה 7 26 ק״ג · 3 סטים × 10 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 7"
  - text: תרגיל בדיקה 8 27 ק״ג · 3 סטים × 11 חזרות
  - button "עריכה"
  - button "הסר את תרגיל בדיקה 8"
  - button "סגירת דוח" [expanded]: דוח
  - region "אימון בדיקה ארוך":
    - paragraph: דוח האימון
    - heading "אימון בדיקה ארוך" [level=3]
    - region "היסטוריית אימונים והערות עבור אימון בדיקה ארוך":
      - paragraph: מה המתאמן ביצע בפועל
      - heading "היסטוריית אימונים והערות" [level=4]
      - button "היום הקודם"
      - 'textbox "תאריך הדוח: 1 בספטמבר 2026"': 2026-09-01
      - button "היום הבא" [disabled]
      - strong: אימון בדיקה ארוך
      - text: אין ביצוע בתאריך
      - strong: תרגיל בדיקה 1
      - paragraph: "תוכנן: 3 סטים × 8 חזרות · 20 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 2
      - paragraph: "תוכנן: 3 סטים × 9 חזרות · 21 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 3
      - paragraph: "תוכנן: 3 סטים × 10 חזרות · 22 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 4
      - paragraph: "תוכנן: 3 סטים × 11 חזרות · 23 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 5
      - paragraph: "תוכנן: 3 סטים × 8 חזרות · 24 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 6
      - paragraph: "תוכנן: 3 סטים × 9 חזרות · 25 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 7
      - paragraph: "תוכנן: 3 סטים × 10 חזרות · 26 ק״ג"
      - text: טרם בוצע
      - strong: תרגיל בדיקה 8
      - paragraph: "תוכנן: 3 סטים × 11 חזרות · 27 ק״ג"
      - text: טרם בוצע
      - paragraph: אין ביצוע של האימון בתאריך הזה.
  - 'heading "תכנית המתאמן: מתאמנת בדיקה" [level=3]'
  - button "סגירת תכנית המתאמן"
  - status: החיבור לא זמין · מוצג עותק מ־08:05
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
  229 |               },
  230 |             ];
  231 |           } else if (path === "profiles") {
  232 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  233 |           } else if (path === "programs") {
  234 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  235 |           } else if (path === "program_days") {
  236 |             body = workouts.map((workout, index) => ({
  237 |               id: workout.id,
  238 |               program_id: program.id,
  239 |               user_id: clientProfile.id,
  240 |               name: workout.name,
  241 |               items: workout.items,
  242 |               sort_order: index,
  243 |             }));
  244 |           } else if (path === "nutrition_days") {
  245 |             body = [nutritionDay];
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
  269 | 
  270 | }
  271 | 
  272 | function assertKeyboardVisible(locator) {
  273 |   return expect
  274 |     .poll(async () => {
  275 |       return locator.evaluate((element) => {
  276 |         const rect = element.getBoundingClientRect();
  277 |         const viewport = window.visualViewport;
  278 |         const bottom = viewport?.height ?? window.innerHeight;
  279 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  280 |       });
  281 |     })
  282 |     .toBe(true);
  283 | }
  284 | 
  285 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  286 |   await installFixture(page);
  287 | 
  288 |   await page.goto("/");
  289 |   const coachNav = page.getByTestId("link-nav-coach");
  290 |   await expect(coachNav).toBeVisible();
  291 |   await coachNav.click();
  292 |   await expect(page).toHaveURL(/\/coach\/clients/);
  293 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  294 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  295 | 
  296 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  297 |   await clientCard.click();
  298 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  299 | 
  300 |   const workspace = page.locator('[data-coach-workspace="true"]');
  301 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  302 |   await workspace.evaluate((element) => {
  303 |     element.scrollTop = element.scrollHeight;
  304 |   });
  305 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  306 |   await expect
  307 |     .poll(() =>
  308 |       workspace.evaluate((element) => {
  309 |         const last = element.lastElementChild;
  310 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  311 |       }),
  312 |     )
  313 |     .toBe(true);
  314 | 
  315 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  316 |   await expect(page.getByText("תוכנית האימונים", { exact: true })).toBeVisible();
  317 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  318 |   await expect(dayButtons).toHaveCount(4);
  319 |   await dayButtons.nth(0).click();
  320 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  321 |   await expect(page.locator("#coach-programs")).toBeHidden();
  322 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  323 |   await expect(workoutSurface).toBeVisible();
  324 |   const openReportButton = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  325 |   await expect(openReportButton).toBeVisible();
  326 |   const closedReportBookmark = await openReportButton.boundingBox();
  327 |   expect(closedReportBookmark).not.toBeNull();
  328 |   await openReportButton.click();
> 329 |   await expect(page.getByText("דוח שבועי", { exact: true })).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  330 |   const openReportBookmark = page.getByRole("button", { name: "סגירת דוח", exact: true });
  331 |   const openedReportBookmark = await openReportBookmark.boundingBox();
  332 |   expect(openedReportBookmark).not.toBeNull();
  333 |   expect(openedReportBookmark.x).toBeLessThan(closedReportBookmark.x);
  334 |   await openReportBookmark.click();
  335 |   await expect(page.getByText("דוח שבועי", { exact: true })).toBeHidden();
  336 | 
  337 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  338 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  339 | 
  340 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  341 |   await thirdSetMode.selectOption("drop");
  342 |   const dropRestInput = page.getByRole("spinbutton", { name: "דרופ סט זמן מנוחה" });
  343 |   await dropRestInput.fill("45");
  344 |   await expect(dropRestInput).toHaveValue("45");
  345 | 
  346 |   await thirdSetMode.selectOption("superset");
  347 |   const supersetSearch = page.getByRole("searchbox", {
  348 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  349 |   });
  350 |   await supersetSearch.fill("תרגיל בדיקה 2");
  351 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  352 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  353 | 
  354 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  355 |   await expect(dayButtons).toHaveCount(4);
  356 | 
  357 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  358 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  359 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  360 |   await foodSearch.fill("אורז");
  361 |   await assertKeyboardVisible(foodSearch);
  362 |   await expect(foodSearch).toHaveValue("אורז");
  363 | 
  364 |   await page.goto(`/session/${WORKOUT_ID}`);
  365 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  366 |   const progress = page.locator(".workout-progress-sticky");
  367 |   const firstExercise = page.locator("article").first();
  368 |   const progressBottom = await progress.boundingBox();
  369 |   const firstExerciseTop = await firstExercise.boundingBox();
  370 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  371 | 
  372 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  373 |   await repsInput.fill("123");
  374 |   await assertKeyboardVisible(repsInput);
  375 |   await page.keyboard.press("Tab");
  376 |   await expect(repsInput).toHaveValue("123");
  377 | 
  378 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  379 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  380 |   await expect(workoutNote).toBeVisible();
  381 |   await workoutNote.fill("הערת בדיקה 123");
  382 |   await assertKeyboardVisible(workoutNote);
  383 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  384 |   await page.keyboard.press("Escape");
  385 |   await expect(workoutNote).toBeHidden();
  386 | 
  387 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  388 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  389 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  390 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  391 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  392 |   await expect(workoutNote).toBeVisible();
  393 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  394 |   await page.keyboard.press("Escape");
  395 |   await expect(workoutNote).toBeHidden();
  396 | 
  397 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  398 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  399 |   await expect(detailsSheet).toBeVisible();
  400 |   await detailsSheet.getByRole("button").first().click();
  401 |   await expect(detailsSheet).toBeHidden();
  402 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  403 | 
  404 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  405 |   await expect(page.locator("article").last()).toBeInViewport();
  406 | });
  407 | 
  408 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  409 |   await installFixture(page);
  410 | 
  411 |   await page.goto(`/session/${WORKOUT_ID}`);
  412 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  413 | 
  414 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  415 |   await repsInput.fill("123");
  416 |   await page.keyboard.press("Tab");
  417 |   await expect(repsInput).toHaveValue("123");
  418 | 
  419 |   // Completion feedback belongs to the active workout draft and should follow
  420 |   // the workout when the coach navigates away before saving.
  421 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  422 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  423 |   await expect(workoutNote).toBeVisible();
  424 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  425 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  426 |   await page.keyboard.press("Escape");
  427 |   await expect(workoutNote).toBeHidden();
  428 | 
  429 |   const firstExercise = page.locator("article").first();
```