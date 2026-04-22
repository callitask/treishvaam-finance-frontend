/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Master documentation for the Treishvaam Finance React Frontend and Cloudflare Edge Worker.
 *
 * Scope:
 * - Covers React SPA architecture, Hybrid SSG Edge integration, Zero-Trust environment configurations, semantic SEO, and deployment strategies.
 *
 * Security Constraints:
 * - Tracking IDs and API Origins MUST NOT be hardcoded. They must be injected via environment variables.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial React README.
 * - EDITED:
 * • Integrated Cache-Shielding Worker instructions and Zero-Trust Tagging protocols.
 * - EDITED (LATEST):
 * • Updated routing and architectural scopes to reflect the migration to the dedicated Apex domain (treishvaamfinance.com).
 * • Documented the "Aggressive SPA Fallback" mechanism to resolve Google Search Console 404 indexing penalties.
 * • Documented the Semantic Entity Typo-Tolerance JSON-LD injection logic.
 */

# Treishvaam Finance Frontend (React SPA + Edge Worker)

The Treishvaam Finance Frontend is a high-performance React Single Page Application (SPA) augmented by an Enterprise Cloudflare Worker. It serves as a global financial news, market data, and editorial platform, engineered for 0ms latency, zero-trust security, and absolute SERP dominance.

## 1. Security & Configuration (Zero Trust)

This project strictly follows the **12-Factor App** configuration methodology. All production URLs, APIs, and Tracking IDs are decoupled from the source code and injected at runtime via Cloudflare Environment Variables.

### Environment Variables
Create a `.env` file in the root for local development.

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | The URL of the Spring Boot Backend API. | **Yes** |
| `REACT_APP_AUTH_URL` | The Keycloak Authentication server URL for OIDC flow. | **Yes** |
| `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXX`). | No |
| `REACT_APP_GOOGLE_ADS_ID` | Google Ads Tracking ID (`AW-XXX`). | No |
| `REACT_APP_ADSENSE_CLIENT_ID`| Google AdSense Publisher ID (`ca-pub-XXX`). | No |

## 2. Architecture Highlights

* **Hybrid SSG (Visual Handover)**: The React app dynamically takes over HTML payloads pre-rendered by the Cloudflare Worker, achieving instantaneous LCP (Largest Contentful Paint) without the fragility of standard React Hydration (`ReactDOM.createRoot` over `#server-content` cleanup).
* **Edge Cache-Shielding**: The integrated `worker/worker.js` implements a Tier-1 CDN and Tier-2 KV caching strategy to serve dynamic XML Sitemaps and JSON-LD payloads. This reduces backend load by over 95% and guarantees High Availability during API outages.
* **Aggressive SPA Fallbacks**: To prevent Googlebot from receiving 404 errors on direct navigation to static routes, the Edge Worker intercepts traffic against a `KNOWN_SPA_ROUTES` whitelist (e.g., `/about`, `/vision`) and forces a `200 OK` response, delivering the `index.html` shell.
* **Semantic Entity Graph**: The Edge Worker dynamically injects `Organization`, `FinancialService`, and `NewsArticle` JSON-LD schemas. These schemas utilize hidden `alternateName` arrays to map phonetic typos and the founder's dual-persona deterministically for AI crawlers.
* **0ms TBT Analytics Loading**: All tracking tags are injected via an **Interaction-Based Deferred Strategy** (`ThirdPartyScripts.js`), triggering only on user `scroll` or `mousemove` to guarantee a 100/100 Lighthouse Performance score.

## 3. Project Structure

```text
treishvaam-finance-frontend/
├── src/                   # React Application Source
│   ├── components/        # Reusable UI widgets (Market, Blog, Admin)
│   ├── context/           # Global State (Auth, Theme, Watchlist)
│   ├── hooks/             # Custom React Hooks
│   ├── layouts/           # Main Layout & Dashboard Layout
│   ├── pages/             # Route-level Page Components
│   ├── utils/             # Schema Generators, Image Optimization
│   ├── apiConfig.js       # Centralized BFF Axios interceptors
│   ├── faroConfig.js      # Grafana Faro RUM & Observability
│   └── index.js           # Application Bootstrapper
├── worker/                # Cloudflare Edge Worker
│   ├── worker.js          # The Edge Interceptor, Fallback Router & SEO Hydrator
│   └── wrangler.toml      # Worker Configuration & KV Bindings
├── public/                # Static assets, manifests, and index.html
└── .env                   # Local development secrets (Git-ignored)
```

## 4. Installation & Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI (for Worker development)

### First Time Setup
```bash
# Install dependencies
npm install

# Create local environment variables
cp .env.example .env

# Start React development server
npm start
```
The application will boot on `http://localhost:3000`.

## 5. Deployment Process

The deployment pipeline is bifurcated into the Static Asset build (React) and the Edge Interceptor (Worker).

### A. Frontend Deployment (Cloudflare Pages)
1. Push the repository to the designated production branch.
2. Cloudflare Pages automatically detects the update, installs dependencies, and runs `npm run build`.
3. Ensure Environment Variables are configured in the Cloudflare Pages Dashboard under Settings.

### B. Worker Deployment (Cloudflare Workers)
The Edge Worker handles the Cache-Shielding, SEO injections, and SPA Fallbacks. It MUST be deployed manually whenever routing logic or SEO schemas change.
```bash
cd worker
npx wrangler deploy
```
*CRITICAL POST-DEPLOYMENT PROTOCOL: A manual Cloudflare Cache Purge ("Purge Everything") in the caching dashboard is mandatory after Worker deployments to ensure new JSON-LD schemas and 200 OK Fallback overrides propagate immediately to search engines.*

## 6. Observability & Telemetry
The application utilizes Grafana Faro (`faroConfig.js`) for Real User Monitoring (RUM). It captures Core Web Vitals (LCP, FID, CLS), unhandled exceptions, and console errors, forwarding telemetry data directly to the backend ingestion endpoint for mission-control dashboards.

## License
Proprietary software. All rights reserved by Treishvaam Group.