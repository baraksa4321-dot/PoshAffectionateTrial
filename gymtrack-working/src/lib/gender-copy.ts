export function genderText(
  gender: "female" | "male" | undefined,
  feminine: string,
  masculine: string,
) {
  return gender === "male" ? masculine : feminine;
}
