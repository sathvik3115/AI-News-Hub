const newsContainer = document.getElementById("news-container");
const searchInput = document.getElementById("searchInput");
const statusMessage = document.getElementById("statusMessage");
const lastUpdatedEl = document.getElementById("lastUpdated");
const statsBadgeEl = document.getElementById("statsBadge");
const refreshButton = document.getElementById("refreshButton");

// Topic queries optimized for HN Algolia using queryVariants
const aiTopics = [
  // Core AI Labs
  { name: "OpenAI", queryVariants: ["OpenAI", "ChatGPT", "GPT-4", "GPT-5", "GPT-6", "DALL-E", "Whisper", "Codex"] },
  { name: "Anthropic", queryVariants: ["Anthropic", "Claude 3", "Claude 4", "Claude 5"] },
  { name: "Google AI", queryVariants: ["Google", "Gemini", "DeepMind", "Bard", "PaLM"] },
  { name: "Microsoft AI", queryVariants: ["Microsoft", "Copilot", "Azure", "OpenAI", "Bing Chat"] },
  { name: "Meta AI", queryVariants: ["Meta", "Llama", "Llama 2", "Llama 3", "Llama 4", "Galactica"] },
  { name: "Hugging Face", queryVariants: ["Hugging Face", "Transformers", "Diffusers", "Datasets"] },

  // Other Major AI Companies / Startups
  { name: "Mistral AI", queryVariants: ["Mistral", "Mixtral"] },
  { name: "Cohere", queryVariants: ["Cohere", "Command R"] },
  { name: "Perplexity", queryVariants: ["Perplexity", "Perplexity AI"] },
  { name: "xAI", queryVariants: ["xAI", "Grok"] },
  { name: "Stability AI", queryVariants: ["Stability AI", "Stable Diffusion", "SDXL", "MidJourney"] },
  { name: "Inflection AI", queryVariants: ["Inflection AI", "Pi AI"] },
  { name: "Runway", queryVariants: ["Runway AI", "video editing", "Gen-2"] },
  { name: "Claude Labs", queryVariants: ["Claude", "Claude AI"] },
  { name: "Replit AI", queryVariants: ["Replit", "Ghostwriter"] },
  { name: "MosaicML", queryVariants: ["MosaicML", "models"] },
  { name: "AI21 Labs", queryVariants: ["AI21 Studio", "Jurassic-2", "Jurassic-1"] },

  // Infrastructure / Hardware
  { name: "NVIDIA AI", queryVariants: ["NVIDIA AI", "TensorRT", "NIM", "DGX", "H100"] },
  { name: "AMD AI", queryVariants: ["AMD AI", "MI300"] },
  { name: "Intel AI", queryVariants: ["Intel AI", "Habana", "Gaudi"] },

  // Cloud AI Platforms
  { name: "Amazon AI", queryVariants: ["AWS", "Bedrock", "Amazon AI", "SageMaker"] },
  { name: "Google Cloud AI", queryVariants: ["Vertex AI", "Google AI Cloud"] },
  { name: "Microsoft Azure AI", queryVariants: ["Azure AI", "OpenAI Service", "Cognitive Services"] },

  // Emerging / Niche AI Startups
  { name: "Character AI", queryVariants: ["Character AI", "Chatbot", "personalities"] },
  { name: "Copy.ai", queryVariants: ["Copy AI", "content writing"] },
  { name: "Jasper AI", queryVariants: ["Jasper AI", "content marketing"] },
  { name: "Reimagine AI", queryVariants: ["Reimagine AI", "image generation"] },
  { name: "Luminous AI", queryVariants: ["Luminous AI", "models"] }
];

