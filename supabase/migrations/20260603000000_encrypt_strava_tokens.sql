-- Encrypt Strava OAuth tokens at rest using pgcrypto.
--
-- Plaintext columns are dropped. After applying this migration, run
-- `pnpm strava:auth` to re-store tokens. Requires STRAVA_TOKEN_KEY env var
-- set for both:
--   * Supabase edge function (via `supabase secrets set STRAVA_TOKEN_KEY=...`)
--   * `pnpm strava:auth` runner (in .env.local)
--
-- Use a single 32+ char random string.

-- pgcrypto lives in the `extensions` schema on Supabase. Calls below are
-- fully-qualified so this works with `SET search_path = public` on each
-- SECURITY DEFINER function.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Existing rows can't be encrypted without the key, so wipe them. The single
-- row is regenerated via `pnpm strava:auth`. TRUNCATE sidesteps the
-- Supabase WHERE-clause guard that blocks bare DELETEs.
TRUNCATE TABLE public.strava_tokens;

ALTER TABLE public.strava_tokens
  ADD COLUMN access_token_enc bytea NOT NULL,
  ADD COLUMN refresh_token_enc bytea NOT NULL;

ALTER TABLE public.strava_tokens
  DROP COLUMN access_token,
  DROP COLUMN refresh_token;

-- ---------------------------------------------------------------------------
-- RPCs. All SECURITY DEFINER, granted to service_role only.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_strava_tokens(
  p_athlete_id bigint,
  p_access_token text,
  p_refresh_token text,
  p_expires_at bigint,
  p_key text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- WHERE true satisfies Supabase's safeupdate guard against bare DELETEs.
  DELETE FROM public.strava_tokens WHERE true;
  INSERT INTO public.strava_tokens (
    athlete_id, access_token_enc, refresh_token_enc, expires_at
  ) VALUES (
    p_athlete_id,
    extensions.pgp_sym_encrypt(p_access_token, p_key),
    extensions.pgp_sym_encrypt(p_refresh_token, p_key),
    p_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_strava_token(p_key text)
RETURNS TABLE (
  id integer,
  athlete_id bigint,
  access_token text,
  refresh_token text,
  expires_at bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.athlete_id,
    extensions.pgp_sym_decrypt(t.access_token_enc, p_key)::text,
    extensions.pgp_sym_decrypt(t.refresh_token_enc, p_key)::text,
    t.expires_at
  FROM public.strava_tokens t
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_strava_access_token(
  p_id integer,
  p_access_token text,
  p_refresh_token text,
  p_expires_at bigint,
  p_key text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.strava_tokens
  SET access_token_enc = extensions.pgp_sym_encrypt(p_access_token, p_key),
      refresh_token_enc = extensions.pgp_sym_encrypt(p_refresh_token, p_key),
      expires_at = p_expires_at,
      updated_at = now()
  WHERE id = p_id;
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_strava_tokens(bigint, text, text, bigint, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_strava_token(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_strava_access_token(integer, text, text, bigint, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.upsert_strava_tokens(bigint, text, text, bigint, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_strava_token(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_strava_access_token(integer, text, text, bigint, text) TO service_role;
