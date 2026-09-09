# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:545:1

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
    20 × locator resolved to <input min="1" max="20" value="3" type="text" inputmode="decimal" data-tsd-source="/src/routes/coach.tsx:7729:69" class="h-8 w-16 rounded-lg border border-border bg-white text-center text-xs text-ink"/>
       - unexpected value "3"

```

```yaml
- textbox "מספר סטים": "3"
```

# Test source

```ts
  519 |       otherProgram,
  520 |       workouts,
  521 |       nutritionDay,
  522 |       cardioLog,
  523 |       bodyWeightLog,
  524 |       bodyMeasurement,
  525 |       habit,
  526 |       coachMessage,
  527 |       challenge,
  528 |     },
  529 |   );
  530 | }
  531 | 
  532 | function assertKeyboardVisible(locator) {
  533 |   return expect
  534 |     .poll(async () => {
  535 |       return locator.evaluate((element) => {
  536 |         const rect = element.getBoundingClientRect();
  537 |         const viewport = window.visualViewport;
  538 |         const bottom = viewport?.height ?? window.innerHeight;
  539 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  540 |       });
  541 |     })
  542 |     .toBe(true);
  543 | }
  544 | 
  545 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  546 |   await installFixture(page);
  547 | 
  548 |   await page.goto("/");
  549 |   const coachNav = page.getByTestId("link-nav-coach");
  550 |   await expect(coachNav).toBeVisible();
  551 |   await coachNav.click();
  552 |   await expect(page).toHaveURL(/\/coach\/clients/);
  553 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  554 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  555 | 
  556 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  557 |   await clientCard.click();
  558 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  559 | 
  560 |   const workspace = page.locator('[data-coach-workspace="true"]');
  561 |   const activityHistory = page.getByTestId("coach-activity-history");
  562 |   await expect(activityHistory).toBeVisible();
  563 |   await expect(page.getByTestId("coach-activity-weight")).toContainText("63.4");
  564 |   await expect(page.getByTestId("coach-activity-measurements")).toContainText("74");
  565 |   await expect(page.getByTestId("coach-activity-habits")).toContainText("8,500");
  566 |   await expect(page.getByTestId("coach-activity-messages")).toContainText("כל הכבוד על ההתמדה השבוע");
  567 |   await expect(page.getByTestId("coach-activity-challenges")).toContainText("אתגר בדיקת התמדה");
  568 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  569 |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  570 | 
  571 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  572 |   await workspace.evaluate((element) => {
  573 |     element.scrollTop = element.scrollHeight;
  574 |   });
  575 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  576 |   await expect
  577 |     .poll(() =>
  578 |       workspace.evaluate((element) => {
  579 |         const last = element.lastElementChild;
  580 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  581 |       }),
  582 |     )
  583 |     .toBe(true);
  584 | 
  585 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  586 |   await programsTab.click();
  587 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  588 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  589 |   await expect(dayButtons).toHaveCount(4);
  590 |   await dayButtons.nth(0).click();
  591 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  592 |   await expect(page.locator("#coach-programs")).toBeHidden();
  593 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  594 |   await expect(workoutSurface).toBeVisible();
  595 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  596 |   await expect(reportToggle).toBeVisible();
  597 |   await reportToggle.click();
  598 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  599 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  600 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  601 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  602 | 
  603 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  604 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  605 | 
  606 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  607 |   await setCountInput.fill("4");
  608 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  609 |   const fourthSet = page
  610 |     .getByText("סט 4", { exact: true })
  611 |     .locator("..")
  612 |     .locator("..");
  613 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  614 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  615 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  616 | 
  617 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  618 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
> 619 |   await expect(setCountInput).toHaveValue("4");
      |                               ^ Error: expect(locator).toHaveValue(expected) failed
  620 |   const reopenedFourthSet = page
  621 |     .getByText("סט 4", { exact: true })
  622 |     .locator("..")
  623 |     .locator("..");
  624 |   await expect(
  625 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  626 |   ).toHaveValue("8");
  627 |   await expect(
  628 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  629 |   ).toHaveValue("12");
  630 | 
  631 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  632 |   await thirdSetMode.selectOption("drop");
  633 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  634 |   await dropRestInput.fill("45");
  635 |   await expect(dropRestInput).toHaveValue("45");
  636 | 
  637 |   await thirdSetMode.selectOption("superset");
  638 |   const supersetSearch = page.getByRole("searchbox", {
  639 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  640 |   });
  641 |   await supersetSearch.fill("תרגיל בדיקה 2");
  642 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  643 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  644 | 
  645 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  646 |   await expect(dayButtons).toHaveCount(4);
  647 | 
  648 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  649 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  650 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  651 |   await foodSearch.fill("אורז");
  652 |   await assertKeyboardVisible(foodSearch);
  653 |   await expect(foodSearch).toHaveValue("אורז");
  654 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  655 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  656 |   await expect(addFoodButton).toBeEnabled();
  657 |   await addFoodButton.click();
  658 |   await expect(
  659 |     page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  660 |   ).toBeVisible();
  661 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  662 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  663 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  664 | 
  665 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  666 |   await dayButtons.nth(0).click();
  667 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  668 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  669 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  670 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  671 | 
  672 |   await page.goto(`/session/${WORKOUT_ID}`);
  673 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  674 |   const progress = page.locator(".workout-progress-sticky");
  675 |   const firstExercise = page.locator("article").first();
  676 |   const progressBottom = await progress.boundingBox();
  677 |   const firstExerciseTop = await firstExercise.boundingBox();
  678 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  679 | 
  680 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  681 |   await repsInput.fill("123");
  682 |   await assertKeyboardVisible(repsInput);
  683 |   await page.keyboard.press("Tab");
  684 |   await expect(repsInput).toHaveValue("123");
  685 | 
  686 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  687 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  688 |   await expect(workoutNote).toBeVisible();
  689 |   await workoutNote.fill("הערת בדיקה 123");
  690 |   await assertKeyboardVisible(workoutNote);
  691 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  692 |   await page.keyboard.press("Escape");
  693 |   await expect(workoutNote).toBeHidden();
  694 | 
  695 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  696 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  697 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  698 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  699 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  700 |   await expect(workoutNote).toBeVisible();
  701 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  702 |   await page.keyboard.press("Escape");
  703 |   await expect(workoutNote).toBeHidden();
  704 | 
  705 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  706 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  707 |   await expect(detailsSheet).toBeVisible();
  708 |   await detailsSheet.getByRole("button").first().click();
  709 |   await expect(detailsSheet).toBeHidden();
  710 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  711 | 
  712 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  713 |   await expect(page.locator("article").last()).toBeInViewport();
  714 | });
  715 | 
  716 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  717 |   await installFixture(page);
  718 | 
  719 |   await page.goto(`/session/${WORKOUT_ID}`);
```