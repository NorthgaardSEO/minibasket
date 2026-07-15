# Mini Basket — rotationsplanlægger (PWA)

Fair spilletid, planlagt fra lommen. Progressiv webapp (vanilla JS, ingen build-step)
med **Supabase som backend** — data deles live mellem alle trænere på holdet.

Live: **https://minibasket.vercel.app**

## Arkitektur

- **Frontend:** statisk PWA — `index.html` (markup + CSS), `app.js` (al logik), `sw.js` (offline-cache af egne assets). Ingen framework, ingen build.
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
  - **RPC:** `mb_apply_rotations(p_session_ids, p_rows)` — atomisk delete+insert af rotationer, bruges af "Balancér".
- **Sync:** let polling (hvert 9. sekund) + refresh ved tab-fokus. `game_date` grupperer flere kampe på samme dag, så spilletid balanceres på tværs.
- **Nøgler i klienten:** kun Supabase URL + publishable key (sikkerheden ligger i RLS, ikke i nøglen).

## Filer

```
index.html      markup + al CSS (inline <style>)
app.js          al app-logik (auth, data, render, ur, admin)
sw.js           service worker — cacher kun egne assets, offline-fallback for navigationer
manifest.json   PWA-manifest (installérbar på hjemmeskærm)
icon.svg        app-ikon
vercel.json     Vercel-konfig: cleanUrls, cache- og sikkerhedsheaders (CSP m.m.)
```

## Deploy

Modellen: **denne mappe → GitHub → Vercel**. Hvert push til `main` deployer automatisk.

### Uden terminal (GitHub web upload)

1. Gå til dit repo på github.com → **Add file → Upload files**.
2. Træk de ændrede filer ind → skriv en kort besked → **Commit changes**.
3. Vercel bygger og publicerer automatisk efter få sekunder.

### Med Vercel CLI

```bash
cd minibasket-app
npx vercel deploy --prod
```

## Vigtigt at vide

- **Supabase Auth-URL'er** (redirect-allowlist) kan kun ændres i Supabase-dashboardet
  (Authentication → URL Configuration) — husk det hvis appen flytter domæne.
- **Service worker-cache:** bump `CACHE`-navnet i `sw.js` (fx `minibasket-v10`) når du
  ændrer assets, så alle klienter henter ny version.
- **CSP:** loader du nyt eksternt (script/font/API), skal `Content-Security-Policy`
  i `vercel.json` udvides tilsvarende — ellers blokerer browseren det.
- **MobilePay:** kaffelinket (`MOBILEPAY_LINK` øverst i `app.js`) peger på en MobilePay Box;
  beløbet vælges af giveren i MobilePay.
