"use client";

import { categoryLabel, GROUPS, L10N, type Group, type Lang } from "./i18n";
import styles from "./styles.module.css";

const DURATIONS = [16, 32, 64] as const;

type Props = {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  counts: Record<Group, number>;
  duration: number;
  onDurationChange: (n: number) => void;
  sortByIntensity: boolean;
  onSortChange: (v: boolean) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  deselected: ReadonlySet<string>;
  onToggleCategory: (key: string) => void;
  onSelectAllCategories: () => void;
  onPick: (g: Group) => void;
};

export function StartScreen({
  lang,
  onLangChange,
  counts,
  duration,
  onDurationChange,
  sortByIntensity,
  onSortChange,
  categories,
  categoryCounts,
  deselected,
  onToggleCategory,
  onSelectAllCategories,
  onPick,
}: Props) {
  const t = L10N[lang];
  const allOn = deselected.size === 0;
  return (
    <div className={styles.start}>
      <div className={styles.startTop}>
        <div className={styles.lng2}>
          <span
            className={lang === "de" ? styles.on : ""}
            onClick={() => onLangChange("de")}
          >
            DE
          </span>
          <span
            className={lang === "en" ? styles.on : ""}
            onClick={() => onLangChange("en")}
          >
            EN
          </span>
        </div>
      </div>
      <div className={styles.title} data-text="Fragespiel">
        Fragespiel
      </div>
      <div className={styles.tag}>{t.tagline}</div>
      <div className={styles.rounds}>{t.rounds}</div>
      <div className={styles.dur}>
        {DURATIONS.map((n) => (
          <span
            key={n}
            className={duration === n ? styles.on : ""}
            onClick={() => onDurationChange(n)}
          >
            {n}
          </span>
        ))}
      </div>
      <div className={styles.rounds}>{t.sortCards}</div>
      <div className={styles.dur}>
        <span
          className={sortByIntensity ? styles.on : ""}
          onClick={() => onSortChange(true)}
        >
          {t.sortIntensity}
        </span>
        <span
          className={!sortByIntensity ? styles.on : ""}
          onClick={() => onSortChange(false)}
        >
          {t.sortRandom}
        </span>
      </div>
      {categories.length > 0 && (
        <>
          <div className={styles.rounds}>{t.categories}</div>
          <div className={styles.cats}>
            <button
              type="button"
              className={allOn ? styles.on : ""}
              onClick={onSelectAllCategories}
            >
              {t.allCategories}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={deselected.has(c) ? "" : styles.on}
                aria-pressed={!deselected.has(c)}
                onClick={() => onToggleCategory(c)}
              >
                {categoryLabel(c, lang)}
                <span className={styles.catCount}>
                  {categoryCounts[c] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className={styles.choose}>{t.choose}</div>
      <div className={styles.gList}>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            className={styles.grp}
            disabled={counts[g.id] === 0}
            onClick={() => onPick(g.id)}
          >
            <div>
              <div className={styles.grpName}>{g[lang].n}</div>
              <div className={styles.grpDesc}>{g[lang].d}</div>
            </div>
            <div className={styles.grpCount}>{counts[g.id]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
