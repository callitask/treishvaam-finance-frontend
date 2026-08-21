# FE-00 — Frontend Master Index & Routing Matrix

**Project:** `treishvaam-finance-frontend`
**Domain:** Frontend & Edge Tier (Treishvaam Group Enterprise Platform)
**Classification:** Internal — Engineering Reference
**Status:** Authoritative. Supersedes in-repo `/docs/FIN-01/02/03` documents, which were absorbed into this suite as verified source material.
**Verified against:** `FRONTEND_Finance_00_DirectoryMap.md`, `FRONTEND_Finance_00_IndexMap.md`, Frontend Code Parts 1–5, `MASTER_DOCUMENTATION_BLUEPRINT.md`, `TREISHVAAM_ENTERPRISE_ARCHITECTURE_STRATEGY.md`

---

## 1. System Overview

`treishvaam-finance-frontend` is the public presentation tier of the Treishvaam Finance platform. It is a **Next.js 14 (App Router)** application served from **Cloudflare Pages** (Edge SSR runtime), fronted by the **`treishfin-seo-worker`** Cloudflare Edge Worker, which acts as the sole HTTP entry point for `treishvaamfinance.com`. Authentication is handled via **Keycloak OIDC** (`keycloak-js`, realm `treishvaam`, client `finance-app`). All backend traffic is proxied through the Worker with **HMAC-SHA-512 AEGIS Edge Signatures** to the Spring Boot `finance-api` behind Cloudflare Tunnel, Nginx/ModSecurity, and the AEGIS 9-Layer Zero-Trust filter chain.

The application is a **hybrid migration artifact**: a fully migrated Next.js App Router shell (`app/`) that wraps a legacy Create React App component tree (`src/`), bridged by `react-router-shim.js`. This dual-layer model is a documented architectural invariant, not debt to be "cleaned" without a migration plan (see FE-01 §4).

## 2. Documentation Suite Map

| Document | Title | Primary Subject | Source Anchors |
| :--- | :--- | :--- | :--- |
| `FE-00-INDEX.md` | Master Index & Routing Matrix | Navigation, route inventory, conventions | This file |
| `FE-01-ARCHITECTURE.md` | Application Architecture | Next.js 14 App Router, RSC boundaries, hosting model, PWA, image pipeline | `next.config.mjs`, `middleware.ts`, `app/layout.tsx`, FIN-01 |
| `FE-02-EDGE-WORKERS.md` | Cloudflare Edge Worker Ecosystem | HMAC-SHA-512 signing, JA3/IP threat gating, MTD translation, GEO routing, SEO injection, cron | `worker/worker.js`, `worker/wrangler.toml`, FIN-03 |
| `FE-03-STATE-AND-DATA.md` | State & Data Management | Context providers, Axios layer, fetch patterns, market data, bridge contract mapping | `src/context/*`, `src/apiConfig.js`, `src/hooks/*` |
| `FE-04-SECURITY-INTEGRATION.md` | Client-Side Security Integration | Keycloak OIDC lifecycle, CSP nonce, AEGIS client adherence, sanitization, breakers | `middleware.ts`, `AuthContext.js`, `AegisTelemetry.tsx` |
| `FE-05-COMPONENTS.md` | Component Architecture & Design Tokens | Component hierarchy, families, Tailwind design language, a11y, responsive strategy | `src/components/**`, `src/pages/**` |
| `FE-06-SEO-METADATA.md` | SEO, Metadata & GEO Pipelines | Next.js metadata, Edge JSON-LD injection, LLM/GEO payloads, sitemaps, OG strategy | `app/**/page.tsx`, `worker/worker.js`, `schemaGenerator.js` |
| `FE-07-DEPLOYMENT.md` | Build & Deployment | Cloudflare Pages builds, env/secrets matrix, Worker change control, previews, rollback | `.env.example`, `wrangler.toml`, FIN-01 §7 |

## 3. Related Enterprise Documents

| Document | Relationship |
| :--- | :--- |
| `CROSS-SYSTEM-CONTEXT.md` | **Bridge contract.** Canonical source for API endpoint signatures, HMAC header standards, WebSocket channels, and auth flow expectations. All frontend/backend interaction docs in this suite defer payload-level detail to it. |
| `BE-01-ARCHITECTURE.md` … `BE-06-OBSERVABILITY.md` | Backend counterpart suite (Spring Boot `finance-api`, AEGIS, deployment, API, data, observability). |
| `RUNBOOKS.md`, `DISASTER_RECOVERY.md` | Session 3 operational deliverables consuming both suites. |
| `/docs/FIN-01-ARCHITECTURE.md`, `/docs/FIN-02-COMPONENTS.md`, `/docs/FIN-03-WORKER-EDGE.md` | **Deprecated in-repo docs** (retained as historical reference). Content was verified and absorbed into FE-01/02/05. |

## 4. Page Routing Matrix

All routes are defined exclusively by `app/**` files. `next.config.mjs` enforces `pageExtensions: ['tsx', 'ts']`, which guarantees `src/pages/*.js` legacy files are **never** treated as routes.

