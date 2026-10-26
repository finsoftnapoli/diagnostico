-- Email di chi compila, per l'area riservata e il contatto (la fonte resta auth.users).
alter table public.assessments add column if not exists respondent_email text;
