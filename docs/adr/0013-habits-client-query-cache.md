# 0013. Habits reads go through an in-memory stale-while-revalidate cache

Date: 2026-09-20

## Context

Every habits page is client-rendered and fetched straight from Supabase on mount. Tracker,
Insights and each type tab remounted and refetched the same year of scores and action counts
(#67). The Score Graph RPC also took one type per call, so the combined view fanned out into
N requests, and it shipped a `habit_ids` array nobody read. Free-tier egress is the only
budget that matters here; Vercel never sees these requests.

## Decision

- `src/app/apps/habits/queryCache.ts` is a module-level map: fresh entries (< 5 min) are
  served without a request, stale ones are served while revalidating, concurrent loads of one
  key share a promise. `useDailyHabitScores` and `useActionCounts` are its only consumers.
- The habit write functions (`createHabits`, `updateHabit`, `deleteHabit`) call
  `invalidateHabitsCache()` themselves; pages never do.
- No query library (react-query, SWR) — two hooks do not justify a dependency.
- No realtime. Habits created by triggers (ADR-0005) show up after the 5-minute window or a
  reload.
- `get_daily_habit_scores(action_types int[], …)` returns one row per `(type, day)` with a
  `habit_count`, so the combined view is one RPC.

## Consequences

- Cache lives per browser tab and dies on reload; there is nothing to persist or expire.
- The feed stays uncached: paginated, 21 rows, cheap.
- Anything new that reads habits goes through `useCachedQuery`; anything that writes must
  invalidate, or a stale graph is the bug.
