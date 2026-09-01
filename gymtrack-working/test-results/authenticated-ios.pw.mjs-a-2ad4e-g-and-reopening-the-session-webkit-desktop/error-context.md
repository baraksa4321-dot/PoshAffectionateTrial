# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:410:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'אישור ושמירת אימון' })
    - locator resolved to <button type="button" data-tsd-source="/src/routes/session.$workoutId.tsx:1542:13" class="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-md cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">אישור ושמירת אימון</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - link "MY routine — דף הבית" [ref=f3e5]:
    - /url: /
    - img "MY routine" [ref=f3e6]
  - heading "האתר לא נטען כראוי" [level=1] [ref=f3e7]
  - paragraph [ref=f3e8]: זוהתה בעיה בטעינת קובץ של האפליקציה. אפשר לבצע טעינה נקייה בלי למחוק את הנתונים השמורים.
  - button "טעינה נקייה" [ref=f3e9]
```

# Test source

```ts
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
  447 |   await expect(
  448 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  449 |   ).toHaveValue("הערת תרגיל בטיוטה");
  450 | 
  451 |   // Reopening the completion sheet restores the unfinished workout note.
  452 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  453 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  454 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
> 455 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
      |                                                                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  456 |   await expect(page).toHaveURL(/\/programs/);
  457 |   await expect
  458 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  459 |     .toBeNull();
  460 | });
  461 | 
```