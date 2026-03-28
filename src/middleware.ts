import { defineMiddleware } from 'astro:middleware';
import { allLanguages, defaultLang, getTranslation, type Language } from './i18n/utils';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals } = context;
  const pathname = url.pathname;

  // Skip API routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/_')) {
    (locals as any).lang = defaultLang;
    (locals as any).t = await getTranslation(defaultLang);
    return next();
  }

  // Redirect /blog/{lang}/slug → /{lang}/blog/slug (fix old indexed URLs)
  if (pathname.startsWith('/blog/')) {
    const blogSegments = pathname.split('/').filter(Boolean);
    // blogSegments: ['blog', possibleLang, ...slugParts]
    if (blogSegments.length >= 3) {
      const possibleLang = blogSegments[1] as Language;
      if (allLanguages.includes(possibleLang)) {
        const slugParts = blogSegments.slice(2).join('/');
        const correctPath = possibleLang === defaultLang
          ? `/blog/${slugParts}`
          : `/${possibleLang}/blog/${slugParts}`;
        return new Response(null, {
          status: 301,
          headers: { Location: correctPath },
        });
      }
    }
  }

  // --- Detect language prefix FIRST ---
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Language;

  let lang: Language = defaultLang;
  let cleanPath = pathname; // path without language prefix
  let langPrefix = '';      // e.g. '/es' or '' for default

  if (firstSegment && allLanguages.includes(firstSegment)) {
    if (firstSegment === defaultLang) {
      // Redirect /en/* to /* to avoid duplicate content
      const canonicalPath = '/' + segments.slice(1).join('/') || '/';
      return new Response(null, {
        status: 301,
        headers: { Location: canonicalPath },
      });
    }
    lang = firstSegment;
    langPrefix = `/${lang}`;
    cleanPath = '/' + segments.slice(1).join('/');
    if (cleanPath === '/') cleanPath = '/';
  }

  // --- Now check removed content against the CLEAN (language-stripped) path ---

  // 301 redirect removed platforms to homepage
  const removedPlatforms = ['/tiktok', '/facebook', '/snapchat'];
  for (const rp of removedPlatforms) {
    if (cleanPath === rp || cleanPath.startsWith(rp + '/')) {
      return new Response(null, {
        status: 301,
        headers: { Location: langPrefix + '/' },
      });
    }
  }

  // 301 redirect removed Instagram feature pages to /instagram
  const removedFeatures = [
    'view-comments-privately', 'follower-analyzer', 'see-likes', 'hashtags-generator',
    'highlights-downloader', 'posts-downloader', 'video-downloader',
    'comment-viewer', 'likes-viewer', 'relationship-insights', 'recent-mutuals',
  ];
  for (const rf of removedFeatures) {
    if (cleanPath === `/instagram/${rf}`) {
      return new Response(null, {
        status: 301,
        headers: { Location: langPrefix + '/instagram' },
      });
    }
  }

  // 301 redirect removed blog posts to /blog
  const removedBlogSlugs = [
    'facebook-algorithm-how-it-works-2026', 'facebook-analytics-track-page-performance-2026',
    'facebook-marketplace-privacy-safety-tips-2026', 'facebook-privacy-settings-essential-guide-2026',
    'facebook-profile-viewer-browse-privately-2026', 'facebook-reels-complete-guide-to-go-viral-2026',
    'facebook-stories-viewer-watch-anonymously-2026', 'facebook-stories-vs-instagram-stories-2026',
    'facebook-story-downloader-save-stories-free-2026', 'facebook-video-downloader-best-free-methods-2026',
    'instagram-comment-viewer-read-comments-privately-2026', 'instagram-dp-viewer-5-easy-free-methods-2025',
    'instagram-highlights-viewer-5-best-free-methods-2025', 'instagram-likes-viewer-see-who-liked-posts-2026',
    'instagram-photo-downloader-7-proven-free-methods-2025', 'instagram-profile-viewer-5-best-free-tools-2025',
    'instagram-reels-viewer-5-essential-free-methods-2025', 'instagram-story-saver-3-best-free-tools-2025',
    'instagram-video-downloader-5-ultimate-free-steps-2025', 'instagram-viewer-online-7-best-free-methods-2025',
    'instagram-without-account-8-proven-free-ways-2025',
    'snapchat-analytics-track-profile-performance-2026', 'snapchat-best-friends-list-how-it-works-2026',
    'snapchat-memories-save-and-manage-content-2026', 'snapchat-online-status-activity-tracking-2026',
    'snapchat-score-how-it-works-2026', 'snapchat-snap-map-privacy-and-features-2026',
    'snapchat-spotlight-how-to-go-viral-2026', 'snapchat-stories-viewer-watch-anonymously-2026',
    'snapchat-story-downloader-save-stories-2026', 'snapchat-streaks-tips-and-rules-2026',
    'tiktok-algorithm-how-it-works-2026', 'tiktok-analytics-tools-best-free-options-2026',
    'tiktok-competitor-analysis-how-to-spy-2026', 'tiktok-content-strategy-viral-formula-2026',
    'tiktok-duet-stitch-complete-guide-2026', 'tiktok-engagement-rate-how-to-calculate-2026',
    'tiktok-follower-growth-strategies-2026', 'tiktok-stories-everything-you-need-to-know-2026',
    'tiktok-trending-sounds-how-to-find-use-2026', 'tiktok-video-downloader-best-free-methods-2026',
  ];
  const blogSlugMatch = cleanPath.match(/\/blog\/([^/]+)$/);
  if (blogSlugMatch && removedBlogSlugs.includes(blogSlugMatch[1])) {
    return new Response(null, {
      status: 301,
      headers: { Location: langPrefix + '/blog' },
    });
  }

  // --- Load translations and route ---
  const t = await getTranslation(lang);
  (locals as any).lang = lang;
  (locals as any).t = t;

  const rewritePath = lang !== defaultLang ? cleanPath : pathname;
  const response = lang !== defaultLang ? await next(rewritePath) : await next();

  // Add Cache-Control for static (non-dynamic) routes
  const isStatic = !pathname.startsWith('/api/') && !pathname.startsWith('/_') &&
    !pathname.startsWith('/search/') && !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/login') && !pathname.startsWith('/register');

  if (isStatic) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  return response;
});
