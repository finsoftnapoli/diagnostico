-- Bozze del questionario salvate per riprendere più tardi, anche da un altro dispositivo.
-- Nessun accesso diretto dagli utenti: le legge e scrive solo il server, che consegna la bozza
-- solo a chi ha confermato la stessa email con cui è stata salvata.
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  step smallint not null default 0,
  responses jsonb not null,
  questionnaire_version text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create index on public.drafts (lower(email));
alter table public.drafts enable row level security;
revoke all on public.drafts from anon, authenticated;
