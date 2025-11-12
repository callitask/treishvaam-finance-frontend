import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWidgetData } from '../apiConfig';
import MarketChart from '../components/market/MarketChart'; // --- FIX: Corrected import path ---
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';

// --- Copied from IndexCharts for consistent formatting ---
const timeframes = [
    { label: '1M', points: 22 },
    { label: '6M', points: 126 },
    { label: 'YTD', points: 'YTD' },
    { label: '1Y', points: 252 },
    { label: '5Y', points: 1260 },
    { label: 'Max', points: 99999 },
];

const formatNumber = (num, isCurrency = true) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';

    // For non-currency large numbers like Market Cap
    if (!isCurrency) {
        if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    }

    // Standard currency/price formatting
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
// --- End of copied code ---


const MarketDetailPage = () => {
    const { ticker } = useParams();
    const [widgetData, setWidgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getWidgetData(decodeURIComponent(ticker));
                setWidgetData(response.data);
            } catch (e) {
                console.error("Failed to fetch market detail data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ticker]);

    // --- Copied from IndexCharts for consistent chart data ---
    const getChartData = () => {
        if (!widgetData || !widgetData.historicalData) return { labels: [], prices: [] };

        const history = widgetData.historicalData;
        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return { labels: [], prices: [] };

        let filteredHistory = history;
        if (tf.points === 'YTD') {
            const currentYear = new Date().getFullYear();
            filteredHistory = history.filter(item => new Date(item.priceDate).getFullYear() === currentYear);
        } else if (tf.label !== 'Max') {
            const pointsToTake = Math.min(history.length, tf.points);
            filteredHistory = history.slice(-pointsToTake);
        }

        return {
            labels: filteredHistory.map(item => new Date(item.priceDate).toLocaleDateString()),
            prices: filteredHistory.map(item => item.closePrice)
        };
    };
    // --- End of copied code ---

    const chartData = getChartData();
    const quote = widgetData?.quoteData;
    const isPos = quote?.changeAmount >= 0;

    if (loading) {
        return <div className="h-[60vh] flex items-center justify-center text-gray-500">Loading market data...</div>;
    }

    if (!quote) {
        return (
            <div className="container mx-auto p-4 max-w-4xl text-center">
                <Link to="/" className="text-blue-600 hover:underline mb-4 inline-flex items-center">
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-gray-600">Could not load data for {decodeURIComponent(ticker)}.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-5xl font-sans">
            {/* --- Header --- */}
            <div className="mb-6">
                <Link to="/" className="text-sm text-blue-600 hover:underline mb-2 inline-flex items-center">
                    <ArrowLeft size={14} className="mr-1" /> Back
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{quote.name || decodeURIComponent(ticker)}</h1>
                <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-bold text-gray-900">{formatNumber(quote.currentPrice)}</span>
                    <span className="text-lg font-medium text-gray-500">{quote.currency}</span>
                </div>
                <div className={`flex items-center text-xl font-bold mt-1 ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                    {isPos ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                    <span>{formatNumber(quote.changeAmount)}</span>
                    <span className="ml-2">({quote.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%)</span>
                </div>
            </div>

            {/* --- Chart & Timeframes --- */}
            <div className="mb-6">
                <div className="h-[300px] md:h-[400px] -mx-1">
                    <MarketChart chartData={chartData} previousClose={quote.previousClose} isPositive={isPos} />
                </div>
                <div className="flex justify-center bg-gray-100 rounded-md p-1 mt-4 max-w-md mx-auto">
                    {timeframes.map(tf => (
                        <button
                            key={tf.label}
                            onClick={() => setActiveTimeframe(tf.label)}
                            className={`flex-1 px-3 py-1 rounded text-xs font-bold transition-colors ${activeTimeframe === tf.label ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Key Statistics Grid --- */}
            <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">

                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Open</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.openPrice)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Day High</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.dayHigh)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Day Low</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.dayLow)}</span>
                    </div>

                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Previous Close</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.previousClose)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">52 Week High</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.fiftyTwoWeekHigh)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">52 Week Low</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.fiftyTwoWeekLow)}</span>
                    </div>

                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Market Cap</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.marketCap, false)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">P/E Ratio (TTM)</span>
                        <span className="font-medium text-gray-900">{formatNumber(quote.peRatio)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span className="text-gray-600">Dividend Yield</span>
                        <span className="font-medium text-gray-900">{quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : 'N/A'}%</span>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default MarketDetailPage;