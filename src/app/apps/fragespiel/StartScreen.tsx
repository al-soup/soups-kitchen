"use client";

import { GROUPS, L10N, type Group, type Lang } from "./i18n";
import styles from "./styles.module.css";

const DURATIONS = [16, 32, 64] as const;

type Props = {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  counts: Record<Group, number>;
  duration: number;
  onDurationChange: (n: number) => void;
  onPick: (g: Group) => void;
};

export function StartScreen({
  lang,
  onLangChange,
  counts,
  duration,
  onDurationChange,
  onPick,
}: Props) {
  const t = L10N[lang];
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
      <div className={styles.choose}>{t.choose}</div>
      <div className={styles.gList}>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            className={styles.grp}
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
