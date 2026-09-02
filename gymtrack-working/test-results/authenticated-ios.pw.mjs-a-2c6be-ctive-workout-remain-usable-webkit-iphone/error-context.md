# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:284:1

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
```

# Test source

```ts
  189 |     ({ cacheKey, cacheValue, session, clientProfile, coachProfile, program, workouts, nutritionDay }) => {
  190 |       Object.defineProperty(window.navigator, "onLine", {
  191 |         configurable: true,
  192 |         get: () => false,
  193 |       });
  194 |       const originalGetItem = Storage.prototype.getItem;
  195 |       Storage.prototype.getItem = function getItem(key) {
  196 |         if (this === window.localStorage && key.endsWith("-auth-token")) {
  197 |           return JSON.stringify(session);
  198 |         }
  199 |         return originalGetItem.call(this, key);
  200 |       };
  201 |       window.localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
  202 |       window.localStorage.setItem(`${cacheKey.replace("user.", "pending.")}`, "false");
  203 |       window.sessionStorage.setItem("gymtrack.workspace", "management");
  204 | 
  205 |       const originalFetch = window.fetch.bind(window);
  206 |       window.fetch = async (input, init) => {
  207 |         const url = typeof input === "string" ? input : input.url;
  208 |         if (url.includes("/auth/v1/user")) {
  209 |           return new Response(JSON.stringify(session.user), {
  210 |             status: 200,
  211 |             headers: { "content-type": "application/json" },
  212 |           });
  213 |         }
  214 |         if (url.includes("/rest/v1/")) {
  215 |           const parsed = new URL(url);
  216 |           const path = parsed.pathname.replace(/^.*\/rest\/v1\//, "");
  217 |           let body = [];
  218 |           if (path === "coach_clients") {
  219 |             body = [
  220 |               {
  221 |                 id: "ios-smoke-link",
  222 |                 client_id: clientProfile.id,
  223 |                 created_at: "2026-01-02T00:00:00.000Z",
  224 |                 profiles: {
  225 |                   email: clientProfile.email,
  226 |                   full_name: clientProfile.full_name,
  227 |                   weight_kg: clientProfile.weight_kg,
  228 |                 },
  229 |               },
  230 |             ];
  231 |           } else if (path === "profiles") {
  232 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  233 |           } else if (path === "programs") {
  234 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  235 |           } else if (path === "program_days") {
  236 |             body = workouts.map((workout, index) => ({
  237 |               id: workout.id,
  238 |               program_id: program.id,
  239 |               user_id: clientProfile.id,
  240 |               name: workout.name,
  241 |               items: workout.items,
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
> 289 |   await expect(coachNav).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
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
  314 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  315 |   await programsTab.click();
  316 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  317 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  318 |   await expect(dayButtons).toHaveCount(4);
  319 |   await dayButtons.nth(0).click();
  320 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  321 |   await expect(page.locator("#coach-programs")).toBeHidden();
  322 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  323 |   await expect(workoutSurface).toBeVisible();
  324 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  325 |   await expect(reportToggle).toBeVisible();
  326 |   await reportToggle.click();
  327 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  328 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  329 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  330 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  331 | 
  332 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  333 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  334 | 
  335 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  336 |   await thirdSetMode.selectOption("drop");
  337 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  338 |   await dropRestInput.fill("45");
  339 |   await expect(dropRestInput).toHaveValue("45");
  340 | 
  341 |   await thirdSetMode.selectOption("superset");
  342 |   const supersetSearch = page.getByRole("searchbox", {
  343 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  344 |   });
  345 |   await supersetSearch.fill("תרגיל בדיקה 2");
  346 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  347 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  348 | 
  349 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  350 |   await expect(dayButtons).toHaveCount(4);
  351 | 
  352 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  353 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  354 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  355 |   await foodSearch.fill("אורז");
  356 |   await assertKeyboardVisible(foodSearch);
  357 |   await expect(foodSearch).toHaveValue("אורז");
  358 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  359 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  360 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  361 | 
  362 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  363 |   await dayButtons.nth(0).click();
  364 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  365 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  366 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  367 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  368 | 
  369 |   await page.goto(`/session/${WORKOUT_ID}`);
  370 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  371 |   const progress = page.locator(".workout-progress-sticky");
  372 |   const firstExercise = page.locator("article").first();
  373 |   const progressBottom = await progress.boundingBox();
  374 |   const firstExerciseTop = await firstExercise.boundingBox();
  375 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  376 | 
  377 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  378 |   await repsInput.fill("123");
  379 |   await assertKeyboardVisible(repsInput);
  380 |   await page.keyboard.press("Tab");
  381 |   await expect(repsInput).toHaveValue("123");
  382 | 
  383 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  384 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  385 |   await expect(workoutNote).toBeVisible();
  386 |   await workoutNote.fill("הערת בדיקה 123");
  387 |   await assertKeyboardVisible(workoutNote);
  388 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  389 |   await page.keyboard.press("Escape");
```