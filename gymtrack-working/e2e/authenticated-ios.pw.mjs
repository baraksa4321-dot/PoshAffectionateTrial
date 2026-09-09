import { expect, test } from "@playwright/test";

const COACH_ID = "ios-smoke-coach";
const CLIENT_ID = "ios-smoke-client";
const OTHER_CLIENT_ID = "ios-smoke-other-client";
const WORKOUT_ID = "ios-smoke-workout";
const PROGRAM_ID = "ios-smoke-program";
const ACTIVE_SESSION_FEEDBACK_KEY = `gymtrack.active_session_feedback.${WORKOUT_ID}`;

const exercises = Array.from({ length: 8 }, (_, index) => ({
  id: `ios-smoke-exercise-${index + 1}`,
  name: `תרגיל בדיקה ${index + 1}`,
  nameHe: `תרגיל בדיקה ${index + 1}`,
  nameEn: `Smoke Exercise ${index + 1}`,
  muscleGroup: "כללי",
  muscleGroups: ["כללי"],
  equipment: "מכונה",
  category: "מותאם אישית",
  description: "תרגיל בדיקה",
  instructions: "ביצוע מבוקר",
  videoUrl: "",
  images: [],
  notes: "",
}));

const workoutItems = exercises.map((exercise, index) => ({
  id: `ios-smoke-item-${index + 1}`,
  exerciseId: exercise.id,
  exerciseName: exercise.name,
  sets: 3,
  reps: 8 + (index % 4),
  repType: "fixed",
  weight: 20 + index,
  rest: 60,
  notes: index === 7 ? "הערת מאמן לתרגיל האחרון" : "",
}));

const workout = {
  id: WORKOUT_ID,
  name: "אימון בדיקה ארוך",
  notes: "תוכנית ארוכה לבדיקת גלילה",
  items: workoutItems,
};

const workouts = Array.from({ length: 4 }, (_, index) => ({
  id: index === 0 ? WORKOUT_ID : `${WORKOUT_ID}-${index + 1}`,
  name: index === 0 ? workout.name : `אימון בדיקה ${index + 1}`,
  notes: index === 0 ? workout.notes : `יום בדיקה ${index + 1}`,
  items: index === 0 ? workoutItems : [],
}));

const program = {
  id: PROGRAM_ID,
  name: "תוכנית בדיקה לאייפון",
  notes: "בדיקת סביבת עבודה ארוכה",
  dayIds: workouts.map((day) => day.id),
};

const clientProfile = {
  id: CLIENT_ID,
  email: "ios-smoke-client@example.test",
  full_name: "מתאמנת בדיקה",
  role: "client",
  approval_status: "approved",
  coach_id: COACH_ID,
  weight_kg: 64,
  height_cm: 166,
  age_years: 29,
  workouts_per_week: 4,
  gender: "female",
  show_calories: true,
  today_routine_enabled: true,
  planned_menu: [
    {
      id: "ios-smoke-meal",
      name: "ארוחת בדיקה",
      foods: [
        {
          id: "ios-smoke-meal-food",
          foodId: "f-rice",
          name: "אורז",
          servingSize: "1 מנה",
          quantity: 1,
          calories: 200,
          protein: 4,
          carbs: 44,
          fat: 0,
        },
      ],
    },
  ],
};

const nutritionDay = {
  id: "ios-smoke-nutrition-day",
  date: "2026-08-26",
  target_calories: 1900,
  meals: [
    {
      id: "ios-smoke-meal",
      name: "ארוחת בדיקה",
      foods: [
        {
          id: "ios-smoke-meal-food",
          foodId: "f-rice",
          name: "אורז",
          servingSize: "1 מנה",
          quantity: 1,
          calories: 200,
          protein: 4,
          carbs: 44,
          fat: 0,
        },
      ],
    },
  ],
  planned_meals: [],
  water_ml: 1200,
  water_target_ml: 2500,
};

const clientNutritionDay = {
  id: nutritionDay.id,
  date: nutritionDay.date,
  meals: nutritionDay.meals,
  plannedMeals: [],
  waterMl: nutritionDay.water_ml,
  waterTargetMl: nutritionDay.water_target_ml,
};

