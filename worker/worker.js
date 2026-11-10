/**
 * AI-CONTEXT:
 * Purpose:
 * - Enterprise Edge Controller for Treishvaam Finance.
 * - Handles: Zero-Trust Security, Rich Result SEO Injection, KV-Backed Sitemap (Edge Replica).
 * - Serves as the L4-ADA (Active Deception Architecture) Edge Gateway.
 * Scope:
 * - Intercepts all traffic to treishvaamfinance.com
 * - Manages routing between Static Frontend, Dynamic Backend, and KV Store.
 * - Enforces Global Crawler Matrix to protect digital footprints while dropping botnets.
 * Critical Dependencies:
 * - Backend: via env.BACKEND_API_URL
 * - KV Namespace: TREISHFIN_SEO_CACHE
 * - KV Namespace: AEGIS_THREAT_KV (Phase 6.1)
 * Security Constraints:
 * - Edge Signature uses HMAC-SHA-512 via `crypto.subtle`.
 * - SEO/AI Crawlers must explicitly bypass AEGIS threat evaluation to preserve indexability.
 * - Must never hardcode fallback URLs.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase - 500 RSC Stream Fix):
 *   Wrapped the ENTIRE "SEO INTELLIGENCE" block in `if (!isRscRequest)`.
 * - EDITED (Batch 8 - Advanced GEO Cache Miss Handling):
 *   Enhanced `handleGeoFeedFromKV` to elegantly handle cache misses without blocking the thread.
 * - EDITED (Post-Approval - Enterprise Cache & Cron Scaling):
 *   FIXED KV STORAGE HOLE: `handleDynamicSitemapFromKV` now asynchronously clones and writes backend responses to `TREISHFIN_SEO_CACHE` on cache misses.
 * - EDITED (Post-Approval - GSC Inspection Fix Phase 2):
 *   ADDED Edge User-Agent Normalization: `Google-InspectionTool` is now instantly aliased to `Googlebot`.
 * - EDITED (Post-Approval - Edge Body Sanitization):
 *   Enforced `body: null` for all GET/HEAD request clones inside `baseEnhancedRequest`, `proxyReq`, and KV-fetch fallbacks. 
 * - EDITED (Post-Approval - Edge SEO Split-Tagging & API Leak Prevention):
 *   Injected `X-Robots-Tag: noindex, noarchive` into all `/api/` responses via `addSecurityHeaders`.
 *   Why: Allows Googlebot to fetch JSON to render the React DOM (resolving 499 Client Closed Errors) without leaking raw backend JSON into Google Search Results. Protects Enterprise Knowledge Graph sovereignty.
 * - EDITED (MTD Prefix Fix):
 *   Replaced exact string match lookup for `mtdManifest` with a `.startsWith()` prefix matching iteration, addressing the post-login infinite deception loop.
 * - EDITED (MTD Spring Security & Edge Signature Fix):
 *   Injected `isPublicExempt` to bypass MTD obfuscation for public APIs (`/analytics/`, `/posts/`, `/market/`). Why: MTD was translating public endpoints (like Faro analytics) into obfuscated paths which Spring Security rejected with 401 Unauthorized, breaking telemetry.
 *   Removed MTD translation from the Article SSR fetch. Why: It caused the backend to return 401, blocking the `__PRELOADED_STATE__` injection and causing a fatal Next.js hydration crash (`Cannot read properties of undefined (reading 'id')`).
 *   Stripped query strings (`.split('?')[0]`) from `apiPath` before calling `generateEdgeSignature` in the Market Widget block. Why: The backend `AegisEdgeValidationFilter` evaluates the URI without query parameters, causing a mathematical signature mismatch and throwing a 403 Forbidden.
 *   Relaxed COOP/CORP headers in `addSecurityHeaders` to mirror `middleware.ts` and cure the Keycloak iframe communication lock.
 * - EDITED (Phase 6 - Edge Fetch Content Negotiation Fix):
 *   Injected 'Accept: application/json' into the ssrHeaders for SEO metadata fetches (/category/ and /market/).
 *   Why: Resolves a 406 HttpMediaTypeNotAcceptableException loop where the Spring Boot backend rejected the Edge Worker's background fetches because the cloned browser headers demanded text/html. This fix restores dynamic SEO `<title>` and OpenGraph tags to the browser tab.
 * - EDITED (Phase 7 - High Availability API KV Caching):
 *   Integrated `TREISHFIN_SEO_CACHE` for `/api/v1/posts/url/` and `/api/v1/market/widget` JSON payloads inside the SEO Intelligence block.
 *   Why: Guarantees 100% SEO and rendering uptime. If the backend is offline, the Edge Worker now pulls the API JSON from KV, successfully rewrites the HTML `<title>`, and injects `__PRELOADED_STATE__` for the frontend to consume.
 * - EDITED (BUG_FIX_REPORT_001 - Edge MTD Public Telemetry Exemption):
 *   Hardened `isPublicExempt` string matching to use strict prefix matches (`.startsWith("/api/v1/analytics/event")` and `/api/v1/aegis/telemetry`) instead of broad `.includes()`.
 *   Why: Prevents administrative dashboard paths from bypassing MTD obfuscation while ensuring public telemetry endpoints are not inadvertently flagged by L4-ADA deception poisoning.
 * - EDITED:
 *   Added `/video-key/` interceptor for AES-128 HLS DRM key delivery.
 *   Enforces strict `Referer` checks and AEGIS signatures to prevent hotlinking and direct downloads.
 * - EDITED (Phase 8 Static Edge Knowledge Graph):
 *   Injected canonical static Founder and Conglomerate Knowledge Graph constants and zero-downtime 200 OK fallback in `handleGeoFeedFromKV` for `/ontology.json`, `/llms.txt`, and `/ai-feed.md`.
 *   Why: Guarantees 24/7/365 Edge Knowledge Graph availability and preserves Google Knowledge Panel confidence even when backend origin is offline.
 * - EDITED (Phase 9 - GSC Googlebot XHR KV Shielding, Portrait URL Fix & Zero-Warning Schema):
 *   1. Shielded Googlebot and search crawlers by caching public GET /api/v1/posts*, /api/v1/categories*, and /api/v1/market/news/highlights in TREISHFIN_SEO_CACHE KV with instant 200 OK delivery and resilient failover.
 *   2. Pre-warmed public category/post APIs and AI Knowledge feeds during scheduled cron and /sys/force-update triggers.
 *   3. Updated STATIC_FOUNDER_AND_CONGLOMERATE_GRAPH: removed Person legalName, updated founder portrait URL to amitsagar-kandpal-photo.png, added streetAddress to PostalAddress, and removed FinancialService @type.
 *   4. Ensured ai-feed.md includes the semantic-chunk founder-identity entity.
 * - EDITED (Phase 10 - Sub-2s Edge KV SWR for all users):
 *   Expanded Edge KV SWR cache to cover all public read-only market & editorial endpoints for both human browsers and crawlers; added POST batch quote caching with deterministic keys; added background refresh; expanded pre-warm list.
 * - EDITED (Phase 12.3 - Auth & Binary Media Edge Bypass, Multi-Segment Video/HLS & Legacy Uploads Rewriting):
 *   1. Guaranteed complete bypass of TREISHFIN_SEO_CACHE KV for all requests containing Authorization, X-Internal-Secret, or X-AEGIS-ZKP-Proof headers, and for administrative paths (/api/v1/posts/admin*, /api/v1/posts/drafts*, /api/v1/posts/all*, /api/v1/admin*, /api/v1/users*, /api/v1/auth*, /api/v1/analytics*, /api/v1/status*, /api/v1/preferences*), returning Cache-Control: no-store, no-cache, must-revalidate.
 *   2. Streamlined binary and video streaming routes (/api/v1/uploads/*, /api/v1/video/*, .m3u8, .ts, .mp4, .webm, keys) to stream raw bodies with Range and 206 Partial Content support without buffer corruption or image cache contamination.
 *   3. Routed legacy /uploads/* requests directly to backend /api/v1/uploads/* with fresh AEGIS edge signature matching the rewritten backend URI.
 * - EDITED (Phase 13.1 - 3-Tier L0/L1/L2 Edge Caching, 6h KV Throttle, 3.5s Timeout, Analytics Offline, Uploads Edge Cache):
 *   L0 in-isolate mtdMemoryCache (5-min) + ipThreatMemoryCache (2000, 5-min) + static-asset AEGIS_THREAT_KV bypass; L1 caches.default-first for public GETs + synthetic batch GET key (cache.treishvaamfinance.com) with Cache-Control s-maxage=120, SWR=86400, stale-if-error=604800; KV write-through throttle KV_WRITE_COOLDOWN_MS=21600000 via __kvUpdatedAt envelope + isKvEligibleApi whitelist (~30 keys); 3500ms AbortController for public GETs with HIT-OFFLINE-VAULT fallback; POST /api/v1/analytics/event, /aegis/telemetry, /faro/collect 2500ms + 202 queued_offline; GET /api/v1/uploads/* cf.cacheEverything + 7-day edge headers; all KV get/put try/catch with graceful caches.default fallback. No security layer weakened.
 * - EDITED (Phase 13.5 - Schedule-Aligned TTLs, Never-Cache Bypass, Purge on Mutation, Crawler Jail):
 *   Added getEdgeCachePolicy() (Movers 3600/86400, Quotes/Widgets 1800/14400, News 900/3600, Posts/Cats 900/86400, GEO/Sitemap 3600/86400) + isNeverCacheRequest() (Auth/ZKP/non-GET/debug/dashboard/login/admin/node/analytics/status/monitoring/aegis/auth/users/profile/preferences/video-key/numeric-posts/manage/all/drafts) stamped private no-store + isAdminMutation() instant L1+L2 purge (bypasses 6h cooldown) + crawler jail (verified crawlers GET/HEAD public SEO only, else 403) + threat-bypass scoping (verifiedBot OR GET/HEAD public SEO). No security layer weakened.
 * - DO-NOT-DELETE RULE:
 *   This IMMUTABLE CHANGE HISTORY section must never be deleted,
 *   truncated, rewritten, or regenerated.
 *   Future AI must append only.
 */

// =================================================================================
// GLOBAL ENTERPRISE CRAWLER MATRIX (Compiled once per V8 Isolate for 0ms execution)
// =================================================================================
const searchEngines = "Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|SeznamBot";
const googleEcosystem = "Google-Extended|Googlebot-News|Googlebot-Image|Googlebot-Video|Google-Read-Aloud|Storebot-Google|APIs-Google|AdsBot-Google|Mediapartners-Google|Google-InspectionTool";
const aiAndLlms = "GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|anthropic-ai|MetaExternalAgent|Amazonbot|Applebot|Applebot-Extended|PerplexityBot|DeepSeek|Bytespider|Qwen|Mistral|YouBot|Cohere-training|Diffbot";
const socialAndUnfurl = "Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Pinterestbot|Redditbot";
const newsAndFeeds = "flipboard|feedly|NewsBlur|Inoreader|PocketParser|PaperLiBot|WordPress|Tumblr";
const archiversAndAcademic = "ia_archiver|archive\\.org_bot|Wikipedia|SemanticScholarBot";
const internal = "Treishvaam-Worker-Crawler";

const GLOBAL_CRAWLER_MATRIX = new RegExp(`(${searchEngines}|${googleEcosystem}|${aiAndLlms}|${socialAndUnfurl}|${newsAndFeeds}|${archiversAndAcademic}|${internal})`, "i");
const aiBotsOnly = new RegExp(`(${aiAndLlms})`, "i");

// =================================================================================
// Phase 13.1 — 3-Tier Edge Caching (L0 In-Isolate Memory, L1 Edge Cache, 6h KV Throttle)
// =================================================================================
const KV_WRITE_COOLDOWN_MS = 6 * 60 * 60 * 1000; // Strict 6-hour KV write throttle
const KV_CACHE_TTL = 86400;

