# FIN-02 — Component & Page Reference

**Project:** `treishvaam-finance-frontend`
**Classification:** Internal Reference (Sanitized)
**Last Verified:** 2026-05-29 — All component claims verified against `app/` directory structure, `src/pages/`, `src/components/`, `src/context/`, `src/utils/`, `src/layouts/`, `src/sw.ts`, `src/faroConfig.js`, `src/apiConfig.js`

---

## Architecture Note

The application uses a **dual-layer component model**:
- `app/` — Next.js App Router files (TypeScript only). These are URL routes and server components.
- `src/` — Legacy CRA-style JavaScript source. These files are **components imported by `app/` wrappers** — they are NOT URL routes.

A `src/pages/X.js` file is a React component. Its URL is defined by its `app/*/page.tsx` wrapper.

**`react-router-shim.js`:** Because `src/pages/*.js` components were originally built with `react-router-dom`, a shim (`src/utils/react-router-shim.js`) wraps Next.js `useRouter`, `useParams`, and `Link` to provide the same API surface. This prevents breaking changes during the ongoing CRA→Next.js migration. Do not remove this shim until all `src/pages/*.js` components are fully migrated to native Next.js patterns.

---

## 1. App Router — Root Files

### `app/layout.tsx` — Root HTML Shell

The single most critical file in the application. Runs on every page load. Exports `runtime = 'edge'` (mandatory for Cloudflare Pages).

**Responsibilities:**
- `<html lang="en">` and `<body>` with `suppressHydrationWarning` (mandatory — never remove)
- Self-hosted Inter variable font import (`@fontsource-variable/inter`) with `// @ts-ignore` (Cloudflare strict TS checker requires this — do not remove)
- Per-request CSP nonce consumption from `x-nonce` header (set by `middleware.ts`)
- Renders `Navbar` and `Footer` as persistent layout chrome
- Mounts `AegisTelemetry` (L5-BIE behavioral tracking — `'use client'` only)
- Mounts `WebVitalsTracker` (Core Web Vitals reporting — `'use client'` only)
- GA4 `<Script strategy="afterInteractive">` with `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` conditional `anonymize_ip` (never hardcode)
- AdSense passive verification meta tag (`NEXT_PUBLIC_ADSENSE_CLIENT_ID`) — environment variable only
- GEO discovery tags: `<link rel="llms-txt">`, `<link rel="alternate" type="application/json+ld">`, `<link rel="search">`
- `<semantic-chunk id="main-content" data-aegis-geo="active">` wrapper around `{children}`
- PWA `<link rel="manifest">` and theme color meta

### `app/providers.tsx` — Client Context Wrapper

Wraps the application in all client-side context providers. Marked `'use client'`:
- `AuthProvider` (Keycloak OIDC lifecycle)
- `ThemeProvider` (dark/light mode via localStorage)
- `WatchlistProvider` (market watchlist state)

### `middleware.ts` — CSP Nonce Middleware

Runs at the Edge before every request:
- Generates cryptographic nonce: `btoa(crypto.randomUUID())`
- **Edge-safe:** uses `crypto.randomUUID()` and `btoa()` — no `Buffer` (not available in Cloudflare Edge Runtime)
- Attaches nonce to `Content-Security-Policy` response header
- Passes nonce to `app/layout.tsx` via `x-nonce` request header

### `app/not-found.tsx` — Global 404 Handler

Custom 404 page with navigation back to home. Prevents Next.js default error page exposure.

---

## 2. Public Pages (App Router Wrappers)

Each file is a thin wrapper that imports its legacy `src/pages/` component and exposes a `metadata` export.

