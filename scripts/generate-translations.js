// Script to generate translation files for all languages
// This creates base structure that can be translated later

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../src/i18n/locales');
const enFile = path.join(localesDir, 'en.json');

// Read English as base template
const enTranslations = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

// Languages that need translation files
const languages = [
  'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'cs', 'bg', 
  'hr', 'da', 'et', 'fi', 'el', 'hu', 'ga', 'lv', 'lt', 'mt', 
  'sk', 'sl', 'sv'
];

// For now, create files with English content (to be translated later)
// In production, these should be properly translated
languages.forEach(lang => {
  const langFile = path.join(localesDir, `${lang}.json`);
  
  // For now, copy English structure
  // TODO: Replace with actual translations
  fs.writeFileSync(
    langFile, 
    JSON.stringify(enTranslations, null, 2),
    'utf-8'
  );
  
  console.log(`Created ${lang}.json`);
});

console.log(`\nGenerated ${languages.length} translation files.`);
console.log('Note: These files currently contain English content and need to be translated.');