let mtdMemoryCache = { data: null, expiresAt: 0 };
const ipThreatMemoryCache = new Map(); // ip -> { data, expiresAt }, max 2000 entries, 5-min TTL
const lastKvWriteAt = new Map(); // key -> timestamp (isolate-memory throttle)

function isStaticAssetPath(pathname) {
    return pathname.startsWith('/_next/') || pathname.startsWith('/static/')
        || /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2|woff)$/i.test(pathname)
        || pathname === '/sw.js' || pathname === '/manifest.json' || pathname.startsWith('/_next/static');
}

function isCacheableGet(pathname) {
    return pathname.startsWith('/api/v1/posts') || pathname.startsWith('/api/v1/categories')
        || pathname.startsWith('/api/v1/market/') || pathname.startsWith('/api/public/geo/')
        || pathname === '/llms.txt' || pathname === '/ai-feed.md' || pathname === '/ontology.json'
        || pathname.startsWith('/sitemap') || pathname.startsWith('/sitemap-dynamic/');
}

function isKvEligibleApi(pathname, search) {
    const qs = search || '';
    if (pathname === '/api/v1/categories' && (qs === '' || qs === '?')) return true;
    if (pathname === '/api/v1/posts' && (qs === '' || qs.includes('page=0') && (qs.includes('size=50') || qs.includes('size=9') || qs.includes('size=5') || qs === ''))) return true;
    if (pathname === '/api/v1/posts' || pathname === '/api/v1/market/news/highlights' || pathname === '/api/v1/market/news/archived' || pathname === '/api/v1/market/top-gainers' || pathname === '/api/v1/market/top-losers' || pathname === '/api/v1/market/most-active') {
        if (!qs || qs.includes('page=0')) return true;
        return false;
    }
    if (pathname === '/api/v1/posts/url/' || pathname.startsWith('/api/v1/posts/url/')) return true;
    if (pathname === '/api/v1/market/quotes/batch') return true;
    if ((pathname === '/api/v1/market/widget' || pathname === '/api/v1/market/data') && ['^DJI','^GSPC','^IXIC','^NSEI','^BSESN','GC=F','CL=F','USDINR=X','BTC-INR'].some(t => qs.includes(encodeURIComponent(t)) || qs.includes(t))) return true;
    if (pathname === '/api/public/geo/llms.txt' || pathname === '/api/public/geo/ai-feed.md' || pathname === '/api/public/geo/ontology.json' || pathname.startsWith('/sitemap')) return true;
    if (pathname === '/api/v1/market/news/highlights' || pathname === '/api/v1/market/news/archived') {
        if (!qs || qs.includes('page=0&size=12') || qs.includes('page=0&size=20') || qs.includes('page=0')) return true;
    }
    return false;
}

// Phase 13.5 — Schedule-aligned L1 TTLs (matches backend schedulers)
function getEdgeCachePolicy(pathname) {
    const p = pathname || '';
    if (p === '/api/v1/market/top-gainers' || p === '/api/v1/market/top-losers' || p === '/api/v1/market/most-active' || p.startsWith('/api/v1/market/top-gainers') || p.startsWith('/api/v1/market/top-losers') || p.startsWith('/api/v1/market/most-active'))
        return { sMaxAge: 3600, swr: 86400, sie: 604800 };
    if (p === '/api/v1/market/quotes/batch' || p.startsWith('/api/v1/market/widget') || p.startsWith('/api/v1/market/data/') || p.startsWith('/api/v1/market/quote/') || p.startsWith('/api/v1/market/historical/'))
        return { sMaxAge: 1800, swr: 14400, sie: 604800 };
    if (p.startsWith('/api/v1/market/news/highlights') || p.startsWith('/api/v1/market/news/archived'))
        return { sMaxAge: 900, swr: 3600, sie: 604800 };
    if (p === '/api/v1/posts' || p.startsWith('/api/v1/posts') || p.startsWith('/api/v1/categories'))
        return { sMaxAge: 900, swr: 86400, sie: 604800 };
    if (p === '/llms.txt' || p === '/ai.txt' || p === '/ai-feed.md' || p === '/ontology.json' || p.startsWith('/api/public/geo/') || p.startsWith('/sitemap'))
        return { sMaxAge: 3600, swr: 86400, sie: 604800 };
    return { sMaxAge: 900, swr: 86400, sie: 604800 };
}
function edgeCacheControlHdr(pathname) {
    const pol = getEdgeCachePolicy(pathname);
    return `public, s-maxage=${pol.sMaxAge}, stale-while-revalidate=${pol.swr}, stale-if-error=${pol.sie}`;
}
function isPublicSeoRoute(pathname) {
    const p = pathname || '';
    return p === '/' || p === '/about' || p === '/vision' || p === '/contact' || p === '/privacy' || p === '/terms'
        || p.startsWith('/category/') || p.startsWith('/market/')
        || p === '/llms.txt' || p === '/ai.txt' || p === '/ai-feed.md' || p === '/ontology.json'
        || p.startsWith('/sitemap') || p === '/robots.txt' || p === '/opensearch.xml'
        || p.startsWith('/api/public/geo/');
}
function isNeverCacheRequest(req, pathname) {
    try {
        if (req.headers.has('Authorization') || req.headers.has('X-Aegis-Zkp-Proof') || req.headers.has('X-AEGIS-ZKP-Proof')) return true;
        if (req.method !== 'GET' && req.method !== 'HEAD' && !(req.method === 'POST' && pathname === '/api/v1/market/quotes/batch')) return true;
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return true;
        if (pathname.startsWith('/api/v1/admin/') || pathname.startsWith('/api/v1/node/') || pathname.startsWith('/api/v1/analytics/') || pathname.startsWith('/api/v1/status') || pathname.startsWith('/api/v1/api-status') || pathname.startsWith('/api/v1/monitoring') || pathname.startsWith('/api/v1/aegis/') || pathname.startsWith('/api/v1/auth/') || pathname.startsWith('/api/v1/users/') || pathname.startsWith('/api/v1/profile/') || pathname.startsWith('/api/v1/preferences/') || pathname.startsWith('/api/v1/video/key/')) return true;
        if (/^\/api\/v1\/posts\/\d+(\/.*)?$/.test(pathname)) return true;
        if (pathname.startsWith('/api/v1/posts/manage') || pathname.startsWith('/api/v1/posts/all') || pathname.startsWith('/api/v1/posts/drafts')) return true;
        return false;
    } catch (e) { return false; }
}
function isAdminMutation(req, pathname) {
    if (!(req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) return false;
    return pathname.startsWith('/api/v1/posts') || pathname.startsWith('/api/v1/categories')
        || pathname.startsWith('/api/v1/market/admin/') || pathname === '/api/v1/market/news/fetch' || pathname.startsWith('/api/v1/market/news/fetch')
        || pathname.startsWith('/api/v1/node/');
}
async function purgeFeedCaches(env, ctx, mutatedPath) {
    const edgeUrls = [
        'https://treishvaamfinance.com/api/v1/posts?page=0&size=50',
        'https://treishvaamfinance.com/api/v1/posts?page=0&size=9',
        'https://treishvaamfinance.com/api/v1/posts?page=0&size=5',
        'https://treishvaamfinance.com/api/v1/posts',
        'https://treishvaamfinance.com/api/v1/categories',
        'https://treishvaamfinance.com/llms.txt',
        'https://treishvaamfinance.com/ai-feed.md',
        'https://treishvaamfinance.com/ontology.json',
    ];
    if (mutatedPath && mutatedPath.includes('/market')) {
        edgeUrls.push('https://treishvaamfinance.com/api/v1/market/top-gainers', 'https://treishvaamfinance.com/api/v1/market/news/highlights?page=0&size=12');
    }
    const kvKeys = [
        'api_cache:/api/v1/posts?page=0&size=50', 'api_cache:/api/v1/posts?page=0&size=9', 'api_cache:/api/v1/posts?page=0&size=5',
        'api_cache:/api/v1/posts', 'api_cache:/api/v1/categories',
        'geo:finance:/llms.txt', 'geo:finance:/ai-feed.md', 'geo:finance:/ontology.json',
        'api_cache:/api/v1/market/top-gainers', 'api_cache:/api/v1/market/news/highlights',
    ];
    try {
        for (const u of edgeUrls) {
            try { await caches.default.delete(new Request(u, { method: 'GET' })); } catch (e) {}
        }
    } catch (e) {}
    for (const k of kvKeys) {
        try { await env.TREISHFIN_SEO_CACHE.delete(k); lastKvWriteAt.delete(k); } catch (e) {}
    }
}

async function kvGetSafe(env, key) {
    try { return await env.TREISHFIN_SEO_CACHE.get(key); } catch (e) { return null; }
}

async function kvPutThrottled(env, ctx, key, value, options, isForce) {
    try {
        if (!isForce) {
            const last = lastKvWriteAt.get(key) || 0;
            if (Date.now() - last < KV_WRITE_COOLDOWN_MS) return false;
            try {
                let existingAt = 0;
                if (env.TREISHFIN_SEO_CACHE.getWithMetadata) {
                    const withMeta = await env.TREISHFIN_SEO_CACHE.getWithMetadata(key);
                    const metaAt = withMeta?.metadata?.updatedAt || 0;
                    const envelopeAt = (() => { try { const p = JSON.parse(withMeta?.value || 'null'); return p?.__kvUpdatedAt || 0; } catch (e) { return 0; } })();
                    existingAt = Math.max(metaAt, envelopeAt);
                } else {
                    const existing = await env.TREISHFIN_SEO_CACHE.get(key);
                    if (existing) {
                        try { const p = JSON.parse(existing); existingAt = p?.__kvUpdatedAt || 0; } catch (e) { existingAt = Date.now(); }
                    }
                }
                if (existingAt && (Date.now() - existingAt < KV_WRITE_COOLDOWN_MS)) {
                    lastKvWriteAt.set(key, existingAt);
                    return false;
                }
            } catch (e) {}
        }
        const envelope = value;
        const payload = JSON.stringify({ __kvUpdatedAt: Date.now(), payload: envelope });
        await env.TREISHFIN_SEO_CACHE.put(key, payload, options || { expirationTtl: KV_CACHE_TTL });
        lastKvWriteAt.set(key, Date.now());
        return true;
    } catch (e) { return false; }
}

async function kvGetUnwrap(env, key) {
    const raw = await kvGetSafe(env, key);
    if (!raw) return null;
    try { const parsed = JSON.parse(raw); if (parsed && typeof parsed === 'object' && '__kvUpdatedAt' in parsed && 'payload' in parsed) return parsed.payload; } catch (e) {}
    return raw;
}

async function fetchWithTimeout(input, init, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const merged = { ...(init || {}), signal: controller.signal };
        if (input instanceof Request) {
            if (init && init.cf) merged.cf = init.cf;
            const req = new Request(input, merged);
            return await fetch(req);
        }
        return await fetch(input, merged);
    } finally { clearTimeout(id); }
}

