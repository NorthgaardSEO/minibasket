export const SITE_NAME = 'Mini Basket';
export const TAGLINE = 'Nemt styr på spilletiden.';

export const KATEGORI_LABELS: Record<string, string> = {
  drible: 'Dribling',
  skud: 'Skud',
  pasning: 'Pasning',
  forsvar: 'Forsvar',
  leg: 'Leg',
  opvarmning: 'Opvarmning',
};

export const ALDERSGRUPPER = ['U6', 'U8', 'U10', 'U12'] as const;

/** Hvilken guide er mest relevant at linke til fra en øvelse i en given kategori */
export const GUIDE_FOR_KATEGORI: Record<string, { slug: string; title: string }> = {
  drible: { slug: 'din-foerste-traening-som-boernetraener', title: 'Din første træning som børnetræner' },
  skud: { slug: 'minibasket-regler-for-nye-traenere', title: 'Minibasket-regler forklaret for nye trænere' },
  pasning: { slug: 'fair-spilletid-boernebasket', title: 'Fair spilletid i børnebasket — hvorfor og hvordan' },
  forsvar: { slug: 'minibasket-regler-for-nye-traenere', title: 'Minibasket-regler forklaret for nye trænere' },
  leg: { slug: 'din-foerste-traening-som-boernetraener', title: 'Din første træning som børnetræner' },
  opvarmning: { slug: 'din-foerste-traening-som-boernetraener', title: 'Din første træning som børnetræner' },
};

/** Regelsiden — linkes fra skud-/forsvars-øvelser og guides */
export const REGEL_LINK = { href: '/basketball-regler/', title: 'Basketball-reglerne — enkelt forklaret' };

/** App-URL med UTM-parametre */
export function appUrl(campaign: string, medium: string = 'cta'): string {
  return `/app/?utm_source=site&utm_medium=${medium}&utm_campaign=${campaign}`;
}

export function fmtDato(d: Date): string {
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const MOBILEPAY_URL = 'https://qr.mobilepay.dk/box/1ebdcc50-6d0b-4969-884c-9589e199e3c1/pay-in';
