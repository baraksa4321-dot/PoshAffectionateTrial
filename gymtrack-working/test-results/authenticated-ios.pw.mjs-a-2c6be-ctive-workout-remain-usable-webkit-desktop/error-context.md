# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:284:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'סגירת בניית אימון', exact: true })
    - locator resolved to <button type="button" title="סגירת בניית אימון" aria-label="סגירת בניית אימון" data-testid="button-close-coach-workout" data-tsd-source="/src/routes/coach.tsx:5820:45" class="ui-icon-button grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

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
      - generic [ref=e12]:
        - paragraph [ref=e13]: בניית תוכניות ותפריטים
        - heading "עריכה" [level=1] [ref=e14]
  - main [ref=e15]:
    - generic [ref=e16]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e20]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]:
            - paragraph [ref=e25]: בניית אימון
            - textbox "שם יום האימון" [ref=e26]: אימון בדיקה ארוך
            - paragraph [ref=e27]: 8 תרגילים בתוכנית
          - button "סגירת בניית אימון" [ref=e28]
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]:
                - generic [ref=e36]: תרגיל בדיקה 1
                - generic [ref=e37]: 20 ק״ג · 3 סטים × 8 חזרות
              - generic [ref=e38]:
                - button "סגירה" [ref=e39]
                - button "הסר את תרגיל בדיקה 1" [ref=e40] [cursor=pointer]
            - generic [ref=e45]:
              - generic [ref=e46]:
                - paragraph [ref=e47]: עריכת תרגיל באימון
                - button "ביטול עריכה" [ref=e48]
              - generic [ref=e49]:
                - generic [ref=e50]: בחרי תרגיל מספרייה
                - button "תרגיל בדיקה 1" [ref=e51]
              - generic [ref=e56]:
                - paragraph [ref=e57]: הגדרת סטים
                - generic [ref=e58]:
                  - text: מספר סטים
                  - spinbutton "מספר סטים" [ref=e59]: "3"
              - generic [ref=e60]:
                - generic [ref=e61]:
                  - generic [ref=e62]:
                    - generic [ref=e63]: סט 1
                    - combobox "סוג סט 1" [ref=e65]:
                      - option "סט רגיל" [selected]
                      - option "סט חימום"
                      - option "דרופ סט"
                      - option "סופר־סט"
                  - generic [ref=e66]:
                    - generic [ref=e67]:
                      - text: משקל (ק״ג)
                      - spinbutton "משקל (ק״ג)" [ref=e68]: "20"
                    - generic [ref=e69]:
                      - text: חזרות מינ׳
                      - spinbutton "חזרות מינ׳" [ref=e70]: "8"
                    - generic [ref=e71]:
                      - text: חזרות מקס׳
                      - spinbutton "חזרות מקס׳" [ref=e72]: "8"
                    - generic [ref=e73]:
                      - text: הערה לסט
                      - textbox "הערה לסט" [ref=e74]:
                        - /placeholder: "למשל: עד כשל"
                    - generic [ref=e75]:
                      - text: זמן מנוחה (שניות)
                      - spinbutton "זמן מנוחה (שניות)" [ref=e76]: "60"
                - generic [ref=e77]:
                  - generic [ref=e78]:
                    - generic [ref=e79]: סט 2
                    - generic [ref=e80]:
                      - button "העתק מהקודם" [ref=e81]
                      - combobox "סוג סט 2" [ref=e82]:
                        - option "סט רגיל" [selected]
                        - option "סט חימום"
                        - option "דרופ סט"
                        - option "סופר־סט"
                  - generic [ref=e83]:
                    - generic [ref=e84]:
                      - text: משקל (ק״ג)
                      - spinbutton "משקל (ק״ג)" [ref=e85]: "20"
                    - generic [ref=e86]:
                      - text: חזרות מינ׳
                      - spinbutton "חזרות מינ׳" [ref=e87]: "8"
                    - generic [ref=e88]:
                      - text: חזרות מקס׳
                      - spinbutton "חזרות מקס׳" [ref=e89]: "8"
                    - generic [ref=e90]:
                      - text: הערה לסט
                      - textbox "הערה לסט" [ref=e91]:
                        - /placeholder: "למשל: עד כשל"
                    - generic [ref=e92]:
                      - text: זמן מנוחה (שניות)
                      - spinbutton "זמן מנוחה (שניות)" [ref=e93]: "60"
                - generic [ref=e94]:
                  - generic [ref=e95]:
                    - generic [ref=e96]: סט 3
                    - generic [ref=e97]:
                      - button "העתק מהקודם" [ref=e98]
                      - combobox "סוג סט 3" [ref=e99]:
                        - option "סט רגיל"
                        - option "סט חימום"
                        - option "דרופ סט"
                        - option "סופר־סט" [selected]
                  - generic [ref=e100]:
                    - paragraph [ref=e101]: תרגיל בדיקה 1
                    - generic [ref=e102]:
                      - spinbutton "תרגיל ראשון משקל" [ref=e103]: "20"
                      - spinbutton "תרגיל ראשון חזרות מינימום" [ref=e104]: "8"
                      - spinbutton "תרגיל ראשון חזרות מקסימום" [ref=e105]: "8"
                    - generic [ref=e107]:
                      - generic [ref=e108]:
                        - text: חיפוש תרגיל בן־זוג לסופר־סט
                        - searchbox "חיפוש תרגיל בן־זוג לסופר סט" [ref=e110]
                      - paragraph [ref=e111]: "נבחר: תרגיל בדיקה 2 (Smoke Exercise 2)"
                    - generic [ref=e112]:
                      - generic [ref=e113]:
                        - text: משקל
                        - spinbutton "משקל" [ref=e114]: "20"
                      - generic [ref=e115]:
                        - text: חזרות מינ׳
                        - spinbutton "חזרות מינ׳" [ref=e116]: "8"
                      - generic [ref=e117]:
                        - text: חזרות מקס׳
                        - spinbutton "חזרות מקס׳" [ref=e118]: "10"
              - generic [ref=e119]:
                - text: הערה למתאמן על התרגיל
                - textbox "הערה למתאמן על התרגיל" [ref=e120]:
                  - /placeholder: "למשל: לשמור על גב ישר ולבצע לאט..."
              - button "שמור שינויי תרגיל" [ref=e121] [cursor=pointer]
          - generic [ref=e123]:
            - generic [ref=e124]:
              - generic [ref=e125]: תרגיל בדיקה 2
              - generic [ref=e126]: 21 ק״ג · 3 סטים × 9 חזרות
            - generic [ref=e127]:
              - button "עריכה" [ref=e128]
              - button "הסר את תרגיל בדיקה 2" [ref=e129] [cursor=pointer]
          - generic [ref=e134]:
            - generic [ref=e135]:
              - generic [ref=e136]: תרגיל בדיקה 3
              - generic [ref=e137]: 22 ק״ג · 3 סטים × 10 חזרות
            - generic [ref=e138]:
              - button "עריכה" [ref=e139]
              - button "הסר את תרגיל בדיקה 3" [ref=e140] [cursor=pointer]
          - generic [ref=e145]:
            - generic [ref=e146]:
              - generic [ref=e147]: תרגיל בדיקה 4
              - generic [ref=e148]: 23 ק״ג · 3 סטים × 11 חזרות
            - generic [ref=e149]:
              - button "עריכה" [ref=e150]
              - button "הסר את תרגיל בדיקה 4" [ref=e151] [cursor=pointer]
          - generic [ref=e156]:
            - generic [ref=e157]:
              - generic [ref=e158]: תרגיל בדיקה 5
              - generic [ref=e159]: 24 ק״ג · 3 סטים × 8 חזרות
            - generic [ref=e160]:
              - button "עריכה" [ref=e161]
              - button "הסר את תרגיל בדיקה 5" [ref=e162] [cursor=pointer]
          - generic [ref=e167]:
            - generic [ref=e168]:
              - generic [ref=e169]: תרגיל בדיקה 6
              - generic [ref=e170]: 25 ק״ג · 3 סטים × 9 חזרות
            - generic [ref=e171]:
              - button "עריכה" [ref=e172]
              - button "הסר את תרגיל בדיקה 6" [ref=e173] [cursor=pointer]
          - generic [ref=e178]:
            - generic [ref=e179]:
              - generic [ref=e180]: תרגיל בדיקה 7
              - generic [ref=e181]: 26 ק״ג · 3 סטים × 10 חזרות
            - generic [ref=e182]:
              - button "עריכה" [ref=e183]
              - button "הסר את תרגיל בדיקה 7" [ref=e184] [cursor=pointer]
          - generic [ref=e189]:
            - generic [ref=e190]:
              - generic [ref=e191]: תרגיל בדיקה 8
              - generic [ref=e192]: 27 ק״ג · 3 סטים × 11 חזרות
            - generic [ref=e193]:
              - button "עריכה" [ref=e194]
              - button "הסר את תרגיל בדיקה 8" [ref=e195] [cursor=pointer]
      - generic [ref=e199]:
        - 'heading "תכנית המתאמן: מתאמנת בדיקה" [level=3] [ref=e200]':
          - generic [ref=e206]: "תכנית המתאמן:"
          - generic [ref=e207]: מתאמנת בדיקה
        - button "סגירת תכנית המתאמן" [ref=e208]
      - 'generic "רענון מוצלח אחרון: 1.9.2026, 9:20:26" [ref=e212]':
        - status [ref=e213]:
          - generic [ref=e221]: החיבור לא זמין · מוצג עותק מ־09:20
        - button "נסה שוב לרענן את נתוני המתאמן" [ref=e222]: נסה שוב
      - navigation "ניווט בסביבת העריכה" [ref=e223]:
        - tab "תוכנית אימונים" [selected] [ref=e224]
        - tab "תפריט תזונה" [ref=e231]
  - navigation "ניווט ראשי":
    - generic [ref=e235]:
      - link [ref=e236]:
        - /url: /coach
      - link "מתאמנים" [ref=e241]:
        - /url: /coach/clients
      - link "מעקב" [ref=e249]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e254]:
        - /url: /exercises
