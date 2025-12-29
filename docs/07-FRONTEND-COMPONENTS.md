# Session 10: Frontend Components

## 1. Component Hierarchy

The `src/components` folder is organized by feature and UI domain:

- **components/market**: Market data widgets (charts, summaries, tickers)
- **components/BlogPage**: Blog feed, post cards, category strips, etc.
- **components/BlogEditor**: Blog editing UI, including panels for meta, SEO, layout, and media modals
- **components/manage-posts**: Admin tools for post management (pagination, stats, filters)

This modular structure supports scalability and separation of concerns.

## 2. Core Layout Components

- **Navbar.js**: Responsive navigation bar with:
  - Auth-aware links (login/logout, user dropdown)
  - Theme toggle (light/dark)
  - Market status indicator (open/closed, color-coded)
  - Integrated search autocomplete
  - Mobile menu with hamburger toggle
  - Social media links
  - Scroll-aware visibility (hides on scroll down)
- **Footer.js**: Provides site-wide footer, copyright, and links.

## 3. Feature: Blog Editor

The Blog Editor is a complex state machine designed for enterprise content management.

- **BlogEditorPage.js (Controller)**:
  - **State Management**: Handles form state (`title`, `content`) and the critical **Optimistic Locking** handshake (`version`).
  - **Conflict Resolution**: Intercepts `409 Conflict` errors from the API and triggers a modal forcing the user to refresh if another admin has modified the post concurrently.
  - **Auto-Save**: Triggers background drafts every 2 seconds.

- **EditorForm.js (View)**:
  - Uses `SunEditor` (rich text editor) loaded via `React.lazy` and `Suspense` for performance
  - Receives content, change handlers, and image upload hooks as props
  - Integrates with panels for meta, SEO, and layout (handled in parent BlogEditor components)

- **ImageCropUploader.js**:
  - **Lossless Pipeline**: Unlike standard uploaders, this component intentionally **skips client-side compression**. It sends raw PNG blobs to the backend to ensure the server-side **Java 21 Virtual Threads** pipeline has the highest quality source for WebP generation.

## 4. Feature: Market Data Widgets

- **MarketChart.js**:
  - Renders a line chart using `react-chartjs-2` and `chart.js`
  - Displays price data with color-coded trends (green/red)
  - Includes a reference line for previous close
  - Uses gradients for visual appeal
  - Handles empty data gracefully

- **DynamicMarketSummary.js**:
  - Displays tabbed market summaries (US, Europe, India, Currencies, Crypto)
  - Fetches batch quotes for each tab and maps tickers to display names
  - Shows loading states and handles missing data
  - Integrates with navigation for ticker details

## 5. Reusable UI Elements

- **PaginationControls**: For paginated lists (e.g., admin post management)
- **ShareModal**: Social sharing dialog/modal
- **PasswordPromptModal**: Modal for password-protected content

These generic components are used across features to ensure consistency and reusability.

---

This guide summarizes the structure and key components of the frontend, highlighting modularity, feature encapsulation, and UI best practices.