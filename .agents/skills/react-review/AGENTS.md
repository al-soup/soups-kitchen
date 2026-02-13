# React Review — Security, React 19 & Code Quality

**Version 1.0.0**
al-soup
February 2026

> Knowledge base for the `react-review` skill. Contains 20 rules across
> security (OWASP-mapped), React 19 modernization, and code quality.
> Designed for AI agents reviewing React/Next.js codebases.

---

## Agent Behavior

**Read-only reviewer.** Do NOT edit, write, or create files. Only read and
search the codebase. Output a structured report of findings with:

- Rule ID, severity, file path, and line number
- What the issue is and why it matters
- A suggested fix as a code snippet (do not apply it)

Group findings by category (Security > React 19 > Code Quality), sorted by
severity (CRITICAL > HIGH > MEDIUM > LOW).

---

## Table of Contents

1. [Security](#1-security) — **CRITICAL–MEDIUM**
   - 1.1 [Cross-Site Scripting (XSS)](#11-cross-site-scripting-xss)
   - 1.2 [Injection Attacks](#12-injection-attacks)
   - 1.3 [Cross-Site Request Forgery (CSRF)](#13-cross-site-request-forgery-csrf)
   - 1.4 [Authentication & Authorization](#14-authentication--authorization)
   - 1.5 [Secret Exposure](#15-secret-exposure)
   - 1.6 [Vulnerable Dependencies](#16-vulnerable-dependencies)
   - 1.7 [Security Headers](#17-security-headers)
   - 1.8 [Client-Side Storage](#18-client-side-storage)
   - 1.9 [Server-Side Request Forgery (SSRF)](#19-server-side-request-forgery-ssrf)
   - 1.10 [Logging & Error Exposure](#110-logging--error-exposure)
2. [React 19 Patterns](#2-react-19-patterns) — **HIGH–LOW**
   - 2.1 [React Compiler](#21-react-compiler)
   - 2.2 [use() Hook](#22-use-hook)
   - 2.3 [Actions & useActionState](#23-actions--useactionstate)
   - 2.4 [Server Components](#24-server-components)
   - 2.5 [Ref as Prop](#25-ref-as-prop)
   - 2.6 [Metadata API](#26-metadata-api)
3. [Code Quality](#3-code-quality) — **MEDIUM–LOW**
   - 3.1 [DRY Principle](#31-dry-principle)
   - 3.2 [Dead Code](#32-dead-code)
   - 3.3 [TypeScript Strictness](#33-typescript-strictness)
   - 3.4 [Complexity](#34-complexity)

---

## 1. Security

**OWASP-mapped rules for React/Next.js applications.**

### 1.1 Cross-Site Scripting (XSS)

**Rule ID:** `sec-xss`
**Impact: CRITICAL**
**OWASP:** A03:2021 — Injection

Flag any use of `dangerouslySetInnerHTML` with unsanitized input, `href="javascript:..."`, `eval()`, `new Function()`, or inline SVG injection from user data.

**Unsafe:**

```tsx
// dangerouslySetInnerHTML with user input
function Comment({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: body }} />
}

// javascript: protocol in href
<a href={userProvidedUrl}>Click</a>

// eval with user data
eval(userInput)
```

**Safe:**

```tsx
import DOMPurify from 'dompurify'

function Comment({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} />
}

// Validate URL protocol
function SafeLink({ url }: { url: string }) {
  const safeUrl = url.startsWith('https://') || url.startsWith('/') ? url : '#'
  return <a href={safeUrl}>Click</a>
}
```

### 1.2 Injection Attacks

**Rule ID:** `sec-injection`
**Impact: CRITICAL**
**OWASP:** A03:2021 — Injection

Flag Server Actions and API routes that pass user input directly to database queries, file system operations, or shell commands without validation. Includes SQL/NoSQL injection, path traversal, and ReDoS.

**Unsafe:**

```typescript
'use server'

export async function searchUsers(query: string) {
  // SQL injection — raw string interpolation
  const users = await db.$queryRaw(`SELECT * FROM users WHERE name = '${query}'`)
  return users
}

// Path traversal
import { readFile } from 'fs/promises'
export async function getFile(filename: string) {
  return readFile(`/uploads/${filename}`)
}
```

**Safe:**

```typescript
'use server'

import { z } from 'zod'

const searchSchema = z.object({ query: z.string().min(1).max(100) })

export async function searchUsers(input: unknown) {
  const { query } = searchSchema.parse(input)
  const users = await db.user.findMany({ where: { name: query } })
  return users
}

// Path traversal prevention
import path from 'path'
export async function getFile(filename: string) {
  const safe = path.basename(filename) // strip directory traversal
  const resolved = path.resolve('/uploads', safe)
  if (!resolved.startsWith('/uploads/')) throw new Error('Invalid path')
  return readFile(resolved)
}
```

### 1.3 Cross-Site Request Forgery (CSRF)

**Rule ID:** `sec-csrf`
**Impact: HIGH**
**OWASP:** A01:2021 — Broken Access Control

Flag API Route handlers (GET/POST/PUT/DELETE) that perform mutations without CSRF protection. Flag `credentials: 'include'` on cross-origin fetches. Flag forms that POST to external URLs.

**Unsafe:**

```typescript
// API route with no CSRF check
export async function POST(req: Request) {
  const data = await req.json()
  await db.user.update({ where: { id: data.id }, data })
  return Response.json({ ok: true })
}

// Cross-origin fetch with credentials
fetch('https://external-api.com/data', { credentials: 'include' })
```

**Safe:**

```typescript
import { headers } from 'next/headers'

export async function POST(req: Request) {
  // Verify origin matches
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

### 1.4 Authentication & Authorization

**Rule ID:** `sec-auth`
**Impact: CRITICAL**
**OWASP:** A01:2021 — Broken Access Control, A07:2021 — Auth Failures

Flag Server Actions without auth checks. Flag API Route handlers without auth checks. Flag BOLA (broken object-level authorization) — actions that accept an `id` param without verifying ownership.

**Unsafe:**

```typescript
'use server'

export async function deletePost(postId: string) {
  // No auth check — anyone can delete any post
  await db.post.delete({ where: { id: postId } })
}
```

**Safe:**

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

### 1.5 Secret Exposure

**Rule ID:** `sec-secrets`
**Impact: CRITICAL**
**OWASP:** A02:2021 — Cryptographic Failures

Flag env vars prefixed `NEXT_PUBLIC_` that contain sensitive values (keys, secrets, tokens, passwords). Flag hardcoded secrets in source. Flag missing `server-only` imports in files that use secrets.

**Unsafe:**

```env
# .env — exposed to browser
NEXT_PUBLIC_DATABASE_URL=postgres://user:pass@host/db
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
```

```typescript
// Hardcoded secret
const API_KEY = 'sk-1234567890abcdef'

// Server file without server-only guard
import { db } from './db'
export function getUsers() { return db.user.findMany() }
```

**Safe:**

```env
# .env — server-only (no NEXT_PUBLIC_ prefix)
DATABASE_URL=postgres://user:pass@host/db
STRIPE_SECRET_KEY=sk_live_...
# Only public, non-sensitive values
NEXT_PUBLIC_APP_URL=https://myapp.com
```

```typescript
import 'server-only'
import { db } from './db'
export function getUsers() { return db.user.findMany() }
```

### 1.6 Vulnerable Dependencies

**Rule ID:** `sec-deps`
**Impact: MEDIUM**
**OWASP:** A06:2021 — Vulnerable Components

Flag known vulnerable packages. Recommend `pnpm audit` in CI. Flag outdated major versions of security-critical packages (next, react, auth libraries).

**Indicators:**

- No `pnpm audit` or equivalent in CI pipeline
- Lock file contains packages with known CVEs
- Major version behind on `next`, `react`, auth libraries

**Recommendation:**

```yaml
# In CI pipeline
- name: Audit dependencies
  run: pnpm audit --audit-level=high
```

### 1.7 Security Headers

**Rule ID:** `sec-headers`
**Impact: HIGH**
**OWASP:** A05:2021 — Security Misconfiguration

Flag missing Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, and Referrer-Policy in `next.config`. Flag `unsafe-inline` or `unsafe-eval` in CSP.

**Unsafe:**

```javascript
// next.config.js — no security headers
const nextConfig = {}
export default nextConfig
```

**Safe:**

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
          }
        ]
      }
    ]
  }
}
export default nextConfig
```

### 1.8 Client-Side Storage

**Rule ID:** `sec-storage`
**Impact: HIGH**
**OWASP:** A02:2021 — Cryptographic Failures

Flag sensitive data (tokens, passwords, PII) in `localStorage` or `sessionStorage`. Flag missing `try-catch` around storage access. Flag `JSON.parse` on storage values without validation.

**Unsafe:**

```typescript
// Storing auth token in localStorage
localStorage.setItem('authToken', token)
localStorage.setItem('user', JSON.stringify({ email, ssn }))

// No error handling
const data = JSON.parse(localStorage.getItem('settings')!)
```

**Safe:**

```typescript
// Use httpOnly cookies for auth tokens (server-side)
// Only store non-sensitive preferences in localStorage

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

### 1.9 Server-Side Request Forgery (SSRF)

**Rule ID:** `sec-ssrf`
**Impact: HIGH**
**OWASP:** A10:2021 — SSRF

Flag server-side `fetch()` or HTTP calls where the URL is constructed from user input. Flag unvalidated redirect URLs.

**Unsafe:**

```typescript
// Server Action with user-controlled URL
'use server'
export async function fetchExternalData(url: string) {
  const res = await fetch(url) // SSRF — user controls the URL
  return res.json()
}

// Unvalidated redirect
export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect')
  return Response.redirect(redirect!) // open redirect
}
```

**Safe:**

```typescript
'use server'

const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com']

export async function fetchExternalData(url: string) {
  const parsed = new URL(url)
  if (!ALLOWED_HOSTS.includes(parsed.host)) {
    throw new Error('Host not allowed')
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('HTTPS required')
  }
  const res = await fetch(parsed.toString())
  return res.json()
}

// Validated redirect
export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect') ?? '/'
  // Only allow relative paths
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    return Response.redirect(new URL(redirect, url.origin))
  }
  return Response.redirect(new URL('/', url.origin))
}
```

### 1.10 Logging & Error Exposure

**Rule ID:** `sec-logging`
**Impact: MEDIUM**
**OWASP:** A09:2021 — Security Logging Failures

Flag stack traces returned to client in API responses. Flag sensitive data (tokens, passwords) in `console.log`. Flag error boundaries that expose internal details.

**Unsafe:**

```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('Request data:', data) // may log passwords/tokens
    await processData(data)
    return Response.json({ ok: true })
  } catch (error) {
    // Stack trace exposed to client
    return Response.json({ error: (error as Error).stack }, { status: 500 })
  }
}
```

**Safe:**

```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('Processing request for user:', data.userId) // only IDs
    await processData(data)
    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/process failed:', error) // log server-side
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 2. React 19 Patterns

**Modernization rules for React 19 features.**

### 2.1 React Compiler

**Rule ID:** `react19-compiler`
**Impact: MEDIUM**

If the React Compiler is enabled (`babel-plugin-react-compiler` in config), flag manual `useMemo`, `useCallback`, and `React.memo` calls — the compiler handles these automatically.

If the compiler is **not** enabled (current project state), emit a single low-priority note suggesting it rather than flagging individual memo calls.

**With compiler enabled — unnecessary manual memo:**

```tsx
// Unsafe — redundant with compiler
const MemoizedCard = React.memo(function Card({ title }: { title: string }) {
  const formatted = useMemo(() => title.toUpperCase(), [title])
  return <div>{formatted}</div>
})
```

```tsx
// Safe — let compiler handle it
function Card({ title }: { title: string }) {
  const formatted = title.toUpperCase()
  return <div>{formatted}</div>
}
```

**Without compiler — note only:**

> Consider enabling React Compiler (`babel-plugin-react-compiler`) to
> auto-optimize memoization. See https://react.dev/learn/react-compiler

### 2.2 use() Hook

**Rule ID:** `react19-use`
**Impact: MEDIUM**

Flag `useContext(SomeContext)` — prefer `use(SomeContext)` in React 19. Flag manual promise handling in components where `use(promise)` applies.

**Legacy:**

```tsx
import { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

function Header() {
  const theme = useContext(ThemeContext)
  return <header className={theme}>...</header>
}
```

**React 19:**

```tsx
import { use } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

function Header() {
  const theme = use(ThemeContext)
  return <header className={theme}>...</header>
}
```

**Promise usage:**

```tsx
// Instead of useEffect + useState for data fetching
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // suspends until resolved
  return <div>{user.name}</div>
}
```

### 2.3 Actions & useActionState

**Rule ID:** `react19-actions`
**Impact: HIGH**

Flag `useFormState` — replaced by `useActionState` in React 19. Flag form submissions that could use the `action` prop pattern. Flag manual optimistic UI that could use `useOptimistic`.

**Legacy:**

```tsx
import { useFormState } from 'react-dom'

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)
  return <form action={formAction}>...</form>
}
```

**React 19:**

```tsx
import { useActionState, useOptimistic } from 'react'

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  return (
    <form action={formAction}>
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
```

**Optimistic UI:**

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  async function addTodo(formData: FormData) {
    const todo = { id: crypto.randomUUID(), text: formData.get('text') as string }
    addOptimistic(todo)
    await createTodo(todo)
  }

  return (
    <form action={addTodo}>
      <input name="text" />
      <button type="submit">Add</button>
      <ul>{optimisticTodos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
    </form>
  )
}
```

### 2.4 Server Components

**Rule ID:** `react19-rsc`
**Impact: HIGH**

Flag `"use client"` on components that don't use hooks, event handlers, browser APIs, or class components. Flag large client component trees that could be split. Flag non-serializable props passed from server to client components.

**Unnecessary "use client":**

```tsx
'use client' // Unnecessary — no hooks, events, or browser APIs

export function StaticCard({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
```

**Correct — remove directive or split:**

```tsx
// No "use client" needed — this is a Server Component
export function StaticCard({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}

// If only part needs interactivity, split:
// ServerWrapper.tsx (Server Component)
export function PostPage({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <LikeButton postId={post.id} /> {/* Only this is "use client" */}
    </article>
  )
}
```

### 2.5 Ref as Prop

**Rule ID:** `react19-ref`
**Impact: LOW**

Flag `forwardRef` usage — in React 19, `ref` is a regular prop. Components can accept `ref` directly without the `forwardRef` wrapper.

**Legacy:**

```tsx
import { forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />
})
Input.displayName = 'Input'
```

**React 19:**

```tsx
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

### 2.6 Metadata API

**Rule ID:** `react19-metadata`
**Impact: LOW**

Flag `document.title` assignments in `useEffect`. Flag manual `<Head>` component usage. Prefer the Next.js `metadata` export or React 19's native `<title>` JSX support.

**Legacy:**

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

**React 19 / Next.js:**

```tsx
// Option 1: Next.js metadata export (Server Component)
export const metadata = { title: 'Settings | My App' }
export default function SettingsPage() { return <div>...</div> }

// Option 2: React 19 JSX (works in "use client" too)
function SettingsPage() {
  return (
    <>
      <title>Settings | My App</title>
      <div>...</div>
    </>
  )
}
```

---

## 3. Code Quality

### 3.1 DRY Principle

**Rule ID:** `quality-dry`
**Impact: MEDIUM**

Flag duplicated JSX blocks (3+ near-identical blocks). Flag duplicated logic across components (extract to hook). Flag duplicated CSS patterns (extract to shared class or variable).

**Indicators:**

- Three or more components with near-identical JSX structure
- Same state + effect pattern repeated in multiple components
- Identical CSS blocks across module files

**Recommendation:** Extract to shared component, custom hook, or CSS variable/utility class.

### 3.2 Dead Code

**Rule ID:** `quality-dead`
**Impact: LOW**

Flag unused exports (exported but never imported elsewhere). Flag commented-out code blocks (>3 lines). Flag unreachable code after return/throw. Flag unused CSS classes in module files.

**Indicators:**

```tsx
// Commented-out code — delete it, git has history
// export function oldHandler() {
//   const data = await fetch(...)
//   return data
// }

export function unused() { /* never imported */ }

function example() {
  return 'done'
  console.log('unreachable') // dead code
}
```

### 3.3 TypeScript Strictness

**Rule ID:** `quality-ts`
**Impact: MEDIUM**

Flag `any` types. Flag type assertions (`as Type`) that bypass checking. Flag non-null assertions (`!`). Flag `@ts-ignore` / `@ts-expect-error` without explanation.

**Unsafe:**

```typescript
function process(data: any) { // any type
  const result = data as Result // unsafe assertion
  const name = result.user!.name // non-null assertion
  // @ts-ignore
  return magicFunction(name)
}
```

**Safe:**

```typescript
function process(data: unknown) {
  const result = resultSchema.parse(data)
  const name = result.user?.name ?? 'Unknown'
  return formatName(name)
}
```

### 3.4 Complexity

**Rule ID:** `quality-complexity`
**Impact: MEDIUM**

Flag components over 200 lines. Flag functions with nesting depth > 4. Flag components with > 5 `useState` calls (consider useReducer). Flag ternary chains > 2 levels deep.

**Indicators:**

```tsx
// Too many useState — use useReducer
function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  // ...
}

// Nested ternary chain
const label = isAdmin ? 'Admin' : isMod ? 'Moderator' : isUser ? 'User' : 'Guest'
```

**Better:**

```tsx
function Form() {
  const [state, dispatch] = useReducer(formReducer, initialState)
  // ...
}

// Map or object lookup instead of ternary chain
const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin', mod: 'Moderator', user: 'User', guest: 'Guest'
}
const label = ROLE_LABELS[role]
```
