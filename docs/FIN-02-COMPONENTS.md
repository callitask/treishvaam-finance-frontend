# FIN-02 — Component & Page Reference

**Project:** `treishvaam-finance-frontend`
**Classification:** Internal Reference (Sanitized)

---

## Architecture Note

The application uses a **dual-layer component model**:
- `app/` — Next.js App Router files (TypeScript only). These are URL routes and server components.
- `src/` — Legacy CRA-style JavaScript source. These files are **components imported by `app/` wrappers** — they are NOT URL routes.

A `src/pages/X.js` file is a React component. Its URL is defined by its `app/*/page.tsx` wrapper.

---

## 1. App Router — Root Files

### `app/layout.tsx` — Root HTML Shell

The single most critical file in the application. Runs on every page load.

**Responsibilities:**
- Defines `<html lang="en">` and `<body>` with `suppressHydrationWarning` (mandatory — never remove)
- Self-hosted Inter variable font import (`@fontsource-variable/inter`) with `// @ts-ignore`
- Per-request CSP nonce consumption from `x-nonce` header (set by `middleware.ts`)
- Renders `Navbar` and `Footer` as persistent layout chrome
- Mounts `AegisTelemetry` (L5-BIE behavioral tracking — client component)
- Mounts `WebVitalsTracker` (Core Web Vitals reporting)
- Injects GA4 `<Script strategy="afterInteractive">` with `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` conditional `anonymize_ip`
- Injects AdSense passive verification meta tag (value from `NEXT_PUBLIC_ADSENSE_CLIENT_ID`)
- GEO discovery tags: `<link rel="llms-txt">`, `<link rel="alternate" type="application/json+ld">`, `<link rel="search">`
- `<semantic-chunk id="main-content" data-aegis-geo="active">` wrapper around `{children}`
- PWA `<link rel="manifest">` and theme color meta

### `app/providers.tsx` — Client Context Wrapper

Wraps the application in all client-side context providers:
- `AuthProvider` (Keycloak OIDC lifecycle)
- `ThemeProvider` (dark/light mode via localStorage)
- `WatchlistProvider` (market watchlist state)

Marked with `'use client'`. Imported by `app/layout.tsx`.

### `app/middleware.ts` — CSP Nonce Middleware

Runs at the Edge before every request:
- Generates a cryptographic nonce per request: `btoa(crypto.randomUUID())`
- **Edge-safe:** uses `crypto.randomUUID()` and `btoa()` — no `Buffer` (not available in Cloudflare Edge Runtime)
- Attaches nonce to the `Content-Security-Policy` response header
- Passes nonce to `app/layout.tsx` via `x-nonce` request header

### `app/not-found.tsx` — Global 404 Handler

Custom 404 page with navigation back to home. Prevents Next.js default error page exposure.

---

## 2. Public Pages (App Router Wrappers)

Each file is a thin wrapper that imports its legacy `src/pages/` component and exposes a `metadata` export for SEO.

| Route | App File | Wraps | Key SEO |
|:---|:---|:---|:---|
| `/` | `app/page.tsx` | Self-contained (no src/pages wrapper) | Static `metadata` export |
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

This is the most SEO-critical route. Uses `generateMetadata({ params })`:
1. Server-side fetches post data from the backend API
2. Generates unique `title`, `description`, `openGraph` image, and `twitter:card` per article
3. Injects Article JSON-LD schema with `datePublished`, `dateModified`, `author`, `publisher`
4. Sets `<link rel="canonical">` to the exact production URL

**CRITICAL:** The `fetch()` inside `generateMetadata` runs at the Edge (server-side) and bypasses the Cloudflare Worker proxy. It must include the header `'X-Tenant-ID': 'finance'` explicitly. Missing this header causes tenant isolation to fail.

---

## 3. GEO Route Handlers (API Routes)

These are Next.js Route Handlers (`route.ts`), not page components. They proxy GEO payloads from the backend.

| Route | File | Backend Endpoint | Content-Type |
|:---|:---|:---|:---|
| `/llms.txt` | `app/llms.txt/route.ts` | `/api/public/geo/llms.txt` | `text/plain` |
| `/ai-feed.md` | `app/ai-feed.md/route.ts` | `/api/public/geo/ai-feed.md` | `text/markdown` |
| `/ontology.json` | `app/ontology.json/route.ts` | `/api/public/geo/ontology.json` | `application/json` |
| `/opensearch.xml` | `app/opensearch.xml/route.ts` | Self-contained XML | `application/opensearchdescription+xml` |

All use `NEXT_PUBLIC_API_URL` environment variable for the backend URL. Raw pass-through — no transformation.

---

## 4. Dashboard Pages (Protected Routes)

**Layout:** `app/dashboard/layout.tsx` — wraps `src/layouts/DashboardLayout.js`. Enforces authentication via `useAuth()` hook. Redirects to `/login` if unauthenticated.

