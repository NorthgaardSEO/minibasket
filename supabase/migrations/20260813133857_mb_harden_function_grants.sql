-- Lukker fire huller hvor EXECUTE laa paa PUBLIC/anon.
-- Bemaerk: tidligere "revoke ... from anon" virkede ikke, fordi rettigheden
-- ogsaa laa paa PUBLIC. Derfor revokes der nu fra public FOERST, og der
-- grantes eksplicit til authenticated bagefter.

-- 1) Trigger-funktioner maa aldrig kunne kaldes via RPC.
-- PostgreSQL kraever ikke EXECUTE for at affyre en trigger, saa dette
-- paavirker ikke mb_coaches_protect_role eller mb_teams_autoassign.
revoke all on function public.mb_protect_role() from public, anon, authenticated;
revoke all on function public.mb_team_autoassign() from public, anon, authenticated;

-- 2) mb_create_team er SECURITY DEFINER og ubrugt af appen — luk for anon.
revoke all on function public.mb_create_team(text) from public, anon;
grant execute on function public.mb_create_team(text) to authenticated;

-- 3) mb_apply_rotations bruges af appen ("Balancer") — kun authenticated.
revoke all on function public.mb_apply_rotations(uuid[], jsonb) from public, anon;
grant execute on function public.mb_apply_rotations(uuid[], jsonb) to authenticated;
