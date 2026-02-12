---
title: Cross-Site Scripting (XSS)
impact: CRITICAL
impactDescription: arbitrary code execution in user browsers
tags: security, xss, dangerouslySetInnerHTML, eval, injection
---

## Cross-Site Scripting (XSS)

**Impact: CRITICAL (arbitrary code execution in user browsers)**
**OWASP: A03:2021 — Injection**

Flag any use of `dangerouslySetInnerHTML` with unsanitized input, `href="javascript:..."` patterns, `eval()`, `new Function()`, or inline SVG injection from user data.

**Unsafe (dangerouslySetInnerHTML with user input):**

```tsx
function Comment({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: body }} />
}
```

**Unsafe (javascript: protocol in href):**

```tsx
<a href={userProvidedUrl}>Click</a>
// If userProvidedUrl = "javascript:alert(1)" — XSS
```

**Unsafe (eval/new Function):**

```tsx
eval(userInput)
const fn = new Function('return ' + userInput)
```

**Safe (sanitized HTML):**

```tsx
import DOMPurify from 'dompurify'

function Comment({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} />
}
```

**Safe (URL protocol validation):**

```tsx
function SafeLink({ url }: { url: string }) {
  const safeUrl = url.startsWith('https://') || url.startsWith('/') ? url : '#'
  return <a href={safeUrl}>Click</a>
}
```

**What to flag:**

- `dangerouslySetInnerHTML` where `__html` value comes from props, state, or API data without sanitization
- `href` attributes with dynamic values not validated against `javascript:` protocol
- `eval()`, `new Function()`, `setTimeout(string)`, `setInterval(string)`
- SVG `<image>` or `<use>` with user-controlled `href`/`xlink:href`
