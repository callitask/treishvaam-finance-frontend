# FIN-01 — Frontend Architecture (Next.js 14 App Router)

**Project:** `treishvaam-finance-frontend`
**Version:** Active in Production
**Classification:** Internal Reference (Sanitized)
**Last Verified:** 2026-05-29 — All claims verified against `package.json`, `next.config.mjs`, `middleware.ts`, `app/layout.tsx`, `src/sw.ts`, `worker/wrangler.toml`

---

## 1. Framework & Migration Status

The application has been **fully migrated from Create React App (CRA) to Next.js 14 App Router**.

| Aspect | Old (CRA) | Current (Next.js 14) |
| :--- | :--- | :--- |
| Framework | Create React App | Next.js 14 App Router |
| Routing | react-router-dom | Next.js file-based routing (`app/`) |
| SEO | react-helmet-async (still in package.json for legacy pages) | Next.js `metadata` export / `generateMetadata()` |
| SSR | None (pure SPA) | Edge SSR via Cloudflare Pages |
| Runtime | Browser only | Edge Runtime (`export const runtime = 'edge'`) |
| Build | react-scripts | `next build` |
| Entry | `src/index.js` | `app/layout.tsx` |
| Dev server | `npm start` (port 3000) | `npm run dev` (port 3000) |
| Font loading | Google Fonts CDN | Self-hosted via `@fontsource-variable/inter` |
| Image optimization | react-lazy-load-image-component | Custom `cloudflareImageLoader.ts` (Cloudflare CDN resize) |
| PWA | None | Serwist (`@serwist/next` 9.0.2) |
| Rich Text Editor | SunEditor (removed) | Tiptap v3 (`@tiptap/*` ^3.23.1) |

**Migration status:** In progress — `src/pages/*.js` files are imported as **React components** by `app/*/page.tsx` wrappers. They are NOT URL routes themselves. `pageExtensions: ['tsx', 'ts']` in `next.config.mjs` explicitly prevents `src/pages/` from being scanned as routes.

**Dead code note:** `src/App.js` and `src/index.js` (CRA entry points) still exist but are unused by any Next.js route. They are not harmful but should eventually be removed.

---

## 2. Key Dependencies (Verified from `package.json`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | ^14.2.35 | App Router, Edge SSR, CSP nonce middleware |
| `react` / `react-dom` | ^18.3.1 | UI library |
| `@tiptap/*` | ^3.23.1 | Rich text editor (replaced SunEditor) |
| `keycloak-js` | ^23.0.0 | Keycloak OIDC client |
| `@grafana/faro-web-sdk` | ^2.0.2 | Real User Monitoring (RUM) |
| `@grafana/faro-web-tracing` | ^2.0.2 | Distributed tracing |
| `@serwist/next` + `serwist` | ^9.0.2 | PWA service worker |
| `@fontsource-variable/inter` | ^5.1.0 | Self-hosted variable font |
| `lightweight-charts` | ^4.1.3 | TradingView-style market charts |
| `recharts` | ^3.8.1 | React charting library |
| `axios` | ^1.6.7 | HTTP client |
| `dompurify` | ^3.0.8 | HTML sanitization |
| `lucide-react` | ^0.344.0 | Icon library |
| `tailwindcss` | ^3.4.1 | Utility-first CSS framework |
| `typescript` | 6.0.3 | TypeScript compiler |
| `react-image-crop` | ^11.0.5 | Cover image cropper in Blog Editor |
| `react-dnd` | ^16.0.1 | Drag-and-drop (thumbnail management) |
| `react-slick` | ^0.30.2 | Carousels (market comparison) |
| `date-fns` | ^4.1.0 | Date formatting |
| `web-vitals` | ^2.1.4 | Core Web Vitals reporting |

**Package management:** Uses `npm ci` (not `npm install`) for production builds. `package-lock.json` must always be committed alongside `package.json`. Desync causes Cloudflare Pages Edge builds to crash.

---

## 3. Application Structure

