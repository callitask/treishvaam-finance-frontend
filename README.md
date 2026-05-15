/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Master documentation for the Treishvaam Finance Next.js Frontend and Cloudflare Edge Worker.
 *
 * Scope:
 * - Covers Next.js 14 App Router architecture, Zero-Trust configuration, SEO, and deployment.
 *
 * Security Constraints:
 * - Tracking IDs and API Origins MUST NOT be hardcoded. Use NEXT_PUBLIC_* env vars only.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial React README.
 * - EDITED: Integrated Cache-Shielding Worker instructions and Zero-Trust Tagging protocols.
 * - EDITED: Updated routing and architectural scopes to reflect apex domain migration.
 * - EDITED (2026-05-15 v4):
 *   • Complete rewrite for Next.js 14 App Router migration.
 *   • Removed all CRA/react-scripts/REACT_APP_* references.
 *   • Updated env vars to NEXT_PUBLIC_*.
 *   • Added Next.js App Router rules, Tiptap v3 rules, anti-patterns.
 *   • Updated project structure to reflect app/ directory.
 *   • Updated dev/build commands.
 */

# Treishvaam Finance Frontend

**Next.js 14 App Router + Cloudflare Edge Worker**

India's premier financial news and market intelligence platform. Engineered for zero-trust security, edge SSR, and enterprise SEO.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.2.x |
| Language | TypeScript (.tsx) + JavaScript (.js) | - |
| Styling | Tailwind CSS | 3.4.x |
| Rich Text Editor | Tiptap | 3.23.x |
| Auth | Keycloak-JS | 23.0.0 |
| HTTP Client | Axios | 1.6.7 |
| Edge Worker | Cloudflare Workers | - |
| Monitoring | Grafana Faro | 2.0.x |
| Deployment | Cloudflare Pages | - |

---

## 1. Security & Configuration (Zero Trust)

This project strictly follows the **12-Factor App** configuration methodology. All production URLs, APIs, and Tracking IDs are decoupled from the source code and injected at runtime via Cloudflare Environment Variables.

### Environment Variables

