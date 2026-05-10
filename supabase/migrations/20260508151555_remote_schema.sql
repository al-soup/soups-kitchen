create extension if not exists "pg_cron" with schema "pg_catalog";

create extension if not exists "pg_net" with schema "extensions";

create extension if not exists "pg_trgm" with schema "public";

create type "public"."tag_type" as enum ('topic', 'concept');


  create table "public"."knowledge" (
    "id" uuid not null default gen_random_uuid(),
    "question" text not null,
    "summary" text not null,
    "detail" text,
    "search_vector" tsvector,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."knowledge" enable row level security;


  create table "public"."knowledge_tags" (
    "knowledge_id" uuid not null,
    "tag_id" uuid not null
      );


alter table "public"."knowledge_tags" enable row level security;


  create table "public"."resources" (
    "id" uuid not null default gen_random_uuid(),
    "knowledge_id" uuid,
    "label" text,
    "bucket" text not null,
    "storage_path" text not null,
    "mime_type" text,
    "filename" text
      );


alter table "public"."resources" enable row level security;


  create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" public.tag_type not null default 'topic'::public.tag_type
      );


alter table "public"."tags" enable row level security;

CREATE INDEX idx_knowledge_question_trgm ON public.knowledge USING gin (question public.gin_trgm_ops);

CREATE INDEX idx_knowledge_search ON public.knowledge USING gin (search_vector);

CREATE INDEX idx_knowledge_summary_trgm ON public.knowledge USING gin (summary public.gin_trgm_ops);

CREATE INDEX idx_knowledge_tags_tag_id ON public.knowledge_tags USING btree (tag_id);

CREATE INDEX idx_resources_knowledge_id ON public.resources USING btree (knowledge_id);

CREATE INDEX idx_tags_name ON public.tags USING btree (name);

CREATE INDEX idx_tags_type ON public.tags USING btree (type);

CREATE UNIQUE INDEX knowledge_pkey ON public.knowledge USING btree (id);

CREATE UNIQUE INDEX knowledge_tags_pkey ON public.knowledge_tags USING btree (knowledge_id, tag_id);

