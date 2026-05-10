"use client";
/**
 * AI-CONTEXT:
 * Purpose: Displays key market statistics (Volume, Ranges, P/E) for a specific asset.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Added `"use client";` directive.
 * - EDITED: Fortified null-handling for Day/52-Week ranges to seamlessly handle partial data payloads from the Python backend.
 */
import React from 'react';

// Helper to format numbers
const formatNumber = (num, style = 'decimal', currency = 'USD') => {
    if (num === null || num === undefined || isNaN(num) || num === 0) return 'N/A';

    const numAbs = Math.abs(num);
    let options = {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    };

    if (style === 'currency') {
        options.style = 'currency';
        // FIX: Fallback to 'USD' if currency is null/undefined/empty to prevent crash
        options.currency = (currency && currency !== 'null') ? currency : 'USD';
        if (numAbs > 1000) options.minimumFractionDigits = 0;
    }

    if (style === 'compact') {
        if (numAbs >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (numAbs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (numAbs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (numAbs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }

    try {
        return new Intl.NumberFormat('en-US', options).format(num);
    } catch (e) {
        // Fallback if currency code is still invalid (e.g., "XYZ")
        console.error("Formatting error:", e);
        return num.toString();
    }
};

const DataSummary = ({ quote }) => {

    // Helper for safe range rendering
    const formatRange = (low, high, currency) => {
        if (!low || !high) return 'N/A';
        return `${formatNumber(low, 'currency', currency)} - ${formatNumber(high, 'currency', currency)}`;
    };

    // Create Key-Value pair list
    const stats = [
        { label: 'Previous Close', value: formatNumber(quote.previousClose, 'currency', quote.currency) },
        { label: 'Open', value: formatNumber(quote.openPrice, 'currency', quote.currency) },
        { label: 'Day\'s Range', value: formatRange(quote.dayLow, quote.dayHigh, quote.currency) },
        { label: '52 Week Range', value: formatRange(quote.fiftyTwoWeekLow, quote.fiftyTwoWeekHigh, quote.currency) },
        { label: 'Volume', value: formatNumber(quote.volume, 'compact') },
        { label: 'Market Cap', value: formatNumber(quote.marketCap, 'compact') },
        { label: 'P/E Ratio (TTM)', value: formatNumber(quote.peRatio) },
        { label: 'Dividend Yield', value: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-4 transition-colors duration-300">
            <span className="inline-block bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                Key Statistics
            </span>

            <div className="space-y-3 text-sm">
                {stats.map(stat => (
                    <div key={stat.label} className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-right">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataSummary;