import type { UserProfile } from "./gym-types";

export type CalorieEstimate = {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
};

/**
 * Mifflin–St Jeor, with a transparent activity multiplier based only on the
 * number of planned weekly workouts. Missing values intentionally return null.
 */
export function calculateCalorieEstimate(
  profile: Pick<UserProfile, "weight" | "height" | "age" | "gender" | "workoutsPerWeek">,
): CalorieEstimate | null {
  const { weight, height, age, gender, workoutsPerWeek } = profile;
  if (
    !gender ||
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    typeof height !== "number" ||
    !Number.isFinite(height) ||
    height <= 0 ||
    typeof age !== "number" ||
    !Number.isFinite(age) ||
    age <= 0 ||
    typeof workoutsPerWeek !== "number" ||
    !Number.isFinite(workoutsPerWeek) ||
    workoutsPerWeek < 0 ||
    workoutsPerWeek > 14
  ) {
    return null;
  }

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (gender === "male" ? 5 : -161);
  const activityMultiplier =
    workoutsPerWeek === 0
      ? 1.2
      : workoutsPerWeek <= 2
        ? 1.375
        : workoutsPerWeek <= 4
          ? 1.55
          : workoutsPerWeek <= 6
            ? 1.725
            : 1.9;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(bmr * activityMultiplier),
    activityMultiplier,
  };
}
