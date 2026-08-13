# SEO-GEO-STRUKTUR — minibasket.dk

**Dato:** 15. juli 2026 · **Bygger på:** SEO-PLAN.md (keyword-map, implementeret) · **Scope:** informationsarkitektur, schema-graf, GEO/AI-synlighed, indholdsskabeloner, E-E-A-T, roadmap.

**Status-baseline (verificeret i koden 15/7-2026):** 26 sider live. `Base.astro` sætter canonical, OG, `schema`-prop (object|array). Schema i dag: `WebSite` (forside), `CollectionPage` (øvelses-hub), `HowTo` (13 øvelser), `Article` (5 guides), `Article`+`FAQPage` (/basketball-regler/), `Article`+`FAQPage` (/basketball-for-boern/), `Article`+`ItemList` (/boldspil-idraet/). **Mangler:** Organization, Person, SoftwareApplication, BreadcrumbList, `@id`-sammenkobling, `dateModified` (kun regelsiden har den), llms.txt, AI-crawler-politik i robots.txt.

---

## 1. Informationsarkitektur (topical authority)

### 1.1 Emneklynge-kort

Sitet dækker én overordnet entitet — **børnebasket i Danmark** — gennem fire klynger + ét produkt:

```
minibasket.dk (entity: Mini Basket / børnebasket)
│
├── KLYNGE A: Øvelser (hub: /basketoevelser/)
│   └── 13 øvelsessider /basketoevelser/[slug]/   ← HowTo
│       (kategorier: dribling, skud, pasning, forsvar, leg, opvarmning
│        — som FILTER på hubben, IKKE som egne URL'er. Se 1.2)
│
├── KLYNGE B: Regler (hub: /basketball-regler/)
│   ├── /traenerguides/minibasket-regler-for-nye-traenere/  (børneregler, satellit)
│   └── (evt. fremtidig /basketball-regler/skridt/ — kun jf. SEO-PLAN §6.2)
│
├── KLYNGE C: Træner-akademi (hub: /traenerguides/)
│   └── 5 guides /traenerguides/[slug]/            ← Article
│
├── KLYNGE D: Målgruppe-indgange (ingen fælles hub — bevidst)
│   ├── /basketball-for-boern/    (forældre-spor)
│   └── /boldspil-idraet/         (idrætslærer-spor)
│
├── PRODUKT: /app/                (PWA, uden for Astro) ← SoftwareApplication
└── META: /om/ (author-hub, E-E-A-T), /stoet/ (konvertering)
```

### 1.2 Kategorisider under /basketoevelser/ — NEJ (nu), med exit-kriterium

**Vurdering mod Ahrefs-data (SEO-PLAN §1):** de kategorinære søgeord er for små til egne sider: "dribling" 20/md (og generisk, ikke basket-intent), "basketball drills" 10/md, "basketball træning til børn" 10/md. Der findes ingen dokumenteret volumen på "skudøvelser basketball", "pasningsøvelser" osv. Med 13 øvelser fordelt på 6 kategorier ville `/basketoevelser/dribling/` blive en side med 3–4 kort og ~50 ord unik tekst = **tynd side**, der kannibaliserer hubben (som allerede ranker på "basketball øvelser" 30/md, KD0) og fortynder crawl-budget for nul gevinst.

**Beslutning:** kategorier forbliver client-side filtre på hubben. Alle 13 kort er i DOM'en ved load (verificeret i `basketoevelser/index.astro` — filtret skjuler kun med `display:none`), så crawlere og AI-bots ser alt indhold. Det er den rigtige arkitektur nu.

**Exit-kriterium (genbesøg kvartalsvist):** opret `/basketoevelser/[kategori]/` når **begge** er opfyldt:
1. ≥ 8 øvelser i kategorien (nok til en ikke-tynd side), og
2. GSC viser ≥ 50 visninger/md på kategorinære queries ("drible øvelser børn", "skudøvelser basketball" el.lign.), eller Ahrefs viser ny volumen ≥ 50/md.

Når det sker: kategorisiden får `CollectionPage` + `ItemList`, 150–250 ords unik indledning (answer-first), breadcrumb Forside → Basketball-øvelser → Dribling, og hubbens filterknap for kategorien bliver et rigtigt `<a>`-link. Første kandidat bliver `drible` (flest øvelser + "dribling" 20/md).

### 1.3 URL-konventioner (kodificér — gælder alt nyt)

| Regel | Eksempel |
|---|---|
| Små bogstaver, bindestreger, æ/ø/å translittereres (ø→oe, å→aa, æ→ae) | `/basketoevelser/foelg-lederen/` |
| Trailing slash altid (allerede i `astro.config.mjs`: `trailingSlash: 'always'`) | `/basketball-regler/` |
| Ingen datoer, ingen stopord-fyld, max ~4 ord i slug | `/traenerguides/kampdag-med-flere-kampe/` ✓ |
| Max 2 mappe-niveauer (hub/side) — aldrig `/basketoevelser/drible/u8/trafiklys/` | — |
| URL'er ændres ALDRIG efter publicering (title/H1 justeres i stedet, jf. SEO-PLAN §3.1) | — |
| Nye målgruppe-sider ligger i roden (som `/boldspil-idraet/`), ikke under kunstige hubs | — |

### 1.4 Breadcrumb-hierarki (visuelt + schema, se §2.5)

| Sidetype | Sti |
|---|---|
| Øvelse | Forside → Basketball-øvelser → {Øvelsens navn} |
| Guide | Forside → Trænerguides → {Guidens navn} |
| Hub/landing (regler, boldspil, for-børn, om, støt) | Forside → {Sidens navn} |
| Forside | (ingen breadcrumb) |

