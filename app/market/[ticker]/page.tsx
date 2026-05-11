/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 * - EDITED: Added `export const runtime = 'edge';` to explicitly opt-in to Cloudflare Edge SSR routing.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export const runtime = 'edge';

export default function Page() {
    return <MarketDetailPage />;
}