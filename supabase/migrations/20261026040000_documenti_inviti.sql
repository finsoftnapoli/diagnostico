-- Archivio dei documenti caricati (visura, bilancio) e dati aggiuntivi per gli inviti ai colleghi.

-- Archivio privato dei file: accessibile solo dal server con la chiave di servizio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documenti', 'documenti', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create table public.documents (
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
create index on public.documents (user_id);
create index on public.documents (company_id);

alter table public.documents enable row level security;
-- ognuno vede i propri documenti; lo staff tutti. Inserimenti e cancellazioni solo dal server.
create policy documents_select on public.documents for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
grant select on public.documents to authenticated;
revoke insert, update, delete on public.documents from anon, authenticated;

-- Inviti: nome e ruolo indicati da chi invita, data di invio dell'email.
alter table public.invitations add column invitee_name text;
alter table public.invitations add column invitee_role text;
alter table public.invitations add column sent_at timestamptz;

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
