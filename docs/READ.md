# Frontend Developer Guide

Subtitle: Frontend developer onboarding and reference for the Treishvaam Finance frontend project

Project summary: (placeholder — brief summary of what this frontend does and who maintains it)

## Table of Contents

- [Step 1 — Framework Detection](#step-1-—-framework-detection)
- [Step 2 — Project File List](#step-2-—-project-file-list)
- [Step 3 — Quick Start](#step-3-—-quick-start)
- [Step 4 — Routes](#step-4-—-routes)
 - [Step 5 — Components (Pages)](#step-5-—-components-pages)
 - [Step 6 — API Mapping](#step-6-—-api-mapping)
 - [Step 7 — State Management](#step-7-—-state-management)
 - [Step 8 — Environment & Config](#step-8-—-environment--config)
 - [Step 9 — Testing & QA](#step-9-—-testing--qa)
 - [Step 10 — Build & Deploy](#step-10-—-build--deploy)
 - [Step 11 — VS Code Setup](#step-11-—-vs-code-setup)
 - [Step 12 — Observability](#step-12-—-observability)
 - [Step 14 — Finalization](#step-14-—-finalization)





## Step 1 — Framework Detection

This step detects the project's frontend framework, tooling, node/package manager recommendations, key dependencies, entry file(s), and any assumptions made during detection.

1) Framework / Boilerplate

- Detected framework: React (project was bootstrapped with Create React App)
- Evidence: presence of `react`, `react-dom`, `react-scripts` in `package.json`, and the top-level `README.md` referencing Create React App.

2) Tooling / Build system

- Build tool / scripts: `react-scripts` (Create React App)
- NPM scripts (from `package.json`):

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

- Linting: configured via `eslintConfig` which extends `react-app` and `react-app/jest`.
- PostCSS / Tailwind: `postcss` and `tailwindcss` are dependencies and `postcss.config.js` and `tailwind.config.js` exist in the repo root.

3) Node version & Package manager

- No `engines` field found in `package.json` and no `.nvmrc` detected during this step. Recommendation: use an actively-supported Node LTS (16+ or 18+). Many Create React App projects work well with Node 16 or Node 18 — prefer Node 18 for compatibility with recent deps.
- Package manager: `package.json` present — project likely uses npm by default. Yarn or pnpm may also work but npm is the safe default given the scripts.

4) Key dependencies (full list from `package.json` dependencies)

```json
{
  "@testing-library/dom": "^10.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^13.5.0",
  "autoprefixer": "^10.4.21",
  "axios": "^1.10.0",
  "browser-image-compression": "^2.0.2",
  "chart.js": "^4.5.0",
  "dompurify": "^3.2.6",
  "jwt-decode": "^4.0.0",
  "postcss": "^8.4.38",
  "react": "^18.3.1",
  "react-chartjs-2": "^5.3.0",
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1",
  "react-dom": "^18.3.1",
  "react-helmet-async": "^2.0.5",
  "react-icons": "^5.5.0",
  "react-image-crop": "^11.0.10",
  "react-lazy-load-image-component": "^1.6.3",
  "react-quill": "^2.0.0",
  "react-router-dom": "^7.6.2",
  "react-scripts": "^5.0.1",
  "react-share": "^5.2.2",
  "react-slick": "^0.30.3",
  "slick-carousel": "^1.8.1",
  "suneditor": "^2.47.6",
  "suneditor-react": "^3.6.1",
  "tailwindcss": "^3.4.3",
  "web-vitals": "^2.1.4"
}
```

5) Entry file(s)

- Main client entry: `src/index.js` (Create React App default). Full contents of `src/index.js` follow below (unchanged):

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        {/* Add HelmetProvider around your App */}
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

```

- App root component: `src/App.js` (routing and layout). Full contents of `src/App.js` follow below (unchanged):

```javascript
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import VisionPage from './pages/VisionPage';
import EducationPage from './pages/EducationPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import BlogEditorPage from './pages/BlogEditorPage';
import ManagePostsPage from './pages/ManagePostsPage';
import SettingsPage from './pages/SettingsPage';
import SinglePostPage from './pages/SinglePostPage';
import DashboardPage from './pages/DashboardPage';
import ApiStatusPage from './pages/ApiStatusPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<Navigate to="/" replace />} />
          {/* UPDATED: Route for single posts no longer includes /blog */}
          <Route path="/category/:categorySlug/:userFriendlySlug/:urlArticleId" element={<SinglePostPage />} />
          <Route path="/login" element={<LoginPage />} />

        </Route>

        <Route path="/manage-posts" element={<Navigate to="/dashboard/manage-posts" replace />} />

        {/* Private Admin Routes */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
        >
          <Route index element={<DashboardPage />} />
          <Route path="manage-posts" element={<ManagePostsPage />} />
          <Route path="blog/new" element={<BlogEditorPage />} />
          <Route path="blog/edit/:userFriendlySlug/:id" element={<BlogEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="api-status" element={<ApiStatusPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

```

6) Assumptions & notes

- The project is a Create React App-based React application using `react-scripts` v5.0.1.
- The router is `react-router-dom` v7 — note that major versions after v6 may include breaking changes; confirm routing APIs when upgrading.
- Tailwind is present; check `postcss.config.js` and `tailwind.config.js` for project-specific Tailwind setup.
- No TypeScript config detected (`tsconfig.json` not found) — project appears to be JavaScript-only.
- No custom bundler config files (webpack/vite/angular/vue/svelte) were found in the repository root during this scan.

---

Immediate actionable recommendations

- Use Node LTS 18 for local development (or Node 16 if required by environment). Verify with `node -v` and `npm -v`.
- Install node modules with `npm install` (or `npm ci` if you have a lockfile and want a reproducible install).
- To start dev server locally: `npm start` — Create React App default: runs on http://localhost:3000 by default.

---

Full-file update summary (JSON):

```json
{
  "updated_file": "docs/READ.md",
  "step_completed": "Step 1 — Framework Detection",
  "continuation_required": false,
  "issues_found": [],
  "next_action": "Proceed with Step 2"
}
```


  ## Step 2 — Project File List

  This step contains a full, repository-wide file list (no depth limit) and one-line descriptions for the important files and folders that frontend developers should know.

  Full file list (paths are relative to repo root):

  - .gitignore — git ignore rules
  - .env.example — example environment variables (do not store secrets here)
  - package.json — npm manifest, scripts, and dependency declarations
  - package-lock.json — npm lockfile for reproducible installs
  - docs_file_list.json — machine-generated docs file list
  - README.md — project README (Create React App default getting started)
  - postcss.config.js — PostCSS configuration (used by Tailwind)
  - tailwind.config.js — Tailwind CSS configuration
  - docs/README.md — docs landing (existing docs folder readme)
  - docs/READ.md — Frontend Developer Guide (this file)
  - docs/quick-start.md — quick start guide (docs)
  - docs/framework-detection.md — framework detection notes
  - docs/env.md — environment & env var guidance
  - docs/build-deploy.md — build and deployment instructions
  - docs/docker-frontend.Dockerfile — Dockerfile for frontend (docs copy)
  - docs/vscode.md — recommended VS Code settings and tips
  - docs/testing.md — testing guide and notes
  - docs/state.md — state management notes
  - docs/routes.md — route documentation
  - docs/repo-tree.md — repository tree reference
  - docs/api-mapping.md — API mapping documentation
  - docs/.env.example — docs copy of .env.example
  - docs/diagrams/architecture.mmd — Mermaid diagram source
  - docs/diagrams/architecture.png — architecture image
  - docs/components/* (many component docs) — per-component documentation files

  - public/_redirects — Netlify or hosting redirect rules
  - public/amitsagar-kandpal-photo.png — static asset
  - public/favicon.ico — favicon
  - public/googleba974015553e7035.html — google verification file
  - public/index.html — app HTML template
  - public/logo-backup.html — backup logo page
  - public/logo.png — site logo
  - public/logo192.png — PWA icon
  - public/logo512.png — PWA icon
  - public/manifest.json — PWA manifest
  - public/_redirects — redirect rules (duplicate listing due to multiple references)

  - src/index.js — app entry point (ReactDOM createRoot, Router, AuthProvider, HelmetProvider)
  - src/index.css — global CSS (imports Tailwind and app styles)
  - src/App.js — primary app component and routing
  - src/apiConfig.js — api configuration (likely base URLs / api helpers)
  - src/config.js — runtime config (feature flags or settings)

  - src/context/AuthContext.js — authentication context provider

  - src/hooks/useCountdown.js — custom React hook used in UI

  - src/layouts/MainLayout.js — main public-facing layout wrapper
  - src/layouts/DashboardLayout.js — admin/dashboard layout wrapper

  - src/pages/AboutPage.js — About page
  - src/pages/ApiStatusPage.js — API status / health page
  - src/pages/BlogEditorPage.js — blog editor (admin)
  - src/pages/BlogPage.js — blog landing / list
  - src/pages/ContactPage.js — contact page
  - src/pages/DashboardPage.js — admin dashboard landing
  - src/pages/EducationPage.js — education page
  - src/pages/HomePage.js — home page (often alias for blog)
  - src/pages/LoginPage.js — login page
  - src/pages/ManagePostsPage.js — admin posts management
  - src/pages/MyCoursesPage.js — user courses page
  - src/pages/ServicesPage.js — services page
  - src/pages/SettingsPage.js — settings page (admin)
  - src/pages/SinglePostPage.js — single blog post page
  - src/pages/VisionPage.js — vision / about page

  - src/components/ApiStatusBlock.js — small API status display block
  - src/components/ApiStatusPanel.js — API status panel
  - src/components/AuthImage.js — responsive auth images
  - src/components/BlogSidebar.js — blog sidebar UI
  - src/components/DeeperDive.js — supplemental content block
  - src/components/DevelopmentNotice.js — development mode notice
  - src/components/Footer.js — site footer
  - src/components/ImageCropUploader.js — image crop + upload helper UI
  - src/components/MarketMap.js — market mapping visualization
  - src/components/NewsHighlights.js — news highlights list
  - src/components/Navbar.js — top navigation
  - src/components/PasswordPromptModal.js — password prompt modal
  - src/components/PrivateRoute.js — wrapper that protects routes (auth)
  - src/components/ReadingProgressBar.js — reading progress indicator
  - src/components/ResponsiveAuthImage.js — responsive images helper
  - src/components/SearchAutocomplete.js — search autocomplete component
  - src/components/ShareButtons.js — social share buttons
  - src/components/ShareModal.js — sharing modal UI
  - src/components/StoryThumbnailManager.js — manage story thumbnails
  - src/components/TableOfContents.js — page table of contents helper

  - src/components/market/IndexCharts.js — market index charts
  - src/components/market/IndianMarketWidget.js — India-market widget
  - src/components/market/MarketCard.js — market card component
  - src/components/market/MarketChart.js — market chart component
  - src/components/market/MarketMovers.js — market movers list
  - src/components/market/MostActiveCard.js — most active card
  - src/components/market/TopMoversCard.js — top movers card
  - src/components/market/# Code Citations.md — internal note file

  Important files and one-line descriptions (developer-focused):

  - `package.json` — npm scripts and dependencies. Key scripts: `npm start`, `npm build`, `npm test`, `npm eject`.
  - `package-lock.json` — exact dependency tree for reproducible installs.
  - `public/index.html` — HTML template injected with the React app root.
  - `src/index.js` — single entry point; wraps `App` with Router and Providers.
  - `src/App.js` — router and route-to-component mapping; lists public and private routes.
  - `src/context/AuthContext.js` — authentication state and helpers used by `PrivateRoute`.
  - `src/components/PrivateRoute.js` — guards dashboard routes for authenticated users.
  - `src/config.js` — runtime configuration; inspect for API endpoints, feature flags.
  - `.env.example` — documented environment variables; create a local `.env` from this when needed.
  - `postcss.config.js` & `tailwind.config.js` — Tailwind and PostCSS setup; important for styles.
  - `docs/` — many developer docs exist; use these to learn component APIs, routes, and deploy steps.

  Notes & caveats:

  - This file list was generated programmatically during Step 2. Some files may be referenced multiple times (for example `_redirects` appears in public and build). The `docs/` folder contains extensive component-level docs which can be used to find implementation details quickly.
  - If you want a mapped visualization (tree) or CSV export of the file list, say so and I'll produce it in the next step.

  ---

  JSON summary (per Global Rules):

  ```json
  {
    "updated_file": "docs/READ.md",
    "step_completed": "Step 2 — Project File List",
    "continuation_required": false,
    "issues_found": [],
    "next_action": "Proceed with Step 3"
  }
  ```
Notes:
- This tree lists all files discovered during the workspace scan. `node_modules/` is present but not expanded.
- `tsconfig.json` was not found in the workspace (not a TypeScript project).
- If you want a literal `tree /F` style output including every file under `node_modules`, run `tree /F` in PowerShell at the repo root.

│  ├─ logo.png
│  ├─ logo192.png
│  ├─ logo512.png
│  └─ manifest.json
├─ README.md
├─ src/
│  ├─ apiConfig.js
│  ├─ App.js
│  ├─ config.js
│  ├─ index.css
│  ├─ index.js
	│
│  ├─ components/
│  │  ├─ ApiStatusBlock.js
│  │  ├─ ApiStatusPanel.js
│  │  ├─ AuthImage.js
│  │  ├─ BlogSidebar.js
│  │  ├─ DeeperDive.js
│  │  ├─ DevelopmentNotice.js
│  │  ├─ Footer.js
│  │  ├─ ImageCropUploader.js
│  │  ├─ MarketMap.js
│  │  ├─ Navbar.js
│  │  ├─ NewsHighlights.js
│  │  ├─ PasswordPromptModal.js
│  │  ├─ PrivateRoute.js
│  │  ├─ ReadingProgressBar.js
│  │  ├─ ResponsiveAuthImage.js
│  │  ├─ SearchAutocomplete.js
│  │  ├─ ShareButtons.js
│  │  ├─ ShareModal.js
│  │  ├─ StoryThumbnailManager.js
│  │  ├─ TableOfContents.js
│  │  └─ ImageCropUploader.js
│  │
│  │  └─ market/
│  │     ├─ IndexCharts.js
│  │     ├─ IndianMarketWidget.js
│  │     ├─ MarketCard.js
│  │     ├─ MarketChart.js
│  │     ├─ MarketMovers.js
│  │     ├─ MostActiveCard.js
│  │     ├─ TopMoversCard.js
│  │     └─ # Code Citations.md
│  ├─ context/
│  │  └─ AuthContext.js
│  ├─ hooks/
│  │  └─ useCountdown.js
│  ├─ layouts/
│  │  ├─ DashboardLayout.js
│  │  └─ MainLayout.js
│  └─ pages/
│     ├─ AboutPage.js
│     ├─ ApiStatusPage.js
│     ├─ BlogEditorPage.js
│     ├─ BlogPage.js
│     ├─ ContactPage.js
│     ├─ DashboardPage.js
│     ├─ EducationPage.js
│     ├─ HomePage.js
│     ├─ LoginPage.js
│     ├─ ManagePostsPage.js
│     ├─ MyCoursesPage.js
│     ├─ ServicesPage.js
│     ├─ SettingsPage.js
│     ├─ SinglePostPage.js
│     └─ VisionPage.js
├─ postcss.config.js
├─ tailwind.config.js
└─ tsconfig.json (not found)

```

Notes:
- This tree lists all files discovered during the workspace scan. `node_modules/` is present but not expanded.
- `tsconfig.json` was not found in the workspace (not a TypeScript project).
- If you want a literal `tree /F` style output including every file under `node_modules`, run `tree /F` in PowerShell at the repo root.


  ## Step 3 — Quick Start

  This step provides a minimal, copy-paste Quick Start for a developer to get the project running locally. All commands are for PowerShell on Windows (the user's default shell). Replace values in `.env.local` as needed. Follow the checklist in order.

  1) Prerequisites

  - Node.js (LTS recommended): Node 18.x is recommended. Verify with:

  ```powershell
  node -v
  npm -v
  ```

  - npm (bundled with Node) as the package manager. The project has a `package-lock.json`; use `npm ci` in CI for reproducible installs.
  - Git for repository cloning and change management.
  - An editor (VS Code recommended). See `docs/vscode.md` for recommended settings.

  2) Get the code

  Clone the repository and install:

  ```powershell
  git clone <repo-url> treishvaam-finance-frontend
  cd treishvaam-finance-frontend
  npm install
  ```

  Note: Use `npm ci` instead of `npm install` in CI environments where `package-lock.json` is present and you want reproducible installs.

  3) Environment variables

  - Copy the example env file to a local file and edit values specific to your machine.

  Full contents of `.env.example` (copy verbatim into `.env.local` or `.env`):

  ```bash
  # Example environment variables for local development
  # Copy this file to `.env.local` and edit values per-developer. Do NOT commit secrets.

  REACT_APP_API_URL=http://localhost:8080
  REACT_APP_API_BASE_URL=https://backend.treishvaamgroup.com
  REACT_APP_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

  ```

  Important: any variable prefixed with `REACT_APP_` will be available to the client bundle at build-time. Never commit secrets to the repository. If you find secrets in the repo, redact them and follow the Immediate Security Actions steps in Step 1.

  4) Development server (start)

  Start the development server with:

  ```powershell
  npm start
  ```

  - This runs the Create React App dev server (react-scripts). By default it opens on http://localhost:3000. If port 3000 is in use, CRA will prompt to use another port.

  5) Build for production

  ```powershell
  npm run build
  ```

  - Output is placed in the `build/` folder. This folder is what you deploy to static hosting (Netlify, Vercel, static web server, or as part of a Docker image).

  6) Run tests

  ```powershell
  npm test
  ```

  - Runs the Create React App test runner. In CI, you may want to use `CI=true npm test -- --watchAll=false` to run tests once.

  7) Smoke test (after `npm start` or after `npm run build` + static server)

  - Dev server smoke test (recommended):

    - Start the dev server: `npm start`
    - Open http://localhost:3000 in a browser
    - Verify the app loads and the home/blog page is visible
    - Verify the console has no critical runtime errors

  - Production build smoke test (recommended):

    - Build: `npm run build`
    - Serve locally (using a simple static server like `serve`):

  ```powershell
  npx serve -s build -l 5000
  ```

    - Open http://localhost:5000 and verify the production bundle loads, and client-side routing works (visit a few routes).

  8) Ports used by the project

  - Dev server: 3000 (CRA default)
  - Example backend API in `.env.example`: 8080
  - Production static server in smoke test: 5000 (example)

  9) Troubleshooting tips

  - If you get a port-in-use error when starting: either stop the process using the port or set `PORT=3001` (or other) in your `.env.local` file before starting.
  - If Tailwind styles are missing, ensure `postcss` and `tailwindcss` are installed and `index.css` imports the Tailwind directives.
  - For CORS / backend issues during development, either run the backend locally on `REACT_APP_API_URL` or configure a proxy in `package.json` (if needed) or use CORS headers on the backend.

  ---

  JSON summary (per Global Rules):

  ```json
  {
    "updated_file": "docs/READ.md",
    "step_completed": "Step 3 — Quick Start",
    "continuation_required": false,
    "issues_found": [],
    "next_action": "Proceed with Step 4"
  }
  ```


  ## Step 4 — Routes

  Below is the route table compiled from `src/App.js`. The project uses React Router (v6-style `Routes` / `Route`). All page components are imported synchronously in `src/App.js` (no top-level `React.lazy` on pages), so 'Lazy?' is `No` unless indicated below. Administrative routes are protected by `PrivateRoute` so 'Auth?' is `Yes` for those.

  | Path | Component | Filepath | Lazy? | Auth? | Notes |
  |---|---|---|---:|---:|---|
  | / | BlogPage | src/pages/BlogPage.js | No | No | Main blog/home page (MainLayout) |
  | /about | AboutPage | src/pages/AboutPage.js | No | No | About page |
  | /services | ServicesPage | src/pages/ServicesPage.js | No | No | Services listing |
  | /vision | VisionPage | src/pages/VisionPage.js | No | No | Vision/About variant |
  | /education | EducationPage | src/pages/EducationPage.js | No | No | Education page |
  | /contact | ContactPage | src/pages/ContactPage.js | No | No | Contact form/page |
  | /blog (redirect) | Navigate -> / | (redirect) | N/A | No | Permanent client-side redirect to `/` |
  | /category/:categorySlug/:userFriendlySlug/:urlArticleId | SinglePostPage | src/pages/SinglePostPage.js | No | No | Single article page; keep param order when linking |
  | /login | LoginPage | src/pages/LoginPage.js | No | No | Public login route |
  | /manage-posts (redirect) | Navigate -> /dashboard/manage-posts | (redirect) | N/A | No | Backwards-compat redirect for old route |

  -- Dashboard (protected under `/dashboard`) --
  | /dashboard | DashboardPage (index) | src/pages/DashboardPage.js | No | Yes | Protected; wraps `DashboardLayout` inside `PrivateRoute` |
  | /dashboard/manage-posts | ManagePostsPage | src/pages/ManagePostsPage.js | No | Yes | Admin manage posts |
  | /dashboard/blog/new | BlogEditorPage | src/pages/BlogEditorPage.js | No | Yes | New post editor; internally uses `React.lazy` to lazy-load `suneditor-react` editor component |
  | /dashboard/blog/edit/:userFriendlySlug/:id | BlogEditorPage | src/pages/BlogEditorPage.js | No | Yes | Edit post route; same component as new editor with params |
  | /dashboard/settings | SettingsPage | src/pages/SettingsPage.js | No | Yes | Admin settings |
  | /dashboard/api-status | ApiStatusPage | src/pages/ApiStatusPage.js | No | Yes | API health / status page |

  Notes and caveats:

  - Auth detection: Routes nested under `/dashboard` are wrapped with `PrivateRoute` in `src/App.js`. Inspect `src/components/PrivateRoute.js` and `src/context/AuthContext.js` for the auth logic (tokens, role checks, redirects).
  - Lazy-loading: Page-level imports in `src/App.js` are synchronous (no dynamic imports), except internal lazy usage inside page components (for example `src/pages/BlogEditorPage.js` lazy-loads `suneditor-react` with `React.lazy`). If you want route-level code-splitting, convert page imports to `React.lazy(() => import('./pages/SomePage'))` and wrap with `<Suspense>` in `App.js` or a route-level wrapper.
  - Route ordering: Public routes are grouped under `MainLayout` as a parent route; the redirect `/blog` -> `/` and `/manage-posts` -> `/dashboard/manage-posts` are implemented with `<Navigate>` components.
  - Client-side routing caveat: keep server or static host configuration to serve `index.html` for unknown routes (SPA fallback). The `public/_redirects` file exists for Netlify-style routing.

  ---

  JSON summary (per Global Rules):

  ```json
  {
    "updated_file": "docs/READ.md",
    "step_completed": "Step 4 — Routes",
    "continuation_required": false,
    "issues_found": [],
    "next_action": "Proceed with Step 5"
  }
  ```


## Step 5 — Components (Pages)

Below are concise, developer-focused summaries for the page-level components (files in `src/pages/`). Each entry includes: filepath, short purpose, visible props (if any), local state highlights, important hooks/lifecycle usage, third-party / backend API calls, styling notes, accessibility hints, and quick TODOs or caveats.

### ApiStatusPage
- Filepath: `src/pages/ApiStatusPage.js`
- Purpose: Thin wrapper page that renders the `ApiStatusPanel` (used by the admin dashboard to show API health and history).
- Props: none
- Local state: none
- Hooks: none
- API calls: none (delegates to `ApiStatusPanel`)
- Styling: container padding via Tailwind (`container mx-auto p-6 md:p-8`).
- Accessibility: simple semantic layout; ensure `ApiStatusPanel` provides proper aria attributes for status updates.
- Notes / TODOs: If `ApiStatusPanel` depends on polling, note resource cost for frequent intervals when left open.

### AboutPage
- Filepath: `src/pages/AboutPage.js`
- Purpose: Static marketing page with founder bio and core values. Loads an author image lazily.
- Props: none
- Local state: none
- Hooks: none
- API calls: none
- Styling: uses Tailwind utility classes and `react-lazy-load-image-component` for progressive image loading.
- Accessibility: images include alt text; external links set rel and target correctly. Ensure heading structure is preserved for screen readers.
- Notes / TODOs: Keep image alt text up to date; consider marking founder name with appropriate microdata if required.

### VisionPage
- Filepath: `src/pages/VisionPage.js`
- Purpose: Static content page describing vision and roadmap. Pure presentational page.
- Props: none
- Local state: none
- Hooks: none
- API calls: none
- Styling: hero gradient and timeline cards built with Tailwind.
- Accessibility: uses semantic headings and paragraphs; ensure contrast for gradient sections.

### SinglePostPage
- Filepath: `src/pages/SinglePostPage.js`
- Purpose: Fetches and renders a single blog post (content HTML is sanitized then inserted via dangerouslySetInnerHTML). Also builds a Table of Contents and reading progress indicator.
- Props: none (reads route param `urlArticleId` via `useParams()`)
- Local state: post, loading, error, headings (for TOC), activeId (for current heading), progress (reading progress)
- Hooks: useEffect for fetching post and for extracting headings, useMemo + throttle for scroll handling
- API calls: getPostByUrlId (from `apiConfig` / API client)
- Third-party: DOMPurify for sanitizing HTML, `react-helmet-async` for SEO tags
- Styling: `prose` classes for article content (likely tailwind/typography plugin). Sticky aside for TOC on large screens.
- Accessibility: sanitization prevents XSS; ensure TableOfContents links are keyboard focusable and the progress bar has aria-labels
- Notes / TODOs:
  - Confirm server returns stable `urlArticleId` values and cover image naming expectations.
  - Consider implementing an accessible skip link to jump to article content.

### SettingsPage
- Filepath: `src/pages/SettingsPage.js`
- Purpose: Admin settings placeholder page. Minimal UI for account settings.
- Props: none
- Local state: none (page is static placeholder)
- Hooks: none
- API calls: none (future: save user settings endpoints)
- Styling: basic headings and text using Tailwind
- Accessibility: ensure form controls (when added) will have labels and error states.

### ServicesPage
- Filepath: `src/pages/ServicesPage.js`
- Purpose: Marketing page listing offered services with CTA links to the contact page.
- Props: none
- Local state: none
- Hooks: none
- API calls: none
- Styling: card grid layout (Tailwind), icons inline (SVG)
- Accessibility: Link text is descriptive; CTA uses semantic <Link>
- Notes: Contact query parameters (example: `/contact?service=financial-planning`) are used to prefill contact intent.

### MyCoursesPage
- Filepath: `src/pages/MyCoursesPage.js`
- Purpose: User-facing page showing courses owned/enrolled (placeholder present)
- Props: none
- Local state: none (static placeholder)
- Hooks: none
- API calls: none yet (future: fetch enrolled courses)
- Styling: simple container and headings

### ManagePostsPage
- Filepath: `src/pages/ManagePostsPage.js`
- Purpose: Admin UI for listing, searching, duplicating, and deleting posts (supports tabs for published, drafts, and scheduled posts).
- Props: none (uses react-router location)
- Local state (highlights): allPosts, drafts, selectedPostIds, activeTab, error, isShareModalOpen
- Hooks: useEffect for fetching posts/drafts and to respond to location.hash; useCallback and useMemo for derived lists and handlers
- API calls: getAllPostsForAdmin (getPosts), getDrafts, deletePost, duplicatePost, bulkDeletePosts — all from `apiConfig`
- Components used: ResponsiveAuthImage, ShareModal
- Styling: table layout with responsive overflow, Tailwind utility classes for table and controls
- Accessibility: tables need proper headers (present), controls should have aria labels; confirm keyboard interactions for row selection and bulk actions
- Notes / TODOs:
  - Bulk operations must handle large lists gracefully (confirm backend timeouts and consider pagination for scalability).

### LoginPage
- Filepath: `src/pages/LoginPage.js`
- Purpose: Admin login form; calls `login` from `AuthContext` and redirects to `/dashboard` on success.
- Props: none
- Local state: email, password, error, isLoading
- Hooks: useAuth() to call login; useNavigate for redirect
- API calls: login call is performed by `useAuth().login` (in `AuthContext`) which uses the API client
- Styling: centered card, auth-input classes used for inputs
- Accessibility: inputs include name and autocomplete attributes; ensure password field uses appropriate autocomplete and label association
- Notes: consider adding rate-limiting/lockout messaging if API returns relevant status codes.

### HomePage
- Filepath: `src/pages/HomePage.js`
- Purpose: Landing page / hero section and feature blocks. Fetches latest featured post for SEO/OG tags.
- Props: none
- Local state: latestPost
- Hooks: useEffect to fetch latest posts via api.get('/api/posts')
- API calls: direct api.get('/api/posts') (uses authenticated or unauthenticated API instance depending on `apiConfig`)
- Styling: hero gradient, CTAs, responsive cards
- Accessibility: SEO meta tags via `react-helmet-async`; ensure hero is reachable by assistive tech
- Notes: The HomePage fetches posts and filters client-side; consider server-side filter endpoint for featured posts to reduce payload.

### EducationPage
- Filepath: `src/pages/EducationPage.js`
- Purpose: Lists education modules (courses) and module cards with links to course content.
- Props: none
- Local state: none (static modules array)
- Hooks: none
- API calls: none (placeholder static content)
- Styling: same card grid pattern as other marketing pages

### DashboardPage
- Filepath: `src/pages/DashboardPage.js`
- Purpose: Admin dashboard showing quick stats (published/scheduled posts), recent posts, and quick actions like creating a post or connecting LinkedIn
- Props: none
- Local state: posts, error
- Hooks: useAuth() to get current user, useEffect to fetch posts for stats and set a polling interval
- API calls: getAllPostsForAdmin (getPosts) for stats and recent posts
- Styling: grid of stat cards, Quick Actions pane
- Accessibility: dashboard cards should provide clear headings and numeric values; dynamic updates should be announced if desired
- Notes: polling interval is 30s — confirm this is acceptable for server load and change to websockets/events if real-time is needed.

### ContactPage
- Filepath: `src/pages/ContactPage.js`
- Purpose: Contact form and contact information fetch. Submits messages to `/contact`.
- Props: none
- Local state: formData, status, contactInfo
- Hooks: useEffect to fetch contact info from API, handlers for form submission
- API calls: api.get('/contact/info') and api.post('/contact') (via `apiConfig` client)
- Styling: form and contact cards built with Tailwind; accessible form layout with labels
- Accessibility: labels are present and required fields use proper semantics; ensure server validation messages are surfaced to screen readers

## Step 6 — API Mapping

This section maps frontend components and pages to the backend endpoints they call (via `src/apiConfig.js` helpers or direct `api` calls). Below are the key mappings and copy-paste `curl` examples for the main endpoints. The API base used by the client is:

- Base API URL constant: `API_URL` exported from `src/apiConfig.js` and set to `https://backend.treishvaamgroup.com`.
- Client base path used by helper functions: `${API_URL}/api` (helpers call `/api/...`).
- Authorization: the axios instance automatically adds `Authorization: Bearer <token>` from `localStorage.token` when present. For curl examples include the header `-H "Authorization: Bearer <TOKEN>"` after logging in.

Component → Backend mapping (high-level)

- ApiStatusPanel / ApiStatusBlock (`src/components/ApiStatusPanel.js`, `src/components/ApiStatusBlock.js`)
  - Helpers used: `getApiStatusHistory()`, `refreshMovers()`, `refreshIndices()`, `flushMovers(password)`, `flushIndices(password)`
  - Endpoints:
    - GET /api/status/history
    - POST /api/market/admin/refresh-movers
    - POST /api/market/admin/refresh-indices
    - POST /api/market/admin/flush-movers (body: { password })
    - POST /api/market/admin/flush-indices (body: { password })

- BlogPage (`src/pages/BlogPage.js`) and listing components (PostCard, GridPostCard, BannerPostCard)
  - Helpers used: `getPaginatedPosts(page,size)`, `getCategories()`, `getTopGainers()`, `getTopLosers()`, `getMostActive()`
  - Endpoints:
    - GET /api/posts?page={page}&size={size}
    - GET /api/categories
    - GET /api/market/top-gainers
    - GET /api/market/top-losers
    - GET /api/market/most-active

- SinglePostPage (`src/pages/SinglePostPage.js`)
  - Helpers used: `getPostByUrlId(urlArticleId)`
  - Endpoint:
    - GET /api/posts/url/{urlArticleId}

- BlogEditorPage (`src/pages/BlogEditorPage.js`) and story thumbnail manager
  - Helpers used: `getPost(id)`, `createPost(formData)`, `updatePost(id, formData)`, `createDraft(postData)`, `updateDraft(id, postData)`, `uploadFile(formData)`, `getCategories()`, `addCategory(data)`
  - Endpoints (not exhaustive):
    - GET /api/posts/{id}
    - POST /api/posts  (multipart/form-data)
    - PUT /api/posts/{id} (multipart/form-data)
    - POST /api/posts/draft (JSON)
    - PUT /api/posts/draft/{id} (JSON)
    - POST /api/files/upload (multipart/form-data)
    - GET /api/categories
    - POST /api/categories

- ManagePostsPage (`src/pages/ManagePostsPage.js`)
  - Helpers used: `getAllPostsForAdmin()`, `getDrafts()`, `deletePost(id)`, `duplicatePost(id)`, `bulkDeletePosts(ids)`
  - Endpoints:
    - GET /api/posts/admin/all
    - GET /api/posts/admin/drafts
    - DELETE /api/posts/{id}
    - POST /api/posts/{id}/duplicate
    - DELETE /api/posts/bulk  (JSON array payload)

- Auth / Login (`src/context/AuthContext.js` and `src/pages/LoginPage.js`)
  - Helper used: `login(credentials)`
  - Endpoint:
    - POST /api/auth/login  (JSON credentials { email, password }) → returns auth token in response (used by client)

- Search / Autocomplete (`src/components/SearchAutocomplete.js` and various pages)
  - Helper used: `searchPosts(query)`
  - Endpoint:
    - GET /api/search?q={query}

- News & market widgets (NewsHighlights, TopMoversCard, IndexCharts, MarketMovers)
  - Helpers: `getNewsHighlights()`, `getArchivedNews()`, `getTopGainers()`, `getTopLosers()`, `getMostActive()`, `getHistoricalData(ticker)`
  - Endpoints:
    - GET /api/news/highlights
    - GET /api/news/archive
    - GET /api/market/top-gainers
    - GET /api/market/top-losers
    - GET /api/market/most-active
    - GET /api/market/historical/{ticker}

Notes about response shapes seen in code

- Paginated posts: the code reads `response.data.content` and `response.data.last` from `getPaginatedPosts()` — the backend returns a paginated object with `content` (array of posts) and `last` (boolean) at minimum.
- Post objects used by the UI often include fields such as `id`, `title`, `content`, `customSnippet`, `thumbnails` (array), `featured`, `createdAt`, `updatedAt`, `userFriendlySlug`, `urlArticleId`, `category`, `tags`, `layoutStyle`, `layoutGroupId`.
- File upload: client calls `POST /api/files/upload` with multipart/form-data. The editor and thumbnail manager expect an uploaded-file identifier or URL in the response (use the returned data per your backend contract).

Curl examples (copy-paste and replace placeholders)

1) Login (get a token)

```bash
curl -s -X POST "https://backend.treishvaamgroup.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Response (example): { "token": "eyJhbGci..." }

Store that token and use it for authenticated requests:

2) List paginated posts (public)

```bash
curl -s "https://backend.treishvaamgroup.com/api/posts?page=0&size=9" \
  -H "Accept: application/json"
```

3) Fetch a single post by custom URL id (used by `SinglePostPage`)

```bash
curl -s "https://backend.treishvaamgroup.com/api/posts/url/<URL_ARTICLE_ID>" \
  -H "Accept: application/json"
```

4) Fetch a post by numeric id (editor / admin)

```bash
curl -s "https://backend.treishvaamgroup.com/api/posts/123" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN>"
```

5) Create a new post (multipart/form-data — images/files + JSON parts)

```bash
curl -s -X POST "https://backend.treishvaamgroup.com/api/posts" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My New Post" \
  -F "content=<p>HTML content here</p>" \
  -F "categoryId=5" \
  -F "coverImage=@/path/to/cover.webp" \
  -F "thumbnails[]=@/path/to/thumb1.webp" \
  -F "thumbnails[]=@/path/to/thumb2.webp"
```

6) Update a post (multipart)

```bash
curl -s -X PUT "https://backend.treishvaamgroup.com/api/posts/123" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Updated Title" \
  -F "content=<p>Updated HTML</p>"
```

7) Create / update draft (JSON)

```bash
# create draft
curl -s -X POST "https://backend.treishvaamgroup.com/api/posts/draft" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Draft title","content":"<p>Draft</p>"}'

# update draft
curl -s -X PUT "https://backend.treishvaamgroup.com/api/posts/draft/456" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated draft title","content":"<p>Updated</p>"}'
```

8) Upload a file (editor / images)

```bash
curl -s -X POST "https://backend.treishvaamgroup.com/api/files/upload" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/image.webp"
```

9) Categories (list + create)

```bash
curl -s "https://backend.treishvaamgroup.com/api/categories" \
  -H "Accept: application/json"

curl -s -X POST "https://backend.treishvaamgroup.com/api/categories" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Category"}'
```

10) Admin: bulk delete posts

```bash
curl -s -X DELETE "https://backend.treishvaamgroup.com/api/posts/bulk" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[123, 456, 789]'
```

11) API status & market control (admin)

```bash
# get status history
curl -s "https://backend.treishvaamgroup.com/api/status/history" -H "Accept: application/json"

# trigger refresh of market movers (admin)
curl -s -X POST "https://backend.treishvaamgroup.com/api/market/admin/refresh-movers" -H "Authorization: Bearer <TOKEN>"

# flush movers (admin with password)
curl -s -X POST "https://backend.treishvaamgroup.com/api/market/admin/flush-movers" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

12) Market data endpoints (read-only)

```bash
curl -s "https://backend.treishvaamgroup.com/api/market/top-gainers" -H "Accept: application/json"
curl -s "https://backend.treishvaamgroup.com/api/market/top-losers" -H "Accept: application/json"
curl -s "https://backend.treishvaamgroup.com/api/market/most-active" -H "Accept: application/json"
curl -s "https://backend.treishvaamgroup.com/api/market/historical/RELIANCE.NS" -H "Accept: application/json"
```

Quick integration notes

- Use the `login` endpoint to obtain a token and set `localStorage.token = <token>` in the browser (the app's axios instance reads `localStorage.token` and sends `Authorization` automatically).
- For multipart endpoints (`/files/upload`, `/posts`), make sure you send `Content-Type: multipart/form-data` and use `-F` with curl.
- For DELETE requests that carry a JSON body (e.g., `/posts/bulk`) use `-X DELETE` and pass `-H "Content-Type: application/json"` and `-d '...'`.
- When experimenting with endpoints in the terminal, begin with unauthenticated GETs (categories, market) and only use authenticated requests after confirming credentials with `POST /api/auth/login`.




      ## Step 7 — State Management

      This section documents the project's current state management approach, a recommended (minimal) store shape for a central store, the common actions and side effects the frontend performs, and guidance for extending or evolving state architecture.

      High-level summary (current approach)
      - The project is primarily component-driven using local React state (`useState`, `useRef`, `useEffect`) for page-specific UI and data.
      - A single Context-based global store exists for authentication: `src/context/AuthContext.js` (stores token, user, login/logout helpers). `PrivateRoute` and pages read from this context.
      - Server interactions are performed ad-hoc in components via the `apiConfig` helpers (axios instance). There is no centralized client-side cache like React Query in the current codebase.

      Why document this
      - Developers need a clear map of what is local UI state vs global state and where side effects (API calls, timers, localStorage) live so bugs and additions are predictable.

      Recommended minimal global store shape (example)
      - If you introduce a single central store (Context, Zustand, or Redux), a minimal shape that covers app needs looks like:

      ```json
      {
        "auth": {
          "token": "string|null",
          "user": { "id": 123, "name": "Admin", "roles": ["admin"] } | null,
          "loading": false,
          "error": null
        },
        "posts": {
          "byId": { "123": { /* post object */ } },
          "lists": {
            "home": { "ids": [123,456], "page": 0, "hasMore": true }
          },
          "drafts": { "ids": [], "byId": {} },
          "loading": false,
          "error": null
        },
        "categories": { "items": [], "loading": false },
        "ui": { "toast": null, "modal": null }
      }
      ```

      Core actions (intent names) and where they map to API calls
      - Auth
        - auth/login(credentials) -> POST /api/auth/login
        - auth/logout() -> clear token, user, redirect
        - auth/refresh() -> optional refresh flow (if backend supports)

      - Posts
        - posts/fetchPage({page,size}) -> GET /api/posts?page=..&size=..
        - posts/fetchByUrlId(urlArticleId) -> GET /api/posts/url/{id}
        - posts/fetchById(id) -> GET /api/posts/{id}
        - posts/create(formData) -> POST /api/posts
        - posts/update(id, formData) -> PUT /api/posts/{id}
        - posts/delete(id) -> DELETE /api/posts/{id}
        - posts/bulkDelete(ids) -> DELETE /api/posts/bulk
        - posts/createDraft(data) -> POST /api/posts/draft
        - posts/updateDraft(id,data) -> PUT /api/posts/draft/{id}

      - Files / Uploads
        - files/upload(formData) -> POST /api/files/upload

      - Categories
        - categories/fetchAll() -> GET /api/categories
        - categories/create(data) -> POST /api/categories

      - Market & News (read-only)
        - market/getTopGainers() -> GET /api/market/top-gainers
        - news/getHighlights() -> GET /api/news/highlights

      Side effects and implementation notes (observed in code)
      - LocalStorage: `localStorage.token` holds the JWT used by the axios interceptor (handled in `src/apiConfig.js`). Any changes to token must update localStorage and the auth context.
      - Timers / Autosave: `BlogEditorPage` uses an autosave timer (debounced setTimeout). If moved into centralized logic, ensure timers are cleaned up on unmounts.
      - Polling: `DashboardPage` polls posts every 30s. If centralized, prefer subscription/event websockets or a cache invalidation strategy to avoid duplicate network load.
      - File uploads: image compression and multipart/form-data uploads are handled inside the editor components before calling `uploadFile(formData)`.
      - Drag & Drop / client-only state: story thumbnails are stored in component state until saved — they include temporary File objects and preview URLs (be careful when serializing these). Temporary files must not be persisted directly to the global store without converting to server-side IDs.

      Testing & predictable side-effects
      - Keep side-effectful code (API calls, timers) in a small set of well-tested utilities or hooks (e.g., `usePosts`, `useAuth`) instead of sprinkling `apiConfig` calls across UI components.
      - For unit tests: mock `apiConfig` helpers and localStorage. For integration tests: consider a test server or request-mocking library.

      How to extend (practical migration/extension options)
      - Option A — Incremental Context + hooks (low friction)
        - Create focused contexts + hooks for feature areas (AuthContext is already present). Example additional contexts: PostsContext (provides posts list, fetchPage, fetchPost), CategoriesContext.
        - Move autosave and polling into these hooks so components consume declarative state and actions.
        - Pros: minimal dependency changes, easy to adopt incrementally.

      - Option B — React Query for server state (recommended for API-heavy apps)
        - Use React Query (TanStack Query) for caching, polling, mutations, optimistic updates, and automatic retries.
        - Replace ad-hoc get/fetch calls with queries/mutations (e.g., useQuery('posts', () => getPaginatedPosts(...))). Keep AuthContext for token storage and pass token via axios interceptors.
        - Pros: reduces manual loading/refresh logic, built-in cache invalidation, background refetching, devtools for debugging.

      - Option C — Zustand / Redux for local app state + React Query for server state
        - Keep server data in React Query; keep transient UI state (modals, drag state, thumbnail ordering) in a lightweight store like Zustand or in component state.
        - Use middleware for persistence (e.g., persist auth token) and for logging during dev.

      Edge cases & migration gotchas
      - Do not store File objects or DOM nodes in persistent global state — keep them local and convert them to server identifiers after upload.
      - When centralizing timers (autosave/polling), ensure unmount and navigation cleanup to avoid background saves after user left the editor.
      - Mind SSR/SEO: this is a CRA app (client-side). If you later migrate to SSR, move data-fetching logic into framework-compatible hooks.

      Quick checklist to improve state architecture (small phased plan)
      1. Audit all `apiConfig` usages and create a small set of domain hooks: `useAuth`, `usePosts`, `useCategories`.
      2. Introduce React Query and wrap calls in queries/mutations; migrate one screen (e.g., BlogPage) as a pilot.
      3. Move UI-only state (modals, toasts) to a small `ui` context or Zustand store.
      4. Replace polling with React Query background refetch or websockets where needed (dashboard).
      5. Add tests for hooks and contexts (happy + failure + edge cases) and mock `apiConfig`.


## Step 8 — Environment & Config

This section lists all environment variables, where they're used in the codebase, key config files to inspect, and a ready-to-copy `.env.example` you can use for local development.

### Env vars discovered in the repo

- REACT_APP_API_URL
  - Where used: `src/config.js` (fallback), referenced in docs and used by many components indirectly.
  - Purpose: development backend URL (example: `http://localhost:8080`). The app prefers `REACT_APP_API_URL` for local overrides.

- REACT_APP_API_BASE_URL
  - Where used: some pages (e.g., `src/pages/DashboardPage.js`) read this variable explicitly.
  - Purpose: an alternate base URL variable used in parts of the codebase. Keep it in sync with `REACT_APP_API_URL` unless a different value is intentional.

- REACT_APP_ALPHA_VANTAGE_API_KEY
  - Where used: `src/components/market/IndianMarketWidget.js` (reads `process.env.REACT_APP_ALPHA_VANTAGE_API_KEY`).
  - Purpose: external API key for Alpha Vantage used by market widgets.

- NODE_ENV
  - Where used: implicitly throughout (build/runtime). Standard values: `development` | `production`.

Important note: Create React App exposes only env vars that begin with `REACT_APP_` to the browser bundle. Use that prefix for any value the client needs at build time.

### `.env.example` (copy into `.env.local` or `.env`)

```
# Example environment variables for local development
# Copy to `.env.local` and edit — do NOT commit secrets or production keys.

REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_BASE_URL=https://backend.treishvaamgroup.com
REACT_APP_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Optional: dev server port override
# PORT=3001
```

Tips:
- After changing `.env.local` or `.env`, restart the dev server (`npm start`) to pick up the new vars.
- On PowerShell you can set a variable for a single command:

```powershell
$Env:REACT_APP_API_URL = 'http://localhost:8080'; npm start
```

- To persist an env variable in Windows for current user (requires new shell to take effect):

```powershell
setx REACT_APP_API_URL "http://localhost:8080"
```

### Key config files to inspect and recommended change

- `src/config.js` — small helper that currently reads `process.env.REACT_APP_API_URL || 'http://localhost:8080'` as a fallback. Good to keep as a single source of truth for local dev defaults.

- `src/apiConfig.js` — currently exports `export const API_URL = 'https://backend.treishvaamgroup.com';` and creates an axios instance with `baseURL: `${API_URL}/api``. Recommendation: change this to read from env at build time so the same code works across environments without source edits. Example:

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com';
```

- `postcss.config.js` and `tailwind.config.js` — CSS build configs used by the project.

- `public/_redirects` — hosting-level redirects for SPA fallback (important for client-side routing on Netlify/Vercel).

- `package.json` — check for a `proxy` field (not present currently) which can be used during development to proxy API calls without CORS changes.

### Security & deployment guidance

- Never commit secrets (API keys, passwords) into the repository. Use your CI/CD provider's secret store (GitHub Actions secrets, Netlify/Vercel environment variables) for production builds.
- Env vars used by the client are baked into the static bundle at build time. For per-environment builds, set the `REACT_APP_*` vars during the CI build step.
- If you need runtime-configurable endpoints without rebuilding, consider serving a `config.json` from `public/` and fetching it at app bootstrap (this requires code changes to support runtime config).

### Small recommended change (one-liner)

Replace the hard-coded API_URL in `src/apiConfig.js` with an env-aware version:

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com';
```

This keeps development and production configurations consistent and avoids changing source when switching environments.

## Step 9 — Testing & QA

This section lists the test commands, where tests live, coverage recommendations, and CI test step guidance.

- Test commands (PowerShell):

```powershell
# Install deps (if not already installed)
npm install

# Run interactive test runner
npm test

# Run tests once in CI mode
$Env:CI = 'true'; npm test -- --watchAll=false
```

- Test locations:
  - Unit / component tests (if present) are usually next to components or in a `__tests__` folder under `src/`.
  - Integration or page-level tests may be under `src/__tests__/` or `tests/` depending on repo conventions.

- Coverage:
  - Create React App can generate coverage using:

```powershell
$Env:CI = 'true'; npm test -- --coverage --watchAll=false
```

  - Coverage output will be in `coverage/` in the repo root. CI can fail builds if coverage drops below a threshold — add `--coverage` and a coverage reporter in CI if desired.

- CI guidance (example GitHub Actions step):

Add a job step that installs deps and runs tests; fail on any test failures. Example YAML snippet (GitHub Actions):

```yaml
- name: Install and test
  run: |
    npm ci
    npm test -- --watchAll=false
```

- Recommended quick QA checklist for PRs:
  - Run unit tests and ensure no new failures.
  - Run a smoke build (`npm run build`) and serve the `build/` locally to confirm static assets.
  - Manually test critical flows (login, create/edit post in editor, single post view) in a browser.

## Step 10 — Build & Deploy

Build commands, artifact locations, and a Docker snippet for local hosting.

- Build commands (PowerShell):

```powershell
# Install deps
npm install

# Build production bundle
npm run build
```

- Artifact path
  - The production build is generated in the `build/` directory. This folder contains `index.html`, static assets under `build/static`, and files suitable for static hosting.

- Local hosting for verification (serve):

```powershell
npx serve -s build -l 5000
# or using a simple Node static server
npx http-server build -p 5000
```

- Docker snippet (simple static frontend image)

Dockerfile (example):

```
# Use an official nginx image to serve the static build
FROM nginx:stable-alpine

# Copy build output to nginx html folder
COPY build/ /usr/share/nginx/html/

# Optional: copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build & run locally with Docker (PowerShell):

```powershell
npm run build
docker build -t treishvaam-frontend:latest .
docker run -p 8080:80 treishvaam-frontend:latest
```

Notes:
  - The `build/` folder is the artifact to deploy to static hosts (Netlify, Vercel, S3+CloudFront, static web servers).
  - If you use containerized CI, build the static bundle during the CI step and push the resulting image or artifact to your registry.

## Step 11 — VS Code Setup

Suggestions for editor setup, extensions, and recommended `.vscode` files to include in development (do not commit secrets).

- Recommended extensions:
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
  - GitLens (eamodio.gitlens)
  - EditorConfig (EditorConfig.EditorConfig)

- Example `.vscode/settings.json` (workspace-level suggestions):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact"],
  "files.exclude": {"node_modules": true}
}
```

- Example `.vscode/launch.json` for debugging the running dev server with Chrome (PowerShell / Windows):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome against localhost",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

Notes:
  - Do not commit workspace settings that contain machine-specific paths or secrets. Keep these files in `.vscode/` only if they are broadly useful for the team.

## Step 12 — Observability

Error logging, monitoring, and recommended observability practices for the frontend.

- Repo scan result: no `@sentry` or explicit Sentry initialization found in the codebase (no Sentry currently installed).

- Recommendations:
  - Add a lightweight error-reporting client such as Sentry for frontend error monitoring. Install `@sentry/react` and configure in `src/index.js` or a new `src/observability.js` initializer.

Example Sentry initialization (do not commit DSN):

```javascript
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

Add `REACT_APP_SENTRY_DSN` to your env config and ensure the DSN is injected via CI/CD or hosting provider.

- Client-side logging
  - Centralize non-fatal logging (console.warn/info) and optionally forward important logs to your observability backend via an HTTP collector.

- Performance & RUM
  - Consider adding Real User Monitoring (RUM) with Sentry or other RUM tools to capture page load, slow interactions, and slow network calls.

- Alerts & Dashboards
  - Configure alert rules (e.g., alert on increased uncaught exceptions, spike in error rates) in your observability provider. Tie alerts to Slack / email / PagerDuty as appropriate.

- Privacy & PII
  - Ensure you sanitize any user data before sending to observability backends and scrub sensitive fields (emails, tokens, full content) from reported payloads.

---

## Step 14 — Finalization

This finalization step adds a changelog entry with timestamp and a compact "Next Steps & TODOs" list for iterative updates.

### Changelog

- 2025-09-27  (UTC) — Added Steps 8–12 and Step 14 to the developer guide. Appended Observability, Testing, Build & Deploy, and VS Code setup sections.

### Next Steps & TODOs

- Finish Step 5 component-level docs for `src/components/` (per-component props, API usage, important hooks).
- Optionally apply the `API_URL` env change in `src/apiConfig.js` to use `process.env.REACT_APP_API_URL` (recommended).
- Add CI workflow (GitHub Actions) that runs `npm ci`, `npm test`, and `npm run build` on PRs to `main`.
- Consider introducing React Query and migrating `BlogPage` as a pilot for server-state caching.
- If adopting Sentry, add `REACT_APP_SENTRY_DSN` to CI secrets and a small `src/observability.js` initializer.

---




