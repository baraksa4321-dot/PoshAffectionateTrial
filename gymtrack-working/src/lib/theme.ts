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

export const THEME_STORAGE_KEY = "gymtrack.theme";
export const DEFAULT_THEME: ThemePalette = "rose-gold";

const NIGHT_THEME_COLORS: Record<ThemePalette, string> = {
  pink: "#241a1e",
  blue: "#151e25",
  green: "#15231d",
  black: "#17181c",
  lavender: "#1f1c29",
  peach: "#281d19",
  "rose-gold": "#281c1e",
  "dark-brown": "#211917",
  "light-brown": "#26201d",
  cream: "#27231b",
};

export function defaultThemeForGender(gender: "female" | "male" | undefined): ThemePalette {
  return gender === "male" ? "black" : "rose-gold";
}

export function isThemePalette(value: unknown): value is ThemePalette {
  return THEME_PALETTES.some((palette) => palette.id === value);
}

export function readStoredTheme(): ThemePalette | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePalette(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

export function persistTheme(theme: ThemePalette) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The profile/auth metadata remains the source of truth when storage is unavailable.
  }
}

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  const safeTheme = isThemePalette(theme) ? theme : DEFAULT_THEME;
  document.documentElement.dataset["theme"] = safeTheme;
  if (document.documentElement.classList.contains("night-mode")) {
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", NIGHT_THEME_COLORS[safeTheme]);
  }
}

export function applyNightMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("night-mode", enabled);
  document.documentElement.style.colorScheme = enabled ? "dark" : "light";
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const theme = document.documentElement.dataset["theme"];
  const safeTheme = isThemePalette(theme) ? theme : DEFAULT_THEME;
  themeColor?.setAttribute(
    "content",
    enabled ? NIGHT_THEME_COLORS[safeTheme] : "#f8f7f3",
  );
}
