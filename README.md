## AI Launch & Deprecation News – Front‑End Only

A real‑time, front‑end‑only AI news radar that aggregates and filters launch / release / deprecation updates from:

- **OpenAI Research** (`https://openai.com/research.atom`)
- **Hugging Face Blog** (`https://huggingface.co/blog/rss`)
- **VentureBeat AI** (`https://venturebeat.com/category/ai/feed/`)

All fetching and filtering is done client‑side using JavaScript, via the free **AllOrigins** CORS proxy (`https://api.allorigins.win/get?url=`). There is **no backend** and **no authentication**.

---

### Features

- **Real‑time AI launch radar**: Fetches multiple RSS/Atom feeds and filters only articles that mention:
  - `launch`, `released`, `deprecated`, `removed`, `sunset`, `closing`
- **Dark neon UI**:
  - Responsive Bootstrap grid
  - Neon header, glowing cards, hover effects
  - Source badges and published timestamps
- **Client‑side search**:
  - Filters currently loaded articles by title, description, and source
- **Fast loading with caching**:
  - Uses `localStorage` with a **3‑hour TTL**
  - If a warm cache is present, results are rendered instantly
  - Feeds are refreshed in the background without blocking the UI
- **Parallel fetching**:
  - All RSS feeds are fetched concurrently via `Promise.all` for faster first loads
- **Fully static**:
  - No build step required
  - Ready to host on any static host (Vercel, Netlify, GitHub Pages, S3, etc.)

---

### File structure

- `index.html` – main page, Bootstrap layout, header/footer, search bar, containers
- `style.css` – dark neon theme, responsive grid, hover/skeleton effects
- `app.js` – RSS fetching, keyword filtering, caching, rendering, and search
- `README.md` – you are here

There are **no dependencies to install**; everything uses CDN links and vanilla JS.

---

### How it works (high level)

- **Fetching**:
  - `app.js` calls `fetch` against `https://api.allorigins.win/get?url=<encoded_feed_url>`.
  - Responses are parsed using `DOMParser` into an XML document.
  - The script supports both RSS (`<item>`) and Atom (`<entry>`) formats.
- **Filtering**:
  - For each item, the app builds a lowercase string from the title + description.
  - Only items containing at least one of the configured keywords are kept.
- **Rendering**:
  - Matching items are rendered as responsive cards with:
    - Title (linked, opens in a new tab)
    - Description
    - Source badge (OpenAI / Hugging Face / VentureBeat)
    - Published date (when available)
- **Caching**:
  - The merged, filtered article list is stored in `localStorage` with a timestamp.
  - On subsequent visits within **3 hours**, cached articles are rendered instantly.
  - A background refresh updates both the UI and the cache without blocking the page.

---

### Running locally

Because this is a static front‑end app, you can run it in two simple ways:

#### Option 1 – Open directly in a browser

1. Clone or download this project to your machine.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).

> Note: Some browsers apply stricter CORS/file‑scheme rules when loading local files; if you see issues, use option 2.

#### Option 2 – Use a simple static server

From the project root:

```bash
# using Node.js + npx
npx serve .

# or with Python 3
python -m http.server 4173
```

Then open `http://localhost:4173` (or the URL printed in your terminal) in your browser.

---

### Deploying to Vercel

This app is already **Vercel‑ready** as a static site.

#### 1. Push to a Git repo

1. Create a new git repository (or use an existing one).
2. Add the project files and commit them.
3. Push to GitHub, GitLab, or Bitbucket.

#### 2. Create a Vercel project (UI)

1. Go to [`https://vercel.com`](https://vercel.com) and log in.
2. Click **“New Project”**.
3. Import the repository that contains this project.
4. When prompted for settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `/` (project root where `index.html` lives)
   - **Build Command**: _leave empty_ (no build step)
   - **Output Directory**: `/` (Vercel will serve `index.html` from the root)
5. Click **Deploy**.

Vercel will assign you a production URL such as `https://your-project-name.vercel.app`.

#### 3. Optional – Deploy via Vercel CLI

If you prefer the CLI and have it installed:

```bash
cd /path/to/ai-news-hub
vercel
```

When prompted:

- **Project root**: `.`  
- **Build command**: leave empty  
- **Output directory**: `.`  

Vercel will upload the static files and return a deployment URL.

---

### Notes / caveats

- **Third‑party proxy**: The app relies on `api.allorigins.win`. If that service is down or rate‑limited, fetching may fail (the UI will fall back to cached data when available).
- **Feed changes**: If any source changes its RSS/Atom endpoint or structure, you might need to tweak the selectors in `app.js`.
- **No server‑side logic**: All filtering happens in the browser. If you want server‑side control or analytics, you’ll need to introduce a backend (outside the scope of this project).

