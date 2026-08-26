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
    if (error instanceof Error) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message
    ) {
      throw new Error(error.message);
    }
    throw new Error("שגיאה בשמירת ההודעה במסד הנתונים.");
  }
}
