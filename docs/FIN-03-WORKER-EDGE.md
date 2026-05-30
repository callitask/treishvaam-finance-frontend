# FIN-03 — Edge Worker & SEO Architecture

**Project:** `treishvaam-finance-frontend`
**Worker Name:** `treishfin-seo-worker`
**Route:** `treishvaamfinance.com/*`
**Classification:** Internal Reference (Sanitized — No KV IDs, No Signing Keys)
**Last Verified:** 2026-05-29 — All claims verified against actual `worker/worker.js` (616 lines) and `worker/wrangler.toml`

---

## 1. Overview

The `treishfin-seo-worker` is the **sole entry point** for all HTTP traffic to `treishvaamfinance.com`. Every request — human user, search engine crawler, or AI LLM agent — passes through this Worker before any Next.js page or Spring Boot API is contacted.

The Worker is a **616-line, single-file Cloudflare Worker** running in a V8 isolate. It performs six concurrent roles:

| Role | Description |
| :--- | :--- |
| **Zero-Trust API Proxy** | HMAC-SHA-512 signs all backend requests; injects tenant headers |
| **AEGIS L4-ADA Checkpoint** | Reads KV threat manifests; blocks or tarpits malicious IPs/JA3 hashes |
| **GEO Router** | Intercepts LLM crawlers; serves KV-cached semantic payloads; bypasses React entirely |
| **SEO Intelligence Layer** | Injects JSON-LD schemas via `HTMLRewriter`; prevents SPA 404 SEO penalties |
| **Cron Cache Warmer** | Hourly proactive KV sitemap refresh via `scheduled()` handler |
| **Asset & Static Proxy** | Passes static assets through with appropriate `Cache-Control` headers |

---

## 2. Worker Files

```
worker/
├── worker.js       ← Main Worker logic (all logic in one file — Cloudflare Workers constraint)
└── wrangler.toml   ← Worker config: KV bindings, cron triggers, route, environment
```

**Deployment command (ONLY when `worker.js` or `wrangler.toml` changed):**
```powershell
cd "C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\worker"
npx wrangler deploy
```

**Manual cache refresh (production emergency):**
```
GET https://treishvaamfinance.com/sys/force-update
```
This endpoint triggers `this.scheduled()` immediately — forces KV sitemap refresh without waiting for the hourly cron.

---

## 3. Wrangler Configuration (`wrangler.toml` — verified)

```toml
name = "treishfin-seo-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "TREISHFIN_SEO_CACHE"
# Production KV ID: 8e80f838...  (managed via Cloudflare dashboard — never hardcode)

[[kv_namespaces]]
binding = "AEGIS_THREAT_KV"
# Production KV ID: 87e18923...  (managed via Cloudflare dashboard — never hardcode)

[triggers]
crons = ["0 * * * *"]    # Hourly sitemap cache warmer

[vars]
NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY = "false"
```

**Worker Secrets** (injected via `npx wrangler secret put` — NEVER in `wrangler.toml`):

| Secret | Purpose |
| :--- | :--- |
| `AEGIS_EDGE_SECRET` | HMAC-SHA-512 seed for `generateEdgeSignature()`. Must match backend `AEGIS_EDGE_SECRET` exactly |
| `BACKEND_API_URL` | Cloudflare Tunnel URL to Spring Boot backend |
| `BACKEND_URL` | Fallback alias; used if `BACKEND_API_URL` is absent |

---

## 4. Global Crawler Matrix (Compiled Once Per V8 Isolate)

The Worker compiles two RegExp objects **once at module load time** — zero per-request regex compilation overhead:

**`GLOBAL_CRAWLER_MATRIX`** — all verified ecosystem bots:

| Category | Bots |
| :--- | :--- |
| Search Engines | Googlebot, Bingbot, Slurp, DuckDuckBot, Baiduspider, YandexBot, Sogou, Exabot, SeznamBot |
| Google Ecosystem | Google-Extended, Googlebot-News, Googlebot-Image, Googlebot-Video, Google-Read-Aloud, Storebot-Google, APIs-Google, AdsBot-Google, Mediapartners-Google |
| AI & LLMs | GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, MetaExternalAgent, Amazonbot, Applebot, Applebot-Extended, PerplexityBot, DeepSeek, Bytespider, Qwen, Mistral, YouBot, Cohere-training, Diffbot |
| Social & Unfurl | Twitterbot, facebookexternalhit, LinkedInBot, Slackbot, Discordbot, TelegramBot, WhatsApp, Pinterestbot, Redditbot |
| News & Feeds | flipboard, feedly, NewsBlur, Inoreader, PocketParser, PaperLiBot, WordPress, Tumblr |
| Archivers & Academic | ia_archiver, archive.org_bot, Wikipedia, SemanticScholarBot |
| Internal | Treishvaam-Worker-Crawler |

