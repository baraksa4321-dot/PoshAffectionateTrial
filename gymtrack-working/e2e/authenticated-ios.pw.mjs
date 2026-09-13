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

const householdFoods = [
  {
    id: "ios-smoke-cottage",
    name: "קוטג׳ 5%",
    category: "מוצרי חלב",
    servingSize: "100 גרם",
    calories: 95,
    protein: 11,
    carbs: 1.5,
    fat: 5,
  },
  {
    id: "ios-smoke-yogurt",
    name: "יוגורט טבעי",
    category: "יוגורט",
    servingSize: "גביע (200g)",
    servingGrams: 200,
    calories: 140,
    protein: 10,
    carbs: 12,
    fat: 6,
  },
  {
    id: "ios-smoke-olive-oil",
    name: "שמן זית",
    category: "שמנים",
    servingSize: "10 מ״ל",
    calories: 88.4,
    protein: 0,
    carbs: 0,
    fat: 10,
  },
  {
    id: "ios-smoke-drink",
    name: "משקה חלב",
    category: "משקאות",
    servingSize: "200 מ״ל",
    calories: 100,
    protein: 7,
    carbs: 10,
    fat: 2,
  },
  {
    id: "ios-smoke-sliced-cheese",
    name: "גבינה צהובה",
    category: "גבינות",
    servingSize: "פרוסה (20g)",
    servingGrams: 20,
    calories: 60,
    protein: 5,
    carbs: 0.5,
    fat: 4,
  },
  {
    id: "ios-smoke-rice",
    name: "אורז מבושל",
    category: "דגנים",
    servingSize: "100 גרם",
    calories: 200,
    protein: 4,
    carbs: 44,
    fat: 0,
  },
];

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
  date_of_birth: "1998-05-17",
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
          id: "ios-smoke-planned-cottage",
          foodId: "ios-smoke-cottage",
          name: "קוטג׳ 5%",
          servingSize: "כף למנה",
          quantity: 2,
          calories: 14.25,
          protein: 1.65,
          carbs: 0.225,
          fat: 0.75,
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
          servingSize: "100 גרם",
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

const otherCardioLog = {
  id: "ios-smoke-other-cardio",
  date: "2026-08-27",
  type: "רכיבה אחרת",
  durationMin: 17,
  calories: 180,
  intensity: "גבוהה",
};

const otherBodyWeightLog = {
  id: "ios-smoke-other-weight",
  date: "2026-08-26",
  weight: 71.8,
};

