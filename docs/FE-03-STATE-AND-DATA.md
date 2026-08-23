# FE-03 — State & Data Management (Client State, API Consumption, Real-Time Data)

**Project:** `treishvaam-finance-frontend`
**Classification:** Internal — Engineering Reference
**Verified against:** `src/context/AuthContext.js`, `ThemeContext.js`, `WatchlistContext.js`, `FloatingDockContext.js`, `src/hooks/useManagePosts.js`, `src/apiConfig.js` (per FIN-02 §9), market/news component imports, Enterprise Architecture Strategy §8 (bridge contract specification) — **and re-verified directly against the repository on 2026-08-23** (corrections: no 401 response interceptor exists; base-URL fallback is hardcoded; 4 endpoint paths fixed; provider tree fixed; WebSocket question closed — none exists).

---

## 1. State Philosophy

The application deliberately avoids heavyweight state libraries (no Redux/Zustand/tanstack-query in the dependency tree). State is partitioned into:

1. **Server-adjacent state** — fetched via a single Axios instance (`apiConfig.js`), held in local component state.
2. **Cross-cutting client state** — five React Contexts mounted by `app/providers.tsx`.
3. **Persistent local state** — `localStorage` (preferences, watchlist) and `sessionStorage` (auth circuit breakers).
4. **Edge/CDN state** — KV + cache tiers owned by the Worker (FE-02 §8–9).

## 2. Provider Architecture

```mermaid
flowchart TD
    LAYOUT["app/layout.tsx — Server Component (Edge)"] --> PROVIDERS["app/providers.tsx — use client"]
    PROVIDERS --> AUTH["AuthProvider<br/>Keycloak OIDC lifecycle · tokens · roles"]
    PROVIDERS --> THEME["ThemeProvider<br/>color-theme @ localStorage"]
    PROVIDERS --> WATCH["WatchlistProvider<br/>user-watchlist @ localStorage"]
    SINGLEPOST["SinglePostPage (client)"] --> ANNOT["AnnotationContext<br/>reader tools — mounted inside the page, not the root tree"]
    DOCKDEAD["FloatingDockContext — ⚠ NEVER MOUNTED anywhere;<br/>EnterpriseVideoPlayer consumes the default context value"]
```

| Context | Persistence | Exposed API | Hydration Pattern |
| :--- | :--- | :--- | :--- |
| `AuthContext` | keycloak-js token store + `sessionStorage` breakers | `{ auth: { user, isAuthenticated, token, fatalError, fatalErrorMsg }, login, logout, loading }` | `loading: true` initial; global singleton shield for remounts |
| `ThemeContext` | `localStorage['color-theme']` | `{ theme, toggleTheme }` | deterministic `'light'` initial; localStorage read post-mount |
| `WatchlistContext` | `localStorage['user-watchlist']` | `{ watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist }` | deterministic `[]`; JSON.parse post-mount |
| `AnnotationContext` | In-memory (session-scoped reader tools) | tools, highlights, strokes, undo/redo stacks, notes, typography, audio state | consumer components use `mounted` shields |
| `FloatingDockContext` | In-memory | `{ pinnedVideos, pinVideo, unpinVideo }` + portal container | `mounted` shield; native Pointer Events dragging (no drag library — bundle-size mandate) |

## 3. API Consumption Layer — `src/apiConfig.js`

Single Axios instance; all backend communication flows through it.

- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` **with a hardcoded fallback** `'https://backend.treishvaamgroup.com'` (`apiConfig.js:20`; same pattern in `faroConfig.js:38`, `aegis-biometrics.ts:91`, the GEO route handlers, and the two `generateMetadata` pages — *corrected 2026-08-23: earlier "never hardcoded" contradicted FE-04 §10's own rule; the fallback exists and is real*).
- **Auth attachment:** Keycloak JWT attached as `Authorization: Bearer <token>` via a **request interceptor** (`setAuthToken`, `apiConfig.js:33-41`). **Correction 2026-08-23:** there is **no response interceptor, no 401 handling, no retry** — token refresh happens exclusively on the unconditional 60 s `updateToken(70)` interval (`AuthContext.js:465-482`); a 401 between refresh ticks simply surfaces as an error to the caller.
- **Tenant isolation:** server-side and Worker-initiated fetches carry `X-Tenant-ID: finance` (Worker-injected on all proxied browser calls; the category SSR page sets it explicitly — the GEO handlers currently do **not**); browser-originated calls reach the backend through the Worker proxy, which injects/validates tenant + signature headers (FE-02 §5).

### 3.1 Verified API Function Catalogue (by import evidence)

| Function | Consumed by | Domain |
| :--- | :--- | :--- |
| `setAuthToken`, `getUserProfile` | `AuthContext` | Auth / profile enrichment |
| `searchPosts` | `SearchAutocomplete` | Search (Elasticsearch-backed **`/api/v1/search?q=`** — *corrected 2026-08-23; no `/search/query` route exists*) |
| `getNewsHighlights`, `getArchivedNews` | `NewsTabMobile`, news widgets | News |
| `getMostActive`, `getTopGainers`, `getTopLosers` | `MarketSlideMobile`, `TopMoversCard` | Market |
| `getAllPostsForAdmin`, `getDrafts`, `getCategories` | `useManagePosts` | Admin content |
| `deletePost`, `duplicatePost`, `bulkDeletePosts` | `useManagePosts` | Admin mutations |
| Blog CRUD, analytics, file upload, market detail functions | per FIN-02 §9 | Broad (exact signatures: `CROSS-SYSTEM-CONTEXT.md`) |

### 3.2 Direct Endpoint References (verified in components/docs)

**Corrected list 2026-08-23 (each verified in `apiConfig.js` / consumers):** `/api/v1/analytics` + `/api/v1/analytics/filters` (AudiencePage — **no `/analytics/realtime` endpoint exists in the codebase**) · `/api/v1/status/history` (ApiStatusPage — **not** `/api/v1/status`) · `/api/v1/files/upload` · `/api/v1/search?q=` (autocomplete triggers at `q.length > 1`) · `/api/v1/market/news/highlights` (newshighlight widgets — the `/api/v1/news-highlights/ticker` path never existed; note `LoginPage.js:59` separately calls `${apiUrl}/api/news-highlights`, missing `/v1`) · `/api/v1/aegis/telemetry` · `/api/v1/aegis/tarpit/trap` (Worker rewrite only — no backend handler, OP-05) · `/api/v1/uploads/...` (media; ⚠ `BlogEditorPage.js:164,178` builds `/api/uploads/...` missing `/v1` for previews — OP-19) · `/api/public/geo/*` · `/api/public/sitemap/*`.

## 4. Bridge Contract Mapping (`CROSS-SYSTEM-CONTEXT.md`)

The bridge file is the canonical source for payload schemas. Mapping of its contract surface to frontend implementation:

| Bridge Contract Item | Frontend Implementation | Status |
| :--- | :--- | :--- |
| `X-AEGIS-Signature` / `X-AEGIS-Timestamp` (HMAC-SHA-512) | **Corrected 2026-08-23:** the Worker is the primary signer — but **not** the exclusive one. The Next.js server layer also signs with the same `AEGIS_EDGE_SECRET`: the category article page signs the correct 3-part payload with `clientIp='127.0.0.1'` + `X-Aegis-Edge-Timestamp` (valid), while the three GEO route handlers (`app/llms.txt|ai-feed.md|ontology.json/route.ts:32,48-50`) sign **2-part** (`path:timestamp`) with header **`X-Aegis-Timestamp`** — guaranteed 403 against the backend filter (backend OP-18; their KV-first fallbacks currently mask it). Browser code itself never signs | ⚠ Open (OP-18) |
| `X-Request-ID` (UUIDv4) | **Resolved 2026-08-23:** generated server-side by the backend's `RequestIdFilter` (backend BE-01 §5); neither the Worker nor the frontend emits it | ✅ Closed |
| `Authorization: Bearer JWT` | Axios interceptor via `setAuthToken()` | ✅ Verified |
| `POST /api/v1/auth/login` · `POST /api/v1/auth/refresh` | Not called directly — token acquisition/refresh handled by `keycloak-js` OIDC (realm `treishvaam`, client `finance-app`) against the Keycloak IdP that fronts these flows | ✅ Verified (equivalent flow, see FE-04) |
| HttpOnly Strict Cookies | Keycloak session cookies are HttpOnly (IdP-managed); API auth uses Bearer headers | ✅ Verified — analysis in FE-04 §3 |
| `GET /api/v1/market/quote` · `GET /api/v1/market/history` | Market widgets via `apiConfig` functions (`getMostActive`, `getTopGainers`, `getTopLosers`, index/chart data) | ✅ Verified at function level; endpoint mapping per bridge |
| WebSocket `/ws/market` | Channel defined by the bridge **spec only** — market components consume **REST** polling (no WS client exists) | ✅ Closed 2026-08-23: no WebSocket implementation exists in either codebase |
| `GET /api/v1/posts` · `GET /api/v1/posts/{slug}` | Blog feed + `SinglePostPage` fetch flows | ✅ Verified behaviorally |
| `POST /api/v1/posts` (Admin + ZKP) | BlogEditor publish flow (`PublishPanel`, `version` optimistic lock) | ✅ Publish flow verified; ZKP is server-enforced — no client proof generation in provided code (FE-04 §2.1) |

## 5. Data Fetching Patterns (Canonical Examples)

1. **Debounced search** — `SearchAutocomplete`: 300 ms debounce, >1 char, keyboard-navigable results, navigates to `/category/{catSlug}/{userFriendlySlug}/{urlArticleId}`.
2. **Parallel independent fetches with isolated failure containment** — `NewsTabMobile`: highlights and archive fetched with individual `.catch()` so one failure never blocks the other.
3. **Batch admin fetch** — `useManagePosts`: `Promise.all([getAllPostsForAdmin(), getDrafts(), getCategories()])`, then Map-dedup by `id` merging posts + drafts.
4. **Optimistic mutations** — delete/bulk-delete filter local state immediately; duplicate triggers full refetch.
5. **Derived data memoization** — filtering, search, sorting, and pagination computed in `useMemo` over raw data; URL hash (`#drafts`/`#scheduled`/`#published`) mirrors view state.
6. **Post-hydration enrichment** — `AuthContext.syncProfileData()`: Keycloak claims first, then `getUserProfile()` overlay (display name) + Faro user instrumentation.

## 6. Real-Time & Streaming Data

| Channel | Mechanism | Notes |
| :--- | :--- | :--- |
| Market REST | Polling via `apiConfig` functions; auto-refreshing summary widgets | Verified |
| WebSocket `/ws/market` | **Resolved 2026-08-23 — no WebSocket exists anywhere** (confirmed in both codebases; backend BE-04 §1 documents "WebSocket: none"). The bridge spec's `/ws/market` channel was never implemented; market data is REST polling only (quotes/watchlist 30 s, news 60 s) and RabbitMQ `market.data.ticks` does not exist (real topology: `internal.exchange`/`internal.queue` for `MARKET_UPDATE`, `aegis.threat.exchange`, `video.transcode.queue`) | ✅ Closed |
| HLS video | `hls.js` in `EnterpriseVideoPlayer`; `SmartMediaRenderer` locks grid/cover contexts to **360p** renditions (`master|1080p|720p|480p.m3u8 → 360p.m3u8`) for bandwidth economics | Verified |
| Multi-PiP | `FloatingDockContext` portals with native Pointer Events | Verified |

## 7. Client-Side Cache & Persistence Map

| Store | Keys | Purpose |
| :--- | :--- | :--- |
| `localStorage` | `color-theme`, `user-watchlist` | Preferences |
| `sessionStorage` | `kc_silent_sso_failed`, `kc_fatal_loop_breaker`, `kc_fatal_error_msg`, `kc_auth_retry`, `kc_login_lock_time`, `kc-*` (adapter keys) | Auth circuit breakers (FE-04 §6) |
| Service Worker (Serwist) | API `NetworkFirst` · static `CacheFirst` · HTML `StaleWhileRevalidate` | Offline/PWA (FE-01 §7.3) |
| Edge KV / CDN | `geo:finance:*`, `sitemap:finance:*`, `aegis:*` | Owned by Worker (FE-02) |
| Redis (backend) | market cache (TTL 1 h), token buckets, MTD keys (TTL 5 m) | Cross-ref BE-05 |

## 8. Error Handling & Degradation Doctrine

- **Guest-mode degradation:** auth failure never blocks content — public browsing is fully functional unauthenticated (verified: 25 s auth timeout → guest mode).
- **Fail-soft fetches:** news/archive failures return `{ data: [] }` rather than blank screens.
- **Telemetry:** unhandled exceptions and network errors stream to Grafana Faro; Web Vitals reported via `WebVitalsTracker`.
- **Auth hard-halt:** genuine cryptographic validation failures render a diagnostic halt screen instead of looping (FE-04 §6).
