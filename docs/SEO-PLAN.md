# SEO-PLAN — minibasket.dk

**Dato:** 15. juli 2026 · **Datagrundlag:** Ahrefs DK (volumen/md, KD) · **Mål:** organisk trafik → app-signups (/app/) → MobilePay-donationer + brand i dansk børnebasket.

**Strategi i én sætning:** Byg tre nye landingssider der ejer hver sin søgeklynge (regler ~740/md, boldspil-idræt ~270/md, basketball-for-børn ~250/md), ret eksisterende titler så de matcher det folk faktisk søger ("basketball øvelser", ikke "basketøvelser"), og før al trafik mod app'en via kontekst-relevante CTA'er.

---

## 1. Keyword-map (alle URL'er)

> Regler: Title max 60 tegn, meta description max 155 tegn. "|" adskiller primært / sekundære søgeord. Ord som "basketballregler" og "basketball regler" behandles ens af Google — brug begge varianter i brødteksten.

### 1a. Eksisterende sider (justeres — se afsnit 3)

| URL | Primært søgeord | Sekundære | Title-tag | Meta description | H1 |
|---|---|---|---|---|---|
| `/` | mini basket (brand), minibasket 10 | basketball børn (støtte), fair spilletid | `Mini Basket — basketball-øvelser og guides til børnetrænere` (59) | `Gratis basketball-øvelser og trænerguides til børnebasket (U6–U12) — og en app der sikrer fair spilletid til alle børn. Af en træner, til trænere.` (146) | `Basketball-øvelser og trænerguides — og fair spilletid til alle børn` (uændret er ok, men se 3.1) |
| `/basketoevelser/` | basketball øvelser 30 (KD0) | basketball drills 10, basketball træning til børn 10, dribling 20 | `Basketball-øvelser til børn (U6–U12) — gratis øvelsesbank` (57) | `Gratis basketball-øvelser og drills til børnetræning: dribling, skud, pasning, forsvar, lege og opvarmning. Filtrér efter alder U6–U12.` (135) | `Basketball-øvelser til børn` |
| `/basketoevelser/[slug]/` | long-tail pr. øvelse ("drible øvelser børn" osv.) | dribling 20 (drible-øvelserne) | Skabelon: `{title} — basketball-øvelse til {aldersgrupper} \| Mini Basket` | (uændret — description fra frontmatter) | `{title}` (uændret) |
| `/traenerguides/` | trænerguides børnebasket (long-tail) | basketball træner børn | (uændret) `Trænerguides til børnebasket — fra træner til træner \| Mini Basket` | (uændret) | (uændret) |
| `/traenerguides/minibasket-regler-for-nye-traenere/` | minibasket regler | basketball regler børn 10, minibasket 10, børneregler basketball | (uændret) `Minibasket-regler forklaret for nye trænere \| Mini Basket` (57) | (uændret) | (uændret) |
| `/traenerguides/fair-spilletid-boernebasket/` | fair spilletid | spilletid børnebasket | (uændret) | (uændret) | (uændret) |
| `/traenerguides/din-foerste-traening-som-boernetraener/` | basketball træning til børn 10 (støtte) | børnetræner basketball | (uændret) | (uændret) | (uændret) |
| `/traenerguides/foraeldresamarbejde-for-traenere/` | forældresamarbejde (long-tail) | — | (uændret) | (uændret) | (uændret) |
| `/traenerguides/kampdag-med-flere-kampe/` | kampdag/stævne (long-tail) | basketball kamp 60 (støtte, KD26) | (uændret) | (uændret) | (uændret) |
| `/om/` | — (brand/E-E-A-T) | — | `Om Mini Basket — af en børnetræner, til trænere` | (uændret) | (uændret) |
| `/stoet/` | — (konvertering) | — | (uændret) | (uændret) | (uændret) |
| `/app/` | fair spilletid app (long-tail) | spilletid basketball app | Sættes i PWA'ens index.html: `Mini Basket-appen — fair spilletid i børnebasket (gratis)` | `Gratis app til børnebasket-trænere: planlæg perioderne før kampen, følg spilletiden live og giv alle børn fair tid på banen. Virker på alle telefoner.` (149) | (app-UI, ingen klassisk H1) |

### 1b. Nye sider

