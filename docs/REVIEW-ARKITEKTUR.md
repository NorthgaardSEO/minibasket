# Arkitektur-review: minibasket.dk (site på roden + app på /app)

_Solution architect-gennemgang, 14. juli 2026_

## Nøglefakta fra koden

- **Alt i PWA'en er relativt-stiet** — stor fordel: `manifest.json` har `start_url: "./index.html"` og `scope: "./"`, sw.js cacher relative stier, og app.js registrerer `navigator.serviceWorker.register("sw.js")`. Flyttes filerne fysisk til `/app/`, følger SW-scope og manifest næsten automatisk med.
- **Auth-redirects er allerede domæne-agnostiske**: app.js:40 og :55 bruger `location.origin + location.pathname`. Virker på nyt domæne — men URL'erne skal i Supabase' redirect-allowlist.
- **vercel.json har `cleanUrls: true` + `trailingSlash: false`** — giver en SW-scope-fælde på `/app` (se pkt. 1).
- **Headers i vercel.json** peger på `/sw.js` og `/manifest.json` på roden — skal opdateres til `/app/...`.

## 1. Domæne/routing: ét Vercel-projekt (monorepo) — anbefalet

Ét projekt, ikke to projekter + rewrites. To projekter er overkill for et soloprojekt og komplicerer headers/caching.

**Ny repo-struktur** (NorthgaardSEO/minibasket):

```
/site/                   ← Astro content-site
  /src/content/ovelser/   (markdown pr. øvelse)
  /src/content/guides/
  /public/app/            ← PWA'ens filer UÆNDREDE
```

Astros `public/` kopieres 1:1 — PWA'en forbliver vanilla JS uden build-step. Vercel-projektets root sættes til `/site`.

**Kritisk — SW-scope-fælden:** SW på `/app/sw.js` får scope `/app/`. Med `cleanUrls: true` + `trailingSlash: false` serveres siden på `/app` (uden slash), som IKKE matcher scope `/app/`. **Løsning: `trailingSlash: true`** (eller redirect `/app` → `/app/`), og brug `/app/` konsekvent.

**Manifest:** `"start_url": "/app/"`, `"scope": "/app/"`, tilføj `"id": "/app/"`.

**vercel.json:** Headers flyttes til `/app/sw.js`, `/app/manifest.json`, `/app/icon.svg`. Host-betinget redirect fra minibasket.vercel.app:

```json
"redirects": [
  { "source": "/:path*",
    "has": [{ "type": "host", "value": "minibasket.vercel.app" }],
    "destination": "https://minibasket.dk/app/", "permanent": true }
]
```

**Vent 2–4 uger med redirecten** — installerede brugere mister login ved origin-skift og skal varsles først.

## 2. Auth-mails: Resend + Supabase SMTP

Uafhængigt af hosting-flytningen — kan gøres dag 1 efter domænekøb.

**DNS-records:**
1. Tilføj minibasket.dk i Resend (vælg **EU-region** — danske modtagere + GDPR). Resend udleverer: SPF (TXT på `send.minibasket.dk`), MX på `send.minibasket.dk`, DKIM (TXT på `resend._domainkey.minibasket.dk`).
2. Tilføj selv DMARC: TXT på `_dmarc.minibasket.dk` → `v=DMARC1; p=none; rua=mailto:northgaard@gmail.com` (stram til `quarantine` efter rene rapporter).

**Supabase (bemngqxfwunfihvfgkrt), Auth → SMTP:** Host `smtp.resend.com`, port 465, user `resend`, password = Resend API-nøgle, afsender `Mini Basket <noreply@minibasket.dk>`. Hæv derefter auth rate-limits. Oversæt mail-templates til dansk.

**Redirect-URL'er (Auth → URL Configuration):** Site URL `https://minibasket.dk/app/`; additional: `https://minibasket.vercel.app/**` (overgang) + `http://localhost:3000/**`. Ingen kodeændring i app.js nødvendig.

## 3. Content-site: Astro (statisk output)

- Ren statisk HTML: uvedligeholdeligt ved 50–200 øvelser med kategorier/tags.
- Next.js: overkill, hydration-JS skader Core Web Vitals.
- **Astro**: zero-JS default (perfekt CWV → dansk SEO), markdown content collections (én .md pr. øvelse), indbygget sitemap/RSS, public/-passthrough til PWA'en.

**URL-arkitektur (dansk søgeintention):**

```
/                          → forside (brand + app-CTA)
/basketoevelser/           → hub ("basketøvelser" — hovedkeyword)
/basketoevelser/[slug]/    → fx /basketoevelser/dribleslalom-u8/
/traenerguides/            → hub ("basketballtræner børn", "minibasket regler")
/traenerguides/[slug]/     → fx /traenerguides/fair-spilletid-boernebasket/
/app/                      → PWA'en
/om/  /stoet/              → om + donation
```

**SEO fra start:** Frontmatter pr. øvelse (aldersgruppe U6–U12, kategori, antal spillere, varighed, rekvisitter) → filtrering + struktureret data. Schema.org: HowTo på øvelser, Article på guides, FAQPage, SoftwareApplication på /app-landingssiden. Sitemap, canonicals, `lang="da"`, OG-billeder. Genbrug champagne-designsystemet (CSS-variabler fra index.html). Intern linking: hver øvelse → relaterede øvelser + kontekstuel app-CTA.

## 4. Konsekvenser for eksisterende PWA-brugere

**Origin-skift = installerede brugere mister Supabase-session (localStorage er per origin) og skal geninstallere.**

Migrationssekvens:
1. **Uge 0:** Deploy appen på minibasket.dk/app/ parallelt — begge origins i Supabase-allowlist. Ingen redirect endnu.
2. **Uge 0:** Bump sw.js til v9 + in-app-banner på gammelt domæne: "Vi er flyttet til minibasket.dk/app" (host-check: `location.hostname.endsWith('vercel.app')`).
3. **Uge 2–4:** Slå host-redirect til. Deploy først en kill-switch-SW på gammelt origin (unregister + slet caches).
4. **Deep links:** Reset-mails sendt før cutover peger på gammelt origin — hold det i live. Supabase-tokens i URL-hash overlever 308-redirect (hash bevares af browseren).
5. Opdater Supabase Site URL samtidig med trin 1.

## 5. Business/marketing

Ét domæne = én autoritet. Backlinks til øvelser/guides styrker hele domænet inkl. /app — hovedargument for /app-path frem for app-subdomæne.

**Funnel:** Google ("basketøvelser u10") → øvelsesside → kontekstuel CTA → /app/ med UTM (`?utm_source=site&utm_medium=cta&utm_campaign=ovelse-slug`) → signup → kaffe-donation.

Tilføj **Plausible eller Vercel Analytics** (cookieless, intet consent-banner) fra dag 1. Distribution: DBBF-klubber, danske Facebook-trænergrupper, link fra appens Links-fane tilbage til guides.

## Prioriteret rækkefølge

**Quick wins (uge 1):**
1. Køb minibasket.dk, peg DNS på Vercel, tilføj domænet til eksisterende projekt.
2. Resend + Supabase SMTP (SPF/DKIM/DMARC + danske mail-templates).
3. Opdater Supabase redirect-allowlist med begge origins.

**Fase 2 (uge 1–2):**
4. Repo-omstrukturering: Astro-skelet i /site, PWA i site/public/app/, manifest → /app/, vercel.json (trailingSlash: true, headers), sw.js v9 + flytte-banner.
5. Minimal forside + /om + /stoet.

**Fase 3 (uge 3–6):**
6. 10–15 cornerstone-øvelser + 3–5 trænerguides med schema, sitemap, intern linking, UTM-CTA'er.
7. Host-redirect efter varslingsperiode; kill-switch-SW.
8. Analytics + funnel-måling.

**Senere:** øvelsesfiltrering (alder/kategori), FAQ-schema, nyhedsbrev, DMARC-stramning.

## Kritiske filer

- `minibasket-app/manifest.json` — start_url/scope/id → /app/
- `minibasket-app/vercel.json` — trailingSlash, headers på /app/*, host-redirect
- `minibasket-app/sw.js` — cache-bump v9, senere kill-switch
- `minibasket-app/app.js` — flytte-banner ved vercel.app-host
- `HANDOFF.md` — deploy-workflow opdateres til ny repo-struktur