const otherBodyMeasurement = {
  id: "ios-smoke-other-measurement",
  date: "2026-08-26",
  waistCm: 88,
  bodyFatPct: 31.2,
  muscleMassKg: 39.4,
  notes: "מדידה של מתאמנת אחרת",
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

const otherHabit = {
  id: "ios-smoke-other-habit",
  date: "2026-08-27",
  steps: 1234,
  stepsTarget: 9000,
  weighInDone: false,
  workoutDone: false,
  busyDayMode: true,
};

const coachMessage = {
  id: "ios-smoke-message",
  coach_id: COACH_ID,
  client_id: CLIENT_ID,
  message: "כל הכבוד על ההתמדה השבוע",
  created_at: "2026-08-25T08:30:00.000Z",
  is_read: false,
};

const otherCoachMessage = {
  id: "ios-smoke-other-message",
  coach_id: COACH_ID,
  client_id: OTHER_CLIENT_ID,
  message: "הודעה של מתאמנת אחרת",
  created_at: "2026-08-27T08:30:00.000Z",
  is_read: false,
};

const broadcastAnnouncement = {
  id: "ios-smoke-broadcast",
  sender_id: COACH_ID,
  audience: "clients",
  message: "הודעת תפוצה לבדיקה",
  created_at: "2026-08-25T08:00:00.000Z",
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
  foods: householdFoods,
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
  broadcasts: [
    {
      id: broadcastAnnouncement.id,
      senderId: broadcastAnnouncement.sender_id,
      audience: broadcastAnnouncement.audience,
      message: broadcastAnnouncement.message,
      createdAt: broadcastAnnouncement.created_at,
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

const reopenFullCacheValue = {
  ...gymData,
  foods: Array.from({ length: 2_000 }, (_, index) => ({
    id: `ios-smoke-cached-food-${index + 1}`,
    name: `מזון מטמון ${index + 1}`,
    nameEn: `Cached Food ${index + 1}`,
    category: "בדיקה",
    servingSize: "100 גרם",
    servingUnit: "g",
    servingGrams: 100,
    calories: 100 + (index % 9),
    protein: 5 + (index % 7),
    carbs: 12 + (index % 11),
    fat: 2 + (index % 5),
  })),
  workouts: workouts.map((day, dayIndex) => ({
    ...day,
    items: day.items.map((item, itemIndex) =>
      dayIndex === 0 && itemIndex === 0 ? { ...item, reps: 123 } : { ...item },
    ),
  })),
  preExitChecklist: [{ id: "ios-smoke-local-edit", label: "עריכה מקומית שנשמרת" }],
};

const reopenBootCacheValue = {
  ...reopenFullCacheValue,
  foods: [],
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

function authSession(role = "coach") {
  const profile = role === "trainee" ? clientProfile : coachProfile;
  return {
    access_token: "ios-smoke-access-token",
    refresh_token: "ios-smoke-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: profile.id,
      aud: "authenticated",
      role: "authenticated",
      email: profile.email,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { full_name: profile.full_name, gender: "female" },
      created_at: "2026-01-01T00:00:00.000Z",
      confirmed_at: "2026-01-01T00:00:00.000Z",
    },
  };
}

async function installFixture(
  page,
  {
    role = "coach",
    online = false,
    showCalories = true,
    failSelectedTraineeDataOnce = false,
    fullCacheValue = null,
    bootCacheValue = null,
    broadcastAnnouncementAfterReconnect = null,
    plannedMenu = null,
    pendingChanges = false,
    trackBootCacheTiming = false,
  } = {},
) {
  const isTrainee = role === "trainee";
  const userId = isTrainee ? CLIENT_ID : COACH_ID;
  const fixtureClientProfile = {
    ...clientProfile,
    show_calories: showCalories,
    planned_menu: plannedMenu ?? clientProfile.planned_menu,
  };
  const defaultCacheValue = isTrainee
    ? {
        ...gymData,
        plannedMeals: plannedMenu ?? gymData.plannedMeals,
        userProfile: {
          ...gymData.userProfile,
          fullName: clientProfile.full_name,
          role: "client",
          approvalStatus: "approved",
          coachId: COACH_ID,
          weight: clientProfile.weight_kg,
          height: clientProfile.height_cm,
          age: clientProfile.age_years,
          showCalories,
        },
      }
    : gymData;
  const resolvedCacheValue = fullCacheValue ?? defaultCacheValue;
  await page.addInitScript(
    ({
      cacheKey,
      cacheValue,
      bootCacheValue,
      session,
      clientProfile,
      otherClientProfile,
      coachProfile,
      program,
      otherProgram,
      workouts,
      nutritionDay,
      cardioLog,
      otherCardioLog,
      bodyWeightLog,
      otherBodyWeightLog,
      bodyMeasurement,
      otherBodyMeasurement,
      habit,
      otherHabit,
      coachMessage,
      otherCoachMessage,
      broadcastAnnouncement,
      broadcastAnnouncementAfterReconnect,
      challenge,
      householdFoods,
      initialOnline,
      failSelectedTraineeDataOnce,
      pendingChanges,
      trackBootCacheTiming,
    }) => {
      let isOnline = initialOnline;
      let remoteBroadcastAnnouncement = broadcastAnnouncement;
      let persistedClientProfile = {
        ...clientProfile,
        planned_menu: clientProfile.planned_menu,
      };
      let hasSavedPlannedMenu = false;
      window.__iosSmokeGetPlannedMenu = () => persistedClientProfile.planned_menu;
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        get: () => isOnline,
      });
      window.__iosSmokeSetOnline = (nextOnline) => {
        if (nextOnline && !isOnline && broadcastAnnouncementAfterReconnect) {
          remoteBroadcastAnnouncement = broadcastAnnouncementAfterReconnect;
        }
        isOnline = nextOnline;
        window.dispatchEvent(new Event(nextOnline ? "online" : "offline"));
      };
      const expectedInitialPullPaths = new Set([
        "profiles",
        "coach_messages",
        "broadcast_announcements",
        "coach_clients",
        "custom_exercises",
        "programs",
        "program_days",
        "challenges",
        "challenge_enrollments",
        "workout_sessions",
        "body_weight_logs",
        "cardio_logs",
        "body_measurements",
        "client_habits",
        "custom_foods",
        "foods",
        "nutrition_days",
        "coach_recipes",
        "food_favorites",
      ]);
      const initialPullPaths = new Set();
      window.__iosSmokeInitialPullCompleteAt = null;
      window.__iosSmokeRemoteGetCount = 0;
      window.__iosSmokeFullCacheReadAt = null;
      window.__iosSmokeWorkspaceMountedAt = null;
      if (trackBootCacheTiming) {
        const markWorkspaceMounted = () => {
          if (
            window.__iosSmokeWorkspaceMountedAt === null &&
            document.querySelector('[data-testid="link-nav-coach"]')
          ) {
            window.__iosSmokeWorkspaceMountedAt = performance.now();
          }
        };
        new MutationObserver(markWorkspaceMounted).observe(document, {
          childList: true,
          subtree: true,
        });
      }
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function getItem(key) {
        if (
          trackBootCacheTiming &&
          this === window.localStorage &&
          key === cacheKey &&
          window.__iosSmokeFullCacheReadAt === null
        ) {
          window.__iosSmokeFullCacheReadAt = performance.now();
        }
        if (this === window.localStorage && key.endsWith("-auth-token")) {
          return JSON.stringify(session);
        }
        return originalGetItem.call(this, key);
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
      if (bootCacheValue) {
        window.localStorage.setItem(
          `${cacheKey.replace("user.", "boot.")}`,
          JSON.stringify(bootCacheValue),
        );
      }
      window.localStorage.setItem(
        `${cacheKey.replace("user.", "pending.")}`,
        pendingChanges ? "true" : "false",
      );
      const originalSetItem = Storage.prototype.setItem;
      window.__iosSmokeFullCacheWriteCount = 0;
      Storage.prototype.setItem = function setItem(key, value) {
        if (
          trackBootCacheTiming &&
          this === window.localStorage &&
          key === cacheKey &&
          window.__iosSmokeFullCacheReadAt !== null
        ) {
          window.__iosSmokeFullCacheWriteCount += 1;
        }
        return originalSetItem.call(this, key, value);
      };
      window.sessionStorage.setItem("gymtrack.workspace", "management");

      const originalFetch = window.fetch.bind(window);
      let remoteWorkouts = workouts.map((workout) => ({
        ...workout,
        items: JSON.parse(JSON.stringify(workout.items)),
      }));
      const remoteMessagesKey = "ios-smoke.remote-coach-messages";
      let remoteCoachMessages = (() => {
        try {
          const stored = window.localStorage.getItem(remoteMessagesKey);
          return stored ? JSON.parse(stored) : [coachMessage, otherCoachMessage];
        } catch {
          return [coachMessage, otherCoachMessage];
        }
      })();
      const selectedTraineeFailureKey = "ios-smoke.fail-selected-trainee-data-once";
      let shouldFailSelectedTraineeData =
        failSelectedTraineeDataOnce &&
        window.localStorage.getItem(selectedTraineeFailureKey) === "true";
      let selectedTraineeSelectionStarted = false;
      window.addEventListener(
        "click",
        (event) => {
          const target = event.target instanceof Element ? event.target : null;
          if (target?.textContent?.includes("מתאמנת בדיקה")) {
            selectedTraineeSelectionStarted = true;
          }
        },
        true,
      );
      window.__iosSmokeArmSelectedTraineeDataFailure = () => {
        if (!failSelectedTraineeDataOnce) return;
        window.localStorage.setItem(selectedTraineeFailureKey, "true");
        shouldFailSelectedTraineeData = true;
      };
      let coachMessageReads = 0;
      window.__iosSmokeCoachMessageReads = () => coachMessageReads;
      let broadcastReads = 0;
      window.__iosSmokeBroadcastReads = () => broadcastReads;
      const persistRemoteCoachMessages = () => {
        window.localStorage.setItem(remoteMessagesKey, JSON.stringify(remoteCoachMessages));
      };
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
          if (
            path === "rpc/save_user_planned_menu" &&
            (init?.method ?? "GET").toUpperCase() === "POST"
          ) {
            const payload = JSON.parse(init.body);
            persistedClientProfile = {
              ...persistedClientProfile,
              planned_menu: payload.next_planned_menu,
            };
            hasSavedPlannedMenu = true;
            return new Response(JSON.stringify(true), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }
          if (path === "coach_messages" && (init?.method ?? "GET").toUpperCase() === "POST") {
            const payload = JSON.parse(init.body);
            remoteCoachMessages = [
              ...remoteCoachMessages,
              {
                ...payload,
                id: `ios-smoke-message-${remoteCoachMessages.length + 1}`,
                created_at: "2026-08-25T09:00:00.000Z",
                is_read: false,
              },
            ];
            persistRemoteCoachMessages();
            return new Response(JSON.stringify([]), {
              status: 201,
              headers: { "content-type": "application/json" },
            });
          }
          let body = [];
          const selectedDetailsPaths = new Set([
            "profiles",
            "custom_exercises",
            "programs",
            "program_days",
            "nutrition_days",
            "body_measurements",
            "body_weight_logs",
            "workout_sessions",
            "cardio_logs",
            "client_habits",
          ]);
          if (
            selectedDetailsPaths.has(path) &&
            url.includes(clientProfile.id) &&
            shouldFailSelectedTraineeData &&
            selectedTraineeSelectionStarted
          ) {
            shouldFailSelectedTraineeData = false;
            window.localStorage.removeItem(selectedTraineeFailureKey);
            throw new Error("temporary selected trainee data failure");
          }
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
            const profile =
              hasSavedPlannedMenu ||
              requestedId === clientProfile.id ||
              url.includes(clientProfile.id)
                ? persistedClientProfile
                : requestedId === otherClientProfile.id || url.includes(otherClientProfile.id)
                  ? otherClientProfile
                  : coachProfile;
            body = parsed.searchParams.get("select") === "planned_menu" ? profile : [profile];
          } else if (path === "programs") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            const selectedProgram =
              requestedUserId === otherClientProfile.id ? otherProgram : program;
            body = [
              {
                id: selectedProgram.id,
                user_id:
                  requestedUserId === otherClientProfile.id
                    ? otherClientProfile.id
                    : clientProfile.id,
                name: selectedProgram.name,
                description: selectedProgram.notes,
              },
            ];
          } else if (path === "foods") {
            body = householdFoods;
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
                ? [
                    {
                      ...otherCardioLog,
                      user_id: otherClientProfile.id,
                      duration_min: otherCardioLog.durationMin,
                      estimated_calories: otherCardioLog.calories,
                    },
                  ]
                : [
                    {
                      ...cardioLog,
                      user_id: clientProfile.id,
                      duration_min: cardioLog.durationMin,
                      estimated_calories: cardioLog.calories,
                    },
                  ];
          } else if (path === "body_weight_logs") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? [
                    {
                      id: otherBodyWeightLog.id,
                      user_id: otherClientProfile.id,
                      date: otherBodyWeightLog.date,
                      weight_kg: otherBodyWeightLog.weight,
                    },
                  ]
                : [
                    {
                      id: bodyWeightLog.id,
                      user_id: clientProfile.id,
                      date: bodyWeightLog.date,
                      weight_kg: bodyWeightLog.weight,
                    },
                  ];
          } else if (path === "body_measurements") {
            const requestedUserId = parsed.searchParams.get("user_id")?.replace(/^eq\./, "");
            body =
              requestedUserId === otherClientProfile.id
                ? [
                    {
                      id: otherBodyMeasurement.id,
                      user_id: otherClientProfile.id,
                      date: otherBodyMeasurement.date,
                      waist_cm: otherBodyMeasurement.waistCm,
                      body_fat_pct: otherBodyMeasurement.bodyFatPct,
                      muscle_mass_kg: otherBodyMeasurement.muscleMassKg,
                      notes: otherBodyMeasurement.notes,
                    },
                  ]
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
                ? [
                    {
                      ...otherHabit,
                      user_id: otherClientProfile.id,
                      steps_target: otherHabit.stepsTarget,
                      weigh_in_done: otherHabit.weighInDone,
                      workout_done: otherHabit.workoutDone,
                      busy_day_mode: otherHabit.busyDayMode,
                    },
                  ]
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
            if ((init?.method ?? "GET").toUpperCase() === "GET") coachMessageReads += 1;
            const requestedClientId = parsed.searchParams.get("client_id")?.replace(/^eq\./, "");
            body = remoteCoachMessages
              .filter(
                (message) =>
                  message.coach_id === coachMessage.coach_id &&
                  message.client_id === requestedClientId,
              )
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (path === "broadcast_announcements") {
            if ((init?.method ?? "GET").toUpperCase() === "GET") broadcastReads += 1;
            body = [remoteBroadcastAnnouncement];
          } else if (path === "challenges") {
            body = [
              {
                ...challenge,
                duration_label: challenge.durationLabel,
                owner_id: coachMessage.coach_id,
                updated_at: "2026-08-20T00:00:00.000Z",
              },
            ];
          }
          if ((init?.method ?? "GET").toUpperCase() === "GET") {
            window.__iosSmokeRemoteGetCount += 1;
            if (expectedInitialPullPaths.has(path)) {
              initialPullPaths.add(path);
              if (
                initialPullPaths.size === expectedInitialPullPaths.size &&
                window.__iosSmokeInitialPullCompleteAt === null
              ) {
                window.__iosSmokeInitialPullCompleteAt = performance.now();
              }
            }
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
      cacheKey: `gymtrack.v1.user.${userId}`,
      cacheValue: resolvedCacheValue,
      bootCacheValue,
      session: authSession(role),
      clientProfile: fixtureClientProfile,
      otherClientProfile,
      coachProfile,
      program,
      otherProgram,
      workouts,
      nutritionDay,
      cardioLog,
      otherCardioLog,
      bodyWeightLog,
      otherBodyWeightLog,
      bodyMeasurement,
      otherBodyMeasurement,
      habit,
      otherHabit,
      coachMessage,
      otherCoachMessage,
      broadcastAnnouncement,
      broadcastAnnouncementAfterReconnect,
      challenge,
      householdFoods,
      initialOnline: online,
      failSelectedTraineeDataOnce,
      pendingChanges,
      trackBootCacheTiming,
    },
  );
}

function assertKeyboardVisible(locator) {
  return locator.scrollIntoViewIfNeeded().then(() =>
    expect
      .poll(
        async () => {
          return locator.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const viewport = window.visualViewport;
            const viewportTop = viewport?.offsetTop ?? 0;
            const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
            return {
              focused: document.activeElement === element,
              visible: rect.top >= viewportTop - 1 && rect.bottom <= viewportBottom + 1,
            };
          });
        },
        {
          message: "The focused feedback field did not settle inside the visible iPhone viewport.",
        },
      )
      .toMatchObject({ focused: true, visible: true }),
  );
}

test("iPhone loading video is ready and advances before and after hydration", async ({ page }) => {
  test.skip(
    test.info().project.name !== "webkit-iphone",
    "The loading-media regression is specific to the iPhone WebKit profile.",
  );

  let releaseHydration;
  const hydrationGate = new Promise((resolve) => {
    releaseHydration = resolve;
  });
  await page.route("**/@id/virtual:tanstack-start-dev-client-entry", (route) =>
    hydrationGate.then(() => route.continue()),
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const loadingVideo = page.locator(".loading-simple-video");
  await expect(loadingVideo).toHaveCount(1);
  expect(await page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(false);

  const readVideoState = () =>
    loadingVideo.evaluate((video) => ({
      currentTime: video.currentTime,
      duration: video.duration,
      readyState: video.readyState,
    }));
  const assertVideoAdvances = async () => {
    await expect.poll(async () => (await readVideoState()).readyState).toBeGreaterThanOrEqual(2);
    const first = await readVideoState();
    await page.waitForTimeout(250);
    const second = await readVideoState();
    expect(second.readyState).toBeGreaterThanOrEqual(2);

    const elapsed =
      Number.isFinite(second.duration) && second.currentTime < first.currentTime
        ? second.duration - first.currentTime + second.currentTime
        : second.currentTime - first.currentTime;
    expect(elapsed).toBeGreaterThan(0.05);
  };

  // The watchdog owns this server-rendered shell while the app module is
  // intentionally held back. This catches a loaded-but-frozen first frame.
  await assertVideoAdvances();

  releaseHydration();
  await expect.poll(() => page.evaluate(() => Boolean(window.__MY_ROUTINE_BOOTED__))).toBe(true);

  // A fast unauthenticated hydration may remove the splash immediately. When
  // WebKit keeps it visible long enough, verify the React-owned node too.
  if (await loadingVideo.count()) {
    await assertVideoAdvances();
  }
});

test("signup collects a bounded date of birth", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /אין לך חשבון\?/ }).click();
  const dateOfBirth = page.locator("#signup-date-of-birth");
  await expect(dateOfBirth).toBeVisible();

  const bounds = await dateOfBirth.evaluate((input) => ({
    required: input.required,
    min: input.min,
    max: input.max,
  }));
  const expectedBounds = await page.evaluate(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return {
      min: `${year - 120}-01-01`,
      max: `${year}-${month}-${day}`,
    };
  });

  expect(bounds).toEqual({
    required: true,
    ...expectedBounds,
  });
});

