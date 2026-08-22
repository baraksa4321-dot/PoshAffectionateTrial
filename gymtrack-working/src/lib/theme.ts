import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
}> = [
  { id: "pink", label: "ורוד", description: "ורוד אבטיח קיצי", swatch: "#e9789f" },
  { id: "blue", label: "כחול", description: "כחול שמיים בהיר", swatch: "#65a9dc" },
  { id: "beige", label: "חול", description: "חול ים ווניל רך", swatch: "#c69a65" },
  { id: "green", label: "ירוק", description: "ירוק מלון רענן", swatch: "#65ad91" },
  { id: "yellow", label: "צהוב", description: "לימון שמשי ועדין", swatch: "#d8ad4c" },
  { id: "black", label: "לילה", description: "שמיים כהים עם נגיעת קיץ", swatch: "#8d7a9f" },
  { id: "lavender", label: "לבנדר", description: "לבנדר פרחוני בהיר", swatch: "#9c88d0" },
  { id: "peach", label: "אפרסק", description: "אפרסק קורן", swatch: "#ed967e" },
  { id: "mint", label: "מנטה", description: "מנטה קרירה ומרעננת", swatch: "#58bca6" },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme || DEFAULT_THEME;
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
}
