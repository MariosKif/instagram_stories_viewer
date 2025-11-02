// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
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