```
treishvaam-finance-frontend/
├── app/                          # Next.js App Router (URL routes — .tsx/.ts only)
│   ├── layout.tsx                # Root HTML shell — GA4, Navbar, Footer, Providers, GEO tags, CSP nonce
│   ├── page.tsx                  # Landing page /
│   ├── providers.tsx             # Client context (Auth, Theme, Watchlist)
│   ├── not-found.tsx             # Custom 404 handler
│   ├── globals.css               # Global CSS overrides
│   ├── home/page.tsx             # Blog feed /home
│   ├── about/page.tsx            # About page
│   ├── contact/page.tsx          # Contact page
│   ├── vision/page.tsx           # Vision page
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   ├── login/
│   │   ├── layout.tsx            # Login-specific layout (minimal, no Navbar/Footer)
│   │   └── page.tsx              # Login page
│   ├── market/[ticker]/page.tsx  # Market detail page /market/:ticker
│   ├── category/[categorySlug]/[postSlug]/[id]/page.tsx  # Dynamic blog post /category/…/…/:id
│   ├── dashboard/                # Admin dashboard routes (authenticated)
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   ├── blog/new/page.tsx     # Create new post
│   │   ├── blog/edit/[slug]/[id]/page.tsx  # Edit existing post
│   │   ├── manage-posts/page.tsx # Post management table
│   │   ├── audience/page.tsx     # Analytics dashboard
│   │   ├── api-status/page.tsx   # External API health dashboard
│   │   └── profile/page.tsx      # User profile
│   ├── ai-feed.md/route.ts       # GEO payload proxy — serves ai-feed.md to LLM crawlers
│   ├── llms.txt/route.ts         # GEO payload proxy — serves llms.txt to AI agents
│   ├── ontology.json/route.ts    # GEO payload proxy — serves JSON-LD ontology graph
│   └── opensearch.xml/route.ts   # OpenSearch description document
│
├── src/                          # Legacy CRA components (imported as components, NOT routes)
│   ├── components/               # All UI components (150+ files)
│   ├── pages/                    # Legacy CRA page components (imported by app/ wrappers)
│   ├── context/                  # React contexts (AuthContext, ThemeContext, WatchlistContext)
│   ├── hooks/                    # Custom hooks (useManagePosts, useCountdown)
│   ├── layouts/                  # Layout wrappers (DashboardLayout, MainLayout)
│   ├── lib/                      # aegis-biometrics.ts (L5-BIE WebCrypto hashing)
│   ├── utils/                    # Utilities (cloudflareImageLoader, schemaGenerator, marketFormatter)
│   ├── faroConfig.js             # Grafana Faro RUM configuration
│   ├── apiConfig.js              # API base URL configuration
│   ├── sw.ts                     # Serwist PWA service worker
│   ├── index.css                 # Global CSS (imported by layout.tsx with @ts-ignore)
│   ├── App.js                    # [UNUSED — CRA legacy dead code]
│   └── index.js                  # [UNUSED — CRA legacy dead code]
│
├── worker/
│   ├── worker.js                 # Cloudflare Edge Worker (616 lines) — main entry point
│   └── wrangler.toml             # Worker config: KV bindings, cron, env vars
│
├── public/
│   ├── _headers                  # Cloudflare Pages security headers (static assets)
│   ├── _redirects                # Cloudflare Pages SPA fallback rules
│   ├── robots.txt                # Search engine crawler directives
│   ├── sitemap.xml               # Static sitemap index (points to backend dynamic sitemaps)
│   ├── manifest.json             # PWA manifest
│   ├── silent-check-sso.html     # Keycloak silent SSO iframe check
│   └── .well-known/security.txt  # Security contact disclosure
│
├── middleware.ts                 # Per-request CSP nonce generation (Edge Runtime)
├── next.config.mjs               # Next.js config (Serwist PWA, Cloudflare image loader, headers)
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── jsconfig.json                 # JS path aliases
└── package.json                  # Dependencies (npm ci enforced)
```

---

## 4. Critical Architectural Constraints

### A. Edge Runtime — Mandatory

`app/layout.tsx` exports `export const runtime = 'edge'`. This is mandatory because `headers()` (used to read the CSP nonce) forces dynamic rendering, which requires the Edge Runtime for `@cloudflare/next-on-pages` compilation. **Never remove this export.**

### B. CSP Nonce — How It Works

```
1. Request arrives at Cloudflare Pages
2. middleware.ts executes at Edge:
   - nonce = btoa(crypto.randomUUID())  ← Edge-safe (no Buffer)
   - Attaches Content-Security-Policy header with nonce
   - Sets x-nonce request header
3. app/layout.tsx reads x-nonce via headers()
4. Nonce injected into all Script components and inline scripts
5. 'unsafe-inline' is NOT present in CSP — nonce is the only inline permission
```

**Do NOT use `Buffer.from()` in middleware.ts** — Buffer is not available in Cloudflare Edge Runtime.

### C. Hydration — suppressHydrationWarning

Both `<html>` and `<body>` tags carry `suppressHydrationWarning`. **Never remove this.** It prevents fatal React SSR hydration crashes from:
- `ThemeProvider` reading from `localStorage` (server renders 'light', client may render 'dark')
- Keycloak async initialization altering the DOM before hydration completes

### D. Image Optimization

`next.config.mjs` uses `loader: 'custom'` with `loaderFile: './src/utils/cloudflareImageLoader.ts'`. This delegates image resizing to Cloudflare's CDN. Next.js native server-side image optimization (`unoptimized: false` default) crashes on Cloudflare Pages Edge. **Never revert to native Next.js image optimization.**

### E. PWA Service Worker (Serwist)

`src/sw.ts` must include `/// <reference lib="webworker" />` at the top. Serwist Strategy handlers must be instantiated as actual class instances (`new NetworkFirst()`) — not legacy strings (`'NetworkFirst'`). Using string handlers causes fatal `RouteHandler` type assignment errors during build.