// Keywords optimized for comprehensive AI news
const keywords = [
  // Core AI models & companies
  "GPT", "GPT-4", "GPT-5", "Claude", "Claude 3", "Claude 4",
  "Gemini", "DeepMind", "Copilot", "Llama", "Llama 3", "Llama 4",
  "Transformers", "Mixtral", "Command R", "Grok", "Stable Diffusion",
  "Pi AI", "TensorRT", "NIM", "MI300", "Bedrock", "Anthropic",
  "OpenAI", "Google AI", "Microsoft AI", "Meta AI", "Hugging Face",
  "Mistral AI", "Cohere", "Perplexity", "xAI", "Stability AI", "Inflection AI",
  "NVIDIA AI", "AMD AI", "Amazon AI", "AWS",

  // AI general concepts
  "AI", "artificial intelligence", "machine learning", "deep learning",
  "reinforcement learning", "unsupervised learning", "supervised learning",
  "neural network", "foundation model", "LLM", "large language model",
  "multimodal model", "chatbot", "text-to-image", "text-to-speech",
  "generative AI", "predictive AI", "automation", "AI assistant",
  "AI tool", "AI platform", "AI infrastructure", "AI hardware",

  // Popular AI tasks & applications
  "natural language processing", "computer vision", "image generation",
  "speech synthesis", "text summarization", "code generation",
  "AI writing assistant", "AI research", "AI optimization", "AI simulation",
  "self-supervised learning", "transfer learning", "reinforcement learning",
  "conversational AI", "AI adoption", "AI deployment", "AI ethics",
  "AI safety", "AI alignment", "responsible AI", "AI governance",

  // Trending AI buzzwords & concepts
  "generative model", "diffusion model", "transformer architecture",
  "multimodal AI", "real-time AI", "AI accelerator", "AI chip", "AI compute",
  "predictive analytics", "AI automation", "human-in-the-loop", "AI innovation",
  "AI startup", "AI company", "AI ecosystem", "AI strategy", "AI breakthroughs",
  "open source AI", "AI community", "AI toolkit", "AI framework"
];

let currentArticles = [];
let lastUpdatedTimestamp = null;
let isRefreshing = false;
const topicFailureCounts = new Map();

// ---------------------------
// Utility helpers
// ---------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextWithRetries(url, maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(400 * attempt);
      }
    }
  }

  throw lastError || new Error("Unknown fetch error");
}

async function fetchJsonWithRetries(url, maxAttempts = 3) {
  const text = await fetchTextWithRetries(url, maxAttempts);
  return JSON.parse(text);
}