const cardioLog = {
  id: "ios-smoke-cardio",
  date: "2026-08-25",
  type: "הליכה מהירה",
  durationMin: 32,
  calories: 215,
  intensity: "בינונית",
};

const bodyWeightLog = {
  id: "ios-smoke-weight",
  date: "2026-08-24",
  weight: 63.4,
};

const bodyMeasurement = {
  id: "ios-smoke-measurement",
  date: "2026-08-23",
  waistCm: 74,
  bodyFatPct: 24.5,
  muscleMassKg: 42.1,
  notes: "מדידת בדיקה",
};

const habit = {
  id: "ios-smoke-habit",
  date: "2026-08-25",
  steps: 8500,
  stepsTarget: 10000,
  weighInDone: true,
  workoutDone: true,
  busyDayMode: false,
};

const coachMessage = {
  id: "ios-smoke-message",
  coach_id: COACH_ID,
  client_id: CLIENT_ID,
  message: "כל הכבוד על ההתמדה השבוע",
  created_at: "2026-08-25T08:30:00.000Z",
  is_read: false,
};

const challenge = {
  id: "ios-smoke-challenge",
  title: "אתגר בדיקת התמדה",
  description: "אתגר בדיקה שנשמר במטמון של המתאמנת.",
  category: "סבולת",
  difficulty: "מתחילים",
  durationLabel: "שבוע אחד",
  accent: "sage",
  isPublished: true,
  sessions: [
    {
      id: "ios-smoke-challenge-session",
      name: "אימון אתגר בדיקה",
      notes: "",
      items: [],
    },
  ],
};

const otherClientProfile = {
  id: OTHER_CLIENT_ID,
  email: "ios-smoke-other-client@example.test",
  full_name: "מתאמנת אחרת",
  role: "client",
  approval_status: "approved",
  coach_id: COACH_ID,
  weight_kg: 71,
  height_cm: 170,
  age_years: 34,
  workouts_per_week: 2,
  gender: "female",
  show_calories: true,
  today_routine_enabled: true,
  planned_menu: [],
};

const otherProgram = {
  id: "ios-smoke-other-program",
  name: "תוכנית של מתאמנת אחרת",
  notes: "",
  dayIds: ["ios-smoke-other-workout"],
};

const gymData = {
  exercises,
  workouts,
  programs: [program],
  history: [],
  foods: [],
  nutritionDays: [clientNutritionDay],
  nutritionTargets: { calories: nutritionDay.target_calories },
  plannedMeals: clientProfile.planned_menu,
  mealTemplate: [],
  recipes: [],
  recentFoods: [],
  favoriteFoods: [],
  bodyWeightLogs: [bodyWeightLog],
  bodyMeasurements: [bodyMeasurement],
  cardioLogs: [cardioLog],
  habits: [habit],
  coachMessages: [
    {
      id: coachMessage.id,
      coachId: coachMessage.coach_id,
      clientId: coachMessage.client_id,
      message: coachMessage.message,
      createdAt: coachMessage.created_at,
      isRead: coachMessage.is_read,
    },
  ],
  challenges: [challenge],
  challengeEnrollments: [],
  preExitChecklist: [],
  userProfile: {
    fullName: "מאמנת בדיקה",
    weight: 62,
    height: 168,
    age: 31,
    gender: "female",
    role: "coach",
    approvalStatus: "approved",
    showCalories: true,
    theme: "pink",
  },
};

const coachProfile = {
  id: COACH_ID,
  email: "ios-smoke-coach@example.test",
  full_name: "מאמנת בדיקה",
  role: "coach",
  approval_status: "approved",
  weight_kg: 62,
  height_cm: 168,
  age_years: 31,
  workouts_per_week: 4,
  gender: "female",
  show_calories: true,
  today_routine_enabled: true,
  planned_menu: [],
};

function authSession() {
  return {
    access_token: "ios-smoke-access-token",
    refresh_token: "ios-smoke-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: COACH_ID,
      aud: "authenticated",
      role: "authenticated",
      email: coachProfile.email,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { full_name: coachProfile.full_name, gender: "female" },
      created_at: "2026-01-01T00:00:00.000Z",
      confirmed_at: "2026-01-01T00:00:00.000Z",
    },
  };
}

