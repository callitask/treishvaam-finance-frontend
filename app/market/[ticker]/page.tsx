/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Explicitly defined ALL supported tickers in `generateStaticParams`.
 * - WHY: Resolves the Cloudflare 404 SPA fallback redirect. Generates discrete HTML files for all known assets, guaranteeing they render instantly without routing to the homepage.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';

export async function generateStaticParams() {
    // Definitive list of all tracking tickers supported by the backend script
    const tickers = [
        '^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', '^NYA',
        '^GDAXI', '^FTSE', '^FCHI', '^IBEX', '^STOXX50E',
        '^NSEI', '^BSESN', '^NSEBANK', '^CNXIT', '^BSESCP',
        '^HSI', '^N225', '^STI', '000001.SS',
        'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F',
        'USDINR=X', 'EURINR=X', 'JPYINR=X', 'GBPINR=X', 'AUDINR=X', 'EURUSD=X',
        'BTC-INR', 'ETH-INR', 'SOL-INR', 'XRP-INR', 'DOGE-INR'
    ];

    return tickers.map((ticker) => ({
        ticker: ticker,
    }));
}

export default function Page() {
    return <MarketDetailPage />;
}