| URL | Primært søgeord | Sekundære | Title-tag | Meta description | H1 |
|---|---|---|---|---|---|
| `/basketball-regler/` **(P1)** | basketball regler 250 (KD0) | regler i basketball 100, regler basketball 100 (KD0), regler for basketball 100, basketball regler skridt 80, hvor lang tid tager en basketball kamp 60 (KD0), hvor lang er en basketball kamp 20, basketball kamp længde 10, hvor lang tid varer en basketball kamp 10, basketball regler nba 10 | `Basketball-regler: skridt, point, kamplængde og fouls` (53) | `Alle basketballregler forklaret på dansk: skridtregler, point, hvor lang en kamp er, fouls — og forskellen på FIBA, NBA og børnebasket. Opdateret 2026.` (151) | `Basketball-regler — enkelt forklaret` |
| `/boldspil-idraet/` **(P2)** | boldspil idræt 200 (KD0) | sjove boldspil idræt 70, boldlege idræt, boldspil til idræt | `Sjove boldspil til idræt — 10 lege der bare virker` (50) | `10 sjove boldspil til idrætsundervisningen — klar til brug uden forberedelse. Med alderstrin, rekvisitter og trin-for-trin, samlet af en børnetræner.` (149) | `Sjove boldspil til idræt: 10 lege der bare virker` |
| `/basketball-for-boern/` **(P3)** | basketball børn 200 (KD3) | basketball til børn 40, basketball for børn 10 (KD8), basketball træning 50 (delvis lokal intent — fang info-delen), minibasket 10 | `Basketball for børn: alder, klub, udstyr og første træning` (58) | `Vil dit barn spille basketball? Her er forældreguiden: hvilken alder man kan starte, hvad minibasket er, hvordan I finder en klub, og hvad det kræver.` (149) | `Basketball for børn — sådan kommer I i gang` |

**Bevidst IKKE egne sider (anti-kannibalisering):**
- "hvor lang tid tager en basketball kamp"-klyngen (~100/md) → **sektion + FAQ på `/basketball-regler/`** med anker `#kamplaengde`. Intentionen er et hurtigt svar; en hel side ville konkurrere med regelsiden.
- "basketball regler skridt" (80/md) → **H2-sektion på `/basketball-regler/`** med anker `#skridtregler`. Genbesøg efter 3 mdr.: ranker sektionen ikke top-5, kan den brydes ud som `/basketball-regler/skridt/` med link begge veje.
- "basketball regler børn" (10/md) → ejes af den **eksisterende guide** `/traenerguides/minibasket-regler-for-nye-traenere/`. Regelsiden har kun et kort resumé + link (se rollefordeling i afsnit 2.1).
- Udstyrs-søgeord (kurv/sko/tøj) → fremtid, se afsnit 6.

---

## 2. Nye sider — indhold og prioritering

### 2.1 P1: `/basketball-regler/` (~740/md samlet, alt KD0–lavt)

**Fil:** `site/src/pages/basketball-regler.astro` (statisk .astro-side, ikke content collection — den skal have FAQ-schema, ankre og custom layout).

**Rollefordeling mod eksisterende guide (VIGTIGT, anti-kannibalisering):**
- `/basketball-regler/` = **de generelle basketballregler** (FIBA/DBBF-voksenregler forklaret for alle: spillere, forældre, nysgerrige). Søgeintention: "hvad er reglerne i basketball".
- `/traenerguides/minibasket-regler-for-nye-traenere/` = **de danske børneregler i træner-praksis** (lavere kurve, mindre bolde, alle-skal-spille). Søgeintention: "minibasket regler / regler for børn".
- Regelsiden nævner børneregler i ÉN kort sektion (3–4 linjer) og linker til guiden som canonical destination for det emne. Guiden får omvendt et afsnit øverst: "Leder du efter de almindelige basketballregler (skridt, point, kamplængde)? Se [Basketball-regler enkelt forklaret](/basketball-regler/)."
- Begge sider self-canonical (Base.astro sætter allerede canonical korrekt). Ingen noindex nogen steder.

**Sidestruktur (H2/H3 + ankre):**

