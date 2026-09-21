"use client";

import type { StationboardConnection } from "./types";
import { TRANSPORT_COLORS } from "./constants";
import styles from "./DepartureRow.module.css";

interface DepartureRowProps {
  connection: StationboardConnection;
  now: number;
}

function parseColor(color: string): { bg: string; fg: string } | null {
  const parts = color.split("~");
  if (parts.length < 2) return null;
  const bg = parts[0];
  const fg = parts[1];
  if (!bg) return null;
  return {
    bg: bg.startsWith("#") ? bg : `#${bg}`,
    fg: fg ? (fg.startsWith("#") ? fg : `#${fg}`) : "#fff",
  };
}

export function DepartureRow({ connection, now }: DepartureRowProps) {
  const depTime = new Date(connection.time).getTime();
  const diffMs = depTime - now;
  const diffMin = Math.round(diffMs / 60000);

  const parsed = parseColor(connection.color);
  const fallback = TRANSPORT_COLORS[connection.type] ?? "#666";
  const bg = parsed?.bg ?? fallback;
  const fg = parsed?.fg ?? "#fff";

  let timeLabel: string;
  if (diffMin <= 0) {
    timeLabel = "now";
  } else if (diffMin < 60) {
    timeLabel = `${diffMin}'`;
  } else {
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    timeLabel = `${h}h${m > 0 ? ` ${m}'` : ""}`;
  }

  return (
    <div className={styles.row}>
      <span
        className={styles.lineBadge}
        style={{ backgroundColor: bg, color: fg }}
      >
        {connection.line}
      </span>
      <span className={styles.destination}>{connection.terminal.name}</span>
      <span className={`${styles.time} ${diffMin <= 0 ? styles.now : ""}`}>
        {timeLabel}
      </span>
      {connection.dep_delay && (
        <span className={styles.delay}>+{connection.dep_delay}</span>
      )}
    </div>
  );
}
