import type { CoachMessage } from "./gym-types";

export type CoachMessagePayload = {
  coach_id: string;
  client_id: string;
  message: string;
};

type UserResult = {
  data: { user: { id: string } | null };
};

type InsertResult = {
  error: unknown | null;
};

type MessageQueryResult = {
  data: Array<{
    id: string;
    coach_id: string;
    client_id: string;
    message: string;
    created_at: string;
    is_read?: boolean | null;
  }> | null;
  error: unknown | null;
};

function messageError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return new Error(error.message);
  }
  return new Error("שגיאה בגישה להודעות המאמן.");
}

export async function sendCoachMessage(
  getUser: () => Promise<UserResult>,
  insert: (payload: CoachMessagePayload) => Promise<InsertResult>,
  clientId: string,
  message: string,
): Promise<void> {
  const {
    data: { user },
  } = await getUser();
  if (!user) throw new Error("יש להתחבר מחדש כדי לשלוח הודעה.");

  const { error } = await insert({
    coach_id: user.id,
    client_id: clientId,
    message,
  });
  if (error) {
    throw messageError(error);
  }
}

export async function loadCoachMessages(
  fetchMessages: () => Promise<MessageQueryResult>,
): Promise<CoachMessage[]> {
  const { data, error } = await fetchMessages();
  if (error) throw messageError(error);
  return (data ?? []).map((row) => {
    const message: CoachMessage = {
      id: row.id,
      coachId: row.coach_id,
      clientId: row.client_id,
      message: row.message,
      createdAt: row.created_at,
    };
    if (row.is_read !== null && row.is_read !== undefined) message.isRead = row.is_read;
    return message;
  });
}
