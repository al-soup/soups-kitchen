import type { Question } from "@/lib/supabase/types";
import { UNCATEGORIZED } from "./i18n";
import {
  categoryCounts,
  categoryKey,
  listCategories,
  poolFor,
} from "./categories";

let nextId = 1;

function q(
  category: string | null,
  is_for_couples = false,
  difficulty = 1
): Question {
  return {
    id: nextId++,
    text_de: "de",
    text_en: "en",
    category,
    difficulty,
    is_ai_generated: false,
    is_for_couples,
    source: null,
    created_by: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

const questions = [
  q("Fun"),
  q("Fun"),
  q("Ethics"),
  q("Personal", true),
  q("Personal", true),
  q(null),
];

describe("categoryKey", () => {
  it("buckets a null category under the sentinel", () => {
    expect(categoryKey(q(null))).toBe(UNCATEGORIZED);
    expect(categoryKey(q("Fun"))).toBe("Fun");
  });
});

describe("listCategories", () => {
  it("orders by English label with uncategorized last", () => {
    expect(listCategories(questions, "en")).toEqual([
      "Ethics",
      "Fun",
      "Personal",
      UNCATEGORIZED,
    ]);
  });

  it("orders by the German label, not the English key", () => {
    // Ethik, Persönlich, Spaß — not the key order Ethics, Fun, Personal.
    expect(listCategories(questions, "de")).toEqual([
      "Ethics",
      "Personal",
      "Fun",
      UNCATEGORIZED,
    ]);
  });

  it("returns nothing for an empty pool", () => {
    expect(listCategories([], "de")).toEqual([]);
  });
});

describe("categoryCounts", () => {
  it("counts every category including the null bucket", () => {
    expect(categoryCounts(questions)).toEqual({
      Fun: 2,
      Ethics: 1,
      Personal: 2,
      [UNCATEGORIZED]: 1,
    });
  });
});

describe("poolFor", () => {
  const none = new Set<string>();

  it("keeps everything for couple with no category deselected", () => {
    expect(poolFor(questions, "couple", none)).toHaveLength(6);
  });

  it("drops couple-only questions for friends", () => {
    const pool = poolFor(questions, "friends", none);
    expect(pool).toHaveLength(4);
    expect(pool.every((x) => !x.is_for_couples)).toBe(true);
  });

  it("drops deselected categories", () => {
    const pool = poolFor(questions, "couple", new Set(["Fun"]));
    expect(pool).toHaveLength(4);
    expect(pool.some((x) => x.category === "Fun")).toBe(false);
  });

  it("applies group and category filters together", () => {
    const pool = poolFor(questions, "friends", new Set(["Fun"]));
    expect(pool.map((x) => x.category)).toEqual(["Ethics", null]);
  });

  it("can deselect the uncategorized bucket", () => {
    const pool = poolFor(questions, "couple", new Set([UNCATEGORIZED]));
    expect(pool.every((x) => x.category !== null)).toBe(true);
  });

  it("returns an empty pool when everything is deselected", () => {
    const all = new Set(listCategories(questions, "de"));
    expect(poolFor(questions, "couple", all)).toEqual([]);
  });
});
