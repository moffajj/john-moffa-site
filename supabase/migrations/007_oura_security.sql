-- Keep Oura credentials private. The application accesses these tables only
-- with the server-side service role; anon/authenticated clients receive no policy.

create table if not exists public.oura_users (
  user_id text primary key,
  display_name text not null,
  token_ciphertext text,
  updated_at timestamptz not null default now()
);

create table if not exists public.oura_stats (
  user_id text not null,
  day date not null,
  readiness_score numeric,
  sleep_id text,
  sleep_score numeric,
  temperature_deviation numeric,
  activity_score numeric,
  steps integer,
  active_calories numeric,
  total_calories numeric,
  stress_high numeric,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.oura_users add column if not exists token_ciphertext text;
alter table public.oura_users enable row level security;
alter table public.oura_users force row level security;
alter table public.oura_stats enable row level security;
alter table public.oura_stats force row level security;

revoke all on table public.oura_users from anon, authenticated;
revoke all on table public.oura_stats from anon, authenticated;

-- Remove legacy plaintext credentials. Existing members must submit their token
-- once more so the application can store an encrypted replacement.
alter table public.oura_users drop column if exists oura_pat;
