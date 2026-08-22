import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
}> = [
  {
    id: "pink",
    label: "ורוד־ניוד",
    description: "ורוד רך, ניוד ופסטל עדין",
    swatch: "#d58a9b",
  },
  { id: "blue", label: "כחול רגוע", description: "כחול פסטלי ורגוע", swatch: "#9fc4d6" },
  { id: "beige", label: "ניטרלי חם", description: "קרם, אבן ומוקה", swatch: "#a78775" },
  { id: "green", label: "מרווה", description: "ירוק מרווה טבעי", swatch: "#a9c3b2" },
  { id: "black", label: "כהה מודרני", description: "שחור, פחם וניגודיות נקייה", swatch: "#23252a" },
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