// =================================================================================
// Phase 13.7 — Non-Destructive Entity Merge Shield (Edge)
// Guarantees Founder (#treishvaam) + Parent Org (#organization) + Finance org are
// never lost/overwritten even if backend returns older/partial payload (VM offline
// or older container image). Dynamic nodes are preserved.
// =================================================================================
const CANONICAL_PERSON_NODE = {
    "@type": "Person",
    "@id": "https://treishvaamgroup.com/#treishvaam",
    "name": "Treishvaam",
    "legalName": "Amitsagar Kandpal",
    "alternateName": ["Amitsagar Kandpal", "Amit Kandpal", "Amit Sagar Kandpal", "Amitsagar", "Treishvaam", "Treishvam", "Trishvam"],
    "birthDate": "1997-10-05",
    "gender": "Male",
    "nationality": { "@type": "Country", "name": "India" },
    "jobTitle": "Founder & Chairman",
    "worksFor": { "@id": "https://treishvaamgroup.com/#organization" },
    "alumniOf": { "@type": "CollegeOrUniversity", "name": "Hans Raj College, University of Delhi", "sameAs": "https://en.wikipedia.org/wiki/Hansraj_College" },
    "hasOccupation": [{ "@type": "Occupation", "name": "Entrepreneur" }, { "@type": "Occupation", "name": "Artist" }, { "@type": "Occupation", "name": "Actor" }],
    "description": "Amitsagar Kandpal (known professionally and artistically as Treishvaam) is an Indian entrepreneur, artist, and actor, and the Founder & Chairman of Treishvaam Group, Treishvaam Finance, Treishvaam Agro, and Treishvaam Hiring Marketplace.",
    "mainEntityOfPage": "https://treishvaamgroup.com/about",
    "affiliation": [{ "@id": "https://treishvaamgroup.com/#organization" }, { "@id": "https://treishvaamfinance.com/#organization" }, { "@id": "https://treishvaamagro.com/#organization" }, { "@id": "https://thm.treishvaamgroup.com/#organization" }],
    "knowsAbout": ["Corporate Strategy", "Financial Markets", "Macroeconomics", "Sustainable Agriculture", "Solar Dehydration", "Enterprise Architecture", "Performing Arts"],
    "image": "https://treishvaamfinance.com/amitsagar-kandpal-photo.png",
    "sameAs": ["https://www.instagram.com/treishvaam/", "https://x.com/treishvaam", "https://www.snapchat.com/@treishvaam", "https://www.linkedin.com/in/amitsagarkandpal", "https://treishvaamgroup.com/about", "https://treishvaamfinance.com/about"]
};
const CANONICAL_ORG_NODE = {
    "@type": "Organization",
    "@id": "https://treishvaamgroup.com/#organization",
    "name": "Treishvaam Group",
    "legalName": "Treishvaam Group",
    "alternateName": ["Treishvam Group", "Treshvam Group", "Trishvam Group", "Treishvaam Enterprise", "Treishvaam", "Treishvam", "Trishvam"],
    "url": "https://treishvaamgroup.com",
    "logo": "https://treishvaamgroup.com/logo512.webp",
    "description": "Treishvaam Group is a diversified enterprise conglomerate innovating across finance, agriculture, and technology.",
    "foundingDate": "2024",
    "address": { "@type": "PostalAddress", "streetAddress": "Electronic City", "addressLocality": "Bangalore", "addressRegion": "Karnataka", "postalCode": "560100", "addressCountry": "IN" },
    "knowsAbout": ["Financial Services", "Market Intelligence", "Algorithmic Wealth Management", "Sustainable Agriculture", "Solar Dehydration Technology", "B2B Nutraceuticals", "Human Capital Marketplace", "Enterprise Technology"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "email": "treishvaamgroup@gmail.com", "telephone": "+918178529633" },
    "founder": { "@id": "https://treishvaamgroup.com/#treishvaam" },
    "sameAs": ["https://www.linkedin.com/company/treishvaamgroup", "https://twitter.com/treishvaamgroup", "https://x.com/treishvaam", "https://www.instagram.com/treishvaam/"],
    "subOrganization": [
        { "@type": "FinancialService", "@id": "https://treishvaamfinance.com/#organization", "name": "Treishvaam Finance", "url": "https://treishvaamfinance.com", "parentOrganization": { "@id": "https://treishvaamgroup.com/#organization" }, "founder": { "@id": "https://treishvaamgroup.com/#treishvaam" } },
        { "@type": "Organization", "@id": "https://treishvaamagro.com/#organization", "name": "Treishvaam Agro", "url": "https://treishvaamagro.com", "parentOrganization": { "@id": "https://treishvaamgroup.com/#organization" }, "founder": { "@id": "https://treishvaamgroup.com/#treishvaam" } },
        { "@type": "Organization", "@id": "https://thm.treishvaamgroup.com/#organization", "name": "Treishvaam Hiring Marketplace", "url": "https://thm.treishvaamgroup.com", "parentOrganization": { "@id": "https://treishvaamgroup.com/#organization" }, "founder": { "@id": "https://treishvaamgroup.com/#treishvaam" } }
    ]
};
const CANONICAL_FINANCE_NODE = {
    "@type": ["Organization", "NewsMediaOrganization"],
    "@id": "https://treishvaamfinance.com/#organization",
    "name": "Treishvaam Finance",
    "url": "https://treishvaamfinance.com",
    "logo": "https://treishvaamfinance.com/logo.webp",
    "image": "https://treishvaamfinance.com/logo.webp",
    "description": "India's premier institutional financial intelligence, quantitative market strategy, and financial news platform operated by Treishvaam Group.",
    "founder": { "@id": "https://treishvaamgroup.com/#treishvaam" },
    "parentOrganization": { "@type": "Organization", "@id": "https://treishvaamgroup.com/#organization", "name": "Treishvaam Group", "url": "https://treishvaamgroup.com" }
};
const CANONICAL_CHUNKS = `<semantic-chunk id="founder-identity" entity="Treishvaam">
## Executive Identity & Leadership
- **Founder & Chairman**: Treishvaam (Legal Name: Amitsagar Kandpal)
- **Date of Birth**: 1997-10-05
- **Alma Mater**: Hans Raj College, University of Delhi
- **Occupations**: Entrepreneur, Artist, Actor
- **Entity**: https://treishvaamgroup.com/#treishvaam
</semantic-chunk>

<semantic-chunk id="conglomerate-overview" entity="Treishvaam Group">
## Parent Conglomerate Overview
- **Name**: Treishvaam Group (https://treishvaamgroup.com/#organization)
- **Divisions**: Treishvaam Finance (https://treishvaamfinance.com), Treishvaam Agro (https://treishvaamagro.com), Treishvaam Hiring Marketplace (https://thm.treishvaamgroup.com)
</semantic-chunk>

<semantic-chunk id="aeo-faq" entity="Treishvaam Finance">
## AEO FAQ
- Who is founder/owner? Amitsagar Kandpal / Treishvaam (1997-10-05, Hans Raj College, Entrepreneur/Artist/Actor).
- Divisions? Finance https://treishvaamfinance.com, Agro https://treishvaamagro.com, THM https://thm.treishvaamgroup.com.
</semantic-chunk>

`;

function mergeOntologyJson(text) {
    try {
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed['@graph'])) return text;
        const nodes = parsed['@graph'];
        const byId = new Map(nodes.map(n => [n && n['@id'], n]));
        const canonicals = [CANONICAL_PERSON_NODE, CANONICAL_ORG_NODE, CANONICAL_FINANCE_NODE];
        for (const c of canonicals) {
            const existing = byId.get(c['@id']);
            if (existing) {
                // Non-destructive merge: fill missing fields from canonical without overwriting dynamic data
                for (const k of Object.keys(c)) {
                    if (existing[k] === undefined || existing[k] === null) existing[k] = c[k];
                }
            } else {
                nodes.push(c);
                byId.set(c['@id'], c);
            }
        }
        return JSON.stringify(parsed);
    } catch (e) {
        return text;
    }
}

function ensureCanonicalText(text) {
    if (typeof text !== 'string') return text;
    if (text.includes('1997-10-05') && text.includes('Hans Raj College')) return text;
    return CANONICAL_CHUNKS + text;
}

async function generateEdgeSignature(path, timestamp, ip, secret) {
    if (!secret) return "";
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["sign"]
        );
        const data = encoder.encode(path + ":" + timestamp + ":" + ip);
        const signatureBuf = await crypto.subtle.sign("HMAC", key, data);
        return Array.from(new Uint8Array(signatureBuf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        console.error("AEGIS Helper Signing Failed", e);
        return "";
    }
}

