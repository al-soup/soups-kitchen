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
| `pnpm test`         | Run unit tests       |
| `pnpm test:e2e`     | Run Playwright tests |
| `pnpm test:e2e:ui`  | Playwright UI mode   |

## TODO

- [ ] Add e2e & unit tests
- [ ] Add CI user that can create a habit entry when working on the app
- [ ] Set-up local supabase. Import the prod schemas and functions.
- [ ] Build agent for writing and improving e2e test
- [ ] Add `redirectTo` param to all protected page redirects (currently only `/habits/create`)
- [ ] Some apps will not require a theme / should be able to introduce their own theme and overwrite the defaults so there is more of a standalone app feel.

### Minor

- [ ] Extract icons to lib

## Review

- [ ] Look into react hooks, context and global stores. See if this is done correctly for theme/title switching
