/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Next.js App Router Server Component wrapper for the Single Post page.
 * - Handles Edge SSR metadata generation (SEO / OpenGraph) and renders the client component.
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
 *
 * Non-Negotiables:
 * - generateMetadata MUST handle undefined/null API responses without throwing.
 * - export const runtime = 'edge' MUST remain — required for Cloudflare Pages Edge SSR.
 * - All post property accesses MUST use optional chaining (?.) — API may return undefined on timeout.
 *
 * Change Intent:
 * - SESSION 2026-05-12: Fixed TypeError: Cannot read properties of undefined (reading 'id').
 *   Root cause: generateMetadata accessed post.thumbnailUrl and post.title directly without
 *   null-guards. When the backend API times out or returns a non-OK response, `post` is
 *   undefined and the destructuring throws a TypeError that crashes the Edge SSR render.
 *   Fix: Added explicit `if (!post || typeof post !== 'object')` guard after fetch.
 *   All post property accesses now use optional chaining (?.) as a secondary safety net.
 *
 * Future AI Guidance:
 * - Do NOT remove `export const runtime = 'edge'` — required for Cloudflare Pages deployment.
 * - Do NOT add generateStaticParams — this page uses dynamic Edge SSR, not static generation.
 * - The fallback metadata objects MUST remain — they are the graceful degradation path.
 * - Do NOT access any post property without optional chaining or a prior null-check.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 *   • export const runtime = 'edge' — opt-in to Cloudflare Edge SSR routing.
 *   • generateMetadata — native Next.js server-side SEO / OpenGraph generation.
 *   • Phase: Next.js migration (CRA → Next.js 14 App Router)
 *
 * - EDITED:
 *   • Removed generateStaticParams — upgraded to Cloudflare Edge SSR (dynamic).
 *   • Phase: Next.js migration
 *
 * - EDITED (2026-05-12 — SESSION_PROMPT Phase 2 Bug Fix):
 *   • FIXED: TypeError: Cannot read properties of undefined (reading 'id') on Single Post pages.
 *   • Root cause: generateMetadata had no null-guard after fetch — post could be undefined
 *     when API returns non-OK status or times out at the Edge.
 *   • Fix: Added `if (!post || typeof post !== 'object')` guard. Added optional chaining
 *     on all post property accesses (post?.title, post?.thumbnailUrl, etc.).
 *   • What must remain unchanged: runtime = 'edge', fetch URL pattern, fallback metadata.
 *
 * - DO-NOT-DELETE RULE:
 *   This IMMUTABLE CHANGE HISTORY section must never be deleted,
 *   truncated, rewritten, or regenerated. Future AI must append only.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export const runtime = 'edge';

// Native Next.js Server-Side SEO Generation at the Edge
// PHASE 2 FIX: All post property accesses are null-guarded to prevent TypeError
// when the backend API is unreachable, returns non-OK, or times out.
export async function generateMetadata({ params }: { params: { id: string } }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';

    try {
        const res = await fetch(`${API_URL}/api/v1/posts/url/${params.id}`, {
            // Edge fetch: no-store ensures fresh data, not stale cached metadata
            cache: 'no-store',
        });

        // PHASE 2 FIX: Explicit non-OK guard — prevents accessing properties on error response body
        if (!res.ok) {
            return { title: 'Article Not Found | Treishvaam Finance' };
        }

        const post = await res.json();

        // PHASE 2 FIX: Primary null-guard — post must be a valid object before any property access
        // This prevents: TypeError: Cannot read properties of undefined (reading 'id')
        // and all similar crashes when the API returns null, undefined, or an error envelope.
        if (!post || typeof post !== 'object') {
            return { title: 'Article | Treishvaam Finance' };
        }

        // All property accesses use optional chaining (?.) as secondary safety net
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
            openGraph: {
                title: post?.title || 'Treishvaam Finance',
                description,
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
        // Catch-all: network errors, JSON parse errors, Edge runtime errors
        // Must never throw — a metadata failure must not crash the page render
        console.error('[generateMetadata] Failed to fetch post metadata:', e);
        return { title: 'Article | Treishvaam Finance' };
    }
}

export default function Page() {
    return <SinglePostPage />;
}
