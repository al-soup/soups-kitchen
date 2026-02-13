---
title: Ref as Prop
impact: LOW
impactDescription: removes forwardRef boilerplate
tags: react19, ref, forwardRef, props
---

## Ref as Prop

**Impact: LOW (removes forwardRef boilerplate)**

In React 19, `ref` is a regular prop. Components can accept `ref` directly without the `forwardRef` wrapper.

**Legacy (forwardRef):**

```tsx
import { forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />
})
Input.displayName = 'Input'
```

**React 19 (ref as prop):**

```tsx
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

**What to flag:**

- `forwardRef` usage — can be simplified to regular prop
- `displayName` assignments that only exist because of `forwardRef`