| Route | App File | Wraps | Access |
|:---|:---|:---|:---|
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
Blog feed page. Uses `editorialDistributor.js` utility to organize posts into grid/featured/banner layout zones based on count. Components used: `HeroSection`, `BlogGridDesktop`, `BlogSlideMobile`, `FeaturedColumn`, `CategoryStrip`, `BlogSidebar`, `MarketSidebar`.

### `SinglePostPage.js`
Full article reader. Key behaviors:
- On mount: removes `#server-content` div (leftover from HTML materialization SSG)
- Renders Tiptap-generated HTML via `DOMPurify.sanitize()` (XSS protection)
- Mounts `TableOfContents`, `ReadingProgressBar`, `ShareButtons`
- Fetches related posts and injects `DeeperDive` component

### `BlogEditorPage.js`
Full-featured CMS editor. Uses Tiptap rich text editor. Sub-panels:
- `EditorForm` — main Tiptap editor canvas
- `MetaPanel` — SEO title, description, keywords
- `SeoPanel` — slug, URL article ID, canonical preview
- `CategoryPanel` — category selector
- `ThumbnailPanel` / `StoryThumbnailManager` — drag-and-drop thumbnail management with `CropModal`
- `PublishPanel` — publish/schedule actions with optimistic locking (`version` field transmitted)
- `TagsInput` — comma-separated tags
- `PlacementPanel` — featured/display section toggles
- `LayoutPanel` — article display format selector

### `MarketDetailPage.js`
Single-ticker market detail. Composed of:
- `MarketHero` — ticker symbol, price, change indicators
- `MainChart` — `lightweight-charts` TradingView-style candle chart
- `DataSummary` — open/high/low/volume/P-E data grid
- `ComparisonCarousel` — peer comparison cards
- `AboutAsset` — editorial description from `page_content` table

### `AudiencePage.js`
Admin analytics dashboard. Fetches from `/api/v1/analytics` and `/api/v1/analytics/realtime`. Renders `recharts` bar/line charts for sessions, geography, OS distribution, session source breakdown.

### `ApiStatusPage.js`
Admin external API health dashboard. Fetches from `/api/v1/status`. Renders `ApiFetchStatus` records per provider (AlphaVantage, Finnhub, FMP, Yahoo, NewsData) with latency, success rate, and last error.

---

## 6. Shared Components (`src/components/`)

### Layout

| Component | File | Purpose |
|:---|:---|:---|
| `Navbar` | `Navbar.js` | Top navigation bar. Renders search (`SearchAutocomplete`), auth state (login/logout), theme toggle, mobile menu. Uses `useAuth()` and `useTheme()` |
| `Footer` | `Footer.js` | Site footer with links, social icons, disclaimer |
| `MainLayout` | `layouts/MainLayout.js` | Wraps public pages with Navbar + Footer |
| `DashboardLayout` | `layouts/DashboardLayout.js` | Sidebar navigation for admin dashboard. Auth-gated |

### Blog Feed Components (`src/components/BlogPage/`)

| Component | Purpose |
|:---|:---|
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
|:---|:---|
| `GlobalMarketTicker` | Horizontally scrolling live ticker strip |
| `IndianMarketWidget` | NSE/BSE index display card |
| `MarketCard` | Single-ticker price card |
| `MarketChart` | Sparkline mini-chart (recharts) |
| `MarketMovers` | Top gainers/losers widget |
| `MarketNewsFeed` | News items filtered by ticker |
| `DynamicMarketSummary` | Auto-refreshing market summary grid |
| `IndexCharts` | Multi-index candle chart panel |
| `MostActiveCard` / `TopMoversCard` | Volume/price movement leader boards |
| `TradingViewChart` | Embedded TradingView widget |
| `WatchlistSidebar` | User's watchlist management panel |

### Security & Telemetry

| Component | File | Purpose |
|:---|:---|:---|
| `AegisTelemetry` | `components/AegisTelemetry.tsx` | L5-BIE: passive mouse/scroll/keydown listeners. Hashes biometric vectors client-side (WebCrypto SHA3-256). Transmits hashed entropy to `/api/v1/aegis/telemetry`. `'use client'` only — never runs on SSR. Mounted in `app/layout.tsx` |
| `WebVitalsTracker` | `components/WebVitalsTracker.tsx` | Reports LCP, FID, CLS, FCP, TTFB to Faro and backend. `'use client'` |
| `ThirdPartyScripts` | `components/ThirdPartyScripts.js` | Interaction-based deferred loading (scroll / mousemove / touchstart / 7s idle fallback) for Google Ads and non-GA4 third-party scripts. Zero hardcoded IDs — all from env vars |
| `PrivateRoute` | `components/PrivateRoute.js` | HOC for role-based route protection. Checks `useAuth()` for role array |