### F. Font Import — @ts-ignore Required

```typescript
// @ts-ignore
import '@fontsource-variable/inter';
```

The `@ts-ignore` is required. Cloudflare's strict TypeScript checker fails on side-effect imports lacking `.d.ts` declarations. This is not a code quality issue — it is an edge runtime constraint.

### G. GA4 Data Collection Mandate

The GA4 configuration in `app/layout.tsx` defaults to full IP retention (no `anonymize_ip`). This is intentional — the primary audience is in India, which currently does not mandate IP anonymization for this use case, and business requirements dictate complete data capture. The `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY=true` environment variable can activate `anonymize_ip: true` without a code change. **Never hardcode `anonymize_ip: true` permanently.**

### H. Third-Party Script Loading (Performance)

`src/components/ThirdPartyScripts.js` uses interaction-based deferred loading (scroll, mousemove, touchstart, or 7-second idle fallback) to achieve **0ms Thread-Blocking Time (TBT)**. All tracking IDs (GA4, Ads, AdSense) are injected via `NEXT_PUBLIC_*` environment variables. **Never hardcode publisher IDs.**

---

## 5. GEO API Route Handlers

These four Next.js API routes proxy GEO payloads from the backend to serve AI crawlers:

| Route | File | Backend Endpoint | Content-Type |
| :--- | :--- | :--- | :--- |
| `/llms.txt` | `app/llms.txt/route.ts` | `GET /api/public/geo/llms.txt` | `text/plain` |
| `/ai-feed.md` | `app/ai-feed.md/route.ts` | `GET /api/public/geo/ai-feed.md` | `text/markdown` |
| `/ontology.json` | `app/ontology.json/route.ts` | `GET /api/public/geo/ontology.json` | `application/json` |
| `/opensearch.xml` | `app/opensearch.xml/route.ts` | Self-contained — generates XML inline | `application/opensearchdescription+xml` |

These handlers include `X-Tenant-ID: finance` in their backend fetch headers. The Worker intercepts LLM crawlers before they reach these Next.js handlers and serves KV-cached versions directly — these handlers serve as backend fallback.

---

## 6. Keycloak Authentication Architecture

- **Client:** `keycloak-js` v23.0.0
- **Context:** `src/context/AuthContext.js` — manages Keycloak lifecycle (init, login, logout, token refresh)
- **Silent SSO:** `public/silent-check-sso.html` — Keycloak iframe-based silent token renewal
- **Provider:** `app/providers.tsx` wraps the entire app with `AuthProvider`
- **Protected Routes:** `src/components/PrivateRoute.js` — redirects unauthenticated users to `/login`
- **Dashboard Guard:** `app/dashboard/layout.tsx` — authentication gating for all admin routes

---

## 7. Deployment Pipeline

1. Developer pushes to `main` branch
2. Cloudflare Pages automatically triggers a build (`npm ci` + `next build`)
3. Build output deployed to global Cloudflare Edge CDN
4. If `worker/worker.js` or `worker/wrangler.toml` changed: run `npx wrangler deploy` **first**, then push

**⚠️ Worker deployment rule:** Only deploy the Cloudflare Worker when `worker/worker.js` or `wrangler.toml` was actually modified. Do not run `npx wrangler deploy` for pure frontend changes.

---

## 8. Known Issues & Observations (Code-Verified)

| Issue | Location | Severity | Notes |
| :--- | :--- | :--- | :--- |
| `package.json` `homepage` stale | `package.json` | Low | References legacy `treishfin.treishvaamgroup.com`. Should be updated to `https://treishvaamfinance.com`. Does not affect routing. |
| Dead code `App.js`, `index.js` | `src/App.js`, `src/index.js` | Low | CRA entry points no longer used by Next.js. Not harmful but confusing. |
| `react-helmet-async` in package.json | `package.json` | Low | Legacy dependency from CRA era. Still used by some `src/pages/` components that haven't been fully migrated to Next.js `metadata` exports. |

---

## IMMUTABLE CHANGE HISTORY (DO NOT DELETE)

- **VERIFIED (2026-05-29 — Enterprise Documentation Generation):**
  - All claims verified against `package.json`, `next.config.mjs`, `middleware.ts`, `app/layout.tsx`, `app/providers.tsx`, `src/sw.ts`, `src/components/ThirdPartyScripts.js`, `src/lib/aegis-biometrics.ts`, `src/utils/cloudflareImageLoader.ts`, `worker/wrangler.toml`.
  - Added dead code observation for `src/App.js` and `src/index.js`.
  - Added `package.json` `homepage` stale field observation.
  - Added complete `app/` directory structure with all routes.
  - Added complete `src/` structure listing.
  - Confirmed TypeScript version 6.0.3 (devDependencies).
  - No architectural claims changed — existing docs were accurate.