1. Indledning (50–80 ord, svar-først: "Basketball spilles 5 mod 5, en kamp varer 4 × 10 minutter…"). Indholdsfortegnelse med ankerlinks.
2. `<h2 id="grundregler">De grundlæggende regler</h2>` — bane, 5 mod 5, formål, udskiftninger.
3. `<h2 id="point">Point: 1, 2 og 3 point</h2>` — inkl. 3-pointslinje og straffekast.
4. `<h2 id="skridtregler">Skridtregler: hvor mange skridt må man tage?</h2>` (→ "basketball regler skridt" 80/md) — to skridt efter sidste dribling, pivotfod, travelling. Konkrete eksempler.
5. `<h2 id="dribling">Dribling og dobbeltdribling</h2>`.
6. `<h2 id="kamplaengde">Hvor lang tid tager en basketballkamp?</h2>` (→ kamp-klyngen ~100/md) — FIBA: 4×10 min effektiv tid, reelt 1½–2 timer med stop; NBA 4×12; børnebasket 4×8 eller stævneformat. **Lille tabel: FIBA / NBA / minibasket → periodelængde, samlet spilletid, reel varighed.**
7. `<h2 id="tidsregler">Tidsregler: 24, 8, 5 og 3 sekunder</h2>`.
8. `<h2 id="fouls">Fouls og frikast</h2>` — personlige fouls, 5-fouls, holdfouls/bonus.
9. `<h2 id="nba-fiba">Forskelle: FIBA, NBA og dansk basketball</h2>` (→ "basketball regler nba" 10/md) — kort tabel.
10. `<h2 id="boerneregler">Regler for børn: minibasket er anderledes (med vilje)</h2>` — 3–4 linjer + prominent link-kort til `/traenerguides/minibasket-regler-for-nye-traenere/` + link til basket.dk/boerneregler som autoritativ kilde (E-E-A-T).
11. `<h2 id="faq">Ofte stillede spørgsmål</h2>` — se FAQ-listen under Schema (afsnit 5).
12. App-CTA (se afsnit 6) + "Læs også"-blok: minibasket-regler-guiden, kampdag-guiden, øvelses-hubben.

**Omfang:** 1.500–2.200 ord. Opdateringsdato synlig på siden ("Opdateret juli 2026") — regelsider belønnes for friskhed.

**Navigation:** Tilføj `Regler` i header-nav i `Base.astro` (mellem "Guides" og "Om") og `Basketball-regler` i footer-links. Dette er sitets vigtigste nye interne signal.

### 2.2 P2: `/boldspil-idraet/` (~270/md, KD0)

**Fil:** `site/src/pages/boldspil-idraet.astro`.

**Målgruppe:** idrætslærere og pædagoger — IKKE trænere. Tonen: "klar til brug i næste idrætstime, nul forberedelse".

**Indhold:** 10 lege, hvoraf 6–7 genbruges fra øvelsesbanken omskrevet til skole-kontekst (Haletagfat med bold, Skattejagten, Trafiklys-dribling, Boldtyven, Ti pasninger, Følg lederen, Boldgymnastik) + 2–3 nye ikke-basketspecifikke boldlege (fx stikbold-variant, "alle mod alle"-rundbold-tvist) så siden dækker "boldspil" bredt og ikke kun basket.

**Struktur:**
1. Indledning (hvem, hvorfor, "alle lege virker med skumbolde/fodbolde hvis I ikke har basketbolde").
2. Hurtig-vælger-tabel: leg → klassetrin (0.–3. / 4.–6.) → rekvisitter → tid.
3. `<h2>`-sektion pr. leg: 3–5 trin, variation, hvad børnene træner. Hver genbrugt leg linker til den fulde øvelsesside: "Fuld instruktion med variationer: [Haletagfat med bold](/basketoevelser/haletagfat-med-bold/)".
4. Afslutning: "Underviser du også i basketball? Se hele [øvelsesbanken](/basketoevelser/)" + blød CTA (afsnit 6).

**Klassetrin vs. U-grupper:** brug klassetrin (0.–6. klasse) på denne side — idrætslærere tænker ikke i U8/U10.

### 2.3 P3: `/basketball-for-boern/` (~250/md, KD3–8)

**Fil:** `site/src/pages/basketball-for-boern.astro`.

**Målgruppe:** forældre, hvis barn vil spille basketball. Dette er sitets "top of funnel" mod forældre-segmentet (som også er dem, der donerer kaffe og presser på for fair spilletid).