Create a `.env` file in the root for local development (copy from `.env.example`):

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Spring Boot Backend API URL | **Yes** |
| `NEXT_PUBLIC_AUTH_URL` | Keycloak Authentication server URL | **Yes** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXX`) | No |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads Tracking ID (`AW-XXX`) | No |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense Publisher ID (`ca-pub-XXX`) | No |

**⚠️ NEVER use `REACT_APP_*` prefix** — this is Next.js, not CRA. Use `NEXT_PUBLIC_*` only.

---

## 2. Architecture Highlights

### Next.js 14 App Router (Migrated from CRA)
- Routes live in `app/` directory (`.tsx`/`.ts` files only)
- `src/pages/*.js` files are **components**, not URL routes — imported by `app/*/page.tsx` wrappers
- `next.config.mjs` enforces this: `pageExtensions: ['tsx', 'ts']`
- All `src/pages/*.js` files MUST have `"use client";` at line 1

### Multi-Tenant Architecture
All three Treishvaam frontends share one backend. The Cloudflare Worker injects `X-Tenant-ID: finance` on every request so the backend scopes data to the finance tenant.

### Edge Cache-Shielding
The integrated `worker/worker.js` implements a Tier-1 CDN and Tier-2 KV caching strategy to serve dynamic XML Sitemaps and JSON-LD payloads. Reduces backend load by 95%+ and guarantees High Availability during API outages.

### Aggressive SPA Fallbacks
The Edge Worker intercepts traffic against a `KNOWN_SPA_ROUTES` whitelist and forces `200 OK` responses, preventing Googlebot from receiving 404 errors on direct navigation.

### Semantic Entity Graph
The Edge Worker dynamically injects `Organization`, `FinancialService`, and `NewsArticle` JSON-LD schemas with typo-tolerance `alternateName` arrays for AI crawlers.

### GA4 — Unconditional Collection
GA4 fires on every page load via `strategy="afterInteractive"` in `app/layout.tsx`. No consent gate. `anonymize_ip: true` enabled. This is an explicit business decision.

---

## 3. Project Structure

```text
treishvaam-finance-frontend/
├── app/                    # Next.js App Router (URL routes — .tsx/.ts ONLY)
│   ├── layout.tsx          # Root HTML shell, GA4, Navbar, Footer, Providers
│   ├── page.tsx            # Landing page /
│   ├── providers.tsx       # Client-side context providers
│   ├── home/page.tsx       # Blog feed /home
│   ├── category/[cat]/[slug]/[id]/page.tsx  # Single post
│   ├── dashboard/          # Protected admin routes
│   ├── market/[ticker]/    # Market detail
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── ...
├── src/                    # Legacy CRA source (components, pages, context)
│   ├── pages/*.js          # Page components (NOT URL routes — imported by app/)
│   ├── components/         # Reusable UI widgets
│   │   ├── BlogEditor/     # Tiptap v3 CMS editor
│   │   ├── BlogPage/       # Blog feed components
│   │   ├── market/         # Market data widgets
│   │   ├── market-detail/  # Market detail page components
│   │   └── manage-posts/   # Admin post management
│   ├── context/            # Global state (Auth, Theme, Watchlist)
│   ├── apiConfig.js        # Axios instance + all API functions
│   └── faroConfig.js       # Grafana Faro RUM
├── worker/                 # Cloudflare Edge Worker
│   ├── worker.js           # Tenant injection, SEO, SPA routing, KV cache
│   └── wrangler.toml       # Worker config + KV bindings
├── docs/                   # Architecture documentation
│   ├── 06-FRONTEND-ARCH.md # Next.js App Router architecture
│   ├── 07-FRONTEND-COMPONENTS.md  # Component hierarchy
│   └── 08-SEO-EDGE.md      # Edge Worker + SEO strategy
├── public/                 # Static assets
│   ├── logo.webp           # Logo (use this — logo.png does NOT exist)
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # Crawler directives
│   └── sitemap.xml         # Static sitemap index
└── .env.example            # Environment variable template
```

---

## 4. Installation & Local Development

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI (for Worker development): `npm install -g wrangler`

### First Time Setup
```powershell
# Install dependencies
npm install

# Create local environment variables
copy .env.example .env
# Edit .env with your local values

# Start Next.js development server
npm run dev
```
The application will boot on `http://localhost:3000`.

### Build
```powershell
npm run build
```

---

## 5. Deployment Process

### A. Frontend Deployment (Cloudflare Pages)
1. Push to `main` branch (or merge a `claude/*` feature branch)
2. Cloudflare Pages auto-detects the update, runs `npm run build`
3. Environment Variables must be configured in Cloudflare Pages Dashboard → Settings → Environment Variables

### B. Worker Deployment (Cloudflare Workers)
The Edge Worker handles tenant injection, SEO, and SPA routing. Deploy manually when `worker.js` or `wrangler.toml` changes:
```powershell
cd worker
npx wrangler deploy
```
**After deployment:** Purge Cloudflare cache (Dashboard → Caching → Purge Everything).

### C. Backend Deployment
```powershell
cd "F:\BACKEND PROJECG\finance-api\finance-api"
mvn spotless:apply
git checkout develop
git add .
git commit -m "description"
git push origin develop
# Then restart containers on Ubuntu VM via SSH
```

### D. Nginx Config (Ubuntu VM via SSH)
```bash
sudo cp nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo nginx -s reload
```

---

## 6. Git Branching Rules

- **NEVER** push directly to `main` or `production-deploy`
- **ALWAYS** create `claude/[feature-name]` branch for each task
- Provide git commands but user runs them manually

```powershell
git checkout -b claude/[feature-name]
git add .
git commit -m "feat: [description] — Claude Agent v4"
git push origin claude/[feature-name]
# Then create PR and merge to main
```

---

## 7. Critical Rules (Confirmed from Production Crashes)

### Next.js App Router
- All `src/pages/*.js` MUST have `"use client";` at line 1
- Never use `react-helmet-async` — use Next.js `metadata` export
- `suppressHydrationWarning` must be on `<html>` and `<body>` in `app/layout.tsx`
- Browser-API components MUST use `dynamic(() => import(...), { ssr: false })`
- `GlobalMarketTicker` MUST always be dynamically imported

### Tiptap v3
- `TextStyle` is a named export: `import { TextStyle } from '@tiptap/extension-text-style'`
- `BubbleMenu` is NOT available in v3 edge builds
- StarterKit v3 bundles Link and Underline — disable before adding separately
- Always memoize `extensions` array with `useMemo`

### Security
- Never hardcode API URLs, secrets, or credentials
- All secrets via Infisical / Cloudflare env vars / `.env` (local only)
- Never commit `.env` files
- `logo.png` does NOT exist — always use `logo.webp`

---

## 8. Observability & Telemetry

Grafana Faro (`src/faroConfig.js`) provides Real User Monitoring:
- Core Web Vitals (LCP, FID, CLS)
- Unhandled exceptions and console errors
- User identity (set after Keycloak auth)
- Telemetry sent to `/api/v1/monitoring/ingest`

---

## License
Proprietary software. All rights reserved by Treishvaam Group.
