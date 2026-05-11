/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for editing existing Blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 * - EDITED: Added `export const runtime = 'edge';` to explicitly opt-in to Cloudflare Edge SSR routing.
 */
import BlogEditorPage from '../../../../../../src/pages/BlogEditorPage';

export const runtime = 'edge';

export default function Page() {
    return <BlogEditorPage />;
}