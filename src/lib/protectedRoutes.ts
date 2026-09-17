/**
 * Routes that require a logged-in user. Enforced server-side in
 * `src/proxy.ts` (redirect to `/login?redirectTo=<path>`); pages keep their
 * client-side redirect as fallback for client navigations.
 */

/** Protected including the path itself. */
const PROTECTED = ["/resources"];

/** Only sub-paths protected; the root stays public (`habit` rows are world-readable by RLS). */
const PROTECTED_SUBTREES = ["/apps/habits"];

// Browsers fetch web app manifests without credentials, so a gated manifest
// always redirects to /login and the app stops being installable.
const MANIFEST_SUFFIX = "/manifest.webmanifest";

export function isProtectedPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p.endsWith(MANIFEST_SUFFIX)) return false;
  return (
    PROTECTED.some((x) => p === x || p.startsWith(`${x}/`)) ||
    PROTECTED_SUBTREES.some((x) => p.startsWith(`${x}/`))
  );
}
