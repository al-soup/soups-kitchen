"use client";

import { useRef, useSyncExternalStore, useCallback } from "react";
import { fetchStationboard } from "./api";
import type { StationboardConnection } from "./types";
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
  const ref = useRef({
    state: { connections: [] as StationboardConnection[], loading: true },
    listeners: [] as Array<() => void>,
    started: false,
  });

  const emit = useCallback(() => {
    for (const l of ref.current.listeners) l();
  }, []);

  const subscribe = useCallback(
    (listener: () => void) => {
      ref.current.listeners.push(listener);

      if (!ref.current.started) {
        ref.current.started = true;

        const load = async () => {
          const data = await fetchStationboard(station);
          ref.current.state = {
            connections: data.connections ?? [],
            loading: false,
          };
          emit();
        };

        load();
        const id = setInterval(load, 15000);
        return () => {
          ref.current.listeners = ref.current.listeners.filter(
            (l) => l !== listener
          );
          clearInterval(id);
        };
      }

      return () => {
        ref.current.listeners = ref.current.listeners.filter(
          (l) => l !== listener
        );
      };
    },
    [station, emit]
  );

  return useSyncExternalStore(
    subscribe,
    () => ref.current.state,
    () => ref.current.state
  );
}

export function DepartureBoard({ station }: DepartureBoardProps) {
  const { connections, loading } = useBoardData(station);
  const now = useSyncExternalStore(subscribeNow, getNow, getNow);

  const departures = deduplicateConnections(connections, now);

  if (loading) {
    return (
      <div className={styles.board}>
        <div className={styles.loading}>Loading departures...</div>
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div className={styles.board}>
        <div className={styles.empty}>No upcoming departures</div>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      {departures.map((c) => (
        <DepartureRow key={`${c["*Z"]}-${c.time}`} connection={c} now={now} />
      ))}
    </div>
  );
}
