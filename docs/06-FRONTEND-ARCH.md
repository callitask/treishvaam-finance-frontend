/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Documents the Treishvaam Finance Frontend architecture.
 *
 * Scope:
 * - Covers Next.js App Router migration, routing, auth, state, API, and Zero-Trust protocols.
 *
 * Security Constraints:
 * - Zero Trust: No API keys, tracking IDs, or secrets may be hardcoded.
 *
 * Non-Negotiables:
 * - All third-party scripts must use Next.js Script component with strategy="afterInteractive".
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Initial Frontend Architecture documentation.
 * - EDITED: Added Section 11: Zero-Trust Third-Party Tag Management.
 * - EDITED: Updated routing and architectural scopes to reflect apex domain migration.
 * - EDITED (2026-05-15 v4):
 *   • Complete rewrite to reflect Next.js 14 App Router migration (CRA → Next.js).
 *   • Removed all CRA/react-scripts references.
 *   • Removed HelmetProvider references (removed in BUG-HYDRATION-01 fix).
 *   • Updated env vars from REACT_APP_* to NEXT_PUBLIC_*.
 *   • Added Tiptap v3 rules, Next.js App Router rules, anti-patterns.
 *   • Updated component references (SunEditor → Tiptap).
 */

# 06 - Frontend Architecture (v4 — Next.js 14 App Router)

## 1. Framework & Migration Status

The application has been **migrated from Create React App (CRA) to Next.js 14 App Router**.

| Aspect | Old (CRA) | Current (Next.js 14) |
|--------|-----------|---------------------|
| Framework | Create React App | Next.js 14 App Router |
| Routing | react-router-dom | Next.js file-based routing (`app/`) |
| SEO | react-helmet-async | Next.js `metadata` export / `generateMetadata()` |
| SSR | None (pure SPA) | Edge SSR via Cloudflare Pages |
| Build | react-scripts | next build |
| Entry | src/index.js | app/layout.tsx |
| Dev server | npm start (port 3000) | npm run dev (port 3000) |

**Migration status:** In progress. `src/pages/*.js` files are imported as components by `app/*/page.tsx` wrappers. They are NOT URL routes themselves.

---

## 2. Application Structure

```
treishvaam-finance-frontend/
├── app/                    # Next.js App Router (URL routes — .tsx only)
│   ├── layout.tsx          # Root HTML shell, GA4, Navbar, Footer, Providers
│   ├── page.tsx            # Landing page /
│   ├── providers.tsx       # Client-side context providers (Auth, Theme, Watchlist)
│   ├── home/page.tsx       # Blog feed /home → wraps src/pages/BlogPage.js
│   ├── category/[cat]/[slug]/[id]/page.tsx  # Single post → wraps SinglePostPage.js
│   ├── dashboard/          # Protected dashboard routes
│   ├── market/[ticker]/    # Market detail page
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── ...
├── src/                    # Legacy CRA source (components, pages, context)
│   ├── pages/*.js          # Page components (imported by app/ wrappers, NOT URL routes)
│   ├── components/         # Reusable UI widgets
│   ├── context/            # Global state (Auth, Theme, Watchlist)
│   ├── apiConfig.js        # Axios instance + all API functions
│   └── faroConfig.js       # Grafana Faro RUM
├── worker/                 # Cloudflare Edge Worker
│   ├── worker.js           # Tenant injection, SEO, SPA routing
│   └── wrangler.toml       # Worker config + KV bindings
└── public/                 # Static assets (logo.webp, manifest.json, robots.txt)
```

---

## 3. Routing Strategy

**CRITICAL:** `next.config.mjs` sets `pageExtensions: ['tsx', 'ts']` — Next.js ONLY treats `.tsx`/`.ts` files as routes. The `src/pages/*.js` files are components, not routes.

| URL | App Route File | Component Rendered |
|-----|---------------|-------------------|
| `/` | `app/page.tsx` | Self-contained landing page |
| `/home` | `app/home/page.tsx` | `src/pages/BlogPage.js` |
| `/category/[cat]/[slug]/[id]` | `app/category/.../page.tsx` | `src/pages/SinglePostPage.js` |
| `/dashboard/**` | `app/dashboard/layout.tsx` | `src/layouts/DashboardLayout.js` |
| `/market/[ticker]` | `app/market/[ticker]/page.tsx` | `src/pages/MarketDetailPage.js` |
| `/login` | `app/login/page.tsx` | `src/pages/LoginPage.js` |
| `/privacy` | `app/privacy/page.tsx` | `src/pages/PrivacyPage.js` |
| `/terms` | `app/terms/page.tsx` | `src/pages/TermsPage.js` |

---

## 4. Authentication & Security

