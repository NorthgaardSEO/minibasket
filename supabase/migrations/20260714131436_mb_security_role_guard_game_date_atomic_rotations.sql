-- 1) Bloker rolle-eskalering på mb_coaches
create or replace function public.mb_protect_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.role is distinct from 'coach' and not mb_is_admin() then
      new.role := 'coach';
    end if;
  else
    if new.role is distinct from old.role and not mb_is_admin() then
      raise exception 'Kun admin kan aendre roller';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists mb_coaches_protect_role on public.mb_coaches;
create trigger mb_coaches_protect_role
before insert or update on public.mb_coaches
for each row execute function public.mb_protect_role();

-- 2) game_date på mb_sessions (backfill fra created_at, default = i dag)
alter table public.mb_sessions add column if not exists game_date date;
update public.mb_sessions set game_date = created_at::date where game_date is null;
alter table public.mb_sessions alter column game_date set default current_date;

-- 3) Atomisk delete+insert af rotationer (fix for datatab ved netværksfejl)
create or replace function public.mb_apply_rotations(p_session_ids uuid[], p_rows jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.mb_rotations where session_id = any(p_session_ids);
  insert into public.mb_rotations(session_id, player_id, period, role)
  select (r->>'session_id')::uuid, (r->>'player_id')::uuid, (r->>'period')::int, r->>'role'
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as r;
end
$$;

revoke execute on function public.mb_apply_rotations(uuid[], jsonb) from anon;