CREATE UNIQUE INDEX resources_pkey ON public.resources USING btree (id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."knowledge" add constraint "knowledge_pkey" PRIMARY KEY using index "knowledge_pkey";

alter table "public"."knowledge_tags" add constraint "knowledge_tags_pkey" PRIMARY KEY using index "knowledge_tags_pkey";

alter table "public"."resources" add constraint "resources_pkey" PRIMARY KEY using index "resources_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."knowledge_tags" add constraint "knowledge_tags_knowledge_id_fkey" FOREIGN KEY (knowledge_id) REFERENCES public.knowledge(id) ON DELETE CASCADE not valid;

alter table "public"."knowledge_tags" validate constraint "knowledge_tags_knowledge_id_fkey";

alter table "public"."knowledge_tags" add constraint "knowledge_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."knowledge_tags" validate constraint "knowledge_tags_tag_id_fkey";

alter table "public"."resources" add constraint "resources_knowledge_id_fkey" FOREIGN KEY (knowledge_id) REFERENCES public.knowledge(id) ON DELETE CASCADE not valid;

alter table "public"."resources" validate constraint "resources_knowledge_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')),  'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.detail, '')),   'C');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_daily_habit_scores(action_type integer, start_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(completed_date date, habit_ids integer[], total_score numeric)
 LANGUAGE sql
 STABLE
AS $function$select
    date_trunc('day', h.completed_at)::date as completed_date,
    array_agg(distinct h.id::int) as habit_ids,
    sum(a.level) as total_score
  from
    habit as h
    join action as a on a.id = h.action_id
      and a.type = action_type
  where
    h.completed_at is not null
    and h.completed_at < (start_date + interval '1 day')::date
    and h.completed_at >= (start_date - interval '1 year')::date
  group by
    completed_date
  order by
    completed_date
  limit 365;$function$
;

grant delete on table "public"."knowledge" to "anon";

grant insert on table "public"."knowledge" to "anon";

grant references on table "public"."knowledge" to "anon";

grant select on table "public"."knowledge" to "anon";

grant trigger on table "public"."knowledge" to "anon";

grant truncate on table "public"."knowledge" to "anon";

grant update on table "public"."knowledge" to "anon";

grant delete on table "public"."knowledge" to "authenticated";

grant insert on table "public"."knowledge" to "authenticated";

grant references on table "public"."knowledge" to "authenticated";

grant select on table "public"."knowledge" to "authenticated";

grant trigger on table "public"."knowledge" to "authenticated";

grant truncate on table "public"."knowledge" to "authenticated";

grant update on table "public"."knowledge" to "authenticated";

grant delete on table "public"."knowledge" to "service_role";

grant insert on table "public"."knowledge" to "service_role";

grant references on table "public"."knowledge" to "service_role";

grant select on table "public"."knowledge" to "service_role";

grant trigger on table "public"."knowledge" to "service_role";

grant truncate on table "public"."knowledge" to "service_role";

grant update on table "public"."knowledge" to "service_role";

grant delete on table "public"."knowledge_tags" to "anon";

grant insert on table "public"."knowledge_tags" to "anon";

grant references on table "public"."knowledge_tags" to "anon";

grant select on table "public"."knowledge_tags" to "anon";

grant trigger on table "public"."knowledge_tags" to "anon";

grant truncate on table "public"."knowledge_tags" to "anon";

grant update on table "public"."knowledge_tags" to "anon";

grant delete on table "public"."knowledge_tags" to "authenticated";

grant insert on table "public"."knowledge_tags" to "authenticated";

grant references on table "public"."knowledge_tags" to "authenticated";

grant select on table "public"."knowledge_tags" to "authenticated";

grant trigger on table "public"."knowledge_tags" to "authenticated";

grant truncate on table "public"."knowledge_tags" to "authenticated";

grant update on table "public"."knowledge_tags" to "authenticated";

grant delete on table "public"."knowledge_tags" to "service_role";

grant insert on table "public"."knowledge_tags" to "service_role";

grant references on table "public"."knowledge_tags" to "service_role";

grant select on table "public"."knowledge_tags" to "service_role";

grant trigger on table "public"."knowledge_tags" to "service_role";

grant truncate on table "public"."knowledge_tags" to "service_role";

grant update on table "public"."knowledge_tags" to "service_role";

grant delete on table "public"."resources" to "anon";

grant insert on table "public"."resources" to "anon";

grant references on table "public"."resources" to "anon";

grant select on table "public"."resources" to "anon";

grant trigger on table "public"."resources" to "anon";

grant truncate on table "public"."resources" to "anon";

grant update on table "public"."resources" to "anon";

grant delete on table "public"."resources" to "authenticated";

grant insert on table "public"."resources" to "authenticated";

grant references on table "public"."resources" to "authenticated";

grant select on table "public"."resources" to "authenticated";

grant trigger on table "public"."resources" to "authenticated";

grant truncate on table "public"."resources" to "authenticated";

grant update on table "public"."resources" to "authenticated";

grant delete on table "public"."resources" to "service_role";

grant insert on table "public"."resources" to "service_role";

grant references on table "public"."resources" to "service_role";

grant select on table "public"."resources" to "service_role";

grant trigger on table "public"."resources" to "service_role";

grant truncate on table "public"."resources" to "service_role";

grant update on table "public"."resources" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


  create policy "Authenticated users can delete knowledge"
  on "public"."knowledge"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Authenticated users can insert knowledge"
  on "public"."knowledge"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated users can read knowledge"
  on "public"."knowledge"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can update knowledge"
  on "public"."knowledge"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Authenticated users can delete knowledge_tags"
  on "public"."knowledge_tags"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Authenticated users can insert knowledge_tags"
  on "public"."knowledge_tags"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated users can read knowledge_tags"
  on "public"."knowledge_tags"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can delete resources"
  on "public"."resources"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Authenticated users can insert resources"
  on "public"."resources"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated users can read resources"
  on "public"."resources"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can update resources"
  on "public"."resources"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Authenticated users can delete tags"
  on "public"."tags"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Authenticated users can insert tags"
  on "public"."tags"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated users can read tags"
  on "public"."tags"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Authenticated users can update tags"
  on "public"."tags"
  as permissive
  for update
  to authenticated
using (true)
with check (true);


CREATE TRIGGER trg_knowledge_search_vector BEFORE INSERT OR UPDATE OF question, summary, detail ON public.knowledge FOR EACH ROW EXECUTE FUNCTION public.update_search_vector();

CREATE TRIGGER trg_knowledge_updated_at BEFORE UPDATE ON public.knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


