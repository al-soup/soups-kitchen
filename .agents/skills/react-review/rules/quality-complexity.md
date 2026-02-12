---
title: Complexity
impact: MEDIUM
impactDescription: improves readability, testability, and maintainability
tags: quality, complexity, component-size, nesting, useState, ternary
---

## Complexity

**Impact: MEDIUM (improves readability, testability, and maintainability)**

Flag components over 200 lines. Flag functions with nesting depth > 4. Flag components with > 5 `useState` calls. Flag ternary chains > 2 levels deep.

**Too many useState:**

```tsx
// 6+ useState — consider useReducer
function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
}
```

**Better:**

```tsx
function Form() {
  const [state, dispatch] = useReducer(formReducer, initialState)
}
```

**Nested ternary chain:**

```tsx
// 3+ levels — use object lookup or switch
const label = isAdmin ? 'Admin' : isMod ? 'Moderator' : isUser ? 'User' : 'Guest'
```

**Better:**

```tsx
const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin', mod: 'Moderator', user: 'User', guest: 'Guest'
}
const label = ROLE_LABELS[role]
```

**What to flag:**

- Components > 200 lines — split into smaller components
- Functions with nesting > 4 levels — flatten with early returns or extract helpers
- Components with > 5 `useState` calls — consider `useReducer`
- Ternary chains > 2 levels — use object lookup, switch, or if/else
- Single files with > 300 lines — consider splitting