Kategorien vises fortsat som **tekst** i øvelsernes visuelle brødkrumme (`Basketball-øvelser / Dribling`), men indgår IKKE i BreadcrumbList-schemaet, da den ikke har en URL. Schema må kun indeholde rigtige, kanoniske URL'er.

### 1.5 Pagineringspolitik

- **Nu:** ingen paginering. 13 øvelser (og selv 40) renderes fint på én hub-side; client-side filter erstatter paginering.
- **Grænse:** ved > 50 øvelser indføres paginering med `/basketoevelser/2/` (Astros `paginate()`), `rel="prev/next"`-agtig intern linking (Google ignorerer rel-tags, men linkstrukturen tæller), self-canonical pr. paginerede side (IKKE canonical til side 1), og side 2+ får `title`-suffix "— side 2". Filtre forbliver client-side og sætter aldrig indekserbare query-URL'er.
- **Aldrig:** `?alder=U8`-URL'er i sitemap eller interne links. Hvis filter-state på et tidspunkt lægges i URL'en (UX-ønske), brug `#`-fragment eller `history.replaceState` + self-canonical uden parametre.

### 1.6 Planlagt udvidelse med søgevolumen-belæg (fra SEO-PLAN §6)

| Ny side | Volumen-belæg | Klynge | Hvornår |
|---|---|---|---|
| `/udstyr/basketball-kurv-boern/` | 200 + 70 (indendørs) + 50 (net) + 10 (højde) /md | Ny klynge E: Udstyr (forældre) | Når DR/trafik-autoritet er etableret (3–6 mdr.), jf. SEO-PLAN §6.1 |
| `/udstyr/basketball-sko-boern/` | 90/md | Klynge E | Samme |
| `/udstyr/` (hub) | — (kun hvis ≥ 3 undersider) | Klynge E | Efter de to første |
| `/boldspil-idraet/aarsplan/` el. sektion | sæson ("basketball i skolen") | Klynge D | Juli/aug. før skolestart |
| `/basketball-regler/skridt/` | 80/md — KUN hvis #skridtregler-sektionen ikke ranker top-5 efter 3 mdr. | Klynge B | Oktober 2026-tjek |

Udstyrsklyngen får sin egen hub-mappe `/udstyr/` fordi den har kommerciel intent og evt. affiliate — hold den adskilt fra det redaktionelle. Alt andet nyt indhold placeres i eksisterende klynger. **Opret aldrig en side uden en række i denne tabel (dvs. uden dokumenteret volumen eller strategisk funktion).**

---

## 2. Schema markup-arkitektur (sammenhængende JSON-LD-graf)

### 2.1 Princip: én graf, faste `@id`-noder

I dag udsender hver side isolerede schema-objekter uden relationer. Målet er en **entitetsgraf**, hvor Google/AI kan koble alt til de samme fire kerne-noder:

| `@id` | Type | Udsendes |
|---|---|---|
| `https://minibasket.dk/#organization` | `Organization` | Alle sider (via Base.astro) |
| `https://minibasket.dk/#website` | `WebSite` | Alle sider (via Base.astro) |
| `https://minibasket.dk/om/#frederik` | `Person` | Alle sider (via Base.astro) + fuld version på /om/ |
| `https://minibasket.dk/app/#app` | `SoftwareApplication` | PWA'ens index.html + refereret fra sider der omtaler appen |

Sidespecifikke schemas (`HowTo`, `Article`, `FAQPage`, `BreadcrumbList`, `CollectionPage`) **refererer** til disse noder med `{ "@id": "..." }` i stedet for at gentage navn/URL.

### 2.2 Implementering i Base.astro (én ændring, virker på alle 25 Astro-sider)

Base.astro bygger en `@graph` af (a) de tre globale noder, (b) BreadcrumbList genereret fra ny `breadcrumbs`-prop, (c) sidens egne schemas fra `schema`-proppen:

```astro
---
// Base.astro — udvidet frontmatter
interface Crumb { name: string; href: string }
interface Props {
  title: string;
  description: string;
  ogType?: string;
  schema?: object | object[];
  breadcrumbs?: Crumb[];          // NY — udelades på forsiden
}
const { title, description, ogType = 'website', schema, breadcrumbs } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);

const ORG_ID = 'https://minibasket.dk/#organization';
const SITE_ID = 'https://minibasket.dk/#website';
const PERSON_ID = 'https://minibasket.dk/om/#frederik';

const globale = [
  {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Mini Basket',
    alternateName: 'minibasket.dk',
    url: 'https://minibasket.dk/',
    logo: { '@type': 'ImageObject', url: 'https://minibasket.dk/icon.svg' },
    description: 'Gratis basketball-øvelser, trænerguides og en app til fair spilletid i dansk børnebasket (U6–U12).',
    founder: { '@id': PERSON_ID },
    sameAs: [
      // Udfyld når profilerne findes — se §5.3. Tom array er OK indtil da.
      // 'https://github.com/<repo>',
      // 'https://www.linkedin.com/in/<frederik>',
    ],
  },
  {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: 'Mini Basket',
    url: 'https://minibasket.dk/',
    inLanguage: 'da',
    description: 'Basketball-øvelser og trænerguides til børnebasket — og en gratis app der giver nemt styr på spilletiden.',
    publisher: { '@id': ORG_ID },
  },
  {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Frederik Nørgaard',
    jobTitle: 'Frivillig børnebasket-træner',
    url: 'https://minibasket.dk/om/',
    worksFor: { '@id': ORG_ID },
    knowsAbout: ['minibasket', 'børnebasket', 'basketballtræning for børn', 'fair spilletid'],
  },
];

const crumbSchema = breadcrumbs && {
  '@type': 'BreadcrumbList',
  '@id': `${canonical}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Forside', item: 'https://minibasket.dk/' },
    ...breadcrumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: c.name,
      item: new URL(c.href, Astro.site).toString(),
    })),
  ],
};

