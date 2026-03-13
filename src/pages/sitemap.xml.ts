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
  const links = allLanguages
    .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(l, path)}" />`)
    .join('\n');
  return `${links}\n      <xhtml:link rel="alternate" hreflang="x-default" href="${generateUrl('en', path)}" />`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Try to load blog posts
  let blogEntries: string[] = [];
  try {
    const { getCollection } = await import('astro:content');
    const posts = await getCollection('blog');

    // Group posts by slug (without lang prefix) to generate hreflang alternates
    const postsBySlug = new Map<string, typeof posts>();
    for (const post of posts) {
      const parts = post.slug.includes('/') ? post.slug.split('/') : ['en', post.slug];
      const bareSlug = parts.slice(1).join('/');
      if (!postsBySlug.has(bareSlug)) postsBySlug.set(bareSlug, []);
      postsBySlug.get(bareSlug)!.push(post);
    }

    for (const [bareSlug, variants] of postsBySlug) {
      // Generate hreflang links for all available translations of this post
      const hreflangLinks = variants
        .map((v) => {
          const vLang = v.data.lang || (v.slug.includes('/') ? v.slug.split('/')[0] : 'en');
          const vUrl = vLang === 'en'
            ? `${siteBase}/blog/${bareSlug}`
            : `${siteBase}/${vLang}/blog/${bareSlug}`;
          return `      <xhtml:link rel="alternate" hreflang="${vLang}" href="${vUrl}" />`;
        })
        .join('\n');

      // Find English variant for x-default
      const enVariant = variants.find((v) => (v.data.lang || 'en') === 'en');
      const xDefaultUrl = `${siteBase}/blog/${bareSlug}`;
      const xDefaultLink = `      <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`;

      for (const post of variants) {
        const postLang = post.data.lang || (post.slug.includes('/') ? post.slug.split('/')[0] : 'en');
        const loc = postLang === 'en'
          ? `${siteBase}/blog/${bareSlug}`
          : `${siteBase}/${postLang}/blog/${bareSlug}`;
        const lastmod = post.data.updatedDate
          ? post.data.updatedDate.toISOString().split('T')[0]
          : post.data.pubDate.toISOString().split('T')[0];
        blogEntries.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${hreflangLinks}
${xDefaultLink}
  </url>`);
      }
    }
    // Add category archive pages
    const categories = [...new Set(posts.filter(p => p.data.lang === 'en').map(p => p.data.category).filter(Boolean))];
    for (const category of categories) {
      const categorySlug = category!.toLowerCase().replace(/\s+/g, '-');
      blogEntries.push(`
  <url>
    <loc>${siteBase}/blog/category/${categorySlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  } catch {
    // No blog posts yet — skip
  }

  // Generate entries for each page in every language
  const allEntries = staticPages.map(({ path, changefreq, priority }) => {
    // Primary English URL with all hreflang alternates
    const entries = [`
  <url>
    <loc>${generateUrl('en', path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${generateHreflangLinks(path)}
  </url>`];

    // Localized URLs for each non-English language
    for (const lang of allLanguages) {
      if (lang === 'en') continue;
      entries.push(`
  <url>
    <loc>${generateUrl(lang, path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>0.5</priority>
${generateHreflangLinks(path)}
  </url>`);
    }

    return entries.join('');
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries}
${blogEntries.join('')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
