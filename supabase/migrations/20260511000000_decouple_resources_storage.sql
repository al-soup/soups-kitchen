-- Decouple resources from knowledge: resources are now a standalone, reusable
-- module. Knowledge entries reference resources from markdown via placeholder
-- tokens (e.g. {{resource:<uuid>}}); no FK between knowledge and resources.

alter table "public"."resources"
  drop constraint "resources_knowledge_id_fkey";

drop index if exists "public"."idx_resources_knowledge_id";

alter table "public"."resources" drop column "knowledge_id";

-- Useful metadata for the resources UI.
alter table "public"."resources" add column "size_bytes" bigint;
alter table "public"."resources"
  add column "created_at" timestamptz default now();

create index idx_resources_created_at
  on public.resources using btree (created_at desc);

-- Private storage bucket shared across apps. Files served via signed URLs
-- (1h TTL) at render time.
insert into storage.buckets (id, name, public)
  values ('resources', 'resources', false)
  on conflict (id) do nothing;

-- Storage RLS — any authenticated user can read/write the resources bucket.
create policy "Authenticated users can read resources bucket"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resources');

create policy "Authenticated users can insert into resources bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resources');

create policy "Authenticated users can update resources bucket"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'resources');

create policy "Authenticated users can delete from resources bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'resources');
