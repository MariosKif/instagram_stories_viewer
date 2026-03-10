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
  ja: { name: '日本語', code: 'ja' },
  ko: { name: '한국어', code: 'ko' },
  zh: { name: '中文', code: 'zh' },
  ru: { name: 'Русский', code: 'ru' },
  tr: { name: 'Türkçe', code: 'tr' },
  ar: { name: 'العربية', code: 'ar' },
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'en';
export const allLanguages = Object.keys(languages) as Language[];

// RTL languages
const rtlLanguages: Language[] = ['ar'];

export function isRTL(lang: Language): boolean {
  return rtlLanguages.includes(lang);
}

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
  'ja': 'ja',
  'ko': 'ko',
  'zh': 'zh',
  'ru': 'ru',
  'tr': 'tr',
  'ar': 'ar',
};

/**
 * Parse Accept-Language header and return the best matching language
 */
export function detectLanguageFromHeader(acceptLanguage: string | undefined): Language {
  if (!acceptLanguage) return defaultLang;

  const parsedLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1.0'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      const langCode = code.split('-')[0].toLowerCase();
      return { code: langCode, quality };
    })
    .sort((a, b) => b.quality - a.quality);

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

// Load platform translations
export async function getPlatformTranslation(lang: string, platformId: string) {
  try {
    const translations = await import(`./locales/platforms/${lang}/${platformId}.json`);
    return translations.default;
  } catch {
    try {
      const translations = await import(`./locales/platforms/${defaultLang}/${platformId}.json`);
      return translations.default;
    } catch {
      return null;
    }
  }
}

// Load legal content
export async function getLegalContent(lang: string, page: string): Promise<string> {
  try {
    // Dynamic import of markdown files
    const modules = import.meta.glob('../i18n/content/legal/**/*.md', { query: '?raw', import: 'default' });
    const key = `../i18n/content/legal/${page}/${lang}.md`;
    if (modules[key]) {
      return await modules[key]() as string;
    }
    // Fallback to English
    const enKey = `../i18n/content/legal/${page}/${defaultLang}.md`;
    if (modules[enKey]) {
      return await modules[enKey]() as string;
    }
    return '';
  } catch {
    return '';
  }
}
