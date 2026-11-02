/**
 * AI-CONTEXT:
 * Purpose: Global enterprise formatting utility for financial tickers and currencies.
 * Scope: Formats raw Yahoo Finance API tickers into human-readable display names and intelligent currency formats.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: `formatSmartPrice` to prevent indices from being formatted as currencies, while respecting native backend currencies (INR, USD) for Forex/Commodities.
 * - EDITED (Phase 10): Expanded `formatEnterpriseTicker` mapping to human-readable institutional names and category badges for all market tickers; added rawName fallback for unknown stocks.
 */

export const formatEnterpriseTicker = (ticker, rawName = null) => {
    if (!ticker) return { displayTicker: '', displayName: '' };

    const tickerMap = {
        'GC=F': { displayName: 'Gold', displayTicker: 'GOLD · COMEX' },
        'CL=F': { displayName: 'Crude Oil (WTI)', displayTicker: 'WTI CRUDE · NYMEX' },
        'SI=F': { displayName: 'Silver', displayTicker: 'SILVER · COMEX' },
        '^GSPC': { displayName: 'S&P 500', displayTicker: 'S&P 500 · US' },
        '^DJI': { displayName: 'Dow Jones', displayTicker: 'DOW 30 · US' },
        '^IXIC': { displayName: 'NASDAQ Composite', displayTicker: 'NASDAQ · US' },
        '^RUT': { displayName: 'Russell 2000', displayTicker: 'RUSSELL 2K · US' },
        '^VIX': { displayName: 'Volatility Index (VIX)', displayTicker: 'VIX · CBOE' },
        '^NSEI': { displayName: 'NIFTY 50', displayTicker: 'NIFTY 50 · NSE' },
        '^BSESN': { displayName: 'BSE SENSEX', displayTicker: 'SENSEX · BSE' },
        '^NSEBANK': { displayName: 'NIFTY Bank', displayTicker: 'BANK NIFTY · NSE' },
        '^CNXIT': { displayName: 'NIFTY IT', displayTicker: 'NIFTY IT · NSE' },
        '^BSESCP': { displayName: 'BSE SmallCap', displayTicker: 'SMALLCAP · BSE' },
        '^GDAXI': { displayName: 'DAX 40 (Germany)', displayTicker: 'DAX · EUROPE' },
        '^FTSE': { displayName: 'FTSE 100 (UK)', displayTicker: 'FTSE 100 · UK' },
        '^FCHI': { displayName: 'CAC 40 (France)', displayTicker: 'CAC 40 · EUROPE' },
        '^IBEX': { displayName: 'IBEX 35 (Spain)', displayTicker: 'IBEX 35 · EUROPE' },
        '^STOXX50E': { displayName: 'EURO STOXX 50', displayTicker: 'STOXX 50 · EUROPE' },
        'USDINR=X': { displayName: 'US Dollar / INR', displayTicker: 'USD / INR · FX' },
        'EURINR=X': { displayName: 'Euro / INR', displayTicker: 'EUR / INR · FX' },
        'JPYINR=X': { displayName: 'Japanese Yen / INR', displayTicker: 'JPY / INR · FX' },
        'GBPINR=X': { displayName: 'British Pound / INR', displayTicker: 'GBP / INR · FX' },
        'AUDINR=X': { displayName: 'Australian Dollar / INR', displayTicker: 'AUD / INR · FX' },
        'BTC-INR': { displayName: 'Bitcoin', displayTicker: 'BTC / INR · CRYPTO' },
        'ETH-INR': { displayName: 'Ethereum', displayTicker: 'ETH / INR · CRYPTO' },
        'SOL-INR': { displayName: 'Solana', displayTicker: 'SOL / INR · CRYPTO' },
        'XRP-INR': { displayName: 'XRP', displayTicker: 'XRP / INR · CRYPTO' },
        'DOGE-INR': { displayName: 'Dogecoin', displayTicker: 'DOGE / INR · CRYPTO' },
        'RELIANCE.BSE': { displayName: 'Reliance Industries', displayTicker: 'RELIANCE · INDIA' },
        'RELIANCE.NS': { displayName: 'Reliance Industries', displayTicker: 'RELIANCE · INDIA' },
        'TCS.BSE': { displayName: 'Tata Consultancy Services', displayTicker: 'TCS · INDIA' },
        'TCS.NS': { displayName: 'Tata Consultancy Services', displayTicker: 'TCS · INDIA' },
        'HDFCBANK.BSE': { displayName: 'HDFC Bank', displayTicker: 'HDFCBANK · INDIA' },
        'HDFCBANK.NS': { displayName: 'HDFC Bank', displayTicker: 'HDFCBANK · INDIA' },
        'INFY.BSE': { displayName: 'Infosys', displayTicker: 'INFY · INDIA' },
        'INFY.NS': { displayName: 'Infosys', displayTicker: 'INFY · INDIA' },
    };

    if (tickerMap[ticker]) return tickerMap[ticker];

    // Fallback for any other stock: use rawName if present and different from ticker
    if (rawName && rawName !== ticker) {
        return { displayName: rawName, displayTicker: ticker.replace(/\.(BSE|NS)$/i, '') };
    }

    // Generic cleanup fallback
    let cleanTicker = ticker.replace('=X', '').replace('=F', '').replace('^', '');
    if (cleanTicker.length === 6 && ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].includes(cleanTicker.substring(0, 3))) {
        cleanTicker = `${cleanTicker.substring(0, 3)} / ${cleanTicker.substring(3, 6)}`;
    }
    if (cleanTicker.includes('-')) {
        cleanTicker = cleanTicker.replace('-', ' / ');
    }
    return { displayTicker: cleanTicker, displayName: rawName || cleanTicker };
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