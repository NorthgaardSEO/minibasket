# Mini Basket

Gratis værktøj til børnebasket-trænere (U6–U12):

- **Content-site** på [minibasket.dk](https://minibasket.dk) — basketøvelser og trænerguides
- **PWA-app** på [minibasket.dk/app/](https://minibasket.dk/app/) — styr på spilletid og rotation

## Struktur

```
site/                   Astro-site — det der deployes (Vercel Root Directory = site)
  src/content/ovelser/    13 basketøvelser (markdown)
  src/content/guides/     5 trænerguides (markdown)
  public/app/             PWA'en — den eneste kopi, serveres som /app/
  vercel.json             headers, cache-politik, trailingSlash
supabase/migrations/    mb-skemaet versioneret (se supabase/README.md)
docs/                   planer, reviews, SEO-strategi, handoff
```

`site/public/app/` er **den eneste** kopi af PWA'en. Tidligere lå der dubletter i
repo-roden og i `minibasket-app/`; de er fjernet, fordi de drev ud af sync.

## Appen — arkitektur

- **Frontend:** statisk PWA — `index.html` (markup + CSS), `app.js` (al logik),
  `sw.js` (offline-cache af egne assets). Ingen framework, ingen build.
- **Backend:** Supabase (projekt `bemngqxfwunfihvfgkrt`):
  - **Auth:** email/adgangskode via Supabase Auth (signup, login, glemt kode). Roller: `coach` og `admin`.
  - **Tabeller** (alle med `mb_`-præfiks og Row Level Security):
    - `mb_coaches` — trænerprofiler (rolle-eskalering er blokeret af DB-trigger)
    - `mb_teams` — hold inkl. holdfarver
    - `mb_coach_teams` — hvilke trænere er tilknyttet hvilke hold
    - `mb_players` — trup (navn, nummer, rolle D/S, skadet)
    - `mb_sessions` — kampe (perioder, på banen, score, lås, `game_date`)
    - `mb_rotations` — hvem spiller hvilken periode (D/S)
    - `mb_logs` — aktivitetslog (kun admin kan læse)
  - **RPC:** `mb_apply_rotations(p_session_ids, p_rows)` — atomisk delete+insert af
    rotationer, bruges af "Balancér".
  - **Self-serve:** alle authenticated kan oprette hold; trigger `mb_teams_autoassign`
    tilknytter opretteren automatisk.
- **Sync:** let polling (hvert 9. sekund) + refresh ved tab-fokus. `game_date` grupperer
  flere kampe på samme dag, så spilletid balanceres på tværs.
- **Nøgler i klienten:** kun Supabase URL + publishable key (sikkerheden ligger i RLS,
  ikke i nøglen).

## Udvikling og deploy

Denne mappe er en klon af repoet. Ret filer, commit, push — Vercel deployer
automatisk fra `main` på ~30–60 sekunder.

```bash
# byg sitet lokalt
cd site && npm install && npx astro build

# deploy
git add -A && git commit -m "..." && git push

# verificér
curl -s https://minibasket.dk/app/sw.js | grep minibasket-v
```

## Vigtigt at vide

- **Ved ændringer i appen:** bump `CACHE`-navnet i `site/public/app/sw.js`
  (`minibasket-vN` → `vN+1`), ellers henter installerede klienter ikke den nye version.
- **CSP:** loader du nyt eksternt (script/font/API), skal `Content-Security-Policy`
  i `site/vercel.json` udvides tilsvarende — ellers blokerer browseren det.
- **Supabase Auth-URL'er** (redirect-allowlist) kan kun ændres i Supabase-dashboardet
  (Authentication → URL Configuration) — husk det hvis appen flytter domæne.
- **Supabase-projektet deles med andre apps.** Kun `mb_`-objekter tilhører Mini Basket.
  Kør aldrig `supabase db reset`.
- **MobilePay:** kaffelinket (`MOBILEPAY_LINK` øverst i `app.js`) peger på en MobilePay Box;
  beløbet vælges af giveren i MobilePay.
