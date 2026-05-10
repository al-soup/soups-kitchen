CREATE TABLE public.strava_tokens (
  id            int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id    bigint NOT NULL,
  access_token  text NOT NULL,
  refresh_token text NOT NULL,
  expires_at    bigint NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.strava_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.strava_tokens FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.strava_tokens_id_seq FROM anon, authenticated;
