---
name: react-review
description: Unified code review for React/Next.js apps covering security, performance, React 19 patterns, code quality, and UI/UX. Use when asked to "review code", "security audit", "review my components", or "check code quality".
metadata:
  author: al-soup
  version: "1.0.0"
  argument-hint: <file-or-pattern-or-all>
---

# React Review

Unified code review skill that orchestrates security, performance, React 19,
code quality, and UI/UX checks across target files.

## How It Works

1. **Resolve targets** from the argument:
   - A file path: review that file
   - A glob pattern (e.g. `src/components/**/*.tsx`): review all matches
   - `all`: review all `.ts`, `.tsx`, `.js`, `.jsx` files under `src/`
   - No argument: ask which files to review
2. **Load knowledge bases**:
   - `react-review/AGENTS.md` (security, React 19, code quality rules)
   - `vercel-react-best-practices/AGENTS.md` (performance rules)
3. **Fetch UI/UX guidelines** from the web-design-guidelines source:
   ```
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   ```
4. **Read all target files**
5. **Review** across 5 categories in priority order:
   1. Security (CRITICAL-MEDIUM)
   2. Performance (CRITICAL-LOW)
   3. React 19 patterns (HIGH-LOW)
   4. Code quality (MEDIUM-LOW)
   5. UI/UX (from web-design-guidelines)

## Output Format

Group findings by severity. Use terse `file:line` format:

```
## CRITICAL

- `src/actions/user.ts:12` [sec-auth] Server Action missing auth check
- `src/components/Comment.tsx:45` [sec-xss] dangerouslySetInnerHTML with user input

## HIGH

- `src/app/api/upload/route.ts:8` [sec-csrf] No CSRF protection on mutation endpoint
- `src/components/Dashboard.tsx:3` [react19-rsc] Unnecessary "use client" — no hooks or event handlers

## MEDIUM

- `src/hooks/useData.ts:22` [quality-ts] Using `any` type — prefer explicit type
- `src/components/Card.tsx:15` [react19-compiler] Consider enabling React Compiler to remove manual memo

## LOW

- `src/components/Header.tsx:30` [react19-ref] forwardRef can be replaced with ref prop
- `src/utils/helpers.ts:44` [quality-dead] Unused export `formatDate`
```

If no findings: "No issues found."

## Rules

### Security (10 rules, prefix `sec-`)

| Rule | Severity | File |
|------|----------|------|
| `sec-xss` | CRITICAL | `rules/sec-xss.md` |
| `sec-injection` | CRITICAL | `rules/sec-injection.md` |
| `sec-csrf` | HIGH | `rules/sec-csrf.md` |
| `sec-auth` | CRITICAL | `rules/sec-auth.md` |
| `sec-secrets` | CRITICAL | `rules/sec-secrets.md` |
| `sec-deps` | MEDIUM | `rules/sec-deps.md` |
| `sec-headers` | HIGH | `rules/sec-headers.md` |
| `sec-storage` | HIGH | `rules/sec-storage.md` |
| `sec-ssrf` | HIGH | `rules/sec-ssrf.md` |
| `sec-logging` | MEDIUM | `rules/sec-logging.md` |

### React 19 (6 rules, prefix `react19-`)

| Rule | Severity | File |
|------|----------|------|
| `react19-compiler` | MEDIUM | `rules/react19-compiler.md` |
| `react19-use` | MEDIUM | `rules/react19-use-hook.md` |
| `react19-actions` | HIGH | `rules/react19-actions.md` |
| `react19-rsc` | HIGH | `rules/react19-server-components.md` |
| `react19-ref` | LOW | `rules/react19-ref-as-prop.md` |
| `react19-metadata` | LOW | `rules/react19-metadata.md` |

### Code Quality (4 rules, prefix `quality-`)

| Rule | Severity | File |
|------|----------|------|
| `quality-dry` | MEDIUM | `rules/quality-dry.md` |
| `quality-dead` | LOW | `rules/quality-dead-code.md` |
| `quality-ts` | MEDIUM | `rules/quality-typescript.md` |
| `quality-complexity` | MEDIUM | `rules/quality-complexity.md` |

### Performance (57 rules)

Loaded from `vercel-react-best-practices/AGENTS.md`. See that skill for the full list.

### UI/UX

Fetched live from web-design-guidelines source URL above.

## Usage

```
/react-review src/context/ThemeContext.tsx
/react-review src/components/**/*.tsx
/react-review all
```
