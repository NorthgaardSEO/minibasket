-- Trigger functions must not be callable via RPC
revoke all on function public.mb_bootstrap_admin() from public, anon, authenticated;
revoke all on function public.mb_guard_role() from public, anon, authenticated;
-- RLS helpers: keep executable only for authenticated (used inside policies), not anon
revoke all on function public.mb_is_admin() from public, anon;
revoke all on function public.mb_has_team(uuid) from public, anon;
grant execute on function public.mb_is_admin() to authenticated;
grant execute on function public.mb_has_team(uuid) to authenticated;
