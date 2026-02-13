---
title: TypeScript Strictness
impact: MEDIUM
impactDescription: prevents runtime type errors and improves maintainability
tags: quality, typescript, any, type-assertions, strict
---

## TypeScript Strictness

**Impact: MEDIUM (prevents runtime type errors and improves maintainability)**

Flag `any` types, unsafe type assertions, non-null assertions, and suppression comments.

**Unsafe:**

```typescript
function process(data: any) {
  const result = data as Result    // unsafe assertion
  const name = result.user!.name   // non-null assertion
  // @ts-ignore
  return magicFunction(name)
}
```

**Safe:**

```typescript
function process(data: unknown) {
  const result = resultSchema.parse(data)  // runtime validation
  const name = result.user?.name ?? 'Unknown'
  return formatName(name)
}
```

**What to flag:**

- `: any` type annotations — prefer `unknown` with runtime validation
- `as Type` assertions that bypass type checking — prefer type guards or schema validation
- `!` non-null assertions — prefer optional chaining (`?.`) with fallback
- `@ts-ignore` without explanation — prefer `@ts-expect-error` with comment
- `@ts-expect-error` without explanatory comment
- Function parameters without type annotations
