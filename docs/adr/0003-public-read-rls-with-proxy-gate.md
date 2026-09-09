# 0003. RLS stays public-read; the proxy login gate is UX only

Date: 2026-09-09

## Context

The Knowledge Base is meant to be public, including detail pages that embed uploaded resources
via `{{resource:<id>}}` tokens resolved to signed URLs. Habit and resource management pages are
not secret, but they are not meant to be browsed casually either. Locking the underlying rows
would break public KB pages for anonymous readers.

## Decision

RLS grants `SELECT` on `knowledge`, `knowledge_tags`, `tags`, `resources` and the `resources`
storage bucket to `anon, authenticated`; `habit` stays world-readable too. Management surfaces
(`/resources`, `/apps/habits/*` sub-paths) are gated in `src/proxy.ts`, which redirects
anonymous users to `/login?redirectTo=<path>`. Writes are the real boundary (ADR-0002).

## Consequences

- The proxy gate is not a security control. Nothing behind it may become secret without also
  changing RLS.
- Protected paths are the list in `src/lib/protectedRoutes.ts`; pages keep a client-side redirect
  as fallback for client navigations.
- `redirectTo` is honoured only through `safeRedirect()` to prevent open redirects.
- Anonymous `SELECT` on `resources` is load-bearing for public KB detail pages; revoking it
  breaks embeds for visitors.