test("coach BMR editor restores date of birth and keeps age read-only", async ({ page }) => {
  await installFixture(page, { online: true });

  await page.goto(`/coach/clients/${CLIENT_ID}`);

  const workspace = page.locator('[data-coach-workspace="true"]');
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  const bmrButton = page.getByRole("button", { name: "מחשבון BMR", exact: true });
  await bmrButton.evaluate((element) =>
    element.scrollIntoView({ block: "center", inline: "nearest" }),
  );
  await bmrButton.dispatchEvent("click");

  const bmrEditor = page.getByTestId("coach-bmr-editor");
  await expect(bmrEditor).toBeVisible();
  await expect(bmrEditor.locator('input[type="date"]')).toHaveValue("1998-05-17");
  await expect(bmrEditor.getByText("גיל מחושב: 28", { exact: true })).toBeVisible();
  const manualAgeInputs = await bmrEditor.locator("input").evaluateAll((inputs) =>
    inputs.filter((input) => {
      const labelText = input.closest("label")?.textContent?.trim() ?? "";
      return labelText.startsWith("גיל");
    }).length,
  );
  expect(manualAgeInputs).toBe(0);
});

test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  await installFixture(page);

  await page.goto("/");
  const coachNav = page.getByTestId("link-nav-coach");
  await expect(coachNav).toBeVisible({ timeout: 20_000 });
  await coachNav.click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();

  const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  await clientCard.click();
  await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();

  const workspace = page.locator('[data-coach-workspace="true"]');
  await test.step("load selected trainee details", async () => {
    await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
      timeout: 20_000,
    });
    await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);
    await expect(workspace.getByTestId("coach-client-details-error")).toHaveCount(0);
  });
  await test.step("open trainee profile and send a message", async () => {
    await expect(page.getByText("שליחת הודעת חיזוק / הנחיה למתאמן", { exact: true })).toHaveCount(
      0,
    );
    await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
    const profileMessage = page.getByTestId("coach-client-message-profile");
    await expect(profileMessage).toBeVisible();
    const profileMessageText = "הודעה שנשלחה מהפרופיל";
    await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
    await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
    await expect(profileMessage).toContainText("הודעת החיזוק נשלחה בהצלחה למתאמן!");
    await expect(profileMessage).toContainText(profileMessageText);
  });
  const profileInline = page.locator('[data-coach-client-profile-inline="true"]');
  await expect(profileInline).toBeVisible();
  await expect(page.getByRole("dialog", { name: "פרופיל המשתמש" })).toHaveCount(0);
  const activityHistory = page.getByTestId("coach-activity-history");
  await expect(activityHistory).toBeVisible();
  await expect(profileInline).toContainText("63.4");
  await expect(profileInline).toContainText("74");
  await expect(profileInline).toContainText("8,500");
  await expect(profileInline).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeHidden();
  await expect(activityHistory).not.toContainText("נתון של מתאמנת אחרת");
  await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();

  await expect(workspace).toHaveCSS("overflow-y", "auto");
  const workspaceCanScroll = await workspace.evaluate((element) => {
    const canScroll = element.scrollHeight > element.clientHeight + 1;
    if (canScroll) element.scrollTop = element.scrollHeight;
    return canScroll;
  });
  if (workspaceCanScroll) {
    await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  }
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
  await expect(page.getByRole("dialog", { name: "בניית תוכנית ותפריט למתאמן" })).toHaveCount(0);
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
  const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();

  await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  await expect(setCountInput).toHaveValue("4");
  const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
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
  const supersetOption = page
    .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
    .getByRole("option", { name: /תרגיל בדיקה 2/ });
  await expect(supersetOption).toBeVisible();
  await supersetOption.click({ force: true });
  await expect(supersetSearch).toHaveValue("");
  await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
    timeout: 20_000,
  });

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
  const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  await expect(nutritionFoodQuantity).toBeVisible();
  await expect(nutritionFoodQuantity).toHaveText(/\d/);
  const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  for (const [index, label] of coachMacroLabels.entries()) {
    const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
    await expect(macro).toHaveAttribute("data-nutrition-macro", label);
    await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  }
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

