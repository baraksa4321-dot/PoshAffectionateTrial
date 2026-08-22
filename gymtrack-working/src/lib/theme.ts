import type { ThemePalette } from "./gym-types";

export const THEME_PALETTES: Array<{
  id: ThemePalette;
  label: string;
  description: string;
  swatch: string;
}> = [
  {
    id: "pink",
    label: "Blush / Ivory",
    description: "ורוד־אבקתי, אפרסק, בז׳ חם ושמנת",
    swatch: "#c9788a",
  },
];

export const DEFAULT_THEME: ThemePalette = "pink";

export function applyTheme(theme: ThemePalette | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme === "pink" ? "pink" : DEFAULT_THEME;
  document.documentElement.style.colorScheme = "light";
}
