-- Invio automatico dei report dopo i controlli, tracciamento di aperture e scarichi,
-- compilazioni scritte solo dal server, accrediti per i test. Rieseguibile.

-- 1. Le compilazioni le scrive solo il server: la vecchia regola per le bozze permetteva a un utente
--    di inserire direttamente una compilazione già completata.
drop policy if exists assessments_insert on public.assessments;
drop policy if exists assessments_update on public.assessments;
revoke insert, update, delete on public.assessments from authenticated;

-- 2. Esito dei controlli automatici e modo in cui il report è stato rilasciato
alter table public.assessments add column if not exists report_checks jsonb;
alter table public.assessments add column if not exists report_released_by text;
alter table public.assessments add column if not exists report_released_at timestamptz;
alter table public.module_assessments add column if not exists report_checks jsonb;
alter table public.module_assessments add column if not exists report_released_by text;
alter table public.module_assessments add column if not exists report_released_at timestamptz;
alter table public.assessments drop constraint if exists assessments_report_released_by_check;
alter table public.assessments add constraint assessments_report_released_by_check check (report_released_by in ('auto', 'staff'));
alter table public.module_assessments drop constraint if exists module_assessments_report_released_by_check;
alter table public.module_assessments add constraint module_assessments_report_released_by_check check (report_released_by in ('auto', 'staff'));
-- i report già approvati dallo staff
update public.assessments set report_released_by = 'staff', report_released_at = coalesce(report_notified_at, updated_at)
  where report_status = 'ready' and report_released_by is null;
update public.module_assessments set report_released_by = 'staff', report_released_at = now()
  where report_status = 'ready' and report_released_by is null;

-- 3. Il testo del report e l'esito dei controlli si leggono solo attraverso il server, che li mostra
--    al cliente quando il report è rilasciato. Agli utenti restano leggibili tutte le altre colonne.
--    Da rieseguire dopo aver aggiunto colonne a queste due tabelle.
create or replace function public.protect_report_columns() returns void
language plpgsql security definer set search_path = public as $$
declare
  t text;
  cols text;
begin
  foreach t in array array['assessments', 'module_assessments'] loop
    select string_agg(quote_ident(column_name), ', ') into cols
      from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name not in ('report_narrative', 'report_checks');
    execute format('revoke select on public.%I from authenticated', t);
    execute format('grant select (%s) on public.%I to authenticated', cols, t);
  end loop;
end $$;
revoke all on function public.protect_report_columns() from public, anon, authenticated;
select public.protect_report_columns();

-- 4. Aperture e scarichi dei report: li registra il server, li legge lo staff dal server
create table if not exists public.report_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('diagnostico', 'modulo')),
  ref_id uuid not null,
  user_id uuid,
  event text not null check (event in ('open', 'pdf')),
  created_at timestamptz not null default now()
);
create index if not exists report_events_ref_idx on public.report_events (kind, ref_id, created_at);
alter table public.report_events enable row level security;
revoke all on public.report_events from anon, authenticated;

-- 5. Accrediti: servizi attivati dallo staff senza pagamento (per esempio per le aziende che provano il servizio)
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (payment_method in ('stripe', 'bonifico', 'omaggio'));
