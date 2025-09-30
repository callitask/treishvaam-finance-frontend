# State management

This project uses a lightweight approach: a small React Context for authentication plus local component state (useState/useEffect) and a few custom hooks. There is no Redux, MobX, NgRx, or other centralized store in this codebase.

Where the "store" lives
- `src/context/AuthContext.js` — the sole application-wide context provider. It exposes `auth`, `login`, `logout`, and `loading` via the `useAuth()` hook.
- Other shared logic lives in `src/hooks/` (e.g., `useCountdown.js`) and API helpers in `src/apiConfig.js` (axios instance injects auth token from localStorage).
- Most UI state is local to components (many `useState` usages across `src/pages/` and `src/components/`).

Top-level store shape (keys) and selectors
- Global context (AuthContext) shape (in code):

  - auth: { token: string | null, user: { email?: string } | null, isAuthenticated: boolean }
  - loading: boolean
  - login(email, password): async function → signs in and sets token
  - logout(): function → clears token and resets auth state

- Selector / hook:
  - `useAuth()` — returns { auth, login, logout, loading }

Common actions, dispatches and where side effects run
- Auth flow (side effects in context):
  - On mount AuthProvider reads `localStorage.token`, decodes JWT, validates expiry and sets `auth` and `isAuthenticated`.
  - `login(email,password)` performs `POST /auth/login` (via the axios instance), stores token in localStorage and updates `auth`.
  - `logout()` clears localStorage and resets `auth`.

- Component-level data fetching & side effects:
  - Pages/components fetch data in `useEffect` handlers (examples: `BlogPage` calls `getPaginatedPosts`, `SinglePostPage` calls `getPostByUrlId`). These are not centralized — each component manages loading/error/data locally with `useState`.
  - Admin flows rely on the auth token saved in localStorage; `src/apiConfig.js` attaches `Authorization: Bearer <token>` to outgoing requests via an axios request interceptor.

- No thunks/sagas/effects middleware are used. Side effects live in either Context (Auth) or inside components/hooks.

How to add new store slices or modules

Option A — Add a small Context (recommended for 1–3 small domains)
1. Create `src/context/<Feature>Context.js`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
const FeatureContext = createContext();
export const useFeature = () => useContext(FeatureContext);
export const FeatureProvider = ({ children }) => {
  const [state, setState] = useState(/* initial shape */);
  // side effects: fetch / subscribe
  useEffect(() => { /* load initial state */ }, []);
  const actions = { /* add functions to mutate or fetch */ };
  return <FeatureContext.Provider value={{ ...state, ...actions }}>{children}</FeatureContext.Provider>;
};
```
2. Wrap `FeatureProvider` around where it is needed — either in `src/index.js` (global) or near the route/layout that requires it (scoped providers keep scope small).
3. Export a `useFeature()` hook as the selector.

Option B — Introduce Redux Toolkit (recommended when app grows)
1. Install: `npm install @reduxjs/toolkit react-redux`
2. Create slices under `src/store/slices/` using `createSlice()` and combine them in `src/store/index.js` via `configureStore()`.
3. Provide `Provider` at app root (`index.js`) and prefer RTK Query for server state where appropriate.

Minimal notes when migrating to RTK:
- Keep AuthContext until you wire token support into Redux (or store only non-sensitive user info in Redux and keep token in secure storage).
- Use RTK Query for endpoints like `/posts`, `/news`, `/market/*` to reduce boilerplate for data fetching and caching.

If no centralized state is desired (current approach)
- The current approach (Context for auth + local component state) is valid and simple. Best practices:
  - Keep global state minimal (auth, feature flags, theming). Prefer local state for UI-only concerns (open/closed, form inputs, modals).
  - Extract reusable logic into custom hooks (e.g., usePosts, usePagination) that encapsulate fetch, loading, error, and transformations.
  - Memoize heavy derived values with `useMemo` and event handlers with `useCallback` to avoid unnecessary re-renders.
  - When multiple unrelated components need the same remote data, consider lifting the state to a common parent or introducing a small Context / RTK Query cache.

Quick checklist for adding a new shared state:
- Decide scope: global (wrap at root) vs scoped (wrap layout or route).
- Prefer a custom hook + Context for small domains.
- Use Redux Toolkit + RTK Query for server data with caching and normalized shapes when scale requires it.

Recommended starter pattern for new local domain (example `usePosts` hook)
1. Create `src/hooks/usePosts.js` that calls `getPaginatedPosts` and returns { posts, loading, error, loadMore }.
2. Use the hook in `BlogPage` and any other pages that need posts. This keeps fetching logic consistent while avoiding global state until necessary.

---

If you'd like, I can:
- Generate a small `src/context/FeatureContext.js` example wired into `index.js`.
- Scaffold a minimal Redux Toolkit store and one slice (e.g., `posts`) plus an example of wiring RTK Query.
