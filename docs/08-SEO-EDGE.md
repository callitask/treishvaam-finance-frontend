/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Operational architecture of the Cloudflare Worker and Frontend SEO Strategy.
 *
 * Change Intent:
 * - Completely re-architected to detail the Zero-Trust Cache-Shielding deployment, Aggressive SPA Fallbacks, and Semantic Entity Graph Injections deployed during the apex domain migration.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Edge SEO Architecture Documentation.
 * - EDITED:
 * • Added Section 6 defining Third-Party Script & Tag Management (0ms TBT Architecture).
 * - EDITED (LATEST):
 * • Implemented Cache-Shielding Architecture (Tier 1 CDN -> Tier 2 KV -> Tier 3 Backend) to protect Cloudflare Free Tier quotas.
 * • Implemented Aggressive SPA Fallback logic (`KNOWN_SPA_ROUTES`) to forcefully resolve GSC 404 Indexing penalties.
 * • Injected Semantic Entity Typo-Tolerance into the Homepage Schema.
 */

# 08 - Enterprise SEO & Edge Architecture

## 1. Architecture Overview: "The Edge Replica & Cache Shield"

We have implemented an **Enterprise-Grade Edge-Replica Architecture** using Cloudflare Workers and KV (Key-Value) Storage. This ensures that our SEO infrastructure (Sitemaps, Robots.txt, Rich Results) is **100% Highly Available**, even if the Backend API is down, while protecting our Cloudflare Free-Tier quotas.

### The Cache-Shielding Protocol
The Edge Worker interceptor now processes sitemap and SEO data requests through a strict three-tier protection model:

* **Tier 1: CDN Edge Cache (0 Quota Cost):** The Worker checks `caches.default` for an unexpired payload. If a HIT occurs, KV reads and Backend calls are entirely bypassed.
* **Tier 2: Cloudflare KV (1 Read Quota Cost):** If the Edge Cache is cold, the Worker retrieves the pre-compiled XML/JSON from the `TREISHFIN_SEO_CACHE` KV namespace and simultaneously populates Tier 1.
* **Tier 3: Backend Fallback (Network Cost):** If both caches fail, the Worker proxies the request to the Spring Boot API, caching the result on the way back.

| Component | Role | Location |
| :--- | :--- | :--- |
| **Frontend** | Hosts Static Pages (`/about`, `/contact`) | Cloudflare Pages |
| **Backend** | Generates Dynamic Data (Blogs, Markets) | Java Spring Boot |
| **Worker** | The "Smart Router" & Cache Shield | Cloudflare Workers |
| **KV Store** | Materialized Dynamic Sitemaps | Cloudflare KV |

---

## 2. Aggressive SPA Fallback Strategy (GSC 404 Resolution)

**The Problem:** React Single Page Applications (SPAs) physically only possess an `index.html` file. When Googlebot directly accesses a static sub-route like `https://treishvaamfinance.com/about`, Cloudflare Pages natively returns a `404 Not Found` before React can load and mount the router. This destroys SEO indexing.

**The Solution:** The Edge Worker intercepts all incoming requests. It evaluates the path against a strict `KNOWN_SPA_ROUTES` array (e.g., `/home`, `/about`, `/vision`). If a known path would natively return a 404, the Worker **intercepts the failure and forces a `200 OK` response**, wrapping the payload in the root `index.html` shell. Googlebot sees a perfect 200 OK, and React hydrates the content smoothly.

---

## 3. SEO Rich Results & Semantic Entity Injection

The Worker implements **Edge Hydration** to ensure social media crawlers and Search Engines see rich metadata immediately.

### Semantic Entity Typo-Tolerance (The "Iceberg" Method)
To force AI models and Google to recognize misspelled brand searches and dual-persona founder queries, the `Organization` and `Person` JSON-LD schemas inject comprehensive `alternateName` phonetic arrays directly at the Edge. This mathematically fuses human typos with the canonical corporate entity without exposing the misspellings in the public UI.

### Logic (Scenario-Based)
* **Homepage (`/`)**: Injects `FinancialService` and Corporate `Organization` schemas with Typo-Tolerance arrays.
* **Static Pages (`/about`)**: Injects `WebPage` schema.
* **Blog Posts (`/category/...`)**: Injects `NewsArticle` schema and `window.__PRELOADED_STATE__`.
* **Market Pages (`/market/:ticker`)**: Injects `FinancialProduct` schema.

---

## 4. Technical Implementation Details

### Location
* **Code**: `worker/worker.js`
* **Config**: `worker/wrangler.toml`

### Path Translation (Critical)
The Worker translates clean public URLs to complex backend API parameters seamlessly:
* **Public URL**: `https://treishvaamfinance.com/sitemap-dynamic/blog/0.xml`
* **Internal API**: `https://backend.treishvaamgroup.com/api/public/sitemap/blog/0.xml`

---

## 5. Deployment

The Worker is managed via `wrangler` and must be deployed independently of the Frontend React build.

```bash
# Manual Deployment
cd worker
npx wrangler deploy
```

---

## 6. Third-Party Script & Tag Management (0ms TBT Architecture)

To ensure a perfect 100/100 Lighthouse Performance score, the frontend strictly prohibits hardcoding active third-party tracking scripts into `public/index.html`.

### A. Interaction-Based Deferred Loading
Active scripts block the main thread. To achieve **0ms Total Blocking Time (TBT)**:
* Scripts are injected dynamically via `ThirdPartyScripts.js`.
* The injection is deferred until the user explicitly interacts with the page (`scroll`, `mousemove`).
* A 7-second `setTimeout` fallback guarantees execution.

### B. Zero-Trust Dynamic Injection
Tracking IDs are decoupled from the codebase and injected via Cloudflare Environment Variables: `REACT_APP_GA_MEASUREMENT_ID`, `REACT_APP_GOOGLE_ADS_ID`, and `REACT_APP_ADSENSE_CLIENT_ID`.