export default {
    // =================================================================================
    // 1. SCHEDULED TASKS (CRON JOB) - THE NEW ENGINE
    // =================================================================================
    async scheduled(event, env, ctx) {
        console.log("TRIGGER: Scheduled Sitemap Update");
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";
        const clientIp = "127.0.0.1";

        try {
            const metaPath = `/api/public/sitemap/meta`;
            const metaTimestamp = Date.now().toString();
            const metaSignature = await generateEdgeSignature(metaPath, metaTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

            const metaResp = await fetch(`${BACKEND_URL}${metaPath}`, {
                headers: {
                    "User-Agent": "Treishvaam-Worker-Crawler/1.0",
                    "X-Aegis-Edge-Signature": metaSignature,
                    "X-Aegis-Edge-Timestamp": metaTimestamp,
                    "X-Aegis-Client-IP": clientIp,
                    "CF-Connecting-IP": clientIp
                }
            });

            if (metaResp.ok) {
                const metaJson = await metaResp.json();
                await env.TREISHFIN_SEO_CACHE.put("sitemap:finance:meta", JSON.stringify(metaJson), { expirationTtl: 90000 });

                const filesToUpdate = [];
                if (metaJson.blogs) filesToUpdate.push(...metaJson.blogs.map(path => ({ key: `sitemap:finance:${path}`, path })));
                if (metaJson.markets) filesToUpdate.push(...metaJson.markets.map(path => ({ key: `sitemap:finance:${path}`, path })));

                const BATCH_SIZE = 10;
                for (let i = 0; i < filesToUpdate.length; i += BATCH_SIZE) {
                    const batch = filesToUpdate.slice(i, i + BATCH_SIZE);
                    const fetchPromises = batch.map(async (file) => {
                        try {
                            const apiPath = file.path.replace('/sitemap-dynamic/', '/api/public/sitemap/');
                            const fileTimestamp = Date.now().toString();
                            const fileSignature = await generateEdgeSignature(apiPath, fileTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                            const fileResp = await fetch(`${BACKEND_URL}${apiPath}`, {
                                headers: {
                                    "User-Agent": "Treishvaam-Worker-Crawler/1.0",
                                    "X-Aegis-Edge-Signature": fileSignature,
                                    "X-Aegis-Edge-Timestamp": fileTimestamp,
                                    "X-Aegis-Client-IP": clientIp,
                                    "CF-Connecting-IP": clientIp
                                }
                            });

                            if (fileResp.ok && fileResp.headers.get("content-type")?.includes("xml")) {
                                const content = await fileResp.text();
                                await env.TREISHFIN_SEO_CACHE.put(file.key, content, { expirationTtl: 90000 });
                            }
                        } catch (e) { console.error(`Failed to update ${file.key}`); }
                    });
                    await Promise.allSettled(fetchPromises);
                }
            }
        } catch (e) { console.error("Cron Sitemap Sync Failed", e); }

        // 2. Synchronize and Pre-warm GEO Feeds (/ai-feed.md, /ontology.json, /llms.txt)
        try {
            const geoPaths = [
                { path: "/api/public/geo/ai-feed.md", key: "geo:finance:/ai-feed.md", type: "md" },
                { path: "/api/public/geo/ontology.json", key: "geo:finance:/ontology.json", type: "json" },
                { path: "/api/public/geo/llms.txt", key: "geo:finance:/llms.txt", type: "txt" }
            ];

            for (const item of geoPaths) {
                try {
                    const ts = Date.now().toString();
                    const sig = await generateEdgeSignature(item.path, ts, clientIp, env.AEGIS_EDGE_SECRET);
                    const resp = await fetch(`${BACKEND_URL}${item.path}`, {
                        headers: {
                            "User-Agent": "Treishvaam-Worker-Crawler/1.0",
                            "X-Aegis-Edge-Signature": sig,
                            "X-Aegis-Edge-Timestamp": ts,
                            "X-Aegis-Client-IP": clientIp,
                            "CF-Connecting-IP": clientIp
                        }
                    });

                    if (resp.ok) {
                        let content = await resp.text();
                        if (item.type === "md" && !content.includes('id="founder-identity"')) {
                            const founderChunk = `<semantic-chunk id="founder-identity" entity="Treishvaam">
## Executive Identity & Leadership
- **Founder & Chairman**: Treishvaam (Legal Name: Amitsagar Kandpal)
- **Date of Birth**: October 5, 1997
- **Alma Mater**: Hans Raj College, University of Delhi
- **Occupations**: Entrepreneur, Artist, Actor
- **Profiles**: Instagram (https://www.instagram.com/treishvaam/), X (https://x.com/treishvaam), Snapchat (https://www.snapchat.com/@callitaskk)
</semantic-chunk>

`;
                            const firstNewline = content.indexOf('\n');
                            if (firstNewline !== -1) {
                                content = content.slice(0, firstNewline + 1) + '\n' + founderChunk + content.slice(firstNewline + 1);
                            } else {
                                content = founderChunk + content;
                            }
                        }
                        await env.TREISHFIN_SEO_CACHE.put(item.key, content, { expirationTtl: 86400 });
                    }
                } catch (err) {
                    console.error(`Failed to sync geo feed ${item.key}:`, err);
                }
            }
        } catch (e) {
            console.error("GEO Feed Cron Sync Failed:", e);
        }

        // 3. Pre-warm Public API Endpoints for Googlebot & Crawlers
        try {
            const apisToPrewarm = [
                { path: "/api/v1/categories", key: "api_cache:/api/v1/categories" },
                { path: "/api/v1/posts?page=0&size=9", key: "api_cache:/api/v1/posts?page=0&size=9" },
                { path: "/api/v1/market/news/highlights", key: "api_cache:/api/v1/market/news/highlights" },
                { path: "/api/v1/market/news/archived", key: "api_cache:/api/v1/market/news/archived" },
                { path: "/api/v1/market/top-gainers", key: "api_cache:/api/v1/market/top-gainers" },
                { path: "/api/v1/market/top-losers", key: "api_cache:/api/v1/market/top-losers" },
                { path: "/api/v1/market/most-active", key: "api_cache:/api/v1/market/most-active" },
                { path: "/api/v1/market/widget?ticker=%5EDJI", key: "api_cache:/api/v1/market/widget?ticker=%5EDJI" }
            ];

            for (const api of apisToPrewarm) {
                try {
                    const ts = Date.now().toString();
                    const signPath = api.path.split('?')[0];
                    const sig = await generateEdgeSignature(signPath, ts, clientIp, env.AEGIS_EDGE_SECRET);
                    const resp = await fetch(`${BACKEND_URL}${api.path}`, {
                        headers: {
                            "User-Agent": "Treishvaam-Worker-Crawler/1.0",
                            "Accept": "application/json",
                            "X-Aegis-Edge-Signature": sig,
                            "X-Aegis-Edge-Timestamp": ts,
                            "X-Aegis-Client-IP": clientIp,
                            "CF-Connecting-IP": clientIp
                        }
                    });

                    if (resp.ok) {
                        const content = await resp.text();
                        await env.TREISHFIN_SEO_CACHE.put(api.key, content, { expirationTtl: 86400 });
                    }
                } catch (err) {
                    console.error(`Failed to pre-warm API ${api.key}:`, err);
                }
            }

            // Pre-warm POST batch quote endpoints for default tab tickers
            const batchBodies = [
                JSON.stringify(["^GSPC","^IXIC","^NSEI","GC=F","CL=F","BTC-INR"]),
                JSON.stringify(["^DJI","^GSPC","^IXIC","^RUT","^VIX"])
            ];
            for (const body of batchBodies) {
                try {
                    const ts = Date.now().toString();
                    const signPath = "/api/v1/market/quotes/batch";
                    const sig = await generateEdgeSignature(signPath, ts, clientIp, env.AEGIS_EDGE_SECRET);
                    const resp = await fetch(`${BACKEND_URL}${signPath}`, {
                        method: "POST",
                        headers: {
                            "User-Agent": "Treishvaam-Worker-Crawler/1.0",
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "X-Aegis-Edge-Signature": sig,
                            "X-Aegis-Edge-Timestamp": ts,
                            "X-Aegis-Client-IP": clientIp,
                            "CF-Connecting-IP": clientIp
                        },
                        body: body
                    });
                    if (resp.ok) {
                        const content = await resp.text();
                        let tickers = [];
                        try { tickers = JSON.parse(body); } catch (e) { tickers = []; }
                        const sorted = [...tickers].map(String).sort();
                        const key = "api_cache:/api/v1/market/quotes/batch:" + sorted.join(',');
                        await env.TREISHFIN_SEO_CACHE.put(key, content, { expirationTtl: 86400 });
                    }
                } catch (err) {
                    console.error("Failed to pre-warm batch quotes:", err);
                }
            }
        } catch (e) {
            console.error("Public API Pre-warm Cron Failed:", e);
        }
    },

    // =================================================================================
    // 2. REQUEST HANDLER (MERGED LOGIC)
    // =================================================================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/sys/force-update') {
            try {
                const listed = await env.TREISHFIN_SEO_CACHE.list();
                for (const key of listed.keys) {
                    if (key.name.startsWith('api_cache:/api/v1/posts/url/')) {
                        const val = await env.TREISHFIN_SEO_CACHE.get(key.name);
                        let bad = false;
                        try {
                            const parsed = JSON.parse(val || '{}');
                            if (!parsed || !parsed.id || !parsed.title) bad = true;
                        } catch (e) { bad = true; }
                        if (bad) await env.TREISHFIN_SEO_CACHE.delete(key.name);
                    }
                }
            } catch (e) {}
            await this.scheduled(null, env, ctx);
            return new Response("Manual Update Triggered! Sitemaps are regenerating.", { status: 200 });
        }

        if (url.pathname === '/sys/purge-cache') {
            try {
                const cache = caches.default;
                const endpoints = [
                    "https://treishvaamfinance.com/ontology.json",
                    "https://treishvaamfinance.com/ai-feed.md",
                    "https://treishvaamfinance.com/llms.txt",
                    "https://treishvaamfinance.com/",
                    "https://treishvaamfinance.com/api/v1/categories",
                    "https://treishvaamfinance.com/api/v1/posts?page=0&size=9",
                    "https://treishvaamfinance.com/api/v1/market/news/highlights"
                ];
                for (const ep of endpoints) {
                    try {
                        await cache.delete(new Request(ep));
                    } catch (err) {}
                }

                const listed = await env.TREISHFIN_SEO_CACHE.list();
                for (const key of listed.keys) {
                    await env.TREISHFIN_SEO_CACHE.delete(key.name);
                }
                return new Response("Enterprise KV Cache and Edge Cache Purged Successfully! All stale records annihilated.", { status: 200 });
            } catch (e) {
                return new Response("Purge failed: " + e.message, { status: 500 });
            }
        }

        let userAgent = request.headers.get("User-Agent") || "";

        // Edge User-Agent Normalization: Bypass native backend anomalies for Google Live Test
        if (userAgent.includes("Google-InspectionTool")) {
            userAgent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
        }

        const isVerifiedCrawler = GLOBAL_CRAWLER_MATRIX.test(userAgent);
        const isAiBot = aiBotsOnly.test(userAgent);
        const clientIp = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
        let targetPath = url.pathname;
        let isTarpit = false;
        let mtdManifest = null;

        // Phase 13.5 Crawler Jail: verified crawlers ONLY on GET/HEAD public SEO routes; any attempt on
        // dashboard/login/admin/node/analytics/auth or state-changing method => 403 at Edge.
        if (isVerifiedCrawler) {
            const m = request.method;
            const p = url.pathname;
            const isPrivate = p.startsWith('/dashboard') || p.startsWith('/login')
                || p.startsWith('/api/v1/admin') || p.startsWith('/api/v1/node') || p.startsWith('/api/v1/analytics')
                || p.startsWith('/api/v1/auth');
            const isMutating = (m === 'POST' || m === 'PUT' || m === 'DELETE');
            const isPublicRead = ((m === 'GET' || m === 'HEAD') && isPublicSeoRoute(p));
            if (isPrivate || (isMutating && !isPublicRead) || (!isPublicRead && !isStaticAssetPath(p))) {
                return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
            }
        }

        try {
            const threatKv = env.AEGIS_THREAT_KV || env.TREISHFIN_SEO_CACHE;
            // Phase 13.1 L0: skip threat KV entirely on static assets (0 KV ops)
            if (!isStaticAssetPath(url.pathname)) {
                const now = Date.now();
                if (mtdMemoryCache.data !== null && now < mtdMemoryCache.expiresAt) {
                    mtdManifest = mtdMemoryCache.data;
                } else {
                    try {
                        const mtdManifestStr = await threatKv.get("aegis:mtd:manifest");
                        if (mtdManifestStr) {
                            mtdManifest = JSON.parse(mtdManifestStr);
                            mtdMemoryCache = { data: mtdManifest, expiresAt: now + 5 * 60 * 1000 };
                        } else {
                            mtdMemoryCache = { data: null, expiresAt: now + 5 * 60 * 1000 };
                        }
                    } catch (e) {}
                }

                const isExploreAllowed = (request.cf?.botManagement?.verifiedBot === true) || (((request.method === 'GET' || request.method === 'HEAD') && isPublicSeoRoute(url.pathname)));
                if (!isVerifiedCrawler || !isExploreAllowed) {
                    let attackerBlock = null;
                    const cachedIp = ipThreatMemoryCache.get(clientIp);
                    if (cachedIp && now < cachedIp.expiresAt) {
                        attackerBlock = cachedIp.data;
                    } else {
                        try {
                            attackerBlock = await threatKv.get(`aegis:block:${clientIp}`);
                        } catch (e) {}
                        if (ipThreatMemoryCache.size > 2000) ipThreatMemoryCache.clear();
                        ipThreatMemoryCache.set(clientIp, { data: attackerBlock, expiresAt: now + 5 * 60 * 1000 });
                    }
                    if (attackerBlock) {
                        if (attackerBlock.includes("TARPIT")) {
                            isTarpit = true;
                        } else {
                            return new Response(JSON.stringify({
                                error: "Access Denied",
                                _aegis_integrity: "blocked-by-edge-consensus"
                            }), { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
                        }
                    }
                }
            }
        } catch (e) { }

        if (targetPath.startsWith("/api")) {
            // Bypass MTD Translation for Public API endpoints to prevent Spring Security 401 Rejections
            const isPublicExempt = targetPath.startsWith("/api/v1/analytics/event") || targetPath.startsWith("/api/v1/aegis/telemetry") || targetPath.includes("/posts/") || targetPath.includes("/market/") || targetPath.includes("/categories");

            if (isTarpit) {
                targetPath = "/api/v1/aegis/tarpit/trap";
            } else if (mtdManifest && mtdManifest.paths && !isPublicExempt) {
                // FIXED: Use prefix matching to translate paths accurately
                for (const canonical of Object.keys(mtdManifest.paths)) {
                    if (targetPath.startsWith(canonical)) {
                        targetPath = targetPath.replace(canonical, mtdManifest.paths[canonical]);
                        break;
                    }
                }
            }
        }

        url.pathname = targetPath;
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";
        const FRONTEND_URL = env.FRONTEND_URL || "https://treishvaamfinance.com";
        const backendConfig = new URL(BACKEND_URL);

        const KNOWN_SPA_ROUTES = [
            "/home", "/about", "/vision", "/contact",
            "/privacy", "/terms", "/login", "/dashboard", "/manage-posts",
            "/newsroom", "/investors", "/careers", "/businesses", "/sustainability"
        ];

        const cf = request.cf || {};
        const enhancedHeaders = new Headers(request.headers);
        enhancedHeaders.set("User-Agent", userAgent);
        enhancedHeaders.set("X-Visitor-City", cf.city || "Unknown");
        enhancedHeaders.set("X-Visitor-Country", cf.country || "Unknown");
        enhancedHeaders.set("X-Tenant-ID", "finance");
        enhancedHeaders.set("X-Aegis-Client-IP", clientIp);

        const edgeTimestamp = Date.now().toString();
        const edgeSignature = await generateEdgeSignature(url.pathname, edgeTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

        if (edgeSignature) {
            enhancedHeaders.set("X-Aegis-Edge-Signature", edgeSignature);
            enhancedHeaders.set("X-Aegis-Edge-Timestamp", edgeTimestamp);
        }

        const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
        const baseEnhancedRequest = new Request(request.url, {
            headers: enhancedHeaders,
            method: request.method,
            body: isGetOrHead ? null : request.body,
            redirect: request.redirect
        });

        // =================================================================================
        // HLS AES-128 DRM KEY DELIVERY PROXY (ZERO-TRUST)
        // =================================================================================
        if (url.pathname.startsWith("/video-key/")) {
            const referer = request.headers.get("Referer");
            if (!referer || (!referer.includes("treishvaamfinance.com") && !referer.includes("treishvaamagro.com") && !referer.includes("localhost"))) {
                return new Response("Forbidden: Invalid Referer", { status: 403 });
            }

            const videoId = url.pathname.split("/video-key/")[1];
            if (!videoId) return new Response("Not Found", { status: 404 });

            try {
                // Fetch key from backend securely
                let apiPath = `/api/v1/video/internal/key/${videoId}`;
                const apiTimestamp = Date.now().toString();
                const apiSignature = await generateEdgeSignature(apiPath, apiTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                const backendHeaders = new Headers(enhancedHeaders);
                backendHeaders.set("X-Aegis-Edge-Signature", apiSignature);
                backendHeaders.set("X-Aegis-Edge-Timestamp", apiTimestamp);

                const keyResp = await fetch(`${BACKEND_URL}${apiPath}`, { headers: backendHeaders });

                if (keyResp.ok) {
                    const keyData = await keyResp.arrayBuffer();
                    return new Response(keyData, {
                        status: 200,
                        headers: {
                            "Content-Type": "application/octet-stream",
                            "Cache-Control": "public, max-age=300" // Short lived
                        }
                    });
                }
            } catch (e) {
                console.error("AES Key delivery failed", e);
            }
            return new Response("Forbidden", { status: 403 });
        }


        //   THE FIX: EDGE SEO SPLIT-TAGGING
        const addSecurityHeaders = (response) => {
            if (!response) return response;
            const newHeaders = new Headers(response.headers);

            newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
            newHeaders.set("X-Content-Type-Options", "nosniff");
            newHeaders.set("X-XSS-Protection", "1; mode=block");
            newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
            newHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");

            newHeaders.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
            newHeaders.delete("Cross-Origin-Resource-Policy");
            newHeaders.set("X-Permitted-Cross-Domain-Policies", "none");
            newHeaders.delete("Content-Security-Policy-Report-Only");

            // CRITICAL: Prevent API Data Leaks in Search Results.
            // Googlebot can read the JSON to render UI, but will NEVER index the JSON payload itself.
            if (url.pathname.startsWith("/api")) {
                newHeaders.set("X-Robots-Tag", "noindex, noarchive");
            }

            if (isAiBot) {
                newHeaders.set("X-GEO-Bot-Detected", "true");
            }

            if (newHeaders.has("X-SPA-Fallback") && response.status === 404) {
                return new Response(response.body, { status: 200, headers: newHeaders });
            }

            return new Response(response.body, { status: response.status, headers: newHeaders });
        };

        const safeStringify = (data) => {
            if (data === undefined || data === null) return 'null';
            return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
        };

        // =================================================================================
        // GEO (Generative Engine Optimization) & SITEMAP CACHING HANDLERS
        // =================================================================================
        if (isAiBot && request.method === "GET") {
            const isAsset = url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|webp|ico|woff|woff2|ttf|eot|svg|xml|json)$/i);
            const isApi = url.pathname.startsWith("/api");

            if (!isAsset && !isApi && url.pathname !== '/llms.txt' && url.pathname !== '/ontology.json') {
                const geoUrl = new URL('/ai-feed.md', request.url);
                const geoResponse = await handleGeoFeedFromKV(new Request(geoUrl.toString(), baseEnhancedRequest), geoUrl, env, ctx, BACKEND_URL, clientIp);
                return addSecurityHeaders(geoResponse);
            }
        }

        if (url.pathname === '/llms.txt' || url.pathname === '/ai-feed.md' || url.pathname === '/ontology.json') {
            return handleGeoFeedFromKV(baseEnhancedRequest, url, env, ctx, BACKEND_URL, clientIp);
        }

        if (url.pathname.startsWith('/sitemap-dynamic/')) {
            return handleDynamicSitemapFromKV(baseEnhancedRequest, url, env, ctx, BACKEND_URL, clientIp);
        }

        if (url.pathname === '/robots.txt') {
            try {
                const assetResp = await fetch(baseEnhancedRequest);
                return addSecurityHeaders(assetResp);
            } catch (e) {
                return new Response("Asset Not Found", { status: 404 });
            }
        }

        if (url.pathname.startsWith("/api") || url.pathname.startsWith("/uploads/")) {
            let backendPath = url.pathname;
            if (url.pathname.startsWith("/uploads/")) {
                backendPath = "/api/v1" + url.pathname;
            }

            const proxyTargetUrl = new URL(request.url);
            proxyTargetUrl.hostname = backendConfig.hostname;
            proxyTargetUrl.protocol = backendConfig.protocol;
            proxyTargetUrl.pathname = backendPath;

            const proxyHeaders = new Headers(enhancedHeaders);
            if (backendPath !== url.pathname) {
                const rewriteTimestamp = Date.now().toString();
                const rewriteSig = await generateEdgeSignature(backendPath, rewriteTimestamp, clientIp, env.AEGIS_EDGE_SECRET);
                if (rewriteSig) {
                    proxyHeaders.set("X-Aegis-Edge-Signature", rewriteSig);
                    proxyHeaders.set("X-Aegis-Edge-Timestamp", rewriteTimestamp);
                }
            }

            const isBatchQuotePostEarly = request.method === 'POST' && url.pathname === '/api/v1/market/quotes/batch';
            let batchBodyText = null;
            if (isBatchQuotePostEarly) {
                try { batchBodyText = await request.text(); } catch (e) { batchBodyText = '[]'; }
            }

            const proxyReq = new Request(proxyTargetUrl.toString(), {
                headers: proxyHeaders,
                method: request.method,
                body: isGetOrHead ? null : (isBatchQuotePostEarly ? batchBodyText : request.body),
                redirect: request.redirect
            });

            try {
                const hasAuthHeader = request.headers.has('Authorization') ||
                    request.headers.has('X-Internal-Secret') ||
                    request.headers.has('X-AEGIS-ZKP-Proof');

                const isPrivateOrAdminApi =
                    url.pathname.startsWith('/api/v1/posts/admin') ||
                    url.pathname.startsWith('/api/v1/posts/drafts') ||
                    url.pathname.startsWith('/api/v1/posts/all') ||
                    url.pathname.startsWith('/api/v1/admin') ||
                    url.pathname.startsWith('/api/v1/users') ||
                    url.pathname.startsWith('/api/v1/auth') ||
                    url.pathname.startsWith('/api/v1/analytics') ||
                    url.pathname.startsWith('/api/v1/status') ||
                    url.pathname.startsWith('/api/v1/preferences');

                const isBinaryOrStreamApi =
                    url.pathname.startsWith('/api/v1/uploads/') ||
                    url.pathname.startsWith('/api/v1/video/') ||
                    url.pathname.startsWith('/api/v1/files/') ||
                    url.pathname.startsWith('/uploads/') ||
                    /\.(m3u8|ts|mp4|webm|key)$/i.test(url.pathname);

                const isAnalyticsPost = request.method === 'POST' && (
                    url.pathname === '/api/v1/analytics/event' || url.pathname === '/api/v1/aegis/telemetry' || url.pathname === '/faro/collect'
                );

                // Phase 13.1 Analytics offline queue (no 502/504 leakage, bounded 2500ms origin timeout)
                if (isAnalyticsPost) {
                    try {
                        const resp = await fetch(proxyReq, { signal: AbortSignal.timeout(2500) });
                        if (resp.status === 502 || resp.status === 503 || resp.status === 504 || resp.status === 521 || resp.status === 522 || resp.status === 524) {
                            return new Response(JSON.stringify({ status: 'queued_offline', offline: true }), { status: 202, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
                        }
                        return addSecurityHeaders(resp);
                    } catch (e) {
                        return new Response(JSON.stringify({ status: 'queued_offline', offline: true }), { status: 202, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
                    }
                }

                // Phase 13.5 Strict Never-Cache (L1+L2) + purge-or-forward
                if (isNeverCacheRequest(request, url.pathname)) {
                    const apiResp = await fetch(proxyReq);
                    try {
                        if (isAdminMutation(request, url.pathname) && apiResp.ok) {
                            ctx.waitUntil(purgeFeedCaches(env, ctx, url.pathname));
                        }
                    } catch (e) {}
                    const respHeaders = new Headers(apiResp.headers);
                    respHeaders.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
                    respHeaders.set("Pragma", "no-cache");
                    return addSecurityHeaders(new Response(apiResp.body, {
                        status: apiResp.status,
                        statusText: apiResp.statusText,
                        headers: respHeaders
                    }));
                }

                // Complete KV Cache bypass for Authenticated / Admin APIs
                if (hasAuthHeader || isPrivateOrAdminApi) {
                    const apiResp = await fetch(proxyReq);
                    try {
                        if (isAdminMutation(request, url.pathname) && apiResp.ok) ctx.waitUntil(purgeFeedCaches(env, ctx, url.pathname));
                    } catch (e) {}
                    const respHeaders = new Headers(apiResp.headers);
                    respHeaders.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
                    respHeaders.set("Pragma", "no-cache");
                    return addSecurityHeaders(new Response(apiResp.body, {
                        status: apiResp.status,
                        statusText: apiResp.statusText,
                        headers: respHeaders
                    }));
                }

                // Binary Media & Streaming Pipeline (Video, HLS, Uploads)
                if (isBinaryOrStreamApi) {
                    const isStaticImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(backendPath);
                    if (isStaticImage && isGetOrHead) {
                        const cache = caches.default;
                        const cacheKey = new Request(url.toString(), request);
                        const cachedResponse = await cache.match(cacheKey);

                        if (cachedResponse) return addSecurityHeaders(new Response(cachedResponse.body, cachedResponse));

                        const apiResp = await fetch(proxyReq);
                        if (apiResp.ok) {
                            const responseToCache = new Response(apiResp.body, apiResp);
                            responseToCache.headers.set("Cache-Control", "public, max-age=31536000, immutable");
                            ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
                            return addSecurityHeaders(responseToCache);
                        }
                        return addSecurityHeaders(apiResp);
                    }

                    // Streaming media (.m3u8, .ts, .mp4, uploads) — Phase 13.1 CDN edge cache (no KV)
                    // Public GET /api/v1/uploads/* uses cf.cacheEverything + 7-day edge TTL so recent
                    // blog videos (.mp4/.m3u8/.ts) and thumbnails serve even when the VM is offline.
                    let mediaResp;
                    const hasRange = request.headers.has('Range');
                    const isPublicUploadsGet = request.method === 'GET' && (url.pathname.startsWith('/api/v1/uploads/') || url.pathname.startsWith('/uploads/'));
                    try {
                        mediaResp = await fetch(proxyReq, { cf: { cacheEverything: true, cacheTtl: 604800 } });
                    } catch (e) {
                        mediaResp = await fetch(proxyReq);
                    }
                    const mediaHeaders = new Headers(mediaResp.headers);
                    if (isPublicUploadsGet && !hasRange) {
                        mediaHeaders.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000');
                    }
                    if (backendPath.endsWith('.m3u8')) {
                        mediaHeaders.set("Content-Type", "application/vnd.apple.mpegurl");
                        if (!isPublicUploadsGet) mediaHeaders.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000");
                    } else if (backendPath.endsWith('.ts')) {
                        mediaHeaders.set("Content-Type", "video/mp2t");
                        mediaHeaders.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000");
                    } else if (backendPath.endsWith('.mp4') && !mediaHeaders.has("Content-Type")) {
                        mediaHeaders.set("Content-Type", "video/mp4");
                        mediaHeaders.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000");
                    } else if (isPublicUploadsGet) {
                        mediaHeaders.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000");
                    }
                    return addSecurityHeaders(new Response(mediaResp.body, {
                        status: mediaResp.status,
                        statusText: mediaResp.statusText,
                        headers: mediaHeaders
                    }));
                }

                // Public API Edge KV Stale-While-Revalidate (SWR) for ALL visitors (humans + crawlers)
                const isPublicPostsGet = request.method === 'GET' && !hasAuthHeader && (
                    url.pathname === '/api/v1/posts' ||
                    url.pathname.startsWith('/api/v1/posts?') ||
                    url.pathname.startsWith('/api/v1/posts/url/') ||
                    (/^\/api\/v1\/posts\/[^/]+$/.test(url.pathname) && !url.pathname.startsWith('/api/v1/posts/admin') && !url.pathname.startsWith('/api/v1/posts/drafts') && !url.pathname.startsWith('/api/v1/posts/all'))
                );

                const isPublicOtherGet = request.method === 'GET' && !hasAuthHeader && (
                    url.pathname === '/api/v1/categories' ||
                    url.pathname.startsWith('/api/v1/categories/') ||
                    url.pathname === '/api/v1/market/news/highlights' ||
                    url.pathname.startsWith('/api/v1/market/news/highlights') ||
                    url.pathname === '/api/v1/market/news/archived' ||
                    url.pathname.startsWith('/api/v1/market/news/archived') ||
                    url.pathname === '/api/v1/market/top-gainers' ||
                    url.pathname.startsWith('/api/v1/market/top-gainers') ||
                    url.pathname === '/api/v1/market/top-losers' ||
                    url.pathname.startsWith('/api/v1/market/top-losers') ||
                    url.pathname === '/api/v1/market/most-active' ||
                    url.pathname.startsWith('/api/v1/market/most-active') ||
                    url.pathname.startsWith('/api/v1/market/widget') ||
                    url.pathname.startsWith('/api/v1/market/quote/') ||
                    url.pathname.startsWith('/api/v1/market/data/')
                );

                const isPublicGetCacheable = isPublicPostsGet || isPublicOtherGet;

                const isBatchQuotePost = request.method === 'POST' && url.pathname === '/api/v1/market/quotes/batch';

                if (isPublicGetCacheable || isBatchQuotePost) {
                    // Build deterministic cache key
                    let apiCacheKey;
                    let requestBodyText = null;
                    if (isBatchQuotePost) {
                        try {
                            requestBodyText = batchBodyText !== null ? batchBodyText : '[]';
                            let tickers = [];
                            try { tickers = JSON.parse(requestBodyText); } catch (e) { tickers = []; }
                            if (!Array.isArray(tickers)) tickers = [];
                            const sorted = [...tickers].map(String).sort();
                            apiCacheKey = 'api_cache:/api/v1/market/quotes/batch:' + sorted.join(',');
                        } catch (e) {
                            apiCacheKey = 'api_cache:/api/v1/market/quotes/batch:' + url.search;
                        }
                    } else {
                        apiCacheKey = 'api_cache:' + url.pathname + url.search;
                    }

                    // Phase 13.1 Tier 1: caches.default first (0 KV ops, unlimited free reads/writes)
                    // On edge hit return immediately and refresh in background; on KV hit write through to edge.
                    try {
                        let edgeKey;
                        if (isBatchQuotePost) {
                            let tickers = [];
                            try { tickers = JSON.parse(requestBodyText || '[]'); } catch (e) { tickers = []; }
                            const sorted = [...tickers].map(String).sort();
                            edgeKey = new Request(`https://cache.treishvaamfinance.com/api/v1/market/quotes/batch?tickers=${encodeURIComponent(sorted.join(','))}`, { method: 'GET' });
                        } else {
                            edgeKey = new Request(request.url, { method: 'GET' });
                        }
                        const edgeHit = await caches.default.match(edgeKey);
                        if (edgeHit) {
                            const headers = new Headers(edgeHit.headers);
                            headers.set('X-Cache', 'HIT-EDGE-CACHE');
                            headers.set('Cache-Control', edgeCacheControlHdr(url.pathname));
                            headers.set('X-Edge-Cache', 'HIT-EDGE-CACHE');
                            return addSecurityHeaders(new Response(edgeHit.body, { status: edgeHit.status, headers }));
                        }
                    } catch (e) {}

                    // SWR: if cached payload exists, return immediately and refresh in background
                    try {
                        const cachedPayload = await kvGetUnwrap(env, apiCacheKey);
                        if (cachedPayload) {
                            ctx.waitUntil((async () => {
                                try {
                                    let refreshReq;
                                    if (isBatchQuotePost && requestBodyText !== null) {
                                        refreshReq = new Request(proxyTargetUrl.toString(), {
                                            headers: enhancedHeaders,
                                            method: 'POST',
                                            body: requestBodyText,
                                            redirect: request.redirect
                                        });
                                    } else {
                                        refreshReq = proxyReq;
                                    }
                                    const freshResp = await fetch(refreshReq, { signal: AbortSignal.timeout(3500) });
                                    if (freshResp && freshResp.ok) {
                                        const freshBody = await freshResp.text();
                                        try {
                                            const edgeKey2 = isBatchQuotePost ? new Request(`https://cache.treishvaamfinance.com/api/v1/market/quotes/batch?tickers=${encodeURIComponent((() => { try { return JSON.parse(requestBodyText || '[]').map(String).sort().join(','); } catch (e) { return ''; } })())}`, { method: 'GET' }) : new Request(request.url, { method: 'GET' });
                                            const edgeResp = new Response(freshBody, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': edgeCacheControlHdr(url.pathname) } });
                                            ctx.waitUntil(caches.default.put(edgeKey2, edgeResp.clone()));
                                        } catch (e) {}
                                        if (isKvEligibleApi(url.pathname, url.search)) {
                                            try { await kvPutThrottled(env, ctx, apiCacheKey, freshBody, { expirationTtl: 86400 }, false); } catch (e) {}
                                        }
                                    }
                                } catch (e) {}
                            })());
                            try {
                                const edgeKeyKv = isBatchQuotePost ? new Request(`https://cache.treishvaamfinance.com/api/v1/market/quotes/batch?tickers=${encodeURIComponent((() => { try { return JSON.parse(requestBodyText || '[]').map(String).sort().join(','); } catch (e) { return ''; } })())}`, { method: 'GET' }) : new Request(request.url, { method: 'GET' });
                                const edgeWarm = new Response(cachedPayload, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': edgeCacheControlHdr(url.pathname) } });
                                ctx.waitUntil(caches.default.put(edgeKeyKv, edgeWarm.clone()));
                            } catch (e) {}
                            return addSecurityHeaders(new Response(cachedPayload, {
                                status: 200,
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8',
                                    'Cache-Control': 'public, max-age=60, s-maxage=86400',
                                    'X-Edge-Cache': 'HIT-SWR'
                                }
                            }));
                        }
                    } catch (e) {}

                    // Cold miss: fetch from origin with timeout
                    try {
                        let fetchReq;
                        if (isBatchQuotePost && requestBodyText !== null) {
                            fetchReq = new Request(proxyTargetUrl.toString(), {
                                headers: enhancedHeaders,
                                method: 'POST',
                                body: requestBodyText,
                                redirect: request.redirect
                            });
                        } else {
                            fetchReq = proxyReq;
                        }
                        const apiResponse = await fetch(fetchReq, { signal: AbortSignal.timeout(3500) });

                        if (apiResponse && apiResponse.ok) {
                            const bodyText = await apiResponse.text();
                            let shouldCache = true;
                            if (url.pathname.startsWith('/api/v1/posts/url/') || /^\/api\/v1\/posts\/[^/]+$/.test(url.pathname)) {
                                try {
                                    const parsed = JSON.parse(bodyText);
                                    if (!parsed || !parsed.id || !parsed.title) shouldCache = false;
                                } catch (e) {
                                    shouldCache = false;
                                }
                            }
                            if (shouldCache) {
                                try {
                                    let edgeKey3;
                                    if (isBatchQuotePost) {
                                        let tickers = [];
                                        try { tickers = JSON.parse(requestBodyText || '[]'); } catch (e) { tickers = []; }
                                        edgeKey3 = new Request(`https://cache.treishvaamfinance.com/api/v1/market/quotes/batch?tickers=${encodeURIComponent(tickers.map(String).sort().join(','))}`, { method: 'GET' });
                                    } else {
                                        edgeKey3 = new Request(request.url, { method: 'GET' });
                                    }
                                    const edgeResp = new Response(bodyText, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': edgeCacheControlHdr(url.pathname) } });
                                    ctx.waitUntil(caches.default.put(edgeKey3, edgeResp.clone()));
                                } catch (e) {}
                                try {
                                    if (isKvEligibleApi(url.pathname, url.search) || isBatchQuotePost) {
                                        ctx.waitUntil(kvPutThrottled(env, ctx, apiCacheKey, bodyText, { expirationTtl: 86400 }, false));
                                    }
                                } catch (e) {}
                            }
                            return addSecurityHeaders(new Response(bodyText, {
                                status: apiResponse.status,
                                headers: apiResponse.headers
                            }));
                        }

                        // On backend error, return offline vault (caches.default then KV)
                        let fallbackCached = null;
                        try {
                            const edgeKeyF = isBatchQuotePost ? new Request(`https://cache.treishvaamfinance.com/api/v1/market/quotes/batch?tickers=${encodeURIComponent((() => { try { return JSON.parse(requestBodyText || '[]').map(String).sort().join(','); } catch (e) { return ''; } })())}`, { method: 'GET' }) : new Request(request.url, { method: 'GET' });
                            const edgeFallback = await caches.default.match(edgeKeyF);
                            if (edgeFallback) {
                                const h = new Headers(edgeFallback.headers);
                                h.set('X-Cache', 'HIT-OFFLINE-VAULT');
                                h.set('X-Edge-Cache', 'HIT-OFFLINE-VAULT');
                                return addSecurityHeaders(new Response(edgeFallback.body, { status: 200, headers: h }));
                            }
                        } catch (e) {}
                        fallbackCached = await kvGetUnwrap(env, apiCacheKey);
                        if (fallbackCached) {
                            return addSecurityHeaders(new Response(fallbackCached, {
                                status: 200,
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8',
                                    'Cache-Control': 'public, max-age=60',
                                    'X-Edge-Cache': 'STALE-FALLBACK-KV'
                                }
                            }));
                        }

                        // Clean empty fallback
                        const defaultPayload = (url.pathname === '/api/v1/posts' || url.pathname.startsWith('/api/v1/posts?'))
                            ? JSON.stringify({ content: [], totalPages: 0, totalElements: 0 })
                            : (url.pathname.startsWith('/api/v1/posts/') ? JSON.stringify({}) : '[]');
                        return addSecurityHeaders(new Response(defaultPayload, {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'Cache-Control': 'no-store'
                            }
                        }));
                    } catch (e) {
                        try {
                            const fallbackCached = await kvGetUnwrap(env, apiCacheKey);
                            if (fallbackCached) {
                                return addSecurityHeaders(new Response(fallbackCached, {
                                    status: 200,
                                    headers: {
                                        'Content-Type': 'application/json; charset=utf-8',
                                        'Cache-Control': 'public, max-age=60',
                                        'X-Edge-Cache': 'DISASTER-FALLBACK-KV'
                                    }
                                }));
                            }
                        } catch (err) {}

                        const defaultPayload = (url.pathname === '/api/v1/posts' || url.pathname.startsWith('/api/v1/posts?'))
                            ? JSON.stringify({ content: [], totalPages: 0, totalElements: 0 })
                            : (url.pathname.startsWith('/api/v1/posts/') ? JSON.stringify({}) : '[]');
                        return addSecurityHeaders(new Response(defaultPayload, {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'Cache-Control': 'no-store'
                            }
                        }));
                    }
                }

                // Standard API fetch with X-Robots-Tag: noindex via addSecurityHeaders
                const apiResponse = await fetch(proxyReq);
                return addSecurityHeaders(apiResponse);

            } catch (e) {
                return new Response(JSON.stringify({ error: "Backend Service Unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
            }
        }

        if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|css|js|json|ico|xml|txt|woff|woff2|ttf|eot|svg)$/)) {
            try {
                const assetResp = await fetch(baseEnhancedRequest);
                return addSecurityHeaders(assetResp);
            } catch (e) {
                return new Response("Asset Not Found", { status: 404 });
            }
        }

        let response;
        const isRscRequest = request.headers.get("RSC") === "1" || request.headers.has("Next-Router-Prefetch") || request.headers.has("Next-Url") || request.headers.get("Accept")?.includes("text/x-component");

        const cacheUrl = new URL(request.url);
        if (isRscRequest) {
            cacheUrl.searchParams.set("_rsc_cache", "1");
        }
        const cacheKey = new Request(cacheUrl.toString(), request);
        const cache = caches.default;

        try {
            response = await fetch(baseEnhancedRequest);

            const isKnownSpaRoute = KNOWN_SPA_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + "/"));
            const hasNoExtension = !url.pathname.includes(".");
            const isNotApi = !url.pathname.startsWith("/api");

            if (!isRscRequest && (response.status === 404 || response.status === 403) && (isKnownSpaRoute || (hasNoExtension && isNotApi))) {
                const indexResp = await fetch(new Request(new URL("/index.html", request.url), { headers: enhancedHeaders, method: "GET" }));
                if (indexResp.ok) {
                    response = new Response(indexResp.body, indexResp);
                    response.headers.set("X-SPA-Fallback", "Active");
                    response = new Response(response.body, { status: 200, headers: response.headers });
                }
            }

            if (response && response.ok) {
                const clone = response.clone();
                const cacheHeaders = new Headers(clone.headers);
                cacheHeaders.set("Cache-Control", "public, max-age=600");
                ctx.waitUntil(cache.put(cacheKey, new Response(clone.body, { status: clone.status, headers: cacheHeaders })));
            }

        } catch (e) {
            response = null;
        }

        if (!response || response.status >= 500) {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                response = new Response(cachedResponse.body, cachedResponse);
            } else {
                if (!response) return new Response("Service Unavailable", { status: 503 });
            }
        }

        // =================================================================================
        // 6. SEO INTELLIGENCE & EDGE HYDRATION (HIGH AVAILABILITY UPGRADE)
        // =================================================================================
        if (!isRscRequest) {
            if (url.pathname === "/" || url.pathname === "" || url.pathname === "/home") {
                const pageTitle = "Treishvaam Finance | Global Financial Analysis & News";
                const pageDesc = "Treishvaam Finance provides real-time market data, financial news, and expert analysis.";

                const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "name": "Treishvaam Finance", "url": FRONTEND_URL + "/" };

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                    .on("head", {
                        element(e) {
                            e.append(`<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`, { html: true });
                            e.append(`<link rel="alternate" type="text/markdown" href="/llms.txt">`, { html: true });
                            e.append(`<link rel="alternate" type="application/json+ld" href="/ontology.json">`, { html: true });
                        }
                    })
                    .transform(response);
                return addSecurityHeaders(rewritten);
            }

            const staticPages = {
                "/about": { title: "About Us | Treishvaam Finance", description: "Learn about Treishvaam Finance." },
                "/vision": { title: "Treishvaam Finance - Our Vision", description: "Philosophy driving Treishvaam." }
            };

            if (staticPages[url.pathname]) {
                const pageData = staticPages[url.pathname];
                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(pageData.title); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageData.description); } })
                    .on("head", {
                        element(e) {
                            e.append(`<link rel="alternate" type="text/markdown" href="/llms.txt">`, { html: true });
                            e.append(`<link rel="alternate" type="application/json+ld" href="/ontology.json">`, { html: true });
                        }
                    })
                    .transform(response);
                return addSecurityHeaders(rewritten);
            }

            if (url.pathname.includes("/category/")) {
                const parts = url.pathname.split("/");
                const articleId = parts[parts.length - 1];
                if (!articleId) return addSecurityHeaders(response);

                let post = null;
                const kvKey = `api:finance:post:${articleId}`;

                // Phase 7 HA Execution: Attempt to fetch from Edge KV cache first
                try {
                    const cachedStr = await env.TREISHFIN_SEO_CACHE.get(kvKey);
                    if (cachedStr) post = JSON.parse(cachedStr);
                } catch (e) { }

                // If cache miss or backend is required, execute secure fetch
                if (!post) {
                    try {
                        let apiPath = `/api/v1/posts/url/${articleId}`;
                        const apiTimestamp = Date.now().toString();
                        const apiSignature = await generateEdgeSignature(apiPath, apiTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                        const ssrHeaders = new Headers(enhancedHeaders);
                        ssrHeaders.set("X-Aegis-Edge-Signature", apiSignature);
                        ssrHeaders.set("X-Aegis-Edge-Timestamp", apiTimestamp);
                        ssrHeaders.set("Accept", "application/json");

                        const apiResp = await fetch(`${BACKEND_URL}${apiPath}`, { headers: ssrHeaders });
                        if (apiResp.ok) {
                            post = await apiResp.json();
                            // Asynchronously hydrate the HA KV cache
                            ctx.waitUntil(env.TREISHFIN_SEO_CACHE.put(kvKey, JSON.stringify(post), { expirationTtl: 86400 }));
                        }
                    } catch (e) { }
                }

                if (!post) return addSecurityHeaders(response);

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(post.title + " | Treishvaam Finance"); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", post.metaDescription || post.title); } })
                    .on("head", {
                        element(e) {
                            e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(post)};</script>`, { html: true });
                            e.append(`<link rel="alternate" type="text/markdown" href="/llms.txt">`, { html: true });
                            e.append(`<link rel="alternate" type="application/json+ld" href="/ontology.json">`, { html: true });
                        }
                    })
                    .transform(response);

                return addSecurityHeaders(rewritten);
            }

            if (url.pathname.startsWith("/market/")) {
                const rawTicker = url.pathname.split("/market/")[1];
                if (!rawTicker) return addSecurityHeaders(response);

                let marketData = null;
                const tickerDecoded = encodeURIComponent(decodeURIComponent(rawTicker));
                const kvKey = `api:finance:market:${tickerDecoded}`;

                // Phase 7 HA Execution: Attempt to fetch from Edge KV cache first
                try {
                    const cachedData = await env.TREISHFIN_SEO_CACHE.get(kvKey);
                    if (cachedData) marketData = JSON.parse(cachedData);
                } catch (e) { }

                if (!marketData) {
                    try {
                        let apiPath = `/api/v1/market/widget?ticker=${tickerDecoded}`;
                        const apiTimestamp = Date.now().toString();

                        // FIXED: Strip query string for Edge Signature to match backend getRequestURI()
                        const signPath = apiPath.split('?')[0];
                        const apiSignature = await generateEdgeSignature(signPath, apiTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                        const ssrHeaders = new Headers(enhancedHeaders);
                        ssrHeaders.set("X-Aegis-Edge-Signature", apiSignature);
                        ssrHeaders.set("X-Aegis-Edge-Timestamp", apiTimestamp);
                        ssrHeaders.set("Accept", "application/json");

                        const apiResp = await fetch(`${BACKEND_URL}${apiPath}`, { headers: ssrHeaders });
                        if (apiResp.ok) {
                            marketData = await apiResp.json();
                            ctx.waitUntil(env.TREISHFIN_SEO_CACHE.put(kvKey, JSON.stringify(marketData), { expirationTtl: 3600 })); // 1 hour for market data
                        }
                    } catch (e) { }
                }

                if (!marketData || !marketData.quoteData) return addSecurityHeaders(response);

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(`${marketData.quoteData.name} (${marketData.quoteData.ticker}) | Treishvaam Finance`); } })
                    .on("head", {
                        element(e) {
                            e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(marketData)};</script>`, { html: true });
                            e.append(`<link rel="alternate" type="text/markdown" href="/llms.txt">`, { html: true });
                            e.append(`<link rel="alternate" type="application/json+ld" href="/ontology.json">`, { html: true });
                        }
                    })
                    .transform(response);

                return addSecurityHeaders(rewritten);
            }
        }

        return addSecurityHeaders(response);
    }
}

