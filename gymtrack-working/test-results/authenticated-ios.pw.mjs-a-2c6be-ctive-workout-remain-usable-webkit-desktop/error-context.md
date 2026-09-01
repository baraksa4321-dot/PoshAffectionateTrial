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

Locator: getByRole('button', { name: 'פתיחת דוח', exact: true })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('button', { name: 'פתיחת דוח', exact: true })

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
  - 'heading "תכנית המתאמן: מתאמנת בדיקה" [level=3]'
  - button "סגירת תכנית המתאמן"
  - status: החיבור לא זמין · מוצג עותק מ־08:51
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
  224 |                 profiles: {
  225 |                   email: clientProfile.email,
  226 |                   full_name: clientProfile.full_name,
  227 |                   weight_kg: clientProfile.weight_kg,
  228 |                 },
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
  323 |   const openReportButton = page.getByRole("button", { name: "פתיחת דוח", exact: true });
> 324 |   await expect(openReportButton).toBeVisible();
      |                                  ^ Error: expect(locator).toBeVisible() failed
  325 |   const closedReportBookmark = await openReportButton.boundingBox();
  326 |   expect(closedReportBookmark).not.toBeNull();
  327 |   await openReportButton.click();
  328 |   await expect(page.getByText("היסטוריית אימונים והערות", { exact: true })).toBeVisible();
  329 |   const openReportBookmark = page.getByRole("button", { name: "סגירת דוח", exact: true });
  330 |   const openedReportBookmark = await openReportBookmark.boundingBox();
  331 |   expect(openedReportBookmark).not.toBeNull();
  332 |   expect(openedReportBookmark.x).toBeLessThan(closedReportBookmark.x);
  333 |   await openReportBookmark.click();
  334 |   await expect(page.getByText("היסטוריית אימונים והערות", { exact: true })).toBeHidden();
  335 | 
  336 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  337 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  338 | 
  339 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  340 |   await thirdSetMode.selectOption("drop");
  341 |   const dropRestInput = page.getByRole("spinbutton", { name: "דרופ סט זמן מנוחה" });
  342 |   await dropRestInput.fill("45");
  343 |   await expect(dropRestInput).toHaveValue("45");
  344 | 
  345 |   await thirdSetMode.selectOption("superset");
  346 |   const supersetSearch = page.getByRole("searchbox", {
  347 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  348 |   });
  349 |   await supersetSearch.fill("תרגיל בדיקה 2");
  350 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  351 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  352 | 
  353 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  354 |   await expect(dayButtons).toHaveCount(4);
  355 | 
  356 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  357 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  358 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  359 |   await foodSearch.fill("אורז");
  360 |   await assertKeyboardVisible(foodSearch);
  361 |   await expect(foodSearch).toHaveValue("אורז");
  362 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  363 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  364 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  365 | 
  366 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  367 |   await dayButtons.nth(0).click();
  368 |   await openReportButton.click();
  369 |   await expect(page.getByTestId("coach-workout-daily-report")).toBeVisible();
  370 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  371 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  372 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  373 | 
  374 |   await page.goto(`/session/${WORKOUT_ID}`);
  375 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  376 |   const progress = page.locator(".workout-progress-sticky");
  377 |   const firstExercise = page.locator("article").first();
  378 |   const progressBottom = await progress.boundingBox();
  379 |   const firstExerciseTop = await firstExercise.boundingBox();
  380 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  381 | 
  382 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  383 |   await repsInput.fill("123");
  384 |   await assertKeyboardVisible(repsInput);
  385 |   await page.keyboard.press("Tab");
  386 |   await expect(repsInput).toHaveValue("123");
  387 | 
  388 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  389 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  390 |   await expect(workoutNote).toBeVisible();
  391 |   await workoutNote.fill("הערת בדיקה 123");
  392 |   await assertKeyboardVisible(workoutNote);
  393 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  394 |   await page.keyboard.press("Escape");
  395 |   await expect(workoutNote).toBeHidden();
  396 | 
  397 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  398 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  399 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  400 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  401 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  402 |   await expect(workoutNote).toBeVisible();
  403 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  404 |   await page.keyboard.press("Escape");
  405 |   await expect(workoutNote).toBeHidden();
  406 | 
  407 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  408 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  409 |   await expect(detailsSheet).toBeVisible();
  410 |   await detailsSheet.getByRole("button").first().click();
  411 |   await expect(detailsSheet).toBeHidden();
  412 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  413 | 
  414 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  415 |   await expect(page.locator("article").last()).toBeInViewport();
  416 | });
  417 | 
  418 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  419 |   await installFixture(page);
  420 | 
  421 |   await page.goto(`/session/${WORKOUT_ID}`);
  422 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  423 | 
  424 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
```