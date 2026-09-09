/**
 * Routes that require a logged-in user. Enforced server-side in
 * `src/proxy.ts` (redirect to `/login?redirectTo=<path>`); pages keep their
 * client-side redirect as fallback for client navigations.
 */

/** Protected including the path itself. */
const PROTECTED = ["/resources"];

/** Only sub-paths protected; the root stays public (`habit` rows are world-readable by RLS). */
const PROTECTED_SUBTREES = ["/apps/habits"];

export function isProtectedPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return (
    PROTECTED.some((x) => p === x || p.startsWith(`${x}/`)) ||
    PROTECTED_SUBTREES.some((x) => p.startsWith(`${x}/`))
  );
}
