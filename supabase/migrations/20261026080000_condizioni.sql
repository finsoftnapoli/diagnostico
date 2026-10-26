-- Accettazione delle condizioni di vendita registrata con ogni ordine.
alter table public.orders add column if not exists terms_version text;
alter table public.orders add column if not exists terms_accepted_at timestamptz;

-- Orari dell'esperto: chi ha effettuato l'accesso vede data, durata e stato, non il collegamento
-- alla videochiamata (che arriva solo a chi prenota).
revoke select on public.expert_slots from authenticated;
grant select (id, starts_at, duration_min, status) on public.expert_slots to authenticated;
