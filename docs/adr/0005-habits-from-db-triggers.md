# 0005. Cross-app habit rows are created by DB triggers

Date: 2026-09-09

## Context

A synced Strava ride should count as a `Cycling` habit and a new Knowledge Base entry as a
`Learning Session` habit. Rows in `strava_rides` and `knowledge` are written by several callers:
the web app, the KB MCP server, the Strava edge function and occasionally the SQL editor.
App-level code would have to be repeated in each of them.

## Decision

`AFTER INSERT` triggers (`habit_from_strava_ride`, `trg_knowledge_to_habit`) create the habit
row inside the database. The target action is looked up by name; if it is missing the trigger
raises a warning and lets the originating insert succeed.

## Consequences

- Every writer gets the side effect for free; there is exactly one implementation.
- Renaming or deleting an action silently stops habit creation for that source. Check the
  Postgres logs for the warning.
- KB habit notes are `<question>\n\n<url>`; the format lives in the trigger, not the app.
- The CI merge habit (ADR-0006) is the one direct insert because it has no source row.
