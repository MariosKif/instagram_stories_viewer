# Blog Post Creation Rules & Template

This document defines the rules, structure, and template for creating blog posts. Replace all `{{PLACEHOLDER}}` values in the Configuration section below before use.

---

## Configuration

Fill in these values for your project before using this template:

| Placeholder | Description | Example |
|---|---|---|
| `{{BRAND_NAME}}` | Your brand/product name (exact casing) | `IGStoryPeek` |
| `{{SITE_URL}}` | Your website URL (include protocol and www if used) | `https://www.example.com` |
| `{{PRIMARY_PLATFORM}}` | The main platform your product focuses on | `Instagram` |
| `{{BLOG_CONTENT_DIR}}` | Directory for blog markdown files | `src/content/blog` |
| `{{BLOG_ASSETS_DIR}}` | Directory for blog hero images | `public/blog` |
| `{{SUPPORTED_LANGUAGES}}` | Comma-separated 2-letter language codes | `en, de, fr, es, it, pt` |
| `{{DEFAULT_AUTHOR}}` | Default author name for posts | `MyBrand` |
| `{{CATEGORIES}}` | Allowed blog categories | `Guides, Tips, Privacy, Social Media, Tutorials` |
| `{{BG_COLOR_START}}` | Hero image background gradient start | `#0f172a` |
| `{{BG_COLOR_END}}` | Hero image background gradient end | `#1e293b` |
| `{{ACCENT_COLOR}}` | Hero image accent color | `#0ea5e9` |
| `{{BUILD_COMMAND}}` | Build command to verify posts | `npm run build` |
| `{{PLATFORM_1}}` | Primary platform name | `Instagram` |
| `{{PLATFORM_1_TOPICS}}` | Topic examples for primary platform | `Stories, Reels, profiles, photos, videos` |
| `{{PLATFORM_2}}` | Secondary platform name (optional) | `TikTok` |
| `{{PLATFORM_2_TOPICS}}` | Topic examples for secondary platform | `Video downloading, analytics, trends` |
| `{{PLATFORM_3}}` | Tertiary platform name (optional) | `Facebook` |
| `{{PLATFORM_3_TOPICS}}` | Topic examples for tertiary platform | `Stories, video downloading, privacy` |
| `{{PLATFORM_4}}` | Additional platform name (optional) | `Snapchat` |
| `{{PLATFORM_4_TOPICS}}` | Topic examples for additional platform | `Stories, content saving, privacy` |

---

## Duplicate Content Check (MANDATORY FIRST STEP)

Before writing any new blog post, you MUST check all existing posts for content overlap:

1. **Read every English post** in `{{BLOG_CONTENT_DIR}}/en/` and review their titles, focus keywords, and topics
2. **Compare the proposed topic** against every existing post. If another post already covers the same focus keyword, the same core topic, or answers the same primary question, DO NOT create the new post
3. **Check for partial overlap.** If an existing post covers 50%+ of the same content, either skip the new post or choose a sufficiently different angle that does not repeat the same information
4. **Log the check.** Before writing, list all existing post titles and confirm the new topic is unique

If duplicate or overlapping content is found, inform the user and suggest an alternative topic instead.

---

## Allowed Platforms & Topics

Blog posts can cover the following platforms:

| Platform | Topic Examples |
|---|---|
| **{{PLATFORM_1}}** | {{PLATFORM_1_TOPICS}} |
| **{{PLATFORM_2}}** | {{PLATFORM_2_TOPICS}} |
| **{{PLATFORM_3}}** | {{PLATFORM_3_TOPICS}} |
| **{{PLATFORM_4}}** | {{PLATFORM_4_TOPICS}} |

### Rules for Multi-Platform Content

1. **Every post must tie back to {{BRAND_NAME}}.** Even posts about other platforms must mention {{BRAND_NAME}} as the recommended tool for {{PRIMARY_PLATFORM}}-related features and include internal links to `{{SITE_URL}}`
2. **Cross-platform comparison posts are encouraged.** Posts comparing features across platforms perform well for SEO and naturally link back to {{BRAND_NAME}}
3. **Maintain the 9+ internal links rule.** All posts, regardless of platform topic, must include 9+ links to `{{SITE_URL}}` with varied anchor text
4. **Category selection still applies.** Use the same categories: {{CATEGORIES}}
5. **Brand positioning.** When covering other platforms, position {{BRAND_NAME}} as the expert source. Use phrases like "While {{BRAND_NAME}} specializes in {{PRIMARY_PLATFORM}}, the same principles apply to..." or "For {{PRIMARY_PLATFORM}} content, use [{{BRAND_NAME}}]({{SITE_URL}}) to browse content"

---

## File Location & Naming

