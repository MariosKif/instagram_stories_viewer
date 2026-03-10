// Regenerate stub translations using free Google Translate API
// No API key required — uses google-translate-api-x

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import translate from 'google-translate-api-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, '../src/content/blog');
const manifestPath = path.join(__dirname, 'translation-manifest.json');

// Language code mapping (our codes -> Google Translate codes)
const LANG_MAP = {
  pt: 'pt', it: 'it', nl: 'nl', pl: 'pl', ro: 'ro', cs: 'cs',
  bg: 'bg', hr: 'hr', da: 'da', et: 'et', fi: 'fi', el: 'el',
  hu: 'hu', ga: 'ga', lv: 'lv', lt: 'lt', mt: 'mt', sk: 'sk',
  sl: 'sl', sv: 'sv', tr: 'tr', ar: 'ar', ja: 'ja', ko: 'ko',
  zh: 'zh-CN', ru: 'ru',
};

// Language display names for logging
const LANG_NAMES = {
  pt: 'Portuguese', it: 'Italian', nl: 'Dutch', pl: 'Polish', ro: 'Romanian',
  cs: 'Czech', bg: 'Bulgarian', hr: 'Croatian', da: 'Danish', et: 'Estonian',
  fi: 'Finnish', el: 'Greek', hu: 'Hungarian', ga: 'Irish', lv: 'Latvian',
  lt: 'Lithuanian', mt: 'Maltese', sk: 'Slovak', sl: 'Slovenian', sv: 'Swedish',
  tr: 'Turkish', ar: 'Arabic', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  ru: 'Russian',
};

// Parse frontmatter and body from markdown
function parseMarkdown(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: content, raw: content };
  return { frontmatter: match[1], body: match[2], raw: content };
}

// Parse frontmatter string into key-value pairs (preserving structure)
function parseFrontmatterFields(fm) {
  const lines = fm.split('\n');
  const fields = {};
  let currentKey = null;
  let arrayItems = [];

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      if (currentKey && arrayItems.length > 0) {
        fields[currentKey] = arrayItems;
        arrayItems = [];
      }
      currentKey = keyMatch[1];
      const value = keyMatch[2];
      if (value.startsWith('"') || value.startsWith("'")) {
        fields[currentKey] = value.replace(/^["']|["']$/g, '');
      } else if (value === '') {
        // Could be start of array
        fields[currentKey] = value;
      } else {
        fields[currentKey] = value;
      }
    } else if (line.match(/^\s+-\s+/)) {
      const item = line.replace(/^\s+-\s+/, '');
      arrayItems.push(item);
    }
  }
  if (currentKey && arrayItems.length > 0) {
    fields[currentKey] = arrayItems;
  }
  return fields;
}

// Translate a single text string, preserving markdown links
async function translateText(text, targetLang) {
  if (!text || text.trim() === '') return text;

  // Preserve markdown links by replacing them with placeholders
  const links = [];
  let processed = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (match, linkText, url) => {
    const idx = links.length;
    links.push({ linkText, url });
    return `__LINK${idx}__`;
  });

  // Preserve bold markers with content
  const bolds = [];
  processed = processed.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
    const idx = bolds.length;
    bolds.push(content);
    return `__BOLD${idx}__`;
  });

  try {
    const result = await translate(processed, { to: targetLang });
    let translated = result.text;

    // Restore bold markers — translate bold content too
    for (let i = 0; i < bolds.length; i++) {
      try {
        const boldTranslated = await translate(bolds[i], { to: targetLang });
        translated = translated.replace(`__BOLD${i}__`, `**${boldTranslated.text}**`);
      } catch {
        translated = translated.replace(`__BOLD${i}__`, `**${bolds[i]}**`);
      }
    }

    // Restore links — translate link text too
    for (let i = 0; i < links.length; i++) {
      try {
        const linkTranslated = await translate(links[i].linkText, { to: targetLang });
        translated = translated.replace(`__LINK${i}__`, `[${linkTranslated.text}](${links[i].url})`);
      } catch {
        translated = translated.replace(`__LINK${i}__`, `[${links[i].linkText}](${links[i].url})`);
      }
    }

    return translated;
  } catch (err) {
    console.error(`    Translation error: ${err.message}`);
    return text; // Return original on failure
  }
}

// Translate a markdown table row
async function translateTableRow(row, targetLang) {
  if (row.trim().startsWith('| ---')) return row; // Separator row
  const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
  const translated = [];
  for (const cell of cells) {
    if (cell === '') {
      translated.push(cell);
    } else {
      translated.push(await translateText(cell, targetLang));
    }
  }
  return '| ' + translated.join(' | ') + ' |';
}

// Translate the body of a markdown post line by line / block by block
async function translateBody(body, targetLang) {
  const lines = body.split('\n');
  const translatedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      translatedLines.push('');
      continue;
    }

    // Heading lines (# ## ### etc) — translate text after #s
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const headingText = headingMatch[2];
      const translated = await translateText(headingText, targetLang);
      translatedLines.push(`${hashes} ${translated}`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const content = line.substring(2);
      const translated = await translateText(content, targetLang);
      translatedLines.push(`> ${translated}`);
      continue;
    }

    // List item
    const listMatch = line.match(/^(\s*-\s+)(.+)$/);
    if (listMatch) {
      const prefix = listMatch[1];
      const content = listMatch[2];
      const translated = await translateText(content, targetLang);
      translatedLines.push(`${prefix}${translated}`);
      continue;
    }

    // Table row
    if (line.trim().startsWith('|')) {
      const translated = await translateTableRow(line, targetLang);
      translatedLines.push(translated);
      continue;
    }

    // Regular paragraph text
    const translated = await translateText(line, targetLang);
    translatedLines.push(translated);
  }

  return translatedLines.join('\n');
}

