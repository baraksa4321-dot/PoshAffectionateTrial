import type { CoachMessage } from "./gym-types";

export type CoachMessagePayload = {
  coach_id: string;
  client_id: string;
  message: string;
};

export type CoachMessageRecord = {
  id: string;
  coach_id: string;
  client_id: string;
  message: string;
  created_at: string;
  is_read?: boolean | null;
};

type UserResult = {
  data: { user: { id: string } | null };
};

type InsertResult = {
  error: unknown | null;
};

type MessageQueryResult = {
  data: CoachMessageRecord[] | null;
  error: unknown | null;
};

type SelectResult = MessageQueryResult;

export type SelectCoachMessages = (clientId: string, coachId: string) => Promise<SelectResult>;

function messageError(error: unknown, fallback: string): Error {
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
  return new Error(fallback);
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
    throw messageError(error, "שגיאה בשמירת ההודעה במסד הנתונים.");
  }
}

export async function loadCoachMessages(
  fetchMessages: () => Promise<MessageQueryResult>,
): Promise<CoachMessage[]> {
  const { data, error } = await fetchMessages();
  if (error) throw messageError(error, "שגיאה בטעינת היסטוריית ההודעות.");
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

export async function fetchCoachMessages(
  select: SelectCoachMessages,
  clientId: string,
  coachId: string,
): Promise<CoachMessage[]> {
  return loadCoachMessages(() => select(clientId, coachId));
}
