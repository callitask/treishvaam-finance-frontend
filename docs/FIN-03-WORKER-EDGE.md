# FIN-03 — Edge Worker & SEO Architecture

**Project:** `treishvaam-finance-frontend`
**Worker Name:** `treishfin-seo-worker`
**Route:** `treishvaamfinance.com/*`
**Classification:** Internal Reference (Sanitized — No KV IDs, No Signing Keys)

---

## 1. Overview

The `treishfin-seo-worker` is the **single entry point** for all traffic to `treishvaamfinance.com`. Every HTTP request — human user, search engine, or AI crawler — passes through this Worker before any Next.js page or Spring Boot API is contacted.

The Worker performs five concurrent roles:
1. **Zero-Trust API Proxy** — HMAC-signs all backend requests, injects tenant headers
2. **AEGIS L4-ADA Checkpoint** — blocks or tarpits known malicious IPs and JA3 fingerprints
3. **GEO Router** — intercepts LLM crawlers and serves semantic payloads from KV
4. **SEO Intelligence** — injects JSON-LD schemas, handles sitemap caching, prevents SPA 404s
5. **Cron Cache Warmer** — hourly proactive KV sitemap refresh

---

## 2. Worker Files

```
worker/
├── worker.js       ← Main Worker logic (all logic in one file — Cloudflare Workers constraint)
└── wrangler.toml   ← Worker config: KV bindings, cron triggers, environment variables
```

**Deployment command** (run only when `worker.js` or `wrangler.toml` changes):
```powershell
cd "C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\worker"
npx wrangler deploy
```

---

## 3. Wrangler Configuration (`wrangler.toml`)

```toml
name = "treishfin-seo-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "TREISHFIN_SEO_CACHE"
# id managed via Cloudflare dashboard + wrangler — never hardcode

[[kv_namespaces]]
binding = "AEGIS_THREAT_KV"
# id managed via Cloudflare dashboard + wrangler — never hardcode

[triggers]
crons = ["0 * * * *"]    # Runs once per hour for sitemap cache warming

[vars]
NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY = "false"
```

**Worker Secrets** (injected via `npx wrangler secret put` — never in `wrangler.toml`):
- `AEGIS_EDGE_SECRET` — HMAC-SHA-512 signing key for backend request authentication
- `BACKEND_API_URL` — Cloudflare Tunnel URL to Spring Boot backend

---

## 4. Security — HMAC-SHA-512 Edge Signing

Every request the Worker forwards to the backend is cryptographically signed. This prevents direct-IP backend access from bypassing the AEGIS security pipeline.

```
Worker generates:
  timestamp = Math.floor(Date.now() / 1000)
  signature = HMAC-SHA-512(
      key: AEGIS_EDGE_SECRET,
      data: `${pathname}:${timestamp}:${clientIp}`
  )

Injects headers:
  X-Aegis-Edge-Signature: <hex-encoded signature>
  X-Aegis-Edge-Timestamp: <unix epoch seconds>
```

**Backend verification (`AegisEdgeValidationFilter`):**
- Recomputes the signature server-side
- Uses constant-time comparison (`MessageDigest.isEqual()`) to prevent timing attacks
- Enforces 300-second TTL — timestamps older than 5 minutes are rejected (replay prevention)

**Implementation note:** WebCrypto API in Cloudflare Workers natively supports SHA-512 only (not SHA3-512). HMAC-SHA-512 is used at the Edge. BouncyCastle handles SHA3 natively on the Java backend side.

**Centralized helper:** All signing (regular requests AND cron jobs) uses a single `generateEdgeSignature(path, timestamp, ip)` helper function. Previous versions had stale signatures in cron jobs — this is fixed and must not be reverted.

---

## 5. Global Crawler Matrix

A single `GLOBAL_CRAWLER_MATRIX` regex is compiled once per V8 isolate (0ms per-request overhead). It covers:

**Search Engines:** Googlebot, Bingbot, Slurp, DuckDuckBot, YandexBot, Baiduspider, Sogou, Exabot, ia_archiver

**Google Ecosystem:** Google-Extended, Googlebot-News, AdsBot-Google, Mediapartners-Google, APIs-Google

**AI & LLMs (`aiBotsOnly` subset):**
- OpenAI: GPTBot, ChatGPT-User, OAI-SearchBot
- Anthropic: ClaudeBot, anthropic-ai
- Perplexity: PerplexityBot
- ByteDance: Bytespider
- DeepSeek: DeepSeek
- Alibaba: Qwen
- Mistral: Mistral
- Cohere: Cohere-training
- Meta: MetaExternalAgent
- Amazon: Amazonbot
- Apple: Applebot, Applebot-Extended
- Others: YouBot, Diffbot, SemanticScholarBot

**Social/Unfurl:** Twitterbot, facebookexternalhit, LinkedInBot, WhatsApp, Slackbot, Discordbot

