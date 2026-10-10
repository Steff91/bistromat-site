// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TODO: set the production domain
  site: 'https://bistromat.rs',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
