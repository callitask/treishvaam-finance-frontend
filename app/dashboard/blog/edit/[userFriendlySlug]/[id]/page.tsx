/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for editing existing Blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 */
import BlogEditorPage from '../../../../../../src/pages/BlogEditorPage';

export default function Page() {
    return <BlogEditorPage />;
}