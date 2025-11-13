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
        options.currency = currency;
        if (numAbs > 1000) options.minimumFractionDigits = 0;
    }

    if (style === 'compact') {
        if (numAbs >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (numAbs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (numAbs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (numAbs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }

    return new Intl.NumberFormat('en-US', options).format(num);
};

const DataSummary = ({ quote }) => {

    // Create Key-Value pair list
    const stats = [
        { label: 'Previous Close', value: formatNumber(quote.previousClose, 'currency', quote.currency) },
        { label: 'Open', value: formatNumber(quote.openPrice, 'currency', quote.currency) },
        { label: 'Day\'s Range', value: `${formatNumber(quote.dayLow, 'currency', quote.currency)} - ${formatNumber(quote.dayHigh, 'currency', quote.currency)}` },
        { label: '52 Week Range', value: `${formatNumber(quote.fiftyTwoWeekLow, 'currency', quote.currency)} - ${formatNumber(quote.fiftyTwoWeekHigh, 'currency', quote.currency)}` },
        { label: 'Volume', value: formatNumber(quote.volume, 'compact') },
        { label: 'Market Cap', value: formatNumber(quote.marketCap, 'compact') },
        { label: 'P/E Ratio (TTM)', value: formatNumber(quote.peRatio) },
        { label: 'Dividend Yield', value: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A' },
    ];

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                Key Statistics
            </span>

            <div className="space-y-3 text-sm">
                {stats.map(stat => (
                    <div key={stat.label} className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="font-medium text-gray-900 text-right">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataSummary;