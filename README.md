# Mini Basket — deploy-opsætning

Fair spilletid, planlagt fra lommen. Statisk PWA (ingen backend) — alt gemmes lokalt i browseren.

Denne mappe (`minibasket-app/`) **er** hele hjemmesiden. Filer:

```
index.html      app + al logik (inline CSS/JS)
manifest.json   PWA-manifest
sw.js           service worker (offline)
icon.svg        app-ikon
vercel.json     Vercel-konfiguration (cache/clean URLs)
```

---

## Sådan får du LIVE deploy (auto-deploy ved hver ændring)

Modellen: **denne mappe → GitHub → Vercel**. Når den er sat op én gang, deployer
hver ændring automatisk. Anbefalet for ikke-programmører: brug **GitHub Desktop** (klik, ingen terminal).

### Engangs-opsætning

1. **Installér GitHub Desktop** (desktop.github.com) og log ind med din GitHub-konto.
2. I GitHub Desktop: **File → Add local repository** → vælg denne mappe
   (`Documents/Claude/Projects/Mini Basket app/minibasket-app`).
   Klik **"create a repository"** når den spørger.
3. Klik **Publish repository** → navn: `minibasket` → (privat er fint) → Publish.
4. Gå til **vercel.com → Add New → Project → Import** dit `minibasket`-repo.
   - Framework Preset: **Other**
   - Root Directory: **/** (mappen er allerede rod)
   - Klik **Deploy**.
5. Efter ~20 sek. har du et link: `minibasket-xxx.vercel.app`.
   Vil du have `minibasket.vercel.app`: Vercel → Project → **Settings → General →
   Project Name** → `minibasket` (hvis ledigt).

### Fremover — sådan live-deployer du en ændring

1. Redigér filer i denne mappe (fx opdatér MobilePay-nummeret i `index.html`).
2. Åbn GitHub Desktop → skriv en kort besked → **Commit to main** → **Push origin**.
3. Vercel bygger og publicerer automatisk på få sekunder. Færdig.

---

## Alternativ: Vercel CLI (hurtig engangs-deploy, terminal)

```bash
npm i -g vercel
cd minibasket-app
vercel          # første gang: login + link projekt
vercel --prod   # publicér til produktion
```

---

## Vigtigt før produktion

- **MobilePay:** i `index.html` øverst i `<script>`, sæt `MOBILEPAY_NUMBER` til dit
  rigtige nummer/box-nr. Uden det viser kaffeknappen en advarsel.
- Appen er 100% gratis og kræver ingen konto. Data ligger kun i brugerens egen browser.