async function installFixture(page) {
  await page.addInitScript(
    ({
      cacheKey,
      cacheValue,
      session,
      clientProfile,
      otherClientProfile,
      coachProfile,
      program,
      otherProgram,
      workouts,
      nutritionDay,
      cardioLog,
      bodyWeightLog,
      bodyMeasurement,
      habit,
      coachMessage,
      challenge,
    }) => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        get: () => false,
      });
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function getItem(key) {
        if (this === window.localStorage && key.endsWith("-auth-token")) {
          return JSON.stringify(session);
        }
        return originalGetItem.call(this, key);
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
      window.localStorage.setItem(`${cacheKey.replace("user.", "pending.")}`, "false");
      window.sessionStorage.setItem("gymtrack.workspace", "management");

      const originalFetch = window.fetch.bind(window);
      let remoteWorkouts = workouts.map((workout) => ({
        ...workout,
        items: JSON.parse(JSON.stringify(workout.items)),
      }));
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/auth/v1/user")) {
          return new Response(JSON.stringify(session.user), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (url.includes("/rest/v1/")) {
          const parsed = new URL(url);
          const path = parsed.pathname.replace(/^.*\/rest\/v1\//, "");
          let body = [];
          if (path === "coach_clients") {
            body = [
              {
                id: "ios-smoke-link",
                client_id: clientProfile.id,
                created_at: "2026-01-02T00:00:00.000Z",
                profiles: {
                  email: clientProfile.email,
                  full_name: clientProfile.full_name,
                  weight_kg: clientProfile.weight_kg,
                },
              },
              {
                id: "ios-smoke-other-link",
                client_id: otherClientProfile.id,
                created_at: "2026-01-03T00:00:00.000Z",
                profiles: {
                  email: otherClientProfile.email,
                  full_name: otherClientProfile.full_name,
                  weight_kg: otherClientProfile.weight_kg,
                },
              },
            ];
          } else if (path === "profiles") {
            const requestedId = parsed.searchParams.get("id")?.replace(/^eq\./, "");
            body = [
              requestedId === clientProfile.id
                ? clientProfile
                : requestedId === otherClientProfile.id
                  ? otherClientProfile
                  : coachProfile,
            ];
          } else if (path === "programs") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            const selectedProgram = requestedUserId === otherClientProfile.id ? otherProgram : program;
            body = [
              {
                id: selectedProgram.id,
                user_id: requestedUserId === otherClientProfile.id ? otherClientProfile.id : clientProfile.id,
                name: selectedProgram.name,
                description: selectedProgram.notes,
              },
            ];
          } else if (path === "program_days") {
            const method = (init?.method ?? "GET").toUpperCase();
            if (method === "PATCH" || method === "PUT") {
              const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) : null;
              const dayId = parsed.searchParams.get("id")?.replace(/^eq\./, "");
              if (requestBody?.items && dayId) {
                remoteWorkouts = remoteWorkouts.map((workout) =>
                  workout.id === dayId ? { ...workout, items: requestBody.items } : workout,
                );
              }
            }
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? [
                    {
                      id: "ios-smoke-other-workout",
                      program_id: otherProgram.id,
                      user_id: otherClientProfile.id,
                      name: "אימון של מתאמנת אחרת",
                      items: [],
                      sort_order: 0,
                    },
                  ]
                : remoteWorkouts.map((workout, index) => ({
                    id: workout.id,
                    program_id: program.id,
                    user_id: clientProfile.id,
                    name: workout.name,
                    items: workout.items,
                    sort_order: index,
                  }));
          } else if (path === "nutrition_days") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body = requestedUserId === otherClientProfile.id ? [] : [nutritionDay];
          } else if (path === "workout_sessions") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? []
                : [
                    {
                      id: "ios-smoke-session",
                      user_id: clientProfile.id,
                      workout_id: workouts[0].id,
                      workout_name: workouts[0].name,
                      program_name: program.name,
                      date: "2026-08-25T07:00:00.000Z",
                      duration_sec: 1800,
                      entries: [],
                      notes: "",
                    },
                  ];
          } else if (path === "cardio_logs") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? []
                : [{ ...cardioLog, user_id: clientProfile.id, duration_min: cardioLog.durationMin, estimated_calories: cardioLog.calories }];
          } else if (path === "body_weight_logs") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? []
                : [{ id: bodyWeightLog.id, user_id: clientProfile.id, date: bodyWeightLog.date, weight_kg: bodyWeightLog.weight }];
          } else if (path === "body_measurements") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? []
                : [
                    {
                      id: bodyMeasurement.id,
                      user_id: clientProfile.id,
                      date: bodyMeasurement.date,
                      waist_cm: bodyMeasurement.waistCm,
                      body_fat_pct: bodyMeasurement.bodyFatPct,
                      muscle_mass_kg: bodyMeasurement.muscleMassKg,
                      notes: bodyMeasurement.notes,
                    },
                  ];
          } else if (path === "client_habits") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? []
                : [
                    {
                      ...habit,
                      user_id: clientProfile.id,
                      steps_target: habit.stepsTarget,
                      weigh_in_done: habit.weighInDone,
                      workout_done: habit.workoutDone,
                      busy_day_mode: habit.busyDayMode,
                    },
                  ];
          } else if (path === "coach_messages") {
            const requestedClientId = parsed.searchParams.get("client_id")?.replace(/^eq\./, "");
            body = requestedClientId === otherClientProfile.id ? [] : [coachMessage];
          } else if (path === "challenges") {
            body = [
              {
                ...challenge,
                duration_label: challenge.durationLabel,
                owner_id: COACH_ID,
                updated_at: "2026-08-20T00:00:00.000Z",
              },
            ];
          }
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: {
              "content-range": `0-${Math.max(0, body.length - 1)}/*`,
              "content-type": "application/json",
            },
          });
        }
        return originalFetch(input, init);
      };
    },
    {
      cacheKey: `gymtrack.v1.user.${COACH_ID}`,
      cacheValue: gymData,
      session: authSession(),
      clientProfile,
      otherClientProfile,
      coachProfile,
      program,
      otherProgram,
      workouts,
      nutritionDay,
      cardioLog,
      bodyWeightLog,
      bodyMeasurement,
      habit,
      coachMessage,
      challenge,
    },
  );
}

