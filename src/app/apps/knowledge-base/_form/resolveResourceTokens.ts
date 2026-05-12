import type { ResolvedResource } from "@/app/resources/api";

const TOKEN_RE = /\{\{resource:([0-9a-f-]{36})\}\}/g;

export function extractResourceIds(md: string | null | undefined): string[] {
  if (!md) return [];
  const ids = new Set<string>();
  for (const m of md.matchAll(TOKEN_RE)) ids.add(m[1]);
  return Array.from(ids);
}

export function replaceResourceTokens(
  md: string,
  lookup: Record<string, ResolvedResource>
): string {
  return md.replace(TOKEN_RE, (_match, id: string) => {
    const r = lookup[id];
    if (!r || !r.url) return "~~missing resource~~";
    const alt = r.filename ?? "resource";
    if (r.mime && r.mime.startsWith("image/")) {
      return `![${alt}](${r.url})`;
    }
    return `[${alt}](${r.url})`;
  });
}
