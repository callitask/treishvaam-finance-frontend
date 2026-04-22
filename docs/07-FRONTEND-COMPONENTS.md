/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Documents the Treishvaam Finance Frontend React components hierarchy and core responsibilities.
 *
 * Change Intent:
 * - Synchronized documentation to reflect the apex domain architecture and Semantic Entity integrations.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Initial Component Architecture documentation.
 * - EDITED:
 * • Documented `ThirdPartyScripts.js` and the interaction-based loading mechanism for SEO.
 * - EDITED (LATEST):
 * • Updated context to support apex domain migration and JSON-LD schema generation logic.
 */

# 07 - Frontend Components

## 1. Component Hierarchy

The `src/components` folder is organized by feature and UI domain:

- **components/market**: Market data widgets (charts, summaries, tickers, news feeds, movers, cards, and watchlist sidebar).
- **components/BlogPage**: Blog feed, post cards, category strips, grid layouts, and mobile/desktop variants.
- **components/BlogEditor**: The complex CMS interface, including panels for metadata, SEO, layout, media management, and modals for cropping.
- **components/manage-posts**: Admin tools for post management (pagination, stats, bulk actions, table, filter bar).
- **components/news**: News widgets and cards for financial news highlights.

This modular structure supports scalability and separation of concerns.

## 2. Core Layout Components

- **Navbar.js**: Responsive navigation bar with Auth-Awareness, Market Status, and Search capabilities.
- **Footer.js**: Site-wide footer containing copyright, legal links, and social icons.
- **MainLayout.js**: Wraps public pages. Handles the `Navbar` and `Footer` placement.
- **DashboardLayout.js**: Wraps private admin pages. Includes the sidebar and protected route logic.

## 3. Feature: Hybrid SSG & Article Rendering (Critical)

This is the most architecturally significant component set, handling the "Visual Handover" from Server HTML to React.

- **SinglePostPage.js**:
    - **Role**: The "Hydration Manager" for blog posts.
    - **Cleanup Logic**: Upon mounting, it actively searches for `<div id="server-content">` (the static HTML served by the Edge Layer) and **removes it** from the DOM. 
    - **State Injection**: It checks `window.__PRELOADED_STATE__`. If present, it initializes the article state immediately without fetching from the API, achieving **Zero-Latency Rendering**.

## 4. Feature: Blog Editor (CMS)

The Blog Editor is a complex state machine designed for enterprise content management.

- **BlogEditorPage.js (Controller)**: Handles form state and the critical **Optimistic Locking** handshake.
- **EditorForm.js (View)**: Wraps the `SunEditor` (rich text editor).
- **ImageCropUploader.js**: Intentionally **skips client-side compression** to allow the Backend Java Virtual Threads to generate optimized WebP variants losslessly.

## 5. Feature: Market Data Widgets

- **MarketChart.js**: Interactive line charts using `react-chartjs-2`, optimized for `BigDecimal` precision.
- **DynamicMarketSummary.js**: Tabbed widget displaying global market indices.
- **NewsHighlights.js**: Financial news cards with fallback image logic.

## 6. Reusable UI & Core Logic Elements

- **PaginationControls**: Standardized pager for lists (Admin Table, Blog Feed).
- **ShareModal**: Uniform dialog for sharing content to LinkedIn, Twitter, and WhatsApp.
- **ApiStatusPanel**: Dashboard widget visualizing the health of external integrations.
- **ThirdPartyScripts.js (CRITICAL)**: 
    - Implements the **0ms Total Blocking Time (TBT)** architecture.
    - Listens for user interactions (`scroll`, `mousemove`, `touchstart`, `keydown`) and strictly defers the injection of Google Analytics, Ads, and AdSense script tags until an interaction occurs (or a 7-second idle timeout is reached).
    - Prevents tracking scripts from blocking Googlebot rendering. Utilizes environment variables (`REACT_APP_GA_MEASUREMENT_ID`) instead of hardcoded strings.

## 7. Observability Integration

- **FaroErrorBoundary**: Top-level component that catches React render errors and sends stack traces to the Grafana Faro collector.

---

## 8. Market Data Widgets (Detailed)
- **GlobalMarketTicker**: Horizontally scrollable ticker tape for global indices.
- **TopMoversCard**: Fetches and displays a list of stocks with mini charts and color coding.
- **WatchlistSidebar**: User's personal watchlist, persisted in localStorage.

## 9. Blog Editor Panels & Modals (Detailed)
- **Panels:** `CategoryPanel`, `CoverImagePanel`, `LayoutPanel`, `MetaPanel`, `PlacementPanel`, `PublishPanel`, `SeoPanel`, `TagsInput`, `ThumbnailPanel`.
- **StoryThumbnailManager**: Drag-and-drop manager for story thumbnails, using `react-dnd`.