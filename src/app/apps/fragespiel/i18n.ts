export type Lang = "de" | "en";

export type Group = "friends" | "couple";

export const L10N = {
  de: {
    tagline: "Eine Frage. Viele Antworten.",
    choose: "Wählt eure Runde",
    restart: "Neu mischen",
    changeGroup: "Runde wechseln",
    language: "Sprache",
    sortByIntensity: "Nach Intensität",
    next: "Weiter",
  },
  en: {
    tagline: "One question. Many answers.",
    choose: "Choose your round",
    restart: "Reshuffle",
    changeGroup: "Change round",
    language: "Language",
    sortByIntensity: "Sort by intensity",
    next: "Next",
  },
} as const;

export const GROUPS: {
  id: Group;
  de: { n: string; d: string };
  en: { n: string; d: string };
}[] = [
  {
    id: "friends",
    de: { n: "Freunde", d: "Alles ist dabei" },
    en: { n: "Friends", d: "Anything goes" },
  },
  {
    id: "couple",
    de: { n: "Paar", d: "Tief & intim, zu zweit" },
    en: { n: "Couple", d: "Deep & intimate, for two" },
  },
];

const LANG_KEY = "fs-lang";

// In-tab subscribers (storage events only fire cross-tab, so we manage our own
// listeners for same-tab saveLang() calls).
const listeners = new Set<() => void>();

export function subscribeLang(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) callback();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(callback);
  };
}

export function getLangSnapshot(): Lang {
  if (typeof window === "undefined") return "de";
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function getServerLangSnapshot(): Lang {
  return "de";
}

export function saveLang(l: Lang) {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb());
}
