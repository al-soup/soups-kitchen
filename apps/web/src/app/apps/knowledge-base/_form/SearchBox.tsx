"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "@/constants/icons";
import styles from "./SearchBox.module.css";

interface SearchBoxProps {
  initialValue: string;
  onDebouncedChange: (q: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBox({
  initialValue,
  onDebouncedChange,
  placeholder = "Search…",
  debounceMs = 250,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const [lastExternal, setLastExternal] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to external value (URL change) during render so we never remount —
  // keeps input focus across debounced URL updates. React pattern for
  // "adjusting state on prop change" without an effect.
  if (initialValue !== lastExternal) {
    setLastExternal(initialValue);
    setValue(initialValue);
  }

  const scheduleEmit = useCallback(
    (next: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDebouncedChange(next.trim());
      }, debounceMs);
    },
    [onDebouncedChange, debounceMs]
  );

  // Cancel any pending debounce when the external value swaps under us
  // (e.g. browser back/forward, URL paste) — otherwise a stale timer would
  // fire later and overwrite the new URL. Also covers unmount cleanup.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastExternal]);

  const handleChange = (next: string) => {
    setValue(next);
    scheduleEmit(next);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValue("");
    onDebouncedChange("");
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.searchIcon} aria-hidden="true">
        <SearchIcon size={16} />
      </span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search entries"
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}
