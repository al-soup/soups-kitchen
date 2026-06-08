import type { Metadata } from "next";
import {
  Baloo_2,
  Hanken_Grotesk,
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
import { THEME_STORAGE_KEY, NON_DEFAULT_THEMES } from "@/constants/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// KB-scoped display + body + mono fonts (Direction 1 redesign).
// Only used inside the Knowledge Base overview; do not promote globally.
const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t&&${JSON.stringify([...NON_DEFAULT_THEMES])}.includes(t)){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${baloo2.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} ${spaceMono.variable} ${instrumentSerif.variable}`}
      >
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
