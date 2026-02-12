---
title: React Compiler
impact: MEDIUM
impactDescription: automatic memoization eliminates manual optimization
tags: react19, compiler, useMemo, useCallback, memo
---

## React Compiler

**Impact: MEDIUM (automatic memoization eliminates manual optimization)**

If React Compiler (`babel-plugin-react-compiler`) is enabled, flag manual `useMemo`, `useCallback`, and `React.memo` — the compiler handles these automatically.

If the compiler is **not** enabled, emit a single low-priority note suggesting it.

**With compiler enabled — unnecessary:**

```tsx
const MemoizedCard = React.memo(function Card({ title }: { title: string }) {
  const formatted = useMemo(() => title.toUpperCase(), [title])
  const onClick = useCallback(() => console.log(title), [title])
  return <div onClick={onClick}>{formatted}</div>
})
```

**With compiler enabled — correct:**

```tsx
function Card({ title }: { title: string }) {
  const formatted = title.toUpperCase()
  const onClick = () => console.log(title)
  return <div onClick={onClick}>{formatted}</div>
}
```

**Without compiler (current default):**

> Consider enabling React Compiler (`babel-plugin-react-compiler`) to
> auto-optimize memoization. See https://react.dev/learn/react-compiler

**What to flag:**

- If compiler enabled: `useMemo`, `useCallback`, `React.memo` calls
- If compiler not enabled: single note suggesting enablement (LOW priority)
- Patterns that break the compiler: mutations during render, non-idempotent hooks