**Struktur:**
1. `<h2>Hvornår kan børn starte til basketball?</h2>` — typisk fra 5–6 år (U6), aldersgrupper U6–U12 forklaret.
2. `<h2>Hvad er minibasket?</h2>` — lavere kurve, mindre bolde, alle spiller → link til minibasket-regler-guiden.
3. `<h2>Sådan finder I en klub</h2>` — link til DBBF's klubfinder (basket.dk) — fanger info-delen af "basketball træning" (50/md, delvis lokal intent) med et afsnit "Hvad sker der til en typisk børnetræning?".
4. `<h2>Hvad koster det, og hvad skal barnet have med?</h2>` — kontingent-niveau, indendørssko, boldstørrelse 4/5 (forbereder fremtidig udstyrs-content, afsnit 6).
5. `<h2>Hvad kan I lave derhjemme?</h2>` — link til 3–4 U6/U8-øvelser fra banken.
6. `<h2>Fair spilletid — hvad må I forvente som forældre?</h2>` — unik vinkel ingen konkurrenter har; link til fair-spilletid-guiden + app-CTA ("vis den til jeres træner").
7. FAQ-sektion (se afsnit 5).

**Omfang:** 1.200–1.800 ord.

### 2.4 FAQ-strategi

Ingen selvstændig FAQ-side (ville kannibalisere). I stedet FAQ-sektioner med FAQPage-schema på `/basketball-regler/` og `/basketball-for-boern/` (afsnit 5).

---

## 3. Justeringer af eksisterende sider (quick wins — implementér FØRST)

3.1 **`/basketoevelser/index.astro`** — folk søger "basketball øvelser", ikke "basketøvelser":
   - Title: `Basketball-øvelser til børn (U6–U12) — gratis øvelsesbank`
   - Meta: `Gratis basketball-øvelser og drills til børnetræning: dribling, skud, pasning, forsvar, lege og opvarmning. Filtrér efter alder U6–U12.`
   - H1: `Basketball-øvelser til børn`
   - Lede-tekst: indarbejd "basketball-øvelser" og "drills" naturligt i første afsnit.
   - Schema-`name`: `Basketball-øvelser til børn (U6–U12)`.
   - **URL'en `/basketoevelser/` beholdes** — den er kort, indekseret og allerede i alle interne links; en URL-ændring giver redirect-støj for ~0 gevinst. Søgeordsmatch klares af title/H1.

3.2 **`/basketoevelser/[slug].astro`** — title-skabelon ændres fra `— basketøvelse til` → `— basketball-øvelse til`:
   ```astro
   title={`${d.title} — basketball-øvelse til ${d.aldersgruppe.join('/')} | Mini Basket`}
   ```
   (Ved 3 aldersgrupper kan title ramme ~62 tegn — acceptabelt; brand trunkeres i SERP, ikke søgeordet.)

3.3 **`/index.astro` (forside)** — title ændres fra `Mini Basket — basketøvelser og trænerguides til børnebasket` → `Mini Basket — basketball-øvelser og guides til børnetrænere`. Meta og WebSite-schema-description: erstat "Basketøvelser" med "basketball-øvelser". H1 kan blive stående, men skift gerne "Basketøvelser" → "Basketball-øvelser" for konsistens. Tilføj en kort regel-teaser-sektion på forsiden når `/basketball-regler/` er live (3.6).

3.4 **`Base.astro` nav + footer:** tilføj `Regler`-link (se 2.1). Footer: skift "Basketøvelser" → "Basketball-øvelser".

3.5 **`lib/site.ts` → `GUIDE_FOR_KATEGORI`:** behold, men se intern linking (afsnit 4) for ny regel-mapping.

3.6 **Forside-sektion (efter guides-listen, når P1 er live):** lille sektion "Nyt: Basketball-reglerne — enkelt forklaret" med link til `/basketball-regler/`. Forsidens autoritet skal pege på den nye hovedside.

3.7 **`minibasket-regler-for-nye-traenere.md`:** tilføj afsnit øverst i brødteksten med link op til `/basketball-regler/` (formulering i 2.1). Rør ikke title/description — de matcher allerede "minibasket regler".

---

## 4. Intern linking-plan

**Princip:** hver klynge har én hovedside; alle relaterede sider linker OP til hovedsiden med søgeordsnær ankertekst; hovedsiden linker NED til uddybende sider.