**`aiBotsOnly`** — subset for GEO interception (AI/LLM agents only):
GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, MetaExternalAgent, Amazonbot, Applebot, Applebot-Extended, PerplexityBot, DeepSeek, Bytespider, Qwen, Mistral, YouBot, Cohere-training, Diffbot

**Critical rule:** Verified crawlers in `GLOBAL_CRAWLER_MATRIX` **bypass AEGIS threat evaluation entirely** to preserve site indexability. AI bots in `aiBotsOnly` are additionally routed to GEO payloads instead of React HTML.

---

## 5. HMAC-SHA-512 Edge Signing — `generateEdgeSignature()`

**This is the most critical security function in the Worker.** Every request forwarded to the backend must carry a valid AEGIS Edge Signature.

```
Signature = HMAC-SHA-512(
    key:  AEGIS_EDGE_SECRET,
    data: `${pathname}:${timestamp}:${clientIp}`
)
→ Hex-encoded into X-Aegis-Edge-Signature header
→ Unix epoch (seconds) into X-Aegis-Edge-Timestamp header
```

**Centralized helper (critical — do not inline):** `generateEdgeSignature(path, timestamp, ip, secret)` is a shared async function called by:
- The main `fetch()` handler for every forwarded request
- The `scheduled()` cron handler
- The `handleGeoFeedFromKV()` function on KV cache miss
- The `handleDynamicSitemapFromKV()` function on KV cache miss
- SEO intelligence hydration calls (`/category/`, `/market/` SSR data)

**Why centralized matters (IMMUTABLE history):** Previously, the cron and cache-miss paths were signing stale/incorrect paths, causing 403 Forbidden rejections at `AegisEdgeValidationFilter`. The centralized helper was the fix — do not re-inline or duplicate signature logic.

**WebCrypto note:** WebCrypto API supports SHA-512 natively but not SHA3-512. HMAC-SHA-512 is used at the Edge. The backend `AegisEdgeValidationFilter` is built with BouncyCastle and accepts HMAC-SHA-512. This is a documented and accepted asymmetry.

---

## 6. Request Processing Flow (Complete)

```
Incoming Request to treishvaamfinance.com
      │
      ├─ /sys/force-update → triggers scheduled() immediately → 200 OK
      │
      ▼
Resolve User-Agent:
  isVerifiedCrawler = GLOBAL_CRAWLER_MATRIX.test(UA)
  isAiBot           = aiBotsOnly.test(UA)
  clientIp          = CF-Connecting-IP header
      │
      ▼
KV Threat Lookup (if NOT verified crawler):
  1. Read aegis:mtd:manifest from AEGIS_THREAT_KV (MTD path translation map)
  2. Read aegis:block:{clientIp} from AEGIS_THREAT_KV
     ├─ BLOCK marker → instant 403 JSON response (Cache-Control: no-store)
     └─ TARPIT marker → reroute to /api/v1/aegis/tarpit/trap on backend
      │
      ▼
MTD Path Translation (API paths only):
  If isTarpit → targetPath = /api/v1/aegis/tarpit/trap
  Else if mtdManifest[targetPath] exists → translate path
      │
      ▼
Inject Standard Headers:
  X-Visitor-City, X-Visitor-Country  (from Cloudflare cf object)
  X-Tenant-ID: finance
  X-Aegis-Edge-Signature              (HMAC-SHA-512 of translated pathname)
  X-Aegis-Edge-Timestamp              (Unix epoch string)
      │
      ├─ isAiBot + GET + not asset/API/llms.txt/ontology.json
      │      └─ handleGeoFeedFromKV(request → /ai-feed.md)  [AGGRESSIVE GEO INTERCEPT]
      │
      ├─ pathname = /llms.txt | /ai-feed.md | /ontology.json
      │      └─ handleGeoFeedFromKV()
      │
      ├─ pathname starts with /sitemap-dynamic/
      │      └─ handleDynamicSitemapFromKV()
      │
      ├─ pathname = /robots.txt
      │      └─ fetch(static asset) → addSecurityHeaders()
      │
      ├─ pathname starts with /api/
      │      ├─ Image/upload paths → CDN Cache → Backend
      │      └─ All other API → proxy to backend (MTD-translated path)
      │
      ├─ Static asset (extension match)
      │      └─ fetch(static) → addSecurityHeaders()
      │
      └─ All other paths (HTML pages):
             isRscRequest = RSC/Next-Router-Prefetch/Next-Url/text/x-component headers
             │
             ├─ Fetch from Cloudflare Pages (Next.js)
             ├─ SPA fallback: 404/403 on known route → serve /index.html with 200
             ├─ Cache successful responses (public, max-age=600)
             ├─ On 5xx: serve CDN cache if available
             │
             └─ SEO Intelligence (if NOT isRscRequest):
                    ├─ / or /home → WebSite JSON-LD schema + GEO discovery links
                    ├─ /about, /vision → static meta injection
                    ├─ /category/…/:id → fetch post from backend, inject title/meta/preloadedState
                    └─ /market/:ticker → fetch market data, inject ticker title/preloadedState
```

