/**
 * AI-CONTEXT:
 * Purpose: Global enterprise formatting utility for financial tickers.
 * Scope: Formats raw Yahoo Finance API tickers into human-readable display names.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Created formatter to replace raw identifiers (GC=F, EURINR=X) with clean names (Gold, EUR / INR).
 */

export const formatEnterpriseTicker = (ticker, fallbackName = null) => {
    if (!ticker) return { displayTicker: '', displayName: '' };

    let cleanTicker = ticker.replace('=X', '').replace('=F', '').replace('^', '');

    // Auto-format Forex (e.g., EURINR -> EUR / INR)
    if (cleanTicker.length === 6 && ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].includes(cleanTicker.substring(0, 3))) {
        cleanTicker = `${cleanTicker.substring(0, 3)} / ${cleanTicker.substring(3, 6)}`;
    }

    // Auto-format Crypto
    if (cleanTicker.includes('-')) {
        cleanTicker = cleanTicker.replace('-', ' / ');
    }

    // Exact mapping synced from backend market_data_updater.py
    const aliases = {
        '^GSPC': 'S&P 500', '^DJI': 'Dow Jones Industrial Average', '^IXIC': 'NASDAQ Composite',
        '^RUT': 'Russell 2000', '^VIX': 'CBOE Volatility Index', '^NYA': 'NYSE Composite',
        '^GDAXI': 'DAX Performance-Index', '^FTSE': 'FTSE 100', '^FCHI': 'CAC 40',
        '^IBEX': 'IBEX 35', '^STOXX50E': 'EURO STOXX 50', '^NSEI': 'NIFTY 50',
        '^BSESN': 'BSE SENSEX', '^NSEBANK': 'NIFTY Bank', '^CNXIT': 'NIFTY IT',
        '^HSI': 'Hang Seng Index', '^N225': 'Nikkei 225', '^STI': 'STI Index',
        '000001.SS': 'SSE Composite Index', 'GC=F': 'Gold', 'SI=F': 'Silver',
        'CL=F': 'Crude Oil', 'NG=F': 'Natural Gas', 'HG=F': 'Copper',
        'USDINR=X': 'USD / INR', 'EURINR=X': 'EUR / INR', 'JPYINR=X': 'JPY / INR',
        'GBPINR=X': 'GBP / INR', 'AUDINR=X': 'AUD / INR', 'EURUSD=X': 'EUR / USD',
        'BTC-INR': 'Bitcoin / INR', 'ETH-INR': 'Ethereum / INR', 'SOL-INR': 'Solana / INR',
        'XRP-INR': 'XRP / INR', 'DOGE-INR': 'Dogecoin / INR'
    };

    const displayName = aliases[ticker] || fallbackName || cleanTicker;

    return {
        displayTicker: cleanTicker,
        displayName: displayName
    };
};