test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  await installFixture(page, { online: true });

  await page.goto("/");
  await page.getByTestId("link-nav-coach").click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();

  const workspace = page.locator('[data-coach-workspace="true"]');
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  const menu = page.locator("#coach-menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();

  const addFood = async (searchTerm, unit, quantity) => {
    await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
    const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
    await foodSearch.fill(searchTerm);
    await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
    const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
    await expect(unitSelect).toBeVisible();
    await unitSelect.selectOption(unit);
    await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
    await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  };

  await addFood("יוגורט", "unit", 1);
  await addFood("שמן זית", "tbsp", 1);
  await addFood("משקה חלב", "cup", 1);
  await addFood("גבינה צהובה", "slice", 2);
  await addFood("אורז מבושל", "cup", 1);

  const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  const expectedMacros = [
    ["חלבון", "39.5"],
    ["פחמימות", "111.3"],
    ["שומן", "32.9"],
    ["קלוריות", "931.1"],
  ];
  for (const [label, value] of expectedMacros) {
    await expect(
      macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
    ).toHaveText(value);
  }

  const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  await saveMenuButton.click();
  await expect(saveMenuButton).toHaveText("שמרי תפריט");
  await expect(menu).toContainText("יוגורט טבעי");

  await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  await expect(page.locator("#coach-menu")).toContainText("1 כף");
  await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  await expect(page.locator("#coach-menu")).toContainText("1 כוס");

  const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  const traineePage = await page.context().newPage();
  await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  await traineePage.goto("/nutrition");
  await expect(traineePage).toHaveURL(/\/nutrition/);
  await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");

  await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  await expect(replacementDialog).toBeVisible();
  await replacementDialog
    .locator('input[placeholder*="חפשי מאכל חלופי"]')
    .fill("יוגורט טבעי");
  const yogurtReplacement = replacementDialog
    .getByRole("button", { name: /יוגורט טבעי/ })
    .filter({ hasText: "כף" })
    .first();
  await expect(yogurtReplacement).toContainText("כף");
  const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  expect(replacementName).toBeTruthy();
  await yogurtReplacement.click();
  await expect(replacementDialog).toBeHidden();

  await traineePage.getByRole("link", { name: "היום שלי", exact: true }).click();
  await traineePage.getByRole("link", { name: "התזונה שלי", exact: true }).click();
  await expect(traineePage).toHaveURL(/\/nutrition/);
  await expect(traineePage.getByText(replacementName, { exact: true })).toBeVisible();
  await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText(
    /\d+(?:\.\d+)? כף/,
  );
});

