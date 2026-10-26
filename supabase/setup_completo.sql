-- Configurazione completa del database: tutte le migrazioni in ordine, rieseguibili senza errori.
-- Generato da supabase/migrations: per un nuovo progetto basta incollarlo una volta nel SQL Editor.

-- ===== 20261026000000_init.sql =====
-- Schema iniziale del diagnostico (fase 1, già predisposto per più utenti per azienda).
-- Regola di fondo: sicurezza a livello di riga su ogni tabella; ogni azienda vede solo i propri dati.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabelle
-- ---------------------------------------------------------------------------

-- Persone del team Finsoft che vedono tutte le compilazioni (area riservata).
create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  vat_number text,
  source text not null default 'diretto', -- provenienza: diretto, campagna, in futuro partner
  utm jsonb,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  -- ambiti assegnati: null = questionario completo
  assigned_areas text[],
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  role text not null default 'member' check (role in ('admin', 'member')),
  assigned_areas text[],
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid not null references auth.users (id),
  accepted_by uuid references auth.users (id),
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now()
);

-- Una compilazione del questionario da parte di una persona.
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  questionnaire_version text not null,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  mode text not null default 'full' check (mode in ('full', 'areas')),
  assigned_areas text[],
  -- bozza completa delle risposte, per la ripresa da dove si era rimasti
  responses jsonb not null default '{}'::jsonb,
  -- sezioni strutturate, scritte al completamento
  profile jsonb,
  objectives text[] check (coalesce(array_length(objectives, 1), 0) <= 3),
  objectives_text text,
  issues text[] check (coalesce(array_length(issues, 1), 0) <= 3),
  issues_text text,
  text_areas text[],
  overall_score smallint,
  source text not null default 'diretto',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists assessments_company_id_idx on public.assessments (company_id);
create index if not exists assessments_user_id_idx on public.assessments (user_id);

-- Una riga per domanda: base per benchmark e analisi.
create table if not exists public.answers (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  question_id text not null,
  area text not null,
  level smallint not null check (level between 1 and 4),
  check_answer text,
  overestimate_flag boolean not null default false,
  primary key (assessment_id, question_id)
);

-- Risultato del motore per ambito, con la versione delle regole usate.
create table if not exists public.area_scores (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  area text not null,
  score smallint check (score between 0 and 100),
  importance smallint check (importance between 1 and 3),
  objectives_index numeric(4, 2),
  issues_index numeric(4, 2),
  from_text boolean not null default false,
  priority_index integer,
  rank smallint,
  is_priority boolean not null default false,
  engine_version text not null,
  primary key (assessment_id, area)
);

-- Registro dei consensi: solo inserimenti, mai modifiche (si registra un nuovo evento).
create table if not exists public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null check (purpose in ('service', 'benchmark', 'marketing')),
  granted boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);
create index if not exists consents_user_id_purpose_created_at_idx on public.consents (user_id, purpose, created_at desc);

-- ---------------------------------------------------------------------------
-- Funzioni di supporto per le regole di accesso
-- ---------------------------------------------------------------------------

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create or replace function public.is_member(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_members where company_id = c and user_id = auth.uid());
$$;

