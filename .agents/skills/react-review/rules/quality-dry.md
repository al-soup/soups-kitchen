---
title: DRY Principle
impact: MEDIUM
impactDescription: reduces maintenance burden and inconsistency risk
tags: quality, dry, duplication, components, hooks
---

## DRY Principle

**Impact: MEDIUM (reduces maintenance burden and inconsistency risk)**

Flag duplicated JSX blocks (3+ near-identical blocks). Flag duplicated logic across components (extract to hook). Flag duplicated CSS patterns (extract to shared class or variable).

**Indicators:**

- Three or more components with near-identical JSX structure
- Same `useState` + `useEffect` pattern repeated across components
- Identical CSS blocks across `.module.css` files

**Duplicated JSX:**

```tsx
// Same card structure in 3+ places — extract component
<div className={styles.card}>
  <h3>{item.title}</h3>
  <p>{item.description}</p>
  <span>{item.date}</span>
</div>
```

**Duplicated logic:**

```tsx
// Same fetch + loading + error pattern in multiple components
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
useEffect(() => {
  fetch(url).then(r => r.json()).then(setData).finally(() => setLoading(false))
}, [url])
// Extract to: useFetch(url) or use SWR/React Query
```

**What to flag:**

- 3+ near-identical JSX blocks — extract shared component
- Same state + effect pattern in 2+ components — extract custom hook
- Identical CSS blocks in multiple module files — extract to shared class/variable
- Duplicated validation logic — extract to shared util/schema
