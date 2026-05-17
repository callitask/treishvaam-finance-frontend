"use client";
/**
 * AI-CONTEXT:
 * Purpose: Primary header for the Market Detail page showing current price and daily change.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Integrated `formatSmartPrice` to ensure intelligent currency formatting.
 * - EDITED: Extracted raw fields defensively to prevent NaNs on payload variation.
 * - EDITED: Added Zero-Trust Fallback Pattern (`quoteData`, `marketData`). This prevents the company name, ticker, and exchange from disappearing when the 30-second live polling interval overwrites the `quoteData` state with a lightweight price-only payload.
 */
import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Share2, Star } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { formatEnterpriseTicker, formatSmartPrice } from '../../utils/marketFormatter';

const MarketHero = ({ quote, quoteData, marketData, ticker: fallbackTicker }) => {
    // 1. Scan for active live data (prioritize the freshest quote)
    const activeQuote = quote || quoteData || marketData;
    if (!activeQuote) return null;

    // 2. Defensively map variations of price and change (Live Data)
    const rawPrice = activeQuote.currentPrice ?? activeQuote.price ?? null;
    const rawChangeAmt = activeQuote.changeAmount ?? activeQuote.change ?? 0;
    const rawChangePct = activeQuote.changePercent ?? activeQuote.changePercentage ?? 0;

    const isPos = rawChangeAmt >= 0;
    const color = isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

    // 3. Fallback Mapping (Static Data) - If the 30s tick drops the name/profile, pull it from the static marketData
    const profile = activeQuote.profile || activeQuote.assetProfile || marketData?.profile || {};
    const ticker = activeQuote.ticker || marketData?.ticker || fallbackTicker || 'UNKNOWN';
    const name = activeQuote.name || activeQuote.shortName || marketData?.name || profile.name || ticker;
    const currency = activeQuote.currency || marketData?.currency || profile.currency || 'USD';
    const exchange = activeQuote.primaryExchange || marketData?.primaryExchange || profile.exchange || 'Global Market';

    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const isWatched = isInWatchlist(ticker);
    const { displayTicker, displayName } = formatEnterpriseTicker(ticker, name);

    return (
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link href="/home" className="hover:text-blue-600 dark:hover:text-blue-400">HOME</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-gray-700 dark:text-gray-300">{displayTicker}</span>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-2">
                        <span>{displayTicker}</span>
                        <span>&middot;</span>
                        <span>{currency}</span>
                        <span>&middot;</span>
                        <span>{exchange}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => toggleWatchlist(ticker)}
                        className={`p-2 rounded-full transition-colors border ${isWatched ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-900/30' : 'bg-white border-gray-200 text-gray-400 dark:bg-slate-800 dark:border-slate-600'}`}
                    >
                        <Star size={20} className={isWatched ? "fill-current" : ""} />
                    </button>
                    <button className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {formatSmartPrice(rawPrice, currency, ticker)}
                </span>

                <div className={`flex items-center text-2xl font-medium mt-1 ${color}`}>
                    {isPos ? <TrendingUp size={24} className="mr-1" /> : <TrendingDown size={24} className="mr-1" />}
                    <span>{rawChangeAmt >= 0 ? '+' : ''}{rawChangeAmt.toFixed(2)}</span>
                    <span className="ml-3">
                        ({rawChangePct >= 0 ? '+' : ''}{rawChangePct.toFixed(2)}%)
                    </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeQuote.lastUpdated ? `As of ${new Date(activeQuote.lastUpdated).toLocaleString()}` : 'Data as of last update'}
                </div>
            </div>
        </div>
    );
};

export default MarketHero;