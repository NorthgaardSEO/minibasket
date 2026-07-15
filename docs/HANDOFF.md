# Mini Basket — status & overdragelse

_Opdateret 14. juli 2026_

## Sådan fortsætter du i en ny chat
1. Åbn en ny chat **i samme projekt** ("Mini Basket app").
2. Skriv fx: _"Fortsæt på Mini Basket — læs HANDOFF.md"_.

## Hvad er projektet
1. **PWA-appen**: fair fordeling af spilletid til børnebasket-trænere (rotation, trup, tid/score, multi-kamp). Live på **https://minibasket.vercel.app**. Champagne-design, gratis, MobilePay-kaffedonation.
2. **NYT — content-site** (`site/`): Astro-hjemmeside til **minibasket.dk** med 13 basketøvelser + 5 trænerguides (SEO: HowTo/Article-schema, sitemap, intern linking, app-CTA'er med UTM). Appen skal fremover ligge på **minibasket.dk/app/** (kopi klar i `site/public/app/` med /app/-manifest).

## Teknik
- Kode: GitHub **NorthgaardSEO/minibasket** (main) → Vercel auto-deploy (team "Freds").
- Backend: Supabase `bemngqxfwunfihvfgkrt` (mb_-tabeller, RLS). Auth: email/password + reset-mail.
- Deploy-metode (sandbox har ikke git): ret filer → bump `sw.js`-version → upload via `github.com/NorthgaardSEO/minibasket/upload/main` → verificér med curl.

## Senest gjort (14. juli 2026)
- **Reviews**: `REVIEW-ARKITEKTUR.md` + `REVIEW-KODE.md` (arkitekt + senior webdev) ligger i mappens rod.
- **Database (allerede live i Supabase)**: trigger blokerer rolle-eskalering på mb_coaches (kritisk hul lukket); `game_date`-kolonne tilføjet mb_sessions (backfyldt); RPC `mb_apply_rotations` til atomisk rotations-gem.
- **App-fixes i `minibasket-app/` (IKKE deployet endnu — sw v9)**: game_date sættes ved kampoprettelse + datofelt i Ny kamp-modal; balancér bruger atomisk RPC; kamp-ur er timestamp-baseret + wake lock (fryser ikke ved låst skærm); SW rører ikke cross-origin og fallback kun ved navigation; sikkerhedsheaders/CSP i vercel.json; supabase-js pinnet til 2.110.5; boot-race fixet; kaffe-modal uden falske beløbsknapper; zoom tilladt; større touch targets; README omskrevet.
- **Site bygget i `site/`**: Astro, build verificeret grøn (23 sider + sitemap). Forside, /basketoevelser/ (13 stk., filtrering på alder/kategori), /traenerguides/ (5 stk.), /om/, /stoet/. Appen kopieret til `site/public/app/` med manifest scope/start_url/id = `/app/`.

## STATUS 15/7-26 aften — SITE + /APP ER LIVE 🎉
- **Hele `site/` er pushet til GitHub** (45 filer, upload i 12 batches via web) og **Vercel Root Directory = `site`**. Produktion viser nu: Onyx Gold content-sitet på roden (26 sider: forside, /basketoevelser/ 13 stk., /traenerguides/ 5 stk., NYE /basketball-regler/, /boldspil-idraet/, /basketball-for-boern/, om, støt) og **PWA'en på /app/** — verificeret live på minibasket.vercel.app.
- **Design**: Onyx Gold fra Frederiks Claude-design (se DESIGN-BRIEF.md). Ordlyd: al "retfærdig/fortjener"-framing fjernet — tone er "nemt", "ingen spiller for meget", "overblik over flere kampe". H1: "Nemt styr på spilletiden."
- **SEO**: implementeret efter SEO-PLAN.md (Ahrefs DK-data: regel-klyngen ~640/md KD0 er hovedmuligheden; boldspil idræt ~270/md; kommerciel udstyrsklynge ~570/md noteret som fremtidig affiliate-mulighed). FAQ/Article/HowTo-schema, intern linking, UTM på alle app-CTA'er.
- **minibasket.dk**: nameservere skiftet til ns1/ns2.vercel-dns.com hos GoDaddy (efter Punktum MitID-godkendelse). Venter kun på registry-propagering, så går domænet live automatisk med cert.
- **VIGTIGT — udestående efter domæne-live:** (a) Supabase dashboard → Auth → URL Configuration: Site URL = https://minibasket.dk/app/, additional = https://minibasket.vercel.app/** ; (b) Resend-konto (Frederik opretter) → DNS-records tilføjes i VERCEL DNS → SMTP i Supabase; (c) eksisterende installerede brugere på vercel.app-roden ser nu sitet — de skal åbne /app/ og geninstallere (få brugere, accepteret).

## OPRINDELIG PLAN (historik)
1. ~~Deploy app-fixes~~ **GJORT 14/7-26**: sw v9 er live på minibasket.vercel.app (commit 48193ff), verificeret i browser. (Metode: GitHub web-upload via Chrome-udvidelsens file_upload — git push kræver login, men upload-flowet kan Claude køre selv.)
2. ~~Køb minibasket.dk~~ **GJORT 14/7-26**: købt via GoDaddy (kr 86,25/år, konto northgaard, betalt m. PayPal). Domænet er tilføjet Vercel-projektet (minibasket.dk = Production, www → 308-redirect). MitID valideret og nameservere skiftet til **ns1/ns2.vercel-dns.com** (14/7 aften — propagering til .dk-registret pågår; Vercel validerer og udsteder cert automatisk når den slår igennem). Indtil site/-omlægningen pushes viser minibasket.dk PWA'en fra repo-roden. Fremtidig DNS (Resend m.m.) styres i **Vercel DNS**, ikke GoDaddy.
3. **Resend-mails** (dag 1 efter køb): opret domæne i Resend (EU-region) → DNS-records (SPF/DKIM/MX + DMARC) → Supabase Auth → SMTP (host smtp.resend.com, port 465, user `resend`, pass = API-nøgle, afsender noreply@minibasket.dk) → danske mail-templates. **Auth-URL'er sættes i Supabase-dashboardet** (Site URL: https://minibasket.dk/app/; additional: https://minibasket.vercel.app/**).
4. **Site live**: push `site/` til repoet, sæt Vercel-projektets **Root Directory til `site`**, tilføj minibasket.dk som domæne. `minibasket.vercel.app` fortsætter som alias i overgangen.
5. **Efter 2–4 ugers varsling**: host-redirect fra vercel.app → minibasket.dk/app/ (opskrift i REVIEW-ARKITEKTUR.md) + kill-switch-SW. OBS: installerede brugere mister login ved origin-skift og skal geninstallere.

## Åbne punkter
- PNG-ikoner til iOS (apple-touch-icon understøtter ikke SVG) + OG-billede 1200×630 til sitet.
- Analytics (Plausible/Vercel Analytics, cookieless) fra dag 1 på sitet.
- Kontaktmail i appen er **northgaard@hotmail.com** — bevidst? (konto er gmail).
- **sisu_-tabellerne** beholdes — SISU Rotation-appen kører videre ved siden af (besluttet 14/7-26). OBS: de har helt åbne RLS-policies (USING true), dvs. alle med anon-nøglen kan læse/skrive alt sisu-data. Accepteret risiko for nu; overvej senere at give SISU samme auth-model som mb_.
- Aktivér "Leaked password protection" i Supabase Auth (gratis sikkerhedsgevinst).
- Senere: polling→Realtime, Ryd periode-UX, aria/fokus i modaler, flere øvelser på sitet.