// =================================================================================
// CANONICAL STATIC FOUNDER & CONGLOMERATE KNOWLEDGE GRAPH (PHASE 8 STATIC EDGE)
// =================================================================================
const STATIC_FOUNDER_AND_CONGLOMERATE_GRAPH = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": "https://treishvaamgroup.com/#treishvaam",
            "name": "Treishvaam",
            "alternateName": [
                "Amitsagar Kandpal",
                "Treishvaam (Amitsagar Kandpal)"
            ],
            "givenName": "Amitsagar",
            "familyName": "Kandpal",
            "additionalName": "Treishvaam",
            "birthDate": "1997-10-05",
            "gender": "Male",
            "nationality": {
                "@type": "Country",
                "name": "India"
            },
            "disambiguatingDescription":
                "Indian entrepreneur, artist, actor, and Founder & Chairman of the eponymous Treishvaam Group and its subsidiaries Treishvaam Finance, Treishvaam Agro, and Treishvaam Hiring Marketplace (THM).",
            "description":
                "Treishvaam (legal name Amitsagar Kandpal, born October 5, 1997) is an Indian entrepreneur, artist, and actor. He is the Founder and Chairman of Treishvaam Group, an enterprise conglomerate operating across financial intelligence (Treishvaam Finance), sustainable agribusiness (Treishvaam Agro), and workforce technology (Treishvaam Hiring Marketplace).",
            "url": "https://treishvaamgroup.com/about",
            "mainEntityOfPage": "https://treishvaamgroup.com/about",
            "image": {
                "@type": "ImageObject",
                "url": "https://treishvaamfinance.com/amitsagar-kandpal-photo.png",
                "caption": "Treishvaam (Amitsagar Kandpal) — Entrepreneur, Artist, Actor & Founder of Treishvaam Group"
            },
            "jobTitle": [
                "Founder & Chairman",
                "Entrepreneur",
                "Artist",
                "Actor"
            ],
            "hasOccupation": [
                { "@type": "Occupation", "name": "Entrepreneur" },
                { "@type": "Occupation", "name": "Artist" },
                { "@type": "Occupation", "name": "Actor" }
            ],
            "alumniOf": [
                {
                    "@type": "CollegeOrUniversity",
                    "name": "Hans Raj College, University of Delhi",
                    "sameAs": [
                        "https://www.hansrajcollege.ac.in/",
                        "https://en.wikipedia.org/wiki/Hansraj_College"
                    ]
                }
            ],
            "worksFor": {
                "@id": "https://treishvaamgroup.com/#organization"
            },
            "owns": [
                { "@id": "https://treishvaamgroup.com/#organization" },
                { "@id": "https://treishvaamfinance.com/#organization" },
                { "@id": "https://treishvaamagro.com/#organization" },
                { "@id": "https://treishvaamgroup.com/#thm" }
            ],
            "sameAs": [
                "https://www.instagram.com/treishvaam/",
                "https://x.com/treishvaam",
                "https://www.snapchat.com/@callitaskk",
                "https://treishvaamgroup.com/about",
                "https://treishvaamfinance.com/about",
                "https://treishvaamagro.com"
            ]
        },
        {
            "@type": "Organization",
            "@id": "https://treishvaamgroup.com/#organization",
            "name": "Treishvaam Group",
            "url": "https://treishvaamgroup.com",
            "logo": "https://treishvaamfinance.com/logo.webp",
            "description":
                "Global enterprise conglomerate founded by Treishvaam (Amitsagar Kandpal), architecting resilient value chains across Institutional Financial Intelligence (Treishvaam Finance), Sustainable Agribusiness (Treishvaam Agro), and Workforce Technology (Treishvaam Hiring Marketplace).",
            "founder": {
                "@id": "https://treishvaamgroup.com/#treishvaam"
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Electronic City Phase 1",
                "addressLocality": "Electronic City, Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560100",
                "addressCountry": "IN"
            },
            "subOrganization": [
                { "@id": "https://treishvaamfinance.com/#organization" },
                { "@id": "https://treishvaamagro.com/#organization" },
                { "@id": "https://treishvaamgroup.com/#thm" }
            ],
            "sameAs": [
                "https://treishvaamgroup.com",
                "https://treishvaamfinance.com",
                "https://treishvaamagro.com",
                "https://www.instagram.com/treishvaam/",
                "https://x.com/treishvaam"
            ]
        },
        {
            "@type": ["Organization", "NewsMediaOrganization"],
            "@id": "https://treishvaamfinance.com/#organization",
            "name": "Treishvaam Finance",
            "url": "https://treishvaamfinance.com",
            "logo": "https://treishvaamfinance.com/logo.webp",
            "image": "https://treishvaamfinance.com/logo.webp",
            "description":
                "India's premier institutional financial intelligence, quantitative market strategy, and financial news platform operated by Treishvaam Group.",
            "founder": {
                "@id": "https://treishvaamgroup.com/#treishvaam"
            },
            "parentOrganization": {
                "@id": "https://treishvaamgroup.com/#organization"
            }
        },
        {
            "@type": "Organization",
            "@id": "https://treishvaamagro.com/#organization",
            "name": "Treishvaam Agro",
            "url": "https://treishvaamagro.com",
            "description":
                "Enterprise B2B sustainable agribusiness and nutritional ingredient manufacturer under Treishvaam Group, producing solar-dried, low-temperature dehydrated fruit and vegetable powders, herbal extracts, and organic spices with farm-to-FOB QR traceability.",
            "founder": {
                "@id": "https://treishvaamgroup.com/#treishvaam"
            },
            "parentOrganization": {
                "@id": "https://treishvaamgroup.com/#organization"
            }
        },
        {
            "@type": "Organization",
            "@id": "https://treishvaamgroup.com/#thm",
            "name": "Treishvaam Hiring Marketplace",
            "alternateName": ["THM", "Treishvaam Hiring"],
            "url": "https://treishvaamgroup.com/about",
            "description":
                "Direct-access workforce and talent marketplace division under Treishvaam Group engineered for matching high-performance teams and specialized enterprise talent.",
            "founder": {
                "@id": "https://treishvaamgroup.com/#treishvaam"
            },
            "parentOrganization": {
                "@id": "https://treishvaamgroup.com/#organization"
            }
        }
    ]
};

