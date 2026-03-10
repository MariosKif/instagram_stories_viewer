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
  { path: '', changefreq: 'daily', priority: '1.0', localized: true },
  { path: '/blog', changefreq: 'weekly', priority: '0.8', localized: false },
  { path: '/terms', changefreq: 'monthly', priority: '0.7', localized: false },
  { path: '/privacy', changefreq: 'monthly', priority: '0.7', localized: false }
];

// Read blog posts from content directory
const blogDir = path.join(__dirname, '../src/content/blog');
let blogPosts = [];

if (fs.existsSync(blogDir)) {
  const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  blogPosts = blogFiles.map(file => {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    // Match frontmatter (more flexible regex)
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontmatterMatch) {
      const slug = file.replace('.md', '');
      const frontmatter = frontmatterMatch[1];
      
      // Extract pubDate from frontmatter
      const pubDateMatch = frontmatter.match(/pubDate:\s*(.+)/);
      const updatedDateMatch = frontmatter.match(/updatedDate:\s*(.+)/);
      let lastDate = currentDate;
      
      if (updatedDateMatch) {
        const dateStr = updatedDateMatch[1].trim();
        try {
          const date = new Date(dateStr);
          lastDate = date.toISOString().split('T')[0];
        } catch (e) {
          lastDate = currentDate;
        }
      } else if (pubDateMatch) {
        const dateStr = pubDateMatch[1].trim();
        try {
          const date = new Date(dateStr);
          lastDate = date.toISOString().split('T')[0];
        } catch (e) {
          lastDate = currentDate;
        }
      }
      
      return {
        path: `/blog/${slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: lastDate
      };
    }
    // If no frontmatter match, still add the post
    const slug = file.replace('.md', '');
    return {
      path: `/blog/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: currentDate
    };
  });
}

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Generate URLs for all languages and pages
let totalUrls = 0;

pages.forEach(page => {
  const pageLanguages = page.localized ? languages : ['en'];

  pageLanguages.forEach(lang => {
    totalUrls += 1;
    const langPath = lang === 'en' ? page.path : `/${lang}${page.path}`;
    const url = `https://www.igstorypeek.com${langPath === '' ? '/' : langPath}`;
    
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
    
    // Add hreflang alternatives
    const hreflangLanguages = page.localized ? languages : ['en'];
    hreflangLanguages.forEach(altLang => {
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

// Add blog posts (English only for now, as per user's requirement)
blogPosts.forEach(post => {
  const url = `https://www.igstorypeek.com${post.path}`;
  const lastmod = post.lastmod || currentDate;
  
  sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />
  </url>
`;
});

sitemap += `</urlset>`;

fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
console.log(`Generated sitemap with ${totalUrls + blogPosts.length} URLs`);

