import type { APIRoute } from 'astro';
import { platforms, getAllFeatures } from '../data/features';

const siteBase = 'https://www.igstorypeek.com';

export const GET: APIRoute = async () => {
  let output = `# IGStoryPeek — Complete Feature Reference

> Instagram analytics and content tools.
> Analyze public Instagram profiles, track engagement trends, and discover insights — all without logging in.

Website: ${siteBase}

---

`;

  for (const platform of platforms) {
    output += `## ${platform.name} Tools\n\n`;
    output += `Platform hub: ${siteBase}/${platform.id}\n\n`;

    for (const category of platform.categories) {
      output += `### ${category.title}\n\n`;

      for (const feature of category.features) {
        output += `#### ${feature.title}\n`;
        output += `URL: ${siteBase}/${platform.id}/${feature.slug}\n`;
        if (feature.description) {
          output += `${feature.description}\n`;
        }
        if (feature.benefits && feature.benefits.length > 0) {
          output += `\nKey capabilities:\n`;
          for (const b of feature.benefits) {
            output += `- ${b.title}: ${b.description}\n`;
          }
        }
        if (feature.steps && feature.steps.length > 0) {
          output += `\nHow it works:\n`;
          for (let i = 0; i < feature.steps.length; i++) {
            output += `${i + 1}. ${feature.steps[i].title} — ${feature.steps[i].description}\n`;
          }
        }
        output += `\n`;
      }
    }

    output += `---\n\n`;
  }

  output += `## Additional Pages

- About: ${siteBase}/about
- Pricing: ${siteBase}/pricing
- Blog: ${siteBase}/blog
- Contact: ${siteBase}/contact
- Privacy Policy: ${siteBase}/privacy
- Terms of Service: ${siteBase}/terms
- Cookie Policy: ${siteBase}/cookie-policy
- DMCA: ${siteBase}/dmca

## Supported Languages

IGStoryPeek is available in 30 languages: English, German, French, Spanish, Italian, Dutch, Portuguese, Polish, Romanian, Czech, Bulgarian, Croatian, Danish, Estonian, Finnish, Greek, Hungarian, Irish, Latvian, Lithuanian, Maltese, Slovak, Slovenian, Swedish, Japanese, Korean, Chinese, Russian, Turkish, and Arabic.

Each page is available in all languages via URL prefix (e.g., /de/instagram, /fr/tiktok).
`;

  return new Response(output, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
