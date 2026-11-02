/**
 * AI-CONTEXT:
 * Purpose: Global enterprise formatting utility for financial tickers and currencies.
 * Scope: Formats raw Yahoo Finance API tickers into human-readable display names and intelligent currency formats.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: `formatSmartPrice` to prevent indices from being formatted as currencies, while respecting native backend currencies (INR, USD) for Forex/Commodities.
 * - EDITED (Phase 10): Expanded `formatEnterpriseTicker` mapping to human-readable institutional names and category badges for all market tickers; added rawName fallback for unknown stocks.
 * - EDITED (Phase 11): Added geo-aware currency engine (INR/USD/EUR/GBP), live FX conversion, universal currency symbols, and parseSafeDate.
 */

const FX_TO_INR = { INR: 1, USD: 84.40, EUR: 91.80, GBP: 109.20, JPY: 0.56, AUD: 55.40 };

export const getNativeCurrency = (ticker, rawCurrency) => {
    const t = String(ticker || '').toUpperCase();
    if (t.endsWith('=X')) return 'INR';
    if (['^NSEI', '^BSESN', '^NSEBANK', '^CNXIT', '^BSESCP'].includes(t)) return 'INR';
    if (t.endsWith('.BSE') || t.endsWith('.NS') || t.endsWith('-INR')) return 'INR';
    if (['^GDAXI', '^FCHI', '^IBEX', '^STOXX50E'].includes(t)) return 'EUR';
    if (t === '^FTSE') return 'GBP';
    if (rawCurrency && rawCurrency !== 'null' && String(rawCurrency).length === 3) return String(rawCurrency).toUpperCase();
    return 'USD';
};

export const getUserDisplayCurrency = () => {
    if (typeof window === 'undefined') return 'USD';
    try {
        const stored = localStorage.getItem('treish_display_currency');
        if (stored && ['INR', 'USD', 'EUR', 'GBP'].includes(stored)) return stored;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
        if (tz === 'Europe/London') return 'GBP';
        if (tz.startsWith('Europe/')) return 'EUR';
        return 'USD';
    } catch (e) {
        return 'USD';
    }
};

export const setUserDisplayCurrency = (curr) => {
    if (typeof window === 'undefined') return;
    if (['INR', 'USD', 'EUR', 'GBP'].includes(curr)) {
        localStorage.setItem('treish_display_currency', curr);
        window.dispatchEvent(new Event('currencyChange'));
    }
};

export const updateFxRatesFromQuotes = (quotes) => {
    if (!Array.isArray(quotes)) return;
    for (const q of quotes) {
        const t = String(q.ticker || q.symbol || '').toUpperCase();
        const price = parseFloat(q.currentPrice ?? q.price ?? q.closePrice);
        if (!isFinite(price)) continue;
        if (t === 'USDINR=X') FX_TO_INR.USD = price;
        else if (t === 'EURINR=X') FX_TO_INR.EUR = price;
        else if (t === 'GBPINR=X') FX_TO_INR.GBP = price;
        else if (t === 'JPYINR=X') FX_TO_INR.JPY = price;
        else if (t === 'AUDINR=X') FX_TO_INR.AUD = price;
    }
};

export const getFxMultiplier = (fromCurr, toCurr, ticker) => {
    const t = String(ticker || '').toUpperCase();
    if (t.endsWith('=X')) return 1;
    if (fromCurr === toCurr) return 1;
    const from = FX_TO_INR[fromCurr] || 1;
    const to = FX_TO_INR[toCurr] || 1;
    return from / to;
};

export const convertValueForDisplay = (val, rawCurrency, ticker) => {
    const n = parseFloat(val);
    if (!isFinite(n)) return val;
    const native = getNativeCurrency(ticker, rawCurrency);
    const display = getUserDisplayCurrency();
    const mult = getFxMultiplier(native, display, ticker);
    return n * mult;
};

export const getActiveCurrencySymbol = (rawCurrency, ticker) => {
    const t = String(ticker || '').toUpperCase();
    if (t.endsWith('=X')) return '\u20B9';
    const display = getUserDisplayCurrency();
    const symbols = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
    return symbols[display] || '$';
};

export const parseSafeDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
    if (Array.isArray(dateInput)) {
        const [y, m, d, h = 0, min = 0, s = 0] = dateInput;
        const dt = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, s || 0);
        return isNaN(dt.getTime()) ? null : dt;
    }
    if (typeof dateInput === 'string') {
        const s = dateInput.trim();
        if (s.startsWith('[')) {
            try {
                const arr = JSON.parse(s);
                return parseSafeDate(arr);
            } catch (e) {}
        }
        let dt = new Date(s);
        if (!isNaN(dt.getTime())) return dt;
        dt = new Date(s.replace(' ', 'T'));
        if (!isNaN(dt.getTime())) return dt;
    }
    return null;
};

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

    if (rawName && rawName !== ticker) {
        return { displayName: rawName, displayTicker: ticker.replace(/\.(BSE|NS)$/i, '') };
    }

    let cleanTicker = ticker.replace('=X', '').replace('=F', '').replace('^', '');
    if (cleanTicker.length === 6 && ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].includes(cleanTicker.substring(0, 3))) {
        cleanTicker = `${cleanTicker.substring(0, 3)} / ${cleanTicker.substring(3, 6)}`;
    }
    if (cleanTicker.includes('-')) {
        cleanTicker = cleanTicker.replace('-', ' / ');
    }
    return { displayTicker: cleanTicker, displayName: rawName || cleanTicker };
};

export const formatSmartPrice = (price, rawCurrency, ticker) => {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';
    const converted = convertValueForDisplay(price, rawCurrency, ticker);
    const symbol = getActiveCurrencySymbol(rawCurrency, ticker);
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(converted);
    return `${symbol}${formatted}`;
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