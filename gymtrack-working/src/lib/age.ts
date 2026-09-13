const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function dateParts(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function todayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function earliestDateOfBirthInputValue(date = new Date()) {
  return `${date.getFullYear() - 120}-01-01`;
}

export function isValidDateOfBirth(value: string, today = new Date()) {
  const parts = dateParts(value);
  if (!parts) return false;
  return (
    value >= earliestDateOfBirthInputValue(today) &&
    value <= todayDateInputValue(today)
  );
}

export function dateOfBirthInputBounds(date = new Date()) {
  return {
    min: earliestDateOfBirthInputValue(date),
    max: todayDateInputValue(date),
  };
}

/** Calculates a person's completed years without timezone-dependent date drift. */
export function calculateAge(dateOfBirth?: string, today = new Date()) {
  if (!dateOfBirth || !isValidDateOfBirth(dateOfBirth, today)) return undefined;
  const birth = dateParts(dateOfBirth);
  if (!birth) return undefined;

  let age = today.getFullYear() - birth.year;
  const birthdayPassed =
    today.getMonth() + 1 > birth.month ||
    (today.getMonth() + 1 === birth.month && today.getDate() >= birth.day);
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? age : undefined;
}