function normalizeWhitespace(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function stripHtml(input) {
  return (input || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  const truncated = str.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  return base.trim() + "…";
}

function extractHostName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

// ---------------------------
// UI helpers
// ---------------------------

function setStatus(message, type = "info") {
  if (!statusMessage) return;

  statusMessage.classList.remove("status-loading", "status-error", "status-empty");

  if (!message) {
    statusMessage.innerHTML = "";
    return;
  }

  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === "loading") {
    icon = '<i class="fa-solid fa-arrows-rotate fa-spin"></i>';
    statusMessage.classList.add("status-loading");
  } else if (type === "error") {
    icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    statusMessage.classList.add("status-error");
  } else if (type === "empty") {
    icon = '<i class="fa-regular fa-face-sleeping"></i>';
    statusMessage.classList.add("status-empty");
  }

  statusMessage.innerHTML = `<span class="icon">${icon}</span><span>${message}</span>`;
}

function updateMetaInfo(visibleArticles) {
  const totalVisible = visibleArticles.length;
  const totalAll = currentArticles.length;

  if (lastUpdatedEl && lastUpdatedTimestamp) {
    const d = new Date(lastUpdatedTimestamp);
    lastUpdatedEl.textContent = `Last updated ${d.toLocaleString()}`;
  }

  if (statsBadgeEl) {
    if (!totalAll) {
      statsBadgeEl.innerHTML = `
        <i class="fa-regular fa-newspaper"></i>
        <span>No articles yet</span>
      `;
      return;
    }

    if (totalVisible === totalAll) {
      statsBadgeEl.innerHTML = `
        <i class="fa-regular fa-newspaper"></i>
        <span>${totalVisible} articles across ${aiTopics.length} topics</span>
      `;
    } else {
      statsBadgeEl.innerHTML = `
        <i class="fa-regular fa-filter"></i>
        <span>${totalVisible} / ${totalAll} articles match your search</span>
      `;
    }
  }
}

function showLoadingSkeletons(desiredCount) {
  if (!newsContainer) return;
  newsContainer.innerHTML = "";

  const skeletonCount = Math.max(6, Math.min(desiredCount || 12, 30));
  for (let i = 0; i < skeletonCount; i++) {
    const card = document.createElement("div");
    card.className = "news-card skeleton-card";
    card.innerHTML = `
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-pill"></div>
    `;
    newsContainer.appendChild(card);
  }
}

// ---------------------------
// API fetch + parse
// ---------------------------

// Build the Algolia API URL
function buildTopicApiUrl(query) {
  return `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=100`;
}

// Extract and filter articles from Algolia hits
function extractTopicItemsFromJson(hits, topicName) {
  const filtered = [];

  (hits || []).forEach((hit) => {
    const title = normalizeWhitespace(hit?.title || hit?.story_title || "");
    if (!title) return;

    const link = normalizeWhitespace(hit?.url || hit?.story_url || `https://news.ycombinator.com/item?id=${hit?.objectID || ""}`);
    const rawDescription = hit?.story_text || hit?.comment_text || title;
    const description = truncateText(normalizeWhitespace(stripHtml(rawDescription)), 260);

    const content = `${title} ${description}`.toLowerCase();

    const matchesKeyword =
      keywords.some((k) => content.includes(k)) ||
      content.includes("announce") ||
      content.includes("introducing") ||
      content.includes("available") ||
      content.includes("preview");

    if (!matchesKeyword) return;

    filtered.push({
      title,
      link,
      description,
      source: `${topicName} • ${extractHostName(link)}`,
      publishedAt: hit?.created_at || "",
    });
  });

  return filtered;
}

// ---------------------------
// Fetch news for a topic using queryVariants (parallelized)
// ---------------------------
async function fetchTopicNews(topic) {
  const allArticles = [];
  let lastError = null;

  // Run all queryVariants in parallel
  const variantPromises = (topic.queryVariants || []).map(async (queryVariant) => {
    try {
      const payload = await fetchJsonWithRetries(buildTopicApiUrl(queryVariant), 2);
      const articles = extractTopicItemsFromJson(payload?.hits, topic.name);
      return articles;
    } catch (err) {
      lastError = err;
      return [];
    }
  });

  // Wait for all queryVariants to finish
  const results = await Promise.all(variantPromises);
  results.forEach((articles) => allArticles.push(...articles));

  if (allArticles.length === 0 && lastError) {
    const failures = (topicFailureCounts.get(topic.name) || 0) + 1;
    topicFailureCounts.set(topic.name, failures);
    if (failures === 1 || failures % 5 === 0) {
      const reason = lastError && lastError.message ? lastError.message : String(lastError || "Unknown error");
      console.warn(`Skipping topic after retries (${topic.name}): ${reason}`);
    }
  }

  // Deduplicate articles by link + title
  const seen = new Set();
  const deduped = [];
  for (const article of allArticles) {
    const key = `${article.link || ""}::${(article.title || "").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(article);
    }
  }

  // Sort newest first
  deduped.sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  return deduped;
}

// ---------------------------
// Fetch all topics with controlled concurrency (unchanged)
// ---------------------------
async function fetchAllFeeds() {
  const concurrency = 4;
  const results = new Array(aiTopics.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < aiTopics.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fetchTopicNews(aiTopics[index]);
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, aiTopics.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  // Merge all results
  const merged = results.flat();

  // Deduplicate globally
  const seen = new Set();
  const deduped = [];
  for (const article of merged) {
    const key = `${article.link || ""}::${(article.title || "").toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(article);
    }
  }

  // Sort newest first
  deduped.sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  return deduped;
}

// ---------------------------
// Render
// ---------------------------

function renderNews(articles) {
  if (!newsContainer) return;
  newsContainer.innerHTML = "";

  if (!articles.length) {
    setStatus(
      "No relevant news found. Try refreshing in a minute.",
      "empty"
    );
    updateMetaInfo([]);
    return;
  }

  const fragment = document.createDocumentFragment();

  articles.forEach((item) => {
    const card = document.createElement("article");
    card.className = "news-card";

    const safeTitle = item.title.split("Show HN:")[1] || item.title.split("Tell HN:")[1] || item.title.split("Launch HN:")[1] || item.title.split("Ask HN:")[1] || item.title || "Untitled article";
    const safeDescription = item.description.split("Show HN:")[1] || item.description.split("Tell HN:")[1] || item.description.split("Launch HN:")[1] || item.description.split("Ask HN:")[1] || item.description || "";
    const safeLink = item.link || "#";
    const safeSource = item.source || "Unknown source";

    const publishedLabel = item.publishedAt
      ? new Date(item.publishedAt).toLocaleString()
      : "Date not provided";

    card.innerHTML = `
      <h3>
        <a href="${safeLink}" target="_blank" rel="noreferrer">
          ${safeTitle}
        </a>
      </h3>
      <p>${safeDescription}</p>

      <div class="news-meta">
        <span class="news-source-pill">
          <i class="fa-solid fa-brain"></i>
          <span>${safeSource}</span>
        </span>
        <span class="news-date">
          <i class="fa-regular fa-clock me-1"></i>${publishedLabel}
        </span>
      </div>

      <a class="news-link" href="${safeLink}" target="_blank" rel="noreferrer">
        <span>View article</span>
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    `;

    fragment.appendChild(card);
  });

  newsContainer.appendChild(fragment);
  updateMetaInfo(articles);
}

// ---------------------------
// Main refresh flow
// ---------------------------

async function refreshFeeds(showSkeletons = true) {
  if (isRefreshing) return;
  isRefreshing = true;

  if (refreshButton) {
    refreshButton.disabled = true;
  }

  if (showSkeletons) {
    showLoadingSkeletons(aiTopics.length * 2);
    setStatus("Loading latest AI news…", "loading");
  } else {
    setStatus("Refreshing AI news…", "loading");
  }

  try {
    const articles = await fetchAllFeeds();
    currentArticles = articles;
    lastUpdatedTimestamp = Date.now();

    if (!articles.length) {
      newsContainer.innerHTML = "";
      setStatus("No relevant news found. Try again in a bit.", "empty");
      updateMetaInfo([]);
    } else {
      renderNews(articles);
      setStatus("", "info");
    }
  } catch (err) {
    console.error("Failed to refresh feeds", err);

    setStatus("Unable to load news right now. Please try refreshing later.", "error");
  } finally {
    isRefreshing = false;
    if (refreshButton) {
      refreshButton.disabled = false;
    }
  }
}

async function initialize() {
  // First load: show skeletons based on topics, then fetch in parallel
  showLoadingSkeletons(aiTopics.length * 2);
  setStatus("Loading latest AI news…", "loading");
  await refreshFeeds(false);
}

// ---------------------------
// Search + interactions
// ---------------------------

// Client-side search over the in-memory articles list
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      renderNews(currentArticles);
      return;
    }

    const filtered = currentArticles.filter((article) => {
      const text = `${article.title || ""} ${article.description || ""} ${article.source || ""}`.toLowerCase();
      return text.includes(query);
    });

    renderNews(filtered);
  });
}

// Manual refresh button to force a live update
if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    refreshFeeds(true);
  });
}

// Kick everything off
initialize();