/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Documents the Treishvaam Finance Frontend component hierarchy and responsibilities.
 *
 * Change Intent:
 * - Synchronized documentation to reflect Next.js 14 App Router migration.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Initial Component Architecture documentation.
 * - EDITED: Documented ThirdPartyScripts.js and interaction-based loading.
 * - EDITED: Updated context to support apex domain migration and JSON-LD schema generation.
 * - EDITED (2026-05-15 v4):
 *   • Removed SunEditor references — replaced by Tiptap v3.
 *   • Removed HelmetProvider references — removed in BUG-HYDRATION-01 fix.
 *   • Updated EditorForm.js description with Tiptap v3 extensions.
 *   • Added BUG-MARKET-DETAIL fix note (MarketHero prop name mismatch).
 *   • Added "use client" rule for all src/pages/*.js files.
 *   • Removed window.__PRELOADED_STATE__ references (CRA-era, no longer used).
 */

# 07 - Frontend Components (v4 — Next.js 14 App Router)

## 1. Component Hierarchy

```
app/layout.tsx                    ← Root shell (Server Component)
  └── app/providers.tsx           ← Client providers (Auth, Theme, Watchlist)
      └── src/components/Navbar.js
      └── [page content]
      └── src/components/Footer.js

app/page.tsx                      ← Landing page (Client Component)
app/home/page.tsx                 ← Wraps src/pages/BlogPage.js
app/category/.../page.tsx         ← Wraps src/pages/SinglePostPage.js
app/dashboard/layout.tsx          ← Wraps src/layouts/DashboardLayout.js
app/market/[ticker]/page.tsx      ← Wraps src/pages/MarketDetailPage.js
```

**Rule:** All `app/*/page.tsx` files are Server Components (handle SEO via `metadata` export).
All `src/pages/*.js` files are Client Components (must have `"use client";` at line 1).

---

## 2. Core Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| Root Layout | `app/layout.tsx` | HTML shell, GA4, Navbar, Footer, Providers |
| Providers | `app/providers.tsx` | Auth + Theme + Watchlist contexts (NO HelmetProvider) |
| Navbar | `src/components/Navbar.js` | Responsive nav, auth-aware, market status, search |
| Footer | `src/components/Footer.js` | Links, legal, social icons |
| DashboardLayout | `src/layouts/DashboardLayout.js` | Admin sidebar + protected route logic |
| MainLayout | `src/layouts/MainLayout.js` | Legacy CRA layout (kept for compatibility) |

---

## 3. Page Components (src/pages/*.js)

All must have `"use client";` at line 1. These are imported by `app/*/page.tsx` wrappers.

| Component | Route | Key Features |
|-----------|-------|-------------|
| `BlogPage.js` | `/home` | Infinite scroll, category filter, GlobalMarketTicker (dynamic import) |
| `SinglePostPage.js` | `/category/...` | Article render, ToC, reading progress, triple null-guard on headings |
| `BlogEditorPage.js` | `/dashboard/blog/**` | Auto-save, Tiptap editor, image upload, publish flow |
| `MarketDetailPage.js` | `/market/[ticker]` | Live quote, chart, data summary, 30s auto-refresh |
| `ManagePostsPage.js` | `/dashboard/manage-posts` | Post table, bulk delete, filter, pagination |
| `PrivacyPage.js` | `/privacy` | Enterprise privacy policy, DPDP Act 2023 |
| `TermsPage.js` | `/terms` | Enterprise ToS, financial disclaimer |

---

## 4. Blog Editor Components (src/components/BlogEditor/)

The Blog Editor is a complex state machine for enterprise content management.

- **`BlogEditorPage.js` (Controller)**: Form state, auto-save (2s debounce), optimistic locking (version field), publish flow
- **`EditorForm.js` (View)**: Tiptap v3 rich text editor with full toolbar
  - Extensions: StarterKit, Image, Link, Youtube, Underline, TextStyle (named!), Color, TextAlign
  - Features: Image upload (toolbar + drag-drop + paste), YouTube embed, link insert, word count, Ctrl+S
  - **Critical**: `StarterKit.configure({ link: false, underline: false })` to prevent duplicate extension crash
