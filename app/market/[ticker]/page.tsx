/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Server component wrapper to allow generateStaticParams with static export.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <MarketDetailPage />;
}