const graf = {
  '@context': 'https://schema.org',
  '@graph': [
    ...globale,
    ...(crumbSchema ? [crumbSchema] : []),
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
  ],
};
---
<!-- i <head>: -->
<script type="application/ld+json" set:html={JSON.stringify(graf)} />
```

**VIGTIGT ved migrering:** sidernes egne schemas skal fjerne deres `'@context'` (grafen har én fælles) og udskifte de inline `author`/`publisher`-objekter med `@id`-referencer. Forsidens nuværende `WebSite`-schema i `index.astro` **slettes** (den globale node overtager). Øvelses-hubbens `CollectionPage` beholdes men får `@id` og `isPartOf`.

### 2.3 SearchAction — NEJ

Sitet har ingen søgefunktion og ingen `/soeg?q=`-URL. `SearchAction` uden fungerende søge-endpoint er ugyldigt markup. Tilføj kun hvis der en dag bygges on-site-søgning (fx Pagefind). Sitelinks searchbox er desuden udfaset af Google — lav prioritet selv da.

### 2.4 SoftwareApplication for appen (NY — mangler helt i dag)

Placeres i **PWA'ens `index.html`** (`minibasket-app`, deployes til /app/) OG refereres fra Astro-sider der handler om appen. Bemærk `offers.price: "0"` — gratis-signalet er både SEO- og GEO-guld ("hvilke gratis apps findes til …"-prompts):

```json
{
  "@context": "https://schema.org",
  "@type": ["SoftwareApplication", "WebApplication"],
  "@id": "https://minibasket.dk/app/#app",
  "name": "Mini Basket-appen",
  "url": "https://minibasket.dk/app/",
  "description": "Gratis app til børnebasket-trænere: planlæg perioderne før kampen, følg spilletiden live og giv alle børn fair tid på banen. Virker på alle telefoner.",
  "applicationCategory": "SportsApplication",
  "operatingSystem": "Web (alle telefoner og browsere)",
  "browserRequirements": "Kræver en moderne browser. Kan installeres som app (PWA).",
  "inLanguage": "da",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "DKK" },
  "isAccessibleForFree": true,
  "author": { "@id": "https://minibasket.dk/#organization" },
  "featureList": [
    "Automatisk fordeling af spilletid i perioder",
    "Live-overblik over hver spillers spilletid",
    "Kampur, score og periode på én skærm",
    "Flere kampe på samme dag (stævnedage)",
    "Synkronisering mellem flere trænere"
  ]
}
```

**Ingen** `aggregateRating` — der findes ingen ægte anmeldelser (se §5.4).

### 2.5 BreadcrumbList — udrulning pr. side

Med Base.astro-ændringen (§2.2) er det ét prop-kald pr. side:

```astro
<!-- øvelse ([slug].astro) -->
<Base ... breadcrumbs={[
  { name: 'Basketball-øvelser', href: '/basketoevelser/' },
  { name: d.title, href: `/basketoevelser/${entry.id}/` },
]}>

<!-- guide -->
breadcrumbs={[
  { name: 'Trænerguides', href: '/traenerguides/' },
  { name: d.title, href: `/traenerguides/${entry.id}/` },
]}

<!-- landingssider (regler, boldspil, for-børn, om, støt, hubs) -->
breadcrumbs={[{ name: 'Basketball-regler', href: '/basketball-regler/' }]}
```

### 2.6 Pr. sidetype: findes vs. mangler + mål-markup

| Side | Findes i dag | Ændringer |
|---|---|---|
| `/` (forside) | `WebSite` (isoleret) | Slet lokalt WebSite-schema (global node overtager). Intet sidespecifikt schema nødvendigt. |
| `/basketoevelser/` | `CollectionPage` | Tilføj `@id`, `isPartOf: {'@id': SITE_ID}`, og `mainEntity` som `ItemList` over alle øvelser (name + url pr. øvelse) — styrker hub-status og giver AI en maskinlæsbar indholdsfortegnelse. |
| `/basketoevelser/[slug]/` | `HowTo` (god: steps, tools, totalTime, audience) | Tilføj: `'@id': canonical#howto`, `author: {'@id': PERSON_ID}`, `publisher`-ref, `dateModified` (nyt frontmatter-felt, §4.1), `isPartOf: {'@id': SITE_ID}`, `mainEntityOfPage: canonical`. |
| `/traenerguides/` | intet | `CollectionPage` + `ItemList` (samme mønster som øvelses-hub). |
| `/traenerguides/[slug]/` | `Article` (author = Organization) | **Skift `author` til `{'@id': PERSON_ID}`** (Person > Organization for E-E-A-T), behold publisher som org-ref, tilføj `dateModified`. |
| `/basketball-regler/` | `Article` + `FAQPage` | Skift author til Person-ref; `dateModified` opdateres ved hver indholdsrettelse (er hardcodet i dag — flyt til konstant øverst i filen så den huskes). |
| `/basketball-for-boern/` | `Article` + `FAQPage` | Samme. |
| `/boldspil-idraet/` | `Article` + `ItemList` | Samme + `ItemList.itemListElement[].url` skal bruge `#`-ankre til hver leg. |
| `/om/` | intet | `AboutPage` med `mainEntity: {'@id': PERSON_ID}` + den FULDE Person-node (med `description`, `alumniOf`/klub-tilknytning hvis ønsket). Se §5.1. |
| `/stoet/` | intet | Ingen tilføjelse (DonateAction er ikke understøttet i SERP og ikke besværet værd). |
| `/app/` (PWA) | intet | `SoftwareApplication` jf. §2.4. |
| `SportsActivityLocation` | — | **NEJ.** Sitet er ikke et fysisk sted; markup'en ville være misvisende og kan udløse manual action for irrelevant structured data. |
| `VideoObject` | — | Fremtid: hvis øvelser får video, tilføj som `video`-property på HowTo — stærkt featured-snippet-signal. Ikke nu. |

