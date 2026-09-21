"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./Waves.module.css";

const CYCLE_SECONDS = 16;
// Continuous feTurbulence is expensive; freeze the waves after a minute.
const STOP_AFTER_MS = 60_000;

interface WavesProps {
  seed?: number;
  className?: string;
}

/** Fills its nearest positioned ancestor. */
export function Waves({ seed = 21, className }: WavesProps) {
  const filterId = `waves-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let stopped = false;

    const timer = setTimeout(() => {
      stopped = true;
      svg.pauseAnimations();
    }, STOP_AFTER_MS);

    const onVisibility = () => {
      if (document.hidden) svg.pauseAnimations();
      else if (!stopped) svg.unpauseAnimations();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={`${styles.waves} ${className ?? ""}`} aria-hidden="true">
      <svg ref={svgRef} className={styles.filterHost}>
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.003"
            numOctaves="2"
            seed={seed}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.015 0.003;0.018 0.005;0.015 0.003"
              dur={`${CYCLE_SECONDS}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="45"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div className={styles.stripes} style={{ filter: `url(#${filterId})` }} />
    </div>
  );
}
