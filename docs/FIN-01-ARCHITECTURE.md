# 06 — Frontend Architecture (v4 — Next.js 14 App Router)

**Project:** `treishvaam-finance-frontend`
**Version:** Active in Production
**Classification:** Internal Reference (Sanitized)

---

## 1. Framework & Migration Status

The application has been **fully migrated from Create React App (CRA) to Next.js 14 App Router**.

| Aspect | Old (CRA) | Current (Next.js 14) |
| :--- | :--- | :--- |
| Framework | Create React App | Next.js 14 App Router |
| Routing | react-router-dom | Next.js file-based routing (`app/`) |
| SEO | react-helmet-async | Next.js `metadata` export / `generateMetadata()` |
| SSR | None (pure SPA) | Edge SSR via Cloudflare Pages |
| Runtime | Browser only | Edge Runtime (`export const runtime = 'edge'`) |
| Build | react-scripts | `next build` |
| Entry | `src/index.js` | `app/layout.tsx` |
| Dev server | `npm start` (port 3000) | `npm run dev` (port 3000) |
| Font loading | Google Fonts CDN | Self-hosted via `@fontsource-variable/inter` |
| Image optimization | react-lazy-load | Custom `cloudflareImageLoader.ts` (Cloudflare CDN resize) |
| PWA | None | Serwist (`@serwist/next` 9.0.2) |

**Migration status:** In progress — `src/pages/*.js` files are imported as **components** by `app/*/page.tsx` wrappers. They are NOT URL routes themselves.

---

## 2. Key Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | ^14.2.35 | App Router, Edge SSR |
| `react` / `react-dom` | ^18.3.1 | UI library |
| `@tiptap/*` | ^3.23.1 | Rich text editor (replaced SunEditor) |
| `keycloak-js` | ^23.0.0 | Keycloak OIDC client |
| `@grafana/faro-web-sdk` | ^2.0.2 | Real User Monitoring (RUM) |
| `@grafana/faro-web-tracing` | ^2.0.2 | Distributed tracing |
| `@serwist/next` + `serwist` | ^9.0.2 | PWA service worker |
| `@fontsource-variable/inter` | ^5.1.0 | Self-hosted variable font |
| `lightweight-charts` | ^4.1.3 | TradingView-style market charts |
| `axios` | ^1.6.7 | HTTP client |
| `dompurify` | ^3.0.8 | HTML sanitization |
| `recharts` | ^3.8.1 | React charting library |
| `lucide-react` | ^0.344.0 | Icon library |

---

## 3. Application Structure