**News/RSS:** flipboard, feedly, NewsBlur, Inoreader

**Archivers:** archive.org_bot, Wikipedia, CommonCrawl

**Internal:** Treishvaam-Worker-Crawler

All confirmed crawlers bypass the AEGIS threat evaluation pipeline to preserve indexability.

---

## 6. Request Processing Pipeline

```
Incoming Request
      │
      ▼
[1] Extract: clientIp (CF-Connecting-IP), ja3Hash (X-JA3-Fingerprint), userAgent
      │
      ▼
[2] Is it a known crawler? (GLOBAL_CRAWLER_MATRIX)
      YES → Skip AEGIS threat check → continue to GEO / SEO routing
      NO  ↓
      ▼
[3] AEGIS Threat Check (AEGIS_THREAT_KV.get(clientIp))
      TARPIT marker found → route to backend Virtual Thread tarpit (with Edge Signature)
      BLOCK marker found  → return 403 immediately (no backend contact)
      ↓
      ▼
[4] RSC request? (URL has ?_rsc= parameter)
      YES → bypass all HTML injection → forward directly to Pages
      NO  ↓
      ▼
[5] Is it an AI/LLM bot? (aiBotsOnly subset)
      YES → handleGeoFeedFromKV() → serve /ai-feed.md from KV (or backend fallback)
            Header: X-GEO-Bot-Detected: true
      NO  ↓
      ▼
[6] Is it a sitemap/SEO path?
      /sitemap.xml, /sitemap-dynamic/* → three-tier KV cache-shield (see §8)
      ↓
      ▼
[7] Is it an API request? (/api/**)
      YES → inject X-Tenant-ID + AEGIS Edge Signature → proxy to BACKEND_API_URL
      NO  ↓
      ▼
[8] Is it a known SPA route? (/about, /vision, /contact, /privacy, /terms)
      Pages returns 404 → intercept → fetch root index.html → return 200
      Header: X-SPA-Fallback: Active
      ↓
      ▼
[9] Is it a search engine crawler? (non-AI)
      YES → fetch Pages HTML → HTMLRewriter injects JSON-LD schemas
      NO  ↓
      ▼
[10] Standard user request → proxy to Cloudflare Pages
```

---

## 7. GEO — AI Bot Interception

When `aiBotsOnly` regex matches, `handleGeoFeedFromKV()` executes:

```javascript
// KV-first with backend fallback
const cached = await TREISHFIN_SEO_CACHE.get('geo:ai-feed.md');
if (cached) {
    return new Response(cached, {
        headers: {
            'Content-Type': 'text/markdown',
            'Cache-Control': 'public, max-age=3600',
            'X-GEO-Bot-Detected': 'true',
            'X-GEO-Source': 'kv-cache'
        }
    });
}

// Cache miss: fetch from backend, serve immediately, write to KV asynchronously
const response = await fetch(`${BACKEND_API_URL}/api/public/geo/ai-feed.md`, {
    headers: { /* AEGIS Edge Signature headers */ }
});
const body = await response.text();

ctx.waitUntil(
    TREISHFIN_SEO_CACHE.put('geo:ai-feed.md', body, { expirationTtl: 3600 })
);

return new Response(body, { /* headers */ });
```

React HTML rendering is bypassed entirely — LLMs never trigger Next.js hydration.

---

## 8. Three-Tier KV Cache-Shield (Sitemap & SEO)

```
Request for /sitemap.xml or /sitemap-dynamic/blog/0.xml
      │
      ▼
[Tier 1] CDN Edge Cache (caches.default.match)
      HIT  → Serve (0 KV reads, 0 network cost)
      MISS ↓
      ▼
[Tier 2] Cloudflare KV (TREISHFIN_SEO_CACHE)
      HIT  → Serve + populate Tier 1 with caches.default.put()
      MISS ↓
      ▼
[Tier 3] Backend (Spring Boot SitemapController)
      Serve immediately to user
      ctx.waitUntil() → async KV write (user never waits for write)
      Tier 1 populated on next request
```

### KV Key Structure

| KV Key | Value | Purpose |
|:---|:---|:---|
| `sitemap:meta` | JSON `{"markets":[...],"blogs":[...]}` | Sitemap index manifest |
| `sitemap:/sitemap-dynamic/blog/0.xml` | XML urlset | Blog post sitemap page 0 |
| `sitemap:/sitemap-dynamic/market/0.xml` | XML urlset | Market ticker sitemap page 0 |
| `aegis:mtd:manifest` | JSON path manifest | MTD temporal path translations |
| `geo:ai-feed.md` | Markdown text | GEO AI feed payload |
| `geo:llms.txt` | Plain text | LLMs.txt discovery file |
| `geo:ontology.json` | JSON-LD graph | Entity ontology |

