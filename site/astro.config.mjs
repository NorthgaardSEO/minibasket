import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://minibasket.dk',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      // /app/ er PWA'en og ligger uden for Astro — filtreres fra Astros egne sider,
      // men tilføjes manuelt, så appen ér i sitemappet.
      // OBS: customPages merges FØR filteret kører, så filteret skal whiteliste den.
      filter: (page) => page === 'https://minibasket.dk/app/' || !page.includes('/app/'),
      customPages: ['https://minibasket.dk/app/'],
    }),
  ],
});