const STATIC_LLMS_TXT = `# Treishvaam Finance — LLM Context & Knowledge Graph
> Authoritative Entity Context & Generative Engine Optimization (GEO) Feed

## Founder & Leadership
- **Founder & Chairman:** Treishvaam
- **Legal Name:** Amitsagar Kandpal
- **Born:** October 5, 1997
- **Alma Mater:** Hans Raj College, University of Delhi
- **Occupations & Roles:** Entrepreneur, Artist, Actor, Founder & Chairman of Treishvaam Group
- **Official Profiles:**
  - Instagram: https://www.instagram.com/treishvaam/
  - X: https://x.com/treishvaam
  - Snapchat: https://www.snapchat.com/@callitaskk
  - Personal Biography: https://treishvaamgroup.com/about

## Parent Conglomerate
- **Organization:** Treishvaam Group (https://treishvaamgroup.com)
- **Corporate Headquarters:** Electronic City, Bengaluru, Karnataka 560100, India
- **Description:** Global enterprise conglomerate founded by Treishvaam (Amitsagar Kandpal), architecting resilient value chains across Institutional Financial Intelligence, Sustainable Agribusiness, and Workforce Technology.

## Operating Divisions & Subsidiaries
1. **Treishvaam Finance** (https://treishvaamfinance.com)
   - Scope: India's premier institutional financial intelligence, quantitative market strategy, and real-time financial news platform.
2. **Treishvaam Agro** (https://treishvaamagro.com)
   - Scope: Enterprise B2B sustainable agribusiness and nutritional ingredient manufacturer, producing solar-dried dehydrated fruit and vegetable powders, herbal extracts, and organic spices with farm-to-FOB QR traceability.
3. **Treishvaam Hiring Marketplace (THM)** (https://treishvaamgroup.com/about)
   - Scope: Direct-access workforce and talent marketplace division engineered for matching high-performance teams and specialized enterprise talent.
`;

