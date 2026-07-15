# Design-brief: minibasket.dk (fra Frederiks Claude-design "1B Onyx Gold")

_Kilde: claude.ai design-projekt "Minibasket designforslag", fil "Minibasket.dk - Hjemmeside.dc.html" (udtrukket 15/7-26)._

## Farvepalet (Onyx Gold)
- Baggrund (mørk onyx): `#0b0b0d`, `#111013`, `#1a1915`, `#171310`, `#22201a`
- Guld (primær accent): `#e6cf9a`, `#cda85f`, `#c99f52`, `#e3c789`, `#c9a862`, `#e6c073`
- Guld-gradienter: `linear-gradient(160deg,#f4e3b6,#c99f52)` og `linear-gradient(180deg,#e6cf9a,#cda85f)` (bruges på hero-overskrift og primære knapper)
- Lys tekst/creme: `#f2ede2`, `#f4ecda`, `#ecd9ab`
- Dæmpet tekst: `#b7b0a0`, `#a49b86`, `#8a8578`, `#6f6a5e`
- Vin-accent (sekundær, fra appen): `#8e2c3b`
- Fonts: behold sitets nuværende (Fraunces serif til overskrifter, Inter til brødtekst, JetBrains Mono til eyebrows) — matcher designets stil.

## Sidestruktur — forsiden (fra designet)
1. **Sticky nav**: logo + "Sådan virker det", "Funktioner", "Øvelser", "Trænere" (anker-links) + guld-knap "Åbn app" → /app/
2. **Hero**: stor serif-overskrift med guld-gradient + underlinje + 2 knapper ("Åbn app'en" guld, "Se funktioner" ghost) + telefon-mockup af appens Tid & Score-skærm (CSS-mockup, ingen billeder)
3. **Trust-strip**: klubnavne (SISU, Falcon m.fl.)
4. **"Klar på tre trin"**: Opret dit hold → Lad app'en fordele → Styr kampen
5. **Funktioner** (3 kort): Spilletid-overblik / Rotation & perioder / Tid & score
6. **Øvelser til børn**: kort med kategorierne drible/skud/forsvar → /basketball-oevelser/-hubben ("Udforsk øvelser")
7. **Skærmbillede-galleri** ("Smuk i brug") — CSS-mockups
8. **Trænerudtalelser** (2-3 citater)
9. **CTA-footer**: "Klar til næste kamp?" + Åbn app'en

## ORDLYD — VIGTIGT (Frederiks krav)
- **FJERN alt med "retfærdig/retfærdigt/retfærdighed"** — overalt på sitet, også i eksisterende guides.
- Undgå moraliserende framing ("fortjener", "alle har ret til"). Designets H1 "Hver spiller fortjener banen." SKAL erstattes.
- Tonen er **praktisk og nem**: appen er **nem**, den **fordeler spilletiden så ingen spiller for meget**, og giver **styr på hvor meget hver spiller spiller — også på tværs af flere kampe samme dag**.
- Forslag H1: "Nemt styr på spilletiden." Sub: "Mini Basket fordeler minutterne, så ingen spiller for meget — og du har fuldt overblik, selv når I spiller flere kampe på én dag."
- "Fair spilletid" som begreb må gerne bruges sparsomt (det er appens etablerede feature-navn), men aldrig "retfærdig".

## Scope
- Onyx Gold-designet gælder **content-sitet** (site/src). **PWA'en i /app/ ændres IKKE** (den beholder champagne-designet).
- Mobil-first, ingen tunge billeder (CSS-mockups), Core Web Vitals i top.