| Route | App File | Wraps | Key SEO |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Self-contained | Static `metadata` export |
| `/home` | `app/home/page.tsx` | `src/pages/BlogPage.js` | Static `metadata` |
| `/about` | `app/about/page.tsx` | `src/pages/AboutPage.js` | Static `metadata` |
| `/contact` | `app/contact/page.tsx` | `src/pages/ContactPage.js` | Static `metadata` |
| `/vision` | `app/vision/page.tsx` | `src/pages/VisionPage.js` | Static `metadata` |
| `/privacy` | `app/privacy/page.tsx` | `src/pages/PrivacyPage.js` | Static `metadata` |
| `/terms` | `app/terms/page.tsx` | `src/pages/TermsPage.js` | Static `metadata` |
| `/login` | `app/login/page.tsx` | `src/pages/LoginPage.js` | Login layout via `app/login/layout.tsx` |
| `/market/[ticker]` | `app/market/[ticker]/page.tsx` | `src/pages/MarketDetailPage.js` | Static `metadata` per ticker type |

### `/category/[categorySlug]/[postSlug]/[id]` — Dynamic Post Route

**File:** `app/category/[categorySlug]/[postSlug]/[id]/page.tsx`

Most SEO-critical route. Uses `generateMetadata({ params })`:
1. Server-side fetches post from backend API
2. Generates unique `title`, `description`, `openGraph` image, `twitter:card` per article
3. Injects Article JSON-LD schema with `datePublished`, `dateModified`, `author`, `publisher`
4. Sets `<link rel="canonical">` to the exact production URL

**Critical:** The `fetch()` inside `generateMetadata` runs at the Edge and bypasses the Worker proxy. It must include `'X-Tenant-ID': 'finance'` header explicitly. Missing this header causes tenant isolation to fail.

---

## 3. GEO Route Handlers (API Routes)

These are Next.js Route Handlers (`route.ts`), not page components. They proxy GEO payloads from the backend.

| Route | File | Backend Endpoint | Content-Type |
| :--- | :--- | :--- | :--- |
| `/llms.txt` | `app/llms.txt/route.ts` | `/api/public/geo/llms.txt` | `text/plain` |
| `/ai-feed.md` | `app/ai-feed.md/route.ts` | `/api/public/geo/ai-feed.md` | `text/markdown` |
| `/ontology.json` | `app/ontology.json/route.ts` | `/api/public/geo/ontology.json` | `application/json` |
| `/opensearch.xml` | `app/opensearch.xml/route.ts` | Self-contained XML | `application/opensearchdescription+xml` |

All use `NEXT_PUBLIC_API_URL` environment variable for backend URL. Raw pass-through — no transformation.

---

## 4. Dashboard Pages (Protected Routes)

**Layout:** `app/dashboard/layout.tsx` — wraps `src/layouts/DashboardLayout.js`. Enforces authentication via `useAuth()`. Redirects to `/login` if unauthenticated.

| Route | App File | Wraps | Access |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `app/dashboard/page.tsx` | `src/pages/DashboardPage.js` | Auth |
| `/dashboard/blog/new` | `app/dashboard/blog/new/page.tsx` | `src/pages/BlogEditorPage.js` | PUBLISHER+ |
| `/dashboard/blog/edit/[slug]/[id]` | `app/dashboard/blog/edit/[userFriendlySlug]/[id]/page.tsx` | `src/pages/BlogEditorPage.js` (edit mode) | EDITOR+ |
| `/dashboard/manage-posts` | `app/dashboard/manage-posts/page.tsx` | `src/pages/ManagePostsPage.js` | EDITOR+ |
| `/dashboard/audience` | `app/dashboard/audience/page.tsx` | `src/pages/AudiencePage.js` | ADMIN |
| `/dashboard/api-status` | `app/dashboard/api-status/page.tsx` | `src/pages/ApiStatusPage.js` | ADMIN |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | `src/pages/ProfilePage.js` | Auth |

---

## 5. Page Components (`src/pages/`)

### `BlogPage.js`
Blog feed page. Uses `editorialDistributor.js` to organize posts into grid/featured/banner zones. Components: `HeroSection`, `BlogGridDesktop`, `BlogSlideMobile`, `FeaturedColumn`, `CategoryStrip`, `BlogSidebar`, `MarketSidebar`.