### 2.7 Komplet eksempel — øvelsesside efter migrering (mål-tilstand)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://minibasket.dk/#organization", "...": "(global node)" },
    { "@type": "WebSite", "@id": "https://minibasket.dk/#website", "...": "(global node)" },
    { "@type": "Person", "@id": "https://minibasket.dk/om/#frederik", "...": "(global node)" },
    {
      "@type": "BreadcrumbList",
      "@id": "https://minibasket.dk/basketoevelser/trafiklys-dribling/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Forside", "item": "https://minibasket.dk/" },
        { "@type": "ListItem", "position": 2, "name": "Basketball-øvelser", "item": "https://minibasket.dk/basketoevelser/" },
        { "@type": "ListItem", "position": 3, "name": "Trafiklys-dribling", "item": "https://minibasket.dk/basketoevelser/trafiklys-dribling/" }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://minibasket.dk/basketoevelser/trafiklys-dribling/#howto",
      "name": "Trafiklys-dribling",
      "description": "Legende drible-øvelse til U6 og U8 …",
      "inLanguage": "da",
      "totalTime": "PT8M",
      "datePublished": "2026-06-25",
      "dateModified": "2026-07-15",
      "author": { "@id": "https://minibasket.dk/om/#frederik" },
      "publisher": { "@id": "https://minibasket.dk/#organization" },
      "isPartOf": { "@id": "https://minibasket.dk/#website" },
      "mainEntityOfPage": "https://minibasket.dk/basketoevelser/trafiklys-dribling/",
      "audience": { "@type": "Audience", "audienceType": "Børnebasket-trænere (U6, U8)" },
      "tool": [{ "@type": "HowToTool", "name": "1 bold pr. spiller" }],
      "step": [
        { "@type": "HowToStep", "position": 1, "text": "Alle børn har en bold …" }
      ]
    }
  ]
}
```

**Validering efter implementering:** kør alle sidetyper gennem Rich Results Test + schema.org-validator; tjek i GSC → Forbedringer at FAQ/HowTo/Breadcrumb registreres uden fejl.

---

## 3. GEO / AI-venlighed (ChatGPT, Perplexity, Google AI Overviews)

AI-svar citerer sider, der (a) må crawles, (b) svarer præcist og selvstændigt pr. sektion, (c) indeholder citérbare tal/fakta, (d) har tydelig kilde-/dato-autoritet. Regelsiden er allerede tæt på idealet — mønstret skal systematiseres.

### 3.1 robots.txt — eksplicit AI-politik (erstat `site/public/robots.txt`)

**Anbefaling: tillad alle AI-crawlere.** Begrundelse: forretningsmodellen er synlighed → app-brug → donationer. Der er intet betalt indhold at beskytte, og hver AI-citation af "minibasket.dk siger at en FIBA-kamp varer 4×10 min" er gratis distribution til præcis målgruppen. Omkostningen (crawl-load på et statisk Vercel-site) er nul. At blokere Google-Extended ville desuden IKKE fjerne sitet fra AI Overviews (som styres af almindelig Googlebot), kun fra Gemini-træning — og træningssynlighed er her et aktiv, ikke en risiko.

```txt
# minibasket.dk — robots.txt
# Politik: alt indhold er gratis og må gerne læses, citeres og bruges
# af søgemaskiner og AI-assistenter. Kilde-kreditering værdsættes.

User-agent: *
Allow: /

# --- AI-crawlere: eksplicit tilladt ---
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://minibasket.dk/sitemap-index.xml
```

(De eksplicitte Allow-blokke ændrer intet funktionelt oven på `User-agent: *` — men de dokumenterer politikken, beskytter mod at en fremtidig generel Disallow ved et uheld rammer AI-bots, og er et bevidst signal.)

**Sitemap-fix samtidig:** `/app/` er i dag hverken i Astro-sitemap (filtreret fra) eller andre sitemaps. Tilføj i `astro.config.mjs`:

```js
sitemap({
  filter: (page) => !page.includes('/app/'),
  customPages: ['https://minibasket.dk/app/'],
}),
```

### 3.2 llms.txt — konkret indhold (ny fil: `site/public/llms.txt`)

```markdown
# Mini Basket (minibasket.dk)

> Dansk site om børnebasket (minibasket, U6–U12): gratis basketball-øvelser,
> trænerguides, de danske og internationale basketballregler forklaret på dansk —
> og en gratis web-app, der fordeler spilletiden fair mellem alle børn på et hold.
> Alt indhold er på dansk, skrevet af en frivillig børnebasket-træner, og gratis
> uden reklamer. Officielle danske regler: Danmarks Basketball Forbund (basket.dk).

Nøglefakta om sitet:
- "Minibasket" er dansk basketball for børn (ca. 6–12 år, U6–U12) med lavere kurve,
  mindre bolde og krav om, at alle børn skal spille.
- Mini Basket-appen (minibasket.dk/app/) er gratis, kræver ingen installation og
  planlægger perioder + viser spilletid live under kampen.
- En basketballkamp (FIBA/Danmark) varer 4 × 10 minutters effektiv spilletid,
  reelt 1½–2 timer. NBA: 4 × 12 minutter.

