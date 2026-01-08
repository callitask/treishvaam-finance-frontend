
# 06 - Frontend Architecture

## 1. Application Entry & Boot

The application entry point is `src/index.js`. It implements a specialized boot sequence designed for **Hybrid SSG** compatibility.

- **Edge-Aware Rendering Strategy**:
    - **Context**: The Backend injects SEO content into a sibling container (`<div id="server-content">`) to satisfy Googlebot, while leaving the React root (`<div id="root">`) empty.
    - **Logic**: We deliberately use `ReactDOM.createRoot()` instead of `hydrateRoot`.
    - **Reasoning**: `hydrateRoot` expects the HTML in `#root` to match the React Tree exactly. Since `#root` is empty (the content is next door), hydration would fail with Error #418/#423.
    - **Zero-Latency Feel**: Even though we use `createRoot`, the app detects `window.__PRELOADED_STATE__` (injected by Cloudflare/Backend). This allows React to render the *correct* content instantly (0ms fetch time), simulating the speed of hydration without the fragility.

- **Faro Observability**:
    - `initFaro()` (`src/faroConfig.js`) initializes Real User Monitoring (RUM).
    - It captures Core Web Vitals (LCP, CLS) and JS Errors, sending telemetry to the backend `/api/v1/monitoring/ingest` endpoint.

- **Providers**:
    - `AuthProvider`: Keycloak Session Management.
    - `HelmetProvider`: SEO Meta Tag Management.
    - `BrowserRouter`: Client-side routing.

## 2. Routing Strategy (`App.js`)


- **Route Hierarchy**:
    - **Public Routes** (wrapped in `MainLayout`):
        - `/` (Home)
        - `/about` (AboutPage)
        - `/vision` (VisionPage) — **New**: Renders a static roadmap and injects JSON-LD schema for SEO. No API fetch; content is static.
        - `/audience` (AudiencePage) — **New**: Fetches audience analytics via `getHistoricalAudienceData` and `getFilterOptions` from `apiConfig`. Implements dynamic filters and cascading dropdowns. Data is displayed in tabular and chart form.
        - `/api-status` (ApiStatusPage) — **New**: Renders `ApiStatusPanel`, which visualizes the health and logs of backend data pipelines. No direct API fetch in the page; all logic is in the panel/component.
        - `/contact`
        - `/market/:ticker`
        - `/login`
        - `/category/:slug/:id` (dynamic blog post routes)
    - **Private Admin Routes** (wrapped in `DashboardLayout`):
        - `/dashboard/*` (all admin tools, protected by `PrivateRoute`)

- **Lazy Loading & Code Splitting**:
    - Critical pages (`BlogPage`, `DashboardPage`) are loaded via `React.lazy` inside a `Suspense` boundary for optimal bundle size.

- **Route Guards**:
    - `PrivateRoute` checks `AuthContext.isAuthenticated`. If false, it captures the current URL and redirects to `/login`, preserving the deep link for post-login redirection.

## 3. Hybrid SSG Integration (The "Visual Handover")

The Frontend plays a critical role in the **"Strategy A / Strategy B"** rendering architecture described in the Backend docs.

### The Problem
When Cloudflare serves a static HTML file (Strategy A), the user sees "Plain HTML" text (`#server-content`) instantly. When React loads (`#root`), it renders the *same* content. For a split second, the content might appear duplicated or shifted.

### The Solution: Automatic Cleanup
1.  **Mount**: React boots up and renders into `#root`.
2.  **Detection**: The component `SinglePostPage.js` contains a `useEffect` hook that looks for the static `#server-content` div.
3.  **Cleanup**: It strictly removes `#server-content` from the DOM immediately.
4.  **Result**: The transition from "Server HTML" to "Interactive React App" is seamless to the human eye.

## 4. Authentication & Security

- **Session Management**: `AuthContext.js` manages the Keycloak OIDC lifecycle.
- **Silent SSO**: The app loads `public/silent-check-sso.html` in a hidden iframe.
    - **Security**: The Backend whitelists this specific flow via `Content-Security-Policy: frame-ancestors`, allowing token renewal without page reloads.
