import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
  previewSurface: string;
  previewAccent: string;
}> = [
  {
    id: "pink",
    label: "ורוד",
    description: "ורוד רך עם וריאציות בהירות ועמוקות",
    swatch: "#d58a9b",
    previewSurface: "#fff7f9",
    previewAccent: "#e6a7b5",
  },
  { id: "blue", label: "תכלת", description: "תכלת שקט עם וריאציות קרירות", swatch: "#8ebfd2", previewSurface: "#f5fbfd", previewAccent: "#b9dce8" },
  { id: "lavender", label: "סגול", description: "סגול מעושן עם לילך בהיר", swatch: "#9782c3", previewSurface: "#faf8ff", previewAccent: "#d2c6e9" },
  { id: "green", label: "ירוק", description: "ירוק מרווה עם גוונים טבעיים", swatch: "#8fb49f", previewSurface: "#f5faf7", previewAccent: "#c2d9ca" },
  { id: "black", label: "שחור", description: "שחור, אפור ופחם על רקע לבן", swatch: "#171719", previewSurface: "#ffffff", previewAccent: "#dedde0" },
  { id: "dark-brown", label: "חום כהה", description: "אספרסו, קקאו וגווני אדמה עמוקים", swatch: "#5b4136", previewSurface: "#fffdfb", previewAccent: "#c9b0a4" },
  { id: "light-brown", label: "חום בהיר", description: "טאופ, עץ בהיר וחול חם", swatch: "#b58f76", previewSurface: "#fffdfb", previewAccent: "#e3d2c5" },
  { id: "cream", label: "קרם", description: "קרם, שנהב וחמאה בהירה", swatch: "#c9aa72", previewSurface: "#fffefa", previewAccent: "#eee2c7" },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = theme || DEFAULT_THEME;
}

export function applyNightMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("night-mode", enabled);
  document.documentElement.style.colorScheme = enabled ? "dark" : "light";
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", enabled ? "#19191c" : "#ffffff");
}
