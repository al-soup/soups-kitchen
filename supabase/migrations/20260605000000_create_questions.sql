create table public.questions (
  id bigserial primary key,
  text text not null,
  category text,
  difficulty smallint not null
    check (difficulty between 1 and 3),
  is_ai_generated boolean not null default false,
  is_for_couples boolean not null default false,
  language text not null default 'en',
  source text,
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create index idx_questions_category on public.questions (category);
create index idx_questions_active on public.questions (is_active)
  where is_active = true;

create trigger trg_questions_updated_at
  before update on public.questions
  for each row execute function public.update_updated_at();

-- RLS mirrors KB pattern: public read of active rows, manager-only writes.
create policy "Anyone can read active questions"
  on public.questions for select
  to anon, authenticated
  using (is_active);

create policy "Managers can read inactive questions"
  on public.questions for select
  to authenticated
  using (public.is_manager_of('questions'));

create policy "Managers can insert questions"
  on public.questions for insert
  to authenticated
  with check (public.is_manager_of('questions'));

create policy "Managers can update questions"
  on public.questions for update
  to authenticated
  using (public.is_manager_of('questions'))
  with check (public.is_manager_of('questions'));

create policy "Managers can delete questions"
  on public.questions for delete
  to authenticated
  using (public.is_manager_of('questions'));
