---
title: Actions & useActionState
impact: HIGH
impactDescription: replaces deprecated useFormState, adds built-in pending state
tags: react19, actions, useActionState, useFormState, useOptimistic, forms
---

## Actions & useActionState

**Impact: HIGH (replaces deprecated useFormState, adds built-in pending state)**

Flag `useFormState` — replaced by `useActionState` in React 19. Flag form submissions that could use the `action` prop pattern. Flag manual optimistic UI that could use `useOptimistic`.

**Legacy (useFormState):**

```tsx
import { useFormState } from 'react-dom'

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState)
  return <form action={formAction}>...</form>
}
```

**React 19 (useActionState):**

```tsx
import { useActionState } from 'react'

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

**Optimistic UI with useOptimistic:**

```tsx
import { useOptimistic } from 'react'

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

  return <form action={addTodo}>...</form>
}
```

**What to flag:**

- `useFormState` import from `react-dom` — migrate to `useActionState` from `react`
- Manual `isPending` / `isLoading` state for form submissions — `useActionState` provides it
- Manual optimistic state updates — consider `useOptimistic`
- `onSubmit` with `preventDefault` where `action` prop would suffice
