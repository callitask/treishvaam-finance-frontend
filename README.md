<!--
 * AI-CONTEXT:
 * Purpose: Master documentation for the Treishvaam Finance Next.js Frontend and Cloudflare Edge Worker.
 * Scope: Next.js 14 App Router architecture, Zero-Trust configuration, SEO, GEO, and deployment.
 * Security Constraints: Tracking IDs and API Origins MUST NOT be hardcoded. Use NEXT_PUBLIC_* env vars only.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial React README.
 * - EDITED: Integrated Cache-Shielding Worker instructions and Zero-Trust Tagging protocols.
 * - EDITED: Updated routing and architectural scopes to reflect apex domain migration.
 * - EDITED (2026-05-15 v4): Complete rewrite for Next.js 14 App Router migration.
 *   Removed all CRA/react-scripts/REACT_APP_* references. Updated env vars to NEXT_PUBLIC_*.
 * - EDITED (2026-05-25 v5): Corrected doc references to BE-/FIN- naming convention.
 *   Fixed GA4 privacy toggle description (conditional, not unconditional anonymize_ip).
 *   Removed NEXT_PUBLIC_AUTH_URL (not used in codebase — Keycloak URL is hardcoded in AuthContext per design).
 *   Added NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY and NEXT_PUBLIC_CHAIRMAN_PORTRAIT_URL.
 *   Fixed deployment section (removed SSH server instruction — violates zero-touch deploy protocol).
 *   Added GEO section. Added Tiptap v3 and Serwist critical rules.
-->

# Treishvaam Finance Frontend

**Next.js 14 App Router + Cloudflare Edge Worker**

India's premier financial news and market intelligence platform. Engineered for zero-trust security, edge SSR, enterprise SEO, and Generative Engine Optimization (GEO).

---

## Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js | 14.2.x |
| Language | TypeScript (app/) + JavaScript (src/) | — |
| Styling | Tailwind CSS | 3.4.x |
| Rich Text Editor | Tiptap | 3.23.x |
| Auth | Keycloak-JS | 23.0.0 |
| HTTP Client | Axios | 1.6.7 |
| RUM | Grafana Faro | 2.0.x |
| PWA | Serwist | 9.0.2 |
| Charting | lightweight-charts | 4.1.3 |
| Edge Worker | Cloudflare Workers | — |
| Deployment | Cloudflare Pages | — |

---

## 1. Security & Configuration (Zero Trust)

All production URLs, API origins, and tracking IDs are **decoupled from source code** and injected at build/runtime via Cloudflare environment variables. **Never hardcode any of these.**

### Environment Variables

