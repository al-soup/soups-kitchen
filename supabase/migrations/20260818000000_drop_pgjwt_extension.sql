-- pgjwt is deprecated and blocks the Postgres major-version upgrade.
--
-- It was never used: created only by the baseline schema dump
-- (20260224101846_remote_schema.sql), and no function, view, policy, default
-- or constraint calls sign()/verify()/url_encode()/url_decode().
-- JWT reads go through auth.jwt(), a PostgREST built-in unrelated to pgjwt.

DROP EXTENSION IF EXISTS pgjwt;
