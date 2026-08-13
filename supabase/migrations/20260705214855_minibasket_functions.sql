create or replace function public.mb_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.mb_coaches where id = auth.uid() and role = 'admin');
$$;

create or replace function public.mb_has_team(p_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.mb_is_admin() or exists(
    select 1 from public.mb_coach_teams where coach_id = auth.uid() and team_id = p_team
  );
$$;

-- First coach ever created becomes admin automatically
create or replace function public.mb_bootstrap_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.mb_coaches where role = 'admin') then
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists mb_coaches_bootstrap on public.mb_coaches;
create trigger mb_coaches_bootstrap before insert on public.mb_coaches
  for each row execute function public.mb_bootstrap_admin();

-- Prevent non-admins from changing their own role
create or replace function public.mb_guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.mb_is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists mb_coaches_guard_role on public.mb_coaches;
create trigger mb_coaches_guard_role before update on public.mb_coaches
  for each row execute function public.mb_guard_role();
