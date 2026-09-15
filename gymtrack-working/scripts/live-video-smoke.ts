import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
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

type AuthenticatedUser = { id: string; email?: string };
type HistoryRow = {
  id: string;
  workout_id: string;
  date: string;
  entries: Array<Record<string, unknown>>;
};

const WORKOUT_VIDEO_BUCKET = "workout-videos";
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
      "Live video smoke is guarded. Set GYMTRACK_SMOKE_ALLOW_LIVE=true with disposable accounts to run it.",
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

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function makeClient(config: SmokeConfig) {
  return createClient(
    config.url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""),
    config.anonKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
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
      `Could not authenticate the ${roleLabel} test account${
        errorCode(error) ? ` (${errorCode(error)})` : ""
      }.`,
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

async function readHistory(
  client: SmokeClient,
  traineeId: string,
  workoutId: string,
  date?: string,
): Promise<HistoryRow[]> {
  let query = client
    .from("workout_sessions")
    .select("id, workout_id, date, entries")
    .eq("user_id", traineeId)
    .eq("workout_id", workoutId)
    .order("date", { ascending: false });
  if (date) {
    query = query.gte("date", `${date}T00:00:00.000Z`).lte("date", `${date}T23:59:59.999Z`);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(
      `Could not read the workout history${errorCode(error) ? ` (${errorCode(error)})` : ""}.`,
    );
  }
  return (data ?? []) as HistoryRow[];
}

function assertThreeVideos(rows: HistoryRow[], sessionId: string, paths: string[], label: string) {
  const session = rows.find((row) => row.id === sessionId);
  assertCondition(session, `${label} did not include the completed workout.`);
  assertCondition(
    session.entries.length === 3,
    `${label} returned ${session.entries.length} exercises instead of three.`,
  );
  const returnedPaths = session.entries.map((entry) => entry.video_url ?? entry.videoUrl);
  assertCondition(
    returnedPaths.every((path) => typeof path === "string") &&
      paths.every((path) => returnedPaths.includes(path)),
    `${label} did not preserve all three performance-video paths.`,
  );
  assertCondition(
    new Set(session.entries.map((entry) => entry.exercise_id ?? entry.exerciseId)).size === 3,
    `${label} collapsed the videos onto one exercise.`,
  );
}

async function readVideo(responseUrl: string): Promise<Response> {
  return fetch(responseUrl, { headers: { Range: "bytes=0-31" } });
}

async function assertVideoReadable(url: string, label: string) {
  const response = await readVideo(url);
  assertCondition(response.ok, `${label} could not read the signed video (${response.status}).`);
}

async function removeObjects(client: SmokeClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await client.storage.from(WORKOUT_VIDEO_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not clean up uploaded videos (${errorCode(error) ?? "remove"}).`);
  }
}

async function run(config: SmokeConfig) {
  const coachClient = makeClient(config);
  const traineeClient = makeClient(config);
  const unrelatedCoachClient = makeClient(config);
  const trainee = await signIn(
    traineeClient,
    config.traineeEmail,
    config.traineePassword,
    "trainee",
  );
  const coach = await signIn(
    coachClient,
    config.coachEmail,
    config.coachPassword,
    "assigned coach",
  );
  const unrelatedCoach = await signIn(
    unrelatedCoachClient,
    config.unrelatedCoachEmail,
    config.unrelatedCoachPassword,
    "unrelated coach",
  );

  const runId = `live-video-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const workoutId = `${runId}-workout`;
  const sessionId = `${runId}-session`;
  const exerciseIds = [`${runId}-squat`, `${runId}-press`, `${runId}-row`];
  const exerciseNames = ["Smoke squat", "Smoke press", "Smoke row"];
  const videoPaths: string[] = [];
  let sessionCreated = false;

  try {
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

    const fixture = await readFile(
      new URL("../public/loading/tinted/user-character-01.mp4", import.meta.url),
    );
    assertCondition(fixture.byteLength > 0, "The video fixture is empty.");
    const videoBody = new Blob([fixture], { type: "video/mp4" });

    for (const [index, exerciseId] of exerciseIds.entries()) {
      const path = `${trainee.id}/${workoutId}/${exerciseId}/${randomUUID()}.mp4`;
      const { error } = await traineeClient.storage
        .from(WORKOUT_VIDEO_BUCKET)
        .upload(path, videoBody, { contentType: "video/mp4", upsert: false });
      if (error) {
        throw new Error(
          `Trainee could not upload performance video ${index + 1} (${errorCode(error) ?? "upload"}).`,
        );
      }
      videoPaths.push(path);
    }
    assertCondition(videoPaths.length === 3, "The smoke did not upload three performance videos.");
    console.log("PASS: trainee uploaded three videos for three different exercises.");

    const now = new Date().toISOString();
    const entries = exerciseIds.map((exerciseId, index) => ({
      exerciseId,
      exerciseName: exerciseNames[index],
      sets: [{ weight: 20 + index, reps: 8, done: true }],
      videoUrl: videoPaths[index],
    }));
    const { error: insertError } = await traineeClient.from("workout_sessions").insert({
      id: sessionId,
      user_id: trainee.id,
      workout_id: workoutId,
      workout_name: `${runId} workout`,
      date: now,
      duration_sec: 420,
      entries,
      notes: `${runId} completed`,
    });
    if (insertError) {
      throw new Error(
        `Trainee could not save the completed workout (${errorCode(insertError) ?? "insert"}).`,
      );
    }
    sessionCreated = true;
    console.log("PASS: completed workout persisted after upload and close.");

    const traineeRows = await readHistory(traineeClient, trainee.id, workoutId);
    assertThreeVideos(traineeRows, sessionId, videoPaths, "Trainee history");

    const coachRows = await readHistory(coachClient, trainee.id, workoutId);
    assertThreeVideos(coachRows, sessionId, videoPaths, "Coach daily report");
    const trackingRows = await readHistory(coachClient, trainee.id, workoutId, now.slice(0, 10));
    assertThreeVideos(trackingRows, sessionId, videoPaths, "Coach tracking screen");
    console.log(
      "PASS: assigned coach read all three videos in the daily report and tracking query.",
    );

    const unrelatedRows = await readHistory(unrelatedCoachClient, trainee.id, workoutId);
    assertCondition(
      unrelatedRows.length === 0,
      "The unrelated coach could read the trainee's workout history.",
    );
    console.log("PASS: unrelated coach received no workout row.");

    const coachSignedUrls: string[] = [];
    for (const [index, path] of videoPaths.entries()) {
      const { data, error } = await coachClient.storage
        .from(WORKOUT_VIDEO_BUCKET)
        .createSignedUrl(path, 60);
      if (error || !data?.signedUrl) {
        throw new Error(
          `Assigned coach could not sign video ${index + 1} (${errorCode(error) ?? "sign"}).`,
        );
      }
      coachSignedUrls.push(data.signedUrl);
      await assertVideoReadable(data.signedUrl, `Assigned coach video ${index + 1}`);
    }
    console.log("PASS: assigned coach could open all three signed video URLs.");

    const unrelatedAttempt = await unrelatedCoachClient.storage
      .from(WORKOUT_VIDEO_BUCKET)
      .createSignedUrl(videoPaths[0], 60);
    if (!unrelatedAttempt.error && unrelatedAttempt.data?.signedUrl) {
      const response = await readVideo(unrelatedAttempt.data.signedUrl);
      assertCondition(!response.ok, "The unrelated coach could download a trainee video.");
    }
    console.log("PASS: storage RLS blocked the unrelated coach from trainee videos.");

    const expiringUrls = await Promise.all(
      videoPaths.map(async (path) => {
        const { data, error } = await traineeClient.storage
          .from(WORKOUT_VIDEO_BUCKET)
          .createSignedUrl(path, 1);
        if (error || !data?.signedUrl) {
          throw new Error(
            `Could not create the short-lived signed URL (${errorCode(error) ?? "sign"}).`,
          );
        }
        return data.signedUrl;
      }),
    );
    await sleep(2200);
    for (const [index, url] of expiringUrls.entries()) {
      const expiredResponse = await readVideo(url);
      assertCondition(
        !expiredResponse.ok,
        `Video ${index + 1} remained readable after its signed URL expired.`,
      );
    }
    const refreshedUrls = await Promise.all(
      videoPaths.map(async (path) => {
        const { data, error } = await coachClient.storage
          .from(WORKOUT_VIDEO_BUCKET)
          .createSignedUrl(path, 60);
        if (error || !data?.signedUrl) {
          throw new Error(`Could not refresh a signed video URL (${errorCode(error) ?? "sign"}).`);
        }
        return data.signedUrl;
      }),
    );
    for (const [index, url] of refreshedUrls.entries()) {
      await assertVideoReadable(url, `Refreshed coach video ${index + 1}`);
    }
    assertCondition(
      coachSignedUrls.length === refreshedUrls.length,
      "Video refresh changed the video count.",
    );
    console.log("PASS: expired URLs failed and fresh coach URLs restored all three videos.");

    const { error: refreshError } = await coachClient.auth.refreshSession();
    if (refreshError) {
      throw new Error(
        `Coach authentication refresh failed (${errorCode(refreshError) ?? "refresh"}).`,
      );
    }
    const refreshedCoachRows = await readHistory(coachClient, trainee.id, workoutId);
    assertThreeVideos(refreshedCoachRows, sessionId, videoPaths, "Coach report after refresh");
    console.log("PASS: coach history still contained all three videos after a fresh read.");
  } finally {
    const cleanupErrors: string[] = [];
    if (sessionCreated) {
      const { error } = await traineeClient
        .from("workout_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", trainee.id);
      if (error) cleanupErrors.push(`workout deletion (${errorCode(error) ?? "delete"})`);
    }
    try {
      await removeObjects(traineeClient, videoPaths);
    } catch (error) {
      cleanupErrors.push(error instanceof Error ? error.message : "video deletion");
    }
    if (cleanupErrors.length > 0) {
      throw new Error(`Smoke cleanup failed: ${cleanupErrors.join(", ")}.`);
    }
    await Promise.all([
      coachClient.auth.signOut(),
      traineeClient.auth.signOut(),
      unrelatedCoachClient.auth.signOut(),
    ]);
  }
}

let loadedConfig: SmokeConfig | null = null;
let exitCode = 0;
try {
  loadedConfig = loadConfig();
  await run(loadedConfig);
} catch (error) {
  const message =
    loadedConfig && error instanceof Error
      ? redact(error.message, loadedConfig)
      : error instanceof Error
        ? error.message
        : "Unknown smoke failure";
  console.error(`FAIL: ${message}`);
  exitCode = 1;
}

process.exit(exitCode);