Copy `.env.example` to `.env` for local development:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Spring Boot Backend API base URL | **Yes** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXX`) | Yes |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads Conversion ID (`AW-XXX`) | Yes |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense Publisher ID (`ca-pub-XXX`) | Yes |
| `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` | `true` / `false` — conditionally injects `anonymize_ip: true` into GA4 without a rebuild | Yes |
| `NEXT_PUBLIC_CHAIRMAN_PORTRAIT_URL` | Dynamic URL for team portrait (bypasses git commits for asset changes) | Yes |

**⚠️ NEVER use `REACT_APP_*` prefix** — this is Next.js 14. Only `NEXT_PUBLIC_*` is valid.

**Note on Keycloak URL:** The Keycloak auth server URL is configured in `src/context/AuthContext.js` (not via env var). This is intentional — the Keycloak realm is tightly coupled to the backend infrastructure and does not change between deployments.

---

## 2. Project Structure

```
treishvaam-finance-frontend/
├── app/                          # Next.js App Router (URL routes — .tsx/.ts ONLY)
│   ├── layout.tsx                # Root HTML shell, GA4, Providers, GEO tags, CSP nonce
│   ├── page.tsx                  # Landing page /
│   ├── providers.tsx             # Client context providers (Auth, Theme, Watchlist)
│   ├── home/page.tsx             # Blog feed /home
│   ├── category/[cat]/[slug]/[id]/page.tsx  # Single post (generateMetadata for SEO)
│   ├── dashboard/                # Protected admin routes
│   │   ├── layout.tsx            # Dashboard layout (auth gate)
│   │   ├── blog/new/page.tsx     # Create post
│   │   ├── blog/edit/[slug]/[id]/page.tsx   # Edit post
│   │   ├── manage-posts/page.tsx
│   │   ├── audience/page.tsx     # Native analytics dashboard
│   │   ├── api-status/page.tsx   # External API health
│   │   └── profile/page.tsx
│   ├── market/[ticker]/page.tsx  # Market detail page
│   ├── llms.txt/route.ts         # GEO proxy → backend /api/public/geo/llms.txt
│   ├── ai-feed.md/route.ts       # GEO proxy → backend /api/public/geo/ai-feed.md
│   ├── ontology.json/route.ts    # GEO proxy → backend /api/public/geo/ontology.json
│   └── opensearch.xml/route.ts   # OpenSearch Description XML
│
├── src/                          # Legacy CRA source — components only, NOT URL routes
│   ├── pages/*.js                # Page components (imported by app/ wrappers)
│   ├── components/               # UI widgets
│   │   ├── AegisTelemetry.tsx    # L5-BIE biometric telemetry (client only)
│   │   ├── WebVitalsTracker.tsx  # Core Web Vitals
│   │   ├── ThirdPartyScripts.js  # Interaction-deferred script loading (0ms TBT)
│   │   ├── BlogEditor/           # Tiptap v3 CMS editor sub-panels
│   │   ├── BlogPage/             # Blog feed layout components
│   │   ├── market/               # Market data widgets
│   │   ├── market-detail/        # Market detail page components
│   │   └── manage-posts/         # Admin post management table + filters
│   ├── context/                  # AuthContext, ThemeContext, WatchlistContext
│   ├── lib/aegis-biometrics.ts   # Client biometric hashing (WebCrypto SHA3-256)
│   ├── apiConfig.js              # Axios instance + all API endpoint functions
│   ├── faroConfig.js             # Grafana Faro RUM configuration
│   ├── sw.ts                     # Serwist service worker
│   └── utils/                   # cloudflareImageLoader, schemaGenerator, marketFormatter, etc.
│
├── worker/
│   ├── worker.js                 # Cloudflare Edge Worker (AEGIS, GEO, KV cache, HMAC signing)
│   └── wrangler.toml             # Worker config + KV bindings + cron trigger
│
├── middleware.ts                 # Per-request CSP nonce generation (Edge-safe)
├── next.config.mjs               # Next.js config (Serwist, custom image loader, headers)
├── tailwind.config.js
├── public/
│   ├── logo.webp                 # ⚠️ logo.png does NOT exist — always use logo.webp
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml               # Static sitemap index
│   └── silent-check-sso.html    # Keycloak silent SSO iframe
└── docs/
    ├── FIN-01-ARCHITECTURE.md    # Next.js App Router architecture + routing strategy
    ├── FIN-02-COMPONENTS.md      # Complete component + page reference
    └── FIN-03-WORKER-EDGE.md     # Edge Worker + KV cache + GEO + HMAC signing reference
```

---

## 3. Architecture Highlights

### Next.js 14 App Router (Migrated from CRA)
- Routes live in `app/` directory — `.tsx`/`.ts` files only (`pageExtensions: ['tsx', 'ts']` in `next.config.mjs`)
- `src/pages/*.js` files are **React components**, not URL routes — they are imported by `app/*/page.tsx` wrappers
- All `src/pages/*.js` files must have `"use client";` at line 1
- Runtime: `export const runtime = 'edge'` in `app/layout.tsx` — full Cloudflare Edge compatibility

### AEGIS L5-BIE Biometric Telemetry
`src/components/AegisTelemetry.tsx` passively records mouse, scroll, and keydown entropy — hashed **client-side** using WebCrypto SHA3-256 before transmission. No raw keystrokes or coordinates leave the browser. 100% GDPR compliant.

### Generative Engine Optimization (GEO)
AI crawlers (GPTBot, ClaudeBot, DeepSeek, and 20+ others) are intercepted by the Cloudflare Edge Worker and served semantic payloads directly from KV — bypassing React entirely. The frontend exposes `/llms.txt`, `/ai-feed.md`, `/ontology.json` via Route Handlers that proxy to the Spring Boot `GeoOptimizationService`.

### Edge Cache-Shielding (Three-Tier)
The integrated `worker/worker.js` implements CDN cache → Cloudflare KV → backend fallback. Reduces backend load by 95%+. Guarantees SEO uptime during API outages.

### GA4 — Conditional Privacy Toggle
GA4 fires on every page load unconditionally. The `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` environment variable conditionally injects `anonymize_ip: true` into the GA4 config — enabling instant GDPR/DPDP compliance without a code rebuild. Default is `false` (full data fidelity for Indian jurisdiction).

**ABSOLUTE RESTRICTION:** GA4 tracking configuration must not be modified in any way that disrupts data collection payload or accuracy.

---

## 4. Installation & Local Development

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI: `npm install -g wrangler`

### First Time Setup
```powershell
npm install
copy .env.example .env
# Fill in .env values
npm run dev
```

The application boots at `http://localhost:3000`.

### Build
```powershell
npm run build
```

---

## 5. Deployment

### Frontend (Cloudflare Pages) — Automatic
Push to `main` → Cloudflare Pages detects push → `npm ci` + `npm run build` → deployed.
Environment variables must be configured in Cloudflare Pages Dashboard → Settings → Environment Variables.

**Important:** Always commit `package-lock.json` alongside `package.json`. Cloudflare Pages uses `npm ci` — a missing or out-of-sync lockfile crashes the build.

### Worker (Cloudflare Workers) — Manual, Conditional
Only deploy the Worker when `worker/worker.js` or `worker/wrangler.toml` has changed:
```powershell
cd "C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\worker"
npx wrangler deploy
```

### Full Deploy Sequence (Frontend + Worker if changed)
```powershell
# If worker.js changed:
cd "C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\worker"
npx wrangler deploy
cd ..

# Always:
git checkout main
git add .
git commit -m "feat: description"
git push origin main
```

**NEVER SSH into the backend server or manually restart Docker containers.** All backend changes go through `git push origin develop` on the backend repo — the Watchdog handles the rest.

---

## 6. Git Branching Rules

- **NEVER** push directly to `main`
- Create feature branches: `claude/[feature-name]`
- Provide git commands for user to run manually
- `package-lock.json` must always be committed with `package.json`

```powershell
git checkout -b claude/feature-name
git add .
git commit -m "feat: description"
git push origin claude/feature-name
# Create PR → merge to main
```

---

## 7. Critical Rules (Confirmed from Production)

### Next.js App Router
- All `src/pages/*.js` must have `"use client";` at line 1
- `suppressHydrationWarning` must be on `<html>` and `<body>` in `app/layout.tsx` — **never remove**
- Never use `react-helmet-async` — use Next.js `metadata` export or `generateMetadata()`
- Browser-API components must use `dynamic(() => import(...), { ssr: false })`
- `GlobalMarketTicker` must always be dynamically imported (uses `window`)
- CSP nonce: `btoa(crypto.randomUUID())` — Edge-safe. Never use `Buffer` (not available in Cloudflare Edge Runtime)

### Tiptap v3
- `TextStyle` is a named export: `import { TextStyle } from '@tiptap/extension-text-style'`
- `BubbleMenu` is not available in v3 edge builds
- StarterKit v3 bundles Link and Underline — disable before adding separately
- Always memoize `extensions` array with `useMemo`

### Serwist (PWA)
- `src/sw.ts` line 1 must be `/// <reference lib="webworker" />`
- Use instantiated strategy classes: `new NetworkFirst()`, `new CacheFirst()` — string handlers cause fatal type errors

### Images
- `logo.png` does **NOT** exist — always use `logo.webp`
- Custom image loader `cloudflareImageLoader.ts` is mandatory — Next.js native optimization crashes on Cloudflare Pages Edge Runtime

### Security
- Never hardcode API URLs, backend origins, or tracking IDs anywhere in source
- Never commit `.env` files
- All secrets via Infisical (backend) / Cloudflare env vars (frontend) / Cloudflare Worker Secrets (edge)

---

## 8. Observability & Telemetry

- **Grafana Faro** (`src/faroConfig.js`): Streams Web Vitals (LCP, FID, CLS, FCP, TTFB), unhandled exceptions, and user identity (post-Keycloak auth) to `/api/v1/monitoring/ingest`
- **WebVitalsTracker** (`src/components/WebVitalsTracker.tsx`): Core Web Vitals via `web-vitals ^2.1.4`
- **AegisTelemetry** (`src/components/AegisTelemetry.tsx`): L5-BIE biometric entropy, client-side hashed, transmitted to `/api/v1/aegis/telemetry`

---

## License
Proprietary software. All rights reserved by Treishvaam Group.