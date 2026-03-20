import type { APIRoute } from 'astro';
import { allLanguages } from '../i18n/utils';

const siteBase = 'https://www.igstorypeek.com';

function generateUrl(langCode: string, path: string): string {
  if (langCode === 'en') return `${siteBase}${path}`;
  return `${siteBase}/${langCode}${path}`;
}

/**
 * Blog sitemap — all blog posts (all languages) + category archive pages.
 * Category pages now include hreflang alternates and localized variants.
 */
export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];
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

      // x-default always points to English
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

    // Category archive pages — with hreflang alternates for all languages
    const categories = [...new Set(posts.filter(p => p.data.lang === 'en').map(p => p.data.category).filter(Boolean))];
    for (const category of categories) {
      const categorySlug = category!.toLowerCase().replace(/\s+/g, '-');
      const categoryHreflang = allLanguages
        .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(l, `/blog/category/${categorySlug}`)}" />`)
        .join('\n');
      const categoryXDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${siteBase}/blog/category/${categorySlug}" />`;

      // Add an entry for each language
      for (const categoryLang of allLanguages) {
        blogEntries.push(`
  <url>
    <loc>${generateUrl(categoryLang, `/blog/category/${categorySlug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
${categoryHreflang}
${categoryXDefault}
  </url>`);
      }
    }
  } catch {
    // No blog posts yet — skip
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blogEntries.join('')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
