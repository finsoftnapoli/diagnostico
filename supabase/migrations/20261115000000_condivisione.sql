-- Report interattivo: condivisione in sola lettura con un link, azioni spuntate, promemoria.
-- Scrive e legge solo il server.

-- 1. Link di condivisione di un report: del link si conserva solo l'impronta, mai il valore
create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  created_by uuid not null,
  token_hash text not null unique,
  recipient_email text check (recipient_email is null or position('@' in recipient_email) > 1),
  recipient_name text check (char_length(recipient_name) <= 120),
  scope text not null default 'completo' check (scope in ('sintesi', 'completo')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  views integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists report_shares_assessment_idx on public.report_shares (assessment_id, created_at desc);
alter table public.report_shares enable row level security;
revoke all on public.report_shares from anon, authenticated;

-- 2. Azioni del report segnate come fatte
create table if not exists public.report_actions (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  action_key text not null check (char_length(action_key) <= 40),
  updated_by uuid,
  updated_at timestamptz not null default now(),
  primary key (assessment_id, action_key)
);
alter table public.report_actions enable row level security;
revoke all on public.report_actions from anon, authenticated;

-- 3. Promemoria: uno solo per bozza lasciata a metà e per invito senza risposta
alter table public.drafts add column if not exists reminded_at timestamptz;
alter table public.invitations add column if not exists reminded_at timestamptz;
