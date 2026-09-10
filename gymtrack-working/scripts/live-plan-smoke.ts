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

function isMatchingCoachMessageRealtimePayload(
  payload: unknown,
  expected: { id: string; coachId: string; clientId: string; message: string },
): boolean {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as {
    eventType?: unknown;
    new?: unknown;
  };
  if (candidate.eventType !== "INSERT" || !candidate.new || typeof candidate.new !== "object") {
    return false;
  }
  const row = candidate.new as Record<string, unknown>;
  return (
    row.id === expected.id &&
    row.coach_id === expected.coachId &&
    row.client_id === expected.clientId &&
    row.message === expected.message
  );
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) throw new Error(`Timed out waiting for ${label}.`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function cleanupTimeoutMs() {
  const configured = Number(process.env.GYMTRACK_SMOKE_CLEANUP_TIMEOUT_MS ?? "15000");
  return Number.isFinite(configured) && configured >= 1000 ? configured : 15000;
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
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

async function refreshAuthAfterJwtFailure(client: SmokeClient, roleLabel: "coach" | "trainee") {
  const { data, error } = await client.auth.refreshSession();
  if (error || !data.session?.access_token) {
    throw new Error(
      `Could not refresh the ${roleLabel} test session after an invalid JWT${
        errorCode(error) ? ` (${errorCode(error)})` : ""
      }.`,
    );
  }
}

async function readProfile(
  client: SmokeClient,
  userId: string,
  label: "coach" | "trainee",
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await client
      .from("profiles")
      .select("id, role, coach_id, approval_status, planned_menu")
      .eq("id", userId)
      .single();
    if (!error) {
      assertCondition(data, `The ${label} account has no profile row.`);
      return data as Record<string, unknown>;
    }
    if (errorCode(error) !== "PGRST303" || attempt === 1) {
      throw new Error(
        `Could not read the ${label} profile${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
      );
    }
    await refreshAuthAfterJwtFailure(client, label);
  }
  throw new Error(`Could not read the ${label} profile.`);
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
  preservedMessageIds: string[],
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
    } else {
      const { data: remainingMessages, error: remainingMessagesError } = await traineeClient
        .from("coach_messages")
        .select("id")
        .eq("client_id", traineeId);
      if (remainingMessagesError) {
        cleanupErrors.push(
          `coach message preservation check (${errorCode(remainingMessagesError) ?? "select"})`,
        );
      } else {
        const remainingMessageIds = new Set(
          (remainingMessages ?? []).map((message) => message.id as string),
        );
        if (remainingMessageIds.has(messageId)) {
          cleanupErrors.push("coach message cleanup left the smoke row behind");
        }
        for (const preservedMessageId of preservedMessageIds) {
          if (!remainingMessageIds.has(preservedMessageId)) {
            cleanupErrors.push(`coach message cleanup removed an unrelated row`);
            break;
          }
        }
      }
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
  let preservedCoachMessageIds: string[] = [];
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
    preservedCoachMessageIds = pageSnapshot.coachMessages
      .map((message) => message.id)
      .filter((id): id is string => typeof id === "string");

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
    let traineeCoachMessageRealtimePayloadReceived = false;
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
          event: "INSERT",
          schema: "public",
          table: "coach_messages",
          filter: `client_id=eq.${trainee.id}`,
        },
        (payload) => {
          if (
            isMatchingCoachMessageRealtimePayload(payload, {
              id: coachMessageId ?? "",
              coachId: coach.id,
              clientId: trainee.id,
              message: coachMessageText,
            })
          ) {
            traineeCoachMessageRealtimePayloadReceived = true;
          }
          enqueuePageRefresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") subscribed = true;
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          subscriptionFailure = new Error(
            `Trainee real-time subscription failed (${status}) before coach-message delivery. ` +
              "No client refresh diagnosis is possible; inspect Realtime channel authorization " +
              "and coach_messages publication membership first.",
          );
        }
      });
    await waitFor(
      () => subscribed || subscriptionFailure !== null,
      "the trainee real-time subscription",
      config.timeoutMs,
    );
    if (subscriptionFailure) throw subscriptionFailure;
    // Supabase can acknowledge the WebSocket before the postgres_changes
    // registration is fully active. Give the server a short settling window
    // before inserting the row that proves delivery.
    await new Promise((resolve) => setTimeout(resolve, 750));

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
    await new Promise((resolve) => setTimeout(resolve, 750));

    console.log(
      "Sending a uniquely identified coach message and waiting for the trainee Realtime payload...",
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

    let realtimeMessageFailure: Error | null = null;
    try {
      await waitFor(
        () => traineeCoachMessageRealtimePayloadReceived,
        "the trainee Realtime callback for the inserted coach message",
        config.timeoutMs,
      );
    } catch {
      realtimeMessageFailure = new Error(
        "The trainee channel reached SUBSCRIBED but did not deliver the inserted coach message " +
          `within ${config.timeoutMs}ms. Check coach_messages publication membership, trainee ` +
          "Realtime SELECT/RLS visibility, and the client_id subscription filter.",
      );
    }
    if (!realtimeMessageFailure) {
      console.log(
        "PASS: the trainee Realtime callback delivered the exact inserted coach message.",
      );
    }

    console.log(
      "Refreshing the trainee session to separately verify persisted coach-message delivery...",
    );
    let refreshFailure: Error | null = null;
    try {
      enqueuePageRefresh();
      await refreshChain;
    } catch (error) {
      refreshFailure =
        error instanceof Error ? error : new Error("Unknown trainee refresh failure");
    }
    const refreshedCoachMessages = pageSnapshot.coachMessages.filter(
      (message) => message.id === coachMessageId && message.message === coachMessageText,
    );
    const persistedMessageVisible =
      refreshFailure === null &&
      refreshedCoachMessages.length === 1 &&
      refreshedCoachMessages[0]?.coach_id === coach.id &&
      refreshedCoachMessages[0]?.client_id === trainee.id;
    assertCondition(
      persistedMessageVisible,
      refreshFailure
        ? `The trainee's persisted coach-message refresh failed (${errorCode(refreshFailure) ?? "query"}). ` +
            "Investigate the trainee RLS/query path before diagnosing Realtime."
        : "The trainee did not read the exact persisted coach message after refresh.",
    );
    console.log("PASS: the trainee refreshed coach_messages and received the exact coach message.");
    if (realtimeMessageFailure) {
      throw new Error(
        `${realtimeMessageFailure.message} The persisted refresh assertion passed, so client ` +
          "refresh behavior is working; the failure is isolated to Realtime publication, RLS " +
          "visibility, or subscription filtering.",
      );
    }

    console.log("Verifying the coach cannot delete the trainee's inbox message...");
    const { data: coachDeletedMessages, error: coachDeleteError } = await coachClient
      .from("coach_messages")
      .delete()
      .eq("id", coachMessageId)
      .eq("client_id", trainee.id)
      .select("id");
    const coachDeleteCode = errorCode(coachDeleteError);
    if (
      coachDeleteError &&
      coachDeleteCode !== "42501" &&
      coachDeleteCode !== "401" &&
      coachDeleteCode !== "403"
    ) {
      throw new Error(
        `Coach message deletion returned an unexpected error (${coachDeleteCode ?? "delete"}).`,
      );
    }
    assertCondition(
      !coachDeletedMessages?.some((message) => message.id === coachMessageId),
      "The coach deleted the trainee's inbox message.",
    );

    enqueuePageRefresh();
    await refreshChain;
    const messageStillPresent = pageSnapshot.coachMessages.some(
      (message) =>
        message.id === coachMessageId &&
        message.coach_id === coach.id &&
        message.client_id === trainee.id &&
        message.message === coachMessageText,
    );
    assertCondition(
      messageStillPresent,
      "The trainee's inbox message disappeared after the coach-side delete attempt.",
    );
    assertCondition(
      preservedCoachMessageIds.every((messageId) =>
        pageSnapshot.coachMessages.some((message) => message.id === messageId),
      ),
      "The coach-side delete attempt changed an unrelated trainee inbox message.",
    );
    console.log("PASS: coach-side deletion was blocked and the trainee message remained readable.");

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
    const cleanupLimit = cleanupTimeoutMs();
    if (cleanupNeeded) {
      try {
        await withTimeout(
          cleanup(
            coachClient,
            traineeClient,
            (await traineeClient.auth.getUser()).data.user?.id ?? "",
            programId,
            coachMessageId,
            preservedCoachMessageIds,
            completedSessionId,
            originalPlannedMenu,
            traineeChannel,
            coachChannel,
          ),
          cleanupLimit,
          "live plan smoke cleanup",
        );
        console.log("Cleaned up isolated smoke records.");
      } catch (cleanupError) {
        console.error(`WARNING: smoke cleanup failed: ${errorMessage(cleanupError, config)}`);
        process.exitCode = 1;
      }
    } else {
      try {
        await withTimeout(
          Promise.all([
            traineeChannel ? traineeClient.removeChannel(traineeChannel) : Promise.resolve("ok"),
            coachChannel ? coachClient.removeChannel(coachChannel) : Promise.resolve("ok"),
          ]),
          cleanupLimit,
          "live plan realtime cleanup",
        );
      } catch (cleanupError) {
        console.error(
          `WARNING: smoke channel cleanup failed: ${errorMessage(cleanupError, config)}`,
        );
        process.exitCode = 1;
      }
    }
    try {
      await withTimeout(
        Promise.all([coachClient.auth.signOut(), traineeClient.auth.signOut()]),
        cleanupLimit,
        "live plan auth cleanup",
      );
    } catch (cleanupError) {
      console.error(`WARNING: smoke auth cleanup failed: ${errorMessage(cleanupError, config)}`);
      process.exitCode = 1;
    }
  }
}

let loadedConfig: SmokeConfig | null = null;
let exitCode = 0;
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
  exitCode = 1;
}

// Supabase Realtime can keep timers or sockets alive after the channels are
// removed. The cleanup above must finish first, but the smoke command should
// not wait indefinitely for those client internals after its result is known.
process.exit(exitCode);
