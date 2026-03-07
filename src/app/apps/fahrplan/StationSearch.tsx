"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { fetchCompletions } from "./api";
import type { CompletionItem } from "./types";
import styles from "./StationSearch.module.css";

interface StationSearchProps {
  onSelect: (station: string) => void;
}

const ICON_MAP: Record<string, string> = {
  "sl-icon-type-train": "🚆",
  "sl-icon-type-strain": "🚈",
  "sl-icon-type-tram": "🚊",
  "sl-icon-type-bus": "🚌",
  "sl-icon-type-ship": "⛴",
  "sl-icon-type-funicular": "🚡",
};

export function StationSearch({ onSelect }: StationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompletionItem[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback((term: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!term.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      const items = await fetchCompletions(term);
      setResults(items);
      setOpen(items.length > 0);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search station..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className={styles.dropdown}>
          {results.map((item) => (
            <button
              key={item.label}
              className={styles.option}
              onClick={() => {
                onSelect(item.label);
                setQuery("");
                setOpen(false);
              }}
            >
              <span className={styles.optionIcon}>
                {ICON_MAP[item.iconclass] ?? "📍"}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
