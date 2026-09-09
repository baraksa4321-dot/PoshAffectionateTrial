# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:545:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('coach-activity-weight')
Expected substring: "63.4"
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for getByTestId('coach-activity-weight')

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
  - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - heading "מתאמנת בדיקה" [level=3]
  - button "פתיחת פרופיל המשתמש": פרופיל
  - button "סגירת תכנית המתאמן"
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים" [selected]
    - tab "תפריט תזונה"
  - textbox "שם תוכנית חדשה"
  - button "צור"
  - textbox "שם תוכנית האימון": תוכנית בדיקה לאייפון
  - text: 4 ימי אימון · 8 תרגילים
  - button "סגירה"
  - button "מחק את התוכנית תוכנית בדיקה לאייפון": מחק
  - button "פתיחת אתגרים": אתגרים
  - 'textbox "שם יום אימון (למשל: A - פלג גוף עליון)..."'
  - button "+ יום"
  - button "בניית אימון אימון בדיקה ארוך": אימון בדיקה ארוך 8 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 2": אימון בדיקה 2 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 3": אימון בדיקה 3 0 תרגילים בניית אימון
  - button "בניית אימון אימון בדיקה 4": אימון בדיקה 4 0 תרגילים בניית אימון
- navigation "ניווט ראשי":
  - link:
    - /url: /coach
  - link "מתאמנים":
    - /url: /coach/clients
  - link "מעקב":
    - /url: /coach/tracking
  - link "תרגילים":
    - /url: /exercises
- dialog "פרופיל המשתמש":
  - paragraph: פרופיל המשתמש
  - heading "מתאמנת בדיקה" [level=2]
  - paragraph: הודעות, היסטוריית פעילות, צ׳ק־אין ומדידות חודשיות במקום אחד
  - button "סגירת פרופיל המשתמש"
  - heading "שליחת הודעה" [level=3]
  - paragraph: ההודעה תופיע במסך הבית של המתאמן
  - textbox "כתבי הודעה למתאמן..."
  - button "שלח"
  - paragraph: הודעות שנשלחו
  - paragraph: כל הכבוד על ההתמדה השבוע
  - time: 25.8, 11:30
  - heading "צ׳ק־אין חודשי" [level=3]
  - paragraph: משוב אחרון מהמתאמן והערות המאמן
  - paragraph: עדיין לא התקבל צ׳ק־אין.
  - region "היסטוריית פעילות":
    - heading "היסטוריית פעילות" [level=3]
    - paragraph: נתונים שנמשכו עבור המשתמש שנבחר בלבד
    - text: 1 אימונים תזונה אחרונה
    - strong: 2026-08-26 · 1 מאכלים
    - text: אירובי אחרון
    - strong: הליכה מהירה · 32 דקות
    - text: משקל אחרון
    - strong: 63.4 ק״ג
    - text: הרגלים אחרונים
    - strong: 8,500 צעדים
    - strong: אימון בדיקה ארוך
    - time: 25.8.2026
    - paragraph: 0 סטים בוצעו · 0 תרגילים
  - heading "מדידות חודשיות" [level=3]
  - paragraph: המדידות נשמרות על ידי המאמנת או הבעלים בלבד
  - button "עריכה"
  - text: מותניים
  - strong: 74 ס״מ
  - text: אחוז שומן
  - strong: 24.5 %
  - text: מסת שריר
  - strong: 42.1 ק״ג
