-- Meus Atendimentos: tabelas e regras de segurança.
-- Cole no Supabase em SQL Editor e clique em Run. Pode rodar mais de uma vez.

create table if not exists public.entries (
  id         text primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date       date not null,
  client     text not null,
  proc       text not null,
  cents      integer not null check (cents > 0),
  created_at timestamptz not null default now()
);

create index if not exists entries_user_date_idx on public.entries (user_id, date);

create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name    text not null default '',
  procs   jsonb
);

-- Cada pessoa só enxerga e altera os próprios dados.
alter table public.entries enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "entries: dono" on public.entries;
create policy "entries: dono" on public.entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "settings: dono" on public.user_settings;
create policy "settings: dono" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Só quem está logado acessa as tabelas pela API.
grant select, insert, update, delete on public.entries to authenticated;
grant select, insert, update, delete on public.user_settings to authenticated;
