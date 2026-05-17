/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for editing existing Blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 * - EDITED: Added `export const runtime = 'edge';` to explicitly opt-in to Cloudflare Edge SSR routing.
 * - EDITED: Switched to client-side dynamic wrapper with ssr: false.
 * - EDITED (2026-05-17 Cloudflare Build Fix): Restored `export const runtime = 'edge';` and removed `"use client"` 
 * from the page root. Cloudflare Pages next-on-pages adapter requires dynamic routes to explicitly export the edge runtime.
 */
import dynamic from 'next/dynamic';

export const runtime = 'edge';

const BlogEditorPage = dynamic(
    () => import('../../../../../../src/pages/BlogEditorPage'),
    { 
        ssr: false, 
        loading: () => (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin" />
            </div>
        ) 
    }
);

export default function Page() {
    return <BlogEditorPage />;
}