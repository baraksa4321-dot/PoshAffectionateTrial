export function genderText(
  gender: "female" | "male" | undefined,
  feminine: string,
  masculine: string,
) {
  // Hebrew's masculine form is the concise generic fallback when a profile
  // has not selected a gender; never silently address an unknown user as
  // feminine.
  return gender === "female" ? feminine : masculine;
}
