"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

type SwipeOptions = {
  onDrag: (dx: number) => void;
  onEnd: (dx: number) => void;
};

export function useSwipe({ onDrag, onEnd }: SwipeOptions) {
  const state = useRef({ active: false, x0: 0, y0: 0 });

  const end = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!state.current.active) return;
    const dx = e.clientX - state.current.x0;
    state.current.active = false;
    onEnd(dx);
  };

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
    onPointerUp: end,
    onPointerCancel: end,
    style: { touchAction: "pan-y" as const },
  };
}
