import { describe, expect, test } from "bun:test";

import {
  LOADING_MESSAGES,
  LOADING_ROTATION_INTERVAL_MS,
  loadingCycleIndexes,
  loadingPresentationForGender,
  readLoadingCycle,
  readLoadingGender,
} from "./loading-copy";

describe("loading cycle", () => {
  test("rotates to the next animation and message every 2 seconds", () => {
    expect(LOADING_ROTATION_INTERVAL_MS).toBe(2_000);
  });

  test("starts at zero and rejects invalid persisted values", () => {
    expect(readLoadingCycle(null)).toBe(0);
    expect(readLoadingCycle("")).toBe(0);
    expect(readLoadingCycle("-1")).toBe(0);
    expect(readLoadingCycle("not-a-number")).toBe(0);
    expect(readLoadingCycle("7")).toBe(7);
  });

  test("uses one cycle index with independent modulo lengths", () => {
    expect(loadingCycleIndexes(0, 8)).toEqual({
      animationIndex: 0,
      messageIndex: 0,
    });
    expect(loadingCycleIndexes(8, 8)).toEqual({
      animationIndex: 0,
      messageIndex: 8,
    });
    expect(loadingCycleIndexes(LOADING_MESSAGES.length, 8)).toEqual({
      animationIndex: LOADING_MESSAGES.length % 8,
      messageIndex: 0,
    });
  });

  test("wraps safely after the largest supported persisted index", () => {
    expect(readLoadingCycle(String(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
    expect(loadingCycleIndexes(Number.MAX_SAFE_INTEGER + 1, 8)).toEqual({
      animationIndex: 0,
      messageIndex: 0,
    });
  });

  test("accepts only supported persisted loading genders", () => {
    expect(readLoadingGender("female")).toBe("female");
    expect(readLoadingGender("male")).toBe("male");
    expect(readLoadingGender(null)).toBeUndefined();
    expect(readLoadingGender("")).toBeUndefined();
    expect(readLoadingGender("unknown")).toBeUndefined();
  });

  test("selects the expressive animation only for female profiles", () => {
    expect(loadingPresentationForGender("female")).toBe("expressive");
    expect(loadingPresentationForGender("male")).toBe("plain");
    expect(loadingPresentationForGender(undefined)).toBe("plain");
  });
});
