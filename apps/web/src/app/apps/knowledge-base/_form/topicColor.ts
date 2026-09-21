export type TopicSwatch = {
  solid: string;
  tint: string;
  border: string;
  deep: string;
};

// Curated 12-swatch palette: same mid-lightness / mid-chroma family.
// First 5 match the design handoff. The rest were picked for distance (OKLab)
// from every other swatch, so two topics rarely read as the same colour.
const PALETTE: TopicSwatch[] = [
  { solid: "#bb4a22", tint: "#f8eae1", border: "#ecc9b6", deep: "#8f3614" }, // rust
  { solid: "#a67a1e", tint: "#f6efda", border: "#e6d7a8", deep: "#7b5a11" }, // gold
  { solid: "#2f7d6b", tint: "#ddf0ea", border: "#b3ddcf", deep: "#1d5d4f" }, // teal
  { solid: "#3a5f8f", tint: "#e4edf7", border: "#bbd0e7", deep: "#264764" }, // steel
  { solid: "#9c3a63", tint: "#f6e4ed", border: "#e6bdd2", deep: "#722847" }, // plum
  { solid: "#6b5db4", tint: "#ece9f7", border: "#cdc6e6", deep: "#4a3f8a" }, // iris
  { solid: "#577a3a", tint: "#e8eedd", border: "#c5d3aa", deep: "#3e5826" }, // olive
  { solid: "#0a8fd1", tint: "#e2f2f9", border: "#b1dbf0", deep: "#086b9d" }, // sky
  { solid: "#a57590", tint: "#f4eef2", border: "#e2d3db", deep: "#7c586c" }, // mauve
  { solid: "#8a6b5c", tint: "#f1edeb", border: "#dad0cb", deep: "#685045" }, // umber
  { solid: "#019f68", tint: "#e1f3ed", border: "#aee0cf", deep: "#01774e" }, // jade
  { solid: "#6b8d95", tint: "#edf1f2", border: "#d0dbdd", deep: "#506a70" }, // slate
];

// A name hash cannot rule out two topics sharing a swatch. This seed was
// searched so that the topics in use (prod + seed.sql) all differ; if a new
// topic collides, re-run the search or store the swatch on the tag.
const HASH_SEED = 0xb7d899cb;

// Seeded FNV-1a 32-bit on lowercased name → stable index. Same name always
// maps to the same swatch across reloads + sessions. The xor-fold matters:
// FNV's low bits barely mix, and `% PALETTE.length` reads exactly those.
function hash(name: string): number {
  let h = HASH_SEED;
  const s = name.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

export function topicColorFor(name: string | null | undefined): TopicSwatch {
  if (!name) return PALETTE[0];
  return PALETTE[hash(name) % PALETTE.length];
}
