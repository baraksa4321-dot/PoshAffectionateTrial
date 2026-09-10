import type { CoachMessage } from "./gym-types";

function messageTimestamp(message: CoachMessage) {
  const timestamp = Date.parse(message.createdAt);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

export function getLatestVisibleCoachMessage(
  messages: CoachMessage[] | undefined,
  dismissedMessageIds: string[] = [],
): CoachMessage | null {
  const dismissed = new Set(dismissedMessageIds);
  return (
    [...(messages ?? [])]
      .filter((message) => !dismissed.has(message.id))
      .sort((a, b) => messageTimestamp(b) - messageTimestamp(a))[0] ?? null
  );
}