import { Link, Navigate, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Apple,
  Award,
  ChevronLeft,
  Crown,
  Dumbbell,
  Edit2,
  Plus,
  Save,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  MessageSquare,
  Search,
  UserCog,
  ArrowRightLeft,
  Activity,
  Calculator,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Overlay } from "../components/ui-app/Overlay";
import {
  emptyExercise,
  foodTotals,
  savePlannedMeals,
  saveProgram,
  saveExercise,
  saveWorkout,
  saveWorkoutInProgram,
  searchFoods,
  todayKey,
  uid,
  useAuthUser,
  useGym,
} from "../lib/gym-store";
import { pullClientDataForCoach } from "../lib/supabase-sync";
import { supabase } from "../lib/supabase";
import { calculateCalorieEstimate } from "../lib/calorie-calculator";
import { exerciseDisplayName } from "../lib/exercise-library";
import type {
  BodyMeasurement,
  Exercise,
  Meal,
  MealFood,
  Program,
  UserRole,
  Workout,
  WorkoutItem,
} from "../lib/gym-types";
import { genderText } from "../lib/gender-copy";
import {
  defaultFoodQuantity,
  foodQuantityOptions,
  mealFoodFromPortion,
  mealFoodQuantityLabel,
  type FoodQuantityUnit,
} from "../lib/food-portions";

type CoachClientRow = {
  id: string;
  client_id: string;
  created_at: string;
  profiles?: { email?: string | null; full_name?: string | null; weight_kg?: number | null } | null;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: UserRole | null;
  created_at?: string | null;
  approval_status?: "pending" | "approved" | "rejected" | null;
  coach_id?: string | null;
};

type ClientFeedbackRow = {
  id: string;
  client_id: string;
  difficulty_rating?: string | null;
  discomfort_notes?: string | null;
  coach_notes?: string | null;
  created_at?: string | null;
};

