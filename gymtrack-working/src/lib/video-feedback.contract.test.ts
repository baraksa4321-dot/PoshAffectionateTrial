import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const read = (relativePath: string) => readFileSync(`${here}/${relativePath}`, "utf8");

const coachRoute = read("../routes/coach.tsx");
const homeRoute = read("../routes/index.tsx");
const sync = read("./supabase-sync.ts");
const notificationService = read("./notification-service.ts");
const migration = read("../../supabase/migrations/59_video_feedback.sql");
const reminderMigration = read("../../supabase/migrations/62_video_feedback_reminders.sql");

describe("video feedback contracts", () => {
  test("coach feedback is attached to the uploaded video and client", () => {
    expect(coachRoute).toContain("createVideoFeedback");
    expect(coachRoute).toContain("videoPath: entry.videoPath");
    expect(coachRoute).toContain("שליחת משוב למתאמן");
    expect(sync).toContain('from("video_feedback")');
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