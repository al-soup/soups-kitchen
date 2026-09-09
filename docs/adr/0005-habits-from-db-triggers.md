# Cross-app habit rows are created by DB triggers

A synced Strava ride creates a `Cycling` habit and a new Knowledge Base entry
creates a `Learning Session` habit via `AFTER INSERT` triggers
(`habit_from_strava_ride`, `trg_knowledge_to_habit`), not via app code. The
trigger is the only place that sees every writer (web app, MCP server, CI,
SQL editor). The target action is looked up by name and the trigger soft-fails
with a warning if it is missing, so renaming an action never blocks the
originating insert. Note format is `<question>\n\n<url>` for KB entries; the
CI merge habit (ADR-0006) is the one exception and inserts directly because
there is no source row.
