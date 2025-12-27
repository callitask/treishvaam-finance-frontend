# Session 9: Frontend Architecture

## 1. Application Entry & Boot

The application entry point is `src/index.js`. Here’s how the bootstrapping works:

- **Faro Observability**: The `initFaro` function (from `src/faroConfig.js`) is called before rendering. This initializes Real User Monitoring (RUM) using Grafana Faro, sending telemetry to the backend collector only in production or on the live domain.
- **Providers**: The app is wrapped in several providers:
  - `AuthProvider` (from `AuthContext.js`): Handles authentication and user session.
  - `HelmetProvider`: Manages changes to the document head for SEO and meta tags.
  - `BrowserRouter`: Enables client-side routing.

## 2. Routing Strategy (`App.js`)

- **Route Hierarchy**:
  - **Public Routes**: Wrapped in `MainLayout`. Includes `/`, `/about`, `/vision`, `/contact`, `/market/:ticker`, `/login`, and blog/category routes.
  - **Private Admin Routes**: All `/dashboard` routes are wrapped in `DashboardLayout` and protected by the `PrivateRoute` component.

- **Lazy Loading & Suspense**:
  - Pages like `BlogPage`, `DashboardPage`, and others are loaded using `React.lazy` and rendered inside a `Suspense` boundary with a custom loader. This improves performance by code-splitting and only loading code when needed.

- **PrivateRoute Logic**:
  - The `PrivateRoute` component checks authentication state (from `AuthContext`). If the user is not authenticated, it redirects to `/login`.

## 3. Authentication & Security

- **Session Management**: `AuthContext.js` uses Keycloak for authentication. It initializes Keycloak, manages login state, and stores the JWT token.
- **Dynamic Configuration**: The Keycloak Authority URL is loaded from `process.env.REACT_APP_AUTH_URL`. This allows the app to switch between Dev/Stage/Prod Identity Providers without code changes.
- **Keycloak Integration**: The app is configured to use Keycloak for OAuth2 flows. Login is handled via redirect; the `login` function in `apiConfig.js` is deprecated and always rejects.
- **API Interceptor**: In `apiConfig.js`, an Axios interceptor attaches the Bearer token (from Keycloak) to all outgoing API requests.

## 4. State Management

- **Context Providers**:
  - `AuthContext`: Manages authentication and user info.
  - `ThemeContext`: Handles theme (light/dark) state.
  - `WatchlistContext`: Manages the user's market watchlist.
- These providers are composed at the top level in `App.js`, making their state available throughout the app.

## 5. API Layer

- **Abstraction**: `apiConfig.js` exports an Axios instance. The base URL is dynamically determined by `process.env.REACT_APP_API_URL` (configured in Cloudflare Pages), ensuring the frontend always talks to the correct backend environment.
- **Endpoints**: Grouped by domain (Blog/Posts, Files/Categories, Auth, Market, News, etc.).
- **Token Handling**: The `setAuthToken` function is called by `AuthContext` to update the token used by the Axios instance.

## 6. Zero Trust Configuration Strategy

The application follows the **12-Factor App** methodology for configuration:
- **No Hardcoded URLs**: Backend and Auth URLs are strictly absent from the source code.
- **Environment Injection**:
    - **Local Dev**: Read from a git-ignored `.env` file.
    - **Production**: Read from **Cloudflare Pages Environment Variables**.
- **Security**: This prevents accidental leakage of internal URLs and allows "Build Once, Deploy Anywhere" workflows.

---

This architecture ensures a clear separation of concerns, secure authentication, scalable routing, and robust observability for the frontend React application.