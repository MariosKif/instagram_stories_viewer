// Script to detect stub/thin translations in blog posts
// Outputs a JSON manifest of files that need full translation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, '../src/content/blog');

// Languages that have full translations already
const GOOD_LANGS = ['en', 'de', 'fr', 'es'];

// All languages to check
const ALL_LANGS = fs.readdirSync(blogDir).filter(d => {
  return fs.statSync(path.join(blogDir, d)).isDirectory() && !GOOD_LANGS.includes(d);
});

// 15 pre-existing posts that are already fully translated
const SKIP_POSTS = [
  'how-to-view-instagram-stories-anonymously-in-2025.md',
  'instagram-stories-anonymously-igstorypeek.md',
  'instagram-highlights-viewer-5-best-free-methods-2025.md',
  'private-instagram-viewer-5-essential-facts-2025.md',
  'instagram-viewer-online-7-best-free-methods-2025.md',
  'instagram-story-saver-3-best-free-tools-2025.md',
  'download-instagram-stories-7-proven-free-steps-2025.md',
  'instagram-video-downloader-5-ultimate-free-steps-2025.md',
  'instagram-profile-viewer-5-best-free-tools-2025.md',
  'instagram-reels-viewer-5-essential-free-methods-2025.md',
  'safe-instagram-viewer-5-essential-free-tips-2025.md',
  'instagram-dp-viewer-5-easy-free-methods-2025.md',
  'instagram-without-account-8-proven-free-ways-2025.md',
  'instagram-photo-downloader-7-proven-free-methods-2025.md',
  'instagram-analytics-tools-6-best-free-options-2025.md',
];

const LINE_THRESHOLD = 105;

// Get all English posts
const enDir = path.join(blogDir, 'en');
const enPosts = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));

const manifest = [];
let stubCount = 0;
let goodCount = 0;

for (const filename of enPosts) {
  if (SKIP_POSTS.includes(filename)) continue;

  const enPath = path.join(enDir, filename);
  const enLines = fs.readFileSync(enPath, 'utf-8').split('\n').length;

  for (const lang of ALL_LANGS) {
    const translatedPath = path.join(blogDir, lang, filename);
    if (!fs.existsSync(translatedPath)) {
      manifest.push({ lang, filename, enLines, translatedLines: 0, status: 'missing' });
      stubCount++;
      continue;
    }

    const translatedLines = fs.readFileSync(translatedPath, 'utf-8').split('\n').length;
    if (translatedLines <= LINE_THRESHOLD) {
      manifest.push({ lang, filename, enLines, translatedLines, status: 'stub' });
      stubCount++;
    } else {
      goodCount++;
    }
  }
}

console.log(`\nTranslation Check Results:`);
console.log(`  Languages checked: ${ALL_LANGS.length} (${ALL_LANGS.join(', ')})`);
console.log(`  Posts checked: ${enPosts.length - SKIP_POSTS.length} (excluding ${SKIP_POSTS.length} pre-existing)`);
console.log(`  Stubs/missing found: ${stubCount}`);
console.log(`  Good translations: ${goodCount}`);
console.log(`  Total files to fix: ${stubCount}`);

// Write manifest
const manifestPath = path.join(__dirname, 'translation-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nManifest written to: ${manifestPath}`);

// Summary by language
const byLang = {};
for (const entry of manifest) {
  byLang[entry.lang] = (byLang[entry.lang] || 0) + 1;
}
console.log('\nStubs per language:');
for (const [lang, count] of Object.entries(byLang).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${lang}: ${count}`);
}
