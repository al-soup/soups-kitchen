import { Waves } from "@/components/ui/Waves";
import { DirectoryMenu } from "@/components/layout/DirectoryMenu";
import { getMenuGroups } from "@/constants/navigation";
import { LANDING_INTRO } from "./content";
import styles from "./page.module.css";

// viewBox, font size, tracking and baseline per breakpoint, from the design
// handoff. The hero keeps the viewBox aspect ratio so the word scales without
// distortion.
const CUTOUTS = [
  {
    id: "desktop",
    width: 1100,
    height: 420,
    x: 48,
    y: 360,
    size: 400,
    tracking: -20,
  },
  {
    id: "mobile",
    width: 390,
    height: 300,
    x: 20,
    y: 270,
    size: 150,
    tracking: -8,
  },
] as const;

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Waves />
        {CUTOUTS.map((c) => (
          <svg
            key={c.id}
            className={`${styles.cutout} ${styles[c.id]}`}
            viewBox={`0 0 ${c.width} ${c.height}`}
            aria-hidden="true"
          >
            <defs>
              <mask id={`soup-cutout-${c.id}`}>
                <rect width={c.width} height={c.height} fill="#fff" />
                <text
                  x={c.x}
                  y={c.y}
                  className={styles.cutoutText}
                  fontSize={c.size}
                  letterSpacing={c.tracking}
                  fill="#000"
                >
                  soup
                </text>
              </mask>
            </defs>
            <rect
              width={c.width}
              height={c.height}
              className={styles.cutoutGround}
              mask={`url(#soup-cutout-${c.id})`}
            />
          </svg>
        ))}
        <h1 className={styles.owner}>Alex Kräuchi</h1>
      </section>

      <div className={styles.body}>
        <div>
          <p className={styles.lead}>{LANDING_INTRO.lead}</p>
          <p className={styles.aside}>{LANDING_INTRO.aside}</p>
        </div>
        <div className={styles.menu}>
          <DirectoryMenu
            groups={getMenuGroups({ surface: "landing", signedIn: false })}
            variant="inline"
          />
        </div>
      </div>
    </div>
  );
}
