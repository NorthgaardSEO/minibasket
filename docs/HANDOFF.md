# Mini Basket — status & overdragelse

_Opdateret 13. august 2026_

## Sådan fortsætter du
Åbn Claude Code i projektmappen (`claude` i `Mini Basket app`). `CLAUDE.md` i roden
læses automatisk og indeholder hele setup'et. Denne fil er status og næste skridt.

## Hvad projektet er
1. **Content-site** på **minibasket.dk** — Astro, 26 sider: forside, 13 basketøvelser,
   5 trænerguides, /basketball-regler/, /boldspil-idraet/, /basketball-for-boern/, /om/, /stoet/.
2. **PWA-appen** på **minibasket.dk/app/** — fair spilletid/rotation til børnebasket-trænere.
   Champagne/Onyx Gold-design, gratis, MobilePay-kaffedonation.

Forretningsmål: organisk trafik fra danske trænere → app-brugere.

## Teknik (alt er nu ét sted)
- **Repo:** `NorthgaardSEO/minibasket` (main) → Vercel auto-deploy, ~30-60 s.
- **Lokal mappe = git-klon.** Ret filer, `git push`, færdig. Ingen web-upload længere.
- **Vercel:** team **Freds**, projekt `minibasket`, Root Directory = `site`. Mappen er
  linket med `vercel link` (`.vercel/` er gitignoreret).
- **Supabase:** `bemngqxfwunfihvfgkrt`, `mb_`-tabeller med RLS. Skemaet er nu versioneret
  i `supabase/migrations/` (9 migrationer).
- **DNS:** minibasket.dk ligger hos **Simply.com** (konto S377944) med A-records →
  216.198.79.1. Nameservere er *ikke* flyttet til Vercel. Mail (MX/SPF/DKIM) = Simply.

## Senest gjort (13. august 2026)
- **App v13 deployet**: "Admin"-fanen hedder nu **"Hold"** og er synlig for alle trænere
  (ikke kun admins); Trænere-sektionen er fortsat admin-only. Første-gangs onboarding
  opretter hold + kamp for enhver ny træner. sw v12 → v13. Verificeret live.
- **Repoet samlet**: den lokale mappe er konverteret til en rigtig klon; dokumenterne
  ligger nu kun i `docs/`; `CLAUDE.md` og `SEO-GEO-STRUKTUR.md` er lagt i repoet.
- **Dubletter fjernet**: `minibasket-app/` og de forældede `app.js`/`index.html`/`sw.js`/
  `manifest.json`/`icon.svg`/`vercel.json`/`.nojekyll` i repo-roden er slettet. De var
  drevet ud af sync (roden lå på sw v9 mod v13 live). **`site/public/app/` er nu den
  eneste kopi af PWA'en.**
- **Supabase-skemaet versioneret**: de 9 mb-migrationer hentet fra produktion til
  `supabase/migrations/`. Se `supabase/README.md`.
- **README.md** skrevet om til at beskrive det faktiske repo.
- **Sikkerhedshul lukket** (migration `20260813133857_mb_harden_function_grants`):
  `mb_team_autoassign()`, `mb_protect_role()`, `mb_create_team()` og `mb_apply_rotations()`
  kunne alle kaldes af `anon` via `/rest/v1/rpc/`. Årsagen var, at de tidligere
  `revoke ... from anon` ikke virkede — rettigheden lå også på `PUBLIC`, som aldrig blev
  revoked. Nu revokes fra `public` først, og der grantes eksplicit til `authenticated`.
  Trigger-affyring er verificeret uændret bagefter.

## Historik
- **15/7-26**: site + /app/ gik live. Onyx Gold-design (se `DESIGN-BRIEF.md`).
  Al "retfærdig/fortjener"-framing fjernet — tonen er "nemt", "ingen spiller for meget".
  H1: "Nemt styr på spilletiden." SEO implementeret efter `SEO-PLAN.md`.
- **14/7-26**: minibasket.dk købt; app-fixes deployet (game_date, atomisk RPC,
  timestamp-baseret kampur + wake lock, sikkerhedsheaders/CSP); reviews skrevet
  (`REVIEW-ARKITEKTUR.md`, `REVIEW-KODE.md`); DB-trigger mod rolle-eskalering.

## Næste skridt — vigtigst først
1. **Google Search Console**: property er endnu ikke oprettet. Planen er at verificere
   via metoden **"Google Analytics"**, som nu er mulig fordi GA4 (`G-D0DGSKQYCW`) er
   installeret på alle 26 sider. Kræver at samme Google-konto har Edit-adgang til
   GA4-propertyen. Derefter indsendes `https://minibasket.dk/sitemap-index.xml`.
   Intet SEO-arbejde kan måles før det er på plads.
   Alternativ hvis GA-metoden driller: `GOOGLE_SITE_VERIFICATION` i `site/src/lib/site.ts`
   er klar til HTML-tag-metoden — indsæt token, push, verificér.
2. **Første backlinks (0 pt. i dag)**. Den største vækstbegrænsning. Oplagte: DBBF/
   lokale klubber, trænerfora, Facebook-grupper for børnetrænere.
3. **Cookie-banner** — GA4 er nu installeret (se nedenfor), og det sætter cookies.
   Et samtykke-banner er påkrævet efter GDPR/ePrivacy. Dette er en åben juridisk
   forpligtelse, ikke en nice-to-have.
4. **Resend-mails**: opret domæne i Resend (EU) → DNS-records **hos Simply.com**
   (ikke Vercel, som tidligere planlagt) → Supabase Auth → SMTP (host smtp.resend.com,
   port 465, user `resend`, pass = API-nøgle, afsender noreply@minibasket.dk) →
   danske mail-templates.
5. **Supabase Auth URL Configuration**: Site URL = `https://minibasket.dk/app/`,
   additional = `https://minibasket.vercel.app/**`. Bekræft at det er sat.

## Åbne punkter
- **Leaked password protection** er stadig slået fra i Supabase Auth — gratis gevinst.
- `mb_create_team()` og `mb_create_own_team()` er **død kode** — appen opretter hold via
  direkte insert på `mb_teams` (RLS-policy + trigger), ikke via RPC. De er nu låst til
  `authenticated`, men kunne droppes helt.
- **Supabase-projektet deles med flere ubeslægtede apps** (sisu-rotation, madplan,
  dashboard, vault/DMS). Kun `mb_`-objekter er vores. Kør ALDRIG `supabase db reset`.
  `sisu_`-tabellerne har helt åbne RLS-policies (`USING true`) — accepteret risiko,
  men overvej at give SISU samme auth-model som `mb_`.
- Kontaktmail i appen er **northgaard@hotmail.com** mens kontoen er gmail — bevidst?
- Vercel-projektets Framework Preset står som "Other"; sitet bygger korrekt alligevel
  via Astro-autodetektion, men det er værd at sætte eksplicit hvis build en dag driller.
- Senere: polling → Realtime, "Ryd periode"-UX, aria/fokus i modaler, flere øvelser.

## Klaret siden sidst (var åbne punkter)
- ✅ PNG-ikoner til iOS (`apple-touch-icon.png`, `icon-192`, `icon-512`)
- ✅ OG-billede (`site/public/og.png`, 1600×840)
- ✅ Deploy uden web-upload — git push virker nu fra den lokale mappe
