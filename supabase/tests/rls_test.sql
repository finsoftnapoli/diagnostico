-- Prova delle regole di accesso: due aziende, un invito, un estraneo.
\set ON_ERROR_STOP on
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a', 'titolare@alfa.it'),
  ('00000000-0000-0000-0000-00000000000b', 'cfo@alfa.it'),
  ('00000000-0000-0000-0000-00000000000c', 'titolare@beta.it'),
  ('00000000-0000-0000-0000-0000000000ff', 'alessandro@finsoft.it');
insert into public.staff values ('00000000-0000-0000-0000-0000000000ff');

set role authenticated;

-- Titolare Alfa crea l'azienda e la sua compilazione
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select public.create_company('Alfa Meccanica', 'diretto') as alfa \gset
insert into public.assessments (company_id, user_id, questionnaire_version)
  values (:'alfa', auth.uid(), '0.2');
insert into public.invitations (company_id, email, assigned_areas, invited_by)
  values (:'alfa', 'cfo@alfa.it', array['FIN'], auth.uid()) returning token as tok \gset

-- Titolare Beta non vede nulla di Alfa
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select public.create_company('Beta Servizi') as beta \gset
do $$ begin
  assert (select count(*) from public.companies) = 1, 'Beta vede solo la propria azienda';
  assert (select count(*) from public.assessments) = 0, 'Beta non vede compilazioni di Alfa';
  assert (select count(*) from public.invitations) = 0, 'Beta non vede inviti di Alfa';
end $$;
-- Beta non può inserire compilazioni né inviti nell'azienda Alfa
select set_config('test.alfa', :'alfa', false);
do $$ begin
  insert into public.assessments (company_id, user_id, questionnaire_version)
    values (current_setting('test.alfa')::uuid, auth.uid(), '0.2');
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;
do $$ begin
  insert into public.invitations (company_id, email, invited_by)
    values (current_setting('test.alfa')::uuid, 'intruso@beta.it', auth.uid());
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;

-- Il CFO accetta l'invito e compila solo finanza
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select public.accept_invitation(:'tok');
insert into public.assessments (company_id, user_id, questionnaire_version, mode, assigned_areas)
  values (:'alfa', auth.uid(), '0.2', 'areas', array['FIN']);
do $$ begin
  assert (select count(*) from public.assessments) = 1, 'il CFO vede solo la propria compilazione';
  assert (select count(*) from public.company_members) = 2, 'il CFO vede i colleghi';
end $$;
-- il CFO non può marcare la compilazione come completata da solo
do $$ begin
  update public.assessments set status = 'completed';
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;
-- il CFO non può scrivere punteggi
do $$ begin
  insert into public.area_scores (assessment_id, area, score, engine_version)
    select id, 'FIN', 100, 'x' from public.assessments;
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;

-- Il titolare (amministratore) vede entrambe le compilazioni di Alfa
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  assert (select count(*) from public.assessments) = 2, 'l''amministratore vede le compilazioni dei colleghi';
end $$;

-- Un invito usato non vale una seconda volta
do $$ begin
  perform public.accept_invitation((select token from public.invitations limit 1));
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;

-- Lo staff Finsoft vede tutto
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ff';
do $$ begin
  assert (select count(*) from public.companies) = 2, 'lo staff vede tutte le aziende';
  assert (select count(*) from public.assessments) = 2, 'lo staff vede tutte le compilazioni';
end $$;

-- Le bozze non sono accessibili agli utenti, nemmeno collegati
reset role;
insert into public.drafts (email, responses, questionnaire_version) values ('titolare@alfa.it', '{}', '0.3');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  perform 1 from public.drafts;
  raise exception 'non doveva riuscire';
exception when insufficient_privilege then null;
end $$;
reset role;

-- Documenti: ognuno vede solo i propri, nessuno li scrive direttamente
reset role;
insert into public.documents (kind, storage_path, user_id) values
  ('visura', 'a/visura.pdf', '00000000-0000-0000-0000-00000000000a'),
  ('bilancio', 'c/bilancio.pdf', '00000000-0000-0000-0000-00000000000c');
insert into public.documents (kind, storage_path, created_at) values ('visura', 'orfano.pdf', now() - interval '40 days');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  assert (select count(*) from public.documents) = 1, 'il titolare Alfa vede solo i propri documenti';
end $$;
do $$ begin
  insert into public.documents (kind, storage_path) values ('visura', 'x.pdf');
  raise exception 'non doveva riuscire';
exception when others then
  if sqlerrm = 'non doveva riuscire' then raise; end if;
end $$;
do $$ begin
  perform public.documents_to_purge();
  raise exception 'non doveva riuscire';
exception when insufficient_privilege then null;
end $$;
-- i dati di un invito si leggono con il token, anche senza accesso
reset role;
select set_config('test.token', (select token::text from public.invitations limit 1), false);
set role anon;
do $$ begin
  assert (select company_name from public.invitation_info(current_setting('test.token')::uuid)) = 'Alfa Meccanica', 'info invito leggibile con il token';
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.documents_to_purge()) = 1, 'solo il documento orfano da 40 giorni va eliminato';
end $$;

-- Un utente anonimo non vede nulla
reset role;
set role anon;
do $$ begin
  perform 1 from public.companies;
  raise exception 'non doveva riuscire';
exception when insufficient_privilege then null;
end $$;
reset role;
select 'TUTTI I CONTROLLI SUPERATI' as esito;
