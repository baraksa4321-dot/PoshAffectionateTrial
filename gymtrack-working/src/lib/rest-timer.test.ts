import { describe, expect, test } from "bun:test";
import { reconcileRestTimer } from "./rest-timer";

describe("rest timer background reconciliation", () => {
  test("completes an active timer that expired while the app was hidden", () => {
    expect(
      reconcileRestTimer(
        {
          rest: 4,
          restFinished: false,
          restPaused: false,
          restEndsAt: 10_000,
        },
        10_001,
      ),
    ).toEqual({
      rest: 0,
      restFinished: true,
      restEndsAt: null,
      shouldNotify: true,
    });
  });

  test("does not notify a paused or already completed timer", () => {
    expect(
      reconcileRestTimer(
        {
          rest: 4,
          restFinished: false,
          restPaused: true,
          restEndsAt: 10_000,
        },
        20_000,
      ).shouldNotify,
    ).toBe(false);
    expect(
      reconcileRestTimer(
        {
          rest: 0,
          restFinished: true,
          restPaused: false,
          restEndsAt: null,
        },
        20_000,
      ).shouldNotify,
    ).toBe(false);
  });
});