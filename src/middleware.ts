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

  // Check if the first segment is a language code
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Language;

  let lang: Language = defaultLang;
  let rewritePath = pathname;

  if (firstSegment && allLanguages.includes(firstSegment) && firstSegment !== defaultLang) {
    lang = firstSegment;
    // Strip the language prefix for routing
    rewritePath = '/' + segments.slice(1).join('/');
    if (rewritePath === '/') rewritePath = '/';
  }

  // Load translations
  const t = await getTranslation(lang);

  // Set locals
  (locals as any).lang = lang;
  (locals as any).t = t;

  // If we need to rewrite (non-default language), rewrite the URL
  if (lang !== defaultLang) {
    return next(rewritePath);
  }

  return next();
});