```

# Test source

```ts
  242 |               sort_order: index,
  243 |             }));
  244 |           } else if (path === "nutrition_days") {
  245 |             body = [nutritionDay];
  246 |           }
  247 |           return new Response(JSON.stringify(body), {
  248 |             status: 200,
  249 |             headers: {
  250 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  251 |               "content-type": "application/json",
  252 |             },
  253 |           });
  254 |         }
  255 |         return originalFetch(input, init);
  256 |       };
  257 |     },
  258 |     {
  259 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  260 |       cacheValue: gymData,
  261 |       session: authSession(),
  262 |       clientProfile,
  263 |       coachProfile,
  264 |       program,
  265 |       workouts,
  266 |       nutritionDay,
  267 |     },
  268 |   );
  269 | }
  270 | 
  271 | function assertKeyboardVisible(locator) {
  272 |   return expect
  273 |     .poll(async () => {
  274 |       return locator.evaluate((element) => {
  275 |         const rect = element.getBoundingClientRect();
  276 |         const viewport = window.visualViewport;
  277 |         const bottom = viewport?.height ?? window.innerHeight;
  278 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  279 |       });
  280 |     })
  281 |     .toBe(true);
  282 | }
  283 | 
  284 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  285 |   await installFixture(page);
  286 | 
  287 |   await page.goto("/");
  288 |   const coachNav = page.getByTestId("link-nav-coach");
  289 |   await expect(coachNav).toBeVisible();
  290 |   await coachNav.click();
  291 |   await expect(page).toHaveURL(/\/coach\/clients/);
  292 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  293 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  294 | 
  295 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  296 |   await clientCard.click();
  297 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  298 | 
  299 |   const workspace = page.locator('[data-coach-workspace="true"]');
  300 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  301 |   await workspace.evaluate((element) => {
  302 |     element.scrollTop = element.scrollHeight;
  303 |   });
  304 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  305 |   await expect
  306 |     .poll(() =>
  307 |       workspace.evaluate((element) => {
  308 |         const last = element.lastElementChild;
  309 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  310 |       }),
  311 |     )
  312 |     .toBe(true);
  313 | 
  314 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  315 |   await expect(page.getByText("תוכנית האימונים", { exact: true })).toBeVisible();
  316 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  317 |   await expect(dayButtons).toHaveCount(4);
  318 |   await dayButtons.nth(0).click();
  319 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  320 |   await expect(page.locator("#coach-programs")).toBeHidden();
  321 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  322 |   await expect(workoutSurface).toBeVisible();
  323 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toHaveCount(0);
  324 | 
  325 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  326 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  327 | 
  328 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  329 |   await thirdSetMode.selectOption("drop");
  330 |   const dropRestInput = page.getByRole("spinbutton", { name: "דרופ סט זמן מנוחה" });
  331 |   await dropRestInput.fill("45");
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
> 342 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
      |                                                                              ^ Error: locator.click: Test timeout of 45000ms exceeded.
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
  432 |   await page.goto(`/session/${WORKOUT_ID}`);
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
```