DO $$
BEGIN
  CREATE ROLE ci_inserter NOLOGIN NOINHERIT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA public TO ci_inserter;
GRANT INSERT ON TABLE public.habit TO ci_inserter;
GRANT USAGE, SELECT ON SEQUENCE public.habit_id_seq TO ci_inserter;
GRANT SELECT (id, name) ON TABLE public.action TO ci_inserter;

DROP POLICY IF EXISTS "CI inserts on habit" ON public.habit;
CREATE POLICY "CI inserts on habit" ON public.habit
  FOR INSERT
  TO ci_inserter
  WITH CHECK (true);
