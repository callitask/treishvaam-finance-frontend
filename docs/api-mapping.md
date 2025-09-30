# API mapping: component → backend endpoints

This document maps frontend components/pages to backend HTTP calls discovered in the codebase. It lists method, URL template (relative to the base API), inferred request body (when applicable), an estimated response shape (where visible), and the probable authentication requirement.

Base API / auth behaviour
- Base API URL (from `src/apiConfig.js`): `https://backend.treishvaamgroup.com/api`
- Request interceptor: if `localStorage.token` exists, the axios instance attaches `Authorization: Bearer <token>` to all requests. That means any `api.*` helper may run with auth if a token is present in localStorage.

Notes on inference
- Auth required? — marked `Yes` for endpoints under admin paths (e.g., `/posts/admin/*`, `/market/admin/*`) or when used from pages/components guarded by `PrivateRoute` / admin flows. Public pages use public endpoints and are usually `No`.
- Response shape — pulled from how components use `response.data` and property accesses (fields like `title`, `content`, `createdAt`, etc.). These are inferred and may be incomplete.

---

1) src/pages/BlogPage.js (Blog listing / home)
- Calls:
  - GET /posts?page={page}&size={size}
    - Helper: `getPaginatedPosts(page, size)` → `api.get(`/posts?page=${page}&size=${size}`)`
    - Request: query params `page`, `size`
    - Response (inferred): { data: [ { id, title, userFriendlySlug, urlArticleId, thumbnailUrl, createdAt, featured, category: { slug }, ... } ], meta?: { total, page, size } }
    - Auth required: No (used on public blog listing)
  - GET /categories
    - Helper: `getCategories()` → `api.get('/categories')`
    - Response (inferred): array of category objects { id, name, slug }
    - Auth required: No
  - GET /market/top-gainers, /market/top-losers, /market/most-active
    - Helpers: `getTopGainers()`, `getTopLosers()`, `getMostActive()`
    - Response: arrays of market item objects { symbol, change, percent, price, volume }
    - Auth required: No

2) src/pages/SinglePostPage.js (Article detail)
- Calls:
  - GET /posts/url/{urlArticleId}
    - Helper: `getPostByUrlId(urlArticleId)` → `api.get(`/posts/url/${urlArticleId}`)`
    - Response (inferred): post object with fields used in UI:
      - title, content, contentWithIds (created client-side), coverImageUrl, coverImageAltText, createdAt, updatedAt, author, category: { slug }, userFriendlySlug, urlArticleId, metaDescription, customSnippet, keywords, tags
    - Auth required: No

3) src/pages/HomePage.js
- Calls:
  - GET /api/posts  (NOTE: `HomePage` uses `api.get('/api/posts')` — this appears in code; because the axios instance baseURL already contains `/api` this may produce `/api/api/posts`. The call is present in source and documented here as-is.)
    - Called via `api.get('/api/posts')`
    - Response (inferred): array of posts similar to `/posts` above
    - Auth required: No

4) src/pages/BlogEditorPage.js (Admin editor)
- Calls:
  - GET /posts/{id}
    - Helper: `getPost(id)` → `api.get(`/posts/${id}`)`
    - Auth required: Yes (editor is in dashboard/admin flow)
  - POST /posts (multipart/form-data)
    - Helper: `createPost(formData)` → `api.post('/posts', formData, { 'Content-Type': 'multipart/form-data' })`
    - Request body (inferred): multipart form with fields like title, content, tags, coverImage file
    - Response: created post object
    - Auth required: Yes
  - PUT /posts/{id} (multipart/form-data)
    - Helper: `updatePost(id, formData)`
    - Auth required: Yes
  - POST /files/upload (multipart/form-data)
    - Helper: `uploadFile(formData)` — used by editor to upload images
    - Response (inferred): { url | path | filename }
    - Auth required: Yes
  - GET /categories, POST /categories
    - Helpers: `getCategories()`, `addCategory(data)` — used to populate category select and add categories
    - Auth required: likely Yes for addCategory, No for getCategories (used publicly elsewhere)
  - POST /posts/draft and PUT /posts/draft/{id}
    - Helpers: `createDraft`, `updateDraft`
    - Auth required: Yes

5) src/pages/ManagePostsPage.js (Admin post management)
- Calls:
  - GET /posts/admin/all
    - Helper: `getAllPostsForAdmin()`
    - Response: array of posts (admin view with extra metadata)
    - Auth required: Yes
  - GET /posts/admin/drafts
    - Helper: `getDrafts()`
    - Auth required: Yes
  - DELETE /posts/{id}
    - Helper: `deletePost(id)`
    - Auth required: Yes
  - DELETE /posts/bulk (body: ids array)
    - Helper: `bulkDeletePosts(ids)` → `api.delete('/posts/bulk', { data: ids })`
    - Auth required: Yes
  - POST /posts/{id}/duplicate
    - Helper: `duplicatePost(id)`
    - Auth required: Yes