- **Directory:** `{{BLOG_CONTENT_DIR}}/{lang}/` where `{lang}` is the 2-letter language code
- **Filename:** Use lowercase, hyphen-separated slugs containing the focus keyword. Max 70 characters. Example: `how-to-view-stories-anonymously-in-2025.md`
- **Supported languages:** {{SUPPORTED_LANGUAGES}}
- **Every post must exist in English first** (`{{BLOG_CONTENT_DIR}}/en/`), then be translated to all other languages
- **Same filename** is used across all language directories
- **Focus keyword must appear in the URL/slug**

---

## Frontmatter Schema

Every blog post must include this frontmatter block:

```yaml
---
title: "Your SEO-Optimized Title Here"
description: "A compelling meta description (145-152 characters). Include focus keyword naturally."
pubDate: YYYY-MM-DD
updatedDate: YYYY-MM-DD
author: "{{DEFAULT_AUTHOR}}"
featured: false
image: "/blog/your-hero-image.svg"
category: "Guides"
lang: "en"
tags:
  - primary keyword
  - secondary keyword
  - brand keyword
  - related term
  - long tail keyword
---
```

### Frontmatter Field Rules

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | 55-58 characters. Focus keyword near the beginning. Must follow Title Power Formula (see below). |
| `description` | string | Yes | Meta description. **145-152 characters strictly.** Include focus keyword naturally. |
| `pubDate` | date | Yes | Format: `YYYY-MM-DD` |
| `updatedDate` | date | No | Set when content is updated. Same format as pubDate. |
| `author` | string | Yes | Always `"{{DEFAULT_AUTHOR}}"` |
| `featured` | boolean | Yes | Set `true` for only ONE post (the main featured post on the blog listing). All others are `false`. |
| `image` | string | Yes | Path to SVG hero image in `/blog/`. Create a matching SVG in `{{BLOG_ASSETS_DIR}}/`. |
| `category` | string | Yes | One of: {{CATEGORIES}} |
| `lang` | string | Yes | 2-letter language code matching the directory name. |
| `tags` | array | Yes | 5-12 relevant tags. Include brand terms, primary/secondary keywords, and long-tail variations. |

---

## Title Power Formula

Every blog post title MUST follow all 4 rules:

1. **Focus keyword near the beginning** of the title
2. **At least 1 power word** included (Ultimate, Best, Proven, Essential, Secret, Perfect, Complete, Powerful, Exclusive, Guaranteed, Incredible, Expert, Definitive, Effortless, Instant)
3. **At least 1 number** in the title (e.g., "5 Ways", "Top 7", "in 2025", "3 Steps")
4. **Positive or negative sentiment word** included (e.g., "Free", "Easy", "Without", "Never", "Stop", "Amazing", "Simple", "Fast")

**Title length: 55-58 characters** for optimal SERP display.

Examples:
- "7 Proven Ways to Use {{PRIMARY_PLATFORM}} Without Login"
- "{{PRIMARY_PLATFORM}} Tools: 5 Essential Tips for Free Access"
- "Best 3 Secret Methods to Browse {{PRIMARY_PLATFORM}} in 2025"

---

## Technical SEO Requirements

These rules are mandatory for every post:

| Requirement | Target |
|---|---|
| Focus keyword in URL/slug | Yes, max 70 chars |
| Focus keyword in SEO title | Yes, 55-58 chars, near beginning |
| Focus keyword in meta description | Yes, 145-152 chars |
| Focus keyword in first paragraph | Yes, within first 2 sentences |
| Focus keyword in H2/H3/H4 subheadings | Yes, in at least 3 subheadings |
| Keyword density | 2.3% - 2.7% of total word count |
| Internal links to {{BRAND_NAME}} | 9+ links, front-loaded and throughout body |
| Total word count | 1,200 - 1,500 words strictly |
| Short paragraphs | 2-4 sentences max |
| Bullet points | Where structurally appropriate |

### Keyword Density Calculation

For a 1,350-word post targeting your focus keyword:
- 2.3% = ~31 occurrences
- 2.7% = ~36 occurrences
- This includes variations: exact match, partial match, and natural variations of the focus keyword

### Internal Linking Strategy

- **9+ links minimum** to `{{SITE_URL}}`
- **Front-load links:** Place 2-3 links in the first 300 words (intro + Key Takeaways)
- **Spread throughout body:** Remaining links distributed evenly across body sections
- **Varied anchor text:** Rotate between "{{BRAND_NAME}}", "{{PRIMARY_PLATFORM}} tool", "free {{PRIMARY_PLATFORM}} tool", "{{PRIMARY_PLATFORM}} tool like {{BRAND_NAME}}", etc.
- **Never repeat the same anchor text** back-to-back