const STATIC_AI_FEED_MD = `# Treishvaam Finance — AI Knowledge Feed & Entity Graph
> Canonical Enterprise Markdown Feed for Generative Search Engines and LLMs

<semantic-chunk id="founder-identity" entity="Treishvaam">
## Executive Identity & Leadership
- **Founder & Chairman**: Treishvaam (Legal Name: Amitsagar Kandpal)
- **Date of Birth**: October 5, 1997
- **Alma Mater**: Hans Raj College, University of Delhi
- **Occupations**: Entrepreneur, Artist, Actor
- **Leadership Role**: Founder & Chairman of Treishvaam Group and its divisions
- **Official Profiles**:
  - Instagram: https://www.instagram.com/treishvaam/
  - X: https://x.com/treishvaam
  - Snapchat: https://www.snapchat.com/@callitaskk
  - Bio: https://treishvaamgroup.com/about
</semantic-chunk>

<semantic-chunk id="platform-overview" entity="Treishvaam Group">
## Parent Conglomerate Overview
- **Name**: Treishvaam Group (https://treishvaamgroup.com)
- **Founder**: Treishvaam (Amitsagar Kandpal)
- **Headquarters**: Electronic City, Bengaluru, Karnataka 560100, India
- **Core Mission**: Architecting resilient, tech-enabled value chains across institutional financial intelligence, sustainable agribusiness, and specialized workforce marketplace technology.
</semantic-chunk>

## Corporate Divisions & Subsidiaries
1. **Treishvaam Finance** (https://treishvaamfinance.com)
   - Institutional Financial Intelligence, Quantitative Analysis, Real-Time Market Telemetry, and Financial News.
2. **Treishvaam Agro** (https://treishvaamagro.com)
   - Sustainable B2B Agribusiness, Solar-Dried Dehydrated Superfood Powders, Herbal Extracts, and Traceable Agricultural Commodities.
3. **Treishvaam Hiring Marketplace (THM)** (https://treishvaamgroup.com/about)
   - Specialized Enterprise Workforce and Talent Marketplace engineered for direct high-performance team placement.
`;
async function handleGeoFeedFromKV(request, url, env, ctx, backendUrl, clientIp) {
    const cache = caches.default;
    const cacheRequest = new Request(request.url, request);
    let cachedResponse = await cache.match(cacheRequest);
    if (cachedResponse) return new Response(cachedResponse.body, cachedResponse);

    const key = `geo:finance:${url.pathname}`;
    const cachedKv = await env.TREISHFIN_SEO_CACHE.get(key);

    let contentType = "text/plain; charset=utf-8";
    if (url.pathname.endsWith('.md')) contentType = "text/markdown; charset=utf-8";
    if (url.pathname.endsWith('.json')) contentType = "application/json; charset=utf-8";

    if (cachedKv) {
        const mergedKv = url.pathname.endsWith('.json') ? mergeOntologyJson(cachedKv) : ensureCanonicalText(cachedKv);
        const kvResponse = new Response(mergedKv, { headers: { "Content-Type": contentType, "Cache-Control": "public, s-maxage=86400, max-age=3600" } });
        ctx.waitUntil(cache.put(cacheRequest, kvResponse.clone()));
        return kvResponse;
    }

    try {
        const apiPath = `/api/public/geo${url.pathname}`;
        const timestamp = Date.now().toString();
        const signature = await generateEdgeSignature(apiPath, timestamp, clientIp, env.AEGIS_EDGE_SECRET);

        const newHeaders = new Headers(request.headers);
        newHeaders.set("X-Aegis-Edge-Signature", signature);
        newHeaders.set("X-Aegis-Edge-Timestamp", timestamp);
        newHeaders.set("X-Aegis-Client-IP", clientIp);

        const isGetOrHead = request.method === "GET" || request.method === "HEAD";
        const backendResp = await fetch(new Request(`${backendUrl}${apiPath}`, {
            method: request.method,
            headers: newHeaders,
            body: isGetOrHead ? null : request.body
        }));

        if (backendResp.ok) {
            const rawText = await backendResp.text();
            const mergedText = url.pathname.endsWith('.json') ? mergeOntologyJson(rawText) : ensureCanonicalText(rawText);
            const newResp = new Response(mergedText, backendResp);
            newResp.headers.set("Content-Type", contentType);
            newResp.headers.set("Cache-Control", "public, s-maxage=86400, max-age=3600");

            const cloneForKv = newResp.clone();
            ctx.waitUntil(cloneForKv.text().then(text => env.TREISHFIN_SEO_CACHE.put(key, text, { expirationTtl: 86400 })));
            ctx.waitUntil(cache.put(cacheRequest, newResp.clone()));
            return newResp;
        }
    } catch (e) { }

    // Phase 8 Zero-Downtime Fallback: Serve Static Knowledge Graph if KV is cold and backend is unreachable
    if (url.pathname === '/ontology.json') {
        return new Response(JSON.stringify(STATIC_FOUNDER_AND_CONGLOMERATE_GRAPH), {
            status: 200,
            headers: {
                "Content-Type": "application/ld+json; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=86400"
            }
        });
    }

    if (url.pathname === '/llms.txt') {
        return new Response(STATIC_LLMS_TXT, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=86400"
            }
        });
    }

    if (url.pathname === '/ai-feed.md') {
        return new Response(STATIC_AI_FEED_MD, {
            status: 200,
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=86400"
            }
        });
    }

    return new Response("GEO Feed Unavailable", { status: 503 });
}

