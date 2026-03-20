export const ZVV = {
  bg: "#1a2744",
  bgSecondary: "#243358",
  accent: "#f0c432",
  text: "#ffffff",
  textMuted: "#8899bb",
  danger: "#ff4444",
} as const;

export const TRANSPORT_FILTERS = {
  Train: ["train", "express_train", "strain"],
  Tram: ["tram"],
  Bus: ["bus"],
} as const;

export type TransportFilterKey = keyof typeof TRANSPORT_FILTERS;

export const ALL_FILTER_KEYS = Object.keys(
  TRANSPORT_FILTERS
) as TransportFilterKey[];

export const TRANSPORT_COLORS: Record<string, string> = {
  train: "#e3000f",
  express_train: "#e3000f",
  strain: "#0078c8",
  tram: "#0078c8",
  bus: "#8dc63f",
  ship: "#0fa0c8",
  funicular: "#8b4513",
  cableway: "#8b4513",
};
