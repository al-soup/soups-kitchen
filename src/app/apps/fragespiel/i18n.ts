export type Lang = "de" | "en";

export type Group = "friends" | "couple";

export const L10N = {
  de: {
    tagline: "Stell mir noch eine Frage.",
    rounds: "Rundenlänge",
    sortCards: "Karten sortieren",
    sortIntensity: "Nach Intensität",
    sortRandom: "Zufällig",
    categories: "Kategorien",
    allCategories: "Alle",
    choose: "Wählt eure Runde",
    restart: "Neu mischen",
    changeGroup: "Runde wechseln",
    language: "Sprache",
    next: "Weiter",
    playAgain: "Neue Runde spielen",
  },
  en: {
    tagline: "Ask me one more question.",
    rounds: "Round length",
    sortCards: "Sort cards",
    sortIntensity: "By intensity",
    sortRandom: "Random",
    categories: "Categories",
    allCategories: "All",
    choose: "Choose your round",
    restart: "Reshuffle",
    changeGroup: "Change round",
    language: "Language",
    next: "Next",
    playAgain: "Play another round",
  },
} as const;

export const GROUPS: {
  id: Group;
  de: { n: string; d: string };
  en: { n: string; d: string };
}[] = [
  {
    id: "friends",
    de: { n: "Freunde", d: "Locker & lebhaft, in der Gruppe" },
    en: { n: "Friends", d: "Light & lively, for the group" },
  },
  {
    id: "couple",
    de: { n: "Paar", d: "Tief & intim, zu zweit" },
    en: { n: "Couple", d: "Deep & intimate, for two" },
  },
];

// `questions.category` is nullable free text; this sentinel buckets the rows
// without one so they stay filterable instead of silently vanishing.
export const UNCATEGORIZED = "__uncategorized__";

// `questions.category` holds English free text; these translate the known values
// for the filter chips and the card kicker. Unknown values fall back to the raw
// string, so a new DB category still renders (untranslated) without a code change.
export const CATEGORY_LABELS: Record<string, { de: string; en: string }> = {
  Philosophy: { de: "Philosophie", en: "Philosophy" },
  Embarrassing: { de: "Peinlich", en: "Embarrassing" },
  Ethics: { de: "Ethik", en: "Ethics" },
  Personal: { de: "Persönlich", en: "Personal" },
  Fun: { de: "Spaß", en: "Fun" },
  [UNCATEGORIZED]: { de: "Sonstige", en: "Other" },
};

export function categoryLabel(key: string, lang: Lang): string {
  return CATEGORY_LABELS[key]?.[lang] ?? key;
}

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
