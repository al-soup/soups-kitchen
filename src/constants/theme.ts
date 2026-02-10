export const THEME_STORAGE_KEY = "soups-kitchen-theme";
export const DEFAULT_THEME = "light" as const;
export const NON_DEFAULT_THEMES = ["dark", "neo-brutalist"] as const;
export const ALL_THEMES = [DEFAULT_THEME, ...NON_DEFAULT_THEMES] as const;

export type Theme = (typeof ALL_THEMES)[number];
