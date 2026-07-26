import type { Question } from "@/lib/supabase/types";
import { categoryLabel, UNCATEGORIZED, type Group, type Lang } from "./i18n";

export function categoryKey(q: Question): string {
  return q.category ?? UNCATEGORIZED;
}

// Distinct keys ordered by their *displayed* label (keys are English, so sorting
// on them would look unordered in German), uncategorized bucket last.
export function listCategories(questions: Question[], lang: Lang): string[] {
  const keys = [...new Set(questions.map(categoryKey))];
  return keys.sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return categoryLabel(a, lang).localeCompare(categoryLabel(b, lang), lang);
  });
}

export function categoryCounts(questions: Question[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    const key = categoryKey(q);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

// Single source of truth for what a round may draw from: group + category.
// Tracking *deselected* keys means an empty set is "everything on", so no
// initialization pass is needed and new DB categories default to on.
export function poolFor(
  questions: Question[],
  group: Group,
  deselected: ReadonlySet<string>
): Question[] {
  return questions.filter(
    (q) =>
      (group === "couple" || !q.is_for_couples) &&
      !deselected.has(categoryKey(q))
  );
}