| Route | App Router Source | Rendered Component | Rendering | Auth | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Landing (self-contained wrapper) | Edge SSR + hydration | Public | Canonical apex URL |
| `/home` | `app/home/page.tsx` | `src/pages/BlogPage.js` | — | Public | **301 → `/`** enforced by `middleware.ts` (apex canonicalization) |
| `/about` | `app/about/page.tsx` | `src/pages/AboutPage.js` | Static metadata | Public | |
| `/contact` | `app/contact/page.tsx` | `src/pages/ContactPage.js` | Static metadata | Public | |
| `/vision` | `app/vision/page.tsx` | `src/pages/VisionPage.js` | Static metadata | Public | Canonical + OG exported |
| `/privacy` | `app/privacy/page.tsx` | `src/pages/PrivacyPage.js` | `"use client"` wrapper | Public | |
| `/terms` | `app/terms/page.tsx` | `src/pages/TermsPage.js` | Static metadata | Public | Canonical + OG exported |
| `/login` | `app/login/page.tsx` (+ `layout.tsx`) | `src/pages/LoginPage.js` | Minimal-chrome layout | Public | Login layout omits Navbar/Footer |
| `/market/[ticker]` | `app/market/[ticker]/page.tsx` | `src/pages/MarketDetailPage.js` | Dynamic per-ticker | Public | Worker injects per-ticker SEO state |
| `/category/[categorySlug]/[postSlug]/[id]` | `app/category/.../page.tsx` | `src/pages/SinglePostPage.js` | `generateMetadata()` + JSON-LD | Public | Most SEO-critical route; Edge fetch must send `X-Tenant-ID: finance` |
| `/dashboard` | `app/dashboard/page.tsx` (+ `layout.tsx` guard) | `src/pages/DashboardPage.js` | Client | **Authenticated** | `DashboardLayout` auth gate → `/login` |
| `/dashboard/blog/new` | `app/dashboard/blog/new/page.tsx` | `src/pages/BlogEditorPage.js` | Client | PUBLISHER+ | Tiptap v3 CMS editor |
| `/dashboard/blog/edit/[userFriendlySlug]/[id]` | `app/dashboard/blog/edit/.../page.tsx` | `src/pages/BlogEditorPage.js` (edit mode) | Client | EDITOR+ | Optimistic-lock `version` field |
| `/dashboard/manage-posts` | `app/dashboard/manage-posts/page.tsx` | `src/pages/ManagePostsPage.js` | Client | EDITOR+ | Hash-based view state (`#drafts`, `#scheduled`, `#published`) |
| `/dashboard/audience` | `app/dashboard/audience/page.tsx` | `src/pages/AudiencePage.js` | Client | ADMIN | `/api/v1/analytics` + `/realtime` |
| `/dashboard/api-status` | `app/dashboard/api-status/page.tsx` | `src/pages/ApiStatusPage.js` | Client | ADMIN | `/api/v1/status` |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | `src/pages/ProfilePage.js` | Client | Authenticated | |
| 404 (any) | `app/not-found.tsx` | Custom 404 | — | Public | Worker SPA-fallback may override 404→200 for known routes |

### 4.1 Route Handler (API) Matrix — GEO Endpoints

| Route | Source | Backend Endpoint | Content-Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/llms.txt` | `app/llms.txt/route.ts` | `GET /api/public/geo/llms.txt` | `text/plain` | Worker serves KV-cached version to AI bots first; this handler is the backend fallback |
| `/ai-feed.md` | `app/ai-feed.md/route.ts` | `GET /api/public/geo/ai-feed.md` | `text/markdown` | Same KV-first behavior |
| `/ontology.json` | `app/ontology.json/route.ts` | `GET /api/public/geo/ontology.json` | `application/json` | JSON-LD ontology graph |
| `/opensearch.xml` | `app/opensearch.xml/route.ts` | Self-contained (generated inline) | `application/opensearchdescription+xml` | Browser search discovery |

All backend fetches from these handlers include `X-Tenant-ID: finance`.

### 4.2 Middleware Coverage

`middleware.ts` runs on all routes **except**: `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, `sitemap*`, `silent-check-sso.html`, and static image extensions. It never runs on `/api/**` (backend traffic is proxied by the Worker, not Next.js).

## 5. Repository Topography (Summary)

```
treishvaam-finance-frontend/
├── app/                      # Next.js App Router routes (TSX/TS only — URL surface)
├── src/
│   ├── components/           # ~150 UI components (client-side, imported by app/ wrappers)
│   │   ├── BlogPage/  BlogEditor/  market/  market-detail/  news/
│   │   ├── annotations/  manage-posts/
│   ├── pages/                # Legacy CRA page components (NOT routes)
│   ├── context/              # Auth, Theme, Watchlist, Annotation, FloatingDock
│   ├── hooks/  layouts/  lib/  utils/
│   ├── apiConfig.js          # Central Axios instance + API function catalogue
│   ├── faroConfig.js         # Grafana Faro RUM
│   └── sw.ts                 # Serwist PWA service worker source
├── worker/                   # treishfin-seo-worker (worker.js + wrangler.toml)
├── public/                   # robots.txt, sitemaps, manifest.json, silent-check-sso.html, .well-known/security.txt
├── middleware.ts             # CSP nonce + apex redirect (Edge)
├── next.config.mjs  tailwind.config.js  tsconfig.json  jsconfig.json
├── wrangler.toml             # Root wrangler config ⚠ Requires clarification (canonical Worker config is worker/wrangler.toml)
└── github/java-upgrade/, .roo/  # Tooling artifacts — non-runtime
```

## 6. Conventions Used Throughout This Suite

1. **No hallucination:** Facts not verifiable in the provided code parts are marked **⚠ Requires clarification** and logged in each document's Open Items register.
2. **Immutable Change History:** Source files carry `IMMUTABLE CHANGE HISTORY` blocks that function as institutional memory. Documentation references them but never authorizes their deletion.
3. **Callouts:** `> [!CAUTION]` marks operationally dangerous actions; `> [!WARNING]` marks security-critical invariants; `> [!NOTE]` marks architectural context.
4. **Bridge deference:** All backend payload schemas, HMAC algorithm details, and WebSocket event names defer to `CROSS-SYSTEM-CONTEXT.md` and `BE-04-API.md`.
