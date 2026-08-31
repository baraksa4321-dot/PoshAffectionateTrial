# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:280:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'פתח יום' }).first()

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
      - group "בחירת מצב עבודה" [ref=e12]:
        - link "אישי" [ref=e13]:
          - /url: /
        - link "מאמן" [ref=e14]:
          - /url: /coach
      - generic [ref=e15]:
        - generic [ref=e16]:
          - paragraph [ref=e17]: בניית תוכניות ותפריטים
          - heading "עריכה" [level=1] [ref=e18]
        - generic [ref=e20]:
          - generic [ref=e25]:
            - generic [ref=e26]: מאמנת בדיקה
            - generic [ref=e27]: ios-smoke-coach@example.test
          - button "בחירת פלטת צבעים" [ref=e29] [cursor=pointer]
          - button "התנתק" [ref=e31] [cursor=pointer]
  - main [ref=e35]:
    - generic [ref=e36]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
    - generic [ref=e40]:
      - generic [ref=e41]:
        - 'heading "תכנית המתאמן: מתאמנת בדיקה" [level=3] [ref=e42]':
          - generic [ref=e48]: "תכנית המתאמן:"
          - generic [ref=e49]: מתאמנת בדיקה
        - button "סגירת תכנית המתאמן" [ref=e50]
      - 'generic "רענון מוצלח אחרון: 31.8.2026, 19:05:14" [ref=e54]':
        - status [ref=e55]:
          - generic [ref=e63]: החיבור לא זמין · מוצג עותק מ־19:05
        - button "נסה שוב לרענן את נתוני המתאמן" [ref=e64]: נסה שוב
      - navigation "ניווט בסביבת העריכה" [ref=e65]:
        - tab "תוכנית אימונים" [active] [selected] [ref=e66]
        - tab "תפריט תזונה" [ref=e73]
      - generic [ref=e78]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - heading "תוכנית האימונים" [level=3] [ref=e81]
            - paragraph [ref=e88]: בחר יום כדי לפתוח את מרחב העבודה שלו
          - generic [ref=e89]: 1 תוכניות
        - generic [ref=e90]:
          - paragraph [ref=e91]: צריך תוכנית חדשה?
          - generic [ref=e92]:
            - textbox "שם תוכנית חדשה" [ref=e93]
            - button "צור" [ref=e94] [cursor=pointer]
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]:
              - textbox "שם תוכנית האימון" [ref=e101]: תוכנית בדיקה לאייפון
              - generic [ref=e102]: 1 ימי אימון · 8 תרגילים
            - button "סגירה" [ref=e103]
          - generic [ref=e106]:
            - generic [ref=e107]:
              - 'textbox "שם יום אימון (למשל: A - פלג גוף עליון)..." [ref=e108]'
              - button "+ יום" [ref=e109] [cursor=pointer]
            - generic [ref=e111]:
              - generic [ref=e112]:
                - textbox "שם יום האימון" [ref=e113]: אימון בדיקה ארוך
                - button "סגור" [ref=e114] [cursor=pointer]
              - generic [ref=e115]:
                - button "בניית האימון" [pressed] [ref=e116]
                - button "דוח האימון" [ref=e117]
              - generic [ref=e118]:
                - generic [ref=e120]:
                  - generic [ref=e121]:
                    - generic [ref=e122]: תרגיל בדיקה 1
                    - generic [ref=e123]: 20 ק״ג · 3 סטים × 8 חזרות
                  - generic [ref=e124]:
                    - button "עריכה" [ref=e125]
                    - button "הסר את תרגיל בדיקה 1" [ref=e126] [cursor=pointer]
                - generic [ref=e131]:
                  - generic [ref=e132]:
                    - generic [ref=e133]: תרגיל בדיקה 2
                    - generic [ref=e134]: 21 ק״ג · 3 סטים × 9 חזרות
                  - generic [ref=e135]:
                    - button "עריכה" [ref=e136]
                    - button "הסר את תרגיל בדיקה 2" [ref=e137] [cursor=pointer]
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e144]: תרגיל בדיקה 3
                    - generic [ref=e145]: 22 ק״ג · 3 סטים × 10 חזרות
                  - generic [ref=e146]:
                    - button "עריכה" [ref=e147]
                    - button "הסר את תרגיל בדיקה 3" [ref=e148] [cursor=pointer]
                - generic [ref=e153]:
                  - generic [ref=e154]:
                    - generic [ref=e155]: תרגיל בדיקה 4
                    - generic [ref=e156]: 23 ק״ג · 3 סטים × 11 חזרות
                  - generic [ref=e157]:
                    - button "עריכה" [ref=e158]
                    - button "הסר את תרגיל בדיקה 4" [ref=e159] [cursor=pointer]
                - generic [ref=e164]:
                  - generic [ref=e165]:
                    - generic [ref=e166]: תרגיל בדיקה 5
                    - generic [ref=e167]: 24 ק״ג · 3 סטים × 8 חזרות
                  - generic [ref=e168]:
                    - button "עריכה" [ref=e169]
                    - button "הסר את תרגיל בדיקה 5" [ref=e170] [cursor=pointer]
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - generic [ref=e177]: תרגיל בדיקה 6
                    - generic [ref=e178]: 25 ק״ג · 3 סטים × 9 חזרות
                  - generic [ref=e179]:
                    - button "עריכה" [ref=e180]
                    - button "הסר את תרגיל בדיקה 6" [ref=e181] [cursor=pointer]
                - generic [ref=e186]:
                  - generic [ref=e187]:
                    - generic [ref=e188]: תרגיל בדיקה 7
                    - generic [ref=e189]: 26 ק״ג · 3 סטים × 10 חזרות
                  - generic [ref=e190]:
                    - button "עריכה" [ref=e191]
                    - button "הסר את תרגיל בדיקה 7" [ref=e192] [cursor=pointer]
                - generic [ref=e197]:
                  - generic [ref=e198]:
                    - generic [ref=e199]: תרגיל בדיקה 8
                    - generic [ref=e200]: 27 ק״ג · 3 סטים × 11 חזרות
                  - generic [ref=e201]:
                    - button "עריכה" [ref=e202]
                    - button "הסר את תרגיל בדיקה 8" [ref=e203] [cursor=pointer]
  - navigation "ניווט ראשי":
    - generic [ref=e207]:
      - link [ref=e208]:
        - /url: /coach
      - link "מתאמנים" [ref=e213]:
        - /url: /coach/clients
      - link "מעקב" [ref=e221]:
        - /url: /coach/tracking
      - link "תרגילים" [ref=e226]:
        - /url: /exercises
