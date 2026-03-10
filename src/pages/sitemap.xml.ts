import type { APIRoute } from 'astro';
import { allLanguages } from '../i18n/utils';
import { platforms, getAllFeatures } from '../data/features';

const siteBase = 'https://www.igstorypeek.com';

// Static pages with their change frequency and priority
const staticPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/pricing', changefreq: 'weekly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.4' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/cookie-policy', changefreq: 'monthly', priority: '0.3' },
  { path: '/dmca', changefreq: 'monthly', priority: '0.3' },
];

// Platform hub pages
for (const p of platforms) {
  staticPages.push({ path: `/${p.id}`, changefreq: 'weekly', priority: '0.9' });
}

// Feature pages
for (const { platform, feature } of getAllFeatures()) {
  staticPages.push({ path: `/${platform.id}/${feature.slug}`, changefreq: 'weekly', priority: '0.7' });
}

function generateUrl(langCode: string, path: string): string {
  if (langCode === 'en') return `${siteBase}${path}`;
  return `${siteBase}/${langCode}${path}`;
}

function generateHreflangLinks(path: string): string {
  return allLanguages
    .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(l, path)}" />`)
    .join('\n');
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Try to load blog posts
  let blogEntries: string[] = [];
  try {
    const { getCollection } = await import('astro:content');
    const posts = await getCollection('blog');
    for (const post of posts) {
      const lastmod = post.data.updatedDate
        ? post.data.updatedDate.toISOString().split('T')[0]
        : post.data.pubDate.toISOString().split('T')[0];
      blogEntries.push(`
  <url>
    <loc>${siteBase}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  } catch {
    // No blog posts yet — skip
  }

  const staticEntries = staticPages.map(({ path, changefreq, priority }) => `
  <url>
    <loc>${generateUrl('en', path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${generateHreflangLinks(path)}
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries}
${blogEntries.join('')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
