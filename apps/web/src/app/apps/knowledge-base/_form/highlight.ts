import { toText } from "hast-util-to-text";
import type { Element, Root } from "hast";
import { createLowlight } from "lowlight";
import { visit } from "unist-util-visit";

import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import java from "highlight.js/lib/languages/java";
import sql from "highlight.js/lib/languages/sql";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml"; // html alias
import yaml from "highlight.js/lib/languages/yaml";
import go from "highlight.js/lib/languages/go";
import markdown from "highlight.js/lib/languages/markdown";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";

// Curated set only — keeps the route bundle small. Aliases (js, ts, sh,
// html, yml, …) come from each grammar. Extend = one import + one entry.
const lowlight = createLowlight({
  bash,
  shell,
  javascript,
  typescript,
  json,
  java,
  sql,
  css,
  xml,
  yaml,
  go,
  markdown,
  diff,
  dockerfile,
});

const PREFIX = "language-";

// Local equivalent of rehype-highlight, but registers only the curated
// grammars above (rehype-highlight statically pulls in lowlight's full
// `common` set, defeating bundle curation).
export function rehypeHighlightCurated() {
  return (tree: Root) => {
    visit(tree, "element", (node, _index, parent) => {
      if (
        node.tagName !== "code" ||
        !parent ||
        parent.type !== "element" ||
        parent.tagName !== "pre"
      ) {
        return;
      }

      const lang = languageOf(node);
      if (!lang || !lowlight.registered(lang)) return; // unknown → plain

      const code = toText(node, { whitespace: "pre" });
      const result = lowlight.highlight(lang, code);

      const classes = (node.properties.className ??= []) as string[];
      if (!classes.includes("hljs")) classes.push("hljs");
      node.children = result.children as Element["children"];
    });
  };
}

function languageOf(node: Element): string | undefined {
  const list = node.properties?.className;
  if (!Array.isArray(list)) return undefined;
  for (const c of list) {
    if (typeof c === "string" && c.startsWith(PREFIX)) {
      return c.slice(PREFIX.length).toLowerCase();
    }
  }
  return undefined;
}
