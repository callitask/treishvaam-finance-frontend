/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Next.js App Router Server Component wrapper for the Single Post page.
 * - Handles Edge SSR metadata generation (SEO / OpenGraph / Canonical) and renders the client component.
 *
 * Scope:
 * - Responsible for: generateMetadata (server-side SEO), rendering SinglePostPage client component.
 * - Must NEVER be responsible for: data fetching for the page body (handled in SinglePostPage client component).
 *
 * Critical Dependencies:
 * - Backend: NEXT_PUBLIC_API_URL → /api/v1/posts/url/:id
 * - Frontend: src/pages/SinglePostPage.js (client component)
 * - Worker / SEO: generateMetadata runs at Edge — must be null-safe for all API response fields.
 *
 * Security Constraints:
 * - API_URL must NEVER be hardcoded — always read from NEXT_PUBLIC_API_URL env var.
 * - MUST generate native WebCrypto HMAC-SHA512 signatures to penetrate backend Zero-Trust Aegis filters.
 *
 * Non-Negotiables:
 * - generateMetadata MUST handle undefined/null API responses without throwing.
 * - export const runtime = 'edge' MUST remain — required for Cloudflare Pages Edge SSR.
 * - All post property accesses MUST use optional chaining (?.) — API may return undefined on timeout.
 * - MUST explicitly declare canonical URLs to prevent GSC duplicate indexing anomalies.
 *
 * Change Intent:
 * - Extended the Zero-Trust cryptographic boundary into the Edge SSR to resolve the 403 Forbidden
 * "Article Not Found" metadata failure and injected enterprise SEO/GEO canonical tags.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • export const runtime = 'edge' — opt-in to Cloudflare Edge SSR routing.
 * • generateMetadata — native Next.js server-side SEO / OpenGraph generation.
 * • Phase: Next.js migration (CRA → Next.js 14 App Router)
 *
 * - EDITED:
 * • Removed generateStaticParams — upgraded to Cloudflare Edge SSR (dynamic).
 *
 * - EDITED (Phase 2 Bug Fix):
 * • FIXED: TypeError: Cannot read properties of undefined (reading 'id') on Single Post pages.
 * • Added `if (!post || typeof post !== 'object')` guard. Added optional chaining.
 *
 * - EDITED (Phase 2 Bug Fix - Followup):
 *   • Wrapped params in `await Promise.resolve(params)` to handle Next.js 15 Promise-based params safely.
 *
 * - EDITED (2026-05-14 BUG-FINANCE-01 Fix B):
 *   • Added `headers: { 'X-Tenant-ID': 'finance' }` to the generateMetadata server-side fetch call.
 *   • Why: This server-side fetch runs at the Edge and bypasses the Cloudflare Worker entirely.
 *     Without the X-Tenant-ID header, the backend TenantInterceptor falls back to DEFAULT_TENANT="public".
 *     Posts stored with tenantId="finance" return no data → generateMetadata returns
 *     { title: 'Article Not Found | Treishvaam Finance' } → page shows "Article Not Found".
 *   • What behavior must remain unchanged: cache: 'no-store', null-safety guards, optional chaining,
 *     export const runtime = 'edge', all OpenGraph and Twitter card metadata fields.
 *
 * - EDITED (Phase 5 — Zero-Trust Edge Signature & Canonical GSC Fix):
 *   • Added `generateEdgeSignature()` WebCrypto helper to mathematically sign the metadata fetch.
 *   • Why: `generateMetadata` bypasses the Edge Worker. Lacking the `X-Aegis-Edge-Signature`, the backend 
 *     Aegis filter returned 403 Forbidden, triggering a blind fallback to "Article Not Found".
 *   • Added Next.js `alternates: { canonical }` and mirrored the explicit canonical URL in OpenGraph metadata.
 *   • Why: Resolves Google Search Console (GSC) duplicate/unindexed URL anomalies to enforce strict GEO/AIEO standards.
 * - EDITED (Phase 6 - Strict Content Negotiation Fix):
 *   • Injected `'Accept': 'application/json'` into the `generateMetadata` fetch headers.
 *   • Why: Spring Boot 3 enforces strict content negotiation. Without this header, the backend rejected the Edge SSR fetch with a `406 HttpMediaTypeNotAcceptableException`. Next.js interpreted the failure as a missing article and silently fell back to rendering "Article Not Found" in the `<title>` tag and SEO metadata.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export const runtime = 'edge';

// Cryptographic function to penetrate backend Zero-Trust filter natively at the Edge
async function generateEdgeSignature(path: string, timestamp: string, ip: string, secret: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
    );
    const data = encoder.encode(`${path}:${timestamp}:${ip}`);
    const signature = await crypto.subtle.sign("HMAC", key, data);
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Native Next.js Server-Side SEO Generation at the Edge
export async function generateMetadata({ params }: { params: any }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
    const EDGE_SECRET = process.env.AEGIS_EDGE_SECRET || '';

    try {
        // Next.js 15 compat: resolve params as a promise to prevent undefined errors
        const resolvedParams = await Promise.resolve(params);

        if (!resolvedParams || !resolvedParams.id) {
            return { title: 'Article Not Found | Treishvaam Finance' };
        }

        const canonicalUrl = `https://treishvaamfinance.com/category/${resolvedParams.categorySlug}/${resolvedParams.postSlug}/${resolvedParams.id}`;

        const apiPath = `/api/v1/posts/url/${resolvedParams.id}`;
        const timestamp = Date.now().toString();
        const clientIp = '127.0.0.1'; // Internal SSR identifier (safe from L4-ADA tarpits)

        let signature = '';
        if (EDGE_SECRET) {
            signature = await generateEdgeSignature(apiPath, timestamp, clientIp, EDGE_SECRET);
        } else {
            console.warn("[generateMetadata] AEGIS_EDGE_SECRET is missing. Metadata fetch may be blocked by backend.");
        }

        const res = await fetch(`${API_URL}${apiPath}`, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
                'X-Tenant-ID': 'finance',
                'X-Aegis-Client-IP': clientIp,
                'X-Aegis-Edge-Timestamp': timestamp,
                'X-Aegis-Edge-Signature': signature
            },
        });

        if (!res.ok) {
            return { title: 'Article Not Found | Treishvaam Finance' };
        }

        const post = await res.json();

        if (!post || typeof post !== 'object') {
            return { title: 'Article | Treishvaam Finance' };
        }

        const coverImage = post?.thumbnailUrl
            ? `${API_URL}/api/v1/files/download/${post.thumbnailUrl}`
            : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';

        const title = post?.title ? `${post.title} | Treishvaam Finance` : 'Article | Treishvaam Finance';
        const description = post?.metaDescription || post?.excerpt || '';
        const keywords = post?.keywords || '';

        return {
            title,
            description,
            keywords,
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title: post?.title || 'Treishvaam Finance',
                description,
                url: canonicalUrl,
                images: [coverImage],
                type: 'article'
            },
            twitter: {
                card: 'summary_large_image',
                title: post?.title || 'Treishvaam Finance',
                description,
                images: [coverImage],
            }
        };
    } catch (e) {
        console.error('[generateMetadata] Failed to fetch post metadata:', e);
        return { title: 'Article | Treishvaam Finance' };
    }
}

export default function Page() {
    return <SinglePostPage />;
}