## Regler
- [Basketball-regler — enkelt forklaret](https://minibasket.dk/basketball-regler/):
  skridtregler, point (1/2/3), kamplængde, tidsregler (24/8/5/3 sek.), fouls,
  forskelle mellem FIBA, NBA og dansk basketball. Inkl. FAQ.
- [Minibasket-regler for nye trænere](https://minibasket.dk/traenerguides/minibasket-regler-for-nye-traenere/):
  de danske børneregler i praksis — lavere kurve, mindre bolde, alle skal spille.

## Øvelser
- [Basketball-øvelser til børn, U6–U12](https://minibasket.dk/basketoevelser/):
  13+ gratis øvelser med trin-for-trin-instruktion, alder, varighed og rekvisitter.
  Kategorier: dribling, skud, pasning, forsvar, leg, opvarmning.

## Trænerguides
- [Trænerguides til børnebasket](https://minibasket.dk/traenerguides/): din første
  træning, fair spilletid, forældresamarbejde, kampdag med flere kampe.

## Forældre og idrætslærere
- [Basketball for børn — kom i gang](https://minibasket.dk/basketball-for-boern/):
  startalder, hvad minibasket er, klub, pris, udstyr og boldstørrelse (str. 4/5).
- [Sjove boldspil til idræt](https://minibasket.dk/boldspil-idraet/): 10 boldlege
  til idrætsundervisning, 0.–6. klasse, uden forberedelse.

## App og projekt
- [Mini Basket-appen](https://minibasket.dk/app/): gratis værktøj til fair
  spilletid i børnebasket. Web-app, virker på alle telefoner.
- [Om Mini Basket](https://minibasket.dk/om/): bygget af Frederik Nørgaard,
  frivillig børnetræner i en dansk klub. Drevet af donationer, ingen reklamer.

## Optional
- [Støt projektet](https://minibasket.dk/stoet/)
```

**llms-full.txt: NEJ (endnu).** Sitet er 26 sider med rene, statiske HTML-sider som alle bots kan læse direkte — en fuld-tekst-dump vedligeholdt i hånden ville drifte fra indholdet og skade mere end gavne. Genbesøg hvis sitet passerer ~75 sider, og generér den i så fald automatisk i Astro-buildet (endpoint `src/pages/llms-full.txt.ts` der renderer alle collections til markdown), aldrig manuelt.

### 3.3 Answer-first indholdsstruktur (obligatorisk mønster)

Regelsiden gør det allerede rigtigt ("Den regel, flest spørger om: **du må tage to skridt** …"). Kodificér som regel for ALT indhold:

1. **Første afsnit under hver H2 = svaret**, komplet i 40–60 ord, med tal og fed på nøglefakta. Sektionen skal kunne løftes ud og stå alene som AI-citat.
2. **H2'er formuleres som søgninger/spørgsmål** hvor det er naturligt ("Hvor lang tid tager en basketballkamp?" — ikke "Kampens varighed").
3. **Uddybning, eksempler og forbehold** kommer EFTER svaret, aldrig før.
4. **Aldrig "se nedenfor"-svar:** hver sektion selvbærende; interne links supplerer, de erstatter ikke svaret.

### 3.4 "Nøglefakta"-boks (ny komponent: `site/src/components/NoegleFakta.astro`)

Citerbare tal samlet ét sted øverst på landingssider — det format AI-modeller og featured snippets foretrækker at løfte:

```astro
---
interface Props { fakta: { label: string; value: string }[] }
const { fakta } = Astro.props;
---
<aside class="noeglefakta" aria-label="Nøglefakta">
  <span class="toc-title">Nøglefakta</span>
  <dl>
    {fakta.map((f) => (<><dt>{f.label}</dt><dd>{f.value}</dd></>))}
  </dl>
</aside>
```

(Styling: genbrug `.toc`-kortets udseende.) Indsættes efter lede-afsnittet på:
- **/basketball-regler/**: Spillere på banen: 5 mod 5 · Kamplængde (FIBA): 4 × 10 min · Kurvhøjde: 3,05 m · Point: 1 / 2 / 3 · Fouls før udvisning: 5 · 3-pointslinje: 6,75 m
- **/basketball-for-boern/**: Startalder: typisk 5–6 år (U6) · Boldstørrelse: 4 (U6–U10), 5 (U12) · Kurvhøjde: lavere end voksnes 3,05 m · Pris: typisk kontingent-niveau · Krav: ingen forudsætninger
- **/app/-relaterede sektioner**: Pris: gratis · Platform: alle telefoner (web-app) · Opsætning: 2 minutter

### 3.5 Konsistent entitetssprog (skriveregler — ind i skabelonerne §4)

AI-modeller bygger entitetsforståelse af konsistens. Fastlæg og håndhæv:

| Term | Bruges om | Aldrig |
|---|---|---|
| **minibasket** (lille m) | Sporten/formatet: dansk børnebasket med tilpassede regler | "mini-basket", "mini basket" om sporten |
| **Mini Basket** | Brandet/projektet/sitet | "MiniBasket" |
| **Mini Basket-appen** | Produktet — brug ALTID den fulde form ved første omtale pr. side | "appen" som første omtale |
| **børnebasket** | Kategorien bredt (U6–U12) | "ungdomsbasket" om U6–U12 |
| **fair spilletid** | Kernebegrebet — altid denne kollokation | "lige spilletid", "retfærdig spilletid" |
| **Danmarks Basketball Forbund (DBBF, basket.dk)** | Kilden — fuld form første gang pr. side | kun "forbundet" |

Første afsnit på hver side skal naturligt indeholde mindst to af kerneentiteterne (minibasket/børnebasket + Mini Basket-appen hvor relevant).

### 3.6 Synlige opdateringsdatoer (dateModified)

- Nyt frontmatter-felt `opdateret` i begge collections (§4.1). Vises med den eksisterende `.updated`-klasse: `Opdateret {fmtDato(d.opdateret)}` — øverst på øvelser og guides ligesom på regelsiden.
- `dateModified` i Article/HowTo-schema = `opdateret`-feltet.
- **Ærlighedsregel:** `opdateret` bumpes kun ved reel indholdsændring (nye trin, rettede fakta, nye sektioner) — aldrig ved typo/styling. Falske friskhedssignaler opdages og straffes.
- Regelsider gennemgås fast **hver juli** (før sæsonstart) og datoen opdateres — "Opdateret 2026" i meta-description (allerede live) skal altid matche.

### 3.7 Sammenligningstabeller

Regelsidens FIBA/NBA/minibasket-tabeller er præcis det format, AI Overviews løfter. Udvid mønstret:
- **/basketball-for-boern/**: tabel Alder → U-gruppe → boldstørrelse → kurvhøjde → kamplængde (også fremragende snippet-mad for "basketball kurv højde børn", 10/md info-intent).
- **/boldspil-idraet/**: hurtig-vælger-tabellen (leg → klassetrin → rekvisitter → tid) findes jf. SEO-PLAN — behold og hold `<table>`-markup (aldrig div-grids til tabeldata).
- **Fremtidig /udstyr/**: størrelsesguide-tabeller bliver kerneformatet.

### 3.8 Definitionsbokse

Ved første brug af et fagbegreb på en side: én sætnings definition i **fed term + almindelig forklaring**, evt. som `blockquote` (styling findes). Minimum på tværs af sitet: *minibasket*, *travelling/skridt*, *pivotfod*, *effektiv spilletid*, *bonus/holdfouls*, *U6–U12*. AI-modeller citerer definitioner hyppigere end noget andet format ("hvad er minibasket" er en oplagt prompt sitet skal eje på dansk).

---

## 4. Indholdsskabeloner (alt nyt indhold er SEO+GEO-klart pr. konstruktion)

### 4.1 Udvid content.config.ts (begge collections)

```ts
const ovelser = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ovelser' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(155),
    aldersgruppe: z.array(z.enum(['U6', 'U8', 'U10', 'U12'])).nonempty(),
    kategori: z.enum(['drible', 'skud', 'pasning', 'forsvar', 'leg', 'opvarmning']),
    spillere: z.string(),
    varighed: z.number().int().positive(),
    rekvisitter: z.array(z.string()),
    trin: z.array(z.string()).min(3),
    publiceret: z.coerce.date(),
    opdateret: z.coerce.date().optional(),      // NY → dateModified + synlig dato
    laerer: z.string().max(120).optional(),     // NY: "Hvad børnene lærer" — én citerbar sætning
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(155),
    publiceret: z.coerce.date(),
    opdateret: z.coerce.date().optional(),      // NY
    laesetid: z.number().int().positive().optional(), // NY: minutter, vises ved titlen
  }),
});
```

I `[slug].astro`-filerne: `dateModified: (d.opdateret ?? d.publiceret).toISOString().slice(0, 10)`.

### 4.2 Øvelse-template (`src/content/ovelser/*.md`)

**Frontmatter:** alle felter fra §4.1. `trin` skrives så hvert trin er én handlingssætning (de bliver HowToStep-tekster 1:1 — ingen "se ovenfor"-referencer i trin).

**Brødtekst-struktur (fast rækkefølge):**

```markdown
[Åbningsafsnit, 40–70 ord — ANSWER-FIRST: hvad øvelsen er, hvem den passer til,
 hvad den træner. Skal kunne stå alene som AI-citat. Nævn kategori-søgeordet
 naturligt ("drible-øvelse til U6 og U8").]

## Sådan gør du
[Prosa-udgave af trinnene med trænertips — trinlisten renderes separat fra frontmatter.]

## Variationer
[2–3 variationer: nemmere (yngste årgang) og sværere. H3 pr. variation ved >3.]

## Hvad børnene lærer
[3–5 punkter. Første punkt = `laerer`-feltet ordret.]
```

**Heading-regler:** H1 kommer fra layoutet (title) — brødtekst starter ved H2. Aldrig H2 → H4-spring. H2'er er faste (genkendelighed for brugere OG parsere).

**Intern linking-krav (min. 2 kontekstuelle links pr. øvelse ud over de automatiske):** layoutet leverer allerede guide-link (`GUIDE_FOR_KATEGORI`), regel-link (skud/forsvar) og 3 relaterede øvelser. Brødteksten skal derudover indeholde mindst 1 link til en anden konkret øvelse ("fortsæt med [Skyggedribling](/basketoevelser/skyggedribling/)") og gerne 1 til en guide-sektion.

### 4.3 Guide-template (`src/content/guides/*.md`)

```markdown
[Lede, 50–80 ord — answer-first: guidens hovedpåstand/-svar komprimeret.
 Indeholder primært søgeord + mindst to kerneentiteter (§3.5).]

[VED >1.000 ORD: indholdsfortegnelse — genbrug .toc-markup med ankerlinks.]

## [Spørgsmåls- eller søgeformuleret H2]
[Første afsnit = svaret (40–60 ord, tal i fed). Derefter uddybning.]

## [3–6 H2-sektioner i alt; H3 til delspørgsmål]

## Ofte stillede spørgsmål   ← KUN hvis spørgsmålene ikke findes på regel-/forældresiden
[3–5 spørgsmål; svar 40–55 ord. Kræver FAQPage-schema tilføjet i [slug].astro
 via nyt frontmatter-felt `faq: [{q,a}]` hvis det tages i brug — ellers udelad sektionen.]
```

**Krav pr. guide:** 800–1.800 ord · min. **3 kontekstuelle interne links** i brødteksten (1 op til relevant hub, 1 til en søster-guide eller øvelse, 1 valgfrit) + CtaBox (automatisk) · ekstern kildehenvisning til basket.dk/DBBF hvor der refereres til danske regler/strukturer · `opdateret` sættes ved revision.

**FAQ-dublet-regel (fra SEO-PLAN §2.4, håndhæves her):** ét spørgsmål lever ét sted på sitet. Før en FAQ tilføjes: søg på tværs af `basketball-regler.astro` og `basketball-for-boern.astro`. Findes spørgsmålet, linkes der i stedet.

### 4.4 Regel-/FAQ-sidetype (statiske .astro-landingssider som regelsiden)

Fast skabelon (regelsiden ER referenceimplementeringen — kopiér dens mønster):

1. Eyebrow + H1 + synlig `Opdateret {måned år}` (`.updated`)
2. Lede (50–80 ord, answer-first, ekstern autoritetskilde nævnt)
3. **NøgleFakta-boks** (§3.4)
4. `.toc`-indholdsfortegnelse med ankerlinks (alle H2 har `id`)
5. 5–10 H2-sektioner — hver med answer-first-afsnit; tabeller for alt sammenligneligt
6. Én sektion med linkcard til klyngens satellit-side (anti-kannibalisering, max ~100 ord om naboemnet)
7. `## Ofte stillede spørgsmål` — 4–6 spørgsmål, svar 40–55 ord, spejles 1:1 i FAQPage-schema (byg altid HTML og schema fra samme `faq`-array, som regelsiden gør)
8. CtaBox med side-specifik kampagne
9. `## Læs også` — 3 links (op/ned/sidelæns i klyngen)

**Schema:** `Article` (+`FAQPage` hvis FAQ) med Person-author-ref, breadcrumbs-prop, `@id`-referencer jf. §2.

### 4.5 Heading- og linkregler på tværs (lint-bar tjekliste)

- Præcis én H1 pr. side (fra layout/title-flow); H2 = sektioner; H3 = delspørgsmål/varianter; aldrig dybere end H3 i markdown.
- Alle H2 på .astro-landingssider har `id`-anker (kebab-case, dansk uden æøå).
- Ankertekster er beskrivende og søgeordsnære — aldrig "læs mere"/"klik her".
- Hver ny side skal ved publicering modtage **mindst 2 indgående interne links** fra eksisterende sider (typisk: hub + 1 kontekstuel). En side uden indgående links publiceres ikke.
- Eksterne links til autoriteter (basket.dk, FIBA): normale følgbare links med `rel="noopener"` — ingen nofollow (vi VIL associeres med dem).

---

## 5. E-E-A-T

### 5.1 /om/ som author-hub (udbygning af eksisterende side)

Siden har historien men mangler personen som **navngiven entitet**. Ændringer i `om.astro`:

1. **Ny sektion `## Hvem står bag?`** med navn: "Mini Basket er bygget og skrevet af **Frederik Nørgaard**, frivillig børnebasket-træner i en dansk klub. Appen er udviklet til hans eget hold og brugt gennem en fuld sæson — øvelserne og guiderne er de samme, som bruges til holdets træninger." (+ foto hvis muligt — ansigter styrker både E-E-A-T og donationsvillighed).
2. **Schema:** `AboutPage` med `mainEntity: {'@id': 'https://minibasket.dk/om/#frederik'}` — Person-noden bor kanonisk her (Base.astro udsender kort-versionen globalt; /om/ kan berige med `description` og `sameAs`).
3. **Author-byline på indholdssider:** under H1 på guides og øvelser: `Af <a href="/om/">Frederik Nørgaard</a>, børnebasket-træner · Opdateret {dato}` — den visuelle pendant til Person-schemaet. Én linje, `.updated`-styling.

### 5.2 Kildehenvisninger (autoritets-association)

- Alle regel-påstande om dansk basket: link til **basket.dk** (DBBF) — regelsiden gør det allerede; håndhæv i skabelonen (§4.4).
- Hvor FIBA-regler citeres (24-sek., banemål): overvej ét link til FIBA's officielle regeldokument på regelsiden — én ekstra autoritetskilde, nul omkostning.
- Fremtidige sundheds-/udviklingspåstande ("børn der får spilletid udvikler sig") bør på sigt underbygges med DIF/DGI-kilder.

### 5.3 sameAs / eksterne entitets-ankre (forudsætning for stærk Organization-node)

Organization/Person uden eksterne profiler er en svag entitet. Anbefalet minimum (rækkefølge = prioritet):
1. **GitHub-repo** offentligt (open source-appen er i sig selv et E-E-A-T-signal: "byggede appen" bliver verificerbart) → sameAs på Organization.
2. **LinkedIn-profil** (Frederik) med Mini Basket nævnt → sameAs på Person.
3. Klub-omtale (fx SISU's hjemmeside/nyhedsbrev der nævner appen) — den vigtigste eksterne validering og det første "rigtige" backlink.

Indtil profilerne findes: `sameAs` udelades (tomme/døde links er værre end ingen).

### 5.4 Anmeldelser/udtalelser — Review-schema: **NEJ**

Forsidens tre trænerudtalelser (Mette/SISU, Jonas/Falcon, Camilla/Værløse) er **opdigtede placeholders**. Beslutning:
- **Intet `Review`/`aggregateRating`-markup** før der findes ægte, dokumenterbare udtalelser fra navngivne personer, der har givet samtykke. Fabrikerede reviews i structured data er direkte i strid med Googles retningslinjer (risiko: manual action mod AL structured data på sitet) — og en åbenlys omdømmerisiko i et lille dansk basketmiljø, hvor klubnavnene kan efterprøves.
- **Anbefaling ud over schema:** udskift placeholder-citaterne med ægte citater (selv ét enkelt ægte er stærkere end tre opdigtede), eller anonymisér dem tydeligt ("U8-træner, københavnsk klub") indtil ægte haves. Dette er en indholdsbeslutning til Frederik — flaget hermed rejst.
- Når ægte udtalelser findes: vis dem som nu (blockquotes). Review-schema er reelt kun berettiget på SoftwareApplication-noden og kræver da verificerbare enkeltanmeldelser.

### 5.5 Ærlighed i "bruges af klubber som"-strip

Trust-strippen på forsiden navngiver 5 klubber. Samme regel: skal kunne dokumenteres (mindst én træner i hver klub har reelt brugt appen), ellers omformulér ("Bygget og brugt i en københavnsk klub gennem en hel sæson"). AI-modeller OG journalister lever af at faktatjekke den slags — brandrisikoen overstiger konverteringsgevinsten.

---

## 6. Prioriteret roadmap

### Sprint 1 — Quick wins (kan implementeres NU, ~1 dag, kun eksisterende filer + 2 nye statiske filer)

| # | Opgave | Filer | Effekt |
|---|---|---|---|
| 1.1 | robots.txt med AI-politik (§3.1) | `site/public/robots.txt` | GEO-fundament; 5 min |
| 1.2 | `llms.txt` (§3.2, indholdet står klar) | `site/public/llms.txt` (ny) | AI-assistenters indeks over sitet; 10 min |
| 1.3 | `@graph` + Organization/WebSite/Person-noder + `breadcrumbs`-prop i Base.astro (§2.2) | `Base.astro` | Entitetsgraf på ALLE sider i én ændring — største enkeltstående schema-løft |
| 1.4 | breadcrumbs-prop sat på alle sider (§2.5); fjern forsidens lokale WebSite-schema | alle `pages/*.astro` | Breadcrumb rich results + hierarki-signal |
| 1.5 | Author → Person-ref i guide- og regelsidernes Article-schema; HowTo får author/publisher/`isPartOf` (§2.6) | `traenerguides/[slug].astro`, `basketoevelser/[slug].astro`, 3 landingssider | E-E-A-T i markup |
| 1.6 | SoftwareApplication-JSON-LD i PWA'ens index.html (§2.4) + `customPages: ['…/app/']` i sitemap (§3.1) | PWA `index.html`, `astro.config.mjs` | Appen bliver en Google/AI-entitet med pris = gratis |
| 1.7 | Byline "Af Frederik Nørgaard …" + `## Hvem står bag?` + AboutPage-schema (§5.1) | `om.astro`, guide/øvelses-layouts | Synlig E-E-A-T |

*Begrundelse:* alt ovenfor er markup/statiske filer — nul indholdsproduktion, ingen URL-ændringer, og det aktiverer breadcrumb-rich-results + entitetsgraf + AI-crawlerpolitik på én gang. Måleligt i GSC/Forbedringer inden for 2–4 uger.

### Sprint 2 — Næste sprint (~2–4 dage, indholdsnært)

| # | Opgave | Effekt |
|---|---|---|
| 2.1 | `opdateret`-felt i content.config.ts + synlig dato + `dateModified` i schema (§3.6, §4.1) | Friskhedssignal — vigtigst for regelklyngen |
| 2.2 | NøgleFakta-komponent + udrulning på regler/for-børn (§3.4) | Featured snippets + AI-citater |
| 2.3 | Answer-first-revision af de 5 guiders ledeafsnit + første afsnit under hver H2 (§3.3) | AI Overview-egnethed på klynge C |
| 2.4 | `ItemList`/`mainEntity` på begge hubs; CollectionPage på /traenerguides/ (§2.6) | Hub-autoritet, mulige sitelinks |
| 2.5 | Alderstabel (U-gruppe/bold/kurvhøjde) på /basketball-for-boern/ (§3.7) | Ejer "basketball kurv højde børn"-intent + AI-tabelcitater |
| 2.6 | Ægte udtalelser indhentes / placeholders anonymiseres (§5.4–5.5) | Fjerner brand-/policy-risiko |
| 2.7 | Rich Results Test + GSC-validering af hele graf-migreringen | QA |

*Begrundelse:* bygger direkte oven på Sprint 1-fundamentet; 2.1–2.3 er de tre stærkeste GEO-håndtag efter crawl-adgang.

### Sprint 3 — Senere (betinget/sæsonstyret)

| # | Opgave | Trigger |
|---|---|---|
| 3.1 | GitHub-repo offentligt + LinkedIn → `sameAs` udfyldes (§5.3) | Når Frederik er klar |
| 3.2 | Kategorisider under /basketoevelser/ | Exit-kriterium §1.2 opfyldt (≥8 øvelser i kategori + query-belæg) |
| 3.3 | `/basketball-regler/skridt/` | #skridtregler ikke top-5 efter 3 mdr. (oktober-tjek, SEO-PLAN §6.2) |
| 3.4 | Udstyrsklynge `/udstyr/…` (§1.6) | Trafik-autoritet etableret (3–6 mdr.); kræver annonce-mærkning ved affiliate |
| 3.5 | Årsplan-/skolestartsindhold på boldspil-klyngen | Juli–august 2027 (eller allerede aug. 2026 hvis kapacitet) |
| 3.6 | `llms-full.txt` som auto-genereret build-endpoint | Sitet > ~75 sider |
| 3.7 | Video på 3–5 kernøvelser + `VideoObject` i HowTo | Når videoproduktion er realistisk |

**Løbende (kvartalsvis rutine):** GSC-kannibaliseringstjek (SEO-PLAN §4) · exit-kriterie-tjek §1.2 · regelside-revision hver juli med `dateModified`-bump · AI-synlighedstjek: prompt ChatGPT/Perplexity på dansk med "hvor lang tid varer en basketballkamp", "basketball øvelser til børn", "hvad er minibasket", "gratis app spilletid børnebasket" og log om minibasket.dk citeres (simpelt regneark; baseline nu, herefter kvartalsvist).
