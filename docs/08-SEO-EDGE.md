# 08 - Enterprise SEO & Edge Architecture

## 1. Architecture Overview: "The Edge Replica"

We have implemented an **Enterprise-Grade Edge-Replica Architecture** using Cloudflare Workers and KV (Key-Value) Storage. This ensures that our SEO infrastructure (Sitemaps, Robots.txt, Rich Results) is **100% Highly Available**, even if the Backend API is down for maintenance.

### The Core Concept
Instead of the Edge "asking" the Backend for data every time Googlebot visits (which creates a dependency), the Edge maintains its own **local replica** of critical SEO data.

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
The Worker dynamically generates the Sitemap Index XML in-memory. It stitches together:
1.  **Static Sitemap**: Points to `/sitemap-static.xml` (Served directly from Frontend assets).
2.  **Dynamic Sitemaps**: Points to `/sitemap-dynamic/blog/0.xml` and `/sitemap-dynamic/market/0.xml`.

### B. The Synchronization Engine (Cron Job)
A Scheduled Event (Cron) runs every hour (`0 * * * *`) in the Worker:
1.  **Fetch**: It calls the Backend API (`/api/public/sitemap/meta`).
2.  **Download**: It downloads the XML content for blogs and market tickers.
3.  **Replica**: It saves this XML into **Cloudflare KV** (`TREISHFIN_SEO_CACHE`).
4.  **Resilience**: If the Backend is down, the Cron fails silently, but the **Old Data in KV remains valid**.

### C. The Serving Layer (Zero Downtime)
When Google requests `/sitemap-dynamic/blog/0.xml`:
1.  **Worker Intercepts**: Checks `TREISHFIN_SEO_CACHE`.
2.  **Hit**: Serves XML immediately (ms latency). **Backend is NOT touched.**
3.  **Miss (Fallback)**: Only if KV is empty, it proxies the request to the Backend (Self-Healing).

---

## 3. SEO Rich Results & Injection

The Worker implements **Edge Hydration** to ensure social media crawlers (Twitter/LinkedIn bots) and Search Engines see rich metadata, even if they don't run JavaScript.

### Logic (Scenario-Based)
The `worker.js` inspects the URL and injects specific JSON-LD schemas:

* **Homepage (`/`)**: Injects `Organization` schema (Social Links, Founder, Contact Point). Injects `WebSite` schema (Search Action).
* **Static Pages (`/about`)**: Injects `WebPage` schema with description.
* **Blog Posts (`/category/...`)**:
    * Fetches Article Metadata.
    * Injects `NewsArticle` schema (Headline, Author, Date, Image).
    * Injects `window.__PRELOADED_STATE__` for React hydration.
* **Market Pages (`/market/:ticker`)**:
    * Fetches Real-Time Quote.
    * Injects `FinancialProduct` schema (Price, Ticker, Exchange).

---

## 4. Technical Implementation Details

### Location
* **Code**: `treishvaam-finance-frontend/worker/worker.js`
* **Config**: `treishvaam-finance-frontend/worker/wrangler.toml`

### Path Translation (Critical)
The Frontend and Backend use different URL structures. The Worker bridges this gap:
* **Public URL**: `https://treishfin.treishvaamgroup.com/sitemap-dynamic/blog/0.xml`
* **Internal API**: `https://backend.treishvaamgroup.com/api/public/sitemap/blog/0.xml`
* **Logic**: The Worker creates the mapping automatically during fetch.

### Dynamic Robots.txt
The Worker intercepts `/robots.txt` and serves a dynamic version that:
1.  Allows specific API paths for Googlebot rendering.
2.  Disallows internal paths (`/api/auth`, `/dashboard`).
3.  Points to the absolute URL of the Sitemap Index.

### Manual Override
In emergencies (e.g., breaking news), the sitemap cache can be forcibly refreshed via:
`https://treishfin.treishvaamgroup.com/sys/force-update`

---

## 5. Deployment

The Worker is managed via `wrangler` and uses GitHub Actions/Secrets for security.

```bash
# Manual Deployment
cd worker
npx wrangler deploy