// Build the full translated markdown file
async function translatePost(enContent, stubContent, targetLang) {
  const en = parseMarkdown(enContent);
  const stub = parseMarkdown(stubContent);
  const enFields = parseFrontmatterFields(en.frontmatter);
  const stubFmLines = stub.frontmatter.split('\n');

  // Translate frontmatter fields: title, description, tags
  let translatedTitle = enFields.title || '';
  let translatedDesc = enFields.description || '';
  let translatedTags = [];

  try {
    if (translatedTitle) {
      const r = await translate(translatedTitle, { to: targetLang });
      translatedTitle = r.text;
    }
    if (translatedDesc) {
      const r = await translate(translatedDesc, { to: targetLang });
      translatedDesc = r.text;
    }
    if (Array.isArray(enFields.tags)) {
      for (const tag of enFields.tags) {
        const r = await translate(tag, { to: targetLang });
        translatedTags.push(r.text);
      }
    }
  } catch (err) {
    console.error(`    Frontmatter translation error: ${err.message}`);
    // Fall back to English
    translatedTags = Array.isArray(enFields.tags) ? enFields.tags : [];
  }

  // Rebuild frontmatter, preserving non-translatable fields from stub
  const langCode = Object.keys(LANG_MAP).find(k => LANG_MAP[k] === targetLang) || targetLang;
  const fmLines = [
    `title: "${translatedTitle.replace(/"/g, '\\"')}"`,
    `description: "${translatedDesc.replace(/"/g, '\\"')}"`,
    `pubDate: ${enFields.pubDate}`,
    `updatedDate: ${enFields.updatedDate}`,
    `author: "${enFields.author || 'IGStoryPeek'}"`,
    `featured: ${enFields.featured || 'false'}`,
    `image: "${enFields.image || ''}"`,
    `category: "${enFields.category || ''}"`,
    `lang: "${langCode}"`,
    `tags:`,
    ...translatedTags.map(t => `  - ${t}`),
  ];

  // Translate body
  const translatedBody = await translateBody(en.body, targetLang);

  return `---\n${fmLines.join('\n')}\n---\n${translatedBody}`;
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process a single file
async function processFile(entry, index, total) {
  const { lang, filename } = entry;
  const googleLang = LANG_MAP[lang];
  if (!googleLang) {
    console.error(`  Unknown language: ${lang}`);
    return false;
  }

  const enPath = path.join(blogDir, 'en', filename);
  const targetPath = path.join(blogDir, lang, filename);

  if (!fs.existsSync(enPath)) {
    console.error(`  English source missing: ${filename}`);
    return false;
  }

  const enContent = fs.readFileSync(enPath, 'utf-8');
  const stubContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf-8') : enContent;

  console.log(`  [${index + 1}/${total}] ${lang}/${filename}`);

  try {
    const translated = await translatePost(enContent, stubContent, googleLang);
    fs.writeFileSync(targetPath, translated, 'utf-8');
    return true;
  } catch (err) {
    console.error(`  FAILED: ${lang}/${filename} — ${err.message}`);
    return false;
  }
}

// Main
async function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  let filterLang = null;
  let startIndex = 0;
  let batchSize = 0; // 0 = all

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && args[i + 1]) filterLang = args[i + 1];
    if (args[i] === '--start' && args[i + 1]) startIndex = parseInt(args[i + 1]);
    if (args[i] === '--batch' && args[i + 1]) batchSize = parseInt(args[i + 1]);
  }

  // Load manifest
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found. Run check-translations.js first.');
    process.exit(1);
  }

  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Filter by language if specified
  if (filterLang) {
    manifest = manifest.filter(e => e.lang === filterLang);
    console.log(`Filtered to language: ${filterLang} (${LANG_NAMES[filterLang] || filterLang})`);
  }

  // Apply start index
  if (startIndex > 0) {
    manifest = manifest.slice(startIndex);
    console.log(`Starting from index: ${startIndex}`);
  }

  // Apply batch size
  if (batchSize > 0) {
    manifest = manifest.slice(0, batchSize);
    console.log(`Batch size: ${batchSize}`);
  }

  console.log(`\nFiles to translate: ${manifest.length}`);
  console.log(`Starting translation...\n`);

  let success = 0;
  let failed = 0;
  const failedFiles = [];

  for (let i = 0; i < manifest.length; i++) {
    const ok = await processFile(manifest[i], i, manifest.length);
    if (ok) {
      success++;
    } else {
      failed++;
      failedFiles.push(manifest[i]);
    }

    // Small delay between requests to avoid rate limiting
    if (i < manifest.length - 1) {
      await delay(200);
    }

    // Progress update every 25 files
    if ((i + 1) % 25 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${manifest.length} (${success} ok, ${failed} failed) ---\n`);
    }
  }

  console.log(`\n=============================`);
  console.log(`Translation complete!`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed: ${failed}`);
  console.log(`=============================`);

  if (failedFiles.length > 0) {
    const failedPath = path.join(__dirname, 'translation-failures.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedFiles, null, 2));
    console.log(`Failed files written to: ${failedPath}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
