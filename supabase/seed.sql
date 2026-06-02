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
      'B-trees keep keys sorted on disk in shallow, balanced pages — point and range lookups stay O(log n) even for billions of rows.',
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
  END
);