**RSC bypass:** The entire SEO Intelligence block is wrapped in `if (!isRscRequest)`. React Server Component streaming requests (`RSC: 1`, `Next-Router-Prefetch`, `Next-Url`, `Accept: text/x-component`) bypass all SEO injection to prevent 500 errors on RSC streams. This was a critical fix — do not remove this guard.

---

## 7. GEO Handler — `handleGeoFeedFromKV()`

Three-tier caching for GEO payload delivery:

```
1. CDN Edge Cache (caches.default)
   └─ HIT → return immediately (fastest — 0ms KV read)

2. KV Store (TREISHFIN_SEO_CACHE)
   Key: geo:finance:/llms.txt | geo:finance:/ai-feed.md | geo:finance:/ontology.json
   └─ HIT → serve + async CDN cache write (ctx.waitUntil)

3. Backend Fallback (BACKEND_API_URL)
   Path: /api/public/geo{url.pathname}
   └─ HIT → serve + async KV write (expirationTtl: 86400) + CDN cache write
   └─ MISS/Error → 503 "GEO Feed Unavailable"
```

**Cache headers:** `public, s-maxage=86400, max-age=3600`
**Bot detection tag:** `X-GEO-Bot-Detected: true` header added to all AI bot responses

---

## 8. Sitemap Handler — `handleDynamicSitemapFromKV()`

Three-tier caching identical to GEO handler:

```
1. CDN Edge Cache
2. KV Store
   Key: sitemap:finance:/sitemap-dynamic/blog/0.xml
        sitemap:finance:/sitemap-dynamic/market/0.xml
3. Backend Fallback
   Path translation: /sitemap-dynamic/X → /api/public/sitemap/X
```

**KV Data Structure:**
```json
Key: sitemap:finance:meta
Value: {"markets":["/sitemap-dynamic/market/0.xml"],"blogs":["/sitemap-dynamic/blog/0.xml"]}

Key: sitemap:finance:/sitemap-dynamic/blog/0.xml
Value: <urlset ...>...</urlset>   (XML string)

Key: sitemap:finance:/sitemap-dynamic/market/0.xml
Value: <urlset ...>...</urlset>   (XML string)
```

**Free-tier protection:** `localBlockCache` deduplication in `CloudflareEdgeSyncService` prevents redundant KV write operations. Minimize KV `list()` operations.

---

## 9. Cron Job — `scheduled()` Handler

Runs every hour: `0 * * * *`

```
1. Fetch sitemap metadata: GET /api/public/sitemap/meta (signed with AEGIS Edge Signature)
2. Write metadata to KV: sitemap:finance:meta (expirationTtl: 90000)
3. For each sitemap path in metadata (priority: first 5):
   a. Translate path: /sitemap-dynamic/X → /api/public/sitemap/X
   b. Generate fresh AEGIS Edge Signature for the translated path
   c. Fetch XML from backend
   d. Write to KV: sitemap:finance:/sitemap-dynamic/X (expirationTtl: 90000)
```

