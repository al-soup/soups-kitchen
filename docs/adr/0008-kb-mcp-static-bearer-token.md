# 0008. KB MCP server = edge function behind a static bearer token

Date: 2026-09-09

## Context

Agentic coding tools should be able to create Knowledge Base entries from any machine without
running anything locally. There is one maintainer; per-user identity and consent flows add
nothing.

## Decision

`supabase/functions/kb-mcp` is a remote MCP server (Streamable HTTP, stateless) exposing
`kb_list_tags`, `kb_search`, `kb_create_entry`. Auth is one static bearer token
(`KB_MCP_TOKEN`, timing-safe compare) with `verify_jwt = false`; writes use the service role.
OAuth and per-user JWTs were rejected as overkill.

## Consequences

- Anyone holding the token can write KB entries; rotation = change the secret and re-register
  clients (`claude mcp add --transport http --scope user`).
- Service-role writes bypass RLS, but the KB→habit trigger (ADR-0005) still fires.
- Setup and local testing:
  [`supabase/functions/README.md`](../../supabase/functions/README.md#kb-mcp).
