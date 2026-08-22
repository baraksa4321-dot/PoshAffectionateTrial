import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { uid, useGym } from "../lib/gym-store";
import { pullClientDataForCoach } from "../lib/supabase-sync";
import { supabase } from "../lib/supabase";
import type { WorkoutItem } from "../lib/gym-types";

export const Route = createFileRoute("/coach")({
  component: CoachDashboardPage,
});

function CoachDashboardPage() {
  const store = useGym();
  const role = store.userProfile?.role || "client";
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;

  const [clients, setClients] = useState<any[]>(store.clients || []);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

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
  const [targetWeight, setTargetWeight] = useState(20);
  const [setsCount, setSetsCount] = useState(3);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(10);
  const [restSec, setRestSec] = useState(90);
  const [techNotes, setTechniqueNotes] = useState("");
  const [supersetGroup, setSupersetGroup] = useState("");
  const [dropSetEnabled, setDropSetEnabled] = useState(false);
  const [dropSetCount, setDropSetCount] = useState(1);
  const [approvedAltIds, setApprovedAltIds] = useState<string[]>([]);

  // Nutrition Prescription state
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [calTarget, setCalTarget] = useState(2000);
  const [protTarget, setProtTarget] = useState(140);

  const loadCoachClients = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("coach_clients")
      .select(
        "id, client_id, created_at, profiles!coach_clients_client_id_fkey(email, full_name, weight_kg)",
      )
      .eq("coach_id", user.id);

    if (data) {
      setClients(data);
    }
  };

  const loadAllProfilesForOwner = async () => {
    if (!isOwner) return;
    const { data } = await supabase.from("profiles").select("*");
    if (data) {
      setAllProfiles(data);
    }
  };

  useEffect(() => {
    if (isCoach) {
      loadCoachClients();
    }
    if (isOwner) {
      loadAllProfilesForOwner();
    }
  }, [isCoach, isOwner]);

  useEffect(() => {
    if (!selectedClientId) {
      setClientDetails(null);
      return;
    }

    setLoadingDetails(true);
    pullClientDataForCoach(selectedClientId).then((res) => {
      setClientDetails(res);
      setLoadingDetails(false);
    });
  }, [selectedClientId]);

  // OWNER RPC: Promote or Demote Role
  const handleOwnerChangeRole = async (targetUserId: string, newRole: "coach" | "client") => {
    try {
      const { error } = await supabase.rpc("change_user_role", {
        target_user_id: targetUserId,
        new_role: newRole,
      });

      if (error) throw error;
      loadAllProfilesForOwner();
      alert(`תפקיד המשתמש עודכן בהצלחה ל-${newRole === "coach" ? "מאמן" : "מתאמן"}`);
    } catch (err: any) {
      alert(err?.message || "שגיאה בשינוי תפקיד");
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
    } catch (err: any) {
      setInviteMsg(err?.message || "אירעה שגיאה בשיוך המתאמן");
    }
  };

  // Remove Client
  const handleRemoveClient = async (linkId: string) => {
    if (!confirm("האם למחוק את המתאמן מלוח הבקרה שלך?")) return;

    await supabase.from("coach_clients").delete().eq("id", linkId);
    if (selectedClientId === clients.find((c) => c.id === linkId)?.client_id) {
      setSelectedClientId(null);
    }
    loadCoachClients();
  };

  // Create Program for Client
  const handleCreateClientProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newProgramName.trim()) return;

    const programId = uid();
    const { error } = await supabase.from("programs").insert({
      id: programId,
      user_id: selectedClientId,
      name: newProgramName.trim(),
      description: "תוכנית נבנתה על ידי המאמן",
    });

    if (!error) {
      setNewProgramName("");
      pullClientDataForCoach(selectedClientId).then(setClientDetails);
    }
  };

  // Add Program Day for Client
  const handleAddProgramDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !editingProgramId || !newDayName.trim()) return;

    const dayId = uid();
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
      pullClientDataForCoach(selectedClientId).then(setClientDetails);
    }
  };

  // Assign Prescribed Exercise to Program Day
  const handleAddExerciseToDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !editingDayId || !selectedExId) return;

    const currentDay = clientDetails?.workouts?.find((w: any) => w.id === editingDayId);
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
      techniqueNotes: techNotes.trim() || undefined,
      approvedAlternatives: approvedAltIds.length > 0 ? approvedAltIds : undefined,
      supersetId: supersetGroup.trim() || undefined,
      dropSetConfig: dropSetEnabled
        ? { enabled: true, drops: dropSetCount, percentReduction: 20 }
        : undefined,
      workingSets: Array.from({ length: setsCount }, (_, i) => ({
        id: uid(),
        setNumber: i + 1,
        weight: targetWeight,
        reps: repMin,
        repMax,
      })),
    };

    const updatedItems = [...currentDay.items, newWorkoutItem];

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
      pullClientDataForCoach(selectedClientId).then(setClientDetails);
    }
  };

  // Delete exercise from day
  const handleRemoveExerciseFromDay = async (dayId: string, itemId: string) => {
    const currentDay = clientDetails?.workouts?.find((w: any) => w.id === dayId);
    if (!currentDay) return;

    const updatedItems = currentDay.items.filter((i: any) => i.id !== itemId);

    const { error } = await supabase
      .from("program_days")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", dayId);

    if (!error) {
      pullClientDataForCoach(selectedClientId!).then(setClientDetails);
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
      pullClientDataForCoach(selectedClientId).then(setClientDetails);
    }
  };

  if (!isCoach) {
    return (
      <AppShell title="דשבורד מאמן" kicker="מאמנים וצוות מקצועי">
        <div className="surface-card p-6 text-center space-y-4 rounded-3xl mt-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">גישת מאמן מוגבלת</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            חשבונך מוגדר כחבר/מתאמן (Client). דשבורד זה מיועד למאמנים אישיים בלבד לניהול תוכניות
            ותזונת מתאמנים.
          </p>
        </div>
      </AppShell>
    );
  }

  const filteredClients = clients.filter((c) => {
    const emailStr = (c.profiles?.email || "").toLowerCase();
    const nameStr = (c.profiles?.full_name || "").toLowerCase();
    const q = clientSearch.toLowerCase();
    return !q || emailStr.includes(q) || nameStr.includes(q);
  });

  const selectedClientInfo = clients.find((c) => c.client_id === selectedClientId);

  return (
    <AppShell
      title={isOwner ? "ניהול מערכת ובעלים" : "לוח בקרה למאמן"}
      subtitle="ניהול תוכניות אימון, תזונה, הרשאות ומעקב מתאמנים"
      kicker={isOwner ? "בעלי הפלטפורמה" : "מאמן מוסמך"}
      action={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>הוסף מתאמן</span>
        </button>
      }
    >
      <div className="space-y-5 text-start">
        {/* Owner Management Section */}
        {isOwner && (
          <div className="surface-card p-5 rounded-3xl space-y-3 bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-sm text-purple-950">
                  אזור ניהול בעלים (Owner Management)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                {allProfiles.length} משתמשים במערכת
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs text-purple-900 font-semibold">משתמשים והרשאות תפקיד:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {allProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs border border-purple-100"
                  >
                    <div>
                      <span className="font-bold text-ink">{p.full_name || p.email}</span>
                      <span className="text-muted-foreground mr-1">({p.role || "client"})</span>
                    </div>

                    {p.role !== "owner" && (
                      <div className="flex items-center gap-1">
                        {p.role === "client" ? (
                          <button
                            onClick={() => handleOwnerChangeRole(p.id, "coach")}
                            className="rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-200 cursor-pointer"
                          >
                            הפוך למאמן
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOwnerChangeRole(p.id, "client")}
                            className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
                          >
                            הסר הרשאת מאמן
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coach Header Banner */}
        <div className="surface-card p-5 rounded-3xl space-y-3 bg-linear-to-br from-rose-50/60 to-primary/5 border border-primary/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink">לוח מאמן פעיל</h3>
                <p className="text-xs text-muted-foreground">
                  {clients.length} מתאמנים רשומים תחת לוח זה
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <UserCheck className="h-3 w-3" /> מחובר כמאמן
            </span>
          </div>
        </div>

        {/* Coach "Needs Attention" Panel */}
        <div className="surface-card p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-start">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-700" /> דורש תשומת לב (Needs Attention)
            </h4>
            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
              2 התראות פעילות
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="rounded-xl bg-white p-2.5 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink">נועה שחר:</span>
                <span className="text-muted-foreground mr-1">
                  דיווחה אי-נוחות בכתף בסט האחרון של הלחיצה
                </span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                כאב/אי נוחות
              </span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink">דניאל לוי:</span>
                <span className="text-muted-foreground mr-1">
                  עדכן שקילה שבועית חדשה (+0.8 ק"ג)
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                שקילה שבועית
              </span>
            </div>
          </div>
        </div>

        {/* Client Search & List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> רשימת המתאמנים שלי
            </h3>
          </div>

          <div className="num-pill flex h-10 items-center gap-2 px-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="סינון מתאמנים לפי שם או אימייל..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="surface-card p-6 text-center text-muted-foreground rounded-2xl text-xs space-y-2">
              <p>לא נמצאו מתאמנים רשומים.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                לחצי כאן להוספת מתאמן לפי אימייל
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredClients.map((c) => {
                const isSelected = c.client_id === selectedClientId;
                const emailStr = c.profiles?.email || "מתאמן";
                const nameStr = c.profiles?.full_name || emailStr.split("@")[0];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClientId(isSelected ? null : c.client_id);
                      setEditingProgramId(null);
                      setEditingDayId(null);
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
                        <p className="text-xs text-muted-foreground">{emailStr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClient(c.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="הסר מתאמן"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
        </div>

        {/* Selected Client Full Coach Workspace */}
        {selectedClientId && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <span>תיק מתאמן:</span>
                <span className="text-primary font-extrabold">
                  {selectedClientInfo?.profiles?.full_name || selectedClientInfo?.profiles?.email}
                </span>
              </h3>
            </div>

            {loadingDetails ? (
              <div className="surface-card p-6 text-center text-xs text-muted-foreground animate-pulse">
                טוען נתוני מתאמן מ-Supabase...
              </div>
            ) : (
              <div className="space-y-4">
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

                {/* Client Programs & Full Exercise Prescription Builder */}
                <div className="surface-card p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                      <Dumbbell className="h-4 w-4 text-primary" /> בונה התוכניות והאימונים למתאמן
                    </h4>
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

                  <div className="space-y-3 pt-2">
                    {clientDetails?.programs?.map((prog: any) => {
                      const isProgActive = editingProgramId === prog.id;
                      const progDays = clientDetails?.workouts?.filter((w: any) =>
                        prog.dayIds?.includes(w.id),
                      );

                      return (
                        <div
                          key={prog.id}
                          className="rounded-2xl border border-border/70 p-3 space-y-2.5 bg-muted/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-ink">{prog.name}</span>
                            <button
                              onClick={() => setEditingProgramId(isProgActive ? null : prog.id)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>{isProgActive ? "סגור עריכה" : "נהל ימי אימון"}</span>
                            </button>
                          </div>

                          {isProgActive && (
                            <div className="space-y-3 pt-2 border-t border-border/40">
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
                                {progDays?.map((dayItem: any) => {
                                  const isDayActive = editingDayId === dayItem.id;

                                  return (
                                    <div
                                      key={dayItem.id}
                                      className="rounded-xl bg-white p-3 border border-border/60 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-ink">
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
                                          {dayItem.items.map((exItem: any) => {
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
                                            <select
                                              required
                                              value={selectedExId}
                                              onChange={(e) => setSelectedExId(e.target.value)}
                                              className="w-full rounded-lg border border-border px-2 py-1.5 text-xs outline-none"
                                            >
                                              <option value="">-- בחר תרגיל --</option>
                                              {store.exercises.map((e) => (
                                                <option key={e.id} value={e.id}>
                                                  {e.name} ({e.muscleGroup})
                                                </option>
                                              ))}
                                            </select>
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
                                                onChange={(e) => setRepMin(Number(e.target.value))}
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
                                                onChange={(e) => setRepMax(Number(e.target.value))}
                                                className="w-full rounded-md border p-1 text-center"
                                              />
                                            </div>
                                          </div>

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

                {/* Client Nutrition Targets Editor */}
                <div className="surface-card p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                      <Apple className="h-4 w-4 text-primary" /> יעד קלורי ותזונה למתאמן
                    </h4>
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
                          {clientDetails?.nutritionDays?.[0]?.target_calories || 2000} kcal
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
              </div>
            )}
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
