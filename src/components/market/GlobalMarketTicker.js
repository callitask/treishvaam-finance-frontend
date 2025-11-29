import React, { useState, useEffect } from 'react';
import { getQuotesBatch } from '../../apiConfig';
import { Link } from 'react-router-dom';
import './GlobalMarketTicker.css';

// Helper to format change percentage
const formatChange = (change) => {
    if (change == null || isNaN(change)) return '0.00%';
    return `${change.toFixed(2)}%`;
};

// Helper to determine color
const getChangeColor = (change) => {
    if (change == null || isNaN(change)) return 'text-gray-500';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
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
    const change = quote.changePercent || 0;
    const color = getChangeColor(change);

    return (
        <Link to={`/market/${encodeURIComponent(quote.ticker)}`} className="global-ticker-card">
            <span className="font-bold text-gray-900 text-xs truncate max-w-[100px] block">{quote.name}</span>
            <div className={`flex items-baseline gap-1.5 ${color} text-xs`}>
                <span className="font-semibold tabular-nums tracking-tight">
                    {quote.currentPrice ? quote.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '...'}
                </span>
                <span className="font-bold text-[10px]">
                    {change >= 0 ? '+' : ''}{formatChange(change)}
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
        const fetchQuotes = async () => {
            setLoading(true);
            setQuotes([]);
            try {
                const tickers = marketTabs[activeTab];
                if (!tickers || tickers.length === 0) {
                    setLoading(false);
                    return;
                }
                const response = await getQuotesBatch(tickers);
                const orderedQuotes = tickers.map(ticker =>
                    response.data.find(q => q.ticker === ticker)
                ).filter(Boolean);

                setQuotes(orderedQuotes);
            } catch (error) {
                console.error(`Failed to fetch quotes for ${activeTab}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [activeTab]);

    // Conditional Styling for Mobile vs Desktop
    const containerClasses = mobileMode
        ? "w-full bg-white border-b border-gray-200"
        : "bg-white border-b border-gray-200 sticky top-0 z-40";

    const innerClasses = mobileMode
        ? "w-full"
        : "container mx-auto px-4 max-w-6xl";

    const tabButtonClasses = mobileMode
        ? "px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap"
        : "px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap";

    return (
        <div className={containerClasses}>
            <div className={innerClasses}>

                {/* 1. Category Tabs */}
                <div className="flex items-center border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {Object.keys(marketTabs).map(tabName => (
                        <button
                            key={tabName}
                            onClick={() => setActiveTab(tabName)}
                            className={`${tabButtonClasses}
                                ${activeTab === tabName
                                    ? 'border-b-2 border-sky-600 text-sky-700'
                                    : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                                }
                            `}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                {/* 2. Ticker Data Row */}
                <div className="global-ticker-row-container py-1">
                    <div className="global-ticker-row">
                        {loading && (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="global-ticker-card skeleton px-4 py-2 border-r border-gray-100 min-w-[120px]">
                                    <div className="skeleton-line w-16 h-3 mb-1 bg-gray-200 rounded"></div>
                                    <div className="skeleton-line w-12 h-3 bg-gray-200 rounded"></div>
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