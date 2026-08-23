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
    label: "ורוד־ניוד",
    description: "ורוד רך, ניוד ופסטל עדין",
    swatch: "#d58a9b",
    previewSurface: "#fff7f9",
    previewAccent: "#e6a7b5",
  },
  { id: "blue", label: "כחול רגוע", description: "כחול פסטלי ורגוע", swatch: "#9fc4d6", previewSurface: "#f4fbfe", previewAccent: "#b9dce9" },
  { id: "beige", label: "ניטרלי חם", description: "קרם, אבן ומוקה", swatch: "#a78775", previewSurface: "#fcf8f4", previewAccent: "#d8c1b1" },
  { id: "green", label: "מרווה", description: "ירוק מרווה טבעי", swatch: "#a9c3b2", previewSurface: "#f4faf6", previewAccent: "#c4dccb" },
  { id: "black", label: "נייטרלי נקי", description: "רקע בהיר, שחור לקריאות וצבע ניטרלי", swatch: "#b9aeb3", previewSurface: "#f7f7f7", previewAccent: "#d8d0d4" },
  { id: "lavender", label: "סגולה", description: "סגול לבנדר בהיר", swatch: "#9c88d0", previewSurface: "#faf8ff", previewAccent: "#d1c5ed" },
  { id: "peach", label: "אפרסק", description: "אפרסק רך וחמים", swatch: "#ed967e", previewSurface: "#fff8f5", previewAccent: "#f5c0b0" },
  { id: "mint", label: "מנטה", description: "מנטה בהירה", swatch: "#58bca6", previewSurface: "#f2fcf9", previewAccent: "#afe0d3" },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme || DEFAULT_THEME;
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
}
