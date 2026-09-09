export const TOPICS_PARAM = "topics";
export const CONCEPTS_PARAM = "concepts";
export const Q_PARAM = "q";
export const SORT_PARAM = "sort";

export type KnowledgeSort = "newest" | "oldest" | "topic";

export const DEFAULT_SORT: KnowledgeSort = "newest";

const SORTS: readonly KnowledgeSort[] = ["newest", "oldest", "topic"];

export function parseSort(value: string | null | undefined): KnowledgeSort {
  return SORTS.includes(value as KnowledgeSort)
    ? (value as KnowledgeSort)
    : DEFAULT_SORT;
}

export function buildKnowledgeQuery(
  topicNames: string[],
  conceptNames: string[],
  q: string,
  sort: KnowledgeSort = DEFAULT_SORT
): string {
  const params = new URLSearchParams();
  for (const n of topicNames) params.append(TOPICS_PARAM, n);
  for (const n of conceptNames) params.append(CONCEPTS_PARAM, n);
  const trimmed = q.trim();
  if (trimmed) params.set(Q_PARAM, trimmed);
  // Default sort stays out of the URL so unsorted links stay clean.
  if (sort !== DEFAULT_SORT) params.set(SORT_PARAM, sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function toggleString(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}
