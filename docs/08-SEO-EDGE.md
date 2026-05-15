/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Operational architecture of the Cloudflare Worker and Frontend SEO Strategy.
 *
 * Change Intent:
 * - Completely re-architected to detail the Zero-Trust Cache-Shielding deployment,
 *   Aggressive SPA Fallbacks, and Semantic Entity Graph Injections.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Edge SEO Architecture Documentation.
 * - EDITED: Added Section 6 defining Third-Party Script & Tag Management.
 * - EDITED: Implemented Cache-Shielding Architecture and Aggressive SPA Fallback logic.
 * - EDITED (2026-05-15 v4):
 *   • Updated GA4 section: fires unconditionally via Next.js Script component.
 *   • Removed ThirdPartyScripts.js interaction-based loading references (replaced by Next.js Script).
 *   • Updated env vars from REACT_APP_* to NEXT_PUBLIC_*.
 *   • Added X-Tenant-ID injection documentation.
 *   • Added Next.js metadata API as primary SEO mechanism.
 */

# 08 - Enterprise SEO & Edge Architecture (v4)

## 1. Architecture Overview: "The Edge Replica & Cache Shield"

We have implemented an **Enterprise-Grade Edge-Replica Architecture** using Cloudflare Workers and KV (Key-Value) Storage. This ensures that our SEO infrastructure (Sitemaps, Robots.txt, Rich Results) is **100% Highly Available**, even if the Backend API is down, while protecting our Cloudflare Free-Tier quotas.

### The Cache-Shielding Protocol
The Edge Worker interceptor processes sitemap and SEO data requests through a strict three-tier protection model:

* **Tier 1: CDN Edge Cache (0 Quota Cost):** The Worker checks `caches.default` for an unexpired payload. If a HIT occurs, KV reads and Backend calls are entirely bypassed.
* **Tier 2: Cloudflare KV (1 Read Quota Cost):** If the Edge Cache is cold, the Worker retrieves the pre-compiled XML/JSON from the `TREISHFIN_SEO_CACHE` KV namespace and simultaneously populates Tier 1.
* **Tier 3: Backend Fallback (Network Cost):** If both caches fail, the Worker proxies the request to the Spring Boot API, caching the result on the way back.

| Component | Role | Location |
| :--- | :--- | :--- |
| **Frontend** | Hosts Static Pages + Next.js SSR | Cloudflare Pages |
| **Backend** | Generates Dynamic Data (Blogs, Markets) | Java Spring Boot |
| **Worker** | Tenant injection, Smart Router, Cache Shield | Cloudflare Workers |
| **KV Store** | Materialized Dynamic Sitemaps | Cloudflare KV (`TREISHFIN_SEO_CACHE`) |

---

## 2. Multi-Tenant Architecture

All three Treishvaam frontends share ONE backend. The Worker injects the tenant identity header:

```javascript
enhancedHeaders.set("X-Tenant-ID", "finance");
```

The backend `TenantInterceptor` reads this header and scopes all database queries to `tenant_id = 'finance'`. Without this header, the backend falls back to `DEFAULT_TENANT = "public"` and returns no data.

**Critical:** The `generateMetadata()` server-side fetch in `app/category/.../page.tsx` runs at the Edge and bypasses the Worker. It must include `headers: { 'X-Tenant-ID': 'finance' }` explicitly.

---

## 3. Aggressive SPA Fallback Strategy (GSC 404 Resolution)

**The Problem:** Next.js App Router pages that are not pre-rendered may return 404 on direct navigation before the client-side router loads.

**The Solution:** The Edge Worker intercepts all incoming requests. It evaluates the path against a `KNOWN_SPA_ROUTES` array (e.g., `/home`, `/about`, `/vision`, `/privacy`, `/terms`). If a known path would natively return a 404, the Worker **intercepts the failure and forces a `200 OK` response**. For dynamic routes like `/category/**`, the Worker uses `hasNoExtension && isNotApi` fallback logic.

---

## 4. SEO Rich Results & Semantic Entity Injection

The Worker implements **Edge Hydration** to ensure social media crawlers and Search Engines see rich metadata immediately.

### Scenario-Based Logic
* **Homepage (`/`)**: Injects `FinancialService` and Corporate `Organization` schemas with typo-tolerance `alternateName` arrays.
* **Static Pages (`/about`)**: Injects `WebPage` schema.
* **Blog Posts (`/category/...`)**: Injects `NewsArticle` schema.
* **Market Pages (`/market/:ticker`)**: Injects `FinancialProduct` schema.

### Next.js Metadata API (Primary SEO Mechanism)
For server-rendered pages, SEO is handled by Next.js natively:
- `app/layout.tsx` — global `metadata` export + JSON-LD Organization schema via `<Script>`
- `app/category/.../page.tsx` — `generateMetadata()` with article title, description, OG, Twitter
- `app/market/[ticker]/page.tsx` — `generateMetadata()` with ticker name and live data

---

## 5. GA4 Analytics

GA4 fires **unconditionally** on every page load. No consent gate. No cookie banner.

```typescript
// app/layout.tsx
<Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
<Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
    __html: `
        gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            send_page_view: true
        });
    `
}} />
```

**Configuration:**
- `strategy="afterInteractive"` — fires after hydration, does not block rendering
- `anonymize_ip: true` — DPDP Act 2023 / GDPR best practice
- Measurement ID from `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var (never hardcoded)

---

## 6. Sitemap Architecture

| File | Purpose |
|------|---------|
| `public/sitemap.xml` | Static sitemap index (served directly by Cloudflare Pages) |
| `public/sitemap-static.xml` | Static pages sitemap |
| `/sitemap-dynamic/blog/*.xml` | Dynamic blog post sitemaps (served by Worker from KV) |
| `public/robots.txt` | Crawler directives + `Sitemap: https://treishvaamfinance.com/sitemap.xml` |

The Worker's scheduled cron job (`scheduled()`) fetches fresh sitemap data from the backend every hour and stores it in KV.

---

## 7. Technical Implementation

### Worker Location
* **Code**: `worker/worker.js`
* **Config**: `worker/wrangler.toml` (also at `f:/BACKEND PROJECG/finance-api/finance-api/cloudflared/wrangler.toml`)

### Path Translation (Critical)
The Worker translates clean public URLs to complex backend API parameters:
* **Public URL**: `https://treishvaamfinance.com/sitemap-dynamic/blog/0.xml`
* **Internal API**: `https://backend.treishvaamgroup.com/api/public/sitemap/blog/0.xml`

### Security Headers (Added by Worker)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: frame-ancestors 'self';`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()`

---

## 8. Deployment

```bash
# Worker deployment (run from frontend repo root)
cd worker
npx wrangler deploy

# CRITICAL POST-DEPLOYMENT: Purge Cloudflare cache
# Cloudflare Dashboard → Caching → Purge Everything
```

**Deploy worker when:** `worker/worker.js` or `worker/wrangler.toml` changes. Always ask user before running `wrangler deploy`.

---

## IMMUTABLE CHANGE HISTORY
- ADDED: Edge SEO Architecture Documentation.
- EDITED: Added Cache-Shielding Architecture and Aggressive SPA Fallback logic.
- EDITED (2026-05-15 v4): Updated for Next.js 14. Added X-Tenant-ID docs. Updated GA4 section.
  Removed CRA-era ThirdPartyScripts.js references. Added Next.js metadata API section.
  Updated env vars to NEXT_PUBLIC_*. Updated by: Claude Sonnet 4.6.
