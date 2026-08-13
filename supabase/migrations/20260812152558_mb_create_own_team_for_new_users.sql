-- Lader enhver logget-ind bruger oprette SIT EGET hold (og kun det):
-- opretter holdet, kobler brugeren til det, og laver en første kamp.
-- SECURITY DEFINER så RLS (kun-admin på mb_teams/mb_coach_teams) ikke skal løsnes bredt.
create or replace function public.mb_create_own_team(team_name text default 'Mit hold')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into mb_teams (name, sort)
    values (coalesce(nullif(trim(team_name), ''), 'Mit hold'), 0)
    returning id into tid;
  insert into mb_coach_teams (coach_id, team_id)
    values (auth.uid(), tid);
  insert into mb_sessions (team_id, name, sort, game_date)
    values (tid, 'Kamp 1', 0, current_date);
  return tid;
end;
$$;

revoke execute on function public.mb_create_own_team(text) from public, anon;
grant execute on function public.mb_create_own_team(text) to authenticated;
