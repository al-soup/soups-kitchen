import type { Metadata } from "next";
import {
  Baloo_2,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { PageProvider } from "@/context/PageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Shell } from "@/components/layout/Shell";
import {
  ALL_THEMES,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from "@/constants/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

// Site-wide mono for labels, menus and headings; KB also uses it (ADR-0012).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// KB-scoped display + body fonts; do not promote globally (ADR-0009).
const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

// Fragespiel-scoped fonts (risograph design).
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const FONT_VARIABLES = [
  inter,
  spaceGrotesk,
  plexMono,
  jetbrainsMono,
  baloo2,
  hankenGrotesk,
  spaceMono,
  instrumentSerif,
]
  .map((font) => font.variable)
  .join(" ");

// Runs before paint. Any stored value that is not a current theme (e.g. the
// removed "neo-brutalist") falls back to the default.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-theme",${JSON.stringify(ALL_THEMES)}.includes(t)?t:"${DEFAULT_THEME}")}catch(e){}})()`;

export const metadata: Metadata = {
  title: "Soup's Kitchen",
  description: "Multi-app platform hosting small tools and portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables sit on <html> because globals.css resolves
    // --font-sans / --font-mono from them on :root.
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      className={FONT_VARIABLES}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PageProvider>
              <Shell>{children}</Shell>
            </PageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
