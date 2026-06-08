-- Seed users in auth.users (local dev only)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token,
  recovery_token, raw_app_meta_data, raw_user_meta_data
)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@local.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}'),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@local.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}'),
  ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'viewer@local.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{}');

-- Seed identities (required for email login)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'admin@local.test'), 'email', now(), now(), now()),
  ('b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'manager@local.test'), 'email', now(), now(), now()),
  ('c3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', jsonb_build_object('sub', 'c3333333-3333-3333-3333-333333333333', 'email', 'viewer@local.test'), 'email', now(), now(), now());

-- User roles (trigger creates 'viewer' for habits, we override admin/manager + add _global)
DELETE FROM public.user_roles;

INSERT INTO public.user_roles (user_id, table_name, role) VALUES
  ('a1111111-1111-1111-1111-111111111111', '_global',   'admin'),
  ('a1111111-1111-1111-1111-111111111111', 'habit',     'admin'),
  ('b2222222-2222-2222-2222-222222222222', 'habit',     'manager'),
  ('b2222222-2222-2222-2222-222222222222', 'knowledge', 'manager'),
  ('b2222222-2222-2222-2222-222222222222', 'resources', 'manager'),
  ('c3333333-3333-3333-3333-333333333333', 'habit',     'viewer');

-- Actions: type 1-3 (1=sport, 2=bad habits, 3=learning)
INSERT INTO public.action (name, description, type, level, created_at)
VALUES
  ('Daily Stretches', NULL, 1, 1, NOW()),
  ('50+ Push-ups', NULL, 1, 1, NOW()),
  ('100 Squats', NULL, 1, 1, NOW()),
  ('Yoga Session', NULL, 1, 1, NOW()),
  ('30min Workout', NULL, 1, 2, NOW()),
  ('Handstand Practice', NULL, 1, 2, NOW()),
  ('20min Jump Rope', NULL, 1, 2, NOW()),
  ('Sporty Activity', 'Snowboarding, Hiking, PingPong, etc.', 1, 3, NOW()),
  ('Cycling', NULL, 1, 4, NOW()),
  ('Laboratorium Workout', NULL, 1, 4, NOW()),
  ('Extensive Sport Activity', 'E.g Cycling +80km, BJJ Sparring', 1, 5, NOW()),
  ('Sweets', NULL, 2, 1, NOW()),
  ('Smoking', NULL, 2, 2, NOW()),
  ('Party', NULL, 2, 4, NOW()),
  ('Learn: Go', 'For about an hour write on your interpreter, write on your HTTP sever or build something.', 3, 2, NOW()),
  ('Yoga Session', NULL, 1, 1, NOW()),
  ('20min Jump Rope', NULL, 1, 2, NOW()),
  ('Programming Gymnastics', 'Solve 1-2 LeetCode problems, watch a D&A lecture', 3, 1, NOW()),
  ('Certification Prep', NULL, 3, 2, NOW()),
  ('Continue Your App', NULL, 3, 3, NOW())
ON CONFLICT DO NOTHING;

SELECT setval('public.action_id_seq', 20);

-- ~50 habit entries spread over last 60 days
INSERT INTO public.habit (action_id, completed_at, note) VALUES
  -- Week 1 (recent)
  (1, now() - interval '1 day',   'morning stretch routine
felt tight in the hips
need to add hip flexor work'),
  (2, now() - interval '1 day',   '60 push-ups'),
  (18, now() - interval '1 day',  'solved 2 medium problems'),
  (5, now() - interval '2 days',  'upper body focus'),
  (12, now() - interval '2 days', 'chocolate after lunch'),
  (15, now() - interval '2 days', 'built lexer for Go interpreter'),
  (9, now() - interval '3 days',  '25km ride'),
  (4, now() - interval '3 days',  '30min session'),
  (20, now() - interval '4 days', 'added habit score graph'),
  (7, now() - interval '4 days',  null),
  (3, now() - interval '5 days',  'bodyweight squats'),
  (13, now() - interval '5 days', 'one cigarette at party'),
  (8, now() - interval '6 days',  'went hiking'),
  (19, now() - interval '6 days', 'studied for AWS cert'),
  -- Week 2
  (1, now() - interval '8 days',  null),
  (10, now() - interval '8 days', 'leg day'),
  (15, now() - interval '9 days', 'HTTP server parsing'),
  (6, now() - interval '9 days',  'held 10s freestanding'),
  (2, now() - interval '10 days', '55 push-ups'),
  (12, now() - interval '10 days', 'ice cream'),
  (9, now() - interval '11 days', '40km ride'),
  (18, now() - interval '11 days', 'easy LC problem'),
  (14, now() - interval '12 days', 'friend birthday'),
  (4, now() - interval '13 days', null),
  (20, now() - interval '13 days', 'refactored auth context'),
  -- Week 3
  (11, now() - interval '15 days', 'BJJ open mat'),
  (1, now() - interval '15 days', null),
  (7, now() - interval '16 days', '20min session'),
  (19, now() - interval '16 days', 'practice exam'),
  (5, now() - interval '17 days', 'full body'),
  (3, now() - interval '18 days', null),
  (15, now() - interval '18 days', 'wrote TCP server'),
  (12, now() - interval '19 days', 'cake at work'),
  (8, now() - interval '20 days', 'ping pong tournament'),
  -- Week 4-5
  (10, now() - interval '22 days', 'push pull legs'),
  (2, now() - interval '23 days', '50 push-ups'),
  (9, now() - interval '24 days', '30km easy ride'),
  (6, now() - interval '25 days', 'wall handstand 30s'),
  (20, now() - interval '26 days', 'setup local supabase'),
  (13, now() - interval '27 days', null),
  (1, now() - interval '28 days', 'full mobility routine'),
  (18, now() - interval '29 days', 'hard LC problem'),
  (4, now() - interval '30 days', 'morning yoga'),
  (11, now() - interval '32 days', '100km cycling day'),
  (5, now() - interval '34 days', 'chest and back'),
  -- Older entries
  (7, now() - interval '38 days', null),
  (15, now() - interval '40 days', 'started Go interpreter book'),
  (3, now() - interval '42 days', '120 squats'),
  (14, now() - interval '45 days', 'NYE party'),
  (19, now() - interval '50 days', 'started cert prep'),
  (8, now() - interval '55 days', 'snowboarding day trip');

-- Knowledge base tags
INSERT INTO public.tags (name, type) VALUES
  ('System Design',       'topic'),
  ('Databases',           'topic'),
  ('Web Development',     'topic'),
  ('DevOps',              'topic'),
  ('Algorithms',          'topic'),
  ('DB Indexing',         'concept'),
  ('Caching',             'concept'),
  ('Concurrency',         'concept'),
  ('REST',                'concept'),
  ('Authentication',      'concept')
ON CONFLICT (name) DO NOTHING;

-- Knowledge entries (no resources). Spaced via created_at so the overview is
-- not all clustered at one timestamp.
WITH inserted AS (
  INSERT INTO public.knowledge (question, summary, detail, created_at) VALUES
    (
      'Why use a B-tree index?',
      '**B-trees** keep keys sorted on disk in shallow, *balanced* pages — point and range lookups stay `O(log n)` even for [billions of rows](https://en.wikipedia.org/wiki/B-tree).',
      $md$A B-tree node holds many keys (hundreds), so the tree is **wide and shallow**. A few page reads is enough to find any key.

- **Point lookups**: `WHERE id = ?` — walk root → leaf.
- **Range scans**: `WHERE created_at BETWEEN …` — find start key, then scan leaves sequentially (leaves are linked).
- **Ordered iteration**: `ORDER BY indexed_col` is free.

Beats hash indexes for ranges and ordering; beats a heap scan for selective lookups.$md$,
      now() - interval '5 days'
    ),
    (
      'Optimistic vs pessimistic concurrency — when each?',
      'Optimistic: assume no conflict, validate on commit. Pessimistic: lock up front. Pick by conflict rate.',
      $md$**Optimistic** (version column / `WHERE updated_at = ?`):
- Cheap when conflicts are rare.
- Loser retries.
- Great for web apps with mostly-read traffic.

**Pessimistic** (`SELECT … FOR UPDATE`):
- Holds a row lock until commit.
- Use when conflicts are common or retries are expensive (long workflows, side effects).
- Watch for deadlocks — acquire locks in a consistent order.

```sql
-- Pessimistic: lock the row, then update
BEGIN;
SELECT balance FROM account WHERE id = 42 FOR UPDATE;
UPDATE account SET balance = balance - 100 WHERE id = 42;
COMMIT;
```$md$,
      now() - interval '4 days'
    ),
    (
      'When is cache-aside the wrong pattern?',
      'Cache-aside falls apart under thundering-herd reads on a cold key and under write-heavy workloads where the cache is mostly stale.',
      $md$Cache-aside = app reads cache, on miss reads DB and writes back.

Bad fits:

- **Hot key, cold cache** — every request misses at once, all hit the DB. Mitigate with request coalescing or a probabilistic early-refresh.
- **Write-heavy** — invalidation races mean stale reads are common. Consider write-through or just skipping the cache.
- **Strong consistency required** — there's always a window where cache ≠ DB.$md$,
      now() - interval '3 days'
    ),
    (
      '401 vs 403 — which for missing auth?',
      '401 = "I don''t know who you are". 403 = "I know who you are and you can''t do this".',
      $md$- **401 Unauthorized** → no credentials, or credentials are invalid/expired. Send `WWW-Authenticate` to tell the client how to authenticate.
- **403 Forbidden** → authenticated but not permitted. No challenge — re-auth won't help.

Common mistake: returning 403 when no token was provided. That misleads clients (and middlewares) into thinking the user is logged in but lacks permission.$md$,
      now() - interval '2 days'
    ),
    (
      'Hash-map lookup worst case — why O(n)?',
      'All keys hash to one bucket → lookup degenerates to a linear scan of that bucket.',
      $md$Average is O(1) because keys spread across buckets uniformly.

Worst case happens when:

1. Adversarial input picks keys with colliding hashes (HashDoS).
2. The hash function is weak.
3. The bucket array is too small and was never resized.

Defenses: randomized hash seeds (Python, Java since 8), tree-ified buckets above a threshold (Java's `HashMap` switches to a red-black tree at 8 entries → worst case O(log n)).

```ts
// Worst case: every key hashes to the same bucket
const buckets: string[][] = Array.from({ length: 8 }, () => []);
for (const key of adversarialKeys) {
  const i = weakHash(key) % buckets.length; // always returns 0
  buckets[i].push(key); // one bucket grows → lookup is O(n)
}
```$md$,
      now() - interval '1 day'
    ),
    (
      'What does the CAP theorem actually constrain?',
      'Under a network *partition*, a distributed system must choose between **C**onsistency and **A**vailability. No partition → no choice.',
      $md$CAP is often misread as "pick 2 of 3". The real statement: when a partition happens, you trade C for A or vice versa.

- **CP** (e.g. etcd, ZooKeeper): refuse writes on the minority side → stale-free but unavailable.
- **AP** (e.g. Dynamo-style stores): accept writes everywhere → available but readers may see stale data until reconciliation.

Healthy networks → both. The interesting question is what happens on the bad day.$md$,
      now() - interval '6 days'
    ),
    (
      'Hash index vs B-tree — when hash wins',
      'Hash indexes give `O(1)` equality lookups but support **no range scans, no ordering, no prefix matching**.',
      $md$Pick a hash index only when:

- You only ever query `WHERE col = ?` (no `<`, `BETWEEN`, `ORDER BY`).
- The column has high cardinality (low collision rate).
- The workload is read-heavy and equality-only.

Postgres' hash index is finally crash-safe (since 10) but still niche — a B-tree is usually fine and far more flexible.$md$,
      now() - interval '7 days'
    ),
    (
      'Why CSRF tokens with SameSite cookies?',
      '`SameSite=Lax` blocks most cross-site requests, but **subdomain attacks** and older browsers leak. Defense in depth.',
      $md$`SameSite=Lax` is good but not airtight:

- **Subdomain takeover**: an attacker controlling `evil.example.com` can issue requests against `app.example.com` and the cookie tags along.
- **Top-level GETs**: `Lax` still sends cookies on top-level navigations — fine for idempotent endpoints, dangerous if a `GET` mutates state.
- **Old browsers / non-browser clients**: don't honor SameSite at all.

CSRF tokens cost very little and close all of these.$md$,
      now() - interval '8 days'
    ),
    (
      'Idempotency keys — what problem do they solve?',
      'They let the client safely **retry** a non-idempotent request without risking duplicate side effects (double charges, double sends).',
      $md$Pattern:

1. Client generates a UUID and sends it as `Idempotency-Key: <uuid>`.
2. Server stores the key + result on first success.
3. On retry with the same key, server returns the stored result without re-executing.

Bake this into payments, email sends, and webhook handlers — anywhere a network blip mid-request would otherwise cause double-execution.

```http
POST /charges HTTP/1.1
Idempotency-Key: 8e1b...
Content-Type: application/json

{"amount": 5000, "currency": "usd"}
```$md$,
      now() - interval '9 days'
    ),
    (
      'Quicksort vs mergesort — when to pick which?',
      'Quicksort: in-place, cache-friendly, average `O(n log n)`. Mergesort: stable, worst-case `O(n log n)`, needs `O(n)` extra memory.',
      $md$- **Quicksort** dominates in-memory sorting of primitives — tight inner loop, locality wins. Risk: bad pivots → `O(n²)`. Mitigations: random pivot, median-of-three, introsort fallback.
- **Mergesort** wins when stability matters (sorting objects by one key while preserving prior order) and for external sorts (data doesn't fit in memory — natural to merge sorted runs).

Most stdlibs (Java, Python) use Timsort — a mergesort variant tuned for partially-sorted input.$md$,
      now() - interval '10 days'
    ),
    (
      'Blue/green vs canary — what is the trade-off?',
      'Blue/green flips 100% of traffic at once. Canary ramps a small slice first. Canary catches bugs cheaper; blue/green rolls back faster.',
      $md$**Blue/green**:
- Two identical environments; flip the load balancer to switch.
- Instant rollback (flip back).
- Doubles infrastructure cost during the cutover.

**Canary**:
- Route 1% → 5% → 25% → 100% over minutes/hours, watching SLOs.
- Catches regressions on a small blast radius.
- Needs good metrics and automated rollback triggers.

Many teams combine: canary inside a green environment, then flip.$md$,
      now() - interval '11 days'
    ),
    (
      'Read-through cache — how is it different from cache-aside?',
      'In **read-through**, the cache itself loads from the source of truth on miss. The app only ever talks to the cache.',
      $md$Cache-aside puts the lookup logic in the app:

```
app -> cache.get(k)
  if miss: app -> db.get(k); app -> cache.set(k, v)
```

Read-through pushes it into the cache layer (or a thin wrapper):

```
app -> cache.get(k)  // cache fetches from db on miss internally
```

Pros: single code path, harder to forget the write-back. Cons: tighter coupling between cache and DB schema; harder to do custom miss logic.$md$,
      now() - interval '12 days'
    ),
    (
      'Why is `SELECT *` discouraged?',
      'It over-fetches, breaks on schema changes, and disables index-only scans by forcing a heap visit.',
      $md$Concrete problems:

- **Bandwidth + memory**: pulls TOASTed blobs and columns you don't need.
- **Schema coupling**: adding a column silently changes query results — risky for code that positions by index or maps to a struct.
- **Index-only scans**: a covering index can't satisfy `SELECT *` because the index doesn't store every column → planner falls back to a heap fetch.
- **`COUNT(*)` is fine** — it's special-cased and means "count rows", not "count every column".$md$,
      now() - interval '13 days'
    ),
    (
      'ETag vs Last-Modified — when to use each',
      '`ETag` is a strong content hash; `Last-Modified` is a 1-second timestamp. Prefer `ETag` for correctness, `Last-Modified` for cheap.',
      $md$Both enable conditional requests (`If-None-Match` / `If-Modified-Since`) → server returns `304 Not Modified` to save bandwidth.

- **ETag**: opaque content fingerprint. Detects any change, even within the same second. Costs CPU to compute (often a hash of the body).
- **Last-Modified**: cheap (mtime on the file or a `updated_at` column). 1-second resolution → can miss rapid edits.

Use both: clients send whichever they have; servers compare both. ETags also gate optimistic concurrency on `PUT`/`DELETE` via `If-Match`.$md$,
      now() - interval '14 days'
    ),
    (
      'Two-phase commit — when is it worth the cost?',
      'Rarely. 2PC blocks if the coordinator dies mid-commit. Most modern systems prefer **sagas** with compensating actions.',
      $md$2PC = prepare phase (everyone votes yes/no) + commit phase (everyone applies). Atomic across participants — but:

- **Blocking**: if the coordinator crashes after `PREPARE` but before `COMMIT`, participants hold locks until it comes back.
- **Latency**: two round trips, slowest participant sets the floor.
- **Availability**: any participant down = whole transaction down.

Worth it for: tight, low-latency clusters with strong consistency needs (distributed SQL, XA transactions). Not worth it for: microservices spanning datacenters. Use a saga + idempotent compensations instead.$md$,
      now() - interval '15 days'
    )
  RETURNING id, question
)
INSERT INTO public.knowledge_tags (knowledge_id, tag_id)
SELECT i.id, t.id
FROM inserted i
JOIN public.tags t ON t.name = ANY(
  CASE i.question
    WHEN 'Why use a B-tree index?'
      THEN ARRAY['Databases', 'DB Indexing']
    WHEN 'Optimistic vs pessimistic concurrency — when each?'
      THEN ARRAY['Databases', 'Concurrency']
    WHEN 'When is cache-aside the wrong pattern?'
      THEN ARRAY['System Design', 'Caching']
    WHEN '401 vs 403 — which for missing auth?'
      THEN ARRAY['Web Development', 'REST', 'Authentication']
    WHEN 'Hash-map lookup worst case — why O(n)?'
      THEN ARRAY['Algorithms']
    WHEN 'What does the CAP theorem actually constrain?'
      THEN ARRAY['System Design', 'Concurrency']
    WHEN 'Hash index vs B-tree — when hash wins'
      THEN ARRAY['Databases', 'DB Indexing']
    WHEN 'Why CSRF tokens with SameSite cookies?'
      THEN ARRAY['Web Development', 'Authentication']
    WHEN 'Idempotency keys — what problem do they solve?'
      THEN ARRAY['Web Development', 'REST']
    WHEN 'Quicksort vs mergesort — when to pick which?'
      THEN ARRAY['Algorithms']
    WHEN 'Blue/green vs canary — what is the trade-off?'
      THEN ARRAY['DevOps']
    WHEN 'Read-through cache — how is it different from cache-aside?'
      THEN ARRAY['System Design', 'Caching']
    WHEN 'Why is `SELECT *` discouraged?'
      THEN ARRAY['Databases']
    WHEN 'ETag vs Last-Modified — when to use each'
      THEN ARRAY['Web Development', 'REST']
    WHEN 'Two-phase commit — when is it worth the cost?'
      THEN ARRAY['Databases', 'Concurrency']
  END
);

-- Fragespiel: philosophical discussion prompts.
-- difficulty: 1=light, 2=medium, 3=deep. Mix of solo + couples, en + de.
INSERT INTO public.questions (text, category, difficulty, is_for_couples, language) VALUES
  -- Light / icebreakers (en)
  ('If you could instantly master any skill, which one and why?', 'Hypothetical', 1, false, 'en'),
  ('What is a small thing that brought you joy this week?', 'Self', 1, false, 'en'),
  ('Which fictional world would you most want to live in?', 'Hypothetical', 1, false, 'en'),
  ('What''s the most unusual food combination you genuinely enjoy?', 'Fun', 1, false, 'en'),
  ('If your day had a soundtrack right now, what song would play?', 'Self', 1, false, 'en'),
  ('What''s a hill you''re willing to die on — but only mildly?', 'Fun', 1, false, 'en'),
  ('What''s the best advice you''ve received that you never followed?', 'Self', 1, false, 'en'),

  -- Medium / values (en)
  ('When was the last time you changed your mind about something important?', 'Values', 2, false, 'en'),
  ('What does success mean to you that has nothing to do with money?', 'Values', 2, false, 'en'),
  ('Which of your beliefs would your 15-year-old self find most surprising?', 'Self', 2, false, 'en'),
  ('Is it better to be respected or to be liked?', 'Ethics', 2, false, 'en'),
  ('What''s a tradition you grew up with that you no longer keep — and why?', 'Self', 2, false, 'en'),
  ('Where do you feel most like yourself?', 'Self', 2, false, 'en'),
  ('Which fear has shaped your life the most?', 'Self', 2, false, 'en'),
  ('If you had to give up either reading or travel forever, which would it be?', 'Hypothetical', 2, false, 'en'),
  ('When does loyalty become a flaw?', 'Ethics', 2, false, 'en'),

  -- Deep / philosophical (en)
  ('Do you believe people fundamentally change, or only their behaviors?', 'Philosophy', 3, false, 'en'),
  ('Is a life well-lived the same as a life well-remembered?', 'Philosophy', 3, false, 'en'),
  ('If you could know the exact date of your death, would you want to?', 'Mortality', 3, false, 'en'),
  ('What do you owe the people who raised you?', 'Ethics', 3, false, 'en'),
  ('Is forgiveness something you give for them, or for yourself?', 'Ethics', 3, false, 'en'),
  ('Would you rather be a great person no one remembers, or a flawed one history never forgets?', 'Philosophy', 3, false, 'en'),
  ('Is suffering necessary for meaning?', 'Philosophy', 3, false, 'en'),
  ('Can you truly know another person — or only your version of them?', 'Philosophy', 3, false, 'en'),
  ('What part of yourself are you still hiding from the world?', 'Self', 3, false, 'en'),
  ('If your memories were wiped tomorrow, would you still be you?', 'Identity', 3, false, 'en'),

  -- Couples (en)
  ('What is something you''ve never told me but always wanted to?', 'Couples', 2, true, 'en'),
  ('When did you first feel safe with me?', 'Couples', 2, true, 'en'),
  ('What''s a habit of mine you''ve grown to love — or quietly tolerate?', 'Couples', 1, true, 'en'),
  ('What does "home" mean to you when I''m not there?', 'Couples', 3, true, 'en'),
  ('How do you want to be loved when you''re at your worst?', 'Couples', 3, true, 'en'),
  ('What''s a version of us five years from now that you''d be excited about?', 'Couples', 2, true, 'en'),
  ('What''s something we''ve never done together that you''d like to try?', 'Couples', 1, true, 'en'),
  ('When was the last time you felt truly seen by me?', 'Couples', 3, true, 'en'),
  ('What''s one thing you wish I''d ask you more often?', 'Couples', 2, true, 'en'),

  -- German prompts
  ('Wann hast du das letzte Mal etwas zum ersten Mal gemacht?', 'Selbst', 1, false, 'de'),
  ('Was würdest du tun, wenn Geld keine Rolle spielen würde?', 'Hypothetisch', 2, false, 'de'),
  ('Welche Lüge erzählst du dir selbst am häufigsten?', 'Selbst', 3, false, 'de'),
  ('Was bedeutet Heimat für dich — ein Ort, ein Gefühl, ein Mensch?', 'Philosophie', 3, false, 'de'),
  ('Worauf bist du heimlich richtig stolz?', 'Selbst', 2, false, 'de'),
  ('Welcher Mensch hat dich am meisten geprägt — und weiß es nicht?', 'Werte', 3, false, 'de'),
  ('Was würdest du deinem 18-jährigen Ich sagen?', 'Selbst', 2, false, 'de'),
  ('Glaubst du an Schicksal oder an Zufall?', 'Philosophie', 3, false, 'de'),

  -- German couples
  ('Was hast du an mir gemocht, bevor wir uns kannten?', 'Paare', 2, true, 'de'),
  ('Wann fühlst du dich mir am nächsten?', 'Paare', 2, true, 'de'),
  ('Was sollten wir öfter zusammen tun?', 'Paare', 1, true, 'de'),
  ('Wovor habe ich Angst, das du längst weißt?', 'Paare', 3, true, 'de');
