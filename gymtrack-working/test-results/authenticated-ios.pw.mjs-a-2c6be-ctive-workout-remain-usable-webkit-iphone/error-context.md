# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:298:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('link-nav-coach')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('link-nav-coach')

```

```yaml
- status "MY routine נטען":
  - 'img "איור טעינה: תות מצויר"'
  - paragraph: מעמיסים משקלים, לא תירוצים.
- img "MY routine"
```

# Test source

```ts
  203 |       window.sessionStorage.setItem("gymtrack.workspace", "management");
  204 | 
  205 |       const originalFetch = window.fetch.bind(window);
  206 |       let remoteWorkouts = workouts.map((workout) => ({
  207 |         ...workout,
  208 |         items: JSON.parse(JSON.stringify(workout.items)),
  209 |       }));
  210 |       window.fetch = async (input, init) => {
  211 |         const url = typeof input === "string" ? input : input.url;
  212 |         if (url.includes("/auth/v1/user")) {
  213 |           return new Response(JSON.stringify(session.user), {
  214 |             status: 200,
  215 |             headers: { "content-type": "application/json" },
  216 |           });
  217 |         }
  218 |         if (url.includes("/rest/v1/")) {
  219 |           const parsed = new URL(url);
  220 |           const path = parsed.pathname.replace(/^.*\/rest\/v1\//, "");
  221 |           let body = [];
  222 |           if (path === "coach_clients") {
  223 |             body = [
  224 |               {
  225 |                 id: "ios-smoke-link",
  226 |                 client_id: clientProfile.id,
  227 |                 created_at: "2026-01-02T00:00:00.000Z",
  228 |                 profiles: {
  229 |                   email: clientProfile.email,
  230 |                   full_name: clientProfile.full_name,
  231 |                   weight_kg: clientProfile.weight_kg,
  232 |                 },
  233 |               },
  234 |             ];
  235 |           } else if (path === "profiles") {
  236 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  237 |           } else if (path === "programs") {
  238 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  239 |           } else if (path === "program_days") {
  240 |             const method = (init?.method ?? "GET").toUpperCase();
  241 |             if (method === "PATCH" || method === "PUT") {
  242 |               const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) : null;
  243 |               const dayId = parsed.searchParams.get("id")?.replace(/^eq\./, "");
  244 |               if (requestBody?.items && dayId) {
  245 |                 remoteWorkouts = remoteWorkouts.map((workout) =>
  246 |                   workout.id === dayId ? { ...workout, items: requestBody.items } : workout,
  247 |                 );
  248 |               }
  249 |             }
  250 |             body = remoteWorkouts.map((workout, index) => ({
  251 |               id: workout.id,
  252 |               program_id: program.id,
  253 |               user_id: clientProfile.id,
  254 |               name: workout.name,
  255 |               items: workout.items,
  256 |               sort_order: index,
  257 |             }));
  258 |           } else if (path === "nutrition_days") {
  259 |             body = [nutritionDay];
  260 |           }
  261 |           return new Response(JSON.stringify(body), {
  262 |             status: 200,
  263 |             headers: {
  264 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  265 |               "content-type": "application/json",
  266 |             },
  267 |           });
  268 |         }
  269 |         return originalFetch(input, init);
  270 |       };
  271 |     },
  272 |     {
  273 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  274 |       cacheValue: gymData,
  275 |       session: authSession(),
  276 |       clientProfile,
  277 |       coachProfile,
  278 |       program,
  279 |       workouts,
  280 |       nutritionDay,
  281 |     },
  282 |   );
  283 | }
  284 | 
  285 | function assertKeyboardVisible(locator) {
  286 |   return expect
  287 |     .poll(async () => {
  288 |       return locator.evaluate((element) => {
  289 |         const rect = element.getBoundingClientRect();
  290 |         const viewport = window.visualViewport;
  291 |         const bottom = viewport?.height ?? window.innerHeight;
  292 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  293 |       });
  294 |     })
  295 |     .toBe(true);
  296 | }
  297 | 
  298 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  299 |   await installFixture(page);
  300 | 
  301 |   await page.goto("/");
  302 |   const coachNav = page.getByTestId("link-nav-coach");
> 303 |   await expect(coachNav).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
  304 |   await coachNav.click();
  305 |   await expect(page).toHaveURL(/\/coach\/clients/);
  306 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  307 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  308 | 
  309 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  310 |   await clientCard.click();
  311 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  312 | 
  313 |   const workspace = page.locator('[data-coach-workspace="true"]');
  314 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  315 |   await workspace.evaluate((element) => {
  316 |     element.scrollTop = element.scrollHeight;
  317 |   });
  318 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  319 |   await expect
  320 |     .poll(() =>
  321 |       workspace.evaluate((element) => {
  322 |         const last = element.lastElementChild;
  323 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  324 |       }),
  325 |     )
  326 |     .toBe(true);
  327 | 
  328 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  329 |   await programsTab.click();
  330 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  331 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  332 |   await expect(dayButtons).toHaveCount(4);
  333 |   await dayButtons.nth(0).click();
  334 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  335 |   await expect(page.locator("#coach-programs")).toBeHidden();
  336 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  337 |   await expect(workoutSurface).toBeVisible();
  338 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  339 |   await expect(reportToggle).toBeVisible();
  340 |   await reportToggle.click();
  341 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  342 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  343 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  344 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  345 | 
  346 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  347 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  348 | 
  349 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  350 |   await setCountInput.fill("4");
  351 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  352 |   const fourthSet = page
  353 |     .getByText("סט 4", { exact: true })
  354 |     .locator("..")
  355 |     .locator("..");
  356 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  357 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  358 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  359 | 
  360 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  361 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  362 |   await expect(setCountInput).toHaveValue("4");
  363 |   const reopenedFourthSet = page
  364 |     .getByText("סט 4", { exact: true })
  365 |     .locator("..")
  366 |     .locator("..");
  367 |   await expect(
  368 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  369 |   ).toHaveValue("8");
  370 |   await expect(
  371 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  372 |   ).toHaveValue("12");
  373 | 
  374 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  375 |   await thirdSetMode.selectOption("drop");
  376 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  377 |   await dropRestInput.fill("45");
  378 |   await expect(dropRestInput).toHaveValue("45");
  379 | 
  380 |   await thirdSetMode.selectOption("superset");
  381 |   const supersetSearch = page.getByRole("searchbox", {
  382 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  383 |   });
  384 |   await supersetSearch.fill("תרגיל בדיקה 2");
  385 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  386 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  387 | 
  388 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  389 |   await expect(dayButtons).toHaveCount(4);
  390 | 
  391 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  392 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  393 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  394 |   await foodSearch.fill("אורז");
  395 |   await assertKeyboardVisible(foodSearch);
  396 |   await expect(foodSearch).toHaveValue("אורז");
  397 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  398 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  399 |   await expect(addFoodButton).toBeEnabled();
  400 |   await addFoodButton.click();
  401 |   await expect(
  402 |     page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  403 |   ).toBeVisible();
```