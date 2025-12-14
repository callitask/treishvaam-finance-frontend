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
- **Footer.js**: (Not opened, but typically provides site-wide footer, copyright, and links)

## 3. Feature: Blog Editor

- **EditorForm.js**:
  - Uses `SunEditor` (rich text editor) loaded via `React.lazy` and `Suspense` for performance
  - Receives content, change handlers, and image upload hooks as props
  - Integrates with panels for meta, SEO, and layout (handled in parent BlogEditor components)
  - Designed for extensibility with custom toolbars and formatting
- **ImageCropUploader** and **StoryThumbnailManager**:
  - (Not opened, but referenced in BlogEditor) Used for image upload, cropping, and thumbnail management within the editor workflow

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
- **GlobalMarketTicker.js**:
  - (Not opened, but likely provides a scrolling or fixed ticker of global market prices)

## 5. Reusable UI Elements

- **PaginationControls**: For paginated lists (e.g., admin post management)
- **ShareModal**: Social sharing dialog/modal
- **PasswordPromptModal**: Modal for password-protected content

These generic components are used across features to ensure consistency and reusability.

---

This guide summarizes the structure and key components of the frontend, highlighting modularity, feature encapsulation, and UI best practices.