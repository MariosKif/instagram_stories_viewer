// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // i18n configuration for multi-language support
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'cs', 'bg', 'hr', 'da', 'et', 'fi', 'el', 'hu', 'ga', 'lv', 'lt', 'mt', 'sk', 'sl', 'sv'],
    routing: {
      prefixDefaultLocale: false, // Keep / for English, use /de/, /fr/, etc. for others
    },
  },
  
  // Performance optimizations
  compressHTML: true,
  
  // Build optimizations
  build: {
    inlineStylesheets: 'always', // Always inline styles to reduce render-blocking
    assets: '_astro',
  },
  
  // Vite optimizations
  vite: {
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
  
  // Vercel adapter for serverless functions
  output: 'server',
  adapter: vercel({
    functionPerRoute: false
  }),
  
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
