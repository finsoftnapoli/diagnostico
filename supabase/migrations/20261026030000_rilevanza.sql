-- Dalla v0.3 l'importanza non si chiede più: si registra la rilevanza calcolata dal motore.
alter table public.area_scores add column if not exists relevance numeric(5, 3);
comment on column public.area_scores.importance is 'Solo compilazioni v0.2: importanza dichiarata (1-3)';
