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
  {
    id: "blue",
    label: "כחול",
    description: "כחול נקי עם גוונים בהירים ועמוקים",
    swatch: "#3b82b5",
    previewSurface: "#ffffff",
    previewAccent: "#bfe5f5",
  },
  {
    id: "green",
    label: "ירוק",
    description: "ירוק טבעי עם גוונים בהירים ועמוקים",
    swatch: "#3f8a67",
    previewSurface: "#ffffff",
    previewAccent: "#c5ead5",
  },
  {
    id: "black",
    label: "שחור",
    description: "שחור, אפור ופחם על רקע לבן",
    swatch: "#171719",
    previewSurface: "#ffffff",
    previewAccent: "#dedde0",
  },
  {
    id: "lavender",
    label: "לבנדר",
    description: "סגול מעושן עם לילך בהיר",
    swatch: "#9782c3",
    previewSurface: "#faf8ff",
    previewAccent: "#d2c6e9",
  },
  {
    id: "peach",
    label: "אפרסק",
    description: "אפרסק רך עם גוונים חמים",
    swatch: "#d69b7c",
    previewSurface: "#fff8f4",
    previewAccent: "#f0c7b1",
  },
  {
    id: "rose-gold",
    label: "רוז גולד",
    description: "רוז גולד אלגנטי עם ורוד מאובק וזהב עדין",
    swatch: "#c98283",
    previewSurface: "#fff8f6",
    previewAccent: "#e8bbb0",
  },
  {
    id: "dark-brown",
    label: "חום כהה",
    description: "אספרסו, קקאו וגווני אדמה עמוקים",
    swatch: "#5b4136",
    previewSurface: "#fffdfb",
    previewAccent: "#c9b0a4",
  },
  {
    id: "light-brown",
    label: "חום בהיר",
    description: "טאופ, עץ בהיר וחול חם",
    swatch: "#b58f76",
    previewSurface: "#fffdfb",
    previewAccent: "#e3d2c5",
  },
  {
    id: "cream",
    label: "קרם",
    description: "קרם, שנהב וחמאה בהירה",
    swatch: "#c9aa72",
    previewSurface: "#fffefa",
    previewAccent: "#eee2c7",
  },
];

export const DEFAULT_THEME: ThemePalette = "light-brown";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  // Removed palettes and legacy values fall back safely without overwriting
  // an existing valid palette selected by the user.
  const safeTheme =
    theme === ("mint" as ThemePalette) ||
    theme === ("beige" as ThemePalette) ||
    theme === ("yellow" as ThemePalette)
      ? DEFAULT_THEME
      : theme || DEFAULT_THEME;
  document.documentElement.dataset["theme"] = safeTheme;
}

export function applyNightMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("night-mode", enabled);
  document.documentElement.style.colorScheme = enabled ? "dark" : "light";
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute("content", enabled ? "#101116" : "#f8f7f3");
}
