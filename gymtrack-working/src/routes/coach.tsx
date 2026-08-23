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
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Overlay } from "../components/ui-app/Overlay";
import {
  mealFoodFromLibrary,
  savePlannedMeals,
  saveProgram,
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
import type {
  BodyMeasurement,
  Meal,
  MealFood,
  Program,
  UserRole,
  Workout,
  WorkoutItem,
} from "../lib/gym-types";
import { genderText } from "../lib/gender-copy";

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
};

type ClientDetails = Awaited<ReturnType<typeof pullClientDataForCoach>>;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function profileDisplayName(profile?: { full_name?: string | null } | null): string {
  const name = profile?.full_name?.trim();
  return name || "שם לא הוגדר";
}

export const Route = createFileRoute("/coach")({
  component: () => <Outlet />,
});

export function CoachDashboardPage({
  clientsOnly = false,
  workspacePage = false,
  clientId,
}: {
  clientsOnly?: boolean;
  workspacePage?: boolean;
  clientId?: string;
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientWorkspace, setShowClientWorkspace] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [clientDetailsError, setClientDetailsError] = useState("");
  const [managementError, setManagementError] = useState("");
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);
  const [roleChangeNotice, setRoleChangeNotice] = useState("");
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

  // Coach Program & Day Builder state
  const [newProgramName, setNewProgramName] = useState("");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState("");

  // Exercise Assignment Editor state
  const [selectedExId, setSelectedExId] = useState("");
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [programQuery, setProgramQuery] = useState("");
  const [targetWeight, setTargetWeight] = useState(20);
  const [setsCount, setSetsCount] = useState(3);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(10);
  const [restSec, setRestSec] = useState(90);
  const [warmupEnabled, setWarmupEnabled] = useState(false);
  const [warmupSetsCount, setWarmupSetsCount] = useState(1);
  const [warmupReps, setWarmupReps] = useState(10);
  const [techNotes, setTechniqueNotes] = useState("");
  const [supersetGroup, setSupersetGroup] = useState("");
  const [dropSetEnabled, setDropSetEnabled] = useState(false);
  const [dropSetCount, setDropSetCount] = useState(1);
  const [approvedAltIds, setApprovedAltIds] = useState<string[]>([]);

  // Nutrition Prescription state
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [calTarget, setCalTarget] = useState(2000);
  const [protTarget, setProtTarget] = useState(140);
  const [menuDate, setMenuDate] = useState(todayKey());
  const [plannedMeals, setPlannedMeals] = useState<Meal[]>([]);
  const [menuFoodMealId, setMenuFoodMealId] = useState<string | null>(null);
  const [menuFoodId, setMenuFoodId] = useState("");
  const [menuFoodQuery, setMenuFoodQuery] = useState("");
  const [menuFoodQuantity, setMenuFoodQuantity] = useState(1);
  const [menuNotice, setMenuNotice] = useState("");
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

  useEffect(() => {
    if (isCoach) {
      loadCoachClients();
    }
    if (isOwner) {
      loadAllProfilesForOwner();
    }
  }, [isCoach, isOwner, loadAllProfilesForOwner, loadCoachClients]);

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
    if (!workspacePage || !clientId) return;
    setSelectedClientId(clientId);
    setShowClientWorkspace(true);
  }, [workspacePage, clientId]);

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
    setCalTarget(clientDetails?.nutritionTargets.calories ?? 2000);
  }, [clientDetails]);

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
        throw new Error("משתמש לא נמצא. יש לוודא שהמתאמן נרשם ל-My Routine בכתובת זו.");
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
    if (!selectedClientId || !newProgramName.trim()) return;

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

    if (!error) {
      setNewProgramName("");
      pullClientDataForCoach(selectedClientId).then(applyClientDetails);
    }
  };

  // Add Program Day for Client
  const handleAddProgramDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !editingProgramId || !newDayName.trim()) return;

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

    if (!error) {
      setNewDayName("");
      pullClientDataForCoach(selectedClientId).then(applyClientDetails);
    }
  };

  // Assign Prescribed Exercise to Program Day
  const handleAddExerciseToDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !editingDayId || !selectedExId) return;

    const currentDay = clientDetails?.workouts?.find((w) => w.id === editingDayId);
    if (!currentDay) return;

    const newWorkoutItem: WorkoutItem = {
      id: uid(),
      exerciseId: selectedExId,
      sets: setsCount,
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
      ...(supersetGroup.trim() ? { supersetId: supersetGroup.trim() } : {}),
      ...(dropSetEnabled
        ? { dropSetConfig: { enabled: true, drops: dropSetCount, percentReduction: 20 } }
        : {}),
      workingSets: Array.from({ length: setsCount }, (_, i) => ({
        id: uid(),
        setNumber: i + 1,
        weight: targetWeight,
        reps: repMin,
        repMax,
      })),
      ...(warmupEnabled
        ? {
            warmups: Array.from({ length: warmupSetsCount }, (_, i) => ({
              id: uid(),
              weight: 0,
              reps: warmupReps,
            })),
          }
        : {}),
    };

    const updatedItems = [...currentDay.items, newWorkoutItem];

    if (isSelfSelected) {
      saveWorkout({ ...currentDay, items: updatedItems });
      setSelectedExId("");
      setTechniqueNotes("");
      setSupersetGroup("");
      setDropSetEnabled(false);
      setApprovedAltIds([]);
      return;
    }

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", editingDayId);

    if (!error) {
      setSelectedExId("");
      setTechniqueNotes("");
      setSupersetGroup("");
      setDropSetEnabled(false);
      setApprovedAltIds([]);
      pullClientDataForCoach(selectedClientId).then(applyClientDetails);
    }
  };

  // Delete exercise from day
  const handleRemoveExerciseFromDay = async (dayId: string, itemId: string) => {
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

    if (!error) {
      pullClientDataForCoach(selectedClientId!).then(applyClientDetails);
    }
  };

  // Save Nutrition Targets for Client
  const handleSaveNutritionTargets = async () => {
    if (!selectedClientId) return;
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("nutrition_days").upsert({
      id: `${selectedClientId}_${today}`,
      user_id: selectedClientId,
      date: today,
      target_calories: calTarget,
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setEditingNutrition(false);
      const refreshed = await pullClientDataForCoach(selectedClientId);
      applyClientDetails(refreshed);
    }
  };

  const addPlannedMeal = () => {
    setPlannedMeals((current) => [
      ...current,
      { id: uid(), name: `ארוחה ${current.length + 1}`, foods: [] },
    ]);
  };

  const addPlannedFood = (mealId: string) => {
    const food = store.foods.find((item) => item.id === menuFoodId);
    if (!food || menuFoodQuantity <= 0) return;
    const plannedFood: MealFood = {
      ...mealFoodFromLibrary(food),
      quantity: menuFoodQuantity,
    };
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, plannedFood] } : meal,
      ),
    );
    setMenuFoodMealId(null);
    setMenuFoodId("");
    setMenuFoodQuery("");
    setMenuFoodQuantity(1);
  };

  const removePlannedFood = (mealId: string, foodId: string) => {
    setPlannedMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
          : meal,
      ),
    );
  };

  const savePlannedMenu = async () => {
    if (!selectedClientId || plannedMeals.length === 0) return;
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
       ...(existingDay ? {} : { target_calories: calTarget }),
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

  const filteredClients = clients.filter((c) => {
    const emailStr = (c.profiles?.email || "").toLowerCase();
    const nameStr = (c.profiles?.full_name || "").toLowerCase();
    const q = clientSearch.toLowerCase();
    return !q || emailStr.includes(q) || nameStr.includes(q);
  });

  const selectedClientInfo = clients.find((c) => c.client_id === selectedClientId);
  const filteredExerciseOptions = useMemo(() => {
    const query = exerciseQuery.trim().toLocaleLowerCase();
    if (!query) return store.exercises;
    return store.exercises.filter((exercise) =>
      [exercise.name, exercise.muscleGroup, exercise.equipment]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [exerciseQuery, store.exercises]);
  const filteredPrograms = useMemo(() => {
    const query = programQuery.trim().toLocaleLowerCase();
    if (!query) return clientDetails?.programs ?? [];
    return (clientDetails?.programs ?? []).filter((program) =>
      program.name.toLocaleLowerCase().includes(query),
    );
  }, [clientDetails?.programs, programQuery]);
  const menuFoodResults = searchFoods(store.foods, menuFoodQuery).slice(0, 24);
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
  const openClientFromOverview = (clientId: string) => {
    if (!workspacePage) {
      navigate({ to: "/coach/clients/$clientId", params: { clientId } });
      return;
    }
    setSelectedClientId(clientId);
    setShowClientWorkspace(true);
    setEditingProgramId(null);
    setEditingDayId(null);
  };

  return (
      <AppShell
      title={clientsOnly ? "מתאמנים" : "בית"}
      kicker={clientsOnly ? "בניית תוכניות ותפריטים" : "לוח מודעות"}
      action={
        clientsOnly ? (
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-bold text-primary">
            עדכון תוכניות
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-bold text-primary shadow-xs transition-colors hover:bg-primary/10"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>הוסף מתאמן</span>
            </button>
            <Link
              to="/coach/clients"
              className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
            >
              <Users className="h-3.5 w-3.5" />
              <span>המתאמנים</span>
            </Link>
          </div>
        )
      }
    >
      {!clientsOnly ? (
        <section className="space-y-4 text-start">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              {isOwner ? "לוח מודעות לבעלים" : "לוח מודעות למאמן"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
              מה חשוב לדעת היום?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isOwner
                ? "תמונת מצב של המועדון, המשתמשים והפעולות שדורשות את תשומת ליבך."
                : "עדכונים קצרים ופעולות שממתינות לך במרחב הניהול."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="surface-card border-primary/25 bg-primary/5 p-3 text-start">
              <p className="text-[11px] font-bold text-muted-foreground">מתאמנים</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-ink">{clients.length}</p>
            </div>
            <div className="surface-card border-accent/60 bg-accent/20 p-3 text-start">
              <p className="text-[11px] font-bold text-muted-foreground">דורשים תכנית</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                {needsPlan.length}
              </p>
            </div>
            <div className="surface-card border-border bg-surface-2 p-3 text-start">
              <p className="text-[11px] font-bold text-muted-foreground">שקטים 14 יום</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                {quietClients.length}
              </p>
            </div>
            {isOwner ? (
              <div className="surface-card border-purple-200 bg-purple-50/70 p-3 text-start">
                <p className="text-[11px] font-bold text-purple-700">משתמשים</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-purple-950">
                  {allProfiles.length}
                </p>
              </div>
            ) : null}
          </div>

          <div className="surface-card border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Shield className="h-4 w-4 text-primary" />
                  {isOwner ? "מרכז שליטה" : "מרכז הפעילות"}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {isOwner
                    ? "מכאן אפשר לעבור לרשימת המתאמנים, לפתוח סביבת עבודה ולנהל תפקידים."
                    : "פתחי מתאמן כדי לערוך עבורו את תוכנית האימונים והתפריט המתוכנן."}
                </p>
              </div>
              <Link
                to="/coach/clients"
                className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground shadow-sm"
              >
                לרשימת המתאמנים
              </Link>
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
                <h3 className="font-bold text-sm text-purple-950">
                  ניהול משתמשים והרשאות בעלים
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                {allProfiles.length} משתמשים במערכת
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs text-purple-900 font-semibold">משתמשים והרשאות תפקיד:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {allProfiles.map((p) => {
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
                        <span className="font-bold text-ink">
                          {profileDisplayName(p)}
                        </span>
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
            <section className="overflow-hidden rounded-[1.75rem] bg-ink p-5 text-primary-foreground shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/65">
                      סביבת בנייה
                    </p>
                    <h3 className="mt-1 font-display text-lg font-extrabold">בונים עבור מתאמן</h3>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-primary-foreground/75">
                      {genderText(
                        gender,
                        "בחרי מתאמן כדי לבנות תוכנית אימונים, ימים, תרגילים ותפריט אישי.",
                        "בחר מתאמן כדי לבנות תוכנית אימונים, ימים, תרגילים ותפריט אישי.",
                      )}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-bold">
                  {clients.length} מתאמנים
                </span>
              </div>
            </section>

            {/* Client Search & List */}
            <section className="space-y-3 rounded-3xl border border-border/70 bg-surface p-4 shadow-sm">
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

              {authUser && !clientsOnly ? (
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
                      <span className="block text-sm font-bold text-ink">התכנית האישית שלי</span>
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

              {filteredClients.length === 0 ? (
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
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredClients.map((c) => {
                    const isSelected = c.client_id === selectedClientId;
                    const nameStr = profileDisplayName(c.profiles);

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (!isSelected) {
                            navigate({
                              to: "/coach/clients/$clientId",
                              params: { clientId: c.client_id },
                            });
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
                            to="/coach/clients/$clientId"
                            params={{ clientId: c.client_id }}
                            onClick={(event) => event.stopPropagation()}
                            className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                          >
                            פתח וערוך
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
              )}
            </section>
          </>
        ) : null}

        {/* Selected Client Full Coach Workspace */}
        {selectedClientId && showClientWorkspace && (
          <Overlay
            open={showClientWorkspace}
            onClose={() => {
              if (workspacePage) {
                navigate({ to: "/coach/clients" });
                return;
              }
              setShowClientWorkspace(false);
              setSelectedClientId(null);
              setEditingProgramId(null);
              setEditingDayId(null);
            }}
            ariaLabel="בניית תוכנית ותפריט למתאמן"
            variant={workspacePage ? "full" : "center"}
            className={workspacePage ? "bg-background" : ""}
            panelClassName={workspacePage ? "bg-background" : ""}
          >
            <div
              className={`w-full space-y-4 bg-background p-4 sm:p-6 ${
                workspacePage ? "mx-auto max-w-5xl pb-10" : "max-w-2xl rounded-3xl shadow-2xl"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-base text-ink flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>תכנית המתאמן:</span>
                  <span className="text-primary font-extrabold">
                    {isSelfSelected
                      ? "התכנית האישית שלי"
                        : profileDisplayName(selectedClientInfo?.profiles)}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (workspacePage) {
                      navigate({ to: "/coach/clients" });
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

              {workspacePage && clientDetails ? (
                <>
                  <section className="rounded-3xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                          סביבת עריכה אישית
                        </p>
                        <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                          {isSelfSelected
                            ? "התוכנית והתפריט שלי"
                            : `בונים עבור ${profileDisplayName(selectedClientInfo?.profiles)}`}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          עדכון מרוכז של האימונים, ימי האימון, התרגילים והתפריט המתוכנן.
                        </p>
                      </div>
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-2xl bg-white/80 p-2">
                        <span className="block text-[10px] text-muted-foreground">תוכניות</span>
                        <strong className="mt-0.5 block text-sm text-ink">
                          {clientDetails.programs?.length || 0}
                        </strong>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-2">
                        <span className="block text-[10px] text-muted-foreground">ימי אימון</span>
                        <strong className="mt-0.5 block text-sm text-ink">
                          {clientDetails.workouts?.length || 0}
                        </strong>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-2">
                        <span className="block text-[10px] text-muted-foreground">קלוריות</span>
                        <strong className="mt-0.5 block text-sm text-ink">
                          {clientDetails.nutritionTargets?.calories || 2000}
                        </strong>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-2">
                        <span className="block text-[10px] text-muted-foreground">ימי תפריט</span>
                        <strong className="mt-0.5 block text-sm text-ink">
                          {clientDetails.nutritionDays?.length || 0}
                        </strong>
                      </div>
                    </div>
                  </section>
                  <nav
                    aria-label="ניווט בסביבת העריכה"
                    className="sticky top-2 z-10 grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-sm backdrop-blur"
                  >
                    <a
                      href="#coach-programs"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground"
                    >
                      <Dumbbell className="h-3.5 w-3.5" />
                      תוכנית אימונים
                    </a>
                    <a
                      href="#coach-nutrition"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800"
                    >
                      <Apple className="h-3.5 w-3.5" />
                      תפריט ותזונה
                    </a>
                  </nav>
                </>
              ) : null}

              {loadingDetails ? (
                <div className="surface-card p-6 text-center text-xs text-muted-foreground animate-pulse">
                  טוען נתוני מתאמן מ-Supabase...
                </div>
              ) : clientDetails ? (
                <div className="space-y-4">
                  {!workspacePage ? (
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
                                    step="0.1"
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

                  {/* Client Programs & Full Exercise Prescription Builder */}
                  <div
                    id="coach-programs"
                    className="scroll-mt-24 surface-card space-y-4 rounded-[1.75rem] border-primary/15 bg-primary/[0.02] p-4"
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
                                <span className="block truncate font-display text-[15px] font-semibold text-ink">
                                  {prog.name}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                                  {progDays?.length || 0} ימי אימון ·{" "}
                                  {progDays?.reduce((total, day) => total + day.items.length, 0) || 0} תרגילים
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
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-[13px] text-ink">
                                            {dayItem.name} ({dayItem.items?.length || 0} תרגילים)
                                          </span>
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

                                              return (
                                                <div
                                                  key={exItem.id}
                                                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-xs"
                                                >
                                                  <div>
                                                    <span className="font-bold text-ink">
                                                      {exMeta?.name || "תרגיל"}
                                                    </span>
                                                    <span className="text-muted-foreground mr-1">
                                                      · {exItem.targetWeight || exItem.weight} ק"ג ·{" "}
                                                      {exItem.sets}×{exItem.repMin || exItem.reps}
                                                      {exItem.repMax ? `-${exItem.repMax}` : ""}
                                                    </span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                      {exItem.warmups?.length ? (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                          חימום ×{exItem.warmups.length}
                                                        </span>
                                                      ) : null}
                                                      {exItem.dropSetConfig?.enabled ? (
                                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                          דרופ סט ×{exItem.dropSetConfig.drops}
                                                        </span>
                                                      ) : null}
                                                      {exItem.supersetId ? (
                                                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                                                          סופר סט {exItem.supersetId}
                                                        </span>
                                                      ) : null}
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() =>
                                                      handleRemoveExerciseFromDay(
                                                        dayItem.id,
                                                        exItem.id,
                                                      )
                                                    }
                                                    className="text-muted-foreground hover:text-red-600 p-1 cursor-pointer"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {isDayActive && (
                                          <form
                                            onSubmit={handleAddExerciseToDay}
                                            className="pt-2 border-t border-border/40 space-y-2 text-xs"
                                          >
                                            <div>
                                              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                                בחר תרגיל מספרייה
                                              </label>
                                               <input
                                                 type="search"
                                                 value={exerciseQuery}
                                                 onChange={(e) => setExerciseQuery(e.target.value)}
                                                 placeholder="חיפוש לפי שם, שריר או ציוד..."
                                                 className="mb-1.5 w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                                                 aria-label="חיפוש תרגיל לפי שם, שריר או ציוד"
                                                 autoComplete="off"
                                               />
                                              <select
                                                required
                                                value={selectedExId}
                                                onChange={(e) => setSelectedExId(e.target.value)}
                                                className="w-full rounded-lg border border-border px-2 py-1.5 text-xs outline-none"
                                              >
                                                <option value="">-- בחר תרגיל --</option>
                                                 {filteredExerciseOptions.length > 0 ? (
                                                   filteredExerciseOptions.map((e) => (
                                                     <option key={e.id} value={e.id}>
                                                       {e.name} ({e.muscleGroup})
                                                     </option>
                                                   ))
                                                 ) : (
                                                   <option value="" disabled>
                                                     לא נמצאו תרגילים
                                                   </option>
                                                 )}
                                              </select>
                                               <p className="mt-1 text-[10px] text-muted-foreground">
                                                 {filteredExerciseOptions.length} תרגילים נמצאו
                                               </p>
                                            </div>

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

                                            <div className="grid gap-2 sm:grid-cols-3">
                                              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">
                                                <input
                                                  type="checkbox"
                                                  checked={warmupEnabled}
                                                  onChange={(event) => setWarmupEnabled(event.target.checked)}
                                                  className="h-4 w-4 accent-amber-600"
                                                />
                                                <span>סט חימום</span>
                                              </label>
                                              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary">
                                                <input
                                                  type="checkbox"
                                                  checked={dropSetEnabled}
                                                  onChange={(event) => setDropSetEnabled(event.target.checked)}
                                                  className="h-4 w-4 accent-primary"
                                                />
                                                <span>דרופ סט</span>
                                              </label>
                                              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-900">
                                                <input
                                                  type="checkbox"
                                                  checked={Boolean(supersetGroup)}
                                                  onChange={(event) =>
                                                    setSupersetGroup(event.target.checked ? "A" : "")
                                                  }
                                                  className="h-4 w-4 accent-violet-600"
                                                />
                                                <span>סופר סט</span>
                                              </label>
                                            </div>

                                            {warmupEnabled || dropSetEnabled || supersetGroup ? (
                                              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background p-3">
                                                {warmupEnabled ? (
                                                  <>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      מספר סטי חימום
                                                      <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        value={warmupSetsCount}
                                                        onChange={(event) =>
                                                          setWarmupSetsCount(Math.max(1, Number(event.target.value)))
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                    <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                      חזרות חימום
                                                      <input
                                                        type="number"
                                                        min="1"
                                                        value={warmupReps}
                                                        onChange={(event) =>
                                                          setWarmupReps(Math.max(1, Number(event.target.value)))
                                                        }
                                                        className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                      />
                                                    </label>
                                                  </>
                                                ) : null}
                                                {dropSetEnabled ? (
                                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                    מספר דרופים
                                                    <input
                                                      type="number"
                                                      min="1"
                                                      max="5"
                                                      value={dropSetCount}
                                                      onChange={(event) =>
                                                        setDropSetCount(Math.max(1, Number(event.target.value)))
                                                      }
                                                      className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                    />
                                                  </label>
                                                ) : null}
                                                {supersetGroup ? (
                                                  <label className="grid gap-1 text-[10px] font-bold text-muted-foreground">
                                                    קבוצה
                                                    <input
                                                      value={supersetGroup}
                                                      onChange={(event) => setSupersetGroup(event.target.value)}
                                                      placeholder="A"
                                                      className="h-9 rounded-lg border border-border bg-white px-2 text-center text-xs"
                                                    />
                                                  </label>
                                                ) : null}
                                              </div>
                                            ) : null}

                                            <button
                                              type="submit"
                                              className="w-full rounded-lg bg-primary py-1.5 font-bold text-white shadow-xs cursor-pointer"
                                            >
                                              שמור תרגיל ליום אימון
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
                  <div className="surface-card space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
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

                    <div className="space-y-2">
                      {plannedMeals.map((meal) => (
                        <div
                          key={meal.id}
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
                                    {food.name} · כמות {food.quantity}
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
                                      onClick={() => setMenuFoodId(food.id)}
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
                              <div className="flex items-end gap-1.5">
                                <label className="flex-1 text-[10px] font-bold text-muted-foreground">
                                  כמות
                                  <input
                                    type="number"
                                    min="0.25"
                                    step="0.25"
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
                      ))}
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
                    className="scroll-mt-24 surface-card space-y-4 rounded-[1.75rem] border-emerald-200/70 bg-emerald-50/30 p-4"
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
                            {clientDetails?.nutritionTargets.calories || 2000} kcal
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

                  {!workspacePage ? (
                    /* Read-only Client Cardio History */
                    <div className="surface-card p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
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
      </div>
    </AppShell>
  );
}
