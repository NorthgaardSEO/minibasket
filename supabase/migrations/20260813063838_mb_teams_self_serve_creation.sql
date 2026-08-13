-- Alle autentificerede trænere kan oprette hold
create policy mb_teams_insert_any on public.mb_teams
  for insert to authenticated
  with check (true);

-- Holdmedlemmer kan opdatere deres egne hold (navn/farver)
create policy mb_teams_member_update on public.mb_teams
  for update to authenticated
  using (public.mb_has_team(id))
  with check (public.mb_has_team(id));

-- Auto-tilknyt opretteren til det nye hold
create or replace function public.mb_team_autoassign()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is not null then
    insert into public.mb_coach_teams (coach_id, team_id)
    values (auth.uid(), new.id)
    on conflict do nothing;
  end if;
  return new;
end
$$;

drop trigger if exists mb_teams_autoassign on public.mb_teams;
create trigger mb_teams_autoassign
  after insert on public.mb_teams
  for each row execute function public.mb_team_autoassign();
