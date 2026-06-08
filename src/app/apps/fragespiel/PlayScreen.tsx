"use client";

import { useRef, useState } from "react";
import type { Question } from "@/lib/supabase/types";
import { CardFace } from "./CardFace";
import { useSwipe } from "./useSwipe";
import { L10N, type Lang } from "./i18n";
import styles from "./styles.module.css";

type DepthPose = { y: number; x: number; r: number; s: number; o: number };

const DEPTH: DepthPose[] = [
  { y: 0, x: 0, r: -1.6, s: 1, o: 1 },
  { y: 9, x: -3, r: -3.1, s: 0.976, o: 1 },
  { y: 18, x: 8, r: 3.2, s: 0.949, o: 1 },
  { y: 27, x: -7, r: -2.4, s: 0.926, o: 1 },
  { y: 34, x: 6, r: 2.2, s: 0.906, o: 1 },
];
const HIDDEN: DepthPose = { y: 42, x: -2, r: -3.6, s: 0.88, o: 0 };
const TOP = `translate(${DEPTH[0].x}px,${DEPTH[0].y}px) rotate(${DEPTH[0].r}deg) scale(${DEPTH[0].s})`;
const FLY = "translate(440px,-280px) rotate(13deg) scale(.92)";
const ANIM_MS = 440;
const FLY_TRANSITION =
  "transform .44s cubic-bezier(.36,.66,.3,1), opacity .44s ease";

type FlyState = {
  card: Question;
  dir: 1 | -1;
  idx: number;
  on: boolean;
} | null;

type Props = {
  deck: Question[];
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onReshuffle: () => void;
  onChangeGroup: () => void;
};

export function PlayScreen({
  deck,
  lang,
  onLangChange,
  onReshuffle,
  onChangeGroup,
}: Props) {
  const t = L10N[lang];
  const L = deck.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fly, setFly] = useState<FlyState>(null);
  const [snap, setSnap] = useState<number | null>(null);
  const [cover, setCover] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const busy = useRef(false);

  const step = (dir: 1 | -1) => {
    if (busy.current || !L) return;
    busy.current = true;
    setDrag(0);
    setDragging(false);
    let movingId: number;
    if (dir > 0) {
      const idx = index;
      movingId = deck[idx].id;
      setFly({ card: deck[idx], dir: 1, idx, on: false });
      setIndex((i) => (i + 1) % L);
    } else {
      // back-step: pin current top with cover so it stays visible until covered.
      const idx = (index - 1 + L) % L;
      movingId = deck[idx].id;
      setCover(deck[index].id);
      setIndex(idx);
      setFly({ card: deck[idx], dir: -1, idx, on: false });
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setFly((f) => (f ? { ...f, on: true } : f)))
    );
    window.setTimeout(() => {
      // Hand the moving card back to the real stack with NO transition for one
      // frame so the overlay→stack handoff is invisible.
      setSnap(movingId);
      setFly(null);
      setCover(null);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setSnap((s) => (s === movingId ? null : s)))
      );
      busy.current = false;
    }, ANIM_MS);
  };

  const swipe = useSwipe({
    onNext: () => step(1),
    onPrev: () => step(-1),
    onDrag: (dx) => {
      if (!busy.current) {
        setDragging(dx !== 0);
        setDrag(dx);
      }
    },
  });

  const closeMenu = () => setMenu(false);

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.menuWrap}>
          <button
            className={styles.menu}
            aria-label="Menu"
            onClick={() => setMenu((m) => !m)}
          >
            <i />
            <i />
            <i />
          </button>
          {menu && (
            <div className={styles.drop}>
              <button
                onClick={() => {
                  onReshuffle();
                  closeMenu();
                }}
              >
                {t.restart}
                <span>↻</span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: "default" }}
              >
                {t.language}
                <span className={styles.dropLng}>
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
                </span>
              </button>
              <button
                onClick={() => {
                  onChangeGroup();
                  closeMenu();
                }}
              >
                {t.changeGroup}
                <span>→</span>
              </button>
            </div>
          )}
        </div>
        <div className={styles.count}>
          <b>{String(index + 1).padStart(2, "0")}</b> /{" "}
          {String(L).padStart(2, "0")}
        </div>
      </div>

      {menu && <div className={styles.scrim} onClick={closeMenu} />}

      <div className={styles.stage}>
        {deck.map((q, p) => {
          const depth = (p - index + L) % L;
          const isTop = depth === 0;
          const masked = fly !== null && q.id === fly.card.id;
          const snapping = snap === q.id;
          const covering = cover === q.id;
          const showFace = isTop || covering;
          const pose = depth < DEPTH.length ? DEPTH[depth] : HIDDEN;
          const tx = isTop && drag ? pose.x + drag : pose.x;
          const rot = isTop && drag ? pose.r + drag * 0.022 : pose.r;
          const transform = covering
            ? TOP
            : `translate(${tx}px, ${pose.y}px) rotate(${rot}deg) scale(${pose.s})`;
          const noTransition = (isTop && dragging) || snapping || covering;
          const interactive = isTop && !masked && !covering;
          return (
            <div
              key={q.id}
              className={`${styles.card}${showFace ? ` ${styles.cardTop}` : ""}`}
              {...(interactive ? swipe : {})}
              style={{
                transform,
                opacity: masked ? 0 : pose.o,
                zIndex: covering ? 998 : L - depth,
                transition: noTransition ? "none" : undefined,
                pointerEvents: interactive ? "auto" : "none",
              }}
            >
              {showFace ? (
                <CardFace q={q} lang={lang} index={p} />
              ) : (
                <div className={styles.back}>
                  <div className={styles.mark} />
                </div>
              )}
            </div>
          );
        })}
        {fly && (
          <div
            className={`${styles.card} ${styles.cardTop}`}
            style={{
              transform:
                fly.dir === 1 ? (fly.on ? FLY : TOP) : fly.on ? TOP : FLY,
              opacity: fly.dir === 1 ? (fly.on ? 0 : 1) : 1,
              zIndex: 999,
              pointerEvents: "none",
              transition: FLY_TRANSITION,
            }}
          >
            <CardFace q={fly.card} lang={lang} index={fly.idx} />
          </div>
        )}
      </div>

      <div className={styles.foot}>
        <button
          className={styles.prev}
          onClick={() => step(-1)}
          aria-label="Previous"
        >
          ←
        </button>
        <button className={styles.next} onClick={() => step(1)}>
          {t.next}
          <span>→</span>
        </button>
      </div>
    </>
  );
}
