import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

type SmokeClient = SupabaseClient;

type SmokeConfig = {
  url: string;
  anonKey: string;
  coachEmail: string;
  coachPassword: string;
  traineeEmail: string;
  traineePassword: string;
  timeoutMs: number;
};

type AuthenticatedUser = {
  id: string;
  email?: string;
};

type PageSnapshot = {
  programName: string;
  workoutName: string;
  menuName: string;
  coachMessages: Array<Record<string, unknown>>;
  pendingOfflineEdit: string;
};

const configKeys = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "GYMTRACK_SMOKE_COACH_EMAIL",
  "GYMTRACK_SMOKE_COACH_PASSWORD",
  "GYMTRACK_SMOKE_TRAINEE_EMAIL",
  "GYMTRACK_SMOKE_TRAINEE_PASSWORD",
] as const;

function requiredEnv(key: (typeof configKeys)[number]): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required smoke configuration: ${key}`);
  return value;
}

function loadConfig(): SmokeConfig {
  if (process.env.GYMTRACK_SMOKE_ALLOW_LIVE !== "true") {
    throw new Error(
      "Live smoke is guarded. Set GYMTRACK_SMOKE_ALLOW_LIVE=true with test-only accounts to run it.",
    );
  }

  const rawTimeout = Number(process.env.GYMTRACK_SMOKE_TIMEOUT_MS ?? "30000");
  if (!Number.isFinite(rawTimeout) || rawTimeout < 5000) {
    throw new Error("GYMTRACK_SMOKE_TIMEOUT_MS must be at least 5000 milliseconds.");
  }

  return {
    url: requiredEnv("VITE_SUPABASE_URL"),
    anonKey: requiredEnv("VITE_SUPABASE_ANON_KEY"),
    coachEmail: requiredEnv("GYMTRACK_SMOKE_COACH_EMAIL"),
    coachPassword: requiredEnv("GYMTRACK_SMOKE_COACH_PASSWORD"),
    traineeEmail: requiredEnv("GYMTRACK_SMOKE_TRAINEE_EMAIL"),
    traineePassword: requiredEnv("GYMTRACK_SMOKE_TRAINEE_PASSWORD"),
    timeoutMs: rawTimeout,
  };
}

function redact(value: string, config: SmokeConfig): string {
  let safe = value;
  for (const secret of [
    config.anonKey,
    config.coachPassword,
    config.traineePassword,
    config.coachEmail,
    config.traineeEmail,
  ]) {
    if (secret) safe = safe.replaceAll(secret, "[redacted]");
  }
  return safe.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]");
}

function errorMessage(error: unknown, config: SmokeConfig): string {
  if (error instanceof Error) return redact(error.message, config);
  if (typeof error === "string") return redact(error, config);
  return "Unknown smoke failure";
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { code?: unknown; status?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  if (typeof candidate.status === "number") return String(candidate.status);
  return undefined;
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) throw new Error(`Timed out waiting for ${label}.`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function signIn(
  client: SmokeClient,
  email: string,
  password: string,
  roleLabel: "coach" | "trainee",
): Promise<AuthenticatedUser> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const code = errorCode(error);
    throw new Error(
      `Could not authenticate the ${roleLabel} test account${code ? ` (${code})` : ""}.`,
    );
  }
  assertCondition(data.user?.id, `The ${roleLabel} test account returned no authenticated user.`);
  return { id: data.user.id, ...(data.user.email ? { email: data.user.email } : {}) };
}

async function readProfile(
  client: SmokeClient,
  userId: string,
  label: "coach" | "trainee",
): Promise<Record<string, unknown>> {
  const { data, error } = await client
    .from("profiles")
    .select("id, role, coach_id, approval_status, planned_menu")
    .eq("id", userId)
    .single();
  if (error)
    throw new Error(
      `Could not read the ${label} profile${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  assertCondition(data, `The ${label} account has no profile row.`);
  return data as Record<string, unknown>;
}