### `SinglePostPage.js`
Full article reader. Key behaviors:
- On mount: removes `#server-content` div (HTML materialization SSG artifact)
- Renders Tiptap-generated HTML via `DOMPurify.sanitize()` (XSS protection)
- Mounts `TableOfContents`, `ReadingProgressBar`, `ShareButtons`
- Fetches related posts → `DeeperDive` component

### `BlogEditorPage.js`
Full-featured CMS editor (Tiptap v3). Sub-panels:
- `EditorForm` — main Tiptap editor canvas
- `MetaPanel` — SEO title, description, keywords
- `SeoPanel` — slug, URL article ID, canonical preview
- `CategoryPanel` — category selector
- `ThumbnailPanel` / `StoryThumbnailManager` — drag-and-drop with `react-dnd` + `CropModal` (`react-image-crop`)
- `PublishPanel` — publish/schedule actions; transmits `version` field for optimistic locking
- `TagsInput` — comma-separated tags
- `PlacementPanel` — featured/display section toggles
- `LayoutPanel` — article display format selector

### `MarketDetailPage.js`
Single-ticker market detail:
- `MarketHero` — symbol, price, change indicators
- `MainChart` — `lightweight-charts` TradingView-style candle chart
- `DataSummary` — open/high/low/volume/P-E grid
- `ComparisonCarousel` — peer comparison cards
- `AboutAsset` — editorial description from `page_content` table

### `AudiencePage.js`
Admin analytics dashboard. Fetches `/api/v1/analytics` + `/api/v1/analytics/realtime`. `recharts` bar/line charts for sessions, geography, OS distribution, session source breakdown.

### `ApiStatusPage.js`
Admin external API health dashboard. Fetches `/api/v1/status`. Renders `ApiFetchStatus` records per provider with latency, success rate, and last error.

---

## 6. Shared Components (`src/components/`)

### Layout

| Component | File | Purpose |
| :--- | :--- | :--- |
| `Navbar` | `Navbar.js` | Top navigation — search, auth state (login/logout), theme toggle, mobile menu |
| `Footer` | `Footer.js` | Site footer — links, social icons, disclaimer |
| `MainLayout` | `layouts/MainLayout.js` | Wraps public pages with Navbar + Footer |
| `DashboardLayout` | `layouts/DashboardLayout.js` | Sidebar navigation for admin. Auth-gated |

### Blog Feed Components (`src/components/BlogPage/`)

| Component | Purpose |
| :--- | :--- |
| `HeroSection` | Large hero post display |
| `BannerPostCard` | Full-width banner format post card |
| `GridPostCard` | Standard 3-column grid post card |
| `FeaturedColumn` | Vertical featured posts sidebar |
| `FeedGridCard` / `FeedRowCard` / `FeedTextCard` | Feed layout variants |
| `CategoryStrip` / `CategoryStripMobile` | Horizontal category filter tabs |
| `BlogGridDesktop` | Desktop multi-column layout orchestrator |
| `BlogSlideMobile` | Mobile swipe-carousel post layout |
| `BlogSidebar` | Desktop sidebar (recent posts, featured) |
| `MarketSidebar` | Desktop sidebar market widget |
| `MarketSlideMobile` | Mobile swipe market data strip |
| `NewsTabMobile` | Mobile news intelligence tab |
| `MobilePostCard` | Mobile-optimized post card |

### Market Widgets (`src/components/market/`)

| Component | Purpose |
| :--- | :--- |
| `GlobalMarketTicker` | Horizontally scrolling live ticker strip |
| `IndianMarketWidget` | NSE/BSE index display card |
| `MarketCard` | Single-ticker price card |
| `MarketChart` | Sparkline mini-chart (recharts) |
| `MarketMovers` | Top gainers/losers widget |
| `MarketNewsFeed` | News items filtered by ticker |
| `DynamicMarketSummary` | Auto-refreshing market summary grid |
| `IndexCharts` | Multi-index candle chart panel |
| `MostActiveCard` / `TopMoversCard` | Volume/price movement leaderboards |
| `TradingViewChart` | Embedded TradingView widget |
| `WatchlistSidebar` | User watchlist management panel |

