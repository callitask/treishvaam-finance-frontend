/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise Edge Controller for Treishvaam Finance.
 * - Handles: Zero-Trust Security, Rich Result SEO Injection, KV-Backed Sitemap (Edge Replica).
 *
 * Scope:
 * - Intercepts all traffic to treishfin.treishvaamgroup.com
 * - Manages routing between Static Frontend, Dynamic Backend, and KV Store.
 *
 * Critical Dependencies:
 * - Backend: via env.BACKEND_API_URL
 * - KV Namespace: TREISHFIN_SEO_CACHE
 *
 * Security Constraints:
 * - Strict CSP & HSTS.
 * - Geo-Location Header Injection.
 *
 * Non-Negotiables:
 * - SITEMAP: Must use KV (Edge Replica) + Path Translation.
 * - SEO: Must use the DETAILED Schema (Instagram, Contact Points) from the Old Code.
 * - ROBOTS: Must be served dynamically to point to the correct sitemap.
 * - STATIC PAGES: Must Force-Serve index.html (200 OK) for known routes to satisfy GSC.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - MERGED: Restored "Old" Rich Result Logic (Scenario A-D).
 * - FIXED: Applied Path Translation to Sitemap Fetcher (/sitemap-dynamic/ -> /api/public/sitemap/).
 * - RESTORED: Dynamic Robots.txt serving.
 * - OPTIMIZED: KV Caching strategy for zero downtime.
 * - ADDED: Smart SPA Fallback (404 -> 200 OK for HTML) to fix Google Indexing.
 * - UPDATED: Homepage SEO Scenario to include /home.
 * - CRITICAL FIX: Added KNOWN_SPA_ROUTES whitelist to force 200 OK fallback for static pages (About, Vision, etc.) to fix GSC 404s.
 */

export default {
    // =================================================================================
    // 1. SCHEDULED TASKS (CRON JOB) - THE NEW ENGINE
    // =================================================================================
    async scheduled(event, env, ctx) {
        console.log("TRIGGER: Scheduled Sitemap Update");
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";

        // 1. Update Metadata
        try {
            const metaResp = await fetch(`${BACKEND_URL}/api/public/sitemap/meta`, {
                headers: { "User-Agent": "Treishvaam-Worker-Crawler/1.0" }
            });

            if (metaResp.ok) {
                const metaJson = await metaResp.json();
                // Store Metadata in KV
                await env.TREISHFIN_SEO_CACHE.put("sitemap:meta", JSON.stringify(metaJson), { expirationTtl: 90000 });

                // 2. Update Individual Sitemap Chunks
                const filesToUpdate = [];
                if (metaJson.blogs) filesToUpdate.push(...metaJson.blogs.map(path => ({ key: `sitemap:${path}`, path })));
                if (metaJson.markets) filesToUpdate.push(...metaJson.markets.map(path => ({ key: `sitemap:${path}`, path })));

                // Process first 5 priority files (Incremental updates)
                const priorityFiles = filesToUpdate.slice(0, 5);

                for (const file of priorityFiles) {
                    try {
                        // CRITICAL FIX: Translate Public Path to API Path
                        const apiPath = file.path.replace('/sitemap-dynamic/', '/api/public/sitemap/');

                        const fileResp = await fetch(`${BACKEND_URL}${apiPath}`, {
                            headers: { "User-Agent": "Treishvaam-Worker-Crawler/1.0" }
                        });

                        if (fileResp.ok && fileResp.headers.get("content-type")?.includes("xml")) {
                            const content = await fileResp.text();
                            await env.TREISHFIN_SEO_CACHE.put(file.key, content, { expirationTtl: 90000 });
                            console.log(`SUCCESS: Updated ${file.key}`);
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

        // --- MANUAL FORCE UPDATE TOOL ---
        if (url.pathname === '/sys/force-update') {
            await this.scheduled(null, env, ctx);
            return new Response("Manual Update Triggered! Check sitemap in 10 seconds.", { status: 200 });
        }

        // 0. CONFIGURATION
        const BACKEND_URL = env.BACKEND_API_URL || env.BACKEND_URL || "https://backend.treishvaamgroup.com";
        const FRONTEND_URL = env.FRONTEND_URL || "https://treishfin.treishvaamgroup.com";
        const PARENT_ORG_URL = "https://treishvaamgroup.com";
        const backendConfig = new URL(BACKEND_URL);

        // DEFINE KNOWN SPA ROUTES (Critical for GSC Indexing)
        // These routes exist in React but NOT as files. We MUST force 200 OK index.html for them.
        const KNOWN_SPA_ROUTES = [
            "/home", "/about", "/vision", "/contact",
            "/privacy", "/terms", "/login", "/dashboard", "/manage-posts"
        ];

        // 1. UNIVERSAL HEADER INJECTION (Restored from Old Code)
        const cf = request.cf || {};
        const enhancedHeaders = new Headers(request.headers);

        enhancedHeaders.set("X-Visitor-City", cf.city || "Unknown");
        enhancedHeaders.set("X-Visitor-Region", cf.region || "Unknown");
        enhancedHeaders.set("X-Visitor-Country", cf.country || "Unknown");
        enhancedHeaders.set("X-Visitor-Continent", cf.continent || "Unknown");
        enhancedHeaders.set("X-Visitor-Timezone", cf.timezone || "UTC");
        enhancedHeaders.set("X-Visitor-Lat", cf.latitude || "0");
        enhancedHeaders.set("X-Visitor-Lon", cf.longitude || "0");
        enhancedHeaders.set("X-Visitor-Device-Colo", cf.colo || "Unknown");

        const baseEnhancedRequest = new Request(request.url, {
            headers: enhancedHeaders,
            method: request.method,
            body: request.body,
            redirect: request.redirect
        });

        // SECURITY HELPER (Restored from Old Code)
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
        // 2. HIGH AVAILABILITY ROBOTS.TXT (Restored)
        // ----------------------------------------------
        if (url.pathname === "/robots.txt") {
            const robotsTxt = `User-agent: *
Allow: /

# --- ENTERPRISE SEO: Allow Googlebot to fetch API data for rendering ---
Allow: /api/posts
Allow: /api/categories
Allow: /api/market
Allow: /api/news

# Disallow crawlers from indexing Auth, Admin, and internal search paths
Disallow: /api/auth/
Disallow: /api/contact/
Disallow: /api/admin/
Disallow: /dashboard/
Disallow: /?q=*
Disallow: /silent-check-sso.html
Disallow: /login

# Sitemap Index
Sitemap: ${FRONTEND_URL}/sitemap.xml`;

            return new Response(robotsTxt, {
                headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" }
            });
        }

        // ----------------------------------------------
        // 3. SITEMAP LOGIC (NEW KV ENGINE)
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
        // 4. API PROXY (Restored Secure Routing)
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

            // IMAGE ACCELERATION
            if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/) || url.pathname.includes("/uploads/")) {
                const cache = caches.default;
                const cacheKey = new Request(url.toString(), request);
                const cachedResponse = await cache.match(cacheKey);
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
        // 5. STATIC ASSETS
        // ----------------------------------------------
        if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|css|js|json|ico|xml|txt)$/)) {
            const assetResp = await fetch(baseEnhancedRequest);
            return addSecurityHeaders(assetResp);
        }

        // ----------------------------------------------
        // 6. FETCH HTML SHELL WITH INTELLIGENT SPA FALLBACK
        // ----------------------------------------------
        let response;
        const cacheKey = new Request(url.origin + "/", request);
        const cache = caches.default;

        try {
            // A. Attempt to fetch the actual URL from Cloudflare Pages
            response = await fetch(baseEnhancedRequest);

            // B. SMART SPA FALLBACK (CRITICAL FIX FOR GSC 404s)
            // If origin returns 404, check if this is a known React Route.
            // If yes, we MUST return index.html with a 200 OK status.
            if (response.status === 404) {
                const acceptHeader = request.headers.get("Accept") || "";

                // Check against known routes whitelist OR Accept header
                const isKnownRoute = KNOWN_SPA_ROUTES.includes(url.pathname);
                const expectsHtml = acceptHeader.includes("text/html");

                if (isKnownRoute || expectsHtml) {
                    // Fetch the Entry Point (index.html) from the same origin
                    const indexReq = new Request(new URL("/index.html", request.url), request);
                    const indexResp = await fetch(indexReq);

                    if (indexResp.ok) {
                        // Create a NEW 200 OK Response with the Index Body
                        response = new Response(indexResp.body, indexResp);
                        response.headers.set("X-SPA-Fallback", "Active");
                        if (isKnownRoute) {
                            response.headers.set("X-Route-Type", "Known-SPA-Page");
                        }
                    }
                }
            }

            // C. Cache Successful HTML Responses
            if (response.ok) {
                const clone = response.clone();
                const cacheHeaders = new Headers(clone.headers);
                cacheHeaders.set("Cache-Control", "public, max-age=3600");
                ctx.waitUntil(cache.put(cacheKey, new Response(clone.body, { status: clone.status, headers: cacheHeaders })));
            }
        } catch (e) {
            response = null;
        }

        // D. Cache Fallback (Service Unavailable safety net)
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
        // 7. SEO INTELLIGENCE & EDGE HYDRATION (RESTORED DETAILED LOGIC)
        // =================================================================================

        // SCENARIO A: HOMEPAGE (With Social Links & Contact)
        // Added /home to ensure it shares the Homepage SEO Intelligence
        if (url.pathname === "/" || url.pathname === "" || url.pathname === "/home") {
            const pageTitle = "Treishvaam Finance (TreishFin) | Global Financial Analysis & News";
            const pageDesc = "Treishvaam Finance (TreishFin) provides real-time market data, financial news, and expert analysis. A subsidiary of Treishvaam Group.";

            const homeSchema = {
                "@context": "https://schema.org",
                "@type": "FinancialService",
                "name": "Treishvaam Finance",
                "alternateName": "TreishFin",
                "url": FRONTEND_URL + "/",
                "logo": "https://treishvaamgroup.com/logo512.webp",
                "image": "https://treishvaamgroup.com/logo512.webp",
                "description": pageDesc,
                "priceRange": "$$",
                "telephone": "+91 81785 29633",
                "email": "treishfin.treishvaamgroup@gmail.com",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Electronic City",
                    "addressLocality": "Bangalore",
                    "addressRegion": "Karnataka",
                    "postalCode": "560100",
                    "addressCountry": "IN"
                },
                "sameAs": [
                    "https://www.linkedin.com/company/treishvaamfinance",
                    "https://twitter.com/treishvaamfinance",
                    "https://x.com/treishvaamfinance",
                    "https://www.instagram.com/treishvaamfinance"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "telephone": "+91 81785 29633",
                    "email": "treishfin.treishvaamgroup@gmail.com",
                    "areaServed": "Global",
                    "availableLanguage": "English"
                },
                "parentOrganization": {
                    "@type": "Corporation",
                    "name": "Treishvaam Group",
                    "url": PARENT_ORG_URL,
                    "email": "treishvaamgroup@gmail.com",
                    "telephone": "+91 81785 29633",
                    "logo": "https://treishvaamgroup.com/logo512.webp",
                    "image": "https://treishvaamgroup.com/logo512.webp",
                    "sameAs": [
                        "https://www.linkedin.com/company/treishvaamgroup",
                        "https://twitter.com/treishvaamgroup",
                        "https://x.com/treishvaamgroup",
                        "https://www.instagram.com/treishvaamgroup"
                    ],
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Electronic City",
                        "addressLocality": "Bangalore",
                        "addressRegion": "Karnataka",
                        "postalCode": "560100",
                        "addressCountry": "IN"
                    }
                },
                "founder": {
                    "@type": "Person",
                    "name": "Amitsagar Kandpal",
                    "jobTitle": "Founder & Chairman",
                    "email": "callitask@gmail.com",
                    "telephone": "+91 81785 29633",
                    "url": "https://treishvaamgroup.com/",
                    "sameAs": [
                        "https://www.linkedin.com/in/amitsagarkandpal",
                        "https://twitter.com/treishvaam",
                        "https://x.com/treishvaam",
                        "https://www.instagram.com/treishvaam"
                    ]
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${FRONTEND_URL}/?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            };

            const rewritten = new HTMLRewriter()
                .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageTitle); } })
                .on('meta[property="og:description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                .on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(homeSchema)}</script>`, { html: true }); } })
                .transform(response);

            return addSecurityHeaders(rewritten);
        }

        // SCENARIO B: STATIC PAGES
        const staticPages = {
            "/about": {
                title: "About Us | Treishfin",
                description: "Learn about Treishvaam Finance, our mission to democratize financial literacy, and our founder Amitsagar Kandpal.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/vision": {
                title: "Treishfin · Our Vision",
                description: "To build a world where financial literacy is a universal skill. Explore the philosophy and roadmap driving Treishvaam Finance.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/contact": {
                title: "Treishfin · Contact Us",
                description: "Have questions about financial markets or our platform? Get in touch with the Treishvaam Finance team today.",
                image: `${FRONTEND_URL}/logo.webp`
            }
        };

        if (staticPages[url.pathname]) {
            const pageData = staticPages[url.pathname];
            const pageSchema = {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": pageData.title,
                "description": pageData.description,
                "url": FRONTEND_URL + url.pathname,
                "publisher": {
                    "@type": "Organization",
                    "name": "Treishvaam Finance",
                    "parentOrganization": { "@type": "Corporation", "name": "Treishvaam Group" },
                    "logo": { "@type": "ImageObject", "url": `${FRONTEND_URL}/logo.webp` }
                }
            };

            const rewritten = new HTMLRewriter()
                .on("title", { element(e) { e.setInnerContent(pageData.title); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageData.description); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageData.title); } })
                .on('meta[property="og:description"]', { element(e) { e.setAttribute("content", pageData.description); } })
                .on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(pageSchema)}</script>`, { html: true }); } })
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
                    const matResp = await fetch(materializedUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Fetcher" } });

                    if (matResp.ok) {
                        const finalResp = new Response(matResp.body, { status: 200, headers: matResp.headers });
                        finalResp.headers.set("Content-Type", "text/html; charset=utf-8");
                        finalResp.headers.set("X-Source", "Materialized-HTML");
                        finalResp.headers.set("Cache-Control", "public, max-age=3600");
                        const fixedResp = new HTMLRewriter()
                            .on("head", { element(e) { e.prepend('<base href="/" />', { html: true }); } })
                            .transform(finalResp);
                        ctx.waitUntil(cache.put(request, fixedResp.clone()));
                        return addSecurityHeaders(fixedResp);
                    }
                } catch (e) { }
            }

            // Strategy B: Edge Hydration
            const apiUrl = `${BACKEND_URL}/api/v1/posts/url/${articleId}`;
            try {
                const apiResp = await fetch(apiUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Bot" } });
                if (!apiResp.ok) return addSecurityHeaders(response);
                const post = await apiResp.json();
                const imageUrl = post.coverImageUrl ? `${BACKEND_URL}/api/uploads/${post.coverImageUrl}.webp` : `${FRONTEND_URL}/logo.webp`;
                const authorName = post.authorName || post.author || "Treishvaam Team";

                const schema = {
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": post.title,
                    "image": [imageUrl],
                    "datePublished": post.createdAt,
                    "dateModified": post.updatedAt,
                    "author": [{ "@type": "Person", "name": authorName, "url": `${FRONTEND_URL}/about` }],
                    "publisher": { "@type": "Organization", "name": "Treishvaam Finance", "logo": { "@type": "ImageObject", "url": `${FRONTEND_URL}/logo.webp` } }
                };

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(post.title + " | Treishfin"); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", post.metaDescription || post.title); } })
                    .on("head", {
                        element(e) {
                            e.append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`, { html: true });
                            e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(post)};</script>`, { html: true });
                        }
                    })
                    .transform(response);

                rewritten.headers.set("X-Source", "Edge-Hydration");
                return addSecurityHeaders(rewritten);
            } catch (e) { return addSecurityHeaders(response); }
        }

        // SCENARIO D: MARKET DATA
        if (url.pathname.startsWith("/market/")) {
            const rawTicker = url.pathname.split("/market/")[1];
            if (!rawTicker) return addSecurityHeaders(response);

            const decodedTicker = decodeURIComponent(rawTicker);
            const safeTicker = encodeURIComponent(decodedTicker);
            const apiUrl = `${BACKEND_URL}/api/v1/market/widget?ticker=${safeTicker}`;

            try {
                const apiResp = await fetch(apiUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Bot" } });
                if (!apiResp.ok) return addSecurityHeaders(response);
                const marketData = await apiResp.json();
                const quote = marketData.quoteData;

                if (!quote) return addSecurityHeaders(response);

                const pageTitle = `${quote.name} (${quote.ticker}) Price, News & Analysis | Treishfin`;
                const pageDesc = `Real-time stock price for ${quote.name} (${quote.ticker}). Market cap: ${quote.marketCap}. Detailed financial analysis on Treishvaam Finance.`;
                const logoUrl = quote.logoUrl || `${FRONTEND_URL}/logo.webp`;

                const schema = {
                    "@context": "https://schema.org",
                    "@type": "FinancialProduct",
                    "name": quote.name,
                    "tickerSymbol": quote.ticker,
                    "exchangeTicker": quote.exchange || "NYSE",
                    "description": pageDesc,
                    "url": `${FRONTEND_URL}/market/${rawTicker}`,
                    "image": logoUrl,
                    "currentExchangeRate": { "@type": "UnitPriceSpecification", "price": quote.price, "priceCurrency": "USD" }
                };

                const rewritten = new HTMLRewriter()
                    .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                    .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                    .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageTitle); } })
                    .on('meta[property="og:description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                    .on("head", {
                        element(e) {
                            e.append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`, { html: true });
                            e.append(`<script>window.__PRELOADED_STATE__ = ${safeStringify(marketData)};</script>`, { html: true });
                        }
                    })
                    .transform(response);

                return addSecurityHeaders(rewritten);
            } catch (e) { return addSecurityHeaders(response); }
        }

        return addSecurityHeaders(response);
    }
};