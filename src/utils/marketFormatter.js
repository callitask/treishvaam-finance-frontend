/**
 * AI-CONTEXT:
 * Purpose: Global enterprise formatting utility for financial tickers and currencies.
 * Scope: Formats raw Yahoo Finance API tickers into human-readable display names and intelligent currency formats.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: `formatSmartPrice` to prevent indices from being formatted as currencies, while respecting native backend currencies (INR, USD) for Forex/Commodities.
 */

export const formatEnterpriseTicker = (ticker, fallbackName = null) => {
    if (!ticker) return { displayTicker: '', displayName: '' };

    let cleanTicker = ticker.replace('=X', '').replace('=F', '').replace('^', '');

    // Auto-format Forex
    if (cleanTicker.length === 6 && ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].includes(cleanTicker.substring(0, 3))) {
        cleanTicker = `${cleanTicker.substring(0, 3)} / ${cleanTicker.substring(3, 6)}`;
    }

    // Auto-format Crypto
    if (cleanTicker.includes('-')) {
        cleanTicker = cleanTicker.replace('-', ' / ');
    }

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

export const formatSmartPrice = (price, currency, ticker) => {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';

    const isIndex = ticker && ticker.startsWith('^');

    // Indices do not use currency symbols (they are points)
    if (isIndex) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    }

    // Forex/Commodities/Stocks use their native backend currency symbol
    if (currency && currency !== 'null' && currency.length === 3) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(price);
        } catch (e) {
            console.warn("Invalid currency code:", currency);
        }
    }

    // Fallback formatting
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

export const formatCompactNumber = (num) => {
    if (num === null || num === undefined || isNaN(num) || num === 0) return 'N/A';
    const numAbs = Math.abs(num);
    if (numAbs >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (numAbs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (numAbs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (numAbs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};