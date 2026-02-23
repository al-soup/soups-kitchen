"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePageContext } from "@/context/PageContext";
import styles from "./page.module.css";

export default function Home() {
  const { setHideBrand } = usePageContext();

  useEffect(() => {
    setHideBrand(true);
    return () => setHideBrand(false);
  }, [setHideBrand]);

  return (
    <div className={styles.page}>
      {/* SVG wave distortion filter */}
      <svg className={styles.svgFilters} aria-hidden="true">
        <filter id="waves">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.003"
            numOctaves="3"
            seed="2"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.015 0.003;0.018 0.005;0.015 0.003"
              dur="14s"
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
