---
title: Server Components
impact: HIGH
impactDescription: reduces client bundle, enables server-side data access
tags: react19, rsc, server-components, use-client, serialization
---

## Server Components

**Impact: HIGH (reduces client bundle, enables server-side data access)**

Flag `"use client"` on components that don't use hooks, event handlers, browser APIs, or class components. Flag large client component trees that could be split. Flag non-serializable props passed from server to client components.

**Unnecessary "use client":**

```tsx
'use client' // No hooks, events, or browser APIs used

export function StaticCard({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
```

**Correct (remove directive):**

```tsx
export function StaticCard({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
```

**Split large client trees:**

```tsx
// Server Component — most content stays on server
export function PostPage({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <LikeButton postId={post.id} /> {/* Only this needs "use client" */}
    </article>
  )
}
```

**Non-serializable props:**

```tsx
// Unsafe — functions can't cross server→client boundary
<ClientComponent onSubmit={async () => { await save() }} />

// Safe — pass serializable data, define handlers client-side
<ClientComponent postId={post.id} />
```

**What to flag:**

- `"use client"` files with no hooks (`useState`, `useEffect`, etc.), no event handlers (`onClick`, `onChange`, etc.), no browser APIs (`window`, `document`, `localStorage`)
- Large `"use client"` files (>100 lines) where only a small part needs interactivity
- Functions, Dates, Maps, Sets, or class instances passed as props to client components
