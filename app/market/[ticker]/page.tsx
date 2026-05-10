/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Added `export` keyword to `generateStaticParams` to ensure Next.js correctly registers the static bypass during `output: export`.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <MarketDetailPage />;
}