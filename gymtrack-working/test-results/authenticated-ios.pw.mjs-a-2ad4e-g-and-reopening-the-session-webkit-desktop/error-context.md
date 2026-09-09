# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:722:1

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: 'אישור ושמירת אימון' })
    - locator resolved to <button type="button" data-tsd-source="/src/routes/session.$workoutId.tsx:1614:13" class="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-md cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">אישור ושמירת אימון</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable

```

# Test source

```ts
  667 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  668 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  669 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  670 | 
  671 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  672 |   await dayButtons.nth(0).click();
  673 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  674 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  675 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  676 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  677 | 
  678 |   await page.goto(`/session/${WORKOUT_ID}`);
  679 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  680 |   const progress = page.locator(".workout-progress-sticky");
  681 |   const firstExercise = page.locator("article").first();
  682 |   const progressBottom = await progress.boundingBox();
  683 |   const firstExerciseTop = await firstExercise.boundingBox();
  684 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  685 | 
  686 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  687 |   await repsInput.fill("123");
  688 |   await assertKeyboardVisible(repsInput);
  689 |   await page.keyboard.press("Tab");
  690 |   await expect(repsInput).toHaveValue("123");
  691 | 
  692 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  693 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  694 |   await expect(workoutNote).toBeVisible();
  695 |   await workoutNote.fill("הערת בדיקה 123");
  696 |   await assertKeyboardVisible(workoutNote);
  697 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  698 |   await page.keyboard.press("Escape");
  699 |   await expect(workoutNote).toBeHidden();
  700 | 
  701 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  702 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  703 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  704 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  705 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  706 |   await expect(workoutNote).toBeVisible();
  707 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  708 |   await page.keyboard.press("Escape");
  709 |   await expect(workoutNote).toBeHidden();
  710 | 
  711 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  712 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  713 |   await expect(detailsSheet).toBeVisible();
  714 |   await detailsSheet.getByRole("button").first().click();
  715 |   await expect(detailsSheet).toBeHidden();
  716 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  717 | 
  718 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  719 |   await expect(page.locator("article").last()).toBeInViewport();
  720 | });
  721 | 
  722 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  723 |   await installFixture(page);
  724 | 
  725 |   await page.goto(`/session/${WORKOUT_ID}`);
  726 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  727 | 
  728 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  729 |   await repsInput.fill("123");
  730 |   await page.keyboard.press("Tab");
  731 |   await expect(repsInput).toHaveValue("123");
  732 | 
  733 |   // Completion feedback belongs to the active workout draft and should follow
  734 |   // the workout when the coach navigates away before saving.
  735 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  736 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  737 |   await expect(workoutNote).toBeVisible();
  738 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  739 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  740 |   await page.keyboard.press("Escape");
  741 |   await expect(workoutNote).toBeHidden();
  742 | 
  743 |   const firstExercise = page.locator("article").first();
  744 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  745 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  746 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  747 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  748 | 
  749 |   await page.goto("/programs");
  750 |   await page.goto(`/session/${WORKOUT_ID}`);
  751 |   await page.reload();
  752 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  753 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  754 | 
  755 |   const reopenedFirstExercise = page.locator("article").first();
  756 |   await expect(
  757 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  758 |   ).toHaveClass(/border-primary/);
  759 |   await expect(
  760 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  761 |   ).toHaveValue("הערת תרגיל בטיוטה");
  762 | 
  763 |   // Reopening the completion sheet restores the unfinished workout note.
  764 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  765 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  766 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
> 767 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
      |                                                                  ^ Error: locator.click: Target page, context or browser has been closed
  768 |   await expect(page).toHaveURL(/\/programs/);
  769 |   await expect
  770 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  771 |     .toBeNull();
  772 | });
  773 | 
```