import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
}> = [
  { id: "pink", label: "ורוד", description: "ורוד פודרה וברי רגוע", swatch: "#b64480" },
  { id: "blue", label: "כחול", description: "כחול שמיים נקי", swatch: "#4779a8" },
  { id: "beige", label: "בז׳", description: "קרם, חול וחום רך", swatch: "#a67b57" },
  { id: "green", label: "ירוק", description: "מרווה טבעית ועדינה", swatch: "#4f816f" },
  { id: "yellow", label: "צהוב", description: "חמנייה חמימה ופסטלית", swatch: "#a47a28" },
  { id: "black", label: "שחור", description: "כהה, אלגנטי ונעים לעין", swatch: "#b89a72" },
  { id: "lavender", label: "לבנדר", description: "סגול מעושן ורך", swatch: "#7b68a6" },
  { id: "peach", label: "אפרסק", description: "אפרסק בהיר וחמים", swatch: "#b86458" },
  { id: "mint", label: "מנטה", description: "מנטה מרעננת ונקייה", swatch: "#3d8b7b" },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme || DEFAULT_THEME;
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
}
