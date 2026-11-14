-- Agenda consulenze: calendari esterni collegati (Google, Outlook, Apple, qualunque link ICS) e link del calendario delle prenotazioni.
-- Scrive e legge solo il server. Degli eventi si conservano solo gli orari occupati, mai titoli o partecipanti.

-- 1. Calendari da cui leggere gli orari occupati
create table if not exists public.calendar_feeds (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  url text not null check (char_length(url) <= 2000 and url like 'https://%'),
  last_synced_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 300),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.calendar_feeds enable row level security;
revoke all on public.calendar_feeds from anon, authenticated;

-- 2. Orari occupati letti dai calendari (si rinnovano a ogni aggiornamento)
create table if not exists public.calendar_busy (
  id bigint generated always as identity primary key,
  feed_id uuid not null references public.calendar_feeds (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at)
);
create index if not exists calendar_busy_range_idx on public.calendar_busy (starts_at, ends_at);
create index if not exists calendar_busy_feed_idx on public.calendar_busy (feed_id);
alter table public.calendar_busy enable row level security;
revoke all on public.calendar_busy from anon, authenticated;

-- 3. Impostazioni dell'agenda (una riga per chiave): oggi solo il codice del link del calendario delle prenotazioni
create table if not exists public.agenda_settings (
  key text primary key check (char_length(key) <= 40),
  value text not null check (char_length(value) <= 200),
  updated_at timestamptz not null default now()
);
alter table public.agenda_settings enable row level security;
revoke all on public.agenda_settings from anon, authenticated;