```
treishvaam-finance-frontend/
├── app/                          # Next.js App Router (URL routes — .tsx/.ts only)
│   ├── layout.tsx                # Root HTML shell, GA4, Navbar, Footer, Providers, GEO tags
│   ├── page.tsx                  # Landing page /
│   ├── providers.tsx             # Client-side context providers (Auth, Theme, Watchlist)
│   ├── home/page.tsx             # Blog feed /home
│   ├── category/[cat]/[slug]/[id]/page.tsx  # Single post page
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── vision/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── login/page.tsx + layout.tsx
│   ├── market/[ticker]/page.tsx  # Market detail page
│   ├── not-found.tsx             # 404 fallback
│   ├── dashboard/                # Protected admin dashboard routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── blog/new/page.tsx
│   │   ├── blog/edit/[slug]/[id]/page.tsx
│   │   ├── manage-posts/page.tsx
│   │   ├── audience/page.tsx
│   │   ├── api-status/page.tsx
│   │   └── profile/page.tsx
│   ├── llms.txt/route.ts         # GEO proxy → /api/public/geo/llms.txt
│   ├── ai-feed.md/route.ts       # GEO proxy → /api/public/geo/ai-feed.md
│   ├── ontology.json/route.ts    # GEO proxy → /api/public/geo/ontology.json
│   └── opensearch.xml/route.ts   # OpenSearch Description XML
│
├── src/                          # Legacy CRA source (components, pages, context)
│   ├── pages/*.js                # Page COMPONENTS (imported by app/ wrappers — NOT URL routes)
│   ├── components/               # Reusable UI widgets
│   │   ├── AegisTelemetry.tsx    # L5-BIE biometric telemetry (client component)
│   │   ├── WebVitalsTracker.tsx  # Core Web Vitals via web-vitals
│   │   ├── ThirdPartyScripts.js  # Deferred interaction-based script loading
│   │   └── ...
│   ├── lib/
│   │   └── aegis-biometrics.ts   # Client-side biometric entropy hashing (WebCrypto SHA3-256)
│   ├── context/
│   │   ├── AuthContext.js        # Keycloak OIDC lifecycle management
│   │   ├── ThemeContext.js       # Dark/light mode (localStorage)
│   │   └── WatchlistContext.js   # Market watchlist state
│   ├── utils/
│   │   ├── cloudflareImageLoader.ts  # Custom Next.js image loader (Cloudflare CDN)
│   │   ├── schemaGenerator.js        # JSON-LD schema generation helpers
│   │   └── ...
│   ├── apiConfig.js              # Axios instance + all API endpoint functions
│   ├── faroConfig.js             # Grafana Faro RUM configuration
│   ├── sw.ts                     # Service Worker (Serwist)
│   └── index.css                 # Global CSS
│
├── worker/
│   ├── worker.js                 # Cloudflare Edge Worker (L4-ADA, GEO, KV cache, HMAC signing)
│   └── wrangler.toml             # Worker config + KV namespace bindings
│
├── middleware.ts                 # CSP nonce generation (per-request, Edge-safe)
├── next.config.mjs               # Next.js config (Serwist, custom image loader, headers)
├── tailwind.config.js            # Tailwind CSS
└── public/
    ├── robots.txt
    ├── sitemap.xml               # Static sitemap index (dynamic pages via SitemapService)
    ├── manifest.json             # PWA manifest
    └── silent-check-sso.html     # Keycloak silent SSO iframe
```

---

## 4. Routing Strategy

**CRITICAL:** `next.config.mjs` sets `pageExtensions: ['tsx', 'ts']` — Next.js treats ONLY `.tsx`/`.ts` files as routes. The `src/pages/*.js` files are **components**, not routes. API routes use `route.ts`.

| URL | App Route File | Component / Action |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Self-contained landing page (Client Component) |
| `/home` | `app/home/page.tsx` | Wraps `src/pages/BlogPage.js` |
| `/category/[cat]/[slug]/[id]` | `app/category/.../page.tsx` | Wraps `src/pages/SinglePostPage.js`; uses `generateMetadata()` |
| `/dashboard/**` | `app/dashboard/layout.tsx` | Protected; wraps `src/layouts/DashboardLayout.js` |
| `/market/[ticker]` | `app/market/[ticker]/page.tsx` | Wraps `src/pages/MarketDetailPage.js` |
| `/login` | `app/login/page.tsx` | Wraps `src/pages/LoginPage.js` |
| `/about` | `app/about/page.tsx` | Wraps `src/pages/AboutPage.js` |
| `/contact` | `app/contact/page.tsx` | Wraps `src/pages/ContactPage.js` |
| `/vision` | `app/vision/page.tsx` | Wraps `src/pages/VisionPage.js` |
| `/privacy` | `app/privacy/page.tsx` | Wraps `src/pages/PrivacyPage.js` |
| `/terms` | `app/terms/page.tsx` | Wraps `src/pages/TermsPage.js` |
| `/llms.txt` | `app/llms.txt/route.ts` | Backend GEO proxy (text/plain) |
| `/ai-feed.md` | `app/ai-feed.md/route.ts` | Backend GEO proxy (text/markdown) |
| `/ontology.json` | `app/ontology.json/route.ts` | Backend GEO proxy (application/json) |
| `/opensearch.xml` | `app/opensearch.xml/route.ts` | OpenSearch Description XML |

---

## 5. Authentication Architecture

