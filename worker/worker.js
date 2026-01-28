/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise Edge Controller for Treishvaam Finance.
 * - Handles: Zero-Trust Security, SEO Edge Hydration, KV-Backed Sitemap (Edge Replica).
 *
 * Scope:
 * - Intercepts all traffic to treishfin.treishvaamgroup.com
 * - Manages routing between Static Frontend (Pages), Dynamic Backend (API), and KV Store.
 *
 * Critical Dependencies:
 * - Backend: via env.BACKEND_API_URL or env.BACKEND_URL
 * - KV Namespace: TREISHFIN_SEO_CACHE (Required for Sitemap Uptime)
 * - Frontend: Cloudflare Pages (Static Assets)
 *
 * Security Constraints:
 * - Strict Content-Security-Policy (CSP).
 * - HSTS enforcement.
 * - No hardcoded secrets.
 *
 * Non-Negotiables:
 * - SITEMAP: Must serve from KV if Backend is down.
 * - SEO: Must hydrate HTML for Bots to prevent "blank page" indexing.
 * - AVAILABILITY: Must serve cached content on 5xx errors.
 * - FREE TIER: Cron scheduled hourly (0 * * * *) to respect limits.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Hybrid Sitemap Aggregation (Static + Dynamic).
 * - EDITED: Consolidated SEO, Security, Fallback.
 * - MERGED:
 * • RETAINED: SEO Hydration, Security Headers, Image Acceleration.
 * • REPLACED: Old Cache API sitemap logic with new KV-Backed logic.
 * • ADDED: Scheduled Handler for background updates.
 */

