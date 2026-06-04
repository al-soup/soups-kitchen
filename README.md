# Soup's Kitchen

Multi-app platform hosting small tools and my portfolio.

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
| `pnpm generate-icons` | Regenerate per-app PWA icons                   |

## PWA

Habits and Fahrplan are installable as standalone PWAs (Android "Add to Home Screen", iOS home screen icon). Each app has its own web app manifest and icons. Run `pnpm generate-icons` to regenerate icons from `public/soup.svg`.

## TODO

- [ ] Solve GH issues automatically via agents

### Apps

#### Habits

- [ ] Create filter and sorting for overview page
- [ ] Create an overview chart option where the different action types can be combined
- [ ] Create other types of insight graphs for habits

#### Knowledge Base

- [ ] Star / Favorite questions
- [ ] Create a learning or revision mode
- [ ] Instead (or in addition to) the Speech-Notes app, I could create an API to create new knowledge entries via Speech/LLM
- [ ] Create an Interview-me feature

#### Question Game

tbd

#### Live-Poll

Use websockets, gRCP.

#### Speech-to-Text Notes Interface

Use Wispr or AssemblyAI to create unstructured note entries to Obsidian. Not yet sure about the exact sync process.

### About

#### Elevator Pitch

- [ ] Create a animated elevator pitch that shows in 1 minute why I'm a good hire. Use a nice background e.g. from Great Budapest Hotel opening scene, and present yourself in the elevator.

**Idea:**

- Background that adapts to the time of day. Mountain scene.
- Grand Budapest Hotel style, you zoom into the Elevator once you click start
- The elevator can move up or down. Create it as a scrolly-tool
- In the elevator I show my pitch on the wall of the elevator
- Out of the window you see only small movement plus you see an oldschool pointer of the current floor

**Pitch:**

- USP
- Worked in different industries with project examples
- soft skills
- Can teach myself anything. Eager learner and motivated to build, improve, solve and optimize
- Pays attention to detail, is reliable
- Add a testimonial from Lino & Danijel

#### Me

- [ ] Extend the job summaries. What have you done exactly and how has it benefitted the company?
- [ ] Add a description about my work position (New Elements, EdTech, etc.)
- [ ] Link tags to blog entries

#### Experience

- [ ] Finish the blog parser/renderer in Go
- [ ] Save post to DB or rsync to serve as static files from VPS or Supabase object storage
- [ ] Load posts as blog. Add filter option for tags. Also link tags to CV
- [ ] Include ELK stack to include search

### CI

- [ ] Setup a logging lib (LogTape) and integrate it with a centralized logging platform (Grafana Cloud)
- [ ] Add CI user that can create a habit entry when working on the app

### API

- [ ] Add authenticated API routes that use Supabase issued JWTs
- [ ] Improve SMTP setup to avoid Spam emails.
