# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:420:1

# Error details

```
Error: page.goto: WebKit encountered an internal error
Call log:
  - navigating to "http://127.0.0.1:4173/session/ios-smoke-workout", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - status "MY routine נטען" [ref=f1e3]:
    - 'img "איור טעינה: תות מצויר" [ref=f1e5]'
    - paragraph [ref=f1e6]: מעמיסים משקלים, לא תירוצים.
  - img "MY routine" [ref=f1e7]
```

# Test source

```ts
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
  392 |   await expect(workoutNote).toBeVisible();
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
> 448 |   await page.goto(`/session/${WORKOUT_ID}`);
      |              ^ Error: page.goto: WebKit encountered an internal error
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