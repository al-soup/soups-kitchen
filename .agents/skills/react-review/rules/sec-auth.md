---
title: Authentication & Authorization
impact: CRITICAL
impactDescription: unauthorized access to data and mutations
tags: security, auth, authorization, bola, server-actions, api-routes
---

## Authentication & Authorization

**Impact: CRITICAL (unauthorized access to data and mutations)**
**OWASP: A01:2021 — Broken Access Control, A07:2021 — Auth Failures**

Flag Server Actions without auth checks. Flag API Route handlers without auth checks. Flag BOLA — actions accepting an `id` param without verifying the caller owns that resource.

**Unsafe (no auth check):**

```typescript
'use server'
export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } })
}
```

**Safe (auth + authorization):**

```typescript
'use server'
import { auth } from '@/lib/auth'

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const post = await db.post.findUnique({ where: { id: postId } })
  if (post?.authorId !== session.user.id) throw new Error('Forbidden')

  await db.post.delete({ where: { id: postId } })
}
```

**What to flag:**

- `'use server'` functions without `auth()`, `getSession()`, `verifySession()`, or equivalent
- API route handlers (GET/POST/PUT/DELETE exports) without auth checks
- Functions accepting resource IDs without ownership verification (BOLA)
- Auth checks only in middleware/layout (Server Actions bypass these)
