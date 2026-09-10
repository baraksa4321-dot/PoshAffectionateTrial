import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SmokeClient = SupabaseClient;

type SmokeConfig = {
  url: string;
  anonKey: string;
  coachEmail: string;
  coachPassword: string;
  traineeEmail: string;
  traineePassword: string;
  unrelatedCoachEmail: string;
  unrelatedCoachPassword: string;
};

type AuthenticatedUser = {
  id: string;
  email?: string;
};

type ActivityTable = "client_habits" | "body_weight_logs" | "cardio_logs";

type SmokeRow = Record<string, unknown>;

type InsertedRow = {
  table: ActivityTable;
  id: string;
};

const configKeys = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "GYMTRACK_SMOKE_COACH_EMAIL",
  "GYMTRACK_SMOKE_COACH_PASSWORD",
  "GYMTRACK_SMOKE_TRAINEE_EMAIL",
  "GYMTRACK_SMOKE_TRAINEE_PASSWORD",
  "GYMTRACK_SMOKE_UNRELATED_COACH_EMAIL",
  "GYMTRACK_SMOKE_UNRELATED_COACH_PASSWORD",
] as const;

function requiredEnv(key: (typeof configKeys)[number]): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required smoke configuration: ${key}`);
  return value;
}

function loadConfig(): SmokeConfig {
  if (process.env.GYMTRACK_SMOKE_ALLOW_LIVE !== "true") {
    throw new Error(
      "Live activity RLS smoke is guarded. Set GYMTRACK_SMOKE_ALLOW_LIVE=true with disposable accounts to run it.",
    );
  }

  return {
    url: requiredEnv("VITE_SUPABASE_URL"),
    anonKey: requiredEnv("VITE_SUPABASE_ANON_KEY"),
    coachEmail: requiredEnv("GYMTRACK_SMOKE_COACH_EMAIL"),
    coachPassword: requiredEnv("GYMTRACK_SMOKE_COACH_PASSWORD"),
    traineeEmail: requiredEnv("GYMTRACK_SMOKE_TRAINEE_EMAIL"),
    traineePassword: requiredEnv("GYMTRACK_SMOKE_TRAINEE_PASSWORD"),
    unrelatedCoachEmail: requiredEnv("GYMTRACK_SMOKE_UNRELATED_COACH_EMAIL"),
    unrelatedCoachPassword: requiredEnv("GYMTRACK_SMOKE_UNRELATED_COACH_PASSWORD"),
  };
}

function redact(value: string, config: SmokeConfig): string {
  let safe = value;
  for (const secret of [
    config.anonKey,
    config.coachPassword,
    config.traineePassword,
    config.unrelatedCoachPassword,
    config.coachEmail,
    config.traineeEmail,
    config.unrelatedCoachEmail,
  ]) {
    if (secret) safe = safe.replaceAll(secret, "[redacted]");
  }
  return safe.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]");
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { code?: unknown; status?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  if (typeof candidate.status === "number") return String(candidate.status);
  return undefined;
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const candidate = error as { message?: unknown; details?: unknown; hint?: unknown };
  return [candidate.message, candidate.details, candidate.hint]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function isSchemaCompatibilityError(error: unknown): boolean {
  const code = errorCode(error);
  if (code === "PGRST204" || code === "42703") return true;
  const message = errorText(error).toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find the") ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function signIn(
  client: SmokeClient,
  email: string,
  password: string,
  roleLabel: "assigned coach" | "trainee" | "unrelated coach",
): Promise<AuthenticatedUser> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      `Could not authenticate the ${roleLabel} test account${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  }
  assertCondition(data.user?.id, `The ${roleLabel} test account returned no authenticated user.`);
  return { id: data.user.id, ...(data.user.email ? { email: data.user.email } : {}) };
}

