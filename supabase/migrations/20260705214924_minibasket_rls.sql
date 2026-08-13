alter table public.mb_coaches enable row level security;
alter table public.mb_teams enable row level security;
alter table public.mb_coach_teams enable row level security;
alter table public.mb_players enable row level security;
alter table public.mb_sessions enable row level security;
alter table public.mb_rotations enable row level security;
alter table public.mb_logs enable row level security;

-- COACHES
drop policy if exists mb_coaches_select on public.mb_coaches;
create policy mb_coaches_select on public.mb_coaches for select to authenticated
  using (id = auth.uid() or public.mb_is_admin());
drop policy if exists mb_coaches_insert_self on public.mb_coaches;
create policy mb_coaches_insert_self on public.mb_coaches for insert to authenticated
  with check (id = auth.uid());
drop policy if exists mb_coaches_update on public.mb_coaches;
create policy mb_coaches_update on public.mb_coaches for update to authenticated
  using (id = auth.uid() or public.mb_is_admin())
  with check (id = auth.uid() or public.mb_is_admin());
drop policy if exists mb_coaches_delete_admin on public.mb_coaches;
create policy mb_coaches_delete_admin on public.mb_coaches for delete to authenticated
  using (public.mb_is_admin());

-- TEAMS
drop policy if exists mb_teams_select on public.mb_teams;
create policy mb_teams_select on public.mb_teams for select to authenticated
  using (public.mb_has_team(id));
drop policy if exists mb_teams_admin on public.mb_teams;
create policy mb_teams_admin on public.mb_teams for all to authenticated
  using (public.mb_is_admin()) with check (public.mb_is_admin());

-- COACH_TEAMS
drop policy if exists mb_coach_teams_select on public.mb_coach_teams;
create policy mb_coach_teams_select on public.mb_coach_teams for select to authenticated
  using (coach_id = auth.uid() or public.mb_is_admin());
drop policy if exists mb_coach_teams_admin on public.mb_coach_teams;
create policy mb_coach_teams_admin on public.mb_coach_teams for all to authenticated
  using (public.mb_is_admin()) with check (public.mb_is_admin());

-- PLAYERS
drop policy if exists mb_players_rw on public.mb_players;
create policy mb_players_rw on public.mb_players for all to authenticated
  using (public.mb_has_team(team_id)) with check (public.mb_has_team(team_id));

-- SESSIONS
drop policy if exists mb_sessions_rw on public.mb_sessions;
create policy mb_sessions_rw on public.mb_sessions for all to authenticated
  using (public.mb_has_team(team_id)) with check (public.mb_has_team(team_id));

-- ROTATIONS
drop policy if exists mb_rotations_rw on public.mb_rotations;
create policy mb_rotations_rw on public.mb_rotations for all to authenticated
  using (exists(select 1 from public.mb_sessions s where s.id = session_id and public.mb_has_team(s.team_id)))
  with check (exists(select 1 from public.mb_sessions s where s.id = session_id and public.mb_has_team(s.team_id)));

-- LOGS (admin-only read)
drop policy if exists mb_logs_select_admin on public.mb_logs;
create policy mb_logs_select_admin on public.mb_logs for select to authenticated
  using (public.mb_is_admin());
drop policy if exists mb_logs_insert on public.mb_logs;
create policy mb_logs_insert on public.mb_logs for insert to authenticated
  with check (team_id is null or public.mb_has_team(team_id));

-- Grants (RLS still gates row access)
grant select, insert, update, delete on
  public.mb_coaches, public.mb_teams, public.mb_coach_teams,
  public.mb_players, public.mb_sessions, public.mb_rotations, public.mb_logs
  to authenticated;
grant usage, select on all sequences in schema public to authenticated;
