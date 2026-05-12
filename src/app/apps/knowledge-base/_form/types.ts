export interface KnowledgeFormInitial {
  question: string;
  summary: string;
  detail: string | null;
  tagIds: string[];
}

export function isDraftDirty(
  a: KnowledgeFormInitial,
  b: KnowledgeFormInitial
): boolean {
  if (a.question !== b.question) return true;
  if (a.summary !== b.summary) return true;
  if ((a.detail ?? "") !== (b.detail ?? "")) return true;
  const aSorted = [...a.tagIds].sort();
  const bSorted = [...b.tagIds].sort();
  if (aSorted.length !== bSorted.length) return true;
  for (let i = 0; i < aSorted.length; i++) {
    if (aSorted[i] !== bSorted[i]) return true;
  }
  return false;
}