6) src/context/AuthContext.js & src/pages/LoginPage.js (Auth flow)
- Calls:
  - POST /auth/login
    - Helper: `login(credentials)` in `apiConfig` or `api.post('/auth/login', { email, password })` in `AuthContext`
    - Request body: { email, password }
    - Response: { token: <jwt>, ...maybe user data }
    - Auth required: No (this is the authentication endpoint)
  - Logout: frontend-only (removes token from localStorage)

7) src/pages/DashboardPage.js
- Calls:
  - GET /posts/admin/all (same as ManagePosts)
    - Helper: `getAllPostsForAdmin()`
    - Auth required: Yes

8) src/pages/ContactPage.js
- Calls:
  - GET /contact/info
    - Called via `api.get('/contact/info')`
    - Response (inferred): contact metadata (phone, email, addresses)
    - Auth required: No
  - POST /contact
    - Called via `api.post('/contact', formData)`
    - Request body: { name, email, message, ... }
    - Auth required: No

9) src/components/SearchAutocomplete.js
- Calls:
  - GET /search?q={query}
    - Helper: `searchPosts(query)` → `api.get(`/search?q=${query}`)`
    - Response: array of matching post summaries
    - Auth required: No

10) src/components/NewsHighlights.js and src/components/DeeperDive.js
- Calls:
  - GET /news/highlights
    - Helper: `getNewsHighlights()`
    - Response: array of news items
    - Auth required: No
  - GET /news/archive
    - Helper: `getArchivedNews()` (used by `DeeperDive`)
    - Auth required: No

11) src/components/ApiStatusPanel.js
- Calls (admin operations / status):
  - GET /status/history
    - Helper: `getApiStatusHistory()`
    - Auth required: No (status history may be public), but component lives in admin pages so it may require auth depending on backend
  - POST /market/admin/refresh-movers
    - Helper: `refreshMovers()`
    - Auth required: Yes (admin action)
  - POST /market/admin/refresh-indices
    - Helper: `refreshIndices()`
    - Auth required: Yes
  - POST /market/admin/flush-movers, /market/admin/flush-indices (body: { password })
    - Helpers: `flushMovers(password)`, `flushIndices(password)`
    - Auth required: Yes (sensitive admin operations)

12) Market components (src/components/market/*)
- Calls:
  - GET /market/top-gainers, /market/top-losers, /market/most-active
    - Helpers: `getTopGainers()`, `getTopLosers()`, `getMostActive()`
    - Auth required: No
  - GET /market/historical/{ticker}
    - Helper: `getHistoricalData(ticker)`
    - Auth required: No
  - External: `IndianMarketWidget.js` calls AlphaVantage directly via axios GET to `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={apiKey}` — external API key used in code: auth required by AlphaVantage (apikey query param)

13) File upload and media
- Calls:
  - POST /files/upload (multipart/form-data) — `uploadFile(formData)` used by `BlogEditorPage`, `ImageCropUploader`, `StoryThumbnailManager`
  - Response (inferred): { filename | path | url }
  - Auth required: Yes (upload endpoints are used in admin flows)

14) Categories & admin creation
- Calls:
  - POST /categories — `addCategory(data)`
    - Auth required: Yes (creating categories is an admin action)

15) Misc / notes
- There are a few raw `api.get()` / `api.post()` calls done directly (for example in `ContactPage.js` and in `HomePage.js`), plus the axios instance in `apiConfig.js` which centralizes auth header injection.
- Any call made via the `api` instance will automatically include Authorization header when `localStorage.token` is set.

---

Example curl commands

- Login (replace email/password):

```bash
curl -X POST "https://backend.treishvaamgroup.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

- Fetch public posts (page 0, size 9):

```bash
curl "https://backend.treishvaamgroup.com/api/posts?page=0&size=9"
```

- Fetch a single post by URL id (example urlArticleId = abc123):

```bash
curl "https://backend.treishvaamgroup.com/api/posts/url/abc123"
```

- Admin: fetch all posts (requires token)

```bash
curl "https://backend.treishvaamgroup.com/api/posts/admin/all" \
  -H "Authorization: Bearer YOUR_JWT_HERE"
```

- Upload file (multipart/form-data, requires token)

```bash
curl -X POST "https://backend.treishvaamgroup.com/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  -F "file=@/path/to/image.jpg"
```

External third-party example (AlphaVantage used by `IndianMarketWidget`):

```bash
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=RELIANCE.NS&apikey=YOUR_ALPHA_VANTAGE_KEY"
```

---

How to use this doc
- Use this mapping when you need to: audit endpoints, add tests that mock backend calls, update auth flows, or generate API contract tests. If you change endpoints in the backend, update `src/apiConfig.js` first and then update this document.

If you want, I can: generate an OpenAPI-like summary (YAML) from these endpoints, create mock handlers for MSW (Mock Service Worker) for front-end testing, or fill in precise request/response schemas by inspecting backend docs or sample responses.
