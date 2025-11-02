// Script to generate comprehensive sitemap with all language versions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const languages = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'cs', 'bg', 'hr', 'da', 'et', 'fi', 'el', 'hu', 'ga', 'lv', 'lt', 'mt', 'sk', 'sl', 'sv'];
const currentDate = new Date().toISOString().split('T')[0];

const pages = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/terms', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.7' }
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Generate URLs for all languages and pages
pages.forEach(page => {
  languages.forEach(lang => {
    const langPath = lang === 'en' ? page.path : `/${lang}${page.path}`;
    const url = `https://www.igstorypeek.com${langPath === '' ? '/' : langPath}`;
    
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
    
    // Add hreflang alternatives
    languages.forEach(altLang => {
      const altLangPath = altLang === 'en' ? page.path : `/${altLang}${page.path}`;
      const altUrl = `https://www.igstorypeek.com${altLangPath === '' ? '/' : altLangPath}`;
      sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
    });
    
    sitemap += `
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.igstorypeek.com${page.path === '' ? '/' : page.path}" />
  </url>
`;
  });
});

sitemap += `</urlset>`;

fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
console.log(`Generated sitemap with ${languages.length * pages.length} URLs (${languages.length} languages × ${pages.length} pages)`);

