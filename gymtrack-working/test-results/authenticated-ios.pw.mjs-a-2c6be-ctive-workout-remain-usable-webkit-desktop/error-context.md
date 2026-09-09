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
  - navigating to "http://127.0.0.1:4173/", waiting until "load"

```

# Test source

```ts
  448 |                 ? []
  449 |                 : [{ ...cardioLog, user_id: clientProfile.id, duration_min: cardioLog.durationMin, estimated_calories: cardioLog.calories }];
  450 |           } else if (path === "body_weight_logs") {
  451 |             const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
  452 |             body =
  453 |               requestedUserId === otherClientProfile.id
  454 |                 ? []
  455 |                 : [{ id: bodyWeightLog.id, user_id: clientProfile.id, date: bodyWeightLog.date, weight_kg: bodyWeightLog.weight }];
  456 |           } else if (path === "body_measurements") {
  457 |             const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
  458 |             body =
  459 |               requestedUserId === otherClientProfile.id
  460 |                 ? []
  461 |                 : [
  462 |                     {
  463 |                       id: bodyMeasurement.id,
  464 |                       user_id: clientProfile.id,
  465 |                       date: bodyMeasurement.date,
  466 |                       waist_cm: bodyMeasurement.waistCm,
  467 |                       body_fat_pct: bodyMeasurement.bodyFatPct,
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
> 548 |   await page.goto("/");
      |              ^ Error: page.goto: Could not connect to 127.0.0.1: Connection refused
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
```