---

## Hero Image

- Create an SVG file in `{{BLOG_ASSETS_DIR}}/` for each post
- Match the theme: dark background (`{{BG_COLOR_START}}` to `{{BG_COLOR_END}}`), gradient orbs, accent color (`{{ACCENT_COLOR}}`)
- Include relevant icons/illustrations for the topic
- Fallback image: `/blog/default-blog-hero.svg`
- SVGs are preferred over raster images (lightweight, resolution-independent)

---

## Content Structure

### 1. H1 Title (Required)

```markdown
# Exact Same Title as Frontmatter
```

- Must match the `title` in frontmatter exactly
- Only ONE H1 per post (it gets hidden by CSS since the page renders the title separately)

### 2. Key Takeaways Blockquote (Required)

```markdown
> **Key Takeaways:** A direct answer to the post's main question in 2-3 sentences. Include a link to [{{BRAND_NAME}}]({{SITE_URL}}). State the main value proposition clearly so Google can extract this as a featured snippet.
```

- Always placed immediately after the H1
- Starts with `> **Key Takeaways:**`
- 2-3 sentences maximum
- **Must contain the focus keyword**
- **Written in direct-answer format** for AI Overviews and featured snippets
- Include at least one link to `{{SITE_URL}}`

### 3. Introduction (Required)

- 2-3 short paragraphs introducing the topic
- **Focus keyword must appear in the first paragraph, within the first 2 sentences**
- Hook the reader with a relatable problem or question
- **Include a direct answer/definition paragraph** that Google can extract as a snippet
- Naturally mention {{BRAND_NAME}} with 2-3 links to `{{SITE_URL}}`
- Do NOT use bullet points in the introduction
- Establish author-style authority (e.g., "We've tested dozens of methods" or "Based on our experience")

### 4. Body Sections (Required, 4-6 sections)

Each section follows this pattern:

```markdown
## H2 Section Title With Focus Keyword

Short introductory paragraph for this section.

### H3 Sub-Section Title

Detailed content with paragraphs and optional bullet points.

### Another H3 Sub-Section

More content as needed.
```

**Rules for body sections:**
- Every H2 must have at least one H3 sub-section
- **Focus keyword must appear in at least 3 H2/H3 headings** across the post
- H2 titles should be clear and descriptive (good for Table of Contents and AI extraction)
- Keep paragraphs to 2-4 sentences each
- Maximum 4 bullet points per list
- Bullet points start with `**Bold lead text.**` followed by explanation
- Include internal links to `{{SITE_URL}}` naturally (9+ total across the post)
- Use anchor text variations: "{{BRAND_NAME}}", "{{PRIMARY_PLATFORM}} tool", "free {{PRIMARY_PLATFORM}} tool", etc.
- **Include at least one clear definition paragraph** per major section that AI can cite

### 5. Comparison Table (Recommended)

```markdown
| Method | Column 2 | Column 3 | Column 4 |
| --- | --- | --- | --- |
| {{BRAND_NAME}} | ... | ... | ... |
| Alternative 1 | ... | ... | ... |
```

- Use when comparing {{BRAND_NAME}} to alternative methods
- {{BRAND_NAME}} should always be the first row
- **Tables and lists are preferred by AI Overviews for citations**

### 6. Final Section (Required)

```markdown
## Final Thoughts
```

or

```markdown
## Final Takeaway
```

- 2-3 short paragraphs wrapping up the post
- Include a call-to-action with link to `{{SITE_URL}}`
- Reinforce the main value proposition

### 7. FAQ Section (Required, 5-6 questions)

```markdown
## Frequently Asked Questions

### Question text here?

Answer paragraph. 2-3 sentences. Clear, direct, and informative.

### Another question here?

Answer paragraph.
```

**FAQ Rules:**
- 5-6 questions per post
- Questions must be phrased as actual questions (end with `?`)
- Each question is an H3 under the "Frequently Asked Questions" H2
- **Start each answer with a direct, concise statement** (Google pulls these for AI citations)
- Answers are 2-3 sentences, no bullet points
- Include focus keyword and related keywords naturally
- FAQs generate `FAQPage` JSON-LD schema automatically
- **Write questions people actually search for** (use "How", "What", "Can", "Does", "Is it safe" patterns)

---

## AI Visibility Layer

Every post must be optimized for AI Overviews and featured snippets:

1. **Direct answer format in intro.** The first 2-3 sentences after Key Takeaways should directly answer the post's main question in a way Google can extract as a snippet.
2. **FAQ section at the end.** Google pulls FAQ answers for AI citations. Start each answer with a definitive statement.
3. **Clear definition paragraphs.** Include at least 2-3 paragraphs that define or explain a concept clearly enough for AI to cite. Pattern: "X is... It works by... This means..."
4. **Tables and lists.** Use comparison tables and structured bullet lists. AI Overviews prefer structured data to cite.
5. **Authority signals.** Use confident, expert-level language: "Based on testing", "The most reliable method", "Here's what works in [year]". Avoid hedging words like "maybe", "might", "could possibly".