create or replace function public.is_company_admin(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_members where company_id = c and user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists companies_touch on public.companies;
create trigger companies_touch before update on public.companies
  for each row execute function public.touch_updated_at();
drop trigger if exists assessments_touch on public.assessments;
create trigger assessments_touch before update on public.assessments
  for each row execute function public.touch_updated_at();

-- Crea l'azienda e rende amministratore chi la registra, in un solo passaggio.
create or replace function public.create_company(p_name text, p_source text default 'diretto', p_utm jsonb default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    raise exception 'accesso richiesto';
  end if;
  insert into public.companies (name, source, utm, created_by)
  values (p_name, coalesce(p_source, 'diretto'), p_utm, auth.uid())
  returning id into cid;
  insert into public.company_members (company_id, user_id, role)
  values (cid, auth.uid(), 'admin');
  return cid;
end $$;

-- Il collega invitato accetta l'invito con il token ricevuto via email.
create or replace function public.accept_invitation(p_token uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  inv public.invitations;
  user_email text;
begin
  if auth.uid() is null then
    raise exception 'accesso richiesto';
  end if;
  select * into inv from public.invitations where token = p_token for update;
  if not found or inv.status <> 'pending' then
    raise exception 'invito non valido';
  end if;
  if inv.expires_at < now() then
    update public.invitations set status = 'expired' where id = inv.id;
    raise exception 'invito scaduto';
  end if;
  select email into user_email from auth.users where id = auth.uid();
  if lower(user_email) <> lower(inv.email) then
    raise exception 'invito destinato a un altro indirizzo email';
  end if;
  insert into public.company_members (company_id, user_id, role, assigned_areas, invited_by)
  values (inv.company_id, auth.uid(), inv.role, inv.assigned_areas, inv.invited_by)
  on conflict (company_id, user_id) do nothing;
  update public.invitations set status = 'accepted', accepted_by = auth.uid() where id = inv.id;
  return inv.company_id;
end $$;

-- ---------------------------------------------------------------------------
-- Sicurezza a livello di riga
-- ---------------------------------------------------------------------------

alter table public.staff enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.invitations enable row level security;
alter table public.assessments enable row level security;
alter table public.answers enable row level security;
alter table public.area_scores enable row level security;
alter table public.consents enable row level security;

-- staff: ognuno vede solo se stesso; si gestisce dal pannello di Supabase
drop policy if exists staff_self on public.staff;
create policy staff_self on public.staff for select to authenticated using (user_id = auth.uid());

-- aziende
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies for select to authenticated
  using (public.is_member(id) or public.is_staff());
drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies for update to authenticated
  using (public.is_company_admin(id)) with check (public.is_company_admin(id));

-- membri: si vedono i colleghi della propria azienda; l'amministratore li gestisce
drop policy if exists members_select on public.company_members;
create policy members_select on public.company_members for select to authenticated
  using (public.is_member(company_id) or public.is_staff());
drop policy if exists members_update on public.company_members;
create policy members_update on public.company_members for update to authenticated
  using (public.is_company_admin(company_id)) with check (public.is_company_admin(company_id));
drop policy if exists members_delete on public.company_members;
create policy members_delete on public.company_members for delete to authenticated
  using (public.is_company_admin(company_id) and user_id <> auth.uid());

-- inviti: solo l'amministratore dell'azienda
drop policy if exists invitations_admin_select on public.invitations;
create policy invitations_admin_select on public.invitations for select to authenticated
  using (public.is_company_admin(company_id) or public.is_staff());
drop policy if exists invitations_admin_insert on public.invitations;
create policy invitations_admin_insert on public.invitations for insert to authenticated
  with check (public.is_company_admin(company_id) and invited_by = auth.uid());
drop policy if exists invitations_admin_update on public.invitations;
create policy invitations_admin_update on public.invitations for update to authenticated
  using (public.is_company_admin(company_id)) with check (public.is_company_admin(company_id));

-- compilazioni: ognuno le proprie; l'amministratore vede quelle dei colleghi (visibilità dichiarata)
drop policy if exists assessments_select on public.assessments;
create policy assessments_select on public.assessments for select to authenticated
  using (user_id = auth.uid() or public.is_company_admin(company_id) or public.is_staff());
drop policy if exists assessments_insert on public.assessments;
create policy assessments_insert on public.assessments for insert to authenticated
  with check (user_id = auth.uid() and public.is_member(company_id));
-- l'utente aggiorna solo la bozza; il completamento lo registra il server
drop policy if exists assessments_update on public.assessments;
create policy assessments_update on public.assessments for update to authenticated
  using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid() and status = 'draft');

-- risposte e punteggi seguono la compilazione
drop policy if exists answers_select on public.answers;
create policy answers_select on public.answers for select to authenticated
  using (exists (
    select 1 from public.assessments a where a.id = assessment_id
      and (a.user_id = auth.uid() or public.is_company_admin(a.company_id) or public.is_staff())
  ));
-- Risposte definitive e punteggi li scrive solo il server (chiave di servizio) al completamento,
-- così nessuno può inserire punteggi alterati che finirebbero nel benchmark.

drop policy if exists scores_select on public.area_scores;
create policy scores_select on public.area_scores for select to authenticated
  using (exists (
    select 1 from public.assessments a where a.id = assessment_id
      and (a.user_id = auth.uid() or public.is_company_admin(a.company_id) or public.is_staff())
  ));

-- consensi: ognuno registra e legge i propri; nessuna modifica né cancellazione
drop policy if exists consents_select on public.consents;
create policy consents_select on public.consents for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists consents_insert on public.consents;
create policy consents_insert on public.consents for insert to authenticated
  with check (user_id = auth.uid());

-- Permessi: nessun accesso anonimo ai dati.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on function public.create_company(text, text, jsonb), public.accept_invitation(uuid),
  public.is_staff(), public.is_member(uuid), public.is_company_admin(uuid) to authenticated;

-- ===== 20261026010000_email_compilatore.sql =====
-- Email di chi compila, per l'area riservata e il contatto (la fonte resta auth.users).
alter table public.assessments add column if not exists respondent_email text;

-- ===== 20261026020000_bozze.sql =====
-- Bozze del questionario salvate per riprendere più tardi, anche da un altro dispositivo.
-- Nessun accesso diretto dagli utenti: le legge e scrive solo il server, che consegna la bozza
-- solo a chi ha confermato la stessa email con cui è stata salvata.
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  step smallint not null default 0,
  responses jsonb not null,
  questionnaire_version text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create index if not exists drafts_lower_idx on public.drafts (lower(email));
alter table public.drafts enable row level security;
revoke all on public.drafts from anon, authenticated;

-- ===== 20261026030000_rilevanza.sql =====
-- Dalla v0.3 l'importanza non si chiede più: si registra la rilevanza calcolata dal motore.
alter table public.area_scores add column if not exists relevance numeric(5, 3);
comment on column public.area_scores.importance is 'Solo compilazioni v0.2: importanza dichiarata (1-3)';

-- ===== 20261026040000_documenti_inviti.sql =====
-- Archivio dei documenti caricati (visura, bilancio) e dati aggiuntivi per gli inviti ai colleghi.

-- Archivio privato dei file: accessibile solo dal server con la chiave di servizio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documenti', 'documenti', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('visura', 'bilancio')),
  storage_path text not null unique,
  size_bytes integer,
  -- dati dell'azienda estratti (mai nomi di persone): profilo, bilancio, governance aggregata
  extracted jsonb,
  user_id uuid references auth.users (id) on delete set null,
  company_id uuid references public.companies (id) on delete cascade,
  assessment_id uuid references public.assessments (id) on delete set null,
  created_at timestamptz not null default now(),
  linked_at timestamptz
);
create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists documents_company_id_idx on public.documents (company_id);

alter table public.documents enable row level security;
-- ognuno vede i propri documenti; lo staff tutti. Inserimenti e cancellazioni solo dal server.
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
grant select on public.documents to authenticated;
revoke insert, update, delete on public.documents from anon, authenticated;

-- Inviti: nome e ruolo indicati da chi invita, data di invio dell'email.
alter table public.invitations add column if not exists invitee_name text;
alter table public.invitations add column if not exists invitee_role text;
alter table public.invitations add column if not exists sent_at timestamptz;

-- Documenti da eliminare: mai collegati a una compilazione dopo 30 giorni,
-- oppure di utenti che non accedono da 24 mesi.
create or replace function public.documents_to_purge()
returns table (id uuid, storage_path text)
language sql stable security definer set search_path = public, auth as $$
  select d.id, d.storage_path
  from public.documents d
  left join auth.users u on u.id = d.user_id
  where (d.assessment_id is null and d.created_at < now() - interval '30 days')
     or (d.user_id is not null and coalesce(u.last_sign_in_at, d.created_at) < now() - interval '24 months');
$$;
revoke execute on function public.documents_to_purge() from public, anon, authenticated;

-- Dati di un invito leggibili con il solo token (pagina di accettazione).
create or replace function public.invitation_info(p_token uuid)
returns table (company_name text, invitee_name text, invitee_role text, email text, status text, expired boolean)
language sql stable security definer set search_path = public as $$
  select c.name, i.invitee_name, i.invitee_role, i.email, i.status, i.expires_at < now()
  from public.invitations i join public.companies c on c.id = i.company_id
  where i.token = p_token;
$$;
grant execute on function public.invitation_info(uuid) to anon, authenticated;

-- ===== 20261026050000_report_ai.sql =====
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

-- ===== 20261026060000_documenti_area.sql =====
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