async function readTraineePage(
  traineeClient: SmokeClient,
  traineeId: string,
  programId: string,
  dayId: string,
  pendingOfflineEdit: string,
): Promise<PageSnapshot> {
  const [profileResult, programResult, dayResult, coachMessagesResult] = await Promise.all([
    traineeClient.from("profiles").select("planned_menu").eq("id", traineeId).single(),
    traineeClient
      .from("programs")
      .select("name")
      .eq("id", programId)
      .eq("user_id", traineeId)
      .single(),
    traineeClient
      .from("program_days")
      .select("name")
      .eq("id", dayId)
      .eq("user_id", traineeId)
      .single(),
    traineeClient
      .from("coach_messages")
      .select("id, coach_id, client_id, message, created_at, is_read")
      .eq("client_id", traineeId)
      .order("created_at", { ascending: false }),
  ]);

  for (const [label, result] of [
    ["planned menu", profileResult],
    ["program", programResult],
    ["workout", dayResult],
    ["coach messages", coachMessagesResult],
  ] as const) {
    if (result.error) {
      throw new Error(
        `The trainee page could not refresh its ${label}${errorCode(result.error) ? ` (${errorCode(result.error)})` : ""}.`,
      );
    }
  }

  const plannedMenu = profileResult.data?.planned_menu;
  const menuName =
    Array.isArray(plannedMenu) && typeof plannedMenu[0]?.name === "string"
      ? plannedMenu[0].name
      : "";

  return {
    programName: String(programResult.data?.name ?? ""),
    workoutName: String(dayResult.data?.name ?? ""),
    menuName,
    coachMessages: (coachMessagesResult.data ?? []) as Array<Record<string, unknown>>,
    pendingOfflineEdit,
  };
}