function assertKeyboardVisible(locator) {
  return expect
    .poll(async () => {
      return locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const viewport = window.visualViewport;
        const bottom = viewport?.height ?? window.innerHeight;
        return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
      });
    })
    .toBe(true);
}

test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  await installFixture(page);

  await page.goto("/");
  const coachNav = page.getByTestId("link-nav-coach");
  await expect(coachNav).toBeVisible();
  await coachNav.click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();

  const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  await clientCard.click();
  await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();

  const workspace = page.locator('[data-coach-workspace="true"]');
  await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  await expect(page.getByTestId("coach-client-message-profile")).toBeVisible();
  const activityHistory = page.getByTestId("coach-activity-history");
  await expect(activityHistory).toBeVisible();
  await expect(page.getByTestId("coach-activity-weight")).toContainText("63.4");
  await expect(page.getByTestId("coach-activity-measurements")).toContainText("74");
  await expect(page.getByTestId("coach-activity-habits")).toContainText("8,500");
  await expect(page.getByTestId("coach-activity-messages")).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect(page.getByTestId("coach-activity-challenges")).toContainText("אתגר בדיקת התמדה");
  await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();

  await expect(workspace).toHaveCSS("overflow-y", "auto");
  await workspace.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  await expect
    .poll(() =>
      workspace.evaluate((element) => {
        const last = element.lastElementChild;
        return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
      }),
    )
    .toBe(true);

  const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  await programsTab.click();
  await expect(programsTab).toHaveAttribute("aria-selected", "true");
  const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  await expect(dayButtons).toHaveCount(4);
  await dayButtons.nth(0).click();
  await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  await expect(page.locator("#coach-programs")).toBeHidden();
  const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  await expect(workoutSurface).toBeVisible();
  const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  await expect(reportToggle).toBeVisible();
  await reportToggle.click();
  await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();

  const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  await setCountInput.fill("4");
  await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  const fourthSet = page
    .getByText("סט 4", { exact: true })
    .locator("..")
    .locator("..");
  await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();

  await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  await expect(setCountInput).toHaveValue("4");
  const reopenedFourthSet = page
    .getByText("סט 4", { exact: true })
    .locator("..")
    .locator("..");
  await expect(
    reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  ).toHaveValue("8");
  await expect(
    reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  ).toHaveValue("12");

  const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  await thirdSetMode.selectOption("drop");
  const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  await dropRestInput.fill("45");
  await expect(dropRestInput).toHaveValue("45");

  await thirdSetMode.selectOption("superset");
  const supersetSearch = page.getByRole("searchbox", {
    name: "חיפוש תרגיל בן־זוג לסופר סט",
  });
  await supersetSearch.fill("תרגיל בדיקה 2");
  await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();

  await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  await expect(dayButtons).toHaveCount(4);

  await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  await page.getByRole("button", { name: "+ מאכל" }).first().click();
  const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  await foodSearch.fill("אורז");
  await assertKeyboardVisible(foodSearch);
  await expect(foodSearch).toHaveValue("אורז");
  await page.getByRole("option", { name: /אורז/ }).first().click();
  const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  await expect(addFoodButton).toBeEnabled();
  await addFoodButton.click();
  await expect(
    page.locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last(),
  ).toBeVisible();
  const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");

  await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  await dayButtons.nth(0).click();
  await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");

  await page.goto(`/session/${WORKOUT_ID}`);
  await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  const progress = page.locator(".workout-progress-sticky");
  const firstExercise = page.locator("article").first();
  const progressBottom = await progress.boundingBox();
  const firstExerciseTop = await firstExercise.boundingBox();
  expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);

  const repsInput = page.locator('input[inputmode="decimal"]').first();
  await repsInput.fill("123");
  await assertKeyboardVisible(repsInput);
  await page.keyboard.press("Tab");
  await expect(repsInput).toHaveValue("123");

  await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  await expect(workoutNote).toBeVisible();
  await workoutNote.fill("הערת בדיקה 123");
  await assertKeyboardVisible(workoutNote);
  await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  await page.keyboard.press("Escape");
  await expect(workoutNote).toBeHidden();

  await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  await expect(page.getByText("4%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  await expect(page.getByText("0%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  await expect(workoutNote).toBeVisible();
  await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  await page.keyboard.press("Escape");
  await expect(workoutNote).toBeHidden();

  await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  await expect(detailsSheet).toBeVisible();
  await detailsSheet.getByRole("button").first().click();
  await expect(detailsSheet).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");

  await page.locator("article").last().scrollIntoViewIfNeeded();
  await expect(page.locator("article").last()).toBeInViewport();
});

