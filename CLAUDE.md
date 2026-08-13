# Mini Basket — projektguide til Claude

## Hvad projektet er
Gratis værktøj til børnebasket-trænere (U6–U12): content-site på **minibasket.dk** + PWA-app på **minibasket.dk/app/** der styrer fair spilletid/rotation. Forretningsmål: organisk trafik fra danske trænere → app-brugere.

## Mappestruktur
- `site/` — Astro-site (deployes af Vercel; Root Directory = `site`)
  - `site/src/content/ovelser/` — 13 basketøvelser (markdown)
  - `site/src/content/guides/` — 5 trænerguides (markdown)
  - `site/public/app/` — **PWA'en der faktisk serveres** (app.js, index.html, sw.js)
- `site/public/app/` er **den eneste** kopi af PWA'en. Dubletterne i repo-roden og i `minibasket-app/` er slettet (13/8-26) — de drev ud af sync. Ældre dokumenter i `docs/` nævner dem stadig; det er historik
- `docs/` — `HANDOFF.md`, `SEO-PLAN.md`, `SEO-GEO-STRUKTUR.md`, `REVIEW-*.md`, `DESIGN-BRIEF.md`
- `supabase/migrations/` — mb-skemaet versioneret (se `supabase/README.md`)

## Arbejdsmappe = git-klon
Den lokale projektmappe **er** en klon af `NorthgaardSEO/minibasket` (remote `origin`,
branch `main`). Ret filer direkte her og `git push` — ingen kopiering, ingen web-upload.
Remote-URL'en har brugernavnet indlejret (`https://NorthgaardSEO@github.com/...`), fordi
Windows Credential Manager ellers rammer den forkerte GitHub-konto (`belimaapp`).

## Deploy
- GitHub: `NorthgaardSEO/minibasket` (main) → Vercel auto-deploy (~30-60 s)
- Vercel: team **Freds** (northgaard@gmail.com), projekt `minibasket`, Root Directory = `site`
- **Ved ændringer i appen:** ret filer i `site/public/app/`, bump cache-version i `sw.js` (`minibasket-vN` → vN+1), commit + push
- Verificér efter deploy: `curl -s https://minibasket.dk/app/sw.js | grep minibasket-v`
- Test lokalt: `cd site && npm install && npx astro build`

## Backend (Supabase)
- Projekt `bemngqxfwunfihvfgkrt`, tabeller med prefix `mb_` (RLS på alle)
- Roller: `mb_coaches.role` = admin/coach. northgaard@gmail.com = admin, northgaard@hotmail.com = coach
- Self-serve: alle authenticated kan oprette hold (policy `mb_teams_insert_any`); trigger `mb_teams_autoassign` tilknytter opretteren; alt andet kører via `mb_has_team()`
- Rolle-ændringer blokeres af trigger `mb_coaches_protect_role` (kun admin, eller DISABLE TRIGGER)
- **OBS: projektet er delt med flere ubeslægtede apps** (sisu-rotation, madplan, dashboard, vault/DMS). Kun `mb_`-objekter tilhører Mini Basket — rør ikke resten, og kør ALDRIG `supabase db reset`
- Skemaændringer: kør dem i Supabase, læg derefter samme SQL i `supabase/migrations/` og commit

## Domæne & DNS
- minibasket.dk hos Simply.com (konto S377944); A-records → 216.198.79.1 (Vercel); mail = Simply (MX/SPF/DKIM urørt)
- vercel.app-aliasser 308-redirecter til minibasket.dk

## SEO-status (aug 2026)
- Teknik OK (sitemap, robots.txt m. AI-crawlere, schema, canonical)
- **Mangler: Google Search Console-property + sitemap-indsendelse, og første backlinks (0 pt.)** — vigtigste vækstopgave
- Keyword-fokus: trænere ("basketball øvelser børn", "spilletid børnebasket") — IKKE "minibasket" (domineret af webshops)

## Konventioner
- Alt indhold på dansk; tone: hjælpsom træner-til-træner
- Commit-beskeder på dansk, uden æ/ø/å i selve beskeden (fx "oevelser" i stedet for "øvelser")
- Husk altid både produkt- OG forretnings-/marketingvinklen ved ændringer