```

# Test source

```ts
  468 |                       muscle_mass_kg: bodyMeasurement.muscleMassKg,
  469 |                       notes: bodyMeasurement.notes,
  470 |                     },
  471 |                   ];
  472 |           } else if (path === "client_habits") {
  473 |             const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
  474 |             body =
  475 |               requestedUserId === otherClientProfile.id
  476 |                 ? []
  477 |                 : [
  478 |                     {
  479 |                       ...habit,
  480 |                       user_id: clientProfile.id,
  481 |                       steps_target: habit.stepsTarget,
  482 |                       weigh_in_done: habit.weighInDone,
  483 |                       workout_done: habit.workoutDone,
  484 |                       busy_day_mode: habit.busyDayMode,
  485 |                     },
  486 |                   ];
  487 |           } else if (path === "coach_messages") {
  488 |             const requestedClientId = parsed.searchParams.get("client_id")?.replace(/^eq\./, "");
  489 |             body = requestedClientId === otherClientProfile.id ? [] : [coachMessage];
  490 |           } else if (path === "challenges") {
  491 |             body = [
  492 |               {
  493 |                 ...challenge,
  494 |                 duration_label: challenge.durationLabel,
  495 |                 owner_id: COACH_ID,
  496 |                 updated_at: "2026-08-20T00:00:00.000Z",
  497 |               },
  498 |             ];
  499 |           }
  500 |           return new Response(JSON.stringify(body), {
  501 |             status: 200,
  502 |             headers: {
  503 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  504 |               "content-type": "application/json",
  505 |             },
  506 |           });
  507 |         }
  508 |         return originalFetch(input, init);
  509 |       };
  510 |     },
  511 |     {
  512 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  513 |       cacheValue: gymData,
  514 |       session: authSession(),
  515 |       clientProfile,
  516 |       otherClientProfile,
  517 |       coachProfile,
  518 |       program,
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
  561 |   await expect(
  562 |     page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true }),
  563 |   ).toHaveCount(0);
  564 |   await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  565 |   await expect(page.getByTestId("coach-client-message-profile")).toBeVisible();
  566 |   const activityHistory = page.getByTestId("coach-activity-history");
  567 |   await expect(activityHistory).toBeVisible();
> 568 |   await expect(page.getByTestId("coach-activity-weight")).toContainText("63.4");
      |                                                           ^ Error: expect(locator).toContainText(expected) failed
  569 |   await expect(page.getByTestId("coach-activity-measurements")).toContainText("74");
  570 |   await expect(page.getByTestId("coach-activity-habits")).toContainText("8,500");
  571 |   await expect(page.getByTestId("coach-activity-messages")).toContainText("כל הכבוד על ההתמדה השבוע");
  572 |   await expect(page.getByTestId("coach-activity-challenges")).toContainText("אתגר בדיקת התמדה");
  573 |   await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  574 |   await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  575 |   await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  576 | 
  577 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  578 |   await workspace.evaluate((element) => {
  579 |     element.scrollTop = element.scrollHeight;
  580 |   });
  581 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  582 |   await expect
  583 |     .poll(() =>
  584 |       workspace.evaluate((element) => {
  585 |         const last = element.lastElementChild;
  586 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  587 |       }),
  588 |     )
  589 |     .toBe(true);
  590 | 
  591 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  592 |   await programsTab.click();
  593 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  594 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  595 |   await expect(dayButtons).toHaveCount(4);
  596 |   await dayButtons.nth(0).click();
  597 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  598 |   await expect(page.locator("#coach-programs")).toBeHidden();
  599 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  600 |   await expect(workoutSurface).toBeVisible();
  601 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  602 |   await expect(reportToggle).toBeVisible();
  603 |   await reportToggle.click();
  604 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  605 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  606 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  607 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  608 | 
  609 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  610 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  611 | 
  612 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  613 |   await setCountInput.fill("4");
  614 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  615 |   const fourthSet = page
  616 |     .getByText("סט 4", { exact: true })
  617 |     .locator("..")
  618 |     .locator("..");
  619 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  620 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  621 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  622 | 
  623 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  624 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  625 |   await expect(setCountInput).toHaveValue("4");
  626 |   const reopenedFourthSet = page
  627 |     .getByText("סט 4", { exact: true })
  628 |     .locator("..")
  629 |     .locator("..");
  630 |   await expect(
  631 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  632 |   ).toHaveValue("8");
  633 |   await expect(
  634 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  635 |   ).toHaveValue("12");
  636 | 
  637 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  638 |   await thirdSetMode.selectOption("drop");
  639 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  640 |   await dropRestInput.fill("45");
  641 |   await expect(dropRestInput).toHaveValue("45");
  642 | 
  643 |   await thirdSetMode.selectOption("superset");
  644 |   const supersetSearch = page.getByRole("searchbox", {
  645 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  646 |   });
  647 |   await supersetSearch.fill("תרגיל בדיקה 2");
  648 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  649 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  650 | 
  651 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  652 |   await expect(dayButtons).toHaveCount(4);
  653 | 
  654 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  655 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  656 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  657 |   await foodSearch.fill("אורז");
  658 |   await assertKeyboardVisible(foodSearch);
  659 |   await expect(foodSearch).toHaveValue("אורז");
  660 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  661 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  662 |   await expect(addFoodButton).toBeEnabled();
  663 |   await addFoodButton.click();
  664 |   await expect(
  665 |     page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  666 |   ).toBeVisible();
  667 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  668 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
```