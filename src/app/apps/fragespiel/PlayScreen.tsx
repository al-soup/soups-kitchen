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
const tf = (x: number, y: number, r: number, s: number) =>
  `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const TOP = tf(DEPTH[0].x, DEPTH[0].y, DEPTH[0].r, DEPTH[0].s);
// Cards leave (and return) on the left — next exits here, previous flies in from
// the same direction it was sent away.
const FLY = "translate(-440px,-280px) rotate(-13deg) scale(.92)";
// Top-card transform while dragging it left; used as the fly-out start so the
// release continues along the same path instead of snapping back to center.
const dragTransform = (dx: number) =>
  tf(DEPTH[0].x + dx, DEPTH[0].y, DEPTH[0].r + dx * 0.022, DEPTH[0].s);
const ANIM_MS = 600;
const FLY_TRANSITION =
  "transform .6s cubic-bezier(.36,.66,.3,1), opacity .6s ease";

type FlyState = {
  card: Question;
  dir: 1 | -1;
  on: boolean;
  from: string;
} | null;

type Props = {
  deck: Question[];
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onReshuffle: () => void;
  onChangeGroup: () => void;
  sortByIntensity: boolean;
  onToggleSort: () => void;
};

export function PlayScreen({
  deck,
  lang,
  onLangChange,
  onReshuffle,
  onChangeGroup,
  sortByIntensity,
  onToggleSort,
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

  const step = (dir: 1 | -1, from?: string) => {
    if (busy.current || !L) return;
    // No wrap-around: ignore advancing past the last / before the first card.
    if (dir > 0 && index >= L - 1) return;
    if (dir < 0 && index <= 0) return;
    busy.current = true;
    setDrag(0);
    setDragging(false);
    let movingId: number;
    if (dir > 0) {
      // Next: the top card flies out to the left, continuing from where the
      // drag left it (from), revealing the next card's face beneath.
      movingId = deck[index].id;
      setFly({ card: deck[index], dir: 1, on: false, from: from ?? TOP });
      setIndex(index + 1);
    } else {
      // Previous: the current card stays put (pinned via cover); the previous
      // card flies back in from the left onto the top of the stack.
      const idx = index - 1;
      movingId = deck[idx].id;
      setCover(deck[index].id);
      setIndex(idx);
      setFly({ card: deck[idx], dir: -1, on: false, from: FLY });
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
    onNext: (dx) => step(1, dragTransform(dx)),
    onPrev: () => step(-1),
    onDrag: (dx) => {
      if (!busy.current) {
        // Only the leftward (next) drag moves the current card; a rightward
        // (previous) drag leaves it in place — the previous card animates in.
        setDragging(dx !== 0);
        setDrag(dx < 0 ? dx : 0);
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
              <button onClick={onToggleSort}>
                {t.sortByIntensity}
                <span>{sortByIntensity ? "✓" : ""}</span>
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
          // Reveal the next card's face (not its blank back) as the top card is
          // dragged away — matching what the buttons already show.
          const revealNext = depth === 1 && dragging && drag < 0;
          const showFace = isTop || covering || revealNext;
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
                <CardFace q={q} lang={lang} />
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
              transform: fly.on ? (fly.dir === 1 ? FLY : TOP) : fly.from,
              opacity: fly.dir === 1 ? (fly.on ? 0 : 1) : 1,
              zIndex: 999,
              pointerEvents: "none",
              transition: FLY_TRANSITION,
            }}
          >
            <CardFace q={fly.card} lang={lang} />
          </div>
        )}
      </div>

      <div className={styles.foot}>
        <button
          className={styles.prev}
          onClick={() => step(-1)}
          aria-label="Previous"
          disabled={index === 0}
        >
          ←
        </button>
        <button
          className={styles.next}
          onClick={() => step(1)}
          disabled={index === L - 1}
        >
          {t.next}
          <span>→</span>
        </button>
      </div>
    </>
  );
}