- **Provider:** Keycloak 25.0.0 (OIDC)
- **Client:** `keycloak-js ^23.0.0`
- **Session Management:** `src/context/AuthContext.js` manages the full Keycloak lifecycle
- **SSR Guard:** `if (typeof window === 'undefined') return;` at top of Keycloak `useEffect` — prevents SSR crashes
- **Bot Detection:** Keycloak init is skipped for Googlebot, Lighthouse, and headless browsers
- **Silent SSO:** `public/silent-check-sso.html` in a hidden iframe for token renewal
- **Auto-Refresh:** Token refreshed every 60 seconds via `setInterval`
- **Graceful Degradation:** 10-second timeout → guest mode (site fully functional without auth)

---

## 6. CSP Nonce Architecture (middleware.ts)

A cryptographic nonce is generated per HTTP request using `btoa(crypto.randomUUID())` — **fully Edge-safe** (no `Buffer` dependency, which is not available in Cloudflare's strict Edge Runtime).

The nonce is:
1. Embedded in the `Content-Security-Policy` response header (`'nonce-{nonce}'` in `script-src` and `style-src`)
2. Passed to `app/layout.tsx` via the `x-nonce` request header
3. Applied to all `<Script>` components via the `nonce` prop

`'unsafe-inline'` and `'unsafe-eval'` are explicitly absent from the CSP. All inline script execution requires the per-request nonce.

---

## 7. Image Optimization (cloudflareImageLoader.ts)

Next.js native server-side image optimization (`unoptimized: false`) is incompatible with Cloudflare Pages Edge Runtime. A custom loader (`src/utils/cloudflareImageLoader.ts`) delegates all image resizing to Cloudflare's CDN, restoring optimization without Edge crashes.

---

## 8. PWA / Service Worker (Serwist)

- **Library:** `@serwist/next` + `serwist` 9.0.2
- **Source:** `src/sw.ts`
- **Output:** `public/sw.js` (generated at build time)
- **CRITICAL:** `src/sw.ts` must include `/// <reference lib="webworker" />` at line 1
- **CRITICAL:** Route handlers must use actual Serwist Strategy class instances (e.g., `new NetworkFirst()`) — legacy string handlers cause fatal `RouteHandler` type errors at build time
- **Disabled in development** (`process.env.NODE_ENV === 'development'`)

---

## 9. Self-Hosted Fonts

`@fontsource-variable/inter ^5.1.0` self-hosts the Inter variable font. The import in `app/layout.tsx`:

```tsx
// @ts-ignore  ← required: bypasses strict TS module resolution on CSS side-effect import
import '@fontsource-variable/inter';
```

The `@ts-ignore` is intentional and permanent — removing it breaks the Cloudflare Edge build.

---

## 10. Hydration Safety

`app/layout.tsx` sets `suppressHydrationWarning` on both `<html>` and `<body>`. This is **mandatory** and must never be removed. It prevents fatal Next.js SSR hydration crashes caused by:
- `ThemeProvider` reading `localStorage` client-side (different from server-rendered default)
- Keycloak async initialization producing client/server DOM mismatches
- Any timestamp or auth-state-dependent DOM differences

Browser-API-dependent components use `dynamic(..., { ssr: false })` to prevent SSR execution.

---

## 11. Analytics Architecture

- **GA4:** Fires unconditionally via `<Script strategy="afterInteractive">` in `app/layout.tsx`
- **Privacy Toggle:** `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` env var conditionally injects `anonymize_ip: true` — maintains 100% data fidelity by default (Indian jurisdiction) while enabling instant GDPR compliance
- **ABSOLUTE RESTRICTION:** GA4 tracking configuration must not be modified, removed, or "optimized" in any way that disrupts data collection
- **Faro RUM:** `src/faroConfig.js` streams Web Vitals and unhandled exceptions to the internal Grafana observability stack
- **WebVitals:** `WebVitalsTracker.tsx` uses `web-vitals ^2.1.4` for Core Web Vitals reporting
- **BigQuery:** GA4 raw event data extracted programmatically via Google Cloud BigQuery API for unsampled historical analytics
