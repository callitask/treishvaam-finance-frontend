// src/components/market/WatchlistSidebar.js
import React, { useEffect, useState } from 'react';
import { useWatchlist } from '../../context/WatchlistContext';
import { getQuotesBatch } from '../../apiConfig';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Star, Loader2 } from 'lucide-react';

// NAMED EXPORT (Fixed)
export const WatchlistSidebar = () => {
    const { watchlist, toggleWatchlist } = useWatchlist();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!watchlist || watchlist.length === 0) {
            setQuotes([]);
            return;
        }

        const fetchQuotes = async () => {
            setLoading(true);
            try {
                const response = await getQuotesBatch(watchlist);
                const orderedQuotes = watchlist.map(ticker =>
                    response.data.find(q => q.ticker === ticker)
                ).filter(Boolean);

                setQuotes(orderedQuotes);
            } catch (error) {
                console.error("Failed to fetch watchlist quotes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
        const interval = setInterval(fetchQuotes, 30000);
        return () => clearInterval(interval);
    }, [watchlist]);

    if (watchlist.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 text-center shadow-sm mb-8 transition-colors duration-300">
                <div className="bg-sky-50 dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="text-sky-600 dark:text-sky-400" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Your Watchlist</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Star assets to track them here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm mb-8 transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                <h3 className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    My Watchlist
                </h3>
                {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {quotes.map(quote => {
                    const change = quote.changeAmount || 0;
                    const isUp = change >= 0;
                    const color = isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                    return (
                        <div key={quote.ticker} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group relative">
                            <Link to={`/market/${encodeURIComponent(quote.ticker)}`} className="flex justify-between items-center">
                                <div className="min-w-0 flex-1 pr-4">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{quote.ticker}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{quote.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {quote.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${color}`}>
                                        {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        {Math.abs(change).toFixed(2)} ({quote.changePercent?.toFixed(2)}%)
                                    </div>
                                </div>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleWatchlist(quote.ticker);
                                }}
                                className="absolute left-0 top-0 bottom-0 w-8 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white/90 dark:bg-slate-800/95 transition-opacity z-10 text-gray-400 hover:text-red-500"
                                title="Remove from Watchlist"
                            >
                                <Star size={14} className="fill-amber-400 text-amber-400 hover:text-gray-400 hover:fill-none" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};