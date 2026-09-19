import type { ActionCount, ScoresByType } from "@/lib/supabase/types";
import {
  addDays,
  computeStreaks,
  isoWeekday,
  rankActions,
  weekdayAverages,
  weeklyTotals,
} from "./insights";

// 2026-09-16 is a Wednesday.
const TODAY = "2026-09-16";

function day(date: string, score: number) {
  return { completed_date: date, total_score: score, habit_ids: [1] };
}

describe("date helpers", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("maps Monday to 0 and Sunday to 6", () => {
    expect(isoWeekday("2026-09-14")).toBe(0);
    expect(isoWeekday("2026-09-20")).toBe(6);
  });
});

describe("computeStreaks", () => {
  it("counts the current streak up to today", () => {
    const scores: ScoresByType = {
      1: [day("2026-09-14", 1), day("2026-09-15", 2), day("2026-09-16", 1)],
    };
    expect(computeStreaks(scores, TODAY)).toMatchObject({
      current: 3,
      longest: 3,
      activeDays: 3,
    });
  });

  it("keeps the streak alive when today is still empty", () => {
    const scores: ScoresByType = {
      1: [day("2026-09-14", 1), day("2026-09-15", 2)],
    };
    expect(computeStreaks(scores, TODAY).current).toBe(2);
  });

  it("resets the streak after a gap and remembers the longest run", () => {
    const scores: ScoresByType = {
      1: [
        day("2026-09-01", 1),
        day("2026-09-02", 1),
        day("2026-09-03", 1),
        day("2026-09-04", 1),
        day("2026-09-16", 1),
      ],
    };
    expect(computeStreaks(scores, TODAY)).toMatchObject({
      current: 1,
      longest: 4,
    });
  });

  it("treats a day as active when any type scored", () => {
    const scores: ScoresByType = {
      1: [day("2026-09-15", 1)],
      3: [day("2026-09-16", 2)],
    };
    expect(computeStreaks(scores, TODAY).current).toBe(2);
  });

  it("ignores zero-score rows", () => {
    expect(computeStreaks({ 1: [day(TODAY, 0)] }, TODAY).current).toBe(0);
  });
});

describe("weeklyTotals", () => {
  it("buckets Mon–Sun weeks oldest first, current week last", () => {
    const scores: ScoresByType = {
      1: [day("2026-09-14", 2), day("2026-09-16", 3), day("2026-09-13", 5)],
      3: [day("2026-09-15", 1)],
    };
    const weeks = weeklyTotals(scores, TODAY, 2);
    expect(weeks.map((w) => w.weekStart)).toEqual(["2026-09-07", "2026-09-14"]);
    expect(weeks[0]).toMatchObject({ byType: { 1: 5 }, total: 5 });
    expect(weeks[1]).toMatchObject({ byType: { 1: 5, 3: 1 }, total: 6 });
  });
});

describe("weekdayAverages", () => {
  it("averages each weekday over the window", () => {
    const scores: ScoresByType = {
      1: [day("2026-09-14", 4), day("2026-09-07", 2)],
    };
    const buckets = weekdayAverages(scores, TODAY, 2);
    expect(buckets[0]).toMatchObject({ label: "Mon", total: 3 });
    expect(buckets[1].total).toBe(0);
  });
});

describe("rankActions", () => {
  const action = (
    id: number,
    name: string,
    level: number,
    habitCount: number
  ): ActionCount => ({
    id,
    name,
    description: null,
    type: 1,
    level,
    habitCount,
  });

  it("ranks by count × level with shares summing to 1", () => {
    const ranked = rankActions([
      action(1, "Stretch", 1, 4),
      action(2, "Cycling", 4, 2),
      action(3, "Unused", 3, 0),
    ]);
    expect(ranked.map((a) => a.name)).toEqual(["Cycling", "Stretch"]);
    expect(ranked[0]).toMatchObject({ score: 8, share: 8 / 12 });
    expect(ranked[1]).toMatchObject({ score: 4, share: 4 / 12 });
  });

  it("folds the tail into an Other row", () => {
    const ranked = rankActions(
      [
        action(1, "A", 1, 5),
        action(2, "B", 1, 4),
        action(3, "C", 1, 3),
        action(4, "D", 1, 2),
      ],
      2
    );
    expect(ranked.map((a) => a.name)).toEqual(["A", "B", "Other (2)"]);
    expect(ranked[2]).toMatchObject({ count: 5, score: 5 });
  });

  it("returns nothing without habits", () => {
    expect(rankActions([action(1, "A", 1, 0)])).toEqual([]);
  });
});
