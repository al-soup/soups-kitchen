-- Swap knowledge.id from uuid → bigserial for short, memorable URLs
-- (/apps/knowledge-base/3 instead of a 36-char UUID). No remote data yet, so
-- a destructive recreate of knowledge_tags is fine.

drop table if exists "public"."knowledge_tags";

alter table "public"."knowledge" drop column "id";
alter table "public"."knowledge" add column "id" bigserial primary key;

create table "public"."knowledge_tags" (
  "knowledge_id" bigint not null references "public"."knowledge"("id") on delete cascade,
  "tag_id" uuid not null references "public"."tags"("id") on delete cascade,
  primary key ("knowledge_id", "tag_id")
);

alter table "public"."knowledge_tags" enable row level security;

create index idx_knowledge_tags_tag_id
  on public.knowledge_tags using btree (tag_id);

-- RLS — mirrors the original policies (read/insert/delete for authenticated).
-- No update policy: composite-PK rows are replaced by delete+insert.
create policy "Authenticated users can read knowledge_tags"
  on "public"."knowledge_tags"
  for select to authenticated using (true);

create policy "Authenticated users can insert knowledge_tags"
  on "public"."knowledge_tags"
  for insert to authenticated with check (true);

create policy "Authenticated users can delete knowledge_tags"
  on "public"."knowledge_tags"
  for delete to authenticated using (true);