- **Session Management**: `src/context/AuthContext.js` manages Keycloak OIDC lifecycle
- **SSR Guard**: `if (typeof window === 'undefined') return;` at top of Keycloak init `useEffect`
- **Bot Detection**: Skips Keycloak init for Googlebot/Lighthouse/headless browsers
- **Silent SSO**: Uses `public/silent-check-sso.html` in hidden iframe for token renewal
- **Token Refresh**: Auto-refreshes token every 60 seconds via `setInterval`
- **Graceful Degradation**: 10-second timeout → guest mode (site works without auth)
- **Interceptor**: `src/apiConfig.js` attaches `Authorization: Bearer <token>` to all requests

**Public pages** (no auth required): `/`, `/home`, `/category/**`, `/privacy`, `/terms`, `/about`, `/contact`, `/vision`, `/market/**`

**Protected pages** (auth required): `/dashboard/**` only

---

## 5. State Management

| Context | Purpose | Persistence |
|---------|---------|------------|
| `AuthContext` | Keycloak identity state, token, roles | Session only |
| `ThemeContext` | Dark/Light mode preference | localStorage |
| `WatchlistContext` | Market data favorites | localStorage |

**Note:** `app/providers.tsx` wraps all three. `HelmetProvider` was REMOVED (BUG-HYDRATION-01 fix).

---

## 6. API Layer

- **File**: `src/apiConfig.js`
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (never hardcoded)
- **Auth**: Bearer token interceptor
- **All endpoints**: See `ARCHITECTURE_QUICKREF.md` API table

---

## 7. Rich Text Editor (Tiptap v3)

The blog editor uses **Tiptap v3** (replaced SunEditor in Phase 5 migration).

**Installed extensions** (all in `package.json`):
- `@tiptap/starter-kit` — base formatting
- `@tiptap/extension-image` — image insertion
- `@tiptap/extension-link` — hyperlinks
- `@tiptap/extension-youtube` — YouTube embeds
- `@tiptap/extension-underline` — underline
- `@tiptap/extension-text-style` — text styling (named export in v3!)
- `@tiptap/extension-color` — text color
- `@tiptap/extension-text-align` — text alignment

**Critical v3 rules** (confirmed from production crashes):
1. `TextStyle` is a named export: `import { TextStyle } from '@tiptap/extension-text-style'`
2. `BubbleMenu` is NOT available in v3 edge builds — do not use
3. StarterKit v3 bundles Link and Underline — disable before adding separately:
   `StarterKit.configure({ link: false, underline: false })`
4. Always memoize `extensions` array with `useMemo`

---

## 8. SEO Strategy

**Next.js metadata API** (NOT react-helmet-async):
- `app/layout.tsx` — global metadata + JSON-LD Organization schema
- `app/category/.../page.tsx` — `generateMetadata()` for article SEO
- `app/market/[ticker]/page.tsx` — `generateMetadata()` for market pages
- All `app/*/page.tsx` files — `export const metadata = {...}`

**GA4**: Fires unconditionally via `strategy="afterInteractive"` in `app/layout.tsx`. No consent gate. `anonymize_ip: true` enabled.

---

## 9. Hydration Rules (CRITICAL)

To prevent React errors #418/#423/#425:
1. `suppressHydrationWarning` on BOTH `<html>` and `<body>` in `app/layout.tsx`
2. All browser-API components use `dynamic(() => import(...), { ssr: false })`
3. `GlobalMarketTicker` MUST use dynamic import — never static import
4. All `src/pages/*.js` files MUST have `"use client";` at line 1
5. Never use `className={theme}` on `<html>` — ThemeProvider manages it client-side

---

## 10. Edge Layer Integration

The `worker/worker.js` Cloudflare Worker handles:
- **Tenant injection**: `X-Tenant-ID: finance` header on all requests
- **SPA routing**: Forces 200 OK for known routes (prevents GSC 404s)
- **SEO injection**: JSON-LD schemas, meta tags at the edge
- **KV sitemap cache**: Three-tier cache-shielding (CDN → KV → Backend)
- **Security headers**: HSTS, CSP, Permissions-Policy

---

## 11. Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL |
| `NEXT_PUBLIC_AUTH_URL` | Frontend | Keycloak URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Frontend | GA4 Measurement ID |
| `BACKEND_API_URL` | Worker | Backend URL for proxy |
| `FRONTEND_URL` | Worker | Frontend domain |

**NEVER use `REACT_APP_*` prefix** — this project uses Next.js (`NEXT_PUBLIC_*`).

---

## IMMUTABLE CHANGE HISTORY
- ADDED: Initial Frontend Architecture documentation.
- EDITED: Added Section 11: Zero-Trust Third-Party Tag Management.
- EDITED: Updated routing and architectural scopes to reflect apex domain migration.
- EDITED (2026-05-15 v4): Complete rewrite for Next.js 14 App Router. Removed CRA references.
  Added Tiptap v3 rules, hydration rules, updated env vars, updated routing table.
  Updated by: Claude Sonnet 4.6.
