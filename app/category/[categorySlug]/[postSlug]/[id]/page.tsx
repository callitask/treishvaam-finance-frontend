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
 * - Fixed Next.js 15 routing crash by wrapping params in Promise.resolve(), preventing async
 * access violations that cause undefined IDs.
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
 * • Wrapped params in `await Promise.resolve(params)` to handle Next.js 15 Promise-based params safely.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export const runtime = 'edge';

// Native Next.js Server-Side SEO Generation at the Edge
// PHASE 2 FIX: All post property accesses are null-guarded to prevent TypeError
export async function generateMetadata({ params }: { params: any }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';

    try {
        // Next.js 15 compat: resolve params as a promise to prevent undefined errors
        const resolvedParams = await Promise.resolve(params);

        if (!resolvedParams || !resolvedParams.id) {
            return { title: 'Article Not Found | Treishvaam Finance' };
        }

        const res = await fetch(`${API_URL}/api/v1/posts/url/${resolvedParams.id}`, {
            cache: 'no-store',
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
        console.error('[generateMetadata] Failed to fetch post metadata:', e);
        return { title: 'Article | Treishvaam Finance' };
    }
}

export default function Page() {
    return <SinglePostPage />;
}