test("trainee nutrition quantities and macro visibility stay consistent", async ({ page }) => {
  await installFixture(page, { role: "trainee", showCalories: false });

  await page.goto("/nutrition");
  const plannedFoodQuantity = page.getByTestId("nutrition-food-quantity").first();
  await expect(plannedFoodQuantity).toBeVisible();
  await expect(plannedFoodQuantity).toHaveText(/\d/);

  const plannedMacroGrid = page.getByTestId("nutrition-macro-grid").first();
  const visibleMacroLabels = ["חלבון", "פחמימות", "שומן"];
  for (const [index, label] of visibleMacroLabels.entries()) {
    const macro = plannedMacroGrid.locator("[data-nutrition-macro]").nth(index);
    await expect(macro).toHaveAttribute("data-nutrition-macro", label);
    await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  }
  await expect(plannedMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);

  await page.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  const replacementDialog = page.getByRole("dialog", { name: "החלפת מאכל" });
  await expect(replacementDialog).toBeVisible();
  const replacementQuantity = replacementDialog.getByTestId("nutrition-food-quantity").first();
  await expect(replacementQuantity).toBeVisible();
  await expect(replacementQuantity).toHaveText(/\d/);
  const replacementMacroGrid = replacementDialog.getByTestId("nutrition-macro-grid").first();
  for (const [index, label] of visibleMacroLabels.entries()) {
    const macro = replacementMacroGrid.locator("[data-nutrition-macro]").nth(index);
    await expect(macro).toHaveAttribute("data-nutrition-macro", label);
    await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  }
  await expect(replacementMacroGrid.locator('[data-nutrition-macro="קלוריות"]')).toHaveCount(0);
});

