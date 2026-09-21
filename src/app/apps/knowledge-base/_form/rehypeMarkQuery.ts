import type { Element, ElementContent, Root, RootContent } from "hast";

// Postgres `english` stop words (snowball english.stop). plainto_tsquery drops
// them, so they never cause a hit and must not be marked — otherwise "what is
// a closure" lights up "What" in every question.
const STOP_WORDS = new Set(
  (
    "i me my myself we our ours ourselves you your yours yourself yourselves " +
    "he him his himself she her hers herself it its itself they them their " +
    "theirs themselves what which who whom this that these those am is are " +
    "was were be been being have has had having do does did doing a an the " +
    "and but if or because as until while of at by for with about against " +
    "between into through during before after above below to from up down in " +
    "out on off over under again further then once here there when where why " +
    "how all any both each few more most other some such no nor not only own " +
    "same so than too very s t can will just don should now"
  ).split(" ")
);

const MIN_TOKEN_LENGTH = 2;

function buildMatcher(query: string): RegExp | null {
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= MIN_TOKEN_LENGTH && !STOP_WORDS.has(t));
  if (tokens.length === 0) return null;
  // Longest first so "cache" wins over "ca" at the same position.
  const alternatives = [...new Set(tokens)]
    .sort((a, b) => b.length - a.length)
    .join("|");
  // Word-start prefix match, extended to the end of the word: "index" marks
  // "indexes". Approximates the server's stemming; trigram (typo) hits and
  // stems that change the word start stay unmarked.
  return new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${alternatives})[\\p{L}\\p{N}]*`,
    "giu"
  );
}

function splitText(value: string, matcher: RegExp): ElementContent[] | null {
  const parts: ElementContent[] = [];
  let last = 0;
  for (const match of value.matchAll(matcher)) {
    const start = match.index;
    if (start > last) {
      parts.push({ type: "text", value: value.slice(last, start) });
    }
    parts.push({
      type: "element",
      tagName: "mark",
      properties: {},
      children: [{ type: "text", value: match[0] }],
    });
    last = start + match[0].length;
  }
  if (parts.length === 0) return null;
  if (last < value.length) {
    parts.push({ type: "text", value: value.slice(last) });
  }
  return parts;
}

function markHits(node: Root | Element, matcher: RegExp): void {
  const children: RootContent[] = node.children;
  node.children = children.flatMap((child): RootContent[] => {
    if (child.type === "element") markHits(child, matcher);
    if (child.type !== "text") return [child];
    return splitText(child.value, matcher) ?? [child];
  }) as typeof node.children;
}

export function rehypeMarkQuery(query: string = "") {
  const matcher = buildMatcher(query);
  return (tree: Root) => {
    if (matcher) markHits(tree, matcher);
  };
}