---

## Writing Style Rules

1. **No em dashes.** Never use `—` (em dash). Use periods, commas, or rewrite the sentence instead.
2. **No exclamation marks in headings.** Keep headings professional and descriptive.
3. **Maximum 4 bullet points per list.** If you need more, split into separate lists or convert to paragraphs.
4. **Bullet points use bold leads.** Format: `- **Bold text.** Explanation follows here`
5. **Short paragraphs.** 2-4 sentences maximum per paragraph.
6. **Active voice.** Prefer "{{BRAND_NAME}} lets you browse" over "Content can be browsed with {{BRAND_NAME}}".
7. **No filler phrases.** Remove "In today's world", "It's important to note", "As we all know", etc.
8. **Use neutral terminology.** Preferred verbs: "browse", "access", "explore" public content.
9. **Include the current year** in titles and content when relevant (e.g., "in 2025").
10. **Brand name consistency.** Always use `{{BRAND_NAME}}` with exact casing. Never use lowercase or spaced-out variations.
11. **Site URL consistency.** Always use `{{SITE_URL}}` exactly as configured.
12. **Word count: 1,200 - 1,500 words strictly.** No more, no less. Count only body content (exclude frontmatter).
13. **Keyword density: 2.3% - 2.7%.** Calculate based on total word count and adjust focus keyword frequency accordingly.
14. **Authority tone.** Write with confidence and expertise. Use phrases like "The best approach", "Here's exactly how", "We recommend". Avoid uncertainty.

---

## Translation Rules

When translating a post to other languages:

1. **Keep identical:** Brand name "{{BRAND_NAME}}", all URLs, markdown formatting, frontmatter structure
2. **Translate:** Title, description, all content text, tag values, FAQ questions and answers
3. **Update `lang` field** to match the target language code
4. **Same filename** across all language directories
5. **Keep the same `image` path** (images are language-independent)
6. **Preserve all links** exactly as they are (always point to `{{SITE_URL}}`)
7. **Keep markdown structure** identical (same number of H2s, H3s, bullet points, blockquotes)
8. **Do not add or remove sections** during translation
9. **Tags should be translated** to the target language while keeping brand terms in English
10. **Maintain keyword density** in the translated language (2.3% - 2.7% of the focus keyword equivalent)

---

## Checklist Before Publishing

### Duplicate Content Check
- [ ] Read all existing posts in `{{BLOG_CONTENT_DIR}}/en/` before writing
- [ ] Confirmed no existing post covers the same focus keyword or core topic
- [ ] No 50%+ content overlap with any existing post

### Technical SEO
- [ ] Focus keyword in URL/slug (max 70 chars)
- [ ] Focus keyword in title (55-58 chars, near beginning)
- [ ] Focus keyword in meta description (145-152 chars)
- [ ] Focus keyword in first paragraph (first 2 sentences)
- [ ] Focus keyword in 3+ subheadings (H2/H3)
- [ ] Keyword density 2.3% - 2.7%
- [ ] 9+ internal links to {{BRAND_NAME}}, front-loaded
- [ ] Word count 1,200 - 1,500

### Title Power Formula
- [ ] Focus keyword near beginning of title
- [ ] At least 1 power word in title
- [ ] At least 1 number in title
- [ ] Positive or negative sentiment word in title

### Content Structure
- [ ] H1 matches the frontmatter title
- [ ] Key Takeaways blockquote with direct answer format
- [ ] Every H2 has at least one H3 sub-section
- [ ] No em dashes anywhere in content
- [ ] No bullet list has more than 4 items
- [ ] Short paragraphs (2-4 sentences max)
- [ ] Comparison table or structured list included
- [ ] FAQ section has 5-6 questions as H3 headings

### AI Visibility
- [ ] Direct answer format in intro (snippet-ready)
- [ ] Clear definition paragraphs Google/AI can extract
- [ ] FAQ answers start with direct statements
- [ ] Tables/lists used where applicable
- [ ] Authority signals in copy (no hedging language)

### Technical
- [ ] Hero SVG image exists in `{{BLOG_ASSETS_DIR}}/`
- [ ] `category` is one of the allowed values
- [ ] English version created first in `{{BLOG_CONTENT_DIR}}/en/`
- [ ] Translated to all supported languages ({{SUPPORTED_LANGUAGES}})
- [ ] `{{BUILD_COMMAND}}` passes without errors
