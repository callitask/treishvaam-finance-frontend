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
 * - SESSION 2026-05-13: Added `await Promise.resolve(params)` in `generateMetadata` to ensure Next.js 15 
 * compatibility, guaranteeing `.id` access is always safe. 
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: export const runtime = 'edge' and generateMetadata
 * - EDITED: Next.js migration (CRA → Next.js 14 App Router)
 * - EDITED: Fixed TypeError by adding explicit null-guards after metadata API fetch.
 * - EDITED (2026-05-13): Wrapped `params` in Promise.resolve to prevent async/sync Proxy crashes in Next 15.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export const runtime = 'edge';

// Native Next.js Server-Side SEO Generation at the Edge
export async function generateMetadata({ params }: { params: any }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';

    // FIX: Next.js 15 treats `params` as a Promise. Resolving it guarantees safety in both Next 14 & 15.
    const resolvedParams = await Promise.resolve(params);

    if (!resolvedParams?.id) {
        return { title: 'Article Not Found | Treishvaam Finance' };
    }

    try {
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