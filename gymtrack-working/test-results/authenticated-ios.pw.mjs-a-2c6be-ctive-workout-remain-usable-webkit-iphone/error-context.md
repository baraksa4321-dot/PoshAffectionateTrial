# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:545:1

# Error details

```
Error: page.goto: Could not connect to 127.0.0.1: Connection refused
Call log:
  - navigating to "http://127.0.0.1:4173/session/ios-smoke-workout", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - link "MY routine — דף הבית" [ref=e6]:
          - /url: /
          - img "MY routine" [ref=e7]
        - button "מעבר לתצוגת לילה" [ref=e8]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - paragraph [ref=e13]: בניית תוכניות ותפריטים
          - heading "עריכה" [level=1] [ref=e14]
        - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=e16]
  - main [ref=e21]:
    - generic [ref=e22]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e26]:
      - generic [ref=e27]:
        - heading "מתאמנת בדיקה" [level=3] [ref=e28]
        - button "סגירת תכנית המתאמן" [ref=e30]
      - navigation "ניווט בסביבת העריכה" [ref=e34]:
        - tab "תוכנית אימונים" [ref=e35]
        - tab "תפריט תזונה" [active] [selected] [ref=e42]
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - heading "בניית תפריט למתאמן" [level=4] [ref=e50]
              - paragraph [ref=e54]: התפריט נשמר כתבנית קבועה ונפרד מהיומן בפועל. תאריך הבדיקה מציג רק את מה שנרשם בפועל.
            - textbox "תאריך להצגת רישום בפועל" [ref=e55]: 2026-08-26
          - generic [ref=e56]:
            - generic [ref=e57]:
              - generic [ref=e58]: קלוריות
              - generic [ref=e59]: "330"
              - generic [ref=e60]: קק״ל
            - generic [ref=e61]:
              - generic [ref=e62]: חלבון
              - generic [ref=e63]: "6.5"
              - generic [ref=e64]: גרם
            - generic [ref=e65]:
              - generic [ref=e66]: פחמימה
              - generic [ref=e67]: "72"
              - generic [ref=e68]: גרם
            - generic [ref=e69]:
              - generic [ref=e70]: שומנים
              - generic [ref=e71]: "0.3"
              - generic [ref=e72]: גרם
          - generic [ref=e74]:
            - generic [ref=e75]:
              - textbox "שם הארוחה" [ref=e76]: טיוטת תפריט לפני פתיחת הדוח
              - button "+ מאכל" [ref=e77]
            - generic [ref=e78]:
              - generic [ref=e79]:
                - generic [ref=e80]: אורז · 1 1 מנה
                - button "הסר אורז" [ref=e81]
              - generic [ref=e85]:
                - generic [ref=e86]: אורז לבן מבושל · 100 גרם
                - button "הסר אורז לבן מבושל" [ref=e87]
            - generic [ref=e91]:
              - generic [ref=e92]:
                - generic [ref=e93]: מה שהמתאמן אכל בפועל
                - generic [ref=e94]: 26.8.2026
              - generic [ref=e95]: אורז ×1
          - generic [ref=e97]:
            - button "+ הוסיפי ארוחה" [ref=e98]
            - button "שמרי תפריט" [ref=e99]
        - generic [ref=e100]:
          - generic [ref=e101]:
            - heading "יעד קלורי ותזונה למתאמן" [level=3] [ref=e102]
            - button "ערוך יעדים" [ref=e106] [cursor=pointer]
          - button "הצגת קלוריות למתאמן מוצג במסכי התזונה והמאזן" [pressed] [ref=e110]:
            - generic [ref=e111]:
              - generic [ref=e112]: הצגת קלוריות למתאמן
              - generic [ref=e113]: מוצג במסכי התזונה והמאזן
          - button "מחשבון BMR" [ref=e116]
          - generic [ref=e119]:
            - generic [ref=e120]:
              - generic [ref=e121]: קלוריות
              - text: 1900 kcal
            - generic [ref=e122]:
              - generic [ref=e123]: ימי מעקב
              - generic [ref=e124]: 1 ימים
  - navigation "ניווט ראשי":
    - generic [ref=e125]:
      - link [ref=e126]:
        - /url: /coach
      - link "מתאמנים" [ref=e130]:
        - /url: /coach/clients
      - link "מעקב" [ref=e137]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e141]:
        - /url: /exercises
```

# Test source

```ts
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
  619 |   await expect(setCountInput).toHaveValue("4");
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
> 672 |   await page.goto(`/session/${WORKOUT_ID}`);
      |              ^ Error: page.goto: Could not connect to 127.0.0.1: Connection refused
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
  720 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  721 | 
  722 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  723 |   await repsInput.fill("123");
  724 |   await page.keyboard.press("Tab");
  725 |   await expect(repsInput).toHaveValue("123");
  726 | 
  727 |   // Completion feedback belongs to the active workout draft and should follow
  728 |   // the workout when the coach navigates away before saving.
  729 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  730 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  731 |   await expect(workoutNote).toBeVisible();
  732 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  733 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  734 |   await page.keyboard.press("Escape");
  735 |   await expect(workoutNote).toBeHidden();
  736 | 
  737 |   const firstExercise = page.locator("article").first();
  738 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  739 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  740 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  741 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  742 | 
  743 |   await page.goto("/programs");
  744 |   await page.goto(`/session/${WORKOUT_ID}`);
  745 |   await page.reload();
  746 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  747 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  748 | 
  749 |   const reopenedFirstExercise = page.locator("article").first();
  750 |   await expect(
  751 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  752 |   ).toHaveClass(/border-primary/);
  753 |   await expect(
  754 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  755 |   ).toHaveValue("הערת תרגיל בטיוטה");
  756 | 
  757 |   // Reopening the completion sheet restores the unfinished workout note.
  758 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  759 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  760 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  761 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  762 |   await expect(page).toHaveURL(/\/programs/);
  763 |   await expect
  764 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  765 |     .toBeNull();
  766 | });
  767 | 
```