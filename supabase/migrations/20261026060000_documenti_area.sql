-- Documenti caricati dall'area personale: visure e bilanci aggiornati, business plan, altri documenti.

alter table public.documents drop constraint if exists documents_kind_check;
alter table public.documents add constraint documents_kind_check
  check (kind in ('visura', 'bilancio', 'business_plan', 'altro'));
-- anno di riferimento (esercizio del bilancio, primo anno del piano) e descrizione facoltativa dell'utente
alter table public.documents add column if not exists period integer;
alter table public.documents add column if not exists label text check (label is null or char_length(label) <= 120);
create index if not exists documents_company_kind_idx on public.documents (company_id, kind, created_at desc);

-- Dati dei documenti usati per scrivere il report approfondito (bilancio più recente, piano, ecc.)
alter table public.assessments add column if not exists report_inputs jsonb;

-- Conservazione: si eliminano i documenti mai collegati a un utente dopo 30 giorni
-- (caricati durante una compilazione non conclusa) e quelli di utenti che non accedono da 24 mesi.
create or replace function public.documents_to_purge()
returns table (id uuid, storage_path text)
language sql stable security definer set search_path = public, auth as $$
  select d.id, d.storage_path
  from public.documents d
  left join auth.users u on u.id = d.user_id
  where (d.user_id is null and d.created_at < now() - interval '30 days')
     or (d.user_id is not null and coalesce(u.last_sign_in_at, d.created_at) < now() - interval '24 months');
$$;
revoke execute on function public.documents_to_purge() from public, anon, authenticated;

-- Report approfonditi: tentativi di generazione (un report non riuscito si riprova fino a 3 volte).
alter table public.assessments add column if not exists report_attempts integer not null default 0;
create index if not exists assessments_report_queue_idx on public.assessments (report_status, completed_at)
  where status = 'completed';

-- Richieste di approfondimento e consulenza: email di contatto (quella dell'account) e stato di gestione.
alter table public.interests add column if not exists contact_email text;
alter table public.interests add column if not exists handled_at timestamptz;
