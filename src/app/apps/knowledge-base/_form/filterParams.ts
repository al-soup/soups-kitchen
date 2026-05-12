export const TOPICS_PARAM = "topics";
export const CONCEPTS_PARAM = "concepts";
export const Q_PARAM = "q";

export function buildKnowledgeQuery(
  topicNames: string[],
  conceptNames: string[],
  q: string
): string {
  const params = new URLSearchParams();
  for (const n of topicNames) params.append(TOPICS_PARAM, n);
  for (const n of conceptNames) params.append(CONCEPTS_PARAM, n);
  const trimmed = q.trim();
  if (trimmed) params.set(Q_PARAM, trimmed);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function toggleString(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}
