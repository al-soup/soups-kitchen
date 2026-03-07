import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "fahrplan-station";

let stationValue: string | null = null;
let listeners: Array<() => void> = [];

function getSnapshot(): string | null {
  return stationValue;
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  // Initialize from localStorage on first subscribe (client only)
  if (typeof window !== "undefined" && stationValue === null) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      stationValue = stored;
      listener();
    }
  }
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useStation() {
  const station = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setStation = useCallback((name: string | null) => {
    stationValue = name;
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    emitChange();
  }, []);

  return { station, setStation } as const;
}