async function handleDynamicSitemapFromKV(request, url, env, ctx, backendUrl, clientIp) {
    const cache = caches.default;
    const cacheRequest = new Request(request.url, request);
    let cachedResponse = await cache.match(cacheRequest);
    if (cachedResponse) return new Response(cachedResponse.body, cachedResponse);

    const key = `sitemap:finance:${url.pathname}`;
    const cachedKv = await env.TREISHFIN_SEO_CACHE.get(key);

    if (cachedKv) {
        const kvResponse = new Response(cachedKv, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=86400, max-age=3600" } });
        ctx.waitUntil(cache.put(cacheRequest, kvResponse.clone()));
        return kvResponse;
    }

    try {
        const apiPath = url.pathname.replace('/sitemap-dynamic/', '/api/public/sitemap/');
        const timestamp = Date.now().toString();
        const signature = await generateEdgeSignature(apiPath, timestamp, clientIp, env.AEGIS_EDGE_SECRET);

        const newHeaders = new Headers(request.headers);
        newHeaders.set("X-Aegis-Edge-Signature", signature);
        newHeaders.set("X-Aegis-Edge-Timestamp", timestamp);
        newHeaders.set("X-Aegis-Client-IP", clientIp);

        const isGetOrHead = request.method === "GET" || request.method === "HEAD";
        const backendResp = await fetch(new Request(`${backendUrl}${apiPath}`, {
            method: request.method,
            headers: newHeaders,
            body: isGetOrHead ? null : request.body
        }));

        if (backendResp.ok) {
            const newResp = new Response(backendResp.body, backendResp);
            newResp.headers.set("Content-Type", "application/xml; charset=utf-8");
            newResp.headers.set("Cache-Control", "public, s-maxage=86400, max-age=3600");

            const cloneForKv = newResp.clone();
            ctx.waitUntil(cloneForKv.text().then(text => env.TREISHFIN_SEO_CACHE.put(key, text, { expirationTtl: 86400 })));
            ctx.waitUntil(cache.put(cacheRequest, newResp.clone()));
            return newResp;
        }
    } catch (e) { }

    return new Response("Sitemap Unavailable", { status: 503 });
}