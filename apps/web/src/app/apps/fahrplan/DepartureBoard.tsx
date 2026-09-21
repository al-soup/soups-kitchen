"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchStationboard } from "./api";
import type { StationboardConnection } from "./types";
import type { TransportFilterKey } from "./constants";
import {
  ALL_FILTER_KEYS,
  STATIONBOARD_POLL_INTERVAL_MS,
  TRANSPORT_FILTERS,
} from "./constants";
import { TransportFilter } from "./TransportFilter";
import { DepartureRow } from "./DepartureRow";
import styles from "./DepartureBoard.module.css";

interface DepartureBoardProps {
  station: string;
}

function deduplicateConnections(
  connections: StationboardConnection[],
  now: number
): StationboardConnection[] {
  const future = connections.filter(
    (c) => new Date(c.time).getTime() >= now - 30000
  );
  const seen = new Map<string, StationboardConnection>();
  for (const c of future) {
    const key = `${c.line}::${c.terminal.name}`;
    if (!seen.has(key)) {
      seen.set(key, c);
    }
  }
  return Array.from(seen.values());
}

let globalNow = 0;
let nowListeners: Array<() => void> = [];
let nowIntervalId: ReturnType<typeof setInterval> | null = null;

function startNowTicker(intervalMs: number) {
  if (nowIntervalId) return;
  globalNow = Date.now();
  nowIntervalId = setInterval(() => {
    globalNow = Date.now();
    for (const l of nowListeners) l();
  }, intervalMs);
}

function subscribeNow(listener: () => void): () => void {
  nowListeners.push(listener);
  startNowTicker(15000);
  return () => {
    nowListeners = nowListeners.filter((l) => l !== listener);
    if (nowListeners.length === 0 && nowIntervalId) {
      clearInterval(nowIntervalId);
      nowIntervalId = null;
    }
  };
}

function getNow(): number {
  if (globalNow === 0) globalNow = Date.now();
  return globalNow;
}

interface BoardState {
  connections: StationboardConnection[];
  loading: boolean;
}

function useBoardData(station: string): BoardState {
  const [state, setState] = useState<BoardState>({
    connections: [],
    loading: true,
  });

  // Caller mounts with `key={station}`, so this effect only ever sees one
  // station per instance — no need to reset state on station change here.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchStationboard(station);
        if (cancelled) return;
        setState({ connections: data.connections ?? [], loading: false });
      } catch {
        if (cancelled) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    load();
    const id = setInterval(load, STATIONBOARD_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [station]);

  return state;
}

export function filterConnections(
  connections: StationboardConnection[],
  active: Set<TransportFilterKey>
): StationboardConnection[] {
  const allActive = active.size === 0 || active.size === ALL_FILTER_KEYS.length;
  if (allActive) return connections;

  const allowedTypes = new Set<string>();
  for (const key of active) {
    for (const t of TRANSPORT_FILTERS[key]) {
      allowedTypes.add(t);
    }
  }
  return connections.filter((c) => allowedTypes.has(c.type));
}

export function DepartureBoard({ station }: DepartureBoardProps) {
  const { connections, loading } = useBoardData(station);
  const now = useSyncExternalStore(subscribeNow, getNow, getNow);
  const [activeFilters, setActiveFilters] = useState<Set<TransportFilterKey>>(
    () => new Set(ALL_FILTER_KEYS)
  );

  const deduplicated = deduplicateConnections(connections, now);

  const availableFilters = useMemo(() => {
    const types = new Set(deduplicated.map((c) => c.type));
    const available = new Set<TransportFilterKey>();
    for (const key of ALL_FILTER_KEYS) {
      if (TRANSPORT_FILTERS[key].some((t) => types.has(t))) {
        available.add(key);
      }
    }
    return available;
  }, [deduplicated]);

  const departures = filterConnections(deduplicated, activeFilters);

  return (
    <>
      <TransportFilter
        active={activeFilters}
        available={availableFilters}
        onChange={setActiveFilters}
      />
      <div className={styles.board}>
        {loading ? (
          <div className={styles.loading}>Loading departures...</div>
        ) : departures.length === 0 ? (
          <div className={styles.empty}>No upcoming departures</div>
        ) : (
          departures.map((c) => (
            <DepartureRow
              key={`${c["*Z"]}-${c.time}`}
              connection={c}
              now={now}
            />
          ))
        )}
      </div>
    </>
  );
}