```

# Test source

```ts
  212 |             body = [
  213 |               {
  214 |                 id: "ios-smoke-link",
  215 |                 client_id: clientProfile.id,
  216 |                 created_at: "2026-01-02T00:00:00.000Z",
  217 |                 profiles: {
  218 |                   email: clientProfile.email,
  219 |                   full_name: clientProfile.full_name,
  220 |                   weight_kg: clientProfile.weight_kg,
  221 |                 },
  222 |               },
  223 |             ];
  224 |           } else if (path === "profiles") {
  225 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  226 |           } else if (path === "programs") {
  227 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  228 |           } else if (path === "program_days") {
  229 |             body = [
  230 |               {
  231 |                 id: workout.id,
  232 |                 program_id: program.id,
  233 |                 user_id: clientProfile.id,
  234 |                 name: workout.name,
  235 |                 items: workout.items,
  236 |                 sort_order: 0,
  237 |               },
  238 |             ];
  239 |           } else if (path === "nutrition_days") {
  240 |             body = [nutritionDay];
  241 |           }
  242 |           return new Response(JSON.stringify(body), {
  243 |             status: 200,
  244 |             headers: {
  245 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  246 |               "content-type": "application/json",
  247 |             },
  248 |           });
  249 |         }
  250 |         return originalFetch(input, init);
  251 |       };
  252 |     },
  253 |     {
  254 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  255 |       cacheValue: gymData,
  256 |       session: authSession(),
  257 |       clientProfile,
  258 |       coachProfile,
  259 |       program,
  260 |       workout,
  261 |       nutritionDay,
  262 |     },
  263 |   );
  264 | 
  265 | }
  266 | 
  267 | function assertKeyboardVisible(locator) {
  268 |   return expect
  269 |     .poll(async () => {
  270 |       return locator.evaluate((element) => {
  271 |         const rect = element.getBoundingClientRect();
  272 |         const viewport = window.visualViewport;
  273 |         const bottom = viewport?.height ?? window.innerHeight;
  274 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  275 |       });
  276 |     })
  277 |     .toBe(true);
  278 | }
  279 | 
  280 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  281 |   await installFixture(page);
  282 | 
  283 |   await page.goto("/");
  284 |   const coachNav = page.getByTestId("link-nav-coach");
  285 |   await expect(coachNav).toBeVisible();
  286 |   await coachNav.click();
  287 |   await expect(page).toHaveURL(/\/coach\/clients/);
  288 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  289 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  290 | 
  291 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  292 |   await clientCard.click();
  293 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  294 | 
  295 |   const workspace = page.locator('[data-coach-workspace="true"]');
  296 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  297 |   await workspace.evaluate((element) => {
  298 |     element.scrollTop = element.scrollHeight;
  299 |   });
  300 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  301 |   await expect
  302 |     .poll(() =>
  303 |       workspace.evaluate((element) => {
  304 |         const last = element.lastElementChild;
  305 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  306 |       }),
  307 |     )
  308 |     .toBe(true);
  309 | 
  310 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  311 |   await expect(page.getByText("תוכנית האימונים", { exact: true })).toBeVisible();
