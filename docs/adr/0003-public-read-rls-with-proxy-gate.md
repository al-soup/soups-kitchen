# RLS stays public-read; the proxy login gate is UX only

The Knowledge Base is intentionally public (list, detail, and anon `SELECT`
on `resources` + the `resources` storage bucket so detail pages can resolve
`{{resource:<id>}}` embeds to signed URLs for anonymous readers). Management
surfaces (`/resources`, `/apps/habits/*` sub-paths) redirect anonymous users
to `/login` from `src/proxy.ts`, but the underlying `habit` / `resources` rows
remain world-readable by RLS. The gate keeps those pages out of casual
browsing; it is not a security boundary, and no data behind it is secret.
Writes are the boundary (ADR-0002). Protected paths are listed in
`src/lib/protectedRoutes.ts`; pages keep a client-side redirect as fallback
for client navigations.
