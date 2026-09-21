const TARGET_INTERVALS = 4;

/**
 * Y-axis ticks from 0 up to the first "nice" value (1/2/5 × 10ⁿ steps) at or
 * above `max`, so bars scale against a round number instead of the tallest bar.
 * `minStep` keeps count-like data off fractional ticks.
 */
export function niceTicks(max: number, minStep = 0): number[] {
  if (!(max > 0)) return [0, Math.max(1, minStep)];
  const rawStep = max / TARGET_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const factor = [1, 2, 5, 10].find((f) => f * magnitude >= rawStep) ?? 10;
  const step = Math.max(factor * magnitude, minStep);
  const count = Math.ceil(max / step - 1e-9);
  // Multiply per tick (not accumulate) and round away float noise like 0.30000000000000004.
  return Array.from({ length: count + 1 }, (_, i) =>
    Number((i * step).toPrecision(12))
  );
}
