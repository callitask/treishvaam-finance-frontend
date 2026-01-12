import React, { useState, useEffect } from 'react';
import { Search, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getQuotesBatch } from '../../apiConfig';

/**
 * [AI-OPTIMIZED CONTEXT]
 * Component: DynamicMarketSummary
 * Purpose: Displays horizontal scrollable market ticker cards.
 * Changes:
 * 1. Updated 'text-gray-400' to 'text-gray-500' or 'text-gray-600' for better contrast ratio (Accessibility).
 * 2. Added 'aria-label' to search input.
 * Future Handling: Ensure all new text elements use at least contrast ratio 4.5:1 against white background.
 */

// Configuration mapping Tabs to Yahoo Finance Tickers
const MARKET_TABS = {
    'US': ['^DJI', '^GSPC', '^IXIC', '^RUT', '^VIX'],
    'Europe': ['^GDAXI', '^FTSE', '^FCHI', '^IBEX', '^STOXX50E'],
    'India': ['^NSEI', '^BSESN', '^NSEBANK', '^CNXIT', '^BSESCP'],
    'Currencies': ['USDINR=X', 'EURINR=X', 'JPYINR=X', 'GBPINR=X', 'AUDINR=X'],
    'Crypto': ['BTC-INR', 'ETH-INR', 'SOL-INR', 'XRP-INR', 'DOGE-INR']
};

// Display names for tickers that might look cryptic
const TICKER_NAMES = {
    '^DJI': 'Dow Jones', '^GSPC': 'S&P 500', '^IXIC': 'Nasdaq', '^RUT': 'Russell 2000', '^VIX': 'VIX',
    '^GDAXI': 'DAX', '^FTSE': 'FTSE 100', '^FCHI': 'CAC 40', '^IBEX': 'IBEX 35', '^STOXX50E': 'STOXX 50',
    '^NSEI': 'NIFTY 50', '^BSESN': 'SENSEX', '^NSEBANK': 'Nifty Bank', '^CNXIT': 'Nifty IT', '^BSESCP': 'BSE SmallCap',
    'USDINR=X': 'USD/INR', 'EURINR=X': 'EUR/INR', 'JPYINR=X': 'JPY/INR', 'GBPINR=X': 'GBP/INR', 'AUDINR=X': 'AUD/INR',
    'BTC-INR': 'Bitcoin', 'ETH-INR': 'Ethereum', 'SOL-INR': 'Solana', 'XRP-INR': 'XRP', 'DOGE-INR': 'Dogecoin'
};

const DynamicMarketSummary = () => {
    const [activeTab, setActiveTab] = useState('India');
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const tickers = MARKET_TABS[activeTab];
                const response = await getQuotesBatch(tickers);

                if (isMounted && response.data) {
                    const orderedData = tickers.map(ticker => {
                        const found = response.data.find(item => item.ticker === ticker);
                        return found || { ticker, name: TICKER_NAMES[ticker] || ticker, currentPrice: null };
                    });
                    setMarketData(orderedData);
                }
            } catch (error) {
                console.error("Failed to fetch market summary:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [activeTab]);

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '-';
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatChange = (change) => {
        if (change === null || change === undefined) return '-';
        return (change > 0 ? '+' : '') + change.toFixed(2);
    };

    const formatPercent = (percent) => {
        if (percent === null || percent === undefined) return '-';
        return (percent > 0 ? '+' : '') + percent.toFixed(2) + '%';
    };

    return (
        <div className="w-full bg-white mb-8 font-sans">
            {/* 1. Global Search Bar */}
            <div className="mb-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {/* ACCESSIBILITY FIX: Darkened icon color */}
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    {/* ACCESSIBILITY FIX: Added aria-label */}
                    <input
                        type="text"
                        aria-label="Search for stocks, ETFs and more"
                        className="block w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 shadow-sm"
                        placeholder="Search for stocks, ETFs and more"
                    />
                </div>
            </div>

            {/* 2. Market Category Tabs */}
            <div className="flex items-center space-x-6 mb-5 overflow-x-auto no-scrollbar pb-2">
                {/* ACCESSIBILITY FIX: Darkened text color from gray-400 to gray-500 */}
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0 select-none">
                    MARKETS
                </span>
                <div className="flex space-x-2">
                    {Object.keys(MARKET_TABS).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Market Data Cards Container */}
            <div className="relative min-h-[100px]">
                {loading ? (
                    <div className="flex space-x-4 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex-none w-48 h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : (
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
                        {marketData.map((item) => {
                            const change = item.changeAmount || 0;
                            const isUp = change > 0;
                            const isDown = change < 0;
                            const isFlat = change === 0;

                            let trendColor = 'text-gray-600';
                            if (isUp) trendColor = 'text-green-600';
                            if (isDown) trendColor = 'text-red-600';

                            return (
                                <Link
                                    to={`/market/${encodeURIComponent(item.ticker)}`}
                                    key={item.ticker}
                                    className="flex-none w-48 md:w-56 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer snap-center group block"
                                >
                                    {/* Top Row: Icon, Name, % Change */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`p-1.5 rounded-full flex-shrink-0 ${isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                {isUp && <ArrowUp size={14} className="text-green-600" />}
                                                {isDown && <ArrowDown size={14} className="text-red-600" />}
                                                {isFlat && <ArrowRight size={14} className="text-gray-500" />}
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                                {TICKER_NAMES[item.ticker] || item.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-bold ${trendColor} bg-opacity-10 px-1.5 py-0.5 rounded ml-2`}>
                                            {formatPercent(item.changePercent)}
                                        </span>
                                    </div>

                                    {/* Bottom Row: Price, Abs Change */}
                                    <div className="flex justify-between items-end mt-auto">
                                        <span className="text-base font-bold text-gray-900 tracking-tight">
                                            {formatPrice(item.currentPrice)}
                                        </span>
                                        <span className={`text-xs font-medium ${trendColor}`}>
                                            {formatChange(item.changeAmount)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DynamicMarketSummary;