**Rules:**
- `TREISHFIN_SEO_CACHE_preview` namespace is NEVER used in production logic
- KV `null` returns (cache misses) must always be handled gracefully — never throw

---

## 9. E-E-A-T JSON-LD Injection (HTMLRewriter)

For standard search engine crawlers on root HTML routes, the Worker injects structured data using Cloudflare's zero-latency `HTMLRewriter` API:

```javascript
new HTMLRewriter()
    .on('head', new SchemaInjector(pathname))
    .transform(pagesResponse)
```

**Injected schemas:**

| Schema Type | Data |
|:---|:---|
| `Organization` | Treishvaam Finance — legalName, foundingDate, url, sameAs (social profiles) |
| `Person` | Founder entity with E-E-A-T authority signals |
| `WebPage` / `Article` | Path-specific metadata, `datePublished`, `dateModified` |
| `BreadcrumbList` | Auto-generated from URL path segments |

Additionally injects `<base href="/">` on deep URL paths — prevents CSS/JS MIME type errors from relative path resolution (critical for SPA navigation after direct deep link access).

---

## 10. SPA Fallback (GSC 404 Prevention)

```javascript
const KNOWN_SPA_ROUTES = ['/about', '/vision', '/contact', '/privacy', '/terms', '/home'];

if (KNOWN_SPA_ROUTES.some(r => pathname.startsWith(r)) && pagesResponse.status === 404) {
    const rootHtml = await fetch(CF_PAGES_ORIGIN + '/');
    return new Response(rootHtml.body, {
        headers: {
            'Content-Type': 'text/html',
            'X-SPA-Fallback': 'Active'
        }
    });
}
```

Eliminates "Soft 404" indexing penalties in Google Search Console.

---

## 11. RSC (React Server Component) Stream Protection

```javascript
const isRscRequest = url.searchParams.has('_rsc');
if (isRscRequest) {
    return fetch(CF_PAGES_ORIGIN + request.url); // bypass all injection
}
```

Next.js RSC requests use `?_rsc=` query parameter for streaming JSON. All HTML injection is bypassed for RSC requests — injecting into a JSON stream would cause a 500 error on the frontend.

---

## 12. Cron Job — Sitemap Cache Warming

Runs on the schedule defined in `wrangler.toml` (`"0 * * * *"` = once per hour):

```javascript
async scheduled(event, env, ctx) {
    // 1. Fetch sitemap manifest from backend (with AEGIS signature)
    const meta = await fetch(`${BACKEND_API_URL}/api/public/sitemap/meta`, { headers: aegisHeaders });
    
    // 2. For each sitemap URL in the manifest, fetch and write to KV
    for (const sitemapPath of [...meta.blogs, ...meta.markets]) {
        const xml = await fetch(`${BACKEND_API_URL}${sitemapPath}`, { headers: aegisHeaders });
        ctx.waitUntil(
            env.TREISHFIN_SEO_CACHE.put(`sitemap:${sitemapPath}`, await xml.text(), { expirationTtl: 86400 })
        );
    }
}
```

Ensures the KV cache is always warm before Google's daily crawl.

---

## 13. Cloudflare Edge Redirect Rules (Dashboard — Not in Worker Code)

These rules are managed in the Cloudflare Dashboard. The Worker assumes canonical hostnames and must never re-implement these.

**Rule 1 — www → apex 301:**
```
(http.host in {"www.treishvaamfinance.com"})
→ concat("https://", substring(http.host, 4), http.request.uri.path)
Status: 301, Preserve query string: ON
```

**Rule 2 — Preview URL Canonicalization:**
`treishvaam-finance-frontend.pages.dev` is **NOT** in the Bulk Redirect list.
The Worker internally `fetch()`es the `.pages.dev` origin to get application code. A bulk redirect intercepting this internal fetch would return a 301 to the Worker, which passes it to the user, causing a fatal `ERR_TOO_MANY_REDIRECTS` infinite loop.
Duplicate-content protection for Finance is handled exclusively via `<link rel="canonical">` in the application HTML.

---

## 14. Key Cloudflare Pages Environment Variables

| Variable | Purpose | Set In |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (for GEO route proxies) | Cloudflare Pages Environment Variables |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID | Cloudflare Pages Environment Variables |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads conversion ID | Cloudflare Pages Environment Variables |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID | Cloudflare Pages Environment Variables |
| `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY` | GA4 `anonymize_ip` toggle (`true`/`false`) | Cloudflare Pages Env Vars + `wrangler.toml [vars]` |
| `NEXT_PUBLIC_CHAIRMAN_PORTRAIT_URL` | Dynamic team portrait URL (bypasses repo rebuilds) | Cloudflare Pages Environment Variables |

**ABSOLUTE RULE:** None of these values are hardcoded in the repository. They are injected at build time by Cloudflare Pages or at runtime by the Worker.
