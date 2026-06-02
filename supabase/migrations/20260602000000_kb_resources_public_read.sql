-- Open Knowledge Base and Resources to public read; restrict writes to
-- users with the "manager" (or "admin") role on the relevant table from
-- user_roles. Global admins (user_roles._global = 'admin') keep override.

create or replace function public.is_manager_of(target_table text)
returns boolean
language sql
stable
security invoker
as $$
  select
    coalesce((auth.jwt() -> 'user_roles' ->> target_table), '') in ('manager', 'admin')
    or coalesce((auth.jwt() -> 'user_roles' ->> '_global'), '') = 'admin';
$$;

-- knowledge
drop policy if exists "Authenticated users can read knowledge" on public.knowledge;
drop policy if exists "Authenticated users can insert knowledge" on public.knowledge;
drop policy if exists "Authenticated users can update knowledge" on public.knowledge;
drop policy if exists "Authenticated users can delete knowledge" on public.knowledge;

create policy "Anyone can read knowledge"
  on public.knowledge for select
  to anon, authenticated
  using (true);

create policy "Managers can insert knowledge"
  on public.knowledge for insert
  to authenticated
  with check (public.is_manager_of('knowledge'));

create policy "Managers can update knowledge"
  on public.knowledge for update
  to authenticated
  using (public.is_manager_of('knowledge'))
  with check (public.is_manager_of('knowledge'));

create policy "Managers can delete knowledge"
  on public.knowledge for delete
  to authenticated
  using (public.is_manager_of('knowledge'));

-- knowledge_tags (gated on 'knowledge' — part of KB management)
drop policy if exists "Authenticated users can read knowledge_tags" on public.knowledge_tags;
drop policy if exists "Authenticated users can insert knowledge_tags" on public.knowledge_tags;
drop policy if exists "Authenticated users can delete knowledge_tags" on public.knowledge_tags;

create policy "Anyone can read knowledge_tags"
  on public.knowledge_tags for select
  to anon, authenticated
  using (true);

create policy "Managers can insert knowledge_tags"
  on public.knowledge_tags for insert
  to authenticated
  with check (public.is_manager_of('knowledge'));

create policy "Managers can delete knowledge_tags"
  on public.knowledge_tags for delete
  to authenticated
  using (public.is_manager_of('knowledge'));

-- tags (also gated on 'knowledge')
drop policy if exists "Authenticated users can read tags" on public.tags;
drop policy if exists "Authenticated users can insert tags" on public.tags;
drop policy if exists "Authenticated users can update tags" on public.tags;
drop policy if exists "Authenticated users can delete tags" on public.tags;

create policy "Anyone can read tags"
  on public.tags for select
  to anon, authenticated
  using (true);

create policy "Managers can insert tags"
  on public.tags for insert
  to authenticated
  with check (public.is_manager_of('knowledge'));

create policy "Managers can update tags"
  on public.tags for update
  to authenticated
  using (public.is_manager_of('knowledge'))
  with check (public.is_manager_of('knowledge'));

create policy "Managers can delete tags"
  on public.tags for delete
  to authenticated
  using (public.is_manager_of('knowledge'));

-- resources
drop policy if exists "Authenticated users can read resources" on public.resources;
drop policy if exists "Authenticated users can insert resources" on public.resources;
drop policy if exists "Authenticated users can update resources" on public.resources;
drop policy if exists "Authenticated users can delete resources" on public.resources;

create policy "Anyone can read resources"
  on public.resources for select
  to anon, authenticated
  using (true);

create policy "Managers can insert resources"
  on public.resources for insert
  to authenticated
  with check (public.is_manager_of('resources'));

create policy "Managers can update resources"
  on public.resources for update
  to authenticated
  using (public.is_manager_of('resources'))
  with check (public.is_manager_of('resources'));

create policy "Managers can delete resources"
  on public.resources for delete
  to authenticated
  using (public.is_manager_of('resources'));

-- Storage: resources bucket. Anon can read so signed URLs work for public
-- viewers; writes restricted to resource managers.
drop policy if exists "Authenticated users can read resources bucket" on storage.objects;
drop policy if exists "Authenticated users can insert into resources bucket" on storage.objects;
drop policy if exists "Authenticated users can update resources bucket" on storage.objects;
drop policy if exists "Authenticated users can delete from resources bucket" on storage.objects;

create policy "Anyone can read resources bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'resources');

create policy "Managers can insert into resources bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resources' and public.is_manager_of('resources'));

create policy "Managers can update resources bucket"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'resources' and public.is_manager_of('resources'));

create policy "Managers can delete from resources bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'resources' and public.is_manager_of('resources'));
