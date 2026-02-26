# Soup's Kitchen

Multi-app platform hosting small tools and portfolio.

## Development

```bash
pnpm install
pnpm dev
```

### Local Supabase

Requires Docker Desktop. Ports are offset from Supabase defaults (API: 54221, DB: 54222,
Studio: 54223) to allow running alongside other local Supabase projects.

```bash
pnpm supabase:start   # boot local instance
pnpm supabase:reset   # wipe + rerun migrations & seed
```

Seed users: `admin@local.test`, `manager@local.test`, `viewer@local.test` (pw: `password123`).

## Scripts

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `pnpm dev`            | Dev server (local Supabase)                    |
| `pnpm dev:remote`     | Dev server (remote Supabase via `.env.remote`) |
| `pnpm build`          | Production build                               |
| `pnpm lint`           | ESLint fix                                     |
| `pnpm lint:check`     | ESLint check                                   |
| `pnpm format`         | Prettier fix                                   |
| `pnpm format:check`   | Prettier check                                 |
| `pnpm test`           | Run unit tests                                 |
| `pnpm test:e2e`       | Run Playwright tests (auto-starts Supabase)    |
| `pnpm test:e2e:ui`    | Playwright UI mode                             |
| `pnpm supabase:start` | Start local Supabase                           |
| `pnpm supabase:stop`  | Stop local Supabase                            |
| `pnpm supabase:reset` | Reset DB + rerun migrations & seed             |
| `pnpm supabase:types` | Regenerate `database.types.ts`                 |

## TODO

- [ ] Add `redirectTo` param to all protected page redirects (currently only `/habits/create`)
- [ ] Some apps will not require a theme / should be able to introduce their own theme and overwrite the defaults so there is more of a standalone app feel.
- [ ] Improve footer: copyright, github link, maybe linkedin
- [ ] Set-up proper error handling

### Apps

### Habits

- [ ] Create labels for the action types
- [ ] Make habits editable from details page
- [ ] Create filter and sorting for overview page
- [ ] Create a paginated feed for the habit with a scroll-to action when clicked on the chart
- [ ] Create an overview chart option where the different action types can be combined
- [ ] Create other types of insight graphs for habits

### Bus & Train Schedule

### Question Game

### Live-Poll

Use websockets, gRCP.

### Speech-to-Text Notes Interface

Use Whisper or AssemblyAI

### More App Ideas

- [ ] Booking calendar for Cambrils
- [ ] Boule Score
- [ ] QR Code generator
- [ ] Wheel of fortune

## About

### ANCHOR Me

- [ ] Display basic CV information
- [ ] Require magic link or account to see CV details

### Experience

- [ ] Finish the blog parser/renderer in Go
- [ ] Save post to DB or rsync to serve as static files from VPS or Supabase object storage
- [ ] Load posts as blog. Add filter option for tags. Also link tags to CV
- [ ] Include ELK stack to include search

### CI

- [ ] Add CI user that can create a habit entry when working on the app

### AI

- [ ] Build agent for writing and improving e2e test

### API

- [ ] Add authenticated API routes that use Supabase issued JWTs
- [ ] Create Strave CRON for cycling activities
