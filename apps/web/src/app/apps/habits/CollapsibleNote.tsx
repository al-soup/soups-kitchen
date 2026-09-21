"use client";

import { useEffect, useRef, useState } from "react";
import { linkifyText } from "@/lib/linkifyText";
import styles from "./CollapsibleNote.module.css";

export function CollapsibleNote({ note }: { note: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      // Only the clamped state can tell: once expanded nothing overflows, and
      // the toggle must stay so the note can be collapsed again.
      if (el.dataset.expanded === "true") return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.note}>
      <p ref={textRef} className={styles.text} data-expanded={expanded}>
        {linkifyText(note)}
      </p>
      {overflows && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