### Media & Content

| Component | Purpose |
|:---|:---|
| `AuthImage` | Fetches MinIO-hosted images using authenticated presigned URLs via `AuthContext` |
| `ResponsiveAuthImage` | `AuthImage` with responsive size variants |
| `ImageCropUploader` | Multi-step image upload: crop (react-image-crop) → compress → upload to backend `/api/v1/files/upload` |
| `ReadingProgressBar` | Thin top-of-viewport reading progress indicator |
| `TableOfContents` | Auto-generated from H2/H3 heading scan of post content |
| `ShareButtons` / `ShareModal` | Social share (Twitter, LinkedIn, WhatsApp, copy link). `ShareModal` handles LinkedIn OAuth flow |
| `DeeperDive` | Related articles carousel at post bottom |
| `NewsHighlights` | Rotating news carousel from `/api/v1/news-highlights/ticker` |

### Utilities

| Component | Purpose |
|:---|:---|
| `SearchAutocomplete` | Real-time search via Elasticsearch (`/api/v1/search/query`). Debounced, keyboard-navigable |
| `AudioPlayer` | Embedded audio player for podcast/media posts |
| `AdSenseWidget` | Renders AdSense ad units. ID from `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. Never hardcoded |
| `MarketMap` | Geographic heat-map of market performance |
| `PasswordPromptModal` | Modal for admin-gated actions requiring password re-entry |
| `DevelopmentNotice` | Banner shown on non-production environments |

### Manage Posts Components (`src/components/manage-posts/`)

| Component | Purpose |
|:---|:---|
| `PostTable` | Sortable, paginated table of all posts. Actions: Edit, Delete, Duplicate, Share |
| `PostFilterBar` | Filter controls: status, category, date range, search |
| `PostStatsRibbon` | Summary counts: total / published / draft / archived |
| `PaginationControls` | Shared pagination component used across admin tables |

---

## 7. Context Providers (`src/context/`)

### `AuthContext.js`
Manages the complete Keycloak OIDC lifecycle:
- `keycloak-js ^23.0.0` integration
- `if (typeof window === 'undefined') return` guard prevents SSR crash
- Skips init for Googlebot, Lighthouse, and headless browsers (bot detection)
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
|:---|:---|
| `cloudflareImageLoader.ts` | Custom Next.js image loader. Delegates resizing to Cloudflare CDN. Required because Next.js native image optimization crashes on Cloudflare Pages Edge Runtime |
| `schemaGenerator.js` | JSON-LD schema generation helpers (Article, BreadcrumbList, WebPage, Organization) |
| `editorialDistributor.js` | Distributes post arrays into layout zones (hero, grid, banner, featured) based on count thresholds |
| `marketFormatter.js` | Formats prices, percentages, volumes for market display (locale-aware, Indian Rupee formatting) |
| `blogUtils.js` | Blog utility functions (slug generation, date formatting, reading time calculation) |
| `editorUtils.js` | Tiptap editor utilities (content serialization, HTML sanitization helpers) |
| `imageOptimization.js` | Client-side image preprocessing (canvas resize before upload) |
| `react-router-shim.js` | Shim providing `useNavigate` / `useParams` / `Link` API compatibility between react-router-dom (legacy `src/`) and Next.js App Router |

---

## 9. API Configuration (`src/apiConfig.js`)

Central Axios instance for all backend API calls:
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (never hardcoded)
- Attaches Keycloak JWT `Authorization: Bearer <token>` header for authenticated requests
- Interceptor: refreshes token if 401 returned, retries request once
- All market data functions, blog CRUD functions, analytics endpoints, file upload, and search are exported from this file

---

## 10. Service Worker (`src/sw.ts`)

Built with Serwist (`@serwist/next` 9.0.2).

**Mandatory constraints:**
- Line 1 must be: `/// <reference lib="webworker" />`
- Route handlers must use instantiated strategy classes: `new NetworkFirst()`, `new CacheFirst()`, `new StaleWhileRevalidate()`
- Never use legacy string handlers (`'NetworkFirst'`) — causes fatal `RouteHandler` type errors at build

**Cache strategy:**
- API responses: `NetworkFirst` (fresh data prioritized)
- Static assets (JS, CSS, images): `CacheFirst` (maximize offline reliability)
- HTML pages: `StaleWhileRevalidate` (balance freshness and offline access)

Disabled entirely in development (`process.env.NODE_ENV === 'development'`).

---

## 11. Grafana Faro RUM (`src/faroConfig.js`)

Initializes Grafana Faro Web SDK:
- Collects: LCP, FID, CLS, FCP, TTFB, unhandled exceptions, network errors
- Streams to internal Loki/Tempo observability stack
- Error boundaries must not be bypassed — Faro is the frontend telemetry source for Grafana alerts
