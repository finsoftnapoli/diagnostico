-- Segnalazione del controllo di sicurezza di Supabase: la funzione che aggiorna «updated_at» non fissava il percorso di ricerca.
-- Non cambia il comportamento; è rieseguibile.
alter function public.touch_updated_at() set search_path = '';
