"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePageContext } from "@/context/PageContext";
import styles from "./page.module.css";

const WAVE_DUR = 18;
const WAVE_CYCLES = 2;

export default function Home() {
  const { setHideBrand } = usePageContext();
  const animRef = useRef<SVGAnimateElement>(null);
  const stoppedRef = useRef(false);

  const pauseAnim = useCallback(() => {
    animRef.current?.closest("svg")?.pauseAnimations();
  }, []);

  const resumeAnim = useCallback(() => {
    if (stoppedRef.current) return;
    animRef.current?.closest("svg")?.unpauseAnimations();
  }, []);

  useEffect(() => {
    setHideBrand(true);
    return () => setHideBrand(false);
  }, [setHideBrand]);

  // Stop after N cycles
  useEffect(() => {
    const timer = setTimeout(
      () => {
        stoppedRef.current = true;
        pauseAnim();
      },
      WAVE_DUR * WAVE_CYCLES * 1000
    );
    return () => clearTimeout(timer);
  }, [pauseAnim]);

  // Pause on hidden tab, resume on visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseAnim();
      else resumeAnim();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pauseAnim, resumeAnim]);

  return (
    <div className={styles.page}>
      {/* SVG wave distortion filter */}
      <svg className={styles.svgFilters} aria-hidden="true">
        <filter id="waves">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.003"
            numOctaves="2"
            seed="2"
            result="noise"
          >
            <animate
              ref={animRef}
              attributeName="baseFrequency"
              values="0.015 0.003;0.018 0.005;0.015 0.003"
              dur={`${WAVE_DUR}s`}
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

      {/* Wavy blue lines background */}
      <div className={styles.wavesBg}>
        <div className={styles.wavesStripes} />
      </div>

      {/* Logo */}
      <Image
        src="/soup.svg"
        alt="Soup's Kitchen logo"
        width={260}
        height={260}
        className={styles.logo}
        priority
      />

      <h1 className={styles.title}>
        <span className={styles.titleWord}>Soup&apos;s</span>{" "}
        <span className={styles.titleWord2}>Kitchen</span>
      </h1>
      <p className={styles.subtitle}>
        A multi-app platform hosting small tools and portfolio.
      </p>

      <nav className={styles.links}>
        <Link href="/about" className={styles.linkCard}>
          About
        </Link>
        <Link href="/apps" className={styles.linkCard}>
          Apps
        </Link>
      </nav>
    </div>
  );
}
