import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
}> = [
  {
    id: "pink",
    label: "ורוד",
    description: "ורוד־אבקתי, אפרסק, בז׳ חם ושמנת",
    swatch: "#c9788a",
  },
  { id: "blue", label: "תכלת", description: "תכלת שמיים בהירה", swatch: "#65a9dc" },
  { id: "beige", label: "קרם", description: "קרם חם ובז׳ רך", swatch: "#c69a65" },
  { id: "green", label: "ירוק", description: "ירוק עדין ורענן", swatch: "#65ad91" },
  { id: "black", label: "לבן / שחור", description: "ניגודיות נקייה", swatch: "#8d7a9f" },
  { id: "lavender", label: "סגולה", description: "סגול לבנדר בהיר", swatch: "#9c88d0" },
  { id: "peach", label: "אפרסק", description: "אפרסק רך וחמים", swatch: "#ed967e" },
  { id: "mint", label: "מנטה", description: "מנטה בהירה", swatch: "#58bca6" },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme || DEFAULT_THEME;
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
}
