import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://minibasket.dk',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      // /app/ er PWA'en og ligger uden for Astro — den skal ikke i sitemap her
      filter: (page) => !page.includes('/app/'),
    }),
  ],
});