test("coach profile resets measurements, activity, and messages when switching trainees", async ({
  page,
}) => {
  await installFixture(page);

  await page.goto("/");
  await page.getByTestId("link-nav-coach").click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");

  await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  const workspace = page.locator('[data-coach-workspace="true"]');
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();

  const profile = page.locator('[data-coach-client-profile-inline="true"]');
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("63.4");
  await expect(profile).toContainText("74");
  await expect(profile).toContainText("8,500");
  await expect(profile).toContainText("הליכה מהירה");
  await expect(profile).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect(profile).not.toContainText("71.8");
  await expect(profile).not.toContainText("הודעה של מתאמנת אחרת");

  await page.getByRole("button", { name: "סגירת פרופיל המשתמש" }).click();
  await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  await expect(workspace).toHaveCount(0);

  const clientSearch = page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" });
  await expect(clientSearch).toBeVisible();
  await clientSearch.fill("מתאמנת אחרת");
  await expect(page.getByText("מתאמנת אחרת", { exact: true })).toBeVisible();
  await page.getByText("מתאמנת אחרת", { exact: true }).click();
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();

  await expect(profile).toBeVisible();
  await expect(profile).toContainText("71.8");
  await expect(profile).toContainText("88");
  await expect(profile).toContainText("1,234");
  await expect(profile).toContainText("רכיבה אחרת");
  await expect(profile).toContainText("הודעה של מתאמנת אחרת");
  await expect(profile).not.toContainText("63.4");
  await expect(profile).not.toContainText("כל הכבוד על ההתמדה השבוע");
  await expect(profile).not.toContainText("מתאמנת בדיקה");
});

