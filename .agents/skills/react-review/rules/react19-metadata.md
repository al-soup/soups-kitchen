---
title: Metadata API
impact: LOW
impactDescription: native document metadata without side effects
tags: react19, metadata, title, head, seo
---

## Metadata API

**Impact: LOW (native document metadata without side effects)**

Flag `document.title` assignments in `useEffect`. Flag manual `<Head>` component usage. Prefer the Next.js `metadata` export or React 19's native `<title>` JSX.

**Legacy (useEffect for title):**

```tsx
'use client'
import { useEffect } from 'react'

function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings | My App'
  }, [])
  return <div>...</div>
}
```

**Next.js metadata export:**

```tsx
export const metadata = { title: 'Settings | My App' }
export default function SettingsPage() { return <div>...</div> }
```

**React 19 JSX (works in client components too):**

```tsx
function SettingsPage() {
  return (
    <>
      <title>Settings | My App</title>
      <div>...</div>
    </>
  )
}
```

**What to flag:**

- `document.title =` in `useEffect`
- `import Head from 'next/head'` — use metadata export or `<title>` JSX
- Manual `<meta>` tag injection via DOM APIs
