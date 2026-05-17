"use client";
/**
 * AI-CONTEXT:
 * Purpose: Displays key market statistics (Volume, Ranges, P/E) for a specific asset.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Stripped hardcoded 'USD' logic and implemented `formatSmartPrice` for correct index/currency handling.
 * - EDITED: Added robust prop destructing (`quote`, `quoteData`, `marketData`) to prevent null-returns when parent prop names vary. 
 */
import React from 'react';
import { formatSmartPrice, formatCompactNumber } from '../../utils/marketFormatter';

const DataSummary = ({ quote, quoteData, marketData }) => {
    // Defensively select whichever object has the actual data
    const activeQuote = quote || quoteData || marketData;
    
    if (!activeQuote) return null;

    const formatRange = (low, high, currency, ticker) => {
        if (!low || !high) return 'N/A';
        return `${formatSmartPrice(low, currency, ticker)} - ${formatSmartPrice(high, currency, ticker)}`;
    };

    const stats = [
        { label: 'Previous Close', value: formatSmartPrice(activeQuote.previousClose, activeQuote.currency, activeQuote.ticker) },
        { label: 'Open', value: formatSmartPrice(activeQuote.openPrice || activeQuote.open, activeQuote.currency, activeQuote.ticker) },
        { label: 'Day\'s Range', value: formatRange(activeQuote.dayLow, activeQuote.dayHigh, activeQuote.currency, activeQuote.ticker) },
        { label: '52 Week Range', value: formatRange(activeQuote.fiftyTwoWeekLow, activeQuote.fiftyTwoWeekHigh, activeQuote.currency, activeQuote.ticker) },
        { label: 'Volume', value: formatCompactNumber(activeQuote.volume) },
        { label: 'Market Cap', value: formatCompactNumber(activeQuote.marketCap) },
        { label: 'P/E Ratio (TTM)', value: activeQuote.peRatio ? activeQuote.peRatio.toFixed(2) : 'N/A' },
        { label: 'Dividend Yield', value: activeQuote.dividendYield ? `${(activeQuote.dividendYield * 100).toFixed(2)}%` : 'N/A' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-4 transition-colors duration-300">
            <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                Key Statistics
            </span>

            <div className="space-y-3 text-sm">
                {stats.map(stat => (
                    <div key={stat.label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
                        <span className="font-medium text-slate-900 dark:text-white text-right">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataSummary;