-- Revisione dei report da parte dello staff, acquisti online, fatture, prenotazione delle consulenze,
-- moduli di approfondimento per ambito. Tutte le scritture passano dal server (chiave di servizio).

-- 1. Report approfondito: stato "da rivedere" prima dell'invio al cliente
alter table public.assessments drop constraint if exists assessments_report_status_check;
alter table public.assessments add constraint assessments_report_status_check
  check (report_status in ('pending', 'review', 'ready', 'failed'));
alter table public.assessments add column if not exists report_reviewed_at timestamptz;
alter table public.assessments add column if not exists report_reviewed_by uuid references auth.users (id) on delete set null;

-- 2. Dati di fatturazione dell'azienda (fattura elettronica B2B)
create table if not exists public.billing_profiles (
  company_id uuid primary key references public.companies (id) on delete cascade,
  denominazione text not null check (char_length(denominazione) between 2 and 160),
  vat_number text not null check (vat_number ~ '^[0-9]{11}$'),
  tax_code text check (tax_code is null or tax_code ~ '^[0-9A-Z]{11,16}$'),
  address text not null check (char_length(address) between 3 and 160),
  cap text not null check (cap ~ '^[0-9]{5}$'),
  city text not null check (char_length(city) between 2 and 80),
  province text not null check (province ~ '^[A-Z]{2}$'),
  sdi_code text check (sdi_code is null or sdi_code ~ '^[0-9A-Z]{7}$'),
  pec text check (pec is null or char_length(pec) <= 200),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 3. Ordini (il pagamento avviene su Stripe; lo staff può registrare un bonifico)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  items jsonb not null,
  net_cents integer not null check (net_cents >= 0),
  vat_cents integer not null check (vat_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  billing jsonb not null,
  payment_method text check (payment_method in ('stripe', 'bonifico')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  slot_id uuid,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);
create index if not exists orders_company_id_idx on public.orders (company_id);

-- 4. Moduli e ore di consulenza attivati con un ordine
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  kind text not null check (kind in ('area_module', 'consult_hours')),
  area text check (area is null or area in ('STR', 'FIN', 'MKT', 'PER', 'OPS', 'DIG', 'INN', 'SOS')),
  quantity numeric not null default 1 check (quantity > 0),
  used numeric not null default 0 check (used >= 0 and used <= quantity),
  created_at timestamptz not null default now(),
  check ((kind = 'area_module') = (area is not null))
);
create index if not exists entitlements_company_idx on public.entitlements (company_id, kind);
create index if not exists entitlements_user_idx on public.entitlements (user_id);

-- 5. Fatture elettroniche (numerazione annuale per sezionale)
create table if not exists public.invoice_counters (
  year integer primary key,
  last integer not null default 0
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  year integer not null,
  seq integer not null,
  number text not null,
  issued_on date not null,
  xml text,
  status text not null default 'draft' check (status in ('draft', 'manual', 'sent', 'error')),
  aruba_filename text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (year, seq)
);

create or replace function public.next_invoice_seq(p_year integer)
returns integer language sql volatile security definer set search_path = public as $$
  insert into public.invoice_counters (year, last) values (p_year, 1)
  on conflict (year) do update set last = public.invoice_counters.last + 1
  returning last;
$$;
revoke execute on function public.next_invoice_seq(integer) from public, anon, authenticated;

-- 6. Disponibilità dell'esperto e prenotazioni
create table if not exists public.expert_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_min integer not null default 60 check (duration_min between 15 and 240),
  meeting_url text,
  status text not null default 'open' check (status in ('open', 'held', 'booked', 'cancelled')),
  held_until timestamptz,
  held_by_order uuid,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists expert_slots_starts_idx on public.expert_slots (starts_at);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.expert_slots (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  entitlement_id uuid references public.entitlements (id) on delete set null,
  status text not null default 'confirmed' check (status in ('held', 'confirmed', 'cancelled')),
  topic text check (topic is null or char_length(topic) <= 1000),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
create unique index if not exists bookings_active_slot_idx on public.bookings (slot_id) where status <> 'cancelled';
create index if not exists bookings_user_idx on public.bookings (user_id);

-- Blocca uno slot libero (o tenuto da un pagamento scaduto, o dallo stesso ordine): true se ci riesce.
-- Le prenotazioni si chiudono 12 ore prima dell'inizio.
drop function if exists public.claim_slot(uuid, text, integer);
create or replace function public.claim_slot(p_slot uuid, p_status text, p_minutes integer, p_order uuid default null)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer;
begin
  update public.expert_slots
     set status = p_status,
         held_until = case when p_status = 'held' then now() + make_interval(mins => p_minutes) else null end,
         held_by_order = case when p_status = 'held' then p_order else null end
   where id = p_slot
     and starts_at > now() + interval '12 hours'
     and (status = 'open'
          or (status = 'held' and held_until < now())
          or (status = 'held' and p_order is not null and held_by_order = p_order));
  get diagnostics n = row_count;
  return n = 1;
end $$;
revoke execute on function public.claim_slot(uuid, text, integer, uuid) from public, anon, authenticated;

-- Usa (o restituisce) un'ora di consulenza acquistata: true se ci riesce.
create or replace function public.use_credit(p_entitlement uuid, p_delta numeric)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer;
begin
  update public.entitlements set used = used + p_delta
   where id = p_entitlement and kind = 'consult_hours' and used + p_delta between 0 and quantity;
  get diagnostics n = row_count;
  return n = 1;
end $$;
revoke execute on function public.use_credit(uuid, numeric) from public, anon, authenticated;

-- 7. Moduli di approfondimento per ambito
create table if not exists public.module_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  entitlement_id uuid references public.entitlements (id) on delete set null,
  area text not null check (area in ('STR', 'FIN', 'MKT', 'PER', 'OPS', 'DIG', 'INN', 'SOS')),
  module_version text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  responses jsonb not null default '{}'::jsonb,
  score integer,
  theme_scores jsonb,
  report_status text not null default 'pending' check (report_status in ('pending', 'review', 'ready', 'failed')),
  report_narrative jsonb,
  report_attempts integer not null default 0,
  report_reviewed_at timestamptz,
  report_ready_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create unique index if not exists module_assessments_entitlement_idx on public.module_assessments (entitlement_id);
create index if not exists module_assessments_user_idx on public.module_assessments (user_id);
create index if not exists module_assessments_queue_idx on public.module_assessments (report_status, completed_at)
  where status = 'completed';

-- 8. Regole di accesso: ognuno legge i propri dati, l'amministratore anche quelli della sua azienda,
-- lo staff tutto. Nessuna scrittura diretta dal browser.
alter table public.billing_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.invoice_counters enable row level security;
alter table public.invoices enable row level security;
alter table public.expert_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.module_assessments enable row level security;

drop policy if exists billing_select on public.billing_profiles;
create policy billing_select on public.billing_profiles for select to authenticated
  using (public.is_member(company_id) or public.is_staff());
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_company_admin(company_id) or public.is_staff());
drop policy if exists entitlements_select on public.entitlements;
create policy entitlements_select on public.entitlements for select to authenticated
  using (user_id = auth.uid() or public.is_company_admin(company_id) or public.is_staff());
drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices for select to authenticated
  using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
-- gli orari liberi sono visibili a chi ha effettuato l'accesso (senza dati di chi ha prenotato)
drop policy if exists slots_select on public.expert_slots;
create policy slots_select on public.expert_slots for select to authenticated
  using (starts_at > now() or public.is_staff());
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
drop policy if exists modules_select on public.module_assessments;
create policy modules_select on public.module_assessments for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

grant select on public.billing_profiles, public.orders, public.entitlements, public.invoices,
  public.expert_slots, public.bookings, public.module_assessments to authenticated;
revoke insert, update, delete on public.billing_profiles, public.orders, public.entitlements, public.invoices,
  public.expert_slots, public.bookings, public.module_assessments, public.invoice_counters from anon, authenticated;
revoke all on public.invoice_counters from anon, authenticated;
