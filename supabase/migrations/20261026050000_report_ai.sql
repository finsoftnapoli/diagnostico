-- Report approfondito elaborato dall'AI, generato in differita e inviato via email.
alter table public.assessments add column if not exists report_status text not null default 'pending'
  check (report_status in ('pending', 'ready', 'failed'));
alter table public.assessments add column if not exists report_narrative jsonb;
alter table public.assessments add column if not exists report_ready_at timestamptz;
alter table public.assessments add column if not exists report_notified_at timestamptz;

-- Manifestazioni di interesse per approfondimenti per ambito e consulenza (prima dei pagamenti).
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_id uuid references public.assessments (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  kind text not null check (kind in ('approfondimento_ambito', 'approfondimento_priorita', 'consulenza')),
  area text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists interests_user_id_idx on public.interests (user_id);

alter table public.interests enable row level security;
drop policy if exists interests_select on public.interests;
create policy interests_select on public.interests for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists interests_insert on public.interests;
create policy interests_insert on public.interests for insert to authenticated
  with check (user_id = auth.uid());
grant select, insert on public.interests to authenticated;
revoke update, delete on public.interests from anon, authenticated;
