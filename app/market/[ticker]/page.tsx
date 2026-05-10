/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Resolves Next.js "generateStaticParams" build failure during `output: export` to allow client-side fetching of live market tickers.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <MarketDetailPage />;
}