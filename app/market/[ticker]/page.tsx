/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export default function Page() {
    return <MarketDetailPage />;
}