import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Share2 } from 'lucide-react';

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
    const color = isPos ? 'text-green-600' : 'text-red-600';

    return (
        <div className="pb-4 border-b border-gray-200">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:text-blue-600">HOME</Link>
                <span className="mx-2">&gt;</span>
                <span className="text-gray-700">{quote.ticker}</span>
            </div>

            <div className="flex justify-between items-start">
                {/* Asset Title */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{quote.name}</h1>
                    <div className="text-sm text-gray-500 mt-1">
                        <span>{quote.ticker}</span>
                        <span className="mx-2">&middot;</span>
                        <span>{quote.currency}</span>
                        <span className="mx-2">&middot;</span>
                        <span>{quote.primaryExchange || 'Global Market'}</span>
                        <span className="mx-2">&middot;</span>
                        <span className="text-gray-400">Disclaimer</span>
                    </div>
                </div>
                {/* Share Button */}
                <button
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                    aria-label="Share"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* Primary Data Block */}
            <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(quote.currentPrice, quote.currency)}
                </span>

                <div className={`flex items-center text-2xl font-medium mt-1 ${color}`}>
                    {isPos ? <TrendingUp size={24} className="mr-1" /> : <TrendingDown size={24} className="mr-1" />}
                    <span>{formatChange(quote.changeAmount)}</span>
                    <span className="ml-3">
                        ({formatChange(quote.changePercent)}%)
                    </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    {quote.lastUpdated ? `As of ${new Date(quote.lastUpdated).toLocaleString()}` : 'Data as of last update'}
                </div>
            </div>
        </div>
    );
};

export default MarketHero;