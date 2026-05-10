"use client";
/**
 * AI-CONTEXT:
 * Purpose: Displays key market statistics (Volume, Ranges, P/E) for a specific asset.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Stripped hardcoded 'USD' logic and implemented `formatSmartPrice` for correct index/currency handling.
 */
import React from 'react';
import { formatSmartPrice, formatCompactNumber } from '../../utils/marketFormatter';

const DataSummary = ({ quote }) => {
    if (!quote) return null;

    const formatRange = (low, high, currency, ticker) => {
        if (!low || !high) return 'N/A';
        return `${formatSmartPrice(low, currency, ticker)} - ${formatSmartPrice(high, currency, ticker)}`;
    };

    const stats = [
        { label: 'Previous Close', value: formatSmartPrice(quote.previousClose, quote.currency, quote.ticker) },
        { label: 'Open', value: formatSmartPrice(quote.openPrice || quote.open, quote.currency, quote.ticker) },
        { label: 'Day\'s Range', value: formatRange(quote.dayLow, quote.dayHigh, quote.currency, quote.ticker) },
        { label: '52 Week Range', value: formatRange(quote.fiftyTwoWeekLow, quote.fiftyTwoWeekHigh, quote.currency, quote.ticker) },
        { label: 'Volume', value: formatCompactNumber(quote.volume) },
        { label: 'Market Cap', value: formatCompactNumber(quote.marketCap) },
        { label: 'P/E Ratio (TTM)', value: quote.peRatio ? quote.peRatio.toFixed(2) : 'N/A' },
        { label: 'Dividend Yield', value: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A' },
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