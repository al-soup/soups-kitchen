"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Question } from "@/lib/supabase/types";
import { listQuestions } from "./api";
import {
  getServerLangSnapshot,
  getLangSnapshot,
  saveLang,
  subscribeLang,
  type Group,
  type Lang,
} from "./i18n";
import { categoryCounts, listCategories, poolFor } from "./categories";
import { StartScreen } from "./StartScreen";
import { PlayScreen } from "./PlayScreen";
import styles from "./styles.module.css";

// Federal Blue × Fluo Pink — chosen palette from the design (riso-app.jsx).
const PALETTE = {
  "--paper": "#efe9da",
  "--card": "#f7f3e9",
  "--ink": "#1b2a6b",
  "--accent": "#ff3d9a",
} as React.CSSProperties;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a round of up to `n` questions with a balanced mix across the three
// intensity levels (difficulty 1-3). Round-robin draw self-balances uneven
// splits (16 -> 6/5/5) and gracefully handles short buckets; categories random.
function buildRound(pool: Question[], n: number): Question[] {
  const buckets = [1, 2, 3].map((d) =>
    shuffle(pool.filter((q) => q.difficulty === d))
  );
  const target = Math.min(n, pool.length);
  const picked: Question[] = [];
  let i = 0;
  while (picked.length < target && buckets.some((b) => b.length)) {
    const b = buckets[i % 3];
    const card = b.pop();
    if (card) picked.push(card);
    i++;
  }
  return shuffle(picked);
}

export function Fragespiel() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getServerLangSnapshot
  );
  const [group, setGroup] = useState<Group | null>(null);
  const [deck, setDeck] = useState<Question[]>([]);
  const [duration, setDuration] = useState(32);
  const [sortByIntensity, setSortByIntensity] = useState(true);
  // Deselected (not selected) categories: empty = all on, so no init pass is
  // needed once questions load and unseen categories default to on.
  const [deselected, setDeselected] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  // Bumped on pickGroup/reshuffle/sort-toggle so PlayScreen remounts with fresh deck state.
  const [deckVersion, setDeckVersion] = useState(0);

  // Stable sort: within a difficulty bucket, original (shuffled) order is preserved.
  const displayDeck = useMemo(
    () =>
      sortByIntensity
        ? deck.slice().sort((a, b) => a.difficulty - b.difficulty)
        : deck,
    [deck, sortByIntensity]
  );

  useEffect(() => {
    let cancelled = false;
    listQuestions()
      .then((rows) => {
        if (!cancelled) setQuestions(rows);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Chip counts span the whole active pool — no group is picked yet at this point.
  const categories = useMemo(
    () => listCategories(questions ?? [], lang),
    [questions, lang]
  );
  const catCounts = useMemo(() => categoryCounts(questions ?? []), [questions]);

  // Group badges track the category selection, so they double as a live preview
  // of how many cards the round would hold.
  const counts = useMemo<Record<Group, number>>(() => {
    const rows = questions ?? [];
    return {
      friends: poolFor(rows, "friends", deselected).length,
      couple: poolFor(rows, "couple", deselected).length,
    };
  }, [questions, deselected]);

  const handleLang = (l: Lang) => {
    saveLang(l);
  };

  const toggleCategory = (key: string) => {
    setDeselected((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  const selectAllCategories = () => {
    setDeselected(new Set());
  };

  const pickGroup = (g: Group) => {
    if (!questions) return;
    const pool = poolFor(questions, g, deselected);
    if (pool.length === 0) return;
    setDeck(buildRound(pool, duration));
    setGroup(g);
    setDeckVersion((v) => v + 1);
  };

  const reshuffle = () => {
    if (!group || !questions) return;
    setDeck(buildRound(poolFor(questions, group, deselected), duration));
    setDeckVersion((v) => v + 1);
  };

  const changeGroup = () => {
    setGroup(null);
    setDeck([]);
  };

  return (
    <div className={styles.rz} style={PALETTE}>
      {error ? (
        <div className={styles.start}>
          <div className={styles.tag}>Error: {error}</div>
        </div>
      ) : group === null || deck.length === 0 ? (
        <StartScreen
          lang={lang}
          onLangChange={handleLang}
          counts={counts}
          duration={duration}
          onDurationChange={setDuration}
          sortByIntensity={sortByIntensity}
          onSortChange={setSortByIntensity}
          categories={categories}
          categoryCounts={catCounts}
          deselected={deselected}
          onToggleCategory={toggleCategory}
          onSelectAllCategories={selectAllCategories}
          onPick={pickGroup}
        />
      ) : (
        <PlayScreen
          key={deckVersion}
          deck={displayDeck}
          lang={lang}
          onLangChange={handleLang}
          onReshuffle={reshuffle}
          onChangeGroup={changeGroup}
        />
      )}
      <div className={styles.grain} />
    </div>
  );
}
