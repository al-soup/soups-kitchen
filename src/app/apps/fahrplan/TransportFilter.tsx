"use client";

import type { TransportFilterKey } from "./constants";
import { ALL_FILTER_KEYS } from "./constants";
import { TrainIcon, TramIcon, BusIcon } from "./icons";
import styles from "./TransportFilter.module.css";

const FILTER_ICONS: Record<TransportFilterKey, React.ReactNode> = {
  Train: <TrainIcon size={14} />,
  Tram: <TramIcon size={14} />,
  Bus: <BusIcon size={14} />,
};

interface TransportFilterProps {
  active: Set<TransportFilterKey>;
  available: Set<TransportFilterKey>;
  onChange: (next: Set<TransportFilterKey>) => void;
}

export function TransportFilter({
  active,
  available,
  onChange,
}: TransportFilterProps) {
  function toggle(key: TransportFilterKey) {
    const next = new Set(active);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  }

  return (
    <div className={styles.row}>
      {ALL_FILTER_KEYS.map((key) => (
        <button
          key={key}
          className={`${styles.chip} ${active.has(key) ? styles.active : ""}`}
          disabled={!available.has(key)}
          onClick={() => toggle(key)}
        >
          {FILTER_ICONS[key]}
          {key}
        </button>
      ))}
    </div>
  );
}
