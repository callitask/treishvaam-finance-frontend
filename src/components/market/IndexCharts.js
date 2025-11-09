import React, { useState, useEffect } from 'react';
import MarketChart from './MarketChart';
import { getWidgetData } from '../../apiConfig'; // FIXED: Correct import
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

const indices = [
    { symbol: 'SPY', name: 'S&P 500' }, // FIXED: Use ETF symbols directly now
    { symbol: 'DIA', name: 'Dow Jones' },
    { symbol: 'QQQ', name: 'NASDAQ' },
];

const timeframes = [
    { label: '1M', days: 30 },
    { label: '6M', days: 180 },
    { label: 'YTD', days: 'YTD' },
    { label: '1Y', days: 365 },
    { label: '5Y', days: 1825 },
];

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const IndexCharts = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');
    const [loading, setLoading] = useState(true);
    // Unified state for the new DTO structure
    const [widgetData, setWidgetData] = useState(null);

    const activeIndexData = indices[activeIndex];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // FIXED: Use the new single endpoint
                const response = await getWidgetData(activeIndexData.symbol);
                if (response.data) {
                    setWidgetData(response.data);
                }
            } catch (e) {
                console.error("Market widget error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeIndex, activeIndexData.symbol]);

    const getChartData = () => {
        if (!widgetData || !widgetData.historicalData) return { labels: [], prices: [] };

        const history = widgetData.historicalData;
        const tf = timeframes.find(t => t.label === activeTimeframe);

        // Filter based on timeframe using the new data structure
        let filteredHistory = history;
        if (tf.days === 'YTD') {
            const currentYear = new Date().getFullYear();
            filteredHistory = history.filter(item => new Date(item.priceDate).getFullYear() === currentYear);
        } else {
            // Approximate days. For more accuracy, could use actual date comparison similar to MarketChart.js
            const daysToTake = Math.min(history.length, Math.floor(tf.days * (252 / 365)));
            filteredHistory = history.slice(-daysToTake);
        }

        return {
            // Map new DTO fields: priceDate and closePrice
            labels: filteredHistory.map(item => new Date(item.priceDate).toLocaleDateString()),
            prices: filteredHistory.map(item => item.closePrice)
        };
    };

    const chartData = getChartData();
    const quote = widgetData?.quoteData;
    const isPos = quote?.changeAmount >= 0;

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden font-sans">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 bg-gray-50/80 p-1">
                {indices.map((idx, i) => (
                    <button
                        key={idx.symbol}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeIndex === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {idx.name}
                    </button>
                ))}
            </div>

            <div className="p-4">
                {loading || !quote ? (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm animate-pulse">
                        Loading market data...
                    </div>
                ) : (
                    <>
                        {/* Header Price */}
                        <div className="flex items-baseline justify-between mb-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    {formatNumber(quote.currentPrice)}
                                </span>
                                <span className="text-xs font-semibold text-gray-500">USD</span>
                            </div>
                            <div className="flex items-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                <Clock size={10} className="mr-1" /> Real-time
                            </div>
                        </div>

                        {/* Change Indicator */}
                        <div className={`flex items-center text-sm font-bold mb-4 ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                            {isPos ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                            {isPos ? '+' : ''}{quote.changeAmount} ({isPos ? '+' : ''}{quote.changePercent}%)
                        </div>

                        {/* Chart */}
                        <div className="h-[180px] -mx-1">
                            <MarketChart chartData={chartData} previousClose={quote.previousClose} isPositive={isPos} />
                        </div>

                        {/* Timeframe Toggles */}
                        <div className="flex justify-between border-t border-b border-gray-100 py-2 my-4">
                            {timeframes.map(tf => (
                                <button
                                    key={tf.label}
                                    onClick={() => setActiveTimeframe(tf.label)}
                                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${activeTimeframe === tf.label
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>

                        {/* Key Stats Grid - Narrow Optimized */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500">Open</span>
                                <span className="font-medium text-gray-900">{formatNumber(quote.openPrice)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500">High</span>
                                <span className="font-medium text-gray-900">{formatNumber(quote.dayHigh)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500">Prev Close</span>
                                <span className="font-medium text-gray-900">{formatNumber(quote.previousClose)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500">Low</span>
                                <span className="font-medium text-gray-900">{formatNumber(quote.dayLow)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default IndexCharts;