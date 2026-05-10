/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Converted generateStaticParams to an async function returning dummy data. 
 * - WHY: Resolves Next.js 14 compiler crash where returning an empty array causes the route analyzer to fail to infer the [ticker] parameter mapping.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export async function generateStaticParams() {
    // Providing a single dummy parameter explicitly maps the [ticker] folder for the compiler.
    return [
        { ticker: '^GSPC' }
    ];
}

export default function Page() {
    return <MarketDetailPage />;
}