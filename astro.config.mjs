// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Performance optimizations
  compressHTML: true,
  
  // Build optimizations
  build: {
    inlineStylesheets: 'auto',
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
  
  // Performance optimizations are built-in
  
  // Site configuration
  site: 'https://insta-stories-viewer.com',
  
  // Output configuration
  output: 'static',
  
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
