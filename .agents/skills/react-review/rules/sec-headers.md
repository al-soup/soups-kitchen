---
title: Security Headers
impact: HIGH
impactDescription: missing browser security protections
tags: security, headers, csp, hsts, x-frame-options, next-config
---

## Security Headers

**Impact: HIGH (missing browser security protections)**
**OWASP: A05:2021 — Security Misconfiguration**

Flag missing Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, and Referrer-Policy in `next.config`. Flag `unsafe-inline` or `unsafe-eval` in CSP.

**Unsafe (no security headers):**

```javascript
const nextConfig = {}
export default nextConfig
```

**Safe:**

```javascript
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

**What to flag:**

- `next.config.*` without `headers()` function
- Missing: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy
- CSP containing `unsafe-eval`
- `X-Frame-Options` set to `ALLOWALL` or missing entirely
