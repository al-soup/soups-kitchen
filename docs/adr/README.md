# Architecture Decision Records

One file per decision. Record a decision only when it is hard to reverse, surprising without
context, and the result of a real trade-off. ADRs take precedence over `README.md` and `docs/`
when they conflict.

File: `NNNN-slug.md`, next number = highest existing + 1. Structure:

```md
# NNNN. Title

Date: YYYY-MM-DD

## Context

## Decision

## Consequences
```

Keep each section short. Never rewrite history: a reversed decision gets a new ADR and the old
one a `Status: superseded by NNNN` line under the date.

| ADR                                                   | Decision                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [0001](./0001-supabase-as-backend.md)                 | Supabase is the whole backend                                    |
| [0002](./0002-per-table-roles-in-jwt.md)              | Per-table roles stamped into the JWT, enforced by RLS            |
| [0003](./0003-public-read-rls-with-proxy-gate.md)     | RLS stays public-read; the proxy login gate is UX only           |
| [0004](./0004-strava-tokens-in-db.md)                 | Strava tokens live encrypted in a table, not in secrets          |
| [0005](./0005-habits-from-db-triggers.md)             | Cross-app habit rows are created by DB triggers                  |
| [0006](./0006-ci-merge-habit-least-privilege-role.md) | CI logs merges through a one-INSERT Postgres role                |
| [0007](./0007-kb-search-in-postgres-rpc.md)           | KB list = one RPC: tsvector + trigram, filters and paging in SQL |
| [0008](./0008-kb-mcp-static-bearer-token.md)          | KB MCP server = edge function behind a static bearer token       |
| [0009](./0009-kb-scoped-typography.md)                | KB fonts load globally but stay KB-only                          |
