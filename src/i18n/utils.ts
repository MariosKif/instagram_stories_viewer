// Translation utilities for Astro i18n
export const languages = {
  en: { name: 'English', code: 'en' },
  de: { name: 'Deutsch', code: 'de' },
  fr: { name: 'Français', code: 'fr' },
  es: { name: 'Español', code: 'es' },
  it: { name: 'Italiano', code: 'it' },
  nl: { name: 'Nederlands', code: 'nl' },
  pt: { name: 'Português', code: 'pt' },
  pl: { name: 'Polski', code: 'pl' },
  ro: { name: 'Română', code: 'ro' },
  cs: { name: 'Čeština', code: 'cs' },
  bg: { name: 'Български', code: 'bg' },
  hr: { name: 'Hrvatski', code: 'hr' },
  da: { name: 'Dansk', code: 'da' },
  et: { name: 'Eesti', code: 'et' },
  fi: { name: 'Suomi', code: 'fi' },
  el: { name: 'Ελληνικά', code: 'el' },
  hu: { name: 'Magyar', code: 'hu' },
  ga: { name: 'Gaeilge', code: 'ga' },
  lv: { name: 'Latviešu', code: 'lv' },
  lt: { name: 'Lietuvių', code: 'lt' },
  mt: { name: 'Malti', code: 'mt' },
  sk: { name: 'Slovenčina', code: 'sk' },
  sl: { name: 'Slovenščina', code: 'sl' },
  sv: { name: 'Svenska', code: 'sv' },
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'en';
export const allLanguages = Object.keys(languages) as Language[];

// Language mapping from Accept-Language codes to our supported languages
const languageMap: Record<string, Language> = {
  'en': 'en',
  'de': 'de',
  'fr': 'fr',
  'es': 'es',
  'it': 'it',
  'nl': 'nl',
  'pt': 'pt',
  'pl': 'pl',
  'ro': 'ro',
  'cs': 'cs',
  'bg': 'bg',
  'hr': 'hr',
  'da': 'da',
  'et': 'et',
  'fi': 'fi',
  'el': 'el',
  'hu': 'hu',
  'ga': 'ga',
  'lv': 'lv',
  'lt': 'lt',
  'mt': 'mt',
  'sk': 'sk',
  'sl': 'sl',
  'sv': 'sv',
};

/**
 * Parse Accept-Language header and return the best matching language
 * @param acceptLanguage - The Accept-Language header value (e.g., "en-US,en;q=0.9,fr;q=0.8")
 * @returns The matching language code or 'en' as default
 */
export function detectLanguageFromHeader(acceptLanguage: string | undefined): Language {
  if (!acceptLanguage) return defaultLang;
  
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
  const parsedLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1.0'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      const langCode = code.split('-')[0].toLowerCase(); // Get base language code (e.g., "en" from "en-US")
      return { code: langCode, quality };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality (higher first)
  
  // Find first matching language
  for (const lang of parsedLanguages) {
    if (languageMap[lang.code]) {
      return languageMap[lang.code];
    }
  }
  
  return defaultLang;
}

// Helper function to get translation
export async function getTranslation(lang: string = defaultLang) {
  try {
    const translations = await import(`./locales/${lang}.json`);
    return translations.default;
  } catch {
    // Fallback to English if translation file doesn't exist
    const translations = await import(`./locales/${defaultLang}.json`);
    return translations.default;
  }
}

// Get localized path
export function getLocalizedPath(path: string, lang: string): string {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}

