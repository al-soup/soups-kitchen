# CLAUDE.md

Multi-app platform ("Soup's Kitchen"). What the apps are, how to run them,
scripts, env vars, auth model: [README.md](./README.md). Domain vocabulary:
[CONTEXT.md](./CONTEXT.md). Why things are the way they are:
[docs/adr/](./docs/adr/README.md).

## Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.
- Run `pnpm run format` at the end of every task.
- Markdown follows CommonMark lint syntax.
- Commit titles start with one of `feat: fix: refactor: chore: docs: build: ci: style: perf: test:`.
- No references to Claude in commit messages. Don't prompt for committing
  unless asked.
- CI on push: build, format:check, lint:check, unit tests. PRs add e2e.

## Planning

- End every plan with a list of unresolved questions, if any. Extremely
  concise, sacrifice grammar.
- Every plan includes CLAUDE.md / README.md / ADR / CONTEXT.md update steps
  when the change affects structure, patterns, vocabulary or decisions.

## Code Comments

**The rule: a comment survives only if it states a fact not derivable from the
code and types.** That means business rules, external-system quirks (with a
link to the ticket/spec where one exists), deliberate deviations from the
obvious path, and invariants the compiler cannot see. Everything else is noise
— do not write it, delete it on sight:

- No restating the code, the identifier, or the type signature (incl.
  `@param`/`@returns` that repeat the types). Prefer a well-named function over
  a _what_-comment.
- No process narration ("Added error handling here") and no commented-out
  code — git holds the history.
- One home per fact: a rationale needed in several places lives in an ADR,
  `CONTEXT.md`, or one canonical comment; the other sites get a one-line
  pointer. Two full copies **will** drift.
- Keep comments in sync: changing code under a comment means updating or
  deleting the comment in the same edit.

Exception: purely **navigational** group headers in large dictionary-style
files earn their keep even though they restate the keys.

Mechanics: `//` for one-liners, JSDoc for public API where it adds facts.
Deliberate debt is tagged: `TODO (context):` / `FIXME (context):` — never a
bare `TODO`. Match the style and density of the file you are editing.

## Documentation

Strictly typed code is the source of truth; documentation is need-to-know and
minimal:

- **Decisions** go to [`docs/adr/`](./docs/adr/README.md) — one file per
  decision, short. **ADRs take precedence over `README.md` and `docs/` when
  they conflict.**
- **Domain vocabulary** goes to [CONTEXT.md](./CONTEXT.md) — glossary only, no
  implementation.
- **How to run / set up** goes to `README.md` (app) and
  [`supabase/functions/README.md`](./supabase/functions/README.md) (edge
  functions).
- This file holds only rules and conventions an agent needs on every task.

## Writing Tests

- Don't export private functions for the sole purpose of testing. Only test
  public functions or else a refactoring of the architecture and abstraction
  is necessary.
- Unit: Jest + jsdom, colocated `*.test.ts(x)`. E2e: Playwright, chromium
  only, seeded local Supabase (`config.ci.toml`, seed users in README).

## Conventions

- **Layout**: `src/app/apps/<name>/` per app; shared layout in
  `src/components/layout/`; hooks in `src/hooks/`; Supabase clients + generated
  `database.types.ts` in `src/lib/supabase/`; migrations in
  `supabase/migrations/`, seed in `supabase/seed.sql`; edge functions in
  `supabase/functions/`; build helpers in `scripts/`.
- **Next.js 16**: request middleware is `src/proxy.ts` (renamed from
  `middleware.ts`, see
  <https://nextjs.org/docs/messages/middleware-to-proxy#why-the-change>).
- **Page title**: `usePageTitle(title, subtitle?)` in every page, or
  `<PageTitle title="..." />` where the hook can't sit at top level.
- **Styling**: CSS Modules only; theme via `--foreground`, `--background`,
  `--border-color` etc. from `globals.css`. Themes: light, dark, neo-brutalist.
- **Icons**: check `src/constants/icons.tsx` first; domain-specific icons live
  in the feature's `icons.tsx`; render new ones at `/dev/icons`.
- **Write gating**: `useCanManage(table)` hides write UI; RLS is the real
  boundary (ADR-0002). Never rely on the hook for security.
- **Protected routes**: add paths to `src/lib/protectedRoutes.ts`; the proxy
  redirects anon server-side, pages keep a client `useEffect` fallback
  (ADR-0003). Login honours `redirectTo` only through `safeRedirect()`.
- **State reset on prop change**: remount with `key={prop}` instead of
  `setState` in an effect (react-compiler lint error).
- **Migrations**: new file timestamp must sort after the latest existing one;
  run `pnpm supabase:types` after schema changes and commit the result.
- **Cross-app side effects** (auto-created habits) belong in DB triggers, not
  app code (ADR-0005).
- **KB fonts** stay inside `knowledge-base/` CSS modules (ADR-0009).
