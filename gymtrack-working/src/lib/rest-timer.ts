export type RestTimerSnapshot = {
  rest: number;
  restFinished: boolean;
  restPaused: boolean;
  restEndsAt: number | null;
};

export function reconcileRestTimer(snapshot: RestTimerSnapshot, now: number) {
  const hasExpired =
    !snapshot.restPaused &&
    snapshot.restEndsAt !== null &&
    snapshot.restEndsAt <= now;

  return {
    rest: hasExpired ? 0 : snapshot.rest,
    restFinished: hasExpired || snapshot.restFinished,
    restEndsAt: hasExpired ? null : snapshot.restEndsAt,
    shouldNotify: hasExpired && snapshot.rest > 0 && !snapshot.restFinished,
  };
}