create table if not exists public.mb_coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'coach' check (role in ('coach','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.mb_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.mb_coach_teams (
  coach_id uuid not null references public.mb_coaches(id) on delete cascade,
  team_id uuid not null references public.mb_teams(id) on delete cascade,
  primary key (coach_id, team_id)
);

create table if not exists public.mb_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.mb_teams(id) on delete cascade,
  name text not null,
  number text,
  role text,
  injured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.mb_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.mb_teams(id) on delete cascade,
  name text not null,
  periods int not null default 6,
  oncourt int not null default 4,
  locked boolean not null default false,
  score_us int not null default 0,
  score_them int not null default 0,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.mb_rotations (
  session_id uuid not null references public.mb_sessions(id) on delete cascade,
  player_id uuid not null references public.mb_players(id) on delete cascade,
  period int not null,
  role text,
  primary key (session_id, player_id, period)
);

create table if not exists public.mb_logs (
  id bigint generated always as identity primary key,
  team_id uuid,
  session_id uuid,
  coach_id uuid,
  coach_name text,
  action text,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists mb_players_team_idx on public.mb_players(team_id);
create index if not exists mb_sessions_team_idx on public.mb_sessions(team_id);
create index if not exists mb_rotations_session_idx on public.mb_rotations(session_id);
create index if not exists mb_logs_team_idx on public.mb_logs(team_id, created_at desc);
