/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Single Post page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 * - EDITED: Added `export const runtime = 'edge';` to explicitly opt-in to Cloudflare Edge SSR routing.
 * - EDITED: Implemented native generateMetadata for SEO / OpenGraph rendering at the Edge.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export const runtime = 'edge';

// Native Next.js Server-Side SEO Generation
export async function generateMetadata({ params }: { params: { id: string } }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
    try {
        const res = await fetch(`${API_URL}/api/v1/posts/url/${params.id}`);
        if (!res.ok) return { title: 'Article Not Found | Treishvaam Finance' };

        const post = await res.json();
        const coverImage = post.thumbnailUrl
            ? `${API_URL}/api/v1/files/download/${post.thumbnailUrl}`
            : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';

        return {
            title: `${post.title} | Treishvaam Finance`,
            description: post.metaDescription || post.excerpt,
            keywords: post.keywords,
            openGraph: {
                title: post.title,
                description: post.metaDescription || post.excerpt,
                images: [coverImage],
                type: 'article'
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.metaDescription || post.excerpt,
                images: [coverImage],
            }
        };
    } catch (e) {
        return { title: 'Article | Treishvaam Finance' };
    }
}

export default function Page() {
    return <SinglePostPage />;
}