test("active workout values survive leaving and reopening the session", async ({ page }) => {
  await installFixture(page);

  await page.goto(`/session/${WORKOUT_ID}`);
  await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();

  const repsInput = page.locator('input[inputmode="decimal"]').first();
  await repsInput.fill("123");
  await page.keyboard.press("Tab");
  await expect(repsInput).toHaveValue("123");

  // Completion feedback belongs to the active workout draft and should follow
  // the workout when the coach navigates away before saving.
  await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  await expect(workoutNote).toBeVisible();
  await workoutNote.fill("הערת סיום בטיוטת האימון");
  await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  await page.keyboard.press("Escape");
  await expect(workoutNote).toBeHidden();

  const firstExercise = page.locator("article").first();
  await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  await exerciseNote.fill("הערת תרגיל בטיוטה");
  await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");

  await page.goto("/programs");
  await page.goto(`/session/${WORKOUT_ID}`);
  await page.reload();
  await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");

  const reopenedFirstExercise = page.locator("article").first();
  await expect(
    reopenedFirstExercise.getByRole("button", { name: "קל", exact: true }),
  ).toHaveClass(/border-primary/);
  await expect(
    reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  ).toHaveValue("הערת תרגיל בטיוטה");

  // Reopening the completion sheet restores the unfinished workout note.
  await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  await expect(page).toHaveURL(/\/programs/);
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
    .toBeNull();
});
