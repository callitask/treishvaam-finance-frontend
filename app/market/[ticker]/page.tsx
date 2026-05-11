/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Recreated natively in VS Code to enforce pure UTF-8 encoding.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

// Forces the static exporter to skip pre-rendering and rely on Client-Side routing
export function generateStaticParams() {
    return [
        {
            ticker: 'RELIANCE.NS'
        }
    ];
}

export default function Page() {
    return <MarketDetailPage />;
}