### Security & Telemetry

| Component | File | Purpose |
| :--- | :--- | :--- |
| `AegisTelemetry` | `components/AegisTelemetry.tsx` | L5-BIE: passive mouse/scroll/keydown listeners. Hashes biometric vectors client-side (WebCrypto SHA3-256). Transmits hashed entropy to `/api/v1/aegis/telemetry`. `'use client'` — never runs on SSR |
| `WebVitalsTracker` | `components/WebVitalsTracker.tsx` | Reports LCP, FID, CLS, FCP, TTFB to Faro and backend. `'use client'` |
| `ThirdPartyScripts` | `components/ThirdPartyScripts.js` | Interaction-based deferred loading (scroll / mousemove / touchstart / 7s idle). All IDs from env vars — never hardcoded |
| `PrivateRoute` | `components/PrivateRoute.js` | HOC for role-based route protection. Checks `useAuth()` for role array |

### Media & Content

| Component | Purpose |
| :--- | :--- |
| `AuthImage` | Fetches MinIO-hosted images using **authenticated presigned URLs** via `AuthContext`. Handles token-gated media without exposing MinIO directly |
| `ResponsiveAuthImage` | `AuthImage` with responsive size variants |
| `ImageCropUploader` | Multi-step image upload: crop (`react-image-crop`) → compress → upload to `/api/v1/files/upload` |
| `ReadingProgressBar` | Thin top-of-viewport reading progress indicator |
| `TableOfContents` | Auto-generated from H2/H3 heading scan of post content |
| `ShareButtons` / `ShareModal` | Social share (Twitter, LinkedIn, WhatsApp, copy link). `ShareModal` handles LinkedIn OAuth flow |
| `DeeperDive` | Related articles carousel at post bottom |
| `NewsHighlights` | Rotating news carousel from `/api/v1/news-highlights/ticker` |

### Utilities

| Component | Purpose |
| :--- | :--- |
| `SearchAutocomplete` | Real-time search via Elasticsearch (`/api/v1/search/query`). Debounced, keyboard-navigable |
| `AudioPlayer` | Embedded audio player for podcast/media posts |
| `AdSenseWidget` | Renders AdSense ad units. ID from `NEXT_PUBLIC_ADSENSE_CLIENT_ID` — never hardcoded |
| `MarketMap` | Geographic heat-map of market performance |
| `PasswordPromptModal` | Modal for admin-gated actions requiring password re-entry |
| `DevelopmentNotice` | Banner shown on non-production environments |

### Manage Posts Components (`src/components/manage-posts/`)

| Component | Purpose |
| :--- | :--- |
| `PostTable` | Sortable, paginated table of all posts. Actions: Edit, Delete, Duplicate, Share |
| `PostFilterBar` | Filter controls: status, category, date range, search |
| `PostStatsRibbon` | Summary counts: total / published / draft / archived |
| `PaginationControls` | Shared pagination component across admin tables |

---

## 7. Context Providers (`src/context/`)

### `AuthContext.js`

Manages the complete Keycloak OIDC lifecycle:
- `keycloak-js ^23.0.0` integration
- `if (typeof window === 'undefined') return` guard prevents SSR crash
- Skips init for Googlebot, Lighthouse, and headless browsers
- 10-second timeout → graceful guest mode (site fully functional without auth)
- Token auto-refresh every 60 seconds
- Exposes: `{ isAuthenticated, userRoles, keycloak, login, logout }`

### `ThemeContext.js`

Dark/light mode toggle. Reads/writes `localStorage`. Exposes `{ theme, toggleTheme }`.

### `WatchlistContext.js`

