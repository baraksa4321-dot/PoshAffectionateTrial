import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const read = (relativePath: string) => readFileSync(`${here}/${relativePath}`, "utf8");

const coachRoute = read("../routes/coach.tsx");
const homeRoute = read("../routes/index.tsx");
const sessionRoute = read("../routes/session.$workoutId.tsx");
const sync = read("./supabase-sync.ts");
const notificationService = read("./notification-service.ts");
const migration = read("../../supabase/migrations/59_video_feedback.sql");
const reminderMigration = read("../../supabase/migrations/62_video_feedback_reminders.sql");
const playbackMigration = read("../../supabase/migrations/65_video_feedback_playback_path.sql");
const server = read("../server.ts");

describe("video feedback contracts", () => {
  test("coach feedback is attached to the uploaded video and client", () => {
    expect(coachRoute).toContain("createVideoFeedback");
    expect(coachRoute).toContain("videoPath: entry.videoPath");
    expect(coachRoute).toContain("שליחת משוב למתאמן");
      expect(coachRoute).toContain("onFeedbackSent");
      expect(coachRoute).toContain("dismissedVideoIds");
    expect(sync).toContain('from("video_feedback")');
    expect(coachRoute).toContain("videoPlaybackPath: entry.videoPlaybackPath");
    expect(coachRoute).toContain("workoutVideoStoragePath(entry.videoUrl)");
    expect(sync).toContain("export function workoutVideoStoragePath");
    expect(videoFeedbackSource()).toContain("video_playback_path");
  });

  test("unsupported iPhone sources get a separate browser playback path", () => {
    expect(sync).toContain('fetch("/transcode-workout-video"');
    expect(sync).toContain("videoPlaybackPath: playbackPath");
    expect(server).toContain('url.pathname === "/transcode-workout-video"');
    expect(server).toContain('"libx264"');
    expect(server).toContain('"video/mp4"');
    expect(server).toContain("status: \"failed\"");
  });

  test("workout video states stay bounded and actionable on mobile", () => {
    expect(sessionRoute).toContain('data-testid="performance-video-frame"');
    expect(sessionRoute).toContain('data-testid="performance-video-status"');
    expect(sessionRoute).toContain("aspect-video min-h-24 w-full max-h-52");
    expect(sessionRoute).toContain("isVideoUploading");
    expect(sessionRoute).toContain("retryPerformanceVideo(ei)");
    expect(sessionRoute).toContain("הסרטון נבחר ומועלה ברקע");
    expect(sessionRoute).toContain("הסרטון נשמר, אבל הדפדפן לא הצליח להציג אותו");
  });

  test("owner self rows contribute history and exact video feedback metadata", () => {
    expect(coachRoute).toContain("selfOverviewClient");
    expect(coachRoute).toContain("!clients.some((client) => client.client_id === authUser?.id)");
    expect(coachRoute).toContain("videoFeedbacks: selfVideoFeedbacks");
    expect(coachRoute).toContain("feedback.videoPath === entry.videoPath");
    expect(coachRoute).toContain("feedback.sessionId === sessionId");
  });

  test("the trainee home exposes unread feedback and a seen action", () => {
    expect(homeRoute).toContain('data-testid="video-feedback-home-button"');
    expect(homeRoute).toContain("unreadVideoFeedbackCount");
    expect(homeRoute).toContain("markVideoFeedbackSeen");
    expect(homeRoute).toContain("סימנתי כנקרא");
    expect(homeRoute).toContain("יוסר מהרשימה שלך");
    expect(homeRoute).toContain("!feedback.seenAt");
  });

  test("video feedback is persisted with read state and Realtime publication", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.video_feedback");
    expect(migration).toContain("seen_at TIMESTAMPTZ");
    expect(migration).toContain("GRANT UPDATE (seen_at) ON public.video_feedback TO authenticated");
    expect(migration).toContain("public.is_coach_of(client_id)");
    expect(migration).toContain("ALTER PUBLICATION supabase_realtime ADD TABLE public.video_feedback");
    expect(playbackMigration).toContain("video_playback_path TEXT");
  });

  test("unread feedback schedules one durable five-day reminder and cancels it when seen", () => {
    expect(notificationService).toContain("schedule_video_feedback_reminder");
    expect(notificationService).toContain("cancel_video_feedback_reminder");
    expect(homeRoute).toContain("scheduleVideoFeedbackReminder");
    expect(reminderMigration).toContain("public.video_feedback_reminders");
    expect(reminderMigration).toContain("p_remind_at > NOW()");
    expect(reminderMigration).toContain("cancel_video_feedback_reminder");
  });
});

function videoFeedbackSource() {
  return read("./video-feedback.ts");
}