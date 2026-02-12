---
title: use() Hook
impact: MEDIUM
impactDescription: cleaner context consumption and promise handling
tags: react19, use, useContext, promises, suspense
---

## use() Hook

**Impact: MEDIUM (cleaner context consumption and promise handling)**

Flag `useContext(SomeContext)` — prefer `use(SomeContext)` in React 19. Flag manual promise handling in components where `use(promise)` applies.

**Legacy (useContext):**

```tsx
import { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

function Header() {
  const theme = useContext(ThemeContext)
  return <header className={theme}>...</header>
}
```

**React 19 (use):**

```tsx
import { use } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

function Header() {
  const theme = use(ThemeContext)
  return <header className={theme}>...</header>
}
```

**Promise usage:**

```tsx
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // suspends until resolved
  return <div>{user.name}</div>
}
```

**What to flag:**

- `useContext(X)` — suggest `use(X)`
- `useEffect` + `useState` for promise resolution where `use(promise)` applies
- Note: `use()` can be called conditionally (unlike other hooks)
