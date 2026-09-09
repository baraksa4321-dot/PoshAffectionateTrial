# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:298:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByRole('textbox', { name: 'מספר סטים', exact: true })
Expected: "4"
Received: "3"
Timeout:  8000ms

Call log:
  - Expect "toHaveValue" with timeout 8000ms
  - waiting for getByRole('textbox', { name: 'מספר סטים', exact: true })
    20 × locator resolved to <input min="1" max="20" value="3" type="text" inputmode="decimal" data-tsd-source="/src/routes/coach.tsx:7580:69" class="h-8 w-16 rounded-lg border border-border bg-white text-center text-xs text-ink"/>
       - unexpected value "3"

```

```yaml
- textbox "מספר סטים": "3"
```

# Test source

```ts
  262 |             status: 200,
  263 |             headers: {
  264 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  265 |               "content-type": "application/json",
  266 |             },
  267 |           });
  268 |         }
  269 |         return originalFetch(input, init);
  270 |       };
  271 |     },
  272 |     {
  273 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  274 |       cacheValue: gymData,
  275 |       session: authSession(),
  276 |       clientProfile,
  277 |       coachProfile,
  278 |       program,
  279 |       workouts,
  280 |       nutritionDay,
  281 |     },
  282 |   );
  283 | }
  284 | 
  285 | function assertKeyboardVisible(locator) {
  286 |   return expect
  287 |     .poll(async () => {
  288 |       return locator.evaluate((element) => {
  289 |         const rect = element.getBoundingClientRect();
  290 |         const viewport = window.visualViewport;
  291 |         const bottom = viewport?.height ?? window.innerHeight;
  292 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  293 |       });
  294 |     })
  295 |     .toBe(true);
  296 | }
  297 | 
  298 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  299 |   await installFixture(page);
  300 | 
  301 |   await page.goto("/");
  302 |   const coachNav = page.getByTestId("link-nav-coach");
  303 |   await expect(coachNav).toBeVisible();
  304 |   await coachNav.click();
  305 |   await expect(page).toHaveURL(/\/coach\/clients/);
  306 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  307 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  308 | 
  309 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  310 |   await clientCard.click();
  311 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  312 | 
  313 |   const workspace = page.locator('[data-coach-workspace="true"]');
  314 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  315 |   await workspace.evaluate((element) => {
  316 |     element.scrollTop = element.scrollHeight;
  317 |   });
  318 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  319 |   await expect
  320 |     .poll(() =>
  321 |       workspace.evaluate((element) => {
  322 |         const last = element.lastElementChild;
  323 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  324 |       }),
  325 |     )
  326 |     .toBe(true);
  327 | 
  328 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  329 |   await programsTab.click();
  330 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  331 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  332 |   await expect(dayButtons).toHaveCount(4);
  333 |   await dayButtons.nth(0).click();
  334 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  335 |   await expect(page.locator("#coach-programs")).toBeHidden();
  336 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  337 |   await expect(workoutSurface).toBeVisible();
  338 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  339 |   await expect(reportToggle).toBeVisible();
  340 |   await reportToggle.click();
  341 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  342 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  343 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  344 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  345 | 
  346 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  347 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  348 | 
  349 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  350 |   await setCountInput.fill("4");
  351 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  352 |   const fourthSet = page
  353 |     .getByText("סט 4", { exact: true })
  354 |     .locator("..")
  355 |     .locator("..");
  356 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  357 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  358 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  359 | 
  360 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  361 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
> 362 |   await expect(setCountInput).toHaveValue("4");
      |                               ^ Error: expect(locator).toHaveValue(expected) failed
  363 |   const reopenedFourthSet = page
  364 |     .getByText("סט 4", { exact: true })
  365 |     .locator("..")
  366 |     .locator("..");
  367 |   await expect(
  368 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  369 |   ).toHaveValue("8");
  370 |   await expect(
  371 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  372 |   ).toHaveValue("12");
  373 | 
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
```