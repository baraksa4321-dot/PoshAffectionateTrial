import { describe, expect, test } from "bun:test";
import { getLatestVisibleCoachMessage } from "./message-history";

const messages = [
  {
    id: "older-message",
    coachId: "coach-a",
    clientId: "client-a",
    message: "הודעה ישנה",
    createdAt: "2026-08-26T08:00:00.000Z",
  },
  {
    id: "newer-message",
    coachId: "coach-a",
    clientId: "client-a",
    message: "הודעה חדשה",
    createdAt: "2026-08-26T10:00:00.000Z",
  },
];

describe("coach message notice selection", () => {
  test("renders the newest distinct message and preserves the source collection", () => {
    const original = [...messages];

    expect(getLatestVisibleCoachMessage(messages)?.id).toBe("newer-message");
    expect(messages).toEqual(original);
  });

  test("falls back to the next newest message when the newest is dismissed", () => {
    expect(getLatestVisibleCoachMessage(messages, ["newer-message"])).toEqual(messages[0]);
  });
});