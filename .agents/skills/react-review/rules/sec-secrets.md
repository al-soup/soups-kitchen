---
title: Secret Exposure
impact: CRITICAL
impactDescription: leaked credentials, API keys, or tokens
tags: security, secrets, env, NEXT_PUBLIC, server-only
---

## Secret Exposure

**Impact: CRITICAL (leaked credentials, API keys, or tokens)**
**OWASP: A02:2021 — Cryptographic Failures**

Flag env vars prefixed `NEXT_PUBLIC_` containing sensitive values. Flag hardcoded secrets in source. Flag missing `server-only` imports in files using secrets.

**Unsafe (public env with secrets):**

```env
NEXT_PUBLIC_DATABASE_URL=postgres://user:pass@host/db
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
```

**Unsafe (hardcoded secret):**

```typescript
const API_KEY = 'sk-1234567890abcdef'
```

**Unsafe (server code without guard):**

```typescript
// This file could be imported by client code
import { db } from './db'
export function getUsers() { return db.user.findMany() }
```

**Safe:**

```env
DATABASE_URL=postgres://user:pass@host/db
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://myapp.com
```

```typescript
import 'server-only'
import { db } from './db'
export function getUsers() { return db.user.findMany() }
```

**What to flag:**

- `NEXT_PUBLIC_` env vars with names containing: SECRET, KEY, TOKEN, PASSWORD, DATABASE, PRIVATE
- String literals matching secret patterns: `sk_`, `pk_`, API key formats, connection strings
- Files importing DB clients, auth libs, or using `process.env.SECRET_*` without `import 'server-only'`
- `.env` files committed to git (check `.gitignore`)
