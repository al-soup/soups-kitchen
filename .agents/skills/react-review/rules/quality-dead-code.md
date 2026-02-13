---
title: Dead Code
impact: LOW
impactDescription: reduces codebase noise and bundle size
tags: quality, dead-code, unused, exports, comments
---

## Dead Code

**Impact: LOW (reduces codebase noise and bundle size)**

Flag unused exports, commented-out code blocks, unreachable code, and unused CSS classes.

**Indicators:**

```tsx
// Commented-out code (>3 lines) — delete it, git has history
// export function oldHandler() {
//   const data = await fetch(...)
//   return data
// }

// Unused export — exported but never imported
export function formatLegacyDate() { ... }

// Unreachable code
function example() {
  return 'done'
  console.log('never reached')
}
```

**Unused CSS:**

```css
/* .module.css — class never referenced in component */
.oldLayout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

**What to flag:**

- Exported functions/components never imported elsewhere
- Commented-out code blocks (>3 lines)
- Code after `return` or `throw` statements
- CSS classes in module files not referenced by their component
- Unused imports (though linters usually catch these)
