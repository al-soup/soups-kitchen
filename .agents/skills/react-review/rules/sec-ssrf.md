---
title: Server-Side Request Forgery (SSRF)
impact: HIGH
impactDescription: internal network access, data exfiltration
tags: security, ssrf, fetch, redirect, server-side
---

## Server-Side Request Forgery (SSRF)

**Impact: HIGH (internal network access, data exfiltration)**
**OWASP: A10:2021 — Server-Side Request Forgery**

Flag server-side `fetch()` or HTTP calls where the URL is constructed from user input. Flag unvalidated redirect URLs.

**Unsafe (user-controlled URL):**

```typescript
'use server'
export async function fetchExternalData(url: string) {
  const res = await fetch(url) // user controls destination
  return res.json()
}
```

**Unsafe (open redirect):**

```typescript
export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect')
  return Response.redirect(redirect!)
}
```

**Safe (allowlist):**

```typescript
'use server'
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com']

export async function fetchExternalData(url: string) {
  const parsed = new URL(url)
  if (!ALLOWED_HOSTS.includes(parsed.host)) throw new Error('Host not allowed')
  if (parsed.protocol !== 'https:') throw new Error('HTTPS required')
  const res = await fetch(parsed.toString())
  return res.json()
}
```

**Safe (redirect validation):**

```typescript
export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect') ?? '/'
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return Response.redirect(new URL(redirect, url.origin))
  }
  return Response.redirect(new URL('/', url.origin))
}
```

**What to flag:**

- `fetch(userInput)` or `fetch(\`${userInput}\`)` in server code
- URL construction from request params without host allowlist
- `Response.redirect()` with unvalidated user input
- Missing protocol check (allowing `file://`, `ftp://`, internal IPs)
