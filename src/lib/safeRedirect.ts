/** Returns `path` if it's a safe relative redirect, otherwise `"/"`. */
export function safeRedirect(path: string | null | undefined): string {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/";
}
