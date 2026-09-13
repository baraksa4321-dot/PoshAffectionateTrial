import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const read = (relativePath: string) => readFileSync(`${here}/${relativePath}`, "utf8");

const coachRoute = read("../routes/coach.tsx");
const homeRoute = read("../routes/index.tsx");
const sync = read("./supabase-sync.ts");
const migration = read("../../supabase/migrations/59_video_feedback.sql");

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
  });

  test("video feedback is persisted with read state and Realtime publication", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.video_feedback");
    expect(migration).toContain("seen_at TIMESTAMPTZ");
    expect(migration).toContain("GRANT UPDATE (seen_at) ON public.video_feedback TO authenticated");
    expect(migration).toContain("public.is_coach_of(client_id)");
    expect(migration).toContain("ALTER PUBLICATION supabase_realtime ADD TABLE public.video_feedback");
  });
});