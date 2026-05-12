export const TOPICS_PARAM = "topics";
export const CONCEPTS_PARAM = "concepts";

export function buildKnowledgeQuery(
  topicNames: string[],
  conceptNames: string[]
): string {
  const params = new URLSearchParams();
  for (const n of topicNames) params.append(TOPICS_PARAM, n);
  for (const n of conceptNames) params.append(CONCEPTS_PARAM, n);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function toggleString(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}
