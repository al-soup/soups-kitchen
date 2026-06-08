export type TopicSwatch = {
  solid: string;
  tint: string;
  border: string;
  deep: string;
};

// Curated 8-swatch palette: same mid-lightness / mid-chroma family.
// First 5 match the design handoff; last 3 extend it to cover more topics
// before any one swatch repeats.
const PALETTE: TopicSwatch[] = [
  { solid: "#bb4a22", tint: "#f8eae1", border: "#ecc9b6", deep: "#8f3614" }, // rust
  { solid: "#a67a1e", tint: "#f6efda", border: "#e6d7a8", deep: "#7b5a11" }, // gold
  { solid: "#2f7d6b", tint: "#ddf0ea", border: "#b3ddcf", deep: "#1d5d4f" }, // teal
  { solid: "#3a5f8f", tint: "#e4edf7", border: "#bbd0e7", deep: "#264764" }, // steel
  { solid: "#9c3a63", tint: "#f6e4ed", border: "#e6bdd2", deep: "#722847" }, // plum
  { solid: "#6b5db4", tint: "#ece9f7", border: "#cdc6e6", deep: "#4a3f8a" }, // iris
  { solid: "#b85c3a", tint: "#f8e6dd", border: "#eec5b1", deep: "#8a4124" }, // copper
  { solid: "#577a3a", tint: "#e8eedd", border: "#c5d3aa", deep: "#3e5826" }, // olive
];

// FNV-1a 32-bit on lowercased name → stable index. Same name always
// maps to the same swatch across reloads + sessions.
function hash(name: string): number {
  let h = 0x811c9dc5;
  const s = name.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function topicColorFor(name: string | null | undefined): TopicSwatch {
  if (!name) return PALETTE[0];
  return PALETTE[hash(name) % PALETTE.length];
}
