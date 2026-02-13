# Soup's Kitchen

Multi-app platform hosting small tools and portfolio.

## Development

```bash
pnpm install
pnpm dev
```

## Scripts

| Command             | Description          |
| ------------------- | -------------------- |
| `pnpm dev`          | Start dev server     |
| `pnpm build`        | Production build     |
| `pnpm lint`         | ESLint fix           |
| `pnpm lint:check`   | ESLint check         |
| `pnpm format`       | Prettier fix         |
| `pnpm format:check` | Prettier check       |
| `pnpm test:e2e`     | Run Playwright tests |

## TODO

- [ ] Build agent for writing and improving e2e test
- [ ] Load data from Supabase
- [ ] Add headers to the dropdown (Apps > Habits, Work > CV, Work > Experience)

## Review

- [ ] Look into react hooks, context and global stores. See if this is done correctly for theme/title switching