async function readCoachReport(
  coachClient: SmokeClient,
  traineeId: string,
  workoutId: string,
  reportDate: string,
): Promise<Array<Record<string, unknown>>> {
  const start = `${reportDate}T00:00:00.000Z`;
  const end = `${reportDate}T23:59:59.999Z`;
  const { data, error } = await coachClient
    .from("workout_sessions")
    .select(
      "id, workout_id, date, duration_sec, entries, notes, difficulty_rating, discomfort_notes",
    )
    .eq("user_id", traineeId)
    .eq("workout_id", workoutId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });
  if (error) {
    throw new Error(
      `The coach report could not refresh${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  }
  return (data ?? []) as Array<Record<string, unknown>>;
}

async function cleanup(
  coachClient: SmokeClient,
  traineeClient: SmokeClient,
  traineeId: string,
  programId: string,
  messageId: string | null,
  sessionId: string | null,
  originalPlannedMenu: unknown,
  traineeChannel: RealtimeChannel | null,
  coachChannel: RealtimeChannel | null,
): Promise<void> {
  const cleanupErrors: string[] = [];
  if (traineeChannel) {
    const channelResult = await traineeClient.removeChannel(traineeChannel);
    if (channelResult !== "ok") cleanupErrors.push(`realtime channel removal (${channelResult})`);
  }
  if (coachChannel) {
    const channelResult = await coachClient.removeChannel(coachChannel);
    if (channelResult !== "ok")
      cleanupErrors.push(`coach realtime channel removal (${channelResult})`);
  }

  if (sessionId) {
    const { error: sessionError } = await traineeClient
      .from("workout_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", traineeId);
    if (sessionError) {
      cleanupErrors.push(`workout session deletion (${errorCode(sessionError) ?? "delete"})`);
    }
  }

  if (messageId) {
    const { data: deletedMessages, error: messageError } = await traineeClient
      .from("coach_messages")
      .delete()
      .eq("id", messageId)
      .eq("client_id", traineeId)
      .select("id");
    if (messageError) {
      cleanupErrors.push(`coach message deletion (${errorCode(messageError) ?? "delete"})`);
    } else if (!deletedMessages?.some((message) => message.id === messageId)) {
      cleanupErrors.push("coach message deletion did not remove the smoke row");
    }
  }

  const { error: menuError } = await coachClient.rpc("save_user_planned_menu", {
    target_user_id: traineeId,
    next_planned_menu: Array.isArray(originalPlannedMenu) ? originalPlannedMenu : [],
  });
  if (menuError) cleanupErrors.push(`planned menu restore (${errorCode(menuError) ?? "rpc"})`);

  const { error: programError } = await coachClient
    .from("programs")
    .delete()
    .eq("id", programId)
    .eq("user_id", traineeId);
  if (programError) cleanupErrors.push(`workout deletion (${errorCode(programError) ?? "delete"})`);

  if (cleanupErrors.length > 0) {
    throw new Error(`Smoke cleanup failed: ${cleanupErrors.join(", ")}.`);
  }
}

async function run(): Promise<void> {
  const config = loadConfig();
  const runId = `live-smoke-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const programId = `${runId}-program`;
  const dayId = `${runId}-day`;
  const initialProgramName = `${runId} initial plan`;
  const initialWorkoutName = `${runId} initial workout`;
  const updatedProgramName = `${runId} updated plan`;
  const updatedWorkoutName = `${runId} updated workout`;
  const originalMenuMarker = `${runId} original menu`;
  const updatedMenuMarker = `${runId} updated menu`;
  const pendingOfflineEdit = `${runId} trainee offline draft`;
  const coachMessageText = `${runId} coach message`;

  const makeClient = () =>
    createClient(config.url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""), config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

  const coachClient = makeClient();
  const traineeClient = makeClient();
  let traineeChannel: RealtimeChannel | null = null;
  let coachChannel: RealtimeChannel | null = null;
  let coachMessageId: string | null = null;
  let completedSessionId: string | null = null;
  let originalPlannedMenu: unknown = [];
  let cleanupNeeded = false;

  try {
    console.log("Authenticating separate coach and trainee sessions...");
    const [coach, trainee] = await Promise.all([
      signIn(coachClient, config.coachEmail, config.coachPassword, "coach"),
      signIn(traineeClient, config.traineeEmail, config.traineePassword, "trainee"),
    ]);

    const [coachProfile, traineeProfile] = await Promise.all([
      readProfile(coachClient, coach.id, "coach"),
      readProfile(traineeClient, trainee.id, "trainee"),
    ]);
    assertCondition(
      coachProfile.role === "coach" || coachProfile.role === "owner",
      "The coach test account must have the coach or owner role.",
    );
    assertCondition(
      traineeProfile.role === "client",
      "The trainee test account must have the client role.",
    );
    assertCondition(
      traineeProfile.coach_id === coach.id,
      "The test accounts are not assigned to one another; use a seeded approved coach-trainee pair.",
    );
    assertCondition(
      traineeProfile.approval_status === "approved",
      "The trainee test account must be approved before running the smoke test.",
    );
    originalPlannedMenu = traineeProfile.planned_menu;

    console.log("Creating an isolated workout record through the coach session...");
    const { error: programError } = await coachClient.from("programs").insert({
      id: programId,
      user_id: trainee.id,
      name: initialProgramName,
      description: "Temporary live plan smoke record",
    });
    if (programError)
      throw new Error(
        `Coach could not create the isolated plan (${errorCode(programError) ?? "insert"}).`,
      );
    cleanupNeeded = true;

    const { error: dayError } = await coachClient.from("program_days").insert({
      id: dayId,
      program_id: programId,
      user_id: trainee.id,
      name: initialWorkoutName,
      items: [
        {
          id: `${runId}-item`,
          exerciseId: `${runId}-exercise`,
          exerciseName: `${runId} test exercise`,
          sets: 2,
          reps: 8,
          repType: "fixed",
          weight: 20,
          rest: 60,
          notes: "",
        },
      ],
      sort_order: 0,
    });
    if (dayError)
      throw new Error(
        `Coach could not create the isolated workout (${errorCode(dayError) ?? "insert"}).`,
      );

    const initialMenu = [{ id: `${runId}-meal`, name: originalMenuMarker, foods: [] }];
    const { error: initialMenuError } = await coachClient.rpc("save_user_planned_menu", {
      target_user_id: trainee.id,
      next_planned_menu: initialMenu,
    });
    if (initialMenuError) {
      throw new Error(
        `Coach could not seed the isolated planned menu (${errorCode(initialMenuError) ?? "rpc"}).`,
      );
    }

    console.log("Opening the trainee session and waiting for real-time subscription...");
    let pageSnapshot = await readTraineePage(
      traineeClient,
      trainee.id,
      programId,
      dayId,
      pendingOfflineEdit,
    );
    assertCondition(
      pageSnapshot.programName === initialProgramName,
      "The trainee cannot read the isolated plan.",
    );
    assertCondition(
      pageSnapshot.workoutName === initialWorkoutName,
      "The trainee cannot read the isolated workout.",
    );
    assertCondition(
      pageSnapshot.menuName === originalMenuMarker,
      "The trainee cannot read the isolated planned menu.",
    );

    let refreshChain = Promise.resolve();
    const enqueuePageRefresh = () => {
      refreshChain = refreshChain.then(async () => {
        const nextSnapshot = await readTraineePage(
          traineeClient,
          trainee.id,
          programId,
          dayId,
          pendingOfflineEdit,
        );
        pageSnapshot = { ...nextSnapshot, pendingOfflineEdit };
      });
    };

    let subscribed = false;
    let subscriptionFailure: Error | null = null;
    traineeChannel = traineeClient
      .channel(`gymtrack-live-plan-smoke-${runId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${trainee.id}` },
        enqueuePageRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "programs", filter: `user_id=eq.${trainee.id}` },
        enqueuePageRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "program_days", filter: `user_id=eq.${trainee.id}` },
        enqueuePageRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coach_messages",
          filter: `client_id=eq.${trainee.id}`,
        },
        enqueuePageRefresh,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") subscribed = true;
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          subscriptionFailure = new Error(`Trainee real-time subscription failed (${status}).`);
        }
      });
    await waitFor(
      () => subscribed || subscriptionFailure !== null,
      "the trainee real-time subscription",
      config.timeoutMs,
    );
    if (subscriptionFailure) throw subscriptionFailure;

    let coachReportSessions: Array<Record<string, unknown>> = [];
    let coachReportRefreshChain = Promise.resolve();
    const enqueueCoachReportRefresh = () => {
      coachReportRefreshChain = coachReportRefreshChain.then(async () => {
        coachReportSessions = await readCoachReport(
          coachClient,
          trainee.id,
          dayId,
          new Date().toISOString().slice(0, 10),
        );
      });
    };

    let coachSubscribed = false;
    let coachSubscriptionFailure: Error | null = null;
    coachChannel = coachClient
      .channel(`gymtrack-live-report-smoke-${runId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_sessions",
          filter: `user_id=eq.${trainee.id}`,
        },
        enqueueCoachReportRefresh,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") coachSubscribed = true;
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          coachSubscriptionFailure = new Error(
            `Coach report real-time subscription failed (${status}).`,
          );
        }
      });
    await waitFor(
      () => coachSubscribed || coachSubscriptionFailure !== null,
      "the coach report real-time subscription",
      config.timeoutMs,
    );
    if (coachSubscriptionFailure) throw coachSubscriptionFailure;

    console.log(
      "Sending a uniquely identified coach message through the persisted message path...",
    );
    const { data: createdCoachMessage, error: coachMessageError } = await coachClient
      .from("coach_messages")
      .insert({
        coach_id: coach.id,
        client_id: trainee.id,
        message: coachMessageText,
      })
      .select("id")
      .single();
    if (coachMessageError || !createdCoachMessage?.id) {
      throw new Error(
        `Coach could not save the isolated message (${errorCode(coachMessageError) ?? "insert"}).`,
      );
    }
    coachMessageId = createdCoachMessage.id;

    console.log("Refreshing the trainee session to read the persisted coach message...");
    enqueuePageRefresh();
    await refreshChain;
    const refreshedCoachMessages = pageSnapshot.coachMessages.filter(
      (message) => message.id === coachMessageId && message.message === coachMessageText,
    );
    assertCondition(
      refreshedCoachMessages.length === 1 &&
        refreshedCoachMessages[0]?.coach_id === coach.id &&
        refreshedCoachMessages[0]?.client_id === trainee.id,
      "The trainee did not read the exact persisted coach message after refresh.",
    );
    console.log("PASS: the trainee refreshed coach_messages and received the exact coach message.");

    const reportDate = new Date().toISOString().slice(0, 10);
    const reportSessionId = `${runId}-session`;
    const completedEntries = [
      {
        exerciseId: `${runId}-exercise`,
        exerciseName: `${runId} test exercise`,
        sets: [
          {
            id: `${runId}-set-1`,
            setNumber: 1,
            weight: 20,
            reps: 8,
            done: true,
          },
        ],
        feedback: {
          rating: "appropriate",
          notes: `${runId} exercise feedback`,
        },
      },
    ];
    const { error: sessionError } = await traineeClient.from("workout_sessions").insert({
      id: reportSessionId,
      user_id: trainee.id,
      workout_id: dayId,
      workout_name: updatedWorkoutName,
      program_name: updatedProgramName,
      date: new Date().toISOString(),
      duration_sec: 420,
      entries: completedEntries,
      notes: `${runId} trainee workout feedback`,
      difficulty_rating: "appropriate",
      discomfort_notes: `${runId} no discomfort`,
    });
    if (sessionError) {
      throw new Error(
        `Trainee could not save the completed workout (${errorCode(sessionError) ?? "insert"}).`,
      );
    }
    completedSessionId = reportSessionId;

    await waitFor(
      () => coachReportSessions.some((session) => session.id === reportSessionId),
      "the coach report to receive the completed trainee workout over real-time",
      config.timeoutMs,
    );
    await coachReportRefreshChain;
    const refreshedCoachReport = await readCoachReport(coachClient, trainee.id, dayId, reportDate);
    const reportSession = refreshedCoachReport.find((session) => session.id === reportSessionId);
    assertCondition(
      Boolean(reportSession),
      "The coach report did not include the trainee's completed workout for today.",
    );
    const reportEntries = (reportSession?.entries ?? []) as Array<Record<string, unknown>>;
    const reportEntry = reportEntries[0];
    const reportSets = (reportEntry?.sets ?? []) as Array<Record<string, unknown>>;
    assertCondition(
      reportSets.some((set) => set.done === true && set.reps === 8),
      "The coach report did not include the completed set.",
    );
    assertCondition(
      reportEntry?.feedback &&
        (reportEntry.feedback as Record<string, unknown>).notes === `${runId} exercise feedback`,
      "The coach report did not include the exercise feedback.",
    );
    assertCondition(
      reportSession?.notes === `${runId} trainee workout feedback` &&
        reportSession?.difficulty_rating === "appropriate" &&
        reportSession?.discomfort_notes === `${runId} no discomfort`,
      "The coach report did not include the trainee's session feedback.",
    );
    console.log(
      "PASS: the coach report refreshed through Realtime and shows today's set and trainee feedback.",
    );

    console.log("Applying coach workout and menu changes while the trainee session stays open...");
    const { error: workoutUpdateError } = await coachClient
      .from("program_days")
      .update({ name: updatedWorkoutName })
      .eq("id", dayId)
      .eq("user_id", trainee.id);
    if (workoutUpdateError) {
      throw new Error(
        `Coach could not update the trainee workout (${errorCode(workoutUpdateError) ?? "update"}).`,
      );
    }

    const { error: planUpdateError } = await coachClient
      .from("programs")
      .update({ name: updatedProgramName })
      .eq("id", programId)
      .eq("user_id", trainee.id);
    if (planUpdateError) {
      throw new Error(
        `Coach could not update the trainee plan (${errorCode(planUpdateError) ?? "update"}).`,
      );
    }

    const updatedMenu = [{ id: `${runId}-meal-updated`, name: updatedMenuMarker, foods: [] }];
    const { error: menuUpdateError } = await coachClient.rpc("save_user_planned_menu", {
      target_user_id: trainee.id,
      next_planned_menu: updatedMenu,
    });
    if (menuUpdateError) {
      throw new Error(
        `Coach could not update the trainee planned menu (${errorCode(menuUpdateError) ?? "rpc"}).`,
      );
    }

    await waitFor(
      () =>
        pageSnapshot.programName === updatedProgramName &&
        pageSnapshot.workoutName === updatedWorkoutName &&
        pageSnapshot.menuName === updatedMenuMarker,
      "the open trainee page to reflect the workout and menu updates",
      config.timeoutMs,
    );
    await refreshChain;
    assertCondition(
      pageSnapshot.pendingOfflineEdit === pendingOfflineEdit,
      "The open trainee page lost its pending offline edit during the remote refresh.",
    );
    console.log(
      "PASS: the open trainee session received both updates and kept its pending offline edit.",
    );
  } finally {
    if (cleanupNeeded) {
      try {
        await cleanup(
          coachClient,
          traineeClient,
          (await traineeClient.auth.getUser()).data.user?.id ?? "",
          programId,
          coachMessageId,
          completedSessionId,
          originalPlannedMenu,
          traineeChannel,
          coachChannel,
        );
        console.log("Cleaned up isolated smoke records.");
      } catch (cleanupError) {
        console.error(`WARNING: smoke cleanup failed: ${errorMessage(cleanupError, config)}`);
        process.exitCode = 1;
      }
    } else {
      if (traineeChannel) await traineeClient.removeChannel(traineeChannel);
      if (coachChannel) await coachClient.removeChannel(coachChannel);
    }
    await Promise.all([coachClient.auth.signOut(), traineeClient.auth.signOut()]);
  }
}

let loadedConfig: SmokeConfig | null = null;
try {
  loadedConfig = loadConfig();
  await run();
} catch (error) {
  const message = loadedConfig
    ? errorMessage(error, loadedConfig)
    : error instanceof Error
      ? error.message
      : "Unknown smoke failure";
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}
