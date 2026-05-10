/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Single Post Page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Resolves Next.js "generateStaticParams" build failure during `output: export` by intentionally returning an empty array to force CSR SPA fallback on Cloudflare Pages.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <SinglePostPage />;
}