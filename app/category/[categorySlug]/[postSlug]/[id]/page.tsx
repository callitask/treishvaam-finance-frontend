/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Single Post page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export default function Page() {
    return <SinglePostPage />;
}