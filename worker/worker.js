/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise Edge Controller for Treishvaam Finance.
 * - Handles: Zero-Trust Security, Rich Result SEO Injection, KV-Backed Sitemap (Edge Replica).
 * - Serves as the L4-ADA (Active Deception Architecture) Edge Gateway.
 *
 * Scope:
 * - Intercepts all traffic to treishvaamfinance.com
 * - Manages routing between Static Frontend, Dynamic Backend, and KV Store.
 * - Enforces Global Crawler Matrix to protect digital footprints while dropping botnets.
 *
 * Critical Dependencies:
 * - Backend: via env.BACKEND_API_URL
 * - KV Namespace: TREISHFIN_SEO_CACHE
 * - KV Namespace: AEGIS_THREAT_KV (Phase 6.1)
 *
 * Security Constraints:
 * - Edge Signature uses HMAC-SHA-512 via `crypto.subtle`.
 * - SEO/AI Crawlers must explicitly bypass AEGIS threat evaluation to preserve indexability.
 * - Must never hardcode fallback URLs.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase - 500 RSC Stream Fix):
 * • Wrapped the ENTIRE "SEO INTELLIGENCE" block in `if (!isRscRequest)`.
 * - EDITED (Batch 8 - Advanced GEO Cache Miss Handling):
 * • Enhanced `handleGeoFeedFromKV` to elegantly handle cache misses without blocking the thread.
 * - EDITED (Post-Approval - Enterprise Cache & Cron Scaling):
 * • FIXED KV STORAGE HOLE: `handleDynamicSitemapFromKV` now asynchronously clones and writes backend responses to `TREISHFIN_SEO_CACHE` on cache misses.
 * - EDITED (Post-Approval - GSC Inspection Fix Phase 2):
 * • ADDED Edge User-Agent Normalization: `Google-InspectionTool` is now instantly aliased to `Googlebot`.
 * - EDITED (Post-Approval - Edge Body Sanitization):
 * • Enforced `body: null` for all GET/HEAD request clones inside `baseEnhancedRequest`, `proxyReq`, and KV-fetch fallbacks. 
 * - EDITED (Post-Approval - Edge SEO Split-Tagging & API Leak Prevention):
 * • Injected `X-Robots-Tag: noindex, noarchive` into all `/api/` responses via `addSecurityHeaders`.
 * • Why: Allows Googlebot to fetch JSON to render the React DOM (resolving 499 Client Closed Errors) without leaking raw backend JSON into Google Search Results. Protects Enterprise Knowledge Graph sovereignty.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
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
        } catch (e) { console.error("Cron Failed", e); }
    },

    // =================================================================================
    // 2. REQUEST HANDLER (MERGED LOGIC)
    // =================================================================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/sys/force-update') {
            await this.scheduled(null, env, ctx);
            return new Response("Manual Update Triggered! Sitemaps are regenerating.", { status: 200 });
        }

        if (url.pathname === '/sys/purge-cache') {
            try {
                const listed = await env.TREISHFIN_SEO_CACHE.list();
                for (const key of listed.keys) {
                    await env.TREISHFIN_SEO_CACHE.delete(key.name);
                }
                return new Response("Enterprise KV Cache Purged Successfully! All stale records annihilated.", { status: 200 });
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

        try {
            const threatKv = env.AEGIS_THREAT_KV || env.TREISHFIN_SEO_CACHE;

            const mtdManifestStr = await threatKv.get("aegis:mtd:manifest");
            if (mtdManifestStr) {
                mtdManifest = JSON.parse(mtdManifestStr);
            }

            if (!isVerifiedCrawler) {
                const attackerBlock = await threatKv.get(`aegis:block:${clientIp}`);
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
        } catch (e) { }

        if (targetPath.startsWith("/api")) {
            if (isTarpit) {
                targetPath = "/api/v1/aegis/tarpit/trap";
            } else if (mtdManifest && mtdManifest[targetPath]) {
                targetPath = mtdManifest[targetPath];
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

        // 🚀 THE FIX: EDGE SEO SPLIT-TAGGING
        const addSecurityHeaders = (response) => {
            if (!response) return response;
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
            newHeaders.set("X-Content-Type-Options", "nosniff");
            newHeaders.set("X-XSS-Protection", "1; mode=block");
            newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
            newHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
            newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
            newHeaders.set("Cross-Origin-Resource-Policy", "same-site");
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

        if (url.pathname.startsWith("/api")) {
            const proxyTargetUrl = new URL(request.url);
            proxyTargetUrl.hostname = backendConfig.hostname;
            proxyTargetUrl.protocol = backendConfig.protocol;
            proxyTargetUrl.pathname = url.pathname;

            const proxyReq = new Request(proxyTargetUrl.toString(), {
                headers: enhancedHeaders,
                method: request.method,
                body: isGetOrHead ? null : request.body,
                redirect: request.redirect
            });

            try {
                if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/) || url.pathname.includes("/uploads/")) {
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

                // Fetch the API and append X-Robots-Tag: noindex via addSecurityHeaders
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
        // 6. SEO INTELLIGENCE & EDGE HYDRATION
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
                "/vision": { title: "Treishvaam Finance · Our Vision", description: "Philosophy driving Treishvaam." }
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

                try {
                    let apiPath = `/api/v1/posts/url/${articleId}`;
                    if (mtdManifest && mtdManifest[apiPath]) apiPath = mtdManifest[apiPath];

                    const apiTimestamp = Date.now().toString();
                    const apiSignature = await generateEdgeSignature(apiPath, apiTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                    const ssrHeaders = new Headers(enhancedHeaders);
                    ssrHeaders.set("X-Aegis-Edge-Signature", apiSignature);
                    ssrHeaders.set("X-Aegis-Edge-Timestamp", apiTimestamp);

                    const apiResp = await fetch(`${BACKEND_URL}${apiPath}`, { headers: ssrHeaders });
                    if (!apiResp.ok) return addSecurityHeaders(response);
                    const post = await apiResp.json();

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
                } catch (e) { return addSecurityHeaders(response); }
            }

            if (url.pathname.startsWith("/market/")) {
                const rawTicker = url.pathname.split("/market/")[1];
                if (!rawTicker) return addSecurityHeaders(response);

                try {
                    let apiPath = `/api/v1/market/widget?ticker=${encodeURIComponent(decodeURIComponent(rawTicker))}`;
                    const apiTimestamp = Date.now().toString();
                    const apiSignature = await generateEdgeSignature(apiPath, apiTimestamp, clientIp, env.AEGIS_EDGE_SECRET);

                    const ssrHeaders = new Headers(enhancedHeaders);
                    ssrHeaders.set("X-Aegis-Edge-Signature", apiSignature);
                    ssrHeaders.set("X-Aegis-Edge-Timestamp", apiTimestamp);

                    const apiResp = await fetch(`${BACKEND_URL}${apiPath}`, { headers: ssrHeaders });
                    if (!apiResp.ok) return addSecurityHeaders(response);
                    const marketData = await apiResp.json();

                    if (!marketData.quoteData) return addSecurityHeaders(response);

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
                } catch (e) { return addSecurityHeaders(response); }
            }
        }

        return addSecurityHeaders(response);
    }
};

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
        const kvResponse = new Response(cachedKv, { headers: { "Content-Type": contentType, "Cache-Control": "public, s-maxage=86400, max-age=3600" } });
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
            const newResp = new Response(backendResp.body, backendResp);
            newResp.headers.set("Content-Type", contentType);
            newResp.headers.set("Cache-Control", "public, s-maxage=86400, max-age=3600");

            const cloneForKv = newResp.clone();
            ctx.waitUntil(cloneForKv.text().then(text => env.TREISHFIN_SEO_CACHE.put(key, text, { expirationTtl: 86400 })));
            ctx.waitUntil(cache.put(cacheRequest, newResp.clone()));

            return newResp;
        }
    } catch (e) { }

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