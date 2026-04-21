# Treishvaam Finance - Enterprise Frontend

## Project Overview

This is the React-based frontend for the Treishvaam Finance Platform. It is designed to be served via **Cloudflare Pages** and utilizes a **Zero-Trust Security Architecture**.

Unlike traditional SPAs, this application **does not** hold any API keys or secrets. It relies entirely on a "Backend-for-Frontend" (BFF) pattern, where the Spring Boot backend acts as a secure proxy for all external data providers (NewsAPI, AlphaVantage, etc.).

## Security & Configuration (Zero Trust)

**Fort Knox Security Suite: ENABLED**
This project strictly follows the **12-Factor App** configuration methodology. All production URLs and Tracking IDs are hidden from the codebase and injected strictly at runtime.

### 1. Environment Variables
The application requires several variables to function correctly in a production environment. 

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | The URL of the Spring Boot Backend. | **Yes** |
| `REACT_APP_AUTH_URL` | The URL of the Keycloak Server. | **Yes** |
| `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXX`). | No |
| `REACT_APP_ADSENSE_CLIENT_ID` | Google AdSense Publisher ID (`ca-pub-XXX`). | No |
| `REACT_APP_GOOGLE_ADS_ID` | Google Ads Tracking ID (`AW-XXX`). | No |

### 2. Local Development Setup
To run this project locally, you must create a `.env` file in the root directory (this file is git-ignored for security).

1.  **Copy the template**:
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env`**:
    ```env
    REACT_APP_API_URL=http://localhost:8080
    REACT_APP_AUTH_URL=http://localhost:8080/auth
    ```
3.  **Start the App**:
    ```bash
    npm start
    ```

### 3. Production Deployment (Cloudflare)
We use **Cloudflare Pages** for hosting.
1.  **Push** your code to the `main` branch.
2.  **Go to Cloudflare Dashboard** -> Pages -> Settings -> Environment Variables.
3.  **Add the Production Variables** securely in the dashboard.
4.  **Redeploy** to apply changes.

## Architecture Highlights

* **Hybrid SSG (Materialized SEO)**: The application supports **"Publish-Time Materialization"**. For blog posts, the Backend generates a static HTML file. The Cloudflare Worker serves this file (Strategy A) for 100% SEO indexability.
* **0ms TBT Analytics Loading**: Google Analytics, Google Ads, and AdSense scripts are loaded via an **Interaction-Based Deferred Strategy** (`ThirdPartyScripts.js`). This ensures a 100/100 Lighthouse Performance score by preventing third-party code from blocking the main thread during bot crawls.
* **Zero-Flicker Rendering (Strategy B)**: If the static file is missing or the app is transitioning, the Frontend detects `window.__PRELOADED_STATE__`. It uses **`ReactDOM.createRoot`** (instead of `hydrateRoot`) to render the UI instantly from this state, avoiding common React Hydration Mismatches (Error #418) while delivering sub-second First Contentful Paint (FCP).
* **Optimistic Locking (Data Integrity)**: The application implements a strict "Version Handshake" with the backend. When editing a post, the frontend captures the database `version`. If another admin modifies the post concurrently, the save operation triggers a **409 Conflict**.
* **Enterprise SEO & Structured Data**: The application dynamically generates and injects **JSON-LD Structured Data** into the `<head>` for every page.
* **Static Asset Offloading (Nginx Bypass)**: Image *reads* (`/api/uploads/...`) are intercepted by Nginx and served directly from Storage, bypassing the Java application layer entirely.

## Key Directories

* `src/index.js`: **Critical.** Entry point implementing the "createRoot" rendering logic based on preloaded state.
* `src/components/ThirdPartyScripts.js`: **Critical.** Interaction-based loader for all active tracking scripts.
* `src/apiConfig.js`: **Critical.** Central configuration for API endpoints and Axios interceptors.
* `src/pages/BlogEditorPage.js`: **Critical.** Handles the complex state for post editing, including Optimistic Locking.
* `src/pages/SinglePostPage.js`: **Critical.** Handles the display of articles and the cleanup of static server content.
* `public/silent-check-sso.html`: **Critical.** A static file loaded by Keycloak in an iframe to enable silent token renewal.

## Commands

| Command | Description |
| :--- | :--- |
| `npm start` | Runs the app in development mode at `http://localhost:3000`. |
| `npm run build` | Builds the app for production to the `build` folder. |
| `npm test` | Launches the test runner. |

## License
Proprietary software. All rights reserved by Treishvaam Group.