"use client";
/**
 * AI-CONTEXT:
 * Purpose: Global market ticker strip.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated routing to Next.js App Router (`next/link`).
 * - EDITED: Stripped broken `GlobalMarketTicker.css` dependency and rebuilt entirely with Tailwind CSS flexbox constraints.
 * - EDITED: Integrated `formatEnterpriseTicker` to display human-readable asset names instead of raw API tickers.
 * - EDITED: Implemented dynamic key extraction to safely resolve price and percentage data from varying API payload structures.
 */
import React, { useState, useEffect } from 'react';
import { getQuotesBatch } from '../../apiConfig';
import Link from 'next/link';
import { formatEnterpriseTicker } from '../../utils/marketFormatter';

const formatChange = (change) => {
    if (change == null || isNaN(change)) return '0.00%';
    return `${change.toFixed(2)}%`;
};

const getChangeColor = (change) => {
    if (change == null || isNaN(change)) return 'text-slate-600';
    return change >= 0 ? 'text-emerald-600' : 'text-red-600';
};

const marketTabs = {
    'Markets': ['^GSPC', '^IXIC', '^NSEI', 'GC=F', 'CL=F', 'BTC-INR'],
    'US': ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
    'Europe': ['^GDAXI', '^FTSE', '^FCHI', '^IBEX', '^STOXX50E'],
    'India': ['^NSEI', '^BSESN', '^NSEBANK', '^CNXIT', '^BSESCP'],
    'Commodities': ['GC=F', 'SI=F', 'CL=F'],
    'Currencies': ['USDINR=X', 'EURINR=X', 'JPYINR=X', 'GBPINR=X', 'AUDINR=X'],
    'Crypto': ['BTC-INR', 'ETH-INR', 'SOL-INR', 'XRP-INR', 'DOGE-INR']
};

const TickerCard = ({ quote }) => {
    if (!quote) return null;

    // SAFE EXTRACTION: Handle variations in backend payload structure
    const rawPrice = quote.currentPrice ?? quote.price ?? quote.regularMarketPrice ?? null;
    const rawChange = quote.changePercent ?? quote.changePercentage ?? quote.regularMarketChangePercent ?? 0;

    // Ensure change is a parsed float
    const parsedChange = typeof rawChange === 'string' ? parseFloat(rawChange.replace('%', '')) : rawChange;
    const color = getChangeColor(parsedChange);

    // Enforce Human-Readable formatting
    const { displayTicker, displayName } = formatEnterpriseTicker(quote.ticker, quote.name);

    return (
        <Link href={`/market/${encodeURIComponent(quote.ticker)}`} className="flex flex-col justify-center min-w-[170px] max-w-[200px] px-5 py-2 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer h-full">
            <div className="flex flex-col mb-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs truncate w-full">{displayName}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase">{displayTicker}</span>
            </div>
            <div className={`flex items-baseline gap-2 ${color} text-xs`}>
                <span className="font-bold tabular-nums tracking-tight">
                    {rawPrice !== null ? Number(rawPrice).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '...'}
                </span>
                <span className="font-bold text-[10px]">
                    {parsedChange >= 0 ? '+' : ''}{formatChange(parsedChange)}
                </span>
            </div>
        </Link>
    );
};

const GlobalMarketTicker = ({ mobileMode = false }) => {
    const [activeTab, setActiveTab] = useState('Markets');
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchQuotes = async () => {
            setLoading(true);
            try {
                const tickers = marketTabs[activeTab];
                if (!tickers || tickers.length === 0) return;

                const response = await getQuotesBatch(tickers);

                if (isMounted && response.data) {
                    const orderedQuotes = tickers.map(ticker =>
                        response.data.find(q => q.ticker === ticker)
                    ).filter(Boolean);
                    setQuotes(orderedQuotes);
                }
            } catch (error) {
                console.error(`Failed to fetch quotes for ${activeTab}:`, error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchQuotes();
        return () => { isMounted = false; };
    }, [activeTab]);

    const containerClasses = mobileMode
        ? "w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800"
        : "bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm";

    const innerClasses = mobileMode
        ? "w-full"
        : "container mx-auto max-w-screen-2xl";

    return (
        <div className={containerClasses}>
            <div className={innerClasses}>

                {/* 1. Category Tabs */}
                <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2 sm:px-4">
                    {Object.keys(marketTabs).map(tabName => (
                        <button
                            key={tabName}
                            onClick={() => setActiveTab(tabName)}
                            className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${activeTab === tabName
                                ? 'border-sky-600 text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                {/* 2. Ticker Data Row (Horizontal Flex constraint) */}
                <div className="w-full overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
                    <div className="flex items-center min-w-max h-[72px]">
                        {loading && (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col justify-center min-w-[170px] px-5 py-2 border-r border-slate-100 dark:border-slate-800 h-full flex-shrink-0">
                                    <div className="w-24 h-3 mb-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                                </div>
                            ))
                        )}
                        {!loading && quotes.map(quote => (
                            <TickerCard key={quote.ticker} quote={quote} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalMarketTicker;