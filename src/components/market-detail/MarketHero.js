"use client";
/**
 * AI-CONTEXT:
 * Purpose: Primary header for the Market Detail page showing current price and daily change.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Integrated `formatSmartPrice` to ensure intelligent currency formatting.
 * - EDITED: Extracted raw fields defensively to prevent NaNs on payload variation.
 */
import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Share2, Star } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { formatEnterpriseTicker, formatSmartPrice } from '../../utils/marketFormatter';

const MarketHero = ({ quote }) => {
    if (!quote) return null;

    // Defensively extract variations of backend payloads
    const rawPrice = quote.currentPrice ?? quote.price ?? null;
    const rawChangeAmt = quote.changeAmount ?? quote.change ?? 0;
    const rawChangePct = quote.changePercent ?? quote.changePercentage ?? 0;

    const isPos = rawChangeAmt >= 0;
    const color = isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const isWatched = isInWatchlist(quote.ticker);
    const { displayTicker, displayName } = formatEnterpriseTicker(quote.ticker, quote.name);

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
                        <span>{quote.currency || 'USD'}</span>
                        <span>&middot;</span>
                        <span>{quote.primaryExchange || 'Global Market'}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => toggleWatchlist(quote.ticker)}
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
                    {formatSmartPrice(rawPrice, quote.currency, quote.ticker)}
                </span>

                <div className={`flex items-center text-2xl font-medium mt-1 ${color}`}>
                    {isPos ? <TrendingUp size={24} className="mr-1" /> : <TrendingDown size={24} className="mr-1" />}
                    <span>{rawChangeAmt >= 0 ? '+' : ''}{rawChangeAmt.toFixed(2)}</span>
                    <span className="ml-3">
                        ({rawChangePct >= 0 ? '+' : ''}{rawChangePct.toFixed(2)}%)
                    </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {quote.lastUpdated ? `As of ${new Date(quote.lastUpdated).toLocaleString()}` : 'Data as of last update'}
                </div>
            </div>
        </div>
    );
};

export default MarketHero;