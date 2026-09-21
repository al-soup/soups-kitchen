import type { Element, Root } from "hast";
import { rehypeMarkQuery } from "./rehypeMarkQuery";

function paragraph(...children: Element["children"]): Root {
  return {
    type: "root",
    children: [
      { type: "element", tagName: "p", properties: {}, children: children },
    ],
  };
}

function toText(node: Root | Element): string {
  return node.children
    .map((child) =>
      child.type === "text"
        ? child.value
        : child.type === "element"
          ? toText(child)
          : ""
    )
    .join("");
}

function marked(tree: Root): string[] {
  const out: string[] = [];
  const walk = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      if (child.tagName === "mark") out.push(toText(child));
      else walk(child);
    }
  };
  walk(tree);
  return out;
}

function run(query: string | undefined, tree: Root): Root {
  rehypeMarkQuery(query)(tree);
  return tree;
}

describe("rehypeMarkQuery", () => {
  it("marks case-insensitive hits and keeps the surrounding text", () => {
    const tree = run(
      "index",
      paragraph({ type: "text", value: "Why use a B-tree Index here?" })
    );
    expect(marked(tree)).toEqual(["Index"]);
    expect(toText(tree)).toBe("Why use a B-tree Index here?");
  });

  it("extends a word-start hit to the end of the word", () => {
    const tree = run(
      "index",
      paragraph({ type: "text", value: "Indexes and reindexing" })
    );
    expect(marked(tree)).toEqual(["Indexes"]);
  });

  it("marks every token of a multi-word query", () => {
    const tree = run(
      "cache pattern",
      paragraph({
        type: "text",
        value: "When is cache-aside the wrong pattern?",
      })
    );
    expect(marked(tree)).toEqual(["cache", "pattern"]);
  });

  it("ignores stop words and one-letter tokens", () => {
    const tree = run(
      "what is a b closure",
      paragraph({ type: "text", value: "What is a closure, b?" })
    );
    expect(marked(tree)).toEqual(["closure"]);
  });

  it("marks inside nested inline elements", () => {
    const tree = run(
      "commit",
      paragraph(
        { type: "text", value: "Two-phase " },
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: "commit" }],
        }
      )
    );
    expect(marked(tree)).toEqual(["commit"]);
  });

  it("treats regex metacharacters in the query as separators", () => {
    const tree = run(
      "o(n) .*",
      paragraph({ type: "text", value: "Worst case O(n) lookup" })
    );
    expect(marked(tree)).toEqual([]);
  });

  it.each([undefined, "", "   ", "the"])(
    "leaves the tree untouched for query %p",
    (query) => {
      const tree = run(query, paragraph({ type: "text", value: "the text" }));
      expect(marked(tree)).toEqual([]);
      expect(tree.children[0]).toMatchObject({
        children: [{ type: "text", value: "the text" }],
      });
    }
  );
});
