---
title: Client-Side Storage Security
impact: HIGH
impactDescription: sensitive data exposure via browser storage
tags: security, localStorage, sessionStorage, storage, pii
---

## Client-Side Storage Security

**Impact: HIGH (sensitive data exposure via browser storage)**
**OWASP: A02:2021 — Cryptographic Failures**

Flag sensitive data (tokens, passwords, PII) in `localStorage` or `sessionStorage`. Flag missing `try-catch` around storage access. Flag `JSON.parse` on storage values without validation.

**Unsafe (sensitive data in storage):**

```typescript
localStorage.setItem('authToken', token)
localStorage.setItem('user', JSON.stringify({ email, ssn }))
```

**Unsafe (no error handling):**

```typescript
const data = JSON.parse(localStorage.getItem('settings')!)
```

**Safe:**

```typescript
// Auth tokens belong in httpOnly cookies (server-set)
// Only store non-sensitive preferences

function getSettings(): Settings {
  try {
    const raw = localStorage.getItem('settings')
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return settingsSchema.parse(parsed)
  } catch {
    return defaultSettings
  }
}
```

**What to flag:**

- `localStorage.setItem` / `sessionStorage.setItem` with keys like: token, auth, session, password, secret, ssn, credit
- `JSON.parse(localStorage.getItem(...))` without try-catch
- Non-null assertions on storage reads (`!`)
- Storing JWTs or refresh tokens in browser storage
