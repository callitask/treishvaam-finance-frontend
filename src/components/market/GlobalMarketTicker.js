import React, { useState, useEffect } from 'react';
import { getQuotesBatch } from '../../apiConfig';
import { Link } from 'react-router-dom';
import './GlobalMarketTicker.css'; // We'll create this CSS file next

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

// Define the market categories and their tickers
const marketTabs = {
    'Markets': ['^GSPC', '^IXIC', '^NSEI', 'GC=F', 'CL=F'],
    'US': ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
    'Europe': ['^GDAXI', '^FTSE'],
    'India': ['^NSEI', '^BSESN'],
    'Commodities': ['GC=F', 'SI=F', 'CL=F'],
    // 'Crypto': ['BTC-USD', 'ETH-USD', 'SOL-USD'], // Example for later
    // 'Futures': ['ES=F', 'NQ=F', 'YM=F'], // Example for later
};

const TickerCard = ({ quote }) => {
    if (!quote) return null;
    const change = quote.changePercent || 0;
    const color = getChangeColor(change);

    return (
        <Link to={`/market/${encodeURIComponent(quote.ticker)}`} className="global-ticker-card">
            <span className="font-semibold text-gray-800">{quote.name}</span>
            <div className={`flex items-baseline gap-2 ${color}`}>
                <span className="font-medium">
                    {quote.currentPrice ? quote.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '...'}
                </span>
                <span className="text-xs font-medium">
                    {change >= 0 ? '+' : ''}{formatChange(change)}
                </span>
            </div>
        </Link>
    );
};

const GlobalMarketTicker = () => {
    const [activeTab, setActiveTab] = useState('Markets');
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            setLoading(true);
            setQuotes([]); // Clear old quotes
            try {
                const tickers = marketTabs[activeTab];
                if (!tickers || tickers.length === 0) {
                    setLoading(false);
                    return;
                }
                const response = await getQuotesBatch(tickers);

                // Preserve order from marketTabs
                const orderedQuotes = tickers.map(ticker =>
                    response.data.find(q => q.ticker === ticker)
                ).filter(Boolean); // Filter out any nulls if API failed for one

                setQuotes(orderedQuotes);
            } catch (error) {
                console.error(`Failed to fetch quotes for ${activeTab}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [activeTab]);

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Tab Navigation */}
                <div className="flex items-center border-b border-gray-200">
                    {Object.keys(marketTabs).map(tabName => (
                        <button
                            key={tabName}
                            onClick={() => setActiveTab(tabName)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors
                                ${activeTab === tabName
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }
                            `}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                {/* Data Ticker Row */}
                <div className="global-ticker-row-container">
                    <div className="global-ticker-row">
                        {loading && (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="global-ticker-card skeleton">
                                    <div className="skeleton-line w-24 h-4"></div>
                                    <div className="skeleton-line w-20 h-3 mt-1"></div>
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