# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:404:1

# Error details

```
Error: page.goto: Frame load interrupted
Call log:
  - navigating to "http://127.0.0.1:4173/session/ios-smoke-workout", waiting until "load"

```

# Page snapshot

```yaml
- status "MY routine נטען" [ref=f2e3]:
  - generic [ref=f2e4]:
    - status "טוען" [ref=f2e5]
    - img "MY routine" [ref=f2e6]
```

# Test source

```ts
  332 |   await expect(dropRestInput).toHaveValue("45");
  333 | 
  334 |   await thirdSetMode.selectOption("superset");
  335 |   const supersetSearch = page.getByRole("searchbox", {
  336 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  337 |   });
  338 |   await supersetSearch.fill("תרגיל בדיקה 2");
  339 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  340 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  341 | 
  342 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  343 |   await expect(dayButtons).toHaveCount(4);
  344 | 
  345 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  346 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  347 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  348 |   await foodSearch.fill("אורז");
  349 |   await assertKeyboardVisible(foodSearch);
  350 |   await expect(foodSearch).toHaveValue("אורז");
  351 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  352 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  353 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  354 | 
  355 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  356 |   await dayButtons.nth(0).click();
  357 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  358 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  359 | 
  360 |   await page.goto(`/session/${WORKOUT_ID}`);
  361 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  362 |   const progress = page.locator(".workout-progress-sticky");
  363 |   const firstExercise = page.locator("article").first();
  364 |   const progressBottom = await progress.boundingBox();
  365 |   const firstExerciseTop = await firstExercise.boundingBox();
  366 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  367 | 
  368 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  369 |   await repsInput.fill("123");
  370 |   await assertKeyboardVisible(repsInput);
  371 |   await page.keyboard.press("Tab");
  372 |   await expect(repsInput).toHaveValue("123");
  373 | 
  374 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  375 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  376 |   await expect(workoutNote).toBeVisible();
  377 |   await workoutNote.fill("הערת בדיקה 123");
  378 |   await assertKeyboardVisible(workoutNote);
  379 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  380 |   await page.keyboard.press("Escape");
  381 |   await expect(workoutNote).toBeHidden();
  382 | 
  383 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  384 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  385 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  386 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  387 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  388 |   await expect(workoutNote).toBeVisible();
  389 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  390 |   await page.keyboard.press("Escape");
  391 |   await expect(workoutNote).toBeHidden();
  392 | 
  393 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  394 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  395 |   await expect(detailsSheet).toBeVisible();
  396 |   await detailsSheet.getByRole("button").first().click();
  397 |   await expect(detailsSheet).toBeHidden();
  398 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  399 | 
  400 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  401 |   await expect(page.locator("article").last()).toBeInViewport();
  402 | });
  403 | 
  404 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  405 |   await installFixture(page);
  406 | 
  407 |   await page.goto(`/session/${WORKOUT_ID}`);
  408 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  409 | 
  410 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  411 |   await repsInput.fill("123");
  412 |   await page.keyboard.press("Tab");
  413 |   await expect(repsInput).toHaveValue("123");
  414 | 
  415 |   // Completion feedback belongs to the active workout draft and should follow
  416 |   // the workout when the coach navigates away before saving.
  417 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  418 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  419 |   await expect(workoutNote).toBeVisible();
  420 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  421 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  422 |   await page.keyboard.press("Escape");
  423 |   await expect(workoutNote).toBeHidden();
  424 | 
  425 |   const firstExercise = page.locator("article").first();
  426 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  427 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  428 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  429 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  430 | 
  431 |   await page.goto("/programs");
> 432 |   await page.goto(`/session/${WORKOUT_ID}`);
      |              ^ Error: page.goto: Frame load interrupted
  433 |   await page.reload();
  434 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  435 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  436 | 
  437 |   const reopenedFirstExercise = page.locator("article").first();
  438 |   await expect(
  439 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  440 |   ).toHaveClass(/border-primary/);
  441 |   await expect(
  442 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  443 |   ).toHaveValue("הערת תרגיל בטיוטה");
  444 | 
  445 |   // Reopening the completion sheet restores the unfinished workout note.
  446 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  447 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  448 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  449 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  450 |   await expect(page).toHaveURL(/\/programs/);
  451 |   await expect
  452 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  453 |     .toBeNull();
  454 | });
  455 | 
```