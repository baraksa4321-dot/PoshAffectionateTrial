# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:408:1

# Error details

```
Error: expect(received).toBeNull()

Received: "{\"difficultyRating\":\"appropriate\",\"discomfortNotes\":\"הערת סיום בטיוטת האימון\",\"exerciseFeedback\":{\"0\":{\"rating\":\"easy\",\"notes\":\"הערת תרגיל בטיוטה\"}}}"

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f3e2]:
  - banner [ref=f3e3]:
    - generic [ref=f3e4]:
      - generic [ref=f3e5]:
        - link "MY routine — דף הבית" [ref=f3e6]:
          - /url: /
          - img "MY routine" [ref=f3e7]
        - button "מעבר לתצוגת לילה" [ref=f3e8]
      - generic [ref=f3e11]:
        - paragraph [ref=f3e13]: תוכניות
        - button "תכנית חדשה" [ref=f3e15] [cursor=pointer]
  - main [ref=f3e17]:
    - generic [ref=f3e18]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=f3e19]:
      - generic [ref=f3e20]:
        - generic [ref=f3e21]:
          - heading "התוכניות שלך" [level=2] [ref=f3e22]
          - paragraph [ref=f3e23]: 1 תוכניות פעילות
        - button "פתיחת פלייליסטים לפי אווירה" [ref=f3e25]: אווירה
      - article [ref=f3e30]:
        - generic [ref=f3e31]:
          - link [ref=f3e36]:
            - /url: /programs/ios-smoke-program
            - paragraph [ref=f3e37]: תוכנית בדיקה לאייפון
            - paragraph [ref=f3e38]: 4 ימי אימון · 8 תרגילים
          - generic [ref=f3e39]:
            - button "שכפל תוכנית בדיקה לאייפון" [ref=f3e40]
            - button "מחק את תוכנית בדיקה לאייפון" [ref=f3e44]
            - link "פתח תכנית" [ref=f3e48]:
              - /url: /programs/ios-smoke-program
        - paragraph [ref=f3e51]: בדיקת סביבת עבודה ארוכה
  - navigation "ניווט ראשי":
    - generic [ref=f3e52]:
      - link [ref=f3e53]:
        - /url: /coach
      - link "מתאמנים" [ref=f3e58]:
        - /url: /coach/clients
      - link "מעקב" [ref=f3e66]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=f3e71]:
        - /url: /exercises
```

# Test source

```ts
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
  430 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  431 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  432 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  433 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  434 | 
  435 |   await page.goto("/programs");
  436 |   await page.goto(`/session/${WORKOUT_ID}`);
  437 |   await page.reload();
  438 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  439 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  440 | 
  441 |   const reopenedFirstExercise = page.locator("article").first();
  442 |   await expect(
  443 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  444 |   ).toHaveClass(/border-primary/);
  445 |   await expect(
  446 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  447 |   ).toHaveValue("הערת תרגיל בטיוטה");
  448 | 
  449 |   // Reopening the completion sheet restores the unfinished workout note.
  450 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  451 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  452 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  453 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  454 |   await expect(page).toHaveURL(/\/programs/);
  455 |   await expect
  456 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
> 457 |     .toBeNull();
      |      ^ Error: expect(received).toBeNull()
  458 | });
  459 | 
```