test("coach profile retry recovers after a temporary trainee data failure", async ({ page }) => {
  await installFixture(page, { failSelectedTraineeDataOnce: true });

  await page.goto("/");
  await page.getByTestId("link-nav-coach").click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת בדיקה");
  await page.evaluate(() => window.__iosSmokeArmSelectedTraineeDataFailure());
  await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();

  const workspace = page.locator('[data-coach-workspace="true"]');
  const detailsError = page.getByTestId("coach-client-details-error");
  await expect(workspace).toHaveAttribute("data-coach-details-state", "error", {
    timeout: 20_000,
  });
  await expect(workspace).toHaveAttribute("aria-busy", "false");
  await expect(detailsError).toBeVisible();
  await expect(detailsError).toContainText("temporary selected trainee data failure");
  await expect(workspace.getByTestId("coach-client-details-loading")).toHaveCount(0);

  await page.getByTestId("coach-client-details-retry").click();
  await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
    timeout: 20_000,
  });
  await expect(workspace.getByTestId("coach-client-details-ready")).toBeVisible();
  await expect(detailsError).toHaveCount(0);

  await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();
  await expect(page.locator('[data-coach-client-profile-inline="true"]')).toBeVisible();
  await expect(page.getByText("פרופיל המשתמש", { exact: true })).toBeVisible();
});

test("authenticated core routes remain usable across responsive widths", async ({ page }) => {
  await installFixture(page);

  const routes = [
    { path: "/workouts", marker: "האימונים שלי" },
    { path: "/programs", marker: "התוכניות שלך" },
    { path: "/exercises", marker: "תרגילים" },
    { path: "/nutrition", marker: "יומן תזונה" },
  ];

  await page.goto("/coach/clients");
  await expect(page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" })).toBeVisible();

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { name: route.marker, exact: true })).toBeVisible({
      timeout: 20_000,
    });
  }
});