type ClientDetails = Awaited<ReturnType<typeof pullClientDataForCoach>>;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeProfileIdentity(value?: string | null): string {
  return (value ?? "").trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function profileDisplayName(
  profile?: { full_name?: string | null; email?: string | null } | null,
): string {
  const identities = [
    normalizeProfileIdentity(profile?.email?.split("@")[0]),
    normalizeProfileIdentity(profile?.full_name),
  ];
  const knownNames: Record<string, string> = {
    maya2003yo: "מאיה בדיקה 1",
    maya2003yos: "מאיה בדיקה 1",
    mayayy2345: "מאיה בדיקה 2",
    michalyosfan: "מיכל יוספן",
    mayayosfan234: "מאיה יוספן",
  };
  const knownName = identities.map((identity) => knownNames[identity]).find(Boolean);
  if (knownName) return knownName;
  const name = profile?.full_name?.trim();
  return name || "שם לא הוגדר";
}

export const Route = createFileRoute("/coach")({
  component: () => <Outlet />,
});

export function CoachDashboardPage({
  clientsOnly = false,
  trackingLanding = false,
  workspacePage = false,
  clientId,
  workspaceMode = "all",
  initialProgramId,
  initialDayId,
  initialExerciseId,
  initialNutritionDate,
  initialNutritionMealId,
  initialNutritionFoodId,
}: {
  clientsOnly?: boolean;
  trackingLanding?: boolean;
  workspacePage?: boolean;
  clientId?: string;
  workspaceMode?: "all" | "programs" | "nutrition";
  initialProgramId?: string;
  initialDayId?: string;
  initialExerciseId?: string;
  initialNutritionDate?: string;
  initialNutritionMealId?: string;
  initialNutritionFoodId?: string;
}) {
  const store = useGym();
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const role = store.userProfile?.role;
  const gender = store.userProfile?.gender;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;

  const [clients, setClients] = useState<CoachClientRow[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileRow[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [ownerUserSearch, setOwnerUserSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientWorkspace, setShowClientWorkspace] = useState(false);
  const [openEditor, setOpenEditor] = useState<"programs" | "nutrition" | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [clientDetailsError, setClientDetailsError] = useState("");
  const [managementError, setManagementError] = useState("");
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);
  const [roleChangeNotice, setRoleChangeNotice] = useState("");
  const [approvalCoachByUser, setApprovalCoachByUser] = useState<Record<string, string>>({});
  const [approvalUserId, setApprovalUserId] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState("");
  const [clientFeedback, setClientFeedback] = useState<ClientFeedbackRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const applyClientDetails = useCallback((result: ClientDetails) => {
    if (result.error) {
      setClientDetails(null);
      setClientDetailsError(result.error);
      setManagementError(result.error);
      return;
    }
    setClientDetailsError("");
    setClientDetails(result);
  }, []);

  // Coach Message sender state
  const [coachMsgText, setCoachMsgText] = useState("");
  const [msgSentNotice, setMsgSentNotice] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastAudience, setBroadcastAudience] = useState<
    "assigned_clients" | "coaches" | "clients" | "everyone"
  >("assigned_clients");
  const [broadcastNotice, setBroadcastNotice] = useState("");
  const [broadcastError, setBroadcastError] = useState("");

  // Coach Program & Day Builder state
  const [newProgramName, setNewProgramName] = useState("");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState("");

  // Exercise Assignment Editor state
  const [selectedExId, setSelectedExId] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("הכל");
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExerciseDraft, setNewExerciseDraft] = useState<Exercise>(() => emptyExercise());
  const [newExerciseError, setNewExerciseError] = useState("");
  const [programQuery, setProgramQuery] = useState("");
  const [targetWeight, setTargetWeight] = useState(20);
  const [setsCount, setSetsCount] = useState(3);
  const [setModes, setSetModes] = useState<Array<"normal" | "warmup" | "drop" | "superset">>([
    "normal",
    "normal",
    "normal",
  ]);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(10);
  const [restSec, setRestSec] = useState(90);
  const [warmupEnabled, setWarmupEnabled] = useState(false);
  const [warmupSetsCount, setWarmupSetsCount] = useState(1);
  const [warmupWeight, setWarmupWeight] = useState(10);
  const [warmupReps, setWarmupReps] = useState(10);
  const [warmupRepsMax, setWarmupRepsMax] = useState(12);
  const [techNotes, setTechniqueNotes] = useState("");
  const [supersetGroup, setSupersetGroup] = useState("");
  const [supersetPartnerId, setSupersetPartnerId] = useState("");
  const [dropSetEnabled, setDropSetEnabled] = useState(false);
  const [dropLevel1Weight, setDropLevel1Weight] = useState("");
  const [dropLevel1RepsMin, setDropLevel1RepsMin] = useState(8);
  const [dropLevel1RepsMax, setDropLevel1RepsMax] = useState(10);
  const [dropLevel2Weight, setDropLevel2Weight] = useState("");
  const [dropLevel2RepsMin, setDropLevel2RepsMin] = useState(6);
  const [dropLevel2RepsMax, setDropLevel2RepsMax] = useState(8);
  // Legacy controls remain available for existing plans; their selected result
  // is converted to the fixed levels below when the item is saved.
  const [dropReductionMode, setDropReductionMode] = useState<"percent" | "kg" | "">("");
  const [dropReductionValue, setDropReductionValue] = useState("");
  const [dropRepsMin, setDropRepsMin] = useState(10);
  const [dropRepsMax, setDropRepsMax] = useState(12);
  const [exerciseBuilderNotice, setExerciseBuilderNotice] = useState("");
  const [supersetRepsMin, setSupersetRepsMin] = useState(10);
  const [supersetRepsMax, setSupersetRepsMax] = useState(12);
  const [approvedAltIds, setApprovedAltIds] = useState<string[]>([]);
  const [bodyweightAlternativeId, setBodyweightAlternativeId] = useState("");

  // Nutrition Prescription state
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"programs" | "nutrition" | null>(
    null,
  );
  const [selectedTrackingWorkoutId, setSelectedTrackingWorkoutId] = useState<string | null>(null);
  const [calTarget, setCalTarget] = useState(0);
  const [protTarget, setProtTarget] = useState(0);
  const [menuDate, setMenuDate] = useState(todayKey());
  // Actual logs are reviewed independently from the plan editor. Keeping a
  // separate date cursor prevents changing the prescribed menu while browsing
  // a client's historical entries.
  const [trackingDate, setTrackingDate] = useState(todayKey());
  const workspaceSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<Meal[]>([]);
  const [menuFoodMealId, setMenuFoodMealId] = useState<string | null>(null);
  const [menuFoodId, setMenuFoodId] = useState("");
  const [menuFoodQuery, setMenuFoodQuery] = useState("");
  const [menuFoodQuantity, setMenuFoodQuantity] = useState(1);
  const [menuFoodUnit, setMenuFoodUnit] = useState<FoodQuantityUnit>("serving");
  const [menuNotice, setMenuNotice] = useState("");
  const [focusedNutritionFoodId, setFocusedNutritionFoodId] = useState<string | null>(null);
  const [focusedNutritionMealId, setFocusedNutritionMealId] = useState<string | null>(null);
  const isSelfSelected = Boolean(authUser?.id && selectedClientId === authUser.id);
  const [overviewRows, setOverviewRows] = useState<
    Array<{ client: CoachClientRow; details: ClientDetails }>
  >([]);
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [measurementDraft, setMeasurementDraft] = useState<BodyMeasurement>({
    id: "",
    date: todayKey(),
  });
  const [measurementNotice, setMeasurementNotice] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileHeight, setProfileHeight] = useState("");
  const [profileWeight, setProfileWeight] = useState("");
  const [profileWorkouts, setProfileWorkouts] = useState("");
  const [profileGender, setProfileGender] = useState<"female" | "male" | "">("");
  const [profileNotice, setProfileNotice] = useState("");
  const [showBmrCalculator, setShowBmrCalculator] = useState(false);
  const showClientOverview = !trackingLanding && !workspacePage && !openEditor;
  const showProgramBuilder =
    !trackingLanding &&
    (workspaceMode === "programs" ||
      openEditor === "programs" ||
      (workspacePage && activeWorkspaceTab === "programs") ||
      (workspaceMode === "all" && activeWorkspaceTab === "programs"));
  const showNutritionBuilder =
    !trackingLanding &&
    (workspaceMode === "nutrition" ||
      openEditor === "nutrition" ||
      (workspaceMode === "all" && activeWorkspaceTab === "nutrition"));

  const loadCoachClients = useCallback(async () => {
    setManagementError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setManagementError("לא ניתן לאמת את חשבון המאמן. נסי להתחבר מחדש.");
      return;
    }

    let coachClientsQuery = supabase
      .from("coach_clients")
      .select(
        "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name, weight_kg)",
      );
    if (!isOwner) {
      coachClientsQuery = coachClientsQuery.eq("coach_id", user.id);
    }
    const { data, error } = await coachClientsQuery;

    if (error) {
      setManagementError(`טעינת המתאמנים נכשלה: ${error.message}`);
      return;
    }
    if (data) {
      setClients(data as unknown as CoachClientRow[]);
    }
  }, [isOwner]);

  const loadAllProfilesForOwner = useCallback(async (): Promise<boolean> => {
    if (!isOwner) return false;
    setManagementError("");
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      setManagementError(`טעינת משתמשי המערכת נכשלה: ${error.message}`);
      return false;
    }
    if (data) {
      setAllProfiles(data as unknown as ProfileRow[]);
    }
    return true;
  }, [isOwner]);

  const loadClientFeedback = useCallback(async () => {
    if (!isCoach) return;
    const { data } = await supabase
      .from("client_feedback")
      .select("id, client_id, difficulty_rating, discomfort_notes, coach_notes, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setClientFeedback(data as ClientFeedbackRow[]);
  }, [isCoach]);

  useEffect(() => {
    if (isCoach) {
      loadCoachClients();
    }
    if (isOwner) {
      loadAllProfilesForOwner();
    }
    loadClientFeedback();
  }, [isCoach, isOwner, loadAllProfilesForOwner, loadCoachClients, loadClientFeedback]);

  useEffect(() => {
    if (clientsOnly || clients.length === 0) {
      setOverviewRows([]);
      return;
    }
    let active = true;
    Promise.all(
      clients.map(async (client) => ({
        client,
        details: await pullClientDataForCoach(client.client_id),
      })),
    ).then((rows) => {
      if (active) setOverviewRows(rows.filter((row) => !row.details.error));
    });
    return () => {
      active = false;
    };
  }, [clients, clientsOnly]);

  useEffect(() => {
    if (!clientId) return;
    setSelectedClientId(clientId);
    setShowClientWorkspace(true);
    setOpenEditor(trackingLanding || workspaceMode === "all" ? null : workspaceMode);
    setActiveWorkspaceTab(
      trackingLanding
        ? "programs"
        : workspaceMode === "nutrition"
          ? "nutrition"
          : workspaceMode === "programs"
            ? "programs"
            : null,
    );
    setSelectedTrackingWorkoutId(null);
  }, [trackingLanding, workspacePage, clientId, workspaceMode]);

  useEffect(() => {
    if (!selectedClientId) {
      setClientDetails(null);
      return;
    }

    let active = true;
    setLoadingDetails(true);
    setClientDetailsError("");
    setManagementError("");
    if (isSelfSelected) {
      setClientDetails({
        programs: store.programs,
        workouts: store.workouts,
        nutritionDays: store.nutritionDays,
        nutritionTargets: store.nutritionTargets,
        history: store.history,
        cardioLogs: store.cardioLogs ?? [],
        bodyMeasurements: store.bodyMeasurements ?? [],
        ...(store.userProfile ? { profile: store.userProfile } : {}),
      });
      setLoadingDetails(false);
      return;
    }

    pullClientDataForCoach(selectedClientId).then((res) => {
      if (!active) return;
      applyClientDetails(res);
      setLoadingDetails(false);
    });
    return () => {
      active = false;
    };
  }, [
    applyClientDetails,
    isSelfSelected,
    selectedClientId,
    store.cardioLogs,
    store.history,
    store.nutritionDays,
    store.nutritionTargets,
    store.programs,
    store.userProfile,
    store.workouts,
    store.bodyMeasurements,
  ]);

  useEffect(() => {
    const latest = clientDetails?.bodyMeasurements?.[0];
    setMeasurementDraft(
      latest
        ? { ...latest }
        : {
            id: "",
            date: todayKey(),
          },
    );
    setEditingMeasurements(false);
    setMeasurementNotice("");
  }, [clientDetails]);

  useEffect(() => {
    setCalTarget(clientDetails?.nutritionTargets?.calories ?? 0);
    const profile = clientDetails?.profile;
    setProfileAge(profile?.age === undefined ? "" : String(profile.age));
    setProfileHeight(profile?.height === undefined ? "" : String(profile.height));
    setProfileWeight(profile?.weight && profile.weight > 0 ? String(profile.weight) : "");
    setProfileWorkouts(
      profile?.workoutsPerWeek === undefined ? "" : String(profile.workoutsPerWeek),
    );
    setProfileGender(profile?.gender ?? "");
    setProfileNotice("");
  }, [clientDetails]);

  const calorieProfile = clientDetails?.profile
    ? {
        ...clientDetails.profile,
        age: profileAge === "" ? undefined : Number(profileAge),
        height: profileHeight === "" ? undefined : Number(profileHeight),
        weight: profileWeight === "" ? 0 : Number(profileWeight),
        workoutsPerWeek: profileWorkouts === "" ? undefined : Number(profileWorkouts),
        gender: profileGender === "" ? undefined : profileGender,
      }
    : null;
  const calorieEstimate =
    calorieProfile &&
    profileAge !== "" &&
    profileHeight !== "" &&
    profileWeight !== "" &&
    profileWorkouts !== "" &&
    profileGender !== ""
      ? calculateCalorieEstimate({
          ...calorieProfile,
          age: Number(profileAge),
          height: Number(profileHeight),
          weight: Number(profileWeight),
          workoutsPerWeek: Number(profileWorkouts),
          gender: profileGender as "male" | "female",
        })
      : null;

  const saveClientCalorieProfile = async () => {
    if (!selectedClientId || !clientDetails?.profile) return;
    const age = profileAge === "" ? undefined : Number(profileAge);
    const height = profileHeight === "" ? undefined : Number(profileHeight);
    const weight = profileWeight === "" ? undefined : Number(profileWeight);
    const workouts = profileWorkouts === "" ? undefined : Number(profileWorkouts);
    const gender = profileGender === "" ? undefined : profileGender;
    const valid =
      [age, height, weight, workouts].every(
        (value) => value !== undefined && Number.isFinite(value),
      ) &&
      gender !== undefined &&
      (age ?? 0) > 0 &&
      (height ?? 0) > 0 &&
      (weight ?? 0) > 0 &&
      (workouts ?? -1) >= 0 &&
      (workouts ?? 15) <= 14;
    if (!valid) {
      setProfileNotice("יש להשלים גיל, גובה, משקל ומספר אימונים תקינים כדי לשמור ולחשב.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        age_years: age,
        height_cm: height,
        weight_kg: weight,
        workouts_per_week: workouts,
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedClientId);
    if (error) {
      setProfileNotice(`שמירת נתוני הגוף נכשלה: ${error.message}`);
      return;
    }
    setClientDetails((current) =>
      current
        ? {
            ...current,
            ...(current.profile
              ? {
                  ...current.profile,
                  ...(age === undefined ? {} : { age }),
                  ...(height === undefined ? {} : { height }),
                  weight: weight ?? 0,
                  ...(workouts === undefined ? {} : { workoutsPerWeek: workouts }),
                  ...(gender === undefined ? {} : { gender }),
                }
              : {}),
          }
        : current,
    );
    setProfileNotice("נתוני הגוף נשמרו. הנתונים והחישוב זמינים רק באזור המאמן.");
  };

  const saveClientMeasurements = async () => {
    if (!selectedClientId || !isCoach) return;
    const numeric = (value: number | undefined) =>
      typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
    const payload = {
      user_id: selectedClientId,
      date: measurementDraft.date || todayKey(),
      chest_cm: numeric(measurementDraft.chestCm),
      waist_cm: numeric(measurementDraft.waistCm),
      hips_cm: numeric(measurementDraft.hipsCm),
      biceps_cm: numeric(measurementDraft.bicepsCm),
      thighs_cm: numeric(measurementDraft.thighsCm),
      calves_cm: numeric(measurementDraft.calvesCm),
      neck_cm: numeric(measurementDraft.neckCm),
      body_fat_pct: numeric(measurementDraft.bodyFatPct),
      muscle_mass_kg: numeric(measurementDraft.muscleMassKg),
      notes: measurementDraft.notes?.trim() || null,
    };
    const { data, error } = await supabase
      .from("body_measurements")
      .upsert(
        { ...(measurementDraft.id ? { id: measurementDraft.id } : {}), ...payload },
        { onConflict: "user_id,date" },
      )
      .select("*")
      .single();
    if (error) {
      setMeasurementNotice(`שמירת המדידות נכשלה: ${error.message}`);
      return;
    }
    const saved: BodyMeasurement = {
      id: data.id,
      date: data.date,
      chestCm: data.chest_cm ?? undefined,
      waistCm: data.waist_cm ?? undefined,
      hipsCm: data.hips_cm ?? undefined,
      bicepsCm: data.biceps_cm ?? undefined,
      thighsCm: data.thighs_cm ?? undefined,
      calvesCm: data.calves_cm ?? undefined,
      neckCm: data.neck_cm ?? undefined,
      bodyFatPct: data.body_fat_pct ?? undefined,
      muscleMassKg: data.muscle_mass_kg ?? undefined,
      notes: data.notes ?? undefined,
    };
    setClientDetails((current) =>
      current
        ? {
            ...current,
            bodyMeasurements: [
              saved,
              ...(current.bodyMeasurements ?? []).filter((item) => item.date !== saved.date),
            ],
          }
        : current,
    );
    setMeasurementDraft(saved);
    setEditingMeasurements(false);
    setMeasurementNotice("המדידות החודשיות נשמרו בהצלחה.");
  };

  useEffect(() => {
    const day = clientDetails?.nutritionDays?.find((item) => item.date === menuDate);
    setPlannedMeals(
      day?.plannedMeals?.length
        ? day.plannedMeals
        : [
            { id: uid(), name: "ארוחת בוקר", foods: [] },
            { id: uid(), name: "ארוחת צהריים", foods: [] },
            { id: uid(), name: "ארוחת ערב", foods: [] },
          ],
    );
    setMenuFoodMealId(null);
    setMenuFoodId("");
    setMenuFoodQuery("");
    setMenuNotice("");
  }, [clientDetails, menuDate]);

  useEffect(() => {
    if (!clientDetails) return;
    const requestedProgram = initialProgramId
      ? clientDetails.programs.find((program) => program.id === initialProgramId)
      : undefined;
    const latestProgram = requestedProgram ?? clientDetails.programs.at(-1);
    if (latestProgram) {
      setEditingProgramId(latestProgram.id);
      const requestedDay = initialDayId
        ? clientDetails.workouts.find(
            (workout) => workout.id === initialDayId,
          )
        : undefined;
      const firstWorkoutDay = requestedDay ?? clientDetails.workouts.find((workout) =>
        latestProgram.dayIds.includes(workout.id),
      );
      setEditingDayId(firstWorkoutDay?.id ?? null);
      const requestedItem = initialExerciseId
        ? firstWorkoutDay?.items.find((item) => item.exerciseId === initialExerciseId)
        : undefined;
      setEditingItemId(requestedItem?.id ?? null);
      if (requestedItem) {
        setSelectedExId(requestedItem.exerciseId);
        setTargetWeight(requestedItem.targetWeight || requestedItem.weight);
        setSetsCount(requestedItem.sets);
        setRepMin(requestedItem.repMin || requestedItem.reps);
        setRepMax(requestedItem.repMax || requestedItem.reps);
        setTechniqueNotes(requestedItem.techniqueNotes || requestedItem.notes);
      }
    } else {
      setEditingProgramId(null);
      setEditingDayId(null);
      setEditingItemId(null);
    }
    const latestNutritionDay = [...clientDetails.nutritionDays].sort((a, b) =>
      b.date.localeCompare(a.date),
    )[0];
    if (initialNutritionDate) {
      setMenuDate(initialNutritionDate);
    } else if (latestNutritionDay) {
      setMenuDate(latestNutritionDay.date);
    }
    setFocusedExerciseId(initialExerciseId ?? null);
    setFocusedNutritionFoodId(initialNutritionFoodId ?? null);
    setFocusedNutritionMealId(initialNutritionMealId ?? null);
  }, [
    clientDetails,
    initialDayId,
    initialExerciseId,
    initialNutritionDate,
    initialNutritionFoodId,
    initialNutritionMealId,
    initialProgramId,
  ]);

  useEffect(() => {
    if (!focusedExerciseId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`coach-exercise-${focusedExerciseId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedExerciseId, editingDayId]);

  useEffect(() => {
    if (!focusedNutritionFoodId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`coach-menu-food-${focusedNutritionFoodId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedNutritionFoodId, menuDate, plannedMeals]);

  // OWNER RPC: change a target user's role. The database function remains the
  // only authority for role changes; this UI never writes profiles.role.
  const handleOwnerChangeRole = async (
    targetUserId: string,
    newRole: "coach" | "client",
  ): Promise<void> => {
    setRoleChangeUserId(targetUserId);
    setRoleChangeNotice("");
    setManagementError("");
    try {
      const { data, error } = await supabase.rpc("change_user_role", {
        target_user_id: targetUserId,
        new_role: newRole,
      });

      if (error) throw error;
      if (data !== true) throw new Error("ה־RPC לא אישר את שינוי התפקיד");

      const refreshed = await loadAllProfilesForOwner();
      if (!refreshed) return;
      setRoleChangeNotice(`תפקיד המשתמש עודכן בהצלחה ל-${newRole === "coach" ? "מאמן" : "מתאמן"}`);
    } catch (err: unknown) {
      setManagementError(`שינוי התפקיד נכשל: ${errorMessage(err, "שגיאה בשינוי תפקיד")}`);
    } finally {
      setRoleChangeUserId(null);
    }
  };

  const handleApproveClient = async (profile: ProfileRow) => {
    const assignedCoachId = approvalCoachByUser[profile.id] || "";
    if (!assignedCoachId) {
      setApprovalNotice("יש לבחור מאמן לפני אישור המתאמן.");
      return;
    }
    const fullName = profile.full_name?.trim() || "";
    if (fullName.split(/\s+/).filter(Boolean).length < 2) {
      setApprovalNotice("יש להשלים שם פרטי ושם משפחה לפני האישור.");
      return;
    }

    setApprovalUserId(profile.id);
    setApprovalNotice("");
    try {
      const { data, error } = await supabase.rpc("approve_client_registration", {
        target_client_id: profile.id,
        approved_full_name: fullName,
        assigned_coach_id: assignedCoachId,
      });
      if (error) throw error;
      if (data !== true) throw new Error("האישור לא התקבל במסד הנתונים");
      await Promise.all([loadAllProfilesForOwner(), loadCoachClients()]);
      setApprovalNotice(`ההרשמה של ${fullName} אושרה והמתאמן שויך למאמן.`);
    } catch (err: unknown) {
      setApprovalNotice(`אישור ההרשמה נכשל: ${errorMessage(err, "שגיאה באישור")}`);
    } finally {
      setApprovalUserId(null);
    }
  };

  // Send Coach Message to Client
  const handleSendCoachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !coachMsgText.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("coach_messages").insert({
        coach_id: user.id,
        client_id: selectedClientId,
        message: coachMsgText.trim(),
      });

      if (!error) {
        setMsgSentNotice("הודעת החיזוק נשלחה בהצלחה למתאמן!");
        setCoachMsgText("");
        setTimeout(() => setMsgSentNotice(""), 3000);
      }
    } catch {
      /* ignore */
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = broadcastText.trim();
    if (!message) return;
    setBroadcastNotice("");
    setBroadcastError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("יש להתחבר מחדש כדי לשלוח הודעה.");
      const { error } = await supabase.from("broadcast_announcements").insert({
        sender_id: user.id,
        audience: broadcastAudience,
        message,
      });
      if (error) throw error;
      setBroadcastText("");
      setBroadcastNotice("ההודעה נשלחה בהצלחה.");
    } catch (err: unknown) {
      setBroadcastError(
        `שליחת ההודעה נכשלה: ${errorMessage(err, "יש לוודא שמיגרציית ההודעות הוחלה ב־Supabase.")}`,
      );
    }
  };

  // Add Client by Email via RPC lookup
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("מנוי לא מחובר");

      const { data: lookupRes, error: lookupErr } = await supabase.rpc(
        "lookup_client_id_by_email",
        { lookup_email: inviteEmail.trim() },
      );

      if (lookupErr || !lookupRes || lookupRes.length === 0) {
        throw new Error("משתמש לא נמצא. יש לוודא שהמתאמן נרשם ל־MY routine בכתובת זו.");
      }

      const foundClientId = lookupRes[0].client_id;

      const { error: linkErr } = await supabase.from("coach_clients").insert({
        coach_id: user.id,
        client_id: foundClientId,
      });

      if (linkErr) throw linkErr;

      setInviteMsg("המתאמן שויך בהצלחה לחשבון המאמן שלך!");
      setInviteEmail("");
      setShowAddModal(false);
      loadCoachClients();
    } catch (err: unknown) {
      setInviteMsg(errorMessage(err, "אירעה שגיאה בשיוך המתאמן"));
    }
  };

  // Create Program for Client
  const handleCreateClientProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoach || !selectedClientId || !newProgramName.trim()) return;
    setManagementError("");

    const programId = uid();
    if (isSelfSelected) {
      const program: Program = {
        id: programId,
        name: newProgramName.trim(),
        notes: "תוכנית אישית שנבנתה במרחב הניהול",
        dayIds: [],
      };
      saveProgram(program);
      setNewProgramName("");
      return;
    }

    const { error } = await supabase.from("programs").insert({
      id: programId,
      user_id: selectedClientId,
      name: newProgramName.trim(),
      description: "תוכנית נבנתה על ידי המאמן",
    });

    if (error) {
      setManagementError(`שמירת התוכנית נכשלה: ${error.message}`);
      return;
    }
    setNewProgramName("");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  const handleRenameClientProgram = async (program: Program, name: string) => {
    const nextName = name.trim();
    if (!nextName || nextName === program.name || !selectedClientId) return;
    setManagementError("");
    if (isSelfSelected) {
      saveProgram({ ...program, name: nextName });
      return;
    }
    const { error } = await supabase
      .from("programs")
      .update({ name: nextName, updated_at: new Date().toISOString() })
      .eq("id", program.id)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון שם התוכנית נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Add Program Day for Client
  const handleAddProgramDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoach || !selectedClientId || !editingProgramId || !newDayName.trim()) return;
    setManagementError("");

    const dayId = uid();
    if (isSelfSelected) {
      const day: Workout = { id: dayId, name: newDayName.trim(), notes: "", items: [] };
      saveWorkoutInProgram(editingProgramId, day);
      setNewDayName("");
      setEditingDayId(dayId);
      return;
    }

    const { error } = await supabase.from("program_days").insert({
      id: dayId,
      program_id: editingProgramId,
      user_id: selectedClientId,
      name: newDayName.trim(),
      items: [],
      sort_order: (clientDetails?.workouts?.length || 0) + 1,
    });

    if (error) {
      setManagementError(`שמירת יום האימון נכשלה: ${error.message}`);
      return;
    }
    setNewDayName("");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  const handleRenameWorkoutDay = async (day: Workout, name: string) => {
    const nextName = name.trim();
    if (!nextName || nextName === day.name || !selectedClientId) return;
    setManagementError("");
    if (isSelfSelected) {
      saveWorkout({ ...day, name: nextName });
      return;
    }
    const { error } = await supabase
      .from("program_days")
      .update({ name: nextName, updated_at: new Date().toISOString() })
      .eq("id", day.id)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון שם יום האימון נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Assign Prescribed Exercise to Program Day
  const handleAddExerciseToDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoach || !selectedClientId || !editingDayId || !selectedExId) return;
    setManagementError("");

    const currentDay = clientDetails?.workouts?.find((w) => w.id === editingDayId);
    if (!currentDay) return;

    if (editingItemId) {
      const updatedItems = currentDay.items.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              exerciseId: selectedExId,
              sets: Math.max(1, setsCount),
              reps: Math.max(1, repMin),
              repMin: Math.max(1, repMin),
              repMax: Math.max(repMin, repMax),
              targetWeight,
              weight: targetWeight,
              notes: techNotes.trim(),
            }
          : item,
      );

      if (isSelfSelected) {
        saveWorkout({ ...currentDay, items: updatedItems });
      } else {
        const { error } = await supabase
          .from("program_days")
          .update({ items: updatedItems, updated_at: new Date().toISOString() })
          .eq("id", editingDayId)
          .eq("user_id", selectedClientId);
        if (error) {
          setManagementError(`עדכון התרגיל נכשל: ${error.message}`);
          return;
        }
        pullClientDataForCoach(selectedClientId).then(applyClientDetails);
      }
      setEditingItemId(null);
      setSelectedExId("");
      setTechniqueNotes("");
      return;
    }

    const configuredModes = Array.from(
      { length: setsCount },
      (_, index) => setModes[index] ?? "normal",
    );
    const warmupModeCount = configuredModes.filter((mode) => mode === "warmup").length;
    const workingModeCount = configuredModes.length - warmupModeCount;
    const hasDropSets = configuredModes.includes("drop");
    const hasSupersetSets = configuredModes.includes("superset");
    if (hasSupersetSets && !supersetPartnerId) return;
    const legacyReduction = dropReductionValue === "" ? NaN : Number(dropReductionValue);
    const legacyLevelWeight =
      Number.isFinite(legacyReduction) && legacyReduction > 0 && dropReductionMode
        ? dropReductionMode === "percent"
          ? targetWeight * (1 - legacyReduction / 100)
          : targetWeight - legacyReduction
        : NaN;
    const parsedDropLevel1Weight =
      dropLevel1Weight === "" ? legacyLevelWeight : Number(dropLevel1Weight);
    const parsedDropLevel2Weight =
      dropLevel2Weight === "" ? legacyLevelWeight : Number(dropLevel2Weight);
    if (
      hasDropSets &&
      (!Number.isFinite(parsedDropLevel1Weight) ||
        parsedDropLevel1Weight <= 0 ||
        !Number.isFinite(parsedDropLevel2Weight) ||
        parsedDropLevel2Weight <= 0)
    ) {
      setExerciseBuilderNotice("בדרופ־סט יש להזין משקל תקין (גדול מ-0) לשני השלבים.");
      return;
    }
    setExerciseBuilderNotice("");

    const newWorkoutItem: WorkoutItem = {
      id: uid(),
      exerciseId: selectedExId,
      sets: workingModeCount,
      reps: repMin,
      repType: "range",
      repMin,
      repMax,
      targetWeight,
      weight: targetWeight,
      rest: restSec,
      notes: "",
      ...(techNotes.trim() ? { techniqueNotes: techNotes.trim() } : {}),
      ...(approvedAltIds.length > 0 ? { approvedAlternatives: approvedAltIds } : {}),
      ...(bodyweightAlternativeId ? { bodyweightAlternativeId } : {}),
      ...(hasSupersetSets && supersetGroup.trim()
        ? {
            supersetId: supersetGroup.trim(),
            supersetPartnerId,
            supersetOrder: 1 as const,
            supersetRepsMin,
            supersetRepsMax,
          }
        : {}),
      ...(hasDropSets
        ? {
            dropSetConfig: {
              enabled: true,
              drops: configuredModes.filter((mode) => mode === "drop").length,
              levels: [
                {
                  weight: parsedDropLevel1Weight,
                  repsMin: dropLevel1Weight === "" ? dropRepsMin : dropLevel1RepsMin,
                  repsMax: dropLevel1Weight === "" ? dropRepsMax : dropLevel1RepsMax,
                },
                {
                  weight: parsedDropLevel2Weight,
                  repsMin: dropLevel2Weight === "" ? dropRepsMin : dropLevel2RepsMin,
                  repsMax: dropLevel2Weight === "" ? dropRepsMax : dropLevel2RepsMax,
                },
              ],
            },
          }
        : {}),
      workingSets: (() => {
        let dropOccurrence = 0;
        return configuredModes
          .filter((mode) => mode !== "warmup")
          .map((mode, i) => {
            let weight = targetWeight;
            let reps = repMin;
            let repMaxForSet = repMax;
            if (mode === "drop") {
              dropOccurrence += 1;
              const level =
                dropOccurrence === 1
                  ? {
                      weight: parsedDropLevel1Weight,
                      repsMin: dropLevel1Weight === "" ? dropRepsMin : dropLevel1RepsMin,
                      repsMax: dropLevel1Weight === "" ? dropRepsMax : dropLevel1RepsMax,
                    }
                  : {
                      weight: parsedDropLevel2Weight,
                      repsMin: dropLevel2Weight === "" ? dropRepsMin : dropLevel2RepsMin,
                      repsMax: dropLevel2Weight === "" ? dropRepsMax : dropLevel2RepsMax,
                    };
              weight = Math.max(0, level.weight);
              reps = level.repsMin;
              repMaxForSet = level.repsMax;
            }
            return {
              id: uid(),
              setNumber: i + 1,
              weight,
              reps,
              repMax: repMaxForSet,
              ...(mode === "drop" ? { dropSet: true } : {}),
            };
          });
      })(),
      ...(warmupModeCount > 0
        ? {
            warmups: Array.from({ length: warmupModeCount }, (_, i) => ({
              id: uid(),
              weight: warmupWeight,
              reps: warmupReps,
              repsMax: warmupRepsMax,
            })),
          }
        : {}),
    };

    const partnerItem =
      hasSupersetSets && supersetGroup.trim() && supersetPartnerId
        ? {
            ...newWorkoutItem,
            id: uid(),
            exerciseId: supersetPartnerId,
            supersetPartnerId: selectedExId,
            supersetOrder: 2 as const,
          }
        : null;
    const updatedItems = partnerItem
      ? [...currentDay.items, newWorkoutItem, partnerItem]
      : [...currentDay.items, newWorkoutItem];

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      setSelectedExId("");
      setTechniqueNotes("");
      setSupersetGroup("");
      setSupersetPartnerId("");
      setDropSetEnabled(false);
      setDropLevel1Weight("");
      setDropLevel2Weight("");
      setSetModes(["normal", "normal", "normal"]);
      setApprovedAltIds([]);
      setBodyweightAlternativeId("");
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", editingDayId);

    if (error) {
      setManagementError(`שמירת התרגיל נכשלה: ${error.message}`);
      return;
    }
    setSelectedExId("");
    setEditingItemId(null);
    setTechniqueNotes("");
    setSupersetGroup("");
    setSupersetPartnerId("");
    setDropSetEnabled(false);
    setDropLevel1Weight("");
    setDropLevel2Weight("");
    setSetModes(["normal", "normal", "normal"]);
    setApprovedAltIds([]);
    setBodyweightAlternativeId("");
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Delete exercise from day
  const handleRemoveExerciseFromDay = async (dayId: string, itemId: string) => {
    if (!isCoach) return;
    setManagementError("");
    const currentDay = clientDetails?.workouts?.find((w) => w.id === dayId);
    if (!currentDay) return;

    const updatedItems = currentDay.items.filter((item) => item.id !== itemId);

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", dayId);

    if (error) {
      setManagementError(`מחיקת התרגיל נכשלה: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId!).then(applyClientDetails);
  };

  const handleUpdateExerciseItem = async (
    dayId: string,
    itemId: string,
    patch: Partial<WorkoutItem>,
  ) => {
    if (!isCoach || !selectedClientId) return;
    const currentDay = clientDetails?.workouts?.find((workout) => workout.id === dayId);
    if (!currentDay) return;
    const updatedItems = currentDay.items.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    );

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", dayId)
      .eq("user_id", selectedClientId);
    if (error) {
      setManagementError(`עדכון התרגיל נכשל: ${error.message}`);
      return;
    }
    pullClientDataForCoach(selectedClientId).then(applyClientDetails);
  };

  // Save Nutrition Targets for Client
  const handleSaveNutritionTargets = async () => {
    if (!isCoach || !selectedClientId) return;
    setManagementError("");
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("nutrition_days").upsert({
      id: `${selectedClientId}_${today}`,
      user_id: selectedClientId,
      date: today,
      target_calories: calTarget,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setManagementError(`שמירת יעד התזונה נכשלה: ${error.message}`);
      return;
    }
    setEditingNutrition(false);
    const refreshed = await pullClientDataForCoach(selectedClientId);
    applyClientDetails(refreshed);
  };

  const addPlannedMeal = () => {
    if (!isCoach) return;
    setPlannedMeals((current) => [
      ...current,
      { id: uid(), name: `ארוחה ${current.length + 1}`, foods: [] },
    ]);
  };

  const addPlannedFood = (mealId: string) => {
    if (!isCoach) return;
    const food = store.foods.find((item) => item.id === menuFoodId);
    if (!food || menuFoodQuantity <= 0) return;
    const scrollContainer = document.scrollingElement;
    const scrollTop = scrollContainer?.scrollTop ?? window.scrollY;
    const mealElement = document.getElementById(`coach-menu-meal-${mealId}`);
    const mealTop = mealElement?.getBoundingClientRect().top ?? null;
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The search field is removed immediately after adding. Blurring it first
    // prevents mobile browsers from scrolling the disappearing focused field
    // back into view.
    activeElement?.blur();
    const plannedFood: MealFood = mealFoodFromPortion(food, menuFoodQuantity, menuFoodUnit);
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, plannedFood] } : meal,
      ),
    );
    setMenuFoodMealId(null);
    setMenuFoodId("");
    setMenuFoodQuery("");
    setMenuFoodQuantity(1);
    setMenuFoodUnit("serving");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollTop;
        }
        window.scrollTo({ top: scrollTop, behavior: "auto" });
        const updatedMealElement = document.getElementById(`coach-menu-meal-${mealId}`);
        if (mealTop !== null && updatedMealElement) {
          const topDelta = updatedMealElement.getBoundingClientRect().top - mealTop;
          if (Math.abs(topDelta) > 1) {
            window.scrollBy({ top: topDelta, behavior: "auto" });
          }
        }
      });
    });
  };

  const removePlannedFood = (mealId: string, foodId: string) => {
    if (!isCoach) return;
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
          : meal,
      ),
    );
  };

  const savePlannedMenu = async () => {
    if (!isCoach || !selectedClientId || plannedMeals.length === 0) return;
    if (isSelfSelected) {
      savePlannedMeals(menuDate, plannedMeals);
      setMenuNotice("התפריט האישי נשמר ויופיע גם באזור התזונה שלך.");
      return;
    }

    const existingDay = clientDetails?.nutritionDays?.find((item) => item.date === menuDate);
    const { error } = await supabase.from("nutrition_days").upsert({
      id: `${selectedClientId}_${menuDate}`,
      user_id: selectedClientId,
      date: menuDate,
      meals: existingDay?.meals ?? [],
      planned_meals: plannedMeals,
      ...(existingDay || calTarget <= 0 ? {} : { target_calories: calTarget }),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setMenuNotice(`שמירת התפריט נכשלה: ${error.message}`);
      return;
    }
    setMenuNotice("התפריט נשמר ויופיע למתאמן במסך התזונה האישי.");
    const refreshed = await pullClientDataForCoach(selectedClientId);
    applyClientDetails(refreshed);
  };

  if (role === undefined) {
    return (
      <AppShell title="דשבורד מאמן" kicker="מאמנים וצוות מקצועי">
        <div className="surface-card mt-4 space-y-3 rounded-3xl p-6 text-center">
          <h2 className="font-display text-xl font-bold text-ink">מאמתת הרשאות גישה...</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            המסך ייפתח רק לאחר טעינת תפקיד החשבון המאומת.
          </p>
        </div>
      </AppShell>
    );
  }

  if (!isCoach) return <Navigate to="/" replace />;

  const selfDisplayName = store.userProfile?.fullName?.trim() || "אני";
  const filteredClients = clients.filter((c) => {
    const emailStr = (c.profiles?.email || "").toLowerCase();
    const nameStr = profileDisplayName(c.profiles).toLowerCase();
    const q = clientSearch.toLowerCase();
    return Boolean(q) && (emailStr.includes(q) || nameStr.includes(q));
  });
  const clientSearchQuery = clientSearch.trim().toLocaleLowerCase();
  const selfMatchesSearch =
    Boolean(clientSearchQuery) &&
    selfDisplayName.toLocaleLowerCase().includes(clientSearchQuery);
  const selectedClientInfo = clients.find((c) => c.client_id === selectedClientId);
  const latestProgram = clientDetails?.programs?.[clientDetails.programs.length - 1];
  const latestNutritionDay = [...(clientDetails?.nutritionDays ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const clientNutritionNotes = (clientDetails?.nutritionDays ?? []).flatMap((day) =>
    day.meals.flatMap((meal) =>
      meal.foods
        .filter((food) => food.notes?.trim())
        .map((food) => ({ date: day.date, meal: meal.name, note: food.notes!.trim() })),
    ),
  );
  const trackingSessions =
    clientDetails?.history.filter((session) => session.date.slice(0, 10) === trackingDate) ?? [];
  const visibleTrackingSessions = selectedTrackingWorkoutId
    ? trackingSessions.filter((session) => session.workoutId === selectedTrackingWorkoutId)
    : [];
  const selectedTrackingWorkout = clientDetails?.workouts.find(
    (workout) => workout.id === selectedTrackingWorkoutId,
  );
  const trackingPlanRows =
    selectedTrackingWorkout?.items.map((item) => {
      const actualEntry = visibleTrackingSessions
        .flatMap((session) => session.entries)
        .find((entry) => entry.exerciseId === item.exerciseId);
      return {
        item,
        actualEntry,
        exercise: store.exercises.find((exercise) => exercise.id === item.exerciseId),
      };
    }) ?? [];
  const trackingNutritionDay = clientDetails?.nutritionDays.find(
    (day) => day.date === trackingDate,
  );
  const openTrackedPlan = (workoutId: string, exerciseId?: string) => {
    if (!selectedClientId || !clientDetails) return;
    const program = clientDetails.programs.find((item) => item.dayIds.includes(workoutId));
    setActiveWorkspaceTab("programs");
    setOpenEditor("programs");
    navigate({
      to: "/coach/clients/$clientId/program",
      params: { clientId: selectedClientId },
      search: {
        dayId: workoutId,
        ...(program ? { programId: program.id } : {}),
        ...(exerciseId ? { exerciseId } : {}),
      },
    });
  };
  const openTrackedNutrition = (date: string, mealId: string, foodId?: string) => {
    if (!selectedClientId) return;
    navigate({
      to: "/coach/clients/$clientId/nutrition",
      params: { clientId: selectedClientId },
      search: {
        date,
        ...(mealId ? { mealId } : {}),
        ...(foodId ? { foodId } : {}),
      },
    });
  };
  const shiftTrackingDate = (amount: number) => {
    const date = new Date(`${trackingDate}T00:00:00`);
    date.setDate(date.getDate() + amount);
    setTrackingDate(date.toISOString().slice(0, 10));
  };
  const exerciseQueryLower = exerciseQuery.trim().toLocaleLowerCase();
  const exerciseMuscleOptions = [
    "הכל",
    ...Array.from(
      new Set(
        store.exercises.flatMap((exercise) => [
          exercise.muscleGroup,
          ...(exercise.muscleGroups ?? []),
        ]),
      ),
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "he")),
  ];
  const filteredExerciseOptions = exerciseQueryLower
    ? store.exercises.filter((exercise) =>
        [exercise.name, exercise.muscleGroup, exercise.equipment]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase().includes(exerciseQueryLower)),
      )
    : store.exercises;
  const visibleExerciseOptions =
    exerciseMuscleFilter === "הכל"
      ? filteredExerciseOptions
      : filteredExerciseOptions.filter(
          (exercise) =>
            exercise.muscleGroup === exerciseMuscleFilter ||
            (exercise.muscleGroups ?? []).includes(exerciseMuscleFilter),
        );

  const openCreateExercise = () => {
    if (!isCoach) return;
    setNewExerciseDraft(emptyExercise());
    setNewExerciseError("");
    setShowExercisePicker(false);
    setShowCreateExercise(true);
  };

  const handleCreateExercise = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCoach) return;
    const name = newExerciseDraft.name.trim();
    if (!name) {
      setNewExerciseError("יש להזין שם תרגיל.");
      return;
    }
    const exercise = {
      ...newExerciseDraft,
      name,
      description: newExerciseDraft.description.trim(),
      instructions: newExerciseDraft.instructions?.trim() ?? "",
      notes: newExerciseDraft.notes.trim(),
    };
    saveExercise(exercise);
    setSelectedExId(exercise.id);
    setExerciseQuery("");
    setShowCreateExercise(false);
    setExerciseBuilderNotice(`התרגיל "${exercise.name}" נוסף למאגר ונבחר לאימון.`);
  };
  const programQueryLower = programQuery.trim().toLocaleLowerCase();
  const filteredPrograms = programQueryLower
    ? (clientDetails?.programs ?? []).filter((program) =>
        program.name.toLocaleLowerCase().includes(programQueryLower),
      )
    : (clientDetails?.programs ?? []);
  const ownerUserSearchLower = ownerUserSearch.trim().toLocaleLowerCase();
  const filteredOwnerProfiles = ownerUserSearchLower
    ? allProfiles.filter((profile) =>
        [profile.full_name, profile.email]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(ownerUserSearchLower)),
      )
    : allProfiles;
  const menuFoodResults = searchFoods(store.foods, menuFoodQuery).slice(0, 24);
  const selectedMenuFood = store.foods.find((food) => food.id === menuFoodId);
  const menuTotals = foodTotals(plannedMeals.flatMap((meal) => meal.foods));
  const needsPlan = overviewRows.filter((row) => row.details.programs.length === 0);
  const needsExercises = overviewRows.filter(
    (row) =>
      row.details.programs.length > 0 &&
      row.details.workouts.every((workout) => workout.items.length === 0),
  );
  const quietClients = overviewRows.filter(
    (row) =>
      !row.details.history.some(
        (session) => Date.now() - new Date(session.date).getTime() <= 14 * 24 * 60 * 60 * 1000,
      ),
  );
  const coachCount = allProfiles.filter((profile) => profile.role === "coach").length;
  const clientCount = allProfiles.filter((profile) => profile.role === "client").length;
  const ownerCount = allProfiles.filter((profile) => profile.role === "owner").length;
  const today = todayKey();
  const newTodayProfiles = allProfiles.filter(
    (profile) => profile.created_at?.slice(0, 10) === today,
  );
  const pendingApprovals = allProfiles.filter(
    (profile) => profile.role === "client" && profile.approval_status === "pending",
  );
  const openClientFromOverview = (clientId: string) => {
    navigate({
      to: trackingLanding ? "/coach/tracking/$clientId" : "/coach/clients/$clientId",
      params: { clientId },
    });
  };

  return (
    <AppShell
      title={clientsOnly ? (trackingLanding ? "מעקב" : "עריכה") : ""}
      kicker={clientsOnly ? (trackingLanding ? "ביצועי מתאמנים בפועל" : "בניית תוכניות ותפריטים") : ""}
      compactHeader
    >
      {!clientsOnly ? (
        <section className="space-y-2 text-start">
          <section className="surface-card border-rose-200 bg-rose-50/60 p-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">
                  חשוב לבדוק
                </p>
                <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-rose-950">
                  <MessageSquare className="h-4 w-4 text-rose-700" />
                  הערות ותלונות של מתאמנים
                </h2>
              </div>
              {clientFeedback.length > 0 ? (
                <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                  {clientFeedback.length}
                </span>
              ) : null}
            </div>
            {clientFeedback.length === 0 ? (
              <p className="mt-2 rounded-xl bg-white/80 p-2.5 text-xs font-semibold text-rose-900/70">
                אין כרגע הערות או תלונות חדשות ממתאמנים.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {clientFeedback.slice(0, 5).map((feedback) => {
                  const client = clients.find((item) => item.client_id === feedback.client_id);
                  const profile =
                    client?.profiles ?? allProfiles.find((item) => item.id === feedback.client_id);
                  const note = feedback.discomfort_notes?.trim() || feedback.coach_notes?.trim();
                  return (
                    <div
                      key={feedback.id}
                      className="rounded-xl border border-rose-100 bg-white/85 p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-bold text-rose-950">
                          {profileDisplayName(profile)}
                        </span>
                        <span className="shrink-0 text-[10px] text-rose-700">
                          {feedback.discomfort_notes?.trim() ? "תלונה / אי־נוחות" : "הערה"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-rose-950/75">
                        {note || `דירוג קושי: ${feedback.difficulty_rating || "לא צוין"}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-4">
            <div className="surface-card flex items-center justify-between gap-1 border-primary/25 bg-primary/5 px-2 py-1.5 text-start">
              <p className="truncate text-[10px] font-bold text-muted-foreground">מתאמנים</p>
              <p className="font-display text-base font-extrabold leading-none text-ink">
                {clients.length}
              </p>
            </div>
            <div className="surface-card flex items-center justify-between gap-1 border-accent/60 bg-accent/20 px-2 py-1.5 text-start">
              <p className="truncate text-[10px] font-bold text-muted-foreground">דורשים תכנית</p>
              <p className="font-display text-base font-extrabold leading-none text-ink">
                {needsPlan.length}
              </p>
            </div>
            <div className="surface-card flex items-center justify-between gap-1 border-border bg-surface-2 px-2 py-1.5 text-start">
              <p className="truncate text-[10px] font-bold text-muted-foreground">שקטים 14 יום</p>
              <p className="font-display text-base font-extrabold leading-none text-ink">
                {quietClients.length}
              </p>
            </div>
            {isOwner ? (
              <div className="surface-card flex items-center justify-between gap-1 border-purple-200 bg-purple-50/70 px-2 py-1.5 text-start">
                <p className="truncate text-[10px] font-bold text-purple-700">משתמשים</p>
                <p className="font-display text-base font-extrabold leading-none text-purple-950">
                  {allProfiles.length}
                </p>
              </div>
            ) : null}
          </div>

          <section className="surface-card space-y-2.5 border-primary/20 bg-primary/5 p-4 text-start">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <h2 className="text-sm font-extrabold text-primary">הודעה לכל הקבוצה</h2>
                <p className="text-[11px] text-muted-foreground">
                  {isOwner ? "שליחה לכל המאמנים, לכל המתאמנים או לכולם" : "שליחה לכל המתאמנים שלך"}
                </p>
              </div>
            </div>
            {broadcastNotice ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs font-bold text-emerald-800">
                {broadcastNotice}
              </p>
            ) : null}
            {broadcastError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-800">
                {broadcastError}
              </p>
            ) : null}
            <form onSubmit={handleSendBroadcast} className="space-y-2">
              {isOwner ? (
                <select
                  value={broadcastAudience}
                  onChange={(e) =>
                    setBroadcastAudience(e.target.value as "coaches" | "clients" | "everyone")
                  }
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="coaches">כל המאמנים</option>
                  <option value="clients">כל המתאמנים</option>
                  <option value="everyone">כולם</option>
                </select>
              ) : null}
              <div className="flex gap-2">
                <textarea
                  required
                  rows={2}
                  maxLength={2000}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="כתבי הודעה שתופיע במסכי הבית..."
                  className="min-h-12 flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="self-end rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
                >
                  שלח
                </button>
              </div>
            </form>
          </section>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="surface-card border-primary/20 bg-primary/5 px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
                    פעילות חדשה
                  </p>
                  <h3 className="text-xs font-bold text-ink">נרשמו היום</h3>
                </div>
                <span className="font-display text-lg font-extrabold leading-none text-primary">
                  {newTodayProfiles.length}
                </span>
              </div>
              {newTodayProfiles.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {newTodayProfiles.slice(0, 3).map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between text-[11px]">
                      <span className="truncate font-semibold text-ink">
                        {profileDisplayName(profile)}
                      </span>
                      <span className="text-muted-foreground">
                        {profile.role === "coach" ? "מאמן" : "מתאמן"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[10px] text-muted-foreground">אין הרשמות חדשות היום.</p>
              )}
            </div>
            <div className="surface-card border-amber-200 bg-amber-50/70 px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
                    דורש טיפול
                  </p>
                  <h3 className="text-xs font-bold text-ink">אישורי הרשמה</h3>
                </div>
                <span className="font-display text-lg font-extrabold leading-none text-amber-800">
                  {isOwner ? pendingApprovals.length : 0}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-amber-900/75">
                {isOwner
                  ? pendingApprovals.length > 0
                    ? "יש מתאמנים שממתינים לאישור שם ושיוך למאמן."
                    : "אין כרגע הרשמות שממתינות לאישור."
                  : "בעיות, חוסרים ומתאמנים שדורשים תשומת לב מופיעים כאן."}
              </p>
            </div>
          </div>

          {overviewRows.length === 0 ? (
            <div className="surface-card p-4 text-sm text-muted-foreground">
              {clients.length === 0
                ? "עדיין אין מתאמנים משויכים. עברי ללשונית מתאמנים כדי להוסיף מתאמן."
                : "טוענת את סיכום המתאמנים..."}
            </div>
          ) : (
            <div className="surface-card space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Activity className="h-4 w-4 text-primary" />
                פעולות שמומלץ לבדוק
              </h3>
              {needsPlan.length === 0 &&
              needsExercises.length === 0 &&
              quietClients.length === 0 ? (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  אין כרגע חריגים שדורשים טיפול.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...needsPlan, ...needsExercises, ...quietClients]
                    .filter(
                      (row, index, rows) =>
                        rows.findIndex(
                          (candidate) => candidate.client.client_id === row.client.client_id,
                        ) === index,
                    )
                    .slice(0, 8)
                    .map((row) => {
                      const name = profileDisplayName(row.client.profiles);
                      const reason = needsPlan.some(
                        (item) => item.client.client_id === row.client.client_id,
                      )
                        ? "אין עדיין תוכנית אימון"
                        : needsExercises.some(
                              (item) => item.client.client_id === row.client.client_id,
                            )
                          ? "התוכנית עדיין ללא תרגילים"
                          : "לא נרשם אימון ב־14 הימים האחרונים";
                      return (
                        <button
                          key={row.client.client_id}
                          type="button"
                          onClick={() => openClientFromOverview(row.client.client_id)}
                          className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface-2 p-3 text-start transition-colors hover:border-primary/60"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-ink">
                              {name}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {reason}
                            </span>
                          </span>
                          <ChevronLeft className="h-4 w-4 shrink-0 text-primary" />
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {isOwner ? (
            <section className="surface-card space-y-3 border-purple-200 bg-purple-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                    מצב האפליקציה
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 text-sm font-bold text-purple-950">
                    <Crown className="h-4 w-4 text-purple-700" />
                    תמונת מצב של החשבונות והצוות
                  </h3>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-800">
                  {allProfiles.length} חשבונות
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">מאמנים</span>
                  <strong className="mt-1 block text-base text-purple-950">{coachCount}</strong>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">מתאמנים</span>
                  <strong className="mt-1 block text-base text-purple-950">{clientCount}</strong>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2.5">
                  <span className="block text-[10px] text-muted-foreground">בעלים</span>
                  <strong className="mt-1 block text-base text-purple-950">{ownerCount}</strong>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      <div className="space-y-5 text-start">
        {managementError ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive"
          >
            טעינת נתוני הניהול נכשלה: {managementError}
          </div>
        ) : null}
        {/* Owner Management Section */}
        {isOwner && !clientsOnly && (
          <div className="surface-card p-5 rounded-3xl space-y-3 bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-sm text-purple-950">ניהול משתמשים והרשאות בעלים</h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                {allProfiles.length} משתמשים במערכת
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {pendingApprovals.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-amber-950">אישור מתאמנים חדשים</p>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {pendingApprovals.length} ממתינים
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-900/75">
                    בדקי את השם המלא ובחרי מאמן לפני שהחשבון נכנס למערכת.
                  </p>
                  <div className="mt-3 space-y-2">
                    {pendingApprovals.map((profile) => (
                      <div
                        key={profile.id}
                        className="rounded-xl border border-amber-200 bg-white p-2.5"
                      >
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          שם מלא
                          <input
                            value={profile.full_name ?? ""}
                            onChange={(event) =>
                              setAllProfiles((current) =>
                                current.map((item) =>
                                  item.id === profile.id
                                    ? { ...item, full_name: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            className="h-9 rounded-lg border border-border px-2 text-xs font-semibold text-ink outline-none focus:border-primary"
                          />
                        </label>
                        <div className="mt-2 flex gap-2">
                          <select
                            value={approvalCoachByUser[profile.id] ?? ""}
                            onChange={(event) =>
                              setApprovalCoachByUser((current) => ({
                                ...current,
                                [profile.id]: event.target.value,
                              }))
                            }
                            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-xs text-ink outline-none focus:border-primary"
                            aria-label={`בחירת מאמן עבור ${profileDisplayName(profile)}`}
                          >
                            <option value="">בחירת מאמן...</option>
                            {allProfiles
                              .filter(
                                (candidate) =>
                                  candidate.role === "coach" ||
                                  (candidate.id === authUser?.id && candidate.role === "owner"),
                              )
                              .map((coach) => (
                                <option key={coach.id} value={coach.id}>
                                  {coach.id === authUser?.id
                                    ? "אני (בעלים)"
                                    : profileDisplayName(coach)}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            disabled={approvalUserId === profile.id}
                            onClick={() => void handleApproveClient(profile)}
                            className="h-9 shrink-0 rounded-lg bg-amber-700 px-3 text-[11px] font-bold text-white disabled:opacity-50"
                          >
                            {approvalUserId === profile.id ? "מאשר..." : "אישור"}
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {profile.email || "ללא אימייל מוצג"}
                        </p>
                      </div>
                    ))}
                  </div>
                  {approvalNotice ? (
                    <p className="mt-2 rounded-lg bg-white p-2 text-[11px] font-semibold text-amber-950">
                      {approvalNotice}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="text-xs text-purple-900 font-semibold">משתמשים והרשאות תפקיד:</p>
              <div className="num-pill flex h-10 items-center gap-2 px-3">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={ownerUserSearch}
                  onChange={(event) => setOwnerUserSearch(event.target.value)}
                  placeholder="חיפוש לפי שם או אימייל..."
                  className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted-foreground"
                  aria-label="חיפוש משתמשים לפי שם או אימייל"
                />
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {filteredOwnerProfiles.map((p) => {
                  const isCurrentUser = p.id === authUser?.id;
                  const canChangeRole =
                    p.role === "owner" || p.role === "coach" || p.role === "client";
                  const isChanging = roleChangeUserId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs border border-purple-100"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-ink">{profileDisplayName(p)}</span>
                        <span className="text-muted-foreground mr-1">
                          (
                          {p.role === "owner"
                            ? "בעלים"
                            : p.role === "coach"
                              ? "מאמן"
                              : p.role === "client"
                                ? "מתאמן"
                                : "לא ידוע"}
                          )
                        </span>
                      </div>

                      <select
                        aria-label={`שינוי תפקיד עבור ${profileDisplayName(p)}`}
                        value={p.role || ""}
                        disabled={isCurrentUser || !canChangeRole || isChanging}
                        onChange={(event) => {
                          const nextRole = event.target.value;
                          if (nextRole === "coach" || nextRole === "client") {
                            void handleOwnerChangeRole(p.id, nextRole);
                          }
                        }}
                        className="max-w-28 rounded-lg border border-purple-200 bg-white px-2 py-1 text-[11px] font-bold text-purple-900 outline-none focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" disabled>
                          לא ידוע
                        </option>
                        <option value="owner">בעלים</option>
                        <option value="coach">מאמן</option>
                        <option value="client">מתאמן</option>
                      </select>
                    </div>
                  );
                })}
              </div>
              {roleChangeNotice ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-700">
                  {roleChangeNotice}
                </p>
              ) : null}
              {authUser ? (
                <p className="text-[11px] text-purple-800">
                  ניתן לשנות תפקידים של משתמשים אחרים בלבד; שינוי התפקיד עובר דרך RPC מאובטח.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {clientsOnly ? (
          <>
            {trackingLanding ? (
              <section className="surface-card mb-2 border-primary/15 bg-primary/5 px-3 py-2 text-start">
                <p className="text-xs font-bold text-ink">בחרי מתאמן כדי לצפות במעקב היומי.</p>
              </section>
            ) : null}
            {/* Client Search & List */}
            <section
              className={`space-y-3 rounded-3xl border border-border/70 bg-surface p-4 shadow-sm ${
                selectedClientId ? "hidden" : ""
              }`}
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    שלב 1
                  </p>
                  <h3 className="mt-1 flex items-center gap-1.5 font-bold text-sm text-ink">
                    <Users className="h-4 w-4 text-primary" /> בחירת מתאמן
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">תוכניות ותפריטים בלבד</span>
              </div>

              <div className="num-pill flex h-10 items-center gap-2 px-3">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <label htmlFor="coach-client-search" className="sr-only">
                  חיפוש מתאמן
                </label>
                <input
                  id="coach-client-search"
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="חיפוש לפי שם או אימייל..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  aria-label="חיפוש לפי שם או אימייל"
                />
              </div>

              {authUser && selfMatchesSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientId(isSelfSelected ? null : authUser.id);
                    setShowClientWorkspace(!isSelfSelected);
                    setEditingProgramId(null);
                    setEditingDayId(null);
                  }}
                  aria-pressed={isSelfSelected}
                  className={`surface-card flex w-full items-center justify-between rounded-2xl border p-4 text-start transition-all ${
                    isSelfSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-primary/30 bg-primary/5 hover:border-primary/60"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                      אני
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ink">
                        {selfDisplayName} (הפרופיל שלי)
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        בניית אימונים ותפריט עבורי
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-primary">
                    {isSelfSelected ? "נבחר" : "פתיחה"}
                  </span>
                </button>
              ) : null}

              {clientSearchQuery && filteredClients.length === 0 ? (
                <div className="surface-card p-6 text-center text-muted-foreground rounded-2xl text-xs space-y-2">
                  <p>לא נמצאו מתאמנים רשומים.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    {genderText(
                      gender,
                      "לחצי כאן להוספת מתאמן לפי אימייל",
                      "לחץ כאן להוספת מתאמן לפי אימייל",
                    )}
                  </button>
                </div>
              ) : clientSearchQuery ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredClients.map((c) => {
                    const isSelected = c.client_id === selectedClientId;
                    const nameStr = profileDisplayName(c.profiles);

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (!isSelected) {
                            openClientFromOverview(c.client_id);
                          }
                        }}
                        className={`surface-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border/60 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                            {nameStr.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-ink">{nameStr}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/coach/tracking/$clientId"
                            params={{ clientId: c.client_id }}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                          >
                            פתח דוח
                          </Link>
                          <ChevronLeft
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isSelected ? "-rotate-90 text-primary" : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          </>
        ) : null}

        {/* Selected Client Full Coach Workspace */}
        {selectedClientId && showClientWorkspace && (
          <Overlay
            open={showClientWorkspace}
            onClose={() => {
              if (clientId) {
                navigate({ to: trackingLanding ? "/coach/tracking" : "/coach/clients" });
                return;
              }
              setShowClientWorkspace(false);
              setSelectedClientId(null);
              setEditingProgramId(null);
              setEditingDayId(null);
            }}
            ariaLabel="בניית תוכנית ותפריט למתאמן"
            inline={clientsOnly}
            variant={workspacePage || openEditor ? "full" : "center"}
            className={workspacePage || openEditor ? "bg-background" : ""}
            panelClassName={workspacePage || openEditor ? "bg-background" : ""}
          >
            <div
              className={`w-full space-y-4 bg-background ${
                workspacePage || openEditor
                  ? "min-w-0 max-w-full overflow-x-hidden pb-10"
                  : "max-w-2xl rounded-3xl shadow-2xl"
              } ${workspacePage || openEditor ? "" : "p-4 sm:p-6"}`}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 overflow-x-hidden border-b border-border/60 px-4 pb-3 sm:px-6">
                <h3 className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden font-bold text-base text-ink">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="shrink-0">
                    {trackingLanding ? "דוח המעקב:" : "תכנית המתאמן:"}
                  </span>
                  <span className="truncate text-primary font-extrabold">
                    {isSelfSelected
                      ? `התוכנית של ${selfDisplayName}`
                      : profileDisplayName(selectedClientInfo?.profiles)}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (clientId) {
                      if (workspaceMode !== "all" && selectedClientId) {
                        navigate({
                          to: "/coach/clients/$clientId",
                          params: { clientId: selectedClientId },
                        });
                      } else
                        navigate({
                          to: trackingLanding ? "/coach/tracking" : "/coach/clients",
                        });
                      return;
                    }
                    setShowClientWorkspace(false);
                    setSelectedClientId(null);
                    setEditingProgramId(null);
                    setEditingDayId(null);
                  }}
                  aria-label="סגירת תכנית המתאמן"
                  className="grid h-9 w-9 place-items-center border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {(trackingLanding || workspacePage || openEditor) && clientDetails ? (
                <>
                  <nav
                    aria-label="ניווט בסביבת העריכה"
                    className="sticky top-2 z-10 grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-sm backdrop-blur"
                    onTouchStart={(event) => {
                      const touch = event.changedTouches[0];
                      if (touch) workspaceSwipeStart.current = { x: touch.clientX, y: touch.clientY };
                    }}
                    onTouchEnd={(event) => {
                      const start = workspaceSwipeStart.current;
                      const touch = event.changedTouches[0];
                      workspaceSwipeStart.current = null;
                      if (!start || !touch) return;
                      const dx = touch.clientX - start.x;
                      const dy = touch.clientY - start.y;
                      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
                      const next = dx < 0 ? "nutrition" : "programs";
                      setActiveWorkspaceTab(next);
                      setOpenEditor(trackingLanding ? null : next);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceTab("programs");
                        setOpenEditor(trackingLanding ? null : "programs");
                      }}
                      aria-selected={activeWorkspaceTab === "programs"}
                      role="tab"
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        activeWorkspaceTab === "programs"
                          ? "bg-sage text-ink shadow-sm"
                          : "bg-sage-soft text-secondary-foreground hover:bg-sage/70"
                      }`}
                    >
                      <Dumbbell className="h-3.5 w-3.5" />
                      {trackingLanding ? "אימונים" : "תוכנית אימונים"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceTab("nutrition");
                        setOpenEditor(trackingLanding ? null : "nutrition");
                      }}
                      aria-selected={activeWorkspaceTab === "nutrition"}
                      role="tab"
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        activeWorkspaceTab === "nutrition"
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                      }`}
                    >
                      <Apple className="h-3.5 w-3.5" />
                      {trackingLanding ? "תזונה" : "תפריט תזונה"}
                    </button>
                  </nav>
                  {trackingLanding && activeWorkspaceTab === "programs" ? (
                    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                      <div className="mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                          בחירת אימון
                        </p>
                        <p className="mt-1 text-xs font-semibold text-ink">
                          בחרי אימון כדי לראות את הדוח המלא שלו
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {clientDetails.workouts.map((workout) => (
                          <button
                            key={workout.id}
                            type="button"
                            onClick={() => setSelectedTrackingWorkoutId(workout.id)}
                            className={`rounded-xl border px-3 py-2.5 text-start text-xs font-bold transition-colors ${
                              selectedTrackingWorkoutId === workout.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-primary/20 bg-white text-ink hover:border-primary/50"
                            }`}
                          >
                            <span className="block">{workout.name}</span>
                            <span
                              className={`mt-0.5 block text-[10px] ${
                                selectedTrackingWorkoutId === workout.id
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {workout.items.length} תרגילים
                            </span>
                          </button>
                        ))}
                      </div>
                      {clientDetails.workouts.length === 0 ? (
                        <p className="rounded-xl bg-white/80 p-3 text-center text-xs text-muted-foreground">
                          עדיין לא נבנו אימונים למתאמן הזה.
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </>
              ) : null}

              {loadingDetails ? (
                <div className="surface-card p-6 text-center text-xs text-muted-foreground animate-pulse">
                  טוען נתוני מתאמן מ-Supabase...
                </div>
              ) : clientDetails ? (
                <div
                  key={activeWorkspaceTab}
                  className="workspace-tab-content space-y-4"
                  data-active-tab={activeWorkspaceTab}
                >
                  {showClientOverview && !trackingLanding ? (
                    <>
                      {!trackingLanding ? (
                        <>
                      {/* Send Coach Message Panel */}
                      <div className="surface-card p-4 rounded-2xl space-y-2.5 border border-primary/20 bg-primary/5">
                        <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" /> שליחת הודעת חיזוק / הנחיה למתאמן
                        </h4>

                        {msgSentNotice && (
                          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            {msgSentNotice}
                          </p>
                        )}

                        <form onSubmit={handleSendCoachMessage} className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={coachMsgText}
                            onChange={(e) => setCoachMsgText(e.target.value)}
                            placeholder="הקלידי הודעה שתופיע במסך הבית של המתאמן..."
                            className="flex-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-primary/90"
                          >
                            שלח
                          </button>
                        </form>
                      </div>

                      {/* Coach-managed monthly measurements */}
                      <div className="surface-card rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h4 className="font-bold text-sm text-ink">צ׳ק־אין ומדידות חודשיות</h4>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              המדידות נשמרות על ידי המאמנת או הבעלים בלבד
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingMeasurements((value) => !value)}
                            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            <Edit2 className="h-3 w-3" />
                            {editingMeasurements ? "ביטול" : "עריכה"}
                          </button>
                        </div>
                        {editingMeasurements ? (
                          <>
                            <label className="grid gap-1 text-[11px] font-bold text-muted-foreground">
                              תאריך מדידה
                              <input
                                type="date"
                                value={measurementDraft.date}
                                onChange={(event) =>
                                  setMeasurementDraft((current) => ({
                                    ...current,
                                    date: event.target.value,
                                  }))
                                }
                                className="h-10 rounded-xl border border-border bg-white px-3 text-xs text-ink"
                              />
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(
                                [
                                  ["chestCm", "חזה (ס״מ)"],
                                  ["waistCm", "מותניים (ס״מ)"],
                                  ["hipsCm", "ירכיים (ס״מ)"],
                                  ["bicepsCm", "זרוע / יד (ס״מ)"],
                                  ["thighsCm", "ירך (ס״מ)"],
                                  ["calvesCm", "שוק / תאומים (ס״מ)"],
                                  ["neckCm", "צוואר (ס״מ)"],
                                  ["bodyFatPct", "אחוז שומן (%)"],
                                  ["muscleMassKg", "מסת שריר (ק״ג)"],
                                ] as const
                              ).map(([field, label]) => (
                                <label
                                  key={field}
                                  className="grid gap-1 text-[11px] font-bold text-muted-foreground"
                                >
                                  {label}
                                  <input
                                    type="number"
                                    min="0"
                                    step={0.1}
                                    value={measurementDraft[field] ?? ""}
                                    onChange={(event) =>
                                      setMeasurementDraft((current) => ({
                                        ...current,
                                        [field]: event.target.value
                                          ? Number(event.target.value)
                                          : undefined,
                                      }))
                                    }
                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-ink"
                                  />
                                </label>
                              ))}
                            </div>
                            <textarea
                              value={measurementDraft.notes ?? ""}
                              onChange={(event) =>
                                setMeasurementDraft((current) => ({
                                  ...current,
                                  notes: event.target.value,
                                }))
                              }
                              placeholder="הערות המאמנת לצ׳ק־אין..."
                              className="min-h-16 w-full rounded-xl border border-border bg-white p-3 text-xs text-ink"
                            />
                            <button
                              type="button"
                              onClick={saveClientMeasurements}
                              className="flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-primary text-xs font-bold text-white"
                            >
                              <Save className="h-3.5 w-3.5" /> שמירת מדידות חודשיות
                            </button>
                          </>
                        ) : null}
                        {measurementNotice ? (
                          <p className="rounded-xl bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">
                            {measurementNotice}
                          </p>
                        ) : null}
                        {!editingMeasurements ? (
                          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            {[
                              ["מותניים", measurementDraft.waistCm, "ס״מ"],
                              ["אחוז שומן", measurementDraft.bodyFatPct, "%"],
                              ["מסת שריר", measurementDraft.muscleMassKg, "ק״ג"],
                            ].map(([label, value, unit]) => (
                              <div key={label} className="rounded-xl bg-secondary/50 p-2">
                                <span className="block text-muted-foreground">{label}</span>
                                <strong className="text-ink">
                                  {value !== undefined ? `${value} ${unit}` : "לא נמדד"}
                                </strong>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                        </>
                      ) : null}
                    </>
                  ) : null}

                  {showClientOverview && !trackingLanding ? (
                    <section className="grid gap-3 lg:grid-cols-2">
                      <div className="surface-card space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3 border-b border-primary/15 pb-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                              התוכנית העדכנית
                            </p>
                            <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                              {latestProgram?.name || "עדיין לא נבנתה תוכנית"}
                            </h4>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {latestProgram
                                ? `${latestProgram.dayIds.length} ימי אימון · ${clientDetails.workouts
                                    .filter((day) => latestProgram.dayIds.includes(day.id))
                                    .reduce((total, day) => total + day.items.length, 0)} תרגילים`
                                : "אפשר להתחיל לבנות תוכנית חדשה"}
                            </p>
                          </div>
                          <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-primary">
                            <Dumbbell className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          {clientDetails.history.slice(0, 4).map((session) => {
                            const doneSets = session.entries.reduce(
                              (total, entry) => total + entry.sets.filter((set) => set.done).length,
                              0,
                            );
                            return (
                              <div
                                key={session.id}
                                className="rounded-xl bg-white/80 p-2.5 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <strong className="text-ink">
                                    {session.workoutName || "אימון"}
                                  </strong>
                                  <span className="text-muted-foreground">
                                    {new Date(session.date).toLocaleDateString("he-IL")}
                                  </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  {doneSets} סטים בוצעו · {session.entries.length} תרגילים
                                  {session.difficultyRating ? ` · ${session.difficultyRating}` : ""}
                                </p>
                                {session.discomfortNotes ? (
                                  <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 font-semibold text-rose-800">
                                    כאב / אי־נוחות: {session.discomfortNotes}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                          {clientDetails.history.length === 0 ? (
                            <p className="rounded-xl bg-white/70 p-3 text-center text-[11px] text-muted-foreground">
                              עדיין לא נרשמו אימונים בפועל.
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceTab("programs");
                            setOpenEditor("programs");
                          }}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white"
                        >
                          <Dumbbell className="h-4 w-4" /> תוכנית אימון
                        </button>
                      </div>

                      <div className="surface-card space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/35 p-4">
                        <div className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                              התפריט העדכני
                            </p>
                            <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                              {latestNutritionDay
                                ? `תפריט ליום ${new Date(`${latestNutritionDay.date}T00:00:00`).toLocaleDateString("he-IL")}`
                                : "עדיין לא נבנה תפריט"}
                            </h4>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {latestNutritionDay
                                ? `${latestNutritionDay.plannedMeals?.length || 0} ארוחות מתוכננות · ${latestNutritionDay.meals.reduce(
                                    (total, meal) => total + meal.foods.length,
                                    0,
                                  )} מאכלים שנרשמו`
                                : "אפשר להתחיל לבנות תפריט חדש"}
                            </p>
                          </div>
                          <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-emerald-700">
                            <Apple className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(clientDetails.nutritionDays ?? []).slice(0, 4).map((day) => {
                            const actualFoods = day.meals.flatMap((meal) => meal.foods);
                            const calories = actualFoods.reduce(
                              (total, food) => total + food.calories * food.quantity,
                              0,
                            );
                            return (
                              <div
                                key={day.id || day.date}
                                className="rounded-xl bg-white/80 p-2.5 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <strong className="text-ink">
                                    {new Date(`${day.date}T00:00:00`).toLocaleDateString("he-IL")}
                                  </strong>
                                  <span className="text-emerald-700">
                                    {Math.round(calories)} קל׳ בפועל
                                  </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  {day.plannedMeals?.length || 0} ארוחות מתוכננות ·{" "}
                                  {actualFoods.length} מאכלים בפועל
                                </p>
                              </div>
                            );
                          })}
                          {clientDetails.nutritionDays.length === 0 ? (
                            <p className="rounded-xl bg-white/70 p-3 text-center text-[11px] text-muted-foreground">
                              עדיין לא נרשם מעקב תזונה.
                            </p>
                          ) : null}
                          {clientNutritionNotes.slice(0, 2).map((note) => (
                            <p
                              key={`${note.date}-${note.meal}-${note.note}`}
                              className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900"
                            >
                              הערת מתאמן: {note.note}
                            </p>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceTab("nutrition");
                            setOpenEditor("nutrition");
                          }}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                        >
                          <Apple className="h-4 w-4" /> תפריט תזונה
                        </button>
                      </div>
                    </section>
                  ) : null}

                  {(trackingLanding || workspacePage) &&
                  ((trackingLanding && activeWorkspaceTab === "programs") ||
                    (!trackingLanding && workspaceMode === "programs" && openEditor === null)) ? (
                    <section className="surface-card space-y-3 rounded-2xl border border-amber-200 bg-amber-50/35 p-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                            מה המתאמן ביצע בפועל
                          </p>
                          <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                            היסטוריית אימונים והערות
                          </h4>
                        </div>
                        <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-amber-700">
                          <Activity className="h-5 w-5" />
                        </span>
                      </div>
                       <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2">
                         <button type="button" onClick={() => shiftTrackingDate(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink" aria-label="היום הקודם">
                           <ChevronLeft className="h-4 w-4" />
                         </button>
                         <input type="date" value={trackingDate} onChange={(event) => setTrackingDate(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink" />
                         <button type="button" onClick={() => shiftTrackingDate(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink" aria-label="היום הבא">
                           <ChevronLeft className="h-4 w-4 rotate-180" />
                         </button>
                       </div>
                        {selectedTrackingWorkoutId && selectedTrackingWorkout ? (
                          <div className="space-y-2">
                            <div className="rounded-xl bg-white/80 p-3 text-[11px]">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-ink">
                                  {selectedTrackingWorkout.name || "אימון"}
                                </strong>
                                <span className="text-muted-foreground">
                                  {visibleTrackingSessions.length > 0
                                    ? `${visibleTrackingSessions.length} ביצועים בתאריך`
                                    : "אין ביצוע בתאריך"}
                                </span>
                              </div>
                              {visibleTrackingSessions.length > 0 ? (
                                <p className="mt-1 text-muted-foreground">
                                  {visibleTrackingSessions.reduce(
                                    (total, session) =>
                                      total +
                                      session.entries.reduce(
                                        (entryTotal, entry) =>
                                          entryTotal + entry.sets.filter((set) => set.done).length,
                                        0,
                                      ),
                                    0,
                                  )}{" "}
                                  סטים בוצעו בפועל
                                </p>
                              ) : null}
                            </div>

                            {trackingPlanRows.length > 0 ? (
                              <div className="space-y-1.5">
                                {trackingPlanRows.map(({ item, actualEntry, exercise }) => {
                                  const videoUrl = actualEntry?.videoUrl || exercise?.videoUrl;
                                  return (
                                    <div
                                      key={item.id}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() =>
                                        openTrackedPlan(
                                          selectedTrackingWorkout.id,
                                          item.exerciseId,
                                        )
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault();
                                          openTrackedPlan(
                                            selectedTrackingWorkout.id,
                                            item.exerciseId,
                                          );
                                        }
                                      }}
                                      className={`rounded-xl border px-3 py-2.5 text-[11px] ${
                                        actualEntry
                                          ? "border-emerald-200 bg-emerald-50/70"
                                          : "border-border/60 bg-white/80"
                                      } cursor-pointer text-start transition-colors hover:border-primary/50 hover:bg-primary/5`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <Link
                                          to="/coach/clients/$clientId/program"
                                          params={{ clientId: selectedClientId }}
                                          search={{
                                            dayId: selectedTrackingWorkout.id,
                                            ...(clientDetails.programs.find((program) =>
                                              program.dayIds.includes(selectedTrackingWorkout.id),
                                            )
                                              ? {
                                                  programId: clientDetails.programs.find((program) =>
                                                    program.dayIds.includes(
                                                      selectedTrackingWorkout.id,
                                                    ),
                                                  )!.id,
                                                }
                                              : {}),
                                            exerciseId: item.exerciseId,
                                          }}
                                          className="text-start font-bold text-ink hover:text-primary hover:underline"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                          }}
                                        >
                                          {actualEntry?.exerciseName || exercise?.name || "תרגיל"}
                                        </Link>
                                        <span
                                          className={`shrink-0 text-[10px] font-bold ${
                                            actualEntry ? "text-emerald-700" : "text-muted-foreground"
                                          }`}
                                        >
                                          {actualEntry ? "בוצע בפועל" : "טרם בוצע"}
                                        </span>
                                      </div>
                                      {actualEntry ? (
                                        <>
                                          <p className="mt-1 text-muted-foreground">
                                            {actualEntry.sets.length > 0
                                              ? actualEntry.sets
                                                  .map(
                                                    (set, index) =>
                                                      `סט ${index + 1}: ${set.weight} ק״ג × ${
                                                        set.reps
                                                      }${set.done ? " ✓" : " — לא בוצע"}`,
                                                  )
                                                  .join(" · ")
                                              : "לא נרשמו סטים"}
                                          </p>
                                          {actualEntry.feedback?.notes || actualEntry.notes ? (
                                            <p className="mt-1 text-ink">
                                              הערה:{" "}
                                              {actualEntry.feedback?.notes || actualEntry.notes}
                                            </p>
                                          ) : null}
                                          {actualEntry.feedback?.rating ? (
                                            <p className="mt-1 text-muted-foreground">
                                              דירוג:{" "}
                                              {actualEntry.feedback.rating === "easy"
                                                ? "קל"
                                                : actualEntry.feedback.rating === "difficult"
                                                  ? "כבד"
                                                  : "מתאים"}
                                            </p>
                                          ) : null}
                                        </>
                                      ) : (
                                        <p className="mt-1 text-muted-foreground">
                                          תוכנן: {item.sets} סטים ×{" "}
                                          {item.repMin || item.reps}
                                          {item.repMax ? `-${item.repMax}` : ""} חזרות ·{" "}
                                          {item.targetWeight || item.weight} ק״ג
                                        </p>
                                      )}
                                      {videoUrl ? (
                                        <a
                                          href={videoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(event) => event.stopPropagation()}
                                          className="mt-1 inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20"
                                        >
                                          סרטון לתרגיל
                                        </a>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="rounded-xl bg-white/80 p-3 text-center text-xs text-muted-foreground">
                                באימון הזה עדיין לא הוגדרו תרגילים.
                              </p>
                            )}
                            {visibleTrackingSessions.map((session) =>
                              session.discomfortNotes ? (
                                <p
                                  key={`${session.id}-discomfort`}
                                  className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800"
                                >
                                  כאב / אי־נוחות: {session.discomfortNotes}
                                </p>
                              ) : null,
                            )}
                          </div>
                      ) : (
                        <p className="text-center text-xs text-muted-foreground">
                            "בחרי אימון מהרשימה כדי לראות את הדוח שלו."
                        </p>
                      )}
                    </section>
                  ) : null}

                  {(trackingLanding || workspacePage) &&
                  ((trackingLanding && activeWorkspaceTab === "nutrition") ||
                    (!trackingLanding && workspaceMode === "nutrition" && openEditor === null)) ? (
                    <section className="surface-card space-y-3 rounded-2xl border border-amber-200 bg-amber-50/35 p-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                            מעקב תזונה בפועל
                          </p>
                          <h4 className="mt-1 font-display text-base font-extrabold text-ink">
                            מה המתאמן אכל והערותיו
                          </h4>
                        </div>
                        <span className="illustrated-mark inline-grid h-9 w-9 shrink-0 place-items-center text-amber-700">
                          <Apple className="h-5 w-5" />
                        </span>
                      </div>
                       <div className="flex items-center gap-2 rounded-xl bg-white/80 p-2">
                         <button type="button" onClick={() => shiftTrackingDate(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink" aria-label="היום הקודם">
                           <ChevronLeft className="h-4 w-4" />
                         </button>
                         <input type="date" value={trackingDate} onChange={(event) => setTrackingDate(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink" aria-label="תאריך מעקב תזונה" />
                         <button type="button" onClick={() => shiftTrackingDate(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink" aria-label="היום הבא">
                           <ChevronLeft className="h-4 w-4 rotate-180" />
                         </button>
                       </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          {trackingNutritionDay ? (
                            <div className="rounded-xl bg-white/80 p-3 text-[11px]">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-ink">
                                  {new Date(
                                    `${trackingNutritionDay.date}T00:00:00`,
                                  ).toLocaleDateString("he-IL")}
                                </strong>
                                <span className="text-muted-foreground">
                                  {trackingNutritionDay.meals.reduce(
                                    (total, meal) => total + meal.foods.length,
                                    0,
                                  )}{" "}
                                  מאכלים בפועל
                                </span>
                              </div>
                              <div className="mt-2 space-y-2">
                                {trackingNutritionDay.meals.map((meal) => (
                                  <div
                                    key={meal.id}
                                    className="rounded-lg border border-amber-100 bg-amber-50/50 p-2"
                                  >
                                    <div className="font-bold text-ink">{meal.name}</div>
                                    {meal.foods.length > 0 ? (
                                      <div className="mt-1 space-y-1">
                                        {meal.foods.map((food) => (
                                          <button
                                            key={food.id}
                                            type="button"
                                            onClick={() =>
                                              openTrackedNutrition(
                                                trackingNutritionDay.date,
                                                meal.id,
                                                food.id,
                                              )
                                            }
                                            className="block w-full rounded-md px-1.5 py-1 text-start text-muted-foreground hover:bg-amber-100 hover:text-primary"
                                          >
                                            {food.name} ×{food.quantity}
                                            {food.notes?.trim() ? ` · ${food.notes.trim()}` : ""}
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="mt-1 text-muted-foreground">
                                        לא נרשמו מאכלים בארוחה זו.
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {trackingNutritionDay.meals.length === 0 ? (
                                  <p className="text-center text-muted-foreground">
                                    לא נרשמו מאכלים ביום זה.
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-xs text-muted-foreground">
                              אין רישומי תזונה בתאריך זה.
                            </p>
                          )}
                      </div>
                       {(trackingNutritionDay?.meals.some((meal) =>
                         meal.foods.some((food) => food.notes?.trim()),
                       ) ?? false) ? (
                        <div className="space-y-1">
                           {trackingNutritionDay?.meals.flatMap((meal) =>
                             meal.foods
                               .filter((food) => food.notes?.trim())
                               .map((food) => ({ meal: meal.name, note: food.notes!.trim() })),
                           ).map((note) => (
                            <p
                               key={`${note.meal}-${note.note}`}
                              className="rounded-lg bg-white/80 px-2 py-1 text-[11px] text-ink"
                            >
                              {note.meal}: {note.note}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          אין הערות תזונה שנרשמו על ידי המתאמן.
                        </p>
                      )}
                    </section>
                  ) : null}

                  {/* Client Programs & Full Exercise Prescription Builder */}
                  <div
                    id="coach-programs"
                    className={`scroll-mt-24 space-y-4 ${
                      workspacePage
                        ? "bg-background"
                        : "surface-card rounded-[1.75rem] border-primary/15 bg-primary/[0.02] p-4"
                    } ${
                      !showProgramBuilder
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                        <Dumbbell className="h-4 w-4 text-primary" /> תוכנית האימונים
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                        {clientDetails?.programs?.length || 0} תוכניות
                      </span>
                    </div>

                    <form onSubmit={handleCreateClientProgram} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newProgramName}
                        onChange={(e) => setNewProgramName(e.target.value)}
                        placeholder="שם תוכנית אימון חדשה..."
                        className="flex-1 rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>צור</span>
                      </button>
                    </form>

                    <div className="num-pill flex h-11 items-center gap-2 px-3">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        type="search"
                        value={programQuery}
                        onChange={(event) => setProgramQuery(event.target.value)}
                        placeholder="חיפוש תוכנית אימון..."
                        className="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                        aria-label="חיפוש תוכנית אימון"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      {filteredPrograms.map((prog: Program) => {
                        const isProgActive = editingProgramId === prog.id;
                        const progDays = clientDetails?.workouts?.filter((w: Workout) =>
                          prog.dayIds?.includes(w.id),
                        );

                        return (
                          <div
                            key={prog.id}
                            className={`surface-card overflow-hidden border p-0 transition-colors ${
                              isProgActive
                                ? "border-primary/50 bg-primary/[0.03]"
                                : "border-border/60 hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 p-3.5">
                              <div className="min-w-0 text-start">
                                {isProgActive ? (
                                  <input
                                    defaultValue={prog.name}
                                    aria-label="שם תוכנית האימון"
                                    onBlur={(event) =>
                                      void handleRenameClientProgram(prog, event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") event.currentTarget.blur();
                                    }}
                                    className="w-full rounded-xl border border-primary/30 bg-background px-3 py-1.5 font-display text-[15px] font-semibold text-ink outline-none focus:border-primary"
                                  />
                                ) : (
                                  <span className="block truncate font-display text-[15px] font-semibold text-ink">
                                    {prog.name}
                                  </span>
                                )}
                                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                  {progDays?.length || 0} ימי אימון ·{" "}
                                  {progDays?.reduce((total, day) => total + day.items.length, 0) ||
                                    0}{" "}
                                  תרגילים
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingProgramId(isProgActive ? null : prog.id)}
                                className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span>{isProgActive ? "סגירה" : "עריכה"}</span>
                              </button>
                            </div>

                            {isProgActive && (
                              <div className="space-y-3 border-t border-border/50 bg-secondary/20 p-3.5">
                                <form onSubmit={handleAddProgramDay} className="flex gap-2">
                                  <input
                                    type="text"
                                    required
                                    value={newDayName}
                                    onChange={(e) => setNewDayName(e.target.value)}
                                    placeholder="שם יום אימון (למשל: A - פלג גוף עליון)..."
                                    className="flex-1 rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                                  />
                                  <button
                                    type="submit"
                                    className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer"
                                  >
                                    + יום
                                  </button>
                                </form>

                                <div className="space-y-2">
                                  {progDays?.map((dayItem: Workout) => {
                                    const isDayActive = editingDayId === dayItem.id;

                                    return (
                                      <div
                                        key={dayItem.id}
                                        className="rounded-2xl border border-border/60 bg-background p-3.5 shadow-sm"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          {isDayActive ? (
                                            <input
                                              defaultValue={dayItem.name}
                                              aria-label="שם יום האימון"
                                              onBlur={(event) =>
                                                void handleRenameWorkoutDay(
                                                  dayItem,
                                                  event.target.value,
                                                )
                                              }
                                              onKeyDown={(event) => {
                                                if (event.key === "Enter") event.currentTarget.blur();
                                              }}
                                              className="min-w-0 flex-1 rounded-xl border border-primary/30 bg-background px-3 py-1.5 text-[13px] font-bold text-ink outline-none focus:border-primary"
                                            />
                                          ) : (
                                            <span className="font-bold text-[13px] text-ink">
                                              {dayItem.name} ({dayItem.items?.length || 0} תרגילים)
                                            </span>
                                          )}
                                          <button
                                            onClick={() =>
                                              setEditingDayId(isDayActive ? null : dayItem.id)
                                            }
                                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                          >
                                            {isDayActive ? "סגור" : "+ שייך תרגיל מותאם"}
                                          </button>
                                        </div>

                                        {dayItem.items?.length > 0 && (
                                          <div className="space-y-1.5 pt-1">
                                            {dayItem.items.map((exItem: WorkoutItem) => {
                                              const exMeta = store.exercises.find(
                                                (e) => e.id === exItem.exerciseId,
                                              );
                                              const actualExecutions = clientDetails.history
                                                .flatMap((session) =>
                                                  session.entries
                                                    .filter(
                                                      (entry) =>
                                                        entry.exerciseId === exItem.exerciseId,
                                                    )
                                                    .map((entry) => ({
                                                      entry,
                                                      date: session.date,
                                                    })),
                                                )
                                                .slice(0, 3);

                                              return (
                                                <div
                                                  key={exItem.id}
                                                  id={`coach-exercise-${exItem.exerciseId}`}
                                                  className={`rounded-xl bg-secondary/50 p-2.5 text-xs transition-colors ${
                                                    focusedExerciseId === exItem.exerciseId
                                                      ? "ring-2 ring-primary/40 bg-primary/5"
                                                      : ""
                                                  }`}
                                                >
                                                  <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                      <span className="block font-display text-[15px] font-extrabold text-ink">
                                                        {exMeta?.name || "תרגיל"}
                                                      </span>
                                                      <span className="mt-1 inline-flex rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-bold text-ink">
                                                        {exItem.targetWeight || exItem.weight} ק״ג ·{" "}
                                                        {exItem.sets} סטים × {exItem.repMin || exItem.reps}
                                                        {exItem.repMax ? `-${exItem.repMax}` : ""} חזרות
                                                      </span>
                                                      <div className="mt-1 flex flex-wrap gap-1">
                                                        {exItem.warmups?.length ? (
                                                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                            חימום ×{exItem.warmups.length}
                                                          </span>
                                                        ) : null}
                                                        {exItem.dropSetConfig?.enabled ? (
                                                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                            {exItem.dropSetConfig.reductionValue &&
                                                            exItem.dropSetConfig.reductionMode
                                                              ? `דרופ סט · −${exItem.dropSetConfig.reductionValue}${
                                                                  exItem.dropSetConfig
                                                                    .reductionMode === "percent"
                                                                    ? "%"
                                                                    : " ק״ג"
                                                                }`
                                                              : "דרופ סט"}
                                                          </span>
                                                        ) : null}
                                                        {exItem.supersetId ? (
                                                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                                                            סופר סט {exItem.supersetId} ·{" "}
                                                            {exItem.supersetRepsMin ||
                                                              exItem.repMin ||
                                                              exItem.reps}
                                                            -
                                                            {exItem.supersetRepsMax ||
                                                              exItem.repMax ||
                                                              exItem.reps}
                                                          </span>
                                                        ) : null}
                                                        {exItem.techniqueNotes ? (
                                                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                                                            יש הערה למתאמן
                                                          </span>
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setEditingDayId(dayItem.id);
                                                          setEditingItemId((current) =>
                                                            current === exItem.id ? null : exItem.id,
                                                          );
                                                          if (editingItemId === exItem.id) return;
                                                          setSelectedExId(exItem.exerciseId);
                                                          setTargetWeight(
                                                            exItem.targetWeight || exItem.weight,
                                                          );
                                                          setSetsCount(exItem.sets);
                                                          setRepMin(exItem.repMin || exItem.reps);
                                                          setRepMax(exItem.repMax || exItem.reps);
                                                          setTechniqueNotes(exItem.techniqueNotes || exItem.notes);
                                                          const loadedModes = exItem.workingSets?.map((set) =>
                                                            set.dropSet ? "drop" : exItem.supersetId ? "superset" : "normal",
                                                          ) ?? [];
                                                          setSetModes(
                                                            Array.from(
                                                              { length: Math.max(1, exItem.sets) },
                                                              (_, index) => loadedModes[index] ?? "normal",
                                                            ),
                                                          );
                                                          setWarmupEnabled(Boolean(exItem.warmups?.length));
                                                          setWarmupSetsCount(exItem.warmups?.length || 1);
                                                          setWarmupWeight(exItem.warmups?.[0]?.weight || 10);
                                                          setWarmupReps(exItem.warmups?.[0]?.reps || 10);
                                                          setWarmupRepsMax(exItem.warmups?.[0]?.repsMax || 12);
                                                          setDropSetEnabled(Boolean(exItem.dropSetConfig?.enabled));
                                                          setDropLevel1Weight(
                                                            exItem.dropSetConfig?.levels?.[0]?.weight
                                                              ? String(exItem.dropSetConfig.levels[0].weight)
                                                              : "",
                                                          );
                                                          setDropLevel2Weight(
                                                            exItem.dropSetConfig?.levels?.[1]?.weight
                                                              ? String(exItem.dropSetConfig.levels[1].weight)
                                                              : "",
                                                          );
                                                          setSupersetGroup(exItem.supersetId || "");
                                                          setSupersetPartnerId(exItem.supersetPartnerId || "");
                                                        }}
                                                        className="rounded-lg bg-background px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/10"
                                                      >
                                                        {editingItemId === exItem.id ? "סגירה" : "עריכה"}
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleRemoveExerciseFromDay(
                                                            dayItem.id,
                                                            exItem.id,
                                                          )
                                                        }
                                                        className="rounded-lg p-1 text-muted-foreground hover:text-red-600 cursor-pointer"
                                                        aria-label={`הסר את ${exMeta?.name || "התרגיל"}`}
                                                      >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                  {editingItemId === exItem.id ? (
                                                  <>
                                                  <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-border/40 pt-2">
                                                    <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                      משקל יעד
                                                      <input
                                                        type="number"
                                                        defaultValue={exItem.targetWeight || exItem.weight}
                                                        min={0}
                                                        step={0.5}
                                                        onBlur={(event) => {
                                                          const value = Number(event.target.value);
                                                          if (Number.isFinite(value)) {
                                                            void handleUpdateExerciseItem(dayItem.id, exItem.id, {
                                                              targetWeight: value,
                                                              weight: value,
                                                            });
                                                          }
                                                        }}
                                                        className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                      />
                                                    </label>
                                                    <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                      סטים
                                                      <input
                                                        type="number"
                                                        defaultValue={exItem.sets}
                                                        min={1}
                                                        onBlur={(event) => {
                                                          const value = Math.max(1, Number(event.target.value));
                                                          if (Number.isFinite(value)) {
                                                            void handleUpdateExerciseItem(dayItem.id, exItem.id, {
                                                              sets: value,
                                                            });
                                                          }
                                                        }}
                                                        className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                      />
                                                    </label>
                                                    <label className="text-center text-[9px] font-bold text-muted-foreground">
                                                      חזרות
                                                      <input
                                                        type="number"
                                                        defaultValue={exItem.repMin || exItem.reps}
                                                        min={1}
                                                        onBlur={(event) => {
                                                          const value = Math.max(1, Number(event.target.value));
                                                          if (Number.isFinite(value)) {
                                                            void handleUpdateExerciseItem(dayItem.id, exItem.id, {
                                                              reps: value,
                                                              repMin: value,
                                                              repMax: value,
                                                            });
                                                          }
                                                        }}
                                                        className="mt-1 h-9 w-full rounded-xl border border-border/60 bg-background px-1 text-center text-xs font-bold text-ink outline-none focus:border-primary"
                                                      />
                                                    </label>
                                                  </div>
                                                  <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                                                    <p className="text-right text-[10px] font-bold text-muted-foreground">
                                                      בחר תרגיל
                                                    </p>
                                                    <button
                                                      type="button"
                                                      onClick={() => setShowExercisePicker(true)}
                                                      className="flex h-10 w-full items-center justify-between rounded-xl border border-border/60 bg-background px-3 text-right text-xs font-semibold text-ink"
                                                    >
                                                      <span>
                                                        {store.exercises.find(
                                                          (exercise) => exercise.id === selectedExId,
                                                        )?.name || exMeta?.name || "חיפוש ובחירת תרגיל"}
                                                      </span>
                                                      <Search className="h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                    <div className="rounded-2xl border border-border/50 bg-background/60 p-2">
                                                      <p className="mb-2 text-right text-[10px] font-bold text-muted-foreground">
                                                        סוג לכל סט
                                                      </p>
                                                      <div className="space-y-1.5">
                                                        {Array.from(
                                                          { length: Math.max(1, setsCount) },
                                                          (_, index) => (
                                                            <div
                                                              key={index}
                                                              className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background px-2 py-1.5"
                                                            >
                                                              <span className="text-[11px] font-bold text-ink">
                                                                סט {index + 1}
                                                              </span>
                                                              <select
                                                                value={setModes[index] ?? "normal"}
                                                                onChange={(event) => {
                                                                  const mode = event.target.value as
                                                                    | "normal"
                                                                    | "warmup"
                                                                    | "drop"
                                                                    | "superset";
                                                                  setSetModes((current) => {
                                                                    const next = Array.from(
                                                                      { length: Math.max(1, setsCount) },
                                                                      (_, itemIndex) =>
                                                                        current[itemIndex] ?? "normal",
                                                                    );
                                                                    next[index] = mode;
                                                                    return next;
                                                                  });
                                                                }}
                                                                className="h-8 min-w-32 rounded-lg border border-border/60 bg-background px-2 text-[11px] font-semibold text-ink"
                                                              >
                                                                <option value="normal">סט רגיל</option>
                                                                <option value="warmup">סט חימום</option>
                                                                <option value="drop">דרופ סט</option>
                                                                <option value="superset">סופר סט</option>
                                                              </select>
                                                            </div>
                                                          ),
                                                        )}
                                                      </div>
                                                    </div>
                                                    <label className="block text-right text-[10px] font-bold text-muted-foreground">
                                                      הערה למתאמן על התרגיל
                                                      <textarea
                                                        rows={2}
                                                        value={techNotes}
                                                        onChange={(event) =>
                                                          setTechniqueNotes(event.target.value)
                                                        }
                                                        placeholder="למשל: לשמור על גב ישר ולבצע לאט..."
                                                        className="mt-1 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-right text-xs font-normal text-ink outline-none focus:border-primary"
                                                      />
                                                    </label>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        void handleUpdateExerciseItem(
                                                          dayItem.id,
                                                          exItem.id,
                                                          {
                                                            targetWeight,
                                                            weight: targetWeight,
                                                            sets: Math.max(1, setsCount),
                                                            reps: Math.max(1, repMin),
                                                            repMin: Math.max(1, repMin),
                                                            repMax: Math.max(repMin, repMax),
                                                            notes: techNotes.trim(),
                                                          },
                                                        );
                                                        setEditingItemId(null);
                                                      }}
                                                      className="h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm"
                                                    >
                                                      שמור תרגיל ליום אימון
                                                    </button>
                                                  </div>
                                                  </>
                                                  ) : null}
                                                  {false && actualExecutions.length > 0 ? (
                                                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-[10px]">
                                                      <div className="flex items-center justify-between gap-2 font-bold text-amber-900">
                                                        <span>ביצוע אחרון של המתאמן</span>
                                                        <span className="font-normal text-amber-800">
                                                          {new Date(
                                                            actualExecutions[0]!.date,
                                                          ).toLocaleDateString("he-IL")}
                                                        </span>
                                                      </div>
                                                      {actualExecutions.map(({ entry }) => (
                                                        <div
                                                          key={`${entry.exerciseId}-${entry.notes}-${entry.sets.length}`}
                                                          className="mt-1.5 border-t border-amber-200/70 pt-1.5"
                                                        >
                                                          <p className="text-amber-950">
                                                            {entry.sets.length > 0
                                                              ? entry.sets
                                                                  .map(
                                                                    (set, index) =>
                                                                      `סט ${index + 1}: ${
                                                                        set.weight
                                                                      } ק״ג × ${set.reps}${
                                                                        set.done
                                                                          ? " ✓"
                                                                          : " — לא בוצע"
                                                                      }`,
                                                                  )
                                                                  .join(" · ")
                                                              : "לא נרשמו סטים"}
                                                          </p>
                                                          {entry.feedback?.rating ||
                                                          entry.feedback?.notes ||
                                                          entry.notes ? (
                                                            <p className="mt-1 text-amber-900/80">
                                                              {entry.feedback?.rating === "easy"
                                                                ? "קל"
                                                                : entry.feedback?.rating ===
                                                                    "difficult"
                                                                  ? "כבד"
                                                                  : entry.feedback?.rating ===
                                                                      "appropriate"
                                                                    ? "מתאים"
                                                                    : ""}
                                                              {entry.feedback?.notes || entry.notes
                                                                ? ` · ${
                                                                    entry.feedback?.notes ||
                                                                    entry.notes
                                                                  }`
                                                                : ""}
                                                            </p>
                                                          ) : null}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <p className="mt-2 rounded-lg bg-white/60 px-2 py-1 text-[10px] text-muted-foreground">
                                                      עדיין אין ביצוע בפועל לתרגיל הזה.
                                                    </p>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {isDayActive && !editingItemId && (
                                            <form
                                            onSubmit={handleAddExerciseToDay}
                                            className="pt-2 border-t border-border/40 space-y-2 text-xs"
                                          >
                                              <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold text-primary">
                                                  {editingItemId ? "עריכת תרגיל באימון" : "הוספת תרגיל לאימון"}
                                                </p>
                                                {editingItemId ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setEditingItemId(null);
                                                      setSelectedExId("");
                                                    }}
                                                    className="text-[10px] font-bold text-muted-foreground hover:text-ink"
                                                  >
                                                    ביטול עריכה
                                                  </button>
                                                ) : null}
                                              </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                                בחר תרגיל מספרייה
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => setShowExercisePicker(true)}
                                                className="w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-start"
                                              >
                                                <span
                                                  className={
                                                    selectedExId
                                                      ? "text-ink"
                                                      : "text-muted-foreground"
                                                  }
                                                >
                                                  {selectedExId
                                                    ? store.exercises.find(
                                                        (e) => e.id === selectedExId,
                                                      )?.name || "תרגיל נבחר"
                                                    : "חיפוש ובחירת תרגיל..."}
                                                </span>
                                                <Search className="h-4 w-4 text-muted-foreground" />
                                              </button>
                                            </div>
                                            {exerciseBuilderNotice ? (
                                              <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] font-semibold text-ink">
                                                {exerciseBuilderNotice}
                                              </p>
                                            ) : null}

                                            <div className="grid grid-cols-4 gap-1.5">
                                              <div>
                                                <label className="block text-[9px] font-bold text-muted-foreground">
                                                  משקל יעד (kg)
                                                </label>
                                                <input
                                                  type="number"
                                                  value={targetWeight}
                                                  onChange={(e) =>
                                                    setTargetWeight(Number(e.target.value))
                                                  }
                                                  className="w-full rounded-md border p-1 text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[9px] font-bold text-muted-foreground">
                                                  סטים
                                                </label>
                                                <input
                                                  type="number"
                                                  value={setsCount}
                                                  onChange={(e) =>
                                                    setSetsCount(Number(e.target.value))
                                                  }
                                                  className="w-full rounded-md border p-1 text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[9px] font-bold text-muted-foreground">
                                                  חזרות מינ'
                                                </label>
                                                <input
                                                  type="number"
                                                  value={repMin}
                                                  onChange={(e) =>
                                                    setRepMin(Number(e.target.value))
                                                  }
                                                  className="w-full rounded-md border p-1 text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[9px] font-bold text-muted-foreground">
                                                  חזרות מקס'
                                                </label>
                                                <input
                                                  type="number"
                                                  value={repMax}
                                                  onChange={(e) =>
                                                    setRepMax(Number(e.target.value))
                                                  }
                                                  className="w-full rounded-md border p-1 text-center"
                                                />
                                              </div>
                                            </div>

                                            <div className="rounded-2xl border border-border/60 bg-background p-2.5">
                                              <p className="mb-2 text-[10px] font-bold text-muted-foreground">
                                                סוג לכל סט
                                              </p>
                                              <div className="space-y-1.5">
                                                {Array.from({ length: setsCount }, (_, index) => {
                                                  const mode = setModes[index] ?? "normal";
                                                  return (
                                                    <div
                                                      key={index}
                                                      className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-white px-2 py-1.5"
                                                    >
                                                      <span className="text-[11px] font-bold text-ink">
                                                        סט {index + 1}
                                                      </span>
                                                      <select
                                                        value={mode}
                                                        onChange={(event) => {
                                                          const nextMode = event.target.value as
                                                            | "normal"
                                                            | "warmup"
                                                            | "drop"
                                                            | "superset";
                                                          setSetModes((current) => {
                                                            const next = Array.from(
                                                              { length: setsCount },
                                                              (_, itemIndex) =>
                                                                current[itemIndex] ?? "normal",
                                                            );
                                                            next[index] = nextMode;
                                                            return next;
                                                          });
                                                          setWarmupEnabled(
                                                            nextMode === "warmup" ||
                                                              setModes.some((item, itemIndex) =>
                                                                itemIndex === index
                                                                  ? false
                                                                  : item === "warmup",
                                                              ),
                                                          );
                                                          setDropSetEnabled(
                                                            nextMode === "drop" ||
                                                              setModes.some((item, itemIndex) =>
                                                                itemIndex === index
                                                                  ? false
                                                                  : item === "drop",
                                                              ),
                                                          );
                                                          if (
                                                            nextMode === "superset" &&
                                                            !supersetGroup
                                                          ) {
                                                            setSupersetGroup("A");
                                                          }
                                                        }}
                                                        className="h-8 min-w-32 rounded-lg border border-border bg-white px-2 text-[11px] font-semibold text-ink"
                                                      >
                                                        <option value="normal">סט רגיל</option>
                                                        <option value="warmup">סט חימום</option>
                                                        <option value="drop">
                                                          דרופ סט — הורדת משקל
                                                        </option>
                                                        <option value="superset">
                                                          סופר סט — בלי מנוחה
                                                        </option>
                                                      </select>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>

                                            <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                              הערה למתאמן על התרגיל
                                              <textarea
                                                value={techNotes}
                                                onChange={(event) =>
                                                  setTechniqueNotes(event.target.value)
                                                }
                                                placeholder="למשל: לשמור על גב ישר ולבצע לאט..."
                                                rows={2}
                                                className="w-full resize-none rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-normal text-ink outline-none focus:border-primary"
                                              />
                                            </label>

                                            {warmupEnabled || dropSetEnabled || supersetGroup ? (
                                              <div className="grid min-w-0 grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background p-3">
                                                {warmupEnabled ? (
                                                  <>
                                                    <label className="grid min-w-0 gap-1 text-[10px] font-bold text-muted-foreground">
                                                      משקל חימום (ק״ג)
                                                      <input
                                                        type="number"
                                                        min="0"
                                                        step={0.1}
                                                        value={warmupWeight}
                                                        onChange={(event) =>
                                                          setWarmupWeight(
                                                            Math.max(0, Number(event.target.value)),
                                                          )
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      מספר סטי חימום
                                                      <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        value={warmupSetsCount}
                                                        onChange={(event) =>
                                                          setWarmupSetsCount(
                                                            Math.max(1, Number(event.target.value)),
                                                          )
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      חזרות חימום מינ'
                                                      <input
                                                        type="number"
                                                        min="1"
                                                        value={warmupReps}
                                                        onChange={(event) =>
                                                          setWarmupReps(
                                                            Math.max(1, Number(event.target.value)),
                                                          )
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      חזרות חימום מקס'
                                                      <input
                                                        type="number"
                                                        min={warmupReps}
                                                        value={warmupRepsMax}
                                                        onChange={(event) =>
                                                          setWarmupRepsMax(
                                                            Math.max(
                                                              warmupReps,
                                                              Number(event.target.value),
                                                            ),
                                                          )
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                  </>
                                                ) : null}
                                                {dropSetEnabled ? (
                                                  <>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      משקל לפני הדרופ (ק״ג)
                                                      <input
                                                        type="number"
                                                        min="0.1"
                                                        step={0.1}
                                                        inputMode="decimal"
                                                        value={dropLevel1Weight}
                                                        onChange={(event) =>
                                                          setDropLevel1Weight(event.target.value)
                                                        }
                                                        placeholder="למשל 20"
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                                                        aria-label="משקל לפני הדרופ בקילוגרמים"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      משקל אחרי הדרופ (ק״ג)
                                                      <input
                                                        type="number"
                                                        min="0.1"
                                                        step={0.1}
                                                        inputMode="decimal"
                                                        value={dropLevel2Weight}
                                                        onChange={(event) =>
                                                          setDropLevel2Weight(event.target.value)
                                                        }
                                                        placeholder="למשל 15"
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                                                        aria-label="משקל אחרי הדרופ בקילוגרמים"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      חזרות דרופ סט
                                                      <div className="grid grid-cols-2 gap-1">
                                                        <input
                                                          type="number"
                                                          min="1"
                                                          value={dropRepsMin}
                                                          onChange={(event) =>
                                                            setDropRepsMin(
                                                              Math.max(
                                                                1,
                                                                Number(event.target.value),
                                                              ),
                                                            )
                                                          }
                                                          className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                          aria-label="חזרות דרופ סט מינימום"
                                                        />
                                                        <input
                                                          type="number"
                                                          min={dropRepsMin}
                                                          value={dropRepsMax}
                                                          onChange={(event) =>
                                                            setDropRepsMax(
                                                              Math.max(
                                                                dropRepsMin,
                                                                Number(event.target.value),
                                                              ),
                                                            )
                                                          }
                                                          className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                          aria-label="חזרות דרופ סט מקסימום"
                                                        />
                                                      </div>
                                                    </label>
                                                  </>
                                                ) : null}
                                                {supersetGroup ? (
                                                  <>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      קבוצה
                                                      <input
                                                        value={supersetGroup}
                                                        onChange={(event) =>
                                                          setSupersetGroup(event.target.value)
                                                        }
                                                        placeholder="A"
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                    <label className="col-span-2 grid min-w-0 gap-1 text-[10px] font-bold text-muted-foreground">
                                                      תרגיל שני בסופר סט
                                                      <select
                                                        required
                                                        value={supersetPartnerId}
                                                        onChange={(event) =>
                                                          setSupersetPartnerId(event.target.value)
                                                        }
                                                        className="block h-9 w-full min-w-0 max-w-full truncate rounded-lg border border-border bg-white px-2 text-xs text-ink"
                                                      >
                                                        <option value="">
                                                          בחרי תרגיל שמתבצע מיד אחרי הראשון...
                                                        </option>
                                                        {filteredExerciseOptions
                                                          .filter(
                                                            (exercise) =>
                                                              exercise.id !== selectedExId,
                                                          )
                                                          .map((exercise) => (
                                                            <option
                                                              key={exercise.id}
                                                              value={exercise.id}
                                                            >
                                                              {exerciseDisplayName(exercise)} (
                                                              {exercise.muscleGroup})
                                                            </option>
                                                          ))}
                                                      </select>
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      חזרות סופר סט
                                                      <div className="grid grid-cols-2 gap-1">
                                                        <input
                                                          type="number"
                                                          min="1"
                                                          value={supersetRepsMin}
                                                          onChange={(event) =>
                                                            setSupersetRepsMin(
                                                              Math.max(
                                                                1,
                                                                Number(event.target.value),
                                                              ),
                                                            )
                                                          }
                                                          className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                          aria-label="חזרות סופר סט מינימום"
                                                        />
                                                        <input
                                                          type="number"
                                                          min={supersetRepsMin}
                                                          value={supersetRepsMax}
                                                          onChange={(event) =>
                                                            setSupersetRepsMax(
                                                              Math.max(
                                                                supersetRepsMin,
                                                                Number(event.target.value),
                                                              ),
                                                            )
                                                          }
                                                          className="h-9 rounded-lg border border-border bg-white px-1 text-center text-xs"
                                                          aria-label="חזרות סופר סט מקסימום"
                                                        />
                                                      </div>
                                                    </label>
                                                  </>
                                                ) : null}
                                              </div>
                                            ) : null}

                                            <button
                                              type="submit"
                                              className="w-full rounded-lg bg-primary py-1.5 font-bold text-white shadow-xs cursor-pointer"
                                            >
                                              {editingItemId ? "שמור שינויי תרגיל" : "שמור תרגיל ליום אימון"}
                                            </button>
                                          </form>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coach-prescribed menu builder */}
                  <div
                    id="coach-menu"
                    className={`space-y-3 ${
                      workspacePage
                        ? "bg-background"
                        : "surface-card rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4"
                    } ${
                      !showNutritionBuilder
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-2">
                      <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
                          <Apple className="h-4 w-4 text-emerald-700" /> בניית תפריט למתאמן
                        </h4>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          התפריט נשמר בנפרד מהיומן בפועל ויופיע למתאמן כמתווה יומי.
                        </p>
                      </div>
                      <input
                        type="date"
                        value={menuDate}
                        onChange={(event) => setMenuDate(event.target.value)}
                        className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-emerald-500"
                        aria-label="תאריך התפריט"
                      />
                    </div>

                    <div className="sticky top-2 z-10 grid grid-cols-4 gap-1.5 rounded-xl border border-emerald-200 bg-white/95 p-2 shadow-sm backdrop-blur">
                      <div className="rounded-lg bg-orange-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-orange-700">קלוריות</div>
                        <div className="mt-0.5 text-sm font-black text-orange-950">
                          {Math.round(menuTotals.calories)}
                        </div>
                        <div className="text-[9px] text-orange-700">קק״ל</div>
                      </div>
                      <div className="rounded-lg bg-blue-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-blue-700">חלבון</div>
                        <div className="mt-0.5 text-sm font-black text-blue-950">
                          {Math.round(menuTotals.protein * 10) / 10}
                        </div>
                        <div className="text-[9px] text-blue-700">גרם</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-amber-700">פחמימה</div>
                        <div className="mt-0.5 text-sm font-black text-amber-950">
                          {Math.round(menuTotals.carbs * 10) / 10}
                        </div>
                        <div className="text-[9px] text-amber-700">גרם</div>
                      </div>
                      <div className="rounded-lg bg-rose-50 px-1.5 py-2 text-center">
                        <div className="text-[10px] font-bold text-rose-700">שומנים</div>
                        <div className="mt-0.5 text-sm font-black text-rose-950">
                          {Math.round(menuTotals.fat * 10) / 10}
                        </div>
                        <div className="text-[9px] text-rose-700">גרם</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plannedMeals.map((meal, mealIndex) => {
                        const actualMeal = clientDetails.nutritionDays
                          .find((day) => day.date === menuDate)
                          ?.meals.at(mealIndex);
                        return (
                          <div
                            key={meal.id}
                            id={`coach-menu-meal-${meal.id}`}
                            className="rounded-xl border border-emerald-200/70 bg-white p-3"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                value={meal.name}
                                onChange={(event) =>
                                  setPlannedMeals((current) =>
                                    current.map((item) =>
                                      item.id === meal.id
                                        ? { ...item, name: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                className="min-w-0 flex-1 bg-transparent text-xs font-bold text-ink outline-none"
                                aria-label="שם הארוחה"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuFoodMealId(menuFoodMealId === meal.id ? null : meal.id)
                                }
                                className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                              >
                                + מאכל
                              </button>
                            </div>

                            {meal.foods.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {meal.foods.map((food) => (
                                  <div
                                    key={food.id}
                                    className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px]"
                                  >
                                    <span className="truncate font-semibold text-ink">
                                      {food.name} · {mealFoodQuantityLabel(food)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removePlannedFood(meal.id, food.id)}
                                      className="ms-2 shrink-0 text-muted-foreground hover:text-destructive"
                                      aria-label={`הסר ${food.name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                אין מאכלים בארוחה עדיין.
                              </p>
                            )}

                            {actualMeal?.foods.length ? (
                              <div
                                className={`mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-[10px] ${
                                  focusedNutritionMealId &&
                                  (focusedNutritionMealId === actualMeal.id ||
                                    focusedNutritionMealId === meal.id)
                                    ? "ring-2 ring-primary/35"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 font-bold text-amber-900">
                                  <span>מה שהמתאמן אכל בפועל</span>
                                  <span className="font-normal">
                                    {new Date(`${menuDate}T00:00:00`).toLocaleDateString("he-IL")}
                                  </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                  {actualMeal.foods.map((food) => (
                                    <div
                                      key={food.id}
                                      id={`coach-menu-food-${food.id}`}
                                      className={`rounded-md px-1.5 py-1 text-amber-950 ${
                                        focusedNutritionFoodId === food.id
                                          ? "bg-primary/10 font-bold ring-1 ring-primary/30"
                                          : ""
                                      }`}
                                    >
                                      {food.name} ×{food.quantity}
                                      {food.notes?.trim() ? (
                                        <span className="text-amber-900/80">
                                          {" "}
                                          · הערה: {food.notes.trim()}
                                        </span>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 rounded-lg bg-amber-50/60 px-2 py-1 text-[10px] text-amber-800">
                                עדיין אין רישום בפועל לארוחה הזו.
                              </p>
                            )}

                            {menuFoodMealId === meal.id ? (
                              <div className="mt-2 space-y-2 border-t border-emerald-100 pt-2">
                                <label
                                  className="block text-[11px] font-bold text-emerald-900"
                                  htmlFor={`menu-food-search-${meal.id}`}
                                >
                                  חיפוש במאגר המאכלים
                                </label>
                                <input
                                  id={`menu-food-search-${meal.id}`}
                                  type="search"
                                  value={menuFoodQuery}
                                  onChange={(event) => {
                                    setMenuFoodQuery(event.target.value);
                                    setMenuFoodId("");
                                  }}
                                  placeholder={genderText(
                                    gender,
                                    "חפשי למשל: חזה עוף, אורז, ביצה...",
                                    "חפש למשל: חזה עוף, אורז, ביצה...",
                                  )}
                                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                  aria-describedby={`menu-food-help-${meal.id}`}
                                  autoComplete="off"
                                />
                                <p
                                  id={`menu-food-help-${meal.id}`}
                                  className="text-[10px] text-muted-foreground"
                                >
                                  {genderText(
                                    gender,
                                    "בחרי מאכל מהרשימה כדי להוסיף אותו לארוחה.",
                                    "בחר מאכל מהרשימה כדי להוסיף אותו לארוחה.",
                                  )}
                                </p>
                                <div
                                  role="listbox"
                                  aria-label="תוצאות חיפוש מאכלים"
                                  className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-emerald-100 bg-emerald-50/50 p-1.5"
                                >
                                  {menuFoodResults.length > 0 ? (
                                    menuFoodResults.map((food) => (
                                      <button
                                        key={food.id}
                                        type="button"
                                        role="option"
                                        aria-selected={menuFoodId === food.id}
                                        onClick={() => {
                                          setMenuFoodId(food.id);
                                          const portion = defaultFoodQuantity(food);
                                          setMenuFoodQuantity(portion.quantity);
                                          setMenuFoodUnit(portion.unit);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-start text-[12px] transition-colors ${
                                          menuFoodId === food.id
                                            ? "bg-emerald-700 font-bold text-white"
                                            : "bg-white font-semibold text-ink hover:bg-emerald-100"
                                        }`}
                                      >
                                        <span className="truncate">{food.name}</span>
                                        <span className="ms-2 shrink-0 text-[10px] opacity-70">
                                          {food.calories} קל׳
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="p-3 text-center text-[11px] text-muted-foreground">
                                      לא נמצאו מאכלים. נסי מילה אחרת.
                                    </p>
                                  )}
                                </div>
                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-1.5">
                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                    יחידת מידה
                                    <select
                                      value={menuFoodUnit}
                                      onChange={(event) =>
                                        setMenuFoodUnit(event.target.value as FoodQuantityUnit)
                                      }
                                      disabled={!selectedMenuFood}
                                      className="h-9 min-w-0 w-full rounded-lg border border-border bg-white px-2 text-center text-[12px] outline-none focus:border-emerald-500"
                                      aria-label="יחידת מידה למאכל"
                                    >
                                      {(selectedMenuFood
                                        ? foodQuantityOptions(selectedMenuFood)
                                        : []
                                      ).map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                    כמות
                                    <input
                                      type="number"
                                      min="0.1"
                                      step={0.1}
                                      value={menuFoodQuantity}
                                      onChange={(event) =>
                                        setMenuFoodQuantity(Number(event.target.value))
                                      }
                                      className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-center text-[12px] outline-none focus:border-emerald-500"
                                      aria-label="כמות המאכל"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!menuFoodId || menuFoodQuantity <= 0}
                                    onClick={() => addPlannedFood(meal.id)}
                                    className="rounded-lg bg-emerald-700 px-3 py-2 text-[12px] font-bold text-white disabled:opacity-40"
                                  >
                                    {genderText(gender, "הוסיפי לארוחה", "הוסף לארוחה")}
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addPlannedMeal}
                        className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                      >
                        + {genderText(gender, "הוסיפי ארוחה", "הוסף ארוחה")}
                      </button>
                      <button
                        type="button"
                        onClick={savePlannedMenu}
                        className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                      >
                        {genderText(gender, "שמרי תפריט", "שמור תפריט")}
                      </button>
                    </div>
                    {menuNotice ? (
                      <p
                        className={`rounded-lg border p-2 text-[11px] font-semibold ${
                          menuNotice.includes("נכשל")
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-emerald-200 bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {menuNotice}
                      </p>
                    ) : null}
                  </div>

                  {/* Client Nutrition Targets Editor */}
                  <div
                    id="coach-nutrition"
                    className={`scroll-mt-24 space-y-4 ${
                      workspacePage
                        ? "bg-background"
                        : "surface-card rounded-[1.75rem] border-emerald-200/70 bg-emerald-50/30 p-4"
                    } ${
                      !showNutritionBuilder
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                        <Apple className="h-4 w-4 text-primary" /> יעד קלורי ותזונה למתאמן
                      </h3>
                      <button
                        onClick={() => setEditingNutrition(!editingNutrition)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>{editingNutrition ? "ביטול" : "ערוך יעדים"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBmrCalculator(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 text-[11px] font-bold text-primary"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      מחשבון BMR
                    </button>
                    {showBmrCalculator ? (
                    <div className="rounded-2xl border border-primary/15 bg-card/80 p-3">
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold text-ink">מחשבון BMR למאמן בלבד</p>
                          <button
                            type="button"
                            onClick={() => setShowBmrCalculator(false)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-ink"
                            aria-label="סגירת מחשבון BMR"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                          החישוב הוא אומדן לפי Mifflin–St Jeor. הוא לא מוצג למתאמן ולא משנה יעד
                          קלורי אוטומטית.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          מין
                          <select
                            value={profileGender}
                            onChange={(event) =>
                              setProfileGender(event.target.value as "female" | "male" | "")
                            }
                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          >
                            <option value="">נדרש</option>
                            <option value="female">נקבה</option>
                            <option value="male">זכר</option>
                          </select>
                        </label>
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          גיל
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={profileAge}
                            onChange={(event) => setProfileAge(event.target.value)}
                            placeholder="נדרש"
                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          />
                        </label>
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          גובה (ס״מ)
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={profileHeight}
                            onChange={(event) => setProfileHeight(event.target.value)}
                            placeholder="נדרש"
                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          />
                        </label>
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          משקל (ק״ג)
                          <input
                            type="number"
                            min="0.1"
                            max="500"
                            step={0.1}
                            value={profileWeight}
                            onChange={(event) => setProfileWeight(event.target.value)}
                            placeholder="נדרש"
                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          />
                        </label>
                        <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                          אימונים בשבוע
                          <input
                            type="number"
                            min="0"
                            max="14"
                            value={profileWorkouts}
                            onChange={(event) => setProfileWorkouts(event.target.value)}
                            placeholder="נדרש"
                            className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs text-ink"
                          />
                        </label>
                      </div>
                      {!clientDetails?.profile?.gender ? (
                        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] font-semibold text-ink">
                          חסר מין בפרופיל המתאמן. יש להשלים אותו בפרופיל לפני שאפשר לחשב.
                        </p>
                      ) : null}
                      {calorieEstimate ? (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-xl bg-primary/5 p-2">
                            <span className="block text-[10px] text-muted-foreground">
                              BMR במנוחה
                            </span>
                            <strong className="text-sm text-ink">{calorieEstimate.bmr} kcal</strong>
                          </div>
                          <div className="rounded-xl bg-primary/10 p-2">
                            <span className="block text-[10px] text-muted-foreground">
                              TDEE בשגרה
                            </span>
                            <strong className="text-sm text-ink">
                              {calorieEstimate.tdee} kcal
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-[10px] font-semibold text-muted-foreground">
                          השלימי גיל, גובה, משקל, מין ומספר אימונים בשבוע — ללא כל אחד מהם לא יוצג
                          חישוב.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={saveClientCalorieProfile}
                        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-primary/25 bg-primary/5 text-[11px] font-bold text-primary"
                      >
                        <Save className="h-3.5 w-3.5" />
                        שמור נתוני מחשבון
                      </button>
                      {profileNotice ? (
                        <p className="mt-2 text-[10px] font-semibold text-ink">{profileNotice}</p>
                      ) : null}
                    </div>
                    ) : null}

                    {editingNutrition ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              קלוריות (kcal)
                            </label>
                            <input
                              type="number"
                              value={calTarget}
                              onChange={(e) => setCalTarget(Number(e.target.value))}
                              className="w-full rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              חלבון (g)
                            </label>
                            <input
                              type="number"
                              value={protTarget}
                              onChange={(e) => setProtTarget(Number(e.target.value))}
                              className="w-full rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSaveNutritionTargets}
                          className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>שמור יעד מותאם למתאמן</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-primary/5 p-2 border border-primary/10">
                          <span className="block text-[10px] text-muted-foreground">קלוריות</span>
                          <span className="font-bold text-ink">
                            {clientDetails?.nutritionTargets?.calories
                              ? `${clientDetails.nutritionTargets.calories} kcal`
                              : "לא הוגדר"}
                          </span>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                          <span className="block text-[10px] text-emerald-600">ימי מעקב</span>
                          <span className="font-bold text-emerald-800">
                            {clientDetails?.nutritionDays?.length || 0} ימים
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {showClientOverview ? (
                    /* Read-only Client Cardio History */
                    <div className="surface-card p-4 rounded-2xl space-y-3">
                      <div
                        id="coach-menu"
                        className="flex items-center justify-between border-b pb-2 scroll-mt-24"
                      >
                        <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-primary" /> היסטוריית אירובי
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {clientDetails?.cardioLogs?.length || 0} אימונים
                        </span>
                      </div>
                      {clientDetails?.cardioLogs?.length ? (
                        <div className="space-y-2">
                          {clientDetails.cardioLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-xs"
                            >
                              <div>
                                <p className="font-bold text-ink">{log.type}</p>
                                <p className="text-muted-foreground">
                                  {new Date(`${log.date}T00:00:00`).toLocaleDateString("he-IL")} ·{" "}
                                  {log.durationMin} דקות
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-primary">{log.calories} קל׳</p>
                                {log.distanceKm ? (
                                  <p className="text-[11px] text-muted-foreground">
                                    {log.distanceKm} ק״מ
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          עדיין לא נרשמו אימוני אירובי.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  role="alert"
                  className="surface-card space-y-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center"
                >
                  <h4 className="font-bold text-sm text-ink">לא ניתן לטעון את סביבת המתאמן</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {clientDetailsError || "אירעה שגיאה בטעינת התוכנית והתפריט."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedClientId) return;
                      setLoadingDetails(true);
                      void pullClientDataForCoach(selectedClientId).then((result) => {
                        applyClientDetails(result);
                        setLoadingDetails(false);
                      });
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                  >
                    נסי שוב
                  </button>
                </div>
              )}
            </div>
          </Overlay>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <Overlay
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            ariaLabel="שיוך מתאמן חדש"
          >
            <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-base text-ink flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> שיוך מתאמן חדש
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-ink font-bold text-sm px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {inviteMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-semibold border ${
                    inviteMsg.includes("בהצלחה")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {inviteMsg}
                </div>
              )}

              <form onSubmit={handleAddClient} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    אימייל המתאמן הרשום במערכת
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="client@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 cursor-pointer"
                >
                  שייך מתאמן לחשבוני
                </button>
              </form>
            </div>
          </Overlay>
        )}

        <Overlay
          open={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          ariaLabel="בחירת תרגיל"
          variant="full"
          backdrop={false}
          panelClassName="p-0"
        >
          <div dir="rtl" className="h-full max-h-full">
            <div className="flex h-full min-h-0 flex-col p-5 text-start">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                    ספריית תרגילים
                  </p>
                  <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                    {genderText(gender, "בחרי תרגיל", "בחר תרגיל")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExercisePicker(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-ink cursor-pointer"
                  aria-label="סגור"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="num-pill flex h-12 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={exerciseQuery}
                  onChange={(event) => setExerciseQuery(event.target.value)}
                  placeholder="חפש לפי שם, ציוד או שריר..."
                  className="w-full bg-transparent text-[14px] outline-none"
                  autoFocus
                />
              </div>
              <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
                {exerciseMuscleOptions.map((muscle) => (
                  <button
                    type="button"
                    key={muscle}
                    onClick={() => setExerciseMuscleFilter(muscle)}
                    className={`press shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      exerciseMuscleFilter === muscle
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openCreateExercise}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3.5 py-3 text-[13px] font-bold text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                הוספת תרגיל חדש למאגר
              </button>

              <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
                {visibleExerciseOptions.map((exercise) => (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() => {
                      setSelectedExId(exercise.id);
                      setExerciseQuery("");
                      setShowExercisePicker(false);
                    }}
                    className="press flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-secondary px-3.5 py-3 text-start hover:border-primary/50"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-primary">
                      <Dumbbell className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {exerciseDisplayName(exercise)}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{exercise.muscleGroup}</p>
                    </div>
                    <span className="num-pill shrink-0 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {exercise.equipment}
                    </span>
                  </button>
                ))}
                {visibleExerciseOptions.length === 0 ? (
                  <p className="rounded-2xl bg-secondary p-4 text-[13px] text-muted-foreground">
                    לא נמצאו תרגילים מתאימים לסינון או לחיפוש.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Overlay>

        <Overlay
          open={showCreateExercise}
          onClose={() => setShowCreateExercise(false)}
          ariaLabel="הוספת תרגיל חדש למאגר"
          variant="bottom"
          panelClassName="p-0"
        >
          <div dir="rtl" className="max-h-[88dvh] overflow-y-auto p-5 text-start">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  מאגר תרגילים
                </p>
                <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">
                  הוספת תרגיל חדש
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExercise(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-ink"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExercise} className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground">
                שם התרגיל
                <input
                  required
                  autoFocus
                  value={newExerciseDraft.name}
                  onChange={(event) =>
                    setNewExerciseDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="לדוגמה: לחיצת חזה במכונה"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-bold text-muted-foreground">
                  קבוצת שרירים
                  <input
                    required
                    value={newExerciseDraft.muscleGroup}
                    onChange={(event) =>
                      setNewExerciseDraft((current) => ({
                        ...current,
                        muscleGroup: event.target.value,
                        muscleGroups: [event.target.value],
                      }))
                    }
                    placeholder="חזה"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-xs font-bold text-muted-foreground">
                  ציוד
                  <input
                    required
                    value={newExerciseDraft.equipment}
                    onChange={(event) =>
                      setNewExerciseDraft((current) => ({
                        ...current,
                        equipment: event.target.value,
                      }))
                    }
                    placeholder="מכונה / משקוליות"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-muted-foreground">
                הוראות ביצוע (אופציונלי)
                <textarea
                  value={newExerciseDraft.instructions ?? ""}
                  onChange={(event) =>
                    setNewExerciseDraft((current) => ({
                      ...current,
                      instructions: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="הנחיות קצרות למתאמן"
                  className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              {newExerciseError ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {newExerciseError}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                שמירה ובחירת התרגיל לאימון
              </button>
            </form>
          </div>
        </Overlay>
      </div>
    </AppShell>
  );
}
