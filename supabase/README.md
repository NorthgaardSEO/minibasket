# Supabase — Mini Basket

Projekt: `bemngqxfwunfihvfgkrt` (region eu-west-1).

## VIGTIGT: delt projekt
Dette Supabase-projekt hostes sammen med flere ubeslaegtede apps
(sisu-rotation, madplan, dashboard, vault/DMS m.fl.). **Kun tabeller og
funktioner med praefikset `mb_` tilhoerer Mini Basket** — roer ikke resten.

Derfor ligger her kun de migrationer der vedroerer `mb_`-objekter. Mappen er
en *afspejling* af det der allerede er koert i produktion — den er tilfoejet
for at have skemaet versioneret i git, ikke for at koere `supabase db reset`
(det ville ramme de andre apps).

## Ved skemaaendringer
1. Koer aendringen i Supabase (dashboard eller `apply_migration`)
2. Laeg den tilsvarende `.sql` her med samme timestamp-navn
3. Commit sammen med den app-kode der bruger den

## Oversigt over mb-objekter
- Tabeller: `mb_coaches`, `mb_teams`, `mb_coach_teams`, `mb_players`,
  `mb_sessions`, `mb_rotations`, `mb_logs` — RLS aktiv paa alle
- Adgangsstyring: `mb_is_admin()` / `mb_has_team()` bruges i alle policies
- Self-serve: `mb_teams_insert_any` + trigger `mb_teams_autoassign`
- Sikkerhed: trigger `mb_coaches_protect_role` blokerer rolle-eskalering
