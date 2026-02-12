---
title: Vulnerable Dependencies
impact: MEDIUM
impactDescription: known vulnerabilities in third-party packages
tags: security, dependencies, audit, cve, supply-chain
---

## Vulnerable Dependencies

**Impact: MEDIUM (known vulnerabilities in third-party packages)**
**OWASP: A06:2021 — Vulnerable and Outdated Components**

Flag known vulnerable packages. Recommend `pnpm audit` in CI. Flag outdated major versions of security-critical packages.

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

**What to flag:**

- Missing dependency audit step in CI config
- `package.json` with outdated major versions of: `next`, `react`, `next-auth`, `@auth/*`
- Known vulnerable package patterns (check against recent advisories)
