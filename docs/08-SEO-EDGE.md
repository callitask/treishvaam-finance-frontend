/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Operational architecture of the Cloudflare Worker and Frontend SEO Strategy.
 *
 * Change Intent:
 * - Synchronized with the backend Master Ledger to include the 0ms TBT third-party script loading standard.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Edge SEO Architecture Documentation.
 * - EDITED:
 * • Added Section 6 defining Third-Party Script & Tag Management (0ms TBT Architecture).
 */

# 08 - Enterprise SEO & Edge Architecture

## 1. Architecture Overview: "The Edge Replica"

We have implemented an **Enterprise-Grade Edge-Replica Architecture** using Cloudflare Workers and KV (Key-Value) Storage. This ensures that our SEO infrastructure (Sitemaps, Robots.txt, Rich Results) is **100% Highly Available**, even if the Backend API is down.

### The Core Concept
Instead of the Edge "asking" the Backend for data every time Googlebot visits, the Edge maintains its own **local replica** of critical SEO data.

| Component | Role | Location | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | Hosts Static Pages (`/about`, `/contact`) | Cloudflare Pages | **Source of Truth (Static)** |
| **Backend** | Generates Dynamic Data (Blogs, Markets) | Java Spring Boot | **Source of Truth (Dynamic)** |
| **Worker** | The "Smart Router" & Aggregator | Cloudflare Workers | **The Gatekeeper** |
| **KV Store** | Caches Dynamic Sitemaps | Cloudflare KV | **The "Cache of Truth"** |

---

## 2. Sitemap Architecture (KV-Backed)

We utilize a **Hybrid Aggregation Strategy**.

### A. The Index (`/sitemap.xml`)
The Worker dynamically generates the Sitemap Index XML in-memory. It stitches together static and dynamic sitemaps.

### B. The Synchronization Engine (Cron Job)
A Scheduled Event (Cron) runs every hour (`0 * * * *`) in the Worker to fetch and cache XML payloads into `TREISHFIN_SEO_CACHE`.

### C. The Serving Layer (Zero Downtime)
When Google requests dynamic sitemaps, the Worker serves them from KV (ms latency). The backend is only touched on cache misses.

---

## 3. SEO Rich Results & Injection

The Worker implements **Edge Hydration** to ensure social media crawlers and Search Engines see rich metadata, even if they don't run JavaScript.

### Logic (Scenario-Based)
* **Homepage (`/`)**: Injects `Organization` schema and `WebSite` schema.
* **Static Pages (`/about`)**: Injects `WebPage` schema.
* **Blog Posts (`/category/...`)**: Injects `NewsArticle` schema and `window.__PRELOADED_STATE__`.
* **Market Pages (`/market/:ticker`)**: Injects `FinancialProduct` schema.

---

## 4. Technical Implementation Details

### Location
* **Code**: `worker/worker.js`
* **Config**: `worker/wrangler.toml`

### Path Translation (Critical)
* **Public URL**: `https://treishvaamfinance.com/sitemap-dynamic/blog/0.xml`
* **Internal API**: `https://backend.treishvaamgroup.com/api/public/sitemap/blog/0.xml`

---

## 5. Deployment

The Worker is managed via `wrangler` and uses GitHub Actions/Secrets for security.

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