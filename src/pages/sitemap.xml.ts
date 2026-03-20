import type { APIRoute } from 'astro';
import { allLanguages } from '../i18n/utils';

const siteBase = 'https://www.igstorypeek.com';

/**
 * Sitemap index — points to per-language page sitemaps and a blog sitemap.
 * Splits the previously monolithic 10MB+ sitemap into manageable chunks.
 */
export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  const sitemaps = [
    ...allLanguages.map(lang =>
      `  <sitemap>
    <loc>${siteBase}/sitemap-pages-${lang}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    ),
    `  <sitemap>
    <loc>${siteBase}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
