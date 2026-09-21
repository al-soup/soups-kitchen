/**
 * Returns `path` if it's a safe relative redirect, otherwise `"/"`.
 * Rejects protocol-relative (`//…`) and backslash variants (`/\…`) that
 * browsers normalize into external redirects.
 */
export function safeRedirect(path: string | null | undefined): string {
  return path && /^\/(?![/\\])/.test(path) ? path : "/";
}
