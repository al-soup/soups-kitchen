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
const TOP_POSE = DEPTH[0];
// Off-screen pose a card flies out to (left) — and the same spot a previous
// card is pulled back in from.
const FLY_POSE = { x: -440, y: -280, r: -13, s: 0.92 };
const PATH_LEN = -FLY_POSE.x; // drag distance that maps to a full fly (440px)
const THRESHOLD = 100;
const ANIM_MS = 600;
const FLY_TRANSITION =
  "transform .6s cubic-bezier(.36,.66,.3,1), opacity .6s ease";

const tf = (x: number, y: number, r: number, s: number) =>
  `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
// Single trajectory shared by drag + fly: p=0 sits at TOP, p=1 at FLY. Dragging
// moves the card along it (so the release continues the exact same path), and a
// previous card is just the reverse (FLY -> TOP).
const pathTransform = (p: number) =>
  tf(
    lerp(TOP_POSE.x, FLY_POSE.x, p),
    lerp(TOP_POSE.y, FLY_POSE.y, p),
    lerp(TOP_POSE.r, FLY_POSE.r, p),
    lerp(TOP_POSE.s, FLY_POSE.s, p)
  );
const TOP = pathTransform(0);
const FLY = pathTransform(1);
// Drag progress along the path. Next: leftward drag (dx<0) -> 0..1. Previous:
// rightward drag (dx>0) pulls the card from FLY (p=1) toward TOP (p=0).
const nextProgress = (dx: number) => Math.min(Math.max(-dx, 0) / PATH_LEN, 1);
const prevProgress = (dx: number) =>
  1 - Math.min(Math.max(dx, 0) / PATH_LEN, 1);

type FlyState = {
  card: Question;
  from: string;
  to: string;
  fade: boolean; // opacity 1->0 (next fly-out); previous/cancel stay opaque
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

  // Drive a card overlay from `from` to `to`, then hand it back to the stack.
  const settle = (opts: {
    card: Question;
    from: string;
    to: string;
    fade?: boolean;
    cover?: number; // card pinned at TOP while the overlay animates over it
    commitIndex?: number; // index applied immediately (revealed beneath)
  }) => {
    busy.current = true;
    setDrag(0);
    setDragging(false);
    if (opts.cover !== undefined) setCover(opts.cover);
    if (opts.commitIndex !== undefined) setIndex(opts.commitIndex);
    setFly({
      card: opts.card,
      from: opts.from,
      to: opts.to,
      fade: !!opts.fade,
      on: false,
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setFly((f) => (f ? { ...f, on: true } : f)))
    );
    const movingId = opts.card.id;
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

  // Next: top card continues along the drag path and flies out left, revealing
  // the next card's face beneath.
  const goNext = (dx: number) => {
    if (busy.current || index >= L - 1) return;
    settle({
      card: deck[index],
      from: pathTransform(nextProgress(dx)),
      to: FLY,
      fade: true,
      commitIndex: index + 1,
    });
  };

  // Previous: current card stays put (pinned); the previous card flies in from
  // the left, continuing from wherever the drag pulled it to.
  const goPrev = (dx: number) => {
    if (busy.current || index <= 0) return;
    settle({
      card: deck[index - 1],
      from: pathTransform(prevProgress(dx)),
      to: TOP,
      cover: deck[index].id,
      commitIndex: index - 1,
    });
  };

  const swipe = useSwipe({
    onDrag: (dx) => {
      if (!busy.current) {
        setDragging(dx !== 0);
        setDrag(dx);
      }
    },
    onEnd: (dx) => {
      if (busy.current) return;
      if (dx <= -THRESHOLD && index < L - 1) goNext(dx);
      else if (dx >= THRESHOLD && index > 0) goPrev(dx);
      else if (dx > 0 && index > 0) {
        // Released a previous-pull below threshold: slide the half-shown
        // previous card back off to the left.
        settle({
          card: deck[index - 1],
          from: pathTransform(prevProgress(dx)),
          to: FLY,
        });
      } else {
        // Sub-threshold next-drag (or last card): let the top card spring back.
        setDrag(0);
        setDragging(false);
      }
    },
  });

  const closeMenu = () => setMenu(false);

  // Leftward drag moves the current card toward the next (blocked on the last
  // card); rightward drag pulls the previous card in (blocked on the first).
  // `dragging` is only ever true while idle (settle clears it), so it doubles as
  // the "not animating" guard.
  const nextDragging = dragging && drag < 0 && index < L - 1;
  const prevDragging = dragging && drag > 0 && index > 0;

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
          // Reveal the next card's face (not its blank back) as the top card is
          // dragged away — matching what the buttons already show.
          const revealNext = depth === 1 && nextDragging;
          const showFace = isTop || covering || revealNext;
          const pose = depth < DEPTH.length ? DEPTH[depth] : HIDDEN;
          const transform = covering
            ? TOP
            : isTop && nextDragging
              ? pathTransform(nextProgress(drag))
              : tf(pose.x, pose.y, pose.r, pose.s);
          const noTransition = (isTop && nextDragging) || snapping || covering;
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
        {prevDragging && (
          <div
            className={`${styles.card} ${styles.cardTop}`}
            style={{
              transform: pathTransform(prevProgress(drag)),
              zIndex: 997,
              pointerEvents: "none",
              transition: "none",
            }}
          >
            <CardFace q={deck[index - 1]} lang={lang} />
          </div>
        )}
        {fly && (
          <div
            className={`${styles.card} ${styles.cardTop}`}
            style={{
              transform: fly.on ? fly.to : fly.from,
              opacity: fly.fade ? (fly.on ? 0 : 1) : 1,
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
          onClick={() => goPrev(0)}
          aria-label="Previous"
          disabled={index === 0}
        >
          ←
        </button>
        <button
          className={styles.next}
          onClick={() => goNext(0)}
          disabled={index === L - 1}
        >
          {t.next}
          <span>→</span>
        </button>
      </div>
    </>
  );
}
