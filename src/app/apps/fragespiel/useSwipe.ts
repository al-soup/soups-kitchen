"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

type SwipeOptions = {
  onNext: () => void;
  onPrev: () => void;
  onDrag: (dx: number) => void;
  threshold?: number;
};

export function useSwipe({
  onNext,
  onPrev,
  onDrag,
  threshold = 100,
}: SwipeOptions) {
  const state = useRef({ active: false, x0: 0, y0: 0 });

  return {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      state.current = { active: true, x0: e.clientX, y0: e.clientY };
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!state.current.active) return;
      const dx = e.clientX - state.current.x0;
      const dy = e.clientY - state.current.y0;
      if (Math.abs(dx) > Math.abs(dy)) onDrag(dx);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!state.current.active) return;
      const dx = e.clientX - state.current.x0;
      state.current.active = false;
      onDrag(0);
      if (dx <= -threshold) onNext();
      else if (dx >= threshold) onPrev();
    },
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!state.current.active) return;
      const dx = e.clientX - state.current.x0;
      state.current.active = false;
      onDrag(0);
      if (dx <= -threshold) onNext();
      else if (dx >= threshold) onPrev();
    },
    style: { touchAction: "pan-y" as const },
  };
}
