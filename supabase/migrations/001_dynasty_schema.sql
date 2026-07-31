-- Dynasty Fantasy Football schema
-- Run this against your Supabase project via the SQL editor or psql.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  role      text not null default 'manager' check (role in ('manager', 'commissioner')),
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete set null,
  name       text not null,
  team_code  text not null unique,
  draft_cap  integer not null default 200,
  fa_budget  integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  position   text not null,
  nfl_team   text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id                          uuid primary key default gen_random_uuid(),
  player_id                   uuid not null references public.players(id) on delete cascade,
  team_id                     uuid not null references public.teams(id) on delete cascade,
  start_year                  integer not null,
  length                      integer not null check (length between 1 and 4),
  salary_by_year              integer[] not null,
  origin                      text not null check (origin in ('free_agent', 'extension')),
  status                      text not null default 'active' check (status in ('active', 'expired', 'cut')),
  extended_from_contract_id   uuid references public.contracts(id) on delete set null,
  created_at                  timestamptz not null default now()
);

create table if not exists public.cut_penalties (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid not null references public.contracts(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete cascade,
  year_applied integer not null,
  amount       numeric(10,2) not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.team_history (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references public.players(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  year_start integer not null,
  year_end   integer,
  created_at timestamptz not null default now()
);

-- ── Helper functions ─────────────────────────────────────────────────────────

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_user_team_id()
returns uuid
language sql
security definer
stable
as $$
  select id from public.teams where user_id = auth.uid()
$$;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.users          enable row level security;
alter table public.teams          enable row level security;
alter table public.players        enable row level security;
alter table public.contracts      enable row level security;
alter table public.cut_penalties  enable row level security;
alter table public.team_history   enable row level security;

-- users: read/update own row; commissioner reads all
create policy "users_select" on public.users
  for select using (id = auth.uid() or public.current_user_role() = 'commissioner');
create policy "users_insert" on public.users
  for insert with check (id = auth.uid());
create policy "users_update" on public.users
  for update using (id = auth.uid());

-- teams: manager sees/edits own; commissioner sees/edits all
create policy "teams_select" on public.teams
  for select using (user_id = auth.uid() or public.current_user_role() = 'commissioner');
create policy "teams_update" on public.teams
  for update using (user_id = auth.uid() or public.current_user_role() = 'commissioner');
create policy "teams_insert" on public.teams
  for insert with check (public.current_user_role() = 'commissioner');

-- players: anyone authenticated can read; only commissioner inserts
create policy "players_select" on public.players
  for select using (auth.uid() is not null);
create policy "players_insert" on public.players
  for insert with check (public.current_user_role() = 'commissioner');

-- contracts: manager sees/writes own team; commissioner sees/writes all
create policy "contracts_select" on public.contracts
  for select using (
    team_id = public.current_user_team_id() or public.current_user_role() = 'commissioner'
  );
create policy "contracts_insert" on public.contracts
  for insert with check (
    team_id = public.current_user_team_id() or public.current_user_role() = 'commissioner'
  );
create policy "contracts_update" on public.contracts
  for update using (
    team_id = public.current_user_team_id() or public.current_user_role() = 'commissioner'
  );

-- cut_penalties: manager sees/writes own team; commissioner sees/writes all
create policy "cut_penalties_select" on public.cut_penalties
  for select using (
    team_id = public.current_user_team_id() or public.current_user_role() = 'commissioner'
  );
create policy "cut_penalties_insert" on public.cut_penalties
  for insert with check (
    team_id = public.current_user_team_id() or public.current_user_role() = 'commissioner'
  );

-- team_history: anyone authenticated can read; commissioner inserts
create policy "team_history_select" on public.team_history
  for select using (auth.uid() is not null);
create policy "team_history_insert" on public.team_history
  for insert with check (public.current_user_role() = 'commissioner');

-- ── Auth trigger: auto-create users row on signup ────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'manager')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