- **`MetaPanel.js`**: Meta description, keywords, SEO title, canonical URL
- **`SeoPanel.js`**: Focus keyword, SEO score
- **`CategoryPanel.js`**: Category selection + create new
- **`ThumbnailPanel.js`**: Single/story thumbnail management with crop
- **`CoverImagePanel.js`**: Cover image upload with crop
- **`PublishPanel.js`**: Publish/schedule controls
- **`TagsInput.js`**: Tag management

---

## 5. Market Data Components (src/components/market/)

| Component | Purpose | SSR Safe? |
|-----------|---------|-----------|
| `GlobalMarketTicker.js` | Scrolling ticker tape | ❌ Must use `dynamic(..., { ssr: false })` |
| `MarketCard.js` | Individual market data card | ✅ |
| `MarketChart.js` | Interactive price chart (lightweight-charts) | ✅ |
| `DynamicMarketSummary.js` | Tabbed global indices widget | ✅ |
| `MarketMovers.js` | Top gainers/losers list | ✅ |
| `WatchlistSidebar.js` | User's watchlist (localStorage) | ✅ |
| `MarketNewsFeed.js` | Financial news feed | ✅ |

**CRITICAL**: `GlobalMarketTicker` uses `window` and real-time browser APIs. It MUST always be imported with `dynamic(() => import(...), { ssr: false })`. Static import causes React hydration error #418.

---

## 6. Market Detail Components (src/components/market-detail/)

Used by `src/pages/MarketDetailPage.js`:

| Component | Props | Notes |
|-----------|-------|-------|
| `MarketHero.js` | `{ quote, marketData, ticker }` | **Expects `quote` not `quoteData`** — BUG-MARKET-DETAIL fix |
| `MainChart.js` | `{ ticker, quoteData }` | TradingView-style chart |
| `DataSummary.js` | `{ quoteData, marketData }` | Key stats table |
| `AboutAsset.js` | `{ marketData, quoteData }` | Asset description |
| `ComparisonCarousel.js` | `{ peers }` | Peer comparison |

---

## 7. Blog Feed Components (src/components/BlogPage/)

| Component | Purpose |
|-----------|---------|
| `BlogGridDesktop.js` | Desktop 3-column article grid |
| `BlogSlideMobile.js` | Mobile swipeable feed |
| `HeroSection.js` | Featured article hero |
| `CategoryStrip.js` | Desktop category filter bar |
| `CategoryStripMobile.js` | Mobile category filter |
| `FeaturedColumn.js` | Left sidebar featured posts |
| `MarketSidebar.js` | Right sidebar market data |
| `PostCard.js`, `FeedGridCard.js`, etc. | Article card variants |

---

## 8. Admin Components (src/components/manage-posts/)

| Component | Purpose |
|-----------|---------|
| `PostTable.js` | Sortable post list with bulk select |
| `PostFilterBar.js` | Search + category + status filter |
| `PostStatsRibbon.js` | Published/draft/scheduled counts |
| `PaginationControls.js` | Page navigation |

---

## 9. Observability

- **`src/faroConfig.js`**: Grafana Faro RUM initialization
- Captures: Core Web Vitals (LCP, CLS, FID), JS errors, console errors
- Sends to: `/api/v1/monitoring/ingest` endpoint
- User identity: Set after Keycloak auth success

---

## IMMUTABLE CHANGE HISTORY
- ADDED: Initial Component Architecture documentation.
- EDITED: Documented ThirdPartyScripts.js and interaction-based loading.
- EDITED: Updated context to support apex domain migration.
- EDITED (2026-05-15 v4): Complete rewrite for Next.js 14. Removed SunEditor/HelmetProvider.
  Added Tiptap v3 component details. Added MarketHero prop fix note. Added SSR safety table.
  Updated by: Claude Sonnet 4.6.
