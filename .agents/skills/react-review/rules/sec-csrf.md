---
title: Cross-Site Request Forgery (CSRF)
impact: HIGH
impactDescription: unauthorized state-changing requests on behalf of users
tags: security, csrf, api-routes, credentials, forms
---

## Cross-Site Request Forgery (CSRF)

**Impact: HIGH (unauthorized state-changing requests on behalf of users)**
**OWASP: A01:2021 — Broken Access Control**

Flag API Route handlers performing mutations without CSRF protection. Flag `credentials: 'include'` on cross-origin fetches. Flag forms posting to external URLs.

**Unsafe (no CSRF check):**

```typescript
export async function POST(req: Request) {
  const data = await req.json()
  await db.user.update({ where: { id: data.id }, data })
  return Response.json({ ok: true })
}
```

**Safe (origin verification):**

```typescript
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')
  if (!origin || new URL(origin).host !== host) {
    return new Response('Forbidden', { status: 403 })
  }
  const data = await req.json()
  await db.user.update({ where: { id: data.id }, data })
  return Response.json({ ok: true })
}
```

**Unsafe (cross-origin credentials):**

```typescript
fetch('https://external-api.com/data', { credentials: 'include' })
```

**What to flag:**

- POST/PUT/PATCH/DELETE route handlers without origin/referer check or CSRF token
- `credentials: 'include'` on fetches to external domains
- `<form action="https://external-domain.com/...">`
- Note: Next.js Server Actions have built-in CSRF protection — only flag raw API routes
