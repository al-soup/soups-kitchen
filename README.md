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
- [ ] Let Claude go over the README and make some improvements
- [ ] Create an "UNFINISHED" label

### Apps

#### Habits

- [ ] Create filter and sorting for overview page
- [ ] Create an overview chart option where the different action types can be combined
- [ ] Create other types of insight graphs for habits
- [ ] Switching tabs causes a reload. Maybe we should cache the loaded items between tab switches

#### Knowledge Base

- [ ] Sort by date
- [ ] Create a learning / revision mode. Showing questions one-by-one and via an inverview-me feature where you get quizzed for answers. Build this upon the AI API from _Fragespiel_. Part of this should be a review mode where you can add a selection of questions like a learning path of what you want to study.
- [ ] Star / Favorite questions
- [ ] The search needs more feedback to see what has changed. I might have to limit it to only look at question+summary and highlight what was searched for.

#### Question Game

TODO: go over this and the plan created with Claude. Start the implementation.

- Questions should show if they are generated. Admins should have the option to promote a question so it is saved in the DB. I might have to run the generation locally if API access turns our to be difficult/expensive
- Animations and glitter. It would be nice to have a design that really stands out.
- Filter by category
- Redesign AI label - put it on the bottom left
- Add a mode where you can choose how many AI cards to mix in
- Save which userID created a new question

#### Live-Poll

Use websockets connection for instant feedback to clients.

#### Speech-to-Text Notes Interface

Use Wispr or AssemblyAI to create unstructured note entries to Obsidian. tbd: sync process.

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
