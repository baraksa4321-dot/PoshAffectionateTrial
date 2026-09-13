import { supabase } from "./supabase";
import type { VideoFeedback } from "./gym-types";

export function videoFeedbackFromRow(row: Record<string, unknown>): VideoFeedback {
  const workoutId = row["workout_id"];
  const seenAt = row["seen_at"];
  return {
    id: String(row["id"] ?? ""),
    clientId: String(row["client_id"] ?? ""),
    coachId: String(row["coach_id"] ?? ""),
    sessionId: String(row["session_id"] ?? ""),
    ...(typeof workoutId === "string" ? { workoutId } : {}),
    exerciseId: String(row["exercise_id"] ?? ""),
    exerciseName: String(row["exercise_name"] ?? "תרגיל"),
    videoPath: String(row["video_path"] ?? ""),
    message: String(row["message"] ?? ""),
    createdAt: String(row["created_at"] ?? "1970-01-01T00:00:00.000Z"),
    ...(typeof seenAt === "string" ? { seenAt } : {}),
  };
}

export async function createVideoFeedback(input: {
  clientId: string;
  sessionId: string;
  workoutId?: string;
  exerciseId: string;
  exerciseName: string;
  videoPath: string;
  message: string;
}): Promise<VideoFeedback> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("לא ניתן לשלוח משוב בלי חשבון מחובר.");
  const message = input.message.trim();
  if (!message) throw new Error("יש לכתוב משוב לפני השליחה.");
  if (!input.videoPath.trim()) throw new Error("לא נמצא סרטון שאליו אפשר לקשר את המשוב.");

  const { data, error } = await supabase
    .from("video_feedback")
    .insert({
      coach_id: user.id,
      client_id: input.clientId,
      session_id: input.sessionId,
    ...(input.workoutId ? { workout_id: input.workoutId } : {}),
      exercise_id: input.exerciseId,
      exercise_name: input.exerciseName,
      video_path: input.videoPath,
      message,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "שליחת המשוב נכשלה.");
  }
  return videoFeedbackFromRow(data as Record<string, unknown>);
}

export async function markVideoFeedbackSeen(feedbackId: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("לא ניתן לסמן משוב בלי חשבון מחובר.");
  const { error } = await supabase
    .from("video_feedback")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", feedbackId)
    .eq("client_id", user.id)
    .is("seen_at", null);
  if (error) throw new Error(error.message);
}