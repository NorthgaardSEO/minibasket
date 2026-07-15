# Code review: Mini Basket PWA

_Senior webdeveloper-gennemgang, 14. juli 2026. Gennemgået: index.html, app.js, sw.js, manifest.json, vercel.json, icon.svg, README.md_

## Topprioriteter

1. **HØJ:** `dayGames()`/`balanceDay()` kan slette rotationer for ALLE kampe, fordi `game_date` aldrig sættes af klienten (app.js:161, 179).
2. **HØJ:** RLS-antagelse: klienten kan kalde `update mb_coaches set role='admin'` — skal blokeres server-side (app.js:515).
3. **HØJ:** Kamp-uret bruger `setInterval` og fryser når skærmen låses (app.js:460-462).
4. **HØJ:** Service workeren cacher Supabase API-svar og falder tilbage til index.html for fejlede API-kald (sw.js:18-30).
5. **HØJ:** `balanceDay` sletter i DB FØR den indsætter — netværksfejl midtvejs = datatab (app.js:179-187).

## 1. Bugs og logikfejl

### 1.1 [HØJ] "Balancér" rammer potentielt alle kampe — game_date sættes aldrig
app.js:161, 174-188, 386-391. Ved oprettelse indsættes kun `{team_id, name, sort}` — game_date er null for alle kampe, så `dayGames()` returnerer hele historikken, og "Balancér" sletter/genfordeler rotationer i samtlige ulåste kampe.
**Fix:** Sæt game_date eksplicit ved oprettelse (datofelt i "Ny kamp"-modal); lad dayGames() returnere `[curSess()]` ved null. Verificér skemaet i Supabase.

### 1.2 [HØJ] Kamp-uret pauser når telefonen låses
app.js:460-462. setInterval throttles ved låst skærm. **Fix:** Gem `timer.endAt = Date.now() + remaining*1000` og beregn remaining i hvert tick + på visibilitychange. Overvej `navigator.wakeLock.request('screen')` i Tid-visningen.

### 1.3 [HØJ] balanceDay sletter før den gemmer
app.js:179-187. Fejler insert efter succesfuld delete, er gamle rotationer væk. Samme mønster i autoBalance (app.js:353).
**Fix:** Postgres-funktion (RPC) med atomisk delete+insert. Minimum: upsert først, derefter delete af overskydende, try/catch med genindlæsning ved fejl.

### 1.4 [MELLEM] Race condition ved boot — dobbelt "Mit hold"
app.js:85-89 + 568-572. Både IIFE'ens getSession() og onAuthStateChange (INITIAL_SESSION) kalder boot(); guarden `if(!me)` når ikke at virke. Onboarding kan køre to gange → to teams + dobbelt polling.
**Fix:** Synkront flag (`let booting=false`) øverst i boot(); lad kun onAuthStateChange boote.

### 1.5 [MELLEM] Polling kan overskrive langsomme skrivninger
app.js:233-247 vs. 337-348. Tager upsert >4,5 s (hal-wifi), overskriver refreshQuiet den lokale ændring. refreshQuiet opdaterer heller ikke dayRot[curSession].
**Fix:** Opdatér lastWrite efter await; skip poll ved udestående skrivninger; sæt dayRot[curSession] = rot. Langsigtet: Supabase Realtime.

### 1.6 [MELLEM] "Ryd periode" rydder skjult periode
app.js:369-374. Rydder timer.period (sidst valgt i Tid-fanen, default 0) — ikke det brugeren tror. DB-delete rammer alle spillere, lokal oprydning kun aktive.
**Fix:** Eksplicit periodevalg (fx "Ryd P3"); ryd rot for alle spillere.

### 1.7 [MELLEM] Død kode + vildledende kaffe-beløbsvælger
app.js:350-367 (autoBalance kaldes aldrig — slet), app.js:556-560 (bruger vælger 25/50/100 kr, men beløbet bruges aldrig i MobilePay-linket).
**Fix:** Fjern beløbsknapperne eller omformulér: "vælg beløb i MobilePay".

### 1.8 [LAV] Diverse
- app.js:357/183: `Math.random()-0.5` i komparator er ugyldig — brug Fisher-Yates før stabil sort.
- app.js:377-381: Færre perioder efterlader forældreløse rotationsrækker i DB.
- app.js:96: upsert overskriver coach-name ved hvert login.
- app.js:470: "Kun admin kan se loggen" vises ved enhver fejl.
- app.js:264-266, 437: prompt()/confirm() upålidelige i iOS standalone-PWA — brug egne modaler.
- app.js:524-529: Hurtige score-tryk kan persistere forældet score — debounce.

## 2. Sikkerhed

### 2.1 [HØJ] RLS-audit — især rolle-eskalering
app.js:515, 498-503, 516-520. Admin-fanen er kun skjult med CSS; enhver bruger kan via konsollen kalde `update mb_coaches set role='admin'`. Kan give adgang til alle hold og børns navne.
**Fix:** RLS-audit i Supabase: (a) mb_coaches UPDATE kun for admins, aldrig egen role-kolonne (security definer-RPC til rolleskift); (b) alle mb_-tabeller bundet til mb_coach_teams-medlemskab; (c) overvej invitation frem for åben self-signup.

### 2.2 [HØJ] Ingen sikkerhedsheaders i vercel.json
Mangler CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors.
**Fix-eksempel:** `Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://bemngqxfwunfihvfgkrt.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'`