async function readProfile(
  client: SmokeClient,
  userId: string,
  label: "assigned coach" | "trainee" | "unrelated coach",
): Promise<Record<string, unknown>> {
  const { data, error } = await client
    .from("profiles")
    .select("id, role, coach_id, approval_status")
    .eq("id", userId)
    .single();
  if (error) {
    throw new Error(
      `Could not read the ${label} profile${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  }
  assertCondition(data, `The ${label} account has no profile row.`);
  return data as Record<string, unknown>;
}

async function readRows(
  client: SmokeClient,
  table: ActivityTable,
  traineeId: string,
  label: string,
): Promise<SmokeRow[]> {
  const { data, error } = await client.from(table).select("*").eq("user_id", traineeId);
  if (error) {
    throw new Error(`Could not read ${label}${errorCode(error) ? ` (${errorCode(error)})` : ""}.`);
  }
  return (data ?? []) as SmokeRow[];
}

async function insertActivityRow(
  client: SmokeClient,
  table: ActivityTable,
  payloads: Array<Record<string, unknown>>,
  label: string,
): Promise<SmokeRow> {
  let lastError: unknown = null;
  for (const payload of payloads) {
    const { data, error } = await client.from(table).insert(payload).select("*").single();
    if (!error && data) return data as SmokeRow;
    lastError = error;
    if (!error || !isSchemaCompatibilityError(error)) break;
  }

  throw new Error(
    `Could not create the isolated ${label}${errorCode(lastError) ? ` (${errorCode(lastError)})` : ""}.`,
  );
}

function rowId(row: SmokeRow, label: string): string {
  const id = row.id;
  assertCondition(
    typeof id === "string" && id.length > 0,
    `The isolated ${label} row returned no id.`,
  );
  return id;
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

async function deleteActivityRow(
  client: SmokeClient,
  row: InsertedRow,
  label: string,
): Promise<void> {
  const { data, error } = await client.from(row.table).delete().eq("id", row.id).select("id");
  if (error) {
    throw new Error(
      `Could not clean up the isolated ${label}${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  }
  assertCondition(
    data?.some((deletedRow) => deletedRow.id === row.id),
    `Cleanup did not remove the isolated ${label} row.`,
  );
}

function makeClient(config: SmokeConfig): SmokeClient {
  return createClient(
    config.url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""),
    config.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

async function run(): Promise<void> {
  const config = loadConfig();
  const coachClient = makeClient(config);
  const traineeClient = makeClient(config);
  const unrelatedCoachClient = makeClient(config);
  const insertedRows: InsertedRow[] = [];

  try {
    console.log("Authenticating assigned coach, trainee, and unrelated coach sessions...");
    const [coach, trainee, unrelatedCoach] = await Promise.all([
      signIn(coachClient, config.coachEmail, config.coachPassword, "assigned coach"),
      signIn(traineeClient, config.traineeEmail, config.traineePassword, "trainee"),
      signIn(
        unrelatedCoachClient,
        config.unrelatedCoachEmail,
        config.unrelatedCoachPassword,
        "unrelated coach",
      ),
    ]);

    assertCondition(
      coach.id !== unrelatedCoach.id,
      "The assigned and unrelated smoke coach accounts must be different users.",
    );

    const [coachProfile, traineeProfile, unrelatedCoachProfile] = await Promise.all([
      readProfile(coachClient, coach.id, "assigned coach"),
      readProfile(traineeClient, trainee.id, "trainee"),
      readProfile(unrelatedCoachClient, unrelatedCoach.id, "unrelated coach"),
    ]);
    assertCondition(
      coachProfile.role === "coach" || coachProfile.role === "owner",
      "The assigned coach test account must have the coach or owner role.",
    );
    assertCondition(
      traineeProfile.role === "client" &&
        traineeProfile.approval_status === "approved" &&
        traineeProfile.coach_id === coach.id,
      "The trainee test account must be an approved client assigned to the assigned coach.",
    );
    assertCondition(
      unrelatedCoachProfile.role === "coach",
      "The unrelated smoke account must have the coach role, not the owner role.",
    );

    const [existingHabits, existingWeight, existingCardio] = await Promise.all([
      readRows(traineeClient, "client_habits", trainee.id, "the trainee's existing habits"),
      readRows(traineeClient, "body_weight_logs", trainee.id, "the trainee's existing weight logs"),
      readRows(traineeClient, "cardio_logs", trainee.id, "the trainee's existing cardio logs"),
    ]);
    assertCondition(
      existingHabits.length === 0 && existingWeight.length === 0 && existingCardio.length === 0,
      "The smoke trainee already has activity rows; use a disposable empty trainee account.",
    );

    const habitsId = crypto.randomUUID();
    const weightId = crypto.randomUUID();
    const cardioId = crypto.randomUUID();
    const activityDate = new Date().toISOString().slice(0, 10);

    console.log("Creating isolated trainee-owned activity rows...");
    const habits = await insertActivityRow(
      traineeClient,
      "client_habits",
      [
        {
          id: habitsId,
          user_id: trainee.id,
          date: activityDate,
          water_ml: 1200,
          water_target_ml: 2500,
          steps: 8500,
          steps_target: 10000,
          weigh_in_done: true,
          workout_done: true,
          busy_day_mode: false,
        },
      ],
      "habits",
    );
    insertedRows.push({ table: "client_habits", id: rowId(habits, "habits") });

    const weight = await insertActivityRow(
      traineeClient,
      "body_weight_logs",
      [
        {
          user_id: trainee.id,
          date: activityDate,
          weight_kg: 72.5,
          updated_at: new Date().toISOString(),
        },
        {
          id: weightId,
          user_id: trainee.id,
          weight_kg: 72.5,
          recorded_at: new Date().toISOString(),
        },
      ],
      "body-weight log",
    );
    insertedRows.push({ table: "body_weight_logs", id: rowId(weight, "body-weight") });

    const cardio = await insertActivityRow(
      traineeClient,
      "cardio_logs",
      [
        {
          id: cardioId,
          user_id: trainee.id,
          date: activityDate,
          type: "RLS smoke walk",
          duration_min: 20,
          calories: 100,
          intensity: "low",
          updated_at: new Date().toISOString(),
        },
        {
          id: cardioId,
          user_id: trainee.id,
          activity_type: "RLS smoke walk",
          duration_minutes: 20,
          estimated_calories: 100,
          intensity: "low",
          recorded_at: new Date().toISOString(),
        },
      ],
      "cardio log",
    );
    insertedRows.push({ table: "cardio_logs", id: rowId(cardio, "cardio") });

    for (const [table, label] of [
      ["client_habits", "habits"],
      ["body_weight_logs", "body-weight logs"],
      ["cardio_logs", "cardio logs"],
    ] as const) {
      const assignedRows = await readRows(
        coachClient,
        table,
        trainee.id,
        `assigned trainee ${label}`,
      );
      assertCondition(
        assignedRows.some((row) =>
          insertedRows.some((inserted) => inserted.table === table && inserted.id === row.id),
        ),
        `The assigned coach could not read the trainee's ${label}.`,
      );

      const unrelatedRows = await readRows(
        unrelatedCoachClient,
        table,
        trainee.id,
        `unrelated-coach ${label}`,
      );
      assertCondition(
        unrelatedRows.length === 0,
        `The unrelated coach could read the trainee's ${label}.`,
      );
    }

    console.log(
      "PASS: assigned coach reads habits, body-weight, and cardio logs; unrelated coach reads no trainee activity rows.",
    );
  } finally {
    const cleanupLimit = cleanupTimeoutMs();
    for (const row of [...insertedRows].reverse()) {
      try {
        await withTimeout(
          deleteActivityRow(
            traineeClient,
            row,
            row.table === "client_habits"
              ? "habits"
              : row.table === "body_weight_logs"
                ? "body-weight log"
                : "cardio log",
          ),
          cleanupLimit,
          "live activity smoke cleanup",
        );
      } catch (error) {
        console.error(
          `WARNING: activity smoke cleanup failed: ${redact(
            error instanceof Error ? error.message : String(error),
            config,
          )}`,
        );
        process.exitCode = 1;
      }
    }

    try {
      await withTimeout(
        Promise.all([
          coachClient.auth.signOut(),
          traineeClient.auth.signOut(),
          unrelatedCoachClient.auth.signOut(),
        ]),
        cleanupLimit,
        "live activity auth cleanup",
      );
    } catch (error) {
      console.error(
        `WARNING: activity smoke auth cleanup failed: ${redact(
          error instanceof Error ? error.message : String(error),
          config,
        )}`,
      );
      process.exitCode = 1;
    }
  }
}

let loadedConfig: SmokeConfig | null = null;
try {
  loadedConfig = loadConfig();
  await run();
} catch (error) {
  const message =
    loadedConfig && error instanceof Error
      ? redact(error.message, loadedConfig)
      : error instanceof Error
        ? error.message
        : "Unknown smoke failure";
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

// Do not let Supabase client internals keep a completed smoke process alive.
process.exit(process.exitCode ?? 0);
