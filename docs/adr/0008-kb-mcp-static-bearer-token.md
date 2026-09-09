# KB MCP server = edge function behind a static bearer token

Agentic coding tools create Knowledge Base entries through a remote MCP
server (`supabase/functions/kb-mcp`, Streamable HTTP, stateless) so nothing
runs locally on any machine. Auth is a single static bearer token
(`KB_MCP_TOKEN`, timing-safe compare) with `verify_jwt = false`; writes use
the service role so RLS is bypassed, and the KB→habit trigger (ADR-0005)
still fires. OAuth / per-user JWTs were rejected: one maintainer, one token,
rotate by changing the secret. Setup and local testing:
[`supabase/functions/README.md`](../../supabase/functions/README.md#kb-mcp).
