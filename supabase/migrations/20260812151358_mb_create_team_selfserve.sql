create or replace function public.mb_create_team(p_name text)
returns public.mb_teams
language plpgsql security definer set search_path to 'public'
as $$
declare t public.mb_teams;
begin
  if auth.uid() is null then
    raise exception 'Ikke logget ind';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Holdnavn mangler';
  end if;
  insert into public.mb_teams (name) values (trim(p_name)) returning * into t;
  insert into public.mb_coach_teams (coach_id, team_id) values (auth.uid(), t.id)
    on conflict do nothing;
  insert into public.mb_sessions (team_id, name, sort, game_date)
    values (t.id, 'Kamp 1', 0, current_date);
  return t;
end $$;

revoke all on function public.mb_create_team(text) from public;
grant execute on function public.mb_create_team(text) to authenticated;
