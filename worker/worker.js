/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise Edge Controller for Treishvaam Finance.
 * - Handles: Zero-Trust Security, Rich Result SEO Injection, KV-Backed Sitemap (Edge Replica).
 *
 * Scope:
 * - Intercepts all traffic to treishvaamfinance.com
 * - Manages routing between Static Frontend, Dynamic Backend, and KV Store.
 *
 * Critical Dependencies:
 * - Backend: via env.BACKEND_API_URL
 * - KV Namespace: TREISHFIN_SEO_CACHE
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Emergency Architecture Fix - RSC Support): 
 * • Refactored the SPA Fallback and Caching strategy to respect Next.js App Router.
 * - EDITED (Current Phase - 500 RSC Stream Fix):
 * • Wrapped the ENTIRE "SEO INTELLIGENCE" block in `if (!isRscRequest)`.
 * • Why: Previously, HTMLRewriter was intercepting background Next.js data fetches (`?_rsc=...`) 
 * for `/home` and attempting to inject JSON-LD `<script>` tags into raw JSON streams. This 
 * caused data corruption and 500 Internal Server Errors on client-side navigations.
 */

export default {
    // =================================================================================
    // 1. SCHEDULED TASKS (CRON JOB) - THE NEW ENGINE
    // =================================================================================
    async scheduled(event, env, ctx) {
        console.log("TRIGGER: Scheduled Sitemap Update");
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";

        try {
            const metaResp = await fetch(`${BACKEND_URL}/api/public/sitemap/meta`, {
                headers: { "User-Agent": "Treishvaam-Worker-Crawler/1.0" }
            });

            if (metaResp.ok) {
                const metaJson = await metaResp.json();
                await env.TREISHFIN_SEO_CACHE.put("sitemap:finance:meta", JSON.stringify(metaJson), { expirationTtl: 90000 });

                const filesToUpdate = [];
                if (metaJson.blogs) filesToUpdate.push(...metaJson.blogs.map(path => ({ key: `sitemap:finance:${path}`, path })));
                if (metaJson.markets) filesToUpdate.push(...metaJson.markets.map(path => ({ key: `sitemap:finance:${path}`, path })));

                const priorityFiles = filesToUpdate.slice(0, 5);

                for (const file of priorityFiles) {
                    try {
                        const apiPath = file.path.replace('/sitemap-dynamic/', '/api/public/sitemap/');
                        const fileResp = await fetch(`${BACKEND_URL}${apiPath}`, {
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
    // 2. REQUEST HANDLER (MERGED LOGIC)
    // =================================================================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/sys/force-update') {
            await this.scheduled(null, env, ctx);
            return new Response("Manual Update Triggered!", { status: 200 });
        }

        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";
        const FRONTEND_URL = env.FRONTEND_URL || "https://treishvaamfinance.com";
        const PARENT_ORG_URL = "https://treishvaamgroup.com";
        const backendConfig = new URL(BACKEND_URL);

        const KNOWN_SPA_ROUTES = [
            "/home", "/about", "/vision", "/contact",
            "/privacy", "/terms", "/login", "/dashboard", "/manage-posts",
            "/newsroom", "/investors", "/careers", "/businesses", "/sustainability"
        ];

        const cf = request.cf || {};
        const enhancedHeaders = new Headers(request.headers);

        enhancedHeaders.set("X-Visitor-City", cf.city || "Unknown");
        enhancedHeaders.set("X-Visitor-Country", cf.country || "Unknown");
        enhancedHeaders.set("X-Tenant-ID", "finance");

        const baseEnhancedRequest = new Request(request.url, {
            headers: enhancedHeaders,
            method: request.method,
            body: request.body,
            redirect: request.redirect
        });

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

            if (newHeaders.has("X-SPA-Fallback") && response.status === 404) {
                return new Response(response.body, { status: 200, headers: newHeaders });
            }
            return new Response(response.body, { status: response.status, headers: newHeaders });
        };

        const safeStringify = (data) => {
            if (data === undefined || data === null) return 'null';
            return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
        };

        if (url.pathname.startsWith('/sitemap-dynamic/')) {
            return handleDynamicSitemapFromKV(request, url, env, ctx, BACKEND_URL);
        }

        if (url.pathname === '/robots.txt') {
            const robotsTxt = `User-agent: *\nAllow: /\nAllow: /api/posts\nAllow: /api/categories\nAllow: /api/market\nAllow: /api/news\nAllow: /login\nDisallow: /api/auth/\nDisallow: /api/contact/\nDisallow: /api/admin/\nDisallow: /dashboard/\nDisallow: /?q=*\nSitemap: ${FRONTEND_URL}/sitemap.xml`;
            return new Response(robotsTxt, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
        }

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
                    return apiResp;
                }
                return await fetch(proxyReq);
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

        // SMART RSC BYPASS
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
        // 6. SEO INTELLIGENCE & EDGE HYDRATION (STRICTLY FOR HTML REQUESTS)
        // =================================================================================

        if (!isRscRequest) {
            if (url.pathname === "/" || url.pathname === "" || url.pathname === "/home") {
                const pageTitle = "Treishvaam Finance | Global Financial Analysis & News";
                const pageDesc = "Treishvaam Finance provides real-time market data, financial news, and expert analysis.";

                const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "name": "Treishvaam Finance", "url": FRONTEND_URL + "/" };

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                    .on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`, { html: true }); } })
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
                    .transform(response);
                return addSecurityHeaders(rewritten);
            }

            if (url.pathname.includes("/category/")) {
                const parts = url.pathname.split("/");
                const articleId = parts[parts.length - 1];

                if (!articleId) return addSecurityHeaders(response);

                try {
                    const apiResp = await fetch(`${BACKEND_URL}/api/v1/posts/url/${articleId}`, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Bot", "X-Tenant-ID": "finance" } });
                    if (!apiResp.ok) return addSecurityHeaders(response);
                    const post = await apiResp.json();

                    const rewritten = new HTMLRewriter()
                        .on("title", { element(e) { e.setInnerContent(post.title + " | Treishvaam Finance"); } })
                        .on('meta[name="description"]', { element(e) { e.setAttribute("content", post.metaDescription || post.title); } })
                        .on("head", { element(e) { e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(post)};</script>`, { html: true }); } })
                        .transform(response);
                    return addSecurityHeaders(rewritten);
                } catch (e) { return addSecurityHeaders(response); }
            }

            if (url.pathname.startsWith("/market/")) {
                const rawTicker = url.pathname.split("/market/")[1];
                if (!rawTicker) return addSecurityHeaders(response);

                try {
                    const apiResp = await fetch(`${BACKEND_URL}/api/v1/market/widget?ticker=${encodeURIComponent(decodeURIComponent(rawTicker))}`, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Bot" } });
                    if (!apiResp.ok) return addSecurityHeaders(response);
                    const marketData = await apiResp.json();

                    if (!marketData.quoteData) return addSecurityHeaders(response);

                    const rewritten = new HTMLRewriter()
                        .on("title", { element(e) { e.setInnerContent(`${marketData.quoteData.name} (${marketData.quoteData.ticker}) | Treishvaam Finance`); } })
                        .on("head", { element(e) { e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(marketData)};</script>`, { html: true }); } })
                        .transform(response);
                    return addSecurityHeaders(rewritten);
                } catch (e) { return addSecurityHeaders(response); }
            }
        }

        return addSecurityHeaders(response);
    }
};

async function handleDynamicSitemapFromKV(request, url, env, ctx, backendUrl) {
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
        const backendResp = await fetch(`${backendUrl}${apiPath}`);

        if (backendResp.ok) {
            const newResp = new Response(backendResp.body, backendResp);
            newResp.headers.set("Content-Type", "application/xml; charset=utf-8");
            ctx.waitUntil(cache.put(cacheRequest, newResp.clone()));
            return newResp;
        }
    } catch (e) { }

    return new Response("Sitemap Unavailable", { status: 503 });
}