- **Dynamic Configuration**: Auth URLs are injected via `REACT_APP_AUTH_URL` (Cloudflare Environment), allowing the same build artifact to run in Dev, Staging, and Prod.
- **Interceptor**: `apiConfig.js` attaches the `Authorization: Bearer <token>` header to all requests automatically.

## 5. State Management


- **Global Contexts**:
    - `AuthContext`: Identity state (Keycloak OIDC, see below).
    - `ThemeContext`: Dark/Light mode preference. **Persists to `localStorage` under the key `color-theme`**. On load, checks for stored preference, then system preference, then defaults to `light`. Exposes `theme` and `toggleTheme`.
    - `WatchlistContext`: Market data favorites. **Persists to `localStorage` under the key `user-watchlist`**. Exposes `watchlist`, `addToWatchlist`, `removeFromWatchlist`, `toggleWatchlist`, and `isInWatchlist`.
- **Local State**: Complex forms (like `BlogEditorPage`) use `useReducer` to manage the "Draft" state, including dirty checking and auto-save triggers.

### `useManagePosts` Hook (Admin Post Management)

- Handles all admin post management logic:
    - Fetches posts, drafts, and categories in parallel using `getAllPostsForAdmin`, `getDrafts`, and `getCategories`.
    - Deduplicates posts by ID, merges drafts and published posts.
    - Supports view switching (`ALL`, `PUBLISHED`, `DRAFT`, `SCHEDULED`) and syncs with URL hash.
    - Implements search, category filter, sorting, and pagination.
    - Exposes handlers for select all, select one, delete, bulk delete, and duplicate.
    - Returns computed stats: total, published, scheduled, drafts.

## 6. API Layer (BFF Pattern)

- **Abstraction**: `apiConfig.js` is the single source of truth for all network calls.
- **Environment Agnostic**: The base URL uses `process.env.REACT_APP_API_URL`.
    - **Local**: `http://localhost:8080`
    - **Prod**: `https://backend.treishvaamgroup.com` (via Tunnel)
- **Error Handling**: Global interceptors catch `401 Unauthorized` (triggering logout) and `403 Forbidden` (triggering permission alerts).

## 7. Data Integrity Strategy (Optimistic Locking)

To prevent "Lost Updates" in a collaborative environment, the Frontend implements a strict handshake:
1.  **Read**: When editing, the app captures the `version` field from the API.
2.  **Write**: On save, this `version` is sent back.
3.  **Conflict**: If the API returns **409 Conflict**, the UI displays a "Concurrent Edit Detected" modal, forcing the user to refresh and resolve differences manually.

## 8. Media Strategy (Lossless Pipeline)


The frontend **disables** client-side image compression (`ImageCropUploader.js`).
- **Why?**: Browser-based compression (Canvas/WASM) often strips metadata or introduces artifacts.
- **Flow**: The frontend uploads raw PNG/JPEG blobs. The Backend (Java Virtual Threads) handles the CPU-intensive task of generating optimized WebP variants. This ensures "Publisher Quality" visuals.

---

## 10. Notable New/Updated Pages

### ApiStatusPage
- **Component:** `ApiStatusPanel`
- **Purpose:** Visualizes backend data pipeline health and logs. No direct API fetch in the page; all logic is in the panel/component.

### AudiencePage
- **Component:** Inline logic
- **Purpose:** Fetches and displays audience analytics with dynamic filters. Uses `getHistoricalAudienceData` and `getFilterOptions` from `apiConfig`. Implements cascading filter resets and date range selection.

### VisionPage
- **Component:** Inline logic
- **Purpose:** Static roadmap and vision statement. Injects JSON-LD schema for SEO. No API fetch.

---

## 9. Zero Trust Configuration

The project follows **12-Factor App** principles:
- **No Secrets**: No API keys or Secrets are hardcoded.
- **Injection**: All configuration happens at runtime via environment variables injected by the hosting provider (Cloudflare Pages).