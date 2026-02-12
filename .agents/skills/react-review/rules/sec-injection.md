---
title: Injection Attacks
impact: CRITICAL
impactDescription: data breach, unauthorized access, code execution
tags: security, injection, sql, nosql, path-traversal, redos, server-actions
---

## Injection Attacks

**Impact: CRITICAL (data breach, unauthorized access, code execution)**
**OWASP: A03:2021 — Injection**

Flag Server Actions and API routes that pass user input directly to database queries, file system operations, or shell commands without validation. Includes SQL/NoSQL injection, path traversal, and ReDoS.

**Unsafe (SQL injection):**

```typescript
'use server'
export async function searchUsers(query: string) {
  return db.$queryRaw(`SELECT * FROM users WHERE name = '${query}'`)
}
```

**Safe (parameterized query):**

```typescript
'use server'
import { z } from 'zod'

const searchSchema = z.object({ query: z.string().min(1).max(100) })

export async function searchUsers(input: unknown) {
  const { query } = searchSchema.parse(input)
  return db.user.findMany({ where: { name: query } })
}
```

**Unsafe (path traversal):**

```typescript
import { readFile } from 'fs/promises'
export async function getFile(filename: string) {
  return readFile(`/uploads/${filename}`)
  // filename = "../../etc/passwd" — path traversal
}
```

**Safe (path traversal prevention):**

```typescript
import path from 'path'
export async function getFile(filename: string) {
  const safe = path.basename(filename)
  const resolved = path.resolve('/uploads', safe)
  if (!resolved.startsWith('/uploads/')) throw new Error('Invalid path')
  return readFile(resolved)
}
```

**What to flag:**

- String interpolation/concatenation in SQL/NoSQL queries
- User input passed to `fs` operations without `path.basename`/`path.resolve` validation
- User input in `child_process.exec` or similar
- Complex regex patterns with user input (ReDoS)
- Server Action/API route params used directly without schema validation
