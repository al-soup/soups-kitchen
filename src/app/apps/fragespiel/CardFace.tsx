"use client";

import type { Question } from "@/lib/supabase/types";
import type { Lang } from "./i18n";
import styles from "./styles.module.css";

type Props = {
  q: Question;
  lang: Lang;
  index: number;
};

export function CardFace({ q, lang, index }: Props) {
  const text = lang === "de" ? q.text_de : q.text_en;
  const intensity = Math.max(1, Math.min(3, q.difficulty));
  return (
    <div className={styles.face}>
      <div className={styles.kRow}>
        {q.category ? (
          <span className={styles.kick}>{q.category}</span>
        ) : (
          <span />
        )}
        <span className={styles.intensity}>
          <span className={styles.dots}>
            {[1, 2, 3].map((n) => (
              <b key={n} className={n <= intensity ? styles.filled : ""} />
            ))}
          </span>
        </span>
      </div>
      {q.is_ai_generated && (
        <span className={styles.aiPill}>
          <span className={styles.spark}>✦</span>AI
        </span>
      )}
      <div className={styles.question} data-text={text}>
        {text}
      </div>
      <div className={styles.actions}>
        <span className={styles.meta} />
        <span className={styles.meta}>
          No.{String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