export default {
    // =================================================================================
    // 1. SCHEDULED TASKS (CRON JOB) - THE NEW ENGINE
    // =================================================================================
    async scheduled(event, env, ctx) {
        console.log("TRIGGER: Scheduled Sitemap Update");

        // We fetch the metadata first to know what files exist
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://api.treishvaamgroup.com";

        // 1. Update Metadata
        try {
            const metaResp = await fetch(`${BACKEND_URL}/api/public/sitemap/meta`, {
                headers: { "User-Agent": "Treishvaam-Worker-Crawler/1.0" }
            });
            if (metaResp.ok) {
                const metaJson = await metaResp.json();
                // Store Metadata in KV
                await env.TREISHFIN_SEO_CACHE.put("sitemap:meta", JSON.stringify(metaJson), { expirationTtl: 90000 }); // 25 hours

                // 2. Update Individual Sitemap Chunks (Rate Limited Loop)
                const filesToUpdate = [];
                if (metaJson.blogs) filesToUpdate.push(...metaJson.blogs.map(path => ({ key: `sitemap:${path}`, path })));
                if (metaJson.markets) filesToUpdate.push(...metaJson.markets.map(path => ({ key: `sitemap:${path}`, path })));

                // Update first 5 chunks to stay within execution limits (Incremental update)
                // In a real 10M+ scenario, we would use a cursor, but for now we prioritize the "latest" files (usually 0.xml)
                const priorityFiles = filesToUpdate.slice(0, 5);

                for (const file of priorityFiles) {
                    try {
                        const fileResp = await fetch(`${BACKEND_URL}${file.path}`, {
                            headers: { "User-Agent": "Treishvaam-Worker-Crawler/1.0" }
                        });
                        if (fileResp.ok && fileResp.headers.get("content-type")?.includes("xml")) {
                            const content = await fileResp.text();
                            await env.TREISHFIN_SEO_CACHE.put(file.key, content, { expirationTtl: 90000 });
                        }
                    } catch (e) { console.error(`Failed to update ${file.key}`); }
                }
            }
        } catch (e) { console.error("Cron Failed", e); }
    },

    // =================================================================================
    // 2. REQUEST HANDLER
    // =================================================================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 0. CONFIGURATION
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://api.treishvaamgroup.com";
        const FRONTEND_URL = env.FRONTEND_URL || "https://treishfin.treishvaamgroup.com";
        const PARENT_ORG_URL = "https://treishvaamgroup.com";

        const backendConfig = new URL(BACKEND_URL);

        // 1. UNIVERSAL HEADER INJECTION
        const cf = request.cf || {};
        const enhancedHeaders = new Headers(request.headers);

        // Geo Intelligence
        enhancedHeaders.set("X-Visitor-City", cf.city || "Unknown");
        enhancedHeaders.set("X-Visitor-Region", cf.region || "Unknown");
        enhancedHeaders.set("X-Visitor-Country", cf.country || "Unknown");
        enhancedHeaders.set("X-Visitor-Continent", cf.continent || "Unknown");
        enhancedHeaders.set("X-Visitor-Timezone", cf.timezone || "UTC");

        const baseEnhancedRequest = new Request(request.url, {
            headers: enhancedHeaders,
            method: request.method,
            body: request.body,
            redirect: request.redirect
        });

        // SECURITY HELPER
        const addSecurityHeaders = (response) => {
            if (!response) return response;
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
            newHeaders.set("X-Content-Type-Options", "nosniff");
            newHeaders.set("Content-Security-Policy", "frame-ancestors 'self';");
            newHeaders.set("X-XSS-Protection", "1; mode=block");
            newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
            newHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
            return new Response(response.body, { status: response.status, headers: newHeaders });
        };

        const safeStringify = (data) => {
            if (data === undefined || data === null) return 'null';
            return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
        };

        // ----------------------------------------------
        // 3. KV-BACKED SITEMAP LOGIC (NEW)
        // ----------------------------------------------

        // A. ROOT SITEMAP INDEX (/sitemap.xml)
        if (url.pathname === '/sitemap.xml') {
            return handleKVSitemapIndex(env, FRONTEND_URL, BACKEND_URL);
        }

        // B. DYNAMIC CHILD SITEMAPS (/sitemap-dynamic/...)
        if (url.pathname.startsWith('/sitemap-dynamic/')) {
            return handleDynamicSitemapFromKV(url, env, BACKEND_URL);
        }

        // ----------------------------------------------
        // 4. API PROXY + IMAGE ACCELERATION (EXISTING)
        // ----------------------------------------------
        if (url.pathname.startsWith("/api")) {
            const targetUrl = new URL(request.url);
            targetUrl.hostname = backendConfig.hostname;
            targetUrl.protocol = backendConfig.protocol;

            const proxyReq = new Request(targetUrl.toString(), {
                headers: enhancedHeaders,
                method: request.method,
                body: request.body,
                redirect: request.redirect
            });

            // IMAGE ACCELERATION (FREE TIER CACHE)
            if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/) || url.pathname.includes("/uploads/")) {
                const cache = caches.default;
                const cacheKey = new Request(url.toString(), request);
                let cachedResponse = await cache.match(cacheKey);
                if (cachedResponse) {
                    const cachedRes = new Response(cachedResponse.body, cachedResponse);
                    cachedRes.headers.set("X-Cache-Status", "HIT");
                    return addSecurityHeaders(cachedRes);
                }
                const apiResp = await fetch(proxyReq);
                if (apiResp.ok) {
                    const responseToCache = new Response(apiResp.body, apiResp);
                    responseToCache.headers.set("Cache-Control", "public, max-age=31536000, immutable");
                    responseToCache.headers.set("X-Cache-Status", "MISS");
                    ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
                    return addSecurityHeaders(responseToCache);
                }
                return apiResp;
            }
            return fetch(proxyReq);
        }

        // ----------------------------------------------
        // 5. STATIC ASSETS & FALLBACK (EXISTING)
        // ----------------------------------------------
        if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|css|js|json|ico|xml|txt)$/)) {
            const assetResp = await fetch(baseEnhancedRequest);
            return addSecurityHeaders(assetResp);
        }

        let response;
        const cacheKey = new Request(url.origin + "/", request);
        const cache = caches.default;

        try {
            response = await fetch(baseEnhancedRequest);
            if (response.ok) {
                const clone = response.clone();
                const cacheHeaders = new Headers(clone.headers);
                cacheHeaders.set("Cache-Control", "public, max-age=3600");
                ctx.waitUntil(cache.put(cacheKey, new Response(clone.body, { status: clone.status, headers: cacheHeaders })));
            }
        } catch (e) { response = null; }

        if (!response || response.status >= 500) {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                response = new Response(cachedResponse.body, cachedResponse);
                response.headers.set("X-Fallback-Source", "Worker-Cache");
            } else {
                if (!response) return new Response("Service Unavailable", { status: 503 });
            }
        }

        // =================================================================================
        // 6. SEO INTELLIGENCE & EDGE HYDRATION (EXISTING - PRESERVED)
        // =================================================================================

        // SCENARIO A: HOMEPAGE
        if (url.pathname === "/" || url.pathname === "") {
            const pageTitle = "Treishvaam Finance (TreishFin) | Global Financial Analysis & News";
            const pageDesc = "Treishvaam Finance (TreishFin) provides real-time market data, financial news, and expert analysis.";

            const homeSchema = {
                "@context": "https://schema.org",
                "@type": "FinancialService",
                "name": "Treishvaam Finance",
                "url": FRONTEND_URL + "/",
                "logo": "https://treishvaamgroup.com/logo512.webp",
                "description": pageDesc,
                "parentOrganization": { "@type": "Corporation", "name": "Treishvaam Group", "url": PARENT_ORG_URL }
            };

            const rewritten = new HTMLRewriter()
                .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageTitle); } })
                .on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(homeSchema)}</script>`, { html: true }); } })
                .transform(response);

            return addSecurityHeaders(rewritten);
        }

        // SCENARIO B: STATIC PAGES
        const staticPages = {
            "/about": { title: "About Us | Treishfin", description: "Learn about Treishvaam Finance." },
            "/vision": { title: "Treishfin · Our Vision", description: "Our roadmap driving Treishvaam Finance." },
            "/contact": { title: "Treishfin · Contact Us", description: "Get in touch with the team." }
        };
        if (staticPages[url.pathname]) {
            const pageData = staticPages[url.pathname];
            const rewritten = new HTMLRewriter()
                .on("title", { element(e) { e.setInnerContent(pageData.title); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageData.description); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageData.title); } })
                .transform(response);
            return addSecurityHeaders(rewritten);
        }

        // SCENARIO C: BLOG POSTS
        if (url.pathname.includes("/category/")) {
            const parts = url.pathname.split("/");
            const articleId = parts[parts.length - 1];
            const postSlug = parts.length >= 4 ? parts[parts.length - 2] : null;
            if (!articleId) return addSecurityHeaders(response);

            // Strategy A: Materialized HTML
            if (postSlug) {
                try {
                    const materializedUrl = `${BACKEND_URL}/api/uploads/posts/${postSlug}.html`;
                    const matResp = await fetch(materializedUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO" } });
                    if (matResp.ok) {
                        const finalResp = new Response(matResp.body, { status: 200, headers: matResp.headers });
                        finalResp.headers.set("Content-Type", "text/html; charset=utf-8");
                        finalResp.headers.set("X-Source", "Materialized-HTML");
                        const fixedResp = new HTMLRewriter()
                            .on("head", { element(e) { e.prepend('<base href="/" />', { html: true }); } })
                            .transform(finalResp);
                        return addSecurityHeaders(fixedResp);
                    }
                } catch (e) { }
            }

            // Strategy B: Edge Hydration
            const apiUrl = `${BACKEND_URL}/api/v1/posts/url/${articleId}`;
            try {
                const apiResp = await fetch(apiUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO" } });
                if (apiResp.ok) {
                    const post = await apiResp.json();
                    const rewritten = new HTMLRewriter()
                        .on("title", { element(e) { e.setInnerContent(post.title + " | Treishfin"); } })
                        .on('meta[name="description"]', { element(e) { e.setAttribute("content", post.metaDescription || post.title); } })
                        .on("head", { element(e) { e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(post)};</script>`, { html: true }); } })
                        .transform(response);
                    return addSecurityHeaders(rewritten);
                }
            } catch (e) { }
        }

        // SCENARIO D: MARKET DATA
        if (url.pathname.startsWith("/market/")) {
            const rawTicker = url.pathname.split("/market/")[1];
            if (rawTicker) {
                const apiUrl = `${BACKEND_URL}/api/v1/market/widget?ticker=${encodeURIComponent(decodeURIComponent(rawTicker))}`;
                try {
                    const apiResp = await fetch(apiUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO" } });
                    if (apiResp.ok) {
                        const marketData = await apiResp.json();
                        const quote = marketData.quoteData;
                        if (quote) {
                            const pageTitle = `${quote.name} (${quote.ticker}) Price | Treishfin`;
                            const rewritten = new HTMLRewriter()
                                .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageTitle); } })
                                .on("head", { element(e) { e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(marketData)};</script>`, { html: true }); } })
                                .transform(response);
                            return addSecurityHeaders(rewritten);
                        }
                    }
                } catch (e) { }
            }
        }

        return addSecurityHeaders(response);
    }
};

// =================================================================================
// 8. HELPER FUNCTIONS (UPDATED FOR KV)
// =================================================================================

/**
 * GENERATES SITEMAP INDEX FROM KV
 */
async function handleKVSitemapIndex(env, frontendUrl, backendUrl) {
    let metadata = null;

    // 1. Try KV (Fastest)
    const cachedMeta = await env.TREISHFIN_SEO_CACHE.get("sitemap:meta");
    if (cachedMeta) {
        try { metadata = JSON.parse(cachedMeta); } catch (e) { }
    }

    // 2. Fallback to Backend (If KV Empty)
    if (!metadata) {
        try {
            const resp = await fetch(`${backendUrl}/api/public/sitemap/meta`, {
                headers: { 'User-Agent': 'Cloudflare-Worker-Sitemap' }
            });
            if (resp.ok) metadata = await resp.json();
        } catch (e) { }
    }

    // 3. Construct XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${frontendUrl}/sitemap-static.xml</loc></sitemap>`;

    if (metadata) {
        if (metadata.blogs) metadata.blogs.forEach(file => xml += `<sitemap><loc>${frontendUrl}${file}</loc></sitemap>`);
        if (metadata.markets) metadata.markets.forEach(file => xml += `<sitemap><loc>${frontendUrl}${file}</loc></sitemap>`);
    }

    xml += `</sitemapindex>`;
    return new Response(xml, { headers: { "Content-Type": "application/xml", "X-Source": metadata ? "KV-Index" : "Fallback" } });
}

/**
 * SERVES DYNAMIC SITEMAP FROM KV
 */
async function handleDynamicSitemapFromKV(url, env, backendUrl) {
    // Generate Key: /sitemap-dynamic/blog/0.xml -> sitemap:/sitemap-dynamic/blog/0.xml
    const key = `sitemap:${url.pathname}`;

    // 1. Try KV
    const cached = await env.TREISHFIN_SEO_CACHE.get(key);
    if (cached) {
        return new Response(cached, { headers: { "Content-Type": "application/xml", "X-Source": "KV-Cache" } });
    }

    // 2. Fallback Backend
    try {
        const backendResp = await fetch(`${backendUrl}${url.pathname}`);
        if (backendResp.ok) {
            // We pass it through but don't block on saving to KV (let Cron handle that)
            const newResp = new Response(backendResp.body, backendResp);
            newResp.headers.set("X-Source", "Backend-Fallback");
            return newResp;
        }
    } catch (e) { }

    return new Response("Sitemap Unavailable", { status: 404 });
}