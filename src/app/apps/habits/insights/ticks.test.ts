import { niceTicks } from "./ticks";

describe("niceTicks", () => {
  it.each([
    [7, [0, 2, 4, 6, 8]],
    [8, [0, 2, 4, 6, 8]],
    [43, [0, 20, 40, 60]],
    [100, [0, 50, 100]],
    [3.4, [0, 1, 2, 3, 4]],
    [0.6, [0, 0.2, 0.4, 0.6]],
    [1, [0, 0.5, 1]],
  ])("max %p → %p", (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks);
  });

  it("covers the maximum", () => {
    for (const max of [0.07, 1.3, 9, 11, 58, 999, 1234]) {
      const ticks = niceTicks(max);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
      expect(ticks.length).toBeLessThanOrEqual(6);
    }
  });

  it("honours a minimum step", () => {
    expect(niceTicks(2, 1)).toEqual([0, 1, 2]);
    expect(niceTicks(43, 1)).toEqual([0, 20, 40, 60]);
  });

  it("falls back to 0–1 for an empty chart", () => {
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});