User market watchlist. Persists to `localStorage`. Exposes `{ watchlist, addToWatchlist, removeFromWatchlist }`.

---

## 8. Utilities (`src/utils/`)

| File | Purpose |
| :--- | :--- |
| `cloudflareImageLoader.ts` | Custom Next.js image loader. Delegates resizing to Cloudflare CDN. Required because Next.js native image optimization crashes on Cloudflare Pages Edge Runtime |
| `schemaGenerator.js` | JSON-LD schema generation helpers (Article, BreadcrumbList, WebPage, Organization) |
| `editorialDistributor.js` | Distributes post arrays into layout zones (hero, grid, banner, featured) based on count thresholds |
| `marketFormatter.js` | Formats prices, percentages, volumes for market display (locale-aware, Indian Rupee formatting) |
| `blogUtils.js` | Blog utility functions (slug generation, date formatting, reading time calculation) |
| `editorUtils.js` | Tiptap editor utilities (content serialization, HTML sanitization helpers) |
| `imageOptimization.js` | Client-side image preprocessing (canvas resize before upload) |
| `react-router-shim.js` | Shim providing `useNavigate` / `useParams` / `Link` API compatibility between react-router-dom (legacy `src/`) and Next.js App Router. **Do not remove until all `src/pages/*.js` are fully migrated to native Next.js patterns** |

---

## 9. API Configuration (`src/apiConfig.js`)

Central Axios instance for all backend API calls:
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (never hardcoded)
- Attaches Keycloak JWT `Authorization: Bearer <token>` for authenticated requests
- Interceptor: refreshes token on 401, retries once
- Exports all market data functions, blog CRUD, analytics endpoints, file upload, and search

---

## 10. Service Worker (`src/sw.ts`)

Built with Serwist (`@serwist/next` 9.0.2).

**Mandatory constraints (do not alter):**
- Line 1 must be: `/// <reference lib="webworker" />`
- Route handlers must use instantiated classes: `new NetworkFirst()`, `new CacheFirst()`, `new StaleWhileRevalidate()`
- Never use legacy string handlers (`'NetworkFirst'`) — causes fatal `RouteHandler` type errors at build

**Cache strategy:**
- API responses: `NetworkFirst` (fresh data prioritized)
- Static assets: `CacheFirst` (maximize offline reliability)
- HTML pages: `StaleWhileRevalidate` (balance freshness and offline access)

Disabled in development (`process.env.NODE_ENV === 'development'`).

---

## 11. Grafana Faro RUM (`src/faroConfig.js`)

Initializes Grafana Faro Web SDK:
- Collects: LCP, FID, CLS, FCP, TTFB, unhandled exceptions, network errors
- Streams to internal Loki/Tempo observability stack
- Error boundaries must not be bypassed — Faro is the frontend telemetry source for Grafana alerts

---

## IMMUTABLE CHANGE HISTORY (DO NOT DELETE)

- **VERIFIED + UPDATED (2026-05-29 — Enterprise Documentation Generation):**
  - All component paths, imports, and behaviors verified against actual `src/` and `app/` source files.
  - **ADDED:** `react-router-shim.js` documentation in Utilities section — existed in codebase but was not explicitly documented in the utilities table or explained. Critical for future AI to understand why `react-router-dom` patterns exist in a Next.js app.
  - **ADDED:** `AuthImage` presigned URL note — fetches MinIO-hosted images via authenticated presigned URLs (not direct MinIO access). This distinction is security-relevant.
  - **CONFIRMED:** All component descriptions accurate against actual implementations.
  - **CONFIRMED:** `suppressHydrationWarning` mandatory constraint on `<html>` and `<body>`.
  - **CONFIRMED:** `// @ts-ignore` mandatory on `@fontsource-variable/inter` import.
  - **CONFIRMED:** Serwist `/// <reference lib="webworker" />` and Strategy class instantiation requirements.
  - No architectural claims removed.