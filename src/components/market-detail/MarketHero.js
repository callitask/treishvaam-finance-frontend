// src/components/market-detail/MarketHero.js
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Share2, Star } from 'lucide-react'; // <--- Import Star
import { useWatchlist } from '../../context/WatchlistContext'; // <--- Import Hook

// Helper to format the big price number
const formatPrice = (price, currency) => {
    if (price == null) return 'N/A';
    const options = {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    if (price > 1000) options.minimumFractionDigits = 0;
    if (price < 10) options.minimumFractionDigits = 3;

    return price.toLocaleString('en-US', options);
};

// Helper to format change
const formatChange = (change) => {
    if (change == null) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
};

const MarketHero = ({ quote }) => {
    const isPos = quote.changeAmount >= 0;
    const color = isPos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

    // --- WATCHLIST LOGIC ---
    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const isWatched = isInWatchlist(quote.ticker);

    return (
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">HOME</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-gray-700 dark:text-gray-300">{quote.ticker}</span>
            </div>

            <div className="flex justify-between items-start">
                {/* Asset Title */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quote.name}</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-2">
                        <span>{quote.ticker}</span>
                        <span>&middot;</span>
                        <span>{quote.currency}</span>
                        <span>&middot;</span>
                        <span>{quote.primaryExchange || 'Global Market'}</span>
                    </div>
                </div>

                {/* Actions: Watchlist & Share */}
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleWatchlist(quote.ticker)}
                        className={`p-2 rounded-full transition-colors border ${isWatched
                                ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                                : 'bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:text-amber-400'
                            }`}
                        title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <Star size={20} className={isWatched ? "fill-current" : ""} />
                    </button>

                    <button
                        className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Share"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Primary Data Block */}
            <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(quote.currentPrice, quote.currency)}
                </span>

                <div className={`flex items-center text-2xl font-medium mt-1 ${color}`}>
                    {isPos ? <TrendingUp size={24} className="mr-1" /> : <TrendingDown size={24} className="mr-1" />}
                    <span>{formatChange(quote.changeAmount)}</span>
                    <span className="ml-3">
                        ({formatChange(quote.changePercent)}%)
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