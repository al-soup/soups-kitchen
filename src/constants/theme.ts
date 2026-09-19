export const THEME_STORAGE_KEY = "soups-kitchen-theme";
export const DEFAULT_THEME = "dark" as const;
export const ALL_THEMES = ["dark", "light"] as const;

export type Theme = (typeof ALL_THEMES)[number];

export const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
}[] = [
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "light", label: "Light", description: "Paper background" },
];
