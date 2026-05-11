/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed generateStaticParams. Upgraded to Cloudflare Edge SSR.
 * - EDITED: Added `export const runtime = 'edge';` to explicitly opt-in to Cloudflare Edge SSR routing.
 * - EDITED: Implemented native generateMetadata for SEO rendering at the Edge.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: { ticker: string } }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
    try {
        const ticker = decodeURIComponent(params.ticker);
        const res = await fetch(`${API_URL}/api/v1/market/quote/${encodeURIComponent(ticker)}`);

        let titleName = ticker;
        if (res.ok) {
            const quote = await res.json();
            if (quote && quote.name) titleName = quote.name;
        }

        return {
            title: `${titleName} (${ticker}) | Treishvaam Finance`,
            description: `Live quote, historical chart, and data for ${titleName} (${ticker}).`,
            openGraph: {
                title: `${titleName} (${ticker}) | Treishvaam Finance`,
                description: `Live quote, historical chart, and data for ${titleName} (${ticker}).`,
                type: 'website'
            },
            twitter: {
                card: 'summary',
                title: `${titleName} (${ticker}) | Treishvaam Finance`,
                description: `Live quote, historical chart, and data for ${titleName} (${ticker}).`,
            }
        };
    } catch (e) {
        return { title: `${decodeURIComponent(params.ticker)} | Treishvaam Finance` };
    }
}

export default function Page() {
    return <MarketDetailPage />;
}