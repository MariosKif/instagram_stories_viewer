// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Enable SSR for dynamic pages (auth, dashboard, search)
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  // Integrations
  integrations: [
    tailwind(),
  ],

  // i18n configuration
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'cs',
      'bg', 'hr', 'da', 'et', 'fi', 'el', 'hu', 'ga', 'lv', 'lt',
      'mt', 'sk', 'sl', 'sv', 'ja', 'ko', 'zh', 'ru', 'tr', 'ar',
    ],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Performance optimizations
  compressHTML: true,

  // Build optimizations
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },

  // Vite config
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },

  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
});
