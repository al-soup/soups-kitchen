# Supabase is the whole backend

Soup's Kitchen is a single-maintainer side project: auth, Postgres (with RLS),
Storage, cron and edge functions all run on one hosted Supabase project so
there is no server of our own to operate. The lock-in is accepted; business
rules that must hold for every writer (app, MCP server, CI) are expressed in
SQL (RLS, triggers, RPCs) rather than in Next.js code, so the app is a thin
client. Three clients exist because `@supabase/ssr` needs cookie access per
runtime: browser, server components / route handlers, and the proxy layer
(`src/lib/supabase/`).
