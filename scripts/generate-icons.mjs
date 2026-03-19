import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const apps = [
  {
    name: "habits",
    // Green circle with white checkmark
    overlay: `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="90" fill="#22c55e"/>
      <path d="M50 95 L80 125 L130 65" stroke="white" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: "fahrplan",
    // Blue circle with white train icon
    overlay: `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="90" fill="#3b82f6"/>
      <g transform="translate(90,90)">
        <rect x="-40" y="-50" width="80" height="75" rx="10" fill="white"/>
        <rect x="-30" y="-38" width="60" height="28" rx="4" fill="#3b82f6"/>
        <circle cx="-20" cy="10" r="8" fill="#3b82f6"/>
        <circle cx="20" cy="10" r="8" fill="#3b82f6"/>
        <rect x="-25" y="25" width="10" height="15" rx="2" fill="white"/>
        <rect x="15" y="25" width="10" height="15" rx="2" fill="white"/>
      </g>
    </svg>`,
  },
];

const sizes = [192, 512];

async function generate() {
  const baseSvg = path.join(root, "public", "soup.svg");
  const base512 = await sharp(baseSvg).resize(512, 512).png().toBuffer();

  for (const app of apps) {
    const overlayBuf = await sharp(Buffer.from(app.overlay))
      .resize(180, 180)
      .png()
      .toBuffer();

    const composited = await sharp(base512)
      .composite([{ input: overlayBuf, gravity: "southeast" }])
      .png()
      .toBuffer();

    for (const size of sizes) {
      const out = path.join(root, "public", "icons", `${app.name}-${size}.png`);
      await sharp(composited).resize(size, size).png().toFile(out);
      console.log(`Generated ${out}`);
    }
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