| Fra | Til | Ankertekst (ca.) | Placering |
|---|---|---|---|
| Header-nav (alle sider) | `/basketball-regler/` | `Regler` | `Base.astro` nav |
| Forside | `/basketball-regler/` | `Basketball-reglerne — enkelt forklaret` | Ny teaser-sektion |
| `/basketball-regler/` | `/traenerguides/minibasket-regler-for-nye-traenere/` | `minibasket-reglerne forklaret for trænere` | Børneregler-sektionen (#boerneregler) |
| `/basketball-regler/` | `/traenerguides/kampdag-med-flere-kampe/` | `kampdag med flere kampe` | Kamplængde-sektionen |
| `/basketball-regler/` | `/basketoevelser/` | `gratis basketball-øvelser til børn` | "Læs også"-blok |
| `/basketball-regler/` | `/app/` (via `appUrl('regler')`) | CTA-boks | Efter FAQ |
| `/traenerguides/minibasket-regler-for-nye-traenere/` | `/basketball-regler/` | `de almindelige basketball-regler (skridt, point, kamplængde)` | Nyt afsnit øverst |
| `/traenerguides/kampdag-med-flere-kampe/` | `/basketball-regler/#kamplaengde` | `hvor lang tid en basketballkamp tager` | I brødtekst |
| `/boldspil-idraet/` | 6–7 øvelsessider | øvelsens navn | Pr. leg |
| `/boldspil-idraet/` | `/basketoevelser/` | `hele øvelsesbanken` | Afslutning |
| `/basketoevelser/` (hub) | `/boldspil-idraet/` | `Idrætslærer? Se 10 boldspil til idræt` | Lille notits under filterbaren |
| `/basketball-for-boern/` | `/traenerguides/minibasket-regler-for-nye-traenere/`, `/basketball-regler/`, `/basketoevelser/` (U6/U8-filter), `/traenerguides/fair-spilletid-boernebasket/` | naturlige anker | I sektionerne (2.3) |
| Forside | `/basketball-for-boern/` | `Forælder? Sådan kommer jeres barn i gang` | Teaser eller footer |
| `lib/site.ts` `GUIDE_FOR_KATEGORI` | Ingen ændring af eksisterende mapping, men tilføj ny konstant `REGEL_LINK` og vis på skud/forsvar-øvelser et ekstra "Læs også: Basketball-reglerne" | — | `[slug].astro` |
| Footer (alle sider) | `/basketball-regler/`, `/boldspil-idraet/`, `/basketball-for-boern/` | sidenavne | `Base.astro` footer-links |

**Kannibaliserings-tjek (kvartalsvist i GSC):** Hvis guiden begynder at ranke på "basketball regler" (generisk) i stedet for regelsiden, styrk intern linking mod regelsiden og skærp guidens title mod "minibasket". Omvendt: regelsiden må ikke udbygge børneregler-sektionen ud over ~100 ord.

---

## 5. Schema-markup pr. side

| Side | Schema | Note |
|---|---|---|
| `/` | `WebSite` | Findes — opdatér description (3.3) |
| `/basketoevelser/` | `CollectionPage` | Findes — opdatér name/description |
| `/basketoevelser/[slug]/` | `HowTo` | Findes — behold |
| `/traenerguides/[slug]/` | `Article` | Findes — behold |
| `/basketball-regler/` | `Article` + `FAQPage` (array — `Base.astro` understøtter allerede `object[]`) | FAQPage KUN her og på /basketball-for-boern/ — aldrig samme spørgsmål to steder |
| `/boldspil-idraet/` | `Article` + `ItemList` (10 lege, `itemListElement` med navn + URL-anker) | ItemList kan give sitelink-udvidelser |
| `/basketball-for-boern/` | `Article` + `FAQPage` | |
| Alle undersider (P3, valgfrit) | `BreadcrumbList` | Brødkrummer findes visuelt — tilføj schema i `Base.astro` via ny `breadcrumbs`-prop |

**FAQ-spørgsmål `/basketball-regler/`** (målrettet PAA/featured snippets — svar på 40–55 ord):
1. Hvor lang tid tager en basketballkamp? (4×10 min effektiv tid i FIBA/dansk basket; reelt 1½–2 timer; NBA 4×12)
2. Hvor mange skridt må man tage i basketball? (to skridt efter sidste dribling)
3. Hvor mange point giver en scoring? (1/2/3)
4. Hvor mange spillere er der på et basketballhold? (5 på banen, typisk 12 i truppen)
5. Hvor høj er en basketballkurv? (3,05 m — lavere i minibasket, link til guiden)
6. Gælder de samme regler for børn? (nej — minibasket, link til guiden)

**FAQ-spørgsmål `/basketball-for-boern/`:**
1. Hvor gammelt skal et barn være for at spille basketball?
2. Hvad koster det at gå til basketball?
3. Hvilken boldstørrelse skal børn bruge? (str. 4 → str. 5)
4. Skal barnet kunne noget i forvejen?

---

## 6. Business-vinkel: CTA'er og fremtidige muligheder

### App-CTA-placeringer (brug eksisterende `CtaBox.astro` + `appUrl()`)

| Side | Kampagne (`utm_campaign`) | Vinkel/tekst |
|---|---|---|
| `/basketball-regler/` | `regler` | Efter FAQ: heading `Reglerne siger alle skal spille — appen holder styr på det` · tekst: "Til kamp er den sværeste regel at håndhæve fair spilletid. Mini Basket-appen planlægger perioderne og viser live, hvem der mangler tid på banen. Gratis." — rammer trænere/forældre der lander på kamplængde/regel-søgninger |
| `/basketball-regler/` (nr. 2, diskret) | `regler-kamplaengde` | Én tekstlinje i kamplængde-sektionen: "Træner du børn? [Appen her](…) fordeler spilletiden i perioderne for dig." |
| `/boldspil-idraet/` | `boldspil` | BLØD CTA til sidst (idrætslærere er ikke kamp-trænere): "Træner du også et klubhold? Se appen der giver alle børn fair spilletid." Primær interne CTA er øvelsesbanken |
| `/basketball-for-boern/` | `foraeldre` | Efter fair spilletid-sektionen: heading `Bliver dit barn glemt på bænken?` · tekst: "Vis træneren Mini Basket-appen — den fordeler spilletiden fair og er gratis." + sekundært link til `/stoet/` ("Synes du om projektet? Giv en kaffe") — forældre er donations-segmentet |

### Fremtidige muligheder (IKKE i denne omgang)

1. **Udstyrs-klyngen (~570/md kommerciel):** basketball kurv børn 200, basketball tøj til børn 150, basketball sko børn 90, basketball kurv børn indendørs 70, basketball net børn 50, basketball kurv højde børn 10 (info-intent!). Mulig fremtidig sektion `/udstyr/` med guides ("Basketballkurv til børn — købsguide", "Basketsko til børn") + affiliate (Partner-ads: Sportmaster/Unisport/Coolshop). Forarbejdet ligger i `/basketball-for-boern/` udstyrs-sektionen — "basketball kurv højde børn" kan besvares dér allerede nu. Kræver klar annonce-mærkning; vent til sitet har trafik-autoritet (3–6 mdr.).
2. **"basketball regler skridt" som selvstændig side** — kun hvis sektionen ikke ranker top-5 efter 3 mdr. (se 2.1).
3. **Sæson-content:** "basketball i skolen — årsplan til idræt" (bygger på boldspil-siden, ranker mod skolestart aug./sep.).

---

## 7. Implementeringsrækkefølge (til webudvikleren)

1. **Uge 1 — quick wins:** alle justeringer i afsnit 3 (titler/meta/H1/nav/footer). Filer: `src/pages/index.astro`, `src/pages/basketoevelser/index.astro`, `src/pages/basketoevelser/[slug].astro`, `src/layouts/Base.astro`, PWA'ens `<title>`/description.
2. **Uge 1–2 — P1:** `src/pages/basketball-regler.astro` (indhold jf. 2.1, schema jf. 5, CTA jf. 6) + link-ændringer i regel-guiden og kampdag-guiden (afsnit 4) + forside-teaser.
3. **Uge 2–3 — P2:** `src/pages/boldspil-idraet.astro` + notits på øvelses-hubben.
4. **Uge 3–4 — P3:** `src/pages/basketball-for-boern.astro` + forside/footer-links.
5. **Derefter:** BreadcrumbList-schema (5), GSC-opfølgning: indekseringsstatus efter deploy, position-tracking på "basketball regler", "boldspil idræt", "basketball børn", "basketball øvelser"; kannibaliserings-tjek kvartalsvist (afsnit 4).

**Tekniske noter:** Base.astro håndterer allerede canonical, OG og schema-arrays — nye sider skal blot sende `schema={[articleSchema, faqSchema]}`. Sitemap genereres automatisk (`/sitemap-index.xml` er allerede linket). Nye sider bygges som statiske `.astro`-filer med `class="prose"`-artikellayout som guiderne. Ingen redirects nødvendige — ingen URL'er ændres.