**Client IP for cron:** Hardcoded `127.0.0.1` (loopback) — used for HMAC signature generation when no real client IP is available. The backend's `AegisEdgeValidationFilter` exempts `127.0.0.1`.

---

## 10. SEO Intelligence — `HTMLRewriter` Injections

All SEO injections are wrapped in `if (!isRscRequest)` to prevent RSC stream corruption.

| Route | Injection |
| :--- | :--- |
| `/`, `/home` | WebSite JSON-LD schema; `<link rel="alternate" type="text/markdown" href="/llms.txt">` and `<link rel="alternate" type="application/json+ld" href="/ontology.json">` |
| `/about`, `/vision` | Static title + description meta; GEO discovery links |
| `/category/…/:id` | Dynamic: fetch post from backend → inject `<title>`, `meta[description]`, `window.__PRELOADED_STATE__`, GEO discovery links |
| `/market/:ticker` | Dynamic: fetch market widget from backend → inject ticker name/symbol title, `window.__PRELOADED_STATE__`, GEO discovery links |

**`window.__PRELOADED_STATE__`:** JSON payload injected into `<head>` for client-side hydration. Sanitized via `safeStringify()` which escapes `<`, `>`, `&` to prevent XSS via JSON payload injection.

---

## 11. Security Headers — `addSecurityHeaders()`

Applied to all HTML and API responses:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
X-Permitted-Cross-Domain-Policies: none
```

Additionally:
- `Content-Security-Policy-Report-Only` is **deleted** (not surfaced to end users)
- `X-GEO-Bot-Detected: true` added when `isAiBot` is true
- SPA fallback: if `X-SPA-Fallback` header present and status is 404, status is overridden to 200

---

## 12. Known Architectural Gaps

**Agro Worker missing AEGIS Phase 6 upgrades:**
`treishvaamagro-seo-worker` does not yet implement:
- `generateEdgeSignature()` centralized helper
- Global Crawler Matrix
- GEO AI bot interception
- MTD path translation
- AEGIS_THREAT_KV integration

When the Agro frontend is finalized, the Finance `worker.js` logic must be mirrored precisely into the Agro worker, substituting `BACKEND_ORIGIN` and `CF_PAGES_ORIGIN` secrets in place of `BACKEND_API_URL`.

---

## IMMUTABLE CHANGE HISTORY (DO NOT DELETE)

- **EDITED (RSC Stream Fix):** Wrapped entire SEO Intelligence block in `if (!isRscRequest)`. Reason: React Server Component stream requests (`RSC: 1` header, `Next-Router-Prefetch`, `Next-Url`, `Accept: text/x-component`) were triggering HTMLRewriter transforms on RSC binary streams, causing 500 errors.

- **EDITED (Phase 6.1 — AEGIS Edge Integration):** Replaced narrow crawler regex with compiled Global Crawler Matrix. Implemented `crypto.subtle` HMAC-SHA-512 signing.

- **EDITED (Phase 6.3 — GEO Edge Integration):** Intercepted `/llms.txt` and `/ai-feed.md`. Three-tier KV caching deployed using `TREISHFIN_SEO_CACHE`.

- **EDITED (Phase 6.5 — GEO AI Bot Interception):** Intercepted AI LLM agents on root paths (`/`, `/home`) and served `/ai-feed.md`. React HTML bypassed entirely for LLM agents.

- **EDITED (Phase 6.6 — MTD & Tarpit):** MTD path translation via `aegis:mtd:manifest`. Edge-to-backend Virtual Thread Tarpit routing for TARPIT-flagged IPs. Added `/ontology.json` proxy.

- **EDITED (Phase 8 — GEO Full Execution):** Broadened AI bot list to include OAI-SearchBot and DeepSeek. Added `X-GEO-Bot-Detected` header. CRITICAL FIX: Refactored `crypto.subtle` signing into centralized `generateEdgeSignature` helper. Cron and cache-miss paths previously retained stale signatures, causing 403 rejections at `AegisEdgeValidationFilter`. Signatures now generated per exact backend API path for every fetch.

- **VERIFIED (2026-05-29 — Enterprise Documentation Generation):** All Worker capabilities verified line by line against `worker/worker.js` (616 lines). Added complete request flow, cron flow, KV data structure, and RSC bypass documentation. Confirmed `handleGeoFeedFromKV` and `handleDynamicSitemapFromKV` function signatures and three-tier caching logic.