test("trainee sees the message sent from the coach profile after reconnecting", async ({
  page,
}) => {
  await installFixture(page);

  await page.goto("/");
  await page.getByTestId("link-nav-coach").click();
  await expect(page).toHaveURL(/\/coach\/clients/);
  await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  await page.getByRole("button", { name: "פתיחת פרופיל המשתמש" }).click();

  const profileMessage = page.getByTestId("coach-client-message-profile");
  await expect(profileMessage).toBeVisible();
  const profileMessageText = "הודעה שנשלחה מהפרופיל ונראית למתאמנת";
  await profileMessage.getByPlaceholder("כתבי הודעה למתאמן...").fill(profileMessageText);
  await profileMessage.getByRole("button", { name: "שלח", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate((key) => window.localStorage.getItem(key), "ios-smoke.remote-coach-messages"),
    )
    .toContain(profileMessageText);

  const traineePage = await page.context().newPage();
  await installFixture(traineePage, { role: "trainee" });
  await traineePage.goto("/");
  const traineeMessage = traineePage.getByTestId("coach-message-banner");
  await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");

  await traineePage.evaluate(() => window.__iosSmokeSetOnline(true));
  await expect(traineeMessage).toContainText(profileMessageText);
});

test("trainee reopens a received coach message offline before reconnect refresh", async ({
  page,
}) => {
  await installFixture(page, { role: "trainee" });

  await page.goto("/");
  const traineeMessage = page.getByTestId("coach-message-banner");
  await expect(traineeMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);

  await page.reload();
  const reopenedMessage = page.getByTestId("coach-message-banner");
  await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect.poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads())).toBe(0);

  await page.evaluate(() => window.__iosSmokeSetOnline(true));
  await expect
    .poll(() => page.evaluate(() => window.__iosSmokeCoachMessageReads()))
    .toBeGreaterThan(0);
  await expect(reopenedMessage).toContainText("כל הכבוד על ההתמדה השבוע");
  await expect
    .poll(async () => {
      const cached = await page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
        "gymtrack.v1.user.ios-smoke-client",
      );
      return cached.coachMessages?.length ?? 0;
    })
    .toBe(1);
});

test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  const refreshedBroadcastText = "הודעת תפוצה לאחר רענון reconnect";
  await installFixture(page, {
    role: "trainee",
    broadcastAnnouncementAfterReconnect: {
      ...broadcastAnnouncement,
      message: refreshedBroadcastText,
      created_at: "2026-08-25T09:00:00.000Z",
    },
  });

  await page.goto("/");
  const broadcast = page.getByTestId("broadcast-message-banner");
  await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);

  await page.reload();
  const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);

  await page.evaluate(() => window.__iosSmokeSetOnline(true));
  await expect
    .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
    .toBeGreaterThan(0);
  await expect(reopenedBroadcast).toContainText(refreshedBroadcastText);
  await expect
    .poll(async () => {
      const cached = await page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
        "gymtrack.v1.user.ios-smoke-client",
      );
      return cached.broadcasts?.length ?? 0;
    })
    .toBe(1);
  await expect
    .poll(async () => {
      const cached = await page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
        "gymtrack.v1.user.ios-smoke-client",
      );
      return cached.broadcasts?.[0]?.message ?? null;
    })
    .toBe(refreshedBroadcastText);
});

test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  await installFixture(page, {
    online: true,
    fullCacheValue: reopenFullCacheValue,
    bootCacheValue: reopenBootCacheValue,
    pendingChanges: true,
    trackBootCacheTiming: true,
  });

  await page.goto("/");
  const coachNav = page.getByTestId("link-nav-coach");
  await expect(coachNav).toBeVisible({ timeout: 20_000 });

  await expect
    .poll(() =>
      page.evaluate(() => ({
        workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
        fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
      })),
    )
    .toMatchObject({
      workspaceMountedAt: expect.any(Number),
      fullCacheReadAt: expect.any(Number),
    });

  const bootTiming = await page.evaluate(() => ({
    workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
    fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  }));
  expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);

  await expect
    .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
    .not.toBeNull();
  await expect
    .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
    .toBeGreaterThan(0);

  const refreshedCache = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
    `gymtrack.v1.user.${COACH_ID}`,
  );
  expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
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
  await assertKeyboardVisible(workoutNote);
  await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  await page.keyboard.press("Escape");
  await expect(workoutNote).toBeHidden();

  const firstExercise = page.locator("article").first();
  await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  await exerciseNote.fill("הערת תרגיל בטיוטה");
  await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");

  await page.goto("/programs");
  // TanStack can finish the document navigation before the route's client
  // transition settles on WebKit. Wait for visible route content before
  // starting the next navigation, otherwise WebKit reports an interrupted
  // goto even though the app is healthy.
  await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  await page.goto(`/session/${WORKOUT_ID}`);
  await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");

  const reopenedFirstExercise = page.locator("article").first();
  await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
    /border-primary/,
  );
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