> 312 |   await page.getByRole("button", { name: "פתח יום" }).first().click();
      |                                                               ^ Error: locator.click: Test timeout of 45000ms exceeded.
  313 |   await expect(page.getByRole("button", { name: "בניית האימון" })).toBeVisible();
  314 |   await expect(page.getByRole("button", { name: "דוח האימון" })).toBeVisible();
  315 |   await page.getByRole("button", { name: "דוח האימון" }).click();
  316 |   await expect(page.getByText("דוח שבועי", { exact: true })).toBeVisible();
  317 |   await page.getByRole("button", { name: "בניית האימון" }).click();
  318 | 
  319 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  320 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  321 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  322 |   await foodSearch.fill("אורז");
  323 |   await assertKeyboardVisible(foodSearch);
  324 |   await expect(foodSearch).toHaveValue("אורז");
  325 | 
  326 |   await page.goto(`/session/${WORKOUT_ID}`);
  327 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  328 |   const progress = page.locator(".workout-progress-sticky");
  329 |   const firstExercise = page.locator("article").first();
  330 |   const progressBottom = await progress.boundingBox();
  331 |   const firstExerciseTop = await firstExercise.boundingBox();
  332 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  333 | 
  334 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  335 |   await repsInput.fill("123");
  336 |   await assertKeyboardVisible(repsInput);
  337 |   await page.keyboard.press("Tab");
  338 |   await expect(repsInput).toHaveValue("123");
  339 | 
  340 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  341 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  342 |   await expect(workoutNote).toBeVisible();
  343 |   await workoutNote.fill("הערת בדיקה 123");
  344 |   await assertKeyboardVisible(workoutNote);
  345 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  346 |   await page.keyboard.press("Escape");
  347 |   await expect(workoutNote).toBeHidden();
  348 | 
  349 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  350 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  351 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  352 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
  353 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  354 |   await expect(workoutNote).toBeVisible();
  355 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  356 |   await page.keyboard.press("Escape");
  357 |   await expect(workoutNote).toBeHidden();
  358 | 
  359 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  360 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  361 |   await expect(detailsSheet).toBeVisible();
  362 |   await detailsSheet.getByRole("button").first().click();
  363 |   await expect(detailsSheet).toBeHidden();
  364 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  365 | 
  366 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  367 |   await expect(page.locator("article").last()).toBeInViewport();
  368 | });
  369 | 
  370 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  371 |   await installFixture(page);
  372 | 
  373 |   await page.goto(`/session/${WORKOUT_ID}`);
  374 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  375 | 
  376 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  377 |   await repsInput.fill("123");
  378 |   await page.keyboard.press("Tab");
  379 |   await expect(repsInput).toHaveValue("123");
  380 | 
  381 |   // Completion feedback belongs to the active workout draft and should follow
  382 |   // the workout when the coach navigates away before saving.
  383 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  384 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  385 |   await expect(workoutNote).toBeVisible();
  386 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  387 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  388 |   await page.keyboard.press("Escape");
  389 |   await expect(workoutNote).toBeHidden();
  390 | 
  391 |   const firstExercise = page.locator("article").first();
  392 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  393 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  394 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  395 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  396 | 
  397 |   await page.goto("/programs");
  398 |   await page.goto(`/session/${WORKOUT_ID}`);
  399 |   await page.reload();
  400 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  401 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  402 | 
  403 |   const reopenedFirstExercise = page.locator("article").first();
  404 |   await expect(
  405 |     reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  406 |   ).toHaveClass(/border-primary/);
  407 |   await expect(
  408 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  409 |   ).toHaveValue("הערת תרגיל בטיוטה");
  410 | 
  411 |   // Reopening the completion sheet restores the unfinished workout note.
  412 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
```