---
title: Logging & Error Exposure
impact: MEDIUM
impactDescription: information leakage through logs and error messages
tags: security, logging, errors, stack-traces, error-boundary
---

## Logging & Error Exposure

**Impact: MEDIUM (information leakage through logs and error messages)**
**OWASP: A09:2021 — Security Logging and Monitoring Failures**

Flag stack traces returned to client in API responses. Flag sensitive data in `console.log`. Flag error boundaries exposing internal details.

**Unsafe (stack trace to client):**

```typescript
export async function POST(req: Request) {
  try {
    await processData(await req.json())
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: (error as Error).stack }, { status: 500 })
  }
}
```

**Unsafe (sensitive data in logs):**

```typescript
console.log('Login attempt:', { email, password })
console.log('API response:', fullUserObject)
```

**Safe:**

```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('Processing request for user:', data.userId)
    await processData(data)
    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/process failed:', error) // server-side only
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**What to flag:**

- `(error as Error).stack` or `error.message` in Response bodies
- `console.log` with objects that may contain: password, token, secret, ssn, credit
- Error boundaries rendering `error.stack` or `error.message` to users
- Catch blocks that rethrow raw errors to client without sanitizing
