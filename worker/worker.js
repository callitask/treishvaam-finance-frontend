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
 * Security Constraints:
 * - Strict CSP & HSTS.
 * - Geo-Location Header Injection.
 *
 * Non-Negotiables:
 * - SITEMAP: Must use KV (Edge Replica) + Path Translation.
 * - SEO: Must use the DETAILED Schema (Instagram, Contact Points) from the Old Code.
 * - SPA FALLBACK: Must Force-Serve index.html (200 OK) for known routes to satisfy GSC.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase): 
 * • Intercepted `/robots.txt` at the Edge to bypass Cloudflare Pages' automatic "Managed Content" 
 * bot-blocking injection. This ensures our explicit ALLOW rules for Googlebot and AI crawlers 
 * remain intact, authoritative, and solve the GSC /login index block.
 * - MERGED: Restored "Old" Rich Result Logic (Scenario A-D).
 * - FIXED: Applied Path Translation to Sitemap Fetcher (/sitemap-dynamic/ -> /api/public/sitemap/).
 * - RESTORED: Dynamic Robots.txt serving.
 * - OPTIMIZED: KV Caching strategy for zero downtime.
 * - ADDED: Smart SPA Fallback (404 -> 200 OK for HTML) to fix Google Indexing.
 * - UPDATED: Homepage SEO Scenario to include /home.
 * - CRITICAL FIX: Added KNOWN_SPA_ROUTES whitelist to force 200 OK fallback for static pages (About, Vision, etc.) to fix GSC 404s.
 * - BUGFIX: Added missing helper functions to prevent Error 1101.
 * - REFACTORED: Implemented AGGRESSIVE SPA FALLBACK for all non-extension routes to eliminate GSC 404/503 errors.
 * - CRITICAL FIX (2026-02-02): Changed sitemap.xml to serve static file from Pages instead of dynamic generation.
 * - EDITED: Updated FRONTEND_URL fallback from treishfin.treishvaamgroup.com to treishvaamfinance.com.
 * - EDITED: Injected `alternateName` typo-tolerance arrays into Scenario A (Homepage Schema).
 * - EDITED: Upgraded `handleDynamicSitemapFromKV` to implement "Cache-Shielding".
 * - EDITED: Extracted `potentialAction` from FinancialService and injected explicit `WebSite` and `ItemList` (SiteNavigationElement) schemas at the Edge.
 * - EDITED: Wrapped all `fetch(proxyReq)` and `fetch(baseEnhancedRequest)` calls in try/catch blocks.
 * - EDITED: Added `enhancedHeaders.set("X-Tenant-ID", "finance")` for backend API multitenancy resolution.
 * - EDITED: Rewrote `addSecurityHeaders` to inject a comprehensive, Zero-Trust Content Security Policy (CSP).
 * - EDITED (CSP Fix 2):
 * • Appended `https://static.cloudflareinsights.com` to `script-src`.
 * • Why: The previous CSP allowed `cloudflareinsights.com` (for connect-src beacon), but blocked the actual script fetching from the `static.` subdomain, triggering `script-src-elem` console errors.
 * - EDITED (CSP Auth Fix - Current Phase):
 * • Added `frame-src 'self' https://*.treishvaamgroup.com https://backend.treishvaamgroup.com` to CSP.
 * • Added wildcard `https://*.treishvaamgroup.com` to `connect-src`.
 * • Reverted `frame-ancestors` to `'self'` (removed legacy subdomain).
 * • Why: The Worker CSP was aggressively overriding the Pages `_headers` CSP and completely lacking a `frame-src`. This caused `default-src 'self'` to block Keycloak's `silent-check-sso` iframe and PKCE validations, resulting in `CSP_BLOCK_OR_UNDEFINED` infinite login loops.
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
                await env.TREISHFIN_SEO_CACHE.put("sitemap:finance:meta", JSON.stringify(metaJson), { expirationTtl: 90000 });

                // 2. Update Individual Sitemap Chunks
                const filesToUpdate = [];
                if (metaJson.blogs) filesToUpdate.push(...metaJson.blogs.map(path => ({ key: `sitemap:finance:${path}`, path })));
                if (metaJson.markets) filesToUpdate.push(...metaJson.markets.map(path => ({ key: `sitemap:finance:${path}`, path })));

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
        const FRONTEND_URL = env.FRONTEND_URL || "https://treishvaamfinance.com";
        const PARENT_ORG_URL = "https://treishvaamgroup.com";
        const backendConfig = new URL(BACKEND_URL);

        // DEFINE KNOWN SPA ROUTES (Critical for GSC Indexing)
        // Explicit whitelist for key pages to guarantee 200 OK
        const KNOWN_SPA_ROUTES = [
            "/home", "/about", "/vision", "/contact",
            "/privacy", "/terms", "/login", "/dashboard", "/manage-posts",
            "/newsroom", "/investors", "/careers", "/businesses", "/sustainability"
        ];

        // 1. UNIVERSAL HEADER INJECTION
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
        enhancedHeaders.set("X-Tenant-ID", "finance");

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
            newHeaders.set("X-XSS-Protection", "1; mode=block");
            newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
            newHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");

            // Enforce Enterprise Zero-Trust CSP
            const csp = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' data: https://fonts.gstatic.com",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://*.treishvaamgroup.com https://backend.treishvaamgroup.com https://www.google-analytics.com https://cloudflareinsights.com",
                "frame-src 'self' https://*.treishvaamgroup.com https://backend.treishvaamgroup.com",
                "media-src 'self' https:",
                "frame-ancestors 'self'",
                "object-src 'none'",
                "upgrade-insecure-requests"
            ].join("; ");

            newHeaders.set("Content-Security-Policy", csp);
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

        // ----------------------------------------------
        // 2. DYNAMIC SITEMAPS & EDGE SEO ASSETS
        // ----------------------------------------------
        if (url.pathname.startsWith('/sitemap-dynamic/')) {
            return handleDynamicSitemapFromKV(request, url, env, ctx, BACKEND_URL);
        }

        // CRITICAL: Intercept robots.txt at the Edge to bypass Cloudflare Pages Managed Content injections
        if (url.pathname === '/robots.txt') {
            const robotsTxt = `User-agent: *

# Allow access to all content by default
Allow: /

# --- ENTERPRISE SEO: Allow Googlebot to fetch content for rendering ---
Allow: /api/posts
Allow: /api/categories
Allow: /api/market
Allow: /api/news
Allow: /login

# Disallow crawlers from indexing Auth, Admin, and internal search paths
Disallow: /api/auth/
Disallow: /api/contact/
Disallow: /api/admin/
Disallow: /dashboard/
Disallow: /?q=*

# Sitemap Index
Sitemap: ${FRONTEND_URL}/sitemap.xml`;

            return new Response(robotsTxt, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "public, max-age=3600"
                }
            });
        }

        // ----------------------------------------------
        // 3. API PROXY (Secure Routing)
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

            try {
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
                return await fetch(proxyReq);
            } catch (e) {
                return new Response(JSON.stringify({ error: "Backend Service Unavailable" }), {
                    status: 503,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
        }

        // ----------------------------------------------
        // 4. STATIC ASSETS
        // ----------------------------------------------
        if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|css|js|json|ico|xml|txt|woff|woff2|ttf|eot|svg)$/)) {
            try {
                const assetResp = await fetch(baseEnhancedRequest);
                return addSecurityHeaders(assetResp);
            } catch (e) {
                return new Response("Asset Not Found", { status: 404 });
            }
        }

        // ----------------------------------------------
        // 5. FETCH HTML SHELL WITH AGGRESSIVE SPA FALLBACK
        // ----------------------------------------------
        let response;
        const cacheKey = new Request(url.origin + "/", request);
        const cache = caches.default;

        try {
            response = await fetch(baseEnhancedRequest);

            const isKnownSpaRoute = KNOWN_SPA_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + "/"));
            const hasNoExtension = !url.pathname.includes(".");
            const isNotApi = !url.pathname.startsWith("/api");

            if ((response.status === 404 || response.status === 403) && (isKnownSpaRoute || (hasNoExtension && isNotApi))) {

                const indexReq = new Request(new URL("/index.html", request.url), {
                    headers: enhancedHeaders,
                    method: "GET"
                });

                const indexResp = await fetch(indexReq);

                if (indexResp.ok) {
                    response = new Response(indexResp.body, indexResp);
                    response.headers.set("X-SPA-Fallback", "Active");

                    if (isKnownSpaRoute) {
                        response.headers.set("X-Route-Type", "Known-SPA-Page");
                    } else {
                        response.headers.set("X-Route-Type", "Implicit-SPA-Page");
                    }

                    response = new Response(response.body, {
                        status: 200,
                        headers: response.headers
                    });
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
                response.headers.set("X-Fallback-Source", "Worker-Cache");
            } else {
                if (!response) return new Response("Service Unavailable - Backend Unreachable", { status: 503 });
            }
        }

        // =================================================================================
        // 6. SEO INTELLIGENCE & EDGE HYDRATION
        // =================================================================================

        if (url.pathname === "/" || url.pathname === "" || url.pathname === "/home") {
            const pageTitle = "Treishvaam Finance | Global Financial Analysis & News";
            const pageDesc = "Treishvaam Finance provides real-time market data, financial news, and expert analysis. A subsidiary of Treishvaam Group.";

            const homeSchema = {
                "@context": "https://schema.org",
                "@type": "FinancialService",
                "name": "Treishvaam Finance",
                "alternateName": ["Treishvam Finance", "Treshvam Finance", "Trishvam Finance", "Treishvaam", "Treishvam", "Trishvam"],
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
                    "alternateName": ["Treishvam Group", "Treshvam Group", "Trishvam Group"],
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
                    "alternateName": ["Amit Kandpal", "Amit Sagar Kandpal", "Amitsagar", "Treishvaam", "Treishvam", "Trishvam"],
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
                }
            };

            const websiteSchema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Treishvaam Finance",
                "url": FRONTEND_URL + "/",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${FRONTEND_URL}/search?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                }
            };

            const sitelinksSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                    { "@type": "SiteNavigationElement", "position": 1, "name": "Markets", "url": `${FRONTEND_URL}/market` },
                    { "@type": "SiteNavigationElement", "position": 2, "name": "Financial News", "url": `${FRONTEND_URL}/blog` },
                    { "@type": "SiteNavigationElement", "position": 3, "name": "About Us", "url": `${FRONTEND_URL}/about` },
                    { "@type": "SiteNavigationElement", "position": 4, "name": "Our Vision", "url": `${FRONTEND_URL}/vision` },
                    { "@type": "SiteNavigationElement", "position": 5, "name": "Contact", "url": `${FRONTEND_URL}/contact` }
                ]
            };

            const rewritten = new HTMLRewriter()
                .on("title", { element(e) { e.setInnerContent(pageTitle); } })
                .on('meta[name="description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", pageTitle); } })
                .on('meta[property="og:description"]', { element(e) { e.setAttribute("content", pageDesc); } })
                .on("head", {
                    element(e) {
                        e.append(`<script type="application/ld+json">${JSON.stringify(homeSchema)}</script>`, { html: true });
                        e.append(`<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`, { html: true });
                        e.append(`<script type="application/ld+json">${JSON.stringify(sitelinksSchema)}</script>`, { html: true });
                    }
                })
                .transform(response);

            return addSecurityHeaders(rewritten);
        }

        const staticPages = {
            "/about": {
                title: "About Us | Treishvaam Finance",
                description: "Learn about Treishvaam Finance, our mission to democratize financial literacy, and our founder Amitsagar Kandpal.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/vision": {
                title: "Treishvaam Finance · Our Vision",
                description: "To build a world where financial literacy is a universal skill. Explore the philosophy and roadmap driving Treishvaam Finance.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/contact": {
                title: "Treishvaam Finance · Contact Us",
                description: "Have questions about financial markets or our platform? Get in touch with the Treishvaam Finance team today.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/sustainability": {
                title: "Sustainability | Treishvaam Finance",
                description: "Our commitment to sustainable financial practices and ESG-focused market analysis.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/privacy": {
                title: "Privacy Policy | Treishvaam Finance",
                description: "Read the Privacy Policy of Treishvaam Finance. Learn how we collect, use, and protect your personal data.",
                image: `${FRONTEND_URL}/logo.webp`
            },
            "/terms": {
                title: "Terms of Service | Treishvaam Finance",
                description: "Review the Terms of Service for Treishvaam Finance. Understand the rules governing the use of our platform.",
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

        if (url.pathname.includes("/category/")) {
            const parts = url.pathname.split("/");
            const articleId = parts[parts.length - 1];
            const postSlug = parts.length >= 4 ? parts[parts.length - 2] : null;

            if (!articleId) return addSecurityHeaders(response);

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

            const apiUrl = `${BACKEND_URL}/api/v1/posts/url/${articleId}`;
            try {
                const apiResp = await fetch(apiUrl, { headers: { "User-Agent": "Cloudflare-Worker-SEO-Bot", "X-Tenant-ID": "finance" } });
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
                    .on("title", { element(e) { e.setInnerContent(post.title + " | Treishvaam Finance"); } })
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

                const pageTitle = `${quote.name} (${quote.ticker}) Price, News & Analysis | Treishvaam Finance`;
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

// =================================================================================
// 7. HELPER FUNCTIONS (Sitemap Engine with Cache Shielding)
// =================================================================================

async function handleDynamicSitemapFromKV(request, url, env, ctx, backendUrl) {
    const cache = caches.default;
    const cacheRequest = new Request(request.url, request);

    let cachedResponse = await cache.match(cacheRequest);
    if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set("X-Source", "CDN-Edge-Cache");
        return response;
    }

    const key = `sitemap:finance:${url.pathname}`;
    const cachedKv = await env.TREISHFIN_SEO_CACHE.get(key);

    if (cachedKv) {
        const kvResponse = new Response(cachedKv, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "X-Source": "KV-Cache",
                "Cache-Control": "public, s-maxage=86400, max-age=3600"
            }
        });

        ctx.waitUntil(cache.put(cacheRequest, kvResponse.clone()));
        return kvResponse;
    }

    try {
        const apiPath = url.pathname.replace('/sitemap-dynamic/', '/api/public/sitemap/');
        const backendResp = await fetch(`${backendUrl}${apiPath}`);

        if (backendResp.ok) {
            const newResp = new Response(backendResp.body, backendResp);
            newResp.headers.set("X-Source", "Backend-Fallback");
            newResp.headers.set("Content-Type", "application/xml; charset=utf-8");
            newResp.headers.set("Cache-Control", "public, s-maxage=86400, max-age=3600");

            ctx.waitUntil(cache.put(cacheRequest, newResp.clone()));
            return newResp;
        }
    } catch (e) {
        console.error("Dynamic sitemap fetch failed:", e);
    }

    return new Response("Sitemap Unavailable - Backend Down", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
    });
}