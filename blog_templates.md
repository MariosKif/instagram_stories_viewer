# Blog Post Creation Rules & Template

This document defines the rules, structure, and template for creating blog posts on IGStoryPeek.

---

## Duplicate Content Check (MANDATORY FIRST STEP)

Before writing any new blog post, you MUST check all existing posts for content overlap:

1. **Read every English post** in `src/content/blog/en/` and review their titles, focus keywords, and topics
2. **Compare the proposed topic** against every existing post. If another post already covers the same focus keyword, the same core topic, or answers the same primary question, DO NOT create the new post
3. **Check for partial overlap.** If an existing post covers 50%+ of the same content, either skip the new post or choose a sufficiently different angle that does not repeat the same information
4. **Log the check.** Before writing, list all existing post titles and confirm the new topic is unique

If duplicate or overlapping content is found, inform the user and suggest an alternative topic instead.

---

## Allowed Platforms & Topics

Blog posts can cover the following social media platforms:

| Platform | Topic Examples |
|---|---|
| **Instagram** | Stories, Reels, Highlights, profiles, photos, videos, DPs, analytics, downloading, privacy |
| **TikTok** | Video downloading, profile viewing, analytics, trends, content saving, privacy tips |
| **Facebook** | Stories, profile viewing, video downloading, privacy settings, content browsing |
| **Snapchat** | Stories, content saving, profile viewing, privacy, score tracking |

### Rules for Multi-Platform Content

1. **Every post must tie back to IGStoryPeek.** Even posts about TikTok, Facebook, or Snapchat must mention IGStoryPeek as the recommended tool for Instagram-related features and include internal links to `https://www.igstorypeek.com`
2. **Cross-platform comparison posts are encouraged.** Posts comparing features across platforms (e.g., "Instagram Stories vs TikTok Stories vs Snapchat Stories") perform well for SEO and naturally link back to IGStoryPeek
3. **Maintain the 9+ internal links rule.** All posts, regardless of platform topic, must include 9+ links to `https://www.igstorypeek.com` with varied anchor text
4. **Category selection still applies.** Use the same categories: Guides, Tips, Privacy, Social Media, Tutorials
5. **Brand positioning.** When covering other platforms, position IGStoryPeek as the expert source for social media viewing tools. Use phrases like "While IGStoryPeek specializes in Instagram, the same privacy principles apply to..." or "For Instagram content, use [IGStoryPeek](https://www.igstorypeek.com) to browse stories, reels, and profiles"

---

## File Location & Naming

- **Directory:** `src/content/blog/{lang}/` where `{lang}` is the 2-letter language code
- **Filename:** Use lowercase, hyphen-separated slugs containing the focus keyword. Max 70 characters. Example: `how-to-view-instagram-stories-anonymously-in-2025.md`
- **Supported languages:** en, de, fr, es, it, pt
- **Every post must exist in English first** (`src/content/blog/en/`), then be translated to all other languages
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
author: "IGStoryPeek"
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
| `author` | string | Yes | Always `"IGStoryPeek"` |
| `featured` | boolean | Yes | Set `true` for only ONE post (the main featured post on the blog listing). All others are `false`. |
| `image` | string | Yes | Path to SVG hero image in `/blog/`. Create a matching SVG in `public/blog/`. |
| `category` | string | Yes | One of: `"Guides"`, `"Tips"`, `"Privacy"`, `"Social Media"`, `"Tutorials"` |
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
- "7 Proven Ways to View Instagram Stories Without Login"
- "Instagram Story Viewer: 5 Essential Tips for Free Access"
- "Best 3 Secret Methods to Browse Instagram Stories in 2025"

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
| Internal links to IGStoryPeek | 9+ links, front-loaded and throughout body |
| Total word count | 1,200 - 1,500 words strictly |
| Short paragraphs | 2-4 sentences max |
| Bullet points | Where structurally appropriate |

### Keyword Density Calculation

For a 1,350-word post targeting "instagram story viewer":
- 2.3% = ~31 occurrences
- 2.7% = ~36 occurrences
- This includes variations: exact match, partial match, and natural variations of the focus keyword

### Internal Linking Strategy

- **9+ links minimum** to `https://www.igstorypeek.com`
- **Front-load links:** Place 2-3 links in the first 300 words (intro + Key Takeaways)
- **Spread throughout body:** Remaining links distributed evenly across body sections
- **Varied anchor text:** Rotate between "IGStoryPeek", "Instagram Story Viewer", "free Instagram story viewer", "Instagram story viewer like IGStoryPeek", "view Instagram stories online", etc.
- **Never repeat the same anchor text** back-to-back

