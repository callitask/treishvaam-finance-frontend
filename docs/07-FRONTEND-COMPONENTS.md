# 07 - Frontend Components

## 1. Component Hierarchy

The `src/components` folder is organized by feature and UI domain:

- **components/market**: Market data widgets (charts, summaries, tickers).
- **components/BlogPage**: Blog feed, post cards, category strips, and grid layouts.
- **components/BlogEditor**: The complex CMS interface, including panels for metadata, SEO, layout, and media management.
- **components/manage-posts**: Admin tools for post management (pagination, stats, bulk actions).

This modular structure supports scalability and separation of concerns.

## 2. Core Layout Components

- **Navbar.js**: Responsive navigation bar with:
    - **Auth-Awareness**: Dynamic Login/Logout and User Avatar.
    - **Market Status**: Real-time indicator (Open/Closed) based on EST timezone.
    - **Search**: Integrated `SearchAutocomplete` connected to the Backend Elasticsearch API.
    - **Mobile**: Hamburger menu with slide-out animation.
- **Footer.js**: Site-wide footer containing copyright, legal links, and social icons.
- **MainLayout.js**: Wraps public pages. Handles the `Navbar` and `Footer` placement.
- **DashboardLayout.js**: Wraps private admin pages. Includes the sidebar and protected route logic.

## 3. Feature: Hybrid SSG & Article Rendering (Critical)

This is the most architecturally significant component set, handling the "Visual Handover" from Server HTML to React.

- **SinglePostPage.js**:
    - **Role**: The "Hydration Manager" for blog posts.
    - **Cleanup Logic**: Upon mounting, it actively searches for `<div id="server-content">` (the static HTML served by Cloudflare/Nginx) and **removes it** from the DOM. This prevents the "Double Content" glitch where users see both the React app and the raw HTML text.
    - **State Injection**: It checks `window.__PRELOADED_STATE__`. If present, it initializes the article state immediately without fetching from the API, achieving **Zero-Latency Rendering**.
    - **Fallback**: If the state is missing (e.g., direct client navigation), it falls back to a standard API fetch (`getPostByUrlId`).
    - **Features**: Renders the Table of Contents (`TableOfContents.js`), Audio Player (`AudioPlayer.js`), and Social Share buttons.

## 4. Feature: Blog Editor (CMS)

The Blog Editor is a complex state machine designed for enterprise content management.

- **BlogEditorPage.js (Controller)**:
    - **State Management**: Handles form state (`title`, `content`) and the critical **Optimistic Locking** handshake.
    - **Data Integrity**: Captures the `version` field from the DB. On save, if the API returns **409 Conflict**, it triggers a modal forcing the user to refresh, preventing accidental overwrites.
    - **Auto-Save**: Triggers background drafts to `localStorage` or API to prevent data loss.

- **EditorForm.js (View)**:
    - Wraps the `SunEditor` (rich text editor), loaded via `React.lazy` for performance.
    - Manages the WYSIWYG toolbar and image insertion logic.

- **ImageCropUploader.js**:
    - **Lossless Pipeline**: Unlike standard uploaders, this component intentionally **skips client-side compression**.
    - **Flow**: It sends raw PNG/JPEG blobs to the Backend. We rely on the Backend's **Java 21 Virtual Threads** to handle the CPU-intensive task of generating optimized WebP variants. This ensures "Publisher Quality" images without double-compression artifacts.

## 5. Feature: Market Data Widgets

- **MarketChart.js**:
    - Renders interactive line charts using `react-chartjs-2`.
    - Features color-coded trends (Green for +%, Red for -%).
    - Includes a dynamic "Previous Close" reference line.
    - optimized for `BigDecimal` precision values from the backend.

- **DynamicMarketSummary.js**:
    - A tabbed widget displaying global market indices (US, Europe, India, Crypto).
    - Implements **SWR-like caching** via `useSWR` or custom hooks to prevent over-fetching market data.

- **NewsHighlights.js**:
    - Displays financial news cards.
    - Handles the fallback image logic if the upstream provider (Finnhub) fails to return a thumbnail.

## 6. Reusable UI Elements

- **PaginationControls**: Standardized pager for lists (Admin Table, Blog Feed).
- **ShareModal**: A uniform dialog for sharing content to LinkedIn, Twitter, and WhatsApp.
- **PasswordPromptModal**: Used for protecting sensitive admin actions or private posts.
- **ApiStatusPanel**: A dashboard widget visualizing the health of external integrations (FMP, AlphaVantage) using data from the `api_fetch_status` table.

## 7. Observability Integration

- **FaroErrorBoundary**: Top-level component that catches React render errors and sends stack traces to the Grafana Faro collector.