### 2.3 [MELLEM] Upinnet CDN-script uden SRI
index.html:492. `supabase-js@2` flyder på major — supply-chain-risiko + breaking releases.
**Fix:** Pin eksakt version med integrity/crossorigin — eller læg filen i repoet (virker så også offline).

### 2.4 [LAV] esc() ufuldstændig
app.js:8. Escaper ikke `'` — holder i dag (double-quoted attributter), men skrøbeligt. Validér team-farver mod `/^#[0-9a-f]{6}$/i`.

### 2.5 [LAV] Logs
mb_logs.coach_name sendes fra klienten (app.js:251) — kan spoofes; udled server-side via auth.uid(). Verificér at RLS forbyder UPDATE/DELETE på mb_logs.

## 3. PWA-kvalitet

### 3.1 [HØJ] SW opsnapper og cacher Supabase-kald
sw.js:18-30. REST-svar med persondata gemmes i Cache Storage; offline-fallback returnerer HTML til supabase-js.
**Fix:**
```js
const url = new URL(req.url);
if (url.origin !== self.location.origin) return;
```
og kun index-fallback for `req.mode === 'navigate'`.

### 3.2 [HØJ/MELLEM] /app-flytning — flag
- vercel.json:5-23: headers hardcodet til rod (/sw.js, /manifest.json, /icon.svg) — skal ændres.
- sw.js/manifest/app.js er relative — godt, overlever flytning hvis sw.js serveres på /app/sw.js.
- app.js:40, 55: redirects OK, men tilføj minibasket.dk/app i Supabase Auth-allowlist (dashboard).
- manifest.json: tilføj stabilt "id"-felt nu.
- Gamle brugere: redirect + selvafregistrerende SW på gammelt domæne.

### 3.3 [MELLEM] cleanUrls + ./index.html
vercel.json:3, manifest.json:5, sw.js:3, 28. /index.html giver 308 → redirected response i cache kan afvises til navigation ("redirected response used for navigation") — offline-fallback kan fejle.
**Fix:** Brug `'./'` konsekvent i manifest start_url, SW ASSETS og fallback.

### 3.4 [MELLEM] Ikon: kun SVG — iOS-problem
manifest.json:12-14, index.html:10. iOS understøtter ikke SVG som apple-touch-icon → standardikon på hjemmeskærmen for kernemålgruppen. "any maskable" kombineret frarådes.
**Fix:** PNG'er (180x180 apple-touch, 192/512 manifest), separate any/maskable entries.

### 3.5 [LAV] Manifest-farver matcher ikke appen
theme_color #e30613 (rød) vs. meta #efe7d6 vs. vinrødt design; background #ffffff vs. --paper #f6f2ea. Ensret.

### 3.6 [LAV] Ingen offline-indikator
Datakald fejler stille. Lyt på online/offline-events, vis banner; skeln offline fra serverfejl i toasts.

## 4. Performance og vedligeholdbarhed

### 4.1 [MELLEM] README beskriver en anden app
"Ingen backend, alt lokalt, logik inline i index.html, MOBILEPAY_NUMBER" — alt forældet. Omskriv til faktisk arkitektur (Supabase, mb_-tabeller, RLS, deploy-flow).

### 4.2 [MELLEM] Dubleret logik
autoBalance vs. balanceDay (slet den ubrugte); initial-bogstav 3 steder (udtræk playerInitial(p)); team-sub-tekst dubleret (app.js:144, 418).

### 4.3 [LAV] Struktur
~25 globale variabler i ét scope. Overvej native ES-modules (auth.js, state.js, render.js, timer.js). Ikke akut.

### 4.4 [LAV] Polling og fonts
Poll hver 9 s døgnet rundt — pausér ved document.hidden eller skift til Realtime. Google Fonts (3 familier, 8 vægte) render-blokerende — skær ned eller self-host.

## 5. UX / mobil / tilgængelighed

- **[MELLEM]** index.html:5: `user-scalable=no` blokerer zoom (WCAG 1.4.4). Fjern; brug `touch-action: manipulation`.
- **[MELLEM]** Touch targets: .cell 34px, .iconbtn/.sbtn 36px — hæv til 42-44px (kamp-grid bruges med kampsved).
- **[MELLEM]** Ur nulstilles ved dblclick (udiskoverbart, kolliderer med panik-tap) — tilføj Nulstil-knap. Toast mangler aria-live; låse-knap mangler aria-label; modaler mangler role="dialog"/fokus/Escape. Omdøb-via-aktiv-tab er skjult.
- **[LAV]** translateErr falder tilbage til rå engelsk — dansk fallback. **index.html:441: kontaktmail er northgaard@hotmail.com — er det bevidst (konto er gmail)?** .tb span 8,5px er meget småt.

## Anbefalet rækkefølge

1. game_date/balanceDay-bomben (1.1) + delete-før-insert (1.3) — datatabsrisiko i produktion NU.
2. RLS-audit, især mb_coaches.role (2.1).
3. Timestamp-baseret ur + wake lock (1.2).
4. SW: skip cross-origin, navigate-only fallback, './' (3.1, 3.3).
5. Sikkerhedsheaders + pin supabase-js (2.2, 2.3).
6. Forbered /app-flytning: vercel.json-stier, manifest id, allowlist, PNG-ikoner (3.2, 3.4).
7. README, død kode, touch targets, zoom (4.x, 5.x).