---

## Hero Image

- Create an SVG file in `public/blog/` for each post
- Match the dark theme: dark background (`#0f172a` to `#1e293b`), gradient orbs, sky blue accent (`#0ea5e9`)
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
> **Key Takeaways:** A direct answer to the post's main question in 2-3 sentences. Include a link to [IGStoryPeek](https://www.igstorypeek.com). State the main value proposition clearly so Google can extract this as a featured snippet.
```

- Always placed immediately after the H1
- Starts with `> **Key Takeaways:**`
- 2-3 sentences maximum
- **Must contain the focus keyword**
- **Written in direct-answer format** for AI Overviews and featured snippets
- Include at least one link to `https://www.igstorypeek.com`

### 3. Introduction (Required)

- 2-3 short paragraphs introducing the topic
- **Focus keyword must appear in the first paragraph, within the first 2 sentences**
- Hook the reader with a relatable problem or question
- **Include a direct answer/definition paragraph** that Google can extract as a snippet
- Naturally mention IGStoryPeek with 2-3 links to `https://www.igstorypeek.com`
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
- Include internal links to `https://www.igstorypeek.com` naturally (9+ total across the post)
- Use anchor text variations: "IGStoryPeek", "Instagram Story Viewer", "free Instagram story viewer", etc.
- **Include at least one clear definition paragraph** per major section that AI can cite

### 5. Comparison Table (Recommended)

```markdown
| Method | Column 2 | Column 3 | Column 4 |
| --- | --- | --- | --- |
| IGStoryPeek | ... | ... | ... |
| Alternative 1 | ... | ... | ... |
```

- Use when comparing IGStoryPeek to alternative methods
- IGStoryPeek should always be the first row
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
- Include a call-to-action with link to `https://www.igstorypeek.com`
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
6. **Active voice.** Prefer "IGStoryPeek lets you browse" over "Stories can be browsed with IGStoryPeek".
7. **No filler phrases.** Remove "In today's world", "It's important to note", "As we all know", etc.
8. **Use "browse" not "view anonymously".** Preferred terminology: "browse", "access", "explore" public content.
9. **Include the current year** in titles and content when relevant (e.g., "in 2025").
10. **Brand name is always "IGStoryPeek"** (capital I, G, S, P). Never "Igstorypeek" or "ig story peek".
11. **Site URL is always `https://www.igstorypeek.com`** with `www`.
12. **Word count: 1,200 - 1,500 words strictly.** No more, no less. Count only body content (exclude frontmatter).
13. **Keyword density: 2.3% - 2.7%.** Calculate based on total word count and adjust focus keyword frequency accordingly.
14. **Authority tone.** Write with confidence and expertise. Use phrases like "The best approach", "Here's exactly how", "We recommend". Avoid uncertainty.

---

## Translation Rules

When translating a post to other languages:

1. **Keep identical:** Brand name "IGStoryPeek", all URLs, markdown formatting, frontmatter structure
2. **Translate:** Title, description, all content text, tag values, FAQ questions and answers
3. **Update `lang` field** to match the target language code
4. **Same filename** across all language directories
5. **Keep the same `image` path** (images are language-independent)
6. **Preserve all links** exactly as they are (always point to `https://www.igstorypeek.com`)
7. **Keep markdown structure** identical (same number of H2s, H3s, bullet points, blockquotes)
8. **Do not add or remove sections** during translation
9. **Tags should be translated** to the target language while keeping brand terms in English
10. **Maintain keyword density** in the translated language (2.3% - 2.7% of the focus keyword equivalent)

---

## Checklist Before Publishing

### Duplicate Content Check
- [ ] Read all existing posts in `src/content/blog/en/` before writing
- [ ] Confirmed no existing post covers the same focus keyword or core topic
- [ ] No 50%+ content overlap with any existing post

### Technical SEO
- [ ] Focus keyword in URL/slug (max 70 chars)
- [ ] Focus keyword in title (55-58 chars, near beginning)
- [ ] Focus keyword in meta description (145-152 chars)
- [ ] Focus keyword in first paragraph (first 2 sentences)
- [ ] Focus keyword in 3+ subheadings (H2/H3)
- [ ] Keyword density 2.3% - 2.7%
- [ ] 9+ internal links to IGStoryPeek, front-loaded
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
- [ ] Hero SVG image exists in `public/blog/`
- [ ] `category` is one of the allowed values
- [ ] English version created first in `src/content/blog/en/`
- [ ] Translated to all 6 supported languages
- [ ] `npm run build` passes without errors
