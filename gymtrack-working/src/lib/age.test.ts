import { describe, expect, test } from "bun:test";
import { calculateAge, dateOfBirthInputBounds, isValidDateOfBirth } from "./age";

describe("date of birth age calculation", () => {
  const today = new Date(2024, 6, 15);

  test("calculates completed years before and after the birthday", () => {
    expect(calculateAge("2000-07-16", today)).toBe(23);
    expect(calculateAge("2000-07-15", today)).toBe(24);
    expect(calculateAge("2000-07-14", today)).toBe(24);
  });

  test("handles year transitions and leap-day birthdays deterministically", () => {
    expect(calculateAge("2000-12-31", new Date(2024, 0, 1))).toBe(23);
    expect(calculateAge("2000-02-29", new Date(2023, 1, 28))).toBe(22);
    expect(calculateAge("2000-02-29", new Date(2023, 2, 1))).toBe(23);
    expect(calculateAge("2000-02-29", new Date(2024, 1, 29))).toBe(24);
  });

  test("rejects impossible and future dates", () => {
    expect(isValidDateOfBirth("2000-02-30", today)).toBe(false);
    expect(isValidDateOfBirth("2024-07-16", today)).toBe(false);
    expect(calculateAge("2024-07-16", today)).toBeUndefined();
    expect(calculateAge("not-a-date", today)).toBeUndefined();
    expect(isValidDateOfBirth("1904-01-01", today)).toBe(true);
    expect(isValidDateOfBirth("1903-12-31", today)).toBe(false);
    expect(dateOfBirthInputBounds(today)).toEqual({
      min: "1904-01-01",
      max: "2024-07-15",
    });
  });
});