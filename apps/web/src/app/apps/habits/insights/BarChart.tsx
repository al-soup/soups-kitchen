import type { CSSProperties } from "react";
import type { ActionType } from "@/lib/supabase/types";
import { actionTypeLabel } from "@/lib/actionType";
import { habitScoreColor } from "@/lib/badgeStyles";
import type { ScoreByType } from "./insights";
import { niceTicks } from "./ticks";
import styles from "./BarChart.module.css";

/** Ramp step used for series fills; mid-ramp keeps both themes inside the lightness band. */
export const SERIES_LEVEL = 4;

export type Bar = {
  key: string;
  label: string;
  byType: ScoreByType;
  total: number;
  /** Longer form of `label` for the tooltip and the data table. */
  detail?: string;
};

interface BarChartProps {
  title: string;
  bars: Bar[];
  types: ActionType[];
  format?: (value: number) => string;
}

const defaultFormat = (v: number) =>
  Number.isInteger(v) ? String(v) : v.toFixed(1);

export function BarChart({
  title,
  bars,
  types,
  format = defaultFormat,
}: BarChartProps) {
  const dataMax = Math.max(0, ...bars.map((b) => b.total));
  const isCountLike = bars.every((b) => Number.isInteger(b.total));
  const ticks = niceTicks(dataMax, isCountLike ? 1 : 0);
  const max = ticks[ticks.length - 1];
  const stacked = types.length > 1;
  const hasDetail = bars.some((b) => b.detail);

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span>{title}</span>
        {stacked && (
          <span className={styles.legend}>
            {types.map((type) => (
              <span key={type} className={styles.legendKey}>
                <span
                  className={styles.swatch}
                  style={{ background: habitScoreColor(type, SERIES_LEVEL) }}
                />
                {actionTypeLabel(type)}
              </span>
            ))}
          </span>
        )}
      </figcaption>

      <div className={styles.plot} role="img" aria-label={title}>
        <div className={styles.yAxis} aria-hidden="true">
          {/* In-flow copy of the widest label: the real ticks are absolutely
              positioned and cannot size the column. */}
          <span className={styles.yAxisSizer}>{format(max)}</span>
          {ticks.map((tick) => (
            <span
              key={tick}
              className={styles.tick}
              style={{ "--at": tick / max } as CSSProperties}
            >
              {format(tick)}
            </span>
          ))}
        </div>
        <div className={styles.bars}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className={styles.gridline}
              data-baseline={tick === 0 || undefined}
              style={{ "--at": tick / max } as CSSProperties}
            />
          ))}
          {bars.map((bar) => (
            <div key={bar.key} className={styles.column} tabIndex={0}>
              <div className={styles.stack}>
                {types
                  .filter((type) => (bar.byType[type] ?? 0) > 0)
                  .map((type) => (
                    <span
                      key={type}
                      className={styles.segment}
                      style={{
                        height: `${((bar.byType[type] ?? 0) / max) * 100}%`,
                        background: habitScoreColor(type, SERIES_LEVEL),
                      }}
                    />
                  ))}
              </div>
              <span className={styles.axisLabel}>{bar.label}</span>
              <div className={styles.tooltip}>
                <strong>{format(bar.total)}</strong>
                <span>{bar.detail ?? bar.label}</span>
                {stacked &&
                  types
                    .filter((type) => (bar.byType[type] ?? 0) > 0)
                    .map((type) => (
                      <span key={type} className={styles.tooltipRow}>
                        <span
                          className={styles.tooltipKey}
                          style={{
                            background: habitScoreColor(type, SERIES_LEVEL),
                          }}
                        />
                        {actionTypeLabel(type)} {format(bar.byType[type] ?? 0)}
                      </span>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <details className={styles.tableToggle}>
        <summary>Data</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{hasDetail ? "Period" : "Label"}</th>
              {stacked &&
                types.map((type) => (
                  <th key={type} scope="col">
                    {actionTypeLabel(type)}
                  </th>
                ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.key}>
                <th scope="row">{bar.detail ?? bar.label}</th>
                {stacked &&
                  types.map((type) => (
                    <td key={type}>{format(bar.byType[type] ?? 0)}</td>
                  ))}
                <td>{format(bar.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
