-- Fix handle_new_user: inserted table_name 'habits' (plural) but all RLS
-- policies and seed data use 'habit'. New signups got a dead role row.

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, table_name, role) VALUES
    (NEW.id, 'habit',   'viewer'); -- Add row below separated by comma if you want to do this for new tables
  RETURN NEW;
END;
$$;

-- Backfill: rename existing 'habits' rows to 'habit' unless the user already
-- has a 'habit' row (unique constraint on (user_id, table_name)).
UPDATE public.user_roles ur
SET table_name = 'habit'
WHERE ur.table_name = 'habits'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.table_name = 'habit'
  );

DELETE FROM public.user_roles WHERE table_name = 'habits';
