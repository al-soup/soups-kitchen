"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { fetchCompletions } from "./api";
import type { CompletionItem } from "./types";
import {
  TrainIcon,
  STrainIcon,
  TramIcon,
  BusIcon,
  ShipIcon,
  FunicularIcon,
  StationIcon,
} from "./icons";
import styles from "./StationSearch.module.css";

interface StationSearchProps {
  onSelect: (station: string) => void;
}

const ICON_MAP: Record<string, ReactNode> = {
  "sl-icon-type-train": <TrainIcon />,
  "sl-icon-type-strain": <STrainIcon />,
  "sl-icon-type-tram": <TramIcon />,
  "sl-icon-type-bus": <BusIcon />,
  "sl-icon-type-ship": <ShipIcon />,
  "sl-icon-type-funicular": <FunicularIcon />,
};

export function StationSearch({ onSelect }: StationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompletionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
      setActiveIndex(-1);
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

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  function selectItem(label: string) {
    onSelect(label);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault();
          selectItem(results[activeIndex].label);
        }
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  const activeId =
    activeIndex >= 0 ? `station-option-${activeIndex}` : undefined;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search station..."
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls="station-listbox"
        aria-activedescendant={activeId}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div
          id="station-listbox"
          className={styles.dropdown}
          role="listbox"
          ref={listRef}
        >
          {results.map((item, i) => (
            <button
              key={item.label}
              id={`station-option-${i}`}
              className={`${styles.option}${i === activeIndex ? ` ${styles.active}` : ""}`}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => selectItem(item.label)}
            >
              <span className={styles.optionIcon}>
                {ICON_MAP[item.iconclass] ?? <StationIcon />}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
