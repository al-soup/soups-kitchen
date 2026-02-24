

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'manager',
    'viewer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_roles_json JSONB;
BEGIN
  -- Query all roles for this user and build a JSON object:
  -- {"habits": "viewer", "messages": "manager", "_global": "admin"}
  SELECT jsonb_object_agg(table_name, role)
  INTO user_roles_json
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::UUID;

  -- Inject that object into the JWT under claims.user_roles
  event := jsonb_set(
    event,
    '{claims,user_roles}',        -- path in the JSON to set
    COALESCE(user_roles_json, '{}'::JSONB)  -- fallback to {} if no roles
  );

  RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_daily_habit_scores"("action_type" integer, "start_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("completed_date" "date", "habit_ids" integer[], "total_score" numeric)
    LANGUAGE "sql" STABLE
    AS $$select
    date_trunc('day', h.completed_at)::date as completed_date,
    array_agg(distinct h.id::int) as habit_ids,
    sum(a.level) as total_score
  from
    habit as h
    join action as a on a.id = h.action_id
      and a.type = action_type
  where
    h.completed_at is not null
    and h.completed_at <= (start_date)::date
    and h.completed_at > (start_date - interval '1 year')::date
  group by
    completed_date
  order by
    completed_date
  limit 365;$$;


ALTER FUNCTION "public"."get_daily_habit_scores"("action_type" integer, "start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("target_table" "text") RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
    AND table_name = target_table;
$$;


ALTER FUNCTION "public"."get_user_role"("target_table" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, table_name, role) VALUES
    (NEW.id, 'habits',   'viewer'); -- Add row below separated by comma if you want to do this for new tables
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_global_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND table_name = '_global'
      AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_global_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."action" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" bigint,
    "level" bigint,
    "name" "text" DEFAULT ''::"text",
    "description" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."action" OWNER TO "postgres";


ALTER TABLE "public"."action" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."action_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."habit" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "note" "text" DEFAULT ''::"text",
    "action_id" bigint NOT NULL
);


ALTER TABLE "public"."habit" OWNER TO "postgres";


COMMENT ON TABLE "public"."habit" IS 'A way of acting fixed through repetition';



ALTER TABLE "public"."habit" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."habit_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "table_name" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'viewer'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "action_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."action"
    ADD CONSTRAINT "action_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."habit"
    ADD CONSTRAINT "habit_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."habit"
    ADD CONSTRAINT "habit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_table_name_key" UNIQUE ("user_id", "table_name");



CREATE INDEX "idx_user_roles_lookup" ON "public"."user_roles" USING "btree" ("user_id", "table_name");



ALTER TABLE ONLY "public"."habit"
    ADD CONSTRAINT "habit_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."action"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin full access on habit" ON "public"."habit" USING (("public"."get_user_role"('habit'::"text") = 'admin'::"public"."user_role")) WITH CHECK (("public"."get_user_role"('habit'::"text") = 'admin'::"public"."user_role"));



CREATE POLICY "Enable read access for all users" ON "public"."action" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."habit" FOR SELECT USING (true);



CREATE POLICY "Global admin full access on habit" ON "public"."habit" USING ("public"."is_global_admin"()) WITH CHECK ("public"."is_global_admin"());



CREATE POLICY "Global admins manage all roles" ON "public"."user_roles" USING ("public"."is_global_admin"()) WITH CHECK ("public"."is_global_admin"());



CREATE POLICY "Manager CRUD on habit" ON "public"."habit" USING (("public"."get_user_role"('habit'::"text") = 'manager'::"public"."user_role")) WITH CHECK (("public"."get_user_role"('habit'::"text") = 'manager'::"public"."user_role"));



CREATE POLICY "Users can read own roles" ON "public"."user_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Viewer read habit" ON "public"."habit" FOR SELECT USING (("public"."get_user_role"('habit'::"text") = 'viewer'::"public"."user_role"));



ALTER TABLE "public"."action" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."habit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";











































































































































































REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."get_daily_habit_scores"("action_type" integer, "start_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_daily_habit_scores"("action_type" integer, "start_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_daily_habit_scores"("action_type" integer, "start_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("target_table" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("target_table" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("target_table" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_global_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_global_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_global_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."action" TO "anon";
GRANT ALL ON TABLE "public"."action" TO "authenticated";
GRANT ALL ON TABLE "public"."action" TO "service_role";



GRANT ALL ON SEQUENCE "public"."action_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."action_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."action_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."habit" TO "anon";
GRANT ALL ON TABLE "public"."habit" TO "authenticated";
GRANT ALL ON TABLE "public"."habit" TO "service_role";



GRANT ALL ON SEQUENCE "public"."habit_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."habit_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."habit_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


