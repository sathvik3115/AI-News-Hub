# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI News Hub is a fully static, front-end-only news aggregator that displays real-time AI articles. It fetches data from the **Hacker News Algolia API** (`hn.algolia.com/api/v1/search`), filters by AI-related topics and keywords, and renders results as cards. There is no backend, no build step, and no npm dependencies.

## Running Locally

```bash
# Option 1: simple static server via Node
npx serve .

# Option 2: Python
python -m http.server 4173
```

Then open `http://localhost:4173`. You can also open `index.html` directly in a browser.

## Architecture

The entire app is three files with no build pipeline:

- **`index.html`** — Single-page shell using Bootstrap 5 (CDN), Font Awesome icons (CDN), and Space Grotesk font. Contains the search bar, refresh button, article container, and status elements.
- **`style.css`** — Dark neon theme with CSS custom properties (`:root` vars). Responsive grid via `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`. Skeleton loading animations.
- **`app.js`** — All application logic in vanilla JS (no modules, no bundler):
  - **`aiTopics`** array: Each topic has a `name` and `queryVariants` array. Each variant becomes a separate Algolia API call.
  - **`keywords`** array: Articles must match at least one keyword (or action words like "announce"/"introducing") to pass filtering.
  - **`fetchAllFeeds()`**: Fetches all topics with concurrency limit of 4 workers. Each topic's query variants run in parallel via `Promise.all`.
  - **`fetchJsonWithRetries()`**: Retry wrapper (3 attempts with backoff).
  - Articles are deduplicated by `link::title` key at both per-topic and global levels, then sorted newest-first.
  - Client-side search filters the in-memory `currentArticles` array on input.

## Key Design Decisions

- The README mentions RSS feeds and AllOrigins proxy, but the actual code uses HN Algolia API directly — the README is outdated on this point.
- No localStorage caching exists in the current code despite README mentioning it.
- All external dependencies are loaded via CDN links in `index.html` (Bootstrap, Font Awesome, Google Fonts).

## Deployment

Static site — deploy to any static host (Vercel, Netlify, GitHub Pages). No build command needed. Vercel framework preset: `Other`, output directory: `/`.
