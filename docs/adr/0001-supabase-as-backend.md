# 0001. Supabase is the whole backend

Date: 2026-09-09

## Context

Soup's Kitchen is a single-maintainer side project hosting several small apps. It needs auth,
a relational store with row-level authorization, file storage, scheduled jobs and a place to run
server-side code, but there is nobody to operate servers.

## Decision

One hosted Supabase project provides all of it: Auth, Postgres with RLS, Storage, cron and Edge
Functions. Rules that must hold for every writer (web app, MCP server, CI, SQL editor) are
expressed in SQL (RLS policies, triggers, RPCs); the Next.js app is a thin client. Lock-in is
accepted.

## Consequences

- Three Supabase clients exist because `@supabase/ssr` needs cookie access per runtime:
  browser (`client.ts`), server components / route handlers (`server.ts`), proxy (`proxy.ts`) in
  `src/lib/supabase/`.
- Schema changes are migrations in `supabase/migrations/`; `database.types.ts` is generated
  from them and committed.
- Local development requires Docker for the local Supabase stack; ports are offset so it can run
  next to other projects (see README).
