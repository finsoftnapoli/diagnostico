-- Strumenti per osservare i test: riscontri degli utenti, misura del percorso senza identificativi,
-- registro degli errori, archivio delle copie di sicurezza. Scrive e legge solo il server.

-- 1. Riscontri e domande degli utenti su Ottogramma, report e approfondimenti
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('ottogramma', 'report', 'modulo', 'domanda')),
  ref_id uuid,
  user_id uuid,
  rating smallint check (rating between 1 and 5),
  message text check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_idx on public.feedback (created_at desc);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

-- 2. Misura del percorso: solo il nome del passo e il tipo di dispositivo, nessun identificativo della persona
create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 40),
  step text check (char_length(step) <= 40),
  device text check (device in ('desktop', 'mobile')),
  created_at timestamptz not null default now()
);
create index if not exists funnel_events_created_idx on public.funnel_events (created_at, name);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;

-- 3. Registro degli errori visti dagli utenti o dal server
create table if not exists public.error_log (
  id bigint generated always as identity primary key,
  source text not null check (source in ('client', 'server')),
  message text not null check (char_length(message) <= 1000),
  path text check (char_length(path) <= 300),
  detail text check (char_length(detail) <= 4000),
  created_at timestamptz not null default now()
);
create index if not exists error_log_created_idx on public.error_log (created_at desc);
alter table public.error_log enable row level security;
revoke all on public.error_log from anon, authenticated;

-- 4. Archivio privato per le copie di sicurezza giornaliere dei dati
insert into storage.buckets (id, name, public) values ('backup', 'backup', false) on conflict (id) do nothing;
